let value = new OmegaNum(1);
let valueDisplay = document.getElementById('display-value');
let circle = document.getElementById('circle');
let shrinkButton = document.getElementById('shrink-button');

let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];

let upgrades = {
  autoShrink: {
    purchased: false,
    cost: new OmegaNum(2),
    button: document.getElementById('auto-upgrade-button')
  },
  squareShrink: {
    level: 0,
    baseCost: new OmegaNum(1).div(0.95),
    cost: new OmegaNum(1).div(0.95),
    button: document.getElementById('manual-upgrade-button')
  }
};

let baseShrinkClickFactor = new OmegaNum(1).div(0.9995);
let shrinkClickFactor = baseShrinkClickFactor;
let adjustedShrinkClick = shrinkClickFactor;
let baseShrinkAutoFactor = new OmegaNum(1).div(0.9995);
let shrinkAutoFactor = baseShrinkAutoFactor;
let adjustedShrinkAuto = shrinkAutoFactor;

function getRadius(x) {
  const term = Math.log(x.toNumber()) / 308;
  return term;
}

function interpolateColor(min, max, t) {
  const r = Math.round(min[0] * (1 - t) + max[0] * t);
  const g = Math.round(min[1] * (1 - t) + max[1] * t);
  const b = Math.round(min[2] * (1 - t) + max[2] * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function formatValue(value, digits = 4) {
  const threshold = new OmegaNum(1e6);
  if (value.gte(threshold)) {
    const expString = value.toExponential();
    const [mantissa, exponentStr] = expString.split('e');
    const exponent = parseInt(exponentStr, 10);
    const adjustedExp = exponent;
    const mantissaNum = parseFloat(mantissa);
    const reciprocalMantissa = 1 / mantissaNum;
    const rawDigits = reciprocalMantissa.toFixed(digits + 2).replace('.', '');
    const padded = rawDigits.padEnd(digits, '0');
    const mantissaDigits = padded.slice(0, digits);
    return `0.-(${adjustedExp})-${mantissaDigits}`;
  } else {
    const reciprocal = OmegaNum.div(1, value);
    return reciprocal.toFixed(6);
  }
}

function updateShrinkButton() {
  if (value.lte(1e30)) {
    shrinkButton.textContent = `Multiply by ${formatValue(shrinkButtonFactor)}`;
  } else {
    shrinkButton.textContent = `Multiply by ${formatValue(adjustedShrinkClick)} due to being smaller than 0.-(30)-1000`;
  }
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

function shrinkClick() {
  adjustedShrinkClick = shrinkClickFactor;
  if (value.lt('1e30')) {
    const ratio = new OmegaNum.div(value, '1e30').ln().mul(OmegaNum.div(value, '1e30'));
    adjustedShrinkClick = shrinkClickFactor.root(ratio);
  }
  value = value.mul(adjustedShrinkClick);
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
      shrinkClickFactor = baseShrinkClickFactor.pow(OmegaNum(2).pow(upgrade.level));
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
    adjustedShrinkAuto = shrinkAutoFactor;
    if (value.lt('1e30')) {
      const ratio = new OmegaNum.div(value, '1e30').ln().mul(OmegaNum.div(value, '1e30'));
      adjustedShrinkAuto = shrinkAutoFactor.root(ratio);
    }
    value = value.mul(adjustedShrinkAuto);
    valueDisplay.textContent = formatValue(value);
    updateCircleSize();
  }
}

setInterval(tick, 50);
window.addEventListener('resize', updateCircleSize);
updateShrinkButton();
updateCircleSize();
