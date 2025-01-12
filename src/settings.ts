import classNames from "classnames";
import { type Plugin, PluginSettingTab, Setting } from "obsidian";

type SourceModeSettings = {
  showCopyButtonOnlyOnLineHover: boolean;
};

type ReadingModeSettings = {
  showCopyMarkdownButton: boolean;
  showCopyPlainTextButton: boolean;
};

type PluginSettings = {
  pluginVersion: "1.0.0"; // Useful to store now in case settings change and require migration in the future
  showCopyFormatIndicators: boolean;
  sourceModeSettings: SourceModeSettings;
  readingModeSettings: ReadingModeSettings;
};

type SettingKey = keyof PluginSettings;

/**
 * Deep-clones the given settings. There's currently only one nested object: `autoSelectionModes`.
 */
function deepCloneSettings(settings: PluginSettings): PluginSettings {
  const clone: PluginSettings = { ...settings };
  clone.sourceModeSettings = { ...settings.sourceModeSettings };
  clone.readingModeSettings = { ...settings.readingModeSettings };
  return clone;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  pluginVersion: "1.0.0",
  showCopyFormatIndicators: false,
  sourceModeSettings: {
    showCopyButtonOnlyOnLineHover: false,
  },
  readingModeSettings: {
    showCopyMarkdownButton: true,
    showCopyPlainTextButton: true,
  },
};

export class PluginSettingsManager extends PluginSettingTab {
  private settings: PluginSettings = deepCloneSettings(DEFAULT_SETTINGS);

  constructor(private plugin: Plugin) {
    super(plugin.app, plugin);
  }

  public async setupSettingsTab(): Promise<void> {
    this.settings = await this.loadSettings();
    this.addSettingTab();
  }

  private async loadSettings(): Promise<PluginSettings> {
    const loadedSettings = (await this.plugin.loadData()) as PluginSettings | null;
    if (loadedSettings !== null) {
      console.log("Loaded settings:", loadedSettings);
      return loadedSettings;
    }
    return await this.initializeSettings();
  }

  private async initializeSettings(): Promise<PluginSettings> {
    const settings = deepCloneSettings(DEFAULT_SETTINGS);
    await this.plugin.saveData(settings);
    return settings;
  }

  private addSettingTab(): void {
    this.plugin.addSettingTab(this);
  }

  public getSetting<K extends SettingKey>(settingKey: K): PluginSettings[K] {
    return this.settings[settingKey];
  }

  private async setSetting<K extends SettingKey>(
    settingKey: K,
    value: PluginSettings[K]
  ): Promise<void> {
    this.settings[settingKey] = value;
    await this.saveSettings();
  }

  private async setSourceModeSetting<K extends keyof SourceModeSettings>(
    modeKey: K,
    value: SourceModeSettings[K]
  ): Promise<void> {
    const newSourceModeSettings = { ...this.settings.sourceModeSettings, [modeKey]: value };
    await this.setSetting("sourceModeSettings", newSourceModeSettings);
  }

  private async setReadingModeSetting<K extends keyof ReadingModeSettings>(
    modeKey: K,
    value: ReadingModeSettings[K]
  ): Promise<void> {
    const newReadingModeSettings = { ...this.settings.readingModeSettings, [modeKey]: value };
    await this.setSetting("readingModeSettings", newReadingModeSettings);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    this.displayButtonAppearanceSettings();
    this.displaySourceModeSettings();
    this.displayReadingModeSettings();
  }

  private displayButtonAppearanceSettings(): void {
    new Setting(this.containerEl).setName("Appearance").setHeading();
    this.displayCopyFormatIndicatorsSetting();
  }

  private displayCopyFormatIndicatorsSetting(): void {
    new Setting(this.containerEl)
      .setName("Show copy format indicators on copy buttons")
      .setDesc(
        "Whether to add little 'P' (plain text) and 'M' (Markdown) indicators to the copy buttons that indicate what format the copied content will be in."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.settings.showCopyFormatIndicators)
          .onChange((value) => this.setSetting("showCopyFormatIndicators", value))
      );
  }

  private displaySourceModeSettings(): void {
    new Setting(this.containerEl).setName("Source mode").setHeading();
    this.displayShowCopyButtonOnlyOnLineHoverSetting();
  }

  private displayShowCopyButtonOnlyOnLineHoverSetting(): void {
    new Setting(this.containerEl)
      .setName("Show copy button only on line hover")
      .setDesc("If disabled, the copy buttons in Source Mode will always be visible.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.settings.sourceModeSettings.showCopyButtonOnlyOnLineHover)
          .onChange((value) => this.setSourceModeSetting("showCopyButtonOnlyOnLineHover", value))
      );
  }

  private displayReadingModeSettings(): void {
    new Setting(this.containerEl).setName("Reading mode").setHeading();
    this.displayShowCopyMarkdownButtonSetting();
    this.displayShowCopyPlainTextButtonSetting();
  }

  private displayShowCopyMarkdownButtonSetting(): void {
    new Setting(this.containerEl)
      .setName("Show 'Copy (Markdown)' button")
      .setDesc("Whether to add 'Copy (Markdown)' buttons to callout blocks in Reading Mode.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.settings.readingModeSettings.showCopyMarkdownButton)
          .onChange((value) => this.setReadingModeSetting("showCopyMarkdownButton", value))
      );
  }

  private displayShowCopyPlainTextButtonSetting(): void {
    new Setting(this.containerEl)
      .setName("Show 'Copy (plain text)' button")
      .setDesc("Whether to add 'Copy (plain text)' buttons to callout blocks in Reading Mode.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.settings.readingModeSettings.showCopyPlainTextButton)
          .onChange((value) => this.setReadingModeSetting("showCopyPlainTextButton", value))
      );
  }

  private async saveSettings(): Promise<void> {
    await this.plugin.saveData(this.settings);
  }
}

/**
 * Returns the class names for the copy buttons based on the plugin settings.
 */
export function getCopyButtonSettingsClassName(
  pluginSettingsManager: PluginSettingsManager
): string {
  const showCopyFormatIndicators = pluginSettingsManager.getSetting("showCopyFormatIndicators");
  const { showCopyButtonOnlyOnLineHover } = pluginSettingsManager.getSetting("sourceModeSettings");
  const {
    showCopyMarkdownButton: showCopyMarkdownButton,
    showCopyPlainTextButton: showCopyPlainTextButton,
  } = pluginSettingsManager.getSetting("readingModeSettings");
  return classNames({
    "show-copy-format-indicators": showCopyFormatIndicators,
    "show-source-mode-copy-button-only-on-line-hover": showCopyButtonOnlyOnLineHover,
    "show-reading-mode-copy-markdown-buttons": showCopyMarkdownButton,
    "show-reading-mode-copy-plain-text-buttons": showCopyPlainTextButton,
  });
}
