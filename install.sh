#!/bin/sh
set -eu

source_dir=$(CDPATH= cd "$(dirname "$0")" && pwd)
extensions_dir="$HOME/.vscode/extensions"
target="$extensions_dir/evohl.kde-plasma-code-color-sync-0.1.0"

for existing in \
  "$extensions_dir"/local.kde-code-theme "$extensions_dir"/local.kde-code-theme-* \
  "$extensions_dir"/evohl.kde-code-theme "$extensions_dir"/evohl.kde-code-theme-* \
  "$extensions_dir"/Evohl.kde-code-theme "$extensions_dir"/Evohl.kde-code-theme-* \
  "$extensions_dir"/evohl.kde-plasma-code-color-sync "$extensions_dir"/evohl.kde-plasma-code-color-sync-* \
  "$extensions_dir"/Evohl.kde-plasma-code-color-sync "$extensions_dir"/Evohl.kde-plasma-code-color-sync-*; do
  if [ -e "$existing" ] || [ -L "$existing" ]; then
    printf '%s\n' "An installation already exists: $existing" >&2
    printf '%s\n' 'Run KDE Color Sync: Stop and Restore Colors, then uninstall the existing extension before installing.' >&2
    exit 1
  fi
done

mkdir -p "$extensions_dir"
mkdir "$target"
cp "$source_dir/package.json" "$source_dir/extension.js" "$source_dir/palette.js" "$source_dir/sync.js" "$source_dir/README.md" "$source_dir/LICENSE" "$target/"
printf '%s\n' "Installed KDE Plasma Color Sync in $target" 'Reload Code OSS to start synchronization.'