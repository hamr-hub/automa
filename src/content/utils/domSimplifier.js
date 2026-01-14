
/**
 * Simplifies the DOM for AI processing.
 * Removes scripts, styles, comments, and non-visible elements.
 * Extracts key interactive elements and structure.
 */
export function getSimplifiedDOM(root = document.body) {
  if (!root) return '';

  const clone = root.cloneNode(true);
  
  // Remove unnecessary tags
  const removeTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG', 'PATH', 'LINK', 'META'];
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
  
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
  nodesToRemove.forEach(n => n.remove());

  // Clean attributes
  const allowedAttrs = ['id', 'class', 'name', 'type', 'placeholder', 'aria-label', 'role', 'href', 'title', 'alt'];
  const cleanWalker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
  
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
  // TODO: Maybe convert to Markdown-like structure for token efficiency?
  // For now, HTML structure is preserved but cleaned.
  
  return clone.innerHTML.replace(/\s+/g, ' ').trim().slice(0, 50000); // Hard limit for context window
}

export function getInteractiveElements() {
    // Select inputs, buttons, links
    const selectors = [
        'a[href]', 
        'button', 
        'input:not([type="hidden"])', 
        'textarea', 
        'select', 
        '[role="button"]'
    ];
    const elements = document.querySelectorAll(selectors.join(','));
    return Array.from(elements).map(el => {
        return {
            tag: el.tagName.toLowerCase(),
            text: el.innerText.slice(0, 50).replace(/\n/g, ' ').trim(),
            id: el.id,
            class: el.className,
            href: el.getAttribute('href'),
            placeholder: el.getAttribute('placeholder'),
            ariaLabel: el.getAttribute('aria-label')
        };
    });
}
