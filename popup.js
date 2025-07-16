function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function getTodayKey() {
    const today = new Date().toISOString().split("T")[0];
    return `timeSpent_${today}`;
}

function updateTime() {
    const key = getTodayKey();
    chrome.storage.local.get([key], (res) => {
        if(res[key]){
            const seconds = res[key]?.time || 0;
            document.getElementById("time").textContent = formatTime(seconds);
        }
    });
}

function getEmoji(domain) {
    if (domain.includes("chatgpt")) return "🤖";
    if (domain.includes("claude")) return "🧠";
    if (domain.includes("bard") || domain.includes("gemini")) return "🔮";
    if (domain.includes("poe")) return "📜";
    if (domain.includes("midjourney")) return "🎨";
    if (domain.includes("you.com")) return "🌐";
    if (domain.includes("phind")) return "🧭";
    if (domain.includes("runway") || domain.includes("suno")) return "🎬";
    return "💬";
}

function updateCurrentSite() {
    const key = getTodayKey();
    chrome.storage.local.get([key], (res) => {
        if(res[key]){
            const websiteList = res[key]?.list || [];
            const container = document.getElementById("site");
            container.innerHTML = "";
            websiteList.forEach(website => {
                const li = document.createElement("li");
                li.innerHTML = `<span><span class="emoji">${getEmoji(website.toString())}</span>${website.toString().split('/')[0]}</span>`;
                container.appendChild(li);
            })
        }
    });
}

setInterval(() => {
    updateTime();
    updateCurrentSite();
})
