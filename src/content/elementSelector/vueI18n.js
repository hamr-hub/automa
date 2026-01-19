import { createI18n } from 'vue-i18n/dist/vue-i18n.esm-bundler';

const i18n = createI18n({
  locale: 'en',
  legacy: false,
});

// Load locale messages dynamically
const loadMessages = async () => {
  try {
    const [enCommon, enBlocks] = await Promise.all([
      import('@/locales/en/common.json'),
      import('@/locales/en/blocks.json'),
    ]);

    i18n.global.mergeLocaleMessage('en', enCommon.default);
    i18n.global.mergeLocaleMessage('en', enBlocks.default);
  } catch (error) {
    console.error('Failed to load locale messages:', error);
  }
};

loadMessages();

export default i18n;
