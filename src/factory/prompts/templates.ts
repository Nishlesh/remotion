export const DISCOVER_PROMPT = `You are researching candidates for the YouTube channel Before It Was Famous (@beforeitwasfamous).

Hard rules:
- Famous product/company leads. Unknown founders cannot lead.
- Would someone watch this if FocusStack did not exist? If no, reject.
- Never invent facts. Every candidate needs at least two reliable source URLs.
- Runtime must fit 25–50 seconds spoken (~80–100 words).
- FocusStack (https://usefocusstack.com) is a Level-2 natural close, never the story.

Return JSON: { candidates: [...], rejected: [{ famousEntity, reason }] }.
Do not fill candidates unless the user provided sourced material.`;

export const RESEARCH_PROMPT = `Build a research spine for a Before It Was Famous short.

Spine: FAMOUS ENTITY → unexpected beginning → human detail → constraint → choice → consequence → realization → viewer → FocusStack.

Rules:
- FACT_APPROVED is a later human gate. You still must not invent facts now.
- Every claim needs a source id from the provided source list.
- If you do not have a source, put the question in "unknown". Never guess.
- Identity: note named people who appear more than once (identity plate later).
- No unauthorized logos. No copyrighted still scraping.

Return JSON matching research.json: sources[], facts[], unknown[].`;

export const SCRIPT_PROMPT = `Write a Before It Was Famous spoken script from FACT_APPROVED research only.

Copy engine lock:
FAMOUS ENTITY → unexpected beginning → human detail → constraint → choice → consequence → realization → viewer → FocusStack.

Cadence: 3–12 word clauses. Fragments legal. ~80–100 spoken words.
Gold shape: Airbnb/Spanx micro-doc cadence (not Wikipedia).
Drop rule: spoken script keeps ONLY hook, one human detail, one constraint, one choice, one consequence, one meaning, one CTA.
CTA callbacks THIS story. No sale-price ending.
FocusStack is a Level-2 natural close, never an ad.
Script ≠ N Remotion stills.
Do not rewrite facts. Do not add unsourced color.

Also write 2–4 hooks. Famous product/company leads each hook.`;

export const STORYBOARD_PROMPT = `Turn NARRATION_LOCKED voiceover into 8–12 visual beats.

VO is the source of truth. Duration comes from audio timestamps.
One spoken line is not automatically one still.
Hero lives in y≈80–1100. Karaoke band y=1200–1440 stays photo — never paint a caption bar into stills.
Magnates photoreal cinematic stills: warm film, grain, shallow DoF.
Identity plate per named person if they appear more than once.
No unauthorized logos.
Prefer Wikimedia / Unsplash / Pexels / Pixabay. Generate only gaps.
Always cover-crop to 1080×1920 after fetch (image models ignore 9:16).`;

export const STILL_PROMPT_LOCK = `Photoreal cinematic still, 9:16 vertical, 1080x1920.
Warm film, fine grain, shallow depth of field, Magnates editorial.
Subject in the upper frame (y 80–1100). The lower third (y 1200–1440) is MORE of the same photograph — never a black bar, never a caption band, never burned-in text, never logos.
No trademarks. No celebrity likeness unless an identity plate was approved.
Do not add UI chrome.`;
