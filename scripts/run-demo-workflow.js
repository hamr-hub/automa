
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

console.log("Starting run-demo-workflow.js v2 (Overwrite)");

const workflowFile = process.argv[2] || 'demo/Amazon Scrap.json';
const workflowPath = path.resolve(workflowFile);

console.log(`Workflow Path: ${workflowPath}`);

if (!fs.existsSync(workflowPath)) {
    console.error(`File not found: ${workflowPath}`);
    process.exit(1);
}

async function run() {
    console.log('Parsing workflow...');
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = JSON.parse(workflowContent);
    
    let drawflow = workflow.drawflow;
    if (typeof drawflow === 'string') {
        drawflow = JSON.parse(drawflow);
    }
    
    const nodes = drawflow.nodes || [];
    const edges = drawflow.edges || [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    console.log(`Loaded workflow: ${workflow.name || 'Untitled'}`);
    console.log(`Nodes: ${nodes.length}, Edges: ${edges.length}`);

    // Find trigger
    const trigger = nodes.find(n => n.label === 'trigger');
    if (!trigger) {
        console.error('No trigger node found');
        return;
    }

    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    let page = await context.newPage();

    const getNextNode = (currentId, outputHandle = 'output-1') => {
        const edge = edges.find(e => e.source === currentId && (e.sourceHandle === outputHandle || e.sourceHandle.endsWith(outputHandle)));
        if (!edge) return null;
        return nodeMap.get(edge.target);
    };

    let currentNode = getNextNode(trigger.id);

    while (currentNode) {
        console.log(`\n--- Executing [${currentNode.label}] (${currentNode.id}) ---`);
        
        // Selector patching for Amazon Demo
        if (currentNode.data && currentNode.data.selector === 'input#nav-bb-search') {
            console.log("   [Patch] Replacing outdated selector 'input#nav-bb-search' with '#twotabsearchtextbox'");
            currentNode.data.selector = '#twotabsearchtextbox';
        }
        if (currentNode.data && currentNode.data.selector === 'input.nav-bb-button') {
            console.log("   [Patch] Replacing outdated selector 'input.nav-bb-button' with '#nav-search-submit-button'");
            currentNode.data.selector = '#nav-search-submit-button';
        }

        try {
            switch (currentNode.label) {
                case 'new-window':
                case 'new-tab':
                    const url = currentNode.data.url;
                    console.log(`Navigating to: ${url}`);
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    break;

                case 'event-click':
                    console.log(`Clicking: ${currentNode.data.selector}`);
                    await page.click(currentNode.data.selector, { timeout: 5000 }).catch(e => console.warn('   -> Click failed (non-fatal):', e.message));
                    break;

                case 'forms':
                    console.log('Forms Data:', JSON.stringify(currentNode.data, null, 2));
                    
                    const processInput = async (input) => {
                         // Patch selector inside input object if needed
                         if (input.selector === 'input#nav-bb-search') input.selector = '#twotabsearchtextbox';

                         if (input.type === 'text-field' || input.type === 'password') {
                                console.log(`Filling ${input.selector} with "${input.value}"`);
                                await page.fill(input.selector, input.value || '').catch(e => console.warn('   -> Fill failed:', e.message));
                            } else if (input.type === 'checkbox') {
                                if (input.value) await page.check(input.selector).catch(e => console.warn('   -> Check failed:', e.message));
                                else await page.uncheck(input.selector).catch(e => console.warn('   -> Uncheck failed:', e.message));
                            }
                    };

                    if (Array.isArray(currentNode.data.options) && currentNode.data.options.length > 0) {
                        for (const input of currentNode.data.options) {
                            await processInput(input);
                        }
                    } else if (currentNode.data.selector && currentNode.data.type) {
                         await processInput(currentNode.data);
                    } else {
                         console.log("Unknown forms structure", currentNode.data);
                    }
                    break;

                case 'press-key':
                     console.log('PressKey Data:', JSON.stringify(currentNode.data, null, 2));
                     const keyToPress = currentNode.data.keys || currentNode.data.key || currentNode.data.keyCode || 'Enter';
                     // Handle "Enter" vs "enter" casing if needed, but Playwright is usually good
                     console.log(`Pressing key: ${keyToPress}`);
                     await page.keyboard.press(keyToPress).catch(e => console.warn('   -> Press key failed:', e.message));
                     break;

                case 'wait-connections':
                    console.log('Waiting for connections (simulating 1s delay)...');
                    await page.waitForTimeout(1000);
                    break;

                case 'conditions':
                    console.log('Evaluating conditions (Mocking true for output-1)...');
                    break;
                
                case 'delay':
                     const time = currentNode.data.time || 1000;
                     console.log(`Delaying ${time}ms`);
                     await page.waitForTimeout(time);
                     break;

                default:
                    console.log(`Skipping unknown block: ${currentNode.label}`);
            }
        } catch (error) {
            console.error(`Error in block ${currentNode.label}:`, error.message);
        }

        // Determine next node
        let outputHandle = 'output-1'; 
        
        let nextNode = getNextNode(currentNode.id, outputHandle);
        
        if (!nextNode) {
             const anyEdge = edges.find(e => e.source === currentNode.id);
             if (anyEdge) {
                 console.log(`Default path not found, taking edge: ${anyEdge.sourceHandle} -> ${anyEdge.targetHandle}`);
                 nextNode = nodeMap.get(anyEdge.target);
             }
        }

        currentNode = nextNode;
        
        if (process.memoryUsage().heapUsed > 500 * 1024 * 1024) break;
    }

    console.log('\nWorkflow execution completed.');
    await browser.close();
}

run().catch(e => console.error('Fatal error:', e));
