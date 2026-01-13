# Walkthrough - Structured TOC Implementation

I have implemented the generic structured TOC rendering that visualizes items based on their `concept_id` hierarchy.

## Changes

### 1. New Component: `StructuredTOC.tsx`
This component is responsible for rendering the list of items with the specific hierarchy and styling requested.
- **Hierarchy Detection**: Uses `concept_id` (e.g., "1.2") to determine indentation and font size.
- **Styling**: 
    - **Header**: Major headings are larger, sub-headings are smaller.
    - **Numbering**: The `concept_id` is now visible as the numbering.
    - **Content**: Displays Label (Bold) -> Description (Italic) -> URL (Link) -> Snippet (Quote).

### 2. Integration: `TOCViewer.tsx`
Updated the viewer to automatically detect if the data follows the "concept" schema (has `concept_id`) and renders the `StructuredTOC` view instead of the raw Markdown list.

### 3. Sample Data: `Home.tsx`
Updated the default input in `Home.tsx` to use the new schema so you can verify the changes immediately upon reload.

## Verification Results

### Manual Verification
1.  **Reload the page**.
2.  The "Combined Result" (or the inputs if you copy them to the result via the combine button) should now show a hierarchical list.
3.  **Check**:
    - Items with `concept_id: "1"` should be large top-level headers.
    - Items with `concept_id: "1.1"` should be indented and slightly smaller.
    - All items should show the number (e.g., "1.1").
    - Descriptions should be italicized under the title.
    - URLs should be clickable links.
    - Evidence snippets should be in a purple/gray quote block.
