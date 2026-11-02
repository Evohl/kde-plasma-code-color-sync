# KDE Plasma Color Sync

## Purpose

- Provide a minimal Git-distributable Code OSS extension that synchronizes KDE Plasma 6 color roles with selected workbench colors while leaving syntax highlighting to the active editor theme.

## Ownership

- Own the extension manifest, MIT license, installer, implementation, tests, and usage documentation in this folder.

## Local Contracts

- Read KDE colors through `kreadconfig6`; observe the KDE configuration directory for changes to `kdeglobals`.
- Write only the mapped keys in the global `workbench.colorCustomizations` setting. Preserve unrelated and theme-specific entries, save overwritten values, and provide an explicit stop-and-restore command.
- Never overwrite or restore a managed key after detecting a user edit to it. Do not write KDE configuration or install, enable, or alter the user's system without approval.
- Preserve the active syntax theme and do not add runtime dependencies.
- Distribute only this extension folder, not the parent workspace. The installer targets the default Code OSS extension directory and refuses to overwrite the current or earlier extension IDs.

## Work Guidance

- Keep KDE-to-Code color mapping explicit and use paired selection background and foreground colors.
- Code lists use the window foreground with a subdued selection tint and an opaque hover tint mixed into the window background; editor selections retain KDE selection colors.
- Menus use window colors and the same subdued selection tint as lists; borders and separators mix inactive window text into the window background.
- Active modern activity bar items use the window foreground and the same subdued selection tint as Code lists.
- The welcome page uses the view background; its tiles use the window background and list hover tint, and their progress indicator uses the selection color.
- Welcome page badges and activity bar notification badges share the KDE selection background and foreground.
- Document changes to mapped roles, settings side effects, prerequisites, and rollback in `README.md`.
- Keep the installer's versioned destination aligned with `package.json`; the installer test verifies it.

## Verification

- Run `npm test` from this folder; tests simulate the extension host and test the installer in temporary homes without changing user settings.

## Child DOX Index