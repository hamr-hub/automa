import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { fileSaver } from './helper';

export const files = {
  'plain-text': {
    mime: 'text/plain',
    ext: '.txt',
  },
  json: {
    mime: 'application/json',
    ext: '.json',
  },
  csv: {
    mime: 'text/csv',
    ext: '.csv',
  },
  xlsx: {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ext: '.xlsx',
  },
};

export function generateJSON(keys, data) {
  if (Array.isArray(data)) return data;

  const result = [];

  keys.forEach((key) => {
    for (let index = 0; index < data[key].length; index += 1) {
      const currData = data[key][index];

      if (typeof result[index] === 'undefined') {
        result.push({ [key]: currData });
      } else {
        result[index][key] = currData;
      }
    }
  });

  return result;
}

export default function (
  data,
  { name, type, addBOMHeader, csvOptions, returnUrl, returnBlob },
  converted
) {
  let result = data;

  if (type === 'csv' || type === 'json' || type === 'xlsx') {
    const jsonData = converted ? data : generateJSON(Object.keys(data), data);

    if (type === 'csv') {
      result = Papa.unparse(jsonData, csvOptions || {});
    } else if (type === 'json') {
      result = JSON.stringify(jsonData, null, 2);
    } else if (type === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(jsonData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      result = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    }
  } else if (type === 'plain-text') {
    const extractObj = (obj) => {
      if (typeof obj !== 'object') return [obj];

      // 需要处理深层对象 不然会返回:[object Object]
      const kes = Object.keys(obj);
      kes.forEach((key) => {
        const itemValue = obj[key];
        if (typeof itemValue === 'object') {
          obj[key] = JSON.stringify(itemValue);
        }
      });

      return Object.values(obj);
    };

    result = (
      Array.isArray(data)
        ? data.flatMap((item) => extractObj(item))
        : extractObj(data)
    ).join(' ');
  }

  const payload = [result];

  if (type === 'csv' && addBOMHeader) {
    payload.unshift(new Uint8Array([0xef, 0xbb, 0xbf]));
  }

  const { mime, ext } = files[type];
  const blob = new Blob(payload, { type: mime });
  if (returnBlob) return blob;

  const blobUrl = URL.createObjectURL(blob);

  if (!returnUrl) fileSaver(`${name || 'unnamed'}${ext}`, blobUrl);

  return blobUrl;
}
