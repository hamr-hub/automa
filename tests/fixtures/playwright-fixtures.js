/**
 * Playwright测试 fixtures
 * 提供扩展测试所需的fixtures
 */

import { test as base, expect } from '@playwright/test';
import {
  launchBrowserWithExtension,
  getExtensionIds,
} from './extension-loader';

const EXTENSION_PATH = process.env.EXTENSION_PATH || './dist/chrome';

export const test = base.extend({
  extensionPage: async (_, use) => {
    const { context, page } = await launchBrowserWithExtension(EXTENSION_PATH);
    await use({ context, page });
    await context.close();
  },

  extensionId: async () => {
    try {
      const extensions = await getExtensionIds();
      if (extensions.length > 0) {
        return extensions[0].id;
      }
      return null;
    } catch {
      return null;
    }
  },
});

export { expect };

export default {
  test,
  expect,
};
