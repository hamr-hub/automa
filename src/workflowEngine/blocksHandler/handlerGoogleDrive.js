import supabaseClient from '@/services/supabase/SupabaseClient';
import getFile from '@/utils/getFile';
import BrowserAPIService from '@/service/browser-api/BrowserAPIService';
import renderString from '../templating/renderString';

function getFilename(url) {
  try {
    const filename = new URL(url).pathname.split('/').pop();
    const hasExtension = /\.[0-9a-z]+$/i.test(filename);

    if (!hasExtension) return null;

    return filename;
  } catch (e) {
    return null;
  }
}

export async function googleDrive({ id, data }, { refData }) {
  const bucket = data.bucket || 'automa_files';
  const action = data.action || 'upload';

  const resultPromise = data.filePaths.map(async (item) => {
    let path = (await renderString(item.path, refData, this.engine.isPopup))
      .value;
    const name =
      (await renderString(item.name || '', refData, this.engine.isPopup))
        .value;

    if (action === 'upload') {
      if (item.type === 'downloadId') {
        const [downloadItem] = await BrowserAPIService.downloads.search({
          id: +path,
          exists: true,
          state: 'complete',
        });
        if (!downloadItem || !downloadItem.filename)
          throw new Error(`Can't find download item with "${item.path}" id`);

        path = downloadItem.filename;
      }

      const filename = name || getFilename(path) || `file_${Date.now()}`;
      const blob = await getFile(path, { returnValue: true });

      const result = await supabaseClient.uploadFile(bucket, filename, blob, {
        upsert: true,
        contentType: blob.type,
      });

      const { publicUrl } = supabaseClient.getPublicUrl(bucket, result.path);
      return { ...result, publicUrl, name: filename, mimeType: blob.type };
    } else if (action === 'download') {
      const { signedUrl } = await supabaseClient.createSignedUrl(bucket, path, 60);

      const downloadId = await BrowserAPIService.downloads.download({
        url: signedUrl,
        filename: name || path.split('/').pop(),
        saveAs: false, 
      });

      return { downloadId, path };
    } else if (action === 'delete') {
      return await supabaseClient.deleteFiles(bucket, [path]);
    } else if (action === 'list') {
      return await supabaseClient.listFiles(bucket, path);
    } else if (action === 'move') {
      return await supabaseClient.moveFile(bucket, path, name);
    } else if (action === 'copy') {
      return await supabaseClient.copyFile(bucket, path, name);
    }
  });
  
  const result = await Promise.all(resultPromise);

  return {
    data: result,
    nextBlockId: this.getBlockConnections(id),
  };
}

export default googleDrive;
