const firebaseConfig = {
  apiKey: "AIzaSyCR6WiROwoyUZhQbHNjCmEvrL5ti7ddhlM",
  authDomain: "ranking-caf8a.firebaseapp.com",
  databaseURL: "https://ranking-caf8a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ranking-caf8a",
  storageBucket: "ranking-caf8a.firebasestorage.app",
  messagingSenderId: "29861154461",
  appId: "1:29861154461:web:9fc4441915388762684e74",
  measurementId: "G-0XJVEBPQYD"
};

const ACCOUNT_SESSION_KEY = "kretAccountSession";
const GUEST_SAVE_KEY = "guestSave";
const LEGACY_SAVE_KEY = "kretSave";
const GUEST_MIGRATED_AT_KEY = "guestSaveMigratedAt";
const GUEST_MIGRATED_META_KEY = "guestSaveMigratedMeta";
const CLOUD_SAVE_INTERVAL_MS = 3 * 60 * 1000;
const CLOUD_SAVE_DEBOUNCE_MS = 1400;
const CLOUD_SAVE_FORCE_DEBOUNCE_MS = 350;
const CLOUD_SAVE_LAST_KEY = "kretCloudSaveLastAt";
const LOCAL_SAVE_DEBOUNCE_MS = 650;
const LAST_ACCOUNT_SAVE_KEY = "kretLastAccountSave";
let authMode = "login";
let currentAccount = null;
let firebaseReady = false;
let firebaseApp = null;
let firebaseDb = null;
let firebaseAuth = null;
let firebaseModules = null;
let firebaseInitPromise = null;
let firebaseAuthInitialUserPromise = null;
let cloudSaveTimer = null;
let cloudSaveIntervalTimer = null;
let cloudSaveStatusTimer = null;
let cloudSaveBusy = false;
let cloudSaveQueued = false;
let cloudSaveQueuedForce = false;
let cloudSaveDirty = false;
let cloudSaveLastAt = Number(localStorage.getItem(CLOUD_SAVE_LAST_KEY) || 0);
let loadingRemoteSave = false;
let localSaveTimer = null;
let marketplaceOffers = {};
let marketplaceOffersUnsub = null;
let marketplacePayoutsUnsub = null;
let marketplaceTab = "offers";
let pendingMarketBuyOffer = null;
let pendingMarketSaleAck = null;
let marketplaceCloseTimer = null;

const authOverlay = document.getElementById("authOverlay");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authMenu = document.getElementById("authMenu");
const authForm = document.getElementById("authForm");
const authNick = document.getElementById("authNick");
const authPassword = document.getElementById("authPassword");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authBackBtn = document.getElementById("authBackBtn");
const authMessage = document.getElementById("authMessage");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const guestPlayBtn = document.getElementById("guestPlayBtn");
const accountStatusText = document.getElementById("accountStatusText");
const cloudSaveStatus = document.getElementById("cloudSaveStatus");
const logoutBtn = document.getElementById("logoutBtn");
const accountMenuOverlay = document.getElementById("accountMenuOverlay");
const accountMenuNick = document.getElementById("accountMenuNick");
const accountMenuClose = document.getElementById("accountMenuClose");
const accountLogoutBtn = document.getElementById("accountLogoutBtn");
const accountChangePasswordBtn = document.getElementById("accountChangePasswordBtn");
const changePasswordForm = document.getElementById("changePasswordForm");
const oldPasswordInput = document.getElementById("oldPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmChangePasswordBtn = document.getElementById("confirmChangePasswordBtn");
const accountMenuMessage = document.getElementById("accountMenuMessage");
const leaderboardDockBtn = document.getElementById("leaderboardDockBtn");
const leaderboardPanel = document.getElementById("leaderboardPanel");
const leaderboardContent = document.getElementById("leaderboardContent");
const globalBossDockBtn = document.getElementById("globalBossDockBtn");
const globalBossPanel = document.getElementById("globalBossPanel");
const globalBossContent = document.getElementById("globalBossContent");
const globalBossEventBannerBtn = document.getElementById("globalBossEventBannerBtn");
const globalBossEventView = document.getElementById("globalBossEventView");
const globalBossEventContent = document.getElementById("globalBossEventContent");
const globalBossBackBtn = document.getElementById("globalBossBackBtn");
const marketplaceDockBtn = document.getElementById("marketplaceDockBtn");
const marketplaceView = document.getElementById("marketplaceView");
const marketBackBtn = document.getElementById("marketBackBtn");
const marketRefreshBtn = document.getElementById("marketRefreshBtn");
const marketOffersTab = document.getElementById("marketOffersTab");
const marketMineTab = document.getElementById("marketMineTab");
const marketStatus = document.getElementById("marketStatus");
const marketOffersView = document.getElementById("marketOffersView");
const marketMineView = document.getElementById("marketMineView");
const marketBuyModal = document.getElementById("marketBuyModal");
const marketBuyClose = document.getElementById("marketBuyClose");
const marketBuyCancel = document.getElementById("marketBuyCancel");
const marketBuyConfirm = document.getElementById("marketBuyConfirm");
const marketBuyTitle = document.getElementById("marketBuyTitle");
const marketBuyInfo = document.getElementById("marketBuyInfo");
const marketBuyRange = document.getElementById("marketBuyRange");
const marketBuyQtyText = document.getElementById("marketBuyQtyText");
const marketBuyTotal = document.getElementById("marketBuyTotal");
const marketDiamondText = document.getElementById("marketDiamondText");
const marketSaleModal = document.getElementById("marketSaleModal");
const marketSaleText = document.getElementById("marketSaleText");
const marketSaleOk = document.getElementById("marketSaleOk");
const activeBoostPanel = document.getElementById("activeBoostPanel");
const bossDropFeed = document.getElementById("bossDropFeed");
const globalEventBanner = document.getElementById("globalEventBanner");
const adminBoostModal = document.getElementById("adminBoostModal");
const adminBoostModalTitle = document.getElementById("adminBoostModalTitle");
const adminBoostValueLabel = document.getElementById("adminBoostValueLabel");
const adminBoostModalValue = document.getElementById("adminBoostModalValue");
const adminEventTypeLabel = document.getElementById("adminEventTypeLabel");
const adminEventType = document.getElementById("adminEventType");
const adminBoostTypeLabel = document.getElementById("adminBoostTypeLabel");
const adminBoostType = document.getElementById("adminBoostType");
const adminGiveFields = document.getElementById("adminGiveFields");
const adminGiveTarget = document.getElementById("adminGiveTarget");
const adminGiveNickLabel = document.getElementById("adminGiveNickLabel");
const adminGiveNick = document.getElementById("adminGiveNick");
const adminGiveType = document.getElementById("adminGiveType");
const adminGiveBoostTypeLabel = document.getElementById("adminGiveBoostTypeLabel");
const adminGiveBoostType = document.getElementById("adminGiveBoostType");
const adminGiveValue = document.getElementById("adminGiveValue");
const adminGivePetLabel = document.getElementById("adminGivePetLabel");
const adminGivePetSelect = document.getElementById("adminGivePetSelect");
const adminGivePetVariantLabel = document.getElementById("adminGivePetVariantLabel");
const adminGivePetVariant = document.getElementById("adminGivePetVariant");
const adminGivePetPreview = document.getElementById("adminGivePetPreview");
const adminGiveSkinLabel = document.getElementById("adminGiveSkinLabel");
const adminGiveSkinSelect = document.getElementById("adminGiveSkinSelect");
const adminGiveSkinPreview = document.getElementById("adminGiveSkinPreview");
const adminGivePotionLabel = document.getElementById("adminGivePotionLabel");
const adminGivePotionSelect = document.getElementById("adminGivePotionSelect");
const adminGiveBagLabel = document.getElementById("adminGiveBagLabel");
const adminGiveBagSelect = document.getElementById("adminGiveBagSelect");
const adminGiveEnchantLabel = document.getElementById("adminGiveEnchantLabel");
const adminGiveEnchantSelect = document.getElementById("adminGiveEnchantSelect");
const adminGiveEggLabel = document.getElementById("adminGiveEggLabel");
const adminGiveEggSelect = document.getElementById("adminGiveEggSelect");
const adminBoostDurationLabel = document.getElementById("adminBoostDurationLabel");
const adminBoostModalDuration = document.getElementById("adminBoostModalDuration");
const adminBoostModalCustomDuration = document.getElementById("adminBoostModalCustomDuration");
const adminBoostMessageLabel = document.getElementById("adminBoostMessageLabel");
const adminBoostModalMessage = document.getElementById("adminBoostModalMessage");
const adminBoostModalCancel = document.getElementById("adminBoostModalCancel");
const adminBoostModalConfirm = document.getElementById("adminBoostModalConfirm");
const adminAbuseMessage = document.getElementById("adminAbuseMessage");
const adminCodeName = document.getElementById("adminCodeName");
const adminCodeRewardType = document.getElementById("adminCodeRewardType");
const adminCodePotionType = document.getElementById("adminCodePotionType");
const adminCodePotionTier = document.getElementById("adminCodePotionTier");
const adminCodeBagType = document.getElementById("adminCodeBagType");
const adminCodeAmount = document.getElementById("adminCodeAmount");
const adminCodeMaxUses = document.getElementById("adminCodeMaxUses");
const adminCodeExpiresAt = document.getElementById("adminCodeExpiresAt");
const adminCodeSaveBtn = document.getElementById("adminCodeSaveBtn");
const adminCodesStatus = document.getElementById("adminCodesStatus");
const adminCodesList = document.getElementById("adminCodesList");
const adminNextUpdateTitle = document.getElementById("adminNextUpdateTitle");
const adminNextUpdateAt = document.getElementById("adminNextUpdateAt");
const adminNextUpdateSave = document.getElementById("adminNextUpdateSave");
const adminNextUpdateClear = document.getElementById("adminNextUpdateClear");
const adminNextUpdateStatus = document.getElementById("adminNextUpdateStatus");
const nextUpdateCountdown = document.getElementById("nextUpdateCountdown");
const adminBoostModalStatus = document.getElementById("adminBoostModalStatus");
const adminLeaderboardVisibilityBox = document.getElementById("adminLeaderboardVisibilityBox");
const adminLeaderboardVisibilityStatus = document.getElementById("adminLeaderboardVisibilityStatus");
const adminLeaderboardVisibilityBtn = document.getElementById("adminLeaderboardVisibilityBtn");
const adminSupportInbox = document.getElementById("adminSupportInbox");
const adminSupportStatus = document.getElementById("adminSupportStatus");
const adminSupportList = document.getElementById("adminSupportList");
const supportTitleInput = document.getElementById("supportTitleInput");
const supportMessageInput = document.getElementById("supportMessageInput");
const supportSubmitBtn = document.getElementById("supportSubmitBtn");
const supportFormStatus = document.getElementById("supportFormStatus");
const communityBossDepositModal = document.getElementById("communityBossDepositModal");
const communityBossDepositClose = document.getElementById("communityBossDepositClose");
const communityBossDepositCancel = document.getElementById("communityBossDepositCancel");
const communityBossDepositConfirm = document.getElementById("communityBossDepositConfirm");
const communityBossDepositModalRange = document.getElementById("communityBossDepositModalRange");
const communityBossDepositModalValue = document.getElementById("communityBossDepositModalValue");
const communityBossDepositProgressText = document.getElementById("communityBossDepositProgressText");
const communityBossDepositDiamondsText = document.getElementById("communityBossDepositDiamondsText");
const communityBossDepositBarFill = document.getElementById("communityBossDepositBarFill");

let supportTicketsData = {};
let supportInboxUnsub = null;
let adminLeaderboardVisible = true;
let nextUpdateData = null;
let nextUpdateUnsub = null;
let nextUpdateTimer = null;
let globalWeatherUnsub = null;
const NEXT_UPDATE_LOCAL_KEY = "kretNextUpdateLocal";

const originalUpdateForAccounts = update;
update = function(save=true, renderShopNow=true){
  originalUpdateForAccounts(save, renderShopNow);
  renderAccountStatus();
  if(save && !loadingRemoteSave && !window.__kretDisableSave){
    requestLocalSave();
  }
  if(save && currentAccount && !loadingRemoteSave && !window.__kretDisableSave){
    requestCloudSave({reason:"auto"});
  }
};

async function initFirebase(){
  if(firebaseReady && firebaseDb && firebaseModules) return true;
  if(!firebaseConfig.databaseURL){
    setAuthMessage("Brakuje databaseURL Realtime Database.", true);
    return false;
  }
  if(!firebaseInitPromise){
    firebaseInitPromise = (async () => {
      const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
      const databaseModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js");
      const authModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
      const { initializeApp, getApps } = appModule;
      const { getDatabase, ref, get, set, update, onValue, runTransaction } = databaseModule;
      const {
        getAuth,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
        EmailAuthProvider,
        reauthenticateWithCredential,
        updatePassword,
        onAuthStateChanged
      } = authModule;
      firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      firebaseDb = getDatabase(firebaseApp);
      firebaseAuth = getAuth(firebaseApp);
      firebaseModules = {
        ref,
        get,
        set,
        update,
        onValue,
        runTransaction,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
        EmailAuthProvider,
        reauthenticateWithCredential,
        updatePassword,
        onAuthStateChanged
      };
      firebaseReady = true;
      return true;
    })().catch((err) => {
      firebaseInitPromise = null;
      firebaseReady = false;
      console.warn("Firebase Realtime Database init error:", err);
      setAuthMessage("Nie udalo sie polaczyc z Realtime Database. Mozesz grac jako gosc.", true);
      return false;
    });
  }
  return firebaseInitPromise;
}

async function firebaseGet(path){
  if(!await initFirebase()) throw new Error("Firebase Realtime Database unavailable");
  const snapshot = await firebaseModules.get(firebaseModules.ref(firebaseDb, path));
  return snapshot.exists() ? snapshot.val() : null;
}

async function firebaseSet(path, value){
  if(!await initFirebase()) throw new Error("Firebase Realtime Database unavailable");
  await firebaseModules.set(firebaseModules.ref(firebaseDb, path), value);
  return value;
}

async function firebaseUpdate(path, value){
  if(!await initFirebase()) throw new Error("Firebase Realtime Database unavailable");
  await firebaseModules.update(firebaseModules.ref(firebaseDb, path), value);
  return value;
}

window.fetchAdminRewardCodes = async function(){
  if(!await initFirebase()) return {};
  return await firebaseGet("rewardCodes") || {};
};

window.reserveRewardCodeUse = async function(code, maxUses=0){
  if(!await initFirebase()) return true;
  const safe = String(code || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if(!safe || !Number(maxUses)) return true;
  let accepted = false;
  await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "rewardCodeUses/" + safe), current => {
    const count = Number(current) || 0;
    if(count >= Number(maxUses)) return;
    accepted = true;
    return count + 1;
  });
  return accepted;
};

window.kretExistCounts = window.kretExistCounts || {cache:{}, lastFetch:0};
window.incrementExistCount = async function(type, id, amount=1){
  const safeType = String(type || "items").replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeId = String(id || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
  const add = Math.trunc(Number(amount) || 0);
  if(!add) return;
  if(!safeId) return;
  try{
    if(!await initFirebase()) return;
    await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, `existCounts/${safeType}/${safeId}`), value => Math.max(0, (Number(value) || 0) + add));
    window.kretExistCounts.cache[`${safeType}:${safeId}`] = Math.max(0, (Number(window.kretExistCounts.cache[`${safeType}:${safeId}`]) || 0) + add);
  }catch(err){
    console.warn("Exist count update failed", err);
  }
};

window.refreshExistCounts = async function(force=false){
  const store = window.kretExistCounts || (window.kretExistCounts = {cache:{}, lastFetch:0});
  if(!force && Date.now() - (store.lastFetch || 0) < 5 * 60 * 1000) return store.cache;
  try{
    if(!await initFirebase()) return store.cache;
    const data = await firebaseGet("existCounts") || {};
    const flat = {};
    Object.entries(data).forEach(([type, values])=>{
      Object.entries(values || {}).forEach(([id, count])=>{
        flat[`${type}:${id}`] = Number(count) || 0;
      });
    });
    store.cache = flat;
    store.lastFetch = Date.now();
  }catch(err){
    console.warn("Exist count fetch failed", err);
  }
  return store.cache;
};

window.getExistCount = function(type, id){
  const safeType = String(type || "items").replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeId = String(id || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
  return Number(window.kretExistCounts?.cache?.[`${safeType}:${safeId}`]) || 0;
};

async function waitForFirebaseAuthUser(timeoutMs=3500){
  if(!await initFirebase()) return null;
  if(firebaseAuth.currentUser) return firebaseAuth.currentUser;
  if(!firebaseAuthInitialUserPromise){
    firebaseAuthInitialUserPromise = new Promise((resolve) => {
      let settled = false;
      let unsub = () => {};
      const finish = (user) => {
        if(settled) return;
        settled = true;
        try{ unsub?.(); }catch(err){}
        resolve(user || null);
      };
      unsub = firebaseModules.onAuthStateChanged(firebaseAuth, finish, () => finish(null));
      setTimeout(() => finish(firebaseAuth.currentUser || null), timeoutMs);
    });
  }
  return firebaseAuthInitialUserPromise;
}

function withTimeout(promise, timeoutMs=7000, label="timeout"){
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(label)), timeoutMs))
  ]);
}

async function runAccountPostLoadTasks(){
  const tasks = [
    ["syncBossUpgrade", () => syncBossUpgrade()],
    ["claimAdminInboxRewards", () => claimAdminInboxRewards()],
    ["startGlobalAdminInboxLive", () => startGlobalAdminInboxLive()],
    ["startUserAdminNoticesLive", () => startUserAdminNoticesLive()],
    ["claimGlobalAdminRewards", async () => claimGlobalAdminRewards(await firebaseGet("globalAdminInbox") || {})],
    ["claimPendingOnlineRewards", () => claimPendingOnlineRewards()],
    ["startMarketplaceStreams", () => startMarketplaceStreams()]
  ];
  for(const [name, task] of tasks){
    try{
      await withTimeout(Promise.resolve().then(task), 4500, name + " timeout");
    }catch(err){
      console.warn("Account post-load task skipped:", name, err);
    }
  }
}

function makeFreshSave(){
  return {
    score:0,
    diamonds:0,
    diamondDust:0,
    clicks:0,
    openedEggs:0,
    leaderboardStats:{
      totalCoinsEarned:0,
      bestCoins:0,
      bestDiamonds:0
    },
    click:1,
    autoValue:0,
    autoSpeed:0,
    multi:1,
    critChance:0.02,
    critMulti:2,
    frenzyChance:0,
    frenzyActive:false,
    frenzyTimer:0,
    rebirths:0,
    rebirthMult:1,
    holdCooldownRemaining:0,
    holdDurationRemaining:0,
    holdActive:false,
    diamondRushActive:false,
    diamondRushRemaining:0,
    diamondRushCooldownRemaining:0,
    pets:[],
    skins:[],
    potions:[],
    activePotions:[],
    bags:[],
    enchants:[],
    activeEnchantIds:[],
    inventoryEggs:[],
    fruits:[],
    dailyStreak:{},
    appBonusUnlocked:false,
    appBonusUnlockedAt:0,
    freeRewards:{},
    activePetIds:[],
    activeSkinId:null,
    petSeq:1,
    skinSeq:1,
    potionSeq:1,
    bagSeq:1,
    enchantSeq:1,
    inventoryEggSeq:1,
    fruitSeq:1,
    marketSlots:1,
    tutorialAsked:false,
    tutorialCompleted:false,
    featureUnlocks:{},
    inventoryTab:"pets",
    metaUpgrades:{},
    autoEggMode:false,
    autoCrateMode:false,
    bossDamageUpgrade:0,
    bossRewardBoosts:[],
    bossClaimedRewards:{},
    crystalEvent:{},
    weeklyLeaderboardRewards:[],
    adminInbox:{},
    adminGlobalClaimed:{},
    upgrades:{},
    endlessUpgrades:{},
    ultraCores:0,
    ultraCoreBest:0,
    uiDirty:true
  };
}

function normalizeSave(save){
  const fresh = makeFreshSave();
  const normalized = Object.assign(fresh, save || {});
  normalized.pets = Array.isArray(normalized.pets) ? normalized.pets : [];
  normalized.skins = Array.isArray(normalized.skins) ? normalized.skins : [];
  normalized.potions = Array.isArray(normalized.potions) ? normalized.potions : [];
  normalized.activePotions = Array.isArray(normalized.activePotions) ? normalized.activePotions : [];
  normalized.bags = Array.isArray(normalized.bags) ? normalized.bags : [];
  normalized.enchants = Array.isArray(normalized.enchants) ? normalized.enchants : [];
  normalized.activeEnchantIds = Array.isArray(normalized.activeEnchantIds) ? normalized.activeEnchantIds : [];
  normalized.inventoryEggs = Array.isArray(normalized.inventoryEggs) ? normalized.inventoryEggs : [];
  normalized.fruits = Array.isArray(normalized.fruits) ? normalized.fruits : [];
  normalized.dailyStreak = normalized.dailyStreak && typeof normalized.dailyStreak === "object" ? normalized.dailyStreak : {};
  normalized.appBonusUnlocked = !!normalized.appBonusUnlocked;
  normalized.appBonusUnlockedAt = Number(normalized.appBonusUnlockedAt) || 0;
  normalized.freeRewards = normalized.freeRewards && typeof normalized.freeRewards === "object" ? normalized.freeRewards : {};
  normalized.potionSeq = Number.isFinite(+normalized.potionSeq) ? +normalized.potionSeq : 1;
  normalized.bagSeq = Number.isFinite(+normalized.bagSeq) ? +normalized.bagSeq : 1;
  normalized.enchantSeq = Number.isFinite(+normalized.enchantSeq) ? +normalized.enchantSeq : 1;
  normalized.inventoryEggSeq = Number.isFinite(+normalized.inventoryEggSeq) ? +normalized.inventoryEggSeq : 1;
  normalized.fruitSeq = Number.isFinite(+normalized.fruitSeq) ? +normalized.fruitSeq : 1;
  normalized.marketSlots = Math.max(1, Math.min(5, Math.floor(Number(normalized.marketSlots) || 1)));
  normalized.tutorialAsked = !!normalized.tutorialAsked;
  normalized.tutorialCompleted = !!normalized.tutorialCompleted;
  normalized.featureUnlocks = normalized.featureUnlocks && typeof normalized.featureUnlocks === "object" ? normalized.featureUnlocks : {};
  normalized.activePetIds = Array.isArray(normalized.activePetIds) ? normalized.activePetIds : [];
  normalized.metaUpgrades = normalized.metaUpgrades && typeof normalized.metaUpgrades === "object" ? normalized.metaUpgrades : {};
  normalized.upgrades = normalized.upgrades && typeof normalized.upgrades === "object" ? normalized.upgrades : {};
  normalized.endlessUpgrades = normalized.endlessUpgrades && typeof normalized.endlessUpgrades === "object" ? normalized.endlessUpgrades : {};
  normalized.bossDamageUpgrade = Math.max(0, Math.min(5, Number(normalized.bossDamageUpgrade) || 0));
  normalized.bossRewardBoosts = Array.isArray(normalized.bossRewardBoosts) ? normalized.bossRewardBoosts : [];
  normalized.bossClaimedRewards = normalized.bossClaimedRewards && typeof normalized.bossClaimedRewards === "object" ? normalized.bossClaimedRewards : {};
  normalized.crystalEvent = normalized.crystalEvent && typeof normalized.crystalEvent === "object" ? normalized.crystalEvent : {};
  normalized.weeklyLeaderboardRewards = Array.isArray(normalized.weeklyLeaderboardRewards) ? normalized.weeklyLeaderboardRewards : [];
  normalized.adminInbox = normalized.adminInbox && typeof normalized.adminInbox === "object" ? normalized.adminInbox : {};
  normalized.adminGlobalClaimed = normalized.adminGlobalClaimed && typeof normalized.adminGlobalClaimed === "object" ? normalized.adminGlobalClaimed : {};
  normalized.clicks = Number.isFinite(+normalized.clicks) ? +normalized.clicks : 0;
  normalized.openedEggs = Number.isFinite(+normalized.openedEggs) ? +normalized.openedEggs : 0;
  normalized.leaderboardStats = normalized.leaderboardStats && typeof normalized.leaderboardStats === "object" ? normalized.leaderboardStats : {};
  normalized.leaderboardStats.totalCoinsEarned = Math.max(Number(normalized.leaderboardStats.totalCoinsEarned) || 0, Number(normalized.score) || 0);
  normalized.leaderboardStats.bestCoins = Math.max(Number(normalized.leaderboardStats.bestCoins) || 0, Number(normalized.score) || 0);
  normalized.leaderboardStats.bestDiamonds = Math.max(Number(normalized.leaderboardStats.bestDiamonds) || 0, Number(normalized.diamonds) || 0);
  normalized.uiDirty = true;
  return normalized;
}

function makeSaveSnapshot(){
  const snapshot = JSON.parse(JSON.stringify(game));
  delete snapshot.__lastScoreForLeaderboard;
  delete snapshot.__leaderboardStatsReady;
  const now = Date.now();
  snapshot._updatedAt = now;
  snapshot.updatedAt = now;
  snapshot.lastSavedAt = now;
  if(currentAccount){
    snapshot._accountNick = currentAccount.nick;
    snapshot.username = currentAccount.username || currentAccount.nick || currentAccount.safeNick;
    snapshot.safeNick = currentAccount.safeNick || "";
    snapshot.authUid = currentAccount.uid;
  }
  return snapshot;
}

function getSaveTimestamp(save){
  return Math.max(
    Number(save?._updatedAt) || 0,
    Number(save?.updatedAt) || 0,
    Number(save?.lastSavedAt) || 0
  );
}

function isMeaningfulSave(save){
  if(!save || typeof save !== "object") return false;
  return [
    "score","diamonds","clicks","openedEggs","rebirths","ultraCores","click","autoValue","multi"
  ].some(key => Number(save[key]) > 0)
    || ["pets","skins","potions","bags","enchants","inventoryEggs"].some(key => Array.isArray(save[key]) && save[key].length > 0)
    || (save.upgrades && typeof save.upgrades === "object" && Object.keys(save.upgrades).length > 0)
    || (save.metaUpgrades && typeof save.metaUpgrades === "object" && Object.keys(save.metaUpgrades).length > 0)
    || (save.endlessUpgrades && typeof save.endlessUpgrades === "object" && Object.keys(save.endlessUpgrades).length > 0);
}

function accountLocalSaveKey(uid=currentAccount?.uid){
  return uid ? `accountSave_${uid}` : "";
}

function getAccountLocalSave(uid=currentAccount?.uid){
  const key = accountLocalSaveKey(uid);
  if(!key) return null;
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }catch(err){
    return null;
  }
}

function writeLocalSaveNow(){
  if(window.__kretDisableSave) return;
  const snapshot = makeSaveSnapshot();
  if(currentAccount?.uid){
    if(isMeaningfulSave(snapshot)){
      localStorage.setItem(accountLocalSaveKey(currentAccount.uid), JSON.stringify(snapshot));
      localStorage.setItem(LAST_ACCOUNT_SAVE_KEY, JSON.stringify(snapshot));
    }
    return;
  }
  localStorage.setItem(GUEST_SAVE_KEY, JSON.stringify(snapshot));
}

function requestLocalSave(){
  if(loadingRemoteSave || window.__kretDisableSave) return;
  clearTimeout(localSaveTimer);
  localSaveTimer = setTimeout(writeLocalSaveNow, LOCAL_SAVE_DEBOUNCE_MS);
}

function resetGameStateBeforeLoadSave(){
  const fresh = makeFreshSave();
  try{
    if(typeof holdLoop !== "undefined" && holdLoop){
      clearInterval(holdLoop);
      holdLoop = null;
    }
    if(typeof holdPress !== "undefined" && holdPress){
      clearTimeout(holdPress);
      holdPress = null;
    }
    if(typeof autoAccumulator !== "undefined") autoAccumulator = 0;
    if(typeof holdAccumulator !== "undefined") holdAccumulator = 0;
    if(typeof activePointerId !== "undefined") activePointerId = null;
    if(typeof hatchBusy !== "undefined") hatchBusy = false;
    if(typeof pendingEggChoice !== "undefined") pendingEggChoice = null;
    if(typeof lastAutoEggId !== "undefined") lastAutoEggId = null;
    if(typeof lastAutoCrateId !== "undefined") lastAutoCrateId = null;
  }catch(err){}
  Object.keys(game).forEach((key) => delete game[key]);
  Object.assign(game, fresh);
  window.__kretDisableSave = false;
}

function getGuestSave(){
  try{
    const guest = localStorage.getItem(GUEST_SAVE_KEY);
    if(guest){
      const parsed = JSON.parse(guest);
      if(parsed?.authUid || parsed?._accountNick || parsed?.safeNick){
        localStorage.setItem("guestSaveRejectedAccountCopyAt", String(Date.now()));
        localStorage.removeItem(GUEST_SAVE_KEY);
        return null;
      }
      return parsed;
    }
    if(localStorage.getItem(GUEST_MIGRATED_AT_KEY)){
      localStorage.removeItem(LEGACY_SAVE_KEY);
      return null;
    }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_SAVE_KEY));
    return legacy && !legacy._accountNick ? legacy : null;
  }catch(err){
    return null;
  }
}

function clearMigratedGuestSave(){
  try{
    const migrated = getGuestSave();
    localStorage.removeItem(GUEST_SAVE_KEY);
    localStorage.removeItem(LEGACY_SAVE_KEY);
    sessionStorage.removeItem(GUEST_SAVE_KEY);
    sessionStorage.removeItem(LEGACY_SAVE_KEY);
    localStorage.setItem(GUEST_MIGRATED_AT_KEY, String(Date.now()));
    if(migrated){
      localStorage.setItem(GUEST_MIGRATED_META_KEY, JSON.stringify({
        migratedAt:Date.now(),
        score:Math.floor(Number(migrated.score) || 0),
        rebirths:Math.floor(Number(migrated.rebirths) || 0)
      }));
    }
  }catch(err){}
}

function saveGuestSnapshot(){
  if(currentAccount) return;
  localStorage.setItem(GUEST_SAVE_KEY, JSON.stringify(makeSaveSnapshot()));
}

function applySave(save, options={}){
  loadingRemoteSave = true;
  try{
    const mode = options.mode || (currentAccount ? "account" : "guest");
    window.__kretSaveMode = mode;
    resetGameStateBeforeLoadSave();
    const normalized = normalizeSave(save);
    Object.assign(game, normalized);
    if(typeof resetLeaderboardProgressTracker === "function"){
      resetLeaderboardProgressTracker();
    }
    if(mode === "guest"){
      localStorage.setItem(GUEST_SAVE_KEY, JSON.stringify(game));
    }else if(currentAccount?.uid){
      writeLocalSaveNow();
    }
    update(true, true);
    if(typeof applyPlText === "function"){
      applyPlText();
    }
    if(mode === "account"){
      markCloudSaveSaved();
    }else{
      renderCloudSaveStatus("offline", "Lokalnie");
    }
  }finally{
    loadingRemoteSave = false;
  }
}

function loadGuestSave(){
  stopMarketplaceUserStream();
  currentAccount = null;
  window.__kretSaveMode = "guest";
  cloudSaveDirty = false;
  cloudSaveQueued = false;
  cloudSaveQueuedForce = false;
  clearTimeout(cloudSaveTimer);
  const guestSave = getGuestSave() || makeFreshSave();
  applySave(guestSave, {mode:"guest"});
  renderAccountStatus();
  renderLeaderboardPanel();
  renderGlobalBossPanel();
  setTimeout(()=>window.maybeAskTutorial?.(), 180);
}

function makeAdminGiftPet(name, variantChoice){
  const catalog = getAdminPetCatalog().find(item => item.key === name || item.pet.id === name);
  if(catalog){
    const variantInfo = getAdminPetVariantOptions(variantChoice || "normal");
    const variant = variantInfo.variant || "normal";
    const shiny = !!variantInfo.shiny;
    const mult = typeof getPetVariantMultiplier === "function" ? getPetVariantMultiplier({variant, shiny}) : 1;
    const baseDiamond = typeof catalog.pet.diamond === "number"
      ? catalog.pet.diamond
      : (typeof getPetDiamondBonusValue === "function" ? getPetDiamondBonusValue(catalog.pet) : 0.02);
    const baseName = catalog.pet.baseName || catalog.pet.name;
    const displayName = typeof getPetDisplayNameWithVariant === "function"
      ? getPetDisplayNameWithVariant(baseName, variant, shiny)
      : baseName;
    const pet = {
      uid:`admin_pet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      templateId:catalog.pet.id,
      eggId:catalog.egg.id,
      name:displayName,
      displayName,
      baseName,
      templateName:baseName,
      icon:catalog.pet.icon,
      rarity:catalog.pet.rarity,
      baseClick:catalog.pet.click,
      baseMulti:catalog.pet.multi,
      baseDiamond,
      click:+((Number(catalog.pet.click) || 0) * mult).toFixed(3),
      multi:+((Number(catalog.pet.multi) || 0) * mult).toFixed(4),
      diamond:+(baseDiamond * mult).toFixed(4),
      color:catalog.pet.color,
      sourceEgg:catalog.egg.name,
      secret:!!catalog.pet.secret,
      variant,
      shiny
    };
    pet.variantKey = typeof getPetVariantKey === "function"
      ? getPetVariantKey(pet)
      : `${pet.templateId}::${variant}::${shiny ? "shiny" : "plain"}`;
    pet.powerRank = typeof getPetPowerRank === "function" ? getPetPowerRank(pet) : 999999;
    return pet;
  }
  const safeName = String(name || "Admin Pet").trim().slice(0, 42) || "Admin Pet";
  const uid = `admin_pet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    uid,
    templateId:`admin_pet_${safeName.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "item"}`,
    eggId:"admin",
    name:safeName,
    displayName:safeName,
    baseName:safeName,
    templateName:safeName,
    icon:"*",
    rarity:"Admin",
    baseClick:250,
    baseMulti:1.25,
    baseDiamond:0.03,
    click:250,
    multi:1.25,
    diamond:0.03,
    color:"#ffdf6b",
    sourceEgg:"Admin",
    secret:true,
    variant:getAdminPetVariantOptions(variantChoice || "normal").variant,
    shiny:getAdminPetVariantOptions(variantChoice || "normal").shiny,
    variantKey:`admin_pet_${uid}`,
    powerRank:999999
  };
}

function makeAdminGiftSkin(name){
  const catalog = getAdminSkinCatalog().find(item => item.key === name || item.skin.id === name);
  if(catalog){
    return {
      uid:`admin_skin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      templateId:catalog.skin.id,
      crateId:catalog.crate.id,
      name:catalog.skin.name,
      displayName:catalog.skin.name,
      skinClass:catalog.skin.skinClass,
      rarity:catalog.skin.rarity,
      accent:catalog.skin.accent,
      sourceCrate:catalog.crate.name,
      aura:catalog.skin.aura || "",
      powerRank:(catalog.crate.unlockRebirth || 0) * 1000 + (catalog.skin.rarity === "Legenda" || catalog.skin.rarity === "Boss" ? 300 : catalog.skin.rarity === "Epicki" ? 200 : 100)
    };
  }
  const safeName = String(name || "Admin Skin").trim().slice(0, 42) || "Admin Skin";
  const templateId = `admin_skin_${safeName.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "item"}`;
  return {
    uid:`admin_skin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    templateId,
    crateId:"admin",
    name:safeName,
    displayName:safeName,
    skinClass:"skin-gold",
    rarity:"Admin",
    accent:"#ffdf6b",
    sourceCrate:"Admin",
    powerRank:999999
  };
}

function makeAdminGiftBoost(gift){
  const boostType = gift?.boostType || "money";
  const meta = globalEventMeta[boostType] || globalEventMeta.money;
  const rawValue = Number(gift?.value) || (meta.mode === "chance" ? 1 : 2);
  const numeric = meta.mode === "chance" ? Math.max(0, rawValue) / 100 : Math.max(1, rawValue);
  const now = Date.now();
  return {
    id:`admin_boost_${now}_${Math.random().toString(36).slice(2, 7)}`,
    type:boostType,
    value:numeric,
    label:"Admin " + (meta.name || "Boost"),
    startedAt:now,
    endsAt:now + (Number(gift?.durationMs) || 60 * 60 * 1000)
  };
}

function getAdminPotionCatalog(){
  const types = typeof POTION_TYPES !== "undefined" ? POTION_TYPES : {};
  const tiers = typeof POTION_TIERS !== "undefined" ? POTION_TIERS : {};
  return Object.values(types).flatMap(type => Object.values(tiers).map(tier => ({
    key:`${type.id}:t${tier.tier}`,
    type:type.id,
    tier:tier.tier,
    label:`${type.label} x${tier.mult} | Tier ${tier.roman}`
  })));
}

function getAdminBagCatalog(){
  const bags = typeof BAG_CATALOG !== "undefined" ? BAG_CATALOG : {};
  return Object.values(bags).map(bag => ({
    key:bag.id,
    label:`${bag.name} | ${bag.rarity || "Item"}`
  }));
}

function getAdminEnchantCatalog(){
  const enchants = typeof ENCHANT_CATALOG !== "undefined" ? ENCHANT_CATALOG : {};
  const tiers = typeof ENCHANT_TIERS !== "undefined" ? ENCHANT_TIERS : {};
  return Object.values(enchants).flatMap(def => {
    if(def.exclusive){
      return [{key:`${def.id}:ex`, type:def.id, tier:1, label:`${def.name} | Exclusive`}];
    }
    return Object.values(tiers).map(tier => ({
      key:`${def.id}:t${tier.tier}`,
      type:def.id,
      tier:tier.tier,
      label:`${def.name} | Tier ${tier.roman}`
    }));
  });
}

function getAdminEggCatalog(){
  const eggs = typeof INVENTORY_EGG_CATALOG !== "undefined" ? INVENTORY_EGG_CATALOG : {};
  return Object.values(eggs).map(egg => ({
    key:egg.id,
    label:egg.name
  }));
}

function makeAdminGiftPotion(itemKey){
  const [typeId, tierRaw] = String(itemKey || "").split(":t");
  const tier = Math.max(1, Math.min(3, Number(tierRaw) || 1));
  const types = typeof POTION_TYPES !== "undefined" ? POTION_TYPES : {};
  const tiers = typeof POTION_TIERS !== "undefined" ? POTION_TIERS : {};
  const type = types[typeId] || types.money || {id:"money"};
  const tierData = tiers[tier] || {tier, mult:tier === 3 ? 5 : tier === 2 ? 3 : 2, durationMs:tier === 3 ? 900000 : tier === 2 ? 600000 : 300000};
  return {
    uid:`potion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type:type.id,
    tier:tierData.tier,
    mult:tierData.mult,
    durationMs:tierData.durationMs,
    createdAt:Date.now()
  };
}

function makeAdminGiftBag(itemKey){
  const bags = typeof BAG_CATALOG !== "undefined" ? BAG_CATALOG : {};
  const bag = bags[itemKey] || bags.weak || {id:"weak", name:"Slaba sakiewka"};
  return {
    uid:`bag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    bagId:bag.id,
    name:bag.name,
    createdAt:Date.now()
  };
}

function makeAdminGiftEnchant(itemKey){
  const [typeId, tierRaw] = String(itemKey || "").split(":");
  const enchants = typeof ENCHANT_CATALOG !== "undefined" ? ENCHANT_CATALOG : {};
  const def = enchants[typeId] || enchants.luck || {id:"luck", exclusive:false};
  const tier = def.exclusive || tierRaw === "ex" ? 1 : Math.max(1, Math.min(3, Number(String(tierRaw || "t1").replace("t", "")) || 1));
  return {
    uid:`enchant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type:def.id,
    tier,
    exclusive:!!def.exclusive,
    createdAt:Date.now()
  };
}

function makeAdminGiftEgg(itemKey){
  const eggs = typeof INVENTORY_EGG_CATALOG !== "undefined" ? INVENTORY_EGG_CATALOG : {};
  const egg = eggs[itemKey] || eggs.crystal_event_egg || {};
  return {
    uid:`inventory_egg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    eggId:String(itemKey || "crystal_event_egg"),
    name:egg.name || "Krysztalowe Jajko",
    acquiredAt:Date.now()
  };
}

function makeResetSaveForAccount(){
  return Object.assign(makeFreshSave(), {
    _accountNick:currentAccount?.nick || "",
    _updatedAt:Date.now()
  });
}

function applyAdminGift(gift, giftId){
  if(!gift || !gift.type) return false;
  if(gift.type === "resetGame"){
    if(gift.notice || gift.claimed){
      return false;
    }
    const claimed = Object.assign({}, game.adminGlobalClaimed || {});
    if(giftId) claimed[giftId] = Date.now();
    applySave(Object.assign(makeResetSaveForAccount(), {
      adminGlobalClaimed:claimed
    }), {mode:currentAccount ? "account" : "guest"});
    spawnPopup("Admin zresetowal Twoja gre.", false, false, true);
    return true;
  }
  if(gift.type === "coins"){
    game.score = (Number(game.score) || 0) + Math.max(0, Number(gift.value) || 0);
    return true;
  }
  if(gift.type === "diamonds"){
    game.diamonds = (Number(game.diamonds) || 0) + Math.max(0, Number(gift.value) || 0);
    return true;
  }
  if(gift.type === "pet"){
    game.pets = Array.isArray(game.pets) ? game.pets : [];
    game.pets.push(makeAdminGiftPet(gift.itemKey || gift.value, gift.variant || "normal"));
    return true;
  }
  if(gift.type === "skin"){
    game.skins = Array.isArray(game.skins) ? game.skins : [];
    const skin = makeAdminGiftSkin(gift.itemKey || gift.value);
    if(!game.skins.some(item => item.templateId === skin.templateId)){
      game.skins.push(skin);
    }
    return true;
  }
  if(gift.type === "potion"){
    game.potions = Array.isArray(game.potions) ? game.potions : [];
    const count = Math.max(1, Math.floor(Number(gift.amount || gift.value) || 1));
    for(let i = 0; i < count; i++){
      if(typeof makePotionInstance === "function"){
        const [typeId, tierRaw] = String(gift.itemKey || "").split(":t");
        game.potions.push(makePotionInstance(typeId, Number(tierRaw) || 1));
      }else{
        game.potions.push(makeAdminGiftPotion(gift.itemKey));
        if(typeof showItemDropTile === "function") showItemDropTile("potion", {icon:"🧪", color:"#9b78ff"});
      }
    }
    return true;
  }
  if(gift.type === "bag"){
    game.bags = Array.isArray(game.bags) ? game.bags : [];
    const count = Math.max(1, Math.floor(Number(gift.amount || gift.value) || 1));
    for(let i = 0; i < count; i++){
      if(typeof addBagToInventory === "function") addBagToInventory(gift.itemKey || gift.value, 1);
      else {
        game.bags.push(makeAdminGiftBag(gift.itemKey || gift.value));
        if(typeof showItemDropTile === "function") showItemDropTile("bag", {icon:"🎒", color:"#ffd35c"});
      }
    }
    return true;
  }
  if(gift.type === "enchant"){
    game.enchants = Array.isArray(game.enchants) ? game.enchants : [];
    const count = Math.max(1, Math.floor(Number(gift.amount || gift.value) || 1));
    for(let i = 0; i < count; i++){
      if(typeof addEnchantToInventory === "function") addEnchantToInventory((gift.itemKey || gift.value || "").split(":")[0], Number(String(gift.itemKey || "").split(":t")[1]) || 1, 1);
      else game.enchants.push(makeAdminGiftEnchant(gift.itemKey || gift.value));
    }
    return true;
  }
  if(gift.type === "egg"){
    game.inventoryEggs = Array.isArray(game.inventoryEggs) ? game.inventoryEggs : [];
    const count = Math.max(1, Math.floor(Number(gift.amount || gift.value) || 1));
    for(let i = 0; i < count; i++){
      const egg = makeAdminGiftEgg(gift.itemKey || gift.value);
      if(egg) game.inventoryEggs.push(egg);
    }
    return true;
  }
  if(gift.type === "boost"){
    game.bossRewardBoosts = Array.isArray(game.bossRewardBoosts) ? game.bossRewardBoosts : [];
    game.bossRewardBoosts.push(makeAdminGiftBoost(gift));
    return true;
  }
  return false;
}

async function claimAdminInboxRewards(){
  const inbox = game.adminInbox && typeof game.adminInbox === "object" ? game.adminInbox : {};
  const gifts = Object.entries(inbox).filter(([, gift]) => gift && !gift.claimed);
  if(!gifts.length) return;
  let claimed = 0;
  gifts.forEach(([giftId, gift]) => {
    if(applyAdminGift(gift, giftId)) claimed++;
  });
  game.adminInbox = {};
  if(claimed){
    update(true, true);
    await saveCloudNow();
  }
}

let globalAdminInboxUnsub = null;
let userAdminNoticeUnsub = null;
let userAdminNoticeUid = "";

async function claimGlobalAdminRewards(globalInbox){
  if(!currentAccount?.uid || !globalInbox || typeof globalInbox !== "object") return;
  game.adminGlobalClaimed = game.adminGlobalClaimed && typeof game.adminGlobalClaimed === "object" ? game.adminGlobalClaimed : {};
  const gifts = Object.entries(globalInbox).filter(([giftId, gift]) => {
    if(!gift || game.adminGlobalClaimed[giftId]) return false;
    const eligible = gift.eligibleUids && typeof gift.eligibleUids === "object";
    return eligible && !!gift.eligibleUids[currentAccount.uid];
  });
  if(!gifts.length) return;
  let claimed = 0;
  gifts.forEach(([giftId, gift]) => {
    if(applyAdminGift(gift, giftId)){
      game.adminGlobalClaimed[giftId] = Date.now();
      claimed++;
    }
  });
  if(claimed){
    game.uiDirty = true;
    update(true, true);
    await saveCloudNow();
  }
}

async function startGlobalAdminInboxLive(){
  if(globalAdminInboxUnsub || !await initFirebase()) return;
  globalAdminInboxUnsub = firebaseModules.onValue(firebaseModules.ref(firebaseDb, "globalAdminInbox"), (snapshot) => {
    claimGlobalAdminRewards(snapshot.exists() ? snapshot.val() : {}).catch((err) => {
      console.warn("Global admin inbox claim error:", err);
    });
  }, (err) => {
    console.warn("Global admin inbox live error:", err);
  });
}

function stopUserAdminNoticesLive(){
  if(typeof userAdminNoticeUnsub === "function"){
    userAdminNoticeUnsub();
  }
  userAdminNoticeUnsub = null;
  userAdminNoticeUid = "";
}

async function startUserAdminNoticesLive(){
  if(!currentAccount?.uid || !await initFirebase()) return;
  if(userAdminNoticeUnsub && userAdminNoticeUid === currentAccount.uid) return;
  stopUserAdminNoticesLive();
  userAdminNoticeUid = currentAccount.uid;
  userAdminNoticeUnsub = firebaseModules.onValue(firebaseModules.ref(firebaseDb, "userAdminNotices/" + currentAccount.uid), async (snapshot) => {
    const notices = snapshot.exists() ? snapshot.val() : {};
    const pending = Object.entries(notices || {}).filter(([, notice]) => notice && !notice.claimed);
    if(!pending.length) return;
    try{
      const patch = {};
      const now = Date.now();
      pending.forEach(([noticeId]) => {
        patch[`${noticeId}/claimed`] = true;
        patch[`${noticeId}/claimedAt`] = now;
      });
      await firebaseUpdate("userAdminNotices/" + currentAccount.uid, patch);
    }catch(err){
      console.warn("User admin notice error:", err);
    }
  }, (err) => {
    console.warn("User admin notice live error:", err);
  });
}

function renderCloudSaveStatus(state="offline", text){
  if(!cloudSaveStatus) return;
  cloudSaveStatus.classList.remove("offline", "saving", "saved", "error");
  cloudSaveStatus.classList.add(state);
  if(text){
    cloudSaveStatus.textContent = text;
  }else if(!currentAccount){
    cloudSaveStatus.textContent = "Lokalnie";
  }else if(state === "saving"){
    cloudSaveStatus.textContent = "Zapisywanie...";
  }else if(state === "saved"){
    cloudSaveStatus.textContent = "Zapisano";
  }else if(state === "error"){
    cloudSaveStatus.textContent = "Błąd zapisu";
  }else{
    cloudSaveStatus.textContent = "Online";
  }
}

function markCloudSaveSaved(){
  cloudSaveLastAt = Date.now();
  localStorage.setItem(CLOUD_SAVE_LAST_KEY, String(cloudSaveLastAt));
  cloudSaveDirty = false;
  renderCloudSaveStatus("saved");
  clearTimeout(cloudSaveStatusTimer);
  cloudSaveStatusTimer = setTimeout(() => {
    if(currentAccount && !cloudSaveDirty && !cloudSaveBusy){
      renderCloudSaveStatus("saved");
    }
  }, 2200);
}

function scheduleCloudSaveTimer(delay, force=false){
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => {
    saveCloudNow({force});
  }, Math.max(0, delay));
}

function requestCloudSave(options={}){
  if(!currentAccount || loadingRemoteSave || window.__kretDisableSave) return;
  const force = !!options.force;
  cloudSaveDirty = true;
  const now = Date.now();
  const elapsed = now - cloudSaveLastAt;
  if(force){
    scheduleCloudSaveTimer(options.delay ?? CLOUD_SAVE_FORCE_DEBOUNCE_MS, true);
    return;
  }
  if(elapsed >= CLOUD_SAVE_INTERVAL_MS){
    scheduleCloudSaveTimer(CLOUD_SAVE_DEBOUNCE_MS, false);
    return;
  }
  scheduleCloudSaveTimer(CLOUD_SAVE_INTERVAL_MS - elapsed, false);
}

function scheduleCloudSave(){
  requestCloudSave({reason:"auto"});
}

function startCloudAutosaveClock(){
  if(cloudSaveIntervalTimer) return;
  cloudSaveIntervalTimer = setInterval(() => {
    if(currentAccount && cloudSaveDirty && Date.now() - cloudSaveLastAt >= CLOUD_SAVE_INTERVAL_MS){
      saveCloudNow({force:false});
    }
  }, 15000);
}

async function saveCloudNow(options={force:true}){
  if(!currentAccount || loadingRemoteSave || window.__kretDisableSave) return false;
  const force = !!options.force;
  const now = Date.now();
  if(!force && !cloudSaveDirty && now - cloudSaveLastAt < CLOUD_SAVE_INTERVAL_MS) return true;
  if(!force && now - cloudSaveLastAt < CLOUD_SAVE_INTERVAL_MS) return true;
  if(cloudSaveBusy){
    cloudSaveQueued = true;
    cloudSaveQueuedForce = cloudSaveQueuedForce || force;
    return false;
  }
  cloudSaveBusy = true;
  clearTimeout(cloudSaveTimer);
  renderCloudSaveStatus("saving");
  try{
    const authUser = await waitForFirebaseAuthUser();
    if(!authUser || authUser.uid !== currentAccount.uid){
      throw new Error("auth.uid mismatch during cloud save");
    }
    const snapshot = makeSaveSnapshot();
    writeLocalSaveNow();
    const remoteSave = await firebaseGet("users/" + currentAccount.uid);
    if(remoteSave && !isMeaningfulSave(snapshot) && isMeaningfulSave(remoteSave)){
      throw new Error("Refused to overwrite non-empty remote save with empty local save");
    }
    await firebaseSet("users/" + currentAccount.uid, snapshot);
    await saveLeaderboardNow({silent:true, refreshAfter:false});
    markCloudSaveSaved();
    return true;
  }catch(err){
    console.warn("Cloud save error:", err);
    renderCloudSaveStatus("error");
    return false;
  }finally{
    cloudSaveBusy = false;
    if(cloudSaveQueued){
      const queuedForce = cloudSaveQueuedForce;
      cloudSaveQueued = false;
      cloudSaveQueuedForce = false;
      requestCloudSave({force:queuedForce, delay:queuedForce ? CLOUD_SAVE_FORCE_DEBOUNCE_MS : CLOUD_SAVE_DEBOUNCE_MS});
    }
  }
}

async function flushCloudSaveBeforeLogout(){
  const started = Date.now();
  while(cloudSaveBusy && Date.now() - started < 8000){
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  return saveCloudNow({force:true});
}

function saveCloudOnPageExit(){
  if(loadingRemoteSave || window.__kretDisableSave) return;
  writeLocalSaveNow();
  if(typeof forceKretLocalSave === "function"){
    forceKretLocalSave();
  }
  if(!currentAccount) return;
  saveCloudNow({force:true});
}

function renderAccountStatus(){
  if(!accountStatusText || !logoutBtn) return;
  if(currentAccount){
    accountStatusText.textContent = "Konto: " + currentAccount.nick;
    logoutBtn.style.display = "inline-flex";
    logoutBtn.textContent = "Konto";
    if(cloudSaveBusy){
      renderCloudSaveStatus("saving");
    }else{
      renderCloudSaveStatus("saved");
    }
  }else{
    accountStatusText.textContent = "Gosc";
    logoutBtn.style.display = "inline-flex";
    logoutBtn.textContent = "Zaloguj się";
    renderCloudSaveStatus("offline", "Lokalnie");
  }
  updateAdminVisibility();
}

function isCurrentAdmin(){
  return !!currentAccount && String(currentAccount.safeNick || "").toLowerCase() === "panda";
}

function renderAdminLeaderboardVisibility(){
  if(!adminLeaderboardVisibilityBox) return;
  const isAdmin = isCurrentAdmin();
  adminLeaderboardVisibilityBox.style.display = isAdmin ? "flex" : "none";
  if(adminLeaderboardVisibilityStatus){
    adminLeaderboardVisibilityStatus.textContent = adminLeaderboardVisible
      ? "Jesteś widoczny w zwykłych leaderboardach."
      : "Jesteś ukryty w zwykłych leaderboardach.";
  }
  if(adminLeaderboardVisibilityBtn){
    adminLeaderboardVisibilityBtn.textContent = adminLeaderboardVisible ? "Ukryj mnie" : "Pokaż mnie";
    adminLeaderboardVisibilityBtn.classList.toggle("danger", adminLeaderboardVisible);
  }
}

async function loadAdminLeaderboardVisibility(){
  if(!isCurrentAdmin() || !currentAccount?.uid || !await initFirebase()) return;
  const setting = await firebaseGet("users/" + currentAccount.uid + "/adminSettings/leaderboardVisible");
  adminLeaderboardVisible = setting !== false;
  renderAdminLeaderboardVisibility();
}

async function setAdminLeaderboardVisibility(visible){
  if(!isCurrentAdmin() || !currentAccount?.uid || !await initFirebase()) return;
  adminLeaderboardVisible = !!visible;
  renderAdminLeaderboardVisibility();
  await firebaseSet("users/" + currentAccount.uid + "/adminSettings/leaderboardVisible", adminLeaderboardVisible);
  if(!adminLeaderboardVisible){
    const patch = {};
    leaderboardCategories.forEach(category => {
      patch[`${category.id}/${currentAccount.uid}`] = null;
      if(leaderboardData?.[category.id]?.[currentAccount.uid]){
        delete leaderboardData[category.id][currentAccount.uid];
      }
    });
    await firebaseUpdate("leaderboards", patch);
    renderLeaderboardPanel();
  }else{
    await saveLeaderboardNow({silent:true, refreshAfter:true});
  }
  setAdminAbuseMessage(adminLeaderboardVisible ? "Admin widoczny w leaderboardach." : "Admin ukryty w leaderboardach.");
}

function setSupportFormStatus(text, isError=false){
  if(!supportFormStatus) return;
  supportFormStatus.textContent = text || "";
  supportFormStatus.classList.toggle("error", !!isError);
}

function getSupportAuthor(){
  if(currentAccount){
    return {
      uid:currentAccount.uid || "",
      nick:currentAccount.nick || currentAccount.safeNick || "Gracz",
      safeNick:String(currentAccount.safeNick || currentAccount.nick || "").toLowerCase(),
      mode:"konto"
    };
  }
  return {
    uid:"",
    nick:"Gość",
    safeNick:"guest",
    mode:"gosc"
  };
}

async function submitSupportTicket(){
  const title = supportTitleInput?.value.trim() || "";
  const message = supportMessageInput?.value.trim() || "";
  if(title.length < 3){
    setSupportFormStatus("Wpisz krótki tytuł problemu.", true);
    return;
  }
  if(message.length < 8){
    setSupportFormStatus("Opisz problem trochę dokładniej.", true);
    return;
  }
  if(!await initFirebase()){
    setSupportFormStatus("Nie udało się połączyć z Firebase. Spróbuj później.", true);
    return;
  }
  const now = Date.now();
  const ticketId = `ticket_${now}_${Math.random().toString(36).slice(2, 8)}`;
  const author = getSupportAuthor();
  const ticket = {
    id:ticketId,
    title:title.slice(0, 80),
    message:message.slice(0, 900),
    author,
    createdAt:now,
    read:false,
    status:"new",
    source:"gameInfo"
  };
  try{
    if(supportSubmitBtn) supportSubmitBtn.disabled = true;
    setSupportFormStatus("Wysyłanie zgłoszenia...");
    await firebaseSet(`adminSupportInbox/panda/${ticketId}`, ticket);
    if(supportTitleInput) supportTitleInput.value = "";
    if(supportMessageInput) supportMessageInput.value = "";
    setSupportFormStatus("Zgłoszenie wysłane do Pandy. Dzięki!");
  }catch(err){
    console.warn("Support ticket error:", err);
    setSupportFormStatus("Nie udało się wysłać zgłoszenia. Spróbuj później.", true);
  }finally{
    if(supportSubmitBtn) supportSubmitBtn.disabled = false;
  }
}

function formatSupportTime(ms){
  if(!ms) return "";
  try{
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle:"short",
      timeStyle:"short",
      timeZone:"Europe/Warsaw"
    }).format(new Date(ms));
  }catch(err){
    return new Date(ms).toLocaleString();
  }
}

function renderSupportInbox(){
  if(!adminSupportInbox || !adminSupportList || !adminSupportStatus) return;
  adminSupportInbox.style.display = isCurrentAdmin() ? "block" : "none";
  if(!isCurrentAdmin()) return;
  const tickets = Object.values(supportTicketsData || {})
    .filter(ticket => ticket && ticket.id)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 25);
  const unread = tickets.filter(ticket => !ticket.read).length;
  adminSupportStatus.textContent = tickets.length
    ? `Zgłoszenia: ${tickets.length} | nieprzeczytane: ${unread}`
    : "Brak zgłoszeń.";
  adminSupportList.innerHTML = tickets.map(ticket => `
    <div class="supportTicket ${ticket.read ? "" : "unread"}">
      <div class="supportTicketTop">
        <span>${escapeHtml(ticket.title || "Bez tytułu")}</span>
        <span>${ticket.read ? "OK" : "NOWE"}</span>
      </div>
      <div class="supportTicketMeta">
        Od: ${escapeHtml(ticket.author?.nick || "Gracz")} (${escapeHtml(ticket.author?.mode || "konto")}) | ${formatSupportTime(ticket.createdAt)}
      </div>
      <div class="supportTicketMessage">${escapeHtml(ticket.message || "")}</div>
      <div class="supportTicketActions">
        <button type="button" onclick="adminMarkSupportTicketRead('${escapeHtml(ticket.id)}')">Oznacz jako przeczytane</button>
        <button type="button" onclick="adminDeleteSupportTicket('${escapeHtml(ticket.id)}')">Usuń</button>
      </div>
    </div>
  `).join("");
}

async function startSupportInboxLive(){
  if(!isCurrentAdmin() || supportInboxUnsub || !await initFirebase()) return;
  supportInboxUnsub = firebaseModules.onValue(firebaseModules.ref(firebaseDb, "adminSupportInbox/panda"), (snapshot) => {
    supportTicketsData = snapshot.exists() ? snapshot.val() : {};
    renderSupportInbox();
  }, (err) => {
    console.warn("Support inbox live error:", err);
  });
}

window.adminMarkSupportTicketRead = async function(ticketId){
  if(!isCurrentAdmin() || !ticketId || !await initFirebase()) return;
  await firebaseUpdate(`adminSupportInbox/panda/${ticketId}`, {
    read:true,
    readAt:Date.now()
  });
};

window.adminDeleteSupportTicket = async function(ticketId){
  if(!isCurrentAdmin() || !ticketId || !await initFirebase()) return;
  await firebaseSet(`adminSupportInbox/panda/${ticketId}`, null);
};

window.submitSupportTicket = submitSupportTicket;

function updateAdminVisibility(){
  const isAdmin = isCurrentAdmin();
  try{
    adminUnlocked = isAdmin;
  }catch(err){}
  adminToggle?.classList.toggle("adminVisible", isAdmin);
  if(adminToggle){
    adminToggle.style.display = isAdmin ? "block" : "";
  }
  if(adminPanel){
    if(isAdmin && adminPanel.dataset.adminAllowed !== "1"){
      adminPanel.style.display = "block";
      adminPanel.dataset.adminAllowed = "1";
    }
    if(!isAdmin){
      adminPanel.style.display = "none";
      delete adminPanel.dataset.adminAllowed;
    }
  }
  renderSupportInbox();
  if(isAdmin){
    populateAdminBossSelect();
    renderAdminCodesPanel().catch((err) => console.warn("Admin codes render error:", err));
    startSupportInboxLive();
    renderAdminLeaderboardVisibility();
    loadAdminLeaderboardVisibility().catch((err) => console.warn("Admin leaderboard visibility load error:", err));
  }
  if(!isAdmin){
    localStorage.removeItem("kretAdminUnlocked");
    adminLeaderboardVisible = true;
    renderAdminLeaderboardVisibility();
  }
}

function setAuthMessage(text, error=false){
  if(!authMessage) return;
  authMessage.textContent = text || "";
  authMessage.classList.toggle("error", !!error);
}

function openAuthOverlay(){
  authOverlay?.classList.add("open");
}

function closeAuthOverlay(){
  authOverlay?.classList.remove("open");
  setTimeout(()=>window.maybeAskTutorial?.(), 180);
}

function showAuthMenu(){
  openAuthOverlay();
  authMode = "login";
  if(authTitle) authTitle.textContent = "Wybierz tryb gry";
  if(authSubtitle) authSubtitle.textContent = "Konto zapisuje progres online. Gosc gra tylko lokalnie.";
  if(authMenu) authMenu.style.display = "grid";
  authForm?.classList.remove("open");
  setAuthMessage("");
}

function showAuthForm(mode){
  authMode = mode;
  openAuthOverlay();
  if(authTitle) authTitle.textContent = mode === "register" ? "Utworz konto" : "Zaloguj";
  if(authSubtitle) authSubtitle.textContent = mode === "register" ? "Nick i haslo zapisza konto w Firebase." : "Po zalogowaniu wczytamy Twoj save online.";
  if(authSubmitBtn) authSubmitBtn.textContent = mode === "register" ? "Utworz konto" : "Zaloguj";
  if(authMenu) authMenu.style.display = "none";
  authForm?.classList.add("open");
  setAuthMessage("");
  setTimeout(() => authNick?.focus(), 50);
}

function openAccountMenu(){
  if(!currentAccount){
    showAuthMenu();
    return;
  }
  if(accountMenuNick) accountMenuNick.textContent = currentAccount.nick || currentAccount.safeNick || "Gracz";
  if(accountMenuMessage){
    accountMenuMessage.textContent = "";
    accountMenuMessage.classList.remove("error");
  }
  changePasswordForm?.classList.remove("open");
  accountMenuOverlay?.classList.add("open");
}

function closeAccountMenu(){
  accountMenuOverlay?.classList.remove("open");
}

function setAccountMenuMessage(text, error=false){
  if(!accountMenuMessage) return;
  accountMenuMessage.textContent = text || "";
  accountMenuMessage.classList.toggle("error", !!error);
}

function safeNick(nick){
  const polishMap = {ą:"a",ć:"c",ę:"e",ł:"l",ń:"n",ó:"o",ś:"s",ż:"z",ź:"z"};
  return String(nick || "")
    .trim()
    .toLowerCase()
    .replace(/[ąćęłńóśżź]/g, ch=>polishMap[ch] || ch)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/[.#$\[\]\/\\]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
}

function getAuthEmailForSafeNick(safe){
  return `${safe}@game.local`;
}

function makeAccountSessionFromAuth(user, account, safe, fallbackNick){
  const username = account?.username || account?.nick || fallbackNick || safe;
  return {
    uid:user.uid,
    firebaseUid:user.uid,
    nick:username,
    username,
    safeNick:account?.safeNick || safe,
    authEmail:user.email || getAuthEmailForSafeNick(safe)
  };
}

function getInputCredentials(){
  const nick = authNick?.value.trim() || "";
  const password = authPassword?.value || "";
  const safe = safeNick(nick);
  if(nick.length < 3 || safe.length < 3){
    throw new Error("Nick musi miec minimum 3 znaki.");
  }
  if(password.length < 4){
    throw new Error("Haslo musi miec minimum 4 znaki.");
  }
  return { nick, password, safe };
}

function getFirebaseAuthErrorMessage(err, fallback="Nie udało się wykonać akcji."){
  const code = String(err?.code || "");
  if(code.includes("email-already-in-use")) return "Ten nick jest już zajęty";
  if(code.includes("user-not-found") || code.includes("invalid-credential")) return "Nie znaleziono konta albo hasło jest błędne.";
  if(code.includes("wrong-password")) return "Złe hasło.";
  if(code.includes("weak-password")) return "Hasło jest za słabe.";
  if(code.includes("requires-recent-login")) return "Zaloguj się ponownie i spróbuj jeszcze raz.";
  return err?.message || fallback;
}

async function ensureAccountIndexForAuth(user, nick, safe){
  const now = Date.now();
  const patch = {
    uid:user.uid,
    firebaseUid:user.uid,
    username:nick,
    nick,
    safeNick:safe,
    authEmail:user.email || getAuthEmailForSafeNick(safe),
    updatedAt:now
  };
  patch.createdAt = now;
  await firebaseUpdate("accounts/" + safe, patch);
  return patch;
}

async function finishAuthAccountSession(user, nick, safe){
  const account = await ensureAccountIndexForAuth(user, nick, safe);
  currentAccount = makeAccountSessionFromAuth(user, account, safe, nick);
  window.__kretSaveMode = "account";
  localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(currentAccount));
  await loadAccountSave(true);
  await syncBossUpgrade();
  await claimPendingOnlineRewards();
  await startGlobalAdminInboxLive();
  await startUserAdminNoticesLive();
  await claimGlobalAdminRewards(await firebaseGet("globalAdminInbox") || {});
  closeAuthOverlay();
  renderAccountStatus();
  renderGlobalBossPanel();
  setTimeout(()=>window.maybeAskTutorial?.(), 180);
}

async function registerAccount(){
  if(!await initFirebase()) return;
  try{
    setAuthMessage("Tworzenie konta...");
    const { nick, password, safe } = getInputCredentials();
    const credential = await firebaseModules.createUserWithEmailAndPassword(firebaseAuth, getAuthEmailForSafeNick(safe), password);
    await finishAuthAccountSession(credential.user, nick, safe);
    update(true, true);
  }catch(err){
    setAuthMessage(getFirebaseAuthErrorMessage(err, "Nie udało się utworzyć konta."), true);
  }
}

async function loginAccount(){
  if(!await initFirebase()) return;
  try{
    setAuthMessage("Logowanie...");
    const { nick, password, safe } = getInputCredentials();
    const credential = await firebaseModules.signInWithEmailAndPassword(firebaseAuth, getAuthEmailForSafeNick(safe), password);
    const account = await firebaseGet("accounts/" + safe);
    if(account?.firebaseUid && account.firebaseUid !== credential.user.uid){
      await firebaseModules.signOut(firebaseAuth);
      setAuthMessage("Ten nick jest przypisany do innego konta.", true);
      return;
    }
    await finishAuthAccountSession(credential.user, account?.username || account?.nick || nick, safe);
  }catch(err){
    setAuthMessage(getFirebaseAuthErrorMessage(err, "Nie udało się zalogować."), true);
  }
}

async function changeAccountPassword(){
  if(!currentAccount?.safeNick || !await initFirebase()) return;
  const oldPassword = oldPasswordInput?.value || "";
  const newPassword = newPasswordInput?.value || "";
  if(oldPassword.length < 4 || newPassword.length < 4){
    setAccountMenuMessage("Hasło musi mieć minimum 4 znaki.", true);
    return;
  }
  try{
    setAccountMenuMessage("Sprawdzanie hasła...");
    const user = firebaseAuth.currentUser || await waitForFirebaseAuthUser();
    if(!user || user.uid !== currentAccount.uid){
      setAccountMenuMessage("Zaloguj się ponownie, żeby zmienić hasło.", true);
      return;
    }
    const accountPath = "accounts/" + safeNick(currentAccount.safeNick);
    const credential = firebaseModules.EmailAuthProvider.credential(
      user.email || getAuthEmailForSafeNick(currentAccount.safeNick),
      oldPassword
    );
    await firebaseModules.reauthenticateWithCredential(user, credential);
    await firebaseModules.updatePassword(user, newPassword);
    await firebaseUpdate(accountPath, {
      firebaseUid:user.uid,
      uid:user.uid,
      username:currentAccount.username || currentAccount.nick || currentAccount.safeNick,
      authEmail:user.email || getAuthEmailForSafeNick(currentAccount.safeNick),
      passwordChangedAt:Date.now()
    });
    if(oldPasswordInput) oldPasswordInput.value = "";
    if(newPasswordInput) newPasswordInput.value = "";
    changePasswordForm?.classList.remove("open");
    setAccountMenuMessage("Hasło zmienione.");
  }catch(err){
    console.warn("Password change error:", err);
    setAccountMenuMessage(getFirebaseAuthErrorMessage(err, "Nie udało się zmienić hasła."), true);
  }
}

async function loadAccountSave(createIfMissing=false){
  if(!currentAccount || !await initFirebase()) return;
  window.__kretSaveMode = "account";
  const authUser = await waitForFirebaseAuthUser();
  if(!authUser || authUser.uid !== currentAccount.uid){
    throw new Error("auth.uid mismatch while loading save");
  }
  const localAccountSave = getAccountLocalSave(currentAccount.uid);
  let remoteSave = null;
  let remoteReadFailed = false;
  try{
    remoteSave = await firebaseGet("users/" + currentAccount.uid);
  }catch(err){
    remoteReadFailed = true;
    console.warn("Remote account save read failed, using local backup if possible:", err);
  }
  if(remoteSave){
    const shouldUseLocal = localAccountSave
      && isMeaningfulSave(localAccountSave)
      && getSaveTimestamp(localAccountSave) > getSaveTimestamp(remoteSave);
    applySave(shouldUseLocal ? localAccountSave : remoteSave, {mode:"account"});
    if(shouldUseLocal){
      requestCloudSave({force:true, reason:"newerLocalAccountSave"});
    }
    if(!remoteSave.username || !remoteSave.authUid){
      requestCloudSave({force:true, reason:"authProfileSync"});
    }
    await runAccountPostLoadTasks();
    return;
  }
  if(remoteReadFailed && isMeaningfulSave(localAccountSave)){
    applySave(localAccountSave, {mode:"account"});
    renderCloudSaveStatus("error", "Lokalny backup");
    return;
  }
  if(createIfMissing){
    const guestSaveToMigrate = getGuestSave();
    const baseSave = isMeaningfulSave(localAccountSave) ? localAccountSave : (guestSaveToMigrate || makeFreshSave());
    const fresh = normalizeSave(baseSave);
    const firstSnapshot = Object.assign(fresh, {
      username:currentAccount.username || currentAccount.nick,
      safeNick:currentAccount.safeNick || "",
      authUid:currentAccount.uid,
      _accountNick:currentAccount.nick,
      _updatedAt:Date.now(),
      updatedAt:Date.now(),
      lastSavedAt:Date.now()
    });
    try{
      await firebaseSet("users/" + currentAccount.uid, firstSnapshot);
    }catch(err){
      console.warn("Remote account save create failed, keeping local backup:", err);
      renderCloudSaveStatus("error", "Lokalny backup");
    }
    applySave(firstSnapshot, {mode:"account"});
    if(guestSaveToMigrate){
      clearMigratedGuestSave();
    }
    await runAccountPostLoadTasks();
  }
}

const MARKET_SLOT_COSTS = [0, 500, 2500, 10000, 40000];
const MARKET_CATEGORIES = [
  {id:"pets", label:"Pety"},
  {id:"potions", label:"Mikstury"},
  {id:"bags", label:"Sakiewki"},
  {id:"eggs", label:"Jajka"},
  {id:"enchants", label:"Enchanty"},
  {id:"fruits", label:"Owoce i ryby"}
];

function isMarketplaceUnlocked(){
  return (Number(game.rebirths) || 0) >= 2;
}

function setMarketStatus(text="", isError=false){
  if(!marketStatus) return;
  marketStatus.textContent = text;
  marketStatus.style.color = isError ? "#ff9a9a" : "";
}

function getMarketCapacity(){
  game.marketSlots = Math.max(1, Math.min(5, Math.floor(Number(game.marketSlots) || 1)));
  return game.marketSlots;
}

function getMyMarketOffers(){
  if(!currentAccount) return [];
  return Object.values(marketplaceOffers || {})
    .filter(offer=>offer && offer.ownerUid === currentAccount.uid && offer.status === "active")
    .sort((a,b)=>(b.createdAt || 0) - (a.createdAt || 0));
}

function getPublicMarketOffers(){
  return Object.values(marketplaceOffers || {})
    .filter(offer=>offer && offer.status === "active")
    .sort((a,b)=>(b.createdAt || 0) - (a.createdAt || 0));
}

function makeMarketOfferId(){
  const uid = currentAccount?.uid || "guest";
  return `${uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function marketItemKey(category, item){
  if(category === "pets") return item.uid;
  if(category === "potions") return `${item.type}:${item.tier}`;
  if(category === "bags") return item.bagId;
  if(category === "eggs") return item.eggId;
  if(category === "enchants") return `${item.type}:${item.tier}`;
  if(category === "fruits") return item.id;
  return "";
}

function marketItemLabel(category, item){
  if(category === "pets") return item.displayName || item.name || "Pet";
  if(category === "potions"){
    const type = typeof POTION_TYPES !== "undefined" ? (POTION_TYPES[item.type] || POTION_TYPES.money) : {label:item.type || "Mikstura"};
    const tier = typeof POTION_TIERS !== "undefined" ? (POTION_TIERS[item.tier] || POTION_TIERS[1]) : {roman:item.tier || 1};
    return `${type.label} T${tier.roman}`;
  }
  if(category === "bags"){
    const bag = typeof BAG_CATALOG !== "undefined" ? (BAG_CATALOG[item.bagId] || BAG_CATALOG.weak) : null;
    return bag?.name || "Sakiewka";
  }
  if(category === "eggs"){
    const egg = typeof INVENTORY_EGG_CATALOG !== "undefined" ? INVENTORY_EGG_CATALOG[item.eggId] : null;
    return egg?.name || "Jajko";
  }
  if(category === "enchants"){
    const def = typeof ENCHANT_CATALOG !== "undefined" ? (ENCHANT_CATALOG[item.type] || ENCHANT_CATALOG.luck) : null;
    const tier = typeof ENCHANT_TIERS !== "undefined" ? (ENCHANT_TIERS[item.tier] || ENCHANT_TIERS[1]) : {roman:item.tier || 1};
    return `${def?.name || "Enchant"} ${tier.roman}`;
  }
  if(category === "fruits"){
    const def = typeof PET_FRUIT_CATALOG !== "undefined" ? PET_FRUIT_CATALOG[item.id] : null;
    return def?.name || "Owoc";
  }
  return "Item";
}

function marketItemIcon(category, item){
  if(category === "pets") return item.icon || "P";
  if(category === "potions") return (typeof POTION_TYPES !== "undefined" && POTION_TYPES[item.type]?.icon) || "XP";
  if(category === "bags") return (typeof BAG_CATALOG !== "undefined" && BAG_CATALOG[item.bagId]?.icon) || "B";
  if(category === "eggs") return (typeof INVENTORY_EGG_CATALOG !== "undefined" && INVENTORY_EGG_CATALOG[item.eggId]?.icon) || "&#129370;";
  if(category === "enchants") return (typeof ENCHANT_CATALOG !== "undefined" && ENCHANT_CATALOG[item.type]?.icon) || "EN";
  if(category === "fruits") return (typeof PET_FRUIT_CATALOG !== "undefined" && PET_FRUIT_CATALOG[item.id]?.icon) || "F";
  return "?";
}

function marketItemColor(category, item){
  if(category === "pets") return item.color || "#9fe8ff";
  if(category === "potions") return (typeof POTION_TYPES !== "undefined" && POTION_TYPES[item.type]?.color) || "#f7fbff";
  if(category === "bags") return (typeof BAG_CATALOG !== "undefined" && BAG_CATALOG[item.bagId]?.color) || "#9cc7ff";
  if(category === "enchants") return (typeof ENCHANT_CATALOG !== "undefined" && ENCHANT_CATALOG[item.type]?.color) || "#d8b6ff";
  if(category === "fruits") return (typeof PET_FRUIT_CATALOG !== "undefined" && PET_FRUIT_CATALOG[item.id]?.color) || "#f7fbff";
  return "#9fe8ff";
}

function getMarketSellGroups(category){
  const groups = new Map();
  const add = (item)=>{
    const key = marketItemKey(category, item);
    if(!key) return;
    const group = groups.get(key) || {
      category,
      key,
      label:marketItemLabel(category, item),
      icon:marketItemIcon(category, item),
      color:marketItemColor(category, item),
      items:[]
    };
    group.items.push(item);
    groups.set(key, group);
  };
  if(category === "pets") (Array.isArray(game.pets) ? game.pets : []).forEach(add);
  if(category === "potions") (Array.isArray(game.potions) ? game.potions : []).forEach(add);
  if(category === "bags") (Array.isArray(game.bags) ? game.bags : []).forEach(add);
  if(category === "eggs") (Array.isArray(game.inventoryEggs) ? game.inventoryEggs : []).forEach(add);
  if(category === "enchants") (Array.isArray(game.enchants) ? game.enchants : []).forEach(add);
  if(category === "fruits") (Array.isArray(game.fruits) ? game.fruits : []).forEach(add);
  return Array.from(groups.values()).sort((a,b)=>a.label.localeCompare(b.label, "pl"));
}

function removeMarketItemsFromInventory(category, key, qty){
  const count = Math.max(1, Math.floor(Number(qty) || 1));
  const removed = [];
  const takeFrom = (prop, matcher)=>{
    const source = Array.isArray(game[prop]) ? game[prop] : [];
    const keep = [];
    source.forEach(item=>{
      if(removed.length < count && matcher(item)) removed.push(item);
      else keep.push(item);
    });
    game[prop] = keep;
  };
  if(category === "pets"){
    takeFrom("pets", item=>item.uid === key);
    const removedIds = new Set(removed.map(item=>item.uid));
    game.activePetIds = (Array.isArray(game.activePetIds) ? game.activePetIds : []).filter(id=>!removedIds.has(id));
  }else if(category === "potions") takeFrom("potions", item=>marketItemKey(category, item) === key);
  else if(category === "bags") takeFrom("bags", item=>marketItemKey(category, item) === key);
  else if(category === "eggs") takeFrom("inventoryEggs", item=>marketItemKey(category, item) === key);
  else if(category === "enchants"){
    takeFrom("enchants", item=>marketItemKey(category, item) === key);
    const removedIds = new Set(removed.map(item=>item.uid));
    game.activeEnchantIds = (Array.isArray(game.activeEnchantIds) ? game.activeEnchantIds : []).filter(id=>!removedIds.has(id));
  }else if(category === "fruits") takeFrom("fruits", item=>marketItemKey(category, item) === key);
  return removed.length === count ? removed : [];
}

function restoreMarketItemsToInventory(offer, qty){
  const count = Math.max(1, Math.min(Math.floor(Number(qty) || 1), offer.quantity || 1));
  const category = offer.category;
  const payload = Array.isArray(offer.payload) ? offer.payload.slice(0, count) : [];
  if(category === "pets"){
    game.pets = Array.isArray(game.pets) ? game.pets : [];
    payload.forEach(item=>game.pets.push(item));
  }else if(category === "potions"){
    game.potions = Array.isArray(game.potions) ? game.potions : [];
    payload.forEach(item=>game.potions.push(item));
  }else if(category === "bags"){
    game.bags = Array.isArray(game.bags) ? game.bags : [];
    payload.forEach(item=>game.bags.push(item));
  }else if(category === "eggs"){
    game.inventoryEggs = Array.isArray(game.inventoryEggs) ? game.inventoryEggs : [];
    payload.forEach(item=>game.inventoryEggs.push(item));
  }else if(category === "enchants"){
    game.enchants = Array.isArray(game.enchants) ? game.enchants : [];
    payload.forEach(item=>game.enchants.push(item));
  }else if(category === "fruits"){
    game.fruits = Array.isArray(game.fruits) ? game.fruits : [];
    payload.forEach(item=>game.fruits.push(item));
  }
}

function grantMarketItemsToBuyer(offer, qty){
  const count = Math.max(1, Math.floor(Number(qty) || 1));
  const category = offer.category;
  const sample = Array.isArray(offer.payload) ? offer.payload[0] : null;
  if(category === "pets"){
    game.pets = Array.isArray(game.pets) ? game.pets : [];
    (offer.payload || []).slice(0, count).forEach(item=>{
      const pet = JSON.parse(JSON.stringify(item));
      pet.uid = `pet_${game.petSeq++}`;
      game.pets.push(pet);
    });
  }else if(category === "potions"){
    game.potions = Array.isArray(game.potions) ? game.potions : [];
    for(let i = 0; i < count; i++) game.potions.push(typeof makePotionInstance === "function" ? makePotionInstance(sample?.type || offer.key.split(":")[0], Number(sample?.tier || offer.key.split(":")[1]) || 1) : Object.assign({}, sample));
  }else if(category === "bags"){
    game.bags = Array.isArray(game.bags) ? game.bags : [];
    for(let i = 0; i < count; i++) game.bags.push(typeof makeBagInstance === "function" ? makeBagInstance(sample?.bagId || offer.key) : Object.assign({}, sample));
  }else if(category === "eggs"){
    game.inventoryEggs = Array.isArray(game.inventoryEggs) ? game.inventoryEggs : [];
    for(let i = 0; i < count; i++){
      const egg = typeof makeInventoryEggInstance === "function" ? makeInventoryEggInstance(sample?.eggId || offer.key) : Object.assign({}, sample);
      if(egg) game.inventoryEggs.push(egg);
    }
  }else if(category === "enchants"){
    game.enchants = Array.isArray(game.enchants) ? game.enchants : [];
    for(let i = 0; i < count; i++) game.enchants.push(typeof makeEnchantInstance === "function" ? makeEnchantInstance(sample?.type || offer.key.split(":")[0], Number(sample?.tier || offer.key.split(":")[1]) || 1) : Object.assign({}, sample));
  }else if(category === "fruits"){
    game.fruits = Array.isArray(game.fruits) ? game.fruits : [];
    for(let i = 0; i < count; i++) game.fruits.push(typeof makeFruitInstance === "function" ? makeFruitInstance(sample?.id || offer.key) : Object.assign({}, sample));
  }
}

function renderMarketOfferCard(offer, owned=false){
  const mine = currentAccount && offer.ownerUid === currentAccount.uid;
  const disabled = mine ? " disabled" : "";
  const action = owned
    ? `<button class="marketActionBtn" data-market-cancel="${escapeHtml(offer.id)}" type="button">Anuluj oferte</button>`
    : `<button class="marketActionBtn buy"${disabled} data-market-buy="${escapeHtml(offer.id)}" type="button">${mine ? "Twoja oferta" : "Kup"}</button>`;
  return `
    <div class="marketCard">
      <div class="marketItemTop">
        <div class="marketIcon" style="background:${offer.color || "#9fe8ff"}">${offer.icon || "?"}</div>
        <div class="marketItemMeta">
          <b>${escapeHtml(offer.label || "Item")}</b>
          <small>${escapeHtml(offer.ownerNick || "Gracz")} | ${escapeHtml(offer.category || "")}</small>
        </div>
      </div>
      <div class="marketPrice">
        <span>Ilość: ${format(offer.quantity || 1)}</span>
        <span>${formatDiamond(offer.unitPrice || 0)} &#128142; / szt.</span>
      </div>
      ${action}
    </div>
  `;
}

function renderMarketplace(){
  if(!marketplaceView) return;
  marketplaceDockBtn?.classList.toggle("locked", !isMarketplaceUnlocked());
  updateMarketDiamondText();
  const offers = getPublicMarketOffers();
  if(marketOffersView){
    marketOffersView.innerHTML = !currentAccount
      ? `<div class="marketCard"><b>Marketplace wymaga konta online.</b><p>Zaloguj sie, zeby kupowac i sprzedawac bez ryzyka utraty itemow.</p></div>`
      : offers.length
        ? `<div class="marketGrid">${offers.map(offer=>renderMarketOfferCard(offer)).join("")}</div>`
        : `<div class="marketCard"><b>Brak ofert.</b><p>Na razie nikt nic nie sprzedaje.</p></div>`;
  }
  renderMyMarketplace();
}

function updateMarketDiamondText(){
  if(marketDiamondText) marketDiamondText.textContent = formatDiamond(Number(game.diamonds) || 0);
}

function renderMyMarketplace(){
  if(!marketMineView) return;
  if(!currentAccount){
    marketMineView.innerHTML = `<div class="marketCard"><b>Zaloguj sie.</b><p>Swoje oferty dzialaja tylko na koncie online.</p></div>`;
    return;
  }
  const myOffers = getMyMarketOffers();
  const capacity = getMarketCapacity();
  const slots = Array.from({length:5}, (_, index)=>{
    const unlocked = index < capacity;
    const cost = MARKET_SLOT_COSTS[index] || 0;
    return `
      <div class="marketSlotCard ${unlocked ? "" : "locked"}">
        <b>Slot ${index + 1}</b>
        <p>${unlocked ? "Odblokowany" : `Koszt: ${formatDiamond(cost)} diaxow`}</p>
        ${!unlocked && index === capacity ? `<button class="marketSlotBtn" data-market-slot="${index + 1}" type="button">Kup slot</button>` : ""}
      </div>
    `;
  }).join("");
  const canCreate = myOffers.length < capacity;
  marketMineView.innerHTML = `
    <div class="marketMineTop">${slots}</div>
    <div class="marketCreateBox">
      <b>Dodaj oferte</b>
      <div class="marketFormRow">
        <label>Kategoria</label>
        <select id="marketSellCategory">${MARKET_CATEGORIES.map(cat=>`<option value="${cat.id}">${cat.label}</option>`).join("")}</select>
      </div>
      <div class="marketFormRow">
        <label>Item z EQ</label>
        <select id="marketSellItem"></select>
      </div>
      <div class="marketFormRow">
        <label>Ilosc</label>
        <input id="marketSellQty" type="number" min="1" value="1">
      </div>
      <div class="marketFormRow">
        <label>Cena za sztuke w diamentach</label>
        <input id="marketSellPrice" type="number" min="1" step="1" value="10">
      </div>
      <button class="marketActionBtn sell" id="marketCreateOfferBtn" type="button" ${canCreate ? "" : "disabled"}>${canCreate ? "Wystaw oferte" : "Brak wolnego slotu"}</button>
    </div>
    ${myOffers.length ? `<div class="marketGrid">${myOffers.map(offer=>renderMarketOfferCard(offer, true)).join("")}</div>` : `<div class="marketCard"><b>Nie masz aktywnych ofert.</b></div>`}
  `;
  refreshMarketSellItems();
}

function refreshMarketSellItems(){
  const categorySelect = document.getElementById("marketSellCategory");
  const itemSelect = document.getElementById("marketSellItem");
  const qtyInput = document.getElementById("marketSellQty");
  if(!categorySelect || !itemSelect || !qtyInput) return;
  const groups = getMarketSellGroups(categorySelect.value);
  itemSelect.innerHTML = groups.length
    ? groups.map(group=>`<option value="${escapeHtml(group.key)}" data-max="${group.items.length}">${escapeHtml(group.label)} x${group.items.length}</option>`).join("")
    : `<option value="">Brak itemow</option>`;
  const max = Number(itemSelect.selectedOptions?.[0]?.dataset?.max) || 1;
  qtyInput.max = String(max);
  qtyInput.value = "1";
  qtyInput.disabled = categorySelect.value === "pets";
}

function setMarketplaceTab(tab){
  marketplaceTab = tab === "mine" ? "mine" : "offers";
  marketOffersTab?.classList.toggle("active", marketplaceTab === "offers");
  marketMineTab?.classList.toggle("active", marketplaceTab === "mine");
  if(marketOffersView) marketOffersView.style.display = marketplaceTab === "offers" ? "grid" : "none";
  if(marketMineView) marketMineView.style.display = marketplaceTab === "mine" ? "grid" : "none";
  renderMarketplace();
}

async function openMarketplace(){
  if(!isMarketplaceUnlocked()){
    spawnPopup?.("Marketplace od rebirth 2!", false, false, true);
    return;
  }
  if(!currentAccount){
    spawnPopup?.("Marketplace wymaga konta!", false, false, true);
  }
  clearTimeout(marketplaceCloseTimer);
  marketplaceView?.classList.remove("closing");
  marketplaceView?.classList.add("open");
  window.kretAudio?.marketOpen?.();
  updateMarketDiamondText();
  if(location.hash !== "#marketplace") history.pushState(null, "", "#marketplace");
  setMarketplaceTab(marketplaceTab);
  await startMarketplaceStreams();
}

function closeMarketplace(){
  if(marketplaceView?.classList.contains("open")){
    marketplaceView.classList.add("closing");
    marketplaceView.classList.remove("open");
    clearTimeout(marketplaceCloseTimer);
    marketplaceCloseTimer = setTimeout(()=>marketplaceView?.classList.remove("closing"), 240);
    window.kretAudio?.marketClose?.();
  }else{
    marketplaceView?.classList.remove("closing");
  }
  marketBuyModal?.classList.remove("open");
  if(location.hash === "#marketplace") history.pushState(null, "", location.pathname + location.search);
}

async function startMarketplaceStreams(){
  if(!await initFirebase()) return;
  if(!marketplaceOffersUnsub){
    marketplaceOffersUnsub = firebaseModules.onValue(firebaseModules.ref(firebaseDb, "marketplaceOffers"), snapshot=>{
      marketplaceOffers = snapshot.val() || {};
      renderMarketplace();
    });
  }
  if(currentAccount && !marketplacePayoutsUnsub){
    marketplacePayoutsUnsub = firebaseModules.onValue(firebaseModules.ref(firebaseDb, "marketplacePayouts/" + currentAccount.uid), async snapshot=>{
      await claimMarketplacePayouts(snapshot.val() || {});
    });
  }
}

function stopMarketplaceUserStream(){
  if(typeof marketplacePayoutsUnsub === "function"){
    try{ marketplacePayoutsUnsub(); }catch(err){}
  }
  marketplacePayoutsUnsub = null;
}

async function claimMarketplacePayouts(payouts){
  if(!currentAccount || !payouts || !Object.keys(payouts).length) return;
  const entries = Object.entries(payouts).filter(([, payout])=>payout && !payout.claimed && Math.max(0, Number(payout.amount) || 0) > 0);
  if(!entries.length) return;
  const previousIds = pendingMarketSaleAck?.map?.(([id])=>id).join("|") || "";
  pendingMarketSaleAck = entries;
  showMarketplaceSaleModal(entries, previousIds);
}

function showMarketplaceSaleModal(entries, previousIds = ""){
  const nextIds = entries.map(([id])=>id).join("|");
  const total = entries.reduce((sum, [, payout])=>sum + Math.max(0, Number(payout.amount) || 0), 0);
  const first = entries[0]?.[1] || {};
  const more = entries.length > 1 ? ` +${entries.length - 1}` : "";
  if(marketSaleText){
    const template = typeof t === "function"
      ? t("market.soldText")
      : "Sprzedano: {item}{more}. Do odbioru: {amount} diamentow.";
    marketSaleText.textContent = template
      .replace("{item}", first.item || "Item")
      .replace("{more}", more)
      .replace("{amount}", formatDiamond(total));
  }
  const wasOpen = marketSaleModal?.classList.contains("open") && previousIds === nextIds;
  marketSaleModal?.classList.add("open");
  if(!wasOpen) window.kretAudio?.marketSold?.();
}

async function acceptMarketplaceSale(){
  if(!currentAccount || !pendingMarketSaleAck?.length) return marketSaleModal?.classList.remove("open");
  const entries = pendingMarketSaleAck;
  const total = entries.reduce((sum, [, payout])=>sum + Math.max(0, Number(payout.amount) || 0), 0);
  const patch = {};
  entries.forEach(([id])=>{ patch[id] = null; });
  if(total <= 0) return marketSaleModal?.classList.remove("open");
  game.diamonds = (Number(game.diamonds) || 0) + total;
  await firebaseUpdate("marketplacePayouts/" + currentAccount.uid, patch);
  pendingMarketSaleAck = null;
  marketSaleModal?.classList.remove("open");
  updateMarketDiamondText();
  update(true, true);
  requestCloudSave({force:true, reason:"marketplacePayout"});
  spawnPopup?.(`Marketplace +${formatDiamond(total)} diaxow`, false, false, true);
  window.kretAudio?.marketBuy?.();
}

async function createMarketplaceOffer(){
  if(!currentAccount) return setMarketStatus("Zaloguj sie, zeby wystawiac oferty.", true);
  if(getMyMarketOffers().length >= getMarketCapacity()) return setMarketStatus("Nie masz wolnego slotu oferty.", true);
  const category = document.getElementById("marketSellCategory")?.value || "pets";
  const key = document.getElementById("marketSellItem")?.value || "";
  const price = Math.max(1, Math.floor(Number(document.getElementById("marketSellPrice")?.value) || 0));
  const qtyRaw = Math.max(1, Math.floor(Number(document.getElementById("marketSellQty")?.value) || 1));
  if(!key || !price) return setMarketStatus("Wybierz item i cene.", true);
  const groups = getMarketSellGroups(category);
  const group = groups.find(item=>item.key === key);
  if(!group) return setMarketStatus("Tego itemu nie ma juz w EQ.", true);
  const qty = category === "pets" ? 1 : Math.min(qtyRaw, group.items.length);
  const removed = removeMarketItemsFromInventory(category, key, qty);
  if(removed.length !== qty){
    restoreMarketItemsToInventory({category, payload:removed, quantity:removed.length}, removed.length);
    return setMarketStatus("Nie udalo sie zdjac itemu z EQ.", true);
  }
  const offerId = makeMarketOfferId();
  const offer = {
    id:offerId,
    status:"active",
    ownerUid:currentAccount.uid,
    ownerNick:currentAccount.nick || currentAccount.safeNick || "Gracz",
    category,
    key,
    label:group.label,
    icon:group.icon,
    color:group.color,
    unitPrice:price,
    quantity:qty,
    payload:JSON.parse(JSON.stringify(removed)),
    createdAt:Date.now()
  };
  try{
    await firebaseSet("marketplaceOffers/" + offerId, offer);
    update(true, true);
    requestCloudSave({force:true, reason:"marketplaceCreate"});
    setMarketStatus("Oferta wystawiona.");
    window.kretAudio?.marketList?.();
    renderMarketplace();
  }catch(err){
    restoreMarketItemsToInventory(offer, qty);
    update(true, true);
    console.warn("Marketplace offer create failed:", err);
    setMarketStatus("Nie udalo sie wystawic oferty.", true);
  }
}

async function cancelMarketplaceOffer(offerId){
  if(!currentAccount || !offerId) return;
  let canceled = null;
  const tx = await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "marketplaceOffers/" + offerId), offer=>{
    if(!offer || offer.ownerUid !== currentAccount.uid || offer.status !== "active") return offer;
    canceled = offer;
    return null;
  });
  if(!canceled || !tx.committed){
    return setMarketStatus("Nie mozna anulowac tej oferty.", true);
  }
  restoreMarketItemsToInventory(canceled, canceled.quantity || 1);
  update(true, true);
  requestCloudSave({force:true, reason:"marketplaceCancel"});
  setMarketStatus("Oferta anulowana, item wrocil do EQ.");
  renderMarketplace();
}

function openMarketBuyModal(offerId){
  const offer = marketplaceOffers?.[offerId];
  if(!offer || offer.status !== "active") return;
  if(currentAccount && offer.ownerUid === currentAccount.uid) return setMarketStatus("Nie mozesz kupic wlasnej oferty.", true);
  pendingMarketBuyOffer = offer;
  const maxQty = Math.max(1, Number(offer.quantity) || 1);
  if(marketBuyTitle) marketBuyTitle.textContent = offer.label || "Item";
  if(marketBuyInfo) marketBuyInfo.innerHTML = renderMarketOfferCard(offer).replace(/<button[\s\S]*?<\/button>/, "");
  if(marketBuyRange){
    marketBuyRange.min = "1";
    marketBuyRange.max = String(maxQty);
    marketBuyRange.value = "1";
  }
  updateMarketBuyTotal();
  marketBuyModal?.classList.add("open");
}

function updateMarketBuyTotal(){
  const offer = pendingMarketBuyOffer;
  const qty = Math.max(1, Math.floor(Number(marketBuyRange?.value) || 1));
  if(marketBuyQtyText) marketBuyQtyText.textContent = format(qty);
  if(marketBuyTotal) marketBuyTotal.textContent = formatDiamond(qty * Math.max(1, Number(offer?.unitPrice) || 1));
}

async function confirmMarketBuy(){
  const offer = pendingMarketBuyOffer;
  if(!currentAccount || !offer) return setMarketStatus("Zaloguj sie, zeby kupowac.", true);
  if(offer.ownerUid === currentAccount.uid) return setMarketStatus("Nie mozesz kupic wlasnej oferty.", true);
  const qty = Math.max(1, Math.floor(Number(marketBuyRange?.value) || 1));
  const total = qty * Math.max(1, Number(offer.unitPrice) || 1);
  if((Number(game.diamonds) || 0) < total) return setMarketStatus("Za malo diamentow.", true);
  let boughtOffer = null;
  const tx = await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "marketplaceOffers/" + offer.id), current=>{
    if(!current || current.status !== "active" || current.ownerUid === currentAccount.uid) return current;
    if((Number(current.quantity) || 0) < qty) return current;
    boughtOffer = JSON.parse(JSON.stringify(current));
    if((Number(current.quantity) || 0) === qty) return null;
    current.quantity = (Number(current.quantity) || 0) - qty;
    current.payload = Array.isArray(current.payload) ? current.payload.slice(qty) : [];
    return current;
  });
  if(!boughtOffer || !tx.committed) return setMarketStatus("Oferta jest juz nieaktualna.", true);
  game.diamonds = Math.max(0, (Number(game.diamonds) || 0) - total);
  grantMarketItemsToBuyer(boughtOffer, qty);
  const payoutId = `${offer.id}_${currentAccount.uid}_${Date.now()}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  await firebaseSet(`marketplacePayouts/${boughtOffer.ownerUid}/${payoutId}`, {
    amount:total,
    buyerUid:currentAccount.uid,
    buyerNick:currentAccount.nick || currentAccount.safeNick || "Gracz",
    item:boughtOffer.label || "Item",
    quantity:qty,
    createdAt:Date.now()
  });
  update(true, true);
  requestCloudSave({force:true, reason:"marketplaceBuy"});
  marketBuyModal?.classList.remove("open");
  pendingMarketBuyOffer = null;
  setMarketStatus("Kupiono oferte.");
  updateMarketDiamondText();
  window.kretAudio?.marketBuy?.();
  renderMarketplace();
}

async function buyMarketSlot(slotNumber){
  const target = Math.max(2, Math.min(5, Math.floor(Number(slotNumber) || 2)));
  if(target !== getMarketCapacity() + 1) return;
  const cost = MARKET_SLOT_COSTS[target - 1] || 0;
  if((Number(game.diamonds) || 0) < cost) return setMarketStatus("Za malo diamentow na slot.", true);
  game.diamonds -= cost;
  game.marketSlots = target;
  update(true, true);
  requestCloudSave({force:true, reason:"marketplaceSlot"});
  setMarketStatus(`Odblokowano slot ${target}.`);
  updateMarketDiamondText();
  window.kretAudio?.marketBuy?.();
  renderMarketplace();
}

marketplaceDockBtn?.addEventListener("click", openMarketplace);
marketBackBtn?.addEventListener("click", closeMarketplace);
marketRefreshBtn?.addEventListener("click", async()=>{ await startMarketplaceStreams(); renderMarketplace(); setMarketStatus("Odswiezono."); });
marketOffersTab?.addEventListener("click", ()=>setMarketplaceTab("offers"));
marketMineTab?.addEventListener("click", ()=>setMarketplaceTab("mine"));
marketMineView?.addEventListener("change", event=>{
  if(event.target?.id === "marketSellCategory") refreshMarketSellItems();
  if(event.target?.id === "marketSellItem"){
    const qtyInput = document.getElementById("marketSellQty");
    const max = Number(event.target.selectedOptions?.[0]?.dataset?.max) || 1;
    if(qtyInput){
      qtyInput.max = String(max);
      qtyInput.value = "1";
    }
  }
});
marketMineView?.addEventListener("click", event=>{
  const create = event.target instanceof Element ? event.target.closest("#marketCreateOfferBtn") : null;
  const cancel = event.target instanceof Element ? event.target.closest("[data-market-cancel]") : null;
  const slot = event.target instanceof Element ? event.target.closest("[data-market-slot]") : null;
  if(create) createMarketplaceOffer();
  if(cancel) cancelMarketplaceOffer(cancel.dataset.marketCancel);
  if(slot) buyMarketSlot(slot.dataset.marketSlot);
});
marketOffersView?.addEventListener("click", event=>{
  const buy = event.target instanceof Element ? event.target.closest("[data-market-buy]") : null;
  if(buy) openMarketBuyModal(buy.dataset.marketBuy);
});
marketBuyRange?.addEventListener("input", updateMarketBuyTotal);
marketBuyClose?.addEventListener("click", ()=>marketBuyModal?.classList.remove("open"));
marketBuyCancel?.addEventListener("click", ()=>marketBuyModal?.classList.remove("open"));
marketBuyConfirm?.addEventListener("click", confirmMarketBuy);
marketSaleOk?.addEventListener("click", acceptMarketplaceSale);
window.addEventListener("hashchange", ()=>{
  if(location.hash === "#marketplace") openMarketplace();
  else closeMarketplace();
});
if(location.hash === "#marketplace") setTimeout(openMarketplace, 0);
setInterval(()=>marketplaceDockBtn?.classList.toggle("locked", !isMarketplaceUnlocked()), 1000);

const globalEventMeta = {
  luck:{name:"Luck Boost", icon:"🍀", mode:"multiplier", color:"linear-gradient(135deg,#62ff9a,#19c7ff,#ffe86b)"},
  money:{name:"Money Boost", icon:"💰", mode:"multiplier", color:"linear-gradient(135deg,#ffe96b,#ff9c35,#ff4f8f)"},
  diamonds:{name:"Diamonds Boost", icon:"💎", mode:"multiplier", color:"linear-gradient(135deg,#9ff8ff,#3b8cff,#a875ff)"},
  petXp:{name:"Pet XP Boost", icon:"XP", mode:"percent", color:"linear-gradient(135deg,#ffffff,#bde8ff,#77bfff)"},
  goldPetChance:{name:"Gold Pet Chance", icon:"⭐", mode:"chance", color:"linear-gradient(135deg,#fff2a0,#ffc233,#ff7a35)"},
  shinyPetChance:{name:"Shiny Pet Chance", icon:"✨", mode:"chance", color:"linear-gradient(135deg,#fff,#ff8df4,#62e8ff)"},
  rainbowPetChance:{name:"Rainbow Pet Chance", icon:"🌈", mode:"chance", color:"linear-gradient(135deg,#ff4f6d,#ffd24d,#5cff9d,#56c7ff,#a36bff)"},
  communityMoleDamage:{name:"DMG Globalnego Kreta", icon:"🔨", mode:"multiplier", color:"linear-gradient(135deg,#ff685c,#ffbf48,#7b4dff)"},
  globalMessage:{name:"Global Message", icon:"📢", mode:"message", color:"linear-gradient(135deg,#5ccfff,#7b61ff,#ff6fd8)"}
};

let globalEventsData = {};
let globalEventsUnsub = null;
let globalEventsClock = null;
let lastGlobalEventStartedAt = +(localStorage.getItem("kretLastGlobalEventStartedAt") || 0);
window.__kretGlobalEvents = {};

function getActiveGlobalEventsList(){
  const now = Date.now();
  return Object.values(globalEventsData || {})
    .filter(event => event && (!event.endsAt || event.endsAt > now))
    .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
}

function formatGlobalEventValue(event){
  if(!event) return "";
  if(event.mode === "message") return "";
  if(event.mode === "chance"){
    return "+" + ((Number(event.value) || 0) * 100).toFixed((Number(event.value) || 0) < 0.01 ? 2 : 1) + "%";
  }
  if(event.mode === "percent"){
    return "+" + Math.max(0, ((Number(event.value) || 1) - 1) * 100).toFixed(0) + "%";
  }
  return "x" + (Number(event.value) || 1).toFixed((Number(event.value) || 1) % 1 ? 1 : 0);
}

function formatGlobalEventTime(ms){
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if(minutes >= 60){
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours + "h " + String(rest).padStart(2, "0") + "m";
  }
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function renderActiveBoostPanel(){
  if(!activeBoostPanel) return;
  const active = getActiveGlobalEventsList();
  window.__kretGlobalEvents = Object.fromEntries(active.map(event => [event.type, event]));
  if(!active.length){
    activeBoostPanel.innerHTML = "";
    return;
  }
  const now = Date.now();
  activeBoostPanel.innerHTML = active.map(event => {
    const meta = globalEventMeta[event.type] || {};
    const timeLeft = formatGlobalEventTime((event.endsAt || now) - now);
    const isMessage = event.mode === "message";
    const valueText = formatGlobalEventValue(event);
    const title = isMessage ? (event.message || "Wiadomosc globalna") : (event.name || meta.name || "Global Boost");
    return `
      <div class="boostChip" style="background:${event.color || meta.color || ""}">
      <div class="boostIcon">${event.icon || meta.icon || "⚡"}</div>
      <div class="boostInfo">
        <b>${escapeHtml(title)}</b>
        <span class="boostMeta">
          ${valueText ? `<span class="boostValue">${valueText}</span>` : ""}
          <span class="boostTime" data-boost-id="${escapeHtml(event.type || event.id || "")}">${timeLeft}</span>
        </span>
      </div>
    </div>
  `;
  }).join("");
}

function updateActiveBoostTimers(){
  const active = getActiveGlobalEventsList();
  if(!active.length){
    if(activeBoostPanel) activeBoostPanel.innerHTML = "";
    return;
  }
  active.forEach(event => {
    const boostId = String(event.type || event.id || "");
    const node = Array.from(activeBoostPanel?.querySelectorAll(".boostTime") || [])
      .find(item => item.dataset.boostId === boostId);
    if(node){
      node.textContent = formatGlobalEventTime((event.endsAt || Date.now()) - Date.now());
    }
  });
}

function showGlobalEventBanner(event){
  if(!globalEventBanner || !event) return;
  globalEventBanner.classList.remove("show");
  void globalEventBanner.offsetWidth;
  globalEventBanner.innerHTML = `${event.icon || "⚡"} ${event.message || event.name || "GLOBAL EVENT"} <span>${formatGlobalEventValue(event)} przez ${formatGlobalEventTime((event.endsAt || Date.now()) - Date.now())}</span>`;
  globalEventBanner.classList.add("show");
}

async function startGlobalEventsLive(){
  if(!await initFirebase()) return;
  if(globalEventsUnsub) return;
  globalEventsUnsub = firebaseModules.onValue(firebaseModules.ref(firebaseDb, "globalEvents"), (snapshot) => {
    globalEventsData = snapshot.exists() ? snapshot.val() : {};
    const active = getActiveGlobalEventsList();
    window.__kretGlobalEvents = Object.fromEntries(active.map(event => [event.type, event]));
    const newest = active.reduce((best, event) => (event.startedAt || 0) > (best?.startedAt || 0) ? event : best, null);
    if(newest && (newest.startedAt || 0) > lastGlobalEventStartedAt){
      lastGlobalEventStartedAt = newest.startedAt || Date.now();
      localStorage.setItem("kretLastGlobalEventStartedAt", String(lastGlobalEventStartedAt));
      showGlobalEventBanner(newest);
    }
    renderActiveBoostPanel();
    if(typeof update === "function"){
      update(false, false);
    }
  }, (err) => {
    console.warn("Global events live error:", err);
  });
  if(!globalEventsClock){
    globalEventsClock = setInterval(() => {
      updateActiveBoostTimers();
    }, 1000);
  }
}

async function startGlobalWeatherLive(){
  if(globalWeatherUnsub || !await initFirebase()) return;
  globalWeatherUnsub = firebaseModules.onValue(firebaseModules.ref(firebaseDb, "globalWeather"), (snapshot) => {
    window.__kretGlobalWeather = snapshot.exists() ? snapshot.val() : null;
    if(typeof syncWeatherSystem === "function") syncWeatherSystem();
    if(typeof renderWeatherPanel === "function") renderWeatherPanel();
    if(typeof update === "function") update(false, false);
  }, (err) => console.warn("Global weather live error:", err));
}

async function saveGlobalWeather(payload){
  if(!assertAdminUnlocked()) return false;
  if(!await initFirebase()) return false;
  await firebaseSet("globalWeather", Object.assign({}, payload, {
    updatedAt:Date.now(),
    updatedBy:currentAccount?.nick || "Panda"
  }));
  return true;
}

window.adminSetGlobalWeatherNow = async function(weatherId, durationMs, mega=false){
  const now = Date.now();
  return saveGlobalWeather({
    manual:{
      id:weatherId,
      mega:!!mega,
      slotStart:now,
      startsAt:now,
      endsAt:now + Math.max(60000, Number(durationMs) || 5 * 60 * 1000),
      admin:true
    }
  });
};

window.adminPlanGlobalWeatherNext = async function(weatherId, slotStart, mega=false){
  const current = window.__kretGlobalWeather || {};
  const planned = Object.assign({}, current.planned || {});
  planned[String(slotStart)] = {id:weatherId, mega:!!mega, plannedAt:Date.now()};
  return saveGlobalWeather(Object.assign({}, current, {planned}));
};

window.adminClearGlobalWeather = async function(){
  return saveGlobalWeather({manual:null, planned:{}});
};

let pendingAdminBoost = null;

function setAdminAbuseMessage(text, isError=false){
  if(adminAbuseMessage){
    adminAbuseMessage.textContent = text || "";
    adminAbuseMessage.classList.toggle("error", !!isError);
  }
  if(adminBoostModalStatus){
    adminBoostModalStatus.textContent = text || "";
    adminBoostModalStatus.classList.toggle("error", !!isError);
  }
}

function setAdminBoostModalMode(mode){
  const isGive = mode === "giveItem";
  const isMessage = mode === "message";
  const isEvents = mode === "events";
  const isPetChance = mode === "petChance";
  const showValue = isEvents || (!isGive && !isMessage && mode !== "mega");
  const giveType = adminGiveType?.value || "coins";
  const showDuration = !isGive || giveType === "boost";
  adminEventTypeLabel?.classList.toggle("adminBoostHidden", !isEvents);
  adminEventType?.classList.toggle("adminBoostHidden", !isEvents);
  adminBoostValueLabel?.classList.toggle("adminBoostHidden", !showValue);
  adminBoostModalValue?.classList.toggle("adminBoostHidden", !showValue);
  adminBoostTypeLabel?.classList.toggle("adminBoostHidden", !(isPetChance || (isEvents && adminEventType?.value === "petChance")));
  adminBoostType?.classList.toggle("adminBoostHidden", !(isPetChance || (isEvents && adminEventType?.value === "petChance")));
  adminGiveFields?.classList.toggle("open", isGive);
  adminBoostDurationLabel?.classList.toggle("adminBoostHidden", !showDuration);
  adminBoostModalDuration?.classList.toggle("adminBoostHidden", !showDuration);
  adminBoostModalCustomDuration?.classList.toggle("adminBoostHidden", !showDuration);
  adminBoostMessageLabel?.classList.toggle("adminBoostHidden", isGive);
  adminBoostModalMessage?.classList.toggle("adminBoostHidden", isGive);
  if(adminBoostModalConfirm){
    adminBoostModalConfirm.textContent = isGive ? "Wykonaj akcje" : isMessage ? "Wyslij wiadomosc" : isEvents ? "Uruchom event" : "Odpal boost";
  }
}

function getAdminDurationMs(){
  const modalMinutes = Number(adminBoostModalDuration?.value || 0);
  const legacyMinutes = Number(adminBoostModalCustomDuration?.value || 0);
  const panelMinutes = Number(document.getElementById("adminCustomDuration")?.value || 0);
  return Math.max(1, modalMinutes || legacyMinutes || panelMinutes || 5) * 60 * 1000;
}

function getAdminBoostValue(type, fallbackValue){
  const mode = globalEventMeta[type]?.mode || "multiplier";
  const modalRaw = Number(adminBoostModalValue?.value || 0);
  const panelRaw = Number(document.getElementById("adminCustomValue")?.value || 0);
  const raw = modalRaw || panelRaw || Number(fallbackValue) || (mode === "chance" ? 1 : 2);
  if(mode === "chance") return raw / 100;
  if(mode === "percent") return 1 + raw / 100;
  return raw;
}

function getAdminEventValue(eventType){
  const raw = Number(adminBoostModalValue?.value || 0);
  if(eventType === "petChance") return Math.max(0, raw || 50) / 100;
  if(globalEventMeta[eventType]?.mode === "percent") return 1 + Math.max(0, raw || 50) / 100;
  return Math.max(1, raw || 2);
}

function getAdminPetVariantOptions(value){
  return {
    normal:{variant:"normal", shiny:false},
    gold:{variant:"gold", shiny:false},
    diamond:{variant:"diamond", shiny:false},
    shiny:{variant:"normal", shiny:true},
    shinyGold:{variant:"gold", shiny:true},
    shinyDiamond:{variant:"diamond", shiny:true}
  }[value] || {variant:"normal", shiny:false};
}

function getAdminPetCatalog(){
  if(typeof eggCatalog === "undefined") return [];
  const seen = new Set();
  const items = [];
  eggCatalog.forEach(egg => {
    (egg.pets || []).forEach(pet => {
      const key = `${egg.id}:${pet.id}`;
      if(seen.has(key)) return;
      seen.add(key);
      items.push({key, egg, pet});
    });
  });
  return items;
}

function getAdminSkinCatalog(){
  if(typeof crateCatalog === "undefined") return [];
  const seen = new Set();
  const items = [];
  crateCatalog.forEach(crate => {
    (crate.skins || []).forEach(skin => {
      const key = `${crate.id}:${skin.id}`;
      if(seen.has(key)) return;
      seen.add(key);
      items.push({key, crate, skin});
    });
  });
  return items;
}

function refreshAdminItemSelectors(){
  if(adminGivePetSelect){
    const current = adminGivePetSelect.value;
    const items = getAdminPetCatalog();
    adminGivePetSelect.innerHTML = items.map(item => `
      <option value="${escapeHtml(item.key)}">${escapeHtml(item.pet.name)} | ${escapeHtml(item.egg.name)} | ${escapeHtml(item.pet.rarity || "")}</option>
    `).join("");
    if(current && items.some(item => item.key === current)) adminGivePetSelect.value = current;
  }
  if(adminGiveSkinSelect){
    const current = adminGiveSkinSelect.value;
    const items = getAdminSkinCatalog();
    adminGiveSkinSelect.innerHTML = items.map(item => `
      <option value="${escapeHtml(item.key)}">${escapeHtml(item.skin.name)} | ${escapeHtml(item.crate.name)} | ${escapeHtml(item.skin.rarity || "")}</option>
    `).join("");
    if(current && items.some(item => item.key === current)) adminGiveSkinSelect.value = current;
  }
  if(adminGivePotionSelect){
    const current = adminGivePotionSelect.value;
    const items = getAdminPotionCatalog();
    adminGivePotionSelect.innerHTML = items.map(item => `
      <option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>
    `).join("");
    if(current && items.some(item => item.key === current)) adminGivePotionSelect.value = current;
  }
  if(adminGiveBagSelect){
    const current = adminGiveBagSelect.value;
    const items = getAdminBagCatalog();
    adminGiveBagSelect.innerHTML = items.map(item => `
      <option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>
    `).join("");
    if(current && items.some(item => item.key === current)) adminGiveBagSelect.value = current;
  }
  if(adminGiveEnchantSelect){
    const current = adminGiveEnchantSelect.value;
    const items = getAdminEnchantCatalog();
    adminGiveEnchantSelect.innerHTML = items.map(item => `
      <option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>
    `).join("");
    if(current && items.some(item => item.key === current)) adminGiveEnchantSelect.value = current;
  }
  if(adminGiveEggSelect){
    const current = adminGiveEggSelect.value;
    const items = getAdminEggCatalog();
    adminGiveEggSelect.innerHTML = items.map(item => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("");
    if(current && items.some(item => item.key === current)) adminGiveEggSelect.value = current;
  }
  renderAdminItemPreviews();
}

function renderAdminItemPreviews(){
  if(adminGivePetPreview){
    const item = getAdminPetCatalog().find(entry => entry.key === adminGivePetSelect?.value);
    const variant = adminGivePetVariant?.value || "normal";
    const variantInfo = getAdminPetVariantOptions(variant);
    let visual = item?.pet ? item.pet.color || "#7a4b3f" : "#7a4b3f";
    if(variantInfo.variant === "gold") visual = "linear-gradient(135deg,#fff0a8,#ffbf38,#b87812)";
    if(variantInfo.variant === "diamond") visual = "linear-gradient(135deg,#d7fbff,#58d9ff,#3177ff)";
    if(variantInfo.shiny) visual = `radial-gradient(circle at 28% 20%, #fff, transparent 24%), ${visual}`;
    adminGivePetPreview.innerHTML = item ? `
      <div class="adminItemOrb" style="background:${visual}"><span>${item.pet.icon || ""}</span></div>
      <div><b>${escapeHtml(item.pet.name)}</b><small>${escapeHtml(item.egg.name)} | ${escapeHtml(variant)}</small></div>
    ` : "";
  }
  if(adminGiveSkinPreview){
    const item = getAdminSkinCatalog().find(entry => entry.key === adminGiveSkinSelect?.value);
    adminGiveSkinPreview.innerHTML = item ? `
      <div class="adminItemOrb ${escapeHtml(item.skin.skinClass || "")}" style="background:linear-gradient(135deg,${item.skin.accent || "#8bd3ff"},#fff)"><span></span></div>
      <div><b>${escapeHtml(item.skin.name)}</b><small>${escapeHtml(item.crate.name)} | ${escapeHtml(item.skin.rarity || "")}</small></div>
    ` : "";
  }
}

function assertAdminUnlocked(){
  if(isCurrentAdmin()) return true;
  updateAdminVisibility();
  alert("Admin panel jest dostepny tylko dla konta Panda.");
  return false;
}

function updateAdminGiveFields(){
  const targetAll = adminGiveTarget?.value === "all";
  const type = adminGiveType?.value || "coins";
  const isBoost = type === "boost";
  const isReset = type === "resetGame" || type === "resetLeaderboard" || type === "clearInventory" || type === "clearEvents";
  const isPet = type === "pet";
  const isSkin = type === "skin";
  const isPotion = type === "potion";
  const isBag = type === "bag";
  const isEnchant = type === "enchant";
  const isEgg = type === "egg";
  adminGiveTarget?.classList.toggle("adminGiveHidden", type === "clearEvents");
  document.querySelector("label[for='adminGiveTarget']")?.classList.toggle("adminGiveHidden", type === "clearEvents");
  adminGiveNickLabel?.classList.toggle("adminGiveHidden", targetAll || type === "clearEvents");
  adminGiveNick?.classList.toggle("adminGiveHidden", targetAll || type === "clearEvents");
  adminGiveBoostTypeLabel?.classList.toggle("adminGiveHidden", !isBoost);
  adminGiveBoostType?.classList.toggle("adminGiveHidden", !isBoost);
  adminGivePetLabel?.classList.toggle("adminGiveHidden", !isPet);
  adminGivePetSelect?.classList.toggle("adminGiveHidden", !isPet);
  adminGivePetVariantLabel?.classList.toggle("adminGiveHidden", !isPet);
  adminGivePetVariant?.classList.toggle("adminGiveHidden", !isPet);
  adminGiveSkinLabel?.classList.toggle("adminGiveHidden", !isSkin);
  adminGiveSkinSelect?.classList.toggle("adminGiveHidden", !isSkin);
  adminGivePotionLabel?.classList.toggle("adminGiveHidden", !isPotion);
  adminGivePotionSelect?.classList.toggle("adminGiveHidden", !isPotion);
  adminGiveBagLabel?.classList.toggle("adminGiveHidden", !isBag);
  adminGiveBagSelect?.classList.toggle("adminGiveHidden", !isBag);
  adminGiveEnchantLabel?.classList.toggle("adminGiveHidden", !isEnchant);
  adminGiveEnchantSelect?.classList.toggle("adminGiveHidden", !isEnchant);
  adminGiveEggLabel?.classList.toggle("adminGiveHidden", !isEgg);
  adminGiveEggSelect?.classList.toggle("adminGiveHidden", !isEgg);
  adminGivePetPreview?.classList.toggle("adminGiveHidden", !isPet);
  adminGiveSkinPreview?.classList.toggle("adminGiveHidden", !isSkin);
  adminGiveValue?.classList.toggle("adminGiveHidden", isReset || isPet || isSkin);
  const valueLabel = document.querySelector("label[for='adminGiveValue']");
  valueLabel?.classList.toggle("adminGiveHidden", isReset || isPet || isSkin);
  if(pendingAdminBoost?.type === "giveItem"){
    setAdminBoostModalMode("giveItem");
  }
  refreshAdminItemSelectors();
  if(adminGiveValue){
    const placeholders = {
      coins:"Ile monet, np. 1000000",
      diamonds:"Ile diamentow, np. 250",
      pet:"Wybierz peta z listy ponizej",
      skin:"Wybierz skina z listy ponizej",
      potion:"Ilosc mikstur, np. 3",
      bag:"Ilosc sakiewek, np. 3",
      enchant:"Ilosc enchantow, np. 3",
      egg:"Ilosc jajek, np. 3",
      boost:"Mnoznik albo procent boosta, np. 2 albo 50",
      resetGame:"Reset nie wymaga wartosci",
      resetLeaderboard:"Reset topki nie wymaga wartosci",
      clearInventory:"Czyszczenie inventory nie wymaga wartosci",
      clearEvents:"Czyszczenie eventow nie wymaga wartosci"
    };
    adminGiveValue.placeholder = placeholders[type] || "Wartosc / item";
  }
}

function buildGlobalEvent(type, value, durationMs, message){
  const meta = globalEventMeta[type] || {};
  const now = Date.now();
  return {
    id:type,
    type,
    name:meta.name || type,
    icon:meta.icon || "⚡",
    mode:meta.mode || "multiplier",
    value,
    startedAt:now,
    durationMs,
    endsAt:now + durationMs,
    message:message || "",
    color:meta.color || ""
  };
}

function openAdminBoostPopup(type, value, presetGiveType){
  if(!assertAdminUnlocked()) return false;
  const isMega = type === "mega";
  const isPetChance = type === "petChance";
  const isMessage = type === "message";
  const isGive = type === "giveItem";
  const meta = isMega
    ? {name:"Mega Event", mode:"multiplier", icon:"🎊"}
    : isPetChance
      ? {name:"Pet Chance Boost", mode:"chance", icon:"🐾"}
      : isGive
        ? {name:"Give Player Item", mode:"gift", icon:"🎁"}
        : (globalEventMeta[type] || {});
  pendingAdminBoost = {type, value};
  setAdminBoostModalMode(type);
  setAdminAbuseMessage("");
  if(adminBoostModalTitle){
    adminBoostModalTitle.textContent = `${meta.icon || "⚡"} ${meta.name || "Global Boost"}`;
  }
  if(isGive && adminBoostModalTitle){
    adminBoostModalTitle.textContent = "Akcje na gracza";
  }
  if(isMessage && adminBoostModalTitle){
    adminBoostModalTitle.textContent = "Wiadomosc globalna";
  }
  if(adminBoostValueLabel){
    adminBoostValueLabel.textContent = meta.mode === "chance"
      ? "Boost szansy w % bazowej szansy"
      : "Mnoznik";
  }
  if(adminBoostModalValue){
    const defaultValue = meta.mode === "chance"
      ? (isPetChance ? Number(value) || 1 : (Number(value) || 0) * 100)
      : Number(value) || 2;
    adminBoostModalValue.disabled = isMega;
    adminBoostModalValue.value = isMega || isMessage || isGive ? "" : defaultValue;
    adminBoostModalValue.placeholder = meta.mode === "chance" ? "Boost procentowy, np. 50 = +50% bazowej szansy" : "Mnoznik, np. 2";
  }
  if(adminBoostType){
    adminBoostType.value = "goldPetChance";
  }
  if(adminBoostModalDuration){
    adminBoostModalDuration.value = "5";
  }
  if(adminBoostModalCustomDuration){
    adminBoostModalCustomDuration.value = "";
  }
  if(adminBoostModalMessage){
    adminBoostModalMessage.value = "";
    adminBoostModalMessage.placeholder = isMessage ? "Wiadomosc globalna dla wszystkich" : "Opcjonalna wiadomosc dla wszystkich";
  }
  if(adminGiveTarget) adminGiveTarget.value = "player";
  if(adminGiveNick) adminGiveNick.value = "";
  if(adminGiveType) adminGiveType.value = presetGiveType || "coins";
  if(adminGiveBoostType) adminGiveBoostType.value = "money";
  if(adminGiveValue) adminGiveValue.value = "";
  updateAdminGiveFields();
  adminGiveType?.dispatchEvent(new Event("change"));
  if(isMessage && adminBoostModalDuration) adminBoostModalDuration.value = "5";
  adminBoostModal?.classList.add("open");
  return true;
}

function openAdminEventsPopup(){
  if(!assertAdminUnlocked()) return false;
  pendingAdminBoost = {type:"events", value:2};
  setAdminBoostModalMode("events");
  setAdminAbuseMessage("");
  if(adminBoostModalTitle) adminBoostModalTitle.textContent = "Eventy";
  if(adminEventType) adminEventType.value = "luck";
  if(adminBoostModalValue){
    adminBoostModalValue.disabled = false;
    adminBoostModalValue.value = "2";
    adminBoostModalValue.placeholder = "Mnoznik, np. 2 albo dla szans 50";
  }
  if(adminBoostValueLabel) adminBoostValueLabel.textContent = "Moc eventu / mnoznik / procent";
  if(adminBoostModalDuration) adminBoostModalDuration.value = "5";
  if(adminBoostModalMessage) adminBoostModalMessage.value = "";
  setAdminBoostModalMode("events");
  adminBoostModal?.classList.add("open");
  return true;
}

function closeAdminBoostPopup(){
  pendingAdminBoost = null;
  adminBoostModal?.classList.remove("open");
}

async function launchAdminBoost(type, value){
  if(!await initFirebase()) return;
  const eventType = type === "petChance" ? (adminBoostType?.value || "goldPetChance") : type;
  const durationMs = getAdminDurationMs();
  const boostValue = getAdminBoostValue(eventType, value);
  const eventMessage = adminBoostModalMessage?.value.trim() || document.getElementById("adminEventMessage")?.value.trim();
  const event = buildGlobalEvent(eventType, boostValue, durationMs, eventMessage);
  await firebaseSet("globalEvents/" + eventType, event);
  spawnPopup(`${event.name}: ${formatGlobalEventValue(event)} | ${formatGlobalEventTime(durationMs)}`, false, false, true);
  setAdminAbuseMessage(`${event.name} odpalony: ${formatGlobalEventValue(event)} na ${formatGlobalEventTime(durationMs)}`);
  showGlobalEventBanner(event);
}

async function launchAdminEventFromModal(){
  if(!await initFirebase()) return;
  const selected = adminEventType?.value || "luck";
  const durationMs = getAdminDurationMs();
  const message = adminBoostModalMessage?.value.trim() || "";
  if(selected === "mega"){
    const mult = Math.max(1, Number(adminBoostModalValue?.value || 2));
    const chance = Math.max(0, (mult - 1) * 100) / 100;
    const patch = {};
    ["luck","money","diamonds","communityMoleDamage"].forEach(type => {
      patch[type] = buildGlobalEvent(type, mult, durationMs, message);
    });
    patch.goldPetChance = buildGlobalEvent("goldPetChance", chance, durationMs, message);
    patch.shinyPetChance = buildGlobalEvent("shinyPetChance", chance, durationMs, message);
    patch.rainbowPetChance = buildGlobalEvent("rainbowPetChance", chance, durationMs, message);
    await firebaseUpdate("globalEvents", patch);
    setAdminAbuseMessage(`Mega Event uruchomiony na ${formatGlobalEventTime(durationMs)}.`);
    showGlobalEventBanner(Object.assign({}, patch.money, {name:"Mega Event", icon:"🎉", message:message || "MEGA EVENT"}));
    return;
  }
  const eventType = selected === "petChance" ? (adminBoostType?.value || "goldPetChance") : selected;
  const event = buildGlobalEvent(eventType, getAdminEventValue(selected), durationMs, message);
  await firebaseSet("globalEvents/" + eventType, event);
  setAdminAbuseMessage(`Akcja wykonana: ${event.name} ${formatGlobalEventValue(event)}.`);
  showGlobalEventBanner(event);
}

async function launchGlobalMessage(){
  if(!await initFirebase()) return;
  const durationMs = getAdminDurationMs();
  const message = adminBoostModalMessage?.value.trim();
  if(!message){
    setAdminAbuseMessage("Wpisz wiadomosc globalna.", true);
    throw new Error("Missing global message");
  }
  const event = buildGlobalEvent("globalMessage", 1, durationMs, message);
  await firebaseSet("globalEvents/globalMessage", event);
  spawnPopup("Wiadomosc globalna wyslana", false, false, true);
  setAdminAbuseMessage("Wiadomosc globalna wyslana.");
  showGlobalEventBanner(event);
}

async function launchMegaEvent(){
  if(!await initFirebase()) return;
  const durationMs = getAdminDurationMs();
  const mult = Math.max(1, Number(adminBoostModalValue?.value || 2));
  const chance = Math.max(0, (mult - 1) * 100) / 100;
  const message = adminBoostModalMessage?.value.trim() || document.getElementById("adminEventMessage")?.value.trim() || "MEGA EVENT WYSTARTOWAL!";
  const bundle = [
    buildGlobalEvent("luck", mult, durationMs, message),
    buildGlobalEvent("money", mult, durationMs, message),
    buildGlobalEvent("diamonds", mult, durationMs, message),
    buildGlobalEvent("goldPetChance", chance, durationMs, message),
    buildGlobalEvent("shinyPetChance", chance, durationMs, message),
    buildGlobalEvent("rainbowPetChance", chance, durationMs, message),
    buildGlobalEvent("communityMoleDamage", mult, durationMs, message)
  ];
  const patch = {};
  bundle.forEach(event => patch[event.type] = event);
  await firebaseUpdate("globalEvents", patch);
  spawnPopup(`MEGA EVENT | ${formatGlobalEventTime(durationMs)}`, false, false, true);
  setAdminAbuseMessage(`MEGA EVENT odpalony na ${formatGlobalEventTime(durationMs)}`);
  showGlobalEventBanner(Object.assign({}, bundle[0], {name:"Mega Event", icon:"🌋", message}));
};

function getAdminCodeReward(){
  const type = adminCodeRewardType?.value || "diamonds";
  const amount = Math.max(1, Math.floor(Number(adminCodeAmount?.value) || 1));
  if(type === "potion"){
    return {type, potionType:adminCodePotionType?.value || "luck", tier:Math.max(1, Math.min(3, Number(adminCodePotionTier?.value) || 1)), amount};
  }
  if(type === "bag"){
    return {type, bag:adminCodeBagType?.value || "weak", amount};
  }
  return {type, amount};
}

function formatAdminCodeReward(reward){
  if(!reward) return "";
  if(reward.type === "potion") return `${reward.amount}x potka ${reward.potionType} T${reward.tier}`;
  if(reward.type === "bag") return `${reward.amount}x bag ${reward.bag}`;
  if(reward.type === "diamonds") return `${reward.amount} diamentow`;
  if(reward.type === "coins") return `${reward.amount}x monety wg mocy klikniecia`;
  return reward.type;
}

async function renderAdminCodesPanel(){
  if(!adminCodesList || !isCurrentAdmin() || !await initFirebase()) return;
  const codes = await firebaseGet("rewardCodes") || {};
  const uses = await firebaseGet("rewardCodeUses") || {};
  const entries = Object.entries(codes).sort(([a],[b])=>a.localeCompare(b));
  adminCodesList.innerHTML = entries.length ? entries.map(([code, data])=>{
    const rewards = Array.isArray(data?.rewards) ? data.rewards : [];
    const expires = Number(data?.expiresAt) ? new Date(Number(data.expiresAt)).toLocaleString("pl-PL") : "bez daty";
    const maxUses = Number(data?.maxUses) || 0;
    return `
      <div class="adminCodeCard">
        <div>
          <b>${escapeHtml(code)}</b>
          <small>${escapeHtml(rewards.map(formatAdminCodeReward).join(", ") || "brak nagrod")}</small>
          <small>Uzycia: ${Number(uses?.[code]) || 0}${maxUses ? `/${maxUses}` : " / bez limitu"} | wazny do: ${escapeHtml(expires)}</small>
        </div>
        <button type="button" onclick="adminDeleteRewardCode('${escapeHtml(code)}')">Usun</button>
      </div>
    `;
  }).join("") : `<div class="adminCodeCard"><div><b>Brak kodow admina</b><small>Domyslne testowe kody dalej dzialaja lokalnie.</small></div></div>`;
}

window.adminDeleteRewardCode = async function(code){
  if(!assertAdminUnlocked() || !await initFirebase()) return;
  await firebaseSet("rewardCodes/" + String(code || "").toUpperCase().replace(/[^A-Z0-9_-]/g, ""), null);
  setAdminAbuseMessage("Kod usuniety.");
  await renderAdminCodesPanel();
};

async function saveAdminRewardCode(){
  if(!assertAdminUnlocked() || !await initFirebase()) return;
  const code = String(adminCodeName?.value || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if(!code){
    if(adminCodesStatus) adminCodesStatus.textContent = "Wpisz kod.";
    return;
  }
  const expiresAt = adminCodeExpiresAt?.value ? new Date(adminCodeExpiresAt.value).getTime() : 0;
  const data = {
    code,
    active:true,
    rewards:[getAdminCodeReward()],
    maxUses:Math.max(0, Math.floor(Number(adminCodeMaxUses?.value) || 0)),
    expiresAt:Number.isFinite(expiresAt) ? expiresAt : 0,
    createdAt:Date.now(),
    createdBy:currentAccount?.nick || "Panda"
  };
  await firebaseSet("rewardCodes/" + code, data);
  if(adminCodesStatus) adminCodesStatus.textContent = "Kod zapisany.";
  setAdminAbuseMessage("Kod zapisany.");
  await renderAdminCodesPanel();
}

function getLeaderboardStatsFromSave(save){
  const source = save && typeof save === "object" ? save : {};
  const savedStats = source.leaderboardStats && typeof source.leaderboardStats === "object" ? source.leaderboardStats : {};
  return {
    coins:Math.floor(Math.max(Number(savedStats.totalCoinsEarned) || 0, Number(source.score) || 0)),
    clicks:Math.floor(Number(source.clicks) || 0),
    moneyPerSecond:0,
    diamonds:Math.floor(Math.max(Number(savedStats.bestDiamonds) || 0, Number(source.diamonds) || 0)),
    openedEggs:Math.floor(Number(source.openedEggs) || 0),
    streak:Math.floor(Math.max(Number(source.dailyStreak?.best) || 0, Number(source.dailyStreak?.count) || 0))
  };
}

function applyLeaderboardBaseline(stats, baseline){
  const base = baseline && typeof baseline === "object" ? baseline : {};
  const adjusted = {};
  leaderboardCategories.forEach(category => {
    const stat = category.stat;
    adjusted[stat] = Math.max(0, Math.floor((Number(stats?.[stat]) || 0) - (Number(base?.[stat]) || 0)));
  });
  return adjusted;
}

async function setLeaderboardResetBaseline(uid, allLeaderboards, mode="current"){
  const resetAt = Date.now();
  let baseline;
  if(mode === "zero"){
    baseline = {
      coins:0,
      clicks:0,
      moneyPerSecond:0,
      diamonds:0,
      openedEggs:0,
      streak:0,
      resetAt
    };
  }else{
    const save = await firebaseGet("users/" + uid) || {};
    const saveStats = getLeaderboardStatsFromSave(save);
    baseline = {resetAt};
    leaderboardCategories.forEach(category => {
      const onlineEntry = allLeaderboards?.[category.id]?.[uid] || {};
      const onlineValue = Math.max(Number(onlineEntry.value) || 0, Number(onlineEntry[`raw${category.stat.charAt(0).toUpperCase()}${category.stat.slice(1)}`]) || 0);
      baseline[category.stat] = Math.max(Number(saveStats[category.stat]) || 0, onlineValue);
    });
  }
  await firebaseSet("leaderboardBaselines/" + uid, baseline);
  const storedBaseline = await firebaseGet("leaderboardBaselines/" + uid);
  if(!storedBaseline || Number(storedBaseline.resetAt) !== resetAt){
    throw new Error("Firebase nie zapisal baseline resetu leaderboardu");
  }
  return baseline;
}

async function resetPlayerLeaderboardStats(uid, options={}){
  if(!uid || !await initFirebase()) return;
  let allLeaderboards = {};
  try{
    allLeaderboards = await firebaseGet("leaderboards") || {};
  }catch(err){
    console.warn("Leaderboard read before reset failed:", err);
  }
  const baseline = await setLeaderboardResetBaseline(uid, allLeaderboards, options.baselineMode || "current");
  let removedAnything = false;
  const normalPatch = {};
  leaderboardCategories.forEach(category => {
    normalPatch[`${category.id}/${uid}`] = null;
  });
  try{
    await firebaseUpdate("leaderboards", normalPatch);
    removedAnything = true;
  }catch(err){
    console.warn("Normal leaderboard reset patch failed:", err);
    const normalResults = await Promise.allSettled(
      leaderboardCategories.map(category => firebaseSet(`leaderboards/${category.id}/${uid}`, null))
    );
    removedAnything = normalResults.some(result => result.status === "fulfilled");
    if(!removedAnything){
      throw new Error("Firebase odrzucil usuwanie wpisow leaderboardu");
    }
  }

  try{
    const bossLeaderboards = await firebaseGet("globalMoleBossLeaderboard") || {};
    const bossPatch = {};
    Object.keys(bossLeaderboards).forEach(bossId => {
      bossPatch[`${bossId}/${uid}`] = null;
    });
    if(Object.keys(bossPatch).length){
      await firebaseUpdate("globalMoleBossLeaderboard", bossPatch);
      removedAnything = true;
    }
  }catch(err){
    console.warn("Boss leaderboard reset scan failed:", err);
  }
  try{
    await firebaseSet("globalMoleBossAllTimeLeaderboard/" + uid, null);
    removedAnything = true;
  }catch(err){
    console.warn("Boss all-time leaderboard reset failed:", err);
  }
  if(!removedAnything){
    console.warn("No leaderboard entries were removed. This can mean empty leaderboard rows or Firebase rules blocking admin cleanup.");
  }

  leaderboardCategories.forEach(category => {
    if(leaderboardData?.[category.id]?.[uid]){
      delete leaderboardData[category.id][uid];
    }
  });
  leaderboardDataHash = "";
  if(globalBossLeaderboardData?.[uid]){
    delete globalBossLeaderboardData[uid];
  }
  if(globalBossAllTimeLeaderboardData?.[uid]){
    delete globalBossAllTimeLeaderboardData[uid];
  }
  if(currentAccount?.uid === uid){
    game.__lastScoreForLeaderboard = Number(game.score) || 0;
    game.__leaderboardStatsReady = true;
    setStoredLeaderboardTime("auto", 0);
  }
  console.info("Leaderboard reset baseline saved", {uid, baseline});
  renderLeaderboardPanel();
  renderGlobalBossPanel();
}

async function clearPlayerInventory(uid){
  if(!uid || !await initFirebase()) throw new Error("Brak uid");
  const patch = {
    pets:[],
    skins:[],
    potions:[],
    activePotions:[],
    bags:[],
    enchants:[],
    inventoryEggs:[],
    activePetIds:[],
    activeEnchantIds:[],
    activeSkinId:null,
    petSeq:1,
    skinSeq:1,
    potionSeq:1,
    bagSeq:1,
    enchantSeq:1,
    inventoryEggSeq:1,
    inventoryTab:"pets",
    uiDirty:true,
    _updatedAt:Date.now()
  };
  await firebaseUpdate("users/" + uid, patch);
  if(currentAccount?.uid === uid){
    const remoteSave = await firebaseGet("users/" + uid);
    if(remoteSave) applySave(remoteSave, {mode:"account"});
  }
}

function leaderboardNickMatches(entry, targetSafeNick, rowKey=""){
  if(!targetSafeNick) return false;
  const primitiveValue = typeof entry === "string" ? entry : "";
  return [rowKey, primitiveValue, entry?.safeNick, entry?.nick, entry?.username, entry?.name, entry?.playerName, entry?.displayName]
    .filter(Boolean)
    .some(value => safeNick(value) === targetSafeNick);
}

async function findAccountByNick(nick){
  const targetSafeNick = safeNick(nick);
  if(!targetSafeNick) return null;
  let account = null;
  try{
    account = await firebaseGet("accounts/" + targetSafeNick);
    if(account?.uid || account?.firebaseUid){
      return Object.assign({}, account, {
        uid:account.uid || account.firebaseUid,
        safeNick:targetSafeNick,
        nick:account.nick || account.username || nick
      });
    }
  }catch(err){
    console.warn("Account direct lookup failed:", err);
  }
  try{
    const users = await firebaseGet("users") || {};
    for(const [uid, save] of Object.entries(users)){
      if(!save || typeof save !== "object") continue;
      const candidates = [save.safeNick, save.username, save._accountNick, save.nick].filter(Boolean);
      if(candidates.some(value => safeNick(value) === targetSafeNick)){
        return {
          uid,
          safeNick:targetSafeNick,
          nick:save.username || save._accountNick || save.nick || nick
        };
      }
    }
  }catch(err){
    console.warn("Account user-save lookup failed:", err);
  }
  return null;
}

async function findLeaderboardUidsByNick(nick){
  const targetSafeNick = safeNick(nick);
  const uids = new Set();
  const account = await findAccountByNick(nick);
  if(account?.uid) uids.add(account.uid);

  try{
    const allLeaderboards = await firebaseGet("leaderboards") || {};
    Object.values(allLeaderboards).forEach(categoryRows => {
      Object.entries(categoryRows || {}).forEach(([uid, entry]) => {
        if(leaderboardNickMatches(entry, targetSafeNick, uid)) uids.add(uid);
      });
    });
  }catch(err){
    console.warn("Normal leaderboard nick scan failed:", err);
  }

  try{
    const bossLeaderboards = await firebaseGet("globalMoleBossLeaderboard") || {};
    Object.values(bossLeaderboards).forEach(bossRows => {
      Object.entries(bossRows || {}).forEach(([uid, entry]) => {
        if(leaderboardNickMatches(entry, targetSafeNick, uid)) uids.add(uid);
      });
    });
  }catch(err){
    console.warn("Boss leaderboard nick scan failed:", err);
  }

  try{
    const allTimeBoss = await firebaseGet("globalMoleBossAllTimeLeaderboard") || {};
    Object.entries(allTimeBoss || {}).forEach(([uid, entry]) => {
      if(leaderboardNickMatches(entry, targetSafeNick, uid)) uids.add(uid);
    });
  }catch(err){
    console.warn("Boss all-time leaderboard nick scan failed:", err);
  }

  return {uids:[...uids].filter(Boolean), account};
}

async function resetLeaderboardStatsByNick(nick){
  if(!assertAdminUnlocked()) return false;
  if(!await initFirebase()) return false;
  const cleanNick = String(nick || "").trim();
  if(!cleanNick){
    setAdminAbuseMessage("Wpisz nick gracza do resetu topki.", true);
    return false;
  }
  const {uids, account} = await findLeaderboardUidsByNick(cleanNick);
  if(!uids.length){
    setAdminAbuseMessage("Nie znaleziono gracza", true);
    return false;
  }
  for(const uid of uids){
    await resetPlayerLeaderboardStats(uid);
  }
  const message = `Zresetowano statystyki leaderboardu gracza ${account?.nick || cleanNick} (${uids.length} wpis/uid). Gracz moze ponownie wejsc na topke od zera.`;
  spawnPopup(message, false, false, true);
  setAdminAbuseMessage(message);
  return true;
}

window.adminResetLeaderboardByNick = async function(){
  const input = document.getElementById("adminLeaderboardResetNick");
  const nick = input?.value || "";
  const ok = await resetLeaderboardStatsByNick(nick);
  if(ok && input) input.value = "";
};

async function adminGivePlayerItem(){
  if(!await initFirebase()) return;
  const target = adminGiveTarget?.value || "player";
  const nick = adminGiveNick?.value.trim();
  const type = adminGiveType?.value || "coins";
  let value = adminGiveValue?.value.trim();
  if(type === "clearEvents"){
    await firebaseSet("globalEvents", {});
    setAdminAbuseMessage("Akcja wykonana: wyczyszczono eventy globalne.");
    spawnPopup("Eventy globalne wyczyszczone", false, false, true);
    return;
  }
  if(target === "player" && !nick){
    setAdminAbuseMessage("Wpisz nick gracza.", true);
    throw new Error("Missing player nick");
  }
  const itemKey = type === "pet"
    ? adminGivePetSelect?.value
    : type === "skin"
      ? adminGiveSkinSelect?.value
      : type === "potion"
        ? adminGivePotionSelect?.value
        : type === "bag"
          ? adminGiveBagSelect?.value
          : type === "enchant"
            ? adminGiveEnchantSelect?.value
            : type === "egg"
              ? adminGiveEggSelect?.value
              : "";
  if(type === "pet" || type === "skin"){
    value = itemKey;
  }
  if(type === "potion" || type === "bag" || type === "enchant" || type === "egg"){
    value = adminGiveValue?.value.trim() || "1";
  }
  if(!["resetGame", "resetLeaderboard", "clearInventory", "pet", "skin"].includes(type) && !value){
    setAdminAbuseMessage("Wpisz wartosc albo nazwe itemu.", true);
    throw new Error("Missing gift value");
  }
  if((type === "pet" || type === "skin" || type === "potion" || type === "bag" || type === "enchant" || type === "egg") && !itemKey){
    setAdminAbuseMessage("Nie wybrano itemu", true);
    throw new Error("Missing selected item");
  }
  if((type === "coins" || type === "diamonds" || type === "potion" || type === "bag" || type === "enchant" || type === "egg") && (!Number.isFinite(Number(value)) || Number(value) <= 0)){
    setAdminAbuseMessage(type === "potion" || type === "bag" || type === "enchant" || type === "egg" ? "Nieprawidłowa ilość" : "Nieprawidłowa wartość.", true);
    throw new Error("Invalid value");
  }
  const giftId = `gift_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const gift = {
    id:giftId,
    type,
    value,
    itemKey,
    variant:type === "pet" ? (adminGivePetVariant?.value || "normal") : "",
    boostType:adminGiveBoostType?.value || "money",
    amount:Math.max(1, Math.floor(Number(value) || 1)),
    durationMs:type === "boost" ? getAdminDurationMs() : 0,
    from:"admin",
    createdAt:Date.now()
  };
  const writeUserAdminNotice = async (uid, message) => {
    if(!uid) return;
    await firebaseSet(`userAdminNotices/${uid}/${giftId}`, {
      id:giftId,
      type,
      message,
      claimed:false,
      createdAt:Date.now()
    });
  };

  if(target === "all"){
    if(type === "resetLeaderboard"){
      setAdminAbuseMessage("Reset topki jest dostepny tylko dla konkretnego nicku.", true);
      throw new Error("Leaderboard reset requires player target");
    }
    if(type === "clearInventory"){
      setAdminAbuseMessage("Czyszczenie inventory jest dostepne tylko dla konkretnego nicku.", true);
      throw new Error("Inventory clear requires player target");
    }
    const users = await firebaseGet("users") || {};
    const updates = {};
    const userIds = Object.keys(users || {}).filter(uid => uid && users[uid]);
    userIds.forEach(uid => {
      updates[`users/${uid}/adminInbox/${giftId}`] = Object.assign({}, gift, {
        eligibleUid:uid,
        globalBatch:true
      });
    });
    if(!userIds.length){
      setAdminAbuseMessage("Brak istniejących graczy do obdarowania.", true);
      throw new Error("No existing users for global gift");
    }
    await firebaseUpdate("", updates);
    const label = type === "resetGame" ? "globalny reset gry" : `globalna akcja ${type}`;
    const message = "Akcja wykonana";
    spawnPopup(message, false, false, true);
    setAdminAbuseMessage(message);
    return;
  }

  const account = await findAccountByNick(nick);
  if(!account || !account.uid){
    setAdminAbuseMessage("Nie znaleziono gracza", true);
    throw new Error("Account not found");
  }

  if(type === "resetGame"){
    const resetSave = Object.assign(makeFreshSave(), {
      _accountNick:account.nick || nick,
      _updatedAt:Date.now()
    });
    await firebaseSet(`users/${account.uid}`, resetSave);
    try{
      await resetPlayerLeaderboardStats(account.uid, {baselineMode:"zero"});
    }catch(err){
      console.warn("Reset game succeeded, leaderboard cleanup failed:", err);
    }
    if(currentAccount && currentAccount.uid === account.uid){
      applySave(resetSave, {mode:"account"});
    }
    const message = `Zresetowano gre i statystyki leaderboardu gracza ${account.nick || nick}.`;
    try{
      await writeUserAdminNotice(account.uid, message);
    }catch(err){
      console.warn("Reset game notice failed:", err);
    }
    spawnPopup(message, false, false, true);
    setAdminAbuseMessage(message);
    return;
  }

  if(type === "resetLeaderboard"){
    try{
      await resetLeaderboardStatsByNick(account.nick || nick);
    }catch(err){
      setAdminAbuseMessage("Błąd Firebase", true);
      throw err;
    }
    setAdminAbuseMessage("Leaderboard wyczyszczony");
    spawnPopup("Leaderboard wyczyszczony", false, false, true);
    return;
  }

  if(type === "clearInventory"){
    try{
      await clearPlayerInventory(account.uid);
      await writeUserAdminNotice(account.uid, "Admin wyczyscil Twoje inventory.");
    }catch(err){
      setAdminAbuseMessage("Błąd Firebase", true);
      throw err;
    }
    const message = "Inventory wyczyszczone";
    spawnPopup(message, false, false, true);
    setAdminAbuseMessage(message);
    return;
  }

  try{
    await applyAdminActionToUserSave(account.uid, gift);
    await firebaseSet(`users/${account.uid}/adminInbox/${giftId}`, Object.assign({}, gift, {claimed:true, notice:true}));
    await writeUserAdminNotice(account.uid, `Admin dodal nagrode: ${type}.`);
  }catch(err){
    setAdminAbuseMessage("Błąd zapisu Firebase", true);
    throw err;
  }
  if(currentAccount && currentAccount.uid === account.uid){
    const remoteSave = await firebaseGet("users/" + account.uid);
    if(remoteSave) applySave(remoteSave, {mode:"account"});
  }
  const message = "Akcja wykonana";
  spawnPopup(message, false, false, true);
  setAdminAbuseMessage(message);
}

async function applyAdminActionToUserSave(uid, gift){
  if(!uid || !gift?.type) throw new Error("Brak uid albo akcji");
  await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "users/" + uid), (save) => {
    const next = normalizeSave(save || makeFreshSave());
    if(gift.type === "coins"){
      const amount = Number(gift.value);
      if(!Number.isFinite(amount) || amount <= 0) throw new Error("Nieprawidlowa wartosc");
      next.score = (Number(next.score) || 0) + amount;
      next.leaderboardStats = next.leaderboardStats && typeof next.leaderboardStats === "object" ? next.leaderboardStats : {};
      next.leaderboardStats.totalCoinsEarned = (Number(next.leaderboardStats.totalCoinsEarned) || 0) + amount;
      next.leaderboardStats.bestCoins = Math.max(Number(next.leaderboardStats.bestCoins) || 0, next.score);
    }else if(gift.type === "diamonds"){
      const amount = Number(gift.value);
      if(!Number.isFinite(amount) || amount <= 0) throw new Error("Nieprawidlowa wartosc");
      next.diamonds = (Number(next.diamonds) || 0) + amount;
      next.leaderboardStats = next.leaderboardStats && typeof next.leaderboardStats === "object" ? next.leaderboardStats : {};
      next.leaderboardStats.bestDiamonds = Math.max(Number(next.leaderboardStats.bestDiamonds) || 0, next.diamonds);
    }else if(gift.type === "pet"){
      const pet = makeAdminGiftPet(gift.itemKey || gift.value, gift.variant || "normal");
      next.pets = Array.isArray(next.pets) ? next.pets : [];
      next.pets.push(pet);
      next.petSeq = Math.max(Number(next.petSeq) || 1, next.pets.length + 1);
    }else if(gift.type === "skin"){
      const skin = makeAdminGiftSkin(gift.itemKey || gift.value);
      next.skins = Array.isArray(next.skins) ? next.skins : [];
      if(!next.skins.some(item => item.templateId === skin.templateId)){
        next.skins.push(skin);
      }
      next.skinSeq = Math.max(Number(next.skinSeq) || 1, next.skins.length + 1);
    }else if(gift.type === "potion"){
      const amount = Math.max(1, Math.floor(Number(gift.amount || gift.value) || 1));
      next.potions = Array.isArray(next.potions) ? next.potions : [];
      for(let i = 0; i < amount; i++){
        next.potions.push(makeAdminGiftPotion(gift.itemKey));
      }
      next.potionSeq = Math.max(Number(next.potionSeq) || 1, next.potions.length + 1);
    }else if(gift.type === "bag"){
      const amount = Math.max(1, Math.floor(Number(gift.amount || gift.value) || 1));
      next.bags = Array.isArray(next.bags) ? next.bags : [];
      for(let i = 0; i < amount; i++){
        next.bags.push(makeAdminGiftBag(gift.itemKey || gift.value));
      }
      next.bagSeq = Math.max(Number(next.bagSeq) || 1, next.bags.length + 1);
    }else if(gift.type === "enchant"){
      const amount = Math.max(1, Math.floor(Number(gift.amount || gift.value) || 1));
      next.enchants = Array.isArray(next.enchants) ? next.enchants : [];
      for(let i = 0; i < amount; i++){
        next.enchants.push(makeAdminGiftEnchant(gift.itemKey || gift.value));
      }
      next.enchantSeq = Math.max(Number(next.enchantSeq) || 1, next.enchants.length + 1);
    }else if(gift.type === "egg"){
      const amount = Math.max(1, Math.floor(Number(gift.amount || gift.value) || 1));
      next.inventoryEggs = Array.isArray(next.inventoryEggs) ? next.inventoryEggs : [];
      for(let i = 0; i < amount; i++){
        const egg = makeAdminGiftEgg(gift.itemKey || gift.value);
        if(egg) next.inventoryEggs.push(egg);
      }
      next.inventoryEggSeq = Math.max(Number(next.inventoryEggSeq) || 1, next.inventoryEggs.length + 1);
    }else if(gift.type === "boost"){
      next.bossRewardBoosts = Array.isArray(next.bossRewardBoosts) ? next.bossRewardBoosts : [];
      next.bossRewardBoosts.push(makeAdminGiftBoost(gift));
    }else{
      throw new Error("Nieznana akcja");
    }
    next._updatedAt = Date.now();
    return next;
  });
}

window.adminStartGlobalBoost = function(type, value){
  openAdminBoostPopup(type, value);
};

window.adminOpenEventsPanel = function(){
  openAdminEventsPopup();
};

window.adminStartMegaEvent = function(){
  openAdminBoostPopup("mega", 1);
};

window.adminStartGlobalMessage = function(){
  openAdminBoostPopup("message", 1);
};

window.adminOpenGivePlayerItem = function(presetType){
  openAdminBoostPopup("giveItem", 1, presetType);
};

window.adminOpenResetPanel = function(){
  openAdminBoostPopup("giveItem", 1, "resetLeaderboard");
  if(adminBoostModalTitle) adminBoostModalTitle.textContent = "Reset / czyszczenie";
};

window.adminScrollToBossPanel = function(){
  if(!assertAdminUnlocked()) return;
  const panel = document.getElementById("adminPanel");
  const boss = document.getElementById("adminBossControls");
  boss?.scrollIntoView({behavior:"smooth", block:"start"});
  if(panel) panel.scrollTop = boss ? boss.offsetTop - 16 : panel.scrollTop;
};

window.adminClearGlobalEvents = async function(){
  if(!assertAdminUnlocked()) return;
  if(!await initFirebase()) return;
  await firebaseSet("globalEvents", {});
  spawnPopup("Global eventy wyczyszczone", false, false, true);
};

function formatNextUpdateCountdown(ms){
  const total = Math.max(0, Math.ceil(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if(days > 0) return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  if(hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderNextUpdateCountdown(){
  if(!nextUpdateCountdown) return;
  const enabled = !!nextUpdateData?.enabled;
  const targetAt = Number(nextUpdateData?.targetAt) || 0;
  if(!enabled || !targetAt){
    nextUpdateCountdown.style.display = "none";
    return;
  }
  const left = targetAt - Date.now();
  nextUpdateCountdown.style.display = "block";
  if(!nextUpdateCountdown.querySelector("b") || !nextUpdateCountdown.querySelector("span")){
    nextUpdateCountdown.innerHTML = "<b></b><span></span>";
  }
  const titleNode = nextUpdateCountdown.querySelector("b");
  const timeNode = nextUpdateCountdown.querySelector("span");
  if(titleNode) titleNode.textContent = nextUpdateData.title || "NEXT UPDATE";
  if(timeNode) timeNode.textContent = left <= 0 ? "Juz niedlugo" : formatNextUpdateCountdown(left);
}

async function startNextUpdateLive(){
  try{
    const local = JSON.parse(localStorage.getItem(NEXT_UPDATE_LOCAL_KEY) || "null");
    if(local?.enabled && Number(local.targetAt) > Date.now()){
      nextUpdateData = local;
      renderNextUpdateCountdown();
    }
  }catch(err){}
  if(!nextUpdateTimer){
    nextUpdateTimer = setInterval(renderNextUpdateCountdown, 1000);
  }
  if(nextUpdateUnsub || !await initFirebase()) return;
  nextUpdateUnsub = firebaseModules.onValue(firebaseModules.ref(firebaseDb, "nextUpdate"), (snapshot) => {
    const remote = snapshot.exists() ? snapshot.val() : null;
    if(remote){
      nextUpdateData = remote;
      try{ localStorage.setItem(NEXT_UPDATE_LOCAL_KEY, JSON.stringify(remote)); }catch(err){}
    }else{
      nextUpdateData = nextUpdateData?.enabled ? nextUpdateData : null;
    }
    renderNextUpdateCountdown();
  }, (err) => console.warn("Next update live error:", err));
}

async function saveNextUpdateFromAdmin(){
  if(!assertAdminUnlocked()) return;
  const firebaseOk = await initFirebase();
  const previous = nextUpdateData;
  const title = (adminNextUpdateTitle?.value || "NEXT UPDATE").trim().slice(0, 48) || "NEXT UPDATE";
  const rawDate = adminNextUpdateAt?.value || "";
  const targetAt = rawDate ? new Date(rawDate).getTime() : 0;
  if(!targetAt || Number.isNaN(targetAt)){
    if(adminNextUpdateStatus) adminNextUpdateStatus.textContent = "Wybierz poprawna date.";
    return;
  }
  const payload = {
    enabled:true,
    title,
    targetAt,
    updatedAt:Date.now(),
    updatedBy:currentAccount?.nick || "Panda"
  };
  nextUpdateData = payload;
  try{ localStorage.setItem(NEXT_UPDATE_LOCAL_KEY, JSON.stringify(payload)); }catch(err){}
  renderNextUpdateCountdown();
  try{
    if(!firebaseOk) throw new Error("Firebase nie jest gotowy");
    await firebaseSet("nextUpdate", payload);
    if(adminNextUpdateStatus) adminNextUpdateStatus.textContent = "Licznik zapisany.";
  }catch(err){
    console.warn("Next update save error:", err);
    nextUpdateData = previous;
    try{
      if(previous) localStorage.setItem(NEXT_UPDATE_LOCAL_KEY, JSON.stringify(previous));
      else localStorage.removeItem(NEXT_UPDATE_LOCAL_KEY);
    }catch(storageErr){}
    renderNextUpdateCountdown();
    if(adminNextUpdateStatus) adminNextUpdateStatus.textContent = "Nie zapisano licznika. Firebase odrzucil zapis.";
  }
}

async function clearNextUpdateFromAdmin(){
  if(!assertAdminUnlocked()) return;
  const firebaseOk = await initFirebase();
  const previous = nextUpdateData;
  const payload = {
    enabled:false,
    updatedAt:Date.now(),
    updatedBy:currentAccount?.nick || "Panda"
  };
  nextUpdateData = payload;
  try{ localStorage.removeItem(NEXT_UPDATE_LOCAL_KEY); }catch(err){}
  renderNextUpdateCountdown();
  try{
    if(!firebaseOk) throw new Error("Firebase nie jest gotowy");
    await firebaseSet("nextUpdate", payload);
    if(adminNextUpdateStatus) adminNextUpdateStatus.textContent = "Licznik wylaczony.";
  }catch(err){
    console.warn("Next update clear error:", err);
    nextUpdateData = previous;
    try{
      if(previous) localStorage.setItem(NEXT_UPDATE_LOCAL_KEY, JSON.stringify(previous));
      else localStorage.removeItem(NEXT_UPDATE_LOCAL_KEY);
    }catch(storageErr){}
    renderNextUpdateCountdown();
    if(adminNextUpdateStatus) adminNextUpdateStatus.textContent = "Nie wylaczono licznika. Firebase odrzucil zapis.";
  }
}

function setAdminBossStatus(text, isError=false){
  const node = document.getElementById("adminBossStatus");
  if(node){
    node.textContent = text || "";
    node.classList.toggle("error", !!isError);
  }
  if(text) setAdminAbuseMessage(text, isError);
}

function getAdminBossNumber(id, fallback=0){
  const value = Number(document.getElementById(id)?.value || fallback);
  return Number.isFinite(value) ? value : fallback;
}

function populateAdminBossSelect(){
  const select = document.getElementById("adminBossTypeSelect");
  if(select){
    const current = select.value || globalBossData?.bossType || "";
    select.innerHTML = globalBossTypes.map(type => `
      <option value="${escapeHtml(type.type)}">${escapeHtml(type.name)}</option>
    `).join("");
    if(current && globalBossTypes.some(type => type.type === current)){
      select.value = current;
    }
  }
  const maxHpInput = document.getElementById("adminBossMaxHpInput");
  if(maxHpInput && !maxHpInput.value){
    const configured = getConfiguredBossMaxHp();
    maxHpInput.value = configured ? String(configured) : "";
    maxHpInput.placeholder = configured ? String(configured) : "np. 2500000";
  }
}

async function loadGlobalBossSettings(){
  if(!await initFirebase()) return globalBossSettings;
  try{
    const settings = await firebaseGet("globalMoleBossSettings") || {};
    globalBossSettings = {
      maxHp:Math.max(0, Math.floor(Number(settings.maxHp) || 0)),
      updatedAt:Number(settings.updatedAt) || 0,
      communityDamage:{
        contributed:Math.max(0, Math.floor(Number(settings.communityDamage?.contributed) || 0)),
        completed:!!settings.communityDamage?.completed,
        completedAt:Number(settings.communityDamage?.completedAt) || 0
      }
    };
    populateAdminBossSelect();
  }catch(err){
    console.warn("Global boss settings load error:", err);
  }
  return globalBossSettings;
}

async function runAdminBossTransaction(mutator, successText){
  if(!assertAdminUnlocked()) return false;
  if(!await initFirebase()) return false;
  try{
    await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "globalMoleBoss"), (boss) => {
      const current = boss && boss.bossId ? boss : makeGlobalBoss(1);
      return mutator(current);
    });
    setAdminBossStatus(successText || "Boss zaktualizowany.");
    await ensureGlobalBossReady();
    updateGlobalBossDynamicFields();
    renderGlobalBossPanel();
    return true;
  }catch(err){
    console.warn("Admin boss action error:", err);
    setAdminBossStatus("Nie udało się zaktualizować bossa.", true);
    return false;
  }
}

window.adminSetBossHp = async function(){
  const hp = Math.max(0, Math.floor(getAdminBossNumber("adminBossHpInput", NaN)));
  if(!Number.isFinite(hp)){
    setAdminBossStatus("Wpisz poprawne HP bossa.", true);
    return;
  }
  await runAdminBossTransaction((boss) => {
    const maxHp = Math.max(Number(boss.maxHp) || 1, hp || 1);
    return Object.assign({}, boss, {
      currentHp:hp,
      maxHp,
      defeated:hp <= 0,
      defeatedAt:hp <= 0 ? Date.now() : null
    });
  }, `Ustawiono HP bossa na ${format(hp)}.`);
};

window.adminSetBossMaxHp = async function(applyToCurrent=false){
  const maxHp = Math.max(1, Math.floor(getAdminBossNumber("adminBossMaxHpInput", NaN)));
  if(!Number.isFinite(maxHp)){
    setAdminBossStatus("Wpisz poprawne stałe max HP.", true);
    return;
  }
  if(!assertAdminUnlocked()) return;
  if(!await initFirebase()) return;
  try{
    globalBossSettings = {maxHp, updatedAt:Date.now()};
    await firebaseSet("globalMoleBossSettings", globalBossSettings);
    if(applyToCurrent){
      await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "globalMoleBoss"), (boss) => {
        const current = boss && boss.bossId ? boss : makeGlobalBoss(1);
        const oldMax = Math.max(1, Number(current.maxHp) || 1);
        const currentHp = Math.max(0, Number(current.currentHp) || 0);
        const hpPercent = current.defeated ? 0 : Math.max(0, Math.min(1, currentHp / oldMax));
        const nextHp = Math.max(0, Math.ceil(maxHp * hpPercent));
        return Object.assign({}, current, {
          maxHp,
          currentHp:nextHp,
          defeated:nextHp <= 0,
          defeatedAt:nextHp <= 0 ? (current.defeatedAt || Date.now()) : null
        });
      });
    }
    populateAdminBossSelect();
    renderGlobalBossPanel();
    setAdminBossStatus(applyToCurrent
      ? `Stałe max HP ustawione na ${format(maxHp)} i zastosowane do aktualnego bossa.`
      : `Stałe max HP ustawione na ${format(maxHp)} dla przyszłych bossów.`);
  }catch(err){
    console.warn("Admin boss max HP error:", err);
    setAdminBossStatus("Nie udało się zapisać stałego max HP.", true);
  }
};

window.adminModifyBossHp = async function(){
  const delta = Math.floor(getAdminBossNumber("adminBossHpDeltaInput", NaN));
  if(!Number.isFinite(delta) || delta === 0){
    setAdminBossStatus("Wpisz dodatnią albo ujemną zmianę HP.", true);
    return;
  }
  await runAdminBossTransaction((boss) => {
    const currentHp = Math.max(0, Number(boss.currentHp) || 0);
    const nextHp = Math.max(0, currentHp + delta);
    const maxHp = Math.max(Number(boss.maxHp) || 1, nextHp || 1);
    return Object.assign({}, boss, {
      currentHp:nextHp,
      maxHp,
      defeated:nextHp <= 0,
      defeatedAt:nextHp <= 0 ? Date.now() : null
    });
  }, `Zmieniono HP bossa o ${format(delta)}.`);
};

window.adminDamageGlobalBoss = async function(){
  const damage = Math.max(1, Math.floor(getAdminBossNumber("adminBossDamageInput", NaN)));
  if(!Number.isFinite(damage)){
    setAdminBossStatus("Wpisz poprawny damage.", true);
    return;
  }
  await runAdminBossTransaction((boss) => {
    const currentHp = Math.max(0, Number(boss.currentHp) || 0);
    const nextHp = Math.max(0, currentHp - damage);
    return Object.assign({}, boss, {
      currentHp:nextHp,
      totalDamage:(Number(boss.totalDamage) || 0) + damage,
      defeated:nextHp <= 0,
      defeatedAt:nextHp <= 0 ? Date.now() : null
    });
  }, `Zadano bossowi ${format(damage)} damage. Admin nie został dodany do rankingu.`);
};

window.adminChangeGlobalBoss = async function(){
  const type = document.getElementById("adminBossTypeSelect")?.value || "";
  const bossType = getBossType(type);
  if(!bossType){
    setAdminBossStatus("Wybierz poprawnego bossa.", true);
    return;
  }
  if(!assertAdminUnlocked()) return;
  if(!await initFirebase()) return;
  try{
    const level = Math.max(1, Number(globalBossData?.bossLevel) || 1);
    const boss = makeGlobalBoss(level, bossType.type);
    await firebaseSet("globalMoleBoss", boss);
    globalBossData = boss;
    globalBossLeaderboardData = {};
    populateAdminBossSelect();
    setAdminBossStatus(`Zmieniono bossa na: ${bossType.name}.`);
    renderGlobalBossPanel();
  }catch(err){
    console.warn("Admin boss change error:", err);
    setAdminBossStatus("Nie udało się zmienić bossa.", true);
  }
};

const GLOBAL_BOSS_CONFIG = {
  timezone:"Europe/Warsaw",
  leaderboardPollMs:10 * 60 * 1000,
  attackCooldownMs:180,
  baseHp:4500000,
  hpPerLevel:800000,
  hpGrowth:1.22,
  upgradeMax:3,
  personalUpgradeCosts:[10, 25, 50],
  personalUpgradeBonuses:[0, 0.05, 0.10, 0.20],
  communityUpgradeCost:1000,
  communityUpgradeBonus:0.30,
  rewardDurationMs:60 * 60 * 1000
};

const globalBossTypes = [
  {
    type:"dark",
    name:"Mroczny Kret",
    description:"Wypełzł z tuneli pod VOID i kradnie światło z każdej planety.",
    css:"boss-dark",
    skinClass:"skin-boss-dark",
    skinId:"boss_skin_dark",
    skinName:"Skóra: Mroczny Kret",
    aura:"Fioletowa aura cienia",
    accent:"#3a255f",
    hpMult:1
  },
  {
    type:"gold",
    name:"Złoty Kret Tyran",
    description:"Bogaty tyran w złotej zbroi. Każde uderzenie odbija się od jego korony.",
    css:"boss-gold",
    skinClass:"skin-boss-gold",
    skinId:"boss_skin_gold_tyrant",
    skinName:"Skóra: Złoty Kret Tyran",
    aura:"Złota aura tyrana",
    accent:"#ffd84d",
    hpMult:1.18
  },
  {
    type:"radio",
    name:"Radioaktywny Kret",
    description:"Świeci w ciemności i zostawia za sobą toksyczne tunele.",
    css:"boss-radio",
    skinClass:"skin-boss-radio",
    skinId:"boss_skin_radioactive",
    skinName:"Skóra: Radioaktywny Kret",
    aura:"Radioaktywna zielona poświata",
    accent:"#93ff45",
    hpMult:1.08
  },
  {
    type:"ice",
    name:"Lodowy Kret Władca",
    description:"Zamraża kliknięcia w powietrzu i buduje pałac z lodowych kopców.",
    css:"boss-ice",
    skinClass:"skin-boss-ice",
    skinId:"boss_skin_ice_lord",
    skinName:"Skóra: Lodowy Kret Władca",
    aura:"Mroźna aura lodu",
    accent:"#8fe8ff",
    hpMult:1.12
  },
  {
    type:"hell",
    name:"Piekielny Kret",
    description:"Przebił się przez lawę i chce spalić cały ranking.",
    css:"boss-hell",
    skinClass:"skin-boss-hell",
    skinId:"boss_skin_hell",
    skinName:"Skóra: Piekielny Kret",
    aura:"Piekielna ognista aura",
    accent:"#ff5135",
    hpMult:1.22
  }
];

Object.assign(globalBossTypes.find(item=>item.type === "hell") || {}, {
  name:"Piekielny Kret",
  description:"Przebił się przez lawę i chce spalić cały ranking.",
  skinName:"Skin Piekielnego Kreta",
  rewardName:"Nagroda TOP 3: Skin Piekielnego Kreta",
  aura:"Piekielna ognista aura"
});
Object.assign(globalBossTypes.find(item=>item.type === "dark") || {}, {
  name:"Mroczny Kret",
  description:"Wypełzł z tuneli pod VOID i kradnie światło z każdej planety.",
  skinName:"Skin Mrocznego Kreta",
  rewardName:"Nagroda TOP 3: Skin Mrocznego Kreta",
  aura:"Fioletowy dym i świecące oczy"
});
Object.assign(globalBossTypes.find(item=>item.type === "gold") || {}, {
  name:"Złoty Kret Tyran",
  description:"Bogaty tyran w złotej zbroi. Każde uderzenie odbija się od jego korony.",
  skinName:"Skin Złotego Kreta Tyrana",
  rewardName:"Nagroda TOP 3: Skin Złotego Kreta Tyrana",
  aura:"Złota aura, korona i połysk"
});
Object.assign(globalBossTypes.find(item=>item.type === "radio") || {}, {
  name:"Radioaktywny Kret",
  description:"Świeci w ciemności i zostawia za sobą toksyczne tunele.",
  skinName:"Skin Radioaktywnego Kreta",
  rewardName:"Nagroda TOP 3: Skin Radioaktywnego Kreta",
  aura:"Zielona poświata i toksyczne efekty"
});
Object.assign(globalBossTypes.find(item=>item.type === "ice") || {}, {
  name:"Lodowy Kret Władca",
  description:"Zamraża kliknięcia w powietrzu i buduje pałac z lodowych kopców.",
  skinName:"Skin Lodowego Kreta Władcy",
  rewardName:"Nagroda TOP 3: Skin Lodowego Kreta Władcy",
  aura:"Błękitna aura, śnieg i lód"
});

let globalBossData = null;
let globalBossLeaderboardData = {};
let globalBossAllTimeLeaderboardData = {};
let globalBossStream = null;
let globalBossLeaderboardTimer = null;
let globalBossClockTimer = null;
let globalBossBusy = false;
let lastBossAttackAt = 0;
let lastBossFinalizeId = null;
let globalBossEventOpen = false;
let globalBossLeaderboardScope = "current";
let globalBossLeaderboardMetric = "damage";
let lastGlobalBossLeaderboardRefreshAt = 0;
let nextGlobalBossLeaderboardRefreshAt = 0;
let globalBossSettings = {
  maxHp:0,
  updatedAt:0,
  communityDamage:{
    contributed:0,
    completed:false,
    completedAt:0
  }
};

function escapeHtml(value){
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getWarsawParts(ms=Date.now()){
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone:GLOBAL_BOSS_CONFIG.timezone,
    year:"numeric",
    month:"2-digit",
    day:"2-digit",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit",
    hourCycle:"h23"
  }).formatToParts(new Date(ms));
  return Object.fromEntries(parts.filter(part=>part.type !== "literal").map(part=>[part.type, Number(part.value)]));
}

function getTimeZoneOffsetMs(date, timeZone){
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year:"numeric",
    month:"2-digit",
    day:"2-digit",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit",
    hourCycle:"h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter(part=>part.type !== "literal").map(part=>[part.type, Number(part.value)]));
  const asUtc = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second);
  return asUtc - date.getTime();
}

function warsawLocalToUtcMs(year, month, day, hour=0, minute=0, second=0){
  let utc = Date.UTC(year, month - 1, day, hour, minute, second);
  for(let i = 0; i < 3; i++){
    const offset = getTimeZoneOffsetMs(new Date(utc), GLOBAL_BOSS_CONFIG.timezone);
    utc = Date.UTC(year, month - 1, day, hour, minute, second) - offset;
  }
  return utc;
}

function getNextWarsawMidnightMs(ms=Date.now()){
  const parts = getWarsawParts(ms);
  return warsawLocalToUtcMs(parts.year, parts.month, parts.day + 1, 0, 0, 0);
}

function getNextWarsawHourBoundaryMs(ms=Date.now()){
  const parts = getWarsawParts(ms);
  return warsawLocalToUtcMs(parts.year, parts.month, parts.day, parts.hour + 1, 0, 0);
}

function getNextWarsawTenMinuteBoundaryMs(ms=Date.now()){
  const parts = getWarsawParts(ms);
  const nextMinute = Math.floor(parts.minute / 10) * 10 + 10;
  return warsawLocalToUtcMs(parts.year, parts.month, parts.day, parts.hour, nextMinute, 0);
}

function getWarsawDayKey(ms=Date.now()){
  const parts = getWarsawParts(ms);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function getBossType(type){
  return globalBossTypes.find(item=>item.type === type) || globalBossTypes[0];
}

function getConfiguredBossMaxHp(){
  const maxHp = Number(globalBossSettings?.maxHp) || 0;
  return maxHp > 0 ? Math.floor(maxHp) : 0;
}

function getBossMaxHp(level, bossType){
  const configuredMaxHp = getConfiguredBossMaxHp();
  if(configuredMaxHp > 0) return configuredMaxHp;
  const type = getBossType(bossType);
  return Math.floor((GLOBAL_BOSS_CONFIG.baseHp + level * GLOBAL_BOSS_CONFIG.hpPerLevel) * Math.pow(GLOBAL_BOSS_CONFIG.hpGrowth, Math.max(0, level - 1)) * type.hpMult);
}

function makeGlobalBoss(level=1, forcedType=""){
  const type = forcedType
    ? getBossType(forcedType)
    : globalBossTypes[Math.floor(Math.random() * globalBossTypes.length)];
  const maxHp = getBossMaxHp(level, type.type);
  const dayKey = getWarsawDayKey();
  return {
    bossId:`${dayKey}_${type.type}_${Math.random().toString(36).slice(2, 8)}`,
    bossType:type.type,
    bossName:type.name,
    bossLevel:level,
    currentHp:maxHp,
    maxHp,
    totalDamage:0,
    defeated:false,
    defeatedAt:null,
    nextRefreshAt:getNextWarsawMidnightMs()
  };
}

function getTotalBossRebirths(){
  return Math.max(1, Math.floor((game.rebirths || 0) + (game.ultraCores || 0) * 10));
}

function getBossDamageUpgradeLevel(){
  return Math.max(0, Math.min(GLOBAL_BOSS_CONFIG.upgradeMax, Number(game.bossDamageUpgrade) || 0));
}

function getBossDamageUpgradeCost(){
  return GLOBAL_BOSS_CONFIG.personalUpgradeCosts[getBossDamageUpgradeLevel()] || 0;
}

function getBossPersonalDamageBonus(){
  return GLOBAL_BOSS_CONFIG.personalUpgradeBonuses[getBossDamageUpgradeLevel()] || 0;
}

function getCommunityBossUpgradeData(){
  const data = globalBossSettings?.communityDamage || {};
  const contributed = Math.max(0, Math.floor(Number(data.contributed) || 0));
  const completed = !!data.completed || contributed >= GLOBAL_BOSS_CONFIG.communityUpgradeCost;
  return {
    contributed:Math.min(GLOBAL_BOSS_CONFIG.communityUpgradeCost, contributed),
    completed,
    completedAt:Number(data.completedAt) || 0
  };
}

function getBossCommunityDamageBonus(){
  return getCommunityBossUpgradeData().completed ? GLOBAL_BOSS_CONFIG.communityUpgradeBonus : 0;
}

function getBossTotalUpgradeBonus(){
  return getBossPersonalDamageBonus() + getBossCommunityDamageBonus();
}

function getBossClickDamage(){
  const base = getTotalBossRebirths();
  const upgradeMult = 1 + getBossTotalUpgradeBonus();
  const eventMult = typeof getGlobalEventMultiplier === "function" ? getGlobalEventMultiplier("communityMoleDamage") : 1;
  const rewardMult = typeof getPersonalRewardMultiplier === "function" ? getPersonalRewardMultiplier("bossDamage") : 1;
  const appMult = typeof getAppInstallBonusMultiplier === "function" ? getAppInstallBonusMultiplier() : 1;
  return Math.max(1, Math.floor(base * upgradeMult * eventMult * rewardMult * appMult));
}

function getBossLeaderboardRows(limit=10){
  return Object.values(globalBossLeaderboardData || {})
    .filter(entry=>entry && typeof entry.damage === "number")
    .sort((a, b)=>b.damage - a.damage)
    .slice(0, limit);
}

const bossLeaderboardMetrics = {
  current:{
    damage:{
      icon:"&#9876;",
      label:"Damage temu bossowi",
      tooltip:"Najwieksze obrazenia zadane aktualnemu bossowi.",
      valueKey:"damage",
      suffix:"obrazen",
      empty:"Brak obrazen na tym bossie."
    },
    diamonds:{
      icon:"&#128142;",
      label:"Diamenty temu bossowi",
      tooltip:"Najwiecej diamentow wydanych na wspolny upgrade podczas aktualnego bossa.",
      valueKey:"diamondsSpent",
      suffix:"diaxow",
      empty:"Nikt jeszcze nie dorzucil diamentow temu bossowi."
    }
  },
  all:{
    damage:{
      icon:"&#9876;",
      label:"Laczny damage",
      tooltip:"Suma obrazen zadanych wszystkim globalnym bossom.",
      valueKey:"totalDamage",
      suffix:"obrazen",
      empty:"Brak globalnych obrazen."
    },
    diamonds:{
      icon:"&#128142;",
      label:"Laczne diamenty",
      tooltip:"Suma diamentow wydanych na wspolne boss upgrade'y.",
      valueKey:"totalDiamondsSpent",
      suffix:"diaxow",
      empty:"Brak wydanych diamentow."
    },
    skull:{
      icon:"&#9760;",
      label:"Pomoc przy bossach",
      tooltip:"Liczba pokonanych bossow, przy ktorych gracz zadal minimum 1% HP bossa.",
      valueKey:"defeatedBossHelps",
      suffix:"bossow",
      empty:"Nikt nie ma jeszcze punktu pomocy."
    }
  }
};

function normalizeBossLeaderboardState(){
  if(globalBossLeaderboardScope !== "all") globalBossLeaderboardScope = "current";
  const metrics = bossLeaderboardMetrics[globalBossLeaderboardScope] || bossLeaderboardMetrics.current;
  if(!metrics[globalBossLeaderboardMetric]){
    globalBossLeaderboardMetric = Object.keys(metrics)[0] || "damage";
  }
}

function getBossMetricRows(scope, metric, limit=10){
  const metrics = bossLeaderboardMetrics[scope] || bossLeaderboardMetrics.current;
  const config = metrics[metric] || Object.values(metrics)[0];
  const source = scope === "all" ? globalBossAllTimeLeaderboardData : globalBossLeaderboardData;
  return Object.values(source || {})
    .filter(entry=>entry && entry.uid)
    .map(entry=>Object.assign({}, entry, {metricValue:Number(entry?.[config.valueKey]) || 0}))
    .filter(entry=>entry.metricValue > 0)
    .sort((a, b)=>b.metricValue - a.metricValue)
    .slice(0, limit);
}

function getBossLeaderboardPanelHtml({leaderboardRefreshLeft=0}={}){
  normalizeBossLeaderboardState();
  const scope = globalBossLeaderboardScope;
  const metrics = bossLeaderboardMetrics[scope] || bossLeaderboardMetrics.current;
  const metric = metrics[globalBossLeaderboardMetric] ? globalBossLeaderboardMetric : Object.keys(metrics)[0];
  const metricConfig = metrics[metric];
  const rows = getBossMetricRows(scope, metric, 10);
  const metricButtons = Object.entries(metrics).map(([id, item])=>`
    <button class="bossMetricBtn ${metric === id ? "active" : ""}" type="button" data-boss-metric="${id}" title="${escapeHtml(item.tooltip)}" aria-label="${escapeHtml(item.label)}">
      <span>${item.icon}</span>
    </button>
  `).join("");
  const rowsHtml = rows.length
    ? rows.map((entry, index)=>`
        <div class="leaderboardRow ${entry.uid === currentAccount?.uid ? "mine" : ""}">
          <div class="leaderboardRank">${index + 1}</div>
          <div class="leaderboardName">${escapeHtml(entry.nick || "Gracz")}</div>
          <div class="leaderboardValue">${format(entry.metricValue)} ${escapeHtml(metricConfig.suffix)}</div>
        </div>
      `).join("")
    : `<div class="leaderboardEmpty">${escapeHtml(metricConfig.empty)}</div>`;

  return `
    <div class="bossLeaderboardHead">
      <div>
        <h3>Leaderboard</h3>
        <small id="bossLeaderboardRefreshTimer">Odświeżenie leaderboarda za: ${formatDuration(leaderboardRefreshLeft)}</small>
      </div>
      <div class="bossLeaderboardTabs" role="tablist" aria-label="Zakres leaderboardu bossa">
        <button class="bossLeaderboardTab ${scope === "current" ? "active" : ""}" type="button" data-boss-scope="current">Ten Boss</button>
        <button class="bossLeaderboardTab ${scope === "all" ? "active" : ""}" type="button" data-boss-scope="all">Wszystkie</button>
      </div>
    </div>
    <div class="bossMetricTabs" role="tablist" aria-label="Kategorie leaderboardu bossa">
      ${metricButtons}
    </div>
    <div class="bossLeaderboardHint" title="${escapeHtml(metricConfig.tooltip)}">
      ${metricConfig.icon} ${escapeHtml(metricConfig.label)}
    </div>
    ${getBossRewardRowsHtml()}
    <div class="leaderboardRows bossLeaderboardRows">${rowsHtml}</div>
  `;
}

function hookBossLeaderboardControls(){
  document.querySelectorAll("[data-boss-scope]").forEach(button => {
    button.addEventListener("click", () => {
      globalBossLeaderboardScope = button.dataset.bossScope === "all" ? "all" : "current";
      normalizeBossLeaderboardState();
      renderGlobalBossPanel();
    });
  });
  document.querySelectorAll("[data-boss-metric]").forEach(button => {
    button.addEventListener("click", () => {
      globalBossLeaderboardMetric = button.dataset.bossMetric || "damage";
      normalizeBossLeaderboardState();
      renderGlobalBossPanel();
    });
  });
}

function getMyBossDamage(){
  if(currentAccount?.uid){
    return globalBossLeaderboardData?.[currentAccount.uid]?.damage || 0;
  }
  return Number(sessionStorage.getItem("kretGuestBossDamage_" + (globalBossData?.bossId || "none")) || 0);
}

function getActivePersonalBossRewards(){
  const now = Date.now();
  return (Array.isArray(game.bossRewardBoosts) ? game.bossRewardBoosts : [])
    .filter(boost=>boost && (!boost.endsAt || boost.endsAt > now));
}

function getBossCommunityUpgradeHtml({communityUpgrade, communityDepositMax}){
  const percent = Math.min(100, (communityUpgrade.contributed / GLOBAL_BOSS_CONFIG.communityUpgradeCost) * 100);
  return `
    <div class="bossUpgradeBox communityBossUpgrade">
      <b>Wspólne wzmocnienie bossa</b>
      <span>${communityUpgrade.completed ? "+30% obrażeń dla wszystkich aktywne" : `${formatDiamond(communityUpgrade.contributed)} / ${formatDiamond(GLOBAL_BOSS_CONFIG.communityUpgradeCost)} zebrane`}</span>
      <div class="communityBossProgress"><div style="width:${percent}%"></div></div>
      <button class="bossUpgradeBtn" id="communityBossDepositBtn" ${communityUpgrade.completed || communityDepositMax <= 0 ? "disabled" : ""}>
        ${communityUpgrade.completed ? "GLOBALNY BONUS AKTYWNY" : "Dorzuć diamenty"}
      </button>
    </div>
  `;
}

function getBossUpgradeHtml({upgradeLevel, upgradeCost, canUpgrade, personalBonus, communityUpgrade, communityDepositMax}){
  return `
    <div class="bossUpgradeBox">
      <b>Osobiste wzmocnienie bossa</b>
      <span>Poziom ${upgradeLevel}/${GLOBAL_BOSS_CONFIG.upgradeMax} | +${personalBonus}% obrażeń</span>
      <button class="bossUpgradeBtn" id="globalBossUpgradeBtn" ${upgradeLevel >= GLOBAL_BOSS_CONFIG.upgradeMax || !canUpgrade ? "disabled" : ""}>
        ${upgradeLevel >= GLOBAL_BOSS_CONFIG.upgradeMax ? "MAX" : `Ulepsz za ${formatDiamond(upgradeCost)}`}
      </button>
    </div>
    ${getBossCommunityUpgradeHtml({communityUpgrade, communityDepositMax})}
  `;
}

function hookCommunityBossUpgradeControls(){
  document.getElementById("communityBossDepositBtn")?.addEventListener("click", openCommunityBossDepositModal);
}

function getCommunityBossDepositMax(){
  const community = getCommunityBossUpgradeData();
  const remaining = Math.max(0, GLOBAL_BOSS_CONFIG.communityUpgradeCost - community.contributed);
  return Math.min(Math.floor(game.diamonds || 0), remaining, GLOBAL_BOSS_CONFIG.communityUpgradeCost);
}

function updateCommunityBossDepositModal(){
  const community = getCommunityBossUpgradeData();
  const max = getCommunityBossDepositMax();
  const currentValue = Math.min(max, Math.max(0, Math.floor(Number(communityBossDepositModalRange?.value) || max)));
  const percent = Math.min(100, (community.contributed / GLOBAL_BOSS_CONFIG.communityUpgradeCost) * 100);
  if(communityBossDepositProgressText){
    communityBossDepositProgressText.textContent = `${formatDiamond(community.contributed)} / ${formatDiamond(GLOBAL_BOSS_CONFIG.communityUpgradeCost)}`;
  }
  if(communityBossDepositDiamondsText){
    communityBossDepositDiamondsText.textContent = formatDiamond(game.diamonds || 0);
  }
  if(communityBossDepositBarFill){
    communityBossDepositBarFill.style.width = percent + "%";
  }
  if(communityBossDepositModalRange){
    communityBossDepositModalRange.max = String(max);
    communityBossDepositModalRange.value = String(currentValue);
    communityBossDepositModalRange.disabled = community.completed || max <= 0;
    communityBossDepositModalRange.style.setProperty("--deposit-progress", max > 0 ? `${(currentValue / max) * 100}%` : "0%");
  }
  if(communityBossDepositModalValue){
    communityBossDepositModalValue.textContent = formatDiamond(currentValue);
  }
  if(communityBossDepositConfirm){
    communityBossDepositConfirm.disabled = community.completed || max <= 0 || currentValue <= 0;
  }
}

function openCommunityBossDepositModal(){
  if(!currentAccount?.uid){
    renderGlobalBossPanel();
    return;
  }
  if(!communityBossDepositModal) return;
  const max = getCommunityBossDepositMax();
  if(communityBossDepositModalRange){
    communityBossDepositModalRange.value = String(max);
  }
  updateCommunityBossDepositModal();
  communityBossDepositModal.classList.add("open");
}

function closeCommunityBossDepositModal(){
  communityBossDepositModal?.classList.remove("open");
}

function renderGlobalBossPanel(){
  if(!globalBossContent) return;
  const boss = globalBossData;
  if(!boss){
    globalBossContent.innerHTML = `<div class="bossEmpty">Ładowanie globalnego bossa...</div>`;
    return;
  }
  const type = getBossType(boss.bossType);
  const hp = Math.max(0, Number(boss.currentHp) || 0);
  const maxHp = Math.max(1, Number(boss.maxHp) || 1);
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const defeated = !!boss.defeated || hp <= 0;
  const rows = getBossLeaderboardRows(10);
  const myDamage = getMyBossDamage();
  const upgradeLevel = getBossDamageUpgradeLevel();
  const upgradeCost = getBossDamageUpgradeCost();
  const canUpgrade = upgradeLevel < GLOBAL_BOSS_CONFIG.upgradeMax && (game.diamonds || 0) >= upgradeCost;
  const personalBonus = Math.round(getBossPersonalDamageBonus() * 100);
  const communityUpgrade = getCommunityBossUpgradeData();
  const communityRemaining = Math.max(0, GLOBAL_BOSS_CONFIG.communityUpgradeCost - communityUpgrade.contributed);
  const communityDepositMax = Math.min(Math.floor(game.diamonds || 0), communityRemaining, GLOBAL_BOSS_CONFIG.communityUpgradeCost);
  const refreshLeft = Math.max(0, (boss.nextRefreshAt || getNextWarsawMidnightMs()) - Date.now());
  const rewardHtml = getActivePersonalBossRewards().length
    ? getActivePersonalBossRewards().map(boost=>`
        <div class="bossRewardChip">
          <span>${escapeHtml(boost.label || "Nagroda bossa")}</span>
          <span>x${(Number(boost.value) || 1).toFixed((Number(boost.value) || 1) % 1 ? 1 : 0)} | ${formatDuration((boost.endsAt || Date.now()) - Date.now())}</span>
        </div>
      `).join("")
    : `<div class="bossEmpty">Brak aktywnych nagród. Zadaj obrażenia bossowi i poczekaj na jego pokonanie.</div>`;
  const rowsHtml = rows.length
    ? rows.map((entry, index)=>`
        <div class="leaderboardRow ${entry.uid === currentAccount?.uid ? "mine" : ""}">
          <div class="leaderboardRank">${index + 1}</div>
          <div class="leaderboardName">${escapeHtml(entry.nick || "Gracz")}</div>
          <div class="leaderboardValue">${format(entry.damage || 0)} obrażeń</div>
        </div>
      `).join("")
    : `<div class="leaderboardEmpty">Brak wpisów. Zalogowani gracze pojawią się po zadaniu obrażeń.</div>`;

  globalBossContent.innerHTML = `
    <div class="bossHeroCard">
      <div class="bossTop">
        <div class="bossVisual ${type.css} ${defeated ? "defeated" : ""}" id="globalBossVisual">
          <div class="bossAura"></div>
          <div class="bossNose"></div>
        </div>
        <div class="bossMeta">
          <h3>${escapeHtml(boss.bossName || type.name)}</h3>
          <p>${escapeHtml(type.description)}</p>
          <div class="bossTags">
            <span class="bossTag">Poziom ${boss.bossLevel || 1}</span>
            <span class="bossTag">${defeated ? "Pokonany" : "Żyje"}</span>
            <span class="bossTag">Skin: ${escapeHtml(type.skinName)}</span>
          </div>
        </div>
      </div>
      <div class="bossHpWrap">
        <div class="bossHpBar"><div class="bossHpFill" style="width:${hpPercent}%"></div></div>
        <div class="bossHpText">
          <span>HP: ${format(hp)} / ${format(maxHp)}</span>
          <span>Razem: ${format(boss.totalDamage || 0)} obrażeń</span>
        </div>
      </div>
      <button class="bossAttackBtn" id="globalBossAttackBtn" ${defeated || globalBossBusy ? "disabled" : ""}>Uderz bossa: ${format(getBossClickDamage())} obrażeń</button>
    </div>

    <div class="bossInfoGrid">
      <div class="bossInfoBox"><b>Twoje obrażenia</b><span>${format(myDamage)} obrażeń</span></div>
        <div class="bossInfoBox"><b>Nowy boss za</b><span>${formatDuration(refreshLeft)}</span></div>
      <div class="bossInfoBox"><b>Obrażenia za klik</b><span>${format(getBossClickDamage())} obrażeń</span></div>
      <div class="bossInfoBox"><b>Tryb konta</b><span>${currentAccount ? "Online ranking" : "Gość bez rankingu"}</span></div>
    </div>

    ${getBossUpgradeHtml({upgradeLevel, upgradeCost, canUpgrade, personalBonus, communityUpgrade, communityDepositMax})}

    <div class="bossRewardBox">
      <b>Aktywne nagrody bossa</b>
      <div class="bossRewardList">${rewardHtml}</div>
    </div>

    <div class="bossLeaderboard">
      ${getBossLeaderboardPanelHtml({leaderboardRefreshLeft:getBossLeaderboardRefreshLeft()})}
    </div>
  `;

  document.getElementById("globalBossVisual")?.addEventListener("click", attackGlobalBoss);
  document.getElementById("globalBossAttackBtn")?.addEventListener("click", attackGlobalBoss);
  document.getElementById("globalBossUpgradeBtn")?.addEventListener("click", buyBossDamageUpgrade);
  hookCommunityBossUpgradeControls();
  hookBossLeaderboardControls();
  globalBossDockBtn?.classList.toggle("active", globalBossPanel?.classList.contains("open"));
}

function getBossRewardRowsHtml(){
  return `
    <div class="bossPlaceRewards">
      <div class="bossPlaceReward">TOP 1: boost 1h + skin + pet bossa + sakiewka</div>
      <div class="bossPlaceReward">TOP 2: boost 1h + skin + pet bossa + sakiewka</div>
      <div class="bossPlaceReward">TOP 3: boost 1h + skin + pet bossa + sakiewka</div>
      <div class="bossPlaceReward">TOP 4-10: boost 1h + pet bossa + sakiewka</div>
      <div class="bossPlaceReward">Uczestnicy: mały boost + sakiewka bossowa</div>
    </div>
  `;
}

function getBossLeaderboardRefreshLeft(){
  if(!nextGlobalBossLeaderboardRefreshAt) nextGlobalBossLeaderboardRefreshAt = getNextTenMinuteBoundaryMs();
  return Math.max(0, nextGlobalBossLeaderboardRefreshAt - Date.now());
}

function updateGlobalBossDynamicFields(){
  const boss = globalBossData;
  if(!boss) return;
  const hp = Math.max(0, Number(boss.currentHp) || 0);
  const maxHp = Math.max(1, Number(boss.maxHp) || 1);
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const defeated = !!boss.defeated || hp <= 0;
  const refreshLeft = Math.max(0, (boss.nextRefreshAt || getNextWarsawMidnightMs()) - Date.now());
  const hpFill = document.getElementById("eventBossHpFill");
  if(hpFill) hpFill.style.width = `${hpPercent}%`;
  const hpCurrent = document.getElementById("eventBossHpCurrent");
  if(hpCurrent) hpCurrent.textContent = `HP: ${format(hp)} / ${format(maxHp)}`;
  const totalDamage = document.getElementById("eventBossTotalDamage");
  if(totalDamage) totalDamage.textContent = `Łącznie: ${format(boss.totalDamage || 0)} obrażeń`;
  const myDamage = document.getElementById("eventBossMyDamage");
  if(myDamage) myDamage.textContent = `Twoje obrażenia: ${format(getMyBossDamage())}`;
  const respawnTimer = document.getElementById("eventBossRespawnTimer");
  if(respawnTimer) respawnTimer.textContent = `${defeated ? "Respawn bossa za:" : "Nowy boss za:"} ${formatDuration(refreshLeft)}`;
  const leaderboardTimer = document.getElementById("bossLeaderboardRefreshTimer");
  if(leaderboardTimer) leaderboardTimer.textContent = `Odświeżenie leaderboarda za: ${formatDuration(getBossLeaderboardRefreshLeft())}`;
  const attackBtn = document.getElementById("globalBossAttackBtn");
  if(attackBtn){
    attackBtn.disabled = defeated || globalBossBusy;
    attackBtn.textContent = `Uderz bossa: ${format(getBossClickDamage())} obrażeń`;
  }
  const visual = document.getElementById("globalBossVisual");
  if(visual) visual.classList.toggle("defeated", defeated);
}

function openGlobalBossEvent(){
  globalBossEventOpen = true;
  globalBossEventView?.classList.add("open");
  document.body.classList.add("globalBossMode");
  renderGlobalBossPanel();
}

function closeGlobalBossEvent(){
  globalBossEventOpen = false;
  globalBossEventView?.classList.remove("open");
  document.body.classList.remove("globalBossMode");
}

function renderGlobalBossEntryPanel(){
  if(!globalBossContent) return;
  const boss = globalBossData;
  const type = getBossType(boss?.bossType);
  globalBossContent.innerHTML = `
    <div class="bossEmpty">
      <b>Globalny Kret Boss jest teraz osobnym trybem eventowym.</b><br>
      ${boss ? `${escapeHtml(boss.bossName || type.name)} czeka w arenie online.` : "Ładowanie bossa online..."}
      <button class="bossAttackBtn" id="openGlobalBossFromPanel" type="button">Otwórz tryb eventu</button>
    </div>
  `;
  document.getElementById("openGlobalBossFromPanel")?.addEventListener("click", openGlobalBossEvent);
}

function renderGlobalBossPanel(){
  renderGlobalBossEntryPanel();
  renderGlobalBossEvent();
  globalBossDockBtn?.classList.toggle("active", globalBossEventOpen);
}

function renderGlobalBossEvent(){
  if(!globalBossEventContent) return;
  const boss = globalBossData;
  if(!boss){
    globalBossEventContent.innerHTML = `<div class="globalBossLocked"><div class="globalBossLockedCard"><div class="globalBossLockIcon">⌛</div><h3>Ładowanie bossa online...</h3></div></div>`;
    return;
  }

  const type = getBossType(boss.bossType);
  const hp = Math.max(0, Number(boss.currentHp) || 0);
  const maxHp = Math.max(1, Number(boss.maxHp) || 1);
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const defeated = !!boss.defeated || hp <= 0;
  const rows = getBossLeaderboardRows(10);
  const myDamage = getMyBossDamage();
  const upgradeLevel = getBossDamageUpgradeLevel();
  const upgradeCost = getBossDamageUpgradeCost();
  const canUpgrade = upgradeLevel < GLOBAL_BOSS_CONFIG.upgradeMax && (game.diamonds || 0) >= upgradeCost;
  const personalBonus = Math.round(getBossPersonalDamageBonus() * 100);
  const communityUpgrade = getCommunityBossUpgradeData();
  const communityRemaining = Math.max(0, GLOBAL_BOSS_CONFIG.communityUpgradeCost - communityUpgrade.contributed);
  const communityDepositMax = Math.min(Math.floor(game.diamonds || 0), communityRemaining, GLOBAL_BOSS_CONFIG.communityUpgradeCost);
  const refreshLeft = Math.max(0, (boss.nextRefreshAt || getNextWarsawMidnightMs()) - Date.now());
  const leaderboardRefreshLeft = getBossLeaderboardRefreshLeft();

  if(!currentAccount){
    globalBossEventContent.innerHTML = `
      <div class="globalBossLocked">
        <div class="globalBossLockedCard">
          <div class="globalBossLockIcon">🔒</div>
          <h3>Utwórz konto, żeby brać udział w evencie online</h3>
          <p>Globalny Kret Boss, ranking, obrażenia online i skiny TOP 3 są dostępne tylko dla kont.</p>
          <div class="onlineLockActions">
            <button id="globalBossCreateAccountBtn" type="button">UTWÓRZ KONTO</button>
            <button id="globalBossLoginBtn" type="button">ZALOGUJ SIĘ</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("globalBossCreateAccountBtn")?.addEventListener("click", () => {
      closeGlobalBossEvent();
      showAuthForm("register");
    });
    document.getElementById("globalBossLoginBtn")?.addEventListener("click", () => {
      closeGlobalBossEvent();
      showAuthForm("login");
    });
    return;
  }

  const rewardHtml = getActivePersonalBossRewards().length
    ? getActivePersonalBossRewards().map(boost=>`
        <div class="bossRewardChip">
          <span>${escapeHtml(boost.label || "Nagroda bossa")}</span>
          <span>x${(Number(boost.value) || 1).toFixed((Number(boost.value) || 1) % 1 ? 1 : 0)} | ${formatDuration((boost.endsAt || Date.now()) - Date.now())}</span>
        </div>
      `).join("")
    : `<div class="bossEmpty">Brak aktywnych nagród. Zadaj obrażenia bossowi i poczekaj na jego pokonanie.</div>`;
  const rowsHtml = rows.length
    ? rows.map((entry, index)=>`
        <div class="leaderboardRow ${entry.uid === currentAccount?.uid ? "mine" : ""}">
          <div class="leaderboardRank">${index + 1}</div>
          <div class="leaderboardName">${escapeHtml(entry.nick || "Gracz")}</div>
          <div class="leaderboardValue">${format(entry.damage || 0)} obrażeń</div>
        </div>
      `).join("")
    : `<div class="leaderboardEmpty">Brak wpisów. Zalogowani gracze pojawią się po zadaniu obrażeń.</div>`;

  globalBossEventContent.innerHTML = `
    <div class="globalBossEventGrid">
      <section class="globalBossArena">
        <div class="globalBossHeader">
          <div>
            <h3>${escapeHtml(boss.bossName || type.name)}</h3>
            <p>${escapeHtml(type.description)}</p>
          </div>
          <div class="globalBossRewardTop">${escapeHtml(type.rewardName || ("Nagroda TOP 3: " + type.skinName))}</div>
        </div>

        <div class="globalBossStage">
          <div class="bossVisual eventBossVisual ${type.css} ${defeated ? "defeated" : ""}" id="globalBossVisual">
            <div class="bossAura"></div>
            <div class="bossNose"></div>
          </div>
        </div>

        <div class="eventBossStats">
          <div class="eventBossHpBar"><div class="eventBossHpFill" id="eventBossHpFill" style="width:${hpPercent}%"></div></div>
          <div class="eventBossHpText">
            <span id="eventBossHpCurrent">HP: ${format(hp)} / ${format(maxHp)}</span>
            <span id="eventBossTotalDamage">Łącznie: ${format(boss.totalDamage || 0)} obrażeń</span>
          </div>
          <div class="eventBossInfoLine">
            <span id="eventBossMyDamage">Twoje obrażenia: ${format(myDamage)}</span>
            <span id="eventBossRespawnTimer">${defeated ? "Respawn bossa za:" : "Nowy boss za:"} ${formatDuration(refreshLeft)}</span>
          </div>
          <div class="eventBossActionRow">
            <button class="bossAttackBtn" id="globalBossAttackBtn" ${defeated || globalBossBusy ? "disabled" : ""}>Uderz bossa: ${format(getBossClickDamage())} obrażeń</button>
            <button class="bossUpgradeBtn" id="globalBossUpgradeBtn" ${upgradeLevel >= GLOBAL_BOSS_CONFIG.upgradeMax || !canUpgrade ? "disabled" : ""}>
              ${upgradeLevel >= GLOBAL_BOSS_CONFIG.upgradeMax ? `Osobisty bonus MAX (+${personalBonus}%)` : `Osobisty bonus +${personalBonus}% - ${formatDiamond(upgradeCost)}`}
            </button>
          </div>
          ${getBossCommunityUpgradeHtml({communityUpgrade, communityDepositMax})}
          <div class="bossRewardBox">
            <b>Aktywne nagrody bossa</b>
            <div class="bossRewardList">${rewardHtml}</div>
          </div>
        </div>
      </section>

      <aside class="globalBossSide bossLeaderboardPanel">
        ${getBossLeaderboardPanelHtml({leaderboardRefreshLeft})}
      </aside>
    </div>
  `;

  document.getElementById("globalBossVisual")?.addEventListener("click", attackGlobalBoss);
  document.getElementById("globalBossAttackBtn")?.addEventListener("click", attackGlobalBoss);
  document.getElementById("globalBossUpgradeBtn")?.addEventListener("click", buyBossDamageUpgrade);
  hookCommunityBossUpgradeControls();
  hookBossLeaderboardControls();
}

async function ensureGlobalBossReady(){
  if(!await initFirebase()) return;
  try{
    await loadGlobalBossSettings();
    await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "globalMoleBoss"), (boss) => {
      const now = Date.now();
      if(!boss || !boss.bossId){
        return makeGlobalBoss(1);
      }
      const nextRefreshAt = boss.nextRefreshAt || getNextWarsawMidnightMs(now);
      if(nextRefreshAt <= now){
        if(boss.defeated || (Number(boss.currentHp) || 0) <= 0){
          return makeGlobalBoss((Number(boss.bossLevel) || 1) + 1);
        }
        return Object.assign({}, boss, {nextRefreshAt:getNextWarsawMidnightMs(now)});
      }
      return boss;
    });
  }catch(err){
    console.warn("Globalny boss init error:", err);
  }
}

async function loadGlobalBossLeaderboard(renderPanel=true){
  if(!globalBossData?.bossId || !await initFirebase()) return;
  try{
    const [currentRows, allTimeRows] = await Promise.all([
      firebaseGet("globalMoleBossLeaderboard/" + globalBossData.bossId),
      firebaseGet("globalMoleBossAllTimeLeaderboard")
    ]);
    globalBossLeaderboardData = currentRows || {};
    globalBossAllTimeLeaderboardData = allTimeRows || {};
    lastGlobalBossLeaderboardRefreshAt = Date.now();
    nextGlobalBossLeaderboardRefreshAt = getNextTenMinuteBoundaryMs();
    if(renderPanel){
      renderGlobalBossPanel();
    }else{
      updateGlobalBossDynamicFields();
    }
  }catch(err){
    console.warn("Globalny boss leaderboard error:", err);
  }
}

async function startGlobalBossLive(){
  if(!await initFirebase()) return;
  await ensureGlobalBossReady();
  if(!globalBossStream){
    globalBossStream = firebaseModules.onValue(firebaseModules.ref(firebaseDb, "globalMoleBoss"), async (snapshot) => {
      const previousBoss = globalBossData;
      const previousId = globalBossData?.bossId;
      globalBossData = snapshot.exists() ? snapshot.val() : null;
      if(globalBossData?.bossId && globalBossData.bossId !== previousId){
        globalBossLeaderboardData = {};
        await loadGlobalBossLeaderboard();
      }
      populateAdminBossSelect();
      if(globalBossData?.defeated){
        setTimeout(()=>finalizeBossIfNeeded(globalBossData), 1800);
        setTimeout(()=>claimPendingOnlineRewards(), 2800);
      }
      const defeatedChanged = !!previousBoss?.defeated !== !!globalBossData?.defeated;
      if(!previousBoss || globalBossData?.bossId !== previousId || defeatedChanged){
        renderGlobalBossPanel();
      }else{
        updateGlobalBossDynamicFields();
      }
    }, (err) => console.warn("Globalny boss live error:", err));
  }
  if(!globalBossLeaderboardTimer){
    nextGlobalBossLeaderboardRefreshAt = getNextTenMinuteBoundaryMs();
    globalBossLeaderboardTimer = setInterval(() => {
      if(Date.now() >= nextGlobalBossLeaderboardRefreshAt){
        loadGlobalBossLeaderboard();
      }else{
        updateGlobalBossDynamicFields();
      }
    }, 1000);
  }
  if(!globalBossClockTimer){
    globalBossClockTimer = setInterval(() => {
      if(globalBossData?.nextRefreshAt && Date.now() >= globalBossData.nextRefreshAt){
        ensureGlobalBossReady();
      }
    }, 5000);
  }
}

function showBossDamageFloat(amount){
  const visual = document.getElementById("globalBossVisual");
  if(!visual) return;
  visual.classList.remove("hit");
  void visual.offsetWidth;
  visual.classList.add("hit");
  const node = document.createElement("div");
  node.className = "bossDamageFloat";
  node.textContent = `-${format(amount)}`;
  visual.appendChild(node);
  setTimeout(()=>node.remove(), 900);
}

async function saveBossDamageToLeaderboard(boss, damage){
  if(!currentAccount?.uid || !boss?.bossId || damage <= 0) return;
  await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, `globalMoleBossLeaderboard/${boss.bossId}/${currentAccount.uid}`), (entry) => {
    const currentDamage = Number(entry?.damage) || 0;
    const currentDiamonds = Number(entry?.diamondsSpent) || 0;
    return {
      uid:currentAccount.uid,
      nick:currentAccount.nick,
      bossId:boss.bossId,
      bossName:boss.bossName,
      damage:currentDamage + damage,
      diamondsSpent:currentDiamonds,
      updatedAt:Date.now()
    };
  });
  await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, `globalMoleBossAllTimeLeaderboard/${currentAccount.uid}`), (entry) => ({
    uid:currentAccount.uid,
    nick:currentAccount.nick,
    totalDamage:(Number(entry?.totalDamage) || 0) + damage,
    totalDiamondsSpent:Number(entry?.totalDiamondsSpent) || 0,
    defeatedBossHelps:Number(entry?.defeatedBossHelps) || 0,
    updatedAt:Date.now()
  }));
  const currentDamage = Number(globalBossLeaderboardData?.[currentAccount.uid]?.damage) || 0;
  const currentDiamonds = Number(globalBossLeaderboardData?.[currentAccount.uid]?.diamondsSpent) || 0;
  globalBossLeaderboardData = Object.assign({}, globalBossLeaderboardData, {
    [currentAccount.uid]: {
      uid:currentAccount.uid,
      nick:currentAccount.nick,
      bossId:boss.bossId,
      bossName:boss.bossName,
      damage:currentDamage + damage,
      diamondsSpent:currentDiamonds,
      updatedAt:Date.now()
    }
  });
  const currentAllTime = globalBossAllTimeLeaderboardData?.[currentAccount.uid] || {};
  globalBossAllTimeLeaderboardData = Object.assign({}, globalBossAllTimeLeaderboardData, {
    [currentAccount.uid]: Object.assign({}, currentAllTime, {
      uid:currentAccount.uid,
      nick:currentAccount.nick,
      totalDamage:(Number(currentAllTime.totalDamage) || 0) + damage,
      updatedAt:Date.now()
    })
  });
  updateGlobalBossDynamicFields();
}

async function saveBossDiamondSpendToLeaderboard(boss, amount){
  if(!currentAccount?.uid || !boss?.bossId || amount <= 0) return;
  await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, `globalMoleBossLeaderboard/${boss.bossId}/${currentAccount.uid}`), (entry) => ({
    uid:currentAccount.uid,
    nick:currentAccount.nick,
    bossId:boss.bossId,
    bossName:boss.bossName,
    damage:Number(entry?.damage) || 0,
    diamondsSpent:(Number(entry?.diamondsSpent) || 0) + amount,
    updatedAt:Date.now()
  }));
  await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, `globalMoleBossAllTimeLeaderboard/${currentAccount.uid}`), (entry) => ({
    uid:currentAccount.uid,
    nick:currentAccount.nick,
    totalDamage:Number(entry?.totalDamage) || 0,
    totalDiamondsSpent:(Number(entry?.totalDiamondsSpent) || 0) + amount,
    defeatedBossHelps:Number(entry?.defeatedBossHelps) || 0,
    updatedAt:Date.now()
  }));
  const currentBossEntry = globalBossLeaderboardData?.[currentAccount.uid] || {};
  globalBossLeaderboardData = Object.assign({}, globalBossLeaderboardData, {
    [currentAccount.uid]: Object.assign({}, currentBossEntry, {
      uid:currentAccount.uid,
      nick:currentAccount.nick,
      bossId:boss.bossId,
      bossName:boss.bossName,
      damage:Number(currentBossEntry.damage) || 0,
      diamondsSpent:(Number(currentBossEntry.diamondsSpent) || 0) + amount,
      updatedAt:Date.now()
    })
  });
  const currentAllTime = globalBossAllTimeLeaderboardData?.[currentAccount.uid] || {};
  globalBossAllTimeLeaderboardData = Object.assign({}, globalBossAllTimeLeaderboardData, {
    [currentAccount.uid]: Object.assign({}, currentAllTime, {
      uid:currentAccount.uid,
      nick:currentAccount.nick,
      totalDiamondsSpent:(Number(currentAllTime.totalDiamondsSpent) || 0) + amount,
      updatedAt:Date.now()
    })
  });
}

async function attackGlobalBoss(){
  if(globalBossBusy || !globalBossData || globalBossData.defeated) return;
  if(!currentAccount?.uid){
    renderGlobalBossPanel();
    return;
  }
  const now = Date.now();
  if(now - lastBossAttackAt < GLOBAL_BOSS_CONFIG.attackCooldownMs) return;
  lastBossAttackAt = now;
  if(!await initFirebase()) return;

  const damage = getBossClickDamage();
  globalBossBusy = true;
  updateGlobalBossDynamicFields();
  showBossDamageFloat(damage);
  try{
    const transaction = await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "globalMoleBoss"), (boss) => {
      if(!boss || boss.defeated || boss.bossId !== globalBossData.bossId) return boss;
      const currentHp = Math.max(0, Number(boss.currentHp) || 0);
      if(currentHp <= 0) return Object.assign({}, boss, {defeated:true, defeatedAt:boss.defeatedAt || Date.now()});
      const nextHp = Math.max(0, currentHp - damage);
      return Object.assign({}, boss, {
        currentHp:nextHp,
        totalDamage:(Number(boss.totalDamage) || 0) + damage,
        defeated:nextHp <= 0,
        defeatedAt:nextHp <= 0 ? Date.now() : null
      });
    });
    const updatedBoss = transaction.snapshot?.val?.() || globalBossData;
    if(currentAccount?.uid){
      await saveBossDamageToLeaderboard(updatedBoss, damage);
    }else{
      const key = "kretGuestBossDamage_" + updatedBoss.bossId;
      sessionStorage.setItem(key, String(Number(sessionStorage.getItem(key) || 0) + damage));
    }
    if(updatedBoss?.defeated){
      await finalizeBossIfNeeded(updatedBoss);
    }
  }catch(err){
    console.warn("Globalny boss attack error:", err);
    spawnPopup("Nie udało się uderzyć bossa online.", false, false, true);
  }finally{
    globalBossBusy = false;
    updateGlobalBossDynamicFields();
  }
}

function getBossRewardForRank(rank){
  if(rank === 1) return {boosts:[{type:"money", value:3, label:"TOP 1: Mnożnik punktów"},{type:"luck", value:2, label:"TOP 1: Szczęście"},{type:"bossDamage", value:1.4, label:"TOP 1: Obrażenia bossa"}], pouch:{diamonds:150}, enchant:{type:"luck", tier:2}};
  if(rank === 2) return {boosts:[{type:"money", value:2.5, label:"TOP 2: Mnożnik punktów"},{type:"luck", value:1.8, label:"TOP 2: Szczęście"},{type:"bossDamage", value:1.3, label:"TOP 2: Obrażenia bossa"}], pouch:{diamonds:100}, enchant:{type:"coins", tier:2}};
  if(rank === 3) return {boosts:[{type:"money", value:2, label:"TOP 3: Mnożnik punktów"},{type:"luck", value:1.6, label:"TOP 3: Szczęście"},{type:"bossDamage", value:1.2, label:"TOP 3: Obrażenia bossa"}], pouch:{diamonds:75}, enchant:{type:"variants", tier:2}};
  if(rank <= 10) return {boosts:[{type:"money", value:1.5, label:"TOP 10: Mnożnik punktów"},{type:"luck", value:1.25, label:"TOP 10: Szczęście"}], pouch:{diamonds:35}, enchant:{type:"luck", tier:1}};
  return {boosts:[{type:"money", value:1.2, label:"Udział w bossie"}], pouch:{diamonds:15}, enchant:{type:"coins", tier:1}};
}

function getBossPetReward(type, rank){
  if(rank > 10) return null;
  const base = rank === 1 ? {click:260, multi:.9, diamond:.13} : rank === 2 ? {click:210, multi:.72, diamond:.1} : rank === 3 ? {click:175, multi:.58, diamond:.08} : {click:120, multi:.38, diamond:.05};
  return {
    id:`boss_pet_${type.type}`,
    name:`Pet ${type.name}`,
    icon:type.type === "hell" ? "🔥" : type.type === "dark" ? "🌑" : type.type === "gold" ? "👑" : type.type === "radio" ? "☢" : "❄",
    rarity:"Boss",
    click:base.click,
    multi:base.multi,
    diamond:base.diamond,
    color:type.accent || "#fff",
    secret:true,
    rank
  };
}

function makeBossPetInstance(pet){
  const variant = "normal";
  const shiny = false;
  const mult = typeof getPetVariantMultiplier === "function" ? getPetVariantMultiplier({variant, shiny}) : 1;
  const displayName = typeof getPetDisplayNameWithVariant === "function" ? getPetDisplayNameWithVariant(pet.name, variant, shiny) : pet.name;
  const instance = {
    uid:`pet_${game.petSeq++}`,
    templateId:pet.id,
    eggId:"global_boss",
    name:displayName,
    displayName,
    baseName:pet.name,
    templateName:pet.name,
    icon:pet.icon,
    rarity:pet.rarity || "Boss",
    baseClick:pet.click,
    baseMulti:pet.multi,
    baseDiamond:pet.diamond,
    click:+(pet.click * mult).toFixed(3),
    multi:+(pet.multi * mult).toFixed(4),
    diamond:+(pet.diamond * mult).toFixed(4),
    color:pet.color,
    sourceEgg:"Globalny Kret Boss",
    secret:true,
    variant,
    shiny,
    bossRewardRank:pet.rank || 0
  };
  instance.variantKey = typeof getPetVariantKey === "function" ? getPetVariantKey(instance) : instance.templateId;
  instance.powerRank = typeof getPetPowerRank === "function" ? getPetPowerRank(instance) : 999999;
  return instance;
}

function showBossDropToast({icon="🎁", name="Drop", rarity="Boss", amount=""}={}){
  if(!bossDropFeed) return;
  const toast = document.createElement("div");
  toast.className = "bossDropToast";
  toast.innerHTML = `
    <div class="bossDropIcon">${escapeHtml(icon)}</div>
    <div class="bossDropText">
      <b>${escapeHtml(name)}</b>
      <span>${escapeHtml(amount || rarity)}</span>
    </div>
  `;
  bossDropFeed.appendChild(toast);
  setTimeout(()=>toast.classList.add("leaving"), 3200);
  setTimeout(()=>toast.remove(), 4100);
}

let bossRewardModalQueue = [];
let bossRewardModalOpen = false;

function getBossRewardIcon(type){
  if(type === "money") return "🪙";
  if(type === "luck") return "🍀";
  if(type === "bossDamage") return "⚔";
  if(type === "diamonds") return "💎";
  if(type === "pet") return "🐾";
  if(type === "skin") return "✨";
  return "🎁";
}

function formatBossBoostValue(boost={}){
  const value = Number(boost.value) || 1;
  if(value >= 1) return `x${value.toFixed(value % 1 ? 2 : 0).replace(/\.?0+$/, "")}`;
  return `+${Math.round(value * 100)}%`;
}

function getBossRewardModalItems(reward){
  const items = [];
  if(Array.isArray(reward?.boosts)){
    reward.boosts.forEach(boost=>{
      items.push({
        icon:getBossRewardIcon(boost.type),
        name:boost.label || "Boost bossa",
        meta:formatBossBoostValue(boost),
        rarity:"Boost 1h"
      });
    });
  }
  const diamonds = Math.max(0, Math.floor(Number(reward?.pouch?.diamonds) || 0));
  if(diamonds > 0){
    items.push({
      icon:getBossRewardIcon("diamonds"),
      name:"Sakiewka bossowa",
      meta:`+${formatDiamond(diamonds)}`,
      rarity:"Diamenty"
    });
  }
  if(reward?.pet){
    items.push({
      icon:reward.pet.icon || getBossRewardIcon("pet"),
      name:reward.pet.name || "Pet bossa",
      meta:"Pet",
      rarity:reward.pet.rarity || "Boss"
    });
  }
  if(reward?.skin){
    items.push({
      icon:getBossRewardIcon("skin"),
      name:reward.skin.name || "Skin bossa",
      meta:"Skin",
      rarity:"TOP 3"
    });
  }
  if(reward?.enchant){
    items.push({
      icon:"BOOK",
      name:"Enchant bossa",
      meta:`Tier ${Number(reward.enchant.tier) || 1}`,
      rarity:"Książka"
    });
  }
  return items;
}

function showBossRewardModal(payload){
  if(!payload?.items?.length) return;
  bossRewardModalQueue.push(payload);
  if(bossRewardModalOpen) return;

  const renderNext = () => {
    const next = bossRewardModalQueue.shift();
    if(!next){
      bossRewardModalOpen = false;
      return;
    }
    bossRewardModalOpen = true;
    const overlay = document.createElement("div");
    overlay.className = "bossRewardModalOverlay";
    const rankText = Number(next.rank) ? `Miejsce #${Number(next.rank)}` : "Udział w bossie";
    overlay.innerHTML = `
      <div class="bossRewardModalCard" role="dialog" aria-modal="true" aria-label="Nagrody z bossa">
        <div class="bossRewardModalGlow"></div>
        <div class="bossRewardModalHeader">
          <span>GLOBALNY KRET BOSS</span>
          <b>Nagrody z bossa</b>
          <small>${escapeHtml(next.bossName || "Pokonany boss")} · ${escapeHtml(rankText)}</small>
        </div>
        <div class="bossRewardModalItems">
          ${next.items.map(item=>`
            <div class="bossRewardModalItem" title="${escapeHtml(item.name)}">
              <i>${item.icon}</i>
              <strong>${escapeHtml(item.meta || "")}</strong>
              <small>${escapeHtml(item.rarity || "")}</small>
            </div>
          `).join("")}
        </div>
        <button class="bossRewardModalOk" type="button">OK</button>
      </div>
    `;
    document.body.appendChild(overlay);
    const close = () => {
      overlay.classList.add("closing");
      setTimeout(()=>{
        overlay.remove();
        renderNext();
      }, 220);
    };
    overlay.querySelector(".bossRewardModalOk")?.addEventListener("click", close);
  };

  renderNext();
}

async function finalizeBossIfNeeded(boss){
  if(!boss?.bossId || lastBossFinalizeId === boss.bossId) return;
  lastBossFinalizeId = boss.bossId;
  try{
    if(await firebaseGet("globalMoleBossHistory/" + boss.bossId)) return;
    const leaderboard = await firebaseGet("globalMoleBossLeaderboard/" + boss.bossId) || {};
    const rows = Object.values(leaderboard)
      .filter(entry=>entry && entry.uid && typeof entry.damage === "number")
      .sort((a, b)=>b.damage - a.damage);
    await firebaseSet("globalMoleBossHistory/" + boss.bossId, {
      boss,
      defeatedAt:boss.defeatedAt || Date.now(),
      leaderboard:rows.slice(0, 50)
    });
    const type = getBossType(boss.bossType);
    const rewardPatch = {};
    rows.forEach((entry, index)=>{
      const rank = index + 1;
      const reward = getBossRewardForRank(rank);
      rewardPatch[`${entry.uid}/${boss.bossId}`] = {
        kind:"boss",
        bossId:boss.bossId,
        bossName:boss.bossName,
        bossType:boss.bossType,
        rank,
        damage:entry.damage,
        boosts:reward.boosts,
        durationMs:GLOBAL_BOSS_CONFIG.rewardDurationMs,
        pouch:reward.pouch || null,
        pet:getBossPetReward(type, rank),
        skin:rank <= 3 ? {
          id:type.skinId,
          name:type.skinName,
          skinClass:type.skinClass,
          accent:type.accent,
          aura:type.aura
        } : null,
        createdAt:Date.now(),
        claimed:false
      };
    });
    if(Object.keys(rewardPatch).length){
      await firebaseUpdate("globalMoleBossRewards", rewardPatch);
      if(currentAccount?.uid && rewardPatch[`${currentAccount.uid}/${boss.bossId}`]){
        setTimeout(()=>claimPendingOnlineRewards(), 650);
      }
    }
    const helpDamageRequired = Math.max(1, (Number(boss.maxHp) || 0) * 0.01);
    const helpers = rows.filter(entry => Number(entry.damage) >= helpDamageRequired);
    if(helpers.length){
      await Promise.all(helpers.map(entry => firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, `globalMoleBossAllTimeLeaderboard/${entry.uid}`), (stats) => ({
        uid:entry.uid,
        nick:entry.nick || "Gracz",
        totalDamage:Number(stats?.totalDamage) || Number(entry.damage) || 0,
        totalDiamondsSpent:Number(stats?.totalDiamondsSpent) || Number(entry.diamondsSpent) || 0,
        defeatedBossHelps:(Number(stats?.defeatedBossHelps) || 0) + 1,
        updatedAt:Date.now()
      }))));
      helpers.forEach(entry => {
        const current = globalBossAllTimeLeaderboardData?.[entry.uid] || {};
        globalBossAllTimeLeaderboardData[entry.uid] = Object.assign({}, current, {
          uid:entry.uid,
          nick:entry.nick || current.nick || "Gracz",
          defeatedBossHelps:(Number(current.defeatedBossHelps) || 0) + 1,
          updatedAt:Date.now()
        });
      });
    }
  }catch(err){
    console.warn("Globalny boss finalize error:", err);
    lastBossFinalizeId = null;
  }
}

function makeBossSkinInstance(skin){
  return {
    uid:`skin_${game.skinSeq++}`,
    templateId:skin.id,
    crateId:"global_boss",
    name:skin.name,
    displayName:skin.name,
    skinClass:skin.skinClass,
    rarity:"Boss",
    accent:skin.accent || "#fff",
    sourceCrate:"Globalny Kret Boss",
    aura:skin.aura || "Aura bossa",
    powerRank:999999
  };
}

async function claimPendingOnlineRewards(){
  if(!currentAccount?.uid || !await initFirebase()) return;
  try{
    const rewards = await firebaseGet("globalMoleBossRewards/" + currentAccount.uid) || {};
    const patch = {};
    let claimedCount = 0;
    const bossRewardModals = [];
    Object.entries(rewards).forEach(([rewardId, reward])=>{
      if(!reward || reward.claimed || game.bossClaimedRewards?.[rewardId]) return;
      const now = Date.now();
      game.bossClaimedRewards = game.bossClaimedRewards && typeof game.bossClaimedRewards === "object" ? game.bossClaimedRewards : {};
      game.bossRewardBoosts = Array.isArray(game.bossRewardBoosts) ? game.bossRewardBoosts : [];
      game.weeklyLeaderboardRewards = Array.isArray(game.weeklyLeaderboardRewards) ? game.weeklyLeaderboardRewards : [];
      game.bossClaimedRewards[rewardId] = now;
      if(Array.isArray(reward.boosts)){
        reward.boosts.forEach((boost, index)=>{
          game.bossRewardBoosts.push({
            id:`${rewardId}_${index}_${boost.type}`,
            type:boost.type,
            value:Number(boost.value) || 1,
            label:boost.label || "Nagroda online",
            startedAt:now,
            endsAt:now + (Number(reward.durationMs) || GLOBAL_BOSS_CONFIG.rewardDurationMs)
          });
        });
      }
      if(reward.kind === "boss"){
        const modalItems = getBossRewardModalItems(reward);
        if(modalItems.length){
          bossRewardModals.push({
            bossName:reward.bossName,
            rank:reward.rank,
            items:modalItems
          });
        }
      }
      if(reward.pouch){
        const diamonds = Math.max(0, Math.floor(Number(reward.pouch.diamonds) || 0));
        if(diamonds > 0){
          game.diamonds = (game.diamonds || 0) + diamonds;
          showBossDropToast({icon:"💎", name:"Sakiewka bossowa", rarity:"Nagroda bossa", amount:`+${formatDiamond(diamonds)} diaxów`});
        }
      }
      if(reward.pet){
        game.pets = Array.isArray(game.pets) ? game.pets : [];
        const pet = makeBossPetInstance(reward.pet);
        game.pets.push(pet);
        window.incrementExistCount?.("pets", pet.templateId || reward.pet.id || "boss_pet");
        showBossDropToast({icon:pet.icon || "🐾", name:pet.displayName || pet.name, rarity:"Pet bossa"});
      }
      if(reward.skin && !getSkinByTemplateId(reward.skin.id)){
        game.skins = Array.isArray(game.skins) ? game.skins : [];
        const skin = makeBossSkinInstance(reward.skin);
        game.skins.push(skin);
        window.incrementExistCount?.("skins", skin.templateId || reward.skin.id || "boss_skin");
        showBossDropToast({icon:"✨", name:skin.displayName || skin.name, rarity:"Skin TOP 3"});
      }
      if(reward.enchant){
        game.enchants = Array.isArray(game.enchants) ? game.enchants : [];
        const typeId = reward.enchant.type || "luck";
        const tier = Math.max(1, Math.min(3, Number(reward.enchant.tier) || 1));
        if(typeof addEnchantToInventory === "function") addEnchantToInventory(typeId, tier, 1);
        else game.enchants.push(makeAdminGiftEnchant(`${typeId}:t${tier}`));
        showBossDropToast({icon:"BOOK", name:"Enchant bossa", rarity:`Tier ${tier}`});
      }
      if(reward.kind === "weeklyLeaderboard"){
        game.diamonds = (game.diamonds || 0) + (Number(reward.diamonds) || 0);
        game.weeklyLeaderboardRewards.push({
          id:rewardId,
          category:reward.category,
          rank:reward.rank,
          diamonds:Number(reward.diamonds) || 0,
          claimedAt:now
        });
      }
      patch[`${rewardId}/claimed`] = true;
      patch[`${rewardId}/claimedAt`] = now;
      claimedCount++;
    });
    if(claimedCount){
      await firebaseUpdate("globalMoleBossRewards/" + currentAccount.uid, patch);
      game.bossRewardBoosts = game.bossRewardBoosts.filter(boost=>!boost.endsAt || boost.endsAt > Date.now());
      game.uiDirty = true;
      update(true, true);
      await saveCloudNow();
      spawnPopup(`Odebrano nagrody online: ${claimedCount}`, false, false, true);
      bossRewardModals.forEach(showBossRewardModal);
    }
  }catch(err){
    console.warn("Online reward claim error:", err);
  }
}

async function syncBossUpgrade(){
  if(!currentAccount?.uid || !await initFirebase()) return;
  try{
    const online = await firebaseGet("globalMoleBossUpgrades/" + currentAccount.uid);
    if(online && typeof online.damageBoostLevel === "number"){
      game.bossDamageUpgrade = Math.max(getBossDamageUpgradeLevel(), online.damageBoostLevel);
    }else{
      await firebaseSet("globalMoleBossUpgrades/" + currentAccount.uid, {
        uid:currentAccount.uid,
        nick:currentAccount.nick,
        damageBoostLevel:getBossDamageUpgradeLevel(),
        damageBonus:getBossPersonalDamageBonus(),
        updatedAt:Date.now()
      });
    }
  }catch(err){
    console.warn("Boss upgrade sync error:", err);
  }
}

async function buyBossDamageUpgrade(){
  if(!currentAccount?.uid){
    renderGlobalBossPanel();
    return;
  }
  const level = getBossDamageUpgradeLevel();
  if(level >= GLOBAL_BOSS_CONFIG.upgradeMax) return;
  const cost = getBossDamageUpgradeCost();
  if((game.diamonds || 0) < cost){
    spawnPopup("Za mało diamentów!", false, false, true);
    return;
  }
  game.diamonds -= cost;
  game.bossDamageUpgrade = level + 1;
  game.uiDirty = true;
  update(true, true);
  renderGlobalBossPanel();
  if(currentAccount?.uid && await initFirebase()){
    await firebaseSet("globalMoleBossUpgrades/" + currentAccount.uid, {
      uid:currentAccount.uid,
      nick:currentAccount.nick,
      damageBoostLevel:getBossDamageUpgradeLevel(),
      damageBonus:getBossPersonalDamageBonus(),
      updatedAt:Date.now()
    });
    await saveCloudNow();
  }
}

async function contributeCommunityBossUpgrade(){
  if(!currentAccount?.uid){
    renderGlobalBossPanel();
    return;
  }
  const amount = Math.max(0, Math.floor(Number(communityBossDepositModalRange?.value) || 0));
  const community = getCommunityBossUpgradeData();
  const remaining = Math.max(0, GLOBAL_BOSS_CONFIG.communityUpgradeCost - community.contributed);
  const spend = Math.min(amount, remaining, Math.floor(game.diamonds || 0), GLOBAL_BOSS_CONFIG.communityUpgradeCost);
  if(community.completed){
    spawnPopup("Globalny boss upgrade jest juz aktywny!", false, false, true);
    return;
  }
  if(spend <= 0){
    spawnPopup("Nie masz diamentow do wplaty.", false, false, true);
    return;
  }
  if(!await initFirebase()) return;
  let accepted = 0;
  try{
    const transaction = await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "globalMoleBossSettings/communityDamage"), (data) => {
      const current = data && typeof data === "object" ? data : {};
      const contributed = Math.max(0, Math.floor(Number(current.contributed) || 0));
      const completed = !!current.completed || contributed >= GLOBAL_BOSS_CONFIG.communityUpgradeCost;
      if(completed) return Object.assign({}, current, {completed:true});
      const nextContribution = Math.min(GLOBAL_BOSS_CONFIG.communityUpgradeCost, contributed + spend);
      accepted = nextContribution - contributed;
      return {
        contributed:nextContribution,
        completed:nextContribution >= GLOBAL_BOSS_CONFIG.communityUpgradeCost,
        completedAt:nextContribution >= GLOBAL_BOSS_CONFIG.communityUpgradeCost ? Date.now() : 0,
        updatedAt:Date.now(),
        lastContributorUid:currentAccount.uid,
        lastContributorNick:currentAccount.nick
      };
    });
    const nextData = transaction.snapshot?.val?.() || {};
    globalBossSettings.communityDamage = {
      contributed:Math.max(0, Math.floor(Number(nextData.contributed) || 0)),
      completed:!!nextData.completed,
      completedAt:Number(nextData.completedAt) || 0
    };
    if(accepted > 0){
      game.diamonds = Math.max(0, (game.diamonds || 0) - accepted);
      game.uiDirty = true;
      update(true, true);
      await saveBossDiamondSpendToLeaderboard(globalBossData, accepted);
      await saveCloudNow();
      closeCommunityBossDepositModal();
      spawnPopup(`Dorzucono ${formatDiamond(accepted)} do wspolnego upgrade'u!`, false, false, true);
    }else{
      spawnPopup("Globalny boss upgrade jest juz aktywny!", false, false, true);
    }
    renderGlobalBossPanel();
  }catch(err){
    console.warn("Community boss upgrade error:", err);
    spawnPopup("Nie udalo sie dorzucic diamentow.", false, false, true);
  }
}

async function checkWeeklyLeaderboardRewards(){
  if(!await initFirebase()) return;
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  try{
    const previousLast = await firebaseGet("leaderboardsMeta/weeklyRewardsLastAt");
    if(!previousLast){
      await firebaseSet("leaderboardsMeta/weeklyRewardsLastAt", now);
      return;
    }
    const transaction = await firebaseModules.runTransaction(firebaseModules.ref(firebaseDb, "leaderboardsMeta/weeklyRewardsLastAt"), (last) => {
      if(last && now - Number(last) < WEEK_MS) return last;
      return now;
    });
    if(Number(transaction.snapshot?.val?.()) !== now) return;
    const data = await firebaseGet("leaderboards") || {};
    const patch = {};
    leaderboardCategories.forEach(category=>{
      const rows = Object.values(data[category.id] || {})
        .filter(entry=>entry && entry.uid && typeof entry.value === "number")
        .sort((a, b)=>b.value - a.value)
        .slice(0, 10);
      rows.forEach((entry, index)=>{
        const rank = index + 1;
        const diamonds = rank === 1 ? 250 : rank === 2 ? 160 : rank === 3 ? 100 : 45;
        patch[`${entry.uid}/weekly_${now}_${category.id}`] = {
          kind:"weeklyLeaderboard",
          category:category.id,
          rank,
          diamonds,
          boosts:[{type:"money", value:rank <= 3 ? 1.5 : 1.2, label:"Nagroda tygodniowa"}],
          durationMs:GLOBAL_BOSS_CONFIG.rewardDurationMs,
          createdAt:now,
          claimed:false
        };
      });
    });
    if(Object.keys(patch).length){
      await firebaseUpdate("globalMoleBossRewards", patch);
    }
    if(currentAccount?.uid){
      await claimPendingOnlineRewards();
    }
  }catch(err){
    console.warn("Weekly leaderboard reward error:", err);
  }
}

const LEADERBOARD_POLL_MS = 60 * 60 * 1000;
const LEADERBOARD_DISPLAY_LIMIT = 50;
const leaderboardCategories = [
  {id:"coins", label:"Monety", shortLabel:"Monety", icon:"🪙", stat:"coins", kind:"points"},
  {id:"clicks", label:"Kliknięcia", shortLabel:"Kliknięcia", icon:"👆", stat:"clicks", kind:"number"},
  {id:"moneyPerSecond", label:"Monety/s", shortLabel:"Monety/s", icon:"⚡", stat:"moneyPerSecond", kind:"points"},
  {id:"diamonds", label:"Diamenty", shortLabel:"Diamenty", icon:"💎", stat:"diamonds", kind:"diamonds"},
  {id:"openedEggs", label:"Otwarte jajka", shortLabel:"Jajka", icon:"🥚", stat:"openedEggs", kind:"number"},
  {id:"streak", label:"Największy streak", shortLabel:"Streak", icon:"🔥", stat:"streak", kind:"number"}
];

let leaderboardData = {};
let leaderboardPollTimer = null;
let leaderboardClockTimer = null;
let leaderboardSaveBusy = false;
let selectedLeaderboardCategory = "coins";
let leaderboardDataHash = "";

function leaderboardStorageKey(type){
  return "kretLeaderboard_" + type + "_" + (currentAccount?.uid || "guest");
}

function getStoredLeaderboardTime(type){
  return +(localStorage.getItem(leaderboardStorageKey(type)) || 0);
}

function setStoredLeaderboardTime(type, value){
  localStorage.setItem(leaderboardStorageKey(type), String(value));
}

function formatDuration(ms){
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if(minutes >= 60){
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours + "h " + String(rest).padStart(2, "0") + "m";
  }
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function getLeaderboardMoneyPerSecond(){
  const baseClickPower = () => {
    const clickBase = Number(game.click) || 0;
    const petClick = typeof getPetClickBonus === "function" ? getPetClickBonus() : 0;
    const petMulti = typeof getPetMultiBonus === "function" ? getPetMultiBonus() : 0;
    const rebirthMult = Number(game.rebirthMult) || 1;
    const voidClick = typeof getEndlessClickMultiplier === "function" ? getEndlessClickMultiplier() : 1;
    return (clickBase + petClick) * ((Number(game.multi) || 1) + petMulti) * rebirthMult * voidClick;
  };
  let value = 0;
  if(typeof getAutoGain === "function" && typeof getAutoIntervalMs === "function" && getAutoValueLevel() > 0){
    const level = Math.max(0, getAutoValueLevel());
    const shotPower = 1 + (level - 1) * 0.055;
    const autoMultiplier = typeof getEndlessAutoMultiplier === "function" ? getEndlessAutoMultiplier() : 1;
    value += baseClickPower() * shotPower * autoMultiplier * (1000 / Math.max(1, getAutoIntervalMs()));
  }
  if(game.holdActive && typeof getHoldGain === "function" && typeof getHoldClicksPerSecond === "function"){
    value += baseClickPower() * getHoldClicksPerSecond();
  }
  return value;
}

function getPlayerStatsSnapshot(){
  if(typeof syncLeaderboardProgressStats === "function"){
    syncLeaderboardProgressStats();
  }
  const savedStats = game.leaderboardStats && typeof game.leaderboardStats === "object" ? game.leaderboardStats : {};
  return {
    coins: Math.floor(Math.max(Number(savedStats.totalCoinsEarned) || 0, Number(game.score) || 0)),
    clicks: Math.floor(game.clicks || 0),
    moneyPerSecond: Math.floor(getLeaderboardMoneyPerSecond()),
    diamonds: Math.floor(Math.max(Number(savedStats.bestDiamonds) || 0, Number(game.diamonds) || 0)),
    openedEggs: Math.floor(game.openedEggs || 0),
    streak: typeof getDailyStreakBest === "function" ? getDailyStreakBest() : Math.floor(Math.max(Number(game.dailyStreak?.best) || 0, Number(game.dailyStreak?.count) || 0))
  };
}

function formatLeaderboardValue(value, kind){
  if(kind === "diamonds" && typeof formatDiamond === "function"){
    return formatDiamond(value || 0);
  }
  if(kind === "points" && typeof formatPoint === "function"){
    return formatPoint(value || 0);
  }
  return typeof format === "function" ? format(value || 0) : String(value || 0);
}

function getLeaderboardRows(categoryId, limit=LEADERBOARD_DISPLAY_LIMIT){
  const bucket = leaderboardData?.[categoryId] || {};
  return Object.values(bucket)
    .filter(entry => entry && typeof entry.value === "number")
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function getNextHourBoundaryMs(now=Date.now()){
  return getNextWarsawHourBoundaryMs(now);
}

function getNextTenMinuteBoundaryMs(now=Date.now()){
  return getNextWarsawTenMinuteBoundaryMs(now);
}

function getNextAllLeaderboardsRefreshMs(now=Date.now()){
  return getNextWarsawMidnightMs(now);
}

function getNextLeaderboardRefreshMs(categoryId=selectedLeaderboardCategory, now=Date.now()){
  return ["all", "allTime", "allLeaderboards", "wszystkie"].includes(categoryId)
    ? getNextAllLeaderboardsRefreshMs(now)
    : getNextHourBoundaryMs(now);
}

let nextLeaderboardRefreshAt = getNextLeaderboardRefreshMs();

function updateLeaderboardDynamicText(){
  const timer = document.getElementById("leaderboardRefreshTimer");
  if(timer){
    if(nextLeaderboardRefreshAt <= Date.now()){
      nextLeaderboardRefreshAt = getNextLeaderboardRefreshMs();
    }
    timer.textContent = currentAccount
      ? `Odświeżenie rankingu za: ${formatDuration(Math.max(0, nextLeaderboardRefreshAt - Date.now()))}`
      : "Ranking online dostępny po zalogowaniu.";
  }
}

function renderLeaderboardPanel(){
  if(!leaderboardContent) return;
  const stats = getPlayerStatsSnapshot();
  const now = Date.now();
  const activeCategory = leaderboardCategories.find(category => category.id === selectedLeaderboardCategory) || leaderboardCategories[0];
  selectedLeaderboardCategory = activeCategory.id;
  if(nextLeaderboardRefreshAt <= Date.now()){
    nextLeaderboardRefreshAt = getNextLeaderboardRefreshMs(activeCategory.id, now);
  }

  const mineHtml = `
    <div class="leaderboardMine">
      ${leaderboardCategories.map(category => `
        <div class="leaderboardStat">
          <b>${category.icon} ${category.shortLabel}</b>
          <span>${formatLeaderboardValue(stats[category.stat], category.kind)}</span>
        </div>
      `).join("")}
    </div>
  `;

  const syncText = currentAccount
    ? leaderboardSaveBusy
      ? "Trwa odświeżanie rankingu..."
      : `Odświeżenie rankingu za: ${formatDuration(Math.max(0, nextLeaderboardRefreshAt - now))}`
    : "Ranking online dostępny po zalogowaniu.";

  const categoryTabs = `
    <div class="leaderboardCategoryGrid ${currentAccount ? "" : "locked"}">
      ${leaderboardCategories.map(category => `
        <button class="leaderboardCategoryBtn ${category.id === activeCategory.id ? "active" : ""}" data-leaderboard-category="${category.id}" type="button">
          <span class="leaderboardCategoryIcon">${category.icon}</span>
          <b>${category.shortLabel}</b>
        </button>
      `).join("")}
    </div>
  `;

  const lockedHtml = `
    <div class="leaderboardLocked">
      <div class="leaderboardLockIcon">🔒</div>
      <b>Ranking online zablokowany</b>
      <p>Utwórz konto, żeby zapisywać wyniki online</p>
      <div class="onlineLockActions">
        <button id="leaderboardCreateAccountBtn" type="button">UTWÓRZ KONTO</button>
        <button id="leaderboardLoginBtn" type="button">ZALOGUJ SIĘ</button>
      </div>
    </div>
  `;

  const rows = getLeaderboardRows(activeCategory.id, LEADERBOARD_DISPLAY_LIMIT);
  const rowsHtml = rows.length
    ? rows.map((entry, index) => `
        <div class="leaderboardRow ${entry.uid === currentAccount?.uid ? "mine" : ""}">
          <div class="leaderboardRank">${index + 1}</div>
          <div class="leaderboardName">${typeof escapeHtml === "function" ? escapeHtml(entry.nick || "Gracz") : entry.nick || "Gracz"}</div>
          <div class="leaderboardValue">${formatLeaderboardValue(entry.value, activeCategory.kind)}</div>
        </div>
      `).join("")
    : `<div class="leaderboardEmpty">Brak wpisów w tej kategorii. Ranking uzupełni się automatycznie.</div>`;

  const leaderboardHtml = currentAccount ? `
    <div class="leaderboardSection">
      <div class="leaderboardSectionTitle">
        <span>${activeCategory.icon} ${activeCategory.label} | TOP ${LEADERBOARD_DISPLAY_LIMIT}</span>
      </div>
      <div class="leaderboardRows">${rowsHtml}</div>
    </div>
  ` : lockedHtml;

  leaderboardContent.innerHTML = `
    <div class="leaderboardMessage">
      <b>Moje statystyki</b>
    </div>
    ${mineHtml}
    <div class="leaderboardSync">
      <div class="leaderboardSyncTop">
        <span id="leaderboardRefreshTimer">${syncText}</span>
      </div>
    </div>
    ${categoryTabs}
    ${leaderboardHtml}
  `;

  document.querySelectorAll("[data-leaderboard-category]").forEach(button => {
    button.onclick = () => {
      selectedLeaderboardCategory = button.dataset.leaderboardCategory || "coins";
      renderLeaderboardPanel();
    };
  });
  const createAccountBtn = document.getElementById("leaderboardCreateAccountBtn");
  if(createAccountBtn){
    createAccountBtn.onclick = () => showAuthForm("register");
  }
  const loginBtn = document.getElementById("leaderboardLoginBtn");
  if(loginBtn){
    loginBtn.onclick = () => showAuthForm("login");
  }
  leaderboardDockBtn?.classList.toggle("active", leaderboardPanel?.classList.contains("open"));
}

function applyLeaderboardPatch(path, data){
  if(path === "/" || !path){
    leaderboardData = data || {};
    return;
  }
  const parts = path.replace(/^\//, "").split("/");
  let target = leaderboardData;
  for(let i = 0; i < parts.length - 1; i++){
    target[parts[i]] = target[parts[i]] || {};
    target = target[parts[i]];
  }
  const last = parts[parts.length - 1];
  if(data === null){
    delete target[last];
  }else{
    target[last] = data;
  }
}

async function pollLeaderboards(){
  if(!await initFirebase()) return;
  try{
    const nextData = await firebaseGet("leaderboards") || {};
    const nextHash = JSON.stringify(nextData);
    if(nextHash !== leaderboardDataHash){
      leaderboardData = nextData;
      leaderboardDataHash = nextHash;
      renderLeaderboardPanel();
    }else{
      updateLeaderboardDynamicText();
    }
  }catch(err){
    console.warn("Leaderboard poll error:", err);
  }
}

function scheduleLeaderboardPollAligned(){
  if(leaderboardPollTimer) clearTimeout(leaderboardPollTimer);
  leaderboardPollTimer = setTimeout(async () => {
    await pollLeaderboards();
    scheduleLeaderboardPollAligned();
  }, Math.max(1000, getNextLeaderboardRefreshMs() - Date.now()));
}

async function startLeaderboardLive(){
  if(!await initFirebase()) return;
  if(leaderboardPollTimer) return;
  await pollLeaderboards();
  scheduleLeaderboardPollAligned();
}

async function saveLeaderboardNow(options={}){
  const silent = !!options.silent;
  const refreshAfter = options.refreshAfter !== false;
  if(!currentAccount){
    if(silent) return false;
    setAuthMessage("Zaloguj sie, zeby zapisac leaderboard.", true);
    openAuthOverlay();
    renderLeaderboardPanel();
    return false;
  }
  if(isCurrentAdmin() && !adminLeaderboardVisible){
    const patch = {};
    leaderboardCategories.forEach(category => {
      patch[`${category.id}/${currentAccount.uid}`] = null;
    });
    try{
      await firebaseUpdate("leaderboards", patch);
    }catch(err){
      console.warn("Admin leaderboard hide cleanup error:", err);
    }
    return false;
  }
  const now = Date.now();
  if(leaderboardSaveBusy) return false;
  leaderboardSaveBusy = true;
  if(!silent) renderLeaderboardPanel();
  try{
    const rawStats = getPlayerStatsSnapshot();
    const baseline = await firebaseGet("leaderboardBaselines/" + currentAccount.uid) || {};
    const stats = applyLeaderboardBaseline(rawStats, baseline);
    const baseEntry = {
      uid:currentAccount.uid,
      nick:currentAccount.nick,
      updatedAt:now,
      rebirths:game.rebirths || 0,
      coins:stats.coins,
      clicks:stats.clicks,
      moneyPerSecond:stats.moneyPerSecond,
      diamonds:stats.diamonds,
      openedEggs:stats.openedEggs,
      rawCoins:rawStats.coins,
      rawClicks:rawStats.clicks,
      rawMoneyPerSecond:rawStats.moneyPerSecond,
      rawDiamonds:rawStats.diamonds,
      rawOpenedEggs:rawStats.openedEggs,
      rawStreak:rawStats.streak,
      leaderboardResetAt:Number(baseline.resetAt) || 0
    };
    const leaderboardPatch = {};
    leaderboardCategories.forEach(category => {
      leaderboardPatch[category.id + "/" + currentAccount.uid] = Object.assign({}, baseEntry, {
        category:category.id,
        value:stats[category.stat]
      });
    });
    await firebaseUpdate("leaderboards", leaderboardPatch);
    setStoredLeaderboardTime("auto", now);
    if(refreshAfter){
      await pollLeaderboards();
    }
    return true;
  }catch(err){
    console.warn("Leaderboard save error:", err);
    return false;
  }finally{
    leaderboardSaveBusy = false;
    if(!silent) renderLeaderboardPanel();
  }
}

window.clearOwnStaleAdminNotices = async function(){
  if(!currentAccount?.uid || !await initFirebase()) return;
  try{
    await firebaseSet("userAdminNotices/" + currentAccount.uid, {});
    await firebaseSet("users/" + currentAccount.uid + "/adminInbox", {});
    game.adminInbox = {};
    spawnPopup("Wyczyszczono stare komunikaty admina", false, false, true);
  }catch(err){
    console.warn("Clear stale admin notices failed:", err);
    spawnPopup("Nie udalo sie wyczyscic komunikatow admina", false, false, true);
  }
};

function startLeaderboardClock(){
  if(leaderboardClockTimer) return;
  nextLeaderboardRefreshAt = getNextLeaderboardRefreshMs();
  leaderboardClockTimer = setInterval(() => {
    if(currentAccount && Date.now() >= nextLeaderboardRefreshAt){
      nextLeaderboardRefreshAt = getNextLeaderboardRefreshMs();
      saveLeaderboardNow();
    }else{
      updateLeaderboardDynamicText();
    }
  }, 1000);
}

function initLeaderboardUi(){
  if(leaderboardDockBtn && leaderboardPanel){
    leaderboardDockBtn.onclick = () => {
      const willOpen = !leaderboardPanel.classList.contains("open");
      leaderboardPanel.classList.toggle("open", willOpen);
      if(typeof diamondPanel !== "undefined" && diamondPanel){
        diamondPanel.classList.remove("open");
      }
      if(typeof indexPanel !== "undefined" && indexPanel){
        indexPanel.classList.remove("open");
      }
      globalBossPanel?.classList.remove("open");
      renderLeaderboardPanel();
      renderGlobalBossPanel();
    };
  }
  if(globalBossDockBtn && globalBossPanel){
    globalBossDockBtn.onclick = () => {
      if(typeof diamondPanel !== "undefined" && diamondPanel){
        diamondPanel.classList.remove("open");
      }
      if(typeof indexPanel !== "undefined" && indexPanel){
        indexPanel.classList.remove("open");
      }
      leaderboardPanel?.classList.remove("open");
      globalBossPanel?.classList.remove("open");
      openGlobalBossEvent();
      renderLeaderboardPanel();
      renderGlobalBossPanel();
    };
  }
  if(typeof diamondDockBtn !== "undefined" && diamondDockBtn){
    const previousDiamondClick = diamondDockBtn.onclick;
    diamondDockBtn.onclick = (event) => {
      previousDiamondClick?.call(diamondDockBtn, event);
      if(typeof indexPanel !== "undefined" && indexPanel){
        indexPanel.classList.remove("open");
      }
      leaderboardPanel?.classList.remove("open");
      globalBossPanel?.classList.remove("open");
      renderLeaderboardPanel();
      renderGlobalBossPanel();
    };
  }
  startLeaderboardLive();
  startGlobalEventsLive();
  startGlobalWeatherLive();
  startNextUpdateLive();
  startGlobalAdminInboxLive();
  startGlobalBossLive();
  checkWeeklyLeaderboardRewards();
  startLeaderboardClock();
  renderLeaderboardPanel();
  renderGlobalBossPanel();
}

function startPublicLiveSystems(){
  startGlobalEventsLive();
  startGlobalWeatherLive();
  startNextUpdateLive();
}

async function tryRememberedLogin(){
  let session = null;
  try{
    session = JSON.parse(localStorage.getItem(ACCOUNT_SESSION_KEY));
  }catch(err){
    session = null;
  }
  if(!session?.uid || !session?.nick){
    startPublicLiveSystems();
    showAuthMenu();
    window.__kretSaveMode = "guest";
    renderAccountStatus();
    return;
  }
  currentAccount = session;
  currentAccount.safeNick = safeNick(currentAccount.safeNick || currentAccount.nick);
  window.__kretSaveMode = "account";
  const startupLocalBackup = getAccountLocalSave(session.uid);
  if(isMeaningfulSave(startupLocalBackup)){
    applySave(startupLocalBackup, {mode:"account"});
  }
  openAuthOverlay();
  if(authTitle) authTitle.textContent = "Ładowanie konta";
  if(authSubtitle) authSubtitle.textContent = "Pobieramy zapis online...";
  if(authMenu) authMenu.style.display = "none";
  authForm?.classList.remove("open");
  setAuthMessage("");
  if(!await initFirebase()){
    const localBackup = getAccountLocalSave(session.uid);
    if(isMeaningfulSave(localBackup)){
      currentAccount = session;
      applySave(localBackup, {mode:"account"});
      closeAuthOverlay();
      renderCloudSaveStatus("error", "Lokalny backup");
      renderAccountStatus();
      renderGlobalBossPanel();
      return;
    }
    currentAccount = null;
    showAuthMenu();
    return;
  }
  try{
    const authUser = await waitForFirebaseAuthUser();
    if(!authUser || authUser.uid !== session.uid){
      const localBackup = getAccountLocalSave(session.uid);
      if(isMeaningfulSave(localBackup)){
        currentAccount = session;
        applySave(localBackup, {mode:"account"});
        closeAuthOverlay();
        renderCloudSaveStatus("error", "Lokalny backup");
        renderAccountStatus();
        renderGlobalBossPanel();
        return;
      }
      currentAccount = null;
      try{ await firebaseModules.signOut(firebaseAuth); }catch(err){}
      showAuthMenu();
      setAuthMessage("Sesja wygasła. Zaloguj się ponownie.", true);
      return;
    }
    const account = await firebaseGet("accounts/" + currentAccount.safeNick);
    currentAccount = makeAccountSessionFromAuth(authUser, account, currentAccount.safeNick, currentAccount.nick);
    localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(currentAccount));
    await withTimeout(loadAccountSave(true), 14000, "account save load timeout");
    closeAuthOverlay();
  }catch(err){
    console.warn("Remembered login error:", err);
    const localBackup = getAccountLocalSave(session.uid);
    if(isMeaningfulSave(localBackup)){
      currentAccount = session;
      applySave(localBackup, {mode:"account"});
      closeAuthOverlay();
      renderCloudSaveStatus("error", "Lokalny backup");
      renderAccountStatus();
      renderGlobalBossPanel();
      return;
    }
    currentAccount = null;
    showAuthMenu();
    setAuthMessage("Nie udalo sie wczytac konta. Zaloguj sie ponownie albo graj jako gosc.", true);
  }
  renderAccountStatus();
  renderGlobalBossPanel();
}

showRegisterBtn?.addEventListener("click", () => showAuthForm("register"));
showLoginBtn?.addEventListener("click", () => showAuthForm("login"));
guestPlayBtn?.addEventListener("click", async () => {
  stopUserAdminNoticesLive();
  stopMarketplaceUserStream();
  if(await initFirebase()){
    try{ await firebaseModules.signOut(firebaseAuth); }catch(err){}
  }
  currentAccount = null;
  localStorage.removeItem(ACCOUNT_SESSION_KEY);
  closeAuthOverlay();
  loadGuestSave();
  startPublicLiveSystems();
});
authBackBtn?.addEventListener("click", showAuthMenu);
authSubmitBtn?.addEventListener("click", () => {
  if(authMode === "register"){
    registerAccount();
  }else{
    loginAccount();
  }
});
authPassword?.addEventListener("keydown", (event) => {
  if(event.key === "Enter"){
    authSubmitBtn?.click();
  }
});
logoutBtn?.addEventListener("click", async () => {
  if(!currentAccount){
    showAuthMenu();
    return;
  }
  openAccountMenu();
});
accountMenuClose?.addEventListener("click", closeAccountMenu);
accountMenuOverlay?.addEventListener("click", (event) => {
  if(event.target === accountMenuOverlay){
    closeAccountMenu();
  }
});
accountChangePasswordBtn?.addEventListener("click", () => {
  changePasswordForm?.classList.toggle("open");
  setAccountMenuMessage("");
});
accountLogoutBtn?.addEventListener("click", async () => {
  await flushCloudSaveBeforeLogout();
  stopUserAdminNoticesLive();
  stopMarketplaceUserStream();
  if(await initFirebase()){
    try{ await firebaseModules.signOut(firebaseAuth); }catch(err){}
  }
  currentAccount = null;
  localStorage.removeItem(ACCOUNT_SESSION_KEY);
  closeAuthOverlay();
  closeAccountMenu();
  loadGuestSave();
});
confirmChangePasswordBtn?.addEventListener("click", changeAccountPassword);
supportSubmitBtn?.addEventListener("click", submitSupportTicket);
adminLeaderboardVisibilityBtn?.addEventListener("click", () => {
  setAdminLeaderboardVisibility(!adminLeaderboardVisible).catch((err) => {
    console.warn("Admin leaderboard visibility toggle error:", err);
    setAdminAbuseMessage("Nie udało się zmienić widoczności leaderboardu.", true);
  });
});

adminBoostModalCancel?.addEventListener("click", closeAdminBoostPopup);
adminBoostModal?.addEventListener("click", (event) => {
  if(event.target === adminBoostModal){
    closeAdminBoostPopup();
  }
});
adminGiveType?.addEventListener("change", updateAdminGiveFields);
adminGiveTarget?.addEventListener("change", updateAdminGiveFields);
adminGivePetSelect?.addEventListener("change", renderAdminItemPreviews);
adminGivePetVariant?.addEventListener("change", renderAdminItemPreviews);
adminGiveSkinSelect?.addEventListener("change", renderAdminItemPreviews);
adminCodeSaveBtn?.addEventListener("click", saveAdminRewardCode);
adminNextUpdateSave?.addEventListener("click", saveNextUpdateFromAdmin);
adminNextUpdateClear?.addEventListener("click", clearNextUpdateFromAdmin);
adminCodeRewardType?.addEventListener("change", () => {
  const type = adminCodeRewardType?.value || "";
  adminCodePotionType?.classList.toggle("adminGiveHidden", type !== "potion");
  adminCodePotionTier?.classList.toggle("adminGiveHidden", type !== "potion");
  adminCodeBagType?.classList.toggle("adminGiveHidden", type !== "bag");
});
adminCodeRewardType?.dispatchEvent(new Event("change"));
adminEventType?.addEventListener("change", () => {
  setAdminBoostModalMode("events");
  if(adminBoostModalValue){
    adminBoostModalValue.value = adminEventType.value === "petChance" || adminEventType.value === "petXp" ? "50" : "2";
  }
});
adminBoostModalConfirm?.addEventListener("click", async () => {
  if(!pendingAdminBoost) return;
  const {type, value} = pendingAdminBoost;
  adminBoostModalConfirm.disabled = true;
  try{
    if(type === "events"){
      await launchAdminEventFromModal();
    }else if(type === "mega"){
      await launchMegaEvent();
    }else if(type === "message"){
      await launchGlobalMessage();
    }else if(type === "giveItem"){
      await adminGivePlayerItem();
    }else{
      await launchAdminBoost(type, value);
    }
    closeAdminBoostPopup();
  }catch(err){
    console.warn("Admin action error:", err);
    if(!adminAbuseMessage?.textContent){
      setAdminAbuseMessage("Akcja admina nie powiodla sie.", true);
    }
  }finally{
    adminBoostModalConfirm.disabled = false;
  }
});

communityBossDepositClose?.addEventListener("click", closeCommunityBossDepositModal);
communityBossDepositCancel?.addEventListener("click", closeCommunityBossDepositModal);
communityBossDepositModal?.addEventListener("click", (event) => {
  if(event.target === communityBossDepositModal){
    closeCommunityBossDepositModal();
  }
});
communityBossDepositModalRange?.addEventListener("input", updateCommunityBossDepositModal);
communityBossDepositConfirm?.addEventListener("click", async () => {
  communityBossDepositConfirm.disabled = true;
  try{
    await contributeCommunityBossUpgrade();
  }finally{
    communityBossDepositConfirm.disabled = false;
    updateCommunityBossDepositModal();
  }
});

globalBossEventBannerBtn?.addEventListener("click", openGlobalBossEvent);
globalBossBackBtn?.addEventListener("click", closeGlobalBossEvent);

function hookMajorProgressCloudSaves(){
  if(typeof rebirth === "function" && !rebirth.__cloudSaveWrapped){
    const originalRebirthForCloudSave = rebirth;
    rebirth = function(...args){
      const beforeRebirth = game.rebirths || 0;
      const result = originalRebirthForCloudSave.apply(this, args);
      setTimeout(() => {
        if((game.rebirths || 0) > beforeRebirth){
          requestCloudSave({force:true, reason:"rebirth"});
        }
      }, 3400);
      return result;
    };
    rebirth.__cloudSaveWrapped = true;
  }

  if(typeof ultraCoreReset === "function" && !ultraCoreReset.__cloudSaveWrapped){
    const originalUltraCoreResetForCloudSave = ultraCoreReset;
    ultraCoreReset = function(...args){
      const beforeCores = game.ultraCores || 0;
      const result = originalUltraCoreResetForCloudSave.apply(this, args);
      if((game.ultraCores || 0) > beforeCores){
        requestCloudSave({force:true, reason:"superRebirth"});
      }
      return result;
    };
    ultraCoreReset.__cloudSaveWrapped = true;
  }

  if(typeof buyDiamondUpgrade === "function" && !buyDiamondUpgrade.__cloudSaveWrapped){
    const originalBuyDiamondUpgradeForCloudSave = buyDiamondUpgrade;
    buyDiamondUpgrade = function(...args){
      const before = JSON.stringify(game.metaUpgrades || {});
      const result = originalBuyDiamondUpgradeForCloudSave.apply(this, args);
      if(JSON.stringify(game.metaUpgrades || {}) !== before){
        requestCloudSave({force:true, reason:"importantUpgrade"});
      }
      return result;
    };
    buyDiamondUpgrade.__cloudSaveWrapped = true;
  }

  if(typeof buyEndlessUpgrade === "function" && !buyEndlessUpgrade.__cloudSaveWrapped){
    const originalBuyEndlessUpgradeForCloudSave = buyEndlessUpgrade;
    buyEndlessUpgrade = function(...args){
      const before = JSON.stringify(game.endlessUpgrades || {});
      const result = originalBuyEndlessUpgradeForCloudSave.apply(this, args);
      if(JSON.stringify(game.endlessUpgrades || {}) !== before){
        requestCloudSave({force:true, reason:"voidUpgrade"});
      }
      return result;
    };
    buyEndlessUpgrade.__cloudSaveWrapped = true;
  }

  if(typeof hatchEggBatch === "function" && !hatchEggBatch.__cloudSaveWrapped){
    const originalHatchEggBatchForCloudSave = hatchEggBatch;
    hatchEggBatch = function(...args){
      const beforeEggs = game.openedEggs || 0;
      const beforePets = Array.isArray(game.pets) ? game.pets.length : 0;
      const result = originalHatchEggBatchForCloudSave.apply(this, args);
      if((game.openedEggs || 0) > beforeEggs || (Array.isArray(game.pets) ? game.pets.length : 0) > beforePets){
        requestCloudSave({force:true, reason:"eggOpen"});
      }
      return result;
    };
    hatchEggBatch.__cloudSaveWrapped = true;
  }

  if(typeof openCrate === "function" && !openCrate.__cloudSaveWrapped){
    const originalOpenCrateForCloudSave = openCrate;
    openCrate = function(...args){
      const beforeSkins = Array.isArray(game.skins) ? game.skins.length : 0;
      const result = originalOpenCrateForCloudSave.apply(this, args);
      if((Array.isArray(game.skins) ? game.skins.length : 0) > beforeSkins){
        requestCloudSave({force:true, reason:"rareDrop"});
      }
      return result;
    };
    openCrate.__cloudSaveWrapped = true;
  }
}

window.addEventListener("pagehide", saveCloudOnPageExit);
window.addEventListener("beforeunload", saveCloudOnPageExit);
document.addEventListener("visibilitychange", () => {
  if(document.visibilityState === "hidden"){
    saveCloudOnPageExit();
  }
});

hookMajorProgressCloudSaves();
startCloudAutosaveClock();
renderCloudSaveStatus("offline", "Lokalnie");
initLeaderboardUi();
tryRememberedLogin();
