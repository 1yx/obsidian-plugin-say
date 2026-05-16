import { spawn, type ChildProcess } from "child_process";

export type SpeakOptions = {
  ttsCommand: string;
  ttsArgs: string;
  text: string;
  rate: number;
  voice: string;
};

const REJECT_CHARS = /[\0\r\n\t]/;
const REJECT_COMMAND = /[|&;$`\\]/;

type SpawnSpec = {
  command: string;
  args: string[];
};

type EngineBuilder = (opts: {
  text: string;
  rate: number;
  voice: string;
}) => SpawnSpec;

const ENGINES: Record<string, EngineBuilder> = {
  say(opts) {
    const args = ["-r", String(Math.round(opts.rate * 200))];
    if (opts.voice) {
      args.push("-v", opts.voice);
    }
    args.push(opts.text);
    return { command: "say", args };
  },
  "spd-say"(opts) {
    const args = ["-r", String(Math.round((opts.rate - 1) * 100))];
    if (opts.voice) {
      args.push("-t", opts.voice);
    }
    args.push(opts.text);
    return { command: "spd-say", args };
  },
  powershell(opts) {
    const rateWin = String(Math.round((opts.rate - 1) * 5));
    const escapePowerShell = (s: string) => s.replace(/'/g, "''");
    const voicePart = opts.voice
      ? `$synth.SelectVoice('${escapePowerShell(opts.voice)}'); `
      : "";
    const script = `Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; ${voicePart}$synth.Rate = ${rateWin}; $synth.Speak('${escapePowerShell(opts.text)}')`;
    const encoded = Buffer.from(script, "utf16le").toString("base64");
    return { command: "powershell", args: ["-EncodedCommand", encoded] };
  },
  espeak(opts) {
    const args = ["-s", String(Math.round(opts.rate * 175))];
    if (opts.voice) {
      args.push("-v", opts.voice);
    }
    args.push(opts.text);
    return { command: "espeak", args };
  },
};

function buildSpawnArgs(opts: SpeakOptions): SpawnSpec {
  if (opts.ttsArgs) {
    const expanded = opts.ttsArgs
      .replace(/\{voice\}/g, opts.voice)
      .replace(/\{rate\}/g, String(Math.round(opts.rate * 175)))
      .replace(/\{text\}/g, opts.text);
    return { command: opts.ttsCommand, args: splitArgs(expanded) };
  }

  const engineName = opts.ttsCommand.split("/").pop() ?? opts.ttsCommand;
  const builder = ENGINES[engineName];
  if (builder) {
    return builder(opts);
  }
  return { command: opts.ttsCommand, args: [opts.text] };
}

/** Split a string into shell-like tokens (respects double-quoted segments). */
function splitArgs(input: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const ch of input) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === " " && !inQuotes) {
      if (current) {
        result.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }
  if (current) {
    result.push(current);
  }
  return result;
}

/** Speak the given text using the system TTS engine. */
export function speak(opts: SpeakOptions): ChildProcess {
  if (REJECT_CHARS.test(opts.text)) {
    throw new Error("Text contains disallowed control characters");
  }
  if (REJECT_COMMAND.test(opts.ttsCommand)) {
    throw new Error("TTS command contains disallowed shell metacharacters");
  }

  const spec = buildSpawnArgs(opts);
  const child = spawn(spec.command, spec.args, { stdio: "ignore" });
  child.on("error", () => {
    // Silently ignore TTS errors — non-critical UX feature
  });
  return child;
}
