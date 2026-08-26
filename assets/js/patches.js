const autoValueUpgrade = upgrades.find(u=>u.id==="autoValue");
if(autoValueUpgrade) autoValueUpgrade.name = "AUTO: WARTOSC +1";
const critChanceUpgrade = upgrades.find(u=>u.id==="critC");
if(critChanceUpgrade) critChanceUpgrade.name = "CRIT SZANSA";
const critDamageUpgrade = upgrades.find(u=>u.id==="critM");
if(critDamageUpgrade) critDamageUpgrade.name = "CRIT DMG";

const rebirthOverlay = document.getElementById("rebirthOverlay");
const rebirthHeroTitle = document.getElementById("rebirthHeroTitle");
const rebirthHeroSubtitle = document.getElementById("rebirthHeroSubtitle");
const rebirthUnlockList = document.getElementById("rebirthUnlockList");
const rebirthContinueBtn = document.getElementById("rebirthContinueBtn");
const stopAutoEggBtn = document.getElementById("stopAutoEggBtn");
const autoOpenToggle = document.getElementById("autoOpenToggle");
const autoCrateToggle = document.getElementById("autoCrateToggle");
const appInstallBtn = document.getElementById("appInstallBtn");
const appInstallOverlay = document.getElementById("appInstallOverlay");
const appInstallClose = document.getElementById("appInstallClose");
const appInstallStatus = document.getElementById("appInstallStatus");
const appInstallPromptBtn = document.getElementById("appInstallPromptBtn");
const freeRewardsBtn = document.getElementById("freeRewardsBtn");
const freeRewardsOverlay = document.getElementById("freeRewardsOverlay");
const freeRewardsClose = document.getElementById("freeRewardsClose");
const freeRewardsGrid = document.getElementById("freeRewardsGrid");
const freeRewardsProgress = document.getElementById("freeRewardsProgress");
const itemDropFeed = document.getElementById("itemDropFeed");
const indexDockBtn = document.getElementById("indexDockBtn");
const indexPanel = document.getElementById("indexPanel");
const indexContent = document.getElementById("indexContent");
const enchantCraftDockBtn = document.getElementById("enchantCraftDockBtn");
const enchantCraftPanel = document.getElementById("enchantCraftPanel");
const enchantCraftList = document.getElementById("enchantCraftList");
const enchantCraftFx = document.getElementById("enchantCraftFx");
const upgradeHubDockBtn = document.getElementById("upgradeHubDockBtn");
const upgradeHubPanel = document.getElementById("upgradeHubPanel");
const upgradeHubList = document.getElementById("upgradeHubList");
const weatherDockBtn = document.getElementById("weatherDockBtn");
const weatherPanel = document.getElementById("weatherPanel");
const weatherContent = document.getElementById("weatherContent");
const codesBtn = document.getElementById("codesBtn");
const codesOverlay = document.getElementById("codesOverlay");
const codesClose = document.getElementById("codesClose");
const codesInput = document.getElementById("codesInput");
const codesClaim = document.getElementById("codesClaim");
const codesStatus = document.getElementById("codesStatus");

const HIDDEN_MANUAL_CLICK_COOLDOWN_MS = 55;
const APP_INSTALL_BONUS_MULT = 1.05;
let lastManualClickAt = 0;
let rebirthOverlayTimers = [];
let rebirthOverlayOpen = false;
let lastAutoEggId = null;
let lastAutoCrateId = null;
let deferredAppInstallPrompt = null;
let lastFreeRewardsPlaytimeSaveAt = 0;
let lastEggDenyAt = 0;
let lastCrateDenyAt = 0;
let lastWeatherSlotKey = "";
let weatherRollBusy = false;
let lastWeatherClickableAt = 0;
let lastFloodShipAt = 0;
let lastFloodFishAt = 0;
let weatherClickableBurstId = 0;

game.endlessUpgrades = game.endlessUpgrades && typeof game.endlessUpgrades === "object" ? game.endlessUpgrades : {};
game.ultraCores = game.ultraCores || 0;
game.ultraCoreBest = game.ultraCoreBest || 0;
game.rebirthMult = Math.max(Number(game.rebirthMult) || 1, Math.pow(1.5, Number(game.rebirths) || 0));
game.clicks = game.clicks || 0;
game.openedEggs = game.openedEggs || 0;
game.autoCrateMode = !!game.autoCrateMode;
game.autoClickEnabled = game.autoClickEnabled !== false;
game.diamondClickEnabled = game.diamondClickEnabled !== false;
game.autoDeletePets = game.autoDeletePets && typeof game.autoDeletePets === "object" ? game.autoDeletePets : {};
game.potions = Array.isArray(game.potions) ? game.potions : [];
game.activePotions = Array.isArray(game.activePotions) ? game.activePotions : [];
game.potionSeq = game.potionSeq || 1;
game.bags = Array.isArray(game.bags) ? game.bags : [];
game.bagSeq = game.bagSeq || 1;
game.enchants = Array.isArray(game.enchants) ? game.enchants : [];
game.activeEnchantIds = Array.isArray(game.activeEnchantIds) ? game.activeEnchantIds : [];
game.enchantSeq = game.enchantSeq || 1;
game.inventoryEggs = Array.isArray(game.inventoryEggs) ? game.inventoryEggs : [];
game.inventoryEggSeq = game.inventoryEggSeq || 1;
game.fruits = Array.isArray(game.fruits) ? game.fruits : [];
game.fruitSeq = game.fruitSeq || 1;
game.marketSlots = Math.max(1, Math.min(5, Math.floor(Number(game.marketSlots) || 1)));
game.featureUnlocks = game.featureUnlocks && typeof game.featureUnlocks === "object" ? game.featureUnlocks : {};
game.dailyStreak = game.dailyStreak && typeof game.dailyStreak === "object" ? game.dailyStreak : {};
game.leaderboardStats = game.leaderboardStats && typeof game.leaderboardStats === "object" ? game.leaderboardStats : {};
game.appBonusUnlocked = !!game.appBonusUnlocked;
game.appBonusUnlockedAt = Number(game.appBonusUnlockedAt) || 0;
game.freeRewards = game.freeRewards && typeof game.freeRewards === "object" ? game.freeRewards : {};
function ensureWeatherState(){
  game.weather = game.weather && typeof game.weather === "object" ? game.weather : {};
  game.weather.discovered = game.weather.discovered && typeof game.weather.discovered === "object" ? game.weather.discovered : {};
  game.weather.upgrades = game.weather.upgrades && typeof game.weather.upgrades === "object" ? game.weather.upgrades : {};
  game.weather.forecast = Array.isArray(game.weather.forecast) ? game.weather.forecast : [];
  game.weather.planned = game.weather.planned && typeof game.weather.planned === "object" ? game.weather.planned : {};
  game.weather.shells = Number(game.weather.shells) || 0;
  return game.weather;
}
ensureWeatherState();

const WEATHER_SLOT_MS = 30 * 60 * 1000;
const WEATHER_CATALOG = [
  {id:"rain", name:"Deszcz", icon:"&#127783;", chance:20, duration:15*60*1000, luck:1.15, manualMoney:1.2, desc:"+15% luck, +20% coins z recznego klikania."},
  {id:"wind", name:"Wiatr", icon:"&#127788;", chance:20, duration:15*60*1000, luck:1.1, allMoney:1.1, desc:"+10% coins ze wszystkiego, +10% luck."},
  {id:"storm", name:"Burza", icon:"&#9928;", chance:10, duration:5*60*1000, luck:1.5, autoMoney:1.5, desc:"+50% luck, +50% coins tylko z autoclicka."},
  {id:"toxic", name:"Toksyczne deszcze", icon:"&#129514;", chance:10, duration:5*60*1000, allMoney:1.5, diamonds:1.2, desc:"+50% coins, +20% drop diamentow."},
  {id:"golden", name:"Golden Hour", icon:"&#127774;", chance:10, duration:10*60*1000, allMoney:1.5, goldChance:0.5, shinyChance:0.1, desc:"+50% coins, lepsze gold/shiny warianty."},
  {id:"diamonds", name:"Diamenty z nieba", icon:"&#128142;", chance:10, duration:10*60*1000, diamonds:2, diamondValue:2, desc:"x2 szansa i wartosc diamentow z klikania."},
  {id:"items", name:"Uwaga na glowe!", icon:"&#127873;", chance:10, duration:10*60*1000, itemDrop:2, desc:"x2 szansa na itemy z klikania."},
  {id:"riches", name:"Bogactwo z nieba!", icon:"&#128176;", chance:5, duration:5*60*1000, allMoney:1.5, itemDrop:3, tierUp:true, desc:"+50% coins, x3 item drop, itemy wpadaja o tier wyzej."},
  {id:"tornado", name:"Tornado", icon:"&#127786;", chance:5, duration:5*60*1000, luck:1.5, variantChance:0.5, tornadoBag:true, desc:"+50% luck i +50% do aktualnych szans wariantow."},
  {id:"flood", name:"Powodz", icon:"&#127754;", chance:1, duration:10*60*1000, shells:true, desc:"Klikanie moze dropic muszelki do wodnych nagrod."}
];

function showItemDropTile(kind, data={}){
  if(!itemDropFeed) return;
  const tile = document.createElement("div");
  tile.className = `itemDropTile ${kind || ""}`;
  const amount = Math.max(1, Math.floor(Number(data.amount ?? data.count ?? data.qty) || 1));
  tile.innerHTML = `<span class="itemDropIcon">${data.icon || "?"}</span><span class="itemDropCount">x${format(amount)}</span>`;
  tile.title = data.name || data.label || kind || "Item";
  tile.setAttribute("aria-label", tile.title);
  if(data.color) tile.style.setProperty("--drop-color", data.color);
  itemDropFeed.appendChild(tile);
  while(itemDropFeed.children.length > 8){
    itemDropFeed.firstElementChild?.remove();
  }
  setTimeout(()=>tile.remove(), 2900);
}
game.usedCodes = game.usedCodes && typeof game.usedCodes === "object" ? game.usedCodes : {};

function getExistItemKey(type, id){
  return String(id || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function trackExist(type, id, amount=1){
  if(typeof window.incrementExistCount === "function"){
    window.incrementExistCount(type, getExistItemKey(type, id), amount);
  }
}

function getExistLabel(type, id){
  if(typeof window.getExistCount !== "function") return "Istnieje: 0";
  const count = window.getExistCount(type, getExistItemKey(type, id));
  return `Istnieje: ${Number.isFinite(Number(count)) ? Number(count) : 0}`;
}

function appendExistTitle(base, type, id){
  return `${base ? `${base}\n` : ""}${getExistLabel(type, id)}`;
}

function weatherHash(seed){
  let h = 2166136261;
  String(seed).split("").forEach(ch=>{
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  });
  return (h >>> 0) / 4294967295;
}

function getWeatherSlotStart(now=Date.now()){
  return Math.floor(now / WEATHER_SLOT_MS) * WEATHER_SLOT_MS;
}

function rollWeatherForSlot(slotStart){
  const globalWeather = window.__kretGlobalWeather || {};
  const planned = globalWeather?.planned?.[String(slotStart)] || game.weather?.planned?.[String(slotStart)];
  if(planned && getWeatherDef(planned.id)){
    const def = getWeatherDef(planned.id);
    return {
      id:def.id,
      mega:!!planned.mega,
      slotStart,
      startsAt:slotStart,
      endsAt:slotStart + def.duration,
      planned:true
    };
  }
  if(weatherHash(`active:${slotStart}`) > 0.8) return null;
  const total = WEATHER_CATALOG.reduce((sum, item)=>sum + item.chance, 0);
  let roll = weatherHash(`type:${slotStart}`) * total;
  let picked = WEATHER_CATALOG[0];
  for(const weather of WEATHER_CATALOG){
    roll -= weather.chance;
    if(roll <= 0){ picked = weather; break; }
  }
  const mega = weatherHash(`mega:${slotStart}`) < 0.05;
  return {
    id:picked.id,
    mega,
    slotStart,
    startsAt:slotStart,
    endsAt:slotStart + picked.duration,
    rolledAt:slotStart
  };
}

function getWeatherDef(id){
  return WEATHER_CATALOG.find(item=>item.id === id) || WEATHER_CATALOG[0];
}

function getCurrentWeather(){
  ensureWeatherState();
  const globalWeather = window.__kretGlobalWeather || {};
  const manual = globalWeather?.manual || game.weather?.manual;
  const now = Date.now();
  if(manual && manual.endsAt > now) return manual;
  const rolled = rollWeatherForSlot(getWeatherSlotStart(now));
  return rolled && rolled.endsAt > now ? rolled : null;
}

function getWeatherPower(weather=getCurrentWeather()){
  return weather?.mega ? 2 : 1;
}

function getWeatherMultiplier(type){
  const weather = getCurrentWeather();
  if(!weather) return 1;
  const def = getWeatherDef(weather.id);
  const p = getWeatherPower(weather);
  if(type === "luck" && def.luck) return 1 + (def.luck - 1) * p;
  if(type === "money" && def.allMoney) return 1 + (def.allMoney - 1) * p;
  if(type === "manualMoney" && def.manualMoney) return 1 + (def.manualMoney - 1) * p;
  if(type === "autoMoney" && def.autoMoney) return 1 + (def.autoMoney - 1) * p;
  if(type === "diamonds" && def.diamonds) return 1 + (def.diamonds - 1) * p;
  return 1;
}

function getWeatherChanceBoost(type){
  const weather = getCurrentWeather();
  if(!weather) return 0;
  const def = getWeatherDef(weather.id);
  const p = getWeatherPower(weather);
  if(type === "variants" && def.variantChance) return def.variantChance * p;
  if(type === "gold" && def.goldChance) return def.goldChance * p;
  if(type === "shiny" && def.shinyChance) return def.shinyChance * p;
  if(type === "shiny" && def.id === "diamonds" && weather.mega) return 0.5;
  if(type === "diamondVariant" && def.id === "diamonds" && weather.mega) return 0.5;
  if(type === "itemDrop" && def.itemDrop) return def.itemDrop * p - 1;
  if(type === "potionDrop" && def.id === "toxic" && weather.mega) return 1;
  return 0;
}

function getWeatherDiamondValueMultiplier(){
  const weather = getCurrentWeather();
  const def = weather ? getWeatherDef(weather.id) : null;
  return def?.diamondValue ? 1 + (def.diamondValue - 1) * getWeatherPower(weather) : 1;
}

function discoverWeather(weather){
  ensureWeatherState();
  if(!weather) return;
  const wasSeen = !!game.weather.discovered[weather.id];
  game.weather.discovered[weather.id] = true;
  if(!wasSeen){
    game.uiDirty = true;
    if(typeof window.forceKretLocalSave === "function") window.forceKretLocalSave();
    if(typeof requestCloudSave === "function") requestCloudSave({reason:"weatherDiscovery"});
  }
}

function getDiscoveredWeatherCount(){
  ensureWeatherState();
  return Object.keys(game.weather.discovered || {}).length;
}

function getWeatherForecastLevel(){
  ensureWeatherState();
  return Math.max(0, Math.floor(Number(game.weather.upgrades?.forecast) || 0));
}

function buyWeatherForecast(level){
  ensureWeatherState();
  const current = getWeatherForecastLevel();
  if(current >= level) return;
  const need = level === 1 ? {seen:3, cost:500} : {seen:7, cost:1000};
  if(getDiscoveredWeatherCount() < need.seen){
    spawnPopup(`Odkryj ${need.seen} pogod!`, false, false, true);
    return;
  }
  if((game.diamonds || 0) < need.cost){
    spawnPopup(`Za malo diamentow! Potrzebujesz: ${formatDiamond(need.cost)}`, false, false, true);
    return;
  }
  game.diamonds -= need.cost;
  game.weather.upgrades.forecast = level;
  game.uiDirty = true;
  update(true, true);
}

function getWeatherForecastItems(){
  const start = getWeatherSlotStart(Date.now());
  return [1,2].map(offset=>rollWeatherForSlot(start + offset * WEATHER_SLOT_MS));
}

function formatWeatherTime(ms){
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
}

function getWeatherDescription(def, weather=null){
  if(!def) return "";
  const chance = Number(def.chance) ? ` Szansa: ${def.chance}%` : "";
  const mega = weather?.mega ? " MEGA wzmacnia efekt pogody." : "";
  return `${def.desc || ""}${chance}${mega}`.trim();
}

function renderWeatherPanel(){
  if(!weatherContent) return;
  ensureWeatherState();
  const current = getCurrentWeather();
  const level = getWeatherForecastLevel();
  const discovered = getDiscoveredWeatherCount();
  const currentDef = current ? getWeatherDef(current.id) : null;
  const forecast = getWeatherForecastItems();
  weatherContent.innerHTML = `
    <div class="weatherNowCard ${current ? "active" : ""}">
      <span>${currentDef?.icon || "&#9729;"}</span>
      <div><b>${current ? `${current.mega ? "MEGA " : ""}${currentDef.name}` : "Brak pogody"}</b><small>${current ? `Koniec za ${formatWeatherTime(current.endsAt - Date.now())}` : "Nastepne losowanie o pelnej polowie godziny."}</small></div>
    </div>
    <div class="weatherForecastBox">
      <b>Prognoza pogody</b>
      ${level < 1 ? `<button type="button" onclick="buyWeatherForecast(1)">Odblokuj I: 3 pogody + ${formatDiamond(500)}</button>` : ""}
      ${level < 2 ? `<button type="button" onclick="buyWeatherForecast(2)">Odblokuj II: 7 pogod + ${formatDiamond(1000)}</button>` : ""}
      ${level ? forecast.slice(0, level).map((item, i)=>{
        const def = item ? getWeatherDef(item.id) : null;
        return `<div class="weatherForecastItem"><span>${def?.icon || "&#10060;"}</span><div><b>${item ? `${level >= 2 && item.mega ? "MEGA " : ""}${def.name}` : "Brak pogody"}</b><small>Za ${formatWeatherTime((getWeatherSlotStart(Date.now()) + (i+1)*WEATHER_SLOT_MS) - Date.now())}</small></div></div>`;
      }).join("") : `<small>Odkryte pogody: ${discovered}/10</small>`}
    </div>
    <div class="weatherForecastBox weatherShellShop">
      <b>Powodz: muszelki</b>
      <small>Masz: ${format(game.weather.shells || 0)} muszelek. Wydasz je po odkryciu/aktywacji powodzi.</small>
      <div class="weatherWaterOdds">
        <span>Kret Kropla 50%</span><span>Kret Fala 30%</span><span>Kret Przyplywu 15%</span><span>Zalany Kret 5%</span>
      </div>
      <button type="button" onclick="buyWeatherShellReward('bag')">Wodna sakiewka - 100 muszelek</button>
      <button type="button" onclick="buyWeatherShellReward('egg')">Wodne Jajko - 1000 muszelek</button>
    </div>
    <div class="weatherIndexList">
      <b>Index pogody</b>
      ${WEATHER_CATALOG.map(def=>{
        const seen = !!game.weather.discovered[def.id];
        return `<div class="weatherIndexCard ${seen ? "" : "locked"}"><span>${seen ? def.icon : "?"}</span><div><b>${seen ? def.name : "Nieodkryta pogoda"}</b><small>${seen ? getWeatherDescription(def) : "Badz online podczas pogody, zeby ja odkryc."}</small></div></div>`;
      }).join("")}
    </div>
  `;
}

function buyWeatherShellReward(kind){
  ensureWeatherState();
  const price = kind === "egg" ? 1000 : 100;
  if((game.weather.shells || 0) < price){
    spawnPopup(`Za malo muszelek! Potrzebujesz: ${format(price)}`, false, false, true);
    return;
  }
  game.weather.shells -= price;
  if(kind === "egg"){
    addInventoryEggs("water_event_egg", 1);
    showItemDropTile("egg", {icon:"&#129370;", color:"#7ee7ff", name:"Wodne Jajko"});
  }else{
    addBagToInventory("water", 1);
  }
  game.uiDirty = true;
  update(true, true);
}

function renderWeatherHud(){
  let hud = document.getElementById("weatherHud");
  if(!hud){
    hud = document.createElement("div");
    hud.id = "weatherHud";
    document.body.appendChild(hud);
  }
  let fx = document.getElementById("weatherFx");
  if(!fx){
    fx = document.createElement("div");
    fx.id = "weatherFx";
    fx.innerHTML = "<i></i><b></b><em></em>";
    document.body.appendChild(fx);
  }
  if(!fx.children.length) fx.innerHTML = "<i></i><b></b><em></em>";
  const weather = getCurrentWeather();
  if(!weather){
    hud.className = "";
    hud.innerHTML = "";
    if(fx.className) fx.className = "";
    document.body.classList.remove(...WEATHER_CATALOG.map(w=>`weather-${w.id}`), "weather-mega");
    return;
  }
  const def = getWeatherDef(weather.id);
  discoverWeather(weather);
  hud.className = `weatherHudCard weather-${weather.id}`;
  hud.dataset.tip = getWeatherDescription(def, weather);
  hud.innerHTML = `<span>${def.icon}</span><div><b>${weather.mega ? "MEGA " : ""}${def.name}</b><small>${formatWeatherTime(weather.endsAt - Date.now())}</small></div>`;
  document.body.classList.remove(...WEATHER_CATALOG.map(w=>`weather-${w.id}`), "weather-mega");
  document.body.classList.add(`weather-${weather.id}`);
  document.body.classList.toggle("weather-mega", !!weather.mega);
  const fxClass = `weatherFx weather-${weather.id} ${weather.mega ? "weather-mega" : ""}`.trim();
  if(fx.className !== fxClass) fx.className = fxClass;
}

function renderWeatherRoll(weather){
  if(!weather || weatherRollBusy) return;
  weatherRollBusy = true;
  const def = getWeatherDef(weather.id);
  const reel = [];
  for(let i = 0; i < 3; i++){
    const offset = (Math.floor(weatherHash(`${weather.id}:${weather.slotStart}:reel:${i}`) * WEATHER_CATALOG.length)) % WEATHER_CATALOG.length;
    reel.push(...WEATHER_CATALOG.slice(offset), ...WEATHER_CATALOG.slice(0, offset));
  }
  const winningIndex = reel.length;
  reel.push(def, ...WEATHER_CATALOG.slice(0, 6));
  const overlay = document.createElement("div");
  overlay.className = "weatherRollOverlay";
  overlay.innerHTML = `
    <div class="weatherRollBox">
      <div class="weatherRollGlow"></div>
      <div class="weatherRollPointer"></div>
      <div class="weatherRollStrip">${reel.map((w, index)=>`<span class="${index === winningIndex ? "winner" : ""}">${w.icon}</span>`).join("")}</div>
      <div class="weatherRollResult">
        <span>?</span>
        <b>Losowanie pogody...</b>
      </div>
      <div class="weatherRollImpact"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  const box = overlay.querySelector(".weatherRollBox");
  const strip = overlay.querySelector(".weatherRollStrip");
  const itemStep = 76;
  const itemCenter = 31;
  const target = Math.round((box?.clientWidth || 560) / 2 - (winningIndex * itemStep + itemCenter));
  strip?.style.setProperty("--weather-roll-end", `${target}px`);
  window.kretAudio?.reward?.();
  setTimeout(()=>{
    overlay.classList.add("done");
    const resultIcon = overlay.querySelector(".weatherRollResult span");
    const resultText = overlay.querySelector(".weatherRollBox b");
    if(resultIcon) resultIcon.innerHTML = def.icon;
    if(resultText) resultText.textContent = `${weather.mega ? "MEGA " : ""}${def.name}`;
    window.kretAudio?.rare?.();
  }, 1400);
  setTimeout(()=>{
    overlay.remove();
    weatherRollBusy = false;
    renderWeatherHud();
  }, 2500);
}

function syncWeatherSystem(){
  const current = getCurrentWeather();
  const key = current ? `${current.id}:${current.slotStart}:${current.mega ? 1 : 0}` : `none:${getWeatherSlotStart()}`;
  if(key !== lastWeatherSlotKey){
    lastWeatherSlotKey = key;
    if(current) renderWeatherRoll(current);
  }
  renderWeatherHud();
  maybeSpawnWeatherClickable(current);
  if(weatherPanel?.classList.contains("open")) renderWeatherPanel();
}

function weatherRand(min, max){
  return min + Math.random() * (max - min);
}

function weatherPickWeighted(items){
  const total = items.reduce((sum, item)=>sum + (Number(item.weight) || 0), 0);
  let roll = Math.random() * Math.max(1, total);
  for(const item of items){
    roll -= Number(item.weight) || 0;
    if(roll <= 0) return item;
  }
  return items[0];
}

function grantWeatherMiniDiamonds(amount, label="Diamentowy pyl"){
  const whole = typeof addDiamonds === "function" ? addDiamonds(amount) : 0;
  if(whole > 0){
    showItemDropTile("diamonds", {icon:"&#128142;", color:"#72ecff", name:`Diamenty x${whole}`, amount:whole});
  }else{
    spawnPopup(`${label} +${amount.toFixed(2)}`, false, false, true);
  }
}

function grantWeatherLooseReward(pool){
  const reward = weatherPickWeighted(pool);
  if(reward.type === "coins"){
    const base = typeof getClickPower === "function" ? getClickPower() : 1;
    const amount = Math.max(1, Math.floor(base * reward.mult));
    game.score += amount;
    spawnPopup(`+${formatPoint(amount)}`, false, false, true);
    return true;
  }
  if(reward.type === "diamonds"){
    grantWeatherMiniDiamonds(weatherRand(reward.min, reward.max), reward.label || "Diamentowy pyl");
    return true;
  }
  if(reward.type === "potion"){
    game.potions.push(makePotionInstance(reward.potionType || getRandomPotionTypeId(), reward.tier || 1));
    return true;
  }
  if(reward.type === "bag"){
    addBagToInventory(reward.bag || "weak", 1);
    return true;
  }
  if(reward.type === "egg"){
    addInventoryEggs(reward.eggId || "water_event_egg", 1);
    showItemDropTile("egg", {icon:"&#129370;", color:"#7ee7ff", name:"Jajko z pogody"});
    return true;
  }
  if(reward.type === "shells"){
    const amount = reward.amount || 1;
    game.weather.shells = (Number(game.weather.shells) || 0) + amount;
    showItemDropTile("shells", {icon:"&#128026;", color:"#7ee7ff", name:`Muszelki x${amount}`, amount});
    return true;
  }
  return false;
}

const WEATHER_ITEM_VARIANTS = [
  {rarity:"common", weight:72, icon:"&#128230;", label:"Lekki pakunek", size:[34,54], speed:[3.2,5.4], chance:.22},
  {rarity:"common", weight:38, icon:"&#129370;", label:"Spadajace jajko", size:[30,48], speed:[3.0,5.0], chance:.20},
  {rarity:"common", weight:34, icon:"&#129514;", label:"Fiolka", size:[28,46], speed:[2.8,4.8], chance:.18},
  {rarity:"rare", weight:16, icon:"&#127873;", label:"Rzadki prezent", size:[42,62], speed:[3.4,5.8], chance:.10},
  {rarity:"epic", weight:6, icon:"&#128188;", label:"Ciezka torba", size:[48,70], speed:[3.8,6.2], chance:.045},
  {rarity:"legendary", weight:1.2, icon:"&#10024;", label:"Lsnacy pakunek", size:[54,76], speed:[4.2,6.8], chance:.014}
];

const WEATHER_ITEM_REWARDS = {
  common:[
    {weight:58, type:"coins", mult:1.5},
    {weight:28, type:"diamonds", min:.18, max:.45},
    {weight:11, type:"potion", tier:1},
    {weight:3, type:"bag", bag:"weak"}
  ],
  rare:[
    {weight:35, type:"diamonds", min:.55, max:1.1},
    {weight:34, type:"potion", tier:1},
    {weight:24, type:"bag", bag:"weak"},
    {weight:7, type:"bag", bag:"medium"}
  ],
  epic:[
    {weight:35, type:"diamonds", min:1.0, max:2.0},
    {weight:32, type:"potion", tier:2},
    {weight:26, type:"bag", bag:"medium"},
    {weight:7, type:"bag", bag:"best"}
  ],
  legendary:[
    {weight:42, type:"diamonds", min:2.0, max:4.0},
    {weight:30, type:"bag", bag:"medium"},
    {weight:20, type:"bag", bag:"best"},
    {weight:8, type:"egg", eggId:"water_event_egg"}
  ]
};

function getWeatherSpawnInterval(weather, def){
  if(def.id === "items") return weather.mega ? 650 : 900;
  if(def.id === "diamonds") return weather.mega ? 1250 : 1800;
  if(def.id === "tornado") return weather.mega ? 1700 : 2600;
  return 12000;
}

function getWeatherBatchCount(weather, def){
  const roll = Math.random();
  if(def.id === "items"){
    if(roll < (weather.mega ? .18 : .08)) return 3;
    if(roll < (weather.mega ? .48 : .28)) return 2;
    return 1;
  }
  if(def.id === "diamonds"){
    return roll < (weather.mega ? .28 : .12) ? 2 : 1;
  }
  if(def.id === "tornado"){
    return roll < (weather.mega ? .16 : .05) ? 2 : 1;
  }
  return 1;
}

function setupWeatherClickableMotion(node, variant, index=0){
  const size = Math.round(weatherRand(variant.size[0], variant.size[1]));
  node.style.setProperty("--weather-size", `${size}px`);
  node.style.setProperty("--weather-speed", `${weatherRand(variant.speed[0], variant.speed[1]).toFixed(2)}s`);
  node.style.setProperty("--weather-drift", `${weatherRand(-90, 90)}px`);
  node.style.setProperty("--weather-fall", `${weatherRand(145, 250)}px`);
  node.style.setProperty("--weather-rotate-start", `${weatherRand(-22, 18)}deg`);
  node.style.setProperty("--weather-rotate-end", `${weatherRand(14, 42)}deg`);
  node.style.left = `${8 + Math.random() * 82}%`;
  node.style.top = `${-6 + Math.random() * 18 + index * 4}%`;
}

function spawnWeatherItemClickable(weather, index=0){
  const variant = weatherPickWeighted(WEATHER_ITEM_VARIANTS);
  const node = document.createElement("button");
  node.type = "button";
  node.className = `weatherClickable weatherClickable-items weatherClickable-${variant.rarity}`;
  node.innerHTML = `<span class="weatherClickableIcon">${variant.icon}</span>`;
  node.title = `${variant.label}: kliknij i sproboj zlapac`;
  setupWeatherClickableMotion(node, variant, index);
  node.onclick = () => {
    const chance = Math.min(.38, variant.chance * (weather.mega ? 1.25 : 1));
    if(Math.random() < chance) grantWeatherLooseReward(WEATHER_ITEM_REWARDS[variant.rarity] || WEATHER_ITEM_REWARDS.common);
    else spawnPopup("Ucieklo!", false, false, true);
    node.remove();
    update(true, true);
  };
  document.body.appendChild(node);
  setTimeout(()=>node.remove(), 7200);
}

function spawnWeatherDiamondClickable(weather, index=0){
  const special = Math.random() < (weather.mega ? .07 : .035);
  const variant = special
    ? {rarity:"special", size:[56,76], speed:[2.8,4.4], chance:.28}
    : weatherPickWeighted([
      {rarity:"small", weight:48, size:[28,42], speed:[2.4,4.8], chance:.54},
      {rarity:"medium", weight:34, size:[38,58], speed:[3.0,5.6], chance:.48},
      {rarity:"large", weight:14, size:[52,70], speed:[3.6,6.4], chance:.38}
    ]);
  const node = document.createElement("button");
  node.type = "button";
  node.className = `weatherClickable weatherClickable-diamonds weatherDiamond-${variant.rarity}`;
  node.innerHTML = "&#128142;";
  node.title = special ? "Specjalny diament: mala szansa na wiecej" : "Diamentowy okruch";
  setupWeatherClickableMotion(node, variant, index);
  node.style.setProperty("--weather-drift", `${weatherRand(-130, 130)}px`);
  node.onclick = () => {
    const chance = Math.min(.7, variant.chance * (weather.mega ? 1.15 : 1));
    if(Math.random() < chance){
      const amount = special ? weatherRand(1.4, 3.2) : weatherRand(.16, variant.rarity === "large" ? .75 : .48);
      grantWeatherMiniDiamonds(amount, special ? "Specjalny diament" : "Okruch");
    }else{
      spawnPopup("Diament pekl!", false, false, true);
    }
    node.remove();
    update(true, true);
  };
  document.body.appendChild(node);
  setTimeout(()=>node.remove(), 7400);
}

function spawnWeatherTornadoClickable(weather){
  const variant = weatherPickWeighted([
    {rarity:"small", weight:42, scale:.72, speed:[4.4,6.2], chance:.16},
    {rarity:"medium", weight:40, scale:1, speed:[4.8,6.8], chance:.10},
    {rarity:"large", weight:16, scale:1.26, speed:[5.2,7.6], chance:.065},
    {rarity:"huge", weight:2, scale:1.55, speed:[5.8,8.4], chance:.035}
  ]);
  const side = weatherPickWeighted([
    {id:"left", weight:36},
    {id:"right", weight:36},
    {id:"top", weight:18},
    {id:"bottom", weight:10}
  ]).id;
  const node = document.createElement("button");
  node.type = "button";
  node.className = `weatherClickable weatherClickable-tornado weatherTornado-${variant.rarity} from-${side}`;
  node.innerHTML = `
    <span class="tornadoCore"><i></i><i></i><i></i><i></i></span>
    <span class="tornadoLoot"><em>&#128142;</em><em>&#127873;</em><em>&#128188;</em></span>
    <span class="tornadoDust"></span>
  `;
  node.style.setProperty("--tornado-scale", variant.scale);
  node.style.setProperty("--weather-speed", `${weatherRand(variant.speed[0], variant.speed[1]).toFixed(2)}s`);
  node.style.setProperty("--tornado-drift-x", `${weatherRand(-90, 90)}px`);
  node.style.setProperty("--tornado-drift-y", `${weatherRand(90, 220)}px`);
  if(side === "left"){
    node.style.left = "-120px";
    node.style.top = `${18 + Math.random() * 54}%`;
  }else if(side === "right"){
    node.style.left = "auto";
    node.style.right = "-120px";
    node.style.top = `${18 + Math.random() * 54}%`;
    node.style.setProperty("--tornado-drift-x", `${weatherRand(-220, -90)}px`);
  }else if(side === "bottom"){
    node.style.left = `${10 + Math.random() * 74}%`;
    node.style.top = "86%";
    node.style.setProperty("--tornado-drift-y", `${weatherRand(-190, -90)}px`);
  }else{
    node.style.left = `${10 + Math.random() * 74}%`;
    node.style.top = "-130px";
  }
  node.title = "Kliknij oko tornada";
  node.onclick = () => {
    const chance = Math.min(.22, variant.chance * (weather.mega ? 1.25 : 1));
    if(Math.random() < chance){
      grantWeatherLooseReward([
        {weight:46, type:"diamonds", min:.4, max:1.2},
        {weight:30, type:"shells", amount:3 + Math.floor(Math.random() * 4)},
        {weight:17, type:"bag", bag:"weak"},
        {weight:5, type:"bag", bag:"medium"},
        {weight:2, type:"bag", bag:"tornado"}
      ]);
    }else{
      spawnPopup("Tornado wyrwalo sie!", false, false, true);
    }
    node.remove();
    update(true, true);
  };
  document.body.appendChild(node);
  setTimeout(()=>node.remove(), 9000);
}

function maybeSpawnWeatherClickable(weather){
  if(!weather) return;
  const def = getWeatherDef(weather.id);
  const now = Date.now();
  if(def.id === "flood"){
    maybeSpawnFloodShip(weather);
    maybeSpawnFloodFish(weather);
    return;
  }
  const canSpawn = def.id === "items" || def.id === "tornado" || def.id === "diamonds";
  if(!canSpawn || now - lastWeatherClickableAt < getWeatherSpawnInterval(weather, def)) return;
  lastWeatherClickableAt = now;
  if(Math.random() > (weather.mega ? .92 : .78)) return;
  const burstId = ++weatherClickableBurstId;
  for(let i = 0; i < getWeatherBatchCount(weather, def); i++){
    setTimeout(()=>{
      if(def.id === "items") spawnWeatherItemClickable(weather, i);
      else if(def.id === "diamonds") spawnWeatherDiamondClickable(weather, i);
      else spawnWeatherTornadoClickable(weather, i);
    }, i * 140 + (burstId % 3) * 35);
  }
  return;
  const node = document.createElement("button");
  node.type = "button";
  node.className = `weatherClickable weatherClickable-${def.id}`;
  node.innerHTML = def.id === "diamonds"
    ? "&#128142;"
    : def.id === "tornado"
      ? `<span class="tornadoCore"><i></i><i></i><i></i><i></i></span><span class="tornadoDust"></span>`
      : "&#127873;";
  node.style.left = `${10 + Math.random() * 78}%`;
  node.style.top = `${8 + Math.random() * 46}%`;
  node.title = "Kliknij szybko!";
  node.onclick = () => {
    if(def.id === "diamonds"){
      const amount = 5 + Math.floor(Math.random() * 16);
      game.diamonds += amount;
      showItemDropTile("diamonds", {icon:"💎", color:"#72ecff", name:`Diamenty x${amount}`, amount});
    }else if(def.id === "tornado" && Math.random() < 0.03){
      addBagToInventory("tornado", 1);
      spawnPopup("Tornado sakiewka!", false, false, true);
    }else if(def.id === "items" && Math.random() < 0.05){
      addBagToInventory(Math.random() < 0.8 ? "weak" : "medium", 1);
    }else{
      spawnPopup("Pusto!", false, false, true);
    }
    node.remove();
    update(true, true);
  };
  document.body.appendChild(node);
  setTimeout(()=>node.remove(), 5200);
}

function maybeSpawnFloodShip(weather){
  const now = Date.now();
  if(document.querySelectorAll(".weatherShip").length >= (weather.mega ? 3 : 2)) return;
  if(now - lastFloodShipAt < (weather.mega ? 8000 : 11000)) return;
  lastFloodShipAt = now;
  const ships = [
    {kind:"raft", name:"Tratwa", weight:46, hp:10, scale:.82, speed:15, reward:()=>{ game.weather.shells += 3; return "Muszelki x3"; }},
    {kind:"boat", name:"Lodka", weight:32, hp:28, scale:1, speed:17, reward:()=>{ game.weather.shells += 7; return "Muszelki x7"; }},
    {kind:"ship", name:"Statek", weight:17, hp:74, scale:1.12, speed:19, reward:()=>{
      game.weather.shells += 12;
      if(Math.random() < .18) addBagToInventory("water", 1);
      return "Muszelki x12";
    }},
    {kind:"ark", name:"Arka", weight:5, hp:150, scale:1.28, speed:23, reward:()=>{
      game.weather.shells += 22;
      if(Math.random() < .08) addBagToInventory("water", 1);
      if(Math.random() < .015){
        addInventoryEggs("water_event_egg", 1);
        showItemDropTile("egg", {icon:"&#129370;", color:"#7ee7ff", name:"Wodne Jajko"});
      }
      return "Muszelki x22";
    }}
  ];
  const ship = weatherPickWeighted(ships);
  const node = document.createElement("button");
  node.type = "button";
  node.className = `weatherShip weatherShip-${ship.kind}`;
  if(Math.random() < .32) node.classList.add("fromRight");
  node.style.top = `${54 + Math.random() * 25}%`;
  node.style.setProperty("--shipBob", `${Math.random() > 0.5 ? 1 : -1}`);
  node.style.setProperty("--ship-scale", ship.scale);
  node.style.setProperty("--ship-speed", `${weatherRand(ship.speed - 2, ship.speed + 3).toFixed(1)}s`);
  node.innerHTML = `
    <div class="weatherShipHp"><i style="width:100%"></i></div>
    <div class="weatherShipShape">
      <span class="weatherShipMast"></span>
      <span class="weatherShipSail"></span>
      <span class="weatherShipHull"></span>
    </div>
    <small>${ship.name}</small>
  `;
  let hp = ship.hp;
  const maxHp = ship.hp;
  node.onclick = () => {
    const damage = Math.max(1, 2 + Math.floor((game.rebirths || 0) / 2) + (game.ultraCores || 0) * 4);
    hp -= damage;
    const hpFill = node.querySelector(".weatherShipHp i");
    if(hpFill) hpFill.style.width = `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%`;
    if(hp <= 0){
      const rewardText = ship.reward();
      spawnPopup(rewardText, false, false, true);
      node.remove();
      update(true, true);
    }
  };
  document.body.appendChild(node);
  setTimeout(()=>node.remove(), 16000);
}

function maybeSpawnFloodFish(weather){
  if(!weather?.mega) return;
  const now = Date.now();
  if(document.querySelectorAll(".weatherFish").length >= 2) return;
  if(now - lastFloodFishAt < 9000 + Math.random() * 9000) return;
  lastFloodFishAt = now;
  const fish = weatherPickWeighted([
    {id:"fish_small", weight:76, scale:.82, speed:10},
    {id:"fish_deep", weight:23.3, scale:1, speed:12},
    {id:"fish_ancient", weight:.7, scale:1.18, speed:15}
  ]);
  const def = PET_FRUIT_CATALOG[fish.id];
  if(!def) return;
  const node = document.createElement("button");
  node.type = "button";
  node.className = `weatherFish weatherFish-${fish.id}`;
  if(Math.random() < .5) node.classList.add("fromRight");
  node.style.top = `${63 + Math.random() * 22}%`;
  node.style.setProperty("--fish-scale", fish.scale);
  node.style.setProperty("--fish-speed", `${weatherRand(fish.speed - 2, fish.speed + 3).toFixed(1)}s`);
  node.innerHTML = `<span>${def.icon}</span>`;
  node.title = "";
  node.onclick = () => {
    addPetFruit(def.id, 1);
    spawnPopup(`${def.name} zlapana!`, false, false, true);
    node.remove();
    update(true, true);
  };
  document.body.appendChild(node);
  setTimeout(()=>node.remove(), 14000);
}

function grantWeatherAvatar(){
  const best = getOwnedPets().sort((a,b)=>getPetPowerRank(b)-getPetPowerRank(a))[0] || {click:50, multi:0.5, diamond:0.1};
  const template = {
    id:"exclusive_weather_avatar",
    name:"Kret Avatar",
    icon:"A",
    rarity:"Exclusive",
    click:Math.max(1, (best.click || 50) * 2),
    multi:Math.max(0.1, (best.multi || 0.5) * 2),
    diamond:Math.max(0.05, getPetDiamondBonusValue(best) * 2),
    color:"#8df7ff",
    secret:true,
    exclusive:true
  };
  const pet = buildPetInstance(template, {id:"weather", name:"Pogoda"}, {variant:"normal", shiny:false, baseName:"Kret Avatar"});
  pet.exclusive = true;
  game.pets.push(pet);
  trackExist("pets", pet.templateId);
  showItemDropTile("pet", {icon:"A", color:"#8df7ff", name:"Kret Avatar"});
  triggerScreenEffect?.("rare", "KRET AVATAR");
}

function getBestOwnedPetForScaling(){
  return getOwnedPets().sort((a,b)=>getPetPowerRank(b)-getPetPowerRank(a))[0] || {click:50, multi:0.5, diamond:0.1};
}

function makeScaledEventPet({id, name, percent, color, style="weather", rarity="Exclusive"}){
  const best = getBestOwnedPetForScaling();
  const template = {
    id,
    name,
    icon:name.slice(0, 1),
    rarity,
    click:Math.max(1, (best.click || 50) * percent),
    multi:Math.max(0.08, (best.multi || 0.5) * percent),
    diamond:Math.max(0.03, getPetDiamondBonusValue(best) * percent),
    color,
    secret:percent >= 1.4,
    exclusive:true
  };
  const pet = buildPetInstance(template, {id:style, name:"Event Pogody"}, {variant:"normal", shiny:false, baseName:name});
  pet.exclusive = true;
  pet.weatherPet = true;
  return pet;
}

function rollWaterPet(){
  const pool = [
    {chance:50, id:"water_splash_mole", name:"Kret Kropla", percent:.75, color:"#8eeaff"},
    {chance:30, id:"water_wave_mole", name:"Kret Fala", percent:.90, color:"#55c8ff"},
    {chance:15, id:"water_tide_mole", name:"Kret Przyplywu", percent:1.00, color:"#378bff"},
    {chance:5, id:"water_flooded_mole", name:"Zalany Kret", percent:1.50, color:"#1c5fd8"}
  ];
  let roll = Math.random() * 100;
  for(const item of pool){
    roll -= item.chance;
    if(roll <= 0) return makeScaledEventPet(item);
  }
  return makeScaledEventPet(pool[0]);
}

function grantWeatherPet(type){
  const pet = type === "tornado"
    ? makeScaledEventPet({id:"exclusive_tornado_mole", name:"Tornado Kret", percent:1.4, color:"#d9f3ff", style:"tornado"})
    : grantWeatherAvatar();
  if(!pet) return;
  game.pets.push(pet);
  trackExist("pets", pet.templateId);
  showItemDropTile("pet", {icon:pet.icon || "P", color:pet.color, name:pet.name});
  triggerScreenEffect?.("rare", pet.name);
}

function tryWeatherSpecialDrops(source="click"){
  const weather = getCurrentWeather();
  if(!weather) return;
  if(Math.random() < 1 / 50000){
    grantWeatherAvatar();
  }
  const def = getWeatherDef(weather.id);
  if(def.shells && Math.random() < 0.001){
    const amount = 1 + Math.floor(Math.random() * 3);
    game.weather.shells = (Number(game.weather.shells) || 0) + amount;
    showItemDropTile("shells", {icon:"&#128026;", color:"#7ee7ff", name:`Muszelki x${amount}`, amount});
  }
}

function getOwnedPetTemplateIds(){
  return new Set(getOwnedPets().map(pet=>pet.templateId));
}

function getOwnedSkinTemplateIds(){
  return new Set(getOwnedSkins().map(skin=>skin.templateId));
}

function getPetIndexVariants(templateId){
  const variants = getOwnedPets()
    .filter(pet=>pet.templateId === templateId)
    .map(pet=>getPetVariantLabel(pet));
  return [...new Set(variants)];
}

function getSkinIndexVariants(templateId){
  const owned = getOwnedSkins().filter(skin=>skin.templateId === templateId);
  const variants = ["Normal"];
  if(owned.some(skin=>String(skin.rarity || "").toLowerCase().includes("boss"))) variants.push("Boss");
  if(owned.some(skin=>String(skin.rarity || "").toLowerCase().includes("exclusive"))) variants.push("Exclusive");
  if(owned.some(skin=>String(skin.skinClass || "").toLowerCase().includes("void"))) variants.push("VOID");
  return [...new Set(variants)];
}

function getIndexPetPreview(template, variantKey){
  const variantMap = {
    normal:{variant:"normal", shiny:false, label:"NORMAL"},
    gold:{variant:"gold", shiny:false, label:"GOLD"},
    diamond:{variant:"diamond", shiny:false, label:"DIAMOND"},
    shiny:{variant:"normal", shiny:true, label:"SHINY"},
    shinyGold:{variant:"gold", shiny:true, label:"SHINY GOLD"},
    shinyDiamond:{variant:"diamond", shiny:true, label:"SHINY DIAMOND"}
  };
  const info = variantMap[variantKey] || variantMap.normal;
  const mult = getPetVariantMultiplier(info);
  const baseDiamond = typeof template.diamond === "number" ? template.diamond : getPetDiamondBonusValue(template);
  return {
    label:info.label,
    variant:info.variant,
    shiny:info.shiny,
    click:+((template.click || 0) * mult).toFixed(3),
    multi:+((template.multi || 0) * mult).toFixed(4),
    diamond:+(baseDiamond * mult).toFixed(4)
  };
}

function makeIndexCard({type, id, name, rarity, icon, visualClass="", visualStyle="", discovered, meta="", variants=[], stats=""}){
  const card = document.createElement("div");
  card.className = `indexCard ${discovered ? "discovered" : "hiddenItem"} ${getRarityClass(rarity)}`;
  card.title = discovered ? appendExistTitle(meta || rarity || "", type, id) : "Nieodkryte";
  const variantHtml = discovered && variants.length
    ? `<div class="indexVariants">${variants.map(label=>`<span>${label}</span>`).join("")}</div>`
    : "";
  card.innerHTML = `
    <div class="indexVisual ${visualClass}" style="${visualStyle ? `background:${visualStyle}` : ""}">
      ${discovered ? `<span>${icon || ""}</span>` : `<span>?</span>`}
    </div>
    <div class="indexMeta">
      <b>${discovered ? name : "???"}</b>
      <small>${discovered ? `${rarity}<br>${getExistLabel(type, id)}${stats ? `<br>${stats}` : ""}` : "???"}</small>
    </div>
    ${variantHtml}
  `;
  return card;
}

function getIndexProgressRing(done, total, tone="default"){
  const percent = total ? Math.round((done / total) * 100) : 0;
  return `
    <div class="indexProgressRing ${tone}" style="--index-progress:${percent * 3.6}deg">
      <span>${percent}%</span>
    </div>
  `;
}

function getPetVariantProgress(templates){
  const options = [
    ["normal","Normal","normal"],
    ["gold","Gold","gold"],
    ["diamond","Diamond","diamond"],
    ["shiny","Shiny","shiny"],
    ["shinyGold","Shiny Gold","shinyGold"],
    ["shinyDiamond","Shiny Diamond","shinyDiamond"]
  ];
  return options.map(([key, label, tone])=>{
    const done = templates.filter(template=>{
      return getOwnedPets().some(pet=>{
        const variant = pet.variant || "normal";
        const shiny = !!pet.shiny;
        const petKey = shiny && variant === "diamond" ? "shinyDiamond" : shiny && variant === "gold" ? "shinyGold" : shiny ? "shiny" : variant;
        return pet.templateId === template.id && petKey === key;
      });
    }).length;
    return {key, label, tone, done, total:templates.length};
  });
}

function getEventIndexPets(){
  let crystalConfigPets = [];
  try{ crystalConfigPets = CRYSTAL_EVENT_CONFIG?.pets || []; }catch(err){ crystalConfigPets = []; }
  const crystalPets = crystalConfigPets.map(pet=>Object.assign({
    rarity:"Exclusive",
    click:0,
    multi:0,
    diamond:0,
    color:"#8df6ff",
    eventName:"Crystal Event"
  }, pet));
  crystalPets.forEach(pet=>{
    if(pet.id === "crystal_overlord") pet.secret = true;
  });
  return [
    {
      id:"exclusive_chrono_mole",
      name:"Zegarowy Kret",
      icon:"⏳",
      rarity:"Exclusive",
      click:0,
      multi:0,
      diamond:0,
      color:"#ffd66e",
      eventName:"Free Rewards",
      secret:true
    },
    ...crystalPets
  ];
}

function getEventIndexSkins(){
  return [
    {id:"skin_chrono_mole", name:"Skin Zegarowego Kreta", rarity:"Exclusive", icon:"⏳", skinClass:"skin-chrono", accent:"#ffd66e", eventName:"Free Rewards"},
    {id:"skin_crystal_mole", name:"Skin Krysztalowego Kreta", rarity:"Exclusive", icon:"◇", skinClass:"skin-crystal-mole", accent:"#8df6ff", eventName:"Crystal Event"}
  ];
}

const originalIsEggUnlocked = isEggUnlocked;
isEggUnlocked = function(egg){
  if(egg?.voidEgg || egg?.ultraUnlock){
    const requiredCores = Math.max(1, Number(egg.ultraUnlock) || 1);
    return Math.max(game.ultraCoreBest || 0, game.ultraCores || 0) >= requiredCores;
  }
  return originalIsEggUnlocked(egg);
};

function getEggUnlockText(egg){
  if(egg?.voidEgg || egg?.ultraUnlock){
    const requiredCores = Math.max(1, Number(egg.ultraUnlock) || 1);
    return `Od ${requiredCores} Ultra Rdzenia`;
  }
  return `Od rebirth ${egg.unlockRebirth}`;
}

function getWarsawDayNumber(ms=Date.now()){
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone:"Europe/Warsaw",
    year:"numeric",
    month:"2-digit",
    day:"2-digit"
  }).formatToParts(new Date(ms));
  const values = Object.fromEntries(parts.filter(part=>part.type !== "literal").map(part=>[part.type, Number(part.value)]));
  return Math.floor(Date.UTC(values.year, values.month - 1, values.day) / 86400000);
}

function getDailyStreakCount(){
  const streak = game.dailyStreak && typeof game.dailyStreak === "object" ? game.dailyStreak : {};
  const today = getWarsawDayNumber();
  const lastDay = Number(streak.lastManualClickDay) || 0;
  if(!lastDay) return 0;
  if(today - lastDay > 1) return 0;
  return Math.max(0, Math.floor(Number(streak.count) || 0));
}

const STREAK_RECOVERY_WINDOW_MS = 12 * 60 * 60 * 1000;

function getDailyStreakBest(){
  const streak = game.dailyStreak && typeof game.dailyStreak === "object" ? game.dailyStreak : {};
  return Math.max(0, Math.floor(Math.max(Number(streak.best) || 0, Number(streak.count) || 0)));
}

function getDailyStreakRecoveryCost(count){
  const days = Math.max(0, Math.floor(Number(count) || 0));
  if(days < 5) return 0;
  if(days <= 10) return 100;
  if(days <= 20) return 250;
  if(days <= 30) return 400;
  if(days <= 50) return 750;
  return 1000 + 25 * (days - 49);
}

function getWarsawDayStartMs(dayNumber){
  let low = dayNumber * 86400000 - 36 * 60 * 60 * 1000;
  let high = dayNumber * 86400000 + 36 * 60 * 60 * 1000;
  while(high - low > 1000){
    const mid = Math.floor((low + high) / 2);
    if(getWarsawDayNumber(mid) < dayNumber) low = mid + 1;
    else high = mid;
  }
  return high;
}

function formatStreakRecoveryTime(ms){
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function saveDailyStreakState(reason){
  game.uiDirty = true;
  if(typeof window.forceKretLocalSave === "function") window.forceKretLocalSave();
  if(typeof requestCloudSave === "function"){
    requestCloudSave({force:true, reason});
  }
}

function syncDailyStreakRecovery(){
  game.dailyStreak = game.dailyStreak && typeof game.dailyStreak === "object" ? game.dailyStreak : {};
  const streak = game.dailyStreak;
  streak.best = getDailyStreakBest();
  const today = getWarsawDayNumber();
  const lastDay = Number(streak.lastManualClickDay) || 0;
  const count = Math.max(0, Math.floor(Number(streak.count) || 0));
  if(lastDay && today - lastDay > 1 && count >= 5 && Number(streak.lastRecoverySourceDay) !== lastDay){
    const lostAt = getWarsawDayStartMs(lastDay + 2);
    streak.recovery = {
      count,
      sourceDay:lastDay,
      lostAt,
      expiresAt:lostAt + STREAK_RECOVERY_WINDOW_MS
    };
    streak.lastRecoverySourceDay = lastDay;
    saveDailyStreakState("dailyStreakLost");
  }
  const recovery = streak.recovery && typeof streak.recovery === "object" ? streak.recovery : null;
  if(!recovery || getDailyStreakRecoveryCost(recovery.count) <= 0 || Number(recovery.expiresAt) <= Date.now()){
    return null;
  }
  return recovery;
}

function recoverDailyStreak(){
  const recovery = syncDailyStreakRecovery();
  if(!recovery) return;
  const cost = getDailyStreakRecoveryCost(recovery.count);
  if((Number(game.diamonds) || 0) < cost){
    spawnPopup(`Za malo diamentow! Potrzebujesz: ${formatDiamond(cost)}`, false, false, true);
    return;
  }
  const today = getWarsawDayNumber();
  const clickedToday = Number(game.dailyStreak.lastManualClickDay) === today;
  game.diamonds -= cost;
  game.dailyStreak.count = Math.max(0, Math.floor(Number(recovery.count) || 0));
  game.dailyStreak.best = Math.max(getDailyStreakBest(), game.dailyStreak.count);
  game.dailyStreak.lastManualClickDay = clickedToday ? today : today - 1;
  game.dailyStreak.recovery = null;
  game.dailyStreak.recoveredAt = Date.now();
  spawnPopup(`Odzyskano streak ${game.dailyStreak.count}!`, false, false, true);
  update(true, true);
  saveDailyStreakState("dailyStreakRecovery");
}

function getDailyStreakBonusDays(){
  return Math.min(100, getDailyStreakCount());
}

function getDailyStreakClickMultiplier(){
  return 1 + getDailyStreakBonusDays() * 0.0025;
}

function getDailyStreakLuckMultiplier(){
  return 1 + getDailyStreakBonusDays() * 0.001;
}

function isStandaloneAppMode(){
  return !!(
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true
  );
}

function getAppInstallBonusMultiplier(){
  return game.appBonusUnlocked ? APP_INSTALL_BONUS_MULT : 1;
}

function checkAppInstallBonusState(){
  if(!isStandaloneAppMode() || game.appBonusUnlocked) return false;
  game.appBonusUnlocked = true;
  game.appBonusUnlockedAt = Date.now();
  game.uiDirty = true;
  spawnPopup("Wersja aplikacji: bonus +5%!", false, false, true);
  if(typeof requestCloudSave === "function"){
    requestCloudSave({force:true, reason:"appInstallBonus"});
  }
  return true;
}

function renderAppInstallModal(){
  if(!appInstallStatus || !appInstallPromptBtn) return;
  checkAppInstallBonusState();
  const standalone = isStandaloneAppMode();
  const unlocked = !!game.appBonusUnlocked;
  appInstallStatus.textContent = unlocked
    ? "Status: bonus aktywny permanentnie (+5%)."
    : standalone
      ? "Status: uruchomiono jako aplikacje, aktywowanie bonusu..."
      : "Status: bonus nieaktywny. Uruchom gre z ekranu glownego telefonu.";
  appInstallStatus.classList.toggle("active", unlocked);
  appInstallPromptBtn.hidden = !deferredAppInstallPrompt;
}

function openAppInstallModal(){
  if(!appInstallOverlay) return;
  renderAppInstallModal();
  appInstallOverlay.classList.add("open");
}

function closeAppInstallModal(){
  appInstallOverlay?.classList.remove("open");
}

function registerDailyStreakManualClick(){
  game.dailyStreak = game.dailyStreak && typeof game.dailyStreak === "object" ? game.dailyStreak : {};
  syncDailyStreakRecovery();
  const today = getWarsawDayNumber();
  const lastDay = Number(game.dailyStreak.lastManualClickDay) || 0;
  if(lastDay === today) return false;
  const nextCount = lastDay === today - 1 ? (Number(game.dailyStreak.count) || 0) + 1 : 1;
  game.dailyStreak.count = nextCount;
  game.dailyStreak.best = Math.max(getDailyStreakBest(), nextCount);
  game.dailyStreak.lastManualClickDay = today;
  game.dailyStreak.lastManualClickAt = Date.now();
  game.uiDirty = true;
  spawnPopup(`STREAK ${nextCount}!`, false, false, true);
  if(typeof requestCloudSave === "function"){
    requestCloudSave({force:true, reason:"dailyStreak"});
  }
  return true;
}

function renderDailyStreakHud(){
  const hud = document.getElementById("streakHud");
  const countNode = document.getElementById("streakCount");
  if(!hud || !countNode) return;
  const count = getDailyStreakCount();
  const best = getDailyStreakBest();
  const recovery = syncDailyStreakRecovery();
  const cappedDays = getDailyStreakBonusDays();
  const clickBonus = cappedDays * 0.25;
  const luckBonus = cappedDays * 0.1;
  const today = getWarsawDayNumber();
  const doneToday = Number(game.dailyStreak?.lastManualClickDay) === today;
  const maxed = count >= 100;
  countNode.textContent = String(count);
  hud.classList.toggle("doneToday", doneToday);
  hud.classList.toggle("maxed", maxed);
  hud.removeAttribute("title");
  const tooltip = document.getElementById("streakTooltip");
  if(tooltip){
    tooltip.innerHTML = `
      <b>Streak: ${count} dni</b>
      <small>Najwiekszy streak: ${best} dni</small>
      <span>${doneToday ? "Dzisiaj zaliczone." : "Kliknij kreta recznie, zeby zaliczyc dzien."}</span>
      <small>Kliki: +${clickBonus.toFixed(2)}%${maxed ? " MAX" : ""}</small>
      <small>Luck: +${luckBonus.toFixed(2)}%${maxed ? " MAX" : ""}</small>
      <em>Autoclick nie nabija streaka.</em>
    `;
  }
  hud.setAttribute("data-kret-title", [
    `Streak: ${count} dni`,
    `Najwiekszy streak: ${best} dni`,
    doneToday ? "Dzisiaj zaliczone." : "Kliknij kreta recznie, zeby zaliczyc dzien.",
    `Kliki: +${clickBonus.toFixed(2)}%${maxed ? " MAX" : ""}`,
    `Luck: +${luckBonus.toFixed(2)}%${maxed ? " MAX" : ""}`,
    "Autoclick nie nabija streaka."
  ].join("\n"));
  const recoveryBox = document.getElementById("streakRecoveryBox");
  const recoveryText = document.getElementById("streakRecoveryText");
  const recoveryTimer = document.getElementById("streakRecoveryTimer");
  recoveryBox?.classList.toggle("show", !!recovery);
  if(recovery && recoveryText && recoveryTimer){
    recoveryText.textContent = `${recovery.count} dni | ${formatDiamond(getDailyStreakRecoveryCost(recovery.count))}`;
    recoveryTimer.textContent = `Odzyskaj w ciagu: ${formatStreakRecoveryTime(recovery.expiresAt - Date.now())}`;
  }
}

document.getElementById("streakRecoveryBtn")?.addEventListener("click", recoverDailyStreak);
setInterval(renderDailyStreakHud, 1000);

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

function triggerScreenEffect(type="void", label=""){
  const burst = document.createElement("div");
  burst.className = `screenBurst ${type}`;
  burst.innerHTML = label ? `<b>${label}</b>` : "";
  document.body.appendChild(burst);
  setTimeout(()=>burst.remove(), 1400);
}

function clearRebirthOverlayTimers(){
  rebirthOverlayTimers.forEach(id=>clearTimeout(id));
  rebirthOverlayTimers = [];
}

function getRebirthUnlocks(level){
  const items = [];
  const world = planets[Math.min(level, planets.length - 1)];

  if(world){
    items.push({
      title:`Swiat: ${world.name}`,
      desc:"Tlo i klimat gry wskakuja na kolejny poziom."
    });
  }

  upgrades
    .filter(u=>(u.unlockAt ?? 0) === level)
    .forEach(u=>{
      items.push({
        title:`Upgrade: ${u.name}`,
        desc:upgradeInfoMap[u.id] || "Nowe ulepszenie jest juz dostepne w sklepie."
      });
    });

  eggCatalog
    .filter(egg=>egg.unlockRebirth === level)
    .forEach(egg=>{
      items.push({
        title:`Jajko: ${egg.name}`,
        desc:"Nowe jajko trafilo do panelu jajek."
      });
    });

  crateCatalog
    .filter(crate=>crate.unlockRebirth === level)
    .forEach(crate=>{
      items.push({
        title:`Skrzynia: ${crate.name}`,
        desc:"Nowa skrzynia skinow trafila do panelu skrzynek."
      });
    });

  diamondUpgradeCatalog
    .filter(upg=>upg.unlockAtRebirth === level)
    .forEach(upg=>{
      items.push({
        title:`Diamenty: ${upg.name}`,
        desc:"Nowe trwale ulepszenie pojawilo sie w panelu diamentow."
      });
    });

  return items;
}

function hideRebirthOverlay(){
  rebirthOverlayOpen = false;
  clearRebirthOverlayTimers();
  if(rebirthOverlay){
    rebirthOverlay.classList.remove("open");
  }
  if(rebirthContinueBtn){
    rebirthContinueBtn.classList.remove("show");
  }
}

function showRebirthOverlay(level){
  if(!rebirthOverlay || !rebirthUnlockList || !rebirthContinueBtn) return;

  clearRebirthOverlayTimers();
  rebirthOverlayOpen = true;
  rebirthOverlay.classList.add("open");
  rebirthContinueBtn.classList.remove("show");
  rebirthUnlockList.innerHTML = "";

  const world = planets[Math.min(level, planets.length - 1)];
  rebirthHeroTitle.textContent = `REBIRTH ${level}`;
  rebirthHeroSubtitle.textContent = world ? `Nowy swiat: ${world.name}` : "Nowe odblokowania";

  const unlocks = getRebirthUnlocks(level);
  const staggerMs = 220;

  unlocks.forEach((item, index)=>{
    const row = document.createElement("div");
    row.className = "rebirthUnlock";
    row.innerHTML = `<b>${item.title}</b><small>${item.desc}</small>`;
    rebirthUnlockList.appendChild(row);

    const timer = setTimeout(()=>{
      row.classList.add("show");
    }, 250 + index * staggerMs);
    rebirthOverlayTimers.push(timer);
  });

  const buttonTimer = setTimeout(()=>{
    rebirthContinueBtn.classList.add("show");
  }, 250 + unlocks.length * staggerMs + 3000);
  rebirthOverlayTimers.push(buttonTimer);
}

if(rebirthContinueBtn){
  rebirthContinueBtn.onclick = ()=>hideRebirthOverlay();
}

if(stopAutoEggBtn){
  stopAutoEggBtn.onclick = ()=>{
    if(hatchOverlay?.classList.contains("crateMode")){
      setAutoCrateMode(false);
    }else{
      setAutoEggMode(false);
    }
  };
}

function emoji(...codes){
  return String.fromCodePoint(...codes);
}

const UI_ICONS = {
  egg: emoji(0x1F95A),
  crate: emoji(0x1F4E6),
  backpack: emoji(0x1F392),
  diamond: "◆",
  rocket: emoji(0x1F680),
  lock: emoji(0x1F512),
  coin: "¤",
  moon: "☽",
  red: "●",
  ringed: "✶",
  water: "✦",
  blueGem: "◈",
  whiteOrb: "◉",
  stars: "✧",
  galaxy: "✺",
  black: "⬢",
  sparkle: "✹",
  microphone: emoji(0x1F3A4),
  pickaxe: emoji(0x26CF),
  star: emoji(0x2B50),
  wrench: emoji(0x1F527),
  anchor: emoji(0x2693),
  compass: emoji(0x1F9ED),
  ninja: emoji(0x1F977),
  robot: emoji(0x1F916),
  crown: emoji(0x1F451),
  lightning: emoji(0x26A1),
  diamondPet: emoji(0x1F48E),
  cosmic: emoji(0x1F30C)
};

function normalizeGameText(){
  Object.assign(UI_ICONS, {
    diamond: emoji(0x1F48E),
    coin: emoji(0x1FA99),
    moon: emoji(0x1F319),
    red: emoji(0x1F534),
    ringed: emoji(0x1FA90),
    water: emoji(0x1F30A),
    blueGem: emoji(0x1F537),
    whiteOrb: emoji(0x26AA),
    stars: emoji(0x2728),
    galaxy: emoji(0x1F30C),
    black: emoji(0x2B1B),
    sparkle: emoji(0x1F4AB)
  });

  document.title = "KRET CLICKER";
  eggDockBtn.textContent = UI_ICONS.egg;
  crateDockBtn.textContent = UI_ICONS.crate;
  petDockBtn.textContent = UI_ICONS.backpack;
  diamondDockBtn.textContent = UI_ICONS.diamond;
  document.getElementById("bgRocket").textContent = UI_ICONS.rocket;

  const planetNames = ["ZIEMIA","KSIEZYC","MARS","JOWISZ","SATURN","URAN","NEPTUN","PLUTON","GALAKTYKA","KOSMOS","VOID"];
  planetNames.forEach((name, index)=>{
    if(planets[index]) planets[index].name = name;
  });

  pointIcons.splice(0, pointIcons.length,
    UI_ICONS.coin,
    UI_ICONS.moon,
    UI_ICONS.red,
    UI_ICONS.ringed,
    UI_ICONS.stars,
    UI_ICONS.water,
    UI_ICONS.blueGem,
    UI_ICONS.whiteOrb,
    UI_ICONS.galaxy,
    UI_ICONS.black,
    UI_ICONS.sparkle
  );

  Object.assign(upgradeInfoMap, {
    click:"Wzmacnia pojedynczy klik. Moc ulepszenia rosnie wraz z jego poziomem i kolejnymi swiatami.",
    autoValue:"Zwiksza sile jednego uderzenia autoclicka.",
    autoSpeed:"Przyspiesza, jak czesto autoclick klika.",
    holdCooldown:"Skraca cooldown chwytu.",
    holdDuration:"Wydluza czas trwania chwytu.",
    holdPower:"Zwiksza tempo klikania podczas chwytu.",
    multi:"Podnosi mnoznik punktow ze wszystkich klikow.",
    frenzy:"Zwiksza szanse na wejscie w frenzy.",
    critC:"Zwiksza szanse na krytyczny klik.",
    critM:"Zwiksza obrazenia krytycznego kliku.",
    eggBatch:"Pozwala kupic i otworzyc wiecej jajek naraz.",
    petSlots:"Podnosi limit aktywnych petow az do szesciu.",
    autoEgg:"Odblokowuje osobne auto otwieranie jajek i skrzynek.",
    hatchSpeed:"Skraca cala animacje otwierania jajka.",
    goldChance:"Daje szanse na gold click o mocy x5.",
    diamondRushUnlock:"Odblokowuje cykliczny diamond click.",
    diamondRushCooldown:"Skraca przerwe miedzy diamond clickami.",
    diamondRushDuration:"Wydluza czas aktywnego diamond clicka.",
    diamondRushBoost:"Podnosi boost do szansy na diamenty w diamond clicku."
  });

  const upgradeNames = {
    click:"KLIK: MOC",
    autoValue:"AUTO: WARTOSC +1",
    autoSpeed:"AUTO: TEMPO +0.32s",
    holdCooldown:"CHWYT: COOLDOWN",
    holdDuration:"CHWYT: CZAS TRWANIA",
    holdPower:"CHWYT: MOC",
    multi:"MULTI x0.35",
    frenzy:"FRENZY SZANSA +0.5%",
    critC:"CRIT SZANSA",
    critM:"CRIT DMG"
  };
  upgrades.forEach(upg=>{
    if(upgradeNames[upg.id]) upg.name = upgradeNames[upg.id];
  });

  const diamondText = {
    eggBatch:["ILOSC OTWIERANYCH JAJEK","Podnosi max liczbe jajek otwieranych naraz do 5."],
    petSlots:["MAX ILOSC PETOW","Zwiksza limit aktywnych petow az do 6."],
    autoEgg:["AUTO OTWIERANIE","Odblokowuje osobne przelaczniki auto dla jajek i skrzynek."],
    hatchSpeed:["PRZYSPIESZENIE ANIMACJI","Skraca animacje hatchingu lacznie o 70%."],
    goldChance:["GOLD CLICK","Daje szanse na klik o mocy x5."],
    diamondRushUnlock:["DIAMOND CLICK","Odblokowuje automatyczny diamentowy klik."],
    diamondRushCooldown:["DIAMOND CLICK: COOLDOWN","Skraca czas oczekiwania na diamond click."],
    diamondRushDuration:["DIAMOND CLICK: CZAS","Wydluza trwanie diamond clicka."],
    diamondRushBoost:["DIAMOND CLICK: BOOST","Jeszcze mocniej podbija szanse na diamenty."]
  };
  diamondUpgradeCatalog.forEach(upg=>{
    const pair = diamondText[upg.id];
    if(pair){
      upg.name = pair[0];
      upg.desc = pair[1];
    }
  });

  const eggMeta = {
    egg1: {
      name:"Jajko Startowe",
      pets:{
        egg1_singer:["Kret Piosenkarz", UI_ICONS.microphone],
        egg1_miner:["Kret Gornik", UI_ICONS.pickaxe],
        egg1_gold:["Kret Sloneczny", UI_ICONS.star]
      }
    },
    egg2: {
      name:"Jajko Warsztatowe",
      pets:{
        egg1_gold:["Kret Sloneczny", UI_ICONS.star],
        egg2_mechanic:["Kret Mechanik", UI_ICONS.wrench],
        egg2_sailor:["Kret Marynarz", UI_ICONS.anchor]
      }
    },
    egg3: {
      name:"Jajko Gorskie",
      pets:{
        egg2_sailor:["Kret Marynarz", UI_ICONS.anchor],
        egg3_explorer:["Kret Odkrywca", UI_ICONS.compass],
        egg3_ninja:["Kret Ninja", UI_ICONS.ninja]
      }
    },
    egg4: {
      name:"Jajko Kosmiczne",
      pets:{
        egg3_ninja:["Kret Ninja", UI_ICONS.ninja],
        egg4_robot:["Kret Robot", UI_ICONS.robot],
        egg4_king:["Kret Krol", UI_ICONS.crown]
      }
    },
    egg5: {
      name:"Jajko Boskie",
      pets:{
        egg4_king:["Kret Krol", UI_ICONS.crown],
        egg5_wind:["Kret Blyskawica", UI_ICONS.lightning],
        egg5_star:["Kret Gwiazda", UI_ICONS.stars]
      }
    },
    egg6: {
      name:"Jajko Finalne",
      pets:{
        egg5_star:["Kret Gwiazda", UI_ICONS.stars],
        egg6_diamond:["Kret Diamentowy", UI_ICONS.diamondPet],
        egg6_cosmic:["Kret Kosmiczny", UI_ICONS.cosmic]
      }
    }
  };

  eggCatalog.forEach(egg=>{
    const data = eggMeta[egg.id];
    if(!data) return;
    egg.name = data.name;
    egg.pets.forEach(pet=>{
      const petData = data.pets[pet.id];
      if(petData){
        pet.name = petData[0];
        pet.icon = petData[1];
      }
    });
  });

  const crateMeta = {
    crate1:{name:"Skrzynia Skinow", icon:UI_ICONS.crate, skins:{skin_miner:"Kret Gornik", skin_singer:"Kret Piosenkarz"}},
    crate2:{name:"Skrzynia Skinow", icon:UI_ICONS.crate, skins:{skin_royal:"Kret Krolewski", skin_pirate:"Kret Pirat"}},
    crate3:{name:"Skrzynia Skinow", icon:UI_ICONS.crate, skins:{skin_astronaut:"Kret Nebula", skin_shadow:"Kret Void", skin_gold:"Kret Solarny"}}
  };
  crateCatalog.forEach(crate=>{
    const data = crateMeta[crate.id];
    if(!data) return;
    crate.name = data.name;
    crate.icon = data.icon;
    crate.skins.forEach(skin=>{
      if(data.skins[skin.id]) skin.name = data.skins[skin.id];
    });
  });

  const finalCrate = crateCatalog.find(crate=>crate.id === "crate3");
  if(finalCrate){
    finalCrate.cost = 650;
    finalCrate.tint = "linear-gradient(135deg,#67e8ff,#6d5bff 48%,#ffd45f)";
    finalCrate.skins.forEach(skin=>{
      if(skin.id === "skin_astronaut"){
        skin.rarity = "Mityczny";
        skin.weight = 9850;
        skin.accent = "#72e7ff";
      }
      if(skin.id === "skin_shadow"){
        skin.rarity = "Sekretny";
        skin.weight = 100;
        skin.accent = "#6b4dff";
      }
      if(skin.id === "skin_gold"){
        skin.rarity = "Sekretny";
        skin.weight = 50;
        skin.accent = "#ffd84d";
      }
    });
  }

  if(!eggCatalog.some(egg=>egg.id === "voidEgg1")){
    eggCatalog.push({
      id:"voidEgg1",
      name:"VOID Jajko Otchlani",
      cost:8e15,
      unlockRebirth:10,
      tint:"linear-gradient(135deg,#05020e,#5634ff 48%,#61f6ff)",
      voidEgg:true,
      pets:[
        {id:"void_echo", name:"Kret Echo VOID", icon:"◇", rarity:"Mityczny", weight:760, click:120, multi:1.6, color:"#4325a8"},
        {id:"void_oracle", name:"Kret Wyrocznia VOID", icon:"✦", rarity:"Legendarny", weight:220, click:180, multi:2.15, color:"#6b4dff"},
        {id:"void_abyss", name:"Kret Otchłani", icon:"✹", rarity:"Sekretny", weight:20, click:310, multi:3.1, color:"#0a0617", displayName:"VOID SECRET", chanceLabel:"1/50", secret:true}
      ]
    });
  }

  if(!eggCatalog.some(egg=>egg.id === "voidEgg2")){
    eggCatalog.push({
      id:"voidEgg2",
      name:"VOID Jajko Singularity",
      cost:1.2e18,
      unlockRebirth:10,
      tint:"conic-gradient(from 40deg,#03030b,#8a5cff,#64f7ff,#ff6ff5,#03030b)",
      voidEgg:true,
      pets:[
        {id:"void_abyss", name:"Kret Otchłani", icon:"✹", rarity:"Mityczny", weight:740, click:310, multi:3.1, color:"#0a0617"},
        {id:"void_singularity", name:"Kret Singularity", icon:"✺", rarity:"Legendarny", weight:240, click:520, multi:4.4, color:"#17113f"},
        {id:"void_overseer", name:"VOID Overlord", icon:"✧", rarity:"Sekretny", weight:20, click:900, multi:6.2, color:"#0c0318", displayName:"VOID SECRET II", chanceLabel:"1/50", secret:true}
      ]
    });
  }

  const egg6 = eggCatalog.find(egg=>egg.id === "egg6");
  if(egg6){
    egg6.name = "Jajko Galaktyczne";
    egg6.pets = [
      {id:"egg5_star", name:"Kret Gwiazda", icon:UI_ICONS.stars, rarity:"Pospolity", weight:2997, click:24, multi:0.55, color:"#b56cff"},
      {id:"egg6_nebula", name:"Kret Mgławicowy", icon:UI_ICONS.sparkle, rarity:"Epicki", weight:1997, click:28, multi:0.66, color:"#8ee7ff"},
      {id:"egg6_diamond", name:"Kret Diamentowy", icon:UI_ICONS.diamondPet, rarity:"Mityczny", weight:5, click:34, multi:0.82, color:"#64d3ff", displayName:"SECRET 1", chanceLabel:"1/1k", secret:true},
      {id:"egg6_cosmic", name:"Kret Kosmiczny", icon:UI_ICONS.cosmic, rarity:"Legendarny", weight:1, click:46, multi:1.15, color:"#6c7dff", displayName:"SECRET 2", chanceLabel:"1/5k", secret:true}
    ];
  }

  const egg7 = eggCatalog.find(egg=>egg.id === "voidEgg1");
  if(egg7){
    egg7.ultraUnlock = 1;
    egg7.pets = [
      {id:"void_echo", name:"Kret Echo VOID", icon:UI_ICONS.diamond, rarity:"Mityczny", weight:5000, click:120, multi:1.6, color:"#4325a8"},
      {id:"void_oracle", name:"Kret Wyrocznia VOID", icon:UI_ICONS.sparkle, rarity:"Legendarny", weight:1999, click:180, multi:2.15, color:"#6b4dff"},
      {id:"void_abyss", name:"Kret Otchłani", icon:UI_ICONS.black, rarity:"Sekretny", weight:1, click:390, multi:3.6, color:"#0a0617", displayName:"VOID SECRET", chanceLabel:"1/7k", secret:true}
    ];
  }

  const egg8 = eggCatalog.find(egg=>egg.id === "voidEgg2");
  if(egg8){
    egg8.ultraUnlock = 2;
    egg8.pets = [
      {id:"void_abyss", name:"Kret Otchłani", icon:UI_ICONS.black, rarity:"Mityczny", weight:37000, click:390, multi:3.6, color:"#0a0617"},
      {id:"void_singularity", name:"Kret Singularity", icon:UI_ICONS.galaxy, rarity:"Legendarny", weight:12994, click:560, multi:4.8, color:"#17113f"},
      {id:"void_overseer", name:"VOID Overlord", icon:UI_ICONS.sparkle, rarity:"Sekretny", weight:5, click:980, multi:6.8, color:"#0c0318", displayName:"VOID SECRET I", chanceLabel:"1/10k", secret:true},
      {id:"void_nullking", name:"Kret Król Nicości", icon:UI_ICONS.black, rarity:"Sekretny", weight:1, click:1450, multi:9.5, color:"#020106", displayName:"VOID SECRET II", chanceLabel:"1/50k", secret:true}
    ];
  }

  if(!crateCatalog.some(crate=>crate.id === "voidCrate")){
    crateCatalog.push({
      id:"voidCrate",
      name:"VOID Skrzynia Reliktow",
      cost:3200,
      unlockRebirth:10,
      tint:"conic-gradient(from 90deg,#080713,#5c35ff,#55ecff,#ff72e8,#080713)",
      icon:UI_ICONS.crate,
      voidCrate:true,
      skins:[
        {id:"skin_void_relic", name:"Kret Relikt VOID", skinClass:"skin-void-relic", rarity:"Mityczny", weight:9400, accent:"#6b4dff"},
        {id:"skin_void_eclipse", name:"Kret Zaćmienie", skinClass:"skin-void-eclipse", rarity:"Sekretny", weight:500, accent:"#16051f"},
        {id:"skin_void_crown", name:"VOID Korona", skinClass:"skin-void-crown", rarity:"Sekretny", weight:100, accent:"#8ff6ff"}
      ]
    });
  }

  holdHint.textContent = "Przytrzymaj, zeby nabijac punkty.";
  autoHint.textContent = "Autoclick dziala sam i moze znalezc diamenty.";
  diamondClickHint.textContent = "Aktywuje sie automatycznie po zakupie.";
  hatchPhaseLabel.textContent = "JAJKO SIE OTWIERA";
  document.querySelector("#cratePanel .slideHeader span").textContent = "Skiny sa kosmetyczne i zmieniaja tylko wyglad glownego kreta.";
  document.querySelector("#petPanel .slideHeader span").textContent = "Wybierz aktywne pety i skiny.";
  document.querySelector("#diamondPanel .slideHeader span").textContent = "Meta ulepszenia sa trwale, nie resetuja sie i nie usuwaja przy rebirthie.";
}

normalizeGameText();

[
  {id:"diamondChance", name:"SZANSA NA DIAMENTY", desc:"Lekko wzmacnia aktualna szanse na drop diamentow.", base:180, scale:4.2, max:3},
  {id:"autoPetXp", name:"AUTOCLICK NABIJA XP", desc:"Autoclick daje XP zalozonym petom: najpierw 30%, potem 70% normalnego kliku.", base:650, scale:4.5, max:2, category:"pety"},
  {id:"ultraKeepPets", name:"+1 PET PO ULTRA RDZENIU", desc:"Pozwala zabrac dodatkowego zwyklego peta przez Ultra Rdzen.", base:5200, scale:3.4, max:2}
].forEach(def=>{
  if(!diamondUpgradeCatalog.some(item=>item.id === def.id)){
    diamondUpgradeCatalog.push(def);
  }
});
for(let i = diamondUpgradeCatalog.length - 1; i >= 0; i--){
  if(diamondUpgradeCatalog[i]?.id === "keepPetsRebirth"){
    diamondUpgradeCatalog.splice(i, 1);
  }
}

Object.assign(upgradeInfoMap, {
  diamondChance:"Mnozy aktualna szanse dropu diamentow o 1%, 5% albo 10%.",
  autoPetXp:"Po pierwszym zakupie autoclick daje 30% XP peta z normalnego klikniecia. Drugi poziom zwieksza to do 70%.",
  ultraKeepPets:"Zwieksza limit zwyklych petow, ktore mozesz zabrac po Ultra Rdzeniu."
});

function formatPoint(n){
  return `${pointIcons[Math.min(game.rebirths, pointIcons.length - 1)]} ${format(n)}`;
}

function formatDiamond(n){
  return `${UI_ICONS.diamond} ${format(n)}`;
}

function getDiamondChanceUpgradeMultiplier(){
  return [1, 1.01, 1.05, 1.10][Math.min(getMetaLevel("diamondChance"), 3)];
}

function keepsPetsAfterRebirth(){
  return true;
}

function getUltraKeepPetLimit(){
  return 2 + Math.min(2, getMetaLevel("ultraKeepPets"));
}

function getRebirthDiamondReward(level){
  return Math.max(1, Math.floor(1 + level * 0.7 + Math.pow(level, 1.15) * 0.55));
}

function getDiamondChance(source="click"){
  const progress = Math.min(game.rebirths, REBIRTH_LIMIT) / REBIRTH_LIMIT;
  const clickChance = 0.0001 + (0.01 - 0.0001) * progress;
  const sourceChance = source === "auto" ? clickChance * 0.35 : clickChance;
  return sourceChance * getDiamondChanceUpgradeMultiplier() * getEndlessDiamondChanceMultiplier() * getGlobalEventMultiplier("diamonds") * getActivePotionMultiplier("diamonds") * getEnchantDiamondDropMultiplier() * getWeatherMultiplier("diamonds");
}

const POTION_TYPES = {
  luck:{id:"luck", label:"Luck", icon:"🍀", color:"#7dff8f"},
  money:{id:"money", label:"Coins", icon:"🪙", color:"#ffd15f"},
  diamonds:{id:"diamonds", label:"Diamenty", icon:"💎", color:"#62dcff"}
};

const POTION_TIERS = {
  1:{tier:1, roman:"I", mult:2, durationMs:5 * 60 * 1000, weight:500},
  2:{tier:2, roman:"II", mult:3, durationMs:10 * 60 * 1000, weight:100},
  3:{tier:3, roman:"III", mult:5, durationMs:15 * 60 * 1000, weight:8}
};

POTION_TYPES.petXp = {id:"petXp", label:"Pet XP", icon:"XP", color:"#f7fbff"};

const ENCHANT_TIERS = {
  1:{tier:1, roman:"I", power:1, weight:80},
  2:{tier:2, roman:"II", power:1.75, weight:16},
  3:{tier:3, roman:"III", power:3, weight:3}
};

const ENCHANT_CATALOG = {
  hatch:{id:"hatch", name:"Szybkie Jajka", icon:"⚡", color:"#69e8ff", effect:"hatchSpeed", base:0.04, desc:"Szybsze otwieranie jajek."},
  luck:{id:"luck", name:"Koniczynowa Ksiega", icon:"☘", color:"#75ff91", effect:"luck", base:0.025, desc:"Wiekszy luck."},
  coins:{id:"coins", name:"Ksiega Monet", icon:"¤", color:"#ffd15f", effect:"coins", base:0.035, desc:"Wiekszy zarobek coinsow."},
  variants:{id:"variants", name:"Ksiega Wariantow", icon:"✦", color:"#ff8df3", effect:"variants", base:0.017, desc:"Wieksze szanse na shiny/gold/diamond."},
  eggPlus:{id:"eggPlus", name:"Exclusive: +1 Jajko", icon:"+1", color:"#d8fbff", effect:"eggBatch", base:1, exclusive:true, desc:"Stale +1 jajko do otwierania."},
  variantPlus:{id:"variantPlus", name:"Exclusive: +10% Wariantow", icon:"✦", color:"#ffb1f6", effect:"variants", base:0.10, exclusive:true, desc:"+10% do szans wariantow petow."},
  diamondDrop:{id:"diamondDrop", name:"Exclusive: Diamentowy Drop x2", icon:"◇", color:"#72ecff", effect:"diamondDrop", base:2, exclusive:true, desc:"x2 drop diamentow."},
  itemDrop:{id:"itemDrop", name:"Exclusive: Item Drop x2", icon:"🎁", color:"#ffd36d", effect:"itemDrop", base:2, exclusive:true, desc:"x2 drop itemow."}
};

Object.assign(ENCHANT_CATALOG.hatch, {icon:"SPD"});
Object.assign(ENCHANT_CATALOG.luck, {icon:"LCK"});
Object.assign(ENCHANT_CATALOG.coins, {icon:"COIN"});
Object.assign(ENCHANT_CATALOG.variants, {icon:"VAR"});
Object.assign(ENCHANT_CATALOG.variantPlus, {icon:"VAR+"});
Object.assign(ENCHANT_CATALOG.diamondDrop, {icon:"DIA"});
Object.assign(ENCHANT_CATALOG.itemDrop, {icon:"DROP"});

ENCHANT_CATALOG.petXp = {id:"petXp", name:"Ksiega Tresury", icon:"XP", color:"#f7fbff", effect:"petXp", base:0.04, desc:"Pety szybciej zdobywaja XP."};

const PET_MAX_LEVEL = 100;
const PET_MAX_XP = 1000000;
const PET_XP_CURVE_POWER = 2.35;

const PET_FRUIT_CATALOG = {
  berry:{id:"berry", kind:"fruit", name:"Bialy Owoc", icon:"&#127827;", color:"#f7fbff", xp:100, rarity:"Zwykly"},
  apple:{id:"apple", kind:"fruit", name:"Srebrne Jablko", icon:"&#127822;", color:"#dce7ff", xp:500, rarity:"Niepospolity"},
  pear:{id:"pear", kind:"fruit", name:"Krysztalowa Gruszka", icon:"&#127824;", color:"#aef6ff", xp:1500, rarity:"Rzadki"},
  melon:{id:"melon", kind:"fruit", name:"Zloty Arbuz", icon:"&#127817;", color:"#ffe27a", xp:4000, rarity:"Epicki"},
  star:{id:"star", kind:"fruit", name:"Gwiezdny Owoc", icon:"&#11088;", color:"#ffec8b", xp:10000, rarity:"Legendarny"},
  fish_small:{id:"fish_small", kind:"fish", name:"Mala Ryba XP", icon:"&#128031;", color:"#8fe6ff", xp:1000, rarity:"Rzadka"},
  fish_deep:{id:"fish_deep", kind:"fish", name:"Glebinska Ryba", icon:"&#128032;", color:"#5aa8ff", xp:5000, rarity:"Bardzo rzadka"},
  fish_ancient:{id:"fish_ancient", kind:"fish", name:"Starozytna Ryba", icon:"&#128033;", color:"#fff0a8", levelUp:true, rarity:"Ultra rzadka"}
};

function normalizePetLevelState(pet){
  if(!pet) return pet;
  pet.level = Math.max(1, Math.min(PET_MAX_LEVEL, Math.floor(Number(pet.level) || 1)));
  pet.xp = Math.max(0, Math.min(PET_MAX_XP, Math.floor(Number(pet.xp) || 0)));
  return pet;
}

function getPetLevelTotalXp(level){
  const safeLevel = Math.max(1, Math.min(PET_MAX_LEVEL, Math.floor(Number(level) || 1)));
  if(safeLevel <= 1) return 0;
  if(safeLevel >= PET_MAX_LEVEL) return PET_MAX_XP;
  return Math.floor(PET_MAX_XP * Math.pow((safeLevel - 1) / (PET_MAX_LEVEL - 1), PET_XP_CURVE_POWER));
}

function syncPetLevelFromXp(pet){
  normalizePetLevelState(pet);
  while(pet.level < PET_MAX_LEVEL && pet.xp >= getPetLevelTotalXp(pet.level + 1)) pet.level++;
  return pet.level;
}

function getPetLevel(pet){
  syncPetLevelFromXp(pet);
  return pet?.level || 1;
}

function getPetLevelMultiplier(pet){
  return Math.min(2, 1 + (getPetLevel(pet) - 1) / (PET_MAX_LEVEL - 1));
}

function getPetLevelBonusPercent(pet){
  return Math.round((getPetLevelMultiplier(pet) - 1) * 100);
}

function formatPetXp(value){
  return formatPoint(Math.max(0, Math.floor(Number(value) || 0)));
}

function getPetLevelProgress(pet){
  normalizePetLevelState(pet);
  syncPetLevelFromXp(pet);
  if(pet.level >= PET_MAX_LEVEL) return {current:PET_MAX_XP, needed:PET_MAX_XP, percent:100, maxed:true};
  const start = getPetLevelTotalXp(pet.level);
  const end = getPetLevelTotalXp(pet.level + 1);
  const current = Math.max(0, pet.xp - start);
  const needed = Math.max(1, end - start);
  return {current, needed, percent:Math.max(0, Math.min(100, current / needed * 100)), maxed:false};
}

function getPetLevelSummary(pet){
  return `LEVEL ${getPetLevel(pet)} - +${getPetLevelBonusPercent(pet)}% statow!`;
}

function getPetLevelProgressHtml(pet){
  const progress = getPetLevelProgress(pet);
  const label = progress.maxed ? "MAX XP" : `${formatPetXp(progress.current)}/${formatPetXp(progress.needed)} xp`;
  return `<div class="petLevelBlock"><span>${getPetLevelSummary(pet)}</span><div class="petLevelBar"><i style="width:${progress.percent.toFixed(1)}%"></i><em>${label}</em></div></div>`;
}

function getActivePetXpPotionMultiplier(){
  cleanupActivePotions();
  const active = (Array.isArray(game.activePotions) ? game.activePotions : [])
    .filter(potion=>potion.type === "petXp" && potion.endsAt > Date.now())
    .sort((a,b)=>(b.tier || 1) - (a.tier || 1))[0];
  const tier = Math.max(0, Math.min(3, Number(active?.tier) || 0));
  return [1, 1.08, 1.18, 1.30][tier] || 1;
}

function getPetXpBoostMultiplier(){
  const enchantBonus = Math.max(0, getEnchantEffectTotal("petXp"));
  const normalBoost = Math.min(1.67, getActivePetXpPotionMultiplier() * (1 + enchantBonus));
  return normalBoost * getGlobalEventMultiplier("petXp");
}

function getAutoPetXpRatio(){
  const level = Math.max(0, getMetaLevel("autoPetXp"));
  if(level <= 0) return 0;
  return level >= 2 ? 0.70 : 0.30;
}

function getPetXpFromClickSource(source="click"){
  if(source === "auto") return 100 * getAutoPetXpRatio();
  return 100;
}

function addPetXpToPet(pet, amount, options={}){
  normalizePetLevelState(pet);
  if(!pet || (pet.level >= PET_MAX_LEVEL && !options.forceLevel)) return 0;
  if(options.forceLevel){
    if(pet.level >= PET_MAX_LEVEL) return 0;
    pet.level++;
    pet.xp = Math.max(pet.xp || 0, getPetLevelTotalXp(pet.level));
    return 1;
  }
  const gained = Math.max(0, Math.floor(Number(amount) || 0));
  if(!gained) return 0;
  pet.xp = Math.min(PET_MAX_XP, (pet.xp || 0) + gained);
  const before = pet.level;
  syncPetLevelFromXp(pet);
  return pet.level - before;
}

function awardPetXpFromClick(source="click"){
  const base = getPetXpFromClickSource(source);
  if(base <= 0) return;
  const active = getActivePets();
  if(!active.length) return;
  const gained = Math.max(1, Math.floor(base * getPetXpBoostMultiplier()));
  let leveled = 0;
  active.forEach(pet=>{ leveled += addPetXpToPet(pet, gained); });
  if(leveled > 0) spawnPopup(`PET LEVEL +${leveled}`, false, false, true);
}

function makeFruitInstance(id){
  const def = PET_FRUIT_CATALOG[id] || PET_FRUIT_CATALOG.berry;
  return {uid:`fruit_${game.fruitSeq++}`, id:def.id, kind:def.kind};
}

function addPetFruit(id, amount=1){
  const def = PET_FRUIT_CATALOG[id];
  if(!def) return;
  const count = Math.max(1, Math.floor(Number(amount) || 1));
  for(let i = 0; i < count; i++) game.fruits.push(makeFruitInstance(id));
  trackExist("items", `${def.kind}_${def.id}`, count);
  showItemDropTile(def.kind, {icon:def.icon, color:def.color, name:def.name, amount:count});
}

function getFruitGroups(){
  const groups = new Map();
  (Array.isArray(game.fruits) ? game.fruits : []).forEach(item=>{
    const def = PET_FRUIT_CATALOG[item.id];
    if(!def) return;
    const group = groups.get(def.id) || {key:def.id, def, items:[]};
    group.items.push(item);
    groups.set(def.id, group);
  });
  return Array.from(groups.values()).sort((a,b)=>{
    if(a.def.kind !== b.def.kind) return a.def.kind === "fish" ? 1 : -1;
    return (b.def.xp || 999999) - (a.def.xp || 999999);
  });
}

function useFruitOnPet(fruitId, petUid){
  const def = PET_FRUIT_CATALOG[fruitId];
  const pet = getOwnedPets().find(item=>item.uid === petUid);
  const fruit = (Array.isArray(game.fruits) ? game.fruits : []).find(item=>item.id === fruitId);
  if(!def || !pet || !fruit) return;
  game.fruits = game.fruits.filter(item=>item.uid !== fruit.uid);
  trackExist("items", `${def.kind}_${def.id}`, -1);
  if(def.levelUp){
    const gained = addPetXpToPet(pet, 0, {forceLevel:true});
    spawnPopup(gained ? `${def.name}: LEVEL +1` : "Pet ma juz MAX!", false, false, true);
  }else{
    const levelUps = addPetXpToPet(pet, def.xp || 0);
    spawnPopup(`${def.name}: +${formatPetXp(def.xp)} XP${levelUps ? `, LEVEL +${levelUps}` : ""}`, false, false, true);
  }
  game.uiDirty = true;
  update(true, true);
}

function updateFeatureUnlocks(){
  game.featureUnlocks = game.featureUnlocks && typeof game.featureUnlocks === "object" ? game.featureUnlocks : {};
  if(game.rebirths >= 2) game.featureUnlocks.potions = true;
  if(game.rebirths >= 3) game.featureUnlocks.goldenPets = true;
  if(game.rebirths >= 5) game.featureUnlocks.diamondPets = true;
  if(game.rebirths >= 6) game.featureUnlocks.enchants = true;
}

function hasPotionFeature(){ updateFeatureUnlocks(); return !!game.featureUnlocks.potions; }
function hasGoldenPetFeature(){ updateFeatureUnlocks(); return !!game.featureUnlocks.goldenPets; }
function hasDiamondPetFeature(){ updateFeatureUnlocks(); return !!game.featureUnlocks.diamondPets; }
function hasEnchantFeature(){ updateFeatureUnlocks(); return !!game.featureUnlocks.enchants; }

const BAG_CATALOG = {
  weak:{
    id:"weak",
    name:"Slaba sakiewka",
    icon:"👝",
    color:"#9cc7ff",
    rarity:"Zwykla",
    rewards:[
      {label:"5 diamentow", chance:60, type:"diamonds", amount:5},
      {label:"Mikstura tier I", chance:30, type:"potion", tier:1},
      {label:"12 diamentow", chance:10, type:"diamonds", amount:12}
    ]
  },
  medium:{
    id:"medium",
    name:"Srednia sakiewka",
    icon:"🎒",
    color:"#b889ff",
    rarity:"Rzadka",
    rewards:[
      {label:"15 diamentow", chance:40, type:"diamonds", amount:15},
      {label:"2x Mikstura tier I", chance:25, type:"potion", tier:1, amount:2},
      {label:"Mikstura tier II", chance:18, type:"potion", tier:2},
      {label:"Slaba sakiewka", chance:12, type:"bag", bag:"weak"},
      {label:"35 diamentow", chance:5, type:"diamonds", amount:35}
    ]
  },
  best:{
    id:"best",
    name:"Najlepsza sakiewka",
    icon:"💰",
    color:"#ffd35c",
    rarity:"Premium",
    rewards:[
      {label:"35 diamentow", chance:30, type:"diamonds", amount:35},
      {label:"Mikstura tier II", chance:20, type:"potion", tier:2},
      {label:"50 diamentow", chance:15, type:"diamonds", amount:50},
      {label:"Srednia sakiewka", chance:12, type:"bag", bag:"medium"},
      {label:"2x Mikstura tier II", chance:10, type:"potion", tier:2, amount:2},
      {label:"Mikstura Luck tier III", chance:5, type:"potion", tier:3, potionType:"luck"},
      {label:"Mikstura Coins tier III", chance:4, type:"potion", tier:3, potionType:"money"},
      {label:"Mikstura Diamenty tier III", chance:2, type:"potion", tier:3, potionType:"diamonds"},
      {label:"100 diamentow", chance:1.5, type:"diamonds", amount:100},
      {label:"Najlepsza sakiewka", chance:0.5, type:"bag", bag:"best"}
    ]
  }
};
BAG_CATALOG.water = {
  id:"water",
  name:"Wodna sakiewka",
  icon:"&#127754;",
  color:"#62d8ff",
  rarity:"Eventowa",
  rewards:[
    {label:"10 diamentow", chance:42, type:"diamonds", amount:10},
    {label:"Mikstura tier I", chance:25, type:"potion", tier:1},
    {label:"Enchant tier I", chance:16, type:"enchant", tier:1},
    {label:"Srednia sakiewka", chance:16.5, type:"bag", bag:"medium"},
    {label:"Wodne jajko", chance:0.5, type:"inventoryEgg", eggId:"water_event_egg"}
  ]
};
BAG_CATALOG.tornado = {
  id:"tornado",
  name:"Sakiewka Tornada",
  icon:"&#127786;",
  color:"#cfe7f2",
  rarity:"Eventowa",
  rewards:[
    {label:"25 diamentow", chance:39, type:"diamonds", amount:25},
    {label:"Mikstura tier II", chance:24, type:"potion", tier:2},
    {label:"Enchant tier I", chance:18, type:"enchant", tier:1},
    {label:"Najlepsza sakiewka", chance:18, type:"bag", bag:"best"},
    {label:"Tornado Kret", chance:1, type:"weatherPet", petType:"tornado"}
  ]
};

BAG_CATALOG.weak.rewards.splice(1, 0, {label:"Enchant tier I", chance:2, type:"enchant", tier:1});
BAG_CATALOG.medium.rewards.splice(3, 0, {label:"Enchant tier I", chance:2, type:"enchant", tier:1});
BAG_CATALOG.best.rewards.splice(8, 0, {label:"Enchant tier II", chance:1, type:"enchant", tier:2});
BAG_CATALOG.weak.rewards.push({label:"Bialy Owoc", chance:1.2, type:"fruit", fruit:"berry"});
BAG_CATALOG.weak.rewards.push({label:"Srebrne Jablko", chance:0.25, type:"fruit", fruit:"apple"});
BAG_CATALOG.medium.rewards.push({label:"Bialy Owoc", chance:1.8, type:"fruit", fruit:"berry"});
BAG_CATALOG.medium.rewards.push({label:"Krysztalowa Gruszka", chance:0.35, type:"fruit", fruit:"pear"});
BAG_CATALOG.best.rewards.push({label:"Srebrne Jablko", chance:1.6, type:"fruit", fruit:"apple"});
BAG_CATALOG.best.rewards.push({label:"Zloty Arbuz", chance:0.25, type:"fruit", fruit:"melon"});
BAG_CATALOG.best.rewards.push({label:"Gwiezdny Owoc", chance:0.03, type:"fruit", fruit:"star"});
BAG_CATALOG.water.rewards.push({label:"Mala Ryba XP", chance:0.5, type:"fruit", fruit:"fish_small"});
BAG_CATALOG.tornado.rewards.push({label:"Krysztalowa Gruszka", chance:0.35, type:"fruit", fruit:"pear"});

const FREE_REWARDS_OLD = [
  {time:60, icon:"🪙", title:"Monety", desc:"Startowy zastrzyk monet", type:"coins", amount:45},
  {time:180, icon:"💎", title:"Diamenty", desc:"Kilka diamentow", type:"diamonds", amount:5},
  {time:300, icon:"🧪", title:"Mikstura", desc:"Losowa mikstura tier I", type:"potion", tier:1},
  {time:600, icon:"🎒", title:"Sakiewka", desc:"Slaba sakiewka", type:"bag", bag:"weak"},
  {time:900, icon:"🪙", title:"Wieksze monety", desc:"Bonus monet", type:"coins", amount:180},
  {time:1200, icon:"💎", title:"Diamenty", desc:"Paczka diamentow", type:"diamonds", amount:12},
  {time:1800, icon:"🍀", title:"Luck boost", desc:"Luck x2 na 5 min", type:"boost", boost:"luck", tier:1},
  {time:2400, icon:"🧪", title:"Mikstura II", desc:"Losowa mikstura tier II", type:"potion", tier:2},
  {time:3000, icon:"🎒", title:"Sakiewka", desc:"Srednia sakiewka", type:"bag", bag:"medium"},
  {time:3600, icon:"💎", title:"Duza paczka", desc:"Wieksza paczka diamentow", type:"diamonds", amount:25},
  {time:4500, icon:"⚡", title:"Coins boost", desc:"Coins x3 na 10 min", type:"boost", boost:"money", tier:2},
  {time:5400, icon:"💰", title:"Finalny prezent", desc:"Najlepsza sakiewka", type:"bag", bag:"best"}
];
const FREE_REWARDS = [
  {time:60, icon:"🎁", title:"Prezent I", luck:1, rewards:[{label:"Monety", chance:58, type:"coins", amount:45}, {label:"1 diament", chance:28, type:"diamonds", amount:1}, {label:"Mikstura I", chance:14, type:"potion", tier:1}]},
  {time:180, icon:"🎁", title:"Prezent II", luck:1.2, rewards:[{label:"Monety+", chance:50, type:"coins", amount:75}, {label:"2 diamenty", chance:30, type:"diamonds", amount:2}, {label:"Mikstura I", chance:20, type:"potion", tier:1}]},
  {time:300, icon:"🎁", title:"Prezent III", luck:1.5, rewards:[{label:"Diamenty", chance:45, type:"diamonds", amount:3}, {label:"Mikstura I", chance:35, type:"potion", tier:1}, {label:"Slaba sakiewka", chance:20, type:"bag", bag:"weak"}]},
  {time:600, icon:"🎁", title:"Prezent IV", luck:2, rewards:[{label:"Monety", chance:42, type:"coins", amount:130}, {label:"Slaba sakiewka", chance:28, type:"bag", bag:"weak"}, {label:"Luck x2", chance:30, type:"boost", boost:"luck", tier:1}]},
  {time:900, icon:"🎁", title:"Prezent V", luck:2.5, rewards:[{label:"Diamenty", chance:42, type:"diamonds", amount:5}, {label:"Mikstura I", chance:38, type:"potion", tier:1}, {label:"Mikstura II", chance:20, type:"potion", tier:2, rare:true}]},
  {time:1200, icon:"🎁", title:"Prezent VI", luck:3, rewards:[{label:"Monety++", chance:44, type:"coins", amount:220}, {label:"Sakiewka", chance:34, type:"bag", bag:"weak"}, {label:"Coins x2", chance:22, type:"boost", boost:"money", tier:1}]},
  {time:1800, icon:"🎁", title:"Prezent VII", luck:4, rewards:[{label:"Diamenty+", chance:45, type:"diamonds", amount:8}, {label:"Mikstura II", chance:25, type:"potion", tier:2, rare:true}, {label:"Srednia sakiewka", chance:30, type:"bag", bag:"medium", rare:true}]},
  {time:2400, icon:"🎁", title:"Prezent VIII", luck:5, rewards:[{label:"Monety", chance:36, type:"coins", amount:320}, {label:"Diamenty", chance:34, type:"diamonds", amount:10}, {label:"Luck x3", chance:30, type:"boost", boost:"luck", tier:2, rare:true}]},
  {time:3000, icon:"🎁", title:"Prezent IX", luck:7, rewards:[{label:"Srednia sakiewka", chance:42, type:"bag", bag:"medium", rare:true}, {label:"Mikstura II", chance:38, type:"potion", tier:2, rare:true}, {label:"Diamenty++", chance:20, type:"diamonds", amount:15}]},
  {time:3600, icon:"🎁", title:"Prezent X", luck:10, rewards:[{label:"Diamenty", chance:38, type:"diamonds", amount:20}, {label:"Coins x3", chance:32, type:"boost", boost:"money", tier:2, rare:true}, {label:"Najlepsza sakiewka", chance:30, type:"bag", bag:"best", rare:true}]},
  {time:4500, icon:"🎁", title:"Prezent XI", luck:14, rewards:[{label:"Srednia sakiewka", chance:36, type:"bag", bag:"medium", rare:true}, {label:"Mikstura III", chance:24, type:"potion", tier:3, rare:true}, {label:"Diamenty duze", chance:40, type:"diamonds", amount:25}]},
  {time:5400, icon:"🎁", title:"Prezent XII", luck:20, rewards:[{label:"Najlepsza sakiewka", chance:45, type:"bag", bag:"best", rare:true}, {label:"Mikstura III", chance:25, type:"potion", tier:3, rare:true}, {label:"40 diamentow", chance:30, type:"diamonds", amount:40, rare:true}]}
];
const CHRONO_EXCLUSIVE_BASE_CHANCE = 0.00001;
const EXCLUSIVE_ENCHANT_BASE_CHANCE = 0.0001;
const FREE_REWARD_POOL = [
  {label:"Zegarowy Kret", icon:"⏳", chance:CHRONO_EXCLUSIVE_BASE_CHANCE, type:"exclusive", rarity:"exclusive", specialChance:true, rare:true},
  {label:"Najlepsza sakiewka", icon:"💰", chance:0.9, type:"bag", bag:"best", rarity:"mythic", rare:true},
  {label:"Mikstura tier III", icon:"🧪", chance:1.4, type:"potion", tier:3, rarity:"legendary", rare:true},
  {label:"Coins x3", icon:"⚡", chance:2.4, type:"boost", boost:"money", tier:2, rarity:"epic", rare:true},
  {label:"Luck x3", icon:"🍀", chance:2.4, type:"boost", boost:"luck", tier:2, rarity:"epic", rare:true},
  {label:"Srednia sakiewka", icon:"🎒", chance:5.5, type:"bag", bag:"medium", rarity:"epic", rare:true},
  {label:"Mikstura tier II", icon:"🧪", chance:8, type:"potion", tier:2, rarity:"rare", rare:true},
  {label:"40 diamentow", icon:"??", chance:8.5, type:"diamonds", amount:40, rarity:"rare"},
  {label:"Slaba sakiewka", icon:"🎒", chance:11, type:"bag", bag:"weak", rarity:"uncommon"},
  {label:"Mikstura tier I", icon:"🧪", chance:15, type:"potion", tier:1, rarity:"uncommon"},
  {label:"15 diamentow", icon:"??", chance:17, type:"diamonds", amount:15, rarity:"common"},
  {label:"Monety", icon:"🪙", chance:28, type:"coins", amount:260, rarity:"common"}
];

FREE_REWARD_POOL.push({label:"Enchant tier I", icon:"BOOK", chance:4.5, type:"enchant", tier:1, rarity:"epic", rare:true});
FREE_REWARD_POOL.push({label:"Exclusive Enchant", icon:"EX+", chance:EXCLUSIVE_ENCHANT_BASE_CHANCE, type:"exclusiveEnchant", enchantType:"eggPlus", rarity:"exclusive", specialChance:true, rare:true});

function getFreeRewardsState(){
  const today = getWarsawDayNumber();
  game.freeRewards = game.freeRewards && typeof game.freeRewards === "object" ? game.freeRewards : {};
  if(Number(game.freeRewards.day) !== today){
    game.freeRewards = {day:today, playSeconds:0, claimed:{}};
    game.uiDirty = true;
  }
  game.freeRewards.claimed = game.freeRewards.claimed && typeof game.freeRewards.claimed === "object" ? game.freeRewards.claimed : {};
  game.freeRewards.claimedRewards = game.freeRewards.claimedRewards && typeof game.freeRewards.claimedRewards === "object" ? game.freeRewards.claimedRewards : {};
  game.freeRewards.playSeconds = Math.max(0, Math.floor(Number(game.freeRewards.playSeconds) || 0));
  return game.freeRewards;
}

function formatFreeRewardTime(seconds){
  const left = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(left / 60);
  const secs = left % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function getFreeRewardCoinAmount(multiplier){
  return Math.max(1000, Math.floor(getAllClickablePower() * multiplier));
}

function getBestPetForChronoScaling(){
  const pets = getOwnedPets();
  if(!pets.length){
    return {click:25, multi:0.35, diamond:0.06, powerRank:0};
  }
  return pets.slice().sort((a, b)=>(b.powerRank || getPetPowerRank(b)) - (a.powerRank || getPetPowerRank(a)))[0];
}

function addChronoExclusiveReward(){
  const best = getBestPetForChronoScaling();
  const click = +(Math.max(1, Number(best.click) || 1) * 1.5).toFixed(3);
  const multi = +(Math.max(0.01, Number(best.multi) || 0.01) * 1.5).toFixed(4);
  const diamond = +(Math.max(0.01, getPetDiamondBonusValue(best)) * 1.5).toFixed(4);
  const pet = {
    uid:`pet_${game.petSeq++}`,
    templateId:"exclusive_chrono_mole",
    eggId:"free_rewards",
    name:"Zegarowy Kret",
    displayName:"Zegarowy Kret",
    baseName:"Zegarowy Kret",
    templateName:"Zegarowy Kret",
    icon:"⏳",
    rarity:"Exclusive",
    baseClick:click,
    baseMulti:multi,
    baseDiamond:diamond,
    click,
    multi,
    diamond,
    color:"#ffd66e",
    sourceEgg:"Free Rewards",
    secret:true,
    exclusive:true,
    variant:"normal",
    shiny:false,
    variantKey:"exclusive_chrono_mole:normal",
    aura:"chrono"
  };
  pet.powerRank = getPetPowerRank(pet);
  game.pets.push(pet);
  trackExist("pets", pet.templateId);

  game.skins = Array.isArray(game.skins) ? game.skins : [];
  if(!game.skins.some(skin=>skin.templateId === "skin_chrono_mole")){
    game.skins.push({
      uid:`skin_${game.skinSeq++}`,
      templateId:"skin_chrono_mole",
      crateId:"free_rewards",
      name:"Skin Zegarowego Kreta",
      displayName:"Skin Zegarowego Kreta",
      skinClass:"skin-chrono",
      rarity:"Exclusive",
      accent:"#ffd66e",
      sourceCrate:"Free Rewards",
      aura:"Chrono aura",
      powerRank:99999
    });
    trackExist("skins", "skin_chrono_mole");
  }
  if(typeof triggerScreenEffect === "function"){
    triggerScreenEffect("rare", "EXCLUSIVE DROP");
  }
  spawnPopup("EXCLUSIVE: Zegarowy Kret!", false, false, true);
}

function applyFreeReward(reward){
  if(reward.type === "exclusive"){
    addChronoExclusiveReward();
    return;
  }
  if(reward.type === "exclusiveEnchant"){
    addEnchantToInventory(reward.enchantType || "eggPlus", 1, 1);
    spawnPopup("EXCLUSIVE ENCHANT!", false, false, true);
    return;
  }
  if(reward.type === "coins"){
    const amount = getFreeRewardCoinAmount(reward.amount || 60);
    game.score += amount;
    spawnPopup(`+${formatPoint(amount)}`, false, false, true);
    return;
  }
  if(reward.type === "diamonds"){
    game.diamonds = (game.diamonds || 0) + (reward.amount || 1);
    spawnPopup(`+${formatDiamond(reward.amount || 1)}`, false, false, true);
    return;
  }
  if(reward.type === "potion"){
    const typeId = reward.potionType || getRandomPotionTypeId();
    game.potions.push(makePotionInstance(typeId, reward.tier || 1));
    return;
  }
  if(reward.type === "bag"){
    addBagToInventory(reward.bag || "weak", 1);
    return;
  }
  if(reward.type === "enchant"){
    if(!hasEnchantFeature()){
      game.diamonds = (game.diamonds || 0) + 5;
      spawnPopup("+5 diamentow", false, false, true);
      return;
    }
    addEnchantToInventory(reward.enchantType || rollEnchantType().id, reward.tier || 1, 1);
    return;
  }
  if(reward.type === "boost"){
    const type = POTION_TYPES[reward.boost || "money"] || POTION_TYPES.money;
    const tier = POTION_TIERS[reward.tier || 1] || POTION_TIERS[1];
    addActivePotionBuff(type.id, tier.tier, tier.durationMs);
    spawnPopup(`${type.label} x${tier.mult}!`, false, false, true);
  }
}

function getFreeRewardExclusiveChance(gift){
  return CHRONO_EXCLUSIVE_BASE_CHANCE * Math.max(1, Number(gift?.luck) || 1);
}

function getFreeRewardExclusiveEnchantChance(gift){
  return EXCLUSIVE_ENCHANT_BASE_CHANCE * Math.max(1, Number(gift?.luck) || 1);
}

function rollFreeReward(gift){
  if(Math.random() < getFreeRewardExclusiveChance(gift)){
    return {label:"Zegarowy Kret", type:"exclusive", rare:true};
  }
  if(Math.random() < getFreeRewardExclusiveEnchantChance(gift)){
    const options = ["eggPlus","variantPlus","diamondDrop","itemDrop"];
    return {label:"Exclusive Enchant", type:"exclusiveEnchant", enchantType:options[Math.floor(Math.random() * options.length)], rare:true};
  }
  const rewards = FREE_REWARD_POOL.filter(reward=>!reward.specialChance);
  const luck = Math.max(1, Number(gift?.luck) || 1);
  const weighted = rewards.map(reward=>({
    reward,
    weight:(Number(reward.chance) || 0) * (reward.rare ? Math.sqrt(luck) : 1)
  }));
  const total = weighted.reduce((sum, item)=>sum + item.weight, 0);
  let roll = Math.random() * Math.max(1, total);
  for(const item of weighted){
    roll -= item.weight;
    if(roll <= 0) return item.reward;
  }
  return rewards[0] || {type:"coins", amount:30, label:"Monety"};
}

function getFreeRewardVisual(reward){
  if(reward.type === "diamonds") return "💎";
  if(reward.type === "enchant" || reward.type === "exclusiveEnchant"){
    return `<span class="miniRewardBook">${reward.type === "exclusiveEnchant" ? "EX" : "I"}</span>`;
  }
  return reward.icon || "?";
}

function getFreeRewardOddsTitle(reward){
  if(reward.type === "enchant"){
    return Object.values(ENCHANT_CATALOG)
      .filter(def=>!def.exclusive)
      .map(def=>`${def.name}: równa szansa`)
      .join("\n");
  }
  if(reward.type === "exclusiveEnchant"){
    return ["eggPlus","variantPlus","diamondDrop","itemDrop"]
      .map(id=>`${ENCHANT_CATALOG[id].name}: równa szansa`)
      .join("\n");
  }
  return reward.label || "";
}

function getSortedFreeRewardPool(){
  return [...FREE_REWARD_POOL].sort((a,b)=>{
    const aChance = a.specialChance ? Number(a.chance) || 0 : (Number(a.chance) || 0) / 1000;
    const bChance = b.specialChance ? Number(b.chance) || 0 : (Number(b.chance) || 0) / 1000;
    return aChance - bChance;
  });
}

function getFreeRewardPoolChanceLabel(reward){
  if(reward.specialChance){
    return `~1/${Math.max(1, Math.round(1 / Math.max(0.0000001, Number(reward.chance) || 0)))}`;
  }
  const rewards = FREE_REWARD_POOL.filter(item=>!item.specialChance);
  const total = rewards.reduce((sum, item)=>sum + (Number(item.chance) || 0), 0);
  const chance = ((Number(reward.chance) || 0) / Math.max(1, total)) * 100;
  return `${chance.toFixed(chance < 1 ? 2 : 1)}%`;
}

function claimFreeReward(index){
  const state = getFreeRewardsState();
  const reward = FREE_REWARDS[index];
  if(!reward || state.claimed[index]) return;
  if(state.playSeconds < reward.time){
    spawnPopup("Ta nagroda jeszcze sie laduje!", false, false, true);
    return;
  }
  state.claimed[index] = Date.now();
  const result = rollFreeReward(reward);
  state.claimedRewards = state.claimedRewards && typeof state.claimedRewards === "object" ? state.claimedRewards : {};
  state.claimedRewards[index] = result.label || result.type || "Nagroda";
  applyFreeReward(result);
  game.uiDirty = true;
  renderFreeRewards();
  update(true, true);
  if(typeof requestCloudSave === "function"){
    requestCloudSave({force:true, reason:"freeReward"});
  }
}

function renderFreeRewards(){
  if(!freeRewardsGrid) return;
  const state = getFreeRewardsState();
  const claimedCount = FREE_REWARDS.filter((_, index)=>state.claimed[index]).length;
  const hasReady = FREE_REWARDS.some((reward, index)=>!state.claimed[index] && state.playSeconds >= reward.time);
  freeRewardsBtn?.classList.toggle("ready", hasReady);
  if(freeRewardsProgress){
    freeRewardsProgress.textContent = `${claimedCount}/12 nagród odebranych`;
  }
  freeRewardsGrid.innerHTML = FREE_REWARDS.map((reward, index)=>{
    const claimed = !!state.claimed[index];
    const available = !claimed && state.playSeconds >= reward.time;
    const left = Math.max(0, reward.time - state.playSeconds);
    return `
      <div class="freeRewardGift ${claimed ? "claimed" : available ? "available" : "locked"}" onclick="claimFreeReward(${index})">
        ${claimed ? `<div class="freeRewardCheck">✓</div>` : ""}
        <div class="freeRewardIcon">${reward.icon}</div>
        <b>${reward.title}</b>
        <small>${claimed ? "Odebrano" : available ? "Odbierz teraz!" : formatFreeRewardTime(left)}</small>
      </div>
    `;
  }).join("");
}

function renderFreeRewardsV2(){
  if(!freeRewardsGrid) return;
  const state = getFreeRewardsState();
  const claimedCount = FREE_REWARDS.filter((_, index)=>state.claimed[index]).length;
  const hasReady = FREE_REWARDS.some((reward, index)=>!state.claimed[index] && state.playSeconds >= reward.time);
  freeRewardsBtn?.classList.toggle("ready", hasReady);
  if(freeRewardsProgress){
    freeRewardsProgress.textContent = `${claimedCount}/12 nagrod odebranych`;
  }
  const giftCards = FREE_REWARDS.map((reward, index)=>{
    const claimed = !!state.claimed[index];
    const available = !claimed && state.playSeconds >= reward.time;
    const left = Math.max(0, reward.time - state.playSeconds);
    return `
      <div class="freeRewardGift ${claimed ? "claimed" : available ? "available" : "locked"}" onclick="claimFreeReward(${index})">
        ${claimed ? `<div class="freeRewardCheck">✓</div>` : ""}
        <div class="freeRewardIcon">${reward.icon}</div>
        <b>${reward.title}</b>
        <small>${claimed ? (state.claimedRewards?.[index] || "Odebrano") : available ? "Odbierz RNG!" : formatFreeRewardTime(left)}</small>
        <em>Luck x${reward.luck}</em>
      </div>
    `;
  }).join("");
  const existingGiftGrid = freeRewardsGrid.querySelector(".freeRewardsGiftGrid");
  const existingOddsPanel = freeRewardsGrid.querySelector(".freeRewardsOddsPanel");
  if(existingGiftGrid && existingOddsPanel){
    existingGiftGrid.innerHTML = giftCards;
    return;
  }
  const odds = getSortedFreeRewardPool().map(reward=>`
    <div class="freeRewardOddsCard reward-${reward.rarity || "common"}" title="${escapeHtml(getFreeRewardOddsTitle(reward))}">
      <div class="freeRewardOddsIcon">${getFreeRewardVisual(reward)}</div>
      <div class="freeRewardOddsMeta">
        <b>${reward.label}</b>
        <small>${reward.specialChance ? "Exclusive drop" : ""}</small>
      </div>
      <strong>${getFreeRewardPoolChanceLabel(reward)}</strong>
    </div>
  `).join("");
  freeRewardsGrid.innerHTML = `
    <div class="freeRewardsGiftGrid">${giftCards}</div>
    <div class="freeRewardsOddsPanel">
      <b>DROPY I SZANSE</b>
      <span>Szanse sa bazowe przy 1x luck. Kazdy prezent losuje z tej samej puli, a lepsze prezenty maja wiekszy luck do rzadkich dropow.</span>
      ${odds}
    </div>
  `;
}

renderFreeRewards = renderFreeRewardsV2;

function renderFreeRewardsStable(){
  if(!freeRewardsGrid) return;
  const state = getFreeRewardsState();
  const claimedCount = FREE_REWARDS.filter((_, index)=>state.claimed[index]).length;
  const hasReady = FREE_REWARDS.some((reward, index)=>!state.claimed[index] && state.playSeconds >= reward.time);
  freeRewardsBtn?.classList.toggle("ready", hasReady);
  if(freeRewardsProgress){
    freeRewardsProgress.textContent = `${claimedCount}/12 nagrod odebranych`;
  }
  const buildGiftCard = (reward, index)=>{
    const claimed = !!state.claimed[index];
    const available = !claimed && state.playSeconds >= reward.time;
    const left = Math.max(0, reward.time - state.playSeconds);
    return `
      <div class="freeRewardGift ${claimed ? "claimed" : available ? "available" : "locked"}" data-free-reward-index="${index}" onclick="claimFreeReward(${index})">
        ${claimed ? `<div class="freeRewardCheck">✓</div>` : ""}
        <div class="freeRewardIcon">${reward.icon}</div>
        <b>${reward.title}</b>
        <small>${claimed ? (state.claimedRewards?.[index] || "Odebrano") : available ? "Odbierz RNG!" : formatFreeRewardTime(left)}</small>
        <em>Luck x${reward.luck}</em>
      </div>
    `;
  };
  const existingGiftGrid = freeRewardsGrid.querySelector(".freeRewardsGiftGrid");
  const existingOddsPanel = freeRewardsGrid.querySelector(".freeRewardsOddsPanel");
  if(existingGiftGrid && existingOddsPanel){
    FREE_REWARDS.forEach((reward, index)=>{
      let card = existingGiftGrid.querySelector(`[data-free-reward-index="${index}"]`);
      if(!card){
        existingGiftGrid.insertAdjacentHTML("beforeend", buildGiftCard(reward, index));
        card = existingGiftGrid.querySelector(`[data-free-reward-index="${index}"]`);
      }
      const claimed = !!state.claimed[index];
      const available = !claimed && state.playSeconds >= reward.time;
      const left = Math.max(0, reward.time - state.playSeconds);
      card.classList.toggle("claimed", claimed);
      card.classList.toggle("available", available);
      card.classList.toggle("locked", !claimed && !available);
      const check = card.querySelector(".freeRewardCheck");
      if(claimed && !check) card.insertAdjacentHTML("afterbegin", `<div class="freeRewardCheck">✓</div>`);
      if(!claimed && check) check.remove();
      const small = card.querySelector("small");
      if(small) small.textContent = claimed ? (state.claimedRewards?.[index] || "Odebrano") : available ? "Odbierz RNG!" : formatFreeRewardTime(left);
    });
    return;
  }
  const giftCards = FREE_REWARDS.map(buildGiftCard).join("");
  const odds = getSortedFreeRewardPool().map(reward=>`
    <div class="freeRewardOddsCard reward-${reward.rarity || "common"}" title="${escapeHtml(getFreeRewardOddsTitle(reward))}">
      <div class="freeRewardOddsIcon">${getFreeRewardVisual(reward)}</div>
      <div class="freeRewardOddsMeta">
        <b>${reward.label}</b>
        <small>${reward.specialChance ? "Exclusive drop" : ""}</small>
      </div>
      <strong>${getFreeRewardPoolChanceLabel(reward)}</strong>
    </div>
  `).join("");
  freeRewardsGrid.innerHTML = `
    <div class="freeRewardsGiftGrid">${giftCards}</div>
    <div class="freeRewardsOddsPanel">
      <b>DROPY I SZANSE</b>
      <span>Szanse sa bazowe przy 1x luck. Kazdy prezent losuje z tej samej puli, a lepsze prezenty maja wiekszy luck do rzadkich dropow.</span>
      ${odds}
    </div>
  `;
}

renderFreeRewards = renderFreeRewardsStable;

function renderIndexPanel(){
  if(!indexContent) return;
  indexContent.innerHTML = "";
  game.indexTab = ["pets","skins","items","event"].includes(game.indexTab) ? game.indexTab : "pets";
  game.indexPetVariant = game.indexPetVariant || "normal";
  const ownedPetIds = getOwnedPetTemplateIds();
  const ownedSkinIds = getOwnedSkinTemplateIds();

  const petTemplates = [];
  eggCatalog.forEach(egg=>{
    (egg.pets || []).forEach(pet=>petTemplates.push({egg, pet}));
  });
  const uniquePets = new Map();
  petTemplates.forEach(item=>{
    if(!uniquePets.has(item.pet.id)) uniquePets.set(item.pet.id, item);
  });

  const skinTemplates = [];
  crateCatalog.forEach(crate=>{
    (crate.skins || []).forEach(skin=>skinTemplates.push({crate, skin}));
  });
  const uniqueSkins = new Map();
  skinTemplates.forEach(item=>{
    if(!uniqueSkins.has(item.skin.id)) uniqueSkins.set(item.skin.id, item);
  });

  const petSection = {
    title:"PET INDEX",
    note:`${[...uniquePets.keys()].filter(id=>ownedPetIds.has(id)).length}/${uniquePets.size} odkrytych`,
    cards:[...uniquePets.values()].map(({egg, pet})=>{
        const discovered = ownedPetIds.has(pet.id);
        const variantPreview = getIndexPetPreview(pet, game.indexPetVariant);
        const preview = discovered ? Object.assign({}, pet, variantPreview, {templateId:pet.id, secret:pet.secret}) : pet;
        return makeIndexCard({
          type:"pets",
          id:pet.id,
          name:pet.name,
          rarity:pet.rarity,
          icon:pet.icon,
          discovered,
          meta:`${egg.name} | ${pet.chanceLabel || ""}`,
          variants:["NORMAL","GOLD","DIAMOND","SHINY","SHINY GOLD","SHINY DIAMOND"],
          stats:`+${variantPreview.click} klik | x${(1 + variantPreview.multi).toFixed(2)} pkt | dia x${(1 + variantPreview.diamond).toFixed(2)}`,
          visualClass:discovered ? getPetVisualClasses(preview) : "",
          visualStyle:discovered ? petVisualClass(preview) : ""
        });
      })
  };
  const skinSection = {
      title:"SKIN INDEX",
      note:`${[...uniqueSkins.keys()].filter(id=>ownedSkinIds.has(id)).length}/${uniqueSkins.size} odkrytych`,
      cards:[...uniqueSkins.values()].map(({crate, skin})=>{
        const discovered = ownedSkinIds.has(skin.id);
        return makeIndexCard({
          type:"skins",
          id:skin.id,
          name:skin.name,
          rarity:skin.rarity,
          icon:UI_ICONS.crate,
          discovered,
          meta:`${crate.name} | kosmetyczny skin`,
          variants:getSkinIndexVariants(skin.id),
          visualClass:discovered ? `skinPreview ${skin.skinClass || ""}` : "",
          visualStyle:discovered ? `linear-gradient(135deg,${skin.accent || "#8bd3ff"},#fff)` : ""
        });
      })
  };
  const itemSection = {
      title:"ITEM INDEX",
      note:"Mikstury, sakiewki i enchanty",
      cards:[
        ...Object.values(POTION_TYPES).flatMap(type=>Object.values(POTION_TIERS).map(tier=>{
          const id = `potion_${type.id}_t${tier.tier}`;
          const discovered = (game.potions || []).some(p=>p.type === type.id && Number(p.tier) === tier.tier) || (game.activePotions || []).some(p=>p.type === type.id && Number(p.tier) === tier.tier);
          return makeIndexCard({
            type:"items",
            id,
            name:`${type.label} x${tier.mult}`,
            rarity:`Tier ${tier.roman}`,
            icon:type.icon,
            discovered,
            meta:`Mikstura | ${getPotionDurationLabel(tier.durationMs)}`,
            variants:[`Tier ${tier.roman}`, `${getPotionDurationLabel(tier.durationMs)}`],
            visualClass:`potionIcon potionTier${tier.tier}`,
            visualStyle:`linear-gradient(180deg, ${type.color}, #101827)`
          });
        })),
        ...Object.values(BAG_CATALOG).map(bag=>{
          const id = `bag_${bag.id}`;
          const discovered = (game.bags || []).some(item=>item.bagId === bag.id);
          return makeIndexCard({
            type:"items",
            id,
            name:bag.name,
            rarity:bag.rarity,
            icon:bag.icon,
            discovered,
            meta:bag.rewards.map(reward=>`${reward.label}: ${reward.chance}%`).join("\n"),
            variants:bag.rewards.slice(0, 3).map(reward=>reward.label),
            visualClass:"bagIcon",
            visualStyle:`linear-gradient(135deg, ${bag.color}, #101827)`
          });
        }),
        ...Object.values(ENCHANT_CATALOG).flatMap(def=>{
          const tiers = def.exclusive ? [{tier:1, roman:"EX"}] : Object.values(ENCHANT_TIERS);
          return tiers.map(tier=>{
            const id = `enchant_${def.id}_${def.exclusive ? "ex" : "t" + tier.tier}`;
            const discovered = (game.enchants || []).some(item=>item.type === def.id && (def.exclusive || Number(item.tier) === tier.tier));
            return makeIndexCard({
              type:"items",
              id,
              name:def.exclusive ? def.name : `${def.name} ${tier.roman}`,
              rarity:def.exclusive ? "Exclusive" : `Tier ${tier.roman}`,
              icon:def.icon,
              discovered,
              meta:`Enchant | ${def.desc}`,
              variants:def.exclusive ? ["EXCLUSIVE"] : [`Tier ${tier.roman}`, "Craft 5 -> 1"],
              visualClass:`enchantBook enchantTier${tier.tier}`,
              visualStyle:`linear-gradient(135deg, ${def.color}, #101827)`
            });
          });
        })
      ]
  };
  const eventPets = getEventIndexPets();
  const eventSkins = getEventIndexSkins();
  const eventPetIds = new Set(eventPets.map(pet=>pet.id));
  const eventSkinIds = new Set(eventSkins.map(skin=>skin.id));
  const eventOwned = [...eventPetIds].filter(id=>ownedPetIds.has(id)).length + [...eventSkinIds].filter(id=>ownedSkinIds.has(id)).length;
  const eventSection = {
      title:"EVENT INDEX",
      note:`${eventOwned}/${eventPetIds.size + eventSkinIds.size} odkrytych`,
      progress:{done:eventOwned, total:eventPetIds.size + eventSkinIds.size, tone:"event"},
      cards:[
        ...eventPets.map(pet=>{
          const owned = getOwnedPets().find(item=>item.templateId === pet.id);
          const discovered = !!owned;
          const preview = discovered ? owned : Object.assign({}, pet, {templateId:pet.id});
          return makeIndexCard({
            type:"pets",
            id:pet.id,
            name:pet.name,
            rarity:pet.rarity,
            icon:pet.icon,
            discovered,
            meta:`${pet.eventName || "Event"} | Exclusive`,
            variants:["EVENT","EXCLUSIVE"],
            stats:discovered ? getPetPowerSummary(owned) : "",
            visualClass:discovered ? getPetVisualClasses(preview) : "",
            visualStyle:discovered ? petVisualClass(preview) : ""
          });
        }),
        ...eventSkins.map(skin=>{
          const discovered = ownedSkinIds.has(skin.id);
          return makeIndexCard({
            type:"skins",
            id:skin.id,
            name:skin.name,
            rarity:skin.rarity,
            icon:skin.icon,
            discovered,
            meta:`${skin.eventName} | event skin`,
            variants:["EVENT","EXCLUSIVE"],
            visualClass:discovered ? `skinPreview ${skin.skinClass}` : "",
            visualStyle:discovered ? `linear-gradient(135deg,${skin.accent},#fff)` : ""
          });
        })
      ]
  };

  petSection.progress = {done:[...uniquePets.keys()].filter(id=>ownedPetIds.has(id)).length, total:uniquePets.size, tone:"default"};
  skinSection.progress = {done:[...uniqueSkins.keys()].filter(id=>ownedSkinIds.has(id)).length, total:uniqueSkins.size, tone:"default"};
  itemSection.progress = {done:itemSection.cards.filter(card=>card.classList.contains("discovered")).length, total:itemSection.cards.length, tone:"default"};

  const sectionsByTab = {pets:petSection, skins:skinSection, items:itemSection, event:eventSection};
  const section = sectionsByTab[game.indexTab] || petSection;

  const tabs = document.createElement("div");
  tabs.className = "indexTabs";
  tabs.innerHTML = `
    <button class="${game.indexTab === "pets" ? "active" : ""}" data-index-tab="pets" type="button">Pety</button>
    <button class="${game.indexTab === "skins" ? "active" : ""}" data-index-tab="skins" type="button">Skiny</button>
    <button class="${game.indexTab === "items" ? "active" : ""}" data-index-tab="items" type="button">Itemy</button>
    <button class="${game.indexTab === "event" ? "active" : ""}" data-index-tab="event" type="button">Event</button>
  `;
  indexContent.appendChild(tabs);
  tabs.querySelectorAll("[data-index-tab]").forEach(button=>{
    button.onclick = ()=>{
      game.indexTab = button.dataset.indexTab;
      renderIndexPanel();
    };
  });

  if(game.indexTab === "pets" || game.indexTab === "event"){
    const variants = document.createElement("div");
    variants.className = "indexVariantPicker";
    const options = [
      ["normal","Normal"],
      ["gold","Gold"],
      ["diamond","Diamond"],
      ["shiny","Shiny"],
      ["shinyGold","Shiny Gold"],
      ["shinyDiamond","Shiny Diamond"]
    ];
    variants.innerHTML = options.map(([key, label])=>`<button class="${game.indexPetVariant === key ? "active" : ""}" data-index-variant="${key}" type="button">${label}</button>`).join("");
    indexContent.appendChild(variants);
    variants.querySelectorAll("[data-index-variant]").forEach(button=>{
      button.onclick = ()=>{
        game.indexPetVariant = button.dataset.indexVariant;
        renderIndexPanel();
      };
    });
    const templates = game.indexTab === "event" ? eventPets : [...uniquePets.values()].map(item=>item.pet);
    const progress = document.createElement("div");
    progress.className = "indexVariantProgress";
    progress.innerHTML = getPetVariantProgress(templates).map(item=>`
      <div class="indexVariantProgressItem ${item.tone}">
        ${getIndexProgressRing(item.done, item.total, item.tone)}
        <span>${item.label}</span>
      </div>
    `).join("");
    indexContent.appendChild(progress);
  }

  const header = document.createElement("div");
  header.className = "indexSectionHeader";
  header.innerHTML = `<div><b>${section.title}</b><span>${section.note}</span></div>${getIndexProgressRing(section.progress?.done || 0, section.progress?.total || 0, section.progress?.tone || "default")}`;
  indexContent.appendChild(header);
  const grid = document.createElement("div");
  grid.className = "indexGrid";
  section.cards.forEach(card=>grid.appendChild(card));
  indexContent.appendChild(grid);
}

function openFreeRewards(){
  renderFreeRewards();
  freeRewardsOverlay?.classList.add("open");
}

function closeFreeRewards(){
  freeRewardsOverlay?.classList.remove("open");
}

function cleanupActivePotions(){
  const now = Date.now();
  const before = game.activePotions.length;
  const activeByType = new Map();
  const valid = (Array.isArray(game.activePotions) ? game.activePotions : [])
    .filter(potion=>potion)
    .map(potion=>{
      const remainingMs = potion.paused && Number.isFinite(Number(potion.remainingMs))
        ? Number(potion.remainingMs)
        : Math.max(0, Number(potion.endsAt || 0) - now);
      return Object.assign({}, potion, {remainingMs});
    })
    .filter(potion=>potion.remainingMs > 0);

  valid.sort((a,b)=>
    String(a.type || "").localeCompare(String(b.type || "")) ||
    (Number(b.tier) || 0) - (Number(a.tier) || 0) ||
    (Number(a.startedAt) || 0) - (Number(b.startedAt) || 0)
  );

  valid.forEach(potion=>{
    const type = potion.type || "money";
    if(!activeByType.has(type)){
      potion.paused = false;
      potion.endsAt = now + potion.remainingMs;
      activeByType.set(type, potion);
    }else{
      potion.paused = true;
      potion.endsAt = 0;
    }
  });
  game.activePotions = valid;
  if(before !== game.activePotions.length) game.uiDirty = true;
}

function getActivePotionMultiplier(type){
  cleanupActivePotions();
  return game.activePotions
    .filter(potion=>potion && potion.type === type && !potion.paused && potion.endsAt > Date.now())
    .reduce((best, potion)=>Math.max(best, Number(potion.mult) || 1), 1);
}

function addActivePotionBuff(typeId, tierNumber, durationMs){
  cleanupActivePotions();
  const now = Date.now();
  const type = POTION_TYPES[typeId] || POTION_TYPES.money;
  const tier = POTION_TIERS[tierNumber] || POTION_TIERS[1];
  const existing = (game.activePotions || []).find(potion=>potion.type === type.id && Number(potion.tier) === tier.tier);
  if(existing){
    const remaining = existing.paused
      ? Math.max(0, Number(existing.remainingMs) || 0)
      : Math.max(0, Number(existing.endsAt || 0) - now);
    existing.remainingMs = remaining + durationMs;
    existing.endsAt = existing.paused ? 0 : now + existing.remainingMs;
    existing.startedAt = existing.startedAt || now;
    existing.mult = tier.mult;
  }else{
    game.activePotions.push({
      uid:`active_${type.id}_${tier.tier}_${now}_${Math.random().toString(36).slice(2, 7)}`,
      type:type.id,
      tier:tier.tier,
      mult:tier.mult,
      startedAt:now,
      remainingMs:durationMs,
      endsAt:now + durationMs,
      paused:false
    });
  }
  cleanupActivePotions();
}

function getPotionDropChance(source="click"){
  const weather = getCurrentWeather();
  const weatherDef = weather ? getWeatherDef(weather.id) : null;
  if(!hasPotionFeature() && !(weatherDef?.id === "riches" && weather?.mega)) return 0;
  const base = source === "auto" ? 0.001 : 0.0007;
  return base * Math.pow(1.1, Math.max(0, Number(game.ultraCores) || 0)) * (1 + getWeatherChanceBoost("itemDrop") + getWeatherChanceBoost("potionDrop"));
}

function getEnchantDropChance(source="click"){
  const weather = getCurrentWeather();
  const weatherDef = weather ? getWeatherDef(weather.id) : null;
  if(!hasEnchantFeature() && !(weatherDef?.id === "riches" && weather?.mega)) return 0;
  const base = source === "auto" ? 0.00000037 : 0.00000075;
  return base * getEnchantEffectTotal("itemDrop", true) * (1 + getWeatherChanceBoost("itemDrop"));
}

function getEnchantTierInfo(tierNumber){
  return ENCHANT_TIERS[tierNumber] || ENCHANT_TIERS[1];
}

function getEnchantDef(typeId){
  return ENCHANT_CATALOG[typeId] || ENCHANT_CATALOG.luck;
}

function getEnchantEffectValue(enchant){
  const def = getEnchantDef(enchant?.type);
  if(def.exclusive) return def.base;
  const tier = getEnchantTierInfo(enchant?.tier || 1);
  return def.base * tier.power;
}

function getActiveEnchantItems(){
  const ids = new Set(Array.isArray(game.activeEnchantIds) ? game.activeEnchantIds : []);
  return (Array.isArray(game.enchants) ? game.enchants : []).filter(enchant=>ids.has(enchant.uid));
}

function getEnchantEffectTotal(effect, multiplicative=false){
  const items = getActiveEnchantItems().filter(enchant=>getEnchantDef(enchant.type).effect === effect);
  if(multiplicative){
    return items.reduce((total, enchant)=>total * Math.max(1, getEnchantEffectValue(enchant)), 1);
  }
  return items.reduce((total, enchant)=>total + getEnchantEffectValue(enchant), 0);
}

function getEnchantEggBatchBonus(){
  return Math.floor(getEnchantEffectTotal("eggBatch"));
}

function getEnchantHatchSpeedFactor(){
  return Math.max(0.72, 1 - getEnchantEffectTotal("hatchSpeed"));
}

function getEnchantLuckMultiplier(){
  return 1 + getEnchantEffectTotal("luck");
}

function getEnchantCoinMultiplier(){
  return 1 + getEnchantEffectTotal("coins");
}

function getEnchantVariantBonus(){
  return getEnchantEffectTotal("variants");
}

function getEnchantDiamondDropMultiplier(){
  return getEnchantEffectTotal("diamondDrop", true);
}

function rollEnchantTier(){
  const tiers = Object.values(ENCHANT_TIERS);
  const total = tiers.reduce((sum, tier)=>sum + tier.weight, 0);
  let roll = Math.random() * total;
  for(const tier of tiers){
    roll -= tier.weight;
    if(roll <= 0) return tier;
  }
  return ENCHANT_TIERS[1];
}

function rollEnchantType(){
  const pool = Object.values(ENCHANT_CATALOG).filter(item=>!item.exclusive);
  return pool[Math.floor(Math.random() * pool.length)] || ENCHANT_CATALOG.luck;
}

function makeEnchantInstance(typeId, tierNumber=1){
  const def = getEnchantDef(typeId);
  const tier = def.exclusive ? {tier:1, roman:"EX"} : getEnchantTierInfo(tierNumber);
  return {
    uid:`enchant_${game.enchantSeq++}`,
    type:def.id,
    tier:tier.tier,
    exclusive:!!def.exclusive,
    createdAt:Date.now()
  };
}

function addEnchantToInventory(typeId, tierNumber=1, amount=1){
  game.enchants = Array.isArray(game.enchants) ? game.enchants : [];
  const def = getEnchantDef(typeId);
  const count = Math.max(1, Math.floor(Number(amount) || 1));
  for(let i = 0; i < count; i++){
    const enchant = makeEnchantInstance(def.id, tierNumber);
    game.enchants.push(enchant);
    trackExist("items", `enchant_${def.id}_${def.exclusive ? "ex" : "t" + enchant.tier}`);
    showItemDropTile("enchant", {icon:def.icon, color:def.color});
  }
  game.uiDirty = true;
}

function getEnchantName(enchant){
  const def = getEnchantDef(enchant?.type);
  const tier = def.exclusive ? "EX" : getEnchantTierInfo(enchant?.tier || 1).roman;
  return `${def.name} ${tier}`;
}

function tryDropEnchant(source="click"){
  if(Math.random() >= getEnchantDropChance(source)) return;
  const def = rollEnchantType();
  const weatherDef = getCurrentWeather() ? getWeatherDef(getCurrentWeather().id) : null;
  const tier = rollEnchantTier();
  const finalTier = weatherDef?.tierUp ? Math.min(3, tier.tier + 1) : tier.tier;
  addEnchantToInventory(def.id, finalTier, 1);
  spawnPopup(`${def.icon} Enchant!`, false, false, true);
}

function rollPotionTier(){
  const tiers = Object.values(POTION_TIERS);
  const total = tiers.reduce((sum, tier)=>sum + tier.weight, 0);
  let roll = Math.random() * total;
  for(const tier of tiers){
    roll -= tier.weight;
    if(roll <= 0) return tier;
  }
  return POTION_TIERS[1];
}

function rollPotionType(){
  const types = Object.values(POTION_TYPES);
  return types[Math.floor(Math.random() * types.length)] || POTION_TYPES.money;
}

function getPotionName(potion){
  const type = POTION_TYPES[potion?.type] || POTION_TYPES.money;
  const tier = POTION_TIERS[potion?.tier] || POTION_TIERS[1];
  return `${type.label} ${getPotionEffectLabel(type.id, tier.tier)} T${tier.roman}`;
}

function getPotionDurationLabel(ms){
  return `${Math.round(ms / 60000)} min`;
}

function getPotionEffectLabel(typeId, tierNumber){
  if(typeId === "petXp"){
    const mult = [1, 1.08, 1.18, 1.30][Math.max(0, Math.min(3, Number(tierNumber) || 0))] || 1;
    return `+${Math.round((mult - 1) * 100)}% XP`;
  }
  const tier = POTION_TIERS[tierNumber] || POTION_TIERS[1];
  return `x${tier.mult}`;
}

function tryDropPotion(source="click"){
  if(Math.random() >= getPotionDropChance(source)) return;
  const tier = rollPotionTier();
  const weatherDef = getCurrentWeather() ? getWeatherDef(getCurrentWeather().id) : null;
  const finalTier = weatherDef?.tierUp ? (POTION_TIERS[Math.min(3, tier.tier + 1)] || tier) : tier;
  const type = rollPotionType();
  const potion = {
    uid:`potion_${game.potionSeq++}`,
    type:type.id,
    tier:finalTier.tier,
    mult:finalTier.mult,
    durationMs:finalTier.durationMs,
    createdAt:Date.now()
  };
  game.potions.push(potion);
  trackExist("items", `potion_${type.id}_t${finalTier.tier}`);
  showItemDropTile("potion", {icon:type.icon, color:type.color});
  game.uiDirty = true;
}

function getFruitDropChance(source="click"){
  const base = source === "auto" ? 0.00008 : 0.00022;
  return base * Math.min(3, getEnchantEffectTotal("itemDrop", true)) * (1 + getWeatherChanceBoost("itemDrop"));
}

function rollClickFruitId(){
  const pool = [
    {id:"berry", weight:620},
    {id:"apple", weight:240},
    {id:"pear", weight:100},
    {id:"melon", weight:36},
    {id:"star", weight:4}
  ];
  const total = pool.reduce((sum, item)=>sum + item.weight, 0);
  let roll = Math.random() * total;
  for(const item of pool){
    roll -= item.weight;
    if(roll <= 0) return item.id;
  }
  return "berry";
}

function tryDropPetFruit(source="click"){
  if(Math.random() >= getFruitDropChance(source)) return;
  addPetFruit(rollClickFruitId(), 1);
  spawnPopup("Owoc peta!", false, false, true);
}

const maybeDropDiamondBeforePotions = maybeDropDiamond;
maybeDropDiamond = function(source="click"){
  awardPetXpFromClick(source);
  const diamondsBefore = game.diamonds || 0;
  maybeDropDiamondBeforePotions(source);
  const diamondsAfterBase = game.diamonds || 0;
  if(diamondsAfterBase > diamondsBefore){
    const extra = Math.floor((diamondsAfterBase - diamondsBefore) * (getWeatherDiamondValueMultiplier() - 1));
    if(extra > 0) game.diamonds += extra;
  }
  if(source === "auto"){
    window.kretAudio?.autoClick?.();
  }
  if((game.diamonds || 0) > diamondsBefore){
    window.kretAudio?.diamond?.();
  }
  if(hasPotionFeature()) tryDropPotion(source);
  tryDropEnchant(source);
  tryDropPetFruit(source);
  tryWeatherSpecialDrops(source);
};

function getCrateLabel(crate, index){
  return `${crate.name} #${index + 1}`;
}

function getLiveGlobalEvents(){
  const events = window.__kretGlobalEvents || {};
  const now = Date.now();
  return Object.values(events).filter(event=>event && (!event.endsAt || event.endsAt > now));
}

function getGlobalEvent(type){
  return getLiveGlobalEvents().find(event=>event.type === type) || null;
}

function getGlobalEventMultiplier(type){
  const event = getGlobalEvent(type);
  return event && (event.mode === "multiplier" || event.mode === "percent") ? Math.max(1, Number(event.value) || 1) : 1;
}

function getGlobalEventChance(type){
  const event = getGlobalEvent(type);
  return event && event.mode === "chance" ? Math.max(0, Number(event.value) || 0) : 0;
}

function getPersonalRewardMultiplier(type){
  const now = Date.now();
  const boosts = Array.isArray(game.bossRewardBoosts) ? game.bossRewardBoosts : [];
  return boosts
    .filter(boost=>boost && boost.type === type && (!boost.endsAt || boost.endsAt > now))
    .reduce((total, boost)=>total * Math.max(1, Number(boost.value) || 1), 1);
}

function getPersonalRewardChance(type){
  const now = Date.now();
  const boosts = Array.isArray(game.bossRewardBoosts) ? game.bossRewardBoosts : [];
  return boosts
    .filter(boost=>boost && boost.type === type && (!boost.endsAt || boost.endsAt > now))
    .reduce((total, boost)=>total + Math.max(0, Number(boost.value) || 0), 0);
}

function getChanceBoostMultiplier(type){
  return 1 + getGlobalEventChance(type) + getPersonalRewardChance(type);
}

function getGlobalLuckMultiplier(){
  return getGlobalEventMultiplier("luck") * getPersonalRewardMultiplier("luck") * getActivePotionMultiplier("luck") * getDailyStreakLuckMultiplier() * getEnchantLuckMultiplier() * getWeatherMultiplier("luck");
}

function getLuckWeightMultiplier(item){
  const rarity = item?.rarity || "";
  const luck = getGlobalLuckMultiplier();
  if(luck <= 1) return 1;
  const rank = {
    "Pospolity":0,
    "Rzadki":0.35,
    "Epicki":0.75,
    "Mityczny":1.08,
    "Legendarny":1.4,
    "Legenda":1.4,
    "Sekretny":1.85
  }[rarity] ?? (item?.secret ? 1.85 : 0.5);
  return Math.pow(luck, rank);
}

function rollPetFromEgg(egg){
  const weighted = egg.pets.map(pet=>({
    pet,
    weight:pet.weight * getLuckWeightMultiplier(pet)
  }));
  const total = weighted.reduce((sum, item)=>sum + item.weight, 0);
  let roll = Math.random() * total;
  for(const item of weighted){
    roll -= item.weight;
    if(roll <= 0) return item.pet;
  }
  return egg.pets[egg.pets.length - 1];
}

function rollSkinFromCrate(crate){
  const weighted = crate.skins.map(skin=>({
    skin,
    weight:skin.weight * getLuckWeightMultiplier(skin)
  }));
  const total = weighted.reduce((sum, item)=>sum + item.weight, 0);
  let roll = Math.random() * total;
  for(const item of weighted){
    roll -= item.weight;
    if(roll <= 0) return item.skin;
  }
  return crate.skins[crate.skins.length - 1];
}

function setPlanet(){
  const p = planets[Math.min(game.rebirths, planets.length - 1)];
  const worldIndex = Math.min(game.rebirths, planets.length - 1);
  const worldDetails = [
    {
      detail:"radial-gradient(circle at 18% 24%, rgba(120,210,140,.18), transparent 18%), radial-gradient(circle at 82% 16%, rgba(105,170,255,.14), transparent 16%)",
      specks:"radial-gradient(circle at 18% 28%, rgba(255,255,255,.22) 0 1px, transparent 2px)"
    },
    {
      detail:"radial-gradient(circle at 78% 20%, rgba(240,240,255,.24), transparent 13%), radial-gradient(circle at 28% 72%, rgba(210,210,230,.13), transparent 10%)",
      specks:"radial-gradient(circle at 35% 40%, rgba(255,255,255,.38) 0 1px, transparent 2px)"
    },
    {
      detail:"radial-gradient(circle at 22% 78%, rgba(255,110,75,.2), transparent 15%), linear-gradient(135deg, transparent 0 62%, rgba(255,92,50,.08) 63% 66%, transparent 67%)",
      specks:"radial-gradient(circle at 22% 24%, rgba(255,170,120,.3) 0 1px, transparent 2px)"
    },
    {
      detail:"linear-gradient(12deg, transparent 0 28%, rgba(255,200,120,.16) 29% 35%, transparent 36% 56%, rgba(255,255,255,.09) 57% 61%, transparent 62%), radial-gradient(circle at 72% 28%, rgba(255,180,85,.18), transparent 16%)",
      specks:"radial-gradient(circle at 46% 50%, rgba(255,230,190,.28) 0 1px, transparent 2px)"
    },
    {
      detail:"radial-gradient(ellipse at 50% 55%, transparent 0 22%, rgba(255,224,120,.24) 23% 25%, transparent 26% 100%), radial-gradient(circle at 20% 25%, rgba(255,245,190,.12), transparent 16%)",
      specks:"radial-gradient(circle at 65% 32%, rgba(255,245,190,.26) 0 1px, transparent 2px)"
    },
    {
      detail:"radial-gradient(circle at 76% 34%, rgba(120,255,230,.18), transparent 18%), linear-gradient(155deg, transparent 0 44%, rgba(120,245,230,.09) 45% 48%, transparent 49%)",
      specks:"radial-gradient(circle at 30% 36%, rgba(180,255,245,.32) 0 1px, transparent 2px)"
    },
    {
      detail:"radial-gradient(circle at 70% 24%, rgba(70,110,255,.26), transparent 18%), radial-gradient(circle at 18% 76%, rgba(80,180,255,.16), transparent 16%)",
      specks:"radial-gradient(circle at 42% 44%, rgba(170,210,255,.34) 0 1px, transparent 2px)"
    },
    {
      detail:"radial-gradient(circle at 18% 30%, rgba(210,210,210,.16), transparent 12%), radial-gradient(circle at 78% 76%, rgba(255,255,255,.1), transparent 10%)",
      specks:"radial-gradient(circle at 26% 52%, rgba(255,255,255,.26) 0 1px, transparent 2px)"
    },
    {
      detail:"radial-gradient(ellipse at 52% 42%, rgba(190,90,255,.22), transparent 24%), conic-gradient(from 45deg at 50% 45%, transparent, rgba(90,210,255,.12), transparent, rgba(255,110,220,.1), transparent)",
      specks:"radial-gradient(circle at 20% 22%, rgba(255,255,255,.42) 0 1px, transparent 2px)"
    },
    {
      detail:"radial-gradient(circle at 34% 36%, rgba(255,255,255,.12), transparent 12%), radial-gradient(circle at 70% 70%, rgba(100,180,255,.14), transparent 16%)",
      specks:"radial-gradient(circle at 50% 50%, rgba(255,255,255,.46) 0 1px, transparent 2px)"
    },
    {
      detail:"radial-gradient(circle at 50% 40%, rgba(255,70,70,.14), transparent 16%), radial-gradient(circle at 18% 80%, rgba(130,60,255,.16), transparent 18%)",
      specks:"radial-gradient(circle at 28% 34%, rgba(255,120,120,.32) 0 1px, transparent 2px)"
    }
  ];
  const detail = worldDetails[worldIndex] || worldDetails[0];
  document.body.style.background = "radial-gradient(circle at top," + p.color + ",#000)";
  document.documentElement.style.setProperty("--world-detail", detail.detail);
  document.documentElement.style.setProperty("--world-specks", detail.specks);
  setPanelTheme(p.color);
  document.getElementById("rebirthLabel").textContent = `REBIRTH: ${game.rebirths} | ULTRA RDZENIE: ${game.ultraCores || 0} | SWIAT: ${p.name}`;
  const bgRocket = document.getElementById("bgRocket");
  if(bgRocket){
    bgRocket.style.display = game.rebirths > 0 ? "block" : "none";
    bgRocket.textContent = game.rebirths >= 10 ? "X" : UI_ICONS.rocket;
    bgRocket.classList.toggle("wrecked", game.rebirths >= 10);
  }
}

function resetGame(){
  if(!confirm("Na pewno zresetowac cala gre do samego poczatku?")) return;
  window.__kretDisableSave = true;
  try{
    localStorage.setItem("__kret_force_reset__","1");
    localStorage.removeItem("guestSave");
    sessionStorage.removeItem("guestSave");
  }catch(err){}
  setTimeout(()=>{
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.set("_reset", Date.now().toString());
    cleanUrl.hash = "";
    window.location.replace(cleanUrl.toString());
  }, 20);
}

adminToggle.onclick = () => {
  if(!adminUnlocked || !adminToggle.classList.contains("adminVisible")) return;
  adminPanel.style.display = adminPanel.style.display === "block" ? "none" : "block";
  setupAdminWeatherControls?.();
};

function addDiamondsAdmin(){
  const val = Number(adminDiamondInput.value);
  if(!isNaN(val)){
    game.diamonds += val;
    game.uiDirty = true;
    update(true, true);
  }
}

function quickDiamondAdd(x){
  game.diamonds += x;
  game.uiDirty = true;
  update(true, true);
}

function setupAdminWeatherControls(){
  const select = document.getElementById("adminWeatherSelect");
  const start = document.getElementById("adminWeatherStart");
  const planNext = document.getElementById("adminWeatherPlanNext");
  const clear = document.getElementById("adminWeatherClear");
  const megaInput = document.getElementById("adminWeatherMega");
  const status = document.getElementById("adminWeatherStatus");
  if(!select) return;
  if(select.options.length !== WEATHER_CATALOG.length){
    select.innerHTML = WEATHER_CATALOG.map(w=>`<option value="${w.id}">${w.name}</option>`).join("");
  }
  if(select.dataset.ready) return;
  select.dataset.ready = "1";
  start?.addEventListener("click", async ()=>{
    const def = getWeatherDef(select.value);
    const mega = !!megaInput?.checked;
    game.weather.manual = {
      id:def.id,
      mega,
      slotStart:Date.now(),
      startsAt:Date.now(),
      endsAt:Date.now() + def.duration,
      admin:true
    };
    if(status) status.textContent = `Ustawianie globalnej pogody: ${mega ? "MEGA " : ""}${def.name}...`;
    lastWeatherSlotKey = "";
    try{
      if(typeof window.adminSetGlobalWeatherNow === "function"){
        const ok = await window.adminSetGlobalWeatherNow(def.id, def.duration, mega);
        if(!ok) throw new Error("Firebase odmowil zapisu");
      }
      if(status) status.textContent = `Globalnie ustawiono: ${mega ? "MEGA " : ""}${def.name}`;
    }catch(err){
      console.warn("Global weather set failed:", err);
      if(status) status.textContent = `Nie zapisano globalnie. Lokalnie ustawiono: ${mega ? "MEGA " : ""}${def.name}`;
    }
    renderWeatherRoll(getCurrentWeather() || game.weather.manual);
    syncWeatherSystem();
    renderWeatherPanel();
    update(true, true);
  });
  clear?.addEventListener("click", async ()=>{
    game.weather.manual = null;
    if(status) status.textContent = "Czyszczenie globalnej pogody...";
    lastWeatherSlotKey = "";
    try{
      if(typeof window.adminClearGlobalWeather === "function"){
        const ok = await window.adminClearGlobalWeather();
        if(!ok) throw new Error("Firebase odmowil zapisu");
      }
      if(status) status.textContent = "Globalna pogoda wyczyszczona.";
    }catch(err){
      console.warn("Global weather clear failed:", err);
      if(status) status.textContent = "Nie wyczyszczono globalnie. Wyczyszczono lokalnie.";
    }
    syncWeatherSystem();
    update(true, true);
  });
  planNext?.addEventListener("click", async ()=>{
    const nextSlot = getWeatherSlotStart(Date.now()) + WEATHER_SLOT_MS;
    const def = getWeatherDef(select.value);
    const mega = !!megaInput?.checked;
    game.weather.planned[String(nextSlot)] = {id:def.id, mega, plannedAt:Date.now()};
    if(status) status.textContent = `Planowanie globalnej pogody: ${mega ? "MEGA " : ""}${def.name}...`;
    try{
      if(typeof window.adminPlanGlobalWeatherNext === "function"){
        const ok = await window.adminPlanGlobalWeatherNext(def.id, nextSlot, mega);
        if(!ok) throw new Error("Firebase odmowil zapisu");
      }
      if(status) status.textContent = `Globalnie zaplanowano nastepna pogode: ${mega ? "MEGA " : ""}${def.name}`;
    }catch(err){
      console.warn("Global weather plan failed:", err);
      if(status) status.textContent = `Nie zapisano globalnie. Lokalnie zaplanowano: ${mega ? "MEGA " : ""}${def.name}`;
    }
    renderWeatherPanel();
    update(true, true);
  });
}

setupAdminWeatherControls();
window.setupAdminWeatherControls = setupAdminWeatherControls;
setTimeout(setupAdminWeatherControls, 250);

function setRebirthLevel(forceLevel){
  const rawLevel = forceLevel ?? Number(adminRebirthInput.value);
  if(isNaN(rawLevel)) return;
  const level = Math.max(0, Math.min(REBIRTH_LIMIT, Math.floor(rawLevel)));
  game.rebirths = level;
  game.rebirthMult = Math.max(1, Math.pow(1.5, level));
  game.uiDirty = true;
  update(true, true);
}

function getHoldClicksPerSecond(){
  return [12, 18, 25, 38][Math.min(getHoldPowerLevel(), 3)];
}

const ENDLESS_UNLOCK_REBIRTH = 10;
const ENDLESS_UPGRADES = [
  {
    id:"voidClick",
    name:"VOID KLIK",
    desc:"Dlugoterminowo wzmacnia wszystkie klikniecia.",
    base:2.8e12,
    scale:1.082,
    max:500,
    type:"click"
  },
  {
    id:"afkEngine",
    name:"SILNIK AFK",
    desc:"Autoclick i dluzszy afk zyskuja realna przewage.",
    base:3.4e12,
    scale:1.084,
    max:500,
    type:"auto"
  },
  {
    id:"petResonance",
    name:"REZONANS PETOW",
    desc:"Wzmacnia bonusy aktywnych petow w dlugim endgame.",
    base:4.1e12,
    scale:1.086,
    max:500,
    type:"pets"
  },
  {
    id:"diamondFlow",
    name:"DIAMENTOWY PRZEPLYW",
    desc:"Podnosi szanse i wartosc diamentow w bardzo dlugim progresie.",
    base:5.2e12,
    scale:1.088,
    max:500,
    type:"diamonds"
  }
];

function isEndlessUnlocked(){
  return game.rebirths >= ENDLESS_UNLOCK_REBIRTH || (game.ultraCoreBest || 0) > 0 || (game.ultraCores || 0) > 0;
}

function getEndlessLevel(id){
  game.endlessUpgrades = game.endlessUpgrades && typeof game.endlessUpgrades === "object" ? game.endlessUpgrades : {};
  return game.endlessUpgrades[id] || 0;
}

function getEndlessCost(def){
  const corePressure = Math.pow(1.18, game.ultraCores || 0);
  return Math.floor(def.base * Math.pow(def.scale, getEndlessLevel(def.id)) * corePressure);
}

function getUltraCoinMultiplier(cores=game.ultraCores || 0){
  return 1 + Math.max(0, Number(cores) || 0) * 0.5;
}

function getEndlessClickMultiplier(){
  return Math.pow(1.0038, getEndlessLevel("voidClick")) * getUltraCoinMultiplier();
}

function getEndlessAutoMultiplier(){
  return Math.pow(1.0042, getEndlessLevel("afkEngine"));
}

function getEndlessPetMultiplier(){
  return Math.pow(1.0036, getEndlessLevel("petResonance"));
}

function getEndlessDiamondChanceMultiplier(){
  return Math.pow(1.0032, getEndlessLevel("diamondFlow")) * Math.pow(1.025, game.ultraCores || 0);
}

function getEndlessDiamondValueMultiplier(){
  return Math.pow(1.0025, getEndlessLevel("diamondFlow"));
}

function getUltraCoreCost(){
  const cores = game.ultraCores || 0;
  return Math.floor(2.5e11 * Math.pow(4.5, cores));
}

function getUltraCoreSummary(){
  const current = Math.round(getUltraCoinMultiplier() * 100);
  const next = Math.round(getUltraCoinMultiplier((game.ultraCores || 0) + 1) * 100);
  return `COINY ${current}% -> ${next}%`;
}

function getPetBonusTotals(){
  const resonance = getEndlessPetMultiplier();
  return getActivePets().reduce((acc, pet)=>{
    const levelMult = getPetLevelMultiplier(pet);
    acc.click += (pet.click || 0) * resonance * levelMult;
    acc.multi += (pet.multi || 0) * resonance * levelMult;
    acc.diamond += getPetDiamondBonusValue(pet) * resonance * levelMult;
    return acc;
  }, {click:0, multi:0, diamond:0});
}

function getDiamondMultiplier(){
  return (1 + getPetDiamondBonus()) * getEndlessDiamondValueMultiplier();
}

function getAllClickablePower(){
  const diamondClickUsable = game.diamondRushActive && game.diamondClickEnabled !== false;
  return (game.click + getPetClickBonus()) * (game.multi + getPetMultiBonus()) * game.rebirthMult * (diamondClickUsable ? 1.5 : 1) * getEndlessClickMultiplier() * getGlobalEventMultiplier("money") * getPersonalRewardMultiplier("money") * getActivePotionMultiplier("money") * getDailyStreakClickMultiplier() * getAppInstallBonusMultiplier() * getWeatherMultiplier("money") * getWeatherMultiplier("manualMoney");
}

function getAutoIntervalMs(){
  return Math.max(1800, 5000 - getAutoSpeedLevel() * 320);
}

function getAutoGain(){
  const level = Math.max(0, getAutoValueLevel());
  if(level <= 0) return 0;
  const shotPower = 1 + (level - 1) * 0.025;
  return getNormalClickPower() * shotPower * (game.frenzyActive ? 3 : 1) * getEndlessAutoMultiplier() * getWeatherMultiplier("autoMoney") / Math.max(1, getWeatherMultiplier("manualMoney"));
}

function buyEndlessUpgrade(id){
  if(!isEndlessUnlocked()){
    spawnPopup("VOID UPGRADES od rebirth 10!", false, false, true);
    return;
  }
  const def = ENDLESS_UPGRADES.find(item=>item.id === id);
  if(!def) return;
  const level = getEndlessLevel(id);
  if(level >= def.max) return;
  const price = getEndlessCost(def);
  if(game.score < price){
    spawnPopup("Za malo punktow!", false, false, true);
    return;
  }
  game.score -= price;
  game.endlessUpgrades[id] = level + 1;
  game.uiDirty = true;
  if((level + 1) % 25 === 0 || level === 0){
    triggerScreenEffect("void", "VOID +");
  }
  update(true, true);
}

function buyMaxEndlessUpgrade(id){
  if(!isEndlessUnlocked()) return;
  const def = ENDLESS_UPGRADES.find(item=>item.id === id);
  if(!def) return;
  let level = getEndlessLevel(id);
  const startLevel = level;
  while(level < def.max && game.score >= getEndlessCost(def)){
    game.score -= getEndlessCost(def);
    level++;
    game.endlessUpgrades[id] = level;
  }
  game.uiDirty = true;
  if(level > startLevel){
    triggerScreenEffect("void", "VOID MAX");
  }
  update(true, true);
}

function getUltraCorePetVisual(pet){
  return `
    <div class="ultraKeepOrb ${getPetVisualClasses(pet)} ${pet.secret ? "raritySecret" : getRarityClass(pet.rarity)}" style="background:${getPetVisualStyle(pet)}">
      <span>${pet.icon || ""}</span>
    </div>
  `;
}

function closeUltraPetKeepOverlay(){
  document.getElementById("ultraPetKeepOverlay")?.remove();
}

function openUltraPetKeepOverlay(){
  const price = getUltraCoreCost();
  const normalPets = getOwnedPets().filter(p=>!isProtectedPet(p));
  const secretPets = getOwnedPets().filter(isProtectedPet);
  const keepLimit = getUltraKeepPetLimit();
  const selected = new Set();
  const overlay = document.createElement("div");
  overlay.id = "ultraPetKeepOverlay";
  overlay.innerHTML = `
    <div id="ultraPetKeepCard">
      <div class="ultraKeepTop">
        <div>
          <b>ULTRA RDZEN</b>
          <span>Wybierz pety do nastepnego runa</span>
        </div>
        <button type="button" id="ultraPetKeepClose">x</button>
      </div>
      <div class="ultraKeepWarning">
        <b>Koszt: ${formatPoint(price)}</b>
        <span>${getUltraCoreSummary()} Zwykly run zostanie zresetowany, VOID UPGRADES zostana.</span>
      </div>
      <div class="ultraKeepSummary">
        <div><b>Secret / Exclusive</b><span>${secretPets.length} przechodzi automatycznie</span></div>
        <div><b>Zwykle pety</b><span id="ultraKeepCounter">0/${keepLimit}</span></div>
      </div>
      <div id="ultraPetKeepList">
        ${normalPets.length ? normalPets.map(pet=>`
          <button class="ultraKeepPetCard ${getPetVisualClasses(pet)} ${getRarityClass(pet.rarity)}" type="button" data-pet-uid="${pet.uid}">
            ${getUltraCorePetVisual(pet)}
            <b>${pet.displayName || pet.name}</b>
            <small>${pet.rarity || "Pet"} | +${format(pet.click || 0)} klik | x${(1 + (pet.multi || 0)).toFixed(2)}</small>
          </button>
        `).join("") : `<div class="ultraKeepEmpty">Nie masz zwyklych petow. Secret i Exclusive pety zostana automatycznie.</div>`}
      </div>
      <div class="ultraKeepFooter">
        <button type="button" class="eggChoiceBtn cancel" id="ultraPetKeepCancel">Anuluj</button>
        <button type="button" class="eggChoiceBtn" id="ultraPetKeepConfirm">Potwierdz Ultra Rdzen</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const counter = overlay.querySelector("#ultraKeepCounter");
  const sync = () => {
    if(counter) counter.textContent = `${selected.size}/${keepLimit}`;
    overlay.querySelectorAll("[data-pet-uid]").forEach(btn=>btn.classList.toggle("selected", selected.has(btn.dataset.petUid)));
  };
  overlay.querySelectorAll("[data-pet-uid]").forEach(btn=>{
    btn.addEventListener("click", () => {
      const uid = btn.dataset.petUid;
      if(selected.has(uid)){
        selected.delete(uid);
      }else if(selected.size < keepLimit){
        selected.add(uid);
      }else{
        spawnPopup(`Mozesz wybrac max ${keepLimit} petow.`, false, false, true);
      }
      sync();
    });
  });
  overlay.querySelector("#ultraPetKeepClose")?.addEventListener("click", closeUltraPetKeepOverlay);
  overlay.querySelector("#ultraPetKeepCancel")?.addEventListener("click", closeUltraPetKeepOverlay);
  overlay.addEventListener("click", event=>{
    if(event.target === overlay) closeUltraPetKeepOverlay();
  });
  overlay.querySelector("#ultraPetKeepConfirm")?.addEventListener("click", () => {
    try{
      if(finalizeUltraCoreReset([...selected]) !== false){
        closeUltraPetKeepOverlay();
      }
    }catch(err){
      console.error("Ultra core reset failed:", err);
      spawnPopup("Blad Ultra Rdzenia - sprawdz konsole.", false, false, true);
    }
  });
  sync();
}

function ultraCoreReset(){
  if(!isEndlessUnlocked()){
    spawnPopup("Ultra Rdzen od rebirth 10!", false, false, true);
    return;
  }
  const price = getUltraCoreCost();
  if(game.score < price){
    spawnPopup("Za malo punktow na Ultra Rdzen!", false, false, true);
    return;
  }
  openUltraPetKeepOverlay();
}

function finalizeUltraCoreReset(keptNormalPetIds=[]){
  const price = getUltraCoreCost();
  if(game.score < price){
    spawnPopup("Za malo punktow na Ultra Rdzen!", false, false, true);
    return false;
  }
  const keepLimit = getUltraKeepPetLimit();
  const keptSet = new Set(keptNormalPetIds.slice(0, keepLimit));
  const persistentPets = getOwnedPets().filter(p=>isProtectedPet(p) || keptSet.has(p.uid));
  const persistentIds = new Set(persistentPets.map(p=>p.uid));
  const nextCores = (game.ultraCores || 0) + 1;

  game.score = 0;
  game.rebirths = 0;
  game.rebirthMult = 1;
  game.click = 1;
  game.autoValue = 0;
  game.autoSpeed = 0;
  game.multi = 1;
  game.upgrades = {};
  game.pets = persistentPets;
  game.skins = Array.isArray(game.skins) ? game.skins : [];
  if(game.activeSkinId && !game.skins.some(s=>s.uid === game.activeSkinId)){
    game.activeSkinId = null;
  }
  game.activePetIds = (Array.isArray(game.activePetIds) ? game.activePetIds : []).filter(id=>persistentIds.has(id)).slice(0,getMaxActivePets());
  game.ultraCores = nextCores;
  game.ultraCoreBest = Math.max(game.ultraCoreBest || 0, game.ultraCores);
  game.holdCooldownRemaining = 0;
  game.holdDurationRemaining = 0;
  game.holdActive = false;
  if(holdPress){
    clearTimeout(holdPress);
    holdPress = null;
  }
  if(holdLoop){
    clearInterval(holdLoop);
    holdLoop = null;
  }
  autoAccumulator = 0;
  holdAccumulator = 0;
  game.autoEggMode = false;
  game.autoCrateMode = false;
  lastAutoEggId = null;
  lastAutoCrateId = null;
  game.frenzyActive = false;
  game.frenzyTimer = 0;
  game.diamondRushActive = false;
  game.diamondRushRemaining = 0;
  game.diamondRushCooldownRemaining = 0;
  game.uiDirty = true;

  spawnPopup(`ULTRA RDZEN ${game.ultraCores}!`, false, false, true);
  window.kretAudio?.superRebirth?.();
  triggerScreenEffect("ultra", `ULTRA RDZEN ${game.ultraCores}`);
  update(true, true);
  if(typeof requestCloudSave === "function"){
    requestCloudSave({force:true, reason:"superRebirth"});
  }
  return true;
}

function buyDiamondUpgrade(id){
  const def = diamondUpgradeCatalog.find(item=>item.id===id);
  if(!def) return;
  const level = getMetaLevel(id);
  if(level >= def.max) return;
  const price = getMetaCost(def);
  if(game.diamonds < price){
    spawnPopup("Za malo diamentow!", false, false, true);
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
    spawnPopup(`Maksymalnie ${getMaxActivePets()} aktywnych petow`, false, false, true);
    return;
  }

  const next = stack.find(p=>!game.activePetIds.includes(p.uid));
  if(!next) return;
  game.activePetIds.push(next.uid);
  game.uiDirty = true;
  update(true, true);
}

function renderEggPanel(){
  eggList.innerHTML = "";

  eggCatalog.forEach((egg, index)=>{
    const locked = !isEggUnlocked(egg);
    const canBuy = !locked && game.score >= egg.cost;
    const card = document.createElement("div");
    card.className = "eggCard" + (locked ? " locked eggLocked" : canBuy ? "" : " notAffordable");
    card.dataset.eggId = egg.id;
    if(!locked) card.onclick = ()=>hatchEgg(egg.id);
    const deleteCount = getAutoDeleteCountForEgg(egg);

    card.innerHTML = `
      <button class="eggSettingsBtn" type="button" data-egg-settings="${egg.id}" title="Auto-delete petow">⚙</button>
      <div class="eggTop">
        <div class="eggCircle" style="background:${egg.tint}"></div>
        <div class="eggMeta">
          <b>${getEggLabel(egg, index)}</b>
          <small>Cena: ${format(egg.cost)}<br>${locked ? `${UI_ICONS.lock} ${getEggUnlockText(egg)}` : "Dostepne teraz"}</small>
        </div>
      </div>
      <div style="margin-top:10px;display:grid;gap:6px;font-size:12px;line-height:1.35">
        ${egg.pets.map(pet=>`
          <div class="eggPetChanceRow ${isPetAutoDeleted(egg.id, pet.id) ? "autoDeleteOn" : ""}">
            <span>${getEggPetDisplayName(pet)}</span>
            <span style="opacity:.8">${pet.chanceLabel || getPetChanceLabel(egg, pet)}</span>
          </div>
        `).join("")}
      </div>
      <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;font-size:11px;opacity:.78">
        <span>${locked ? "Zablokowane" : canBuy ? "Gotowe do otwarcia" : "Za malo punktow!"}</span>
        <span>${deleteCount ? `AUTO-DEL ${deleteCount}` : `#${index + 1}`}</span>
      </div>
    `;
    card.querySelector("[data-egg-settings]")?.addEventListener("click", (event)=>{
      event.preventDefault();
      event.stopPropagation();
      openEggAutoDeleteSettings(egg.id);
    });
    eggList.appendChild(card);
  });

  eggDockBtn.classList.toggle("active", eggPanel.classList.contains("open"));
  crateDockBtn.classList.toggle("active", cratePanel.classList.contains("open"));
  petDockBtn.classList.toggle("active", petPanel.classList.contains("open"));
}

function showEggDenyFeedback(eggId, egg){
  const now = Date.now();
  if(now - lastEggDenyAt > 850){
    lastEggDenyAt = now;
    const missing = Math.max(0, (egg?.cost || 0) - (game.score || 0));
    spawnPopup(`Za malo coinsow! Potrzebujesz: ${format(egg?.cost || 0)}`, false, false, true);
    if(missing > 0 && typeof spawnDropToast === "function"){
      spawnDropToast({icon:"!", name:`Brakuje ${format(missing)}`, rarity:"alert"});
    }
  }
  const card = document.querySelector(`[data-egg-id="${eggId}"]`);
  if(card){
    card.classList.remove("eggDenied");
    void card.offsetWidth;
    card.classList.add("eggDenied");
    setTimeout(()=>card.classList.remove("eggDenied"), 520);
  }
}

function showCrateDenyFeedback(crateId, crate){
  const now = Date.now();
  if(now - lastCrateDenyAt > 850){
    lastCrateDenyAt = now;
    const missing = Math.max(0, (crate?.cost || 0) - (game.diamonds || 0));
    spawnPopup(`Za malo diamentow! Potrzebujesz: ${formatDiamond(crate?.cost || 0)}`, false, false, true);
    if(missing > 0 && typeof spawnDropToast === "function"){
      spawnDropToast({icon:"!", name:`Brakuje ${formatDiamond(missing)}`, rarity:"alert"});
    }
  }
  const card = document.querySelector(`[data-crate-id="${crateId}"]`);
  if(card){
    card.classList.remove("eggDenied");
    void card.offsetWidth;
    card.classList.add("eggDenied");
    setTimeout(()=>card.classList.remove("eggDenied"), 520);
  }
}

function getEggAutoDeleteMap(eggId){
  game.autoDeletePets = game.autoDeletePets && typeof game.autoDeletePets === "object" ? game.autoDeletePets : {};
  game.autoDeletePets[eggId] = game.autoDeletePets[eggId] && typeof game.autoDeletePets[eggId] === "object" ? game.autoDeletePets[eggId] : {};
  return game.autoDeletePets[eggId];
}

function isPetAutoDeleted(eggId, petId){
  return !!getEggAutoDeleteMap(eggId)[petId];
}

function getAutoDeleteCountForEgg(egg){
  return egg.pets.filter(pet=>isPetAutoDeleted(egg.id, pet.id)).length;
}

function closeEggAutoDeleteSettings(){
  document.getElementById("eggAutoDeleteOverlay")?.remove();
}

function openEggAutoDeleteSettings(eggId){
  const egg = getEggById(eggId);
  if(!egg) return;
  closeEggAutoDeleteSettings();
  const overlay = document.createElement("div");
  overlay.id = "eggAutoDeleteOverlay";
  overlay.innerHTML = `
    <div id="eggAutoDeleteCard">
      <div class="autoDeleteTop">
        <div><b>Auto-delete</b><span>${egg.name}</span></div>
        <button type="button" id="eggAutoDeleteClose">×</button>
      </div>
      <div class="autoDeleteList">
        ${egg.pets.map(pet=>`
          <button type="button" class="autoDeleteOption ${isPetAutoDeleted(egg.id, pet.id) ? "active" : ""}" data-auto-delete-pet="${pet.id}">
            <span class="petCircle ${getPetStyleClass(pet)} ${pet.secret ? "petStyleSecret" : ""}" style="background:${petVisualClass(pet)}"></span>
            <span><b>${getEggPetDisplayName(pet)}</b><small>${pet.rarity} | ${pet.chanceLabel || getPetChanceLabel(egg, pet)}</small></span>
            <em>${isPetAutoDeleted(egg.id, pet.id) ? "USUWANE" : "ZOSTAJE"}</em>
          </button>
        `).join("")}
      </div>
      <div class="autoDeleteHint">Pet dalej pokazuje sie w hatchu, ale z ikona kosza i nie trafia do plecaka.</div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", event=>{ if(event.target === overlay) closeEggAutoDeleteSettings(); });
  overlay.querySelector("#eggAutoDeleteClose")?.addEventListener("click", closeEggAutoDeleteSettings);
  overlay.querySelectorAll("[data-auto-delete-pet]").forEach(button=>{
    button.addEventListener("click", ()=>{
      const map = getEggAutoDeleteMap(egg.id);
      const petId = button.dataset.autoDeletePet;
      map[petId] = !map[petId];
      if(!map[petId]) delete map[petId];
      game.uiDirty = true;
      update(true, false);
      closeEggAutoDeleteSettings();
      renderEggPanel();
      openEggAutoDeleteSettings(egg.id);
    });
  });
}

function renderCratePanel(){
  crateList.innerHTML = "";

  crateCatalog.forEach((crate, index)=>{
    const canBuy = game.diamonds >= crate.cost;
    const total = crate.skins.reduce((sum, skin)=>sum + skin.weight, 0);
    const card = document.createElement("div");
    card.className = "eggCard" + (canBuy ? "" : " notAffordable");
    card.dataset.crateId = crate.id;
    card.onclick = ()=>canBuy ? openCrate(crate.id) : showCrateDenyFeedback(crate.id, crate);

    card.innerHTML = `
      <div class="eggTop">
        <div class="eggCircle" style="background:${crate.tint}"></div>
        <div class="eggMeta">
          <b>${getCrateLabel(crate, index)}</b>
          <small>Cena: ${formatDiamond(crate.cost)}<br>Dostepne teraz</small>
        </div>
      </div>
      <div style="margin-top:10px;display:grid;gap:6px;font-size:12px;line-height:1.35">
        ${crate.skins.map(skin=>`
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
            <span>${skin.name}</span>
            <span style="opacity:.8">${((skin.weight / total) * 100).toFixed(((skin.weight / total) * 100) < 2 ? 1 : 0)}%</span>
          </div>
        `).join("")}
      </div>
      <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;font-size:11px;opacity:.78">
        <span>${canBuy ? "Gotowa do otwarcia" : "Za malo diamentow!"}</span>
        <span>${formatDiamond(game.diamonds)}</span>
      </div>
    `;
    crateList.appendChild(card);
  });
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
      <b>Brak skinow</b>
      <small>Otworz skrzynke, zeby zdobyc kosmetyczny skin.</small>
    `;
    skinList.appendChild(empty);
    return;
  }

  groups.forEach(group=>{
    const count = group.items.length;
    const selectedCount = group.items.filter(s=>s.uid===game.activeSkinId).length;
    const protectedItem = group.items.some(s=>s.exclusive || String(s.rarity || "").toLowerCase().includes("exclusive"));
    const card = document.createElement("div");
    card.className = "petCard skinInventoryCard" + (selectedCount ? " petSelected" : "") + " " + getRarityClass(group.rarity);
    card.title = appendExistTitle("Kosmetyczny skin", "skins", group.templateId);
    card.onclick = ()=>toggleSkinStack(group.templateId);

    card.innerHTML = `
      <button class="inventoryDeleteBtn" type="button" data-delete-skin="${group.templateId}" title="Usun skiny">×</button>
      <div class="petStack">x${count}</div>
      <div class="petTop">
        <div class="petCircle skinPreview ${group.items[0].skinClass}" style="background:linear-gradient(135deg,${group.items[0].accent},#fff)"></div>
        <div class="petMeta">
          <b>${group.name}</b>
          <small>${group.rarity}<br>Kosmetyczny skin</small>
        </div>
      </div>
      <div class="petBadge">${selectedCount ? "Zalozony" : "Kliknij, aby zalozyc"}</div>
    `;
    if(protectedItem) card.querySelector("[data-delete-skin]")?.remove();
    card.querySelector("[data-delete-skin]")?.addEventListener("click", (event)=>{
      event.preventDefault();
      event.stopPropagation();
      deleteSkinGroup(group);
    });
    skinList.appendChild(card);
  });

  if(title){
    title.textContent = `Skiny: ${getOwnedSkins().length} | Aktywny: ${game.activeSkinId ? 1 : 0}`;
  }
}

function showEggChoice(eggId){
  const egg = getEggById(eggId);
  if(!egg) return;
  const batchCount = Math.min(getEggBatchSize(), getAffordableEggCount(egg));
  if(hasAutoEggUnlock() && game.autoEggMode){
    hatchEggBatch(eggId, batchCount);
    return;
  }
  if(batchCount <= 1){
    hatchEggBatch(eggId, 1);
    return;
  }
  pendingEggChoice = eggId;
  eggChoiceInfo.textContent = `${egg.name} | Mozesz kupic 1 albo ${batchCount} jajek.`;
  buyOneEggBtn.onclick = ()=>hatchEggBatch(eggId, 1);
  buyBatchEggBtn.onclick = ()=>hatchEggBatch(eggId, batchCount);
  buyBatchEggBtn.textContent = `Kup x${batchCount}`;
  eggChoiceOverlay.classList.add("open");
}

function runEggReveal(egg, pets){
  const list = Array.isArray(pets) ? pets : [pets];
  const autoWillContinue = hasAutoEggUnlock() && game.autoEggMode;
  const speedFactor = getHatchSpeedFactor();
  const shakeMs = Math.round(2800 * speedFactor);
  const crackMs = Math.round(500 * speedFactor);
  const resultMs = Math.round((1700 - getMetaLevel("hatchSpeed") * 250) * speedFactor);

  hatchBusy = true;
  hatchOverlay.classList.add("open");
  hatchOverlay.classList.remove("crateMode");
  hatchOverlay.classList.toggle("autoMode", autoWillContinue);
  hatchOverlay.classList.toggle("voidOpening", !!egg.voidEgg);
  hatchOverlay.classList.toggle("rareDrop", list.some(pet=>pet.secret || ["Epicki","Mityczny","Legendarny","Sekretny"].includes(pet.rarity) || pet.shiny || pet.variant === "gold" || pet.variant === "diamond"));
  if(stopAutoEggBtn) stopAutoEggBtn.textContent = "WYLACZ AUTOOTWIERANIE";
  hatchPhaseLabel.textContent = `${egg.name.toUpperCase()} SIE OTWIERA`;
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
    const rarityClass = pet.secret ? "raritySecret" : getRarityClass(pet.rarity);
    const variantClass = getPetVariantClass(pet);
    petCard.className = `hatchPetCard ${rarityClass} ${variantClass} ${pet.secret ? "secretDrop" : ""} ${pet.autoDeleted ? "autoDeletedDrop" : ""}`;
    petCard.innerHTML = `
      <div class="hatchPetVisual ${getPetVisualClasses(pet)}" style="background:${petVisualClass(pet)}">
        <div class="petTinyFace"></div>
        <div class="petTinyMouth"></div>
        <div class="petTinyIcon">${pet.icon}</div>
      </div>
      ${pet.autoDeleted ? `<div class="hatchTrashOverlay">🗑</div>` : ""}
      <div class="hatchRarityBadge">${getPetVariantLabel(pet)} | ${pet.rarity}</div>
      <div class="hatchPetName">${pet.name}</div>
      <div class="hatchPetStats">${pet.autoDeleted ? "AUTO-DELETE<br>" : ""}+${pet.click} klik | punkty x${(1 + pet.multi).toFixed(2)}<br>diamenty x${(1 + getPetDiamondBonusValue(pet)).toFixed(2)}</div>
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
    if(hatchOverlay.classList.contains("rareDrop")){
      triggerScreenEffect(egg.voidEgg ? "void" : "rare", egg.voidEgg ? "VOID DROP" : "RARE DROP");
    }
  }, shakeMs + crackMs);

  setTimeout(()=>{
    hatchOverlay.classList.remove("open");
    hatchOverlay.classList.remove("autoMode");
    hatchOverlay.classList.remove("crateMode");
    hatchOverlay.classList.remove("voidOpening", "rareDrop");
    hatchResult.classList.remove("show");
    hatchBusy = false;
    update(true, true);
    if(game.autoEggMode && String(lastAutoEggId || "").startsWith("inventory:")){
      const inventoryEggId = String(lastAutoEggId).slice("inventory:".length);
      const owned = (Array.isArray(game.inventoryEggs) ? game.inventoryEggs : []).filter(item=>item.eggId === inventoryEggId).length;
      if(owned > 0){
        setTimeout(()=>hatchInventoryEggBatch(inventoryEggId, Math.min(getEggBatchSize(), owned)), 160);
        return;
      }
      lastAutoEggId = null;
    }
    if(game.autoEggMode && lastAutoEggId === egg.id && isEggUnlocked(egg) && game.score >= egg.cost){
      setTimeout(()=>hatchEggBatch(egg.id, Math.min(getEggBatchSize(), getAffordableEggCount(egg))), 160);
    }
  }, shakeMs + crackMs + resultMs);
}

function runCrateReveal(crate, skin){
  const autoWillContinue = hasAutoEggUnlock() && game.autoCrateMode;
  const speedFactor = getHatchSpeedFactor();
  const shakeMs = Math.round(2200 * speedFactor);
  const crackMs = Math.round(520 * speedFactor);
  const resultMs = Math.round((1600 - getMetaLevel("hatchSpeed") * 220) * speedFactor);

  hatchBusy = true;
  hatchOverlay.classList.add("open", "crateMode");
  hatchOverlay.classList.toggle("autoMode", autoWillContinue);
  hatchOverlay.classList.toggle("voidOpening", !!crate.voidCrate);
  hatchOverlay.classList.toggle("rareDrop", skin.rarity === "Sekretny" || skin.rarity === "Mityczny" || skin.skinClass?.includes("void"));
  if(stopAutoEggBtn) stopAutoEggBtn.textContent = "WYLACZ AUTO SKRZYNKI";
  hatchPhaseLabel.textContent = `${crate.name.toUpperCase()} SIE OTWIERA`;
  hatchEggsRow.innerHTML = "";
  hatchResult.classList.remove("show");
  hatchPetsGrid.innerHTML = "";

  const crateVisual = document.createElement("div");
  crateVisual.className = "hatchCrateVisual shaking";
  crateVisual.style.background = crate.tint;
  hatchEggsRow.appendChild(crateVisual);

  const skinCard = document.createElement("div");
  skinCard.className = `hatchPetCard skinDrop ${getRarityClass(skin.rarity)} ${skin.skinClass?.includes("boss") ? "secretDrop" : ""}`;
  skinCard.innerHTML = `
    <div class="hatchPetVisual skinPreview ${skin.skinClass}" style="background:linear-gradient(135deg,${skin.accent},#fff)">
      <div class="petTinyFace"></div>
      <div class="petTinyMouth"></div>
      <div class="petTinyIcon">${UI_ICONS.crate}</div>
    </div>
    <div class="hatchRarityBadge">${skin.rarity}</div>
    <div class="hatchPetName">${skin.name}</div>
    <div class="hatchPetStats">Skin kosmetyczny<br>Aura i wyglad zostaja po rebirthie</div>
  `;
  hatchPetsGrid.appendChild(skinCard);

  setTimeout(()=>{
    hatchEggsRow.querySelectorAll(".hatchCrateVisual").forEach(node=>{
      node.classList.remove("shaking");
      node.classList.add("opening");
    });
  }, shakeMs);

  setTimeout(()=>{
    hatchEggsRow.querySelectorAll(".hatchCrateVisual").forEach(node=>node.classList.remove("opening"));
    hatchPhaseLabel.textContent = "WYLOSOWANY SKIN";
    hatchResult.classList.add("show");
    if(hatchOverlay.classList.contains("rareDrop")){
      triggerScreenEffect(crate.voidCrate ? "void" : "rare", crate.voidCrate ? "VOID SKIN" : "RARE SKIN");
    }
  }, shakeMs + crackMs);

  setTimeout(()=>{
    hatchOverlay.classList.remove("open");
    hatchOverlay.classList.remove("autoMode");
    hatchOverlay.classList.remove("crateMode");
    hatchOverlay.classList.remove("voidOpening", "rareDrop");
    hatchResult.classList.remove("show");
    hatchBusy = false;
    update(true, true);
    if(game.autoCrateMode && lastAutoCrateId === crate.id && isCrateUnlocked(crate) && game.diamonds >= crate.cost){
      setTimeout(()=>openCrate(crate.id), 180);
    }
  }, shakeMs + crackMs + resultMs);
}

function openCrate(crateId){
  const crate = crateCatalog.find(c=>c.id===crateId);
  if(hatchBusy || !crate || !isCrateUnlocked(crate)) return;
  if(game.diamonds < crate.cost){
    showCrateDenyFeedback(crateId, crate);
    return;
  }

  game.diamonds -= crate.cost;
  game.uiDirty = true;
  lastAutoCrateId = game.autoCrateMode ? crateId : null;
  const template = rollSkinFromCrate(crate);
  const skin = addSkinToInventory(template, crate);
  trackExist("skins", skin.templateId);

  eggPanel.classList.remove("open");
  cratePanel.classList.remove("open");
  petPanel.classList.remove("open");
  diamondPanel.classList.remove("open");
  eggChoiceOverlay.classList.remove("open");
  pendingEggChoice = null;
  renderSideUi(true);
  runCrateReveal(crate, skin);
}

function hatchEggBatch(eggId, requestedCount){
  const egg = getEggById(eggId);
  if(hatchBusy || !egg || !isEggUnlocked(egg)) return;
  if(game.score < egg.cost){
    showEggDenyFeedback(eggId, egg);
    return;
  }

  const count = Math.max(1, Math.min(requestedCount, getAffordableEggCount(egg)));
  const pets = [];
  game.score -= egg.cost * count;
  game.openedEggs = (game.openedEggs || 0) + count;
  game.uiDirty = true;
  lastAutoEggId = game.autoEggMode ? eggId : null;

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

function hatchEgg(eggId){
  const egg = getEggById(eggId);
  if(hatchBusy || !egg || !isEggUnlocked(egg)) return;
  if(game.score < egg.cost){
    showEggDenyFeedback(eggId, egg);
    return;
  }

  if(hasAutoEggUnlock() && game.autoEggMode){
    hatchEggBatch(eggId, Math.min(getEggBatchSize(), getAffordableEggCount(egg)));
    return;
  }

  if(getEggBatchSize() <= 1){
    hatchEggBatch(eggId, 1);
    return;
  }

  showEggChoice(eggId);
}

let diamondPanelRenderSignature = "";

function getDiamondPanelSignature(){
  return [
    Math.floor(Number(game.diamonds) || 0),
    Number(game.rebirths) || 0,
    Number(game.ultraCores) || 0,
    Number(game.ultraCoreBest) || 0,
    JSON.stringify(game.metaUpgrades || {}),
    game.autoEggMode ? 1 : 0,
    game.autoCrateMode ? 1 : 0,
    game.diamondRushEnabled ? 1 : 0,
    game.diamondRushActive ? 1 : 0
  ].join("|");
}

function renderDiamondPanel(){
  diamondUpgradeList.innerHTML = "";
  const headerNote = diamondPanel.querySelector(".slideHeader span");
  if(headerNote){
    headerNote.textContent = "Meta ulepszenia sa trwale, nie resetuja sie i nie usuwaja przy rebirthie.";
  }

  diamondUpgradeCatalog.forEach(def=>{
    const level = getMetaLevel(def.id);
    const maxed = level >= def.max;
    const price = getMetaCost(def);
    const rebirthLocked = !!def.unlockAtRebirth && game.rebirths < def.unlockAtRebirth;
    const rushLocked = def.id !== "diamondRushUnlock" && def.id.startsWith("diamondRush") && !hasDiamondRush();
    const locked = rebirthLocked || rushLocked;
    const affordable = game.diamonds >= price && !maxed && !locked;
    const card = document.createElement("div");
    card.className = "eggCard diamondCard" + (!affordable && !maxed ? " locked" : "");
    if(affordable){
      card.onclick = ()=>buyDiamondUpgrade(def.id);
    }

    const infoBtn = document.createElement("button");
    infoBtn.className = "infoDot";
    infoBtn.textContent = "i";
    infoBtn.onclick = (e)=>{
      e.stopPropagation();
      openUpgradeInfo(def.name, upgradeInfoMap[def.id] || def.desc);
    };
    card.appendChild(infoBtn);

    let extra = "Trwale ulepszenie";
    if(def.id === "eggBatch"){
      extra = `Teraz: ${getEggBatchSize()} jajko/a naraz`;
    } else if(def.id === "petSlots"){
      extra = `Teraz: ${getMaxActivePets()} aktywnych petow`;
    } else if(def.id === "autoEgg"){
      extra = hasAutoEggUnlock() ? `Tryb auto: ${game.autoEggMode ? "ON" : "OFF"}` : "Odblokowuje auto otwieranie";
    } else if(def.id === "hatchSpeed"){
      extra = `Szybkosc: x${(1 / getHatchSpeedFactor()).toFixed(2)}`;
    } else if(def.id === "goldChance"){
      extra = `Szansa: ${(getGoldClickChance() * 100).toFixed(1)}% | klik x5`;
    } else if(def.id === "diamondRushUnlock"){
      extra = hasDiamondRush() ? "Odblokowane na stale" : "Od rebirth 5";
    } else if(def.id === "diamondRushCooldown"){
      extra = `Cooldown: ${Math.round(getDiamondRushCooldownMs() / 1000)}s`;
    } else if(def.id === "diamondRushDuration"){
      extra = `Czas: ${Math.round(getDiamondRushDurationMs() / 1000)}s`;
    } else if(def.id === "diamondRushBoost"){
      extra = `Boost diamentow: x${getDiamondRushChanceBoost()}`;
    } else if(def.id === "diamondChance"){
      extra = `Mnoznik szansy: x${getDiamondChanceUpgradeMultiplier().toFixed(2)}`;
    } else if(def.id === "ultraKeepPets"){
      extra = `Zachowasz: ${getUltraKeepPetLimit()} zwykle pety`;
    }

    let status = "Gotowe";
    if(rebirthLocked){
      status = `Od rebirth ${def.unlockAtRebirth}`;
    } else if(rushLocked){
      status = "Najpierw kup DIAMOND CLICK";
    } else if(maxed){
      status = "MAX";
    } else if(!affordable){
      status = "Za malo diamentow!";
    }

    const priceLabel = maxed ? "Gotowe" : formatDiamond(price);
    const top = document.createElement("div");
    top.className = "eggTop";
    top.innerHTML = `
      <div class="eggCircle" style="background:linear-gradient(135deg,#5ad9ff,#3466ff)"></div>
      <div class="eggMeta">
        <b>${def.name}</b>
        <small>${def.desc}<br>${extra}</small>
      </div>
    `;
    card.appendChild(top);

    const badge = document.createElement("div");
    badge.className = "petBadge";
    badge.textContent = status;
    card.appendChild(badge);

    const footer = document.createElement("div");
    footer.style.marginTop = "8px";
    footer.style.display = "flex";
    footer.style.justifyContent = "space-between";
    footer.style.alignItems = "center";
    footer.style.fontSize = "11px";
    footer.style.opacity = ".82";
    footer.innerHTML = `<span>${level}/${def.max}</span><span>${priceLabel}</span>`;
    card.appendChild(footer);

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

function renderDiamondPanelStable(force=false){
  const signature = getDiamondPanelSignature();
  if(!force && signature === diamondPanelRenderSignature){
    diamondDockBtn?.classList.toggle("active", diamondPanel?.classList.contains("open"));
    return;
  }
  diamondPanelRenderSignature = signature;
  renderDiamondPanel();
}

function renderPetPanel(){
  petList.innerHTML = "";
  const groups = groupPetsByTemplate();
  const activeCount = game.activePetIds.length;
  const totals = getPetBonusTotals();
  const title = petPanel.querySelector(".slideHeader span");

  const summary = document.createElement("div");
  summary.className = "petCard";
  summary.innerHTML = `
    <b>Aktywne bonusy</b>
    <small>Punkty x${(1 + totals.multi).toFixed(2)} | Diamenty x${(1 + totals.diamond).toFixed(2)}<br>+${totals.click} do kliku</small>
  `;
  petList.appendChild(summary);

  if(!groups.length){
    if(title){
      title.textContent = `Plecak: 0 | Aktywne: 0/${getMaxActivePets()}`;
    }
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `
      <b>Brak petow</b>
      <small>Otworz jajko, zeby zdobyc pierwszego pupila.</small>
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
          <small>${group.rarity}<br>${getPetPowerSummary(group.items[0])}</small>
        </div>
      </div>
      <div class="petBadge">${selectedCount ? `Aktywny ${selectedCount}/${count}` : "Kliknij, aby zalozyc"}</div>
    `;
    petList.appendChild(stack);
  });

  if(title){
    title.textContent = `Plecak: ${getOwnedPets().length} | Aktywne: ${activeCount}/${getMaxActivePets()}`;
  }
}

function renderActivePets(){
  activePetStage.innerHTML = "";
  const activePets = getActivePets();
  const centerX = 160;
  const centerY = 152;
  const radius = activePets.length <= 2 ? 88 : activePets.length <= 4 ? 98 : 110;

  activePets.forEach((pet, index)=>{
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / Math.max(1, activePets.length)) * index;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const wrap = document.createElement("div");
    wrap.className = "activePetWrap";
    wrap.style.position = "absolute";
    wrap.style.left = `${x}px`;
    wrap.style.top = `${y}px`;
    wrap.style.transform = "translate(-50%, -50%)";
    wrap.style.animation = `petFloat ${1.6 + (index % 3) * 0.2}s ease-in-out infinite`;

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

function updateHoldPanel(){
  if(game.rebirths < 3){
    holdPanel.style.display = "none";
    return;
  }

  holdPanel.style.display = "flex";

  if(game.holdActive){
    holdState.textContent = "TRZYMASZ";
    holdHint.textContent = "Pozostalo: " + formatSeconds(game.holdDurationRemaining);
    holdFill.style.width = Math.max(0, Math.min(100, 100 - (game.holdDurationRemaining / getHoldDurationMs()) * 100)) + "%";
  } else if(game.holdCooldownRemaining > 0){
    holdState.textContent = "COOLDOWN";
    holdHint.textContent = "Pozostalo: " + formatSeconds(game.holdCooldownRemaining);
    holdFill.style.width = Math.max(0, Math.min(100, 100 - (game.holdCooldownRemaining / getHoldCooldownMs()) * 100)) + "%";
  } else {
    holdState.textContent = "GOTOWE";
    holdHint.textContent = "Przytrzymaj, zeby szybciej nabic punkty.";
    holdFill.style.width = "100%";
  }

  holdCooldownLine.textContent = "Cooldown: " + (getHoldCooldownMs() / 1000).toFixed(1) + "s";
  holdPowerLine.textContent = "Moc: " + getHoldPowerLabel();
  holdDurationLine.textContent = "Czas trwania: " + (getHoldDurationMs() / 1000).toFixed(1) + "s";
}

function updateAutoPanel(){
  if(getAutoValueLevel() <= 0 && getAutoSpeedLevel() <= 0){
    autoPanel.style.display = "none";
    return;
  }

  autoPanel.style.display = "flex";
  autoPanel.classList.toggle("toggleOff", game.autoClickEnabled === false);
  ensurePanelToggle(autoPanel, "autoToggleBtn", game.autoClickEnabled !== false, () => {
    game.autoClickEnabled = game.autoClickEnabled === false;
    game.uiDirty = true;
    update(true, false);
  });
  autoIntervalLine.textContent = "Tempo: " + (getAutoIntervalMs() / 1000).toFixed(1) + "s";
  autoValueLine.textContent = "Moc: " + getAutoValueLevel();
  autoGainLine.textContent = game.autoClickEnabled === false ? "Status: OFF" : "Na strzal: " + formatPoint(getAutoGain());
}

function updateDiamondClickPanel(){
  if(!hasDiamondRush()){
    diamondClickPanel.style.display = "none";
    return;
  }

  diamondClickPanel.style.display = "flex";
  diamondClickPanel.classList.toggle("toggleOff", game.diamondClickEnabled === false);
  ensurePanelToggle(diamondClickPanel, "diamondToggleBtn", game.diamondClickEnabled !== false, () => {
    game.diamondClickEnabled = game.diamondClickEnabled === false;
    game.uiDirty = true;
    update(true, false);
  });
  diamondClickCooldownLine.textContent = game.diamondClickEnabled === false
    ? (game.diamondRushActive ? "OFF | Timer: " + Math.max(0, Math.ceil(game.diamondRushRemaining / 1000)) + "s" : "OFF | Cooldown: " + Math.max(0, Math.ceil(game.diamondRushCooldownRemaining / 1000)) + "s")
    : game.diamondRushActive
    ? "Status: AKTYWNY"
    : "Cooldown: " + Math.max(0, Math.ceil(game.diamondRushCooldownRemaining / 1000)) + "s";
  diamondClickDurationLine.textContent = "Czas: " + Math.round(getDiamondRushDurationMs() / 1000) + "s";
  diamondClickBoostLine.textContent = `Boost: x${getDiamondRushChanceBoost()} diax | punkty x1.5`;
  if(diamondClickFill){
    const fill = game.diamondRushActive
      ? 100 - ((game.diamondRushRemaining / Math.max(1, getDiamondRushDurationMs())) * 100)
      : 100 - ((game.diamondRushCooldownRemaining / Math.max(1, getDiamondRushCooldownMs())) * 100);
    diamondClickFill.style.width = Math.max(0, Math.min(100, fill)) + "%";
  }
  if(diamondClickHint){
    diamondClickHint.textContent = game.diamondClickEnabled === false ? "Diamond click jest wylaczony." : game.diamondRushActive ? "Bonus jest aktywny." : "Stale ulepszenie za diamenty.";
  }
}

function ensurePanelToggle(panel, id, enabled, onClick){
  let btn = panel.querySelector("#" + id);
  if(!btn){
    btn = document.createElement("button");
    btn.id = id;
    btn.className = "panelToggleBtn";
    btn.type = "button";
    panel.insertBefore(btn, panel.children[1] || null);
  }
  btn.textContent = enabled ? "ON" : "OFF";
  btn.classList.toggle("off", !enabled);
  btn.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  };
}

function handleNormalClick(){
  if(hatchBusy || rebirthOverlayOpen) return;
  const now = Date.now();
  if(now - lastManualClickAt < HIDDEN_MANUAL_CLICK_COOLDOWN_MS){
    return;
  }
  lastManualClickAt = now;
  let val = getNormalClickPower();

  const isCrit = Math.random()<game.critChance;
  if(isCrit) val*=game.critMulti;

  const isGold = Math.random() < getGoldClickChance();
  if(isGold) val*=5;

  const isFrenzyTrigger = Math.random()<game.frenzyChance;
  if(isFrenzyTrigger && !game.frenzyActive){
    game.frenzyActive=true;
    game.frenzyTimer=5;
    kret.classList.add("frenzy");
    spawnPopup("FRENZY!", false, true);
  }

  if(game.frenzyActive) val*=3;

  game.score+=val;
  game.clicks = (game.clicks || 0) + 1;
  registerDailyStreakManualClick();
  game.uiDirty = true;
  maybeDropDiamond("click");

  animateKret(isCrit || isGold);
  spawnPopup("+"+format(val), isCrit);
  if(isGold){
    spawnPopup("GOLD x5", false, false, true);
  }

  update(true, false);
}

function makeNormalUpgradeCard(u){
  const lvl = game.upgrades[u.id] || 0;
  const max = typeof u.max==="function" ? u.max(game) : u.max;
  const c = cost(u);
  const locked = u.unlock && !u.unlock(game);
  const maxed = max && lvl>=max;
  const affordable = game.score>=c && !locked && !maxed;

  const div=document.createElement("div");
  div.className="card";
  div.dataset.upgradeId = u.id;

  if(locked || maxed || !affordable) div.classList.add("disabled");
  if(locked) div.classList.add("lockedUpgrade");

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

  const infoBtn = document.createElement("button");
  infoBtn.className = "infoDot";
  infoBtn.textContent = "i";
  infoBtn.onclick = (e)=>{
    e.stopPropagation();
    openUpgradeInfo(getUpgradeDisplayName(u), upgradeInfoMap[u.id] || "To ulepszenie wzmacnia ten element gry.");
  };
  div.appendChild(infoBtn);

  let statusLine = "";
  if(locked) statusLine = `${UI_ICONS.lock} Od rebirth ${u.unlockAt ?? 1}`;
  else if(maxed) statusLine = "MAX";
  else if(!affordable) statusLine = "Za malo punktow!";
  else statusLine = "Klik LPM / PPM max";

  const title = document.createElement("div");
  title.className = "cardTitleRow";
  title.innerHTML = `
    <div class="cardTitleText">
      <b>${getUpgradeDisplayName(u)}</b>
      <small>${lvl}/${max}</small>
    </div>
  `;
  div.appendChild(title);

  const costNode = document.createElement("div");
  costNode.style.marginTop = "10px";
  costNode.style.fontWeight = "700";
  costNode.textContent = formatPoint(c);
  div.appendChild(costNode);

  const statusNode = document.createElement("div");
  statusNode.style.marginTop = "8px";
  statusNode.style.fontSize = "12px";
  statusNode.className = "cardStatus";
  statusNode.textContent = statusLine;
  div.appendChild(statusNode);

  if(locked){
    const lockMark = document.createElement("div");
    lockMark.className = "lockMark";
    lockMark.textContent = UI_ICONS.lock;
    div.appendChild(lockMark);
  }

  return div;
}

function makeEndlessUpgradeCard(def){
  const lvl = getEndlessLevel(def.id);
  const maxed = lvl >= def.max;
  const price = getEndlessCost(def);
  const affordable = isEndlessUnlocked() && game.score >= price && !maxed;
  const card = document.createElement("div");
  card.className = "card endlessCard" + (!affordable ? " disabled" : "");
  card.dataset.endlessId = def.id;

  if(affordable){
    card.onclick = ()=>buyEndlessUpgrade(def.id);
    card.oncontextmenu = (e)=>{
      e.preventDefault();
      buyMaxEndlessUpgrade(def.id);
    };
  }

  let live = "";
  if(def.id === "voidClick") live = `Bonus klikow: x${getEndlessClickMultiplier().toFixed(2)}`;
  else if(def.id === "afkEngine") live = `Bonus autoclicka: x${getEndlessAutoMultiplier().toFixed(2)}`;
  else if(def.id === "petResonance") live = `Bonus petow: x${getEndlessPetMultiplier().toFixed(2)}`;
  else if(def.id === "diamondFlow") live = `Diamenty: x${getEndlessDiamondChanceMultiplier().toFixed(2)} szansa`;

  card.innerHTML = `
    <div class="cardTitleRow">
      <div class="cardTitleText">
        <b>${def.name}</b>
        <small>${lvl}/${def.max}</small>
      </div>
    </div>
    <div class="voidLiveLine">${live}</div>
    <div class="voidCostLine">${maxed ? "MAX" : formatPoint(price)}</div>
    <div class="cardStatus" style="margin-top:8px;font-size:12px">${maxed ? "MAX" : affordable ? "Klik LPM / PPM max" : "Za malo punktow!"}</div>
  `;
  const infoBtn = document.createElement("button");
  infoBtn.className = "infoDot";
  infoBtn.textContent = "i";
  infoBtn.onclick = (e)=>{
    e.stopPropagation();
    openUpgradeInfo(def.name, def.desc + " PPM kupuje maksymalnie tyle poziomow, ile mozesz.");
  };
  card.appendChild(infoBtn);
  return card;
}

function makeUltraCoreCard(){
  const price = getUltraCoreCost();
  const affordable = isEndlessUnlocked() && game.score >= price;
  const card = document.createElement("div");
  card.className = "card endlessCard ultraCoreCard" + (!affordable ? " disabled" : "");
  card.dataset.ultraCore = "1";
  card.onclick = ()=>ultraCoreReset();

  card.innerHTML = `
    <div class="cardTitleRow">
      <div class="cardTitleText">
        <b>ULTRA RDZEN</b>
        <small>${game.ultraCores || 0}/∞</small>
      </div>
    </div>
    <div class="voidLiveLine">${getUltraCoreSummary()}</div>
    <div class="voidCostLine">${formatPoint(price)}</div>
    <div class="cardStatus" style="margin-top:8px;font-size:12px">${affordable ? "Kliknij, aby zrobic rdzen" : "Za malo punktow!"}</div>
  `;
  const infoBtn = document.createElement("button");
  infoBtn.className = "infoDot";
  infoBtn.textContent = "i";
  infoBtn.onclick = (e)=>{
    e.stopPropagation();
    openUpgradeInfo("ULTRA RDZEN", "Super rebirth po rebirth 10. Resetuje zwykly run, ale zostawia VOID UPGRADES i daje staly rdzen wzmacniajacy klik, AFK oraz diamenty.");
  };
  card.appendChild(infoBtn);
  return card;
}

function renderShop(){
  shop.innerHTML="";
  shop.classList.toggle("voidPreviewLayout", !isEndlessUnlocked());
  shop.classList.toggle("voidUnlockedLayout", isEndlessUnlocked());
  const shopOrder = ["click","autoValue","autoSpeed","multi","frenzy","critC","critM","holdCooldown","holdDuration","holdPower"];
  const orderedUpgrades = [...upgrades].sort((a,b)=>{
    const aIndex = shopOrder.indexOf(a.id);
    const bIndex = shopOrder.indexOf(b.id);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  const normalColumn = document.createElement("div");
  normalColumn.className = "shopColumn normalColumn";
  orderedUpgrades.forEach(u=>normalColumn.appendChild(makeNormalUpgradeCard(u)));
  shop.appendChild(normalColumn);

  const endlessColumn = document.createElement("div");
  endlessColumn.className = "shopColumn endlessColumn" + (isEndlessUnlocked() ? " voidUnlocked" : " voidPreview");
  const header = document.createElement("div");
  header.className = "shopSectionHeader";
  header.innerHTML = isEndlessUnlocked()
    ? `<b>VOID UPGRADES</b><small>${game.ultraCoreBest ? "Odblokowane na stale po Ultra Rdzeniu." : "Po rebirth 10. Trwale endgame upgrade i Ultra Rdzenie."}</small>`
    : `<b>${UI_ICONS.lock} VOID UPGRADES</b><small>Odblokuj rebirth 10. Po Ultra Rdzeniu zostaja widoczne na zawsze.</small>`;
  endlessColumn.appendChild(header);

  if(isEndlessUnlocked()){
    ENDLESS_UPGRADES.forEach(def=>endlessColumn.appendChild(makeEndlessUpgradeCard(def)));
    endlessColumn.appendChild(makeUltraCoreCard());
  }

  shop.appendChild(endlessColumn);
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
    card.classList.toggle("lockedUpgrade", !!locked);
    card.onclick = (!locked && !maxed) ? () => {
      const liveLvl = game.upgrades[u.id] || 0;
      const liveMax = typeof u.max==="function" ? u.max(game) : u.max;
      const liveCost = cost(u);
      if(liveMax && liveLvl >= liveMax){
        update();
        return;
      }
      if(game.score < liveCost){
        spawnPopup("Za malo punktow!", false, false, true);
        refreshShopAffordabilityState();
        return;
      }
      game.score -= liveCost;
      game.upgrades[u.id] = liveLvl + 1;
      u.effect(game);
      update();
    } : null;
    card.oncontextmenu = (!locked && !maxed) ? (e) => {
      e.preventDefault();
      if(game.score < cost(u)){
        spawnPopup("Za malo punktow!", false, false, true);
        refreshShopAffordabilityState();
        return;
      }
      buyMax(u);
      update();
    } : null;
    const status = card.querySelector(".cardStatus");
    if(status){
      if(locked) status.textContent = `${UI_ICONS.lock} Od rebirth ${u.unlockAt ?? 1}`;
      else if(maxed) status.textContent = "MAX";
      else if(!affordable) status.textContent = "Za malo punktow!";
      else status.textContent = "Klik LPM / PPM max";
    }
  });

  document.querySelectorAll(".card[data-endless-id]").forEach(card=>{
    const def = ENDLESS_UPGRADES.find(item=>item.id === card.dataset.endlessId);
    if(!def) return;
    const lvl = getEndlessLevel(def.id);
    const maxed = lvl >= def.max;
    const price = getEndlessCost(def);
    const affordable = isEndlessUnlocked() && game.score >= price && !maxed;
    card.classList.toggle("disabled", !affordable);
    card.onclick = affordable ? ()=>buyEndlessUpgrade(def.id) : null;
    card.oncontextmenu = affordable ? (e)=>{
      e.preventDefault();
      buyMaxEndlessUpgrade(def.id);
    } : null;
    const status = card.querySelector(".cardStatus");
    if(status) status.textContent = maxed ? "MAX" : affordable ? "Klik LPM / PPM max" : "Za malo punktow!";
  });

  document.querySelectorAll(".card[data-ultra-core]").forEach(card=>{
    const price = getUltraCoreCost();
    const affordable = isEndlessUnlocked() && game.score >= price;
    card.classList.toggle("disabled", !affordable);
    card.onclick = ()=>ultraCoreReset();
    const status = card.querySelector(".cardStatus");
    if(status) status.textContent = affordable ? "Kliknij, aby zrobic rdzen" : "Za malo punktow!";
  });
}

function rebirth(){
  if(game.rebirths>=REBIRTH_LIMIT) return;

  const cost = getRebirthCost();
  if(game.score>=cost){
    const s=document.getElementById("rocketScene");
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

      const persistentPets = getOwnedPets();
      const persistentIds = new Set(persistentPets.map(p=>p.uid));
      game.skins = Array.isArray(game.skins) ? game.skins : [];
      if(game.activeSkinId && !game.skins.some(s=>s.uid===game.activeSkinId)){
        game.activeSkinId = null;
      }
      const nextRebirthLevel = game.rebirths + 1;
      const diamondReward = getRebirthDiamondReward(nextRebirthLevel);

      game.score=0;
      game.click=1;
      game.autoValue=0;
      game.autoSpeed=0;
      game.multi=1;
      game.upgrades={};
      game.pets = persistentPets;
      game.activePetIds = (Array.isArray(game.activePetIds) ? game.activePetIds : []).filter(id=>persistentIds.has(id)).slice(0,getMaxActivePets());
      autoAccumulator=0;
      holdAccumulator=0;
      game.holdCooldownRemaining=0;
      game.holdDurationRemaining=0;
      game.holdActive=false;
      suppressNextClick=false;
      game.uiDirty = true;
      game.autoCrateMode = false;
      lastAutoCrateId = null;

      game.rebirths++;
      game.diamonds += diamondReward;
      game.rebirthMult*=1.5;

      update();
      window.kretAudio?.rebirth?.();
      spawnPopup(`+${formatDiamond(diamondReward)} za rebirth`, false, false, true);
      showRebirthOverlay(game.rebirths);
    },3000);
  } else {
    spawnPopup("Za malo punktow!", false, false, true);
  }
}

const petForgeDockBtn = document.getElementById("petForgeDockBtn");
const petForgePanel = document.getElementById("petForgePanel");
const petForgeList = document.getElementById("petForgeList");
const petForgeFx = document.getElementById("petForgeFx");
const potionCraftDockBtn = document.getElementById("potionCraftDockBtn");
const potionCraftPanel = document.getElementById("potionCraftPanel");
const potionCraftList = document.getElementById("potionCraftList");
const potionCraftFx = document.getElementById("potionCraftFx");
const petDiamondDockBtn = document.getElementById("petDiamondDockBtn");
const petDiamondPanel = document.getElementById("petDiamondPanel");
const petDiamondList = document.getElementById("petDiamondList");
const petDiamondFx = document.getElementById("petDiamondFx");
const limitedEventDockBtn = document.getElementById("limitedEventDockBtn");
const limitedEventPanel = document.getElementById("limitedEventPanel");
const limitedEventContent = document.getElementById("limitedEventContent");
const crystalEventView = document.getElementById("crystalEventView");
const crystalEventBackBtn = document.getElementById("crystalEventBackBtn");
const crystalEventCountdownText = document.getElementById("crystalEventCountdownText");
const crystalCurrencyText = document.getElementById("crystalCurrencyText");
const crystalMole = document.getElementById("crystalMole");
const crystalMineBtn = document.getElementById("crystalMineBtn");
const crystalMineStatus = document.getElementById("crystalMineStatus");
const crystalMineStatusText = document.getElementById("crystalMineStatusText");
const crystalCooldownFill = document.getElementById("crystalCooldownFill");
const crystalUpgradeList = document.getElementById("crystalUpgradeList");
const crystalEggInfo = document.getElementById("crystalEggInfo");
const crystalOpenEggBtn = document.getElementById("crystalOpenEggBtn");
const crystalShopTimer = document.getElementById("crystalShopTimer");
const crystalShopList = document.getElementById("crystalShopList");
const gameInfoBtn = document.getElementById("gameInfoBtn");

function crystalIconMarkup(size="tiny"){
  return `<i class="crystalCurrencyIcon ${size}" aria-hidden="true"></i>`;
}

let crystalMineStatusHtml = "";

const PET_VARIANT_MULTIPLIERS = {
  normal: 1,
  gold: 1.5,
  diamond: 2,
  shiny: 2.5,
  shinyGold: 3,
  shinyDiamond: 4
};

[
  {id:"goldPetChance", name:"SZANSA NA GOLD PETY", desc:"Daje mala szanse, ze pet z jajka od razu wypadnie jako gold.", base:260, scale:2.35, max:3, unlockAtRebirth:3},
  {id:"diamondPetChance", name:"SZANSA NA DIAMOND PETY", desc:"Daje mala szanse, ze pet z jajka od razu wypadnie jako diamond.", base:820, scale:2.6, max:3, unlockAtRebirth:5},
  {id:"shinyPetChance", name:"SZANSA NA SHINY PETY", desc:"Podnosi bardzo rzadka szanse na shiny peta.", base:1400, scale:1, max:1, unlockAtRebirth:3},
  {id:"enchantSlots", name:"SLOTY ENCHANTOW", desc:"Odblokowuje dodatkowe sloty na aktywne ksiegi.", base:2800, scale:2.8, max:4, unlockAtRebirth:6}
].forEach(def=>{
  if(!diamondUpgradeCatalog.some(item=>item.id === def.id)){
    diamondUpgradeCatalog.push(def);
  }
});

Object.assign(upgradeInfoMap, {
  goldPetChance:"Gold pet ma 1.5x mocy normalnego peta i moze wypasc od razu z jajka.",
  diamondPetChance:"Diamond pet ma 2x mocy normalnego peta i moze wypasc od razu z jajka.",
  shinyPetChance:"Shiny pet jest ekstremalnie rzadki i ma wyzszy mnoznik wariantu.",
  enchantSlots:"Dodaje slot na aktywny enchant. Enchanty stackuja swoje efekty."
});

function setDiamondUpgradeBalance(id, values){
  const upgrade = diamondUpgradeCatalog.find(item=>item.id === id);
  if(upgrade) Object.assign(upgrade, values);
}

[
  ["eggBatch", {base:95, scale:2.4}],
  ["petSlots", {base:130, scale:2.45}],
  ["autoEgg", {base:900, scale:1}],
  ["hatchSpeed", {base:260, scale:2.65}],
  ["goldChance", {base:240, scale:1.48}],
  ["diamondRushUnlock", {base:650, scale:1}],
  ["diamondRushCooldown", {base:320, scale:1.65}],
  ["diamondRushDuration", {base:320, scale:1.65}],
  ["diamondRushBoost", {base:380, scale:1.72}],
  ["diamondChance", {base:260, scale:2.25}],
  ["ultraKeepPets", {base:4200, scale:2.75}],
  ["goldPetChance", {base:360, scale:1.9}],
  ["diamondPetChance", {base:850, scale:2.0}],
  ["shinyPetChance", {base:1500, scale:1}],
  ["enchantSlots", {base:4200, scale:2.85}]
].forEach(([id, values])=>setDiamondUpgradeBalance(id, values));

[
  ["crate1", 35],
  ["crate2", 130],
  ["crate3", 650],
  ["voidCrate", 3200]
].forEach(([id, cost])=>{
  const crate = crateCatalog.find(item=>item.id === id);
  if(crate) crate.cost = cost;
});

const getRebirthUnlocksBeforePetForge = getRebirthUnlocks;
getRebirthUnlocks = function(level){
  const items = getRebirthUnlocksBeforePetForge(level);
  if(level === 3){
    items.push({
      title:"Goldenowanie petow",
      desc:"Od teraz 5 takich samych petow mozesz polaczyc w gold wariant."
    });
  }
  if(level === 5){
    items.push({
      title:"Diamond pety",
      desc:"Gold pety mozna od teraz laczyc w diamond wariant."
    });
  }
  if(level === 10){
    items.push({
    title:"VOID UPGRADES",
    desc:"Nowa kolumna endgame odblokowuje trwale ulepszenia i Ultra Rdzenie."
    });
  }
  return items;
};

function getGoldPetDropChance(){
  const base = [0, 0.001, 0.005, 0.0075][Math.min(getMetaLevel("goldPetChance"), 3)];
  return Math.min(0.85, (base * getChanceBoostMultiplier("goldPetChance") + getEnchantVariantBonus()) * (1 + getWeatherChanceBoost("variants") + getWeatherChanceBoost("gold")));
}

function getDiamondPetDropChance(){
  const base = [0, 0.0005, 0.001, 0.0025][Math.min(getMetaLevel("diamondPetChance"), 3)];
  return Math.min(0.5, (base * getChanceBoostMultiplier("diamondPetChance") + getEnchantVariantBonus()) * (1 + getWeatherChanceBoost("variants") + getWeatherChanceBoost("diamondVariant")));
}

function getShinyPetDropChance(){
  const base = getMetaLevel("shinyPetChance") > 0 ? 0.002 : 0.0001;
  return Math.min(0.5, (base * getChanceBoostMultiplier("shinyPetChance") + getEnchantVariantBonus()) * (1 + getWeatherChanceBoost("variants") + getWeatherChanceBoost("shiny")));
}

function getRainbowPetDropChance(){
  const base = 0.00005;
  return Math.min(0.25, base * getChanceBoostMultiplier("rainbowPetChance"));
}

function normalizePetVariant(pet){
  if(!pet) return pet;
  pet.variant = pet.variant || "normal";
  pet.shiny = !!pet.shiny;
  pet.baseName = pet.baseName || pet.templateName || pet.name;
  pet.baseClick = typeof pet.baseClick === "number" ? pet.baseClick : (pet.click || 0) / getPetVariantMultiplier(pet);
  pet.baseMulti = typeof pet.baseMulti === "number" ? pet.baseMulti : (pet.multi || 0) / getPetVariantMultiplier(pet);
  pet.baseDiamond = typeof pet.baseDiamond === "number" ? pet.baseDiamond : getPetDiamondBonusValue({...pet, diamond:undefined}) / getPetVariantMultiplier(pet);
  pet.variantKey = getPetVariantKey(pet);
  pet.powerRank = getPetPowerRank(pet);
  return pet;
}

function getPetVariantKey(pet){
  return `${pet.templateId || "pet"}::${pet.variant || "normal"}::${pet.shiny ? "shiny" : "plain"}`;
}

function getPetVariantMultiplier(pet){
  const variant = pet?.variant || "normal";
  const shiny = !!pet?.shiny;
  if(shiny && variant === "diamond") return PET_VARIANT_MULTIPLIERS.shinyDiamond;
  if(shiny && variant === "gold") return PET_VARIANT_MULTIPLIERS.shinyGold;
  if(shiny) return PET_VARIANT_MULTIPLIERS.shiny;
  return PET_VARIANT_MULTIPLIERS[variant] || 1;
}

function getPetVariantLabel(pet){
  const variant = pet?.variant || "normal";
  const shiny = !!pet?.shiny;
  if(shiny && variant === "diamond") return "SHINY DIAMOND";
  if(shiny && variant === "gold") return "SHINY GOLD";
  if(shiny) return "SHINY";
  if(variant === "diamond") return "DIAMOND";
  if(variant === "gold") return "GOLD";
  return "NORMAL";
}

function getPetVariantClass(pet){
  const classes = [];
  if((pet?.variant || "normal") === "gold") classes.push("gold");
  if((pet?.variant || "normal") === "diamond") classes.push("diamond");
  if(pet?.shiny) classes.push("shiny");
  return classes.join(" ");
}

function getPetStyleClass(pet){
  const id = pet?.templateId || "";
  const classes = [];
  if(id.includes("singer")) classes.push("petStyleSinger");
  if(id.includes("miner")) classes.push("petStyleMiner");
  if(id.includes("gold")) classes.push("petStyleGold");
  if(id.includes("mechanic")) classes.push("petStyleMechanic");
  if(id.includes("sailor")) classes.push("petStyleSailor");
  if(id.includes("explorer")) classes.push("petStyleExplorer");
  if(id.includes("ninja")) classes.push("petStyleNinja");
  if(id.includes("robot")) classes.push("petStyleRobot");
  if(id.includes("king")) classes.push("petStyleKing");
  if(id.includes("wind")) classes.push("petStyleWind");
  if(id.includes("star")) classes.push("petStyleStar");
  if(id.includes("diamond")) classes.push("petStyleDiamond");
  if(id.includes("nebula")) classes.push("petStyleNebula");
  if(id.includes("cosmic")) classes.push("petStyleCosmic");
  if(id.includes("echo")) classes.push("petStyleEcho");
  if(id.includes("oracle")) classes.push("petStyleOracle");
  if(id.includes("void") || id.includes("abyss") || id.includes("singularity") || id.includes("overseer") || id.includes("nullking")) classes.push("petStyleVoid");
  if(id.includes("singularity") || id.includes("overseer") || id.includes("nullking")) classes.push("petStyleSingularity");
  if(id.includes("boss_pet")) classes.push("petStyleBoss");
  if(id.includes("chrono")) classes.push("petStyleChrono", "petAuraChrono");
  if(id.includes("crystal")) classes.push("petStyleCrystal", "petAuraCrystal");
  if(id.includes("crystal_overlord")) classes.push("petStyleCrystalOverlord", "petAuraCrystalStrong");
  if(id.includes("weather_avatar")) classes.push("petStyleAvatar", "petAuraAvatar");
  if(id.includes("tornado")) classes.push("petStyleTornado", "petAuraWind");
  if(id.includes("water_")) classes.push("petStyleWater", "petAuraWater");
  if(pet?.secret) classes.push("petStyleSecret", "petAuraSecret");
  if(pet?.rarity === "Mityczny") classes.push("petStyleMythic", "petAuraMid");
  if(pet?.rarity === "Legendarny") classes.push("petStyleLegendary", "petAuraStrong");
  if(["Pospolity","Rzadki","Epicki"].includes(pet?.rarity)) classes.push("petAuraWeak");
  if(id.includes("void") || id.includes("abyss") || id.includes("singularity") || id.includes("overseer") || id.includes("nullking")) classes.push("petAuraVoid");
  if(id.includes("nebula") || id.includes("cosmic")) classes.push("petAuraNebula");
  return classes.join(" ");
}

function getPetVisualClasses(pet){
  return `${getPetVariantClass(pet)} ${getPetStyleClass(pet)}`.trim();
}

function getPetDisplayNameWithVariant(baseName, variant, shiny){
  const prefix = shiny ? "Shiny " : "";
  if(variant === "diamond") return `${prefix}Diamond ${baseName}`;
  if(variant === "gold") return `${prefix}Gold ${baseName}`;
  if(shiny) return `${prefix}${baseName}`;
  return baseName;
}

function getPetPowerRank(pet){
  const levelMult = getPetLevelMultiplier(pet);
  return ((pet.click || 0) * 1000 + Math.round((pet.multi || 0) * 10000) + Math.round(getPetDiamondBonusValue(pet) * 8000)) * levelMult;
}

function rollPetVariant(){
  if(Math.random() < getRainbowPetDropChance()){
    return {
      variant:"diamond",
      shiny:true
    };
  }
  let variant = "normal";
  if(game.rebirths >= 5 && Math.random() < getDiamondPetDropChance()){
    variant = "diamond";
  } else if(game.rebirths >= 3 && Math.random() < getGoldPetDropChance()){
    variant = "gold";
  }
  return {
    variant,
    shiny: Math.random() < getShinyPetDropChance()
  };
}

function buildPetInstance(template, egg, options={}){
  const variant = options.variant || "normal";
  const shiny = !!options.shiny;
  const mult = getPetVariantMultiplier({variant, shiny});
  const baseDiamond = typeof template.diamond === "number" ? template.diamond : getPetDiamondBonusValue(template);
  const baseName = options.baseName || template.baseName || template.name;
  const displayName = getPetDisplayNameWithVariant(baseName, variant, shiny);

  const pet = {
    uid:`pet_${game.petSeq++}`,
    templateId:template.id,
    eggId:egg.id,
    name:displayName,
    displayName,
    baseName,
    templateName:baseName,
    icon:template.icon,
    rarity:template.rarity,
    baseClick:template.click,
    baseMulti:template.multi,
    baseDiamond,
    click:+(template.click * mult).toFixed(3),
    multi:+(template.multi * mult).toFixed(4),
    diamond:+(baseDiamond * mult).toFixed(4),
    color:template.color,
    sourceEgg:egg.name,
    secret: !!template.secret,
    variant,
    shiny
  };
  pet.variantKey = getPetVariantKey(pet);
  pet.powerRank = getPetPowerRank(pet);
  return pet;
}

function makePetInstance(template, egg){
  return buildPetInstance(template, egg, rollPetVariant());
}

addPetToInventory = function(template, egg){
  const pet = makePetInstance(template, egg);
  if(isPetAutoDeleted(egg?.id, template?.id)){
    pet.autoDeleted = true;
    return pet;
  }
  game.pets.push(pet);
  trackExist("pets", pet.templateId);
  return pet;
};

function getOwnedPets(){
  game.pets = Array.isArray(game.pets) ? game.pets : [];
  game.pets.forEach(normalizePetVariant);
  return game.pets;
}

function getPetDiamondBonusValue(pet){
  if(typeof pet?.diamond === "number") return pet.diamond;
  const rarityBoost = {Pospolity:0.02, Rzadki:0.035, Epicki:0.06, Mityczny:0.09, Legendarny:0.12}[pet?.rarity] || 0.02;
  const scoreBoost = Math.min(0.12, ((pet?.click || 0) * 0.0025) + ((pet?.multi || 0) * 0.05));
  return +(rarityBoost + scoreBoost).toFixed(3);
}

function getPetPowerSummary(pet){
  const label = getPetVariantLabel(pet);
  return `${label} x${getPetVariantMultiplier(pet).toFixed(1)} | +${pet.click} klik | punkty x${(1 + pet.multi).toFixed(2)} | diamenty x${(1 + getPetDiamondBonusValue(pet)).toFixed(2)}`;
}

function petVisualClass(pet){
  const variant = pet?.variant || "normal";
  const shiny = !!pet?.shiny;
  if(shiny && variant === "diamond") return "linear-gradient(135deg,#fff,#75f6ff,#4e63ff,#ff91ff)";
  if(shiny && variant === "gold") return "linear-gradient(135deg,#fff8b6,#ffc441,#ff7bda,#83f7ff)";
  if(shiny) return "linear-gradient(135deg,#fff,#ff9bf3,#82f7ff)";
  if(variant === "diamond") return "linear-gradient(135deg,#d7fbff,#58d9ff,#3177ff)";
  if(variant === "gold") return "linear-gradient(135deg,#fff0a8,#ffbf38,#b87812)";
  if((pet?.templateId || "").includes("crystal_overlord")) return "conic-gradient(from 0deg,#eaffff,#65f3ff,#9567ff,#ffffff,#65f3ff,#eaffff)";
  if((pet?.templateId || "").includes("crystal")) return "linear-gradient(135deg,#eaffff,#8df6ff,#7d67ff,#24124e)";
  if((pet?.templateId || "").includes("chrono")) return "conic-gradient(from 0deg,#fff7bf,#ffbd4a,#65ecff,#8d6dff,#fff7bf)";
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
    normalizePetLevelState(pet);
    const key = `pet:${pet.uid}`;
    const group = groups.get(key) || {
      key,
      baseKey:getPetVariantKey(pet),
      templateId: pet.templateId,
      variant: pet.variant || "normal",
      shiny: !!pet.shiny,
      name: pet.displayName || pet.name,
      templateName: pet.baseName || pet.templateName || pet.name,
      icon: pet.icon,
      rarity: pet.rarity,
      sourceEgg: pet.sourceEgg,
      secret: pet.secret,
      items: []
    };
    group.items.push(pet);
    groups.set(key, group);
  });

  return Array.from(groups.values()).sort((a,b)=>{
    const bestA = Math.max(...a.items.map(p=>p.powerRank || getPetPowerRank(p)));
    const bestB = Math.max(...b.items.map(p=>p.powerRank || getPetPowerRank(p)));
    return bestB - bestA;
  });
}

function togglePetStack(groupKey){
  const stack = getOwnedPets().filter(p=>{
    return `pet:${p.uid}` === groupKey || getPetVariantKey(p) === groupKey || p.templateId === groupKey;
  });
  if(!stack.length) return;

  const next = stack.find(p=>!game.activePetIds.includes(p.uid));
  if(!next){
    game.activePetIds = game.activePetIds.filter(id=>!stack.some(p=>p.uid===id));
    game.uiDirty = true;
    update(true, true);
    return;
  }

  if(game.activePetIds.length >= getMaxActivePets()){
    spawnPopup(`Maksymalnie ${getMaxActivePets()} aktywnych petow`, false, false, true);
    return;
  }

  game.activePetIds.push(next.uid);
  game.uiDirty = true;
  update(true, true);
}

function equipBestPets(){
  const ordered = [...getOwnedPets()].sort((a,b)=>(getPetPowerRank(b) || 0) - (getPetPowerRank(a) || 0));
  game.activePetIds = ordered.slice(0,getMaxActivePets()).map(p=>p.uid);
  game.uiDirty = true;
  update(true, true);
}

function unequipActivePet(uid){
  game.activePetIds = game.activePetIds.filter(id=>id !== uid);
  game.uiDirty = true;
  update(true, true);
}

function getRarityClass(rarity){
  const value = String(rarity || "").toLowerCase();
  if(value.includes("legend")) return "rarityLegendary";
  if(value.includes("mity")) return "rarityMythic";
  if(value.includes("sekret") || value.includes("secret") || value.includes("boss")) return "raritySecret";
  if(value.includes("epick")) return "rarityEpic";
  if(value.includes("rzad")) return "rarityRare";
  return "rarityCommon";
}

function renderActivePetSlots(){
  const activePets = getActivePets();
  const maxSlots = getMaxActivePets();
  const slots = Array.from({length:maxSlots}, (_, index)=>activePets[index] || null);
  const wrapper = document.createElement("div");
  wrapper.className = "activePetsPanel";
  wrapper.innerHTML = `
    <div class="inventorySectionHeader">
      <b>Aktywne pety</b>
      <span>${activePets.length}/${maxSlots}</span>
    </div>
    <div class="activePetSlots">
      ${slots.map((pet, index)=>pet ? `
        <button class="activePetSlot filled ${getPetVisualClasses(pet)} ${pet.secret ? "raritySecret" : getRarityClass(pet.rarity)}" data-active-pet="${pet.uid}" type="button" title="${appendExistTitle("Kliknij, aby zdjac", "pets", pet.templateId)}">
          <span class="activePetSlotIndex">${index + 1}</span>
          <span class="petCircle ${getPetVisualClasses(pet)}" style="background:${petVisualClass(pet)}"></span>
          <span class="activePetSlotName">${pet.displayName || pet.name}</span>
          <small>${getPetVariantLabel(pet)} | ${pet.rarity}<br>${getPetLevelSummary(pet)}</small>
          ${getPetLevelProgressHtml(pet)}
        </button>
      ` : `
        <div class="activePetSlot empty">
          <span class="activePetSlotIndex">${index + 1}</span>
          <span class="emptySlotIcon">+</span>
          <span class="activePetSlotName">Wolny slot</span>
          <small>Wybierz peta z listy</small>
        </div>
      `).join("")}
    </div>
  `;
  wrapper.querySelectorAll("[data-active-pet]").forEach(button=>{
    button.onclick = (event)=>{
      event.stopPropagation();
      unequipActivePet(button.dataset.activePet);
    };
  });
  return wrapper;
}

function renderPetPanel(){
  petList.innerHTML = "";
  const groups = groupPetsByTemplate();
  const activeCount = game.activePetIds.length;
  const totals = getPetBonusTotals();
  const title = petPanel.querySelector(".slideHeader span");

  petList.appendChild(renderActivePetSlots());

  const summary = document.createElement("div");
  summary.className = "petCard inventoryBonusCard";
  summary.innerHTML = `
    <b>Aktywne bonusy</b>
    <small>Punkty x${(1 + totals.multi).toFixed(2)} | Diamenty x${(1 + totals.diamond).toFixed(2)}<br>+${totals.click} do kliku</small>
  `;
  petList.appendChild(summary);

  const listHeader = document.createElement("div");
  listHeader.className = "inventorySectionHeader";
  listHeader.innerHTML = `<b>Wszystkie pety</b><span>${getOwnedPets().length}</span>`;
  petList.appendChild(listHeader);

  if(!groups.length){
    if(title) title.textContent = `Plecak: 0 | Aktywne: 0/${getMaxActivePets()}`;
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `<b>Brak petow</b><small>Otworz jajko, zeby zdobyc pierwszego pupila.</small>`;
    petList.appendChild(empty);
    return;
  }

  groups.forEach(group=>{
    const visibleItems = group.items.filter(p=>!game.activePetIds.includes(p.uid));
    if(!visibleItems.length) return;
    const visibleGroup = {...group, items:visibleItems};
    const count = visibleItems.length;
    const selectedCount = 0;
    const pet = visibleItems[0];
    const protectedItem = visibleItems.some(isProtectedPet);
    const stack = document.createElement("div");
    stack.className = "petCard petInventoryCard " + (group.secret ? "raritySecret" : getRarityClass(group.rarity)) + (selectedCount ? " petSelected" : "");
    stack.title = appendExistTitle(`${getPetPowerSummary(pet)} | ${getPetLevelSummary(pet)}`, "pets", pet.templateId);
    stack.onclick = ()=>togglePetStack(group.key);
    const variantClass = getPetVariantClass(pet);
    const label = getPetVariantLabel(pet);

    stack.innerHTML = `
      <button class="inventoryDeleteBtn" type="button" data-delete-pet="${group.key}" title="Usun pety">×</button>
      <div class="petStack">x${count}</div>
      ${label !== "NORMAL" ? `<div class="petVariantBadge ${variantClass.includes("diamond") ? "diamond" : ""} ${variantClass.includes("shiny") ? "shiny" : ""}">${label}</div>` : ""}
      <div class="petTop">
        <div class="petCircle ${getPetVisualClasses(pet)}" style="background:${petVisualClass(pet)}"></div>
        <div class="petMeta">
          <b>${group.name}</b>
          <small>${group.rarity}<br>${getPetPowerSummary(pet)}<br>${getPetLevelSummary(pet)}</small>
        </div>
      </div>
      ${getPetLevelProgressHtml(pet)}
      <div class="petBadge">Kliknij, aby zalozyc</div>
    `;
    if(protectedItem) stack.querySelector("[data-delete-pet]")?.remove();
    stack.querySelector("[data-delete-pet]")?.addEventListener("click", (event)=>{
      event.preventDefault();
      event.stopPropagation();
      deletePetGroup(visibleGroup);
    });
    petList.appendChild(stack);
  });

  if(title) title.textContent = `Plecak: ${getOwnedPets().length} | Aktywne: ${activeCount}/${getMaxActivePets()}`;
}

setInventoryTab = function(tab){
  game.inventoryTab = tab === "skins" ? "skins" : tab === "potions" ? "potions" : tab === "bags" ? "bags" : tab === "eggs" ? "eggs" : tab === "fruits" ? "fruits" : tab === "enchants" ? "enchants" : "pets";
  game.uiDirty = true;
  update(true, true);
};

function getPotionGroups(){
  const groups = new Map();
  (Array.isArray(game.potions) ? game.potions : []).forEach(potion=>{
    const tier = POTION_TIERS[potion.tier] || POTION_TIERS[1];
    const type = POTION_TYPES[potion.type] || POTION_TYPES.money;
    const key = `${type.id}:${tier.tier}`;
    const group = groups.get(key) || {key, type:type.id, tier:tier.tier, items:[]};
    group.items.push(potion);
    groups.set(key, group);
  });
  return Array.from(groups.values()).sort((a,b)=>b.tier - a.tier || POTION_TYPES[a.type].label.localeCompare(POTION_TYPES[b.type].label, "pl"));
}

function usePotionGroup(groupKey){
  const groups = getPotionGroups();
  const group = groups.find(item=>item.key === groupKey);
  if(!group?.items?.length) return;
  const potion = group.items[0];
  const tier = POTION_TIERS[potion.tier] || POTION_TIERS[1];
  const type = POTION_TYPES[potion.type] || POTION_TYPES.money;
  game.potions = game.potions.filter(item=>item.uid !== potion.uid);
  trackExist("items", `potion_${type.id}_t${tier.tier}`, -1);
  addActivePotionBuff(type.id, tier.tier, tier.durationMs);
  game.uiDirty = true;
  spawnPopup(`${type.icon} ${type.label} ${getPotionEffectLabel(type.id, tier.tier)}`, false, false, true);
  update(true, true);
}

function renderPotionPanel(){
  const potionListEl = document.getElementById("potionList");
  if(!potionListEl) return;
  cleanupActivePotions();
  potionListEl.innerHTML = "";
  const title = petPanel.querySelector(".slideHeader span");

  const header = document.createElement("div");
  header.className = "inventorySectionHeader";
  header.innerHTML = `<b>Mikstury</b><span>${game.potions.length}</span>`;
  potionListEl.appendChild(header);

  const groups = getPotionGroups();
  if(!groups.length){
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `<b>Brak mikstur</b><small>Rzadko wypadaja z klikania i autoclicka.</small>`;
    potionListEl.appendChild(empty);
    if(title) title.textContent = "Mikstury: 0";
    return;
  }

  groups.forEach(group=>{
    const type = POTION_TYPES[group.type] || POTION_TYPES.money;
    const tier = POTION_TIERS[group.tier] || POTION_TIERS[1];
    const card = document.createElement("button");
    card.type = "button";
    card.className = `potionCard potionTier${tier.tier} potionType-${type.id}`;
    card.style.setProperty("--potion-color", type.color);
    card.title = getExistLabel("items", `potion_${type.id}_t${tier.tier}`);
    card.onclick = ()=>usePotionGroup(group.key);
    card.innerHTML = `
      <div class="potionStack">x${group.items.length}</div>
      <div class="potionIcon"><span>${type.icon}</span></div>
      <div class="potionMeta">
        <b>${type.label} ${getPotionEffectLabel(type.id, tier.tier)}</b>
        <small>Tier ${tier.roman} | ${getPotionDurationLabel(tier.durationMs)}</small>
      </div>
      <div class="potionUse">Uzyj</div>
    `;
    potionListEl.appendChild(card);
  });

  const active = (Array.isArray(game.activePotions) ? game.activePotions : []).filter(potion=>potion.endsAt > Date.now());
  if(title) title.textContent = `Mikstury: ${game.potions.length} | Aktywne: ${active.length}`;
}

function getBagGroups(){
  const groups = new Map();
  (Array.isArray(game.bags) ? game.bags : []).forEach(item=>{
    const bag = BAG_CATALOG[item.bagId] || BAG_CATALOG.weak;
    const group = groups.get(bag.id) || {key:bag.id, bag, items:[]};
    group.items.push(item);
    groups.set(bag.id, group);
  });
  const order = {best:0, medium:1, weak:2};
  return Array.from(groups.values()).sort((a,b)=>(order[a.key] ?? 9) - (order[b.key] ?? 9));
}

function getRandomPotionTypeId(){
  const types = Object.keys(POTION_TYPES);
  return types[Math.floor(Math.random() * types.length)] || "money";
}

function rollBagReward(bag){
  const total = bag.rewards.reduce((sum, reward)=>sum + reward.chance, 0);
  let roll = Math.random() * total;
  for(const reward of bag.rewards){
    roll -= reward.chance;
    if(roll <= 0) return reward;
  }
  return bag.rewards[0];
}

function applyBagReward(reward){
  if(reward.type === "diamonds"){
    game.diamonds += reward.amount || 0;
    showItemDropTile("diamonds", {icon:"💎", color:"#72ecff", name:`${reward.amount || 0} diamentow`, amount:reward.amount || 1});
    return `+${formatDiamond(reward.amount || 0)}`;
  }
  if(reward.type === "potion"){
    const amount = Math.max(1, Math.floor(Number(reward.amount) || 1));
    const typeId = reward.potionType || getRandomPotionTypeId();
    for(let i = 0; i < amount; i++){
      game.potions.push(makePotionInstance(typeId, reward.tier || 1));
    }
    return "";
  }
  if(reward.type === "bag"){
    addBagToInventory(reward.bag || "weak", 1);
    return "";
  }
  if(reward.type === "inventoryEgg"){
    addInventoryEggs(reward.eggId || "water_event_egg", 1);
    showItemDropTile("egg", {icon:"&#129370;", color:"#7ee7ff", name:"Wodne Jajko"});
    return "Wodne Jajko";
  }
  if(reward.type === "fruit"){
    const fruitId = reward.fruit || "berry";
    const def = PET_FRUIT_CATALOG[fruitId] || PET_FRUIT_CATALOG.berry;
    const amount = Math.max(1, Math.floor(Number(reward.amount) || 1));
    addPetFruit(fruitId, amount);
    return `${def.name} x${amount}`;
  }
  if(reward.type === "weatherPet"){
    grantWeatherPet(reward.petType || "tornado");
    return reward.label || "Event pet";
  }
  if(reward.type === "enchant"){
    if(!hasEnchantFeature()){
      game.diamonds = (game.diamonds || 0) + 5;
      return "+5 diaxow";
    }
    addEnchantToInventory(reward.enchantType || rollEnchantType().id, reward.tier || 1, Math.max(1, Math.floor(Number(reward.amount) || 1)));
    return "";
  }
  return reward.label;
}

function showBagRewardAnimation(bag, reward, rewardText){
  document.getElementById("bagRewardOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "bagRewardOverlay";
  overlay.className = `bagRewardOverlay bag-${bag.id}`;
  overlay.style.setProperty("--bag-color", bag.color);
  overlay.innerHTML = `
    <div class="bagRewardCard">
      <div class="bagRewardIcon">${bag.icon}</div>
      <b>${bag.name}</b>
      <span>Wypadlo:</span>
      <strong>${rewardText}</strong>
      <small>${reward.label} | ${reward.chance}%</small>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(()=>overlay.classList.add("show"), 20);
  setTimeout(()=>{
    overlay.classList.remove("show");
    setTimeout(()=>overlay.remove(), 260);
  }, 2200);
}

function getBagOpenCount(bag){
  if(bag?.id === "best") return 10;
  if(bag?.id === "medium") return 5;
  return 3;
}

function getRewardDisplayText(reward, rewardText=""){
  if(rewardText) return rewardText;
  if(reward.type === "potion") return `Mikstura T${reward.tier || 1}`;
  if(reward.type === "bag"){
    const bag = BAG_CATALOG[reward.bag || "weak"] || BAG_CATALOG.weak;
    return bag.name;
  }
  if(reward.type === "fruit"){
    const def = PET_FRUIT_CATALOG[reward.fruit || "berry"] || PET_FRUIT_CATALOG.berry;
    return def.name;
  }
  if(reward.type === "enchant") return `Enchant T${reward.tier || 1}`;
  return reward.label || "Item";
}

function showBagMultiRewardAnimation(bag, rewards){
  document.getElementById("bagRewardOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "bagRewardOverlay";
  overlay.className = `bagRewardOverlay bag-${bag.id}`;
  overlay.style.setProperty("--bag-color", bag.color);
  const rows = rewards.slice(0, 10).map(item=>`<span>${item.text}</span>`).join("");
  overlay.innerHTML = `
    <div class="bagRewardCard">
      <div class="bagRewardIcon">${bag.icon}</div>
      <b>${bag.name}</b>
      <span>Wypadlo ${rewards.length} itemow:</span>
      <div class="bagRewardGrid">${rows}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(()=>overlay.classList.add("show"), 20);
  setTimeout(()=>{
    overlay.classList.remove("show");
    setTimeout(()=>overlay.remove(), 260);
  }, 2600);
}

function useBagGroup(bagId){
  const bag = BAG_CATALOG[bagId];
  if(!bag) return;
  const owned = (Array.isArray(game.bags) ? game.bags : []).filter(item=>item.bagId === bag.id);
  if(!owned.length) return;
  const usedId = owned[0].uid;
  game.bags = game.bags.filter(item=>item.uid !== usedId);
  trackExist("items", `bag_${bag.id}`, -1);
  const rewards = [];
  for(let i = 0; i < getBagOpenCount(bag); i++){
    const reward = rollBagReward(bag);
    const rewardText = applyBagReward(reward);
    rewards.push({reward, text:getRewardDisplayText(reward, rewardText)});
  }
  game.uiDirty = true;
  showBagMultiRewardAnimation(bag, rewards);
  spawnPopup(`${bag.icon} ${bag.name}: ${rewards.length} itemow`, false, false, true);
  update(true, true);
}

function renderBagPanel(){
  const bagList = document.getElementById("bagList");
  if(!bagList) return;
  bagList.innerHTML = "";
  const title = petPanel.querySelector(".slideHeader span");
  const groups = getBagGroups();
  if(!groups.length){
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `<b>Brak sakiewek</b><small>Sakiewki trafiaja tutaj jako nagrody i bonusowe itemy.</small>`;
    bagList.appendChild(empty);
    if(title) title.textContent = "Sakiewki: 0";
    return;
  }
  groups.forEach(group=>{
    const bag = group.bag;
    const card = document.createElement("button");
    card.type = "button";
    card.className = `bagCard bag-${bag.id}`;
    card.style.setProperty("--bag-color", bag.color);
    card.onclick = ()=>useBagGroup(bag.id);
    card.innerHTML = `
      <div class="bagStack">x${group.items.length}</div>
      <div class="bagIcon">${bag.icon}</div>
      <div class="bagMeta">
        <b>${bag.name}</b>
        <small>${bag.rarity}<br>Najedz, zeby zobaczyc dropy.</small>
      </div>
      <div class="bagUse">Otworz</div>
      ${renderChanceTooltip(`${bag.name} | ${getExistLabel("items", `bag_${bag.id}`)}`, getBagChanceRows(bag), "bagChanceTooltip")}
    `;
    bagList.appendChild(card);
  });
  if(title) title.textContent = `Sakiewki: ${game.bags.length}`;
}

function getMaxActiveEnchants(){
  return 1 + Math.min(4, getMetaLevel("enchantSlots"));
}

function getEnchantGroups(){
  const groups = new Map();
  (Array.isArray(game.enchants) ? game.enchants : []).forEach(enchant=>{
    const def = getEnchantDef(enchant.type);
    const tier = def.exclusive ? {tier:1, roman:"EX"} : getEnchantTierInfo(enchant.tier || 1);
    const key = `${def.id}:${def.exclusive ? "ex" : tier.tier}`;
    const group = groups.get(key) || {key, type:def.id, tier:tier.tier, exclusive:!!def.exclusive, items:[]};
    group.items.push(enchant);
    groups.set(key, group);
  });
  return Array.from(groups.values()).sort((a,b)=>(b.exclusive ? 1 : 0) - (a.exclusive ? 1 : 0) || b.tier - a.tier || getEnchantDef(a.type).name.localeCompare(getEnchantDef(b.type).name, "pl"));
}

function toggleEnchant(uid){
  game.activeEnchantIds = Array.isArray(game.activeEnchantIds) ? game.activeEnchantIds : [];
  const exists = game.enchants.some(item=>item.uid === uid);
  if(!exists) return;
  if(game.activeEnchantIds.includes(uid)){
    game.activeEnchantIds = game.activeEnchantIds.filter(id=>id !== uid);
  }else{
    if(game.activeEnchantIds.length >= getMaxActiveEnchants()){
      spawnPopup(`Maksymalnie ${getMaxActiveEnchants()} enchantow`, false, false, true);
      return;
    }
    game.activeEnchantIds.push(uid);
  }
  game.uiDirty = true;
  update(true, true);
}

function toggleEnchantGroup(groupKey){
  const group = getEnchantGroups().find(item=>item.key === groupKey);
  if(!group?.items?.length) return;
  const inactive = group.items.find(item=>!game.activeEnchantIds.includes(item.uid));
  toggleEnchant(inactive?.uid || group.items[0].uid);
}

function renderEnchantPanel(){
  const list = document.getElementById("enchantList");
  if(!list) return;
  list.innerHTML = "";
  const title = petPanel.querySelector(".slideHeader span");
  const active = getActiveEnchantItems();
  const header = document.createElement("div");
  header.className = "inventorySectionHeader";
  header.innerHTML = `<b>Enchanty</b><span>${active.length}/${getMaxActiveEnchants()}</span>`;
  list.appendChild(header);
  const maxSlots = getMaxActiveEnchants();
  const slotWrap = document.createElement("div");
  slotWrap.className = "activeEnchantPanel";
  slotWrap.innerHTML = `
    <div class="activePetsTitle">
      <b>Aktywne enchanty</b>
      <span>${active.length}/${maxSlots}</span>
    </div>
    <div class="activeEnchantSlots">
      ${Array.from({length:maxSlots}, (_, index)=>{
        const enchant = active[index] || null;
        if(!enchant){
          return `<div class="activeEnchantSlot empty"><span>${index + 1}</span><b>Wolny slot</b></div>`;
        }
        const def = getEnchantDef(enchant.type);
        const tier = def.exclusive ? {roman:"EX", tier:1} : getEnchantTierInfo(enchant.tier || 1);
        return `
          <button class="activeEnchantSlot filled enchantTier${tier.tier}" type="button" data-active-enchant="${enchant.uid}" style="--enchant-color:${def.color}" title="Kliknij, aby zdjac">
            <span>${index + 1}</span>
            <div class="enchantBook"><em>${def.icon}</em></div>
            <b>${def.name}</b>
            <small>Tier ${tier.roman}</small>
          </button>
        `;
      }).join("")}
    </div>
  `;
  list.appendChild(slotWrap);
  slotWrap.querySelectorAll("[data-active-enchant]").forEach(button=>{
    button.addEventListener("click", event=>{
      event.stopPropagation();
      toggleEnchant(button.dataset.activeEnchant);
    });
  });
  if(!game.enchants.length){
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `<b>Brak enchantow</b><small>Ksiazki wypadaja bardzo rzadko od rebirth 6.</small>`;
    list.appendChild(empty);
    if(title) title.textContent = "Enchanty: 0";
    return;
  }
  let renderedEnchantGroups = 0;
  getEnchantGroups().forEach(group=>{
    const visibleItems = group.items.filter(item=>!game.activeEnchantIds.includes(item.uid));
    if(!visibleItems.length) return;
    renderedEnchantGroups += 1;
    const def = getEnchantDef(group.type);
    const tier = def.exclusive ? {roman:"EX", tier:1} : getEnchantTierInfo(group.tier);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `enchantCard enchantTier${tier.tier} ${def.exclusive ? "exclusive" : ""}`;
    card.style.setProperty("--enchant-color", def.color);
    card.title = `${def.name}\n${def.desc}\n${getExistLabel("items", `enchant_${def.id}_${def.exclusive ? "ex" : "t" + tier.tier}`)}`;
    card.onclick = ()=>toggleEnchantGroup(group.key);
    card.innerHTML = `
      <div class="potionStack">x${visibleItems.length}</div>
      <div class="enchantBook"><span>${def.icon}</span></div>
      <div class="potionMeta">
        <b>${def.name}</b>
        <small>Tier ${tier.roman} | ${def.desc}<br>Kliknij, aby zalozyc</small>
      </div>
    `;
    list.appendChild(card);
  });
  if(!renderedEnchantGroups){
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `<b>Brak wolnych enchantow</b><small>Aktywne ksiazki sa pokazane w slotach u gory.</small>`;
    list.appendChild(empty);
  }
  if(title) title.textContent = `Enchanty: ${game.enchants.length} | Aktywne: ${active.length}/${getMaxActiveEnchants()}`;
}

const INVENTORY_EGG_CATALOG = {
  crystal_event_egg:{
    id:"crystal_event_egg",
    name:"Krysztalowe Jajko",
    icon:"◇",
    tint:"linear-gradient(145deg,#d8fdff,#8a7dff,#21113b)",
    voidEgg:true
  }
};
INVENTORY_EGG_CATALOG.water_event_egg = {
  id:"water_event_egg",
  name:"Wodne Jajko",
  icon:"&#127754;",
  tint:"linear-gradient(145deg,#dffbff,#6ed8ff,#1e4f8f)",
  voidEgg:true
};

function makeInventoryEggInstance(eggId){
  const egg = INVENTORY_EGG_CATALOG[eggId];
  if(!egg) return null;
  return {
    uid:`inventory_egg_${game.inventoryEggSeq++}`,
    eggId:egg.id,
    name:egg.name,
    acquiredAt:Date.now()
  };
}

function addInventoryEggs(eggId, amount=1){
  game.inventoryEggs = Array.isArray(game.inventoryEggs) ? game.inventoryEggs : [];
  let added = 0;
  for(let i = 0; i < Math.max(1, Math.floor(Number(amount) || 1)); i++){
    const item = makeInventoryEggInstance(eggId);
    if(!item) break;
    game.inventoryEggs.push(item);
    added++;
  }
  if(added && typeof trackExist === "function") trackExist("items", `egg_${eggId}`, added);
  return added;
}

function getInventoryEggGroups(){
  const groups = new Map();
  (Array.isArray(game.inventoryEggs) ? game.inventoryEggs : []).forEach(item=>{
    const egg = INVENTORY_EGG_CATALOG[item.eggId];
    if(!egg) return;
    const group = groups.get(egg.id) || {egg, items:[]};
    group.items.push(item);
    groups.set(egg.id, group);
  });
  return Array.from(groups.values());
}

function getCrystalEggChanceRows(){
  const weights = getCrystalPetWeights();
  const total = weights.reduce((sum, value)=>sum + value, 0);
  return CRYSTAL_EVENT_CONFIG.pets.map((pet, index)=>({
    pet,
    chance:`${Math.max(.01, weights[index] / total * 100).toFixed(2)}%`
  }));
}

function getWaterEggChanceRows(){
  const pool = [
    {chance:50, id:"water_splash_mole", name:"Kret Kropla", icon:"K", rarity:"Exclusive", color:"#8eeaff"},
    {chance:30, id:"water_wave_mole", name:"Kret Fala", icon:"K", rarity:"Exclusive", color:"#55c8ff"},
    {chance:15, id:"water_tide_mole", name:"Kret Przyplywu", icon:"K", rarity:"Exclusive", color:"#378bff"},
    {chance:5, id:"water_flooded_mole", name:"Zalany Kret", icon:"K", rarity:"Sekretny", color:"#1c5fd8", secret:true}
  ];
  return pool.map(pet=>({pet, chance:`${pet.chance.toFixed(2)}%`}));
}

function getInventoryEggChanceRows(eggId){
  return eggId === "water_event_egg" ? getWaterEggChanceRows() : getCrystalEggChanceRows();
}

function getRewardIcon(reward){
  if(reward.type === "diamonds") return "&#128142;";
  if(reward.type === "potion") return "&#129514;";
  if(reward.type === "bag") return (BAG_CATALOG[reward.bag || "weak"] || BAG_CATALOG.weak).icon;
  if(reward.type === "inventoryEgg") return "&#129370;";
  if(reward.type === "weatherPet") return "&#127786;";
  if(reward.type === "enchant") return "&#128214;";
  if(reward.type === "shells") return "&#128026;";
  if(reward.type === "fruit"){
    const def = PET_FRUIT_CATALOG[reward.fruit || "berry"] || PET_FRUIT_CATALOG.berry;
    return def.icon;
  }
  return "&#10022;";
}

function getRewardColor(reward){
  if(reward.type === "diamonds") return "#72ecff";
  if(reward.type === "potion") return "#9cffbf";
  if(reward.type === "bag") return (BAG_CATALOG[reward.bag || "weak"] || BAG_CATALOG.weak).color;
  if(reward.type === "inventoryEgg") return "#7ee7ff";
  if(reward.type === "weatherPet") return "#d9f3ff";
  if(reward.type === "enchant") return "#d8b6ff";
  if(reward.type === "shells") return "#7ee7ff";
  if(reward.type === "fruit"){
    const def = PET_FRUIT_CATALOG[reward.fruit || "berry"] || PET_FRUIT_CATALOG.berry;
    return def.color;
  }
  return "#bdf9ff";
}

function getBagChanceRows(bag){
  return (bag?.rewards || []).map(reward=>({
    icon:getRewardIcon(reward),
    name:reward.label || getRewardDisplayText(reward),
    chance:`${Number(reward.chance || 0).toFixed(Number(reward.chance) % 1 ? 1 : 0)}%`,
    color:getRewardColor(reward)
  }));
}

function renderChanceTooltip(title, rows, className=""){
  return `
    <div class="chanceTooltip ${className}">
      <strong>${title}</strong>
      ${rows.map(row=>`
        <span class="chanceTooltipRow">
          <i style="${row.color ? `--chance-color:${row.color}` : ""}">${row.icon || "?"}</i>
          <b>${row.name}</b>
          <em>${row.chance}</em>
        </span>
      `).join("")}
    </div>
  `;
}

function hatchInventoryEggBatch(eggId, requestedCount){
  if(hatchBusy) return;
  const egg = INVENTORY_EGG_CATALOG[eggId];
  const owned = (Array.isArray(game.inventoryEggs) ? game.inventoryEggs : []).filter(item=>item.eggId === eggId);
  if(!egg || !owned.length) return;
  const count = Math.max(1, Math.min(Math.floor(Number(requestedCount) || 1), getEggBatchSize(), owned.length));
  const consumed = new Set(owned.slice(0, count).map(item=>item.uid));
  game.inventoryEggs = game.inventoryEggs.filter(item=>!consumed.has(item.uid));
  if(typeof trackExist === "function") trackExist("items", `egg_${eggId}`, -count);
  const pets = [];
  for(let i = 0; i < count; i++){
    const pet = eggId === "water_event_egg" ? rollWaterPet() : makeCrystalPet(rollCrystalPetTemplate());
    game.pets = Array.isArray(game.pets) ? game.pets : [];
    game.pets.push(pet);
    if(typeof trackExist === "function") trackExist("pets", pet.templateId);
    pets.push(pet);
  }
  game.openedEggs = (game.openedEggs || 0) + count;
  game.uiDirty = true;
  eggChoiceOverlay.classList.remove("open");
  pendingEggChoice = null;
  lastAutoEggId = game.autoEggMode ? `inventory:${eggId}` : null;
  petPanel.classList.remove("open");
  window.kretAudio?.crystalEgg?.();
  saveCrystalEvent("inventoryEggOpen");
  runEggReveal(egg, pets);
}

function showInventoryEggChoice(eggId){
  const egg = INVENTORY_EGG_CATALOG[eggId];
  const owned = (Array.isArray(game.inventoryEggs) ? game.inventoryEggs : []).filter(item=>item.eggId === eggId).length;
  if(!egg || !owned) return;
  const batchCount = Math.min(getEggBatchSize(), owned);
  if(hasAutoEggUnlock() && game.autoEggMode){
    hatchInventoryEggBatch(eggId, batchCount);
    return;
  }
  if(batchCount <= 1){
    hatchInventoryEggBatch(eggId, 1);
    return;
  }
  pendingEggChoice = `inventory:${eggId}`;
  eggChoiceTitle.textContent = "Otwieranie jajka";
  eggChoiceInfo.textContent = `${egg.name} | Masz ${owned}. Mozesz otworzyc 1 albo ${batchCount}.`;
  buyOneEggBtn.onclick = ()=>hatchInventoryEggBatch(eggId, 1);
  buyBatchEggBtn.onclick = ()=>hatchInventoryEggBatch(eggId, batchCount);
  buyOneEggBtn.textContent = "Otworz 1";
  buyBatchEggBtn.textContent = `Otworz x${batchCount}`;
  eggChoiceOverlay.classList.add("open");
}

function renderInventoryEggPanel(){
  const eggList = document.getElementById("inventoryEggList");
  if(!eggList) return;
  eggList.innerHTML = "";
  const title = petPanel.querySelector(".slideHeader span");
  const groups = getInventoryEggGroups();
  if(!groups.length){
    eggList.innerHTML = `<div class="petCard locked petEmpty"><b>Brak jajek</b><small>Exclusive jajka i jajka eventowe trafiaja tutaj.</small></div>`;
    if(title) title.textContent = "Jajka: 0";
    return;
  }
  groups.forEach(group=>{
    const rows = getInventoryEggChanceRows(group.egg.id);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "inventoryEggCard";
    card.onclick = ()=>showInventoryEggChoice(group.egg.id);
    card.innerHTML = `
      <div class="inventoryEggStack">x${group.items.length}</div>
      <div class="inventoryEggVisual" style="background:${group.egg.tint}"></div>
      <b>${group.egg.name}</b>
      ${renderChanceTooltip(group.egg.name, rows.map(({pet, chance})=>({
        icon:pet.icon,
        name:pet.name,
        chance,
        color:pet.color
      })), "inventoryEggTooltip")}
    `;
    eggList.appendChild(card);
  });
  if(title) title.textContent = `Jajka: ${game.inventoryEggs.length}`;
}

let potionBuffHudSignature = "";
function renderPotionBuffHud(){
  const hud = document.getElementById("potionBuffHud");
  if(!hud) return;
  cleanupActivePotions();
  const active = (Array.isArray(game.activePotions) ? game.activePotions : []).filter(potion=>!potion.paused && potion.endsAt > Date.now());
  hud.classList.toggle("show", active.length > 0);
  const signature = active.map(potion=>`${potion.type}:${potion.tier}:${potion.endsAt}`).join("|");
  if(signature === potionBuffHudSignature && hud.children.length === active.length){
    active.forEach((potion, index)=>{
      const type = POTION_TYPES[potion.type] || POTION_TYPES.money;
      const tier = POTION_TIERS[potion.tier] || POTION_TIERS[1];
      const left = Math.max(0, potion.endsAt - Date.now());
      const totalSeconds = Math.ceil(left / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = String(totalSeconds % 60).padStart(2, "0");
      const node = hud.children[index];
      const timer = node?.querySelector(".potionHudInfo span");
      if(timer) timer.textContent = `${minutes}:${seconds}`;
      if(node) node.title = `${type.label} ${getPotionEffectLabel(type.id, tier.tier)} | Tier ${tier.roman} | zostalo ${minutes}:${seconds}`;
    });
    return;
  }
  potionBuffHudSignature = signature;
  hud.innerHTML = active.map(potion=>{
    const type = POTION_TYPES[potion.type] || POTION_TYPES.money;
    const tier = POTION_TIERS[potion.tier] || POTION_TIERS[1];
    const left = Math.max(0, potion.endsAt - Date.now());
    const totalSeconds = Math.ceil(left / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    const tooltip = `${type.label} ${getPotionEffectLabel(type.id, tier.tier)} | Tier ${tier.roman} | zostalo ${minutes}:${seconds}`;
    return `
      <div class="potionHudBuff potionTier${tier.tier} potionType-${type.id}" style="--potion-color:${type.color}" title="${tooltip}">
        <div class="potionHudIcon"><span>${type.icon}</span></div>
        <div class="potionHudInfo">
          <b>${getPotionEffectLabel(type.id, tier.tier)}</b>
          <span>${minutes}:${seconds}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderFruitPanel(){
  const fruitListEl = document.getElementById("fruitList");
  if(!fruitListEl) return;
  fruitListEl.innerHTML = "";
  const title = petPanel.querySelector(".slideHeader span");
  const groups = getFruitGroups();
  const activePets = getActivePets();
  const header = document.createElement("div");
  header.className = "inventorySectionHeader";
  header.innerHTML = `<b>Owoce i ryby</b><span>${game.fruits.length}</span>`;
  fruitListEl.appendChild(header);
  if(!groups.length){
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `<b>Brak owocow</b><small>Rzadko wypadaja z klikow, sakiewek i mega powodzi.</small>`;
    fruitListEl.appendChild(empty);
    if(title) title.textContent = "Owoce: 0";
    return;
  }
  groups.forEach(group=>{
    const def = group.def;
    const card = document.createElement("div");
    card.className = `petCard fruitCard fruit-${def.kind}`;
    card.style.setProperty("--fruit-color", def.color);
    const effect = def.levelUp ? "+1 level natychmiast" : `+${formatPetXp(def.xp)} XP`;
    const targets = activePets.length ? activePets.map(pet=>`
      <button type="button" class="fruitTargetBtn" data-fruit-id="${def.id}" data-pet-uid="${pet.uid}">
        ${pet.displayName || pet.name} <span>Lv ${getPetLevel(pet)}</span>
      </button>
    `).join("") : `<small class="fruitNoTarget">Zaloz peta, zeby uzyc.</small>`;
    card.innerHTML = `
      <div class="potionStack">x${group.items.length}</div>
      <div class="petTop">
        <div class="fruitIcon" style="background:${def.color}">${def.icon}</div>
        <div class="petMeta">
          <b>${def.name}</b>
          <small>${def.rarity} | ${effect}</small>
        </div>
      </div>
      <div class="fruitTargets">${targets}</div>
    `;
    card.querySelectorAll("[data-fruit-id]").forEach(button=>{
      button.onclick = (event)=>{
        event.preventDefault();
        event.stopPropagation();
        useFruitOnPet(button.dataset.fruitId, button.dataset.petUid);
      };
    });
    fruitListEl.appendChild(card);
  });
  if(title) title.textContent = `Owoce: ${game.fruits.length}`;
}

renderInventoryPanel = function(){
  const tab = game.inventoryTab === "skins" ? "skins" : game.inventoryTab === "potions" ? "potions" : game.inventoryTab === "bags" ? "bags" : game.inventoryTab === "eggs" ? "eggs" : game.inventoryTab === "fruits" ? "fruits" : game.inventoryTab === "enchants" ? "enchants" : "pets";
  const potionListEl = document.getElementById("potionList");
  const potionTabBtn = document.getElementById("potionTabBtn");
  const bagListEl = document.getElementById("bagList");
  const bagTabBtn = document.getElementById("bagTabBtn");
  const inventoryEggList = document.getElementById("inventoryEggList");
  const inventoryEggTabBtn = document.getElementById("inventoryEggTabBtn");
  const fruitListEl = document.getElementById("fruitList");
  const fruitTabBtn = document.getElementById("fruitTabBtn");
  const enchantListEl = document.getElementById("enchantList");
  const enchantTabBtn = document.getElementById("enchantTabBtn");
  petList.style.display = tab === "pets" ? "block" : "none";
  skinList.style.display = tab === "skins" ? "block" : "none";
  if(potionListEl) potionListEl.style.display = tab === "potions" ? "block" : "none";
  if(bagListEl) bagListEl.style.display = tab === "bags" ? "block" : "none";
  if(inventoryEggList) inventoryEggList.style.display = tab === "eggs" ? "block" : "none";
  if(fruitListEl) fruitListEl.style.display = tab === "fruits" ? "block" : "none";
  if(enchantListEl) enchantListEl.style.display = tab === "enchants" ? "block" : "none";
  petActions.style.display = tab === "pets" ? "flex" : "none";
  petTabBtn.classList.toggle("active", tab === "pets");
  skinTabBtn.classList.toggle("active", tab === "skins");
  potionTabBtn?.classList.toggle("active", tab === "potions");
  bagTabBtn?.classList.toggle("active", tab === "bags");
  inventoryEggTabBtn?.classList.toggle("active", tab === "eggs");
  fruitTabBtn?.classList.toggle("active", tab === "fruits");
  enchantTabBtn?.classList.toggle("active", tab === "enchants");

  if(tab === "skins") renderSkinPanel();
  else if(tab === "potions") renderPotionPanel();
  else if(tab === "bags") renderBagPanel();
  else if(tab === "eggs") renderInventoryEggPanel();
  else if(tab === "fruits") renderFruitPanel();
  else if(tab === "enchants") renderEnchantPanel();
  else renderPetPanel();
  renderPotionBuffHud();
};

let inventoryPanelRenderSignature = "";
function getInventoryPanelSignature(){
  return [
    game.inventoryTab || "pets",
    (Array.isArray(game.pets) ? game.pets : []).map(pet=>`${pet.uid}:${pet.templateId}:${pet.variant}:${pet.shiny ? 1 : 0}:${pet.level || 1}:${Math.floor(pet.xp || 0)}`).join(","),
    (Array.isArray(game.activePetIds) ? game.activePetIds : []).join(","),
    (Array.isArray(game.skins) ? game.skins : []).map(skin=>`${skin.uid}:${skin.templateId}`).join(","),
    game.activeSkinId || "",
    (Array.isArray(game.potions) ? game.potions : []).map(potion=>`${potion.uid}:${potion.type}:${potion.tier}`).join(","),
    (Array.isArray(game.bags) ? game.bags : []).map(bag=>`${bag.uid}:${bag.id}`).join(","),
    (Array.isArray(game.inventoryEggs) ? game.inventoryEggs : []).map(egg=>`${egg.uid}:${egg.eggId}`).join(","),
    (Array.isArray(game.fruits) ? game.fruits : []).map(fruit=>`${fruit.uid}:${fruit.id}`).join(","),
    (Array.isArray(game.enchants) ? game.enchants : []).map(enchant=>`${enchant.uid}:${enchant.type}:${enchant.tier}`).join(","),
    (Array.isArray(game.activeEnchantIds) ? game.activeEnchantIds : []).join(",")
  ].join("|");
}

function renderInventoryPanelStable(force=false){
  const signature = getInventoryPanelSignature();
  if(!force && signature === inventoryPanelRenderSignature) return;
  inventoryPanelRenderSignature = signature;
  renderInventoryPanel();
}

function isRareInventoryItem(item={}){
  const text = `${item.rarity || ""} ${item.templateId || ""} ${item.skinClass || ""} ${item.sourceEgg || ""} ${item.sourceCrate || ""}`.toLowerCase();
  return !!item.secret
    || text.includes("sekret")
    || text.includes("secret")
    || text.includes("boss")
    || text.includes("void")
    || text.includes("event")
    || text.includes("exclusive")
    || text.includes("legend")
    || text.includes("mity");
}

function isProtectedPet(item={}){
  const text = [
    item.rarity,
    item.templateId,
    item.id,
    item.name,
    item.displayName,
    item.sourceEgg,
    item.sourceCrate
  ].filter(Boolean).join(" ").toLowerCase();
  return !!item.secret
    || !!item.exclusive
    || text.includes("sekret")
    || text.includes("secret")
    || text.includes("exclusive")
    || text.includes("eksklu");
}

function deletePetGroup(group){
  if(!group?.items?.length) return;
  if(group.items.some(isProtectedPet)){
    spawnPopup("Secret i Exclusive petow nie da sie usunac!", false, false, true);
    return;
  }
  const rare = group.items.some(isRareInventoryItem);
  const count = group.items.length;
  const message = rare
    ? `UWAGA: usuwasz rzadkiego/eventowego peta.\n\n${group.name} x${count}\nTa akcja jest permanentna.\n\nNa pewno usunac?`
    : `Usunac ${group.name} x${count}?\nTa akcja jest permanentna.`;
  if(!window.confirm(message)) return;
  const removeIds = new Set(group.items.map(p=>p.uid));
  game.pets = getOwnedPets().filter(p=>!removeIds.has(p.uid));
  game.activePetIds = game.activePetIds.filter(id=>!removeIds.has(id));
  trackExist("pets", group.templateId, -count);
  game.uiDirty = true;
  update(true, true);
  spawnPopup(`Usunieto: ${group.name} x${count}`, false, false, true);
}

function deleteSkinGroup(group){
  if(!group?.items?.length) return;
  if(group.items.some(skin=>skin.exclusive || String(skin.rarity || "").toLowerCase().includes("exclusive"))){
    spawnPopup("Exclusive skinow nie da sie usunac!", false, false, true);
    return;
  }
  const rare = group.items.some(isRareInventoryItem);
  const count = group.items.length;
  const message = rare
    ? `UWAGA: usuwasz rzadkiego/eventowego skina.\n\n${group.name} x${count}\nTa akcja jest permanentna.\n\nNa pewno usunac?`
    : `Usunac ${group.name} x${count}?\nTa akcja jest permanentna.`;
  if(!window.confirm(message)) return;
  const removeIds = new Set(group.items.map(s=>s.uid));
  game.skins = getOwnedSkins().filter(s=>!removeIds.has(s.uid));
  if(removeIds.has(game.activeSkinId)) game.activeSkinId = null;
  trackExist("skins", group.templateId, -count);
  game.uiDirty = true;
  update(true, true);
  spawnPopup(`Usunieto: ${group.name} x${count}`, false, false, true);
}

let activePetsRenderSignature = "";

function getActivePetsRenderSignature(activePets){
  return activePets.map(pet=>[
    pet.uid,
    pet.templateId,
    pet.variant,
    pet.shiny ? 1 : 0,
    pet.rarity,
    pet.secret ? 1 : 0,
    pet.icon,
    getPetVisualClasses(pet),
    petVisualClass(pet)
  ].join("|")).join(";");
}

function renderActivePets(force=false){
  const activePets = getActivePets();
  const signature = getActivePetsRenderSignature(activePets);
  if(!force && signature === activePetsRenderSignature){
    return;
  }
  activePetsRenderSignature = signature;
  activePetStage.innerHTML = "";
  const centerX = 160;
  const centerY = 152;
  const radius = activePets.length <= 2 ? 88 : activePets.length <= 4 ? 98 : 110;

  activePets.forEach((pet, index)=>{
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / Math.max(1, activePets.length)) * index;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const wrap = document.createElement("div");
    wrap.className = "activePetWrap";
    wrap.style.position = "absolute";
    wrap.style.left = `${x}px`;
    wrap.style.top = `${y}px`;
    wrap.style.transform = "translate(-50%, -50%)";
    wrap.style.animation = "none";

    const badge = document.createElement("div");
    badge.className = "activePet " + getPetVisualClasses(pet) + (pet.secret ? " secret" : pet.rarity === "Legendarny" || pet.rarity === "Mityczny" ? " legendary" : "");
    badge.style.background = petVisualClass(pet);
    badge.style.width = pet.secret || pet.variant === "diamond" ? "60px" : "54px";
    badge.style.height = pet.secret || pet.variant === "diamond" ? "60px" : "54px";
    badge.innerHTML = `
      <div class="petTinyFace"></div>
      <div class="petTinyMouth"></div>
      <div class="petTinyIcon">${pet.icon}</div>
    `;
    wrap.appendChild(badge);
    activePetStage.appendChild(wrap);
  });
}

function getForgeTargetVariant(group){
  if(!hasGoldenPetFeature()) return null;
  if(group.variant === "normal") return "gold";
  if(group.variant === "gold" && hasDiamondPetFeature()) return "diamond";
  return null;
}

function getVariantForgeTarget(group, mode){
  if(mode === "gold") return hasGoldenPetFeature() && group.variant === "normal" ? "gold" : null;
  if(mode === "diamond") return hasDiamondPetFeature() && group.variant === "gold" ? "diamond" : null;
  return getForgeTargetVariant(group);
}

function createForgedPet(source, targetVariant, preview=false){
  normalizePetVariant(source);
  const template = {
    id:source.templateId,
    name:source.baseName || source.templateName || source.name,
    baseName:source.baseName || source.templateName || source.name,
    icon:source.icon,
    rarity:source.rarity,
    click:source.baseClick,
    multi:source.baseMulti,
    diamond:source.baseDiamond,
    color:source.color,
    secret:source.secret
  };
  const seqBeforePreview = game.petSeq;
  const pet = buildPetInstance(template, {id:source.eggId || "forge", name:source.sourceEgg || "Goldenowanie"}, {
    variant:targetVariant,
    shiny:source.shiny,
    baseName:template.baseName
  });
  if(preview){
    game.petSeq = seqBeforePreview;
    pet.uid = "preview_pet";
  }
  return pet;
}

function forgePetGroup(groupKey, mode="any"){
  const groups = groupPetsByTemplate();
  const group = groups.find(item=>item.key === groupKey);
  if(!group) return;
  const targetVariant = getVariantForgeTarget(group, mode);
  if(!targetVariant){
    const msg = mode === "diamond" ? "Diamentowanie od rebirth 5!" : group.variant === "gold" ? "Uzyj panelu diamentowania!" : "Ten wariant jest juz maksymalny.";
    spawnPopup(msg, false, false, true);
    return;
  }
  if(group.items.length < 5){
    spawnPopup("Potrzebujesz 5 takich samych petow!", false, false, true);
    return;
  }

  const sorted = [...group.items].sort((a,b)=>(game.activePetIds.includes(a.uid) ? 1 : 0) - (game.activePetIds.includes(b.uid) ? 1 : 0));
  const consumed = sorted.slice(0, 5);
  const consumedIds = new Set(consumed.map(p=>p.uid));
  const forged = createForgedPet(consumed[0], targetVariant);
  game.pets = getOwnedPets().filter(p=>!consumedIds.has(p.uid));
  game.pets.push(forged);
  game.activePetIds = game.activePetIds.filter(id=>!consumedIds.has(id));
  game.uiDirty = true;

  const fx = mode === "diamond" ? petDiamondFx : petForgeFx;
  if(fx){
    fx.classList.remove("burst");
    void fx.offsetWidth;
    fx.classList.add("burst");
    setTimeout(()=>fx.classList.remove("burst"), 900);
  }

  spawnPopup(`${getPetVariantLabel(forged)} PET!`, false, false, true);
  update(true, true);
}

function renderVariantForgePanel({mode, dockBtn, panel, list, unlockRebirth, lockedTitle, lockedText, introText, emptyText}){
  if(!panel || !list) return;

  const unlocked = mode === "diamond" ? hasDiamondPetFeature() : hasGoldenPetFeature();
  dockBtn?.classList.toggle("locked", !unlocked);
  dockBtn?.classList.toggle("active", panel.classList.contains("open"));
  if(dockBtn) dockBtn.title = unlocked ? lockedTitle.replace(" od rebirth " + unlockRebirth, "") : lockedTitle;

  list.innerHTML = "";
  if(!unlocked){
    const locked = document.createElement("div");
    locked.className = "petCard locked petEmpty";
    locked.innerHTML = `<b>${lockedTitle}</b><small>${lockedText}</small>`;
    list.appendChild(locked);
    return;
  }

  const forgeGroups = groupPetsByTemplate().filter(group=>getVariantForgeTarget(group, mode));
  if(!forgeGroups.length){
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `<b>Brak petow do laczenia</b><small>${emptyText}</small>`;
    list.appendChild(empty);
    return;
  }

  forgeGroups.forEach(group=>{
    const count = group.items.length;
    const pet = group.items[0];
    const targetVariant = getVariantForgeTarget(group, mode);
    const previewVariant = targetVariant;
    const canForge = count >= 5 && !!targetVariant;
    const targetPreview = previewVariant ? createForgedPet(pet, previewVariant, true) : null;
    const card = document.createElement("div");
    card.className = "petCard petForgeCard " + (canForge ? (targetVariant === "diamond" ? "diamondReady" : "ready") : "locked");
    if(canForge){
      card.onclick = ()=>{
        card.classList.add("converting");
        setTimeout(()=>forgePetGroup(group.key, mode), 180);
      };
    }
    const variantClass = getPetVariantClass(pet);
    const targetClass = targetPreview ? getPetVariantClass(targetPreview) : "";
    const targetLabel = targetPreview ? getPetVariantLabel(targetPreview) : "MAX";
    const helpText = canForge ? "Kliknij, aby polaczyc" : "Zbierz jeszcze " + (5 - count);

    card.innerHTML = `
      <div class="petStack">x${count}/5</div>
      <div class="petTop">
        <div class="petCircle ${getPetVisualClasses(pet)}" style="background:${petVisualClass(pet)}"></div>
        <div class="petMeta">
          <b>${group.name}</b>
          <small>${getPetVariantLabel(pet)} -> ${targetLabel}<br>${helpText}</small>
        </div>
        ${targetPreview ? `<div class="petCircle ${getPetVisualClasses(targetPreview)}" style="background:${petVisualClass(targetPreview)}"></div>` : ""}
      </div>
      <div class="petBadge">${canForge ? "5 petow = 1 mocniejszy" : "Za malo petow"}</div>
    `;
    list.appendChild(card);
  });
}

function renderPetForgePanel(){
  renderVariantForgePanel({
    mode:"gold",
    dockBtn:petForgeDockBtn,
    panel:petForgePanel,
    list:petForgeList,
    unlockRebirth:3,
    lockedTitle:"Goldenowanie od rebirth 3",
    lockedText:"5 normalnych petow zmienia sie w 1 gold peta.",
    emptyText:"Zbierz 5 takich samych normalnych petow."
  });
}

function renderPetDiamondPanel(){
  renderVariantForgePanel({
    mode:"diamond",
    dockBtn:petDiamondDockBtn,
    panel:petDiamondPanel,
    list:petDiamondList,
    unlockRebirth:5,
    lockedTitle:"Diamentowanie od rebirth 5",
    lockedText:"5 gold petow zmienia sie w 1 diamond peta.",
    emptyText:"Zbierz 5 takich samych gold petow."
  });
}

function syncPetForgeDockLocks(){
  upgradeHubDockBtn?.classList.toggle("active", upgradeHubPanel?.classList.contains("open"));
  if(potionCraftDockBtn){
    const locked = !hasPotionFeature();
    potionCraftDockBtn.classList.toggle("locked", locked);
    potionCraftDockBtn.setAttribute("aria-disabled", String(locked));
    potionCraftDockBtn.title = locked ? "Ulepszanie mikstur od rebirth 2" : "Ulepszanie mikstur";
    if(locked) potionCraftPanel?.classList.remove("open");
  }
  if(enchantCraftDockBtn){
    const locked = !hasEnchantFeature();
    enchantCraftDockBtn.classList.toggle("locked", locked);
    enchantCraftDockBtn.setAttribute("aria-disabled", String(locked));
    enchantCraftDockBtn.title = locked ? "Ulepszanie enchantow od rebirth 6" : "Ulepszanie enchantow";
    if(locked) enchantCraftPanel?.classList.remove("open");
  }
  if(petForgeDockBtn){
    if(game.rebirths >= 3) game.featureUnlocks.goldenPets = true;
    const locked = !hasGoldenPetFeature();
    petForgeDockBtn.classList.toggle("locked", locked);
    petForgeDockBtn.setAttribute("aria-disabled", String(locked));
  }
  if(petDiamondDockBtn){
    if(game.rebirths >= 5) game.featureUnlocks.diamondPets = true;
    const locked = !hasDiamondPetFeature();
    petDiamondDockBtn.classList.toggle("locked", locked);
    petDiamondDockBtn.setAttribute("aria-disabled", String(locked));
  }
}

function getUpgradeHubOptions(){
  return [
    {id:"potions", icon:"&#129514;", title:"Ulepszanie mikstur", desc:"5 identycznych mikstur = 1 wyzszy tier.", unlocked:hasPotionFeature(), lock:"Od rebirth 2", panel:potionCraftPanel, render:()=>renderPotionCraftPanelStable(true)},
    {id:"enchants", icon:"&#128214;", title:"Ulepszanie enchantow", desc:"5 identycznych ksiazek = 1 wyzszy tier.", unlocked:hasEnchantFeature(), lock:"Od rebirth 6", panel:enchantCraftPanel, render:()=>renderEnchantCraftPanel()},
    {id:"gold", icon:"&#11088;", title:"Goldenowanie petow", desc:"5 normalnych petow = 1 gold pet.", unlocked:hasGoldenPetFeature(), lock:"Od rebirth 3", panel:petForgePanel, render:()=>renderPetForgePanel()},
    {id:"diamond", icon:"&#128142;", title:"Diamentowanie petow", desc:"5 gold petow = 1 diamond pet.", unlocked:hasDiamondPetFeature(), lock:"Od rebirth 5", panel:petDiamondPanel, render:()=>renderPetDiamondPanel()}
  ];
}

function closeUpgradeSubPanels(except=null){
  [potionCraftPanel, enchantCraftPanel, petForgePanel, petDiamondPanel].forEach(panel=>{
    if(panel && panel !== except) panel.classList.remove("open");
  });
}

function openUpgradeHubOption(id){
  const option = getUpgradeHubOptions().find(item=>item.id === id);
  if(!option) return;
  if(!option.unlocked){
    spawnPopup(`${option.title}: ${option.lock}!`, false, false, true);
    renderUpgradeHubPanel();
    return;
  }
  closeGameplaySidePanels?.(option.panel);
  upgradeHubPanel?.classList.remove("open");
  closeUpgradeSubPanels(option.panel);
  option.panel?.classList.add("open");
  option.render?.();
  renderSideUi(true);
}

function renderUpgradeHubPanel(){
  if(!upgradeHubList) return;
  upgradeHubList.innerHTML = "";
  getUpgradeHubOptions().forEach(option=>{
    const card = document.createElement("button");
    card.type = "button";
    card.className = `upgradeHubCard ${option.unlocked ? "unlocked" : "locked"}`;
    card.dataset.upgradeHub = option.id;
    card.innerHTML = `
      <div class="upgradeHubIcon">${option.icon}</div>
      <div>
        <b>${option.title}</b>
        <small>${option.desc}</small>
      </div>
      <span>${option.unlocked ? "Otworz" : option.lock}</span>
    `;
    upgradeHubList.appendChild(card);
  });
}

function makePotionInstance(typeId, tierNumber){
  const tier = POTION_TIERS[tierNumber] || POTION_TIERS[1];
  const type = POTION_TYPES[typeId] || POTION_TYPES.money;
  const potion = {
    uid:`potion_${game.potionSeq++}`,
    type:type.id,
    tier:tier.tier,
    mult:tier.mult,
    durationMs:tier.durationMs,
    createdAt:Date.now()
  };
  trackExist("items", `potion_${type.id}_t${tier.tier}`);
  showItemDropTile("potion", {icon:type.icon, color:type.color});
  return potion;
}

function makeBagInstance(bagId){
  const bag = BAG_CATALOG[bagId] || BAG_CATALOG.weak;
  return {
    uid:`bag_${game.bagSeq++}`,
    bagId:bag.id,
    name:bag.name,
    createdAt:Date.now()
  };
}

function addBagToInventory(bagId, amount=1){
  const bag = BAG_CATALOG[bagId] || BAG_CATALOG.weak;
  const count = Math.max(1, Math.floor(Number(amount) || 1));
  for(let i = 0; i < count; i++){
    game.bags.push(makeBagInstance(bagId));
    showItemDropTile("bag", {icon:bag.icon, color:bag.color});
  }
  trackExist("items", `bag_${bagId}`, count);
  game.uiDirty = true;
}

const REWARD_CODES = {
  START:[
    {type:"diamonds", amount:25},
    {type:"coins", amount:120}
  ],
  RELEASE:[
    {type:"diamonds", amount:60},
    {type:"bag", bag:"weak", amount:1}
  ],
  POTKI:[
    {type:"potion", potionType:"luck", tier:1, amount:2},
    {type:"potion", potionType:"money", tier:1, amount:2},
    {type:"bag", bag:"medium", amount:1}
  ]
};

async function getRewardCodeCatalog(){
  const catalog = Object.fromEntries(Object.entries(REWARD_CODES).map(([code, rewards])=>[
    code,
    {code, rewards, maxUses:0, expiresAt:0, source:"default"}
  ]));
  if(typeof window.fetchAdminRewardCodes === "function"){
    try{
      const online = await window.fetchAdminRewardCodes();
      Object.entries(online || {}).forEach(([code, data])=>{
        if(data && data.active !== false){
          catalog[String(code).toUpperCase()] = Object.assign({}, data, {code:String(code).toUpperCase()});
        }
      });
    }catch(err){
      console.warn("Reward codes load failed", err);
    }
  }
  return catalog;
}

function showCodeStatus(text, isError=false){
  if(!codesStatus) return;
  codesStatus.textContent = text || "";
  codesStatus.classList.toggle("error", !!isError);
}

function formatCodeReward(reward){
  if(reward.type === "diamonds") return `${reward.amount} diamentow`;
  if(reward.type === "coins") return `${reward.amount}x moc kliku w monetach`;
  if(reward.type === "potion"){
    const type = POTION_TYPES[reward.potionType || "money"] || POTION_TYPES.money;
    return `${reward.amount || 1}x ${type.label} T${reward.tier || 1}`;
  }
  if(reward.type === "bag"){
    const bag = BAG_CATALOG[reward.bag || "weak"] || BAG_CATALOG.weak;
    return `${reward.amount || 1}x ${bag.name}`;
  }
  return "nagroda";
}

function applyCodeReward(reward){
  const amount = Math.max(1, Math.floor(Number(reward.amount) || 1));
  if(reward.type === "diamonds"){
    game.diamonds = (Number(game.diamonds) || 0) + amount;
    return;
  }
  if(reward.type === "coins"){
    game.score = (Number(game.score) || 0) + getFreeRewardCoinAmount(amount);
    return;
  }
  if(reward.type === "potion"){
    game.potions = Array.isArray(game.potions) ? game.potions : [];
    for(let i = 0; i < amount; i++){
      game.potions.push(makePotionInstance(reward.potionType || "money", reward.tier || 1));
    }
    return;
  }
  if(reward.type === "bag"){
    game.bags = Array.isArray(game.bags) ? game.bags : [];
    addBagToInventory(reward.bag || "weak", amount);
  }
}

async function claimRewardCode(){
  const code = String(codesInput?.value || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if(!code){
    showCodeStatus("Wpisz kod.", true);
    return;
  }
  const catalog = await getRewardCodeCatalog();
  const entry = catalog[code];
  const rewards = Array.isArray(entry?.rewards) ? entry.rewards : null;
  if(!rewards){
    showCodeStatus("Bledny kod.", true);
    return;
  }
  if(Number(entry.expiresAt) && Date.now() > Number(entry.expiresAt)){
    showCodeStatus("Ten kod wygasl.", true);
    return;
  }
  game.usedCodes = game.usedCodes && typeof game.usedCodes === "object" ? game.usedCodes : {};
  if(game.usedCodes[code]){
    showCodeStatus("Ten kod byl juz uzyty.", true);
    return;
  }
  if(typeof window.reserveRewardCodeUse === "function"){
    const reserved = await window.reserveRewardCodeUse(code, Number(entry.maxUses) || 0);
    if(!reserved){
      showCodeStatus("Limit uzyc tego kodu zostal wykorzystany.", true);
      return;
    }
  }
  rewards.forEach(applyCodeReward);
  game.usedCodes[code] = Date.now();
  game.uiDirty = true;
  showCodeStatus(`Odebrano: ${rewards.map(formatCodeReward).join(", ")}`);
  spawnPopup("Kod odebrany!", false, false, true);
  update(true, true);
  if(typeof requestCloudSave === "function"){
    requestCloudSave({force:true, reason:"rewardCode"});
  }
}

function craftPotionGroup(groupKey, amount=1){
  if(!hasPotionFeature()){
    spawnPopup("Ulepszanie mikstur od rebirth 2!", false, false, true);
    return;
  }
  const group = getPotionGroups().find(item=>item.key === groupKey);
  if(!group) return;
  const tier = POTION_TIERS[group.tier];
  if(!tier || tier.tier >= 3){
    spawnPopup("Ta mikstura ma juz max tier!", false, false, true);
    return;
  }
  if(group.items.length < 5){
    spawnPopup("Potrzebujesz 5 identycznych mikstur!", false, false, true);
    return;
  }

  const craftCount = Math.max(1, Math.min(Math.floor(Number(amount) || 1), Math.floor(group.items.length / 5)));
  const consumed = group.items.slice(0, craftCount * 5);
  const consumedIds = new Set(consumed.map(potion=>potion.uid));
  game.potions = (Array.isArray(game.potions) ? game.potions : []).filter(potion=>!consumedIds.has(potion.uid));
  trackExist("items", `potion_${group.type}_t${tier.tier}`, -craftCount * 5);
  for(let i = 0; i < craftCount; i++){
    game.potions.push(makePotionInstance(group.type, tier.tier + 1));
  }
  game.uiDirty = true;

  if(potionCraftFx){
    potionCraftFx.classList.remove("burst");
    void potionCraftFx.offsetWidth;
    potionCraftFx.classList.add("burst");
    setTimeout(()=>potionCraftFx.classList.remove("burst"), 900);
  }

  const type = POTION_TYPES[group.type] || POTION_TYPES.money;
  const nextTier = POTION_TIERS[tier.tier + 1];
  spawnPopup(`${type.icon} Mikstura T${nextTier.roman} x${craftCount}!`, false, false, true);
  update(true, true);
}

function renderPotionCraftPanel(){
  if(!potionCraftList) return;
  potionCraftList.innerHTML = "";
  if(potionCraftDockBtn){
    potionCraftDockBtn.classList.toggle("active", potionCraftPanel?.classList.contains("open"));
  }
  if(!hasPotionFeature()){
    const locked = document.createElement("div");
    locked.className = "petCard locked petEmpty";
    locked.innerHTML = `<b>Ulepszanie mikstur od rebirth 2</b><small>5 identycznych mikstur laczy sie w 1 wyzszy tier.</small>`;
    potionCraftList.appendChild(locked);
    return;
  }

  const craftGroups = getPotionGroups()
    .filter(group=>group.tier < 3)
    .sort((a,b)=>(Math.floor(b.items.length / 5) > 0 ? 1 : 0) - (Math.floor(a.items.length / 5) > 0 ? 1 : 0) || b.items.length - a.items.length);
  if(!craftGroups.length){
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `<b>Brak mikstur do ulepszenia</b><small>Zdobadz mikstury tier I albo II.</small>`;
    potionCraftList.appendChild(empty);
    return;
  }

  craftGroups.forEach(group=>{
    const count = group.items.length;
    const tier = POTION_TIERS[group.tier] || POTION_TIERS[1];
    const nextTier = POTION_TIERS[tier.tier + 1];
    const type = POTION_TYPES[group.type] || POTION_TYPES.money;
    const canCraft = count >= 5 && !!nextTier;
    const craftMax = Math.floor(count / 5);
    const card = document.createElement("div");
    card.className = `potionCraftCard potionTier${tier.tier} ${canCraft ? "ready" : "locked"}`;
    card.style.setProperty("--potion-color", type.color);
    card.innerHTML = `
      <div class="potionCraftMiniIcon"><span>${type.icon}</span></div>
      <div class="potionMeta">
        <b>${count}/5 ${type.label} ${tier.roman} -> 1 potka ${type.label} ${nextTier.roman}</b>
        <small>${canCraft ? `Mozesz stworzyc: ${craftMax}` : `Brakuje ${5 - count} szt.`}</small>
      </div>
      <div class="potionCraftActions">
        <button type="button" data-craft-one="${group.key}" ${canCraft ? "" : "disabled"}>Stworz</button>
        <button type="button" data-craft-max="${group.key}" ${canCraft && craftMax > 1 ? "" : "disabled"}>Stworz max</button>
      </div>
    `;
    potionCraftList.appendChild(card);
  });
  potionCraftList.querySelectorAll("[data-craft-one]").forEach(button=>{
    button.addEventListener("click", ()=>craftPotionGroup(button.dataset.craftOne, 1));
  });
  potionCraftList.querySelectorAll("[data-craft-max]").forEach(button=>{
    button.addEventListener("click", ()=>{
      const group = getPotionGroups().find(item=>item.key === button.dataset.craftMax);
      craftPotionGroup(button.dataset.craftMax, Math.floor((group?.items?.length || 0) / 5));
    });
  });
}

let potionCraftRenderSignature = "";
function getPotionCraftSignature(){
  return (Array.isArray(game.potions) ? game.potions : [])
    .map(potion=>`${potion.uid}:${potion.type}:${potion.tier}`)
    .join("|");
}

function renderPotionCraftPanelStable(force=false){
  const signature = getPotionCraftSignature();
  if(!force && signature === potionCraftRenderSignature) return;
  potionCraftRenderSignature = signature;
  renderPotionCraftPanel();
}

function craftEnchantGroup(groupKey, amount=1){
  if(!hasEnchantFeature()){
    spawnPopup("Enchanty od rebirth 6!", false, false, true);
    return;
  }
  const group = getEnchantGroups().find(item=>item.key === groupKey);
  if(!group || group.exclusive) return;
  if(group.tier >= 3){
    spawnPopup("Ten enchant ma max tier!", false, false, true);
    return;
  }
  if(group.items.length < 5){
    spawnPopup("Potrzebujesz 5 identycznych enchantow!", false, false, true);
    return;
  }
  const craftCount = Math.max(1, Math.min(Math.floor(Number(amount) || 1), Math.floor(group.items.length / 5)));
  const consumed = group.items.slice(0, craftCount * 5);
  const consumedIds = new Set(consumed.map(item=>item.uid));
  game.enchants = game.enchants.filter(item=>!consumedIds.has(item.uid));
  game.activeEnchantIds = game.activeEnchantIds.filter(id=>!consumedIds.has(id));
  trackExist("items", `enchant_${group.type}_t${group.tier}`, -craftCount * 5);
  for(let i = 0; i < craftCount; i++){
    const enchant = makeEnchantInstance(group.type, group.tier + 1);
    game.enchants.push(enchant);
    trackExist("items", `enchant_${group.type}_t${group.tier + 1}`);
  }
  if(enchantCraftFx){
    enchantCraftFx.classList.remove("burst");
    void enchantCraftFx.offsetWidth;
    enchantCraftFx.classList.add("burst");
    setTimeout(()=>enchantCraftFx.classList.remove("burst"), 900);
  }
  game.uiDirty = true;
  spawnPopup(`${getEnchantDef(group.type).icon} Enchant T${getEnchantTierInfo(group.tier + 1).roman} x${craftCount}!`, false, false, true);
  update(true, true);
}

function renderEnchantCraftPanel(){
  if(!enchantCraftList) return;
  enchantCraftList.innerHTML = "";
  enchantCraftDockBtn?.classList.toggle("active", enchantCraftPanel?.classList.contains("open"));
  if(!hasEnchantFeature()){
    const locked = document.createElement("div");
    locked.className = "petCard locked petEmpty";
    locked.innerHTML = `<b>Ulepszanie enchantow od rebirth 6</b><small>5 identycznych ksiazek laczy sie w 1 wyzszy tier.</small>`;
    enchantCraftList.appendChild(locked);
    return;
  }
  const groups = getEnchantGroups()
    .filter(group=>!group.exclusive && group.tier < 3)
    .sort((a,b)=>(Math.floor(b.items.length / 5) > 0 ? 1 : 0) - (Math.floor(a.items.length / 5) > 0 ? 1 : 0) || b.items.length - a.items.length);
  if(!groups.length){
    const empty = document.createElement("div");
    empty.className = "petCard locked petEmpty";
    empty.innerHTML = `<b>Brak enchantow do ulepszenia</b><small>Zdobadz ksiazki tier I albo II.</small>`;
    enchantCraftList.appendChild(empty);
    return;
  }
  groups.forEach(group=>{
    const def = getEnchantDef(group.type);
    const tier = getEnchantTierInfo(group.tier);
    const canCraft = group.items.length >= 5;
    const craftMax = Math.floor(group.items.length / 5);
    const card = document.createElement("div");
    card.className = `potionCraftCard enchantCraftCard enchantTier${tier.tier} ${canCraft ? "ready" : "locked"}`;
    card.style.setProperty("--potion-color", def.color);
    card.style.setProperty("--enchant-color", def.color);
    card.innerHTML = `
      <div class="potionCraftMiniIcon enchantBook"><span>${def.icon}</span></div>
      <div class="potionMeta">
        <b>${group.items.length}/5 ${def.name} ${tier.roman} -> 1 ${def.name} ${getEnchantTierInfo(tier.tier + 1).roman}</b>
        <small>${canCraft ? `Mozesz stworzyc: ${craftMax}` : `Brakuje ${5 - group.items.length} szt.`}</small>
      </div>
      <div class="potionCraftActions">
        <button type="button" data-enchant-one="${group.key}" ${canCraft ? "" : "disabled"}>Stworz</button>
        <button type="button" data-enchant-max="${group.key}" ${canCraft && craftMax > 1 ? "" : "disabled"}>Stworz max</button>
      </div>
    `;
    enchantCraftList.appendChild(card);
  });
  enchantCraftList.querySelectorAll("[data-enchant-one]").forEach(button=>{
    button.addEventListener("click", ()=>craftEnchantGroup(button.dataset.enchantOne, 1));
  });
  enchantCraftList.querySelectorAll("[data-enchant-max]").forEach(button=>{
    button.addEventListener("click", ()=>{
      const group = getEnchantGroups().find(item=>item.key === button.dataset.enchantMax);
      craftEnchantGroup(button.dataset.enchantMax, Math.floor((group?.items?.length || 0) / 5));
    });
  });
}

function setAutoEggMode(enabled){
  if(!hasAutoEggUnlock()){
    game.autoEggMode = false;
    lastAutoEggId = null;
    if(hatchOverlay) hatchOverlay.classList.remove("autoMode");
    spawnPopup("AUTO OPEN jest w diamentowych upgrade!", false, false, true);
    if(diamondPanel){
      diamondPanel.classList.add("open");
    }
    game.uiDirty = true;
    update(true, true);
    return false;
  }

  game.autoEggMode = !!enabled;
  if(!game.autoEggMode){
    lastAutoEggId = null;
    if(hatchOverlay) hatchOverlay.classList.remove("autoMode");
  }
  game.uiDirty = true;
  update(true, true);
  return true;
}

function toggleAutoEggMode(){
  setAutoEggMode(!game.autoEggMode);
}

function setAutoCrateMode(enabled){
  if(!hasAutoEggUnlock()){
    game.autoCrateMode = false;
    lastAutoCrateId = null;
    if(hatchOverlay) hatchOverlay.classList.remove("autoMode", "crateMode");
    spawnPopup("AUTO SKRZYNKI jest w diamentowych upgrade!", false, false, true);
    if(diamondPanel){
      diamondPanel.classList.add("open");
    }
    game.uiDirty = true;
    update(true, true);
    return false;
  }

  game.autoCrateMode = !!enabled;
  if(!game.autoCrateMode){
    lastAutoCrateId = null;
    if(hatchOverlay?.classList.contains("crateMode")) hatchOverlay.classList.remove("autoMode");
  }
  game.uiDirty = true;
  update(true, true);
  return true;
}

function toggleAutoCrateMode(){
  setAutoCrateMode(!game.autoCrateMode);
}

function updateAutoOpenToggle(){
  const unlocked = hasAutoEggUnlock();
  if(!unlocked && game.autoEggMode){
    game.autoEggMode = false;
    lastAutoEggId = null;
  }
  if(!unlocked && game.autoCrateMode){
    game.autoCrateMode = false;
    lastAutoCrateId = null;
  }

  if(autoOpenToggle){
    autoOpenToggle.classList.toggle("locked", !unlocked);
    autoOpenToggle.classList.toggle("on", unlocked && game.autoEggMode);
    autoOpenToggle.textContent = unlocked
      ? `AUTO JAJKA: ${game.autoEggMode ? "ON" : "OFF"}`
      : `AUTO JAJKA: ${UI_ICONS.lock}`;
    autoOpenToggle.title = unlocked
      ? "Kliknij, aby wlaczyc albo wylaczyc auto otwieranie jajek."
      : "Odblokuj AUTO OTWIERANIE JAJEK w diamentowych upgrade.";
  }
  if(autoCrateToggle){
    autoCrateToggle.classList.toggle("locked", !unlocked);
    autoCrateToggle.classList.toggle("on", unlocked && game.autoCrateMode);
    autoCrateToggle.textContent = unlocked
      ? `AUTO SKRZYNKI: ${game.autoCrateMode ? "ON" : "OFF"}`
      : `AUTO SKRZYNKI: ${UI_ICONS.lock}`;
    autoCrateToggle.title = unlocked
      ? "Kliknij, aby wlaczyc albo wylaczyc auto otwieranie skrzynek."
      : "Ten sam diamentowy upgrade AUTO OTWIERANIE odblokowuje tez skrzynki.";
  }
}

if(autoOpenToggle){
  autoOpenToggle.onclick = ()=>toggleAutoEggMode();
}

if(autoCrateToggle){
  autoCrateToggle.onclick = ()=>toggleAutoCrateMode();
}

if(gameInfoBtn){
  gameInfoBtn.onclick = ()=>{
    upgradeInfoTitle.textContent = "Informacje i pomoc";
    upgradeInfoBody.innerHTML = `
      <div class="gameInfoGrid">
        <div class="gameInfoBlock">
          <b>Podstawy</b>
          <span>Klikaj kreta, zdobywaj monety i kupuj ulepszenia. Rebirth resetuje zwykly run, ale odblokowuje nowe systemy i mocniejszy progres.</span>
        </div>
        <div class="gameInfoBlock">
          <b>Rebirthy i swiaty</b>
          <span>Pierwszy rebirth zaczyna nowy etap gry. Kolejne swiaty odblokowuja mocniejsze jajka, systemy i pozniejszy endgame.</span>
        </div>
        <div class="gameInfoBlock">
          <b>Pety</b>
          <span>Pety daja bonus do punktow i maly bonus do diamentow. Mozesz zakladac kilka petow naraz, a przycisk w plecaku pozwala zalozyc najlepsze.</span>
        </div>
        <div class="gameInfoBlock">
          <b>Warianty petow</b>
          <span>Normal x1, Gold x1.5, Diamond x2, Shiny x2.5, Shiny Gold x3, Shiny Diamond x4. Shiny laczy sie tylko z shiny.</span>
        </div>
        <div class="gameInfoBlock">
          <b>Jajka, skrzynki i skiny</b>
          <span>Jajka daja pety, skrzynki daja kosmetyczne skiny kreta. Skiny nie daja mocy, ale moga miec efekty i aury.</span>
        </div>
        <div class="gameInfoBlock">
          <b>Diamenty i meta ulepszenia</b>
          <span>Diamenty sa rzadka waluta. Meta ulepszenia za diamenty sa trwale i nie resetuja sie po rebirthach.</span>
        </div>
        <div class="gameInfoBlock">
          <b>Autoclick, przytrzymanie i Diamond Click</b>
          <span>Autoclick dziala sam po kupieniu. Przytrzymanie odblokowuje sie pozniej i pomaga nabijac punkty. Diamond Click daje czasowy bonus.</span>
        </div>
        <div class="gameInfoBlock">
          <b>VOID UPGRADES i Ultra Rdzenie</b>
          <span>Po rebirth 10 zaczyna sie endgame. VOID UPGRADES zostaja na stale, a Ultra Rdzenie sa super rebirthem do dlugiego progresu.</span>
        </div>
        <div class="gameInfoBlock">
          <b>Online</b>
          <span>Konto zapisuje progres online, rankingi i event bossa. Gosc gra lokalnie i nie trafia do rankingow online.</span>
        </div>
      </div>
    `;
    document.getElementById("supportForm")?.classList.add("open");
    document.getElementById("supportFormStatus").textContent = "";
    upgradeInfoOverlay.classList.add("open");
  };
}

if(appInstallBtn){
  appInstallBtn.onclick = openAppInstallModal;
}

if(appInstallClose){
  appInstallClose.onclick = closeAppInstallModal;
}

if(freeRewardsBtn){
  freeRewardsBtn.onclick = openFreeRewards;
}

if(freeRewardsClose){
  freeRewardsClose.onclick = closeFreeRewards;
}

if(freeRewardsOverlay){
  freeRewardsOverlay.addEventListener("click", (event)=>{
    if(event.target === freeRewardsOverlay) closeFreeRewards();
  });
}

if(appInstallOverlay){
  appInstallOverlay.addEventListener("click", (event)=>{
    if(event.target === appInstallOverlay) closeAppInstallModal();
  });
}

if(appInstallPromptBtn){
  appInstallPromptBtn.onclick = async ()=>{
    if(!deferredAppInstallPrompt) return;
    const promptEvent = deferredAppInstallPrompt;
    deferredAppInstallPrompt = null;
    promptEvent.prompt();
    try{
      await promptEvent.userChoice;
    }catch(err){
      console.warn("Install prompt failed", err);
    }
    renderAppInstallModal();
  };
}

codesBtn?.addEventListener("click", ()=>{
  showCodeStatus("");
  codesOverlay?.classList.add("open");
  codesInput?.focus();
});

codesClose?.addEventListener("click", ()=>{
  codesOverlay?.classList.remove("open");
});

codesOverlay?.addEventListener("click", event=>{
  if(event.target === codesOverlay) codesOverlay.classList.remove("open");
});

codesClaim?.addEventListener("click", claimRewardCode);
codesInput?.addEventListener("keydown", event=>{
  if(event.key === "Enter") claimRewardCode();
});

const kretHoverTooltip = document.createElement("div");
kretHoverTooltip.className = "kretHoverTooltip";
document.body.appendChild(kretHoverTooltip);
let currentTooltipTarget = null;

function convertNativeTitle(node){
  if(!(node instanceof Element)) return;
  const convert = element => {
    const title = element.getAttribute("title");
    if(title){
      element.setAttribute("data-kret-title", title);
      element.removeAttribute("title");
    }
  };
  convert(node);
  node.querySelectorAll?.("[title]").forEach(convert);
}

function moveKretTooltip(event){
  if(!kretHoverTooltip.classList.contains("show")) return;
  const pad = 14;
  const rect = kretHoverTooltip.getBoundingClientRect();
  let x = event.clientX + 14;
  let y = event.clientY + 14;
  if(x + rect.width > window.innerWidth - pad) x = event.clientX - rect.width - 14;
  if(y + rect.height > window.innerHeight - pad) y = event.clientY - rect.height - 14;
  kretHoverTooltip.style.left = `${Math.max(pad, x)}px`;
  kretHoverTooltip.style.top = `${Math.max(pad, y)}px`;
}

function showKretTooltip(target, event){
  convertNativeTitle(target);
  const text = target?.getAttribute("data-kret-title");
  if(!text) return;
  currentTooltipTarget = target;
  kretHoverTooltip.textContent = text;
  kretHoverTooltip.classList.add("show");
  moveKretTooltip(event);
}

function hideKretTooltip(){
  currentTooltipTarget = null;
  kretHoverTooltip.classList.remove("show");
}

document.addEventListener("mouseover", (event)=>{
  const target = event.target.closest?.("[title],[data-kret-title]");
  if(target) showKretTooltip(target, event);
});

convertNativeTitle(document.body);
new MutationObserver(mutations=>{
  mutations.forEach(mutation=>{
    mutation.addedNodes.forEach(convertNativeTitle);
    if(mutation.type === "attributes") convertNativeTitle(mutation.target);
  });
}).observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:["title"]});

document.addEventListener("mousemove", moveKretTooltip);

document.addEventListener("mouseout", (event)=>{
  if(currentTooltipTarget && !currentTooltipTarget.contains(event.relatedTarget)){
    hideKretTooltip();
  }
});

window.addEventListener("beforeinstallprompt", (event)=>{
  event.preventDefault();
  deferredAppInstallPrompt = event;
  renderAppInstallModal();
});

window.addEventListener("appinstalled", ()=>{
  deferredAppInstallPrompt = null;
  renderAppInstallModal();
});

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("sw.js").catch(err=>console.warn("Service worker register failed", err));
  });
}

if(indexDockBtn && indexPanel){
  indexDockBtn.textContent = "📖";
  indexDockBtn.onclick = () => {
    const willOpen = !indexPanel.classList.contains("open");
    indexPanel.classList.toggle("open", willOpen);
    diamondPanel?.classList.remove("open");
    leaderboardPanel?.classList.remove("open");
    globalBossPanel?.classList.remove("open");
    if(willOpen && typeof window.refreshExistCounts === "function"){
      window.refreshExistCounts().then(()=>renderIndexPanel());
    }
    renderSideUi(true);
  };
}

setInterval(()=>{
  if(document.visibilityState !== "visible") return;
  if(document.getElementById("authOverlay")?.classList.contains("open")) return;
  const state = getFreeRewardsState();
  state.playSeconds += 1;
  renderFreeRewards();
  if(Date.now() - lastFreeRewardsPlaytimeSaveAt > 15000){
    lastFreeRewardsPlaytimeSaveAt = Date.now();
    if(typeof shouldWriteGuestSave === "function" && shouldWriteGuestSave()){
      localStorage.setItem("guestSave", JSON.stringify(game));
    }
    if(typeof requestCloudSave === "function"){
      requestCloudSave({reason:"freeRewardsPlaytime"});
    }
  }
}, 1000);

setInterval(()=>{
  if(document.visibilityState === "visible" && typeof window.refreshExistCounts === "function"){
    window.refreshExistCounts().then(()=>game.uiDirty = true);
  }
}, 5 * 60 * 1000);

setTimeout(()=>{
  if(typeof window.refreshExistCounts === "function"){
    window.refreshExistCounts(true).then(()=>update(false, true));
  }
}, 2500);

window.addEventListener("beforeunload", ()=>{
  getFreeRewardsState();
  if(typeof shouldWriteGuestSave === "function" && shouldWriteGuestSave()){
    localStorage.setItem("guestSave", JSON.stringify(game));
  }
});

function getDiamondUpgradeCategory(def){
  if(["eggBatch","autoEgg","hatchSpeed"].includes(def.id)){
    return "jajka";
  }
  if(["petSlots","ultraKeepPets","enchantSlots","autoPetXp"].includes(def.id)){
    return "pety";
  }
  if(["goldPetChance","diamondPetChance","shinyPetChance"].includes(def.id)){
    return "dropy petow";
  }
  if(["diamondChance"].includes(def.id)){
    return "diamenty";
  }
  if(["goldChance"].includes(def.id)){
    return "kliki";
  }
  if(def.id.startsWith("diamondRush")){
    return "diamond click";
  }
  return "inne";
}

function getDiamondCategoryTitle(category){
  return {
    "jajka":"JAJKA I OTWIERANIE",
    "pety":"PETY I PLECAK",
    "dropy petow":"DROPY WARIANTOW PETOW",
    "diamenty":"DIAMENTY",
    "kliki":"KLIKI",
    "diamond click":"DIAMOND CLICK",
    "inne":"INNE"
  }[category] || category.toUpperCase();
}

function makeDiamondUpgradeCard(def){
  const level = getMetaLevel(def.id);
  const maxed = level >= def.max;
  const price = getMetaCost(def);
  const rebirthLocked = !!def.unlockAtRebirth && game.rebirths < def.unlockAtRebirth;
  const rushLocked = def.id !== "diamondRushUnlock" && def.id.startsWith("diamondRush") && !hasDiamondRush();
  const locked = rebirthLocked || rushLocked;
  const affordable = game.diamonds >= price && !maxed && !locked;
  const card = document.createElement("div");
  card.className = "eggCard diamondCard" + (!affordable && !maxed ? " locked" : "");
  if(affordable) card.onclick = ()=>buyDiamondUpgrade(def.id);

  const infoBtn = document.createElement("button");
  infoBtn.className = "infoDot";
  infoBtn.textContent = "i";
  infoBtn.onclick = (e)=>{
    e.stopPropagation();
    openUpgradeInfo(def.name, upgradeInfoMap[def.id] || def.desc);
  };
  card.appendChild(infoBtn);

  let extra = "Trwale ulepszenie";
  if(def.id === "eggBatch") extra = `Teraz: ${getEggBatchSize()} jajko/a naraz`;
  else if(def.id === "petSlots") extra = `Teraz: ${getMaxActivePets()} aktywnych petow`;
  else if(def.id === "autoEgg") extra = hasAutoEggUnlock() ? `Jajka: ${game.autoEggMode ? "ON" : "OFF"} | Skrzynki: ${game.autoCrateMode ? "ON" : "OFF"}` : "Odblokowuje AUTO JAJKA i AUTO SKRZYNKI";
  else if(def.id === "hatchSpeed") extra = `Szybkosc: x${(1 / getHatchSpeedFactor()).toFixed(2)}`;
  else if(def.id === "goldChance") extra = `Szansa: ${(getGoldClickChance() * 100).toFixed(1)}% | klik x5`;
  else if(def.id === "diamondRushUnlock") extra = hasDiamondRush() ? "Odblokowane na stale" : "Od rebirth 5";
  else if(def.id === "diamondRushCooldown") extra = `Cooldown: ${Math.round(getDiamondRushCooldownMs() / 1000)}s`;
  else if(def.id === "diamondRushDuration") extra = `Czas: ${Math.round(getDiamondRushDurationMs() / 1000)}s`;
  else if(def.id === "diamondRushBoost") extra = `Boost diamentow: x${getDiamondRushChanceBoost()}`;
  else if(def.id === "diamondChance") extra = `Mnoznik szansy: x${getDiamondChanceUpgradeMultiplier().toFixed(2)}`;
  else if(def.id === "ultraKeepPets") extra = `Ultra zachowa: ${getUltraKeepPetLimit()} zwykle pety`;
  else if(def.id === "enchantSlots") extra = `Sloty enchantow: ${getMaxActiveEnchants()}`;
  else if(def.id === "goldPetChance") extra = `Szansa: ${(getGoldPetDropChance() * 100).toFixed(2)}%`;
  else if(def.id === "diamondPetChance") extra = `Szansa: ${(getDiamondPetDropChance() * 100).toFixed(2)}%`;
  else if(def.id === "shinyPetChance") extra = `Szansa: ${(getShinyPetDropChance() * 100).toFixed(2)}%`;
  else if(def.id === "autoPetXp") extra = level <= 0 ? "Autoclick XP: OFF" : `Autoclick XP: ${Math.round(getAutoPetXpRatio() * 100)}% normalnego kliku`;

  let status = "Gotowe";
  if(rebirthLocked) status = `Od rebirth ${def.unlockAtRebirth}`;
  else if(rushLocked) status = "Najpierw kup DIAMOND CLICK";
  else if(maxed) status = "MAX";
  else if(!affordable) status = "Za malo diamentow!";

  const priceLabel = maxed ? "Gotowe" : formatDiamond(price);
  const top = document.createElement("div");
  top.className = "eggTop";
  const displayName = def.id === "autoPetXp" && level > 0 ? "WIECEJ XP Z AUTOCLICKA" : def.name;
  top.innerHTML = `
    <div class="eggCircle" style="background:linear-gradient(135deg,#5ad9ff,#3466ff)"></div>
    <div class="eggMeta">
      <b>${displayName}</b>
      <small>${def.desc}<br>${extra}</small>
    </div>
  `;
  card.appendChild(top);

  const badge = document.createElement("div");
  badge.className = "petBadge";
  badge.textContent = status;
  card.appendChild(badge);

  const footer = document.createElement("div");
  footer.style.marginTop = "8px";
  footer.style.display = "flex";
  footer.style.justifyContent = "space-between";
  footer.style.alignItems = "center";
  footer.style.fontSize = "11px";
  footer.style.opacity = ".82";
  footer.innerHTML = `<span>${level}/${def.max}</span><span>${priceLabel}</span>`;
  card.appendChild(footer);

  return card;
}

function renderDiamondPanel(){
  diamondUpgradeList.innerHTML = "";
  const headerNote = diamondPanel.querySelector(".slideHeader span");
  if(headerNote){
    headerNote.textContent = "Meta ulepszenia sa trwale, nie resetuja sie i nie usuwaja przy rebirthie.";
  }

  const categories = ["jajka","pety","dropy petow","diamenty","kliki","diamond click","inne"];
  categories.forEach(category=>{
    const items = diamondUpgradeCatalog.filter(def=>getDiamondUpgradeCategory(def) === category);
    if(!items.length) return;

    const section = document.createElement("div");
    section.className = "sectionTitle";
    section.textContent = getDiamondCategoryTitle(category);
    diamondUpgradeList.appendChild(section);

    items.forEach(def=>diamondUpgradeList.appendChild(makeDiamondUpgradeCard(def)));
  });

  diamondDockBtn.classList.toggle("active", diamondPanel.classList.contains("open"));
}

const LIMITED_EVENT_END_AT = new Date("2026-09-27T20:00:00+02:00").getTime();
const CRYSTAL_EVENT_END_AT = LIMITED_EVENT_END_AT;
const CRYSTAL_EVENT_SHOP_CLOSE_AT = new Date("2026-09-28T20:00:00+02:00").getTime();
const NEXT_LIMITED_EVENT_AT = new Date("2026-09-29T20:00:00+02:00").getTime();

function getCrystalEventPhase(now=Date.now()){
  if(now < CRYSTAL_EVENT_END_AT) return "active";
  if(now < CRYSTAL_EVENT_SHOP_CLOSE_AT) return "shopOnly";
  return "teaser";
}

function getCrystalEventCountdownTarget(phase=getCrystalEventPhase()){
  if(phase === "active") return CRYSTAL_EVENT_END_AT;
  if(phase === "shopOnly") return CRYSTAL_EVENT_SHOP_CLOSE_AT;
  return NEXT_LIMITED_EVENT_AT;
}

function getCrystalEventCountdownLabel(phase=getCrystalEventPhase()){
  if(phase === "active") return "Koniec eventu";
  if(phase === "shopOnly") return "Sklep zamknie sie za";
  return "Nowy event za";
}

function canMineCrystalEvent(){
  return getCrystalEventPhase() === "active";
}

function canSpendCrystalCurrency(){
  return getCrystalEventPhase() !== "teaser";
}

let renderedCrystalEventPhase = "";

function syncCrystalEventPhaseUi(){
  const phase = getCrystalEventPhase();
  if(crystalEventCountdownText){
    const label = crystalEventCountdownText.previousElementSibling;
    if(label) label.textContent = getCrystalEventCountdownLabel(phase);
  }
  crystalEventView?.classList.toggle("crystalPhaseShopOnly", phase === "shopOnly");
  crystalEventView?.classList.toggle("crystalPhaseTeaser", phase === "teaser");
  const eventKicker = crystalEventView?.querySelector(".crystalEventTop > div:first-child span");
  const eventTitle = crystalEventView?.querySelector(".crystalEventTop > div:first-child h2");
  if(eventKicker) eventKicker.textContent = phase === "teaser" ? "NADCHODZI NOWY EVENT" : "CRYSTAL EVENT";
  if(eventTitle) eventTitle.textContent = phase === "teaser" ? "???" : "Crystal Cave";
  crystalMole?.setAttribute("aria-disabled", String(phase !== "active"));
  if(limitedEventDockBtn){
    limitedEventDockBtn.classList.toggle("eventMystery", phase === "teaser");
    limitedEventDockBtn.title = phase === "teaser" ? "???" : "Crystal Event";
    if(renderedCrystalEventPhase !== phase){
      limitedEventDockBtn.innerHTML = phase === "teaser"
        ? `<span class="eventDockQuestion">?</span><span class="eventDockMysteryTooltip">???</span>`
        : `<span class="crystalCurrencyIcon dockCrystalIcon"></span>`;
    }
  }
  renderedCrystalEventPhase = phase;
  return phase;
}

const CRYSTAL_EVENT_CONFIG = {
  eggCost:10000,
  shopIntervalMs:15 * 60 * 1000,
  upgrades:[
    {id:"speed", name:"Szybkosc kopania", max:10, base:45, scale:1.9, desc:"Krotszy cooldown kilofa."},
    {id:"power", name:"Sila kilofa", max:15, base:55, scale:2.05, desc:"Wiecej krysztalow za kopanie."},
    {id:"bonus", name:"Bonusowe krysztaly", max:12, base:75, scale:2.1, desc:"Dodatkowy mnoznik crystal currency."},
    {id:"luck", name:"Event luck", max:10, base:113, scale:2.25, desc:"Lepsze szanse w Krysztalowym Jajku."}
  ],
  pets:[
    {id:"crystal_scout", name:"Krysztalowy Zwiadowca", icon:"◇", scale:.7, weight:5200, rarity:"Exclusive"},
    {id:"crystal_guard", name:"Krysztalowy Straznik", icon:"◆", scale:.8, weight:3000, rarity:"Exclusive"},
    {id:"crystal_oracle", name:"Krysztalowa Wyrocznia", icon:"✦", scale:.95, weight:1350, rarity:"Exclusive"},
    {id:"crystal_emperor", name:"Krysztalowy Cesarz", icon:"✧", scale:1.2, weight:420, rarity:"Exclusive"},
    {id:"crystal_overlord", name:"Krysztalowy Kret", icon:"✹", scale:1.5, weight:30, rarity:"Exclusive", secret:true}
  ],
  shopPool:[
    {id:"luck_potion_1", label:"Luck Potion I", type:"potion", potion:"luck:t1", cost:175, stock:2},
    {id:"money_potion_1", label:"Coins Potion I", type:"potion", potion:"money:t1", cost:150, stock:2},
    {id:"diamonds_potion_1", label:"Diamenty Potion I", type:"potion", potion:"diamonds:t1", cost:200, stock:1},
    {id:"luck_potion_2", label:"Luck Potion II", type:"potion", potion:"luck:t2", cost:650, stock:1},
    {id:"weak_bag", label:"Slaba sakiewka", type:"bag", bag:"weak", cost:300, stock:2},
    {id:"medium_bag", label:"Srednia sakiewka", type:"bag", bag:"medium", cost:950, stock:1},
    {id:"event_luck_boost", label:"Event Luck x2 - 10 min", type:"boost", boost:"luck", tier:1, cost:563, stock:1},
    {id:"event_coins_boost", label:"Coins x2 - 10 min", type:"boost", boost:"money", tier:1, cost:475, stock:1},
    {id:"crystal_mole_skin", label:"Skin Krysztalowego Kreta", type:"skin", cost:10000, stock:1, ultraRare:true}
  ]
};
let crystalRenderedShopWindow = null;

function ensureCrystalEventState(){
  game.crystalEvent = game.crystalEvent && typeof game.crystalEvent === "object" ? game.crystalEvent : {};
  game.crystalEvent.currency = Math.max(0, Number(game.crystalEvent.currency) || 0);
  game.crystalEvent.upgrades = game.crystalEvent.upgrades && typeof game.crystalEvent.upgrades === "object" ? game.crystalEvent.upgrades : {};
  game.crystalEvent.shopBought = game.crystalEvent.shopBought && typeof game.crystalEvent.shopBought === "object" ? game.crystalEvent.shopBought : {};
  return game.crystalEvent;
}

function getCrystalUpgradeLevel(id){
  return Number(ensureCrystalEventState().upgrades[id]) || 0;
}

function getCrystalUpgradeCost(def){
  return Math.floor(def.base * Math.pow(def.scale, getCrystalUpgradeLevel(def.id)));
}

function getCrystalMineCooldown(){
  return Math.max(420, 950 - getCrystalUpgradeLevel("speed") * 45);
}

function getCrystalMineGain(){
  const powerLevel = getCrystalUpgradeLevel("power");
  const bonusLevel = getCrystalUpgradeLevel("bonus");
  const gain = 1 + powerLevel * 0.5 + bonusLevel * 0.35 + powerLevel * bonusLevel * 0.04;
  return Math.max(1, Math.round(gain));
}

function getCrystalShopWindow(){
  return Math.floor(Date.now() / CRYSTAL_EVENT_CONFIG.shopIntervalMs);
}

function seededCrystalRandom(seed){
  let value = Math.sin(seed * 9301 + 49297) * 233280;
  return value - Math.floor(value);
}

function getCrystalShopItems(){
  const windowId = getCrystalShopWindow();
  const skinItem = CRYSTAL_EVENT_CONFIG.shopPool.find(item=>item.id === "crystal_mole_skin");
  const pool = CRYSTAL_EVENT_CONFIG.shopPool.filter(item=>item.id !== "crystal_mole_skin");
  const picked = [];
  for(let i = 0; i < pool.length && picked.length < 3; i++){
    const index = Math.floor(seededCrystalRandom(windowId + i * 17) * pool.length);
    const item = pool[index];
    if(item && !picked.some(entry=>entry.id === item.id)) picked.push(item);
  }
  const result = picked.length === 3 ? picked : pool.slice(0, 3);
  if(skinItem && seededCrystalRandom(windowId + 9917) < 0.001){
    result[Math.min(2, result.length - 1)] = skinItem;
  }
  return result;
}

function getCrystalPetWeights(){
  const luck = 1 + getCrystalUpgradeLevel("luck") * .07;
  return CRYSTAL_EVENT_CONFIG.pets.map((pet, index)=>{
    if(index < 2) return pet.weight;
    return Math.max(1, pet.weight * luck);
  });
}

function rollCrystalPetTemplate(){
  const weights = getCrystalPetWeights();
  const total = weights.reduce((sum, value)=>sum + value, 0);
  let roll = Math.random() * total;
  for(let i = 0; i < CRYSTAL_EVENT_CONFIG.pets.length; i++){
    roll -= weights[i];
    if(roll <= 0) return CRYSTAL_EVENT_CONFIG.pets[i];
  }
  return CRYSTAL_EVENT_CONFIG.pets[0];
}

function getBestPetForCrystalScaling(){
  const pets = typeof getOwnedPets === "function" ? getOwnedPets() : (Array.isArray(game.pets) ? game.pets : []);
  return pets.slice().sort((a,b)=>(Number(b.powerRank) || 0) - (Number(a.powerRank) || 0))[0] || null;
}

function makeCrystalPet(template){
  const best = getBestPetForCrystalScaling();
  const baseClick = Math.max(20, Number(best?.click) || getNormalClickPower?.() || 20);
  const baseMulti = Math.max(.25, Number(best?.multi) || .4);
  const baseDiamond = Math.max(.05, typeof getPetDiamondBonusValue === "function" ? getPetDiamondBonusValue(best) : .05);
  const pet = {
    uid:`crystal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    templateId:template.id,
    baseName:template.name,
    templateName:template.name,
    name:template.name,
    displayName:template.name,
    icon:template.icon,
    rarity:template.rarity || (template.secret ? "Sekretny" : "Exclusive"),
    click:Math.max(1, Math.floor(baseClick * template.scale)),
    multi:+(baseMulti * template.scale).toFixed(4),
    diamond:+(baseDiamond * template.scale).toFixed(4),
    color:"#8df6ff",
    sourceEgg:"Krysztalowe Jajko",
    secret:!!template.secret,
    exclusive:true,
    variant:"normal",
    shiny:false,
    crystal:true,
    aura:template.secret ? "crystalStrong" : "crystal"
  };
  pet.variantKey = typeof getPetVariantKey === "function" ? getPetVariantKey(pet) : pet.templateId;
  pet.powerRank = typeof getPetPowerRank === "function" ? getPetPowerRank(pet) : pet.click + pet.multi * 100;
  return pet;
}

function renderCrystalEvent(){
  const state = ensureCrystalEventState();
  const phase = syncCrystalEventPhaseUi();
  if(phase === "teaser"){
    updateCrystalDynamicFields();
    return;
  }
  if(crystalUpgradeList){
    crystalUpgradeList.innerHTML = CRYSTAL_EVENT_CONFIG.upgrades.map(def=>{
      const level = getCrystalUpgradeLevel(def.id);
      const maxed = level >= def.max;
      const cost = getCrystalUpgradeCost(def);
      const afford = state.currency >= cost;
      return `
        <div class="crystalUpgradeRow">
          <div class="crystalUpgradeRowTop">
            <b>${def.name} ${level}/${def.max}</b>
            <small>${def.desc}</small>
          </div>
          <button class="crystalUpgradeBtn" type="button" data-crystal-upgrade="${def.id}" ${maxed || !afford ? "disabled" : ""}>
            ${maxed ? "MAX" : `Kup za ${format(cost)} ${crystalIconMarkup()}`}
          </button>
        </div>
      `;
    }).join("");
  }
  if(crystalEggInfo){
    const weights = getCrystalPetWeights();
    const total = weights.reduce((sum, value)=>sum + value, 0);
    crystalEggInfo.innerHTML = CRYSTAL_EVENT_CONFIG.pets.map((pet, index)=>`
      <div class="crystalPetChance">
        <b>${pet.name}</b>
        <small>${Math.max(.01, weights[index] / total * 100).toFixed(2)}% | ${Math.round(pet.scale * 100)}% najlepszego peta</small>
      </div>
    `).join("");
  }
  if(crystalOpenEggBtn){
    crystalOpenEggBtn.disabled = state.currency < CRYSTAL_EVENT_CONFIG.eggCost || hatchBusy;
    crystalOpenEggBtn.innerHTML = `KUP JAJKO ZA ${format(CRYSTAL_EVENT_CONFIG.eggCost)} ${crystalIconMarkup()}`;
  }
  renderCrystalShop();
  updateCrystalDynamicFields();
}

function updateCrystalDynamicFields(){
  const state = ensureCrystalEventState();
  const phase = syncCrystalEventPhaseUi();
  if(crystalCurrencyText) crystalCurrencyText.textContent = format(state.currency);
  if(crystalEventCountdownText){
    crystalEventCountdownText.textContent = formatLimitedEventTime(getCrystalEventCountdownTarget(phase) - Date.now());
  }
  if(crystalMineStatus){
    const left = Math.max(0, Number(state.cooldownUntil || 0) - Date.now());
    const cooldown = Math.max(1, getCrystalMineCooldown());
    const progress = left > 0 ? Math.max(0, Math.min(1, 1 - (left / cooldown))) : 1;
    crystalMineStatus.classList.toggle("ready", left <= 0);
    if(crystalMineStatusText){
      const statusHtml = phase !== "active"
        ? "Kopanie zakonczone"
        : left > 0
          ? "Kilof sie laduje"
          : `Gotowe | +${format(getCrystalMineGain())} ${crystalIconMarkup("tiny")}`;
      if(statusHtml !== crystalMineStatusHtml){
        crystalMineStatusHtml = statusHtml;
        crystalMineStatusText.innerHTML = statusHtml;
      }
    }
    if(crystalCooldownFill){
      crystalCooldownFill.style.width = `${Math.round(progress * 100)}%`;
    }
  }
  if(crystalMineBtn) crystalMineBtn.disabled = phase !== "active" || (Number(state.cooldownUntil || 0) > Date.now());
  if(crystalOpenEggBtn){
    crystalOpenEggBtn.disabled = state.currency < CRYSTAL_EVENT_CONFIG.eggCost || hatchBusy;
  }
  crystalUpgradeList?.querySelectorAll("[data-crystal-upgrade]").forEach(button=>{
    const def = CRYSTAL_EVENT_CONFIG.upgrades.find(item=>item.id === button.dataset.crystalUpgrade);
    if(!def) return;
    const level = getCrystalUpgradeLevel(def.id);
    button.disabled = level >= def.max || state.currency < getCrystalUpgradeCost(def);
  });
  crystalShopList?.querySelectorAll("[data-crystal-shop]").forEach(button=>{
    const item = getCrystalShopItems().find(entry=>entry.id === button.dataset.crystalShop);
    if(!item) return;
    const key = `${getCrystalShopWindow()}:${item.id}`;
    const bought = Number(state.shopBought[key]) || 0;
    const left = Math.max(0, item.stock - bought);
    button.disabled = left <= 0 || state.currency < item.cost;
  });
  if(crystalShopTimer){
    const windowId = getCrystalShopWindow();
    const next = (windowId + 1) * CRYSTAL_EVENT_CONFIG.shopIntervalMs;
    crystalShopTimer.textContent = `Refresh za ${Math.ceil((next - Date.now()) / 60000)} min`;
    if(crystalRenderedShopWindow !== null && crystalRenderedShopWindow !== windowId){
      renderCrystalShop();
    }
  }
}

function renderCrystalShop(){
  const state = ensureCrystalEventState();
  const windowId = getCrystalShopWindow();
  crystalRenderedShopWindow = windowId;
  if(!crystalShopList) return;
  crystalShopList.innerHTML = getCrystalShopItems().map(item=>{
    const key = `${windowId}:${item.id}`;
    const bought = Number(state.shopBought[key]) || 0;
    const left = Math.max(0, item.stock - bought);
    const afford = state.currency >= item.cost;
    return `
      <div class="crystalShopItem">
        <div class="crystalShopItemTop">
          <b>${item.label}</b>
          <small>Stock: ${left}/${item.stock}</small>
        </div>
        <button class="crystalBuyBtn" type="button" data-crystal-shop="${item.id}" ${left <= 0 || !afford ? "disabled" : ""}>
          Kup za ${format(item.cost)} ${crystalIconMarkup()}
        </button>
      </div>
    `;
  }).join("");
}

function openCrystalEvent(){
  closeAllSlidePanels?.();
  crystalEventView?.classList.remove("closing");
  crystalEventView?.classList.add("open");
  document.body.classList.add("crystalEventActive");
  renderCrystalEvent();
}

function closeCrystalEvent(){
  if(!crystalEventView) return;
  crystalEventView.classList.add("closing");
  crystalEventView.classList.remove("open");
  document.body.classList.remove("crystalEventActive");
  setTimeout(()=>crystalEventView.classList.remove("closing"), 360);
}

function saveCrystalEvent(reason="crystalEvent"){
  if(reason !== "crystalMine") game.uiDirty = true;
  update(true, false);
  if(typeof forceKretLocalSave === "function") forceKretLocalSave();
  if(typeof requestCloudSave === "function") requestCloudSave({force:reason !== "crystalMine", reason});
}

function mineCrystal(){
  if(!canMineCrystalEvent()){
    spawnPopup("Kopanie krysztalow zostalo zakonczone.", false, false, true);
    return;
  }
  const state = ensureCrystalEventState();
  const now = Date.now();
  if(Number(state.cooldownUntil || 0) > now) return;
  const gain = getCrystalMineGain();
  state.currency += gain;
  state.cooldownUntil = now + getCrystalMineCooldown();
  crystalMole?.classList.remove("hit");
  if(crystalMole) void crystalMole.offsetWidth;
  crystalMole?.classList.add("hit");
  showCrystalMineFloat(gain);
  window.kretAudio?.crystalMine?.();
  saveCrystalEvent("crystalMine");
  updateCrystalDynamicFields();
}

function showCrystalMineFloat(gain){
  if(!crystalMole) return;
  const node = document.createElement("div");
  node.className = "crystalFloatGain";
  node.innerHTML = `+${format(gain)} ${crystalIconMarkup("mini")}`;
  crystalMole.appendChild(node);
  setTimeout(()=>node.remove(), 1050);
}

function buyCrystalUpgrade(id){
  if(!canSpendCrystalCurrency()) return;
  const def = CRYSTAL_EVENT_CONFIG.upgrades.find(item=>item.id === id);
  if(!def) return;
  const state = ensureCrystalEventState();
  const level = getCrystalUpgradeLevel(id);
  if(level >= def.max) return;
  const cost = getCrystalUpgradeCost(def);
  if(state.currency < cost){
    spawnPopup("Za malo krysztalow!", false, false, true);
    return;
  }
  state.currency -= cost;
  state.upgrades[id] = level + 1;
  spawnPopup(`${def.name} ${level + 1}/${def.max}`, false, false, true);
  saveCrystalEvent("crystalUpgrade");
  renderCrystalEvent();
}

function openCrystalEgg(){
  if(!canSpendCrystalCurrency()) return;
  const state = ensureCrystalEventState();
  if(state.currency < CRYSTAL_EVENT_CONFIG.eggCost){
    spawnPopup("Za malo krysztalow!", false, false, true);
    return;
  }
  state.currency -= CRYSTAL_EVENT_CONFIG.eggCost;
  addInventoryEggs("crystal_event_egg", 1);
  game.uiDirty = true;
  window.kretAudio?.crystalEgg?.();
  showItemDropTile("crystalEgg", {icon:"◇", color:"#8df6ff"});
  spawnPopup("Krysztalowe Jajko dodano do plecaka!", false, false, true);
  saveCrystalEvent("crystalEggPurchase");
  renderCrystalEvent();
}

function addCrystalMoleSkin(){
  game.skins = Array.isArray(game.skins) ? game.skins : [];
  if(game.skins.some(skin=>skin.templateId === "skin_crystal_mole")){
    spawnPopup("Masz juz skin Krysztalowego Kreta!", false, false, true);
    return false;
  }
  game.skins.push({
    uid:`skin_${game.skinSeq++}`,
    templateId:"skin_crystal_mole",
    crateId:"crystal_event_shop",
    name:"Skin Krysztalowego Kreta",
    displayName:"Skin Krysztalowego Kreta",
    skinClass:"skin-crystal-mole",
    rarity:"Exclusive",
    accent:"#8df6ff",
    sourceCrate:"Crystal Shop",
    aura:"Crystal aura",
    exclusive:true,
    event:true,
    powerRank:98000
  });
  if(typeof trackExist === "function") trackExist("skins", "skin_crystal_mole");
  window.kretAudio?.crystalEgg?.();
  return true;
}

function buyCrystalShopItem(id){
  if(!canSpendCrystalCurrency()) return;
  const item = getCrystalShopItems().find(entry=>entry.id === id);
  if(!item) return;
  const state = ensureCrystalEventState();
  const windowId = getCrystalShopWindow();
  const key = `${windowId}:${item.id}`;
  const bought = Number(state.shopBought[key]) || 0;
  if(bought >= item.stock) return;
  if(state.currency < item.cost){
    spawnPopup("Za malo krysztalow!", false, false, true);
    return;
  }
  state.currency -= item.cost;
  state.shopBought[key] = bought + 1;
  if(item.type === "potion"){
    game.potions = Array.isArray(game.potions) ? game.potions : [];
    const [typeId, tierRaw] = String(item.potion || "money:t1").split(":t");
    game.potions.push(makePotionInstance(typeId, Number(tierRaw) || 1));
  }else if(item.type === "bag"){
    game.bags = Array.isArray(game.bags) ? game.bags : [];
    addBagToInventory(item.bag || "weak", 1);
  }else if(item.type === "boost"){
    if(typeof addActivePotionBuff === "function") addActivePotionBuff(item.boost, item.tier || 1, 10 * 60 * 1000);
  }else if(item.type === "skin"){
    if(!addCrystalMoleSkin()){
      state.currency += item.cost;
      state.shopBought[key] = bought;
      return;
    }
  }
  window.kretAudio?.crystalShop?.();
  spawnPopup(`Kupiono: ${item.label}`, false, false, true);
  saveCrystalEvent("crystalShop");
  renderCrystalEvent();
}

function formatLimitedEventTime(ms){
  const safe = Math.max(0, Number(ms) || 0);
  const days = Math.floor(safe / 86400000);
  const hours = Math.floor((safe % 86400000) / 3600000);
  const minutes = Math.floor((safe % 3600000) / 60000);
  if(days > 0) return `${days}d ${hours}h ${minutes}m`;
  if(hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function renderLimitedEventPanel(){
  if(!limitedEventContent) return;
  const left = LIMITED_EVENT_END_AT - Date.now();
  const timeText = left > 0 ? formatLimitedEventTime(left) : "Zakonczony";
  const existingTimer = limitedEventContent.querySelector(".limitedEventTimeValue");
  if(existingTimer && limitedEventContent.dataset.rendered === "1"){
    existingTimer.textContent = timeText;
    limitedEventDockBtn?.classList.toggle("active", limitedEventPanel?.classList.contains("open"));
    return;
  }
  limitedEventContent.innerHTML = `
    <div class="limitedEventHero">
      <div class="limitedEventBadge">LIMITED / LAUNCH</div>
      <h3>Event Startowy</h3>
      <div class="limitedEventTimer">
        <span>Czas eventu</span>
        <b class="limitedEventTimeValue">${timeText}</b>
      </div>
      <div class="limitedEventReward">
        <div class="limitedEventPet">&#10022;</div>
        <div>
          <b>Exclusive pet: Kret Eventowy</b>
          <span>Limitowany pet z premium aura. Dostepny tylko podczas specjalnych eventow.</span>
        </div>
      </div>
      <div class="limitedEventBonusGrid">
        <div class="limitedEventBonus">
          <b>Bonus eventowy</b>
          <span>Wiekszy luck i lepsze nagrody podczas aktywnego eventu.</span>
        </div>
        <div class="limitedEventBonus">
          <b>Event rewards</b>
          <span>Specjalne dropy, exclusive itemy i bonusowe nagrody.</span>
        </div>
      </div>
    </div>
  `;
  limitedEventContent.dataset.rendered = "1";
  limitedEventDockBtn?.classList.toggle("active", limitedEventPanel?.classList.contains("open"));
}

if(petForgeDockBtn){
  petForgeDockBtn.textContent = UI_ICONS.star || "*";
  petForgeDockBtn.onclick = () => {
    if(!hasGoldenPetFeature()){
      spawnPopup("Goldenowanie od rebirth 3!", false, false, true);
      renderPetForgePanel();
      return;
    }
    const willOpen = !petForgePanel.classList.contains("open");
    petForgePanel.classList.toggle("open", willOpen);
    eggPanel.classList.remove("open");
    cratePanel.classList.remove("open");
    petPanel.classList.remove("open");
    if(limitedEventPanel) limitedEventPanel.classList.remove("open");
    if(potionCraftPanel) potionCraftPanel.classList.remove("open");
    if(enchantCraftPanel) enchantCraftPanel.classList.remove("open");
    if(petDiamondPanel) petDiamondPanel.classList.remove("open");
    renderSideUi(true);
  };
}

if(petDiamondDockBtn){
  petDiamondDockBtn.textContent = UI_ICONS.diamond || "D";
  petDiamondDockBtn.onclick = () => {
    if(!hasDiamondPetFeature()){
      spawnPopup("Diamentowanie od rebirth 5!", false, false, true);
      renderPetDiamondPanel();
      return;
    }
    const willOpen = !petDiamondPanel.classList.contains("open");
    petDiamondPanel.classList.toggle("open", willOpen);
    eggPanel.classList.remove("open");
    cratePanel.classList.remove("open");
    petPanel.classList.remove("open");
    if(limitedEventPanel) limitedEventPanel.classList.remove("open");
    if(potionCraftPanel) potionCraftPanel.classList.remove("open");
    if(enchantCraftPanel) enchantCraftPanel.classList.remove("open");
    if(petForgePanel) petForgePanel.classList.remove("open");
    renderSideUi(true);
  };
}

if(limitedEventDockBtn){
  limitedEventDockBtn.onclick = () => {
    openCrystalEvent();
  };
}

if(upgradeHubDockBtn && upgradeHubPanel){
  upgradeHubDockBtn.onclick = () => {
    const willOpen = !upgradeHubPanel.classList.contains("open");
    upgradeHubPanel.classList.toggle("open", willOpen);
    closeGameplaySidePanels?.(upgradeHubPanel);
    closeUpgradeSubPanels();
    if(willOpen) renderUpgradeHubPanel();
    renderSideUi(true);
  };
}

upgradeHubList?.addEventListener("click", event=>{
  const card = event.target instanceof Element ? event.target.closest("[data-upgrade-hub]") : null;
  if(card) openUpgradeHubOption(card.dataset.upgradeHub);
});

if(weatherDockBtn && weatherPanel){
  weatherDockBtn.onclick = () => {
    const willOpen = !weatherPanel.classList.contains("open");
    weatherPanel.classList.toggle("open", willOpen);
    closeGameplaySidePanels?.(weatherPanel);
    if(willOpen) renderWeatherPanel();
    renderSideUi(true);
  };
}

const dockPanelMap = {
  eggDockBtn:eggPanel,
  crateDockBtn:cratePanel,
  petDockBtn:petPanel,
  upgradeHubDockBtn:upgradeHubPanel,
  weatherDockBtn:weatherPanel,
  potionCraftDockBtn:potionCraftPanel,
  enchantCraftDockBtn:enchantCraftPanel,
  petForgeDockBtn:petForgePanel,
  petDiamondDockBtn:petDiamondPanel,
  limitedEventDockBtn:limitedEventPanel,
  diamondDockBtn:diamondPanel,
  indexDockBtn:indexPanel,
  leaderboardDockBtn:typeof leaderboardPanel !== "undefined" ? leaderboardPanel : null,
  globalBossDockBtn:typeof globalBossPanel !== "undefined" ? globalBossPanel : null
};

function closeGameplaySidePanels(exceptPanel=null){
  Object.values(dockPanelMap).forEach(panel=>{
    if(panel && panel !== exceptPanel) panel.classList.remove("open");
  });
}

window.closeGameplaySidePanels = closeGameplaySidePanels;

document.addEventListener("click", event=>{
  const dockButton = event.target instanceof Element ? event.target.closest(".dockBtn") : null;
  if(!dockButton) return;
  window.setTimeout(()=>{
    const keepPanel = dockPanelMap[dockButton.id] || null;
    closeGameplaySidePanels(keepPanel);
    refreshPanelDockState?.();
  }, 0);
});

crystalEventBackBtn?.addEventListener("click", closeCrystalEvent);
crystalMineBtn?.addEventListener("click", mineCrystal);
crystalMole?.addEventListener("click", mineCrystal);
crystalMole?.addEventListener("keydown", event=>{
  if(event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  mineCrystal();
});
crystalOpenEggBtn?.addEventListener("click", openCrystalEgg);
crystalUpgradeList?.addEventListener("click", event=>{
  const button = event.target instanceof Element ? event.target.closest("[data-crystal-upgrade]") : null;
  if(button) buyCrystalUpgrade(button.dataset.crystalUpgrade);
});
crystalShopList?.addEventListener("click", event=>{
  const button = event.target instanceof Element ? event.target.closest("[data-crystal-shop]") : null;
  if(button) buyCrystalShopItem(button.dataset.crystalShop);
});
setInterval(()=>{
  if(crystalEventView?.classList.contains("open")) updateCrystalDynamicFields();
}, 120);

syncCrystalEventPhaseUi();
setInterval(syncCrystalEventPhaseUi, 1000);
syncWeatherSystem();
setInterval(syncWeatherSystem, 1000);

if(potionCraftDockBtn){
  potionCraftDockBtn.onclick = () => {
    const willOpen = !potionCraftPanel.classList.contains("open");
    potionCraftPanel.classList.toggle("open", willOpen);
    eggPanel.classList.remove("open");
    cratePanel.classList.remove("open");
    petPanel.classList.remove("open");
    if(limitedEventPanel) limitedEventPanel.classList.remove("open");
    if(petForgePanel) petForgePanel.classList.remove("open");
    if(petDiamondPanel) petDiamondPanel.classList.remove("open");
    renderSideUi(true);
  };
  potionCraftDockBtn.onclick = null;
}

document.addEventListener("click", event=>{
  const button = event.target instanceof Element ? event.target.closest("#potionCraftDockBtn") : null;
  if(!button || !potionCraftPanel) return;
  event.preventDefault();
  if(!hasPotionFeature()){
    spawnPopup("Ulepszanie mikstur od rebirth 2!", false, false, true);
    renderPotionCraftPanel();
    return;
  }
  const willOpen = !potionCraftPanel.classList.contains("open");
  potionCraftPanel.classList.toggle("open", willOpen);
  eggPanel?.classList.remove("open");
  cratePanel?.classList.remove("open");
  petPanel?.classList.remove("open");
  limitedEventPanel?.classList.remove("open");
  petForgePanel?.classList.remove("open");
  petDiamondPanel?.classList.remove("open");
  renderSideUi(true);
});

document.addEventListener("click", event=>{
  const button = event.target instanceof Element ? event.target.closest("#enchantCraftDockBtn") : null;
  if(!button || !enchantCraftPanel) return;
  event.preventDefault();
  if(!hasEnchantFeature()){
    spawnPopup("Enchanty od rebirth 6!", false, false, true);
    renderEnchantCraftPanel();
    return;
  }
  const willOpen = !enchantCraftPanel.classList.contains("open");
  enchantCraftPanel.classList.toggle("open", willOpen);
  eggPanel?.classList.remove("open");
  cratePanel?.classList.remove("open");
  petPanel?.classList.remove("open");
  limitedEventPanel?.classList.remove("open");
  potionCraftPanel?.classList.remove("open");
  petForgePanel?.classList.remove("open");
  petDiamondPanel?.classList.remove("open");
  renderSideUi(true);
});

eggDockBtn.onclick = () => {
  const willOpen = !eggPanel.classList.contains("open");
  eggPanel.classList.toggle("open", willOpen);
  cratePanel.classList.remove("open");
  petPanel.classList.remove("open");
  if(limitedEventPanel) limitedEventPanel.classList.remove("open");
  if(potionCraftPanel) potionCraftPanel.classList.remove("open");
  if(enchantCraftPanel) enchantCraftPanel.classList.remove("open");
  if(petForgePanel) petForgePanel.classList.remove("open");
  if(petDiamondPanel) petDiamondPanel.classList.remove("open");
  renderSideUi(true);
};

crateDockBtn.onclick = () => {
  const willOpen = !cratePanel.classList.contains("open");
  cratePanel.classList.toggle("open", willOpen);
  eggPanel.classList.remove("open");
  petPanel.classList.remove("open");
  if(limitedEventPanel) limitedEventPanel.classList.remove("open");
  if(potionCraftPanel) potionCraftPanel.classList.remove("open");
  if(enchantCraftPanel) enchantCraftPanel.classList.remove("open");
  if(petForgePanel) petForgePanel.classList.remove("open");
  if(petDiamondPanel) petDiamondPanel.classList.remove("open");
  renderSideUi(true);
};

petDockBtn.onclick = () => {
  const willOpen = !petPanel.classList.contains("open");
  petPanel.classList.toggle("open", willOpen);
  eggPanel.classList.remove("open");
  cratePanel.classList.remove("open");
  if(limitedEventPanel) limitedEventPanel.classList.remove("open");
  if(potionCraftPanel) potionCraftPanel.classList.remove("open");
  if(enchantCraftPanel) enchantCraftPanel.classList.remove("open");
  if(petForgePanel) petForgePanel.classList.remove("open");
  if(petDiamondPanel) petDiamondPanel.classList.remove("open");
  renderSideUi(true);
};

function renderSideUi(force=false){
  const now = Date.now();
  syncPetForgeDockLocks();
  const shouldRenderPanels = force || !!game.uiDirty;
  if(!shouldRenderPanels){
    if(now - sideUiRenderAt < 250) return;
    sideUiRenderAt = now;
    updateAutoOpenToggle();
    renderActivePets();
    applyActiveSkin();
    renderPotionBuffHud();
    renderDailyStreakHud();
    syncWeatherSystem();
    return;
  }
  sideUiRenderAt = now;
  game.uiDirty = false;
  if(eggPanel?.classList.contains("open")) renderEggPanel();
  if(cratePanel?.classList.contains("open")) renderCratePanel();
  if(limitedEventPanel?.classList.contains("open")) renderLimitedEventPanel();
  if(weatherPanel?.classList.contains("open")) renderWeatherPanel();
  if(petPanel?.classList.contains("open")) renderInventoryPanelStable(force);
  if(upgradeHubPanel?.classList.contains("open")) renderUpgradeHubPanel();
  if(potionCraftPanel?.classList.contains("open")) renderPotionCraftPanelStable(force);
  if(enchantCraftPanel?.classList.contains("open")) renderEnchantCraftPanel();
  if(petForgePanel?.classList.contains("open")) renderPetForgePanel();
  if(petDiamondPanel?.classList.contains("open")) renderPetDiamondPanel();
  if(diamondPanel?.classList.contains("open")) renderDiamondPanelStable(force);
  if(indexPanel?.classList.contains("open")) renderIndexPanel();
  eggDockBtn?.classList.toggle("active", eggPanel?.classList.contains("open"));
  crateDockBtn?.classList.toggle("active", cratePanel?.classList.contains("open"));
  petDockBtn?.classList.toggle("active", petPanel?.classList.contains("open"));
  upgradeHubDockBtn?.classList.toggle("active", upgradeHubPanel?.classList.contains("open"));
  potionCraftDockBtn?.classList.toggle("active", potionCraftPanel?.classList.contains("open"));
  enchantCraftDockBtn?.classList.toggle("active", enchantCraftPanel?.classList.contains("open"));
  weatherDockBtn?.classList.toggle("active", weatherPanel?.classList.contains("open"));
  limitedEventDockBtn?.classList.toggle("active", limitedEventPanel?.classList.contains("open"));
  petForgeDockBtn?.classList.toggle("active", petForgePanel?.classList.contains("open"));
  petDiamondDockBtn?.classList.toggle("active", petDiamondPanel?.classList.contains("open"));
  diamondDockBtn?.classList.toggle("active", diamondPanel?.classList.contains("open"));
  indexDockBtn?.classList.toggle("active", indexPanel?.classList.contains("open"));
  updateAutoOpenToggle();
  renderActivePets();
  applyActiveSkin();
  renderPotionBuffHud();
  renderDailyStreakHud();
  syncWeatherSystem();
}

function update(save=true, renderShopNow=true){
  if(typeof syncLeaderboardProgressStats === "function"){
    syncLeaderboardProgressStats();
  }
  ui.innerHTML=`<span>${formatPoint(game.score)}</span><span class="diamondCurrency">${formatDiamond(game.diamonds)}</span>`;
  stats.textContent=`Na klik: ${formatPoint(getNormalClickPower())}`;

  if(game.rebirths<REBIRTH_LIMIT){
    const rebirthCost = getRebirthCost();
    const rebirthProgress = Math.max(0, Math.min(100, ((game.score || 0) / rebirthCost) * 100));
    const canRebirth = (game.score || 0) >= rebirthCost;
    rebirthBtn.classList.toggle("ready", canRebirth);
    rebirthBtn.innerHTML = `
      <span class="rebirthBtnTop">
        <b>REBIRTH ${game.rebirths + 1}/${REBIRTH_LIMIT}</b>
        <small>${canRebirth ? "GOTOWE" : `${Math.floor(rebirthProgress)}%`}</small>
      </span>
      <span class="rebirthBtnProgress"><i style="width:${rebirthProgress}%"></i></span>
      <span class="rebirthBtnBottom">${canRebirth ? "Kliknij, aby przejść dalej" : `Potrzebujesz ${formatPoint(rebirthCost)}`}</span>
    `;
  }else{
    rebirthBtn.classList.add("ready");
    rebirthBtn.innerHTML = `
      <span class="rebirthBtnTop"><b>MAX REBIRTH</b><small>10/10</small></span>
      <span class="rebirthBtnProgress"><i style="width:100%"></i></span>
      <span class="rebirthBtnBottom">Odblokowany endgame VOID</span>
    `;
  }

  updateHoldPanel();
  updateAutoPanel();
  updateDiamondClickPanel();

  if(renderShopNow){
    renderShop();
  }else{
    refreshShopAffordabilityState();
  }

  if(save || renderShopNow){
    setPlanet();
  }

  renderSideUi(false);
  renderPotionBuffHud();
  renderDailyStreakHud();
  if(freeRewardsOverlay?.classList.contains("open")) renderFreeRewards();
  checkAppInstallBonusState();
  renderAppInstallModal();

  if(save && typeof shouldWriteGuestSave === "function" && shouldWriteGuestSave()){
    localStorage.setItem("guestSave", JSON.stringify(game));
  }
  if(typeof applyPlText === "function") applyPlText();
}

function refreshPanelDockState(){
  if(typeof renderSideUi === "function"){
    renderSideUi(true);
    return;
  }
  const pairs = [
    ["eggDockBtn", "eggPanel"],
    ["crateDockBtn", "cratePanel"],
    ["limitedEventDockBtn", "limitedEventPanel"],
    ["petDockBtn", "petPanel"],
    ["upgradeHubDockBtn", "upgradeHubPanel"],
    ["weatherDockBtn", "weatherPanel"],
    ["potionCraftDockBtn", "potionCraftPanel"],
    ["enchantCraftDockBtn", "enchantCraftPanel"],
    ["petForgeDockBtn", "petForgePanel"],
    ["petDiamondDockBtn", "petDiamondPanel"],
    ["diamondDockBtn", "diamondPanel"],
    ["indexDockBtn", "indexPanel"],
    ["leaderboardDockBtn", "leaderboardPanel"],
    ["globalBossDockBtn", "globalBossPanel"]
  ];
  pairs.forEach(([buttonId, panelId])=>{
    const button = document.getElementById(buttonId);
    const panel = document.getElementById(panelId);
    if(button && panel){
      button.classList.toggle("active", panel.classList.contains("open"));
    }
  });
}

function closeSlidePanel(panel){
  if(!panel) return;
  panel.classList.remove("open");
  refreshPanelDockState();
}

function closeAllSlidePanels(){
  document.querySelectorAll(".slidePanel.open").forEach(panel=>panel.classList.remove("open"));
  refreshPanelDockState();
}

function installMobilePanelUx(){
  document.querySelectorAll(".slidePanel").forEach(panel=>{
    const header = panel.querySelector(".slideHeader");
    if(!header || header.querySelector(".panelCloseBtn")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "panelCloseBtn";
    button.textContent = "x";
    button.setAttribute("aria-label", "Zamknij panel");
    button.addEventListener("click", event=>{
      event.preventDefault();
      event.stopPropagation();
      closeSlidePanel(panel);
    });
    header.appendChild(button);
  });

  const adminTitle = document.querySelector("#adminPanel h3");
  if(adminTitle && !adminTitle.querySelector(".adminPanelCloseBtn")){
    const adminClose = document.createElement("button");
    adminClose.type = "button";
    adminClose.className = "adminPanelCloseBtn";
    adminClose.textContent = "x";
    adminClose.setAttribute("aria-label", "Zamknij admin panel");
    adminClose.addEventListener("click", event=>{
      event.preventDefault();
      event.stopPropagation();
      const panel = document.getElementById("adminPanel");
      if(panel) panel.style.display = "none";
    });
    adminTitle.appendChild(adminClose);
  }

  document.addEventListener("click", event=>{
    const dockButton = event.target instanceof Element ? event.target.closest(".dockBtn") : null;
    if(!dockButton || !window.matchMedia("(max-width: 700px)").matches) return;
    window.setTimeout(()=>{
      const openPanels = Array.from(document.querySelectorAll(".slidePanel.open"));
      if(openPanels.length <= 1) return;
      const keep = openPanels[openPanels.length - 1];
      openPanels.forEach(panel=>{
        if(panel !== keep) panel.classList.remove("open");
      });
      refreshPanelDockState();
    }, 0);
  });

  const eggChoiceOverlayNode = document.getElementById("eggChoiceOverlay");
  eggChoiceOverlayNode?.addEventListener("click", event=>{
    if(event.target === eggChoiceOverlayNode){
      eggChoiceOverlayNode.classList.remove("open");
    }
  });

  document.addEventListener("keydown", event=>{
    if(event.key !== "Escape") return;
    if(document.getElementById("adminBoostModal")?.classList.contains("open")){
      document.getElementById("adminBoostModalCancel")?.click();
      return;
    }
    if(document.getElementById("upgradeInfoOverlay")?.classList.contains("open")){
      document.getElementById("upgradeInfoClose")?.click();
      return;
    }
    if(document.getElementById("eggChoiceOverlay")?.classList.contains("open")){
      document.getElementById("eggChoiceOverlay")?.classList.remove("open");
      return;
    }
    if(document.getElementById("accountMenuOverlay")?.classList.contains("open")){
      document.getElementById("accountMenuOverlay")?.classList.remove("open");
      return;
    }
    const adminPanelNode = document.getElementById("adminPanel");
    if(adminPanelNode?.style.display === "block"){
      adminPanelNode.style.display = "none";
      return;
    }
    closeAllSlidePanels();
  });
}

installMobilePanelUx();

document.addEventListener("click", event=>{
  const card = event.target instanceof Element ? event.target.closest("[data-ultra-core]") : null;
  if(!card) return;
  if(event.target.closest(".infoDot")) return;
  event.preventDefault();
  event.stopPropagation();
  ultraCoreReset();
}, true);

update();
