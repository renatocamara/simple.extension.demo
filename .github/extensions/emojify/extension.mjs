import { execFile } from "node:child_process";
import { CopilotClient } from "@github/copilot-sdk";
import { joinSession } from "@github/copilot-sdk/extension";

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

function cleanMarkdownResponse(text) {
    return String(text ?? "")
        .trim()
        .replace(/^```(?:markdown|md)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();
}

function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        const command = process.platform === "win32" ? "clip" : "pbcopy";
        const proc = execFile(command, [], (err) => {
            if (err) reject(err);
            else resolve();
        });
        proc.stdin.write(text);
        proc.stdin.end();
    });
}

await joinSession({
    hooks: {
        onUserPromptSubmitted: async (input) => {
            if (!/\b(emojify|emoji|bullet list|markdown list)\b/i.test(input.prompt)) return;
            return {
                additionalContext:
                    "If the user asks to transform markdown bullets into emoji-prefixed list items, call the emojify_markdown_list tool.",
            };
        },
    },
    tools: [
        {
            name: "emojify_markdown_list",
            description:
                "Transforms markdown bullet or numbered lists into emoji-prefixed lists, optionally copies to clipboard, and returns usage metrics (AI credits + tokens).",
            parameters: {
                type: "object",
                properties: {
                    markdown: {
                        type: "string",
                        description: "Markdown content containing list items to emojify.",
                    },
                    copyToClipboard: {
                        type: "boolean",
                        description: "When true, copy transformed markdown to system clipboard.",
                        default: true,
                    },
                    model: {
                        type: "string",
                        description: "Optional model override (default: gpt-4.1).",
                    },
                },
                required: ["markdown"],
            },
            handler: async (args) => {
                const markdown = String(args?.markdown ?? "").trim();
                if (!markdown) {
                    return {
                        resultType: "failure",
                        textResultForLlm: "No markdown input was provided.",
                    };
                }

                const usageSummary = {
                    inputTokens: 0,
                    outputTokens: 0,
                    totalNanoAiu: 0,
                    hasUsage: false,
                };

                const client = new CopilotClient();
                try {
                    const session = await client.createSession({
                        model: String(args?.model || "gpt-4.1"),
                        systemMessage: { content: SYSTEM_PROMPT },
                    });

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
                        prompt: `Replace the bullet markers in this list with relevant emojis:\n\n${markdown}`,
                    });

                    const transformed = cleanMarkdownResponse(response?.data?.content);
                    if (!transformed) {
                        return {
                            resultType: "failure",
                            textResultForLlm: "Copilot returned an empty emojified result.",
                        };
                    }

                    const shouldCopy = args?.copyToClipboard !== false;
                    if (shouldCopy) {
                        await copyToClipboard(transformed);
                    }

                    const aiCreditsUsed = usageSummary.totalNanoAiu / 1_000_000_000;
                    const payload = {
                        markdown: transformed,
                        copiedToClipboard: shouldCopy,
                        usage: usageSummary.hasUsage
                            ? {
                                  aiCreditsUsed,
                                  inputTokens: usageSummary.inputTokens,
                                  outputTokens: usageSummary.outputTokens,
                              }
                            : {
                                  unavailable: true,
                              },
                    };

                    return {
                        resultType: "success",
                        textResultForLlm: JSON.stringify(payload, null, 2),
                    };
                } finally {
                    await client.stop();
                }
            },
        },
    ],
});
