#!/usr/bin/env bash
# Run THIS on your Mac (Terminal), not in the cloud agent.
# Sets up ~/Projects/remotion on the factory branch and exports to Downloads.
set -euo pipefail

REPO_URL="https://github.com/Nishlesh/remotion.git"
BRANCH="cursor/before-it-was-famous-factory-b6c2"
PROJECTS="${HOME}/Projects"
REPO="${PROJECTS}/remotion"
EXPORTS="${HOME}/Downloads/Before-It-Was-Famous"

mkdir -p "$PROJECTS" "$EXPORTS"

if [[ -d "$REPO/.git" ]]; then
  cd "$REPO"
  git remote -v | head -2
  git fetch origin
else
  git clone "$REPO_URL" "$REPO"
  cd "$REPO"
fi

git fetch origin "$BRANCH"
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH" || true
else
  git checkout -b "$BRANCH" --track "origin/$BRANCH"
fi

if command -v pnpm >/dev/null 2>&1; then
  pnpm install
else
  echo "Install pnpm first:  npm install -g pnpm" >&2
  echo "Then:  cd $REPO && pnpm install" >&2
fi

chmod +x tools/export_to_downloads.sh

echo ""
echo "Repo ready: $REPO"
echo "Branch:     $(git branch --show-current)"
echo "Exports:    $EXPORTS"
echo ""
echo "Open in Cursor Desktop:"
echo "  cursor $REPO"
echo "  # or File → Open Folder → $REPO"
echo ""
echo "Render Dyson Short + copy to Downloads:"
echo "  cd $REPO"
echo "  pnpm factory render --episode dyson-5126"
echo "  pnpm export -- dyson-5126"
echo "  open $EXPORTS/dyson-5126"
