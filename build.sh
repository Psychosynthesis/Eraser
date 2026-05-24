#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
KEEP_SHARED=false
if [ "$1" = "--keep-shared" ]; then
	KEEP_SHARED=true
fi

CHROME_COMMON_DIR="$ROOT_DIR/src/chrome/common"
FIREFOX_COMMON_DIR="$ROOT_DIR/src/firefox/common"
SHARED_FILES=(constants.js settings.js settingsUtils.js)

cleanup_shared_files() {
	for file in "${SHARED_FILES[@]}"; do
		rm -f "$CHROME_COMMON_DIR/$file" "$FIREFOX_COMMON_DIR/$file"
	done
}

copy_shared_files() {
	for file in "${SHARED_FILES[@]}"; do
		cp "$ROOT_DIR/src/shared/$file" "$CHROME_COMMON_DIR/$file"
		cp "$ROOT_DIR/src/shared/$file" "$FIREFOX_COMMON_DIR/$file"
	done
}

cleanup_shared_files
if [ "$KEEP_SHARED" = false ]; then
	trap cleanup_shared_files EXIT
fi

mkdir -p "$ROOT_DIR/build"
copy_shared_files

rm -f "$ROOT_DIR/build/eraser_firefox.xpi" "$ROOT_DIR/build/eraser_chrome.zip"

(cd "$ROOT_DIR/src/firefox" && zip -r "$ROOT_DIR/build/eraser_firefox.xpi" *)
(cd "$ROOT_DIR/src/chrome" && zip -r "$ROOT_DIR/build/eraser_chrome.zip" *)
