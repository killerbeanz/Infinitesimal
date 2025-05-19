// script.js
// Core game variables
let value = new OmegaNum(1);
let valueDisplay = document.getElementById('display-value');
let circle = document.getElementById('circle');
let shrinkButton = document.getElementById('shrink-button');

// Add popup for hue shift
const hueShiftModal = document.createElement('div');
hueShiftModal.id = 'hue-shift-modal';
hueShiftModal.style = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.75); z-index:1000; color:white; justify-content:center; align-items:center; flex-direction:column; font-size:24px;';
hueShiftModal.innerHTML = `
  <div>You've gotten too small, it's time to Hue Shift.</div>
  <button id="confirm-hue-shift" style="margin-top:20px; padding:10px 20px; font-size:20px;">Hue Shift</button>
`;
document.body.appendChild(hueShiftModal);

const confirmHueShiftButton = document.getElementById('confirm-hue-shift');
let showHueShiftPrompt = false;

// Prestige (Hue Shift) variables
let hueShifts = 0;
let softcapRootDivisor = new OmegaNum(1000);
let hueShiftThreshold = [new OmegaNum('1e31'), new OmegaNum('1e308')];

// Base colors
let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];
const baseBackgroundColor = [26, 32, 44]; // #1a202c from CSS
const redColor = [255, 0, 0]; // pure red

function updateBackgroundColor() {
  const shiftFraction = Math.min(hueShifts / 15, 1);
  const bgColor = interpolateColor(baseBackgroundColor, redColor, shiftFraction);
  document.body.style.backgroundColor = bgColor;
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

// Update shrink button text
function updateShrinkButton() {
  if (value.lte('1e30')) {
    shrinkButton.textContent = `Multiply by ${formatValue(adjustedShrinkClick)}`;
  } else {
    shrinkButton.textContent = `Multiply by ${formatValue(adjustedShrinkClick)}\ndue to being smaller than 0.-(29)-0999`;
  }
}

// Interpolate between two colors
function interpolateColor(min, max, t) {
  const r = Math.round(min[0] * (1 - t) + max[0] * t);
  const g = Math.round(min[1] * (1 - t) + max[1] * t);
  const b = Math.round(min[2] * (1 - t) + max[2] * t);
  return `rgb(${r}, ${g}, ${b})`;
}

// Get color with hue shift applied
function getHueShiftedColor(t) {
  const shiftFrac = Math.min(hueShifts / 15, 1);
  const shiftedMin = [
    minColor[0] + shiftFrac * (255 - minColor[0]),
    minColor[1] * (1 - shiftFrac),
    minColor[2] * (1 - shiftFrac)
  ];
  return interpolateColor(shiftedMin, maxColor, t);
}

function updateCircleSize() {
  const minSize = Math.min(window.innerWidth, window.innerHeight);
  const term = Math.log(value.toNumber()) / 308;
  const size = minSize * term;
  const t = Math.min(1, Math.max(0, size / minSize));
  const color = getHueShiftedColor(t);
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.left = `${(window.innerWidth - size) / 2}px`;
  circle.style.top = `${(window.innerHeight - size) / 2}px`;
  circle.style.backgroundColor = color;
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
  if (u.level < 10 && value.gte(u.cost)) {
    value = value.div(u.cost);
    u.level++;
    u.cost = u.baseCost.pow(1.95 * (u.level ** 2));
    shrinkClickFactor = baseShrinkClickFactor.pow(OmegaNum(2).pow(u.level));
    shrinkAutoFactor = baseShrinkAutoFactor.pow(OmegaNum(2).pow(u.level));
    u.button.textContent = `Square shrinking rate (Cost: ${formatValue(u.cost)}) ${u.level}/10`;
    valueDisplay.textContent = formatValue(value);
    updateShrinkButton();
  }
}
upgrades.squareShrink.button.addEventListener('click', buySquareShrinkUpgrade);

function buyAutoShrink() {
  let u = upgrades.autoShrink;
  if (!u.purchased && value.gte(u.cost)) {
    value = value.div(u.cost);
    u.purchased = true;
    u.button.disabled = true;
    u.button.textContent = "Auto decrease purchased";
    valueDisplay.textContent = formatValue(value);
  }
}
upgrades.autoShrink.button.addEventListener('click', buyAutoShrink);

confirmHueShiftButton.addEventListener('click', () => {
  hueShifts++;
  value = new OmegaNum(1);
  softcapRootDivisor = softcapRootDivisor.div(2);
  updateBackgroundColor();
  upgrades.squareShrink.level = 0;
  upgrades.squareShrink.cost = upgrades.squareShrink.baseCost;
  upgrades.autoShrink.purchased = false;
  upgrades.autoShrink.button.disabled = false;
  upgrades.autoShrink.button.textContent = `Auto shrink (Cost: ${formatValue(upgrades.autoShrink.cost)})`;
  upgrades.squareShrink.button.textContent = `Square shrinking rate (Cost: ${formatValue(upgrades.squareShrink.cost)}) 0/10`;
  shrinkClickFactor = baseShrinkClickFactor;
  shrinkAutoFactor = baseShrinkAutoFactor;
  hueShiftModal.style.display = 'none';
});

function autoBuyUpgrades() {
  const u = upgrades.squareShrink;
  while (u.level < 10 && value.gte(u.cost)) {
    u.level++;
    u.cost = u.baseCost.pow(1.95 * (u.level ** 2));
    shrinkClickFactor = baseShrinkClickFactor.pow(OmegaNum(2).pow(u.level));
    shrinkAutoFactor = baseShrinkAutoFactor.pow(OmegaNum(2).pow(u.level));
    u.button.textContent = `Square shrinking rate (Cost: ${formatValue(u.cost)}) ${u.level}/10`;
  }
  const a = upgrades.autoShrink;
  if (!a.purchased && value.gte(a.cost)) {
    a.purchased = true;
    a.button.disabled = true;
    a.button.textContent = "Auto decrease purchased";
  }
}

function tick() {
  if (!showHueShiftPrompt && value.gte(hueShiftThreshold[Math.min(hueShifts, hueShiftThreshold.length - 1)])) {
    hueShiftModal.style.display = 'flex';
    showHueShiftPrompt = true;
  }

  updateCircleSize();
  adjustedShrinkClick = shrinkClickFactor;
  if (value.gt('1e30')) {
    const ratio = value.div('1e30').ln().mul(softcapRootDivisor);
    adjustedShrinkClick = shrinkClickFactor.root(ratio);
  }
  updateShrinkButton();

  if (value.gt(0) && upgrades.autoShrink.purchased) {
    adjustedShrinkAuto = shrinkAutoFactor;
    if (value.gt('1e30')) {
      const ratio = value.div('1e30').ln().mul(softcapRootDivisor);
      adjustedShrinkAuto = shrinkAutoFactor.root(ratio);
    }
    value = value.mul(adjustedShrinkAuto);
    valueDisplay.textContent = formatValue(value);
  }

  autoBuyUpgrades();
}
setInterval(tick, 50);
window.addEventListener('resize', updateCircleSize);
updateShrinkButton();
updateCircleSize();
