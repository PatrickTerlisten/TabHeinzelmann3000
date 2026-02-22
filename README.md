# Tab Heinzelmann 3000 - Edge Extension

A browser extension for Microsoft Edge that automatically groups tabs by domain, removes duplicates, and sorts everything alphabetically.

## Features

- **Important Group**: Mark entire hostnames (with subdomains) as important with a button - all tabs from that exact hostname will be in the red "Important" group at the top (e.g., mail.google.com is separate from drive.google.com)
- **Close All Except Important**: Quickly close all tabs except those marked as Important - perfect for decluttering
- **Tab Count Badge**: Extension icon displays the total number of open tabs across all windows
- **Root Domain Grouping**: Tabs are grouped by root domain (e.g., support.citrix.com and citrix.com → citrix.com group)
- **Unsorted Group**: Single tabs (domain appears only once) are collected in a special "Unsorted" group
- **Duplicate Prevention**: When a tab is opened whose URL already exists, the duplicate is automatically closed and focus switches to the existing tab — in real time, not just during reorganization
- **Smart Tab Sorting**: Domain groups are sorted alphabetically. Within each group, tabs use MRU (Most Recently Used) order — tabs you've viewed for 5+ seconds move to the top of their group
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
- **Automatic organization**: New tabs are automatically organized with a 2-second delay per window
- Single tabs (domain appears only once) are collected in the "Unsorted" group
- **Smart Single-Tab Detection**: When a tab is closed and only one tab remains in a group, it's automatically moved to "Unsorted" instantly (this still works automatically)
- **True Multi-Window Support**: Each window is organized independently. When you move a tab to a different window, only that window's organization is triggered - the tab stays in its new window permanently.
- **Collapsed state preserved**: Groups you manually collapse stay collapsed after reorganization
- **MRU (Most Recently Used) sorting**: Tabs within groups are sorted by usage, not alphabetically. When you view a tab for 5+ seconds, it automatically moves to the top of its group. This keeps frequently used tabs easily accessible.
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

Current Version: 1.3.1

**Changelog:**
- v1.3.1: Removed info section from popup for cleaner interface
- v1.3.0: **MRU (Most Recently Used) sorting within groups** - Tabs are no longer sorted by URL within groups. Instead, when a tab is active for 5+ seconds, it moves to the top of its group. Most recently used tabs appear first.
- v1.2.1: Sorting by URL instead of title - Tabs sorted by URL to prevent re-sorting when page titles change
- v1.2.0: **Export/Import feature** - Important domains can be exported/imported via text file
- v1.1.1: Fixed duplicate detection to only work within the same window (not across all windows).
- v1.1.0: **New feature: Duplicate tab prevention** - When a tab is opened whose URL already exists in another tab (same window), the duplicate is automatically closed and focus switches to the existing tab.
- v1.0.2: Fixed tab sorting trigger - `onUpdated` now correctly fires on `status === 'complete'`
- v1.0.1: Fixed collapsed groups - Groups stay collapsed after reorganization
- v1.0.0: **MAJOR FIX** - True multi-window support! Auto-organization now works per-window only.

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).

**You are free to:**
- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

**Under the following terms:**
- Attribution — You must give appropriate credit
- NonCommercial — You may not use the material for commercial purposes

For the full license text, visit: https://creativecommons.org/licenses/by-nc/4.0/legalcode
