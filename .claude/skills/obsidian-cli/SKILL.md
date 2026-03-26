---
name: obsidian-cli
description: Interact with Obsidian vaults via CLI to read, create, search notes, manage tasks, tags, properties, and develop plugins. Use when the user needs to interact with their Obsidian vault programmatically.
---

# Obsidian CLI Skill

The Obsidian CLI (v1.12.4+) allows programmatic interaction with your vault. Obsidian must be running for CLI commands to work.

## Setup

1. Update Obsidian to v1.12.4 or later
2. Enable CLI: **Settings → General → Command line interface**
3. Register CLI and add to PATH
4. Restart terminal after PATH changes

## Files

### List Files
```bash
# List all files in vault
obsidian files

# Count total files
obsidian files total

# Output as JSON
obsidian files format=json
```

### Read Notes
```bash
# Read by wikilink name (resolves automatically)
obsidian read file="Note Name"

# Read by exact path
obsidian read path="Projects/note.md"

# Read specific section
obsidian read file="Note Name" section="# Heading"

# Read frontmatter only
obsidian read file="Note Name" frontmatter=true

# Output as JSON
obsidian read file="Note Name" format=json
```

### Create Notes
```bash
# Create new note
obsidian create name="New Note Name"

# Create in folder
obsidian create name="Projects/New Project"

# Create from template
obsidian create name="Meeting Notes" template="Meeting Template"

# Create with content
obsidian create name="Quick Note" content="# Title\n\nContent here"

# Create and open
obsidian create name="New Note" open=true
```

### Append/Prepend Content
```bash
# Append to note
obsidian append file="Research" content="New paragraph"

# Prepend to note
obsidian prepend file="Journal" content="## Today\n\n"

# Append to section
obsidian append file="Projects" section="## Tasks" content="- [ ] New task"
```

### Move/Rename Notes
```bash
# Move note (updates all wikilinks automatically)
obsidian move file="Draft" to=Archive/

# Rename note
obsidian move file="Old Name" to="New Name"

# Move to folder
obsidian move file="Note" to="Folder/Subfolder/"
```

### Delete Notes
```bash
# Move to Obsidian trash (safe)
obsidian delete file="Old Note"

# Permanent delete (irreversible!)
obsidian delete file="Old Note" permanent=true
```

## Daily Notes

```bash
# Open today's daily note
obsidian daily

# Read today's content
obsidian daily:read

# Read specific date
obsidian daily:read date=2026-03-25

# Append to daily note
obsidian daily:append content="- [ ] New task"

# Prepend to daily note
obsidian daily:prepend content="## Morning\n\n"

# Get daily note path
obsidian daily:path

# Get path for specific date
obsidian daily:path date=2026-03-25
```

## Tags

```bash
# List all tags in vault
obsidian tags

# Sort by frequency
obsidian tags sort=count

# Sort alphabetically
obsidian tags sort=name

# Get notes with specific tag
obsidian tag tagname=project

# Multiple tags
obsidian tag tagname=project,active

# Rename tag (bulk update)
obsidian tags:rename old=meeting new=meetings

# Delete tag from all notes
obsidian tags:delete tagname=deprecated
```

## Properties (Frontmatter)

```bash
# Read all properties from a note
obsidian properties file="Project"

# Get specific property
obsidian property:get file="Project" name=status

# Set property value
obsidian property:set file="Draft" name=status value=active

# Set with type
obsidian property:set file="Article" name=published value=2026-03-26 type=date

obsidian property:set file="Tasks" name=completed value=true type=checkbox

obsidian property:set file="Project" name=tags value="[work, priority]" type=list

# Remove property
obsidian property:remove file="Draft" name=draft

# Add to list property
obsidian property:add file="Project" name=related value="[[Other Note]]"
```

## Tasks

```bash
# List all tasks in vault
obsidian tasks

# Tasks from daily notes
obsidian tasks daily

# Tasks with specific status
obsidian tasks status=incomplete
obsidian tasks status=completed

# Output as JSON
obsidian tasks format=json

# Create task in daily note
obsidian task:create content="Review pull request"

# Create task in specific note
obsidian task:create file="Projects" content="- [ ] New task"

# Complete a task
obsidian task:complete task=task-id

# Get task by ID
obsidian task:get task=task-id
```

## Links & Structure

```bash
# Get backlinks (notes linking TO a note)
obsidian backlinks file="Project"

# Get outgoing links (links FROM a note)
obsidian links file="Project"

# Find unresolved/broken links
obsidian unresolved

# Find orphan notes (no incoming or outgoing links)
obsidian orphans

# Output as JSON
obsidian orphans format=json
obsidian unresolved format=json
```

## Search

```bash
# Basic text search
obsidian search query="meeting notes"

# Search in specific folder
obsidian search query="project" path=Projects/

# Tag search
obsidian search query="[tag:important]"

# Property search
obsidian search query="[status:active]"

# Combined search
obsidian search query="project [tag:work]"

# Search with regex
obsidian search query="/TODO|FIXME/"

# Output as JSON
obsidian search query="meeting" format=json

# Output as paths only
obsidian search query="project" format=paths
```

## Output Formats

| Format | Flag | Use Case |
|--------|------|----------|
| JSON | `format=json` | Scripts, AI tools, jq pipelines |
| CSV | `format=csv` | Spreadsheet import |
| Markdown | `format=md` | Markdown output |
| Paths | `format=paths` | Pipe to other CLI tools |

### Examples with jq
```bash
# Count search results
obsidian search query="project" format=json | jq length

# Get file paths only
obsidian search query="TODO" format=json | jq '.[].path'

# Filter by property
obsidian files format=json | jq '.[] | select(.frontmatter.status == "active")'
```

## Developer Commands

```bash
# Evaluate JavaScript in Obsidian context
obsidian eval code="app.vault.getFiles().length"

# Get all files with metadata
obsidian eval code="app.vault.getMarkdownFiles().map(f => ({path: f.path, stat: app.vault.adapter.stat(f.path)}))"

# Open DevTools
obsidian devtools

# Take screenshot
obsidian dev:screenshot path=screenshot.png

# Reload a plugin (for development)
obsidian plugin:reload id=my-plugin

# Get plugin settings
obsidian plugin:settings id=dataview

# Update plugin settings
obsidian plugin:set id=my-plugin key=settingName value=newValue
```

## Automation Scripts

### Morning Routine
```bash
#!/bin/bash
# Create daily note with template
obsidian daily:read || obsidian create name="$(date +%Y-%m-%d)" template="Daily Template"

# Add header for today
obsidian daily:prepend content="## $(date +%A -d 'today')\n\n**Top 3 Priorities:**\n- [ ] \n- [ ] \n- [ ] \n"

# Carry over incomplete tasks from yesterday
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)
obsidian daily:read date=$YESTERDAY | grep "- \[ \]" | while read task; do
  obsidian daily:append content="$task"
done

# Open today's note
obsidian daily
```

### Weekly Review
```bash
#!/bin/bash
# Create weekly review note
WEEK=$(date +%Y-W%V)
obsidian create name="Reviews/$WEEK" template="Weekly Review"

# Gather statistics
TOTAL=$(obsidian files total)
ORPHANS=$(obsidian orphans format=json | jq length)
BROKEN=$(obsidian unresolved format=json | jq length)

# Append stats
obsidian append file="Reviews/$WEEK" content="
## Vault Stats

- Total notes: $TOTAL
- Orphan notes: $ORPHANS
- Broken links: $BROKEN
"
```

### Project Status Report
```bash
#!/bin/bash
PROJECT=$1

# Get all project notes
obsidian search query="[project:$PROJECT]" format=json | \
  jq -r '.[].path' | while read file; do
    STATUS=$(obsidian property:get file="$file" name=status)
    echo "- $file: $STATUS"
  done
```

## Best Practices

1. **Always use `file=` for wikilink resolution** - It handles path resolution automatically
2. **Use `path=` for exact paths** - When you need precise file location
3. **Prefer `format=json` for scripts** - Easier to parse with jq
4. **Never delete permanently** - Use `delete` without `permanent=true` to move to trash
5. **Move instead of rename** - `move` updates all wikilinks automatically
6. **Check if Obsidian is running** - CLI commands require Obsidian to be active
7. **Use templates for consistency** - Create notes from templates with `template=`

## Common Issues

| Issue | Solution |
|-------|----------|
| Command not found | Restart terminal after PATH setup |
| No response | Ensure Obsidian is running |
| File not found | Use `file=` for wikilink resolution |
| Permission denied | Check vault permissions |
| Slow response | Large vaults may need indexing time |

## Integration Example with Claude Code

```bash
# Claude can use these commands to interact with your vault

# Read a note and summarize
obsidian read file="Project Overview" | claude "Summarize this note"

# Create a new note from analysis
obsidian create name="Analysis" content="$(claude "Analyze this data and create a summary" < data.txt)"

# Search and process
obsidian search query="TODO" format=json | jq '.[].path' | xargs -I {} obsidian read path="{}"
```