
/**
 * DOM Simplifier for AI Context
 * Extracts a simplified representation of the DOM to help LLMs understand the page structure.
 * This function is designed to be injected into the target page.
 */
export function getSimplifiedDOM() {
  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }

  function cleanText(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
  }

  function getSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) return `.${classes.join('.')}`;
    }
    return element.tagName.toLowerCase();
  }

  function traverse(node, depth = 0) {
    if (depth > 10) return null; // Prevent deep recursion
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    
    const element = node;
    if (!isVisible(element)) return null;

    const tagName = element.tagName.toLowerCase();
    
    // Skip irrelevant tags
    if (['script', 'style', 'svg', 'path', 'noscript', 'iframe', 'meta', 'link'].includes(tagName)) {
      return null;
    }

    // Get basic info
    const info = {
      tag: tagName,
    };

    if (element.id) info.id = element.id;
    if (element.className && typeof element.className === 'string') {
        const classes = element.className.trim();
        if (classes) info.class = classes;
    }

    // Interactive elements
    if (tagName === 'a' && element.href) info.href = element.href;
    if (tagName === 'img' && element.src) info.src = element.src;
    if (tagName === 'input') {
        info.type = element.type;
        info.placeholder = element.placeholder;
        info.name = element.name;
    }
    if (tagName === 'button') info.type = 'button';

    // Text content for leaf nodes or important text containers
    const childNodes = Array.from(element.childNodes);
    const textNodes = childNodes.filter(n => n.nodeType === Node.TEXT_NODE);
    const textContent = textNodes.map(n => cleanText(n.textContent)).join(' ');
    
    if (textContent.length > 0) {
      info.text = textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
    }

    // Recursively handle children
    const children = [];
    const elementChildren = Array.from(element.children);
    
    // Heuristic: If too many children, it might be a list. 
    // We only take the first few items of a long list to save context.
    let processedChildren = elementChildren;
    let isList = false;

    // Check if children look like a list (same tag, similar class)
    if (elementChildren.length > 5) {
        const firstTag = elementChildren[0].tagName;
        const sameTagCount = elementChildren.filter(c => c.tagName === firstTag).length;
        if (sameTagCount / elementChildren.length > 0.8) {
            isList = true;
            info.isList = true;
            info.childCount = elementChildren.length;
            // Only take first 2 and last 1 for context
            processedChildren = [
                ...elementChildren.slice(0, 2),
            ];
        }
    }

    for (const child of processedChildren) {
      const childInfo = traverse(child, depth + 1);
      if (childInfo) {
        children.push(childInfo);
      }
    }

    if (children.length > 0) {
      info.children = children;
    } else if (!info.text && !info.href && !info.src && !info.type) {
        // If empty container, ignore unless it has ID/Class which might be relevant for structure
        if (!info.id && !info.class) return null;
    }

    return info;
  }

  // Start from body
  const bodyStructure = traverse(document.body);
  return JSON.stringify(bodyStructure);
}
