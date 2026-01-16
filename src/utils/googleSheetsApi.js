import supabaseClient from '@/services/supabase/SupabaseClient';
import BrowserAPIService from '@/service/browser-api/BrowserAPIService';

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
  // Access token passing is disabled as part of Google Drive API removal
  // if (accessToken) {
  //   body.accessToken = accessToken;
  // }

  const { data, error } = await supabaseClient.client.functions.invoke(
    'google-sheets-proxy',
    { body }
  );

  if (error) throw error;
  return data;
}

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
    return callSupabaseEdgeFunction('getValues', { spreadsheetId, range });
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
    return callSupabaseEdgeFunction('clearValues', { spreadsheetId, range });
  },

  async updateValues({ spreadsheetId, range, options = {}, append }) {
    return callSupabaseEdgeFunction('updateValues', {
      spreadsheetId,
      range,
      options,
      append,
    });
  },
};

export default function (isDriveSheet = false) {
  // Always return googleSheets (proxy) as native Drive support is removed
  return googleSheets;
}
