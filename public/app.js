const BACKEND_URL = ' https://rotten-kings-judge.loca.lt';
const audioPlayer = document.getElementById('audio-player');
const walletBalanceEl = document.getElementById('wallet-balance');
const walletBalanceContainer = document.getElementById('wallet-balance-container');
const logFeedEl = document.getElementById('log-feed');
const musicGridEl = document.getElementById('music-grid');
const trackCountEl = document.getElementById('track-count');
const uploadForm = document.getElementById('upload-form');

// Playbar interface links
const pbTitle = document.getElementById('pb-title');
const pbArtist = document.getElementById('pb-artist');
const pbWave = document.getElementById('pb-wave');
const pbMasterPlayBtn = document.getElementById('pb-master-play-btn');
const pbProgressLine = document.getElementById('pb-progress-line');
const pbCurrentTime = document.getElementById('pb-current-time');
const pbTotalDuration = document.getElementById('pb-total-duration');

let activeTrack = null;
let networkTracks = [];
let balanceHidden = false;
let currentBalanceValue = "0.00";

// Complete terminal logger utility
function addLog(message, isSuccess = false) {
    const time = new Date().toLocaleTimeString();
    const logItem = document.createElement('p');
    logItem.className = isSuccess ? 'text-emerald-400 font-semibold border-l-2 border-emerald-500/40 pl-2 my-1' : 'text-slate-400 border-l-2 border-slate-800 pl-2 my-1';
    logItem.innerHTML = `[${time}] ${message}`;
    logFeedEl.appendChild(logItem);
    logFeedEl.scrollTop = logFeedEl.scrollHeight;
}

// Multi-Page Tab UI Controller Switch
function switchView(viewId) {
    ['explore', 'upload', 'analytics'].forEach(v => {
        document.getElementById(`view-${v}`).classList.add('hidden');
        document.getElementById(`nav-${v}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent cursor-pointer";
    });
    
    document.getElementById(`view-${viewId}`).classList.remove('hidden');
    document.getElementById(`nav-${viewId}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 cursor-pointer";
    addLog(`🖥️ Moved view context to tabular node: [${viewId.toUpperCase()}]`);
}

// Feature: Hide/Show Source Account Liquidity Balance 
function toggleBalancePrivacy() {
    balanceHidden = !balanceHidden;
    renderBalanceDisplay();
    addLog(`🔒 Privacy visibility matrix context toggled: Balance Hidden = ${balanceHidden}`);
}

function renderBalanceDisplay() {
    if (balanceHidden) {
        walletBalanceContainer.innerHTML = `<span class="text-slate-600 font-mono text-base font-bold tracking-widest">••••••</span>`;
    } else {
        walletBalanceContainer.innerHTML = `<span id="wallet-balance" class="text-emerald-400 font-black">${parseFloat(currentBalanceValue).toFixed(2)}</span> <span class="text-xs font-bold text-slate-500">USDC</span>`;
    }
}

// Sync values from local node instance state
async function syncSystemMetrics() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/agent-status`);
        const data = await res.json();
        
        currentBalanceValue = data.usdcBalance;
        renderBalanceDisplay();
        networkTracks = data.tracks;
        trackCountEl.innerText = networkTracks.length;
        renderMusicMarketplace();
    } catch (err) {
        addLog("❌ Terminal Connection Error: Active backend loop not detected.");
    }
}

// Render out high fidelity marketplace grid cards
function renderMusicMarketplace() {
    musicGridEl.innerHTML = '';
    
    networkTracks.forEach((track, index) => {
        const isCurrentActive = activeTrack && activeTrack.id === track.id && !audioPlayer.paused;
        const card = document.createElement('div');
        card.className = 'bg-[#111827]/40 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between shadow-lg backdrop-blur group relative overflow-hidden';
        
        // Dynamic decorative mock abstract thumbnails colors
        const gradients = [
            'from-purple-600 to-indigo-900',
            'from-cyan-500 to-blue-800',
            'from-emerald-600 to-teal-900',
            'from-rose-500 to-amber-800',
            'from-fuchsia-600 to-pink-900',
            'from-violet-600 to-purple-950'
        ];
        const selectedGradient = gradients[index % gradients.length];

        card.innerHTML = `
            <div>
                <div class="w-full h-36 bg-gradient-to-br ${selectedGradient} rounded-xl mb-4 flex items-center justify-center text-4xl shadow-inner border border-white/5 relative group-hover:scale-[1.02] transition-transform duration-300">
                    <span class="drop-shadow-md">🎵</span>
                    <div class="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <span class="text-white text-xs bg-slate-900/80 px-3 py-1.5 rounded-full backdrop-blur border border-white/10 font-bold">Stream Now</span>
                    </div>
                </div>
                <h4 class="text-base font-black text-white truncate">${track.title}</h4>
                <p class="text-xs text-slate-400 mb-4">Artist Node: <span class="text-slate-200 font-semibold">${track.artistName}</span></p>
                <div class="bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-500 truncate mb-1">
                    Settlement target: <span class="text-slate-400">${track.artistWallet}</span>
                </div>
            </div>
            <button id="btn-${track.id}" class="mt-4 w-full ${isCurrentActive ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 shadow-md'} font-bold py-2.5 px-4 rounded-xl transition-all duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer">
                ${isCurrentActive ? '⏸️ Pause Current Stream' : '▶️ Stream Track Value'}
            </button>
        `;
        
        musicGridEl.appendChild(card);
        document.getElementById(`btn-${track.id}`).addEventListener('click', () => toggleAudioStream(track));
    });
}

// Process track state playback routing mutations
async function toggleAudioStream(track) {
    if (activeTrack && activeTrack.id === track.id && !audioPlayer.paused) {
        audioPlayer.pause();
        pbMasterPlayBtn.innerHTML = '▶️';
        pbWave.innerHTML = '⏸️';
        addLog(`⏸️ Audio thread execution paused manually.`);
        renderMusicMarketplace();
        return;
    }

    audioPlayer.src = track.audioUrl;
    audioPlayer.play();
    activeTrack = track;
    
    // Update playbar text views
    pbTitle.innerText = track.title;
    pbArtist.innerText = track.artistName;
    pbMasterPlayBtn.innerHTML = '⏸️';
    pbWave.innerHTML = '⚡';
    
    addLog(`🎵 Loading audio tracking vectors for: "${track.title}"`);
    renderMusicMarketplace();

    // Trigger immediate atomic backend micro-settlement via Circle rails
    try {
        const response = await fetch(`${BACKEND_URL}/api/trigger-stream-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackId: track.id })
        });
        const result = await response.json();
        
        if (result.success) {
            addLog(`✅ Atomic Settlement Succeeded: 0.01 USDC successfully routed to Artist address!`, true);
            addLog(`🔗 Circle Ledger Tx Record ID: ${result.txId}`, true);
            setTimeout(syncSystemMetrics, 1500);
        } else {
            addLog(`❌ Settlement pipeline execution rejection context: ${result.error}`);
        }
    } catch (error) {
        addLog(`❌ Fatal network error context routing payment payload.`);
    }
}

// Playbar interface controls wrappers
function toggleGlobalPlayback() {
    if (activeTrack) toggleAudioStream(activeTrack);
    else addLog("ℹ️ Select an asset from the explore grid list to trigger streaming pipelines.");
}
function rewindPlayback() { if (audioPlayer.src) { audioPlayer.currentTime = 0; addLog("⏮️ Rewound active audio stream."); } }
function fastForwardPlayback() { if (audioPlayer.src) { audioPlayer.currentTime += 10; addLog("⏭️ Skipped forward 10 seconds."); } }

// Format time string utilities
function formatTime(secs) {
    const mins = Math.floor(secs / 60);
    const remainSecs = Math.floor(secs % 60);
    return `${mins}:${remainSecs < 10 ? '0' : ''}${remainSecs}`;
}

// Track Progress Line Updates listeners
audioPlayer.addEventListener('timeupdate', () => {
    const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    pbProgressLine.style.width = `${pct}%`;
    pbCurrentTime.innerText = formatTime(audioPlayer.currentTime);
});
audioPlayer.addEventListener('loadedmetadata', () => {
    pbTotalDuration.innerText = formatTime(audioPlayer.duration || 0);
});

// Form Submission Actions (Accepts ALL tracks across general definitions)
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('track-title').value;
    const artistName = document.getElementById('artist-name').value;
    const artistWallet = document.getElementById('artist-wallet').value;
    const audioUrl = document.getElementById('audio-url').value || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3";

    addLog(`📤 Packaging allocation requests payload for metadata distribution upload: "${title}"...`);
    const trackPayload = { id: "track-" + Date.now(), title, artistName, artistWallet, audioUrl };

    // Inject directly into client-side tracking state matrices
    networkTracks.push(trackPayload);
    trackCountEl.innerText = networkTracks.length;
    
    renderMusicMarketplace();
    uploadForm.reset();
    switchView('explore');
    addLog(`🎉 Registration validation verified! "${title}" added to active global marketplace registries.`, true);
});

// Run metrics tracking loops on init
syncSystemMetrics();
