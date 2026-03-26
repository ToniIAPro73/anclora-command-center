---
name: obsidian-bases
description: Create and edit Obsidian Bases (.base files) for database-like views with views, filters, formulas, and aggregations. Use when working with .base files or creating structured data views.
---

# Obsidian Bases Skill

Obsidian Bases is a plugin that creates database-like views from your notes. It uses `.base` files to define queries, filters, and formulas.

## File Structure

A `.base` file is YAML-based and defines how to display and filter notes:

```yaml
name: My Database View
sources:
  - folder: "Projects"
  - tag: "#active"
views:
  - name: "All Projects"
    fields:
      - name
      - status
      - due
      - priority
```

## Core Components

### Sources

Define where to pull notes from:

```yaml
sources:
  # From a specific folder
  - folder: "Projects"

  # From a tag
  - tag: "#project"

  # From multiple sources
  - folder: "Work/Active"
  - tag: "#important"

  # From a specific note
  - note: "Project Overview"

  # From a link
  - link: "[[Project Overview]]"

  # From Dataview query
  - query: 'TABLE FROM "Projects"'
```

### Views

Define how to display the data:

```yaml
views:
  - name: "View Name"
    type: table  # table, list, or board
    fields:
      - name
      - status
      - priority
```

### Field Types

```yaml
fields:
  # Basic fields
  - name: title
    type: text

  - name: status
    type: select
    options: ["todo", "in-progress", "done"]

  - name: priority
    type: select
    options: ["low", "medium", "high"]

  - name: due
    type: date

  - name: completed
    type: checkbox

  - name: assignee
    type: link
    options:
      source: "People"

  - name: progress
    type: number

  - name: tags
    type: tags
```

## Filters

Filter notes based on criteria:

```yaml
views:
  - name: "Active Projects"
    filters:
      # Field equals value
      - field: status
        operator: equals
        value: "active"

      # Field contains text
      - field: name
        operator: contains
        value: "Project"

      # Date comparisons
      - field: due
        operator: before
        value: "2026-04-01"

      # Boolean checks
      - field: completed
        operator: is
        value: false

      # Number comparisons
      - field: progress
        operator: greaterThan
        value: 50

      # Tag presence
      - field: tags
        operator: includes
        value: "#urgent"

      # Empty check
      - field: assignee
        operator: isEmpty
```

### Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | status equals "done" |
| `notEquals` | Not equal | status notEquals "archived" |
| `contains` | Contains text | name contains "Project" |
| `notContains` | Does not contain | name notContains "Draft" |
| `startsWith` | Starts with | name startsWith "RFC" |
| `endsWith` | Ends with | name endsWith "v2" |
| `before` | Date before | due before "2026-04-01" |
| `after` | Date after | created after "2026-01-01" |
| `greaterThan` | Number greater | count greaterThan 5 |
| `lessThan` | Number less | progress lessThan 100 |
| `isTrue` | Boolean true | completed isTrue |
| `isFalse` | Boolean false | completed isFalse |
| `isEmpty` | No value | assignee isEmpty |
| `isNotEmpty` | Has value | assignee isNotEmpty |
| `includes` | Array contains | tags includes "#work" |

## Formulas

Computed fields using formulas:

```yaml
fields:
  - name: daysOverdue
    type: formula
    formula: "dateDiff(due, today(), 'days')"

  - name: progressPercent
    type: formula
    formula: "round(progress * 100)"

  - name: statusIcon
    type: formula
    formula: "if(status == 'done', '✅', if(status == 'in-progress', '🔄', '📋'))"

  - name: assigneeInitials
    type: formula
    formula: "substring(assignee, 0, 2)"
```

### Formula Functions

**Date Functions:**
- `today()` - Current date
- `now()` - Current datetime
- `dateDiff(date1, date2, unit)` - Difference between dates
- `dateAdd(date, amount, unit)` - Add to date
- `dateFormat(date, format)` - Format date
- `year(date)`, `month(date)`, `day(date)` - Extract parts

**String Functions:**
- `concat(str1, str2)` - Join strings
- `substring(str, start, end)` - Extract substring
- `lower(str)`, `upper(str)` - Case conversion
- `contains(str, search)` - Check if contains
- `length(str)` - String length

**Math Functions:**
- `sum(field)` - Sum values
- `avg(field)` - Average
- `min(field)`, `max(field)` - Min/Max
- `round(num)`, `floor(num)`, `ceil(num)` - Rounding
- `abs(num)` - Absolute value

**Logical Functions:**
- `if(condition, trueValue, falseValue)` - Conditional
- `and(cond1, cond2)` - Logical AND
- `or(cond1, cond2)` - Logical OR
- `not(condition)` - Logical NOT
- `isEmpty(value)` - Check if empty

**Array Functions:**
- `filter(array, condition)` - Filter items
- `map(array, expression)` - Transform items
- `sort(array, field, order)` - Sort items
- `join(array, separator)` - Join to string
- `count(array)` - Count items

## Grouping

Group notes by field values:

```yaml
views:
  - name: "By Status"
    groupBy: status

  - name: "By Priority"
    groupBy: priority
    groupOrder: ["high", "medium", "low"]

  - name: "By Month"
    groupBy: due
    groupByFunction: "dateFormat(due, 'YYYY-MM')"
```

## Sorting

Sort notes by one or more fields:

```yaml
views:
  - name: "Sorted Projects"
    sort:
      - field: priority
        order: desc
      - field: due
        order: asc
```

## Aggregations

Calculate summaries:

```yaml
views:
  - name: "Project Summary"
    aggregations:
      - name: "Total Projects"
        type: count

      - name: "Completed"
        type: count
        filter:
          field: status
          operator: equals
          value: "done"

      - name: "Average Progress"
        type: avg
        field: progress

      - name: "Total Budget"
        type: sum
        field: budget
```

## Board View

Create Kanban-style boards:

```yaml
views:
  - name: "Project Board"
    type: board
    boardField: status  # Field used for columns
    fields:
      - name
      - priority
      - assignee
    swimlanes:
      field: priority  # Optional: group by priority
      order: ["high", "medium", "low"]
```

## Complete Example

```yaml
name: Project Task Manager
description: Track all project tasks with status, priority, and due dates

sources:
  - folder: "Tasks"
  - tag: "#task"

views:
  # Table view with all tasks
  - name: "All Tasks"
    type: table
    fields:
      - name: name
      - name: status
        type: select
        options: ["Backlog", "To Do", "In Progress", "Review", "Done"]
      - name: priority
        type: select
        options: ["Low", "Medium", "High", "Critical"]
      - name: due
        type: date
      - name: assignee
        type: link
      - name: daysRemaining
        type: formula
        formula: "dateDiff(today(), due, 'days')"
    sort:
      - field: priority
        order: desc
      - field: due
        order: asc
    filters:
      - field: status
        operator: notEquals
        value: "Done"

  # Kanban board by status
  - name: "Task Board"
    type: board
    boardField: status
    fields:
      - name
      - priority
      - due
    columns:
      - "Backlog"
      - "To Do"
      - "In Progress"
      - "Review"
      - "Done"

  # Upcoming deadlines
  - name: "Due This Week"
    type: list
    fields:
      - name
      - due
      - assignee
    filters:
      - field: due
        operator: before
        value: "2026-04-02"
      - field: status
        operator: notEquals
        value: "Done"
    sort:
      - field: due
        order: asc

  # Summary statistics
  - name: "Statistics"
    type: list
    aggregations:
      - name: "Total Tasks"
        type: count
      - name: "Completed"
        type: count
        filter:
          field: status
          operator: equals
          value: "Done"
      - name: "High Priority"
        type: count
        filter:
          field: priority
          operator: equals
          value: "High"
      - name: "Overdue"
        type: count
        filter:
          field: due
          operator: before
          value: "today"
```

## Best Practices

1. **Use consistent field names** across all notes in the source
2. **Define field types explicitly** for proper sorting and filtering
3. **Use formulas sparingly** - they can impact performance on large datasets
4. **Group related views** in a single .base file for better organization
5. **Use meaningful view names** that describe what they show
6. **Set default sort order** to show most relevant items first
7. **Combine multiple filters** with AND logic for precise results
8. **Use tags as sources** for flexible categorization
9. **Link to other notes** using link-type fields for relationships
10. **Test filters** to ensure they return expected results

## Integration with Dataview

Obsidian Bases can work alongside Dataview. Use Dataview for complex queries and Bases for interactive views:

```yaml
# In a .base file
sources:
  # Use Dataview query as source
  - query: 'TABLE FROM "Projects" WHERE status = "active"'
```

## Performance Tips

1. **Limit source scope** - use specific folders or tags instead of entire vault
2. **Avoid deep nesting** - flatten data structure when possible
3. **Use indexed fields** - date and select fields are optimized
4. **Cache results** - views with many items benefit from caching
5. **Paginate results** - use limit option for large datasets