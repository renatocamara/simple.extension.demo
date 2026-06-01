---
name: emojify
description: Transform markdown bullet or numbered lists into emoji-prefixed lists with relevant emoji choices per item while preserving list text and nesting. Use this skill whenever a user asks to "emojify" a list, add emojis to bullets, replace bullet markers with icons/emojis, spruce up markdown list formatting, or copy an emoji list result.
---

# Emojify Markdown Lists

Turn markdown list markers into relevant emojis while preserving the user's original content and structure.

## What to do

1. Detect list items using standard markdown markers (`-`, `*`, `+`, `1.`, `2.`, etc.).
2. Replace only the list marker with one emoji per item.
3. Preserve:
   - list text exactly
   - indentation and nesting
   - non-list lines (headings, paragraphs, blank lines)
4. Use contextually relevant emojis and avoid repeating the same one for adjacent items when possible.

## Preferred execution path

If the `emojify_markdown_list` extension tool is available, call it and pass:

- `markdown`: the user's list text
- `copyToClipboard`: `true` when the user asks to copy (or implies sharing/pasting)

Use the tool output directly. Do not invent or alter usage metrics.

## Fallback path (no extension tool)

Perform the transformation yourself and return only transformed markdown.
If the user asks for token/credit usage in fallback mode, clearly say usage metrics are unavailable without the extension-backed run.
