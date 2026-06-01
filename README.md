# Simple Extension Demo

Start with one small idea. Prompt Copilot a couple of times. End up with a
working CLI, a reusable Skill, and an Extension tool in the same repository.

This demo uses a simple example: take a markdown list, replace bullet markers
with relevant emojis, copy the result to the clipboard, and report usage
metrics. The point is not the emoji formatter itself. The point is the workflow.

## 🎯 What's Inside

This repository shows how to move quickly from a rough prompt to multiple
delivery formats:

* A standalone CLI for direct terminal use
* A Copilot Skill for natural-language discovery in chat
* A Copilot Extension tool for more structured invocation

---

## 💡 Quick Prompt Sequence

This repository was built from a short sequence of prompts. You can use the same
pattern for your own idea.

### 🚀 Prompt 1: Create the first working version

> I want to create an AI-powered markdown emoji list generator in a CLI app
> format. If I paste in or write some bullet points, it should replace those
> bullet points with relevant emojis and copy the result to my clipboard. Use
> the GitHub Copilot SDK.

### ✨ Prompt 2: Add one useful refinement

> Add usage tracking so the app reports AI credits used, input tokens, and
> output tokens after the result.

### 🔁 Prompt 3: Reuse the same idea in more surfaces

> Turn this into a Copilot Skill and a Copilot Extension too. Keep everything in
> the same repo, but put each implementation in its own folder.

That is the core message of this demo: you do not need a long design phase to
get something useful. Start narrow, get one version working, then ask Copilot to
repackage the same behavior where it is most useful.

---

## Example

Running the command:

```text
/emojify
- Is there a ghost here?
- Ducks quack a lot
- I would like to have a word with the moon
- Mechanical keyboards are cool
- We just launched a sick new feature
- I'd like to squish some slime
```

Returns this output:

```text
👻 Is there a ghost here?
🦆 Ducks quack a lot
🌙 I would like to have a word with the moon
⌨️ Mechanical keyboards are cool
🚀 We just launched a sick new feature
🟢 I'd like to squish some slime
```

---

## 🧩 What Gets Built

### CLI

The CLI in `implementations/cli` is the fastest path from prompt to working
artifact. It is useful when you want a focused utility that runs directly in the
terminal.

### Skill

The skill in `.github/skills/emojify` is useful when you want Copilot
to recognize an intent from normal chat and apply the behavior with lightweight
instructions.

### Extension

The Copilot CLI extension in `.github/extensions/emojify` is useful when you want a named
tool with structured inputs and outputs, plus deterministic behavior around
clipboard handling and usage reporting.

## 🏗️ Why This Pattern Works

* Start with one narrow problem instead of a platform strategy
* Build the CLI first because it is the smallest testable surface
* Reuse the same prompt shape and rules across every implementation
* Split implementations by folder so each surface stays easy to inspect
* Stop after the CLI, or keep going until you also have a Skill and Extension

---

### The Pattern in Action

```text
┌────────────────────────────────────────────┐
│ Prompt 1: Build the first useful version   │
│ "Create a CLI for this focused task"       │
└────────────────────┬───────────────────────┘
                     │
                     ▼
           ┌───────────────────────┐
           │ CLI implementation    │
           │ Fastest working form  │
           └───────────┬───────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐        ┌────────────────────┐
│ Prompt 2: Add    │        │ Prompt 3: Repackage│
│ polish/metrics   │        │ as Skill/Extension │
└────────┬─────────┘        └─────────┬──────────┘
         │                            │
         └──────────────┬─────────────┘
                        ▼
          ┌──────────────────────────────┐
          │ Same idea, multiple surfaces │
          └──────────────────────────────┘
```

## 📂 Repository Structure

```text
.
├── .github/
│   ├── extensions/
│   │   └── emojify/
│   │       ├── extension.mjs
│   │       └── README.md
│   └── skills/
│       └── emojify/
│           ├── README.md
│           └── SKILL.md
├── implementations/
│   └── cli/
│       ├── index.js
│       ├── package.json
│       └── README.md
└── README.md
```

## 🚀 Quick Start

### 1. Run the CLI

```powershell
Set-Location implementations/cli
npm install
npm start
```

The CLI reads a markdown list, asks Copilot to replace list markers with
contextual emojis, prints the result, copies it to your clipboard, and shows a
usage summary.

### 2. Inspect the Skill

Open `.github/skills/emojify/SKILL.md` to see the natural-language
version of the same capability. The skill tells Copilot when to use the feature,
what to preserve, and when to fall back.

### 3. Inspect the Extension

Open `.github/extensions/emojify/extension.mjs` to see the tool-backed version.
This version exposes a structured tool, can copy output to the clipboard, and
returns usage metrics as part of the tool response.


## 📚 Learning Path

If you want to explore the repo in order, use this sequence:

1. Read `implementations/cli/index.js` to see the first working implementation.
2. Read `.github/skills/emojify/SKILL.md` to see how the same idea is
   framed as instructions.
3. Read `.github/extensions/emojify/extension.mjs` to see how the behavior is
   exposed as a tool.

## 🎯 Key Takeaways

* A few focused prompts can produce a real working artifact quickly.
* The first version does not need to be perfect. It needs to be usable.
* Once the behavior is clear, Copilot can help you repackage it as a CLI, a
  Skill, an Extension, or all three.
* The best demo repositories show the progression, not only the final result.
