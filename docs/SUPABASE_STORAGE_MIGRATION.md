# Supabase Storage Migration Guide

This document outlines the migration from Google Drive API to Supabase Storage in the Automa project.

## Overview

The "Google Drive" block has been repurposed to interact with **Supabase Storage**. This change allows for better integration with the existing Supabase backend and provides more control over file management.

## Changes

### 1. Block: Cloud Storage (Supabase)

The block formerly known as "Google Drive" is now "Cloud Storage (Supabase)".
**Block ID:** `google-drive` (kept for backward compatibility).

**Supported Actions:**
- **Upload**: Upload files from URL, Local Computer, or Download ID.
- **Download**: Download files from Supabase Storage to the local computer.
- **Delete**: Delete files from Supabase Storage.
- **List**: List files in a folder.
- **Move**: Move files within Supabase Storage.
- **Copy**: Copy files within Supabase Storage.

### 2. Configuration

- **Bucket**: You can specify a Supabase Storage bucket. Default is `automa_files`.
- **Authentication**: Uses the existing Supabase session. No separate Google Drive connection is required.

## Data Migration

A migration tool has been added to the Settings page.

1. Go to **Settings** > **Google Drive Migration**.
2. Ensure you have a valid Google Drive session (from previous integration).
3. Enter the target Supabase Bucket (default: `automa_files`).
4. Click **Start Migration**.

The tool will:
1. List all files from your connected Google Drive.
2. Download each file.
3. Upload it to Supabase Storage under the `migration/` folder, preserving the original File ID in the filename (`migration/{id}_{name}`) to ensure traceability.

## API Usage (Internal)

The `SupabaseClient` service now includes storage methods:

```javascript
import supabaseClient from '@/services/supabase/SupabaseClient';

// Upload
await supabaseClient.uploadFile('bucket_name', 'path/to/file.png', fileBlob);

// Download
await supabaseClient.downloadFile('bucket_name', 'path/to/file.png');

// Create Signed URL (for temporary access)
const { signedUrl } = await supabaseClient.createSignedUrl('bucket_name', 'path/to/file.png', 60);
```

## Best Practices

1. **Bucket Policies (RLS)**:
   - Ensure your Supabase Storage buckets have appropriate RLS (Row Level Security) policies enabled.
   - For private user data, allow `SELECT`, `INSERT`, `UPDATE`, `DELETE` only for `auth.uid() = owner_id`.
   - The default `automa_files` bucket should be created in your Supabase project.

2. **File Organization**:
   - Use folders to organize files (e.g., `workflows/{workflow_id}/...`).
   - Avoid storing sensitive data in public buckets.

3. **Performance**:
   - For large files, the migration tool processes sequentially to avoid memory issues.
   - Use `list` with `limit` and `offset` (pagination) if you have thousands of files (currently `list` fetches default page).

## Troubleshooting

- **"Supabase not connected"**: Ensure you are logged in to the extension and Supabase URL/Key are configured.
- **"Permission denied"**: Check your Storage Bucket RLS policies in the Supabase Dashboard.
- **Migration Fails**: Check the logs in the migration tool. Network errors or large files might cause timeouts. Retry the migration (it uses `upsert`, so it's safe to retry).
