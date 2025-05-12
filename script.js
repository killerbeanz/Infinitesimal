let value = new OmegaNum(1);
let valueDisplay = document.getElementById('value');
let circle = document.getElementById('circle');
let manualButton = document.getElementById('manual-button');

let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];

let manualFactor = new OmegaNum(0.9995);
let decayFactor = new OmegaNum(0.9999);
let decayEnabled = false;

let upgrades = [
  {
    name: "Enable Auto Decrease",
    cost: new OmegaNum(0.5),
    unlocked: false,
    action: () => {
      decayEnabled = true;
    }
  },
  {
    name: "Square Decrease Rate",
    cost: new OmegaNum(0.95),
    unlocked: false,
    action: () => {
      manualFactor = manualFactor.pow(2);
      decayFactor = decayFactor.pow(2);
    }
  }
];

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
  if (val.gte(0.000001)) {
    return val.toNumber().toFixed(6);
  }
  const num = val.toNumber();
  const str = num.toExponential();
  const match = str.match(/e-(\d+)/);
  if (match) {
    const exponent = parseInt(match[1], 10);
    const precision = Math.min(100, exponent + 2);
    const digits = num.toFixed(precision).split('.')[1];
    const significant = digits.replace(/^0+/, '').slice(0, 5).padEnd(4, '0');
    const zeroCount = exponent - 1;
    return `0.-(${zeroCount})-${significant}`;
  }
  return val.toString();
}

function updateManualButton() {
  manualButton.textContent = `Multiply by ${manualFactor.toNumber().toFixed(6)}`;
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

function renderUpgrades() {
  const container = document.getElementById('upgrades');
  container.innerHTML = '';
  upgrades.forEach((upg, i) => {
    if (!upg.unlocked && value.lt(upg.cost)) return;

    const btn = document.createElement('button');
    btn.textContent = `${upg.name} (Cost: ${formatValue(upg.cost)})`;
    btn.onclick = () => {
      if (value.gte(upg.cost)) {
        value = value.div(upg.cost);
        upg.action();
        upg.unlocked = true;
        valueDisplay.textContent = formatValue(value);
        updateManualButton();
        renderUpgrades();
      }
    };
    container.appendChild(btn);
  });
}

function softcapAdjust(x) {
  if (x.gt('1e-100')) return new OmegaNum(1);
  return OmegaNum.sqrt(OmegaNum.div('1e-100', x));
}

function tick() {
  if (decayEnabled && value.gt(0)) {
    const decayMultiplier = decayFactor.pow(softcapAdjust(value));
    value = value.mul(decayMultiplier);
    valueDisplay.textContent = formatValue(value);
    updateCircleSize();
  }
}

setInterval(tick, 100);
window.addEventListener('resize', updateCircleSize);
updateManualButton();
updateCircleSize();
renderUpgrades();
