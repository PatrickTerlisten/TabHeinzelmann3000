# Tab Heinzelmann 3000 - Edge Extension

A browser extension for Microsoft Edge that automatically groups tabs by domain, removes duplicates, and sorts everything alphabetically.

## Features

- **Important Group**: Mark important tabs with a button - they will be automatically sorted into a red "Important" group at the top
- **Close All Except Important**: Quickly close all tabs except those marked as Important - perfect for decluttering
- **Tab Count Badge**: Extension icon displays the total number of open tabs across all windows
- **Root Domain Grouping**: Tabs are grouped by root domain (e.g., support.citrix.com and citrix.com → citrix.com group)
- **Unsorted Group**: Single tabs (domain appears only once) are collected in a special "Unsorted" group
- **Remove Duplicates**: Duplicate tabs (same URL) are automatically closed
- **Alphabetical Sorting**: Groups and tabs within groups are sorted alphabetically
- **Color Coding**: Each group gets its own color for better overview
- **Automatic Organization**: New tabs are automatically sorted (about 2 seconds after opening)
- **Persistent Marks**: Important URLs remain marked even after closing and reopening
- **Optimized Performance**: Fast batch operations for smooth tab organization

### Usage

**Manual Organization:**
1. Click on the Tab Heinzelmann 3000 icon in the browser toolbar
2. Click the "Organize Now" button
3. Your tabs will be immediately organized and duplicates removed

**Mark Important URLs:**
1. **Button in Popup:**
   - Open the Tab Heinzelmann 3000 popup
   - Click "Mark Current Tab as Important"
   - The tab is instantly moved to the Important group (no full reorganization)
   - The button shows whether the tab is already marked
   
2. **Management:**
   - In the popup you can see all Important URLs
   - Click "Remove" to delete the mark
   - The tab will be instantly removed from the Important group
   - Changes are applied immediately without freezing the browser

**Close All Except Important:**
1. Click the "Close All Except Important" button in the popup
2. Confirm the action (cannot be undone)
3. All tabs except those marked as Important will be closed in batches
4. Progress is shown (e.g., "Closing tabs... 40/120")
5. Optimized batch processing prevents browser freezing even with hundreds of tabs
6. Perfect for quickly decluttering your browser when you have too many tabs open
7. The tab count badge will update automatically

**Tab Count Badge:**
- The extension icon shows a bright red badge with the total number of open tabs
- Red color provides maximum contrast and visibility
- **Hover over the icon** to see a larger tooltip showing the exact tab count
- Updates automatically when tabs are opened or closed
- Counts tabs across all windows
- Helps you keep track of how many tabs you have open
- Note: Badge size is determined by the browser and cannot be changed

**Automatic Organization:**
- The extension organizes new tabs automatically in the background
- About 2 seconds after opening a new tab it will be sorted (optimized debounce)
- Important URLs are automatically recognized and sorted into the Important group
- No user interaction required
- Optimized with parallel batch operations for maximum speed

**Grouping:**
- Important group (red) appears at the very top
- Domains with multiple tabs are grouped together
- Single tabs end up in the "Unsorted" group (grey)
- All groups and tabs are sorted alphabetically

**Examples of Root Domain Grouping:**
- `google.com`, `mail.google.com`, `drive.google.com` → Group "google.com"
- `support.citrix.com`, `citrix.com`, `www.citrix.com` → Group "citrix.com"
- `github.com`, `gist.github.com` → Group "github.com"
- Also works with country-specific TLDs: `example.co.uk`, `www.example.co.uk` → Group "example.co.uk"

## Version

Current Version: 0.1.0

## License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
