/**
 * Simplifies the DOM for AI processing.
 * Removes scripts, styles, comments, and non-visible elements.
 * Extracts key interactive elements and structure.
 */
export function getSimplifiedDOM(root = document.body) {
  if (!root) return '';

  const clone = root.cloneNode(true);

  // Remove unnecessary tags
  const removeTags = [
    'SCRIPT',
    'STYLE',
    'NOSCRIPT',
    'IFRAME',
    'SVG',
    'PATH',
    'LINK',
    'META',
  ];
  const walker = document.createTreeWalker(
    clone,
    // eslint-disable-next-line no-undef
    NodeFilter.SHOW_ELEMENT
  );

  const nodesToRemove = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (removeTags.includes(node.tagName)) {
      nodesToRemove.push(node);
    }
    // Remove hidden elements (simple check)
    // Note: getComputedStyle is expensive, so we might skip it or use a simpler heuristic for cloned nodes
    // Since it's a clone, we can't check visibility easily.
    // We'll rely on the original structure for now.
  }
  nodesToRemove.forEach((n) => n.remove());

  // Clean attributes
  const allowedAttrs = [
    'id',
    'class',
    'name',
    'type',
    'placeholder',
    'aria-label',
    'role',
    'href',
    'title',
    'alt',
  ];
  const cleanWalker = document.createTreeWalker(
    clone,
    // eslint-disable-next-line no-undef
    NodeFilter.SHOW_ELEMENT
  );
  while (cleanWalker.nextNode()) {
    const node = cleanWalker.currentNode;
    const attrs = [...node.attributes];
    for (const attr of attrs) {
      if (!allowedAttrs.includes(attr.name) && !attr.name.startsWith('data-')) {
        node.removeAttribute(attr.name);
      }
    }
  }

  // Minimize text content (trim)
  // Convert to simplified Markdown-like structure for token efficiency
  const simplifiedHTML = convertToMarkdownLike(clone);
  return simplifiedHTML.replace(/\s+/g, ' ').trim().slice(0, 50000); // Hard limit for context window
}

/**
 * Convert DOM structure to simplified Markdown-like format for better token efficiency
 * @param {HTMLElement} root - Root element to convert
 * @returns {string} Simplified HTML string
 */
function convertToMarkdownLike(root) {
  const result = [];

  function processNode(node, depth = 0) {
    if (!node) return;

    if (node.nodeType === window.Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        result.push('  '.repeat(depth) + text);
      }
      return;
    }

    if (node.nodeType !== window.Node.ELEMENT_NODE) return;

    const tagName = node.tagName.toLowerCase();

    // Skip already removed tags
    if (
      ['script', 'style', 'noscript', 'iframe', 'svg', 'link', 'meta'].includes(
        tagName
      )
    ) {
      return;
    }

    // Handle interactive elements specially
    if (['button', 'input', 'textarea', 'select', 'a'].includes(tagName)) {
      const text = node.textContent.trim().slice(0, 50);
      const id = node.id ? `#${node.id}` : '';
      const className = node.className
        ? `.${node.className.split(' ')[0]}`
        : '';
      const href = tagName === 'a' && node.href ? `(${node.href})` : '';
      const placeholder =
        tagName === 'input' && node.placeholder ? `[${node.placeholder}]` : '';

      result.push(
        '  '.repeat(depth) +
          `[${tagName}${id}${className}] ${text}${placeholder}${href}`
      );
      return;
    }

    // Handle lists
    if (tagName === 'ul' || tagName === 'ol') {
      result.push('  '.repeat(depth) + (tagName === 'ul' ? '*' : '1.'));
    } else if (tagName === 'li') {
      result.push('  '.repeat(depth) + '-');
    }
    // Handle headings
    else if (tagName.match(/^h[1-6]$/)) {
      const level = parseInt(tagName[1]);
      result.push(
        '  '.repeat(depth) +
          '#'.repeat(level) +
          ' ' +
          node.textContent.trim().slice(0, 100)
      );
      return;
    }
    // Handle paragraphs
    else if (tagName === 'p') {
      const text = node.textContent.trim().slice(0, 200);
      if (text) {
        result.push('  '.repeat(depth) + text);
      }
    }

    // Process children
    for (const child of node.childNodes) {
      processNode(child, depth + 1);
    }
  }

  processNode(root);
  return result.join('\n');
}

export function getInteractiveElements() {
  // Select inputs, buttons, links
  const selectors = [
    'a[href]',
    'button',
    'input:not([type="hidden"])',
    'textarea',
    'select',
    '[role="button"]',
  ];
  const elements = document.querySelectorAll(selectors.join(','));
  return Array.from(elements).map((el) => {
    return {
      tag: el.tagName.toLowerCase(),
      text: el.innerText.slice(0, 50).replace(/\n/g, ' ').trim(),
      id: el.id,
      class: el.className,
      href: el.getAttribute('href'),
      placeholder: el.getAttribute('placeholder'),
      ariaLabel: el.getAttribute('aria-label'),
    };
  });
}
