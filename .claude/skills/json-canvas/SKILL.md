---
name: json-canvas
description: Create and edit JSON Canvas files (.canvas) for infinite canvas visualizations with nodes, edges, and groups. Use when creating or modifying .canvas files.
---

# JSON Canvas Skill

JSON Canvas is an open file format for infinite canvas data, originally created for Obsidian. Files use the `.canvas` extension.

## Top-Level Structure

A JSON Canvas file contains two optional arrays:

```json
{
  "nodes": [],
  "edges": []
}
```

## Nodes

Nodes are objects placed on the canvas. There are four types:

### Text Nodes
Store Markdown content:

```json
{
  "id": "unique-id-string",
  "type": "text",
  "x": 0,
  "y": 0,
  "width": 400,
  "height": 300,
  "color": "1",
  "text": "# Heading\n\nThis is **Markdown** content."
}
```

### File Nodes
Reference files in the vault:

```json
{
  "id": "unique-id-string",
  "type": "file",
  "x": 500,
  "y": 0,
  "width": 400,
  "height": 300,
  "file": "path/to/note.md",
  "subpath": "#heading",
  "color": "2"
}
```

### Link Nodes
Reference external URLs:

```json
{
  "id": "unique-id-string",
  "type": "link",
  "x": 1000,
  "y": 0,
  "width": 400,
  "height": 300,
  "url": "https://example.com",
  "color": "3"
}
```

### Group Nodes
Visual containers for other nodes:

```json
{
  "id": "unique-id-string",
  "type": "group",
  "x": -50,
  "y": -50,
  "width": 500,
  "height": 400,
  "label": "Group Label",
  "color": "4",
  "background": "path/to/image.png",
  "backgroundStyle": "cover"
}
```

## Node Attributes

### Required Attributes (All Nodes)
| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique identifier (typically 16-char hex) |
| `type` | string | Node type: `text`, `file`, `link`, or `group` |
| `x` | integer | X position in pixels |
| `y` | integer | Y position in pixels |
| `width` | integer | Width in pixels |
| `height` | integer | Height in pixels |

### Optional Attributes (All Nodes)
| Attribute | Type | Description |
|-----------|------|-------------|
| `color` | string | Color: `"1"`-`"6"` (presets) or `"#RRGGBB"` |

### Color Presets
| Value | Color |
|-------|-------|
| `"1"` | Red |
| `"2"` | Orange |
| `"3"` | Yellow |
| `"4"` | Green |
| `"5"` | Cyan |
| `"6"` | Purple |

### Type-Specific Attributes
| Attribute | Node Type | Description |
|-----------|-----------|-------------|
| `text` | text | Markdown content (required for text nodes) |
| `file` | file | Path to file (required for file nodes) |
| `subpath` | file | Heading anchor: `#heading` or `#^block-id` |
| `url` | link | URL string (required for link nodes) |
| `label` | group | Group title |
| `background` | group | Background image path |
| `backgroundStyle` | group | `cover`, `ratio`, or `repeat` |

## Edges

Edges connect nodes with lines:

```json
{
  "id": "edge-id",
  "fromNode": "source-node-id",
  "fromSide": "right",
  "fromEnd": "none",
  "toNode": "target-node-id",
  "toSide": "left",
  "toEnd": "arrow",
  "color": "1",
  "label": "Edge Label"
}
```

### Edge Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `fromNode` | string | Yes | Source node ID |
| `toNode` | string | Yes | Target node ID |
| `fromSide` | string | No | `top`, `right`, `bottom`, `left` |
| `toSide` | string | No | `top`, `right`, `bottom`, `left` |
| `fromEnd` | string | No | `none` or `arrow` (default: `none`) |
| `toEnd` | string | No | `none` or `arrow` (default: `arrow`) |
| `color` | string | No | Color preset or hex |
| `label` | string | No | Text label on edge |

## ID Generation

Node and edge IDs should be unique strings. Common patterns:

```javascript
// 16-character hex string (used by Obsidian)
function generateId() {
  return Math.random().toString(16).slice(2, 18);
}

// Or use timestamp + random
function generateId() {
  return Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
}
```

## Complete Example

```json
{
  "nodes": [
    {
      "id": "a1b2c3d4e5f67890",
      "type": "text",
      "x": 0,
      "y": 0,
      "width": 400,
      "height": 200,
      "text": "# Project Ideas\n\nBrainstorming session notes."
    },
    {
      "id": "b2c3d4e5f6789012",
      "type": "file",
      "x": 500,
      "y": 0,
      "width": 400,
      "height": 300,
      "file": "Project Overview.md"
    },
    {
      "id": "c3d4e5f678901234",
      "type": "link",
      "x": 250,
      "y": 400,
      "width": 400,
      "height": 200,
      "url": "https://obsidian.md",
      "color": "5"
    },
    {
      "id": "d4e5f67890123456",
      "type": "group",
      "x": -50,
      "y": -50,
      "width": 500,
      "height": 300,
      "label": "Main Ideas",
      "color": "4"
    }
  ],
  "edges": [
    {
      "id": "edge-001",
      "fromNode": "a1b2c3d4e5f67890",
      "fromSide": "right",
      "toNode": "b2c3d4e5f6789012",
      "toSide": "left",
      "toEnd": "arrow",
      "label": "references"
    },
    {
      "id": "edge-002",
      "fromNode": "a1b2c3d4e5f67890",
      "fromSide": "bottom",
      "toNode": "c3d4e5f678901234",
      "toSide": "top",
      "toEnd": "arrow",
      "color": "1"
    }
  ]
}
```

## Best Practices

1. **Positioning**: Leave enough space between nodes for readability (at least 50px)
2. **Group sizing**: Make groups large enough to contain all intended nodes with padding
3. **Consistent IDs**: Use lowercase hex strings for consistency with Obsidian
4. **Edge routing**: Specify `fromSide` and `toSide` to control edge routing
5. **Colors**: Use color consistently - e.g., red for critical items, green for completed
6. **Labels**: Add edge labels to clarify relationships
7. **File paths**: Use relative paths from vault root for file nodes
8. **Subpaths**: Link to specific sections with `#heading` or blocks with `#^block-id`

## Layout Patterns

### Linear Flow
```
[Node 1] → [Node 2] → [Node 3]
```
Position nodes horizontally with 100-200px spacing.

### Hierarchical Tree
```
      [Root]
      ↓
[Branch A]  [Branch B]
    ↓            ↓
[Leaf A1]   [Leaf B1]
```
Position vertically with horizontal branches.

### Mind Map
Central node in center (0, 0), branches radiating outward in all directions.

### Grid Layout
Organize nodes in a grid with consistent spacing:
```
[Node 1,1] [Node 1,2] [Node 1,3]
[Node 2,1] [Node 2,2] [Node 2,3]
```