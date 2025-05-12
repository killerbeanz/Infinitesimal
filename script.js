let value = 1;
let valueDisplay = document.getElementById('value');
let circle = document.getElementById('circle');

let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];

let upgradeLevel = 0;
let upgradeCost = 0.9;
let costDisplay = document.getElementById('upgrade-cost');
let manualFactor = 0.999;
let decayFactor = 0.9999;

function getRadius(x) {
  const term = (1 - Math.log(x)) / 308;
  return term;
}

function interpolateColor(min, max, t) {
  const r = Math.round(min[0] * (1 - t) + max[0] * t);
  const g = Math.round(min[1] * (1 - t) + max[1] * t);
  const b = Math.round(min[2] * (1 - t) + max[2] * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function formatValue(val) {
  if (val >= 0.000001) {
    return val.toFixed(6);
  }
  const str = val.toExponential();
  const match = str.match(/e-(\d+)/);
  if (match) {
    const exponent = parseInt(match[1], 10);
    const digits = val.toFixed(exponent + 2).split('.')[1];
    const significant = digits.replace(/^0+/, '').slice(0, 5).padEnd(4, '0');
    const zeroCount = exponent - 1;
    return `0.0-${zeroCount}-${significant}`;
  }
  return val.toString();
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
  value *= manualFactor;
  valueDisplay.textContent = formatValue(value);
  updateCircleSize();
}

function buyUpgrade() {
  if (value < upgradeCost) {
    value /= upgradeCost;
    upgradeLevel += 1;
    upgradeCost /= 1.5;
    manualFactor = Math.pow(manualFactor, 1.1);
    decayFactor = Math.pow(decayFactor, 1.05);
    costDisplay.textContent = formatValue(upgradeCost);
    valueDisplay.textContent = formatValue(value);
  }
}

function tick() {
  if (value > 0) {
    value *= decayFactor;
    valueDisplay.textContent = formatValue(value);
    updateCircleSize();
  }
}

setInterval(tick, 100);
window.addEventListener('resize', updateCircleSize);
updateCircleSize();
