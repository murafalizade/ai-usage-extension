let timer = null;
let activeTabId = null;

const aiAppSites = [
    "chatgpt.com",
    "openai.com/chat",
    "gemini.google.com",
    "bard.google.com",
    "claude.ai",
    "poe.com",
    "you.com/chat",
    "perplexity.ai",
    "writesonic.com/chat",
    "copilot.microsoft.com",
    "phind.com",
    "replit.com",
    "character.ai",
    "runwayml.com",
    "suno.ai",
    "heygen.com",
    "midjourney.com/app",
    "krisp.ai/app",
    "kaiber.ai",
    "soundraw.io",
    "descript.com/app",
    "play.ht/studio",
    "fireflies.ai",
    "otter.ai",
    "stitch.google.com",       // Google Stitch
    "gamma.app",               // Gamma (AI presentations)
    "elevenlabs.io",           // Eleven Labs (voice)
    "notebooklm.google.com",   // Google NotebookLM (formerly AI Notebook)
    "grok.x.ai",               // Grok (xAI)
    "meta.ai"                  // Meta AI
];

function formatUrl(url){
    const { hostname, pathname } = new URL(url);
    return`${hostname}${pathname}`.toLowerCase();
}

function isAiAppUrl(url) {
    try {
        const cleanUrl = formatUrl(url)
        return aiAppSites.some(domain => cleanUrl.includes(domain));
    } catch {
        return false;
    }
}

function getTodayKey() {
    const today = new Date().toISOString().split("T")[0];
    return `timeSpent_${today}`;
}

function appendNotExists(arr, elm){
    if(arr.includes(elm)){
        return arr;
    }

    return [...arr, elm];
}

function startTimer(website) {
    if (!timer) {
        timer = setInterval(() => {
            const key = getTodayKey();
            chrome.storage.local.get([key], (res) => {
                const newTime = (res[key]?.time || 0) + 1;
                const newList = appendNotExists((res[key]?.list || []), website.split('/')[0] ?? website)
                chrome.storage.local.set({ [key]: {time:newTime, list: newList} });
            });
        }, 1000);
    }
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function checkAndStart(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab?.url) {
            stopTimer();
            return;
        }

        if (isAiAppUrl(tab.url)) {
            startTimer(formatUrl(tab.url));
        } else {
            stopTimer();
        }
    });
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
    activeTabId = tabId;
    checkAndStart(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === activeTabId && changeInfo.url) {
        checkAndStart(tabId);
    }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        stopTimer();
    } else if (activeTabId !== null) {
        checkAndStart(activeTabId);
    }
});
