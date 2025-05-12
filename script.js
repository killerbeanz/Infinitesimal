// Initialize value as an OmegaNum instance
let value = new OmegaNum(1);
let valueDisplay = document.getElementById('value');
let circle = document.getElementById('circle');
let manualButton = document.getElementById('manual-button');

let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];

let upgradeLevel = 0;
let baseUpgradeCost = new OmegaNum(0.95);
let upgradeCost = new OmegaNum(0.95);
let costDisplay = document.getElementById('upgrade-cost');
let manualFactor = new OmegaNum(0.9995);
let decayFactor = new OmegaNum(0.9999);

function getRadius(x) {
  const term = (1 - Math.log(x.toNumber())) / 308;
  return term;
}

function interpolateColor(min, max, t) {
  const r = Math.round(min[0] * (1 - t) + max[0] * t);
  const g = Math.round(min[1] * (1 - t) + max[1] * t);
  const b = Math.round(min[2] * (1 - t) + max[2] * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function formatValue(val) {
  if (val.gte(1e-6)) {
    return val.toFixed(6);
  }
  const str = val.toExponential();
  const match = str.match(/e-(\d+)/);
  if (match) {
    const exponent = parseInt(match[1], 10);
    const precision = Math.min(100, exponent + 6);
    const digits = val.toFixed(precision).split('.')[1];
    const significant = digits.replace(/^0+/, '').slice(0, 5).padEnd(4, '0');
    const zeroCount = exponent - 1;
    return `0.-(${zeroCount})-${significant}`;
  }
  return val.toString();
}

function updateManualButton() {
  manualButton.textContent = `Multiply by ${manualFactor.toFixed(6)}`;
}

function updateCircleSize() {
  const minSize = Math.min(window.innerWidth, window.innerHeight);
  const radiusFactor = getRadius(value);
  const size = minSize * radiusFactor;

  const t = Math.min(1, Math.max(0, size / minSize));
  const color = interpolateColor(minColor, maxColor, t);

  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.left = `${(window.innerWidth - size) / 2}px`;
  circle.style.top = `${(window.innerHeight - size) / 2}px`;
  circle.style.backgroundColor = color;
}

function manualReduce() {
  value = value.mul(manualFactor);
  valueDisplay.textContent = formatValue(value);
  updateCircleSize();
}

function buyUpgrade() {
  if (value.lt(upgradeCost)) {
    value = value.div(upgradeCost);
    upgradeLevel += 1;
    upgradeCost = baseUpgradeCost.pow(1.95 * (upgradeLevel ** 2));
    manualFactor = manualFactor.pow(2);
    decayFactor = decayFactor.pow(2);
    costDisplay.textContent = formatValue(upgradeCost);
    valueDisplay.textContent = formatValue(value);
    updateManualButton();
  }
}

function tick() {
  if (value.gt(0)) {
    value = value.mul(decayFactor);
    valueDisplay.textContent = formatValue(value);
    updateCircleSize();
  }
}

setInterval(tick, 100);
window.addEventListener('resize', updateCircleSize);
updateManualButton();
updateCircleSize();
