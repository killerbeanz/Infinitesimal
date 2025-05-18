let value = new OmegaNum(1);
let valueDisplay = document.getElementById('display-value');
let circle = document.getElementById('circle');
let shrink_Button = document.getElementById('shrink-button');

let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];

let upgrades = {
  autoShrink: {
    purchased: false,
    cost: new OmegaNum(0.5),
    button: document.getElementById('auto-upgrade-button')
  },
  squareShrink: {
    level: 0,
    baseCost: new OmegaNum(0.95),
    cost: new OmegaNum(0.95),
    button: document.getElementById('manual-upgrade-button')
  }
};

let baseShrinkButtonFactor = new OmegaNum(0.9995);
let shrinkButtonFactor = baseShrinkButtonFactor;
let baseShrinkAutoFactor = new OmegaNum(0.9995);
let shrinkAutoFactor = baseShrinkAutoFactor

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

function updateShrinkButton() {
  shrink_Button.textContent = `Multiply by ${formatValue(shrinkButtonFactor)}`;
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

function shrinkButton() {
  let adjustedShrink = shrinkButtonFactor
  if (value.lt('1e-30')) {
      const ratio = new OmegaNum('1e-30').div(value).log10().mul(OmegaNum('1e-30').div(value));
      adjustedShrink = shrinkButtonFactor.root(ratio);
    }
  value = value.mul(adjustedShrink);
  valueDisplay.textContent = formatValue(value);
  updateCircleSize();
}

function buySquareShrinkUpgrade() {
  const upgrade = upgrades.squareShrink;
  if (upgrade.level <= 9) {
    if (value.lt(upgrade.cost)) {
      value = value.div(upgrade.cost);
      upgrade.level += 1;
      upgrade.cost = upgrade.baseCost.pow(1.95 * (upgrade.level ** 2));
      shrinkButtonFactor = baseShrinkButtonFactor.pow(OmegaNum(2).pow(upgrade.level));
      shrinkAutoFactor = baseShrinkAutoFactor.pow(OmegaNum(2).pow(upgrade.level));
      upgrade.button.textContent = `Square shrinking rate (Cost: ${formatValue(upgrade.cost)}) ${upgrade.level}/10`;
      valueDisplay.textContent = formatValue(value);
      updateShrinkButton();
    }
  }
}

function buyAutoShrink() {
  const upgrade = upgrades.autoShrink;
  if (!upgrade.purchased && value.lt(upgrade.cost)) {
    value = value.div(upgrade.cost);
    upgrade.purchased = true;
    upgrade.button.disabled = true;
    upgrade.button.textContent = "Auto decrease purchased";
    valueDisplay.textContent = formatValue(value);
  }
}

function tick() {
  if (value.gt(0) && upgrades.autoShrink.purchased) {
    let adjustedShrink = decayFactor;
    if (value.lt('1e-30')) {
      const ratio = new OmegaNum('1e-30').div(value).log10().mul(OmegaNum('1e-30').div(value));
      adjustedShrink = shrinkAutoFactor.root(ratio);
    }
    value = value.mul(adjustedShrink);
    valueDisplay.textContent = formatValue(value);
    updateCircleSize();
  }
}

setInterval(tick, 50);
window.addEventListener('resize', updateCircleSize);
updateManualButton();
updateCircleSize();
