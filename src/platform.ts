import { Platform } from "obsidian";

export type OsPlatform = "darwin" | "linux" | "win32";

let cachedPlatform: OsPlatform | undefined;

/** Detect the current OS platform via Obsidian's Platform API. */
export function detectPlatform(): OsPlatform {
  if (cachedPlatform) {
    return cachedPlatform;
  }

  if (Platform.isMacOS) {
    cachedPlatform = "darwin";
  } else if (Platform.isWin) {
    cachedPlatform = "win32";
  } else {
    cachedPlatform = "linux";
  }

  return cachedPlatform;
}

export const VOICE_PRESETS: Record<string, string[]> = {
  say: ["Alex", "Samantha", "Karen", "Daniel", "Fiona", "Moira", "Tessa"],
  "spd-say": ["female1", "female2", "female3", "male1", "male2", "male3"],
  powershell: [
    "Microsoft David",
    "Microsoft Zira",
    "Microsoft Mark",
    "Microsoft Eva",
  ],
  espeak: ["en", "en-us", "en-gb", "fr", "de", "es", "it", "pt", "zh", "ja"],
};

const PLATFORM_ENGINE: Record<OsPlatform, string> = {
  darwin: "say",
  linux: "spd-say",
  win32: "powershell",
};

/** Get voice list for a TTS command, falling back to platform default engine. */
export function getVoicesForCommand(command: string): string[] {
  const engineName = command.split("/").pop() ?? command;
  const matched = VOICE_PRESETS[engineName];
  if (matched) return matched;
  const fallback = PLATFORM_ENGINE[detectPlatform()];
  return VOICE_PRESETS[fallback]!;
}

export const INSTALL_HINTS: Record<OsPlatform, string> = {
  darwin: "`say` is built-in on macOS.",
  linux: "Install via package manager: `sudo apt install speech-dispatcher`",
  win32: "Windows SpeechSynthesizer is built-in.",
};

export const DEFAULT_TTS_COMMAND: Record<OsPlatform, string> = {
  darwin: "say",
  linux: "spd-say",
  win32: "powershell",
};

export const ARGS_TEMPLATES: Record<string, string> = {
  say: "-v {voice} -r {rate} {text}",
  "spd-say": "-t {voice} -r {rate} {text}",
  espeak: "-v {voice} -s {rate} {text}",
};
