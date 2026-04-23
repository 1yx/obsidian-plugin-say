import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, type PluginSettings, SettingTab } from "./settings";
import { HoverHandler } from "./hover-handler";

export default class SayPlugin extends Plugin {
  settings!: PluginSettings;
  private hoverHandler: HoverHandler | undefined;

  async onload() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<PluginSettings>,
    );

    this.addSettingTab(new SettingTab(this.app, this));

    this.hoverHandler = new HoverHandler(this.app, () => this.settings);
    this.hoverHandler.register();
  }

  onunload() {
    this.hoverHandler?.destroy();
    this.hoverHandler = undefined;
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
