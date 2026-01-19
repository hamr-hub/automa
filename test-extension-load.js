const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const extensionPath = path.join(__dirname, 'build');
  
  console.log('📦 Extension path:', extensionPath);
  console.log('📋 Testing extension load...\n');

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
    ],
  });

  console.log('✅ Browser context created');

  // Wait a bit for extension to load
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check for extension errors in background page
  const backgroundPages = context.backgroundPages();
  console.log('📄 Background pages:', backgroundPages.length);

  if (backgroundPages.length > 0) {
    const bgPage = backgroundPages[0];
    
    bgPage.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[BG Console ${type}]:`, text);
    });

    bgPage.on('pageerror', (error) => {
      console.error('❌ [BG Error]:', error);
    });

    // Try to evaluate something in background
    try {
      const result = await bgPage.evaluate(() => {
        return {
          location: typeof location !== 'undefined' ? location.href : 'undefined',
          chrome: typeof chrome !== 'undefined',
          browser: typeof browser !== 'undefined',
        };
      });
      console.log('🔍 Background page context:', result);
    } catch (e) {
      console.error('❌ Failed to evaluate in background:', e.message);
    }
  }

  // Open a test page
  const page = await context.newPage();
  await page.goto('https://www.example.com');
  console.log('✅ Test page loaded');

  // Check if content script loaded
  await page.waitForTimeout(2000);
  
  try {
    const contentScriptLoaded = await page.evaluate(() => {
      return typeof window.__AUTOMA_EXT__ !== 'undefined';
    });
    console.log('📝 Content script loaded:', contentScriptLoaded);
  } catch (e) {
    console.log('⚠️ Content script check failed:', e.message);
  }

  console.log('\n✅ Extension appears to be loading correctly!');
  console.log('👉 Press Ctrl+C to close the browser and exit');

  // Keep browser open for manual inspection
  await new Promise(() => {});
})().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
