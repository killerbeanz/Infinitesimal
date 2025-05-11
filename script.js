let value = 1;
let valueDisplay = document.getElementById('value');
let circle = document.getElementById('circle');

let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];

let upgradeLevel = 0;
let upgradeCost = 10;
let costDisplay = document.getElementById('upgrade-cost');
let manualPower = 0.01;
let decayRate = 0.0005;

function getRadius(x) {
  const term = Math.log(Math.log(1 - Math.log(x)) + 1);
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
  value = Math.max(0, value - manualPower);
  valueDisplay.textContent = value.toFixed(4);
  updateCircleSize();
}

function buyUpgrade() {
  if (value >= upgradeCost) {
    value -= upgradeCost;
    upgradeLevel += 1;
    upgradeCost *= 2;
    manualPower *= 1.5;
    decayRate *= 1.2;
    costDisplay.textContent = upgradeCost.toFixed(2);
    valueDisplay.textContent = value.toFixed(4);
  }
}

function tick() {
  if (value > 0) {
    value = Math.max(0, value - decayRate);
    valueDisplay.textContent = value.toFixed(4);
    updateCircleSize();
  }
}

setInterval(tick, 100);
window.addEventListener('resize', updateCircleSize);
updateCircleSize();
