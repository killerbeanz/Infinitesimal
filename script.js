let value = new OmegaNum(1);
let valueDisplay = document.getElementById('value');
let circle = document.getElementById('circle');
let manualButton = document.getElementById('manual-button');

let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];

let upgrades = {
  autoDecrease: {
    purchased: false,
    cost: new OmegaNum(0.5),
    button: document.getElementById('auto-upgrade-button')
  },
  manualMultiplier: {
    level: 0,
    baseCost: new OmegaNum(0.95),
    cost: new OmegaNum(0.95),
    button: document.getElementById('manual-upgrade-button')
  }
};

let manualFactor = new OmegaNum(0.9995);
let decayFactor = new OmegaNum(0.9995);

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
  manualButton.textContent = `Multiply by ${formatValue(manualFactor)}`;
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
  let adjustedDecay = manualFactor
  if (value.lt('1e-30')) {
      const ratio = new OmegaNum('1e-30').div(value).log10().mul(10);
      adjustedDecay = manualFactor.root(ratio);
    }
  value = value.mul(adjustedDecay);
  valueDisplay.textContent = formatValue(value);
  updateCircleSize();
}

function buyManualUpgrade() {
  const upgrade = upgrades.manualMultiplier;
  if (upgrade.level <= 9) {
    if (value.lt(upgrade.cost)) {
      value = value.div(upgrade.cost);
      upgrade.level += 1;
      upgrade.cost = upgrade.baseCost.pow(1.95 * (upgrade.level ** 2));
      manualFactor = manualFactor.pow(2);
      decayFactor = decayFactor.pow(2);
      upgrade.button.textContent = `Square decrease rate (Cost: ${formatValue(upgrade.cost)}) ${upgrade.level}/10`;
      valueDisplay.textContent = formatValue(value);
      updateManualButton();
    }
  }
}

function buyAutoDecrease() {
  const upgrade = upgrades.autoDecrease;
  if (!upgrade.purchased && value.lt(upgrade.cost)) {
    value = value.div(upgrade.cost);
    upgrade.purchased = true;
    upgrade.button.disabled = true;
    upgrade.button.textContent = "Auto decrease purchased";
    valueDisplay.textContent = formatValue(value);
  }
}

function tick() {
  if (value.gt(0) && upgrades.autoDecrease.purchased) {
    let adjustedDecay = decayFactor;
    if (value.lt('1e-30')) {
      const ratio = new OmegaNum('1e-30').div(value).log10().mul(10);
      adjustedDecay = decayFactor.root(ratio);
    }
    value = value.mul(adjustedDecay);
    valueDisplay.textContent = formatValue(value);
    updateCircleSize();
  }
}

setInterval(tick, 100);
window.addEventListener('resize', updateCircleSize);
updateManualButton();
updateCircleSize();
