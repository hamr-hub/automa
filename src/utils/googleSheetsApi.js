import supabaseClient from '@/services/supabase/SupabaseClient';
import BrowserAPIService from '@/service/browser-api/BrowserAPIService';

/**
 * 获取Google Sheets访问令牌
 * 从localStorage中获取存储的sessionToken
 */
async function getGoogleAccessToken() {
  const { sessionToken } =
    await BrowserAPIService.storage.local.get('sessionToken');
  if (!sessionToken?.access) {
    throw new Error('No Google access token found. Please authenticate first.');
  }
  return sessionToken.access;
}

/**
 * Call Supabase Edge Function to proxy Google Sheets API
 * @param {string} method - The method to call on the proxy (e.g. 'getValues')
 * @param {object} params - Parameters for the method
 * @param {string} [accessToken] - Optional Google Access Token (for user-context calls)
 */
async function callSupabaseEdgeFunction(method, params, accessToken = null) {
  if (!supabaseClient.client) {
    throw new Error('Supabase not initialized');
  }

  const body = { method, params };
  if (accessToken) {
    body.accessToken = accessToken;
  }

  const { data, error } = await supabaseClient.client.functions.invoke(
    'google-sheets-proxy',
    { body }
  );

  if (error) throw error;
  return data;
}

export const googleSheetNative = {
  async getValues({ spreadsheetId, range }) {
    const accessToken = await getGoogleAccessToken();
    return callSupabaseEdgeFunction(
      'getValues',
      { spreadsheetId, range },
      accessToken
    );
  },

  async getRange({ spreadsheetId, range }) {
    const accessToken = await getGoogleAccessToken();
    // Map to updateValues with append=true, matching googleSheets behavior
    return callSupabaseEdgeFunction(
      'updateValues',
      {
        spreadsheetId,
        range,
        append: true,
        options: {
          body: JSON.stringify({ values: [] }),
          queries: {
            valueInputOption: 'RAW',
            includeValuesInResponse: false,
            insertDataOption: 'INSERT_ROWS',
          },
        },
      },
      accessToken
    );
  },

  async clearValues({ spreadsheetId, range }) {
    const accessToken = await getGoogleAccessToken();
    return callSupabaseEdgeFunction(
      'clearValues',
      { spreadsheetId, range },
      accessToken
    );
  },

  async updateValues({ spreadsheetId, range, options, append }) {
    const accessToken = await getGoogleAccessToken();
    return callSupabaseEdgeFunction(
      'updateValues',
      {
        spreadsheetId,
        range,
        options,
        append,
      },
      accessToken
    );
  },

  async create(name) {
    const accessToken = await getGoogleAccessToken();
    // Map to 'create' method on proxy
    return callSupabaseEdgeFunction('create', { title: name }, accessToken);
  },

  async addSheet({ sheetName, spreadsheetId }) {
    const accessToken = await getGoogleAccessToken();
    // Map to 'addSheet' method on proxy
    return callSupabaseEdgeFunction(
      'addSheet',
      { title: sheetName, spreadsheetId },
      accessToken
    );
  },

  async checkPermission(spreadsheetId) {
    try {
      await this.getValues({ spreadsheetId, range: 'A1' });
      return true;
    } catch (error) {
      return false;
    }
  },
};

/**
 * 通过Supabase Edge Function调用Google Sheets API
 * 适用于系统级调用或降级方案
 */
export const googleSheets = {
  // Expose for flexibility if needed
  callEdgeFunction: callSupabaseEdgeFunction,

  // Legacy helper, might be used by UI components
  getUrl(spreadsheetId, range) {
    return `/services/google-sheets?spreadsheetId=${spreadsheetId}&range=${range}`;
  },

  async checkPermission(spreadsheetId) {
    try {
      await this.getValues({ spreadsheetId, range: 'A1' });
      return true;
    } catch (error) {
      return false;
    }
  },

  async getValues({ spreadsheetId, range }) {
    try {
      // Try with user token first (parity with existing behavior)
      return await googleSheetNative.getValues({ spreadsheetId, range });
    } catch (error) {
      console.warn('User auth failed, trying System Proxy:', error);
      return callSupabaseEdgeFunction('getValues', { spreadsheetId, range });
    }
  },

  getRange(params) {
    return this.updateValues({
      ...params,
      append: true,
      options: {
        body: JSON.stringify({ values: [] }),
        queries: {
          valueInputOption: 'RAW',
          includeValuesInResponse: false,
          insertDataOption: 'INSERT_ROWS',
        },
      },
    });
  },

  async clearValues({ spreadsheetId, range }) {
    try {
      return await googleSheetNative.clearValues({ spreadsheetId, range });
    } catch (error) {
      console.warn('User auth failed, trying System Proxy:', error);
      return callSupabaseEdgeFunction('clearValues', { spreadsheetId, range });
    }
  },

  async updateValues({ spreadsheetId, range, options = {}, append }) {
    try {
      return await googleSheetNative.updateValues({
        spreadsheetId,
        range,
        options,
        append,
      });
    } catch (error) {
      console.warn('User auth failed, trying System Proxy:', error);
      return callSupabaseEdgeFunction('updateValues', {
        spreadsheetId,
        range,
        options,
        append,
      });
    }
  },
};

export default function (isDriveSheet = false) {
  return isDriveSheet ? googleSheetNative : googleSheets;
}
