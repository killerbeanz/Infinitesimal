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
  const term = Math.log(Math.log(Math.log(1 - Math.log(x)) + 1) + 1);
  return term;
}

function interpolateColor(min, max, t) {
  const r = Math.round(min[0] * (1 - t) + max[0] * t);
  const g = Math.round(min[1] * (1 - t) + max[1] * t);
  const b = Math.round(min[2] * (1 - t) + max[2] * t);
  return `rgb(${r}, ${g}, ${b})`;
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
  valueDisplay.textContent = value.toFixed(6);
  updateCircleSize();
}

function buyUpgrade() {
  if (value < upgradeCost) {
    value /= upgradeCost;
    upgradeLevel += 1;
    upgradeCost /= 1.5;
    manualFactor = Math.pow(manualFactor, 1.1);
    decayFactor = Math.pow(decayFactor, 1.05);
    costDisplay.textContent = upgradeCost.toFixed(4);
    valueDisplay.textContent = value.toFixed(6);
  }
}

function tick() {
  if (value > 0) {
    value *= decayFactor;
    valueDisplay.textContent = value.toFixed(6);
    updateCircleSize();
  }
}

setInterval(tick, 100);
window.addEventListener('resize', updateCircleSize);
updateCircleSize();
