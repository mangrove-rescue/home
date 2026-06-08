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
  startBoatCursor();
});

function bindStaticEvents() {
  $('#beginBtn').addEventListener('click', startMission);
  $('#simTitleHomeBtn').addEventListener('click', exitMission);
  $('#closeIncidentBtn').addEventListener('click', closeIncidentModal);
  $('#confirmDecisionBtn').addEventListener('click', chooseOption);
  $('#resultCloseBtn').addEventListener('click', hideResultPopup);
  $('#resultContinueBtn').addEventListener('click', hideResultPopup);

  $('#viewReportBtn').addEventListener('click', showFinalReport);
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
}

function isGameUiOpen() {
  return $('#incidentModal')?.classList.contains('open') ||
    $('#reportModal')?.classList.contains('open') ||
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
  syncCursorMode();
  window.scrollTo(0, 0);
}

function exitMission() {
  hideResultPopup();
  closeIncidentModal();
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
function getStatus(health) {
  if (health <= 20) return 'Critical';
  if (health <= 40) return 'Degraded';
  if (health <= 60) return 'Stressed';
  if (health <= 80) return 'Recovering';
  return 'Healthy';
}

function clampStats() {
  state.pollution = clamp(state.pollution);
  state.biodiversity = clamp(state.biodiversity);
  state.health = clamp(state.health);
  state.budget = Math.max(0, state.budget);
}

function updateStats() {
  clampStats();
  const status = getStatus(state.health);
  const resolved = state.resolved.size;
  const progressPercent = (resolved / incidents.length) * 100;

  $('#budgetVal').textContent = formatRM(state.budget);
  $('#progressVal').textContent = `${resolved}/${incidents.length}`;
  $('#progressFill').style.width = `${progressPercent}%`;

  $('#pollutionVal').textContent = state.pollution;
  $('#pollutionFill').style.width = `${state.pollution}%`;
  $('#biodiversityVal').textContent = state.biodiversity;
  $('#biodiversityFill').style.width = `${state.biodiversity}%`;
  $('#healthVal').textContent = state.health;
  $('#healthFill').style.width = `${state.health}%`;
  $('#statusVal').textContent = status;
  $('#statusFill').style.width = `${state.health}%`;
  applyStatusVisuals();
}

function applyEffects(effects) {
  state.pollution += effects.pollution || 0;
  state.biodiversity += effects.biodiversity || 0;
  state.health += effects.health || 0;
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
  const status = getStatus(state.health).toLowerCase();
  const scene = $('#scene');
  if (scene) {
    scene.classList.remove('status-critical', 'status-degraded', 'status-stressed', 'status-recovering', 'status-healthy');
    scene.classList.add(`status-${status}`);
  }

  const progress = state.resolved.size / incidents.length;
  $$('.pollution-cluster').forEach((cluster) => {
    cluster.classList.toggle('resolved', state.resolved.has(Number(cluster.dataset.clusterId)));
  });
  $('#fishGroup').classList.toggle('visible', state.biodiversity >= 58 || state.health >= 62 || progress > .35);
  $('#coralGroup').classList.toggle('visible', state.biodiversity >= 70 || state.health >= 80 || progress > .65);
  $('#crabGroup').classList.toggle('visible', state.pollution >= 40 || state.health >= 65 || progress > .45);
}

/* ===================== INCIDENT MODAL SYSTEM ===================== */
function openIncident(incidentId) {
  const incident = incidents.find((item) => item.id === incidentId);
  const marker = $(`.incident-marker[data-id="${incidentId}"]`);
  if (marker && !marker.classList.contains('near') && !state.resolved.has(incidentId)) {
    $('#resultTitle').textContent = 'Move Closer';
    $('#outcomeText').textContent = 'Move the 🚤 cursor until the warning marker and threat items glow.';
    $('#takeawayText').textContent = 'Tap/click only when the boat is close to the incident.';
    $('#resultIncidentState').textContent = 'IN RANGE NEEDED';
    $('#resultCostTag').textContent = 'RM 0';
    $('#resultPopup').classList.add('show');
  syncCursorMode();
    syncCursorMode();
    return;
  }
  if (!incident || state.resolved.has(incidentId)) {
    showResolvedResult(incident);
    return;
  }
  state.activeIncidentId = incidentId;
  state.selectedOptionIndex = null;
  $('#incidentType').textContent = 'ACTIVE INCIDENT';
  $('#incidentTitle').textContent = incident.title;
  $('#incidentObservation').textContent = incident.situation;
  const question = document.querySelector('.question');
  if (question) question.textContent = incident.question;
  $('#analysisPreview').textContent = 'Select a response. Expensive options may be locked if your budget is too low.';
  $('#confirmDecisionBtn').disabled = true;
  renderOptions(incident);
  $('#incidentModal').classList.add('open');
  syncCursorMode();
}

function renderOptions(incident) {
  $('#optionList').innerHTML = incident.options.map((option, index) => {
    const affordable = option.cost <= state.budget;
    return `
      <button class="option-card ${affordable ? '' : 'locked'}" data-index="${index}" ${affordable ? '' : 'disabled'} aria-disabled="${affordable ? 'false' : 'true'}">
        ${affordable ? '' : '<span class="insufficient">INSUFFICIENT BUDGET</span>'}
        <div class="option-title">${String.fromCharCode(65 + index)}. ${option.title}</div>
        <div class="option-cost">Cost: ${formatRM(option.cost)}</div>
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
  $('#analysisPreview').textContent = `${option.title} costs ${formatRM(option.cost)}.`;
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

function completeIncident(incident, option) {
  state.resolved.add(incident.id);
  state.history.push({
    incident: incident.title,
    choice: option.title,
    cost: option.cost,
    effects: option.effects,
    visualFeedback: option.visualFeedback,
    learningPopup: option.learningPopup
  });

  closeIncidentModal();
  renderIncidentMarkers();
  updateStats();
  showFloatingText(option);
  showLearningPopup(incident, option);

  if (state.resolved.size === incidents.length) {
    setTimeout(showFinalReport, 650);
  }
}

function closeIncidentModal() {
  $('#incidentModal').classList.remove('open');
  syncCursorMode();
}

function getActiveIncident() {
  return incidents.find((incident) => incident.id === state.activeIncidentId);
}

/* ===================== FEEDBACK SYSTEM ===================== */
function showFloatingText(option) {
  const old = $('.floating-feedback');
  if (old) old.remove();

  const lines = [
    { label: `-RM ${option.cost.toLocaleString('en-MY')}`, value: -option.cost },
    { label: `Pollution ${option.effects.pollution >= 0 ? '+' : ''}${option.effects.pollution || 0}`, value: -(option.effects.pollution || 0) },
    { label: `Biodiversity ${option.effects.biodiversity >= 0 ? '+' : ''}${option.effects.biodiversity || 0}`, value: option.effects.biodiversity || 0 },
    { label: `Health ${option.effects.health >= 0 ? '+' : ''}${option.effects.health || 0}`, value: option.effects.health || 0 }
  ];

  const box = document.createElement('div');
  box.className = 'floating-feedback';
  box.innerHTML = lines.map((item, index) => `<div class="float-stat ${item.value < 0 ? 'neg' : 'pos'}" style="animation-delay:${index * .08}s">${item.label}</div>`).join('');
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 1700);
}

function showLearningPopup(incident, option) {
  $('#resultTitle').textContent = `✓ ${option.title} Completed`;
  $('#outcomeText').textContent = option.visualFeedback;
  $('#takeawayText').textContent = option.learningPopup;
  $('#resultIncidentState').textContent = 'RESOLVED';
  $('#resultCostTag').textContent = formatRM(option.cost);
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
function setBoatTarget(clientX, clientY) {
  boatState.targetX = clientX;
  boatState.targetY = clientY;
}

function jumpBoatToTarget(clientX, clientY) {
  boatState.x = clientX;
  boatState.y = clientY;
  setBoatTarget(clientX, clientY);
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

  $$('.incident-marker:not(.resolved)').forEach((marker) => {
    const markerRect = marker.getBoundingClientRect();
    const markerX = markerRect.left + markerRect.width / 2;
    const markerY = markerRect.top + markerRect.height / 2;
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
    A: 'Excellent restoration strategy. Your decisions reduced pollution, protected biodiversity, and restored mangrove health.',
    B: 'Strong conservation outcome. The ecosystem is recovering, but continued monitoring is still needed.',
    C: 'Moderate result. Some decisions helped, but the ecosystem remains under pressure.',
    D: 'Weak conservation outcome. The mangrove remains degraded and requires stronger restoration action.',
    F: 'Critical outcome. Poor decisions caused serious ecosystem decline and long-term restoration challenges.'
  };
  return reflections[grade];
}

function updateReportContent() {
  const status = getStatus(state.health);
  const grade = getGrade(state.health);
  $('#classification').textContent = `GRADE ${grade} · ${status.toUpperCase()}`;
  $('#reportSummary').textContent = getReflection(grade);
  $('#reportResolved').textContent = `${state.resolved.size} / ${incidents.length}`;
  $('#reportBudget').textContent = formatRM(state.budget);
  $('#reportPollution').textContent = state.pollution;
  $('#reportBiodiversity').textContent = state.biodiversity;
  $('#reportHealth').textContent = state.health;
  $('#reportStatus').textContent = status;
  $('#reportScore').textContent = grade;
  $('#decisionHistory').innerHTML = state.history.length
    ? state.history.map((item, index) => `<p><strong>${index + 1}. ${item.incident}</strong><br>Response: ${item.choice} (${formatRM(item.cost)})<br>${item.learningPopup}</p>`).join('')
    : '<p>No decisions made yet.</p>';
}

function restartMission() {
  state.budget = 80000;
  state.pollution = 50;
  state.biodiversity = 50;
  state.health = 50;
  state.resolved = new Set();
  state.history = [];
  state.activeIncidentId = null;
  state.selectedOptionIndex = null;
  hideResultPopup();
  closeReportModal();
  renderIncidentMarkers();
  updateStats();
  checkThreatCollision();
}