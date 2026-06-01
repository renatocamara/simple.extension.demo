# emojify ✨

AI-powered CLI that turns plain markdown bullet lists into emoji-prefixed lists, powered by the [GitHub Copilot SDK](https://github.com/github/copilot-sdk). Output is printed and copied to your clipboard.
It also prints a quick usage summary with AI credits, input tokens, and output tokens.

## Prerequisites

- Node.js 18+
- GitHub Copilot CLI installed & authenticated (`copilot --version`)

## Install

```powershell
npm install
```

## Usage

Interactive (paste then press Enter on an empty line, or Ctrl+Z + Enter on Windows):
```powershell
node index.js
```

Pipe input:
```powershell
Get-Content my-list.md | node index.js
```

## Example

Input:
```
- Buy groceries for the week
- Train for the marathon
- Read a book about space exploration
```

Output (also copied to clipboard):
```
🛒 Buy groceries for the week
🏃‍♂️ Train for the marathon
📚 Read a book about space exploration
```
