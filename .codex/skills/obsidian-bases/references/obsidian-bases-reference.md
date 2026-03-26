# Obsidian Bases Reference

## Minimal shape
```yaml
name: Vista
sources:
  - folder: "Projects"
views:
  - name: "Tabla"
    type: table
    fields:
      - name
      - status
```

## Common source types
* `folder`
* `tag`
* `note`
* `link`
* `query`

## Common view types
* `table`
* `list`
* `board`

## Practical rules
* Keep fields consistent with existing note properties.
* Limit source scope when possible.
* Avoid excessive formulas in large vaults.
