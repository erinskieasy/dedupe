export function jsonToMarkdown(data: any, level = 0): string {
    if (data === null || data === undefined) return '';

    const indent = '  '.repeat(level);

    // Handle primitives
    if (typeof data !== 'object') {
        return `${indent}- ${data}\n`;
    }

    // Handle Arrays
    if (Array.isArray(data)) {
        return data.map(item => jsonToMarkdown(item, level)).join('');
    }

    // Handle Objects
    let markdown = '';
    const entries = Object.entries(data);

    // Try to find a "label" for this object to make it look like a TOC item
    // Heuristic: Look for common title keys
    const titleKey = Object.keys(data).find(k => ['title', 'name', 'module', 'header', 'topic'].includes(k.toLowerCase()));
    const childrenKeys = Object.keys(data).filter(k => Array.isArray(data[k]));

    // If we found a title, print it as a list item
    if (titleKey) {
        markdown += `${indent}- **${data[titleKey]}**\n`;
        // Then recurse for children arrays (indenting further)
        childrenKeys.forEach(key => {
            // Only process array children for the clean TOC look
            markdown += jsonToMarkdown(data[key], level + 1);
        });

        // If no children arrays, maybe print other properties? 
        // For a clean TOC, we might want to skip metadata unless it's crucial.
        // Let's stick to just the structure for now.
        return markdown;
    }

    // Fallback for objects without a clear title (just dump all keys)
    entries.forEach(([key, value]) => {
        if (typeof value === 'object') {
            markdown += `${indent}- **${key}**:\n${jsonToMarkdown(value, level + 1)}`;
        } else {
            markdown += `${indent}- **${key}**: ${value}\n`;
        }
    });

    return markdown;
}
