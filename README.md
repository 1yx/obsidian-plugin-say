# Say

A lightweight Obsidian plugin that reads aloud the H1 heading of a target note when you hover over an internal link, using the system's built-in TTS engine.

## Features

- **Hover to read** — Hover over any internal link to hear the target note's H1 heading (falls back to filename if no H1).
- **Cross-platform** — Works with macOS `say`, Linux `spd-say`/`espeak`, and Windows PowerShell `SpeechSynthesizer`.
- **Configurable** — Choose your TTS command, voice, speech rate, and trigger delay.
- **Arguments template** — Power users can specify a custom argument template (e.g. `-v {voice} -s {rate} {text}`) to override defaults.

## Installation

### From Obsidian Community Plugins (pending review)

1. Open Settings → Community Plugins
2. Search for "Say"
3. Click Install, then Enable

### Manual

1. Download `main.js` and `manifest.json` from the [latest release](../../releases)
2. Create a folder named `say` in your vault's `.obsidian/plugins/` directory
3. Copy both files into that folder
4. Enable the plugin in Settings → Community Plugins

## Usage

1. Enable the plugin
2. Hover over any internal link in the editor
3. The plugin will read the target note's H1 heading aloud

## Settings

| Setting | Description |
|---|---|
| Enable auto-read | Toggle hover-to-speak on/off |
| Speech engine | Shows install instructions for your platform |
| Command | TTS executable name or full path |
| Voice | Voice for speech synthesis (updates dynamically based on selected command) |
| Speech rate | Rate multiplier (1 = normal) |
| Trigger delay | Milliseconds before speaking after hover |
| Arguments template | Optional custom argument template that overrides voice and rate settings |

### Arguments Template

The template field supports three placeholders:

- `{voice}` — The selected voice name
- `{rate}` — The speech rate value
- `{text}` — The text to speak

Example: `-v {voice} -s {rate} {text}`

When non-empty, this overrides the voice and rate settings above.

## Compatibility

- **macOS**: Uses the built-in `say` command
- **Linux**: Requires `speech-dispatcher` (`sudo apt install speech-dispatcher`) or `espeak`
- **Windows**: Uses PowerShell `SpeechSynthesizer` (built-in)

**Desktop only** — requires Node.js `child_process` API.

## Development

```bash
pnpm install
pnpm dev        # Watch mode
pnpm build      # Production build
pnpm lint       # Lint check
pnpm typecheck  # TypeScript check
```

## License

MIT
