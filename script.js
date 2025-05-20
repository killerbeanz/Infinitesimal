// script.js
// Core game variables
let value = new OmegaNum(1);
let valueDisplay = document.getElementById('display-value');
let circle = document.getElementById('circle');
let shrinkButton = document.getElementById('shrink-button');

// Prestige (Hue Shift) variables
let hueShifts = 0;
let softcapPower = new OmegaNum(1);
let showHueShiftPrompt = false;
let hueShiftModal = document.getElementById('hue-shift-modal');
let confirmHueShiftButton = document.getElementById('confirm-hue-shift');

// Base colors
let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];
const baseBackgroundColor = [26, 32, 44];
const redColor = [255, 0, 0];

function updateFavicon(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Draw a circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, 2 * Math.PI);
  ctx.fill();

  // Set as favicon
  const link = document.getElementById('dynamic-favicon');
  link.href = canvas.toDataURL('image/png');
}

function updateBackgroundColor() {
  const shiftFraction = Math.min(hueShifts / 10, 1);
  const bgColor = interpolateColor(baseBackgroundColor, redColor, shiftFraction);
  document.body.style.backgroundColor = bgColor;
  updateFavicon(bgColor);
}

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

// Shrink factors
let baseShrinkClickFactor = new OmegaNum(1).div(0.9995);
let shrinkClickFactor = baseShrinkClickFactor;
let adjustedShrinkClick = shrinkClickFactor;
let baseShrinkAutoFactor = new OmegaNum(1).div(0.9995);
let shrinkAutoFactor = baseShrinkAutoFactor;
let adjustedShrinkAuto = shrinkAutoFactor;

loadGame();

// Utility: format value display
function formatValue(value, digits = 4) {
  const threshold = new OmegaNum(1e6);
  if (value.gte(threshold)) {
    let expString = value.toExponential();
    if (expString === 'NaNeNaN') expString = value.toString();
    const [mantissa, exponentStr] = expString.split('e');
    const exponent = parseInt(exponentStr, 10) - 1;
    const mantissaNum = parseFloat(mantissa);
    const reciprocal = 1 / mantissaNum;
    const raw = reciprocal.toFixed(digits + 2).replace('.', '').padEnd(digits, '0');
    const digitsStr = raw.slice(0, digits);
    return `0.-(${exponent})-${digitsStr}`;
  } else {
    return OmegaNum.div(1, value).toFixed(6);
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

  // Main circle
  const circle = document.getElementById('circle');
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.backgroundColor = color;

  // Hue Shift Marker
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
  value = value.mul(adjustedShrinkClick);
  valueDisplay.textContent = formatValue(value);
  updateShrinkButton();
  updateCircleSize();
}
shrinkButton.addEventListener('click', shrinkClick);

function buySquareShrinkUpgrade() {
  let u = upgrades.squareShrink;
  if (u.level < 10 && value.gt(u.cost)) {
    value = value.div(u.cost);
    u.level++;
    u.cost = u.baseCost.pow(1.95 * (u.level ** 2));
    shrinkClickFactor = baseShrinkClickFactor.pow(OmegaNum(2).pow(u.level));
    shrinkAutoFactor = baseShrinkAutoFactor.pow(OmegaNum(2).pow(u.level));
    u.button.textContent = `Square shrinking rate\n(Cost: ${formatValue(u.cost)}) ${u.level}/10`;
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

function triggerHueShift() {
  hueShifts++;
  value = new OmegaNum(1);
  softcapRootDivisor = softcapPower.mul(0.1);
  updateBackgroundColor();
  upgrades.squareShrink.level = 0;
  upgrades.squareShrink.cost = upgrades.squareShrink.baseCost;
  upgrades.squareShrink.button.textContent = `Square shrinking rate\n(Cost: ${formatValue(upgrades.squareShrink.cost)}) 0/10`;
  upgrades.autoShrink.purchased = false;
  upgrades.autoShrink.button.disabled = false;
  upgrades.autoShrink.button.textContent = `Auto shrink\n(Cost: ${formatValue(upgrades.autoShrink.cost)})`;
  shrinkClickFactor = baseShrinkClickFactor;
  shrinkAutoFactor = baseShrinkAutoFactor;
  hueShiftModal.style.display = 'none';
  showHueShiftPrompt = false;
}
confirmHueShiftButton.addEventListener('click', triggerHueShift);

function tick() {
  value = OmegaNum.min(value,OmegaNum.min(OmegaNum(10).mul(OmegaNum(1e30).pow(hueShifts + 1)), OmegaNum(2).pow(1024).mul(10)))
  if (!showHueShiftPrompt && value.gte(OmegaNum(10).mul(OmegaNum(1e30).pow(hueShifts + 1)))) {
    const grantedLevels = Math.min(hueShifts + 1, 10);
    document.getElementById('hue-shift-effects').innerHTML =
      `This will automatically grant<br><strong>${grantedLevels}</strong> level${grantedLevels === 1 ? '' : 's'} ` +
      `of the <em>"Square shrink rate"</em> upgrade<br>and raise the softcap to <strong>0.1</strong>.`;
    hueShiftModal.style.display = 'flex';
    showHueShiftPrompt = true;
  }
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
  let u = upgrades.squareShrink;
  if (u.level < 10 && value.gt(u.cost) && u.level < hueShifts) {
    u.level++;
    u.cost = u.baseCost.pow(1.95 * (u.level ** 2));
    shrinkClickFactor = baseShrinkClickFactor.pow(OmegaNum(2).pow(u.level));
    shrinkAutoFactor = baseShrinkAutoFactor.pow(OmegaNum(2).pow(u.level));
    u.button.textContent = `Square shrinking rate\n(Cost: ${formatValue(u.cost)}) ${u.level}/10`;
    updateShrinkButton();
  }
  valueDisplay.textContent = formatValue(value);
}
setInterval(tick, 50);
setInterval(() => {
  saveGame();
  showSavePopup();
}, 30000);
window.addEventListener('resize', updateCircleSize);
updateShrinkButton();
updateCircleSize();
updateBackgroundColor();





function saveGame() {
  const saveData = {
    value: value.toString(),
    hueShifts: hueShifts,
    squareShrinkLevel: upgrades.squareShrink.level,
    autoShrinkPurchased: upgrades.autoShrink.purchased,
    shrinkClickFactor: shrinkClickFactor.toString(),
    shrinkAutoFactor: shrinkAutoFactor.toString(),
    softcapRootDivisor: softcapRootDivisor.toString()
  };
  localStorage.setItem('GameSave', JSON.stringify(saveData));
}

const savePopup = document.getElementById('save-popup');

function showSavePopup() {
  savePopup.classList.add('show');
  setTimeout(() => {
    savePopup.classList.remove('show');
  }, 2000);
}

function loadGame() {
  const saveStr = localStorage.getItem('GameSave');
  if (!saveStr) return;

  try {
    const saveData = JSON.parse(saveStr);
    value = new OmegaNum(saveData.value);
    hueShifts = saveData.hueShifts || 0;

    // Restore upgrades
    upgrades.squareShrink.level = saveData.squareShrinkLevel || 0;
    upgrades.autoShrink.purchased = saveData.autoShrinkPurchased || false;

    // Restore costs and UI for squareShrink
    upgrades.squareShrink.cost = upgrades.squareShrink.baseCost.pow(OmegaNum.min(1, 1.95 * (upgrades.squareShrink.level ** 2)));
    upgrades.squareShrink.button.textContent = `Square shrinking rate (Cost: ${formatValue(upgrades.squareShrink.cost)}) ${upgrades.squareShrink.level}/10`;

    // Restore auto shrink button state
    upgrades.autoShrink.button.disabled = upgrades.autoShrink.purchased;
    upgrades.autoShrink.button.textContent = upgrades.autoShrink.purchased ? "Auto shrink purchased" : `Auto shrink (Cost: ${formatValue(upgrades.autoShrink.cost)})`;

    // Restore shrink factors
    shrinkClickFactor = new OmegaNum(saveData.shrinkClickFactor);
    shrinkAutoFactor = new OmegaNum(saveData.shrinkAutoFactor);

    // Restore softcap divisor
    softcapRootDivisor = new OmegaNum(saveData.softcapRootDivisor);

    // Update display for value and shrink button
    valueDisplay.textContent = formatValue(value);
    updateShrinkButton();
    updateCircleSize();

  } catch(e) {
    console.error('Failed to load save:', e);
  }
}
