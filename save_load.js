function saveGame() {
    const saveData = {
        // Core stats
        value: value.toString(),
        hueShifts,
        squareShrinkLevel: upgrades.squareShrink.level,
        autoShrinkPurchased: upgrades.autoShrink.purchased,
        shrinkClickFactor: shrinkClickFactor.toString(),
        shrinkAutoFactor: shrinkAutoFactor.toString(),
        softcapPower: softcapPower.toString(),

        // Antihole
        antiholeUnlocked,
        antiholeSize: antiholeSize.toString(),
        shrinkDivide: shrinkDivide.toString(),
        antiholeUpgrade1Level: antiholeUpgrades.squareLimit.level,
        antiholeUpgrade1Cost: antiholeUpgrades.squareLimit.cost.toString(),
        antiholeUpgrade2Level: antiholeUpgrades.keepAuto.purchased,
        antiholeUpgrade2Cost: antiholeUpgrades.keepAuto.cost.toString(),
        antiholeUpgrade3Level: antiholeUpgrades.divideByThree.level,
        antiholeUpgrade3Cost: antiholeUpgrades.divideByThree.cost.toString(),
        antiholeUpgrade4Level: antiholeUpgrades.doubleAntiholeShrink.level,
        antiholeUpgrade4Cost: antiholeUpgrades.doubleAntiholeShrink.cost.toString(),

        // Automation Upgrades
        automateSquareBuyPurchased: automationUpgrades.automateSquareBuy.purchased,
        automateHueShiftLevel: automationUpgrades.automateHueShift.level,
        automateHueShiftCost: automationUpgrades.automateHueShift.cost.toString(),
        automateAntiholePurchased: automationUpgrades.automateAntihole.purchased,
        automateAntiholeEnabled: automationUpgrades.automateAntihole.enabled
    };
    localStorage.setItem("GameSave", JSON.stringify(saveData));
}

function loadGame() {
    const s = localStorage.getItem("GameSave");
    if (!s) return;
    try {
        const d = JSON.parse(s);
        value = new OmegaNum(d.value);
        hueShifts = d.hueShifts || 0;
        upgrades.squareShrink.level = d.squareShrinkLevel || 0;
        upgrades.autoShrink.purchased = d.autoShrinkPurchased || false;
        shrinkClickFactor = new OmegaNum(d.shrinkClickFactor);
        shrinkAutoFactor = new OmegaNum(d.shrinkAutoFactor);
        softcapPower = new OmegaNum(d.softcapPower);

        // Antihole
        antiholeUnlocked = d.antiholeUnlocked || false;
        antiholeSize = new OmegaNum(d.antiholeSize || 1);
        shrinkDivide = new OmegaNum(d.shrinkDivide || 1);
        antiholeUpgrades.squareLimit.level = d.antiholeUpgrade1Level || 0;
        antiholeUpgrades.squareLimit.cost = new OmegaNum(
            d.antiholeUpgrade1Cost || 1.5
        );
        antiholeUpgrades.keepAuto.purchased = d.antiholeUpgrade2Level || false;
        antiholeUpgrades.keepAuto.cost = new OmegaNum(
            d.antiholeUpgrade2Cost || 5
        );
        antiholeUpgrades.divideByThree.level = d.antiholeUpgrade3Level || 0;
        antiholeUpgrades.divideByThree.cost = new OmegaNum(
            d.antiholeUpgrade3Cost || 10
        );
        antiholeUpgrades.doubleAntiholeShrink.level =
            d.antiholeUpgrade4Level || 0;
        antiholeUpgrades.doubleAntiholeShrink.cost = new OmegaNum(
            d.antiholeUpgrade4Cost || 100
        );
        antiholeShrinkRate = OmegaNum(2).pow(
            antiholeUpgrades.doubleAntiholeShrink.level + 1
        );

        squareShrinkMaxLevel = 10 + antiholeUpgrades.squareLimit.level;

        // Automation Upgrades
        automationUpgrades.automateSquareBuy.purchased =
            d.automateSquareBuyPurchased || false;
        automationUpgrades.automateHueShift.level =
            d.automateHueShiftLevel || 0;
        automationUpgrades.automateHueShift.cost = new OmegaNum(
            d.automateHueShiftCost || 20
        );
        automationUpgrades.automateAntihole.purchased =
            d.automateAntiholePurchased || false;
        
        automationUpgrades.automateAntihole.enabled = d.automateAntiholeEnabled
        automationUpgrades.automateAntihole.checkbox.checked = d.automateAntiholeEnabled

        // Update Automation Buttons
        if (automationUpgrades.automateSquareBuy.purchased) {
            automationUpgrades.automateSquareBuy.button.disabled = true;
            automationUpgrades.automateSquareBuy.button.textContent =
                'Automatically buying the "Square shrinking rate" upgrade when you have .1x the cost';
        }

        const ahs = automationUpgrades.automateHueShift;
        if (ahs.level === 0) {
            ahs.button.textContent = `Automatically Hue Shift\n(Cost: ${formatValue(
                ahs.cost
            )}) 0/2`;
        } else if (ahs.level === 1) {
            ahs.button.textContent = `Automatically Hue Shift without resetting\n(Cost: ${formatValue(
                ahs.cost
            )}) 1/2`;
        } else if (ahs.level === 2) {
            ahs.button.textContent = `Automatically Hue Shifting without resetting`;
        }

        if (automationUpgrades.automateAntihole.purchased) {
            automationUpgrades.automateAntihole.button.disabled = true;
            automationUpgrades.automateAntihole.button.textContent =
                "Automatically throwing your holes into the Antihole and allowing further shrinking";
        }

        // Update UI Texts
        upgrades.squareShrink.cost = upgrades.squareShrink.baseCost.pow(
            OmegaNum.max(1, 1.95 * upgrades.squareShrink.level ** 2)
        );
        upgrades.squareShrink.button.textContent = `Square shrinking rate\n(Cost: ${formatValue(
            upgrades.squareShrink.cost
        )}) ${upgrades.squareShrink.level}/${squareShrinkMaxLevel}`;

        upgrades.autoShrink.button.disabled = upgrades.autoShrink.purchased;
        upgrades.autoShrink.button.textContent = upgrades.autoShrink.purchased
            ? "Auto shrink purchased"
            : `Auto shrink\n(Cost: ${formatValue(upgrades.autoShrink.cost)})`;

        antiholeUpgrades.squareLimit.button.textContent =
            `Add 1 to the "Square shrinking rate" upgrade limit\n` +
            `(Cost: ${formatValue(antiholeUpgrades.squareLimit.cost)}) ${
                antiholeUpgrades.squareLimit.level
            }/10`;

        antiholeUpgrades.keepAuto.button.textContent = antiholeUpgrades.keepAuto
            .purchased
            ? "Auto shrink kept"
            : `Keep auto shrink\n(Cost: ${formatValue(
                  antiholeUpgrades.keepAuto.cost
              )})`;

        antiholeUpgrades.divideByThree.button.textContent =
            `Divide the shrinking rate by 3\n` +
            `(Cost: ${formatValue(antiholeUpgrades.divideByThree.cost)}) ${
                antiholeUpgrades.divideByThree.level
            }/5`;

        antiholeUpgrades.doubleAntiholeShrink.button.textContent =
            `Multiply the Antihole shrinking rate by 2\n` +
            `(Cost: ${formatValue(
                antiholeUpgrades.doubleAntiholeShrink.cost
            )}) ${antiholeUpgrades.doubleAntiholeShrink.level}/∞`;

        displayAntihole.textContent = formatValue(antiholeSize);
        displayAntiholeAutomation.textContent = formatValue(antiholeSize);

        updateUIVisibility();
        valueDisplay.textContent = formatValue(value);
        updateShrinkButton();
        updateCircleSize();
    } catch (e) {
        console.error("Failed to load save:", e);
    }
}
