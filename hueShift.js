let hueShifts = 0;
let baseSoftcapPower = new OmegaNum(1);
let softcapPower = baseSoftcapPower;
let showHueShiftPrompt = false;
let hueShiftModal = document.getElementById('hue-shift-modal');
let confirmHueShiftButton = document.getElementById('confirm-hue-shift');

function triggerHueShift() {
  hueShifts++;
  softcapPower = baseSoftcapPower.mul(OmegaNum.pow(.5, hueShifts));
  if (automationUpgrades.automateHueShift.level != 2) {
    resetGameProgress();
  }
  hueShiftModal.style.display = 'none';
  showHueShiftPrompt = false;
}
confirmHueShiftButton.addEventListener('click', triggerHueShift);