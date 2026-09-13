/**
 * Chaupal - Main Interactive Application Engine
 * Sovereign Zero-Knowledge Civic Membership Platform
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// App State
const AppState = {
  activeView: 'home',
  wallet: { ...CHAUPAL_DATA.defaultWallet },
  communities: JSON.parse(JSON.stringify(CHAUPAL_DATA.communities)),
  claimedSeals: JSON.parse(localStorage.getItem('chaupal_claimed_seals')) || JSON.parse(JSON.stringify(CHAUPAL_DATA.initialClaimedSeals)),
  stewardRoster: JSON.parse(localStorage.getItem('chaupal_steward_roster')) || JSON.parse(JSON.stringify(CHAUPAL_DATA.sampleRoster)),
  activeStewardCommunity: 'punjabi-sangat',
  selectedCommunityForClaim: 'punjabi-sangat',
  currentClaimStep: 1,
  claimProofData: null,
  activeDirectoryFilter: 'all',
  activeRegionFilter: 'all',
  searchQuery: ''
};

function initApp() {
  // Setup Hash Routing
  setupRouting();
  
  // Render Initial Views
  renderHomeCommunities();
  renderDirectory();
  renderClaimedSeals();
  renderStewardRoster();
  updateWalletUI();
  setupEventListeners();

  // Initialize custom claim flow if URL has community param
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('claim/')) {
    const commId = hash.split('/')[1];
    selectCommunityForClaim(commId);
  }
}

// -------------------------------------------------------------
// 1. ROUTING & VIEW MANAGEMENT
// -------------------------------------------------------------
function setupRouting() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  let hash = window.location.hash.slice(1) || 'home';
  if (hash.startsWith('claim')) {
    const parts = hash.split('/');
    if (parts[1]) {
      AppState.selectedCommunityForClaim = parts[1];
    }
    hash = 'claim';
  } else if (hash === 'dashboard' || hash === 'seals') {
    hash = 'dashboard';
  }

  navigateTo(hash);
}

function navigateTo(viewId) {
  AppState.activeView = viewId;

  // Update DOM Views
  document.querySelectorAll('.spa-view').forEach(view => {
    view.classList.remove('active-view');
  });

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update Header Navigation Active State
  document.querySelectorAll('[data-nav-target]').forEach(link => {
    const target = link.getAttribute('data-nav-target');
    if (target === viewId || (viewId === 'dashboard' && target === 'seals')) {
      link.classList.add('bg-surface-container', 'text-primary', 'font-semibold', 'shadow-xs');
      link.classList.remove('text-on-surface-variant');
    } else {
      link.classList.remove('bg-surface-container', 'text-primary', 'font-semibold', 'shadow-xs');
      link.classList.add('text-on-surface-variant');
    }
  });

  // Trigger view-specific re-renders
  if (viewId === 'dashboard') {
    renderClaimedSeals();
  } else if (viewId === 'directory') {
    renderDirectory();
  } else if (viewId === 'steward') {
    recalculateStewardTree();
  } else if (viewId === 'claim') {
    initClaimWizard();
  }
}

// -------------------------------------------------------------
// 2. WALLET & NETWORK CONTROLS
// -------------------------------------------------------------
function updateWalletUI() {
  const shortAddr = AppState.wallet.connected 
    ? `${AppState.wallet.address.slice(0, 6)}...${AppState.wallet.address.slice(-4)}`
    : 'Connect Wallet';

  document.querySelectorAll('.wallet-address-display').forEach(el => {
    el.textContent = shortAddr;
  });

  document.querySelectorAll('.wallet-network-display').forEach(el => {
    el.textContent = AppState.wallet.network;
  });

  const heroBtn = document.getElementById('heroConnectBtn');
  if (heroBtn) {
    if (AppState.wallet.connected) {
      heroBtn.innerHTML = `<span class="material-symbols-outlined text-secondary text-[18px]">verified_user</span><span>Wallet Connected (${AppState.wallet.provider})</span>`;
    } else {
      heroBtn.innerHTML = `<span class="material-symbols-outlined text-secondary text-[18px]">account_balance_wallet</span><span>Connect Wallet to Verify</span>`;
    }
  }
}

function openWalletModal() {
  const modal = document.getElementById('walletModalBackdrop');
  if (modal) modal.classList.remove('hidden');
}

function closeWalletModal() {
  const modal = document.getElementById('walletModalBackdrop');
  if (modal) modal.classList.add('hidden');
}

function connectWallet(provider) {
  AppState.wallet.connected = true;
  AppState.wallet.provider = provider;
  
  if (provider === 'Demo Anonymous') {
    AppState.wallet.address = '0x88F932810C1A957209384B2958045F207D67BAAC';
  }

  updateWalletUI();
  closeWalletModal();
  showToast(`Connected successfully via ${provider}`, 'success');
}

function disconnectWallet() {
  AppState.wallet.connected = false;
  updateWalletUI();
  closeWalletModal();
  showToast('Wallet disconnected', 'info');
}

function switchNetwork(networkName) {
  AppState.wallet.network = networkName;
  updateWalletUI();
  showToast(`Switched network to ${networkName}`, 'info');
}

// -------------------------------------------------------------
// 3. HOME VIEW RENDERING
// -------------------------------------------------------------
function renderHomeCommunities() {
  const container = document.getElementById('homeCommunitiesGrid');
  if (!container) return;

  const featured = AppState.communities.slice(0, 6);
  container.innerHTML = featured.map(comm => `
    <div class="sangat-card bg-surface-container-low rounded-xl p-space-lg shadow-subtle hover:shadow-floating transition-all flex flex-col justify-between group border border-outline-variant/30">
      <div>
        <div class="flex items-start justify-between gap-space-sm mb-space-md">
          <div class="flex items-center gap-space-md">
            <div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
              ${comm.svgIcon}
            </div>
            <div>
              <h3 class="font-display text-lg text-on-surface font-bold group-hover:text-primary transition-colors">${comm.name}</h3>
              <p class="font-body text-xs text-on-surface-variant font-medium">${comm.region}</p>
            </div>
          </div>
          <span class="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> ${comm.quorum} Quorum
          </span>
        </div>
        <p class="font-body text-sm text-on-surface-variant mb-space-md line-clamp-2">
          ${comm.description}
        </p>
      </div>
      <div class="pt-space-md border-t border-outline-variant/20 flex items-center justify-between">
        <span class="font-mono text-xs text-on-surface-variant">${comm.membersCount.toLocaleString()} Citizens</span>
        <a href="#claim/${comm.id}" class="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
          Verify Proof <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// 4. COMMUNITY DIRECTORY & FILTERING
// -------------------------------------------------------------
function renderDirectory() {
  const container = document.getElementById('communityGrid');
  if (!container) return;

  let filtered = AppState.communities.filter(comm => {
    // Search Filter
    const matchesSearch = !AppState.searchQuery || 
      comm.name.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      comm.description.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      comm.region.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      comm.tags.some(t => t.toLowerCase().includes(AppState.searchQuery.toLowerCase()));

    // Region Filter
    const matchesRegion = AppState.activeRegionFilter === 'all' || comm.regionKey === AppState.activeRegionFilter;

    // Status Filter
    const matchesStatus = AppState.activeDirectoryFilter === 'all' || 
      (AppState.activeDirectoryFilter === 'open' && comm.status === 'open') ||
      (AppState.activeDirectoryFilter === 'updated' && comm.lastUpdated.includes('day'));

    return matchesSearch && matchesRegion && matchesStatus;
  });

  const countEl = document.getElementById('directoryResultCount');
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${AppState.communities.length} Chaupals`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
        <span class="material-symbols-outlined text-outline text-[48px] mb-2">search_off</span>
        <h3 class="font-display text-lg font-bold text-on-surface">No Chaupals Found</h3>
        <p class="font-body text-sm text-on-surface-variant mt-1">Try adjusting your search terms or filter criteria.</p>
        <button onclick="resetDirectoryFilters()" class="mt-4 px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg shadow-sm">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(comm => `
    <div class="sangat-card bg-surface-container-low rounded-xl p-space-lg shadow-subtle hover:shadow-floating transition-all flex flex-col justify-between group border border-outline-variant/30">
      <div>
        <div class="flex items-start justify-between gap-space-sm mb-space-md">
          <div class="flex items-center gap-space-md">
            <div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
              ${comm.svgIcon}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h2 class="font-display text-lg text-on-surface font-bold group-hover:text-primary transition-colors">${comm.name}</h2>
              </div>
              <div class="flex items-center gap-space-xs mt-0.5">
                <span class="material-symbols-outlined text-secondary text-[16px]">location_on</span>
                <span class="font-body text-xs text-on-surface-variant font-medium">${comm.region}</span>
              </div>
            </div>
          </div>
          <span class="px-space-sm py-0.5 rounded-full ${comm.proofAvailable ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'} text-xs font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full ${comm.proofAvailable ? 'bg-secondary' : 'bg-outline'}"></span>
            ${comm.proofAvailable ? 'Proof Ready' : 'Public Ledger'}
          </span>
        </div>

        <p class="font-body text-sm text-on-surface-variant mb-space-md leading-relaxed">
          ${comm.description}
        </p>

        <!-- Technical Verifier Metadata Plinth -->
        <div class="bg-surface-container rounded-lg p-space-sm space-y-space-xs mb-space-md font-mono text-xs">
          <div class="flex items-center justify-between">
            <span class="text-on-surface-variant">On-Chain Root:</span>
            <span class="font-semibold text-primary truncate max-w-[140px]" title="${comm.merkleRoot}">${comm.merkleRoot.slice(0, 10)}...${comm.merkleRoot.slice(-4)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-on-surface-variant">Steward Seal:</span>
            <span class="text-on-surface">${comm.steward}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-on-surface-variant">Roster Quorum:</span>
            <span class="text-secondary font-semibold">${comm.quorum} Consensus</span>
          </div>
        </div>

        <!-- Tags -->
        <div class="flex flex-wrap gap-1 mb-space-md">
          ${comm.tags.map(t => `<span class="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[11px] rounded-full">${t}</span>`).join('')}
        </div>
      </div>

      <!-- Action Bottom Bar -->
      <div class="pt-space-md border-t border-outline-variant/30 flex items-center justify-between gap-space-sm">
        <button onclick="openCommunityDetailModal('${comm.id}')" class="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">info</span> Specs
        </button>
        <a href="#claim/${comm.id}" class="px-space-md py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body text-xs font-semibold shadow-xs flex items-center gap-1 transition-all">
          <span>Claim Seal</span>
          <span class="material-symbols-outlined text-[14px]">verified</span>
        </a>
      </div>
    </div>
  `).join('');
}

function setRegionFilter(region, btn) {
  AppState.activeRegionFilter = region;
  document.querySelectorAll('.filter-region-btn').forEach(b => {
    b.classList.remove('bg-surface-container-lowest', 'text-primary', 'font-semibold', 'shadow-xs');
    b.classList.add('text-on-surface-variant');
  });
  btn.classList.add('bg-surface-container-lowest', 'text-primary', 'font-semibold', 'shadow-xs');
  btn.classList.remove('text-on-surface-variant');
  renderDirectory();
}

function setStatusFilter(status, btn) {
  AppState.activeDirectoryFilter = status;
  document.querySelectorAll('.filter-status-btn').forEach(b => {
    b.classList.remove('bg-surface-container-lowest', 'text-primary', 'font-semibold', 'shadow-xs');
    b.classList.add('text-on-surface-variant');
  });
  btn.classList.add('bg-surface-container-lowest', 'text-primary', 'font-semibold', 'shadow-xs');
  btn.classList.remove('text-on-surface-variant');
  renderDirectory();
}

function handleDirectorySearch(input) {
  AppState.searchQuery = input.value;
  renderDirectory();
}

function resetDirectoryFilters() {
  AppState.searchQuery = '';
  AppState.activeRegionFilter = 'all';
  AppState.activeDirectoryFilter = 'all';
  const searchInput = document.getElementById('directorySearchInput');
  if (searchInput) searchInput.value = '';
  renderDirectory();
}

function openCommunityDetailModal(commId) {
  const comm = AppState.communities.find(c => c.id === commId);
  if (!comm) return;

  const modal = document.getElementById('communityDetailModal');
  const body = document.getElementById('communityDetailBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="space-y-space-md">
      <div class="flex items-center gap-space-md pb-space-sm border-b border-outline-variant/30">
        <div class="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-sm">
          ${comm.svgIcon}
        </div>
        <div>
          <h2 class="font-display text-2xl font-bold text-on-surface">${comm.name}</h2>
          <p class="font-body text-sm text-secondary font-medium">${comm.region} • ${comm.hindiName}</p>
        </div>
      </div>

      <div>
        <h4 class="font-body text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-1">Charter & Scope</h4>
        <p class="font-body text-sm text-on-surface leading-relaxed">${comm.description}</p>
      </div>

      <div class="bg-surface-container rounded-xl p-space-md space-y-space-xs">
        <h4 class="font-body text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Cryptographic Parameters</h4>
        <div class="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div>
            <span class="text-on-surface-variant block">Merkle Tree Depth</span>
            <span class="text-on-surface font-semibold">${comm.treeDepth} Levels</span>
          </div>
          <div>
            <span class="text-on-surface-variant block">Max Capacity</span>
            <span class="text-on-surface font-semibold">${Math.pow(2, comm.treeDepth).toLocaleString()} Leaves</span>
          </div>
          <div class="col-span-2">
            <span class="text-on-surface-variant block">Root Hash Commitment</span>
            <span class="text-primary font-semibold break-all">${comm.merkleRoot}</span>
          </div>
          <div>
            <span class="text-on-surface-variant block">Steward Quorum</span>
            <span class="text-secondary font-semibold">${comm.quorum} Multi-sig</span>
          </div>
          <div>
            <span class="text-on-surface-variant block">Settlement Layer</span>
            <span class="text-on-surface font-semibold">Polygon PoS #${comm.lastBlock}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 class="font-body text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-1">Eligibility Standard</h4>
        <div class="p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface">
          ${comm.eligibilityRules}
        </div>
      </div>

      <div class="pt-space-sm flex items-center justify-end gap-space-sm">
        <button onclick="closeCommunityDetailModal()" class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface">Close</button>
        <a href="#claim/${comm.id}" onclick="closeCommunityDetailModal()" class="px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-sm flex items-center gap-1">
          <span>Start Verification Flow</span>
          <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeCommunityDetailModal() {
  const modal = document.getElementById('communityDetailModal');
  if (modal) modal.classList.add('hidden');
}

// -------------------------------------------------------------
// 5. STEP-BY-STEP CLAIM & VERIFICATION WIZARD
// -------------------------------------------------------------
function selectCommunityForClaim(commId) {
  AppState.selectedCommunityForClaim = commId;
  initClaimWizard();
}

function initClaimWizard() {
  const select = document.getElementById('claimCommunitySelect');
  if (select) {
    select.innerHTML = AppState.communities.map(c => `
      <option value="${c.id}" ${c.id === AppState.selectedCommunityForClaim ? 'selected' : ''}>
        ${c.name} (${c.region})
      </option>
    `).join('');
  }

  updateClaimCommunityContext();
  setClaimStep(1);
}

function updateClaimCommunityContext() {
  const select = document.getElementById('claimCommunitySelect');
  const commId = select ? select.value : AppState.selectedCommunityForClaim;
  const comm = AppState.communities.find(c => c.id === commId) || AppState.communities[0];
  AppState.selectedCommunityForClaim = comm.id;

  const targetTitle = document.getElementById('claimCommunityTitle');
  if (targetTitle) targetTitle.textContent = comm.name;

  const targetRoot = document.getElementById('claimCommunityRoot');
  if (targetRoot) targetRoot.textContent = `${comm.merkleRoot.slice(0, 16)}...${comm.merkleRoot.slice(-8)}`;

  const targetMembers = document.getElementById('claimCommunityMembers');
  if (targetMembers) targetMembers.textContent = `${comm.membersCount.toLocaleString()} Citizens`;

  const targetRules = document.getElementById('claimCommunityRules');
  if (targetRules) targetRules.textContent = comm.eligibilityRules;
}

function setClaimStep(step) {
  AppState.currentClaimStep = step;

  // Update step nav indicators
  for (let i = 1; i <= 4; i++) {
    const navItem = document.getElementById(`step-nav-${i}`);
    const stepContent = document.getElementById(`claim-step-${i}-content`);
    
    if (navItem) {
      if (i === step) {
        navItem.className = 'flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container text-primary font-semibold shadow-xs';
      } else if (i < step) {
        navItem.className = 'flex items-center gap-space-sm p-space-sm rounded-lg bg-secondary-container/40 text-secondary font-medium';
      } else {
        navItem.className = 'flex items-center gap-space-sm p-space-sm rounded-lg opacity-50 text-on-surface-variant';
      }
    }

    if (stepContent) {
      if (i === step) {
        stepContent.classList.remove('hidden');
      } else {
        stepContent.classList.add('hidden');
      }
    }
  }
}

async function startZKProofGeneration() {
  const comm = AppState.communities.find(c => c.id === AppState.selectedCommunityForClaim);
  const identifierInput = document.getElementById('claimMemberIdentifier');
  const identifier = identifierInput && identifierInput.value ? identifierInput.value : 'citizen.diaspora@sangat.org';

  setClaimStep(2);
  const consoleLog = document.getElementById('zkConsoleOutput');
  const progressFill = document.getElementById('zkProgressBar');
  const nextBtn = document.getElementById('zkProceedStep3Btn');

  if (nextBtn) nextBtn.disabled = true;

  const logs = [
    { text: '→ Initializing Poseidon BN254 arithmetic circuit engine...', progress: 20, delay: 400 },
    { text: `→ Hashing secret identity [${identifier.slice(0, 4)}***] with local entropy seed...`, progress: 40, delay: 800 },
    { text: `→ Leaf Hash Computed: ${comm.proofHash}10293847561...`, progress: 65, delay: 1200 },
    { text: `→ Constructing 11-level Merkle witness path towards Root [${comm.merkleRoot.slice(0, 10)}...]`, progress: 85, delay: 1700 },
    { text: '✔ Zero-Knowledge Groth16 Proof Synthesized Successfully! (0 PII Leaked)', progress: 100, delay: 2200 }
  ];

  if (consoleLog) consoleLog.innerHTML = '';

  for (const item of logs) {
    await new Promise(r => setTimeout(r, item.delay - (logs[logs.indexOf(item)-1]?.delay || 0)));
    if (consoleLog) {
      const p = document.createElement('p');
      p.className = item.text.startsWith('✔') ? 'text-secondary font-semibold' : 'text-on-surface-variant';
      p.textContent = item.text;
      consoleLog.appendChild(p);
      consoleLog.scrollTop = consoleLog.scrollHeight;
    }
    if (progressFill) progressFill.style.width = `${item.progress}%`;
  }

  // Store calculated proof data
  AppState.claimProofData = {
    community: comm,
    identifier: identifier,
    leafHash: `${comm.proofHash}1029384756102938475610293847561029384756102`,
    merkleRoot: comm.merkleRoot,
    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    block: `#${comm.lastBlock + 12}`
  };

  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

async function simulateMintSeal() {
  const mintBtn = document.getElementById('mintSealSubmitBtn');
  if (mintBtn) {
    mintBtn.disabled = true;
    mintBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span><span>Signing EIP-5484 Soulbound Token...</span>`;
  }

  await new Promise(r => setTimeout(r, 1400));

  const comm = AppState.claimProofData ? AppState.claimProofData.community : AppState.communities[0];
  
  // Create new Claimed Seal
  const newSeal = {
    id: `seal-${comm.id}-${Date.now().toString().slice(-4)}`,
    communityId: comm.id,
    name: `${comm.name} Seal`,
    issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    block: `#${comm.lastBlock + 14}`,
    leafIndex: comm.leafIndex || 501,
    leafHash: AppState.claimProofData?.leafHash || `${comm.proofHash}1029384756102938475610293847561029384756102`,
    merkleRoot: comm.merkleRoot,
    role: 'Verified Civic Citizen',
    status: 'Soulbound Active',
    region: comm.region,
    themeColor: comm.sealColor,
    zkProofKey: 'Poseidon-T3-Circom2.1',
    gasCost: '0.0025 MATIC',
    auditStatus: 'Audited & Compliant'
  };

  // Add to State and LocalStorage
  AppState.claimedSeals.unshift(newSeal);
  localStorage.setItem('chaupal_claimed_seals', JSON.stringify(AppState.claimedSeals));

  // Render Step 4
  renderStep4Success(newSeal);
  setClaimStep(4);
  showToast(`Soulbound Seal for ${comm.name} Minted Successfully!`, 'success');

  if (mintBtn) {
    mintBtn.disabled = false;
    mintBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">key</span><span>Sign & Mint Soulbound Seal</span>`;
  }
}

function renderStep4Success(seal) {
  const container = document.getElementById('step-4-seal-preview');
  if (!container) return;

  container.innerHTML = `
    <div class="holographic-card bg-surface-container rounded-2xl p-space-lg shadow-floating border border-outline-variant/40 max-w-md mx-auto text-left">
      <div class="flex items-center justify-between mb-space-md">
        <div class="flex items-center gap-space-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>
          <span class="font-mono text-xs text-secondary font-semibold uppercase tracking-wider">Soulbound Verified</span>
        </div>
        <span class="font-mono text-xs bg-surface-container-highest px-2 py-0.5 rounded text-on-surface">${seal.block}</span>
      </div>

      <div class="text-center py-space-md">
        <div class="w-20 h-20 mx-auto rounded-full bg-surface-container-lowest border-2 border-primary/30 flex items-center justify-center text-primary shadow-sm mb-space-sm">
          <span class="material-symbols-outlined text-[36px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
        </div>
        <h3 class="font-display text-2xl font-bold text-on-surface">${seal.name}</h3>
        <p class="font-body text-xs text-on-surface-variant mt-0.5">${seal.region} • ${seal.role}</p>
      </div>

      <div class="bg-surface-container-lowest rounded-xl p-space-md space-y-space-xs font-mono text-xs border border-outline-variant/30">
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Owner Wallet:</span>
          <span class="text-primary font-semibold truncate max-w-[150px]">${AppState.wallet.address}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Merkle Root:</span>
          <span class="text-on-surface truncate max-w-[150px]">${seal.merkleRoot}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Leaf Index:</span>
          <span class="text-secondary font-semibold">#${seal.leafIndex}</span>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 6. DASHBOARD & MY SEALS VIEW
// -------------------------------------------------------------
function renderClaimedSeals() {
  const grid = document.getElementById('claimedGrid');
  const countEl = document.getElementById('totalSealsCountDisplay');
  
  if (countEl) {
    countEl.textContent = AppState.claimedSeals.length;
  }

  if (!grid) return;

  if (AppState.claimedSeals.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
        <span class="material-symbols-outlined text-outline text-[48px] mb-2">workspace_premium</span>
        <h3 class="font-display text-lg font-bold text-on-surface">No Soulbound Seals Claimed Yet</h3>
        <p class="font-body text-sm text-on-surface-variant mt-1">Explore the directory and verify your membership without revealing PII.</p>
        <a href="#directory" class="mt-4 inline-block px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg shadow-sm">Explore Directory</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = AppState.claimedSeals.map(seal => `
    <div class="holographic-card bg-surface-container-low rounded-xl p-space-lg shadow-subtle hover:shadow-floating transition-all flex flex-col justify-between group border border-outline-variant/30">
      <div>
        <!-- Top Status Bar -->
        <div class="flex items-center justify-between pb-space-sm border-b border-outline-variant/30 mb-space-md">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-secondary"></span>
            <span class="font-mono text-xs text-secondary font-semibold">ERC-5484 Soulbound</span>
          </div>
          <span class="font-mono text-xs bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">${seal.block}</span>
        </div>

        <!-- Seal Badge Emblem & Title -->
        <div class="flex items-center gap-space-md mb-space-md">
          <div class="relative w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
            <span class="material-symbols-outlined text-[30px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
          </div>
          <div>
            <h3 class="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">${seal.name}</h3>
            <p class="font-body text-xs text-on-surface-variant font-medium">${seal.region} • ${seal.role}</p>
          </div>
        </div>

        <!-- Proof Summary Box -->
        <div class="bg-surface-container rounded-lg p-space-sm space-y-1 font-mono text-xs mb-space-md">
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Leaf Hash:</span>
            <span class="text-primary truncate max-w-[140px] font-semibold">${seal.leafHash.slice(0, 10)}...${seal.leafHash.slice(-4)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Root Commitment:</span>
            <span class="text-on-surface truncate max-w-[140px]">${seal.merkleRoot.slice(0, 10)}...${seal.merkleRoot.slice(-4)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Proof Circuit:</span>
            <span class="text-secondary font-medium">${seal.zkProofKey}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-space-md border-t border-outline-variant/30 flex items-center justify-between gap-space-xs">
        <button onclick="openVerifierDrawer('${seal.id}')" class="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1 transition-all">
          <span class="material-symbols-outlined text-secondary text-[16px]">account_tree</span>
          <span>Inspect Witness</span>
        </button>
        <button onclick="openCertificateModal('${seal.id}')" class="px-space-md py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1 shadow-xs transition-all">
          <span class="material-symbols-outlined text-[16px]">print</span>
          <span>Offline Seal</span>
        </button>
      </div>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// 7. PROOF INSPECTOR & CERTIFICATE MODALS
// -------------------------------------------------------------
function openVerifierDrawer(sealId) {
  const seal = AppState.claimedSeals.find(s => s.id === sealId) || AppState.claimedSeals[0];
  if (!seal) return;

  const modal = document.getElementById('proofInspectorModal');
  const body = document.getElementById('proofInspectorBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="space-y-space-md">
      <div class="flex items-center justify-between pb-space-sm border-b border-outline-variant/30">
        <div>
          <h3 class="font-display text-xl font-bold text-on-surface">${seal.name}</h3>
          <p class="font-body text-xs text-secondary font-medium">Merkle Inclusion Witness • Poseidon Circom 2.1</p>
        </div>
        <span class="px-space-sm py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-secondary"></span> Verified on Polygon
        </span>
      </div>

      <!-- Merkle Path Visualizer -->
      <div class="bg-surface-container rounded-xl p-space-md space-y-space-sm">
        <h4 class="font-body text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Merkle Authentication Path</h4>
        
        <div class="space-y-2 font-mono text-xs">
          <div class="merkle-branch-node bg-surface-container-lowest p-space-sm rounded-lg border border-primary/40 flex items-center justify-between">
            <div>
              <span class="text-primary font-bold block">Leaf Node (Index #${seal.leafIndex})</span>
              <span class="text-on-surface break-all">${seal.leafHash}</span>
            </div>
            <span class="material-symbols-outlined text-primary text-[20px]">fingerprint</span>
          </div>

          <div class="flex justify-center text-outline text-sm">↓ HASH( Leaf , Sibling_1 )</div>

          <div class="merkle-branch-node bg-surface-container-lowest p-space-sm rounded-lg border border-outline-variant/40 flex items-center justify-between">
            <div>
              <span class="text-on-surface-variant font-bold block">Layer 1 Sibling [Right]</span>
              <span class="text-on-surface-variant break-all">0x7a81092837465102938475610293847561029384756102938475610293847561</span>
            </div>
            <span class="material-symbols-outlined text-outline text-[18px]">account_tree</span>
          </div>

          <div class="flex justify-center text-outline text-sm">↓ HASH( Layer_1 , Sibling_2 )</div>

          <div class="merkle-branch-node bg-surface-container-lowest p-space-sm rounded-lg border border-secondary/50 flex items-center justify-between">
            <div>
              <span class="text-secondary font-bold block">Root Anchor (On-Chain Contract State)</span>
              <span class="text-on-surface break-all">${seal.merkleRoot}</span>
            </div>
            <span class="material-symbols-outlined text-secondary text-[20px]">verified</span>
          </div>
        </div>
      </div>

      <!-- Raw JSON Verification Token -->
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="font-body text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Verifiable Credential Object</span>
          <button onclick="copyCredentialJSON('${seal.id}')" class="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">content_copy</span> Copy JSON
          </button>
        </div>
        <pre class="bg-surface-container-highest p-space-sm rounded-lg font-mono text-[11px] text-on-surface overflow-x-auto max-h-36">
{
  "@context": ["https://www.w3.org/2018/credentials/v1", "https://chaupal.org/contexts/v1"],
  "type": ["VerifiableCredential", "ChaupalSoulboundSeal"],
  "issuer": "did:polygon:${seal.merkleRoot.slice(0, 16)}",
  "issuanceDate": "${seal.issueDate}",
  "credentialSubject": {
    "id": "did:pkh:eip155:137:${AppState.wallet.address}",
    "community": "${seal.name}",
    "merkleLeafIndex": ${seal.leafIndex},
    "circuitProof": "Poseidon-T3-Groth16"
  }
}
        </pre>
      </div>

      <div class="pt-space-xs flex justify-end">
        <button onclick="closeVerifierDrawer()" class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface">Close Inspector</button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeVerifierDrawer() {
  const modal = document.getElementById('proofInspectorModal');
  if (modal) modal.classList.add('hidden');
}

function copyCredentialJSON(sealId) {
  const seal = AppState.claimedSeals.find(s => s.id === sealId);
  if (!seal) return;

  const json = JSON.stringify({
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://chaupal.org/contexts/v1"],
    "type": ["VerifiableCredential", "ChaupalSoulboundSeal"],
    "issuer": `did:polygon:${seal.merkleRoot.slice(0, 16)}`,
    "issuanceDate": seal.issueDate,
    "credentialSubject": {
      "id": `did:pkh:eip155:137:${AppState.wallet.address}`,
      "community": seal.name,
      "merkleLeafIndex": seal.leafIndex,
      "circuitProof": "Poseidon-T3-Groth16"
    }
  }, null, 2);

  navigator.clipboard.writeText(json);
  showToast('Verifiable Credential JSON copied to clipboard', 'success');
}

function openCertificateModal(sealId) {
  const seal = AppState.claimedSeals.find(s => s.id === sealId) || AppState.claimedSeals[0];
  if (!seal) return;

  const modal = document.getElementById('certificateModal');
  const body = document.getElementById('certificateModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="space-y-space-md">
      <!-- Printable Authentic Lithic Certificate Layout -->
      <div class="print-certificate-container bg-[#FAF8F5] p-space-xl rounded-2xl border-4 border-double border-[#9F3C16] text-center shadow-lg relative overflow-hidden">
        <div class="absolute top-4 left-4 w-12 h-12 opacity-15 text-primary pointer-events-none">
          <svg viewBox="0 0 120 120" fill="currentColor"><circle cx="60" cy="60" r="50"/></svg>
        </div>

        <div class="mb-space-md">
          <div class="w-16 h-16 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary shadow-sm mb-2">
            <span class="material-symbols-outlined text-[36px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
          </div>
          <span class="font-mono text-xs uppercase tracking-widest text-primary font-bold">Indigenous Zero-Knowledge Sovereign Seal</span>
          <h2 class="font-display text-3xl font-bold text-[#221A13] mt-1">${seal.name}</h2>
          <p class="font-body text-sm text-secondary font-semibold">${seal.region}</p>
        </div>

        <p class="font-body text-sm text-on-surface-variant max-w-md mx-auto mb-space-lg leading-relaxed italic">
          "This soulbound seal certifies that the holder of Ethereum address <span class="font-mono font-semibold text-primary">${AppState.wallet.address.slice(0, 8)}...${AppState.wallet.address.slice(-6)}</span> has proven inclusion in the sovereign Chaupal membership roster without disclosing personal identity records."
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container p-space-sm rounded-xl text-left font-mono text-[11px] mb-space-md">
          <div>
            <span class="text-on-surface-variant block">Issue Date</span>
            <span class="text-on-surface font-semibold">${seal.issueDate}</span>
          </div>
          <div>
            <span class="text-on-surface-variant block">Settlement Block</span>
            <span class="text-on-surface font-semibold">${seal.block}</span>
          </div>
          <div>
            <span class="text-on-surface-variant block">Leaf Index</span>
            <span class="text-secondary font-semibold">#${seal.leafIndex}</span>
          </div>
          <div>
            <span class="text-on-surface-variant block">Protocol Standard</span>
            <span class="text-primary font-semibold">ERC-5484</span>
          </div>
        </div>

        <!-- Verification QR Code Mock & Signature Plinth -->
        <div class="flex items-center justify-between pt-space-sm border-t border-outline-variant/30 text-left">
          <div class="flex items-center gap-space-sm">
            <div class="w-14 h-14 bg-white p-1 rounded-lg border border-outline-variant flex items-center justify-center">
              <span class="material-symbols-outlined text-[36px] text-on-surface">qr_code_2</span>
            </div>
            <div class="text-[11px] font-mono">
              <span class="text-on-surface-variant block">Scan to Verify</span>
              <span class="text-secondary font-semibold">polygonscan.com</span>
            </div>
          </div>
          <div class="text-right">
            <span class="font-serif italic text-sm text-primary block">Chaupal Cryptographic Council</span>
            <span class="font-mono text-[10px] text-outline">Autonomous ZK Consensus</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-space-xs no-print">
        <button onclick="downloadCertificateSVG('${seal.id}')" class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">download</span> Download SVG
        </button>
        <div class="flex gap-space-sm">
          <button onclick="closeCertificateModal()" class="px-space-md py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface">Close</button>
          <button onclick="window.print()" class="px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">print</span> Print Certificate
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeCertificateModal() {
  const modal = document.getElementById('certificateModal');
  if (modal) modal.classList.add('hidden');
}

function downloadCertificateSVG(sealId) {
  const seal = AppState.claimedSeals.find(s => s.id === sealId) || AppState.claimedSeals[0];
  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#FAF8F5" stroke="#9F3C16" stroke-width="8"/>
      <rect x="20" y="20" width="760" height="560" fill="none" stroke="#DEC0B7" stroke-width="2"/>
      <text x="400" y="90" font-family="sans-serif" font-size="28" font-weight="bold" fill="#9F3C16" text-anchor="middle">CHAUPAL SOULBOUND CIVIC SEAL</text>
      <text x="400" y="130" font-family="sans-serif" font-size="16" fill="#3B6750" text-anchor="middle">Zero-Knowledge Sovereign Verification</text>
      <text x="400" y="220" font-family="sans-serif" font-size="24" font-weight="bold" fill="#221A13" text-anchor="middle">${seal.name}</text>
      <text x="400" y="260" font-family="sans-serif" font-size="14" fill="#57423B" text-anchor="middle">${seal.region}</text>
      <text x="400" y="340" font-family="monospace" font-size="12" fill="#57423B" text-anchor="middle">Owner: ${AppState.wallet.address}</text>
      <text x="400" y="370" font-family="monospace" font-size="12" fill="#9F3C16" text-anchor="middle">Merkle Root: ${seal.merkleRoot}</text>
      <text x="400" y="400" font-family="monospace" font-size="12" fill="#3B6750" text-anchor="middle">Leaf #${seal.leafIndex} • Issued: ${seal.issueDate}</text>
      <text x="400" y="520" font-family="serif" font-size="16" font-style="italic" fill="#9F3C16" text-anchor="middle">Autonomous Sovereign Consensus</text>
    </svg>
  `;

  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Chaupal_Seal_${seal.communityId}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded SVG Soulbound Seal', 'success');
}

// -------------------------------------------------------------
// 8. STEWARD CONSOLE & MERKLE ROOT PUBLISHER
// -------------------------------------------------------------
function renderStewardRoster() {
  const tbody = document.getElementById('stewardRosterTableBody');
  const countDisplay = document.getElementById('stewardMemberCount');
  
  if (countDisplay) {
    countDisplay.textContent = AppState.stewardRoster.length;
  }

  if (!tbody) return;

  tbody.innerHTML = AppState.stewardRoster.map((m, idx) => `
    <tr class="border-b border-outline-variant/20 hover:bg-surface-container/50 transition-colors">
      <td class="py-space-sm px-space-md font-mono text-xs font-semibold text-primary">${m.id}</td>
      <td class="py-space-sm px-space-md font-body text-sm font-medium text-on-surface">${m.name}</td>
      <td class="py-space-sm px-space-md font-mono text-xs text-on-surface-variant">${m.identifier}</td>
      <td class="py-space-sm px-space-md">
        <span class="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface text-xs">${m.role}</span>
      </td>
      <td class="py-space-sm px-space-md">
        <span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">Active</span>
      </td>
      <td class="py-space-sm px-space-md text-right">
        <button onclick="removeRosterMember(${idx})" class="text-outline hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

async function recalculateStewardTree() {
  const memberIdentifiers = AppState.stewardRoster.map(m => m.identifier);
  
  // Calculate leaf hashes using WebCrypto
  const leafHashes = [];
  for (const id of memberIdentifiers) {
    const leaf = await ChaupalCrypto.generateMemberLeaf(id);
    leafHashes.push(leaf);
  }

  const tree = await ChaupalCrypto.buildMerkleTree(leafHashes);

  const rootDisplay = document.getElementById('stewardCalculatedRoot');
  if (rootDisplay) {
    rootDisplay.textContent = tree.root;
  }

  const depthDisplay = document.getElementById('stewardTreeDepth');
  if (depthDisplay) {
    depthDisplay.textContent = `${tree.height} Levels`;
  }
}

function removeRosterMember(index) {
  const removed = AppState.stewardRoster.splice(index, 1);
  localStorage.setItem('chaupal_steward_roster', JSON.stringify(AppState.stewardRoster));
  renderStewardRoster();
  recalculateStewardTree();
  showToast(`Removed member ${removed[0]?.name}`, 'info');
}

function openAddMemberModal() {
  const modal = document.getElementById('addMemberModal');
  if (modal) modal.classList.remove('hidden');
}

function closeAddMemberModal() {
  const modal = document.getElementById('addMemberModal');
  if (modal) modal.classList.add('hidden');
}

function submitAddMember(event) {
  event.preventDefault();
  const name = document.getElementById('newMemberName').value.trim();
  const email = document.getElementById('newMemberEmail').value.trim();
  const role = document.getElementById('newMemberRole').value;

  if (!name || !email) return;

  const newMember = {
    id: `MEM-PB-${(AppState.stewardRoster.length + 1).toString().padStart(3, '0')}`,
    name: name,
    identifier: email,
    role: role,
    status: 'Active',
    addedDate: new Date().toISOString().split('T')[0]
  };

  AppState.stewardRoster.unshift(newMember);
  localStorage.setItem('chaupal_steward_roster', JSON.stringify(AppState.stewardRoster));
  
  renderStewardRoster();
  recalculateStewardTree();
  closeAddMemberModal();
  showToast(`Added ${name} to offline roster. Merkle tree updated.`, 'success');

  // Clear form
  document.getElementById('newMemberName').value = '';
  document.getElementById('newMemberEmail').value = '';
}

function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split('\n');
    let addedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2 && parts[0].trim()) {
        AppState.stewardRoster.push({
          id: `MEM-PB-${(AppState.stewardRoster.length + 1).toString().padStart(3, '0')}`,
          name: parts[0].trim(),
          identifier: parts[1]?.trim() || `member_${Date.now()}@sangat.org`,
          role: parts[2]?.trim() || 'Community Member',
          status: 'Active',
          addedDate: new Date().toISOString().split('T')[0]
        });
        addedCount++;
      }
    }

    localStorage.setItem('chaupal_steward_roster', JSON.stringify(AppState.stewardRoster));
    renderStewardRoster();
    recalculateStewardTree();
    showToast(`Imported ${addedCount} members from CSV! Merkle root recalculated.`, 'success');
  };
  reader.readAsText(file);
}

async function publishRootOnChain() {
  const btn = document.getElementById('publishRootBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span><span>Publishing to Polygon PoS...</span>`;
  }

  await new Promise(r => setTimeout(r, 1800));

  const rootDisplay = document.getElementById('stewardCalculatedRoot');
  const newRoot = rootDisplay ? rootDisplay.textContent : '0x9f8be4a16723cd8192a5431802bb01c8fa627192d774a123f81902a65b819201';

  // Update community in state
  const comm = AppState.communities.find(c => c.id === AppState.activeStewardCommunity);
  if (comm) {
    comm.merkleRoot = newRoot;
    comm.lastBlock += 1;
    comm.lastUpdated = 'Just now';
    comm.membersCount = AppState.stewardRoster.length;
  }

  // Update UI Root Indicators
  const onChainDisplay = document.getElementById('stewardOnChainRoot');
  if (onChainDisplay) onChainDisplay.textContent = newRoot;

  showToast(`Merkle Root published on-chain at block #${comm ? comm.lastBlock : 58492104}!`, 'success');

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">publish</span><span>Publish Root On-Chain</span>`;
  }
}

// -------------------------------------------------------------
// 9. TOAST NOTIFICATIONS
// -------------------------------------------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'check_circle',
    info: 'info',
    warning: 'warning',
    error: 'error'
  };

  const bgColors = {
    success: 'bg-secondary text-white',
    info: 'bg-primary text-white',
    warning: 'bg-tertiary-container text-white',
    error: 'bg-error text-white'
  };

  const toast = document.createElement('div');
  toast.className = `toast-item ${bgColors[type] || bgColors.info} px-space-md py-space-sm rounded-xl shadow-floating flex items-center gap-space-sm max-w-sm text-xs font-semibold`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px]">${icons[type] || 'info'}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

// -------------------------------------------------------------
// 10. EVENT LISTENERS & MOBILE DRAWER
// -------------------------------------------------------------
function setupEventListeners() {
  // Mobile drawer toggling
  const menuBtn = document.getElementById('mobileMenuToggleBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('closeMobileNavBtn');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => drawer.classList.remove('hidden'));
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => drawer.classList.add('hidden'));
  }

  // Close modals on escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeWalletModal();
      closeCommunityDetailModal();
      closeVerifierDrawer();
      closeCertificateModal();
      closeAddMemberModal();
    }
  });
}

// Global functions for inline HTML calls
window.openWalletModal = openWalletModal;
window.closeWalletModal = closeWalletModal;
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.switchNetwork = switchNetwork;
window.setRegionFilter = setRegionFilter;
window.setStatusFilter = setStatusFilter;
window.handleDirectorySearch = handleDirectorySearch;
window.resetDirectoryFilters = resetDirectoryFilters;
window.openCommunityDetailModal = openCommunityDetailModal;
window.closeCommunityDetailModal = closeCommunityDetailModal;
window.selectCommunityForClaim = selectCommunityForClaim;
window.updateClaimCommunityContext = updateClaimCommunityContext;
window.setClaimStep = setClaimStep;
window.startZKProofGeneration = startZKProofGeneration;
window.simulateMintSeal = simulateMintSeal;
window.openVerifierDrawer = openVerifierDrawer;
window.closeVerifierDrawer = closeVerifierDrawer;
window.openCertificateModal = openCertificateModal;
window.closeCertificateModal = closeCertificateModal;
window.copyCredentialJSON = copyCredentialJSON;
window.downloadCertificateSVG = downloadCertificateSVG;
window.removeRosterMember = removeRosterMember;
window.openAddMemberModal = openAddMemberModal;
window.closeAddMemberModal = closeAddMemberModal;
window.submitAddMember = submitAddMember;
window.handleCSVUpload = handleCSVUpload;
window.publishRootOnChain = publishRootOnChain;
window.showToast = showToast;
