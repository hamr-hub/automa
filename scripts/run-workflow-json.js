
import fs from 'fs';
import { chromium } from '@playwright/test';
import path from 'path';

async function runWorkflow(workflowPath) {
  console.log(`Loading workflow from: ${workflowPath}`);
  const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  
  // Parse drawflow if it's a string (from Automa export format)
  let drawflow = workflow.drawflow;
  if (typeof drawflow === 'string') {
    drawflow = JSON.parse(drawflow);
  }
  
  const nodes = drawflow.nodes;
  const edges = drawflow.edges;
  
  // Create a map of nodes for easy lookup
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // Find trigger (Label 'trigger' or 'BlockBasic' with label 'trigger' inside?)
  // The generated workflow uses "label": "trigger" directly in the JSON node object (or inside data?)
  // Let's check the structure of test_ollama_workflow.json.
  // It has "label": "trigger".
  
  const trigger = nodes.find(n => n.label === 'trigger');
  if (!trigger) throw new Error("No trigger found");

  console.log(`Starting workflow: ${workflow.name}`);

  const browser = await chromium.launch({ headless: false }); // Headless false to see what happens
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    extraHTTPHeaders: {
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });
  
  const page = await context.newPage();
  
  // State for variables and loops
  const state = {
    variables: {},
    loopStack: [],
    data: [], // To store exported data
    activeLoopId: null
  };

  // Helper to get next node
  const getNextNode = (currentId, outputHandle = 'output-1') => {
    const edge = edges.find(e => e.source === currentId && e.sourceHandle.endsWith(outputHandle));
    if (!edge) return null;
    return nodeMap.get(edge.target);
  };

  let currentNode = getNextNode(trigger.id);
  
  while (currentNode) {
    console.log(`Executing [${currentNode.label}]: ${currentNode.data.description || ''}`);
    
    let nextOutput = 'output-1'; // Default output
    let shouldContinue = true;

    try {
      switch (currentNode.label) {
        case 'new-tab':
          // Override URL for testing if it's Amazon
          let url = currentNode.data.url;
          /*
          if (url.includes('amazon')) {
              console.log("   -> [TEST MODE] Redirecting to local mock_amazon.html");
              url = 'file:///' + path.resolve('mock_amazon.html').replace(/\\/g, '/');
          }
          */
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          break;
          
        case 'delay':
          await page.waitForTimeout(currentNode.data.time);
          break;
          
        case 'event-click':
          await page.click(currentNode.data.selector);
          break;
          
        case 'get-text': {
          const els = await page.$$(currentNode.data.selector);
          // If inside a loop-elements, we might be scoped (simplified here to just use page context for now, 
          // but for loop-elements we usually scope. Let's see if we can handle scoping).
          // For this simple runner, if we are "inside" a loop-elements, we really should be iterating.
          // But the JSON structure uses a flow where "loop-elements" passes one item at a time? 
          // Actually Automa's loop-elements iterates and fires the output for EACH element.
          // This runner needs to handle that "control flow".
          
          // Current simplified runner: Global extraction (not correct for loop-elements logic)
          // To properly simulate Automa's loop-elements, we need to handle the "loop" logic here.
          
          // NOTE: Implementing a full engine is hard. 
          // I will implement a "Linearized" version for specific known structure or just simple execution.
          
          // If we are in a simple flow, just extract.
          const text = els.length > 0 ? await els[0].innerText() : '';
          console.log(`   -> Extracted: ${text.substring(0, 50)}...`);
          
          // Store data
          if (!state.currentItem) state.currentItem = {};
          state.currentItem[currentNode.data.dataColumn] = text;
          break;
        }

        case 'attribute-value': {
          const el = await page.$(currentNode.data.selector);
          const attr = el ? await el.getAttribute(currentNode.data.attributeName) : '';
          console.log(`   -> Extracted Attr: ${attr.substring(0, 50)}...`);
           if (!state.currentItem) state.currentItem = {};
          state.currentItem[currentNode.data.dataColumn] = attr;
          break;
        }

        case 'while-loop':
          // Check condition
          // Simplified: Assume it's checking for "Next Button" existence as per our generation
          const condition = currentNode.data.conditions[0].conditions[0].items[0];
          if (condition.data.selector) {
             const exists = await page.$(condition.data.selector);
             console.log(`   -> Condition (Selector ${condition.data.selector} exists): ${!!exists}`);
             
             if (!exists) {
                 const title = await page.title();
                 console.log(`   -> Page Title: ${title}`);
                 await page.screenshot({ path: 'debug_amazon_jp_fail.png' });
                 console.log("   -> Screenshot saved to debug_amazon_jp_fail.png");
                 nextOutput = 'output-2'; // Exit loop
             }
          }
          break;

        case 'loop-elements':
          // Verify selectors
          const elements = await page.$$(currentNode.data.elementSelector);
          console.log(`   -> Found ${elements.length} elements matching ${currentNode.data.elementSelector}`);
          
          if (elements.length === 0) {
             console.warn("   -> No elements found! Check selector.");
             nextOutput = 'output-2';
             break;
          }
          
          // Simulation Logic:
          // We want to test the extraction logic inside the loop.
          // We will execute the 'output-1' chain ONCE, then manually skip to 'output-2'.
          
          console.log("   -> Entering loop body (Testing extraction on first element)...");
          
          // Find the start of the loop body
          let bodyNode = getNextNode(currentNode.id, 'output-1');
          
          // Execute the body chain until it ends (no more next nodes)
          while (bodyNode) {
              console.log(`      [Inside Loop] Executing [${bodyNode.label}]: ${bodyNode.data.description || ''}`);
              
              try {
                  if (bodyNode.label === 'get-text') {
                      // In real engine, this is scoped to the loop element.
                      // Here, we simulate by finding the first matching element inside the first product.
                      // This is tricky without the element handle.
                      // Let's just try to find it globally but constrained to the first product if possible?
                      // Or just check if the selector exists on the page at all.
                      
                      const selector = bodyNode.data.selector;
                      const text = await page.$eval(currentNode.data.elementSelector, (el, sel) => {
                          const child = el.querySelector(sel);
                          return child ? child.innerText : 'NOT FOUND';
                      }, selector);
                      
                      console.log(`      -> Extracted [${bodyNode.data.dataColumn}]: ${text.substring(0, 50)}...`);
                      if (!state.currentItem) state.currentItem = {};
                      state.currentItem[bodyNode.data.dataColumn] = text;
                  } else if (bodyNode.label === 'attribute-value') {
                      const selector = bodyNode.data.selector;
                      const attrName = bodyNode.data.attributeName;
                      const attr = await page.$eval(currentNode.data.elementSelector, (el, {sel, name}) => {
                          const child = el.querySelector(sel);
                          return child ? child.getAttribute(name) : 'NOT FOUND';
                      }, {sel: selector, name: attrName});
                      
                      console.log(`      -> Extracted Attr [${bodyNode.data.dataColumn}]: ${attr.substring(0, 50)}...`);
                      if (!state.currentItem) state.currentItem = {};
                      state.currentItem[bodyNode.data.dataColumn] = attr;
                  }
              } catch (e) {
                  console.log(`      -> Extraction Error: ${e.message}`);
              }
              
              // Move to next node in the chain
              bodyNode = getNextNode(bodyNode.id, 'output-1');
          }
          
          console.log("   -> Loop body test finished. Moving to loop end.");
          
          // Force move to Done (output-2) to continue the main flow
          nextOutput = 'output-2'; 
          break;

        case 'export-data':
          console.log("   -> Export Data triggered (Simulation)");
          console.log("   -> Current Data Item (Preview):", state.currentItem);
          break;
          
        default:
          console.log(`   -> Unknown block type ${currentNode.label}, skipping`);
      }
    } catch (e) {
      console.error(`   -> Error executing block: ${e.message}`);
    }

    // Move next
    currentNode = getNextNode(currentNode.id, nextOutput);
    
    // Safety break for infinite loops in this simple runner
    if (process.memoryUsage().heapUsed > 200 * 1024 * 1024) { // arbitrary
        console.log("Safety Stop");
        break;
    }
  }

  console.log("Workflow execution simulation finished.");
  await browser.close();
}

// Run it
const workflowPath = process.argv[2] || './test_ollama_workflow.json';
runWorkflow(workflowPath);
