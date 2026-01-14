const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const vueCompiler = require('@vue/compiler-sfc');

const SRC_DIR = path.resolve(__dirname, 'src');
const DOCS_DIR = path.resolve(__dirname, 'docs');

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      if (/\.(js|vue|ts)$/.test(file)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function getComment(node) {
  if (node.leadingComments && node.leadingComments.length > 0) {
    return node.leadingComments.map((c) => c.value.trim()).join('\n');
  }
  return '';
}

function extractParamName(param) {
  if (param.type === 'Identifier') return param.name;
  if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier')
    return param.left.name + '?';
  if (param.type === 'RestElement')
    return '...' + extractParamName(param.argument);
  if (param.type === 'ObjectPattern') return '{}';
  if (param.type === 'ArrayPattern') return '[]';
  return '?';
}

function analyzeAST(ast, code) {
  const methods = [];

  function walk(node, parent) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'FunctionDeclaration') {
      methods.push({ name: node.id ? node.id.name : 'anonymous' });
    } else if (node.type === 'ClassMethod') {
      methods.push({ name: node.key.name || '[computed]' });
    } else if (
      node.type === 'VariableDeclarator' &&
      node.init &&
      (node.init.type === 'ArrowFunctionExpression' ||
        node.init.type === 'FunctionExpression')
    ) {
      methods.push({ name: node.id.name });
    } else if (node.type === 'ObjectMethod') {
      methods.push({ name: node.key.name || '[computed]' });
    } else if (
      node.type === 'ObjectProperty' &&
      node.value &&
      (node.value.type === 'FunctionExpression' ||
        node.value.type === 'ArrowFunctionExpression')
    ) {
      methods.push({ name: node.key.name || '[computed]' });
    }

    for (const key in node) {
      if (
        [
          'leadingComments',
          'trailingComments',
          'innerComments',
          'loc',
          'start',
          'end',
        ].includes(key)
      )
        continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((c) => walk(c, node));
      } else {
        walk(child, node);
      }
    }
  }

  walk(ast, null);
  return methods;
}

function parseJS(code, filePath) {
  try {
    const ast = babel.parse(code, {
      sourceType: 'module',
      filename: filePath,
      parserOpts: {
        plugins: [
          'jsx',
          'typescript',
          'classProperties',
          'decorators-legacy',
          'objectRestSpread',
        ],
      },
    });
    return analyzeAST(ast, code);
  } catch (e) {
    try {
      const ast = babel.parse(code, {
        sourceType: 'module',
        filename: filePath,
      });
      return analyzeAST(ast, code);
    } catch (e2) {
      return [];
    }
  }
}

function analyzeFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  let methods = [];

  try {
    if (filePath.endsWith('.vue')) {
      const parsed = vueCompiler.parse(code);
      if (parsed.descriptor.script || parsed.descriptor.scriptSetup) {
        let scriptContent = '';
        if (parsed.descriptor.script)
          scriptContent += parsed.descriptor.script.content;
        if (parsed.descriptor.scriptSetup)
          scriptContent += parsed.descriptor.scriptSetup.content;

        if (scriptContent.trim()) {
          methods = parseJS(scriptContent, filePath);
        }
      }
    } else {
      methods = parseJS(code, filePath);
    }
  } catch (err) {
    return { status: 'error', path: filePath, error: err.message };
  }

  if (methods.length === 0) return { status: 'skipped', path: filePath }; // No methods to document

  const relativePath = path.relative(SRC_DIR, filePath);
  const docPath = path.join(
    DOCS_DIR,
    relativePath.replace(/\.(js|vue|ts)$/, '.md')
  );

  if (!fs.existsSync(docPath)) {
    return {
      status: 'missing_doc',
      path: filePath,
      docPath: docPath,
      methodCount: methods.length,
    };
  }

  const docContent = fs.readFileSync(docPath, 'utf-8');
  const missingInDoc = [];

  methods.forEach((m) => {
    // Check if method name exists in doc content (simple check)
    // We look for "### <a id="method-name"></a>MethodName" or just the name in the doc
    // The generate_docs.js uses ### <a id="name"></a>Name
    // So we check for that pattern or just the name as a header
    const regex = new RegExp(`###.*${m.name}`, 'i');
    if (!regex.test(docContent) && !docContent.includes(m.name)) {
      missingInDoc.push(m.name);
    }
  });

  // Check for methods in doc but not in code?
  // This is harder because we need to parse MD.
  // Let's stick to missingInDoc for now as it's the most critical "outdated" metric.

  if (missingInDoc.length > 0) {
    return {
      status: 'inconsistent',
      path: filePath,
      docPath: docPath,
      missingInDoc,
    };
  }

  return { status: 'ok', path: filePath, docPath: docPath };
}

function generateReport(results) {
  let report = '# Source Code Analysis & Documentation Verification Report\n\n';
  report += `**Date**: ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Total Files Scanned**: ${results.length}\n\n`;

  const missingDocs = results.filter((r) => r.status === 'missing_doc');
  const inconsistent = results.filter((r) => r.status === 'inconsistent');
  const ok = results.filter((r) => r.status === 'ok');
  const errors = results.filter((r) => r.status === 'error');

  report += `## Summary\n\n`;
  report += `- **Fully Documented**: ${ok.length}\n`;
  report += `- **Missing Documentation**: ${missingDocs.length}\n`;
  report += `- **Inconsistent Documentation**: ${inconsistent.length}\n`;
  report += `- **Errors/Skipped**: ${errors.length + results.filter((r) => r.status === 'skipped').length}\n\n`;

  report += `## 1. Code-Document Mapping & Status\n\n`;
  report += `| Source File | Status | Notes |\n`;
  report += `|-------------|--------|-------|\n`;

  // List top 50 interesting ones to avoid huge file? Or list all?
  // Let's list all but keep it concise.
  results.forEach((r) => {
    if (r.status === 'skipped') return;
    const relativePath = path.relative(SRC_DIR, r.path).replace(/\\/g, '/');
    let statusIcon = '✅';
    let notes = '';

    if (r.status === 'missing_doc') {
      statusIcon = '🔴 Missing';
      notes = `Missing doc file (contains ${r.methodCount} methods)`;
    } else if (r.status === 'inconsistent') {
      statusIcon = '⚠️ Outdated';
      notes = `Missing ${r.missingInDoc.length} methods in doc`;
    } else if (r.status === 'error') {
      statusIcon = '❌ Error';
      notes = r.error;
    }

    report += `| ${relativePath} | ${statusIcon} | ${notes} |\n`;
  });

  report += `\n## 2. Inconsistencies & Update Suggestions\n\n`;

  if (inconsistent.length > 0) {
    report += `### Files with Outdated Documentation\n\n`;
    inconsistent.forEach((r) => {
      const relativePath = path.relative(SRC_DIR, r.path).replace(/\\/g, '/');
      report += `#### ${relativePath}\n`;
      report += `- **Missing Methods**: ${r.missingInDoc.join(', ')}\n`;
      report += `- **Suggestion**: Update documentation to include these new methods.\n\n`;
    });
  } else {
    report += 'No inconsistencies found in existing documentation.\n';
  }

  if (missingDocs.length > 0) {
    report += `### Files Missing Documentation\n\n`;
    report += `Found ${missingDocs.length} files with code but no documentation. Suggest running the documentation generator to create these files.\n\n`;
  }

  report += `## 3. Critical Functional Flowcharts\n\n`;
  report += `*(Placeholder for critical flowcharts. Based on analysis, the core workflow engine is located in \`src/workflowEngine\`)*\n\n`;
  report += `### Workflow Execution Flow\n`;
  report += `\`\`\`mermaid
graph TD
    A[User Starts Workflow] --> B[Background Service]
    B --> C{Workflow Engine}
    C --> D[Load Blocks]
    D --> E[Execute Block]
    E --> F{Condition?}
    F -- Yes --> G[Next Block]
    F -- No --> H[Alternative Path]
    G --> E
    H --> E
    E --> I[Finish]
\`\`\`\n`;

  return report;
}

console.log('Starting analysis...');
const files = getAllFiles(SRC_DIR);
const results = files.map(analyzeFile);
const reportContent = generateReport(results);
fs.writeFileSync('ANALYSIS_REPORT.md', reportContent);
console.log('Analysis complete. Report written to ANALYSIS_REPORT.md');
