# badgeIn prototype

```
npm install
npm run dev          # http://localhost:5173
```

## Phone vs laptop view

- **Under 640px wide (real phones):** no phone mockup. The screen fills the display and everything scales with the
  screen width (`html.phone-ui` in `src/index.css` sets the root font size, and the phone screens are sized in `rem`).
- **640px and wider:** the phone mockup (bezel, fixed size) is shown, zoomed to suit the window.
- When adding to a phone screen, size things in `rem` or Tailwind's built-in sizes (not `px`) so they scale with the phone.
  The header and the employer dashboard are the exceptions, and they are sized in `px` on purpose.

## Resume auto-fill (keyword matching)

Uploading a PDF on the Profile screen fills in name, program, LinkedIn, skills and certifications.
The PDF is read in the browser and never leaves the device.

- **Skills and certifications come from the dropdown lists** in `src/lib/options.ts`. Add an entry there and the
  resume search picks it up automatically: the entry's own text is a keyword, and anything in parentheses or split by
  `/` is too (`Cloud (AWS/Azure)` searches for cloud, aws, azure; `Machine Learning (ML/AI)` searches for ml, ai).
- For better accuracy on a specific entry, add hand-written patterns for it in `src/lib/resumeParser.ts`
  (`SKILL_PATTERNS` / `CERT_PATTERNS`). Example: `Java` must not match inside `JavaScript`.
- Certifications on a line that says "studying", "preparing", "pursuing" etc. are ignored (not held yet).
- Keyword matching is best-effort. Users are told to check the result, and the program field is the weakest part.

## AI parsing (switched off)

An AI version exists but is commented out in `src/lib/resumeParser.ts`. It needs a paid Anthropic API key:

1. Uncomment the marked lines in `resumeParser.ts` (the two constants, the "AI parsing" block, and the lines in `parseResume`).
2. `cp .env.example .env`, add `ANTHROPIC_API_KEY`, then run `npm run api` in a second terminal.

The server (`server/parse-resume.mjs`) has no login or rate limiting. Add both before exposing it publicly, and tell
users their resume text is sent to Anthropic.

## QR badges

The badge QR encodes a link containing the profile (see `src/lib/badgeLink.ts`). Camera scanning needs `https` or `localhost`.
The address in the QR is `VITE_PUBLIC_URL` if set, otherwise wherever the app is running (see `.env.example`).

## Putting it online (Vercel)

Once the app is on a public https address, anyone can open a badge link from any phone on any network.
`vercel.json` is already set up so links like `/p` work when opened directly.
