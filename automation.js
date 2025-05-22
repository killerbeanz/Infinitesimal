let automationUpgrades = {
    automateSquareBuy: {
        purchased: false,
        cost: new OmegaNum(10),
        button: document.getElementById('automate-square-buy')
    },
    automateHueShift: {
        level: 0,
        baseCost: new OmegaNum(20),
        cost: new OmegaNum(20),
        button: document.getElementById('automate-hue-shift')
    },
    automateAntihole: {
        purchased: false,
        enabled: false,
        cost: new OmegaNum(1000),
        button: document.getElementById('automate-antihole'),
        checkbox: document.getElementById('toggle-antihole-auto')
    }
}



function buyAutomationUpgrade1() {
    let au = automationUpgrades.automateSquareBuy
    if (!au.purchased && antiholeSize.gte(au.cost)) {
        antiholeSize = antiholeSize.div(au.cost);
        au.purchased = true;
        au.button.disabled = true;
        au.button.textContent = 'Automatically buying the "Square shrinking rate" upgrade when you have .1x the cost';
        displayAntihole.textContent = formatValue(antiholeSize);
        displayAntiholeAutomation.textContent = formatValue(antiholeSize);
    }
}
automationUpgrades.automateSquareBuy.button.addEventListener('click', buyAutomationUpgrade1)

function buyAutomationUpgrade2() {
    let au = automationUpgrades.automateHueShift
    if (au.level < 2 && antiholeSize.gte(au.cost)) {
        antiholeSize = antiholeSize.div(au.cost);
        au.level++;
        au.cost = OmegaNum(200);
        if (au.level == 1) {
            au.button.textContent =
            'Automatically Hue Shift without resetting\n' +
            `(Cost: ${formatValue(au.cost)}) ${au.level}/2`;
        } else {
            au.button.textContent = 'Automatically Hue Shifting without resetting'
        }
        displayAntihole.textContent = formatValue(antiholeSize);
        displayAntiholeAutomation.textContent = formatValue(antiholeSize);
    }
}
automationUpgrades.automateHueShift.button.addEventListener('click', buyAutomationUpgrade2)

function buyAutomationUpgrade3() {
    let au = automationUpgrades.automateAntihole
    if (!au.purchased && antiholeSize.gte(au.cost)) {
        antiholeSize = antiholeSize.div(au.cost);
        au.purchased = true;
        au.button.disabled = true;
        au.button.textContent = 'Automatically throwing your holes into the Antihole and allowing further shrinking';
        toggleCheckbox.checked = true;
        au.enabled = true;
        displayAntihole.textContent = formatValue(antiholeSize);
        displayAntiholeAutomation.textContent = formatValue(antiholeSize);
    }
}
automationUpgrades.automateAntihole.button.addEventListener('click', buyAutomationUpgrade3)
automationUpgrades.automateAntihole.checkbox.addEventListener('change', function () {
    automationUpgrades.automateAntihole.enabled = automationUpgrades.automateAntihole.checkbox.checked;
});