# CanBan - Roadmap & Task List

## Version 0.2 - In Development (develop)

### Features
Planned:
- [ ] Folder/project view switcher (each folder has its own cards and calendar, switchable without exiting)
- [ ] Click day in Month view to open Day view
- [ ] Dynamic tab icon color
- [ ] Task duration (auto blocks 7h/day; queue overlaps by Kanban order)
- [ ] Customizable task form (hide unused fields)
- [ ] "Estimated time" field
- [ ] Tabular tasks view
- [ ] Drag cards in month/week/day to reschedule
- [ ] Cards as deleted - hide deleted cards from calendar views (like completed)
- [ ] Google Drive connection feature for automatic backup
- [ ] Collapsible Kanban columns (show only column name and expand button, hide cards to save space)
- [ ] Auto-save creation date when cards are created
- [ ] Auto-add completion date when cards are moved to "completed" columns; auto-remove when moved out
- [ ] Duration estimate field (optional, alongside scheduled field)
- [ ] Timer functionality with pause/stop to track time spent on tasks
- [ ] Auto-priority setting based on due date (optional setting that automatically adjusts priority based on deadline proximity; updates on reload/save/edit)

Implemented:
- [x] CSV export / import
- [x] Split / single view transitions
- [x] Auto mode switching via divider drag
- [x] Settings modal (divider limits)
- [x] JSON export / import (settings persistence)
- [x] Skeleton placeholders during drag
- [x] Markdown editor integration
- [x] Kanban compact view option
- [x] UI layout & file structure refactor
- [x] shadcn/ui components integration

### Bugs
Planned:
- [ ] Priority color should be applied to text as well, not just the icon
- [ ] Tag suggestions should appear below tag input field and update dynamically with all tags from existing saved cards; when saving a new card with tags, those tags should appear as suggestions when creating future cards

Fixed:
- [x] Quick add + button with tooltip
- [x] Modal scroll issue on small screens
- [x] 12h vs 24h time preview fix
- [x] Month view card overflow containment

### Testing
Planned:
- [ ] Massive load test (stress / performance)
