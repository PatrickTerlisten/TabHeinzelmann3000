// Automatic tab organization on creation or update
let organizingInProgress = false;
let organizationTimeout = null;

// Update badge with tab count
async function updateBadge() {
  try {
    const tabs = await chrome.tabs.query({});
    const tabCount = tabs.length;
    
    await chrome.action.setBadgeText({ text: tabCount.toString() });
    // Use bright red for maximum contrast and visibility
    await chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    // Set tooltip to show tab count in large text on hover
    await chrome.action.setTitle({ title: `Tab Heinzelmann 3000\n\n📊 ${tabCount} tabs open` });
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Initialize badge on startup
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});

// Initialize badge when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});

// Update badge when tabs are created
chrome.tabs.onCreated.addListener(() => {
  updateBadge();
});

// Update badge when tabs are removed
chrome.tabs.onRemoved.addListener(() => {
  updateBadge();
});

// Update badge when tabs are attached (moved between windows)
chrome.tabs.onAttached.addListener(() => {
  updateBadge();
});

// Update badge when tabs are detached (moved between windows)
chrome.tabs.onDetached.addListener(() => {
  updateBadge();
});

// Message Listener for manual organization from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'organize') {
    scheduleOrganization();
  } else if (message.action === 'moveToImportant') {
    // Quick move without full reorganization
    moveTabToImportant(message.tabId);
  } else if (message.action === 'removeFromImportant') {
    // Quick move without full reorganization
    removeTabFromImportant(message.tabId);
  }
});

// Quick move tab to Important group without full reorganization
async function moveTabToImportant(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    
    // Find or create Important group
    const groups = await chrome.tabGroups.query({ windowId: tab.windowId });
    let importantGroup = groups.find(g => g.title === 'Important');
    
    // If tab is already in Important group, do nothing
    if (importantGroup && tab.groupId === importantGroup.id) {
      console.log('Tab is already in Important group');
      return;
    }
    
    if (!importantGroup) {
      // Create Important group at position 0
      const groupId = await chrome.tabs.group({ tabIds: [tabId] });
      await chrome.tabGroups.update(groupId, {
        title: 'Important',
        color: 'red',
        collapsed: false
      });
      // Move to position 0
      await chrome.tabs.move(tabId, { index: 0 });
    } else {
      // Ungroup first if already in a different group
      if (tab.groupId !== -1) {
        await chrome.tabs.ungroup([tabId]);
      }
      
      // Get all tabs in Important group
      const importantTabs = await chrome.tabs.query({ groupId: importantGroup.id });
      
      // Find the last index of the Important group
      const lastImportantIndex = importantTabs.length > 0 
        ? Math.max(...importantTabs.map(t => t.index))
        : 0;
      
      // Move tab to end of Important group
      await chrome.tabs.move(tabId, { index: lastImportantIndex + 1 });
      
      // Add to group
      await chrome.tabs.group({ groupId: importantGroup.id, tabIds: [tabId] });
    }
  } catch (error) {
    console.error('Error moving tab to Important:', error);
  }
}

// Quick remove tab from Important group without full reorganization
async function removeTabFromImportant(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    
    if (tab.groupId !== -1) {
      await chrome.tabs.ungroup([tabId]);
    }
    
    // Optionally trigger a light reorganization after a delay
    setTimeout(() => scheduleOrganization(), 1000);
  } catch (error) {
    console.error('Error removing tab from Important:', error);
  }
}

// Helper functions for Important URLs
async function addImportantUrl(url) {
  const result = await chrome.storage.local.get(['importantUrls']);
  const importantUrls = result.importantUrls || [];
  
  if (!importantUrls.includes(url)) {
    importantUrls.push(url);
    await chrome.storage.local.set({ importantUrls: importantUrls });
  }
}

async function removeImportantUrl(url) {
  const result = await chrome.storage.local.get(['importantUrls']);
  const importantUrls = result.importantUrls || [];
  
  const filtered = importantUrls.filter(u => u !== url);
  await chrome.storage.local.set({ importantUrls: filtered });
}

async function getImportantUrls() {
  const result = await chrome.storage.local.get(['importantUrls']);
  return result.importantUrls || [];
}

// Extract root domain from hostname
function getRootDomain(hostname) {
  // List of known two-part TLDs
  const twoPartTLDs = [
    'co.uk', 'com.au', 'co.nz', 'co.za', 'com.br', 'co.in',
    'com.cn', 'com.mx', 'co.jp', 'com.ar', 'com.sg', 'co.id',
    'com.tr', 'co.kr', 'com.tw', 'co.th', 'com.my', 'com.vn'
  ];
  
  const parts = hostname.split('.');
  
  // If only 2 or fewer parts, it's already the root domain
  if (parts.length <= 2) {
    return hostname;
  }
  
  // Check for two-part TLD
  const lastTwoParts = parts.slice(-2).join('.');
  if (twoPartTLDs.includes(lastTwoParts)) {
    // Take the last 3 parts (e.g. example.co.uk)
    return parts.slice(-3).join('.');
  }
  
  // Otherwise take the last 2 parts (e.g. example.com)
  return parts.slice(-2).join('.');
}

// Debounce function for delayed execution
function scheduleOrganization() {
  if (organizationTimeout) {
    clearTimeout(organizationTimeout);
  }
  
  // Wait 2 seconds after last tab event before organizing (increased from 1 second)
  organizationTimeout = setTimeout(async () => {
    if (!organizingInProgress) {
      await autoOrganizeTabs();
    }
  }, 2000);
}

// Listener for newly created tabs
chrome.tabs.onCreated.addListener((tab) => {
  scheduleOrganization();
});

// Listener for updated tabs (when URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only organize when URL is fully loaded
  if (changeInfo.status === 'complete' && changeInfo.url) {
    scheduleOrganization();
  }
});

async function autoOrganizeTabs() {
  if (organizingInProgress) return;
  
  try {
    organizingInProgress = true;
    
    // Get all tabs in the current window
    const windows = await chrome.windows.getAll({ populate: true });
    
    for (const window of windows) {
      await organizeWindowTabs(window.id);
    }
  } catch (error) {
    console.error('Error in automatic organization:', error);
  } finally {
    organizingInProgress = false;
  }
}

async function organizeWindowTabs(windowId) {
  const tabs = await chrome.tabs.query({ windowId: windowId });
  const importantUrls = await getImportantUrls();
  
  // Group tabs by domain
  const tabsByDomain = {};
  const importantTabs = [];

  for (const tab of tabs) {
    try {
      const url = new URL(tab.url);
      
      // Check if tab is marked as Important
      if (importantUrls.includes(tab.url)) {
        importantTabs.push(tab);
        continue;
      }
      
      const domain = getRootDomain(url.hostname);

      if (!tabsByDomain[domain]) {
        tabsByDomain[domain] = [];
      }
      tabsByDomain[domain].push(tab);
    } catch (error) {
      // Skip URLs like chrome:// or edge://
      continue;
    }
  }

  // Sort Important tabs alphabetically by title
  importantTabs.sort((a, b) => 
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );

  // Separate domains with multiple tabs and single tabs
  const multiTabDomains = {};
  const singleTabs = [];

  for (const [domain, domainTabs] of Object.entries(tabsByDomain)) {
    if (domainTabs.length > 1) {
      multiTabDomains[domain] = domainTabs;
    } else {
      singleTabs.push(...domainTabs);
    }
  }

  // Sort domains alphabetically
  const sortedDomains = Object.keys(multiTabDomains).sort((a, b) => 
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  // Sort single tabs alphabetically by title
  singleTabs.sort((a, b) => 
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );

  // Sort tabs within each domain alphabetically by title
  for (const domain of sortedDomains) {
    multiTabDomains[domain].sort((a, b) => 
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    );
  }

  // Colors for groups
  const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
  let colorIndex = 0;

  // Collect all tab IDs and their target positions
  const moveOperations = [];
  let currentIndex = 0;

  // First Important tabs
  for (let i = 0; i < importantTabs.length; i++) {
    moveOperations.push({
      tabId: importantTabs[i].id,
      newIndex: currentIndex + i,
      groupName: 'Important'
    });
  }
  currentIndex += importantTabs.length;

  // Then grouped tabs
  for (const domain of sortedDomains) {
    const domainTabs = multiTabDomains[domain];
    
    for (let i = 0; i < domainTabs.length; i++) {
      moveOperations.push({
        tabId: domainTabs[i].id,
        newIndex: currentIndex + i,
        domain: domain,
        groupName: domain
      });
    }
    currentIndex += domainTabs.length;
  }

  // Then single tabs for "Unsorted"
  for (let i = 0; i < singleTabs.length; i++) {
    moveOperations.push({
      tabId: singleTabs[i].id,
      newIndex: currentIndex + i,
      domain: 'Unsorted',
      groupName: 'Unsorted'
    });
  }

  // Move tabs in batch (parallel execution for better performance)
  const movePromises = [];
  for (const op of moveOperations) {
    movePromises.push(
      chrome.tabs.move(op.tabId, { index: op.newIndex }).catch(error => {
        console.error('Error moving tab:', error);
      })
    );
  }
  await Promise.all(movePromises);

  // Wait briefly
  await new Promise(resolve => setTimeout(resolve, 50));

  // Create groups in parallel for better performance
  const groupPromises = [];
  
  // Important group (red and at the top)
  if (importantTabs.length > 0) {
    const importantTabIds = importantTabs.map(tab => tab.id);
    
    const ungroupIds = importantTabs.filter(tab => tab.groupId !== -1).map(tab => tab.id);
    const ungroupPromise = ungroupIds.length > 0 
      ? chrome.tabs.ungroup(ungroupIds).catch(err => console.error('Ungroup error:', err))
      : Promise.resolve();
    
    groupPromises.push(
      ungroupPromise.then(() => 
        chrome.tabs.group({ tabIds: importantTabIds })
          .then(groupId => chrome.tabGroups.update(groupId, {
            title: 'Important',
            color: 'red',
            collapsed: false
          }))
      ).catch(error => console.error('Error grouping Important:', error))
    );
  }
  
  // Domain groups
  for (const domain of sortedDomains) {
    const domainTabs = multiTabDomains[domain];
    const tabIds = domainTabs.map(tab => tab.id);
    const color = colors[colorIndex % colors.length];
    
    const ungroupIds = domainTabs.filter(tab => tab.groupId !== -1).map(tab => tab.id);
    const ungroupPromise = ungroupIds.length > 0 
      ? chrome.tabs.ungroup(ungroupIds).catch(err => console.error('Ungroup error:', err))
      : Promise.resolve();
    
    groupPromises.push(
      ungroupPromise.then(() =>
        chrome.tabs.group({ tabIds: tabIds })
          .then(groupId => chrome.tabGroups.update(groupId, {
            title: domain,
            color: color,
            collapsed: false
          }))
      ).catch(error => console.error('Error grouping:', error))
    );
    
    colorIndex++;
  }

  // "Unsorted" group
  if (singleTabs.length > 0) {
    const unsortedTabIds = singleTabs.map(tab => tab.id);
    
    const ungroupIds = singleTabs.filter(tab => tab.groupId !== -1).map(tab => tab.id);
    const ungroupPromise = ungroupIds.length > 0 
      ? chrome.tabs.ungroup(ungroupIds).catch(err => console.error('Ungroup error:', err))
      : Promise.resolve();
    
    groupPromises.push(
      ungroupPromise.then(() =>
        chrome.tabs.group({ tabIds: unsortedTabIds })
          .then(groupId => chrome.tabGroups.update(groupId, {
            title: 'Unsorted',
            color: 'grey',
            collapsed: false
          }))
      ).catch(error => console.error('Error grouping Unsorted:', error))
    );
  }
  
  // Wait for all groups to be created
  await Promise.all(groupPromises);
}
