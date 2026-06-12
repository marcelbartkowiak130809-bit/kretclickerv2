
/* NOWE: PLANETY */
const planets = [
  {name:"ZIEMIA", color:"#2c2c44"},
  {name:"KSIĘŻYC", color:"#777"},
  {name:"MARS", color:"#a83232"},
  {name:"JOWISZ", color:"#c99039"},
  {name:"SATURN", color:"#d9c27a"},
  {name:"URAN", color:"#7ad9d0"},
  {name:"NEPTUN", color:"#3a4fd9"},
  {name:"PLUTON", color:"#999"},
  {name:"GALAKTYKA", color:"#5a2a82"},
  {name:"KOSMOS", color:"#111"},
  {name:"VOID", color:"#000"}
];

const pointIcons = ["🪙","🌙","🔴","🟠","🟡","🌀","🔷","⚪","✨","⬛","✦"];

function getPointIcon(){
  return pointIcons[Math.min(game.rebirths, pointIcons.length - 1)];
}

function formatPoint(n){
  return `${getPointIcon()} ${format(n)}`;
}

function formatDiamond(n){
  return `💎 ${format(n)}`;
}

function getMetaLevel(id){
  return game.metaUpgrades?.[id] || 0;
}

function getMetaCost(def){
  return Math.floor(def.base * Math.pow(def.scale, getMetaLevel(def.id)));
}

function getEggBatchSize(){
  const enchantBonus = typeof getEnchantEggBatchBonus === "function" ? getEnchantEggBatchBonus() : 0;
  return 1 + getMetaLevel("eggBatch") + enchantBonus;
}

function getMaxActivePets(){
  return 3 + getMetaLevel("petSlots");
}

function hasAutoEggUnlock(){
  return getMetaLevel("autoEgg") > 0;
}

function getHatchSpeedFactor(){
  const enchantFactor = typeof getEnchantHatchSpeedFactor === "function" ? getEnchantHatchSpeedFactor() : 1;
  return [1, 0.55, 0.3][Math.min(getMetaLevel("hatchSpeed"), 2)] * enchantFactor;
}

function getGoldClickChance(){
  return getMetaLevel("goldChance") * 0.001;
}

function hasDiamondRush(){
  return getMetaLevel("diamondRushUnlock") > 0;
}

function getDiamondRushCooldownMs(){
  return Math.max(180000, 300000 - getMetaLevel("diamondRushCooldown") * 30000);
}

function getDiamondRushDurationMs(){
  return 10000 + getMetaLevel("diamondRushDuration") * 2500;
}

function getDiamondRushChanceBoost(){
  return 2 + getMetaLevel("diamondRushBoost") * 1.5;
}

function toRgba(hex, alpha){
  const safe = hex.replace("#", "");
  const full = safe.length === 3 ? safe.split("").map(ch=>ch + ch).join("") : safe;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function setPanelTheme(color){
  document.documentElement.style.setProperty("--panel-bg", `linear-gradient(180deg, ${toRgba(color, 0.26)}, rgba(8,8,15,0.86))`);
  document.documentElement.style.setProperty("--panel-border", toRgba(color, 0.34));
  document.documentElement.style.setProperty("--panel-border-soft", toRgba(color, 0.2));
  document.documentElement.style.setProperty("--panel-card-bg", toRgba(color, 0.14));
  document.documentElement.style.setProperty("--panel-card-hover", toRgba(color, 0.22));
  document.documentElement.style.setProperty("--panel-accent", `linear-gradient(135deg, ${toRgba(color, 0.92)}, rgba(73,197,255,0.92))`);
  document.documentElement.style.setProperty("--panel-cta", `linear-gradient(135deg, ${toRgba(color, 0.9)}, rgba(255,111,145,0.94))`);
  document.documentElement.style.setProperty("--panel-secondary", `linear-gradient(135deg, ${toRgba(color, 0.84)}, rgba(56,199,255,0.94))`);
}

function openUpgradeInfo(title, body){
  upgradeInfoTitle.textContent = title;
  upgradeInfoBody.textContent = body;
  document.getElementById("supportForm")?.classList.remove("open");
  upgradeInfoOverlay.classList.add("open");
}

function closeUpgradeInfo(){
  upgradeInfoOverlay.classList.remove("open");
}

function getPetDiamondBonusValue(pet){
  if(typeof pet.diamond === "number") return pet.diamond;
  const rarityBoost = {Pospolity:0.02, Rzadki:0.035, Epicki:0.06, Mityczny:0.09, Legendarny:0.12}[pet.rarity] || 0.02;
  const scoreBoost = Math.min(0.12, ((pet.click || 0) * 0.0025) + ((pet.multi || 0) * 0.05));
  return +(rarityBoost + scoreBoost).toFixed(3);
}

function setPlanet(){
  let p = planets[Math.min(game.rebirths,10)];
  document.body.style.background =
    "radial-gradient(circle at top,"+p.color+",#000)";
  setPanelTheme(p.color);
  document.getElementById("rebirthLabel").textContent =
    "REBITH: "+game.rebirths+" | ŚWIAT: "+p.name;
}

function format(n){
  const value = Number(n) || 0;
  const abs = Math.abs(value);
  const suffixes = ["", "K", "M", "B", "T", "Qd", "Qn", "Sx", "Sp", "Oc", "No", "Dc"];

  if(abs < 1000) return Math.floor(value).toString();

  const tier = Math.min(Math.floor(Math.log10(abs) / 3), suffixes.length - 1);
  const scaled = value / Math.pow(1000, tier);
  const decimals = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : 2;
  return scaled.toFixed(decimals).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1") + suffixes[tier];
}

function spawnPopup(text,isCrit=false,isFrenzy=false,isAlert=false){
  let p=document.createElement("div");
  p.className="popup";
  if(isCrit) p.classList.add("crit");
  if(isFrenzy) p.classList.add("frenzy");
  if(isAlert) p.classList.add("alert");
  p.textContent=text;
  document.getElementById("kret").appendChild(p);
  setTimeout(()=>p.remove(),isAlert ? 3200 : 1200);
}

function animateKret(isCrit){
  kret.classList.remove("clickAnim");
  void kret.offsetWidth;
  kret.classList.add("clickAnim");

  kret.classList.add(isCrit ? "critFlash" : "glow");

  setTimeout(()=>{
    kret.classList.remove("glow");
    kret.classList.remove("critFlash");
  },150);
}

function formatSeconds(ms){
  return (ms / 1000).toFixed(1) + "s";
}

window.__kretSaveMode = window.__kretSaveMode || "guest";
window.__kretGuestSaveKey = "guestSave";
window.__kretLastAccountSaveKey = "kretLastAccountSave";

function shouldWriteGuestSave(){
  return window.__kretSaveMode !== "account" && !getRememberedAccountSession()?.uid && !window.__kretDisableSave;
}

function getRememberedAccountSession(){
  try{
    return JSON.parse(localStorage.getItem("kretAccountSession") || "null");
  }catch(err){
    return null;
  }
}

function getLocalGameSaveKey(){
  const session = getRememberedAccountSession();
  if(session?.uid){
    return `accountSave_${session.uid}`;
  }
  return "guestSave";
}

function writeLocalGameSave(){
  if(window.__kretDisableSave) return;
  const session = getRememberedAccountSession();
  if(window.__kretSaveMode === "account" && !session?.uid) return;
  const snapshot = JSON.parse(JSON.stringify(game));
  const now = Date.now();
  snapshot._updatedAt = now;
  snapshot.updatedAt = now;
  snapshot.lastSavedAt = now;
  if(session?.uid){
    snapshot.authUid = session.uid;
    snapshot._accountNick = session.nick || session.username || session.safeNick || "";
    snapshot.username = session.username || session.nick || session.safeNick || "";
    snapshot.safeNick = session.safeNick || "";
    localStorage.setItem(window.__kretLastAccountSaveKey, JSON.stringify(snapshot));
  }
  localStorage.setItem(getLocalGameSaveKey(), JSON.stringify(snapshot));
}

window.forceKretLocalSave = writeLocalGameSave;

let raw = null;
try{
  if(localStorage.getItem("__kret_force_reset__") === "1"){
    localStorage.removeItem("guestSave");
    localStorage.removeItem("__kret_force_reset__");
  }
  const accountSession = getRememberedAccountSession();
  const hasRememberedAccount = !!accountSession?.uid;
  if(hasRememberedAccount){
    window.__kretSaveMode = "account";
  }
  const accountRaw = hasRememberedAccount ? localStorage.getItem(`accountSave_${accountSession.uid}`) : null;
  const lastAccountRaw = hasRememberedAccount ? localStorage.getItem(window.__kretLastAccountSaveKey) : null;
  const guestRaw = localStorage.getItem("guestSave");
  const guestWasMigrated = !!localStorage.getItem("guestSaveMigratedAt");
  const legacyRaw = !hasRememberedAccount && !guestWasMigrated ? localStorage.getItem("kretSave") : null;
  const legacySave = legacyRaw ? JSON.parse(legacyRaw) : null;
  raw = accountRaw
    ? JSON.parse(accountRaw)
    : lastAccountRaw
    ? JSON.parse(lastAccountRaw)
    : guestRaw
    ? (() => {
      const guest = JSON.parse(guestRaw);
      return guest && !guest.authUid && !guest._accountNick && !guest.safeNick ? guest : null;
    })()
    : legacySave && !legacySave._accountNick
      ? legacySave
      : null;
}catch(err){
  raw = null;
}

let game = {
  score: raw?.score ?? 0,
  diamonds: raw?.diamonds ?? 0,
  diamondDust: raw?.diamondDust ?? 0,
  clicks: raw?.clicks ?? 0,
  openedEggs: raw?.openedEggs ?? 0,
  leaderboardStats: raw?.leaderboardStats && typeof raw.leaderboardStats === "object" ? raw.leaderboardStats : {},
  click: raw?.click ?? 1,
  autoValue: raw?.autoValue ?? raw?.auto ?? 0,
  autoSpeed: raw?.autoSpeed ?? 0,
  autoClickEnabled: raw?.autoClickEnabled ?? true,
  multi: raw?.multi ?? 1,
  critChance: raw?.critChance ?? 0.02,
  critMulti: raw?.critMulti ?? 2,
  frenzyChance: raw?.frenzyChance ?? 0,
  frenzyActive:false,
  frenzyTimer:0,
  rebirths: raw?.rebirths ?? 0,
  rebirthMult: raw?.rebirthMult ?? 1,
  holdCooldownRemaining: raw?.holdCooldownRemaining ?? 0,
  holdDurationRemaining: raw?.holdDurationRemaining ?? 0,
  holdActive:false,
  diamondRushActive: raw?.diamondRushActive ?? false,
  diamondRushRemaining: raw?.diamondRushRemaining ?? 0,
  diamondRushCooldownRemaining: raw?.diamondRushCooldownRemaining ?? 0,
  diamondClickEnabled: raw?.diamondClickEnabled ?? true,
  pets: Array.isArray(raw?.pets) ? raw.pets : [],
  skins: Array.isArray(raw?.skins) ? raw.skins : [],
  potions: Array.isArray(raw?.potions) ? raw.potions : [],
  activePotions: Array.isArray(raw?.activePotions) ? raw.activePotions : [],
  bags: Array.isArray(raw?.bags) ? raw.bags : [],
  enchants: Array.isArray(raw?.enchants) ? raw.enchants : [],
  activeEnchantIds: Array.isArray(raw?.activeEnchantIds) ? raw.activeEnchantIds : [],
  inventoryEggs: Array.isArray(raw?.inventoryEggs) ? raw.inventoryEggs : [],
  dailyStreak: raw?.dailyStreak && typeof raw.dailyStreak === "object" ? raw.dailyStreak : {},
  appBonusUnlocked: raw?.appBonusUnlocked ?? false,
  appBonusUnlockedAt: raw?.appBonusUnlockedAt ?? 0,
  freeRewards: raw?.freeRewards && typeof raw.freeRewards === "object" ? raw.freeRewards : {},
  activePetIds: Array.isArray(raw?.activePetIds) ? raw.activePetIds : [],
  activeSkinId: raw?.activeSkinId ?? null,
  petSeq: raw?.petSeq ?? 1,
  skinSeq: raw?.skinSeq ?? 1,
  potionSeq: raw?.potionSeq ?? 1,
  bagSeq: raw?.bagSeq ?? 1,
  enchantSeq: raw?.enchantSeq ?? 1,
  inventoryEggSeq: raw?.inventoryEggSeq ?? 1,
  featureUnlocks: raw?.featureUnlocks && typeof raw.featureUnlocks === "object" ? raw.featureUnlocks : {},
  inventoryTab: raw?.inventoryTab ?? "pets",
  metaUpgrades: raw?.metaUpgrades ?? {},
  autoEggMode: raw?.autoEggMode ?? false,
  autoCrateMode: raw?.autoCrateMode ?? false,
  bossDamageUpgrade: raw?.bossDamageUpgrade ?? 0,
  bossRewardBoosts: Array.isArray(raw?.bossRewardBoosts) ? raw.bossRewardBoosts : [],
  bossClaimedRewards: raw?.bossClaimedRewards ?? {},
  crystalEvent: raw?.crystalEvent && typeof raw.crystalEvent === "object" ? raw.crystalEvent : {},
  weeklyLeaderboardRewards: Array.isArray(raw?.weeklyLeaderboardRewards) ? raw.weeklyLeaderboardRewards : [],
  adminInbox: raw?.adminInbox && typeof raw.adminInbox === "object" ? raw.adminInbox : {},
  endlessUpgrades: raw?.endlessUpgrades && typeof raw.endlessUpgrades === "object" ? raw.endlessUpgrades : {},
  ultraCores: raw?.ultraCores ?? 0,
  ultraCoreBest: raw?.ultraCoreBest ?? raw?.ultraCores ?? 0,
  uiDirty: true,
  upgrades: raw?.upgrades ?? {}
};

const ui = document.getElementById("ui");
const stats = document.getElementById("stats");
const shop = document.getElementById("shop");
const rebirthBtn = document.getElementById("rebirthBtn");
const adminPanel = document.getElementById("adminPanel");
const adminToggle = document.getElementById("adminToggle");
const kret = document.getElementById("kret");
const holdPanel = document.getElementById("holdPanel");
const holdState = document.getElementById("holdState");
const holdCooldownLine = document.getElementById("holdCooldownLine");
const holdPowerLine = document.getElementById("holdPowerLine");
const holdDurationLine = document.getElementById("holdDurationLine");
const holdFill = document.getElementById("holdFill");
const holdHint = document.getElementById("holdHint");
const eggDockBtn = document.getElementById("eggDockBtn");
const crateDockBtn = document.getElementById("crateDockBtn");
const petDockBtn = document.getElementById("petDockBtn");
const eggPanel = document.getElementById("eggPanel");
const cratePanel = document.getElementById("cratePanel");
const petPanel = document.getElementById("petPanel");
const eggList = document.getElementById("eggList");
const petList = document.getElementById("petList");
const crateList = document.getElementById("crateList");
const skinList = document.getElementById("skinList");
const petTabBtn = document.getElementById("petTabBtn");
const skinTabBtn = document.getElementById("skinTabBtn");
const activePetStage = document.getElementById("activePetStage");
const petActions = document.getElementById("petActions");
const diamondDockBtn = document.getElementById("diamondDockBtn");
const diamondPanel = document.getElementById("diamondPanel");
const diamondUpgradeList = document.getElementById("diamondUpgradeList");
const autoPanel = document.getElementById("autoPanel");
const autoState = document.getElementById("autoState");
const autoIntervalLine = document.getElementById("autoIntervalLine");
const autoValueLine = document.getElementById("autoValueLine");
const autoGainLine = document.getElementById("autoGainLine");
const autoFill = document.getElementById("autoFill");
const autoHint = document.getElementById("autoHint");
const diamondClickPanel = document.getElementById("diamondClickPanel");
const diamondClickCooldownLine = document.getElementById("diamondClickCooldownLine");
const diamondClickDurationLine = document.getElementById("diamondClickDurationLine");
const diamondClickBoostLine = document.getElementById("diamondClickBoostLine");
const diamondClickFill = document.getElementById("diamondClickFill");
const diamondClickHint = document.getElementById("diamondClickHint");
const hatchOverlay = document.getElementById("hatchOverlay");
const hatchPhaseLabel = document.getElementById("hatchPhaseLabel");
const hatchEggsRow = document.getElementById("hatchEggsRow");
const hatchResult = document.getElementById("hatchResult");
const hatchPetsGrid = document.getElementById("hatchPetsGrid");
const eggChoiceOverlay = document.getElementById("eggChoiceOverlay");
const eggChoiceInfo = document.getElementById("eggChoiceInfo");
const buyOneEggBtn = document.getElementById("buyOneEggBtn");
const buyBatchEggBtn = document.getElementById("buyBatchEggBtn");
const cancelEggChoiceBtn = document.getElementById("cancelEggChoiceBtn");
const adminDiamondInput = document.getElementById("adminDiamondInput");
const adminRebirthInput = document.getElementById("adminRebirthInput");
const upgradeInfoOverlay = document.getElementById("upgradeInfoOverlay");
const upgradeInfoTitle = document.getElementById("upgradeInfoTitle");
const upgradeInfoBody = document.getElementById("upgradeInfoBody");
const upgradeInfoClose = document.getElementById("upgradeInfoClose");

let adminUnlocked = false;
const ADMIN_PASSWORD = "Goon6677";
let suppressNextClick = false;
let hatchBusy = false;
let pendingEggChoice = null;

const diamondUpgradeCatalog = [
  {id:"eggBatch", name:"ILOŚĆ OTWIERANYCH JAJEK", desc:"Podnosi max liczbę jajek otwieranych naraz do 5.", base:30, scale:3.2, max:4},
  {id:"petSlots", name:"MAX ILOŚĆ PETÓW", desc:"Zwiększa limit aktywnych petów aż do 6.", base:45, scale:3.3, max:3},
  {id:"autoEgg", name:"AUTO OTWIERANIE JAJEK", desc:"Odblokowuje tryb auto dla kupowania jajek.", base:500, scale:1, max:1},
  {id:"hatchSpeed", name:"PRZYSPIESZENIE ANIMACJI", desc:"Skraca animację hatchingu łącznie o 70%.", base:120, scale:4.5, max:2}
];

diamondUpgradeCatalog.push(
  {id:"goldChance", name:"GOLD CLICK", desc:"Daje szansę na klik o mocy x5.", base:160, scale:1.7, max:10, unlockAtRebirth:5},
  {id:"diamondRushUnlock", name:"DIAMOND CLICK", desc:"Odblokowuje automatyczny diamentowy klik.", base:320, scale:1, max:1, unlockAtRebirth:5},
  {id:"diamondRushCooldown", name:"DIAMOND CLICK: COOLDOWN", desc:"Skraca czas oczekiwania na diamond click.", base:180, scale:2.05, max:4, unlockAtRebirth:5},
  {id:"diamondRushDuration", name:"DIAMOND CLICK: CZAS", desc:"Wydłuża trwanie diamond clicka.", base:180, scale:2.05, max:4, unlockAtRebirth:5},
  {id:"diamondRushBoost", name:"DIAMOND CLICK: BOOST", desc:"Jeszcze mocniej podbija szansę na diamenty.", base:210, scale:2.15, max:4, unlockAtRebirth:5}
);

const upgradeInfoMap = {
  click:"Wzmacnia pojedynczy klik. Moc ulepszenia rośnie wraz z jego poziomem i kolejnymi światami.",
  autoValue:"Zwiększa siłę jednego uderzenia autoclicka.",
  autoSpeed:"Przyspiesza, jak często autoclick klika.",
  holdCooldown:"Skraca cooldown chwytu.",
  holdDuration:"Wydłuża czas trwania chwytu.",
  holdPower:"Zwiększa tempo klikania podczas chwytu.",
  multi:"Podnosi mnożnik punktów ze wszystkich klików.",
  frenzy:"Zwiększa szansę na wejście w frenzy.",
  critC:"Zwiększa szansę na krytyczny klik.",
  critM:"Zwiększa obrażenia krytycznego kliku.",
  eggBatch:"Pozwala kupić i otworzyć więcej jajek naraz.",
  petSlots:"Podnosi limit aktywnych petów aż do sześciu.",
  autoEgg:"Pozwala pominąć wybór i otwierać od razu pełny batch.",
  hatchSpeed:"Skraca całą animację otwierania jajka.",
  goldChance:"Daje szansę na gold click o mocy x5.",
  diamondRushUnlock:"Odblokowuje cykliczny diamond click.",
  diamondRushCooldown:"Skraca przerwę między diamond clickami.",
  diamondRushDuration:"Wydłuża czas aktywnego diamond clicka.",
  diamondRushBoost:"Podnosi boost do szansy na diamenty w diamond clicku."
};

adminToggle.onclick = () => {
  if(!adminUnlocked || !adminToggle.classList.contains("adminVisible")) return;
  if(!adminUnlocked){
    let pass = prompt("Podaj hasło admina");
    if(pass === null) return;

    if(pass === ADMIN_PASSWORD){
      adminUnlocked = true;
      localStorage.setItem("kretAdminUnlocked", "1");
      adminToggle.classList.add("adminVisible");
      adminPanel.style.display = "block";
    } else {
      alert("Błędne hasło");
    }
    return;
  }

  adminPanel.style.display =
    adminPanel.style.display === "block" ? "none" : "block";
};

if(adminUnlocked){
  adminToggle.classList.add("adminVisible");
}

eggDockBtn.onclick = () => {
  const willOpen = !eggPanel.classList.contains("open");
  eggPanel.classList.toggle("open", willOpen);
  cratePanel.classList.remove("open");
  petPanel.classList.remove("open");
  renderSideUi(true);
};

crateDockBtn.onclick = () => {
  const willOpen = !cratePanel.classList.contains("open");
  cratePanel.classList.toggle("open", willOpen);
  eggPanel.classList.remove("open");
  petPanel.classList.remove("open");
  renderSideUi(true);
};

petDockBtn.onclick = () => {
  const willOpen = !petPanel.classList.contains("open");
  petPanel.classList.toggle("open", willOpen);
  eggPanel.classList.remove("open");
  cratePanel.classList.remove("open");
  renderSideUi(true);
};

diamondDockBtn.onclick = () => {
  diamondPanel.classList.toggle("open", !diamondPanel.classList.contains("open"));
  renderSideUi(true);
};

cancelEggChoiceBtn.onclick = () => {
  pendingEggChoice = null;
  eggChoiceOverlay.classList.remove("open");
};

upgradeInfoClose.onclick = closeUpgradeInfo;
upgradeInfoOverlay.onclick = (e) => {
  if(e.target === upgradeInfoOverlay){
    closeUpgradeInfo();
  }
};

function resetGame(){
  if(confirm("Na pewno zresetować grę?")){
    localStorage.removeItem("guestSave");
    location.reload();
  }
}

function getClickUpgradeStep(g=game){
  const level = Number(g.upgrades?.click) || 0;
  const levelBonus = (level > 25 ? 1 : 0) + (level >= 40 ? 1 : 0);
  const worldBonus = Math.min(3, Math.floor((Number(g.rebirths) || 0) / 3));
  return 2 + levelBonus + worldBonus;
}

function getUpgradeDisplayName(u){
  return u.id === "click" ? "MOCNIEJSZY KLIK" : u.name;
}

const upgrades = [
  {id:"click", name:"KLIK: MOC", base:10, scale:1.105, max:g=>50+g.rebirths*25, effect:g=>g.click+=getClickUpgradeStep(g)},
  {id:"autoValue", name:"AUTO: WARTOŚĆ +1", base:45, scale:1.14, max:g=>25+g.rebirths*15, effect:g=>g.autoValue+=1},
  {id:"autoSpeed", name:"AUTO: TEMPO +0.32s", base:75, scale:1.35, max:g=>10, effect:g=>g.autoSpeed+=1},
  {id:"holdCooldown", name:"CHWYT: COOLDOWN", base:1000, scale:1.18, max:g=>50, effect:g=>{}, unlock:g=>g.rebirths>=3, unlockAt:3},
  {id:"holdDuration", name:"CHWYT: CZAS TRWANIA", base:1000, scale:1.18, max:g=>50, effect:g=>{}, unlock:g=>g.rebirths>=3, unlockAt:3},
  {id:"holdPower", name:"CHWYT: MOC", base:1000, scale:1.18, max:g=>3, effect:g=>{}, unlock:g=>g.rebirths>=3, unlockAt:3},
  {id:"multi", name:"MULTI x0.35", base:180, scale:1.18, max:g=>20+g.rebirths*10, effect:g=>g.multi+=0.35, unlock:g=>g.rebirths>=1, unlockAt:1},

  {id:"frenzy", name:"FRENZY SZANSA +0.5%", base:700, scale:1.28, max:g=>20, effect:g=>g.frenzyChance+=0.005, unlock:g=>g.rebirths>=1, unlockAt:1},

  {id:"critC", name:"CRIT (Rebirth 1)", base:600, scale:1.28, max:g=>40, effect:g=>g.critChance+=0.004, unlock:g=>g.rebirths>=1, unlockAt:1},
  {id:"critM", name:"CRIT DMG (Rebirth 1)", base:900, scale:1.28, max:g=>40, effect:g=>g.critMulti+=0.25, unlock:g=>g.rebirths>=1, unlockAt:1}
];

/*
 * Ceny normalnego sklepu sa recznie rozpisane poziom po poziomie.
 * Dzieki temu kazdy zakup jest realnie drozszy od poprzedniego.
 */
const NORMAL_UPGRADE_COST_TABLES = {
  click: [
    15, 17, 19, 21, 24, 27, 30, 34, 38, 43,
    49, 55, 62, 69, 78, 88, 99, 111, 125, 141,
    158, 178, 200, 225, 253, 285, 321, 361, 406, 457,
    514, 578, 650, 731, 823, 926, 1041, 1171, 1318, 1483,
    1668, 1876, 2111, 2375, 2672, 3006, 3381, 3804, 4280, 4815
  ],
  autoValue: [
    45, 53, 63, 74, 87, 103, 121, 143, 169, 200,
    236, 278, 328, 387, 457, 539, 636, 750, 885, 1045,
    1233, 1455, 1716, 2025, 2390
  ],
  autoSpeed: [160, 211, 279, 368, 486, 641, 846, 1117, 1475, 1947],
  multi: [
    180, 216, 259, 311, 373, 448, 537, 645, 774, 929,
    1115, 1337, 1605, 1926, 2311, 2773, 3328, 3993, 4792, 5751
  ],
  frenzy: [
    350, 417, 496, 590, 702, 835, 994, 1183, 1407, 1675,
    1993, 2372, 2822, 3359, 3997, 4756, 5660, 6735, 8015, 9538
  ],
  critC: [
    300, 344, 393, 450, 516, 590, 676, 774, 886, 1015,
    1162, 1330, 1523, 1744, 1997, 2287, 2618, 2998, 3433, 3930,
    4500, 5153, 5900, 6755, 7735, 8856, 10141, 11611, 13295, 15222,
    17430, 19957, 22851, 26164, 29958, 34302, 39275, 44970, 51491, 58957
  ],
  critM: [
    450, 518, 595, 684, 787, 905, 1041, 1197, 1377, 1583,
    1821, 2094, 2408, 2769, 3184, 3662, 4211, 4843, 5569, 6404,
    7365, 8470, 9740, 11201, 12881, 14814, 17036, 19591, 22530, 25909,
    29795, 34265, 39404, 45315, 52112, 59929, 68918, 79256, 91144, 104816
  ],
  holdCooldown: [
    1000, 1130, 1277, 1443, 1630, 1842, 2082, 2353, 2658, 3004,
    3395, 3836, 4335, 4898, 5535, 6254, 7067, 7986, 9024, 10197,
    11523, 13021, 14714, 16627, 18788, 21231, 23991, 27109, 30633, 34616,
    39116, 44201, 49947, 56440, 63777, 72069, 81437, 92024, 103987, 117506,
    132782, 150043, 169549, 191590, 216497, 244641, 276445, 312383, 352992, 398881
  ],
  holdDuration: [
    1000, 1130, 1277, 1443, 1630, 1842, 2082, 2353, 2658, 3004,
    3395, 3836, 4335, 4898, 5535, 6254, 7067, 7986, 9024, 10197,
    11523, 13021, 14714, 16627, 18788, 21231, 23991, 27109, 30633, 34616,
    39116, 44201, 49947, 56440, 63777, 72069, 81437, 92024, 103987, 117506,
    132782, 150043, 169549, 191590, 216497, 244641, 276445, 312383, 352992, 398881
  ],
  holdPower: [1000, 3500, 12000]
};

const NORMAL_UPGRADE_UNLOCK_WORLDS = {
  click:0, autoValue:0, autoSpeed:0,
  multi:1, frenzy:1, critC:1, critM:1,
  holdCooldown:3, holdDuration:3, holdPower:3
};

const NORMAL_UPGRADE_WORLD_FACTORS = [1, 2, 4, 9, 19, 33, 62, 114, 202, 365, 650];

const NORMAL_UPGRADE_TAIL_STEPS = {
  click:0.012, autoValue:0.025, multi:0.025
};

function getNormalUpgradeTableCost(u, lvl){
  const table = NORMAL_UPGRADE_COST_TABLES[u.id];
  if(!table) return null;
  const lastIndex = table.length - 1;
  const extraLevels = Math.max(0, lvl - lastIndex);
  const unlockWorld = NORMAL_UPGRADE_UNLOCK_WORLDS[u.id] || 0;
  const activeWorld = Math.max(unlockWorld, Math.min(game.rebirths, NORMAL_UPGRADE_WORLD_FACTORS.length - 1));
  const worldFactor = NORMAL_UPGRADE_WORLD_FACTORS[activeWorld] / NORMAL_UPGRADE_WORLD_FACTORS[unlockWorld];
  const tailStep = NORMAL_UPGRADE_TAIL_STEPS[u.id] || 0;
  const base = table[Math.min(lvl, lastIndex)];
  return Math.round(base * (1 + extraLevels * tailStep) * worldFactor);
}

function cost(u){
  let lvl = game.upgrades[u.id] || 0;
  return costAtLevel(u, lvl);
}

function costAtLevel(u, lvl){
  return getNormalUpgradeTableCost(u, lvl) ?? Math.floor(u.base * Math.pow(u.scale, lvl));
}

/* NOWE: BUY MAX */
function buyMax(u){
  if(u.unlock && !u.unlock(game)) return;

  let lvl = game.upgrades[u.id] || 0;
  let max = typeof u.max==="function" ? u.max(game) : u.max;

  while(game.score >= costAtLevel(u, lvl)){
    if(max && lvl>=max) break;
    game.score -= costAtLevel(u, lvl);
    lvl++;
    game.upgrades[u.id] = lvl;
    u.effect(game);
  }

  game.upgrades[u.id] = lvl;
}

function getAutoValueLevel(){
  return game.autoValue || 0;
}

function getAutoSpeedLevel(){
  return game.autoSpeed || 0;
}

function getAutoIntervalMs(){
  return Math.max(1800, 5000 - getAutoSpeedLevel() * 320);
}

function getAutoGain(){
  const level = Math.max(0, getAutoValueLevel());
  if(level <= 0) return 0;
  const shotPower = 1 + (level - 1) * 0.025;
  return getNormalClickPower() * shotPower * (game.frenzyActive ? 3 : 1);
}

const eggCatalog = [
  {
    id:"egg1",
    name:"Jajko Startowe",
    cost:500,
    unlockRebirth:0,
    tint:"#ead8a0",
    pets:[
      {id:"egg1_singer", name:"Kret Piosenkarz", icon:"🎤", rarity:"Pospolity", weight:55, click:1, multi:0.03, color:"#7a4b3f"},
      {id:"egg1_miner", name:"Kret Górnik", icon:"⛏", rarity:"Rzadki", weight:35, click:2, multi:0.05, color:"#5f4535"},
      {id:"egg1_gold", name:"Kret Sloneczny", icon:"⭐", rarity:"Epicki", weight:10, click:5, multi:0.12, color:"#ed8b24"}
    ]
  },
  {
    id:"egg2",
    name:"Jajko Warsztatowe",
    cost:2500,
    unlockRebirth:0,
    tint:"#c6d6e8",
    pets:[
      {id:"egg1_gold", name:"Kret Sloneczny", icon:"⭐", rarity:"Pospolity", weight:60, click:5, multi:0.12, color:"#ed8b24"},
      {id:"egg2_mechanic", name:"Kret Mechanik", icon:"🔧", rarity:"Rzadki", weight:30, click:7, multi:0.15, color:"#4f647a"},
      {id:"egg2_sailor", name:"Kret Marynarz", icon:"⚓", rarity:"Epicki", weight:10, click:8, multi:0.18, color:"#3b6d8a"}
    ]
  },
  {
    id:"egg3",
    name:"Jajko Górskie",
    cost:10000,
    unlockRebirth:2,
    tint:"#b9e0bf",
    pets:[
      {id:"egg2_sailor", name:"Kret Marynarz", icon:"⚓", rarity:"Pospolity", weight:60, click:8, multi:0.18, color:"#3b6d8a"},
      {id:"egg3_explorer", name:"Kret Odkrywca", icon:"🧭", rarity:"Rzadki", weight:30, click:10, multi:0.22, color:"#4b7b56"},
      {id:"egg3_ninja", name:"Kret Ninja", icon:"🥷", rarity:"Epicki", weight:10, click:12, multi:0.28, color:"#3a3a4f"}
    ]
  },
  {
    id:"egg4",
    name:"Jajko Kosmiczne",
    cost:50000,
    unlockRebirth:4,
    tint:"#b4b7ff",
    pets:[
      {id:"egg3_ninja", name:"Kret Ninja", icon:"🥷", rarity:"Pospolity", weight:60, click:12, multi:0.28, color:"#3a3a4f"},
      {id:"egg4_robot", name:"Kret Robot", icon:"🤖", rarity:"Rzadki", weight:30, click:14, multi:0.32, color:"#6c79a9"},
      {id:"egg4_king", name:"Kret Król", icon:"👑", rarity:"Epicki", weight:10, click:17, multi:0.38, color:"#a66d2f"}
    ]
  },
  {
    id:"egg5",
    name:"Jajko Boskie",
    cost:250000,
    unlockRebirth:6,
    tint:"#ffc7ea",
    pets:[
      {id:"egg4_king", name:"Kret Król", icon:"👑", rarity:"Pospolity", weight:60, click:17, multi:0.38, color:"#a66d2f"},
      {id:"egg5_wind", name:"Kret Błyskawica", icon:"⚡", rarity:"Rzadki", weight:30, click:20, multi:0.45, color:"#8b6cff"},
      {id:"egg5_star", name:"Kret Gwiazda", icon:"✨", rarity:"Epicki", weight:10, click:24, multi:0.55, color:"#b56cff"}
    ]
  },
  {
    id:"egg6",
    name:"Jajko Pradawne",
    cost:2000000,
    unlockRebirth:10,
    tint:"#d7f4ff",
    pets:[
      {id:"egg5_star", name:"Kret Gwiazda", icon:"✨", rarity:"Pospolity", weight:49994, click:24, multi:0.55, color:"#b56cff"},
      {id:"egg6_diamond", name:"Kret Diamentowy", icon:"💎", rarity:"Mityczny", weight:5, click:30, multi:0.72, color:"#64d3ff", displayName:"SECRET 1", chanceLabel:"1/10k", secret:true},
      {id:"egg6_cosmic", name:"Kret Kosmiczny", icon:"🌌", rarity:"Legendarny", weight:1, click:40, multi:1.05, color:"#6c7dff", displayName:"SECRET 2", chanceLabel:"1/50k", secret:true}
    ]
  }
];

const crateCatalog = [
  {
    id:"crate1",
    name:"Skrzynka Startowa",
    cost:25,
    unlockRebirth:0,
    tint:"#d7c19b",
    icon:"📦",
    skins:[
      {id:"skin_miner", name:"Kret Górnik", skinClass:"skin-miner", rarity:"Pospolity", weight:70, accent:"#7f5b3f"},
      {id:"skin_singer", name:"Kret Piosenkarz", skinClass:"skin-singer", rarity:"Pospolity", weight:30, accent:"#b45f8b"}
    ]
  },
  {
    id:"crate2",
    name:"Skrzynka Warsztatowa",
    cost:90,
    unlockRebirth:0,
    tint:"#bcd7ef",
    icon:"📦",
    skins:[
      {id:"skin_royal", name:"Kret Królewski", skinClass:"skin-royal", rarity:"Rzadki", weight:60, accent:"#c7a24a"},
      {id:"skin_pirate", name:"Kret Pirat", skinClass:"skin-pirate", rarity:"Rzadki", weight:40, accent:"#5e82ff"}
    ]
  },
  {
    id:"crate3",
    name:"Skrzynka Galaktyczna",
    cost:300,
    unlockRebirth:0,
    tint:"#bdc6ff",
    icon:"📦",
    skins:[
      {id:"skin_astronaut", name:"Kret Astronauta", skinClass:"skin-astro", rarity:"Epicki", weight:50, accent:"#6dd6ff"},
      {id:"skin_shadow", name:"Kret Cień", skinClass:"skin-shadow", rarity:"Legenda", weight:30, accent:"#202030"},
      {id:"skin_gold", name:"Kret Złoty", skinClass:"skin-gold", rarity:"Legenda", weight:20, accent:"#ffd84d"}
    ]
  }
];

function getEggLabel(egg, index){
  return `${egg.name} #${index + 1}`;
}

function getCrateLabel(crate, index){
  return `${crate.name} #${index + 1}`;
}

function getOwnedSkins(){
  return Array.isArray(game.skins) ? game.skins : [];
}

function makeSkinInstance(template, crate){
  return {
    uid:`skin_${game.skinSeq++}`,
    templateId:template.id,
    crateId:crate.id,
    name:template.name,
    displayName:template.name,
    skinClass:template.skinClass,
    rarity:template.rarity,
    accent:template.accent,
    sourceCrate:crate.name,
    powerRank:(crate.unlockRebirth || 0) * 1000 + (template.rarity === "Legenda" ? 300 : template.rarity === "Epicki" ? 200 : 100)
  };
}

function getSkinByTemplateId(templateId){
  return getOwnedSkins().find(s=>s.templateId===templateId);
}

function getActiveSkin(){
  return getOwnedSkins().find(s=>s.uid===game.activeSkinId) || null;
}

function getSkinCatalogItemById(id){
  for(const crate of crateCatalog){
    const skin = crate.skins.find(item=>item.id===id);
    if(skin) return {crate, skin};
  }
  return null;
}

function isCrateUnlocked(crate){
  if(crate?.voidCrate && ((game.ultraCoreBest || 0) > 0 || (game.ultraCores || 0) > 0)) return true;
  return game.rebirths >= crate.unlockRebirth;
}

function rollSkinFromCrate(crate){
  const total = crate.skins.reduce((sum, skin)=>sum + skin.weight, 0);
  let roll = Math.random() * total;
  for(const skin of crate.skins){
    roll -= skin.weight;
    if(roll <= 0) return skin;
  }
  return crate.skins[crate.skins.length - 1];
}

function addSkinToInventory(template, crate){
  const skin = makeSkinInstance(template, crate);
  game.skins.push(skin);
  return skin;
}

function openCrate(crateId){
  const crate = crateCatalog.find(c=>c.id===crateId);
  if(!crate || !isCrateUnlocked(crate) || game.diamonds < crate.cost) return;

  game.diamonds -= crate.cost;
  game.uiDirty = true;
  const template = rollSkinFromCrate(crate);
  const skin = addSkinToInventory(template, crate);
  spawnPopup("Wylosowano skin: " + skin.name, false, false, true);
  update(true, true);
}

function buyDiamondUpgrade(id){
  const def = diamondUpgradeCatalog.find(item=>item.id===id);
  if(!def) return;

  const level = getMetaLevel(id);
  if(level >= def.max) return;

  const price = getMetaCost(def);
  if(game.diamonds < price){
    spawnPopup("Za mało diamentów!", false, false, true);
    return;
  }

  game.diamonds -= price;
  game.metaUpgrades[id] = level + 1;
  if(id === "autoEgg" && !game.autoEggMode){
    game.autoEggMode = true;
  }
  game.uiDirty = true;
  update(true, true);
}

function toggleAutoEggMode(){
  if(!hasAutoEggUnlock()) return;
  game.autoEggMode = !game.autoEggMode;
  game.uiDirty = true;
  update(true, true);
}

function renderDiamondPanel(){
  diamondUpgradeList.innerHTML = "";

  diamondUpgradeCatalog.forEach(def=>{
    const level = getMetaLevel(def.id);
    const maxed = level >= def.max;
    const price = getMetaCost(def);
    const affordable = game.diamonds >= price && !maxed;
    const card = document.createElement("div");
    card.className = "eggCard diamondCard" + (!affordable && !maxed ? " locked" : "");
    if(affordable){
      card.onclick = ()=>buyDiamondUpgrade(def.id);
    }

    let extra = "";
    if(def.id === "eggBatch"){
      extra = `Teraz: ${getEggBatchSize()} jajko/a`;
    } else if(def.id === "petSlots"){
      extra = `Teraz: ${getMaxActivePets()} petów`;
    } else if(def.id === "autoEgg"){
      extra = hasAutoEggUnlock() ? `Tryb auto: ${game.autoEggMode ? "ON" : "OFF"}` : "Odblokowanie trybu auto";
    } else if(def.id === "hatchSpeed"){
      extra = `Szybkość: x${(1 / getHatchSpeedFactor()).toFixed(2)}`;
    }

    card.innerHTML = `
      <div class="eggTop">
        <div class="eggCircle" style="background:linear-gradient(135deg,#5ad9ff,#3466ff)"></div>
        <div class="eggMeta">
          <b>${def.name}</b>
          <small>${def.desc}<br>${extra}</small>
        </div>
      </div>
      <div class="petBadge">${maxed ? "MAX" : affordable ? "Kliknij, aby ulepszyć" : "Za mało diamentów!"}</div>
      <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;font-size:11px;opacity:.82">
        <span>${level}/${def.max}</span>
        <span>${maxed ? "Gotowe" : formatDiamond(price)}</span>
      </div>
    `;
    diamondUpgradeList.appendChild(card);
  });

  if(hasAutoEggUnlock()){
    const toggle = document.createElement("button");
    toggle.className = "panelAction secondary";
    toggle.style.marginTop = "10px";
    toggle.textContent = `AUTO JAJKA: ${game.autoEggMode ? "ON" : "OFF"}`;
    toggle.onclick = ()=>toggleAutoEggMode();
    diamondUpgradeList.appendChild(toggle);
  }

  diamondDockBtn.classList.toggle("active", diamondPanel.classList.contains("open"));
}

function runEggReveal(egg, pets){
  const list = Array.isArray(pets) ? pets : [pets];
  const speedFactor = getHatchSpeedFactor();
  const shakeMs = Math.round(2800 * speedFactor);
  const crackMs = Math.round(500 * speedFactor);
  const resultMs = Math.round((1700 - getMetaLevel("hatchSpeed") * 250) * speedFactor);

  hatchBusy = true;
  hatchOverlay.classList.add("open");
  hatchPhaseLabel.textContent = `${egg.name.toUpperCase()} SIĘ OTWIERA`;
  hatchEggsRow.innerHTML = "";
  hatchResult.classList.remove("show");
  hatchPetsGrid.innerHTML = "";

  list.forEach((pet, index)=>{
    const eggVisual = document.createElement("div");
    eggVisual.className = "hatchEggVisual shaking";
    eggVisual.style.background = egg.tint;
    eggVisual.style.animationDelay = `${index * 0.08}s`;
    hatchEggsRow.appendChild(eggVisual);

    const petCard = document.createElement("div");
    petCard.className = "hatchPetCard";
    petCard.innerHTML = `
      <div class="hatchPetVisual" style="background:${petVisualClass(pet)}">
        <div class="petTinyFace"></div>
        <div class="petTinyMouth"></div>
        <div class="petTinyIcon">${pet.icon}</div>
      </div>
      <div class="hatchPetName">${pet.name}</div>
      <div class="hatchPetStats">${pet.rarity}<br>+${pet.click} klik | +${pet.multi.toFixed(2)} mnożnik</div>
    `;
    hatchPetsGrid.appendChild(petCard);
  });

  setTimeout(()=>{
    hatchEggsRow.querySelectorAll(".hatchEggVisual").forEach(node=>{
      node.classList.remove("shaking");
      node.classList.add("opening");
    });
  }, shakeMs);

  setTimeout(()=>{
    hatchEggsRow.querySelectorAll(".hatchEggVisual").forEach(node=>node.classList.remove("opening"));
    hatchPhaseLabel.textContent = list.length > 1 ? "WYLOSOWANE PETY" : "WYLOSOWANY PET";
    hatchResult.classList.add("show");
  }, shakeMs + crackMs);

  setTimeout(()=>{
    hatchOverlay.classList.remove("open");
    hatchResult.classList.remove("show");
    hatchBusy = false;
    update(true, true);
  }, shakeMs + crackMs + resultMs);
}

function getAffordableEggCount(egg){
  return Math.floor(game.score / egg.cost);
}

function hatchEggBatch(eggId, requestedCount){
  const egg = getEggById(eggId);
  if(hatchBusy || !egg || !isEggUnlocked(egg) || game.score < egg.cost) return;

  const count = Math.max(1, Math.min(requestedCount, getAffordableEggCount(egg)));
  const pets = [];
  game.score -= egg.cost * count;
  game.openedEggs = (game.openedEggs || 0) + count;
  game.uiDirty = true;

  for(let i = 0; i < count; i++){
    const template = rollPetFromEgg(egg);
    pets.push(addPetToInventory(template, egg));
  }

  eggPanel.classList.remove("open");
  cratePanel.classList.remove("open");
  petPanel.classList.remove("open");
  diamondPanel.classList.remove("open");
  eggChoiceOverlay.classList.remove("open");
  pendingEggChoice = null;
  renderSideUi(true);
  runEggReveal(egg, pets);
}

function showEggChoice(eggId){
  const egg = getEggById(eggId);
  if(!egg) return;

  const batchCount = Math.min(getEggBatchSize(), getAffordableEggCount(egg));
  if(batchCount <= 1){
    hatchEggBatch(eggId, 1);
    return;
  }

  pendingEggChoice = eggId;
  eggChoiceInfo.textContent = `${egg.name} | Możesz kupić 1 albo ${batchCount} jajek.`;
  buyOneEggBtn.onclick = ()=>hatchEggBatch(eggId, 1);
  buyBatchEggBtn.onclick = ()=>hatchEggBatch(eggId, batchCount);
  buyBatchEggBtn.textContent = `Kup x${batchCount}`;
  eggChoiceOverlay.classList.add("open");
}

function groupSkinsByTemplate(){
  const groups = new Map();
  getOwnedSkins().forEach(skin=>{
    const group = groups.get(skin.templateId) || {
      templateId: skin.templateId,
      name: skin.displayName || skin.name,
      templateName: skin.name,
      skinClass: skin.skinClass,
      rarity: skin.rarity,
      sourceCrate: skin.sourceCrate,
      items: []
    };
    group.items.push(skin);
    groups.set(skin.templateId, group);
  });

  return Array.from(groups.values()).sort((a,b)=>{
    const rank = { "Legenda": 3, "Epicki": 2, "Rzadki": 1, "Pospolity": 0 };
    const bestA = Math.max(...a.items.map(s=>rank[s.rarity] ?? 0));
    const bestB = Math.max(...b.items.map(s=>rank[s.rarity] ?? 0));
    if(bestB !== bestA) return bestB - bestA;
    return a.name.localeCompare(b.name, "pl");
  });
}

function setInventoryTab(tab){
  game.inventoryTab = tab === "skins" ? "skins" : "pets";
  game.uiDirty = true;
  update(true, true);
}

function getDiamondChance(source="click"){
  const progress = Math.min(game.rebirths, REBIRTH_LIMIT) / REBIRTH_LIMIT;
  const clickChance = 0.0001 + (0.002 - 0.0001) * progress;
  return source === "auto" ? clickChance * 0.35 : clickChance;
}

function addDiamonds(amount){
  game.diamondDust += amount;
  const whole = Math.floor(game.diamondDust);
  if(whole > 0){
    game.diamonds += whole;
    game.diamondDust -= whole;
  }
  return whole;
}

function maybeDropDiamond(source="click"){
  if(Math.random() < getDiamondChance(source)){
    game.diamonds += 1;
    game.uiDirty = true;
    spawnPopup("💎 +1 diament", false, false, true);
  }
}

function applyActiveSkin(){
  Array.from(kret.classList)
    .filter(cls=>cls.startsWith("skin-"))
    .forEach(cls=>kret.classList.remove(cls));
  const active = getActiveSkin();
  if(active) kret.classList.add(active.skinClass);
}

function makePetInstance(template, egg){
  return {
    uid:`pet_${game.petSeq++}`,
    templateId:template.id,
    eggId:egg.id,
    name:template.name,
    displayName:template.displayName || template.name,
    icon:template.icon,
    rarity:template.rarity,
    click:template.click,
    multi:template.multi,
    color:template.color,
    sourceEgg:egg.name,
    secret: !!template.secret,
    powerRank: template.click * 1000 + Math.round(template.multi * 10000)
  };
}

function getOwnedPets(){
  return Array.isArray(game.pets) ? game.pets : [];
}

function getActivePets(){
  const owned = getOwnedPets();
  return game.activePetIds
    .map(id=>owned.find(p=>p.uid===id))
    .filter(Boolean)
    .slice(0,getMaxActivePets());
}

function getPetBonusTotals(){
  return getActivePets().reduce((acc, pet)=>{
    acc.click += pet.click || 0;
    acc.multi += pet.multi || 0;
    return acc;
  }, {click:0, multi:0});
}

function getPetClickBonus(){
  return getPetBonusTotals().click;
}

function getPetMultiBonus(){
  return getPetBonusTotals().multi;
}

function getAllClickablePower(){
  const diamondClickUsable = game.diamondRushActive && game.diamondClickEnabled !== false;
  const enchantCoins = typeof getEnchantCoinMultiplier === "function" ? getEnchantCoinMultiplier() : 1;
  return (game.click + getPetClickBonus()) * (game.multi + getPetMultiBonus()) * game.rebirthMult * (diamondClickUsable ? 1.5 : 1) * enchantCoins;
}

function getPetPowerSummary(pet){
  return `+${pet.click} klik | +${pet.multi.toFixed(2)} mnożnik`;
}

function maybeDropDiamond(source="click"){
  const diamondClickUsable = game.diamondRushActive && game.diamondClickEnabled !== false;
  const chance = getDiamondChance(source) * (diamondClickUsable ? getDiamondRushChanceBoost() : 1);
  if(Math.random() < chance){
    const gained = addDiamonds(getDiamondMultiplier());
    game.uiDirty = true;
    spawnPopup(`${formatDiamond(Math.max(1, gained || 1))} diament`, false, false, true);
  }
}

function makePetInstance(template, egg){
  return {
    uid:`pet_${game.petSeq++}`,
    templateId:template.id,
    eggId:egg.id,
    name:template.name,
    displayName:template.displayName || template.name,
    icon:template.icon,
    rarity:template.rarity,
    click:template.click,
    multi:template.multi,
    diamond:getPetDiamondBonusValue(template),
    color:template.color,
    sourceEgg:egg.name,
    secret: !!template.secret,
    powerRank: template.click * 1000 + Math.round(template.multi * 10000)
  };
}

function getPetBonusTotals(){
  return getActivePets().reduce((acc, pet)=>{
    acc.click += pet.click || 0;
    acc.multi += pet.multi || 0;
    acc.diamond += getPetDiamondBonusValue(pet);
    return acc;
  }, {click:0, multi:0, diamond:0});
}

function getPetDiamondBonus(){
  return getPetBonusTotals().diamond;
}

function getDiamondMultiplier(){
  return 1 + getPetDiamondBonus();
}

function getPetPowerSummary(pet){
  return `+${pet.click} klik | punkty x${(1 + pet.multi).toFixed(2)} | diamenty x${(1 + getPetDiamondBonusValue(pet)).toFixed(2)}`;
}

function getEggById(eggId){
  return eggCatalog.find(e=>e.id===eggId);
}

function isEggUnlocked(egg){
  if(egg?.voidEgg && ((game.ultraCoreBest || 0) > 0 || (game.ultraCores || 0) > 0)) return true;
  return game.rebirths >= egg.unlockRebirth;
}

function rollPetFromEgg(egg){
  const total = egg.pets.reduce((sum, pet)=>sum + pet.weight, 0);
  let roll = Math.random() * total;
  for(const pet of egg.pets){
    roll -= pet.weight;
    if(roll <= 0) return pet;
  }
  return egg.pets[egg.pets.length - 1];
}

function addPetToInventory(template, egg){
  const pet = makePetInstance(template, egg);
  game.pets.push(pet);
  return pet;
}

function hatchEgg(eggId){
  const egg = getEggById(eggId);
  if(hatchBusy || !egg || !isEggUnlocked(egg) || game.score < egg.cost) return;

  if(getEggBatchSize() <= 1){
    hatchEggBatch(eggId, 1);
    return;
  }

  if(hasAutoEggUnlock() && game.autoEggMode){
    hatchEggBatch(eggId, Math.min(getEggBatchSize(), getAffordableEggCount(egg)));
    return;
  }

  showEggChoice(eggId);
}

function togglePetSelection(uid){
  const idx = game.activePetIds.indexOf(uid);
  if(idx !== -1){
    game.activePetIds.splice(idx,1);
    game.uiDirty = true;
    update(true, true);
    return;
  }

  if(game.activePetIds.length >= getMaxActivePets()){
    spawnPopup(`Maksymalnie ${getMaxActivePets()} aktywnych petów`, false, false, true);
    return;
  }

  game.activePetIds.push(uid);
  game.uiDirty = true;
  update(true, true);
}

function petVisualClass(pet){
  if(pet.secret) return "linear-gradient(135deg,#050510,#7b2cff,#00d4ff)";
  if(pet.rarity === "Legendarny") return "linear-gradient(135deg,#2431a8,#89d2ff)";
  if(pet.rarity === "Mityczny") return "linear-gradient(135deg,#1476a3,#7be7ff)";
  if(pet.rarity === "Epicki") return "linear-gradient(135deg,#6936a6,#e0b9ff)";
  if(pet.rarity === "Rzadki") return "linear-gradient(135deg,#79503a,#ffc58a)";
  return "linear-gradient(135deg," + pet.color + ",#7a4a39)";
}

function groupPetsByTemplate(){
  const groups = new Map();
  getOwnedPets().forEach(pet=>{
    const group = groups.get(pet.templateId) || {
      templateId: pet.templateId,
      name: pet.displayName || pet.name,
      templateName: pet.name,
      icon: pet.icon,
      rarity: pet.rarity,
      sourceEgg: pet.sourceEgg,
      secret: pet.secret,
      items: []
    };
    group.items.push(pet);
    groups.set(pet.templateId, group);
  });

  return Array.from(groups.values()).sort((a,b)=>{
    const bestA = Math.max(...a.items.map(p=>p.powerRank || 0));
    const bestB = Math.max(...b.items.map(p=>p.powerRank || 0));
    return bestB - bestA;
  });
}

function getPetChanceLabel(egg, pet){
  if(pet.chanceLabel) return pet.chanceLabel;
  const total = egg.pets.reduce((sum, item)=>sum + item.weight, 0);
  const pct = (pet.weight / total) * 100;
  return `${pct.toFixed(pct < 10 ? 1 : 0)}%`;
}

function getEggPetDisplayName(pet){
  return pet.displayName || pet.name;
}

function renderEggPanel(){
  eggList.innerHTML = "";

  eggCatalog.forEach((egg, index)=>{
    const locked = !isEggUnlocked(egg);
    const canBuy = !locked && game.score >= egg.cost;
    const card = document.createElement("div");
    card.className = "eggCard" + (locked ? " locked" : "");
    if(canBuy){
      card.onclick = ()=>hatchEgg(egg.id);
    }

    card.innerHTML = `
      <div class="eggTop">
        <div class="eggCircle" style="background:${egg.tint}"></div>
        <div class="eggMeta">
          <b>${getEggLabel(egg, index)}</b>
          <small>Cena: ${format(egg.cost)}<br>${locked ? "🔒 Od rebirth " + egg.unlockRebirth : "Dostępne teraz"}</small>
        </div>
      </div>
      <div style="margin-top:10px;display:grid;gap:6px;font-size:12px;line-height:1.35">
        ${egg.pets.map(pet=>`
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
            <span>${getEggPetDisplayName(pet)}</span>
            <span style="opacity:.8">${pet.chanceLabel || getPetChanceLabel(egg, pet)}</span>
          </div>
        `).join("")}
      </div>
      <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;font-size:11px;opacity:.78">
        <span>${locked ? "Zablokowane" : canBuy ? "Gotowe do otwarcia" : "Za mało punktów!"}</span>
        <span>#${index + 1}</span>
      </div>
    `;
    eggList.appendChild(card);
  });

  eggDockBtn.classList.toggle("active", eggPanel.classList.contains("open"));
  crateDockBtn.classList.toggle("active", cratePanel.classList.contains("open"));
  petDockBtn.classList.toggle("active", petPanel.classList.contains("open"));
}

function renderCratePanel(){
  crateList.innerHTML = "";

  crateCatalog.forEach((crate, index)=>{
    const canBuy = game.diamonds >= crate.cost;
    const total = crate.skins.reduce((sum, skin)=>sum + skin.weight, 0);
    const card = document.createElement("div");
    card.className = "eggCard";
    if(canBuy){
      card.onclick = ()=>openCrate(crate.id);
    } else {
      card.classList.add("locked");
    }

    card.innerHTML = `
      <div class="eggTop">
        <div class="eggCircle" style="background:${crate.tint}"></div>
        <div class="eggMeta">
          <b>${getCrateLabel(crate, index)}</b>
          <small>Cena: ${formatDiamond(crate.cost)}<br>Dostępne teraz</small>
        </div>
      </div>
      <div style="margin-top:10px;display:grid;gap:6px;font-size:12px;line-height:1.35">
        ${crate.skins.map(skin=>`
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
            <span>${skin.name}</span>
            <span style="opacity:.8">${((skin.weight / total) * 100).toFixed(total < 100 ? 1 : 0)}%</span>
          </div>
        `).join("")}
      </div>
      <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;font-size:11px;opacity:.78">
        <span>${canBuy ? "Gotowa do otwarcia" : "Za mało diamentów!"}</span>
        <span>${formatDiamond(game.diamonds)}</span>
      </div>
    `;
    crateList.appendChild(card);
  });
}

function clearAllPets(){
  game.activePetIds = [];
  game.uiDirty = true;
  update(true, true);
}

function equipBestPets(){
  const ordered = [...getOwnedPets()].sort((a,b)=>(b.powerRank || 0) - (a.powerRank || 0));
  game.activePetIds = ordered.slice(0,getMaxActivePets()).map(p=>p.uid);
  game.uiDirty = true;
  update(true, true);
}

function togglePetStack(templateId){
  const stack = getOwnedPets().filter(p=>p.templateId===templateId);
  if(!stack.length) return;

  const activeForTemplate = stack.find(p=>game.activePetIds.includes(p.uid));
  if(activeForTemplate){
    game.activePetIds = game.activePetIds.filter(id=>!stack.some(p=>p.uid===id));
    game.uiDirty = true;
    update(true, true);
    return;
  }

  if(game.activePetIds.length >= getMaxActivePets()){
    spawnPopup(`Maksymalnie ${getMaxActivePets()} aktywnych petów`, false, false, true);
    return;
  }

  const next = stack.find(p=>!game.activePetIds.includes(p.uid));
  if(!next) return;
  game.activePetIds.push(next.uid);
  game.uiDirty = true;
  update(true, true);
}

function toggleSkinStack(templateId){
  const stack = getOwnedSkins().filter(s=>s.templateId===templateId);
  if(!stack.length) return;

  const activeForTemplate = stack.find(s=>s.uid===game.activeSkinId);
  if(activeForTemplate){
    game.activeSkinId = null;
    game.uiDirty = true;
    update(true, true);
    return;
  }

  game.activeSkinId = stack[0].uid;
  game.uiDirty = true;
  update(true, true);
}

function renderPetPanel(){
  petList.innerHTML = "";
  const groups = groupPetsByTemplate();
  const activeCount = game.activePetIds.length;
  const title = petPanel.querySelector(".slideHeader span");

  if(!groups.length){
    if(title){
      title.textContent = `W plecaku: 0 | Aktywne: 0/${getMaxActivePets()}`;
    }
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `
      <b>Brak petów</b>
      <small>Otwórz jajko, żeby zdobyć pierwszego pupila.</small>
    `;
    petList.appendChild(empty);
    return;
  }

  groups.forEach(group=>{
    const count = group.items.length;
    const selectedCount = group.items.filter(p=>game.activePetIds.includes(p.uid)).length;
    const stack = document.createElement("div");
    stack.className = "petCard" + (selectedCount ? " petSelected" : "");
    stack.onclick = ()=>togglePetStack(group.templateId);

    stack.innerHTML = `
      <div class="petStack">x${count}</div>
      <div class="petTop">
        <div class="petCircle" style="background:${petVisualClass(group.items[0])}"></div>
        <div class="petMeta">
          <b>${group.name}</b>
          <small>${group.rarity}<br>${group.items[0].click} klik | +${group.items[0].multi.toFixed(2)} mnożnik</small>
        </div>
      </div>
      <div class="petBadge">${selectedCount ? `Aktywny ${selectedCount}/${count}` : "Kliknij, aby założyć"}</div>
    `;
    petList.appendChild(stack);
  });

  if(title){
    title.textContent = `W plecaku: ${getOwnedPets().length} | Aktywne: ${activeCount}/${getMaxActivePets()}`;
  }
}

function renderSkinPanel(){
  skinList.innerHTML = "";
  const groups = groupSkinsByTemplate();
  const title = petPanel.querySelector(".slideHeader span");

  if(!groups.length){
    if(title){
      title.textContent = "Skiny: 0 | Aktywny: 0";
    }
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `
      <b>Brak skinów</b>
      <small>Otwórz skrzynkę, żeby zdobyć kosmetyczny skin.</small>
    `;
    skinList.appendChild(empty);
    return;
  }

  groups.forEach(group=>{
    const count = group.items.length;
    const selectedCount = group.items.filter(s=>s.uid===game.activeSkinId).length;
    const card = document.createElement("div");
    card.className = "petCard" + (selectedCount ? " petSelected" : "");
    card.onclick = ()=>toggleSkinStack(group.templateId);

    card.innerHTML = `
      <div class="petStack">x${count}</div>
      <div class="petTop">
        <div class="petCircle" style="background:linear-gradient(135deg,${group.items[0].accent},#fff)"></div>
        <div class="petMeta">
          <b>${group.name}</b>
          <small>${group.rarity}<br>Kosmetyczny skin</small>
        </div>
      </div>
      <div class="petBadge">${selectedCount ? "Założony" : "Kliknij, aby założyć"}</div>
    `;
    skinList.appendChild(card);
  });

  if(title){
    title.textContent = `Skiny: ${getOwnedSkins().length} | Aktywny: ${game.activeSkinId ? 1 : 0}`;
  }
}

function renderInventoryPanel(){
  const petsMode = game.inventoryTab !== "skins";
  petList.style.display = petsMode ? "block" : "none";
  skinList.style.display = petsMode ? "none" : "block";
  petActions.style.display = petsMode ? "flex" : "none";
  petTabBtn.classList.toggle("active", petsMode);
  skinTabBtn.classList.toggle("active", !petsMode);

  if(petsMode){
    renderPetPanel();
  } else {
    renderSkinPanel();
  }
}

function renderActivePets(){
  activePetStage.innerHTML = "";
  const activePets = getActivePets();
  const centerX = 160;
  const centerY = 160;
  const radius = activePets.length <= 3 ? 122 : 136;

  activePets.forEach((pet, index)=>{
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / activePets.length) * index;
    const pos = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
    const wrap = document.createElement("div");
    wrap.className = "activePetWrap";
    wrap.style.position = "absolute";
    wrap.style.left = `${pos.x}px`;
    wrap.style.top = `${pos.y}px`;
    wrap.style.transform = "translate(-50%, -50%)";
    wrap.style.animation = "petFloat 1.8s ease-in-out infinite";

    const badge = document.createElement("div");
    badge.className = "activePet" + (pet.secret ? " secret" : pet.rarity === "Legendarny" || pet.rarity === "Mityczny" ? " legendary" : "");
    badge.style.background = petVisualClass(pet);
    badge.style.width = pet.secret ? "60px" : "54px";
    badge.style.height = pet.secret ? "60px" : "54px";
    badge.innerHTML = `
      <div class="petTinyFace"></div>
      <div class="petTinyMouth"></div>
      <div class="petTinyIcon">${pet.icon}</div>
    `;
    wrap.appendChild(badge);
    activePetStage.appendChild(wrap);
  });
}

let sideUiRenderAt = 0;
function renderSideUi(force=false){
  const now = Date.now();
  if(!force && !game.uiDirty && now - sideUiRenderAt < 250) return;
  sideUiRenderAt = now;
  game.uiDirty = false;
  renderEggPanel();
  renderCratePanel();
  renderInventoryPanel();
  renderDiamondPanel();
  renderActivePets();
  applyActiveSkin();
}

function getHoldCooldownLevel(){

  return game.upgrades.holdCooldown || 0;
}

function getHoldDurationMs(){
  return 1000 + getHoldDurationLevel() * 40;
}

function getHoldCooldownMs(){
  return Math.max(5000, 10000 - getHoldCooldownLevel() * 100);
}

function getHoldDurationLevel(){
  return game.upgrades.holdDuration || 0;
}

function getHoldPowerLevel(){
  return game.upgrades.holdPower || 0;
}

function getHoldClicksPerSecond(){
  return [10, 15, 20, 30][Math.min(getHoldPowerLevel(), 3)];
}

function getHoldPowerLabel(){
  return ["I", "II", "III", "IV"][Math.min(getHoldPowerLevel(), 3)];
}

function getNormalClickPower(){
  return getAllClickablePower();
}

function getHoldGain(){
  return getNormalClickPower() * (game.frenzyActive ? 3 : 1);
}

let holdPress = null;
let holdLoop = null;
let activePointerId = null;
let holdAccumulator = 0;

function updateHoldPanel(){
  if(game.rebirths < 3){
    holdPanel.style.display = "none";
    return;
  }

  holdPanel.style.display = "flex";

  if(game.holdActive){
    holdState.textContent = "TRZYMASZ";
    holdHint.textContent = "Pozostało: " + formatSeconds(game.holdDurationRemaining);
    holdFill.style.width = Math.max(0, Math.min(100, 100 - (game.holdDurationRemaining / getHoldDurationMs()) * 100)) + "%";
  } else
  if(game.holdCooldownRemaining > 0){
    holdState.textContent = "COOLDOWN";
    holdHint.textContent = "Pozostało: " + formatSeconds(game.holdCooldownRemaining);
    holdFill.style.width = Math.max(0, Math.min(100, 100 - (game.holdCooldownRemaining / getHoldCooldownMs()) * 100)) + "%";
  } else {
    holdState.textContent = "GOTOWE";
    holdHint.textContent = "Przytrzymaj i puść, żeby nabić punkty.";
    holdFill.style.width = "100%";
  }

  holdCooldownLine.textContent = "Cooldown: " + (getHoldCooldownMs() / 1000).toFixed(1) + "s";
  holdPowerLine.textContent = "Moc: " + getHoldPowerLabel();
  holdDurationLine.textContent = "Czas trwania: " + (getHoldDurationMs() / 1000).toFixed(1) + "s";
}

function updateAutoPanel(){
  if(game.rebirths < 3){
    autoPanel.style.display = "none";
    return;
  }

  autoPanel.style.display = "flex";

  const interval = getAutoIntervalMs();
  const autoLevel = getAutoValueLevel();
  const autoGain = getAutoGain();

  autoState.textContent = autoLevel > 0 ? "AKTYWNY" : "GOTOWY";
  autoIntervalLine.textContent = "Tempo: " + (interval / 1000).toFixed(1) + "s";
  autoValueLine.textContent = "Moc: " + autoLevel;
  autoGainLine.textContent = "Na strzał: " + formatPoint(autoGain);
  autoHint.textContent = autoLevel > 0 ? "Autoclick działa sam i może też znaleźć diamenty." : "Kup pierwszy upgrade autoclicka, żeby zaczął działać.";

  const progress = ((5000 - interval) / 4000) * 100;
  autoFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
}

function startHold(){
  if(game.rebirths < 3 || game.holdActive || game.holdCooldownRemaining > 0) return;

  game.holdActive = true;
  game.holdDurationRemaining = getHoldDurationMs();
  holdAccumulator = 0;
  suppressNextClick = true;

  if(holdLoop) clearInterval(holdLoop);
  holdLoop = setInterval(()=>{
    if(!game.holdActive) return;

    const dt = 20;
    game.holdDurationRemaining -= dt;
    holdAccumulator += getHoldClicksPerSecond() * (dt / 1000);

    while(holdAccumulator >= 1){
      game.score += getHoldGain();
      game.clicks = (game.clicks || 0) + 1;
      maybeDropDiamond("click");
      holdAccumulator -= 1;
    }

    if(game.holdDurationRemaining <= 0){
      game.holdDurationRemaining = 0;
      stopHold();
    }

    update(true,false);
  },20);

  update(false,false);
}

function stopHold(){
  if(holdLoop){
    clearInterval(holdLoop);
    holdLoop = null;
  }

  if(game.holdActive){
    game.holdActive = false;
    game.holdCooldownRemaining = getHoldCooldownMs();
    game.holdDurationRemaining = 0;
  }

  update(true,false);
}

function handlePointerDown(e){
  if(e.pointerType === "mouse" && e.button !== 0) return;
  if(hatchBusy || game.rebirths < 3 || game.holdActive || game.holdCooldownRemaining > 0) return;

  activePointerId = e.pointerId;
  try{
    kret.setPointerCapture(e.pointerId);
  }catch(err){}

  if(holdPress) clearTimeout(holdPress);
  holdPress = setTimeout(()=>{
    startHold();
    holdPress = null;
  },180);
}

function handlePointerUp(){
  if(holdPress){
    clearTimeout(holdPress);
    holdPress = null;
    if(activePointerId !== null){
      try{
        kret.releasePointerCapture(activePointerId);
      }catch(err){}
      activePointerId = null;
    }
    return;
  }

  if(game.holdActive){
    stopHold();
  }

  if(activePointerId !== null){
    try{
      kret.releasePointerCapture(activePointerId);
    }catch(err){}
    activePointerId = null;
  }
}

function handlePointerCancel(){
  if(holdPress){
    clearTimeout(holdPress);
    holdPress = null;
  }

  if(game.holdActive){
    stopHold();
  }

  if(activePointerId !== null){
    try{
      kret.releasePointerCapture(activePointerId);
    }catch(err){}
    activePointerId = null;
  }
}

function handleClick(){
  if(hatchBusy) return;
  if(suppressNextClick){
    suppressNextClick = false;
    return;
  }

  handleNormalClick();
}

function handleNormalClick(){
  if(hatchBusy) return;
  let val = getNormalClickPower();

  let isCrit = Math.random()<game.critChance;
  if(isCrit) val*=game.critMulti;

  let isFrenzyTrigger = Math.random()<game.frenzyChance;
  if(isFrenzyTrigger && !game.frenzyActive){
    game.frenzyActive=true;
    game.frenzyTimer=5;
    kret.classList.add("frenzy");
    spawnPopup("FRENZY!", false, true);
  }

  if(game.frenzyActive) val*=3;

  game.score+=val;
  game.clicks = (game.clicks || 0) + 1;
  game.uiDirty = true;
  maybeDropDiamond("click");

  animateKret(isCrit);
  spawnPopup("+"+format(val), isCrit);

  update(true, false);
}

function renderShop(){
  shop.innerHTML="";
  const orderedUpgrades = [...upgrades].sort((a,b)=>{
    const aUnlock = a.unlockAt ?? 0;
    const bUnlock = b.unlockAt ?? 0;
    const aLocked = a.unlock && !a.unlock(game);
    const bLocked = b.unlock && !b.unlock(game);
    if(aLocked !== bLocked) return aLocked ? 1 : -1;
    if(aLocked && bLocked){
      if(aUnlock !== bUnlock) return aUnlock - bUnlock;
    }
    return 0;
  });

  orderedUpgrades.forEach(u=>{
    let lvl = game.upgrades[u.id] || 0;
    let max = typeof u.max==="function" ? u.max(game) : u.max;
    let c = cost(u);
    let locked = u.unlock && !u.unlock(game);
    let maxed = max && lvl>=max;
    let affordable = game.score>=c && !locked && !maxed;

    let div=document.createElement("div");
    div.className="card";
    div.dataset.upgradeId = u.id;

    if(locked || maxed || !affordable){
      div.classList.add("disabled");
    }

    if(!locked && !maxed){
      div.onclick=()=>{
        const liveLvl = game.upgrades[u.id] || 0;
        const liveMax = typeof u.max==="function" ? u.max(game) : u.max;
        const liveCost = cost(u);
        if(liveMax && liveLvl >= liveMax){
          update();
          return;
        }
        if(game.score < liveCost){
          spawnPopup("Za malo punktow!", false, false, true);
          update(false, true);
          return;
        }
        game.score-=liveCost;
        game.upgrades[u.id]=liveLvl+1;
        u.effect(game);
        update();
      };

      /* PPM */
      div.oncontextmenu=(e)=>{
        e.preventDefault();
        if(game.score < cost(u)){
          spawnPopup("Za malo punktow!", false, false, true);
          update(false, true);
          return;
        }
        buyMax(u);
        update();
      };
    }

    let statusLine = "";
    if(locked){
      statusLine = `🔒 Od rebirth ${u.unlockAt ?? 1}`;
    } else if(maxed){
      statusLine = "MAX";
    } else if(!affordable){
      statusLine = "Za mało punktów!";
    } else {
      statusLine = "Gotowe";
    }

    div.innerHTML=`<b>${getUpgradeDisplayName(u)}</b><br>${lvl}/${max}<br>${formatPoint(c)}<br>${statusLine}`;
    shop.appendChild(div);
  });
}

function refreshShopAffordabilityState(){
  document.querySelectorAll(".card[data-upgrade-id]").forEach(card=>{
    const u = upgrades.find(item=>item.id === card.dataset.upgradeId);
    if(!u) return;
    const lvl = game.upgrades[u.id] || 0;
    const max = typeof u.max==="function" ? u.max(game) : u.max;
    const c = cost(u);
    const locked = u.unlock && !u.unlock(game);
    const maxed = max && lvl>=max;
    const affordable = game.score>=c && !locked && !maxed;
    card.classList.toggle("disabled", !!(locked || maxed || !affordable));
  });
}

function ensureLeaderboardProgressStats(){
  game.leaderboardStats = game.leaderboardStats && typeof game.leaderboardStats === "object" ? game.leaderboardStats : {};
  if(!game.__leaderboardStatsReady){
    game.leaderboardStats.totalCoinsEarned = Math.max(Number(game.leaderboardStats.totalCoinsEarned) || 0, Number(game.score) || 0);
    game.leaderboardStats.bestCoins = Math.max(Number(game.leaderboardStats.bestCoins) || 0, Number(game.score) || 0);
    game.leaderboardStats.bestDiamonds = Math.max(Number(game.leaderboardStats.bestDiamonds) || 0, Number(game.diamonds) || 0);
    game.__leaderboardStatsReady = true;
  }
  if(typeof game.__lastScoreForLeaderboard !== "number"){
    game.__lastScoreForLeaderboard = Number(game.score) || 0;
  }
}

function resetLeaderboardProgressTracker(){
  game.__leaderboardStatsReady = false;
  ensureLeaderboardProgressStats();
  game.__lastScoreForLeaderboard = Number(game.score) || 0;
}

function syncLeaderboardProgressStats(){
  ensureLeaderboardProgressStats();
  const currentScore = Number(game.score) || 0;
  const lastScore = Number(game.__lastScoreForLeaderboard) || 0;
  if(currentScore > lastScore){
    game.leaderboardStats.totalCoinsEarned += currentScore - lastScore;
  }
  game.__lastScoreForLeaderboard = currentScore;
  game.leaderboardStats.bestCoins = Math.max(Number(game.leaderboardStats.bestCoins) || 0, currentScore);
  game.leaderboardStats.bestDiamonds = Math.max(Number(game.leaderboardStats.bestDiamonds) || 0, Number(game.diamonds) || 0);
}

ensureLeaderboardProgressStats();

kret.addEventListener("pointerdown", handlePointerDown);
kret.addEventListener("pointerup", handlePointerUp);
kret.addEventListener("pointercancel", handlePointerCancel);
kret.addEventListener("click", handleClick);

let autoAccumulator = 0;

setInterval(()=>{
  if(game.autoValue > 0 && game.autoClickEnabled !== false){
    autoAccumulator += 1000 / getAutoIntervalMs();
    while(autoAccumulator >= 1){
      const autoShot = getAutoGain();
      game.score += autoShot;
      game.clicks = (game.clicks || 0) + 1;
      maybeDropDiamond("auto");
      animateKret(false);
      spawnPopup("+"+format(autoShot), false);
      autoAccumulator -= 1;
      game.uiDirty = true;
    }
  }

  if(game.frenzyActive){
    game.frenzyTimer--;
    if(game.frenzyTimer<=0){
      game.frenzyActive=false;
      kret.classList.remove("frenzy");
    }
  }

  if(game.holdCooldownRemaining>0){
    game.holdCooldownRemaining = Math.max(0, game.holdCooldownRemaining-1000);
  }

  if(hasDiamondRush()){
    if(game.diamondRushActive){
      game.diamondRushRemaining = Math.max(0, game.diamondRushRemaining - 1000);
      if(game.diamondRushRemaining <= 0){
        game.diamondRushActive = false;
        game.diamondRushCooldownRemaining = getDiamondRushCooldownMs();
        game.uiDirty = true;
      }
    } else {
      if(game.diamondRushCooldownRemaining <= 0){
        game.diamondRushCooldownRemaining = getDiamondRushCooldownMs();
      }
      game.diamondRushCooldownRemaining = Math.max(0, game.diamondRushCooldownRemaining - 1000);
      if(game.diamondRushCooldownRemaining <= 0 && game.diamondClickEnabled !== false){
        game.diamondRushActive = true;
        game.diamondRushRemaining = getDiamondRushDurationMs();
        game.uiDirty = true;
        spawnPopup("DIAMOND CLICK!", false, false, true);
      }
    }
  } else {
    game.diamondRushActive = false;
    game.diamondRushRemaining = 0;
    game.diamondRushCooldownRemaining = 0;
  }

  update(true,false);
},1000);

const REBIRTH_COSTS = [
  500000,
  3000000,
  9000000,
  30000000,
  80000000,
  170000000,
  380000000,
  800000000,
  1600000000,
  3200000000
];
const REBIRTH_START_COST = REBIRTH_COSTS[0];
const REBIRTH_END_COST = REBIRTH_COSTS[REBIRTH_COSTS.length - 1];
const REBIRTH_LIMIT = 10;

function getRebirthCost(){
  return REBIRTH_COSTS[Math.min(game.rebirths, REBIRTH_COSTS.length - 1)] || REBIRTH_END_COST;
}

/* ZMIENIONE: rakieta KAŻDY rebirth + limit 10 */
function rebirth(){
  if(game.rebirths>=REBIRTH_LIMIT) return;

  let cost = getRebirthCost();
  if(game.score>=cost){

    let s=document.getElementById("rocketScene");
    s.style.display="block";

    setTimeout(()=>{
      s.style.display="none";

      if(holdPress){
        clearTimeout(holdPress);
        holdPress = null;
      }
      if(holdLoop){
        clearInterval(holdLoop);
        holdLoop = null;
      }
      if(activePointerId !== null){
        try{
          kret.releasePointerCapture(activePointerId);
        }catch(err){}
        activePointerId = null;
      }

      game.score=0;
      game.click=1;
      game.autoValue=0;
      game.autoSpeed=0;
      game.multi=1;
      game.upgrades={};
      autoAccumulator=0;
      holdAccumulator=0;
      game.holdCooldownRemaining=0;
      game.holdDurationRemaining=0;
      game.holdActive=false;
      suppressNextClick=false;
      game.uiDirty = true;

      game.rebirths++;
      game.rebirthMult*=1.5;

      update();
    },3000);
  }
}

function addPoints(){
  let val = Number(document.getElementById("adminInput").value);
  if(!isNaN(val)){
    game.score+=val;
    game.uiDirty = true;
    update();
  }
}
function quickAdd(x){
  game.score+=x;
  game.uiDirty = true;
  update();
}

function update(save=true, renderShopNow=true){
  if(typeof syncLeaderboardProgressStats === "function"){
    syncLeaderboardProgressStats();
  }
  ui.innerHTML=`<span>Punkty: ${formatPoint(game.score)}</span> <span style="font-size:22px;opacity:.86;margin-left:12px">${formatDiamond(game.diamonds)}</span>`;
  stats.textContent=`Na klik: ${formatPoint(getNormalClickPower())}`;

  if(game.rebirths<REBIRTH_LIMIT)
    rebirthBtn.textContent="REBIRTH "+(game.rebirths+1)+"/"+REBIRTH_LIMIT+" ("+formatPoint(getRebirthCost())+")";
  else
    rebirthBtn.textContent="MAX REBIRTH";

  updateHoldPanel();
  updateAutoPanel();

  if(renderShopNow){
    renderShop();
  }else if(typeof refreshShopAffordabilityState === "function"){
    refreshShopAffordabilityState();
  }

  /* PLANETY */
  if(save || renderShopNow){
    setPlanet();
  }

  renderSideUi(save || renderShopNow);

  if(save){
    writeLocalGameSave();
  }
}
