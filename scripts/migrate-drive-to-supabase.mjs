
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

/**
 * Automa Google Drive to Supabase Storage Migration Script
 * 
 * This script transfers files from a Google Drive folder to a Supabase Storage bucket.
 * 
 * Prerequisites:
 * 1. Node.js installed
 * 2. 'googleapis' and '@supabase/supabase-js' packages installed (npm install googleapis @supabase/supabase-js)
 * 3. Google Service Account JSON key file (or OAuth credentials)
 * 4. Supabase URL and Service Role Key
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('=== Automa: Google Drive to Supabase Migration ===\n');

  try {
    // 1. Configuration
    const supabaseUrl = await question('Enter Supabase URL: ');
    const supabaseKey = await question('Enter Supabase Service Role Key: ');
    const bucketName = await question('Enter Supabase Bucket Name (default: automa_files): ') || 'automa_files';
    
    const googleKeyPath = await question('Enter path to Google Service Account JSON file: ');
    if (!fs.existsSync(googleKeyPath)) {
      throw new Error('Google Key file not found!');
    }

    // 2. Initialize Clients
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const auth = new google.auth.GoogleAuth({
      keyFile: googleKeyPath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // 3. List Files from Drive
    console.log('\nFetching files from Google Drive...');
    // You might want to filter by folder or mimeType here
    const folderId = await question('Enter Google Drive Folder ID to migrate (leave empty for root): ');
    
    let query = "trashed = false and mimeType != 'application/vnd.google-apps.folder'";
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
    });

    const files = res.data.files;
    console.log(`Found ${files.length} files.`);

    if (files.length === 0) {
      console.log('No files to migrate.');
      rl.close();
      return;
    }

    // 4. Migration Loop
    for (const file of files) {
      console.log(`Migrating: ${file.name} (${file.id})...`);
      
      try {
        // Download from Drive
        const destPath = path.join('./temp', file.name);
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

        const dest = fs.createWriteStream(destPath);
        
        const response = await drive.files.get(
            { fileId: file.id, alt: 'media' },
            { responseType: 'stream' }
        );

        await new Promise((resolve, reject) => {
            response.data
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .pipe(dest);
        });

        // Upload to Supabase
        const fileContent = fs.readFileSync(destPath);
        const { data, error } = await supabase
          .storage
          .from(bucketName)
          .upload(file.name, fileContent, {
            contentType: file.mimeType,
            upsert: true
          });

        if (error) throw error;
        
        console.log(`✅ Uploaded: ${file.name}`);
        
        // Clean up
        fs.unlinkSync(destPath);

      } catch (err) {
        console.error(`❌ Failed to migrate ${file.name}:`, err.message);
      }
    }

    console.log('\nMigration completed!');

  } catch (error) {
    console.error('\nError:', error.message);
  } finally {
    rl.close();
  }
}

main();
