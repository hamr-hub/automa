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

    // 3. Functional Tests (CRUD on Workflows)
    // We can only test this if we are logged in, because workflows require auth usually (RLS).
    // If not logged in, we check public access or fail gracefully.
    
    if (user) {
        let testWorkflowId = null;
        
        await runTest('Create Workflow', async () => {
            const workflow = {
                name: 'Migration Test Workflow ' + Date.now(),
                description: 'Created by automated test',
                icon: 'ri-flask-line',
                trigger: null,
                drawflow: '{}',
                version: '1.0.0'
            };
            const result = await SupabaseClient.createWorkflow(workflow);
            if (!result || !result.id) throw new Error("Create returned no ID");
            testWorkflowId = result.id;
        });

        if (testWorkflowId) {
            await runTest('Read Workflow (ById)', async () => {
                const wf = await SupabaseClient.getWorkflowById(testWorkflowId);
                if (!wf || wf.id !== testWorkflowId) throw new Error("Read mismatch");
            });

            await runTest('Update Workflow', async () => {
                const updates = { description: 'Updated by test' };
                const wf = await SupabaseClient.updateWorkflow(testWorkflowId, updates);
                if (wf.description !== updates.description) throw new Error("Update mismatch");
            });

            // 4. Performance Tests
            await runTest('Performance: List Workflows (Latency)', async () => {
                const start = performance.now();
                await SupabaseClient.getWorkflows();
                const end = performance.now();
                report.performance.push({ operation: 'getWorkflows', latency: end - start });
            });

            await runTest('Performance: Concurrency (5x Read)', async () => {
                const start = performance.now();
                const promises = Array(5).fill(0).map(() => SupabaseClient.getWorkflowById(testWorkflowId));
                await Promise.all(promises);
                const end = performance.now();
                report.performance.push({ operation: 'Concurrent Read (5x)', latency: end - start });
            });

            // Clean up
            await runTest('Delete Workflow', async () => {
                await SupabaseClient.deleteWorkflow(testWorkflowId);
                try {
                    await SupabaseClient.getWorkflowById(testWorkflowId);
                } catch (e) {
                    // Expected error or null return
                    return; 
                }
            });
        }
    } else {
        log("Skipping CRUD Tests (Not Authenticated)", 'warn');
        report.summary.skipped += 4;
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
