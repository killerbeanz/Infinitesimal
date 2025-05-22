
// Core game variables
let value = new OmegaNum(1);
let valueDisplay = document.getElementById("display-value");
let circle = document.getElementById("circle");
let shrinkButton = document.getElementById("shrink-button");

// Base colors
let minColor = [26, 32, 44];
let maxColor = [0, 0, 0];
const baseBackgroundColor = [26, 32, 44];
const redColor = [255, 0, 0];

// DOM elements for tabbed sidebar
let sidebarTabs = document.getElementById("sidebar");
let tabShrinking = document.getElementById("tab-shrinking");
let tabAutomation = document.getElementById("tab-automation");
let tabAntihole = document.getElementById("tab-antihole");
let shrinkingPanel = document.getElementById("shrinking-panel");
let automationPanel = document.getElementById("automation-panel");
let antiholePanel = document.getElementById("antihole-panel");
let displayAntihole = document.getElementById("display-antihole");
let displayAntiholeAutomation = document.getElementById(
    "display-antihole-automation"
);

// Upgrades
let upgrades = {
    autoShrink: {
        purchased: false,
        cost: new OmegaNum(2),
        button: document.getElementById("auto-shrink-upgrade"),
    },
    squareShrink: {
        level: 0,
        baseCost: new OmegaNum(1).div(0.95),
        cost: new OmegaNum(1).div(0.95),
        button: document.getElementById("square-shrink-upgrade"),
    },
};

// Shrink factors
let shrinkDivide = new OmegaNum(1);
let baseShrinkClickFactor = new OmegaNum(1).div(0.9995);
let shrinkClickFactor = baseShrinkClickFactor;
let adjustedShrinkClick = shrinkClickFactor;
let baseShrinkAutoFactor = new OmegaNum(1).div(0.9995);
let shrinkAutoFactor = baseShrinkAutoFactor;
let adjustedShrinkAuto = shrinkAutoFactor;

// Save‐popup elements
const savePopup = document.getElementById("save-popup");
function showSavePopup() {
    savePopup.classList.add("show");
    setTimeout(() => savePopup.classList.remove("show"), 2000);
}

loadGame();
updateUIVisibility();

// Utility: format value display
function formatValue(val, digits = 4) {
    const threshold = new OmegaNum(1e6);
    if (val.gte(threshold)) {
        let expString = val.toExponential();
        if (expString === "NaNeNaN") expString = val.toString();
        const [mantissa, exponentStr] = expString.split("e");
        const exponent = parseInt(exponentStr, 10) - 1;
        const mantissaNum = parseFloat(mantissa);
        const reciprocal = 1 / mantissaNum;
        const raw = reciprocal
            .toFixed(digits + 2)
            .replace(".", "")
            .padEnd(digits, "0");
        const digitsStr = raw.slice(0, digits);
        return `0.-(${exponent})-${digitsStr}`;
    } else {
        return OmegaNum.div(1, val).toFixed(6);
    }
}

function updateShrinkButton() {
    if (value.lte("1e30")) {
        shrinkButton.textContent = `Multiply by ${formatValue(
            adjustedShrinkClick
        )}`;
    } if (value.gt("1e30") && value.lte("1e309")) {
        shrinkButton.textContent = `Multiply by ${formatValue(
            adjustedShrinkClick
        )}\ndue to being smaller than 0.-(29)-0999`;
    } if (value.gt("1e309")) {
		shrinkButton.textContent = `Multiply by ${formatValue(
            adjustedShrinkClick
        )}\ndue to being smaller than 0.-(308)-0999`;
	}
}

function interpolateColor(min, max, t) {
    const r = Math.round(min[0] * (1 - t) + max[0] * t);
    const g = Math.round(min[1] * (1 - t) + max[1] * t);
    const b = Math.round(min[2] * (1 - t) + max[2] * t);
    return `rgb(${r}, ${g}, ${b})`;
}

function getHueShiftedColor(t) {
    const shiftFrac = Math.min(hueShifts / 10, 1);
    const shiftedMin = [
        minColor[0] + shiftFrac * (255 - minColor[0]),
        minColor[1] * (1 - shiftFrac),
        minColor[2] * (1 - shiftFrac),
    ];
    return interpolateColor(shiftedMin, maxColor, t);
}

function updateCircleSize() {
    const minSize = Math.min(window.innerWidth, window.innerHeight);
    const term = OmegaNum.log10(value).div(308).toNumber();
    let size = minSize * term;
    const t = Math.min(1, Math.max(0, size / minSize));

    let color;
    if (automationUpgrades.automateAntihole.purchased) {
        color = "rgb(0, 0, 0)";
    } else if (automationUpgrades.automateHueShift.level > 0) {
        const logFraction = OmegaNum.min(OmegaNum.log10(value).div(308), 1);
        color = getHueShiftedColor(logFraction);
    } else {
        color = getHueShiftedColor(t);
    }

    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.backgroundColor = color;

    const requirement = OmegaNum.min(OmegaNum(10).mul(OmegaNum(1e30).pow(hueShifts + 1)), '1e309');
    const reqTerm = Math.log10(requirement.toNumber()) / 308;
    const reqSize = minSize * reqTerm;

    const markerColor = color;
    const marker = document.getElementById("hue-shift-marker");
    marker.style.width = `${reqSize}px`;
    marker.style.height = `${reqSize}px`;
    marker.style.borderColor = markerColor;
}

function shrinkClick() {
	adjustedShrinkClick = shrinkClickFactor;
    if (value.gt("1e30")) {
        let ratio = OmegaNum.max(
            1,
            value.div("1e30").ln().mul(1000).pow(softcapPower)
        );
        if (value.gt("1e309")) {
            ratio = OmegaNum.max(
                1,
                value.div("1e30").ln().mul(1000).pow(softcapPower)
            ).mul(OmegaNum.max(1, value.div("1e30").ln().mul(1000)));
        }
        adjustedShrinkClick = shrinkClickFactor.root(ratio);
    }
    value = value.mul(adjustedShrinkClick);
    valueDisplay.textContent = formatValue(value);
    updateShrinkButton();
    updateCircleSize();
}
shrinkButton.addEventListener("click", shrinkClick);

function buySquareShrinkUpgrade() {
    let u = upgrades.squareShrink;
    if (u.level < squareShrinkMaxLevel && value.gt(u.cost)) {
        value = value.div(u.cost);
        u.level++;
        u.cost = u.baseCost.pow(1.95 * u.level ** 2);
        shrinkClickFactor = baseShrinkClickFactor
            .pow(OmegaNum(2).pow(u.level))
            .mul(shrinkDivide);
        shrinkAutoFactor = baseShrinkAutoFactor
            .pow(OmegaNum(2).pow(u.level))
            .mul(shrinkDivide);
        u.button.textContent = `Square shrinking rate\n(Cost: ${formatValue(
            u.cost
        )}) ${u.level}/${squareShrinkMaxLevel}`;
        updateShrinkButton();
    }
}
upgrades.squareShrink.button.addEventListener("click", buySquareShrinkUpgrade);

function buyAutoShrink() {
    let u = upgrades.autoShrink;
    if (!u.purchased && value.gt(u.cost)) {
        value = value.div(u.cost);
        u.purchased = true;
        u.button.disabled = true;
        u.button.textContent = "Auto shrink purchased";
    }
}
upgrades.autoShrink.button.addEventListener("click", buyAutoShrink);

function resetGameProgress() {
    value = new OmegaNum(1);
    // reset Shrinking upgrades
    upgrades.squareShrink.level = 0;
    upgrades.squareShrink.cost = upgrades.squareShrink.baseCost;
    upgrades.squareShrink.button.textContent = `Square shrinking rate\n(Cost: ${formatValue(
        upgrades.squareShrink.baseCost
    )}) 0/${squareShrinkMaxLevel}`;
    if (!antiholeUpgrades.keepAuto.purchased) {
        upgrades.autoShrink.purchased = false;
        upgrades.autoShrink.button.disabled = false;
        upgrades.autoShrink.button.textContent = `Auto shrink\n(Cost: ${formatValue(
            upgrades.autoShrink.cost
        )})`;
    }
    shrinkClickFactor = baseShrinkClickFactor.mul(shrinkDivide);
    shrinkAutoFactor = baseShrinkAutoFactor.mul(shrinkDivide);
    updateBackgroundColor();
    updateShrinkButton();
    updateCircleSize();
}

function updateUIVisibility() {
    if (antiholeUnlocked) {
        sidebarTabs.style.display = "flex";
        tabShrinking.classList.add("active");
        tabAntihole.classList.remove("active");
        shrinkingPanel.style.display = "block";
        antiholePanel.style.display = "none";
    } else {
        sidebarTabs.style.display = "none";
        shrinkingPanel.style.display = "block";
        antiholePanel.style.display = "none";
    }
}

// Tab switching
tabShrinking.addEventListener("click", () => {
    tabShrinking.classList.add("active");
    tabAutomation.classList.remove("active");
    tabAntihole.classList.remove("active");

    shrinkingPanel.style.display = "block";
    automationPanel.style.display = "none";
    antiholePanel.style.display = "none";
});

tabAutomation.addEventListener("click", () => {
    tabAutomation.classList.add("active");
    tabShrinking.classList.remove("active");
    tabAntihole.classList.remove("active");

    shrinkingPanel.style.display = "none";
    automationPanel.style.display = "block";
    antiholePanel.style.display = "none";
});

tabAntihole.addEventListener("click", () => {
    tabAntihole.classList.add("active");
    tabShrinking.classList.remove("active");
    tabAutomation.classList.remove("active");

    shrinkingPanel.style.display = "none";
    automationPanel.style.display = "none";
    antiholePanel.style.display = "block";
});

function tick() {
    const antiholeThreshold = OmegaNum(10).mul(OmegaNum(2).pow(1024));
    // cap value at whichever prestige is next
    if (!automationUpgrades.automateAntihole.purchased) {
        value = OmegaNum.min(
            value,
            OmegaNum.min(
                OmegaNum(10).mul(OmegaNum(1e30).pow(hueShifts + 1)),
                antiholeThreshold
            )
        );
    }

    // Hue shift prompt
    if (automationUpgrades.automateHueShift.level == 0) {
        if (
            !showHueShiftPrompt &&
            value.gte(OmegaNum(10).mul(OmegaNum(1e30).pow(hueShifts + 1)))
        ) {
            const grantedLevels = Math.min(hueShifts + 1, 10);
            document.getElementById("hue-shift-effects").innerHTML =
                `This will automatically grant<br><strong>${grantedLevels}</strong> level${
                    grantedLevels === 1 ? "" : "s"
                } ` +
                `of the <em>"Square shrinking rate"</em> upgrade when affordable<br>and square root the softcap.`;
            hueShiftModal.style.display = "flex";
            showHueShiftPrompt = true;
        }
    } else {
        if (
            value.gte(OmegaNum(10).mul(OmegaNum(1e30).pow(hueShifts + 1))) &&
            hueShifts < 10
        ) {
            triggerHueShift();
        }
    }

    // Antihole prompt
    if (!automationUpgrades.automateAntihole.purchased) {
        if (value.gte(antiholeThreshold) && !showAntiholePrompt) {
            antiholeModal.style.display = "flex";
            showAntiholePrompt = true;
        }
    } else {
        if (
            value.gte(antiholeThreshold) &&
            automationUpgrades.automateAntihole.enabled
        ) {
            triggerAntihole();
        }
    }

    // Auto-shrink and click adjustments
    updateShrinkButton();
    updateCircleSize();
    updateBackgroundColor();

    adjustedShrinkClick = shrinkClickFactor;
    if (value.gt("1e30")) {
        let ratio = OmegaNum.max(
            1,
            value.div("1e30").ln().mul(1000).pow(softcapPower)
        );
        if (value.gt("1e309")) {
            ratio = OmegaNum.max(
                1,
                value.div("1e30").ln().mul(1000).pow(softcapPower)
            ).mul(OmegaNum.max(1, value.div("1e30").ln().mul(1000)));
        }
        adjustedShrinkClick = shrinkClickFactor.root(ratio);
    }
    if (upgrades.autoShrink.purchased) {
        adjustedShrinkAuto = shrinkAutoFactor;
        if (value.gt("1e30")) {
            let ratio = OmegaNum.max(
                1,
                value.div("1e30").ln().mul(1000).pow(softcapPower)
            );
            if (value.gt("1e309")) {
                ratio = OmegaNum.max(
                    1,
                    value.div("1e30").ln().mul(1000).pow(softcapPower)
                ).mul(OmegaNum.max(1, value.div("1e30").ln().mul(1000)));
            }
            adjustedShrinkAuto = shrinkAutoFactor.root(ratio);
        }
        value = value.mul(adjustedShrinkAuto);
    }

    // Auto-buy squareShrink up to hueShifts or antihole‐extended cap
    let u = upgrades.squareShrink;
    if (
        u.level < squareShrinkMaxLevel &&
        value.gt(u.cost) &&
        u.level < hueShifts
    ) {
        u.level++;
        u.cost = u.baseCost.pow(1.95 * u.level ** 2);
        shrinkClickFactor = baseShrinkClickFactor
            .pow(OmegaNum(2).pow(u.level))
            .mul(shrinkDivide);
        shrinkAutoFactor = baseShrinkAutoFactor
            .pow(OmegaNum(2).pow(u.level))
            .mul(shrinkDivide);
        u.button.textContent = `Square shrinking rate\n(Cost: ${formatValue(
            u.cost
        )}) ${u.level}/${squareShrinkMaxLevel}`;
        updateShrinkButton();
    }
    if (
        automationUpgrades.automateSquareBuy.purchased &&
        value.gte(u.cost.mul(10)) &&
        u.level < squareShrinkMaxLevel
    ) {
        buySquareShrinkUpgrade();
    }

    valueDisplay.textContent = formatValue(value);
    if (antiholeUnlocked) {
        displayAntihole.textContent = formatValue(antiholeSize);
        displayAntiholeAutomation.textContent = formatValue(antiholeSize);
    }
}
setInterval(tick, 50);

// Autosave every 30s **with** popup
setInterval(() => {
    saveGame();
    showSavePopup();
}, 30000);

setInterval(spawnFlashingStar, 20);

window.addEventListener("resize", updateCircleSize);

function updateFavicon(color) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, 2 * Math.PI);
    ctx.fill();
    document.getElementById("dynamic-favicon").href = canvas.toDataURL(
        "image/png"
    );
}

function updateBackgroundColor() {
    let shiftFraction;

    if (automationUpgrades.automateAntihole.purchased) {
        document.body.style.backgroundColor = minColor;
    } else {
        if (automationUpgrades.automateHueShift.level > 1) {
            shiftFraction = Math.min(Math.log10(value.toNumber()) / 308, 1);
        } else {
            shiftFraction = Math.min(hueShifts / 10, 1);
        }

        const bgColor = interpolateColor(
            baseBackgroundColor,
            redColor,
            shiftFraction
        );
        document.body.style.backgroundColor = bgColor;
    }
    updateFavicon(document.body.style.backgroundColor);
}

updateBackgroundColor();
updateShrinkButton();
updateCircleSize();
