# Obsidian CLI Reference

## Useful commands
```bash
obsidian files
obsidian read file="Note Name"
obsidian create name="Folder/New Note"
obsidian append file="Note" section="## Tasks" content="- [ ] Nueva tarea"
obsidian move file="Old Name" to="New Name"
obsidian unresolved
obsidian orphans
```

## Safety rules
* Obsidian must be running.
* Prefer `file=` when wikilink resolution helps.
* Prefer `format=json` for automation.
* Prefer `move` over manual rename when link updates matter.
* Avoid permanent delete unless explicitly requested.
