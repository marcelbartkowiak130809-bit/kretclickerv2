const plText = {
  "market.diamonds":"Diamenty",
  "market.soldTitle":"Oferta sprzedana!",
  "market.soldText":"Sprzedano: {item}{more}. Do odbioru: {amount} diamentow.",
  "tutorial.ask":"Czy chcesz wlaczyc krotki tutorial?",
  "tutorial.start":"Start",
  "tutorial.next":"Dalej",
  "tutorial.skip":"Pomin",
  "tutorial.done":"Koniec",
  "tutorial.clickMole":"Klikaj kreta, zeby zdobywac punkty. To podstawowy sposob startu.",
  "tutorial.upgrades":"Za punkty kupuj upgrade'y. Dzieki nim kazdy klik daje wiecej.",
  "tutorial.eggs":"Otwieraj jajka, zeby zdobywac pety.",
  "tutorial.pets":"W plecaku zakladaj pety. Aktywne pety wzmacniaja twoje staty.",
  "tutorial.rebirth":"Gdy uzbierasz wymagane punkty, zrob rebirth i odblokuj kolejne systemy.",
  "tutorial.events":"Sprawdzaj eventy, pogode i darmowe nagrody. To dodatkowe aktywnosci, nie glowna farma.",
  "tutorial.mobile.clickMole":"Tapnij kreta, zeby zdobywac punkty.",
  "tutorial.mobile.upgrades":"Ten przycisk otwiera ulepszenia na telefonie.",
  "tutorial.mobile.eggs":"Tu otwierasz jajka i zdobywasz pety.",
  "tutorial.mobile.pets":"Tu zakladasz pety z plecaka.",
  "tutorial.mobile.rebirth":"Ten pasek pokazuje postep do rebirtha.",
  "tutorial.mobile.events":"Tu sprawdzasz pogode, eventy i dodatkowe nagrody."
};

function t(key, params={}){
  let value = plText[key] || key;
  Object.entries(params).forEach(([name, replacement])=>{
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}

function applyPlText(root=document){
  document.documentElement.lang = "pl";
  root.querySelectorAll?.("[data-pl-key]").forEach(node=>{
    node.textContent = t(node.dataset.plKey);
  });
  root.querySelectorAll?.("[data-pl-title-key]").forEach(node=>{
    node.title = t(node.dataset.plTitleKey);
  });
}

const tutorialSteps = [
  {target:"#kret", textKey:"tutorial.clickMole"},
  {target:"#shop", textKey:"tutorial.upgrades"},
  {target:"#eggDockBtn", textKey:"tutorial.eggs"},
  {target:"#petDockBtn", textKey:"tutorial.pets"},
  {target:"#rebirthBtn", textKey:"tutorial.rebirth"},
  {target:"#weatherDockBtn", textKey:"tutorial.events"}
];

const mobileTutorialSteps = [
  {target:"#kret", textKey:"tutorial.mobile.clickMole"},
  {target:"#upgradeHubDockBtn", textKey:"tutorial.mobile.upgrades"},
  {target:"#eggDockBtn", textKey:"tutorial.mobile.eggs"},
  {target:"#petDockBtn", textKey:"tutorial.mobile.pets"},
  {target:"#rebirthBtn", textKey:"tutorial.mobile.rebirth"},
  {target:"#weatherDockBtn", textKey:"tutorial.mobile.events"}
];

let tutorialIndex = 0;

function isMobileTutorial(){
  return window.matchMedia?.("(max-width: 700px), (pointer: coarse)")?.matches || window.innerWidth <= 700;
}

function getActiveTutorialSteps(){
  return isMobileTutorial() ? mobileTutorialSteps : tutorialSteps;
}

function shouldAskTutorial(){
  return typeof game !== "undefined" && !game.tutorialCompleted && !game.tutorialAsked;
}

function maybeAskTutorial(){
  if(!shouldAskTutorial()) return;
  game.tutorialAsked = true;
  document.getElementById("tutorialAskOverlay")?.classList.add("open");
  applyPlText();
  window.update?.(true, true);
  window.requestCloudSave?.({force:true, reason:"tutorialAsk"});
}

function closeTutorialAsk(){
  document.getElementById("tutorialAskOverlay")?.classList.remove("open");
}

function completeTutorial(){
  closeTutorialAsk();
  document.getElementById("tutorialOverlay")?.classList.remove("open");
  document.querySelector(".tutorialTarget")?.classList.remove("tutorialTarget");
  if(typeof game !== "undefined"){
    game.tutorialCompleted = true;
    game.tutorialAsked = true;
    game.uiDirty = true;
  }
  window.update?.(true, true);
  window.requestCloudSave?.({force:true, reason:"tutorialCompleted"});
}

function skipMissingTutorialTargets(){
  const steps = getActiveTutorialSteps();
  while(tutorialIndex < steps.length && !document.querySelector(steps[tutorialIndex].target)){
    tutorialIndex++;
  }
}

function positionTutorialStep(){
  skipMissingTutorialTargets();
  const steps = getActiveTutorialSteps();
  if(tutorialIndex >= steps.length){
    completeTutorial();
    return;
  }
  const step = steps[tutorialIndex];
  const target = document.querySelector(step.target);
  const overlay = document.getElementById("tutorialOverlay");
  const highlight = document.getElementById("tutorialHighlight");
  const arrow = document.getElementById("tutorialArrow");
  const bubble = document.getElementById("tutorialBubble");
  const text = document.getElementById("tutorialText");
  const next = document.getElementById("tutorialNextBtn");
  if(!target || !overlay || !highlight || !arrow || !bubble || !text) return;
  document.querySelector(".tutorialTarget")?.classList.remove("tutorialTarget");
  target.classList.add("tutorialTarget");
  overlay.classList.add("open");
  centerMobileTutorialTarget(target);
  requestAnimationFrame(()=>placeTutorialStep(target, highlight, arrow, bubble, text, next, step));
}

function centerMobileTutorialTarget(target){
  if(!isMobileTutorial()) return;
  const dock = target.closest?.("#leftDock,#rightDock");
  if(!dock) return;
  const targetCenter = target.offsetLeft + target.offsetWidth / 2;
  dock.scrollTo({left:Math.max(0, targetCenter - dock.clientWidth / 2), behavior:"auto"});
}

function placeTutorialStep(target, highlight, arrow, bubble, text, next, step){
  const rect = target.getBoundingClientRect();
  const pad = 8;
  highlight.style.left = `${Math.max(6, rect.left - pad)}px`;
  highlight.style.top = `${Math.max(6, rect.top - pad)}px`;
  highlight.style.width = `${Math.min(window.innerWidth - 12, rect.width + pad * 2)}px`;
  highlight.style.height = `${Math.min(window.innerHeight - 12, rect.height + pad * 2)}px`;
  const bubbleWidth = Math.min(320, window.innerWidth - 24);
  const placeBelow = rect.top < window.innerHeight * 0.55;
  const bubbleLeft = Math.max(12, Math.min(window.innerWidth - bubbleWidth - 12, rect.left + rect.width / 2 - bubbleWidth / 2));
  const bubbleTop = placeBelow
    ? Math.min(window.innerHeight - 170, rect.bottom + 28)
    : Math.max(12, rect.top - 150);
  bubble.style.width = `${bubbleWidth}px`;
  bubble.style.left = `${bubbleLeft}px`;
  bubble.style.top = `${bubbleTop}px`;
  arrow.style.left = `${Math.max(18, Math.min(window.innerWidth - 18, rect.left + rect.width / 2))}px`;
  arrow.style.top = placeBelow ? `${rect.bottom + 8}px` : `${rect.top - 22}px`;
  arrow.classList.toggle("up", placeBelow);
  arrow.classList.toggle("down", !placeBelow);
  text.textContent = t(step.textKey);
  if(next) next.textContent = tutorialIndex >= getActiveTutorialSteps().length - 1 ? t("tutorial.done") : t("tutorial.next");
  applyPlText(document.getElementById("tutorialOverlay") || document);
}

function startTutorial(){
  closeTutorialAsk();
  tutorialIndex = 0;
  positionTutorialStep();
}

function nextTutorialStep(){
  tutorialIndex++;
  positionTutorialStep();
}

function initTutorialControls(){
  document.getElementById("tutorialStartBtn")?.addEventListener("click", startTutorial);
  document.getElementById("tutorialDeclineBtn")?.addEventListener("click", completeTutorial);
  document.getElementById("tutorialNextBtn")?.addEventListener("click", nextTutorialStep);
  document.getElementById("tutorialSkipBtn")?.addEventListener("click", completeTutorial);
  window.addEventListener("resize", ()=>{
    if(document.getElementById("tutorialOverlay")?.classList.contains("open")) positionTutorialStep();
  });
  applyPlText();
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initTutorialControls);
}else{
  initTutorialControls();
}

window.t = t;
window.applyPlText = applyPlText;
window.maybeAskTutorial = maybeAskTutorial;
window.tutorialSteps = tutorialSteps;
window.mobileTutorialSteps = mobileTutorialSteps;
