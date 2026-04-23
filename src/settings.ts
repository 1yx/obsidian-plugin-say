import { type App, PluginSettingTab, Setting } from "obsidian";
import type SayPlugin from "./main";
import {
  detectPlatform,
  getVoicesForCommand,
  INSTALL_HINTS,
  DEFAULT_TTS_COMMAND,
} from "./platform";

export type PluginSettings = {
  enabled: boolean;
  ttsCommand: string;
  speechRate: number;
  triggerDelay: number;
  voice: string;
  ttsArgs: string;
};

const platform = detectPlatform();

export const DEFAULT_SETTINGS: PluginSettings = {
  enabled: true,
  ttsCommand: DEFAULT_TTS_COMMAND[platform],
  speechRate: 1,
  triggerDelay: 0,
  voice: "",
  ttsArgs: "",
};

export class SettingTab extends PluginSettingTab {
  plugin: SayPlugin;

  constructor(app: App, plugin: SayPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    this.addEnableToggle(containerEl);
    this.addInstallHint(containerEl);
    this.addTtsCommandInput(containerEl);
    this.addVoiceDropdown(containerEl);
    this.addSpeechRateSlider(containerEl);
    this.addTriggerDelaySlider(containerEl);
    this.addTtsArgsInput(containerEl);
  }

  private addEnableToggle(el: HTMLElement): void {
    new Setting(el)
      .setName("Enable auto-read")
      .setDesc("Read aloud headings when hovering over internal links")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings();
          }),
      );
  }

  private addInstallHint(el: HTMLElement): void {
    new Setting(el)
      .setName("Speech engine")
      .setDesc(INSTALL_HINTS[detectPlatform()]);
  }

  private addTtsCommandInput(el: HTMLElement): void {
    new Setting(el)
      .setName("Command")
      .setDesc(
        "TTS executable name or full path (e.g. `say`, `spd-say`, `espeak`)",
      )
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_TTS_COMMAND[detectPlatform()])
          .setValue(this.plugin.settings.ttsCommand)
          .onChange(async (value) => {
            this.plugin.settings.ttsCommand = value;
            await this.plugin.saveSettings();
          }),
      );
    el.addEventListener("focusout", () => {
      this.display();
    });
  }

  private addVoiceDropdown(el: HTMLElement): void {
    const voices = getVoicesForCommand(this.plugin.settings.ttsCommand);

    new Setting(el)
      .setName("Voice")
      .setDesc("Voice for speech synthesis")
      .addDropdown((dropdown) => {
        dropdown.addOption("", "System default");
        for (const voice of voices) {
          dropdown.addOption(voice, voice);
        }
        const current = this.plugin.settings.voice;
        if (current !== "" && !voices.includes(current)) {
          this.plugin.settings.voice = "";
        }
        dropdown.setValue(this.plugin.settings.voice);
        dropdown.onChange(async (value) => {
          this.plugin.settings.voice = value;
          await this.plugin.saveSettings();
        });
      });
  }

  private addSpeechRateSlider(el: HTMLElement): void {
    new Setting(el)
      .setName("Speech rate")
      .setDesc("Rate multiplier for speech synthesis (1 = normal)")
      .addSlider((slider) =>
        slider
          .setLimits(0.5, 3, 0.1)
          .setValue(this.plugin.settings.speechRate)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.speechRate = value;
            await this.plugin.saveSettings();
          }),
      );
  }

  private addTriggerDelaySlider(el: HTMLElement): void {
    new Setting(el)
      .setName("Trigger delay")
      .setDesc(
        "Milliseconds to wait before speaking after hover (prevents overlap)",
      )
      .addSlider((slider) =>
        slider
          .setLimits(100, 1000, 50)
          .setValue(this.plugin.settings.triggerDelay)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.triggerDelay = value;
            await this.plugin.saveSettings();
          }),
      );
  }

  private addTtsArgsInput(el: HTMLElement): void {
    new Setting(el)
      .setName("Arguments template")
      .setDesc(
        "Optional. Overrides voice and rate settings above. " +
          "Placeholders: `{voice}`, `{rate}`, `{text}`. " +
          "Example: `-v {voice} -s {rate} {text}`",
      )
      .addText((text) =>
        text
          .setPlaceholder("-v {voice} -r {rate} {text}")
          .setValue(this.plugin.settings.ttsArgs)
          .onChange(async (value) => {
            this.plugin.settings.ttsArgs = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
