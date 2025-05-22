let antiholeUnlocked = false;
let showAntiholePrompt = false;
let antiholeModal = document.getElementById('antihole-modal');
let confirmAntiholeButton = document.getElementById('confirm-antihole');
let antiholeSize = new OmegaNum(1);
let squareShrinkMaxLevel = 10;
let antiholeShrinkRate = OmegaNum(2);

let antiholeUpgrades = {
  squareLimit: {
    level: 0,
    baseCost: new OmegaNum(1.5),
    cost: new OmegaNum(1.5),
    button: document.getElementById('antihole-square-limit')
  },
  keepAuto: {
    purchased: false,
    cost: new OmegaNum(5),
    button: document.getElementById('antihole-keep-auto')
  },
  divideByThree: {
    level: 0,
    baseCost: new OmegaNum(10),
    cost: new OmegaNum(10),
    button: document.getElementById('antihole-divide-rate')
  },
  doubleAntiholeShrink: {
    level: 0,
    baseCost: new OmegaNum(5),
    cost: new OmegaNum(5),
    button: document.getElementById('antihole-double-shrink')
  }
};

function buyAntiholeUpgrade1() {
  let au = antiholeUpgrades.squareLimit;
  let u = upgrades.squareShrink;
  if (au.level < 10 && antiholeSize.gte(au.cost)) {
    antiholeSize = antiholeSize.div(au.cost);
    au.level++;
    au.cost = au.baseCost.pow(Math.max(1, 1.95 * (au.level ** 2)));
    squareShrinkMaxLevel = 10 + au.level;
    au.button.textContent = 
      `Add 1 to the "Square shrinking rate" upgrade limit\n` +
      `(Cost: ${formatValue(au.cost)}) ${au.level}/10`;
    displayAntihole.textContent = formatValue(antiholeSize);
    displayAntiholeAutomation.textContent = formatValue(antiholeSize);
    u.button.textContent = `Square shrinking rate\n(Cost: ${formatValue(u.cost)}) ${u.level}/${squareShrinkMaxLevel}`;
  }
}
antiholeUpgrades.squareLimit.button.addEventListener('click', buyAntiholeUpgrade1);

function buyAntiholeUpgrade2() {
  let au = antiholeUpgrades.keepAuto;
  if (!au.purchased && antiholeSize.gte(au.cost)) {
    antiholeSize = antiholeSize.div(au.cost);
    au.purchased = true;
    au.button.disabled = true;
    au.button.textContent = "Auto shrink kept";
    displayAntihole.textContent = formatValue(antiholeSize);
    displayAntiholeAutomation.textContent = formatValue(antiholeSize);
  }
}
antiholeUpgrades.keepAuto.button.addEventListener('click', buyAntiholeUpgrade2);

function buyAntiholeUpgrade3() {
  let au = antiholeUpgrades.divideByThree;
  if (au.level < 5 && antiholeSize.gte(au.cost)) {
    antiholeSize = antiholeSize.div(au.cost);
    au.level++;
    au.cost = au.baseCost.pow(Math.max(1, 5 * (au.level ** 2)));
    shrinkDivide = OmegaNum(3).pow(au.level);
    shrinkClickFactor = baseShrinkClickFactor.mul(shrinkDivide);
    shrinkAutoFactor = baseShrinkAutoFactor.mul(shrinkDivide);
    au.button.textContent = 
      `Divide the shrinking rate by 3\n` +
      `(Cost: ${formatValue(au.cost)}) ${au.level}/5`;
    displayAntihole.textContent = formatValue(antiholeSize);
    displayAntiholeAutomation.textContent = formatValue(antiholeSize);

  }
}
antiholeUpgrades.divideByThree.button.addEventListener('click', buyAntiholeUpgrade3);

function buyAntiholeUpgrade4() {
    let au = antiholeUpgrades.doubleAntiholeShrink
    if (antiholeSize.gte(au.cost)) {
        antiholeSize = antiholeSize.div(au.cost);
        au.level++;
        au.cost = au.baseCost.mul(OmegaNum(10).pow(au.level));
        antiholeShrinkRate = OmegaNum(2).pow(au.level + 1);
        au.button.textContent =
            `Multiply the Antihole shrinking rate by 2\n` +
            `(Cost: ${formatValue(au.cost)}) ${au.level}/∞`;
        displayAntihole.textContent = formatValue(antiholeSize);
        displayAntiholeAutomation.textContent = formatValue(antiholeSize);
    }
}
antiholeUpgrades.doubleAntiholeShrink.button.addEventListener('click', buyAntiholeUpgrade4);

function triggerAntihole() {
    // **Reset hueShifts on Antihole**
    hueShifts = 0;
    softcapPower = new OmegaNum(1);
    antiholeSize = antiholeSize.mul(antiholeShrinkRate);
    if (!antiholeUnlocked) {
        updateUIVisibility();
    }
    antiholeUnlocked = true;
    resetGameProgress();
    antiholeModal.style.display = 'none';
    showAntiholePrompt = false;
    updateBackgroundColor();
}
confirmAntiholeButton.addEventListener('click', triggerAntihole);