import { Setting, SettingTab, setIcon } from 'obsidian';
import { fetchOpenAIBaseModels } from 'src/components/FetchModelList';
import BMOGPT, { DEFAULT_SETTINGS } from 'src/main';

export function addOpenAIConnectionSettings(containerEl: HTMLElement, plugin: BMOGPT, SettingTab: SettingTab) {
    const toggleSettingContainer = containerEl.createDiv({ cls: 'toggleSettingContainer' });
    toggleSettingContainer.createEl('h2', { text: 'OpenAI' });

    const initialState = plugin.settings.toggleOpenAISettings;
    const chevronIcon = toggleSettingContainer.createEl('span', { cls: 'chevron-icon' });
    setIcon(chevronIcon, initialState ? 'chevron-down' : 'chevron-right');

    // Create the settings container to be toggled
    const settingsContainer = containerEl.createDiv({ cls: 'settingsContainer' });
    settingsContainer.style.display = initialState ? 'block' : 'none';

    // Toggle visibility
    toggleSettingContainer.addEventListener('click', async () => {
        const isOpen = settingsContainer.style.display !== 'none';
        if (isOpen) {
            setIcon(chevronIcon, 'chevron-right'); // Close state
            settingsContainer.style.display = 'none';
            plugin.settings.toggleOpenAISettings = false;

        } else {
            setIcon(chevronIcon, 'chevron-down'); // Open state
            settingsContainer.style.display = 'block';
            plugin.settings.toggleOpenAISettings = true;
        }
        await plugin.saveSettings();
    });

    new Setting(settingsContainer)
    .setName('OpenAI API Key')
    .setDesc('Insert OpenAI API Key.')
    .addText(text => text
        .setPlaceholder('insert-api-key')
        .setValue(plugin.settings.APIConnections.openAI.APIKey ? `${plugin.settings.APIConnections.openAI.APIKey.slice(0, 7)}-...${plugin.settings.APIConnections.openAI.APIKey.slice(-4)}` : '')
        .onChange(async (value) => {
            plugin.settings.APIConnections.openAI.openAIBaseModels = [];
            plugin.settings.APIConnections.openAI.APIKey = value;
            if (plugin.settings.APIConnections.openAI.APIKey === '') {
                plugin.settings.APIConnections.openAI.openAIBaseModels = [];
            } else {
                const models = await fetchOpenAIBaseModels(plugin);
                models.forEach((model) => {
                    if (!plugin.settings.APIConnections.openAI.openAIBaseModels.includes(model)) {
                        plugin.settings.APIConnections.openAI.openAIBaseModels.push(model);
                    }
                });
            }
        })
        .inputEl.addEventListener('focusout', async () => {
            await plugin.saveSettings();
            SettingTab.display();
        })
    );

    new Setting(settingsContainer)
        .setName('OpenAI-Based URL')
        .setDesc('Enter your custom OpenAI-Based URL.')
        .addButton(button => button
            .setButtonText('Restore Default')
            .setIcon('rotate-cw')
            .setClass('clickable-icon')
            .onClick(async () => {
                plugin.settings.APIConnections.openAI.openAIBaseModels = [];
                plugin.settings.APIConnections.openAI.openAIBaseUrl = DEFAULT_SETTINGS.APIConnections.openAI.openAIBaseUrl;
                await plugin.saveSettings();
                SettingTab.display();
            })
        )
        .addText(text => text
            .setPlaceholder('https://api.openai.com/v1')
            .setValue(plugin.settings.APIConnections.openAI.openAIBaseUrl || DEFAULT_SETTINGS.APIConnections.openAI.openAIBaseUrl)
            .onChange(async (value) => {
                    plugin.settings.APIConnections.openAI.openAIBaseUrl = value ? value : DEFAULT_SETTINGS.APIConnections.openAI.openAIBaseUrl;
                    await plugin.saveSettings();
                })
            .inputEl.addEventListener('focusout', async () => {
                SettingTab.display();
            })
        );

    new Setting(settingsContainer)
        .setName('Enable Stream')
        .setDesc('Enable stream for OpenAI-Based models.')
        .addToggle((toggle) =>
            toggle.setValue(plugin.settings.APIConnections.openAI.enableStream).onChange(async (value) => {
                plugin.settings.APIConnections.openAI.enableStream = value;
                await plugin.saveSettings();
            })
        );
}