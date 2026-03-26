# JSON Canvas Reference

## Top-level structure
```json
{
  "nodes": [],
  "edges": []
}
```

## Node types
* `text`
* `file`
* `link`
* `group`

## Edge essentials
```json
{
  "id": "edge-id",
  "fromNode": "node-a",
  "toNode": "node-b"
}
```

## Practical rules
* Use stable unique ids.
* Keep spacing readable.
* Use `file` nodes for vault notes when possible.
* Add labeled edges when relationships are not obvious.
