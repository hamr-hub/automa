
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const vueCompiler = require('@vue/compiler-sfc');

const SRC_DIR = path.resolve(__dirname, 'src');
const DOCS_DIR = path.resolve(__dirname, 'docs');

// Ensure docs dir exists
if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR);

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
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
        return node.leadingComments.map(c => c.value.trim()).join('\n');
    }
    return '';
}

function parseJS(code, filePath) {
    try {
        const ast = babel.parse(code, {
            sourceType: 'module',
            filename: filePath,
            parserOpts: {
                plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy', 'objectRestSpread']
            }
        });
        return analyzeAST(ast, code);
    } catch (e) {
        // Try without plugins if it fails (sometimes parserOpts is ignored or structure differs)
        try {
             const ast = babel.parse(code, {
                sourceType: 'module',
                filename: filePath
            });
            return analyzeAST(ast, code);
        } catch (e2) {
            console.error(`Error parsing ${filePath}:`, e.message);
            return [];
        }
    }
}

function analyzeAST(ast, code) {
    const methods = [];

    function walk(node, parent) {
        if (!node || typeof node !== 'object') return;

        // Function Declaration: function foo() {}
        if (node.type === 'FunctionDeclaration') {
            methods.push({
                name: node.id ? node.id.name : 'anonymous',
                type: 'function',
                params: node.params ? node.params.map(extractParamName).join(', ') : '',
                async: node.async,
                comment: getComment(node) || (parent ? getComment(parent) : ''),
                start: node.start,
                end: node.end
            });
        } 
        // Class Method: class Foo { bar() {} }
        else if (node.type === 'ClassMethod') {
             methods.push({
                name: node.key.name || '[computed]',
                type: 'method',
                params: node.params ? node.params.map(extractParamName).join(', ') : '',
                async: node.async,
                comment: getComment(node),
                start: node.start,
                end: node.end
            });
        } 
        // Arrow Function / Function Expression assigned to variable: const foo = () => {}
        else if (node.type === 'VariableDeclarator' && node.init && (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')) {
             methods.push({
                name: node.id.name,
                type: node.init.type === 'ArrowFunctionExpression' ? 'arrow_function' : 'function_expression',
                params: node.init.params ? node.init.params.map(extractParamName).join(', ') : '',
                async: node.init.async,
                comment: getComment(parent) || getComment(node), // Prefer parent (const declaration) comment
                start: node.init.start,
                end: node.init.end
            });
        }
        // Object Method: { foo() {} }
        else if (node.type === 'ObjectMethod') {
             methods.push({
                name: node.key.name || '[computed]',
                type: 'object_method',
                params: node.params ? node.params.map(extractParamName).join(', ') : '',
                async: node.async,
                comment: getComment(node),
                start: node.start,
                end: node.end
            });
        }
        // Property with function: { foo: function() {} } or { foo: () => {} }
        else if (node.type === 'ObjectProperty' && node.value && (node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression')) {
             methods.push({
                name: node.key.name || '[computed]',
                type: 'object_property_method',
                params: node.value.params ? node.value.params.map(extractParamName).join(', ') : '',
                async: node.value.async,
                comment: getComment(node),
                start: node.start,
                end: node.end
            });
        }
        
        // Recurse
        for (const key in node) {
            if (key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments' || key === 'loc' || key === 'start' || key === 'end') continue;
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(c => walk(c, node));
            } else {
                walk(child, node);
            }
        }
    }

    walk(ast, null);
    return methods;
}

function extractParamName(param) {
    if (param.type === 'Identifier') return param.name;
    if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') return param.left.name + '?';
    if (param.type === 'RestElement') return '...' + extractParamName(param.argument);
    if (param.type === 'ObjectPattern') return '{}';
    if (param.type === 'ArrayPattern') return '[]';
    return '?';
}

function generateMarkdown(filePath, methods, code) {
    const relativePath = path.relative(SRC_DIR, filePath);
    const fileName = path.basename(filePath);
    
    let md = `# ${fileName}\n\n`;
    md += `**Path**: \`${relativePath.replace(/\\/g, '/')}\`\n\n`;
    
    if (methods.length === 0) {
        md += "*No methods found or parsed.*\n";
        return md;
    }

    md += `## Methods Summary\n\n`;
    md += `| Name | Type | Async | Params |\n`;
    md += `|------|------|-------|--------|\n`;
    methods.forEach(m => {
        md += `| [${m.name}](#${m.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}) | ${m.type} | ${m.async ? '✅' : '❌'} | \`${m.params}\` |\n`;
    });
    md += `\n## Detailed Description\n\n`;

    methods.forEach(m => {
        const anchor = m.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        md += `### <a id="${anchor}"></a>${m.name}\n\n`;
        md += `- **Type**: \`${m.type}\`\n`;
        md += `- **Parameters**: \`${m.params}\`\n`;
        
        if (m.comment) {
            const cleanComment = m.comment.split('\n')
                .map(l => l.replace(/^\s*\*+/, '').trim())
                .filter(l => l)
                .join('\n\n');
            md += `- **Description**:\n\n${cleanComment}\n`;
        } else {
             md += `- **Description**: *No description provided.*\n`;
        }
        
        // Code snippet
        if (typeof m.start === 'number' && typeof m.end === 'number') {
            const snippet = code.substring(m.start, m.end);
            const lines = snippet.split('\n');
            const preview = lines.slice(0, 15).join('\n') + (lines.length > 15 ? '\n// ...' : '');
            
            md += `\n**Implementation**:\n\`\`\`javascript\n${preview}\n\`\`\`\n\n`;
        }
        md += `---\n\n`;
    });

    return md;
}

// Main execution
console.log("Starting analysis...");
const files = getAllFiles(SRC_DIR);
console.log(`Found ${files.length} files.`);

let indexContent = "# API Documentation Index\n\n";
let processedCount = 0;

files.forEach(filePath => {
    // console.log(`Processing ${filePath}...`);
    let code = fs.readFileSync(filePath, 'utf-8');
    let methods = [];

    try {
        if (filePath.endsWith('.vue')) {
            const parsed = vueCompiler.parse(code);
            if (parsed.descriptor.script || parsed.descriptor.scriptSetup) {
                // Combine script and scriptSetup if both exist (rare but possible in Vue 3)
                // Actually usually it's one or the other.
                let scriptContent = '';
                if (parsed.descriptor.script) scriptContent += parsed.descriptor.script.content;
                if (parsed.descriptor.scriptSetup) scriptContent += parsed.descriptor.scriptSetup.content;
                
                if (scriptContent.trim()) {
                    methods = parseJS(scriptContent, filePath);
                    code = scriptContent; 
                }
            }
        } else {
            methods = parseJS(code, filePath);
        }

        if (methods.length > 0) {
            const mdContent = generateMarkdown(filePath, methods, code);
            const relativePath = path.relative(SRC_DIR, filePath);
            const docPath = path.join(DOCS_DIR, relativePath.replace(/\.(js|vue|ts)$/, '.md'));
            
            // Ensure subdir exists
            const docDir = path.dirname(docPath);
            if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
            
            fs.writeFileSync(docPath, mdContent);
            
            // Add to index
            const docRelPath = path.relative(DOCS_DIR, docPath).replace(/\\/g, '/');
            indexContent += `- [${relativePath.replace(/\\/g, '/')}](${docRelPath})\n`;
            processedCount++;
        }
    } catch (err) {
        console.error(`Failed to process ${filePath}:`, err.message);
    }
});

fs.writeFileSync(path.join(DOCS_DIR, 'API_INDEX.md'), indexContent);
console.log(`Documentation generation complete. Processed ${processedCount} files with methods.`);
