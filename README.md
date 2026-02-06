# Tab Heinzelmann 3000 - Edge Extension

A browser extension for Microsoft Edge that automatically groups tabs by domain, removes duplicates, and sorts everything alphabetically.

## Features

- **Important Group**: Mark entire hostnames (with subdomains) as important with a button - all tabs from that exact hostname will be in the red "Important" group at the top (e.g., mail.google.com is separate from drive.google.com)
- **Close All Except Important**: Quickly close all tabs except those marked as Important - perfect for decluttering
- **Tab Count Badge**: Extension icon displays the total number of open tabs across all windows
- **Root Domain Grouping**: Tabs are grouped by root domain (e.g., support.citrix.com and citrix.com → citrix.com group)
- **Unsorted Group**: Single tabs (domain appears only once) are collected in a special "Unsorted" group
- **Remove Duplicates**: Duplicate tabs (same URL) are automatically closed
- **Alphabetical Sorting**: Groups and tabs within groups are sorted alphabetically
- **Color Coding**: Each group gets its own color for better overview
- **Automatic Organization**: New tabs are automatically organized after 2 seconds (pauses for 20 seconds when tabs are moved between windows)
- **Persistent Marks**: Important URLs remain marked even after closing and reopening
- **Optimized Performance**: Fast batch operations for smooth tab organization

## Installation

### Developer Mode (Testing)

1. Open Microsoft Edge and go to `edge://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `tab-organizer` folder
5. The extension is now installed and ready to use

### Usage

**Manual Organization:**
1. Click on the Tab Heinzelmann 3000 icon in the browser toolbar
2. Click the "Organize Now" button
3. Your tabs will be immediately organized and duplicates removed
4. **Note:** Automatic organization is disabled - you must manually click to organize tabs

**Why is automatic organization disabled?**
- Prevents tabs from being moved back when you manually arrange multiple windows
- Gives you full control over your window layout
- Single-tab cleanup still works automatically

**Mark Important URLs:**
1. **Button in Popup:**
   - Open the Tab Heinzelmann 3000 popup
   - Click "Mark Current Tab as Important"
   - The **entire hostname** (including subdomains, but not the path) is marked as Important
   - Only tabs from this exact hostname will be in the Important group
   - The tab is instantly moved to the Important group (no full reorganization)
   - The button shows whether the current hostname is already marked
   
2. **Management:**
   - In the popup you can see all Important hostnames
   - Click "Remove" to delete the hostname mark
   - All tabs from that hostname will be instantly removed from the Important group
   - Changes are applied immediately without freezing the browser

**Example:** 
- Mark `mail.google.com` as Important:
  - `mail.google.com/inbox` → Important ✅
  - `mail.google.com/sent` → Important ✅
  - `drive.google.com` → NOT Important ❌ (different subdomain)
  - `google.com` → NOT Important ❌ (different subdomain)

- Mark `github.com` as Important:
  - `github.com/project1` → Important ✅
  - `github.com/project2` → Important ✅
  - `gist.github.com` → NOT Important ❌ (different subdomain)

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

## Project Structure

```
tab-organizer/
├── manifest.json       # Extension configuration
├── popup.html          # User interface
├── popup.css           # Styling
├── popup.js            # Manual organization
├── background.js       # Automatic organization in background
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## Technical Details

- **Manifest Version**: 3
- **Permissions**: 
  - `tabs`: For reading and manipulating tabs
  - `tabGroups`: For creating and managing tab groups
  - `storage`: For storing Important URLs
- **Languages**: JavaScript, HTML, CSS

## How It Works

**Important URLs:**
1. Hostnames (full domain including subdomains, but not URL path) are marked as "Important" via button
2. Important hostnames are stored in chrome.storage.local
3. During organization all tabs from marked hostnames end up in the "Important" group
4. Persistence: Hostnames remain marked even when tabs are closed or URL paths change within the hostname

**Manual Organization (popup.js):**
1. The extension reads all open tabs in the current window
2. Tabs are grouped by their domain (hostname)
3. Important URLs are identified and separated
4. Duplicates (same URL) are identified and closed
5. Domains with multiple tabs are grouped, single tabs go to "Unsorted"
6. Domains and tabs are sorted alphabetically
7. Tabs are moved in optimized batch operations
8. Tab groups are created with domain names and colors

**Automatic Organization (background.js):**
1. Service worker listens for new or updated tabs
2. After 2 second delay (debounce) organization is started
3. Important URLs are automatically recognized and sorted into the Important group
4. All tabs are moved in parallel batch operations
5. All groups are created in parallel for maximum speed
6. Optimized to minimize browser API calls

## Notes

- URLs like `chrome://` or `edge://` cannot be grouped (browser restriction)
- **Automatic organization**: New tabs are automatically organized (pauses for 20 seconds when you manually move tabs between windows)
- Single tabs (domain appears only once) are collected in the "Unsorted" group
- **Smart Single-Tab Detection**: When a tab is closed and only one tab remains in a group, it's automatically moved to "Unsorted" instantly (this still works automatically)
- **True Multi-Window Support**: Each window is organized independently. When you move a tab to a different window, only that window's organization is triggered - the tab stays in its new window permanently.
- The extension is highly optimized for fast performance with parallel batch operations
- All move and grouping operations are executed in parallel for maximum speed
- **Important marking is instant**: Marking/unmarking tabs as Important uses a fast single-tab operation
- **Batch tab closing**: Closing tabs is done in batches of 20 with progress updates to prevent browser freezing
- Hover over the extension icon to see a larger tooltip with the exact tab count

## Customization

You can customize the extension to your preferences:

- **Change colors**: In `popup.js` and `background.js` in the `colors` array
- **Styling**: In `popup.css`
- **Sorting**: Adapt the `sort()` functions in `popup.js` and `background.js`

## Version

## Version

Current Version: 1.0.0

**Changelog:**
- v1.0.0: **MAJOR FIX** - True multi-window support! Auto-organization now works per-window only. When you move a tab to a new window, it stays there. Each window is organized independently.
- v0.3.0: MAJOR FIX for multi-window - When tabs are manually moved between windows, ALL auto-organization pauses globally for 20 seconds. This completely prevents the moved tab from being organized back.
- v0.2.4: Improved multi-window fix - now pauses auto-organization for entire windows (15 seconds) when tabs are manually moved to them
- v0.2.3: Improved multi-window support - tabs manually moved to new windows are now excluded from auto-organization for 10 seconds
- v0.2.2: Fixed bug where tabs manually moved to new windows were automatically moved back
- v0.2.1: Fixed bug where single tabs remained in domain groups instead of moving to Unsorted
- v0.2.0: Changed Important marking to use full hostname (with subdomains) instead of root domain
- v0.1.0: Initial release

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).

**You are free to:**
- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

**Under the following terms:**
- Attribution — You must give appropriate credit
- NonCommercial — You may not use the material for commercial purposes

For the full license text, visit: https://creativecommons.org/licenses/by-nc/4.0/legalcode
