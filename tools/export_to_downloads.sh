#!/usr/bin/env bash
# Copy one episode's assets + final video into your Mac Downloads.
# Usage: pnpm export -- dyson-5126
#    or: bash tools/export_to_downloads.sh dyson-5126
set -euo pipefail

SLUG="${1:-}"
if [[ -z "$SLUG" ]]; then
  echo "Usage: bash tools/export_to_downloads.sh <episode-slug>" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/episodes/$SLUG"
if [[ ! -d "$SRC" ]]; then
  echo "Episode not found: $SRC" >&2
  exit 1
fi

# Prefer real macOS/Linux Downloads; fall back to $HOME/Downloads
DEST_ROOT="${BIWF_EXPORTS:-$HOME/Downloads/Before-It-Was-Famous}"
DEST="$DEST_ROOT/$SLUG"
mkdir -p "$DEST/stills" "$DEST/audio" "$DEST/render"

# Final video (gitignored in repo — must exist after local render)
if [[ -f "$SRC/render/final.mp4" ]]; then
  cp -f "$SRC/render/final.mp4" "$DEST/${SLUG}-final.mp4"
  cp -f "$SRC/render/final.mp4" "$DEST/render/final.mp4"
fi
[[ -f "$SRC/render/assemble.mp4" ]] && cp -f "$SRC/render/assemble.mp4" "$DEST/render/assemble.mp4"
[[ -f "$SRC/render/karaoke.ass" ]] && cp -f "$SRC/render/karaoke.ass" "$DEST/render/karaoke.ass"

# Stills + audio + key JSON
shopt -s nullglob
for f in "$SRC/stills"/*.{jpg,jpeg,png,webp}; do cp -f "$f" "$DEST/stills/"; done
for f in "$SRC/audio"/*.{wav,mp3,json}; do cp -f "$f" "$DEST/audio/"; done
for f in script.json storyboard.json qa.json licenses.json meta.json remotion.json; do
  [[ -f "$SRC/$f" ]] && cp -f "$SRC/$f" "$DEST/"
done
shopt -u nullglob

cat > "$DEST_ROOT/README.txt" << EOF
Before It Was Famous — local exports
====================================
Folder: $DEST_ROOT

Each episode:
  <slug>/<slug>-final.mp4   karaoke Short
  <slug>/stills/            1080x1920 plates
  <slug>/audio/             VO + timestamps
  <slug>/render/            assemble + ass

Factory repo: $ROOT
Export again:  pnpm export -- <slug>
EOF

echo "Exported → $DEST"
if [[ -f "$DEST/${SLUG}-final.mp4" ]]; then
  ls -lh "$DEST/${SLUG}-final.mp4"
else
  echo "NOTE: no render/final.mp4 yet. Run: pnpm factory render --episode $SLUG" >&2
fi

# Open Finder on macOS when available
if command -v open >/dev/null 2>&1; then
  open "$DEST"
fi
