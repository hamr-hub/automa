import supabaseClient from '@/services/supabase/SupabaseClient';
import BrowserAPIService from '@/service/browser-api/BrowserAPIService';

function queryBuilder(obj) {
  let str = '';

  Object.entries(obj).forEach(([key, value], index) => {
    if (index !== 0) str += `&`;

    str += `${key}=${value}`;
  });

  return str;
}

/**
 * 获取Google Sheets访问令牌
 * 从localStorage中获取存储的sessionToken
 */
async function getGoogleAccessToken() {
  const { sessionToken } = await BrowserAPIService.storage.local.get('sessionToken');
  if (!sessionToken?.access) {
    throw new Error('No Google access token found. Please authenticate first.');
  }
  return sessionToken.access;
}

/**
 * 直接调用Google Sheets API
 */
async function callGoogleSheetsApi(url, options = {}) {
  const accessToken = await getGoogleAccessToken();
  
  const { search, origin, pathname } = new URL(url);
  const searchParams = new URLSearchParams(search);
  searchParams.set('access_token', accessToken);
  
  const fullUrl = `${origin}${pathname}?${searchParams.toString()}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(errorData?.error?.message || `Google API error: ${response.status}`);
  }
  
  return response.json();
}

export const googleSheetNative = {
  getUrl(path) {
    return `https://sheets.googleapis.com/v4/spreadsheets${path}`;
  },
  getValues({ spreadsheetId, range }) {
    const url = googleSheetNative.getUrl(`/${spreadsheetId}/values/${range}`);
    return callGoogleSheetsApi(url);
  },
  getRange({ spreadsheetId, range }) {
    const url = googleSheetNative.getUrl(
      `/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&includeValuesInResponse=false&insertDataOption=INSERT_ROWS`
    );

    return callGoogleSheetsApi(url, {
      method: 'POST',
    });
  },
  clearValues({ spreadsheetId, range }) {
    const url = googleSheetNative.getUrl(
      `/${spreadsheetId}/values/${range}:clear`
    );

    return callGoogleSheetsApi(url, { method: 'POST' });
  },
  updateValues({ spreadsheetId, range, options, append }) {
    let url = '';
    let method = '';

    if (append) {
      url = googleSheetNative.getUrl(
        `/${spreadsheetId}/values/${range}:append`
      );
      method = 'POST';
    } else {
      url = googleSheetNative.getUrl(`/${spreadsheetId}/values/${range}`);
      method = 'PUT';
    }

    const payload = { method };
    if (options.body) payload.body = options.body;

    return callGoogleSheetsApi(`${url}?${queryBuilder(options?.queries || {})}`, payload);
  },
  create(name) {
    const url = googleSheetNative.getUrl('');

    return callGoogleSheetsApi(url, {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          title: name,
        },
      }),
    });
  },
  addSheet({ sheetName, spreadsheetId }) {
    const url = googleSheetNative.getUrl(`/${spreadsheetId}:batchUpdate`);
    return callGoogleSheetsApi(url, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: { title: sheetName },
            },
          },
        ],
      }),
    });
  },
};

/**
 * 通过Supabase Edge Function调用Google Sheets API
 * 这个版本使用Supabase作为代理,适用于需要服务端处理的场景
 */
export const googleSheets = {
  async callEdgeFunction(method, params) {
    if (!supabaseClient.client) {
      throw new Error('Supabase not initialized');
    }
    
    const { data, error } = await supabaseClient.client.functions.invoke(
      'google-sheets-proxy',
      {
        body: { method, params },
      }
    );
    
    if (error) throw error;
    return data;
  },
  
  getUrl(spreadsheetId, range) {
    return `/services/google-sheets?spreadsheetId=${spreadsheetId}&range=${range}`;
  },
  
  async getValues({ spreadsheetId, range }) {
    // 优先使用直接调用,降级到Edge Function
    try {
      return await googleSheetNative.getValues({ spreadsheetId, range });
    } catch (error) {
      console.warn('Direct Google API call failed, trying Edge Function:', error);
      return this.callEdgeFunction('getValues', { spreadsheetId, range });
    }
  },
  
  getRange({ spreadsheetId, range }) {
    return googleSheets.updateValues({
      range,
      append: true,
      spreadsheetId,
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
      console.warn('Direct Google API call failed, trying Edge Function:', error);
      return this.callEdgeFunction('clearValues', { spreadsheetId, range });
    }
  },
  
  async updateValues({ spreadsheetId, range, options = {}, append }) {
    try {
      return await googleSheetNative.updateValues({ 
        spreadsheetId, 
        range, 
        options, 
        append 
      });
    } catch (error) {
      console.warn('Direct Google API call failed, trying Edge Function:', error);
      return this.callEdgeFunction('updateValues', { 
        spreadsheetId, 
        range, 
        options, 
        append 
      });
    }
  },
};

export default function (isDriveSheet = false) {
  return isDriveSheet ? googleSheetNative : googleSheets;
}
