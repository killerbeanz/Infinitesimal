// Core game variables
let value = new OmegaNum(1);
let valueDisplay = document.getElementById('display-value');
let circle = document.getElementById('circle');
let shrinkButton = document.getElementById('shrink-button');

// Base colors
let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];
const baseBackgroundColor = [26, 32, 44];
const redColor = [255, 0, 0];

// Prestige (Hue Shift) variables
let hueShifts = 0;
let softcapPower = new OmegaNum(1);
let showHueShiftPrompt = false;
let hueShiftModal = document.getElementById('hue-shift-modal');
let confirmHueShiftButton = document.getElementById('confirm-hue-shift');

// --- Antihole Variables ---
let antiholeUnlocked = false;
let showAntiholePrompt = false;
let antiholeModal = document.getElementById('antihole-modal');
let confirmAntiholeButton = document.getElementById('confirm-antihole');
let antiholeSize = new OmegaNum(1);
let squareShrinkMaxLevel = 10; // base cap

// DOM elements for tabbed sidebar
let sidebarTabs = document.getElementById('sidebar');
let tabShrinking = document.getElementById('tab-shrinking');
let tabAntihole = document.getElementById('tab-antihole');
let shrinkingPanel = document.getElementById('shrinking-panel');
let antiholePanel = document.getElementById('antihole-panel');
let displayAntihole = document.getElementById('display-antihole');

// Upgrades
let upgrades = {
  autoShrink: {
    purchased: false,
    cost: new OmegaNum(2),
    button: document.getElementById('auto-shrink-upgrade')
  },
  squareShrink: {
    level: 0,
    baseCost: new OmegaNum(1).div(0.95),
    cost: new OmegaNum(1).div(0.95),
    button: document.getElementById('square-shrink-upgrade')
  }
};

// Antihole‐panel upgrades
let antiholeUpgrades = {
  squareLimit: {
    level: 0,
    baseCost: new OmegaNum(1.5),
    cost: new OmegaNum(1.5),
    button: document.getElementById('antihole-upgrade')
  }
};

// Shrink factors
let baseShrinkClickFactor = new OmegaNum(1).div(0.9995);
let shrinkClickFactor = baseShrinkClickFactor;
let adjustedShrinkClick = shrinkClickFactor;
let baseShrinkAutoFactor = new OmegaNum(1).div(0.9995);
let shrinkAutoFactor = baseShrinkAutoFactor;
let adjustedShrinkAuto = shrinkAutoFactor;

// Save‐popup elements
const savePopup = document.getElementById('save-popup');
function showSavePopup() {
  savePopup.classList.add('show');
  setTimeout(() => savePopup.classList.remove('show'), 2000);
}

loadGame();
updateUIVisibility();

// Utility: format value display
function formatValue(val, digits = 4) {
  const threshold = new OmegaNum(1e6);
  if (val.gte(threshold)) {
    let expString = val.toExponential();
    if (expString === 'NaNeNaN') expString = val.toString();
    const [mantissa, exponentStr] = expString.split('e');
    const exponent = parseInt(exponentStr, 10) - 1;
    const mantissaNum = parseFloat(mantissa);
    const reciprocal = 1 / mantissaNum;
    const raw = reciprocal.toFixed(digits + 2).replace('.', '').padEnd(digits, '0');
    const digitsStr = raw.slice(0, digits);
    return `0.-(${exponent})-${digitsStr}`;
  } else {
    return OmegaNum.div(1, val).toFixed(6);
  }
}

function updateShrinkButton() {
  if (value.lte('1e30')) {
    shrinkButton.textContent = `Multiply by ${formatValue(adjustedShrinkClick)}`;
  } else {
    shrinkButton.textContent = `Multiply by ${formatValue(adjustedShrinkClick)}\ndue to being smaller than 0.-(29)-0999`;
  }
}

function interpolateColor(min, max, t) {
  const r = Math.round(min[0] * (1 - t) + max[0] * t);
  const g = Math.round(min[1] * (1 - t) + max[1] * t);
  const b = Math.round(min[2] * (1 - t) + max[2] * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function getHueShiftedColor(t) {
  const shiftFrac = Math.min(hueShifts / 10, 1);
  const shiftedMin = [
    minColor[0] + shiftFrac * (255 - minColor[0]),
    minColor[1] * (1 - shiftFrac),
    minColor[2] * (1 - shiftFrac)
  ];
  return interpolateColor(shiftedMin, maxColor, t);
}

function updateCircleSize() {
  const minSize = Math.min(window.innerWidth, window.innerHeight);
  const term = Math.log10(value.toNumber()) / 308;
  const size = minSize * term;
  const t = Math.min(1, Math.max(0, size / minSize));
  const color = getHueShiftedColor(t);

  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.backgroundColor = color;

  const requirement = OmegaNum(10).mul(OmegaNum(1e30).pow(hueShifts + 1));
  const reqTerm = Math.log10(requirement.toNumber()) / 308;
  const reqSize = minSize * reqTerm;
  const markerColor = getHueShiftedColor(t);

  const marker = document.getElementById('hue-shift-marker');
  marker.style.width = `${reqSize}px`;
  marker.style.height = `${reqSize}px`;
  marker.style.borderColor = markerColor;
}

function shrinkClick() {
  if (value.gt('1e30')) {
    const ratio = OmegaNum.max(1, value.div('1e30').ln().mul(1000).pow(softcapPower));
    adjustedShrinkClick = shrinkClickFactor.root(ratio);
  }
  value = value.mul(adjustedShrinkClick);
  valueDisplay.textContent = formatValue(value);
  updateShrinkButton();
  updateCircleSize();
}
shrinkButton.addEventListener('click', shrinkClick);

function buySquareShrinkUpgrade() {
  let u = upgrades.squareShrink;
  if (u.level < squareShrinkMaxLevel && value.gt(u.cost)) {
    value = value.div(u.cost);
    u.level++;
    u.cost = u.baseCost.pow(1.95 * (u.level ** 2));
    shrinkClickFactor = baseShrinkClickFactor.pow(OmegaNum(2).pow(u.level));
    shrinkAutoFactor = baseShrinkAutoFactor.pow(OmegaNum(2).pow(u.level));
    u.button.textContent = `Square shrinking rate\n(Cost: ${formatValue(u.cost)}) ${u.level}/${squareShrinkMaxLevel}`;
    updateShrinkButton();
  }
}
upgrades.squareShrink.button.addEventListener('click', buySquareShrinkUpgrade);

function buyAutoShrink() {
  let u = upgrades.autoShrink;
  if (!u.purchased && value.gt(u.cost)) {
    value = value.div(u.cost);
    u.purchased = true;
    u.button.disabled = true;
    u.button.textContent = "Auto shrink purchased";
  }
}
upgrades.autoShrink.button.addEventListener('click', buyAutoShrink);

function buyAntiholeUpgrade() {
  let au = antiholeUpgrades.squareLimit;
  if (au.level < 10 && antiholeSize.gt(au.cost)) {
    antiholeSize = antiholeSize.div(au.cost);
    au.level++;
    au.cost = au.baseCost.pow(Math.max(1, 1.95 * (au.level ** 2)));
    squareShrinkMaxLevel = 10 + au.level;
    au.button.textContent = 
      `Add 1 to the "Square shrinking rate" upgrade limit\n` +
      `(Cost: ${formatValue(au.cost)}) ${au.level}/10`;
    displayAntihole.textContent = formatValue(antiholeSize);
  }
}
antiholeUpgrades.squareLimit.button.addEventListener('click', buyAntiholeUpgrade);

function triggerHueShift() {
  hueShifts++;
  softcapPower = softcapPower.pow(.5);
  resetGameProgress();
  hueShiftModal.style.display = 'none';
  showHueShiftPrompt = false;
}
confirmHueShiftButton.addEventListener('click', triggerHueShift);

function triggerAntihole() {
  // **Reset hueShifts on Antihole**
  hueShifts = 0;
  softcapPower = new OmegaNum(1);
  antiholeSize = antiholeSize.mul(2);
  antiholeUnlocked = true;
  resetGameProgress();
  antiholeModal.style.display = 'none';
  showAntiholePrompt = false;
  updateUIVisibility();
}
confirmAntiholeButton.addEventListener('click', triggerAntihole);

function resetGameProgress() {
  value = new OmegaNum(1);
  // reset Shrinking upgrades
  upgrades.squareShrink.level = 0;
  upgrades.squareShrink.cost = upgrades.squareShrink.baseCost;
  upgrades.squareShrink.button.textContent = 
    `Square shrinking rate\n(Cost: ${formatValue(upgrades.squareShrink.baseCost)}) 0/${squareShrinkMaxLevel}`;
  upgrades.autoShrink.purchased = false;
  upgrades.autoShrink.button.disabled = false;
  upgrades.autoShrink.button.textContent = 
    `Auto shrink\n(Cost: ${formatValue(upgrades.autoShrink.cost)})`;
  shrinkClickFactor = baseShrinkClickFactor;
  shrinkAutoFactor = baseShrinkAutoFactor;
  updateBackgroundColor();
  updateShrinkButton();
  updateCircleSize();
}

function updateUIVisibility() {
  if (antiholeUnlocked) {
    sidebarTabs.style.display = 'flex';
    tabShrinking.classList.add('active');
    tabAntihole.classList.remove('active');
    shrinkingPanel.style.display = 'block';
    antiholePanel.style.display = 'none';
  } else {
    sidebarTabs.style.display = 'none';
    shrinkingPanel.style.display = 'block';
    antiholePanel.style.display = 'none';
  }
}

// Tab switching
tabShrinking.addEventListener('click', () => {
  tabShrinking.classList.add('active');
  tabAntihole.classList.remove('active');
  shrinkingPanel.style.display = 'block';
  antiholePanel.style.display = 'none';
});
tabAntihole.addEventListener('click', () => {
  tabAntihole.classList.add('active');
  tabShrinking.classList.remove('active');
  antiholePanel.style.display = 'block';
  shrinkingPanel.style.display = 'none';
});

function tick() {
  const antiholeThreshold = OmegaNum(10).mul(OmegaNum(2).pow(1024));
  // cap value at whichever prestige is next
  value = OmegaNum.min(
    value,
    OmegaNum.min(
      OmegaNum(10).mul(OmegaNum(1e30).pow(hueShifts + 1)),
      antiholeThreshold
    )
  );

  // Hue shift prompt
  if (!showHueShiftPrompt && value.gte(OmegaNum(10).mul(OmegaNum(1e30).pow(hueShifts + 1)))) {
    const grantedLevels = Math.min(hueShifts + 1, 10);
    document.getElementById('hue-shift-effects').innerHTML =
      `This will automatically grant<br><strong>${grantedLevels}</strong> level${grantedLevels === 1 ? '' : 's'} ` +
      `of the <em>"Square shrinking rate"</em> upgrade when affordable<br>and square root the softcap.`;
    hueShiftModal.style.display = 'flex';
    showHueShiftPrompt = true;
  }

  // Antihole prompt
  if (value.gte(antiholeThreshold) && !showAntiholePrompt) {
    antiholeModal.style.display = 'flex';
    showAntiholePrompt = true;
  }

  // Auto-shrink and click adjustments
  updateShrinkButton();
  updateCircleSize();

  adjustedShrinkClick = shrinkClickFactor;
  if (value.gt('1e30')) {
    const ratio = OmegaNum.max(1, value.div('1e30').ln().mul(1000).pow(softcapPower));
    adjustedShrinkClick = shrinkClickFactor.root(ratio);
  }
  if (value.gt(0) && upgrades.autoShrink.purchased) {
    adjustedShrinkAuto = shrinkAutoFactor;
    if (value.gt('1e30')) {
      const ratio = OmegaNum.max(1, value.div('1e30').ln().mul(1000).pow(softcapPower));
      adjustedShrinkAuto = shrinkAutoFactor.root(ratio);
    }
    value = value.mul(adjustedShrinkAuto);
  }

  // Auto-buy squareShrink up to hueShifts or antihole‐extended cap
  let u = upgrades.squareShrink;
  if (u.level < squareShrinkMaxLevel && value.gt(u.cost) && u.level < hueShifts) {
    u.level++;
    u.cost = u.baseCost.pow(1.95 * (u.level ** 2));
    shrinkClickFactor = baseShrinkClickFactor.pow(OmegaNum(2).pow(u.level));
    shrinkAutoFactor = baseShrinkAutoFactor.pow(OmegaNum(2).pow(u.level));
    u.button.textContent = 
      `Square shrinking rate\n(Cost: ${formatValue(u.cost)}) ${u.level}/${squareShrinkMaxLevel}`;
    updateShrinkButton();
  }

  valueDisplay.textContent = formatValue(value);
  if (antiholeUnlocked) {
    displayAntihole.textContent = formatValue(antiholeSize);
  }
}
setInterval(tick, 50);

// Save & Load
function saveGame() {
  const saveData = {
    value: value.toString(),
    hueShifts,
    squareShrinkLevel: upgrades.squareShrink.level,
    autoShrinkPurchased: upgrades.autoShrink.purchased,
    shrinkClickFactor: shrinkClickFactor.toString(),
    shrinkAutoFactor: shrinkAutoFactor.toString(),
    softcapPower: softcapPower.toString(),
    // Antihole
    antiholeUnlocked,
    antiholeSize: antiholeSize.toString(),
    antiholeUpgradeLevel: antiholeUpgrades.squareLimit.level,
    antiholeUpgradeCost: antiholeUpgrades.squareLimit.cost.toString()
  };
  localStorage.setItem('GameSave', JSON.stringify(saveData));
}

function loadGame() {
  const s = localStorage.getItem('GameSave');
  if (!s) return;
  try {
    const d = JSON.parse(s);
    value = new OmegaNum(d.value);
    hueShifts = d.hueShifts || 0;
    upgrades.squareShrink.level = d.squareShrinkLevel || 0;
    upgrades.autoShrink.purchased = d.autoShrinkPurchased || false;
    shrinkClickFactor = new OmegaNum(d.shrinkClickFactor);
    shrinkAutoFactor = new OmegaNum(d.shrinkAutoFactor);
    softcapPower = new OmegaNum(d.softcapPower);

    // Antihole restore
    antiholeUnlocked = d.antiholeUnlocked || false;
    antiholeSize = new OmegaNum(d.antiholeSize || 1);
    antiholeUpgrades.squareLimit.level = d.antiholeUpgradeLevel || 0;
    antiholeUpgrades.squareLimit.cost = new OmegaNum(d.antiholeUpgradeCost || 1.5);
    squareShrinkMaxLevel = 10 + antiholeUpgrades.squareLimit.level;

    // Update UI text
    upgrades.squareShrink.cost = upgrades.squareShrink.baseCost.pow(OmegaNum.max(1,1.95 * (upgrades.squareShrink.level ** 2)));
    upgrades.squareShrink.button.textContent = 
      `Square shrinking rate\n(Cost: ${formatValue(upgrades.squareShrink.cost)}) ${upgrades.squareShrink.level}/${squareShrinkMaxLevel}`;
    upgrades.autoShrink.button.disabled = upgrades.autoShrink.purchased;
    upgrades.autoShrink.button.textContent = 
      upgrades.autoShrink.purchased 
        ? "Auto shrink purchased" 
        : `Auto shrink\n(Cost: ${formatValue(upgrades.autoShrink.cost)})`;

    antiholeUpgrades.squareLimit.button.textContent =
      `Add 1 to the "Square shrinking rate" upgrade limit\n` +
      `(Cost: ${formatValue(antiholeUpgrades.squareLimit.cost)}) ${antiholeUpgrades.squareLimit.level}/10`;
    displayAntihole.textContent = formatValue(antiholeSize);

    updateUIVisibility();
    valueDisplay.textContent = formatValue(value);
    updateShrinkButton();
    updateCircleSize();
  } catch (e) {
    console.error('Failed to load save:', e);
  }
}

// Autosave every 30s **with** popup
setInterval(() => {
  saveGame();
  showSavePopup();
}, 30000);

window.addEventListener('resize', updateCircleSize);

function updateFavicon(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, 2 * Math.PI);
  ctx.fill();
  document.getElementById('dynamic-favicon').href = canvas.toDataURL('image/png');
}

function updateBackgroundColor() {
  const shiftFraction = Math.min(hueShifts / 10, 1);
  const bgColor = interpolateColor(baseBackgroundColor, redColor, shiftFraction);
  document.body.style.backgroundColor = bgColor;
  updateFavicon(bgColor);  // ← re‑fire favicon draw here
}

updateBackgroundColor();
updateShrinkButton();
updateCircleSize();
