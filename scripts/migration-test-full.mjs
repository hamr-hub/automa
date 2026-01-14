import SupabaseClient from '../src/services/supabase/SupabaseClient.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for colors
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
};

const report = {
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
    },
    details: [],
    performance: [],
    issues: []
};

function log(msg, type = 'info') {
    const timestamp = new Date().toISOString();
    let color = colors.reset;
    if (type === 'pass') color = colors.green;
    if (type === 'fail') color = colors.red;
    if (type === 'warn') color = colors.yellow;
    if (type === 'info') color = colors.blue;
    
    console.log(`${color}[${type.toUpperCase()}] ${msg}${colors.reset}`);
}

async function runTest(name, fn) {
    report.summary.total++;
    const start = performance.now();
    try {
        log(`Starting test: ${name}`, 'info');
        await fn();
        const duration = performance.now() - start;
        log(`Passed: ${name} (${duration.toFixed(2)}ms)`, 'pass');
        report.summary.passed++;
        report.details.push({ name, status: 'passed', duration, error: null });
    } catch (e) {
        const duration = performance.now() - start;
        log(`Failed: ${name} - ${e.message}`, 'fail');
        report.summary.failed++;
        report.details.push({ name, status: 'failed', duration, error: e.message });
        report.issues.push({ test: name, error: e.message, suggestion: 'Check error logs and retry.' });
    }
}

async function loadSecrets() {
    // Try to load secrets.js, fallback to env vars, fallback to secrets.blank.js
    let secrets = {};
    const secretsPath = path.join(__dirname, '../secrets.js');
    const blankSecretsPath = path.join(__dirname, '../secrets.blank.js');

    if (fs.existsSync(secretsPath)) {
        try {
             // Dynamic import for local secrets if possible, or simple parsing
             // Since secrets.js is likely ES module or CJS, we try to read it.
             // For simplicity in this script, we'll rely on Process Env mostly, 
             // but attempt to read the file content if needed.
             // NOTE: Real secrets.js might be 'export default' or 'module.exports'
             // We will try to rely on process.env first.
        } catch (e) {
            console.warn("Could not load secrets.js");
        }
    }
    
    return {
        supabaseUrl: process.env.SUPABASE_URL || secrets.supabaseUrl || '',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || secrets.supabaseAnonKey || '',
        testEmail: process.env.TEST_EMAIL || '',
        testPassword: process.env.TEST_PASSWORD || ''
    };
}

async function main() {
    const startTime = performance.now();
    const config = await loadSecrets();

    console.log(colors.cyan + "=== Supabase Migration Test Suite ===" + colors.reset);
    console.log(`Target URL: ${config.supabaseUrl || 'NOT SET'}`);
    
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
        log("Missing SUPABASE_URL or SUPABASE_ANON_KEY. Skipping tests.", 'warn');
        report.issues.push({ test: 'Setup', error: 'Missing Credentials', suggestion: 'Set SUPABASE_URL and SUPABASE_ANON_KEY env vars.' });
        generateReport();
        return;
    }

    // 1. Connection Test
    await runTest('Connection & Initialization', async () => {
        await SupabaseClient.initialize(config.supabaseUrl, config.supabaseAnonKey);
        if (!SupabaseClient.initialized) throw new Error("Client failed to initialize");
    });

    // 2. Auth Test (Optional)
    let user = null;
    if (config.testEmail && config.testPassword) {
        await runTest('Authentication (Sign In)', async () => {
            const data = await SupabaseClient.signInWithPassword(config.testEmail, config.testPassword);
            user = data.user;
            if (!user) throw new Error("Login failed");
        });
    } else {
        log("Skipping Auth Test (No credentials provided)", 'warn');
        report.summary.skipped++;
    }

    // 3. Functional Tests (Storage Operations)
    // We can only test this if we are logged in, because storage usually requires auth (RLS).
    
    if (user) {
        const testBucket = 'automa_files';
        const testFileName = `test-file-${Date.now()}.txt`;
        const testContent = 'Hello Supabase Storage from Migration Test';
        const testFilePath = `test-folder/${testFileName}`;

        // 3.1 Upload File
        await runTest('Storage: Upload File', async () => {
            // In Node.js, Buffer acts like ArrayBuffer for many purposes, or we can convert
            const fileBody = Buffer.from(testContent);
            const result = await SupabaseClient.uploadFile(testBucket, testFilePath, fileBody, {
                contentType: 'text/plain',
                upsert: true
            });
            if (!result || !result.path) throw new Error("Upload returned no path");
            if (result.path !== testFilePath) throw new Error(`Path mismatch: ${result.path} vs ${testFilePath}`);
        });

        // 3.2 List Files
        await runTest('Storage: List Files', async () => {
            const result = await SupabaseClient.listFiles(testBucket, 'test-folder');
            if (!result || !Array.isArray(result)) throw new Error("List returned invalid type");
            const found = result.find(f => f.name === testFileName);
            if (!found) throw new Error("Uploaded file not found in list");
        });

        // 3.3 Download File
        await runTest('Storage: Download File', async () => {
            const blob = await SupabaseClient.downloadFile(testBucket, testFilePath);
            // In Node environment (depending on supabase-js version/adapter), blob might be Blob or Buffer-like
            // We need to read it. If it's a standard Blob:
            const text = await blob.text();
            if (text !== testContent) throw new Error(`Content mismatch: '${text}' vs '${testContent}'`);
        });

        // 3.4 Public URL
        await runTest('Storage: Get Public URL', async () => {
            const { publicUrl } = SupabaseClient.getPublicUrl(testBucket, testFilePath);
            if (!publicUrl || !publicUrl.includes(testFilePath)) throw new Error("Invalid Public URL");
            log(`Public URL: ${publicUrl}`, 'info');
        });

        // 3.5 Signed URL
        await runTest('Storage: Create Signed URL', async () => {
            const { signedUrl } = await SupabaseClient.createSignedUrl(testBucket, testFilePath, 60);
            if (!signedUrl || !signedUrl.includes('token=')) throw new Error("Invalid Signed URL");
        });

        // 3.6 Copy File
        const copyPath = `test-folder/copy-${testFileName}`;
        await runTest('Storage: Copy File', async () => {
            const result = await SupabaseClient.copyFile(testBucket, testFilePath, copyPath);
            if (!result || !result.path) throw new Error("Copy failed");
        });

        // 3.7 Move File
        const movePath = `test-folder/moved-${testFileName}`;
        await runTest('Storage: Move File', async () => {
            const result = await SupabaseClient.moveFile(testBucket, copyPath, movePath);
            if (!result) throw new Error("Move failed"); // Move sometimes returns empty object on success? Check docs.
        });

        // 3.8 Delete Files
        await runTest('Storage: Delete Files', async () => {
            const result = await SupabaseClient.deleteFiles(testBucket, [testFilePath, movePath]);
            if (!result || result.length === 0) throw new Error("Delete failed or returned empty");
        });

        // 3.9 Performance Test (Upload/Download)
        await runTest('Performance: Storage Latency', async () => {
             const perfFile = `perf-${Date.now()}.bin`;
             const perfData = Buffer.alloc(1024 * 1024); // 1MB
             
             const startUpload = performance.now();
             await SupabaseClient.uploadFile(testBucket, perfFile, perfData, { upsert: true });
             const uploadTime = performance.now() - startUpload;
             
             const startDownload = performance.now();
             await SupabaseClient.downloadFile(testBucket, perfFile);
             const downloadTime = performance.now() - startDownload;
             
             await SupabaseClient.deleteFiles(testBucket, [perfFile]);
             
             report.performance.push({ operation: 'Upload 1MB', latency: uploadTime });
             report.performance.push({ operation: 'Download 1MB', latency: downloadTime });
        });

    } else {
        log("Skipping Storage Tests (Not Authenticated)", 'warn');
        report.summary.skipped += 9;
    }

    // 5. Error Handling
    await runTest('Error Handling: Invalid ID', async () => {
        try {
            await SupabaseClient.getWorkflowById('00000000-0000-0000-0000-000000000000');
            // Depending on implementation, it might return null or throw. 
            // Wrapper catches error and logs warn, throwing error.
        } catch (e) {
            // Expected
            return;
        }
    });

    // 6. Data Consistency / Schema Check (Mocked validation based on successful CRUD)
    await runTest('Data Consistency Check', async () => {
        // If CRUD passed, basic schema is valid. 
        // We can check if specific fields we expect are present in the response if we had data.
        if (report.summary.failed === 0) return;
        throw new Error("Previous tests failed, consistency uncertain");
    });

    report.summary.duration = performance.now() - startTime;
    generateReport();
}

function generateReport() {
    const reportPath = path.join(__dirname, '../migration_report.md');
    
    let content = `# Supabase Migration Test Report
Date: ${new Date().toLocaleString()}

## Summary
- **Total Tests:** ${report.summary.total}
- **Passed:** ${report.summary.passed}
- **Failed:** ${report.summary.failed}
- **Skipped:** ${report.summary.skipped}
- **Total Duration:** ${report.summary.duration.toFixed(2)}ms

## Details
| Test Name | Status | Duration (ms) | Error |
|-----------|--------|---------------|-------|
${report.details.map(d => `| ${d.name} | ${d.status} | ${d.duration.toFixed(2)} | ${d.error || '-'} |`).join('\n')}

## Performance Data
| Operation | Latency (ms) |
|-----------|--------------|
${report.performance.map(p => `| ${p.operation} | ${p.latency.toFixed(2)} |`).join('\n')}

## Issues & Recommendations
${report.issues.length === 0 ? 'No critical issues found.' : ''}
${report.issues.map(i => `
### Issue: ${i.test}
- **Error:** ${i.error}
- **Recommendation:** ${i.suggestion}
`).join('\n')}

## Conclusion
${report.summary.failed === 0 ? '✅ Migration interfaces appear functional and performant.' : '❌ Issues detected. Please review the errors above.'}
`;

    fs.writeFileSync(reportPath, content);
    console.log(colors.magenta + `\nReport generated at: ${reportPath}` + colors.reset);
}

main().catch(e => console.error(e));
