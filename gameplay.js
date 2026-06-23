function upgradeIncidentsForCommunitySimulation() {
  // Incident content is already upgraded in the main incidents array.
}

upgradeIncidentsForCommunitySimulation();



/* =========================================================
   MANGROVE RESCUE — GAME LOGIC
   budget locks + RM 0 fallback
   ========================================================= */

'use strict';


/* ===================== DOM HELPERS ===================== */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const formatRM = (value) => `RM ${value.toLocaleString('en-MY')}`;

const boatState = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2,
  rotation: 0,
  animationStarted: false
};
const collectionRadius = 94;

/* ===================== INITIALIZATION ===================== */
document.addEventListener('DOMContentLoaded', () => {
  bindStaticEvents();

  renderIncidentMarkers();
  updateStats();
  updateSitePanel('borneo');
  applyStatusVisuals();
  postBudgetAdvisor();
  startBoatCursor();
});

function bindStaticEvents() {
  $('#beginBtn').addEventListener('click', startMission);
  $('#simTitleHomeBtn').addEventListener('click', exitMission);
  $('#closeIncidentBtn').addEventListener('click', closeIncidentModal);
  $('#confirmDecisionBtn').addEventListener('click', chooseOption);
  $('#resultCloseBtn').addEventListener('click', hideResultPopup);
  $('#resultContinueBtn').addEventListener('click', hideResultPopup);
  bindResourceGroupClick('#fishSets', 'fishing');
  bindResourceGroupClick('#fishBoatBtn', 'fishing');
  bindResourceGroupClick('#shrimpSets', 'shrimp');
  bindResourceGroupClick('#crabSets', 'crab');
  $('#closeIncomeBtn')?.addEventListener('click', closeIncomeModal);
  $('#villageReportBtn')?.addEventListener('click', openVillageReport);

  $('#viewReportBtn')?.addEventListener('click', showFinalReport);
  $('#closeReportBtn').addEventListener('click', closeReportModal);
  $('#closeReportBtn2').addEventListener('click', closeReportModal);
  $('#restartBtn').addEventListener('click', restartMission);

  $('#stage').addEventListener('mousemove', (event) => {
    if (isInteractiveUiTarget(event.target) || isGameUiOpen()) return;
    setBoatTarget(event.clientX, event.clientY);
  });
  $('#stage').addEventListener('pointerdown', (event) => {
    if (isInteractiveUiTarget(event.target) || isGameUiOpen()) return;
    jumpBoatToTarget(event.clientX, event.clientY);
  });
  $('#stage').addEventListener('touchmove', (event) => {
    if (isInteractiveUiTarget(event.target) || isGameUiOpen()) return;
    const touch = event.touches[0];
    if (touch) setBoatTarget(touch.clientX, touch.clientY);
  }, { passive: true });
  $('#stage').addEventListener('touchstart', (event) => {
    if (isInteractiveUiTarget(event.target) || isGameUiOpen()) return;
    const touch = event.touches[0];
    if (touch) jumpBoatToTarget(touch.clientX, touch.clientY);
  }, { passive: true });

  $$('.hotspot').forEach((marker) => {
    marker.addEventListener('click', () => updateSitePanel(marker.dataset.site));
  });

  $('#incidentModal').addEventListener('click', (event) => {
    if (event.target.id === 'incidentModal') closeIncidentModal();
  });
  $('#reportModal').addEventListener('click', (event) => {
    if (event.target.id === 'reportModal') closeReportModal();
  });
  $('#incomeModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'incomeModal') closeIncomeModal();
  });
}

function bindResourceGroupClick(selector, type) {
  const el = $(selector);
  if (!el) return;
  el.addEventListener('click', (event) => {
    event.stopPropagation();
    openIncomeModal(type);
  });
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openIncomeModal(type);
    }
  });
}

function isGameUiOpen() {
  return $('#incidentModal')?.classList.contains('open') ||
    $('#reportModal')?.classList.contains('open') ||
    $('#incomeModal')?.classList.contains('open') ||
    $('#resultPopup')?.classList.contains('show');
}

function syncCursorMode() {
  document.body.classList.toggle('ui-popup-open', Boolean(isGameUiOpen()));
}

function isInteractiveUiTarget(target) {
  return Boolean(target.closest('.result-popup, .modal-overlay, button, a, input, textarea, select'));
}

function startMission() {
  $('#home').classList.remove('active');
  $('#game').classList.add('active');
  const stage = $('#stage');
  if (stage) {
    const rect = stage.getBoundingClientRect();
    boatState.x = rect.width / 2;
    boatState.y = rect.height / 2;
    boatState.targetX = boatState.x;
    boatState.targetY = boatState.y;
  }
  syncCursorMode();
  postBudgetAdvisor();
  window.scrollTo(0, 0);
}

function exitMission() {
  clearFinalReportAutoOpen();
  hideResultPopup();
  closeIncidentModal();
  closeIncomeModal();
  closeReportModal();
  $('#game').classList.remove('active');
  $('#home').classList.add('active');
  syncCursorMode();
  window.scrollTo(0, 0);
}

/* ===================== HOME MAP SYSTEM ===================== */
function updateSitePanel(siteId) {
  const site = sites[siteId];
  state.selectedSite = siteId;
  $$('.hotspot').forEach((marker) => marker.classList.toggle('active', marker.dataset.site === siteId));
  $('#siteName').textContent = site.name;
  $('#siteLocation').textContent = '📍' + site.location;
  $('#siteThreat').textContent = site.threat;
  $('#siteMission').textContent = site.mission;
  $('#siteFact').textContent = site.fact;
}

/* ===================== STATUS + STATS SYSTEM ===================== */
function getEcosystemScore() {
  // Overall status score combines hidden ecosystem health, biodiversity,
  // community welfare, and reduced pollution pressure.
  return Math.round((state.health + state.biodiversity + state.community + (100 - state.pollution)) / 4);
}

function getStatus(score = getEcosystemScore()) {
  if (score < 25) return 'Critical';
  if (score < 50) return 'Stressed';
  if (score < 75) return 'Recovering';
  return 'Healthy';
}

function getStatusClass(status = getStatus()) {
  return `status-${String(status).toLowerCase()}`;
}

function clampStats() {
  state.pollution = clamp(state.pollution);
  state.biodiversity = clamp(state.biodiversity);
  state.health = clamp(state.health);
  state.fish = clamp(state.fish);
  state.shrimp = clamp(state.shrimp);
  state.community = clamp(state.community);
  state.budget = Math.max(0, state.budget);
}


function getCommunityProgressLabel() {
  if (state.finalReportReady || state.greatChoices >= 8 || state.community >= 80) return '🏘️ Thriving Community';
  if (state.greatChoices >= 6 || state.community >= 65) return '🏠 Coastal Village';
  if (state.greatChoices >= 4 || state.community >= 55) return '🎣 Fishing Cooperative';
  if (state.greatChoices >= 2 || state.community >= 48) return '👥 Volunteer Network';
  return 'Not Established';
}

function updateStats() {
  clampStats();
  const score = getEcosystemScore();
  const status = getStatus(score);
  const statusClass = getStatusClass(status);
  const resolved = state.resolved.size;
  const progressPercent = (resolved / incidents.length) * 100;

  const setText = (id, value) => { const el = $(id); if (el) el.textContent = value; };
  const setWidth = (id, value) => { const el = $(id); if (el) el.style.width = `${clamp(value)}%`; };

  setText('#budgetVal', formatRM(state.budget));
  setText('#progressVal', `${resolved}/${incidents.length}`);
  setWidth('#progressFill', progressPercent);

  setText('#biodiversityVal', state.biodiversity);
  setWidth('#biodiversityFill', state.biodiversity);

  setText('#communityVal', getCommunityProgressLabel());
  setWidth('#communityFill', state.community);

  const statusVal = $('#statusVal');
  if (statusVal) {
    statusVal.textContent = status;
    statusVal.className = `metric-value status-badge ${statusClass}`;
  }
  const statusFill = $('#statusFill');
  if (statusFill) {
    statusFill.style.width = `${score}%`;
    statusFill.className = `fill status-fill ${statusClass}`;
  }

  applyStatusVisuals();
}

function applyEffects(effects) {
  state.pollution += effects.pollution || 0;
  state.biodiversity += effects.biodiversity || 0;
  state.health += effects.health || 0;
  state.fish += effects.fish || 0;
  state.shrimp += effects.shrimp || 0;
  state.community += effects.community || 0;
  if (effects.budgetBonus) state.budget += effects.budgetBonus;
  clampStats();
}

/* ===================== GAME SCENE SYSTEM ===================== */


function renderIncidentMarkers() {
  $('#incidentLayer').innerHTML = incidents.map((incident) => createIncidentMarkerHtml(incident)).join('');
  $$('.incident-marker').forEach((marker) => {
    marker.addEventListener('click', () => openIncident(Number(marker.dataset.id)));
  });
}

function createIncidentMarkerHtml(incident) {
  const isResolved = state.resolved.has(incident.id);
  const label = isResolved ? 'RESOLVED' : 'ACTIVE INCIDENT';
  const warningIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`;
  const resolvedIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5"></path>
    </svg>`;

  return `
    <button class="incident-marker incident-pos-${incident.id} ${isResolved ? 'resolved' : ''}" data-id="${incident.id}" aria-label="${label}: ${incident.title}">
      <span class="marker-btn">${isResolved ? resolvedIcon : warningIcon}</span>
      <span class="marker-num">${incident.marker || String(incident.id).padStart(2, '0')}</span>
    </button>
  `;
}

function applyStatusVisuals() {
  const status = getStatus();
  const statusClass = getStatusClass(status);
  const scene = $('#scene');
  if (scene) {
    scene.classList.remove('status-critical', 'status-stressed', 'status-recovering', 'status-healthy', 'status-degraded');
    scene.classList.add(statusClass);
    const stressed = status === 'Critical' || status === 'Stressed' || state.biodiversity < 35 || state.fish < 30 || state.shrimp < 30;
    scene.classList.toggle('wildlife-stressed', stressed);
  }

  const progress = state.resolved.size / incidents.length;
  $$('.pollution-cluster').forEach((cluster) => {
    cluster.classList.toggle('resolved', state.resolved.has(Number(cluster.dataset.clusterId)));
  });
  $('#fishGroup')?.classList.toggle('visible', state.fish >= 50 || state.biodiversity >= 58 || state.health >= 62 || progress > .35);
  $('#coralGroup')?.classList.toggle('visible', state.biodiversity >= 70 || state.health >= 80 || progress > .65);
  $('#crabGroup')?.classList.toggle('visible', state.fish >= 60 || state.health >= 65 || progress > .45);
  updateRecoverySetVisuals();
  updateFishermanVisuals();
  updateLivelihoodVisuals();
  updateTreeGrowthVisuals();
}


/* =====================================================
   TREE GROWTH LOGIC
  The growth is based on BOTH:
   1) Great restoration choices made by the player
   2) Ecosystem statistics such as health, biodiversity, and fish population

===================================================== */
function getTreeStage() {

  if (state.greatChoices >= 6) return 3;
  if (state.greatChoices >= 4) return 2;
  if (state.greatChoices >= 2) return 1;

  // Stat route: still allows growth if ecosystem values become strong.
  if (state.health >= 75 || (state.biodiversity >= 70 && state.fish >= 65)) return 3;
  if (state.health >= 60 || (state.biodiversity >= 60 && state.fish >= 55)) return 2;
  if (state.health >= 42 || (state.biodiversity >= 45 && state.fish >= 45)) return 1;
  return 0;
}

function getTreeAssetForStage(stage) {
  return 'asset/mangrovetree.png';
}

function updateTreeGrowthVisuals(forcePop = false) {
  const scene = $('#scene');
  if (!scene) return;

  const nextStage = getTreeStage();
  const previousStage = state.treeStage || 0;
  state.treeStage = nextStage;

  scene.classList.remove('tree-stage-0', 'tree-stage-1', 'tree-stage-2', 'tree-stage-3');
  scene.classList.add(`tree-stage-${nextStage}`);

  const treeSrc = getTreeAssetForStage(nextStage);
  $$('.growth-patch .plant').forEach((plant) => {
    plant.innerHTML = `
      <img
        src="${treeSrc}"
        class="plant-img plant-stage-${Math.max(nextStage, 1)}"
        alt="Mangrove Tree"
      >
    `;
  });

  // Carbon storage is taught as a milestone
  if (nextStage > (state.carbonMilestone || 0)) {
    state.carbonMilestone = nextStage;
    const carbonMessages = {
      1: '💎 Blue Carbon Milestone 1: young mangroves have begun storing carbon from the atmosphere.',
      2: '💎 Blue Carbon Milestone 2: growing roots and wood store more carbon in vegetation and soil.',
      3: '💎 Blue Carbon Achievement: mature mangroves store carbon in trees and waterlogged soil for long periods.'
    };
    setTimeout(() => postNews(carbonMessages[nextStage]), 950);
  }

  if ((nextStage > previousStage || forcePop) && nextStage > 0) {
    const visiblePatches = $$('.growth-patch').filter((patch, index) => index < nextStage);
    visiblePatches.forEach((patch, index) => {
      patch.classList.remove('new-growth');
      void patch.offsetWidth;
      setTimeout(() => patch.classList.add('new-growth'), index * 140);
    });

    const badge = $('#growthBadge');
    if (badge) {
      const labels = {
        1: 'Seedlings established',
        2: 'Young mangroves growing',
        3: 'Mature mangrove cover restored'
      };
      badge.textContent = labels[nextStage] || 'New mangrove growth';
      badge.classList.add('show');
      setTimeout(() => badge.classList.remove('show'), 2100);
    }
  }
}

function optionSupportsTreeGrowth(option) {
  const text = `${option.title} ${option.expectedOutcome || ''} ${option.visualFeedback || ''} ${option.learningPopup || ''}`.toLowerCase();
  return text.includes('reforest') || text.includes('replant') || text.includes('seedling') || text.includes('native') || text.includes('cleanup') || text.includes('sustainable') || text.includes('conservation') || text.includes('restore');
}

/* ===================== INCIDENT MODAL SYSTEM ===================== */
function openIncident(incidentId) {
  const incident = incidents.find((item) => item.id === incidentId);
  if (!incident) return;
  if (state.resolved.has(incidentId)) {
    showResolvedResult(incident);
    return;
  }

  const marker = $(`.incident-marker[data-id="${incidentId}"]`);
  if (marker && !marker.classList.contains('near')) {
    $('#resultTitle').textContent = 'Move Closer';
    $('#outcomeText').textContent = 'Move the 🚤 patrol cursor until the warning marker and nearby threat items glow, then click the marker again.';
    $('#resultPopup').classList.add('show');
    syncCursorMode();
    return;
  }

  state.activeIncidentId = incidentId;
  state.selectedOptionIndex = null;
  $('#incidentType').textContent = 'ACTIVE INCIDENT';
  $('#incidentTitle').textContent = incident.title;
  $('#incidentObservation').textContent = incident.situation;
  const question = document.querySelector('.question');
  if (question) question.textContent = incident.question;
  $('#analysisPreview').textContent = 'Budget is limited. Choose actions that balance restoration, income, and community welfare.';
  $('#confirmDecisionBtn').disabled = true;
  renderOptions(incident);
  $('#incidentModal').classList.add('open');
  syncCursorMode();
}

function getCostLabel(cost) {
  if (cost < 0) return `Gain: +${formatRM(Math.abs(cost))}`;
  if (cost === 0) return 'Cost: RM 0';
  return `Cost: ${formatRM(cost)}`;
}

function renderOptions(incident) {
  $('#optionList').innerHTML = incident.options.map((option, index) => {
    const affordable = option.cost <= state.budget;
    return `
      <button class="option-card ${affordable ? '' : 'locked'}" data-index="${index}" ${affordable ? '' : 'disabled'} aria-disabled="${affordable ? 'false' : 'true'}">
        ${affordable ? '' : '<span class="insufficient">INSUFFICIENT BUDGET</span>'}
        <div class="option-title">${String.fromCharCode(65 + index)}. ${option.title}</div>
        <div class="option-cost">${getCostLabel(option.cost)}</div>
        <div class="option-desc">${option.expectedOutcome}</div>
      </button>
    `;
  }).join('');

  $$('.option-card').forEach((card) => {
    card.addEventListener('click', () => selectOption(Number(card.dataset.index)));
  });
}

function selectOption(optionIndex) {
  const incident = getActiveIncident();
  const option = incident.options[optionIndex];
  if (!option) return;
  if (option.cost > state.budget) {
    $('#analysisPreview').textContent = 'Insufficient Budget. Please choose a lower-cost response.';
    return;
  }
  state.selectedOptionIndex = optionIndex;
  $$('.option-card').forEach((card) => card.classList.toggle('selected', Number(card.dataset.index) === optionIndex));
  $('#confirmDecisionBtn').disabled = false;
  $('#analysisPreview').textContent = `${option.title}: ${getCostLabel(option.cost)}.`;
}

function chooseOption() {
  const incident = getActiveIncident();
  const option = incident?.options[state.selectedOptionIndex];
  if (!incident || !option) return;
  if (option.cost > state.budget) {
    $('#analysisPreview').textContent = 'Insufficient Budget. Please choose a lower-cost response.';
    return;
  }
  state.budget -= option.cost;
  applyEffects(option.effects);
  completeIncident(incident, option);
}

function isGreatDecision(option) {
  const effects = option.effects || {};
  const text = `${option.title} ${option.expectedOutcome || ''} ${option.learningPopup || ''}`.toLowerCase();
  return (effects.health || 0) >= 8 ||
    (effects.biodiversity || 0) >= 8 ||
    (effects.community || 0) >= 8 ||
    text.includes('sustainable') ||
    text.includes('reforest') ||
    text.includes('replant') ||
    text.includes('native') ||
    text.includes('cleanup') ||
    text.includes('enforcement');
}

function completeIncident(incident, option) {
  state.resolved.add(incident.id);
  const incomeMessage = processSustainableIncomeEvent();
  state.history.push({
    incident: incident.title,
    choice: option.title,
    cost: option.cost,
    effects: option.effects,
    visualFeedback: option.visualFeedback,
    learningPopup: option.learningPopup,
    incomeMessage
  });

  closeIncidentModal();
  renderIncidentMarkers();
  if (isGreatDecision(option)) {
    state.greatChoices += 1;
  }
  updateStats();
  updateVillageVisuals();
  applyImmediateSceneFeedback(incident, option, incomeMessage);
  showFloatingText(option, incomeMessage);
  showLearningPopup(incident, option);
  showEducationalUnlockPopups();

  if (state.resolved.size === incidents.length) {
    state.finalReportReady = true;
    updateVillageVisuals();
    scheduleFinalReportAutoOpen();
  }
}

function processSustainableIncomeEvent() {
  // Income is now player-controlled through the clickable fisherman activity.
  if (state.resolved.size > 0 && state.resolved.size % 2 === 0) {
    state.fishingCooldown = 0;
    return 'Income opportunity unlocked: local livelihoods are available. Click the visible fish, shrimp, or crab groups to sell a small or big catch and increase the restoration budget.';
  }
  state.fishingCooldown = Math.max(0, state.fishingCooldown - 1);
  return getBudgetAdvisorMessage();
}

function closeIncidentModal() {
  $('#incidentModal').classList.remove('open');
  syncCursorMode();
}

function getActiveIncident() {
  return incidents.find((incident) => incident.id === state.activeIncidentId);
}

/* ===================== FEEDBACK SYSTEM ===================== */
function showFloatingText(option, incomeMessage = '') {
  const old = $('.floating-feedback');
  if (old) old.remove();

  const lines = [];
  if (option.cost > 0) lines.push({ label: `Budget -RM ${option.cost.toLocaleString('en-MY')}`, value: -option.cost });
  if (option.effects.budgetBonus) lines.push({ label: `Revenue +RM ${option.effects.budgetBonus.toLocaleString('en-MY')}`, value: option.effects.budgetBonus });

  const statLabels = {
    pollution: 'Pollution',
    biodiversity: 'Biodiversity',
    health: 'Health',
    fish: 'Fish Population',
    shrimp: 'Shrimp Population',
    community: 'Community Welfare'
  };

  Object.keys(statLabels).forEach((key) => {
    const value = option.effects[key] || 0;
    if (value !== 0) {
      const isGood = key === 'pollution' ? value < 0 : value > 0;
      lines.push({
        label: `${statLabels[key]} ${value > 0 ? '+' : ''}${value}`,
        value: isGood ? 1 : -1
      });
    }
  });

  const incomeMatch = incomeMessage.match(/RM\s?([\d,]+)/i);
  if (incomeMatch) {
    lines.push({ label: `Fishery Income +RM ${incomeMatch[1]}`, value: 1 });
  }

  const box = document.createElement('div');
  box.className = 'floating-feedback';
  box.innerHTML = lines.map((item, index) => `<div class="float-stat ${item.value < 0 ? 'neg' : 'pos'}" style="animation-delay:${index * .08}s">${item.label}</div>`).join('');
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2300);
}


function showEducationalUnlockPopups() {
  if (!state.educationalUnlocks) state.educationalUnlocks = {};
  const unlocks = state.educationalUnlocks;
  if (!unlocks.fish && (state.fish >= 55 || state.greatChoices >= 2)) {
    unlocks.fish = true;
    setTimeout(() => postNews('🐟 Fish Nursery Unlocked: mangrove roots shelter young fish before they move into open waters.'), 1700);
  }
  if (!unlocks.community && (state.greatChoices >= 4 || state.community >= 55)) {
    unlocks.community = true;
    setTimeout(() => postNews('🏠 Community Progress: Coastal Village established. Healthy mangroves support fisheries, tourism, and local livelihoods.'), 2200);
  }
  if (!unlocks.blueCarbon && state.treeStage >= 3) {
    unlocks.blueCarbon = true;
    setTimeout(() => postNews('💎 Blue Carbon Achievement: mangroves store carbon in both trees and waterlogged soil.'), 2600);
  }
}

function postNews(message) {
  const newsText = $('#newsText');
  const newsFeed = $('#newsFeed');
  if (!newsText || !newsFeed) return;
  newsText.textContent = message;
  newsFeed.classList.remove('flash');
  void newsFeed.offsetWidth;
  newsFeed.classList.add('flash');
}

function getRecoverySetCount(value) {
  if (value >= 75) return 3;
  if (value >= 55) return 2;
  if (value >= 35) return 1;
  return 0;
}

function updateRecoverySetVisuals() {
  const groups = [
    { type: 'fishing', el: $('#fishSets'), value: state.fish, minGreat: 1 },
    { type: 'shrimp', el: $('#shrimpSets'), value: state.shrimp, minGreat: 2 },
    { type: 'crab', el: $('#crabSets'), value: Math.round((state.biodiversity + state.health) / 2), minGreat: 3 }
  ];
  groups.forEach(({ type, el, value, minGreat }) => {
    if (!el) return;
    const statCount = getRecoverySetCount(value);
    const greatChoiceCount = state.greatChoices >= minGreat ? Math.min(3, state.greatChoices - minGreat + 1) : 0;
    const count = Math.max(statCount, greatChoiceCount);
    el.classList.toggle('show', count > 0);
    el.classList.toggle('income-ready', getActivityUnlockState(type));
    el.classList.remove('sets-0', 'sets-1', 'sets-2', 'sets-3');
    el.classList.add(`sets-${count}`);
  });
}

function isActivityAvailable(type) {
  // Once a livelihood resource appears, it clickable. No cooldown lock.
  return getActivityUnlockState(type);
}

function getActivityUnlockState(type) {

  if (type === 'fishing') return state.greatChoices >= 1 || state.fish >= 55 || state.health >= 55;
  if (type === 'shrimp') return state.greatChoices >= 2 || (state.shrimp >= 55 && state.health >= 55);
  if (type === 'crab') return state.greatChoices >= 3 || (state.biodiversity >= 60 && state.health >= 60);
  return false;
}

function isFishermanAvailable() {
  return isActivityAvailable('fishing') || isActivityAvailable('shrimp') || isActivityAvailable('crab');
}

function updateFishermanVisuals() {

  const unlockedCount = ['fishing', 'shrimp', 'crab'].filter(getActivityUnlockState).length;
  const hint = $('#incomeHint');
  if (!hint) return;
  hint.classList.toggle('visible', unlockedCount > 0);
  if (unlockedCount > 0) {
    hint.textContent = 'Click the visible fish, shrimp, or crab groups to sell a small or big catch for restoration income.';
  } else {
    hint.textContent = 'Livelihood activities unlock after great restoration choices.';
  }
}

function updateLivelihoodVisuals() {
  const boats = $('#fishingBoats');
  const layer = $('#livelihoodLayer');
  if (!boats || !layer) return;

  let count = 0;
  if (state.fish >= 70 && state.community >= 60) count = 3;
  else if (state.fish >= 50 && state.community >= 45) count = 2;
  else if (state.fish >= 35 && state.community >= 30) count = 1;


  updateVillageVisuals();
}

function getVillageIcon() {
  if (!state.villageUnlocked) return '🏚️';
  if (state.finalReportReady || state.greatChoices >= 8 || state.community >= 80) return '🏘️';
  if (state.greatChoices >= 6 || state.community >= 65) return '🏠';
  if (state.greatChoices >= 4 || state.community >= 55) return '🎣';
  return '🏚️';
}

function updateVillageVisuals() {
  const villageBtn = $('#villageReportBtn');
  const villageLabel = $('#villageLabel');
  if (!villageBtn || !villageLabel) return;

  const shouldUnlock = state.greatChoices >= 2 || state.community >= 48;
  if (shouldUnlock && !state.villageUnlocked) {
    postNews('👥 Community progress unlocked. Click the community icon to view restoration progress.');
  }
  state.villageUnlocked = state.villageUnlocked || shouldUnlock || state.finalReportReady;

  villageBtn.classList.toggle('visible', state.villageUnlocked);
  villageBtn.classList.toggle('complete', state.finalReportReady);
  const icon = getVillageIcon();
  villageBtn.firstChild.textContent = `${icon} `;
  villageLabel.textContent = state.finalReportReady ? 'View Final Report' : 'Community Progress';
}

function openVillageReport() {
  if (!state.villageUnlocked && !state.finalReportReady) {
    postNews('Community progress is not established yet. Make sustainable decisions to unlock the Volunteer Network, Fishing Cooperative, and Coastal Village.');
    return;
  }
  showFinalReport();
}

function clearFinalReportAutoOpen() {
  if (state.finalReportTimer) {
    window.clearTimeout(state.finalReportTimer);
    state.finalReportTimer = null;
  }
}

function scheduleFinalReportAutoOpen() {
  clearFinalReportAutoOpen();
  postNews('🌳 Restoration complete. Observe the recovered mangroves and wildlife. Final report opens in 10 seconds.');

  window.setTimeout(() => {
    if (state.finalReportReady) {
      postNews('🐟 Wildlife is returning to the restored mangrove habitat..');
    }
  }, 2000);

  window.setTimeout(() => {
    if (state.finalReportReady) {
      postNews('📋 Generating final restoration report..');
    }
  }, 4000);

  state.finalReportTimer = window.setTimeout(() => {
    state.finalReportTimer = null;
    if (!state.finalReportReady) return;
    hideResultPopup();
    closeIncidentModal();
    closeIncomeModal();
    showFinalReport();
  }, 5000);
}

function openIncomeModal(type = 'fishing') {
  if (!isActivityAvailable(type)) {
    postNews(getBudgetAdvisorMessage());
    return;
  }
  state.activeIncomeType = type;
  renderIncomeOptions(type);
  $('#incomeModal')?.classList.add('open');
  syncCursorMode();
}

function closeIncomeModal() {
  $('#incomeModal')?.classList.remove('open');
  syncCursorMode();
}

function renderIncomeOptions(type = state.activeIncomeType || 'fishing') {
  const activityGroup = incomeActivities[type] || incomeActivities.fishing;
  const title = $('#incomeModal h2');
  const observation = $('#incomeObservation');
  const list = $('#incomeOptionList');
  if (title) title.textContent = activityGroup.title;
  if (observation) observation.textContent = activityGroup.intro;
  if (!list) return;
  list.innerHTML = activityGroup.options.map((activity, index) => `
    <button class="income-option" data-index="${index}">
      <h4>${activity.title} · ${activity.reward > 0 ? '+' + formatRM(activity.reward) : 'No income'}</h4>
      <p>${activity.desc}</p>
    </button>
  `).join('');
  $$('.income-option').forEach((button) => {
    button.addEventListener('click', () => chooseIncomeActivity(Number(button.dataset.index)));
  });
}

function chooseIncomeActivity(index) {
  const type = state.activeIncomeType || 'fishing';
  const group = incomeActivities[type] || incomeActivities.fishing;
  const activity = group.options[index];
  if (!activity || !isActivityAvailable(type)) return;
  state.budget += activity.reward;
  applyEffects(activity.effects);
  state.history.push({
    incident: 'Community Livelihood Activity',
    choice: activity.title,
    cost: -activity.reward,
    effects: activity.effects,
    visualFeedback: `${activity.title} generated ${formatRM(activity.reward)} for restoration.`,
    learningPopup: activity.desc,
    incomeMessage: `Income activity: ${activity.title} added ${formatRM(activity.reward)} to the restoration budget.`
  });
  closeIncomeModal();
  updateStats();
  const negativePressure = Object.values(activity.effects || {}).some(v => v < -8);
  if (negativePressure) {
    $('#scene')?.classList.add('feedback-negative');
    setTimeout(() => $('#scene')?.classList.remove('feedback-negative'), 3200);
  }
  showFloatingText({ cost: 0, effects: { ...activity.effects, budgetBonus: activity.reward } }, '');
  postNews(`💰 ${activity.title}: ${formatRM(activity.reward)} added. Budget is now ${formatRM(state.budget)}. Income depends on keeping mangroves and wildlife healthy.`);
}

function getBudgetAdvisorMessage() {
  if (state.budget <= 8000) return `🚨 Budget critical: ${formatRM(state.budget)} left. Use unlocked catches carefully.`;
  if (state.budget <= 18000) return `⚠️ Budget low: ${formatRM(state.budget)} left. Choose affordable restoration actions.`;
  if (isFishermanAvailable()) return `💰 Income available: click fish, shrimp, or crabs to sell a small or big catch.`;
  return `📊 Budget: ${formatRM(state.budget)}. Spend wisely to restore the mangrove.`;
}

function postBudgetAdvisor() {
  postNews(getBudgetAdvisorMessage());
}

function applyImmediateSceneFeedback(incident, option, incomeMessage = '') {
  const scene = $('#scene');
  if (!scene) return;

  const totalPositive = (option.effects.biodiversity || 0) + (option.effects.health || 0) + (option.effects.fish || 0) + (option.effects.shrimp || 0) + (option.effects.community || 0) - Math.max(option.effects.pollution || 0, 0);
  const totalNegative = Math.max(option.effects.pollution || 0, 0) + Math.abs(Math.min(option.effects.biodiversity || 0, 0)) + Math.abs(Math.min(option.effects.health || 0, 0)) + Math.abs(Math.min(option.effects.fish || 0, 0)) + Math.abs(Math.min(option.effects.shrimp || 0, 0));

  scene.classList.remove('eco-improved', 'eco-damaged', 'eco-warning', 'screen-shake', 'feedback-negative');

  if (totalPositive >= totalNegative) {
    scene.classList.add('eco-improved');
    postNews(`✅ ${option.visualFeedback}`);
  } else {
    scene.classList.add('eco-damaged', 'eco-warning', 'screen-shake', 'feedback-negative');
    postNews(`⚠️ ${option.visualFeedback}`);
  }

  if (incomeMessage) {
    setTimeout(() => postNews(incomeMessage), 1350);
  }
  setTimeout(postBudgetAdvisor, incomeMessage ? 3000 : 1600);

  setTimeout(() => scene.classList.remove('eco-improved', 'eco-damaged', 'eco-warning', 'screen-shake', 'feedback-negative'), 3200);
  updateLivelihoodVisuals();
  updateTreeGrowthVisuals(optionSupportsTreeGrowth(option));
}

function showLearningPopup(incident, option) {
  $('#resultTitle').textContent = `✓ ${option.title}`;
  $('#outcomeText').textContent = option.visualFeedback;

  // Keep the learning popup focused on education only.
  // Income/livelihood messages are shown in the Latest Development feed instead.
  $('#takeawayText').textContent = option.learningPopup;

  $('#resultIncidentState').textContent = 'RESOLVED';
  $('#resultCostTag').textContent = option.cost > 0 ? formatRM(option.cost) : 'RM 0';
  $('#resultPopup').classList.add('show');
  syncCursorMode();
}

function showResolvedResult(incident) {
  if (!incident) return;
  const saved = state.history.find((item) => item.incident === incident.title);
  if (!saved) return;
  $('#resultIncidentState').textContent = 'RESOLVED';
  $('#resultCostTag').textContent = formatRM(saved.cost);
  $('#resultTitle').textContent = `Resolved Incident: ${incident.title}`;
  $('#outcomeText').textContent = saved.visualFeedback;
  $('#takeawayText').textContent = saved.learningPopup;
  $('#resultPopup').classList.add('show');
  syncCursorMode();
}

function hideResultPopup() {
  $('#resultPopup').classList.remove('show');
  syncCursorMode();
}

/* ===================== BOAT CURSOR + COLLISION SYSTEM ===================== */
function getStagePointer(clientX, clientY) {
  const stage = $('#stage');
  if (!stage) return { x: clientX, y: clientY };
  const rect = stage.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function setBoatTarget(clientX, clientY) {
  const point = getStagePointer(clientX, clientY);
  boatState.targetX = point.x;
  boatState.targetY = point.y;
}

function jumpBoatToTarget(clientX, clientY) {
  const point = getStagePointer(clientX, clientY);
  boatState.x = point.x;
  boatState.y = point.y;
  boatState.targetX = point.x;
  boatState.targetY = point.y;
}

function startBoatCursor() {
  if (boatState.animationStarted) return;
  boatState.animationStarted = true;
  requestAnimationFrame(updateBoatCursor);
}

function updateBoatCursor() {
  const boatWrapper = $('#boatWrapper');
  const boatCursor = $('#boatCursor');
  if (boatWrapper && boatCursor) {
    const previousX = boatState.x;
    boatState.x += (boatState.targetX - boatState.x) * 0.08;
    boatState.y += (boatState.targetY - boatState.y) * 0.08;

    const dx = boatState.x - previousX;
    const targetRotation = Math.max(-18, Math.min(18, dx * 0.8));
    boatState.rotation += (targetRotation - boatState.rotation) * 0.1;

    boatWrapper.style.left = `${boatState.x}px`;
    boatWrapper.style.top = `${boatState.y}px`;
    boatCursor.style.transform = `translate(-50%, -50%) rotate(${boatState.rotation}deg)`;
    checkThreatCollision();
  }
  requestAnimationFrame(updateBoatCursor);
}

function checkThreatCollision() {
  let anyNear = false;
  const stage = $('#stage');
  const stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0 };

  $$('.incident-marker:not(.resolved)').forEach((marker) => {
    const markerRect = marker.getBoundingClientRect();
    const markerX = markerRect.left - stageRect.left + markerRect.width / 2;
    const markerY = markerRect.top - stageRect.top + markerRect.height / 2;
    const distance = Math.hypot(markerX - boatState.x, markerY - boatState.y);
    const isNear = distance <= collectionRadius;
    const cluster = $(`.pollution-cluster[data-cluster-id="${marker.dataset.id}"]`);

    marker.classList.toggle('near', isNear);
    if (cluster) cluster.classList.toggle('near', isNear);
    if (isNear) anyNear = true;
  });

  const collectionRing = $('#collectionRing');
  if (collectionRing) collectionRing.classList.toggle('active', anyNear);
}


/* ===================== REPORT SYSTEM ===================== */
function showFinalReport() {
  updateReportContent();
  const reportTitle = document.querySelector('.report-title');
  const label = document.querySelector('#reportModal .label');
  if (label) label.textContent = state.finalReportReady ? 'Final Restoration Report' : 'Community Progress Report';
  if (reportTitle) reportTitle.textContent = state.finalReportReady ? 'Borneo Mangrove Zone' : `${getVillageIcon()} Coastal Village Progress`;
  $('#reportModal').classList.add('open');
  syncCursorMode();
}

function closeReportModal() {
  $('#reportModal').classList.remove('open');
  syncCursorMode();
}

function getGrade(health) {
  if (health >= 80) return 'A';
  if (health >= 60) return 'B';
  if (health >= 40) return 'C';
  if (health >= 20) return 'D';
  return 'F';
}

function getReflection(grade) {
  const reflections = {
    A: 'Excellent restoration strategy. Your decisions reduced pollution, protected biodiversity, supported fisheries, and improved community welfare.',
    B: 'Strong conservation outcome. The ecosystem and local livelihood are recovering, but continued monitoring is still needed.',
    C: 'Moderate result. Some decisions helped, but the ecosystem remains under pressure.',
    D: 'Weak conservation outcome. The mangrove remains degraded and requires stronger restoration action.',
    F: 'Critical outcome. Poor decisions caused serious ecosystem decline and long-term restoration challenges.'
  };
  return reflections[grade];
}

function updateReportContent() {
  const score = getEcosystemScore();
  const status = getStatus(score);
  const grade = getGrade(score);
  $('#classification').textContent = state.finalReportReady ? `GRADE ${grade} · ${status.toUpperCase()}` : `${status.toUpperCase()} · IN PROGRESS`;
  $('#reportSummary').textContent = state.finalReportReady
    ? getReflection(grade)
    : 'This community progress report shows the current recovery status. Complete all restoration missions, then return to the Coastal Village for the final report.';
  $('#reportResolved').textContent = `${state.resolved.size} / ${incidents.length}`;
  $('#reportBudget').textContent = formatRM(state.budget);
  $('#reportPollution').textContent = state.pollution;
  $('#reportBiodiversity').textContent = state.biodiversity;
  $('#reportHealth').textContent = state.health;
  $('#reportFish').textContent = state.fish;
  $('#reportShrimp').textContent = state.shrimp;
  $('#reportCommunity').textContent = state.community;
  $('#reportStatus').textContent = status;
  $('#reportScore').textContent = grade;
  $('#decisionHistory').innerHTML = state.history.length
    ? state.history.map((item, index) => {
        const moneyLabel = item.cost < 0 ? `Income: +${formatRM(Math.abs(item.cost))}` : `Cost: ${formatRM(item.cost)}`;
        return `<p><strong>${index + 1}. ${item.incident}</strong><br>Response: ${item.choice} (${moneyLabel})<br>${item.learningPopup}${item.incomeMessage ? '<br><em>' + item.incomeMessage + '</em>' : ''}</p>`;
      }).join('')
    : '<p>No decisions made yet.</p>';
}

function restartMission() {
  clearFinalReportAutoOpen();
  state.budget = 40000;
  state.pollution = 20;
  state.biodiversity = 20;
  state.health = 20;
  state.fish = 45;
  state.shrimp = 35;
  state.community = 45;
  state.incomeEvents = 0;
  state.fishingCooldown = 0;
  state.greatChoices = 0;
  state.villageUnlocked = false;
  state.finalReportReady = false;
  state.treeStage = 0;
  state.carbonMilestone = 0;
  state.educationalUnlocks = {};
  state.resolved = new Set();
  state.history = [];
  state.activeIncidentId = null;
  state.selectedOptionIndex = null;
  hideResultPopup();
  closeIncomeModal();
  closeReportModal();
  renderIncidentMarkers();
  updateStats();
  updateTreeGrowthVisuals(true);
  updateRecoverySetVisuals();
  updateFishermanVisuals();
  postNews('Mission restarted. Community livelihood depends on mangrove health, fisheries, and pollution control.');
}