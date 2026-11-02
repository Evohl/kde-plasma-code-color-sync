# KDE Plasma Color Sync for Code OSS

An extension that follows KDE Plasma 6 workbench colors. The active Code OSS theme still controls syntax highlighting.

## Requirements

- Linux with KDE Plasma 6 and `kreadconfig6` available in `PATH`.
- Code OSS 1.80 or later.
- KDE color roles configured in `kdeglobals`. The file is read through KDE's configuration tool; `XDG_CONFIG_HOME` is respected.

## Install

Clone this extension's Git repository:

```sh
git clone https://github.com/Evohl/kde-plasma-code-color-sync.git
cd kde-plasma-code-color-sync
sh install.sh
```

Alternatively, run `sh install.sh` from an existing copy of this extension directory.

The installer copies the extension to the default Code OSS extension directory, `~/.vscode/extensions`. Reload Code OSS to start synchronization. Check the installation with `code-oss --list-extensions --show-versions`.

The installer refuses to overwrite an existing installation. To replace or update one, first run `KDE Color Sync: Stop and Restore Colors` in the command palette while the old extension is enabled. Uninstall it through the extensions view or with `code-oss --uninstall-extension Evohl.kde-plasma-code-color-sync`, then run the installer again. Copies installed under an earlier ID must likewise be restored and uninstalled first; their identifiers are `local.kde-code-theme` and `Evohl.kde-code-theme`.

The installed copy is independent of the source folder, so later source changes do not update it automatically. Before removing the extension, always run `KDE Color Sync: Stop and Restore Colors` while it is still enabled.

## Try it

From the extension directory, start an extension development window:

```sh
code-oss --extensionDevelopmentPath="$PWD" --new-window
```

This uses your normal Code OSS user profile. The extension starts automatically and changes that profile's global `workbench.colorCustomizations` setting. It does not change KDE settings. A workspace, theme-specific customization, or another extension may override individual colors.

Run `KDE Color Sync: Stop and Restore Colors` from the command palette before closing the development window or uninstalling the extension. It stops synchronization and restores the previous values of keys still controlled by the extension. Any color edited manually since synchronization is left alone. Run `KDE Color Sync: Start Synchronization` to start again.

Disabling or uninstalling the extension does not automatically undo its settings. The restore command must be run while the extension is enabled. Back up or inspect your settings before trying it if necessary.

## Mapping

The extension reads `Colors:Window`, `Colors:View`, `Colors:Button`, `Colors:Selection`, `Colors:Tooltip`, and `WM` from KDE. It uses window colors for workbench surfaces, view colors for the editor and text/number inputs, button colors for buttons and dropdowns, KDE selection foreground and background for editor selections, tooltip colors for editor hover popups, and WM colors for inactive titles. Code lists, including the Explorer, and active activity bar items in the modern layout use window text with the selection color mixed into the window background; list hover backgrounds mix the view hover decoration into the window background. The welcome page uses the view background, with window-colored tiles and the same hover tint as lists. Its progress indicator uses the selection color, and its badges share the selection foreground and background with activity bar notification badges. Other hover highlights use the view or button hover decoration, with the button tint mixed into its normal background. The view link color is used for links and the view focus decoration for focus and progress indicators. Other colors remain controlled by the current Code OSS theme.

Code-rendered menus use window colors, the same selection tint as lists, and borders and separators mixed from inactive window text. Native application menus are controlled by the desktop rather than these Code theme colors.

Only the selected keys in `palette.js` are managed. Existing values for those keys are saved before being overridden; unrelated and theme-specific entries are retained. The extension watches the KDE configuration directory, including replacement of `kdeglobals`, and reapplies changed values while Code OSS is running. It reports read or update failures in the `KDE Color Sync` output channel.

The extension reads configured values, not the defaults or state-dependent colors calculated by `KColorScheme`. If a required role is missing or invalid, synchronization fails without changing the existing colors. Missing inactive-title colors fall back to window colors, missing tooltip colors fall back together to view colors, and missing hover decorations fall back to the view focus color. Use one extension host per Code OSS profile: simultaneous hosts can race when saving and restoring shared color settings.

## Verification

Run `npm test` in this directory. The tests use simulated VS Code and KDE data and do not change the user's settings.

## License

MIT. See [LICENSE](LICENSE).

## References

- [KDE color scheme roles](https://api.kde.org/kcolorscheme.html)
- [VS Code theme color reference](https://code.visualstudio.com/api/references/theme-color)
- [VS Code configuration API](https://code.visualstudio.com/api/references/vscode-api#WorkspaceConfiguration)