document.addEventListener('DOMContentLoaded', function() {
  const organizeBtn = document.getElementById('organizeBtn');
  const markCurrentBtn = document.getElementById('markCurrentBtn');
  const closeOthersBtn = document.getElementById('closeOthersBtn');
  const statusDiv = document.getElementById('status');
  const importantList = document.getElementById('importantList');

  // Load and display Important URLs
  loadImportantUrls();
  
  // Check if current tab is already marked
  checkCurrentTab();

  organizeBtn.addEventListener('click', async function() {
    try {
      organizeBtn.disabled = true;
      statusDiv.className = 'status';
      statusDiv.textContent = 'Organizing tabs...';
      statusDiv.style.display = 'block';

      await organizeTabs();

      statusDiv.className = 'status success';
      statusDiv.textContent = 'Tabs successfully organized!';
      organizeBtn.disabled = false;
    } catch (error) {
      console.error('Error organizing:', error);
      statusDiv.className = 'status error';
      statusDiv.textContent = 'Error: ' + error.message;
      organizeBtn.disabled = false;
    }
  });

  markCurrentBtn.addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const result = await chrome.storage.local.get(['importantUrls']);
      const importantUrls = result.importantUrls || [];
      
      if (importantUrls.includes(tab.url)) {
        // URL is already marked - remove it
        await removeImportantUrl(tab.url);
        statusDiv.className = 'status success';
        statusDiv.textContent = 'Tab removed from Important!';
        markCurrentBtn.textContent = 'Mark Current Tab as Important';
        
        // Quick remove without full reorganization
        await chrome.runtime.sendMessage({ 
          action: 'removeFromImportant',
          tabId: tab.id
        });
      } else {
        // Mark URL
        await addImportantUrl(tab.url);
        statusDiv.className = 'status success';
        statusDiv.textContent = 'Tab marked as Important!';
        markCurrentBtn.textContent = 'Remove Important Mark';
        
        // Quick move without full reorganization
        await chrome.runtime.sendMessage({ 
          action: 'moveToImportant',
          tabId: tab.id
        });
      }
      
      statusDiv.style.display = 'block';
      await loadImportantUrls();
      await checkCurrentTab();
      
    } catch (error) {
      console.error('Error marking:', error);
      statusDiv.className = 'status error';
      statusDiv.textContent = 'Error: ' + error.message;
      statusDiv.style.display = 'block';
    }
  });

  closeOthersBtn.addEventListener('click', async function() {
    try {
      // Confirm action
      if (!confirm('Are you sure you want to close all tabs except Important? This cannot be undone.')) {
        return;
      }
      
      closeOthersBtn.disabled = true;
      statusDiv.className = 'status';
      statusDiv.textContent = 'Closing tabs...';
      statusDiv.style.display = 'block';

      // Get all tabs in current window
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const result = await chrome.storage.local.get(['importantUrls']);
      const importantUrls = result.importantUrls || [];
      
      // Find tabs to close (all except Important URLs)
      const tabsToClose = tabs.filter(tab => !importantUrls.includes(tab.url)).map(tab => tab.id);
      
      if (tabsToClose.length === 0) {
        statusDiv.className = 'status success';
        statusDiv.textContent = 'No tabs to close - all tabs are marked as Important!';
        closeOthersBtn.disabled = false;
        return;
      }
      
      // Close tabs in batches to prevent browser freezing
      const batchSize = 20; // Close 20 tabs at a time
      const totalTabs = tabsToClose.length;
      let closedCount = 0;
      
      for (let i = 0; i < tabsToClose.length; i += batchSize) {
        const batch = tabsToClose.slice(i, i + batchSize);
        await chrome.tabs.remove(batch);
        closedCount += batch.length;
        
        // Update progress
        statusDiv.textContent = `Closing tabs... ${closedCount}/${totalTabs}`;
        
        // Small delay between batches to keep browser responsive
        if (i + batchSize < tabsToClose.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      statusDiv.className = 'status success';
      statusDiv.textContent = `Closed ${totalTabs} tab(s)!`;
      closeOthersBtn.disabled = false;
    } catch (error) {
      console.error('Error closing tabs:', error);
      statusDiv.className = 'status error';
      statusDiv.textContent = 'Error: ' + error.message;
      statusDiv.style.display = 'block';
      closeOthersBtn.disabled = false;
    }
  });

  async function checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const result = await chrome.storage.local.get(['importantUrls']);
      const importantUrls = result.importantUrls || [];
      
      if (importantUrls.includes(tab.url)) {
        markCurrentBtn.textContent = 'Remove Important Mark';
        markCurrentBtn.style.backgroundColor = '#fde7e9';
        markCurrentBtn.style.borderColor = '#d13438';
        markCurrentBtn.style.color = '#d13438';
      }
    } catch (error) {
      console.error('Error checking tab:', error);
    }
  }

  async function addImportantUrl(url) {
    const result = await chrome.storage.local.get(['importantUrls']);
    const importantUrls = result.importantUrls || [];
    
    if (!importantUrls.includes(url)) {
      importantUrls.push(url);
      await chrome.storage.local.set({ importantUrls: importantUrls });
    }
  }

  async function loadImportantUrls() {
    const result = await chrome.storage.local.get(['importantUrls']);
    const importantUrls = result.importantUrls || [];
    
    if (importantUrls.length === 0) {
      importantList.innerHTML = '<div class="empty-message">No Important URLs marked</div>';
      return;
    }
    
    importantList.innerHTML = '';
    for (const url of importantUrls) {
      const item = document.createElement('div');
      item.className = 'important-item';
      
      const urlSpan = document.createElement('span');
      urlSpan.className = 'important-url';
      urlSpan.textContent = url;
      urlSpan.title = url;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-remove';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', async () => {
        await removeImportantUrl(url);
        await loadImportantUrls();
        await checkCurrentTab();
        
        // Find tab with this URL and remove from Important group
        const tabs = await chrome.tabs.query({ url: url });
        if (tabs.length > 0) {
          await chrome.runtime.sendMessage({ 
            action: 'removeFromImportant',
            tabId: tabs[0].id
          });
        }
      });
      
      item.appendChild(urlSpan);
      item.appendChild(removeBtn);
      importantList.appendChild(item);
    }
  }

  async function removeImportantUrl(url) {
    const result = await chrome.storage.local.get(['importantUrls']);
    const importantUrls = result.importantUrls || [];
    const filtered = importantUrls.filter(u => u !== url);
    await chrome.storage.local.set({ importantUrls: filtered });
  }
});

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

async function organizeTabs() {
  // Get all tabs in the current window
  const tabs = await chrome.tabs.query({ currentWindow: true });
  
  // Load Important URLs from storage
  const result = await chrome.storage.local.get(['importantUrls']);
  const importantUrls = result.importantUrls || [];
  
  // Group tabs by domain
  const tabsByDomain = {};
  const seenUrls = new Set();
  const tabsToClose = [];
  const importantTabs = [];

  for (const tab of tabs) {
    try {
      const url = new URL(tab.url);
      
      // Identify duplicates
      const urlKey = tab.url;
      if (seenUrls.has(urlKey)) {
        // Duplicate found - mark for closing
        tabsToClose.push(tab.id);
        continue;
      }
      seenUrls.add(urlKey);
      
      // Check if tab is marked as Important
      if (importantUrls.includes(tab.url)) {
        importantTabs.push(tab);
        continue;
      }
      
      const domain = getRootDomain(url.hostname);

      // Add tab to domain group
      if (!tabsByDomain[domain]) {
        tabsByDomain[domain] = [];
      }
      tabsByDomain[domain].push(tab);
    } catch (error) {
      // Skip URLs like chrome:// or edge://
      console.log('Skipping tab:', tab.url);
    }
  }

  // Close duplicates
  if (tabsToClose.length > 0) {
    await chrome.tabs.remove(tabsToClose);
    // Wait briefly for tabs to close
    await new Promise(resolve => setTimeout(resolve, 100));
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

  // Remove existing groups
  const existingGroups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
  for (const group of existingGroups) {
    const tabsInGroup = await chrome.tabs.query({ groupId: group.id });
    const tabIds = tabsInGroup.map(tab => tab.id);
    if (tabIds.length > 0) {
      await chrome.tabs.ungroup(tabIds);
    }
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
        groupable: true
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
      groupable: false
    });
  }
  currentIndex += singleTabs.length;

  // Move all tabs in one go (batch operation)
  const movePromises = moveOperations.map(op => 
    chrome.tabs.move(op.tabId, { index: op.newIndex }).catch(error => {
      console.error('Error moving tab:', error);
    })
  );
  await Promise.all(movePromises);

  // Wait briefly for tabs to be fully moved
  await new Promise(resolve => setTimeout(resolve, 50));

  // Create groups in parallel for better performance
  const groupPromises = [];
  
  // Important group (red and at the top)
  if (importantTabs.length > 0) {
    const importantTabIds = importantTabs.map(tab => tab.id);
    groupPromises.push(
      chrome.tabs.group({ tabIds: importantTabIds })
        .then(groupId => chrome.tabGroups.update(groupId, {
          title: 'Important',
          color: 'red',
          collapsed: false
        }))
        .catch(error => console.error('Error creating Important group:', error))
    );
  }
  
  // Create domain groups
  for (const domain of sortedDomains) {
    const domainTabs = multiTabDomains[domain];
    const tabIds = domainTabs.map(tab => tab.id);
    const color = colors[colorIndex % colors.length];
    
    groupPromises.push(
      chrome.tabs.group({ tabIds: tabIds })
        .then(groupId => chrome.tabGroups.update(groupId, {
          title: domain,
          color: color,
          collapsed: false
        }))
        .catch(error => console.error('Error creating domain group:', error))
    );
    colorIndex++;
  }

  // Create "Unsorted" group
  if (singleTabs.length > 0) {
    const unsortedTabIds = singleTabs.map(tab => tab.id);
    groupPromises.push(
      chrome.tabs.group({ tabIds: unsortedTabIds })
        .then(groupId => chrome.tabGroups.update(groupId, {
          title: 'Unsorted',
          color: 'grey',
          collapsed: false
        }))
        .catch(error => console.error('Error creating Unsorted group:', error))
    );
  }
  
  // Wait for all groups to be created
  await Promise.all(groupPromises);
}
