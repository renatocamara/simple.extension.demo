#!/usr/bin/env node
import { CopilotClient } from "@github/copilot-sdk";
import clipboard from "clipboardy";
import * as readline from "node:readline";

function readMultilineInput() {
  return new Promise((resolve) => {
    console.log("📝 Paste or type your bullet list below.");
    console.log("   When you're done, press Enter on an empty line (or Ctrl+D/Ctrl+Z) to emojify.\n");

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
    const lines = [];
    let lastWasBlank = false;

    rl.on("line", (line) => {
      if (line.trim() === "") {
        if (lastWasBlank || lines.length > 0) {
          rl.close();
          return;
        }
        lastWasBlank = true;
        return;
      }
      if (lastWasBlank) {
        lines.push("");
        lastWasBlank = false;
      }
      lines.push(line);
    });

    rl.on("close", () => resolve(lines.join("\n").trimEnd()));
  });
}

const SYSTEM_PROMPT = `You rewrite markdown bullet lists by replacing the leading bullet marker ("-", "*", "+", or "1.") on each list item with a single emoji that vividly represents that item's meaning.

Rules:
- Preserve the original indentation and nesting exactly.
- Pick a different, contextually relevant emoji per item; avoid repeats when possible.
- Keep the bullet text itself unchanged (do not rewrite, translate, or summarize it).
- Non-list lines (headings, blank lines, paragraphs) must be passed through untouched.
- Output ONLY the transformed markdown. No commentary, no code fences, no preamble.`;

function getNanoAiuFromTokenDetails(tokenDetails) {
  if (!Array.isArray(tokenDetails)) return 0;
  return tokenDetails.reduce((sum, detail) => {
    const tokenCount = Number(detail?.tokenCount ?? 0);
    const costPerBatch = Number(detail?.costPerBatch ?? 0);
    const batchSize = Number(detail?.batchSize ?? 0);
    if (!Number.isFinite(tokenCount) || !Number.isFinite(costPerBatch) || !Number.isFinite(batchSize) || batchSize <= 0) {
      return sum;
    }
    return sum + Math.round((tokenCount * costPerBatch) / batchSize);
  }, 0);
}

async function main() {
  const input = await readMultilineInput();
  if (!input) {
    console.error("⚠️  No input received. Nothing to emojify.");
    process.exit(1);
  }

  console.log("\n✨ Emojifying with GitHub Copilot...\n");

  const client = new CopilotClient();
  try {
    const session = await client.createSession({
      model: "gpt-4.1",
      systemMessage: { content: SYSTEM_PROMPT },
    });
    const usageSummary = {
      inputTokens: 0,
      outputTokens: 0,
      totalNanoAiu: 0,
      hasUsage: false,
    };

    session.on((event) => {
      if (event.type !== "assistant.usage") return;
      usageSummary.hasUsage = true;
      usageSummary.inputTokens += Number(event.data?.inputTokens ?? 0);
      usageSummary.outputTokens += Number(event.data?.outputTokens ?? 0);

      const totalNanoAiu = Number(event.data?.copilotUsage?.totalNanoAiu ?? 0);
      if (Number.isFinite(totalNanoAiu) && totalNanoAiu > 0) {
        usageSummary.totalNanoAiu += totalNanoAiu;
        return;
      }

      usageSummary.totalNanoAiu += getNanoAiuFromTokenDetails(event.data?.copilotUsage?.tokenDetails);
    });

    const response = await session.sendAndWait({
      prompt: `Replace the bullet markers in this list with relevant emojis:\n\n${input}`,
    });

    let output = response?.data?.content?.trim() ?? "";
    output = output.replace(/^```(?:markdown|md)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    if (!output) {
      console.error("❌ Copilot returned an empty response.");
      process.exit(1);
    }

    console.log(output);
    await clipboard.write(output);
    console.log("\n📋 Copied to clipboard!");
    console.log("\n📊 Usage summary");
    if (usageSummary.hasUsage) {
      const aiCreditsUsed = usageSummary.totalNanoAiu / 1_000_000_000;
      console.log(`   AI credits used: ${aiCreditsUsed.toFixed(6)}`);
      console.log(`   Input tokens: ${usageSummary.inputTokens.toLocaleString()}`);
      console.log(`   Output tokens: ${usageSummary.outputTokens.toLocaleString()}`);
    } else {
      console.log("   Usage metrics unavailable for this response.");
    }
  } finally {
    await client.stop();
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("❌ Error:", err?.message ?? err);
    process.exit(1);
  },
);
