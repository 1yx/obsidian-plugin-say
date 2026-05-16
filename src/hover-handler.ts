import {
  type App,
  type EventRef,
  type CachedMetadata,
  type Workspace,
} from "obsidian";
import { speak } from "./tts";
import type { PluginSettings } from "./settings";

type HoverLinkEvent = {
  event: MouseEvent;
  source: string;
  hoverEl: HTMLElement;
  targetEl: HTMLElement;
  linktext: string;
};

type WorkspaceExt = Workspace & {
  on(name: "hover-link", callback: (ctx: HoverLinkEvent) => void): EventRef;
};

export class HoverHandler {
  private app: App;
  private getSettings: () => PluginSettings;
  private ref: EventRef | undefined;
  private debounceTimer: number | undefined;
  private currentProcess: ReturnType<typeof speak> | undefined;
  private targetEl: HTMLElement | undefined;
  private readonly onMouseLeave = () => {
    this.cancel();
  };

  constructor(app: App, getSettings: () => PluginSettings) {
    this.app = app;
    this.getSettings = getSettings;
  }

  /** Register the hover-link event listener. */
  register(): void {
    this.ref = (this.app.workspace as WorkspaceExt).on(
      "hover-link",
      (ctx: HoverLinkEvent) => {
        this.onHover(ctx);
      },
    );
  }

  /** Cancel any pending speech and unregister the event. */
  destroy(): void {
    this.cancel();
    this.detachMouseLeave();
    if (this.ref) {
      this.app.workspace.offref(this.ref);
    }
  }

  private onHover(ctx: HoverLinkEvent): void {
    this.cancel();
    this.detachMouseLeave();

    if (ctx.source !== "editor" && ctx.source !== "preview") {
      return;
    }

    const settings = this.getSettings();
    if (!settings.enabled) {
      return;
    }

    this.targetEl = ctx.targetEl;
    this.targetEl.addEventListener("mouseleave", this.onMouseLeave);

    this.debounceTimer = activeWindow.setTimeout(() => {
      this.speakLink(ctx.linktext);
    }, settings.triggerDelay);
  }

  private cancel(): void {
    if (this.debounceTimer) {
      activeWindow.clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = undefined;
    }
  }

  private detachMouseLeave(): void {
    if (this.targetEl) {
      this.targetEl.removeEventListener("mouseleave", this.onMouseLeave);
      this.targetEl = undefined;
    }
  }

  /** Resolve linktext to the target file's first H1, falling back to filename. */
  private resolveText(linktext: string): string | undefined {
    const file = this.app.metadataCache.getFirstLinkpathDest(linktext, "");
    if (!file) {
      return undefined;
    }

    const cache: CachedMetadata | null =
      this.app.metadataCache.getFileCache(file);
    const h1 = cache?.headings?.find((h) => h.level === 1);
    return h1?.heading ?? file.basename;
  }

  private speakLink(linktext: string): void {
    const text = this.resolveText(linktext);
    if (!text) {
      return;
    }

    const settings = this.getSettings();
    try {
      this.currentProcess = speak({
        ttsCommand: settings.ttsCommand,
        ttsArgs: settings.ttsArgs,
        text,
        rate: settings.speechRate,
        voice: settings.voice,
      });
    } catch {
      // Input validation rejected the text or command — skip silently
    }
  }
}
