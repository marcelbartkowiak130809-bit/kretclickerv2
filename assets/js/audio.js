(function(){
  const STORAGE_KEY = "kretAudioSettings";
  const DEFAULTS = {muted:false, volume:0.32};
  let settings = loadSettings();
  let ctx = null;
  let master = null;
  const lastPlayed = new Map();

  function loadSettings(){
    try{
      return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    }catch(err){
      return {...DEFAULTS};
    }
  }

  function saveSettings(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }catch(err){}
  }

  function ensureAudio(){
    if(!ctx){
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if(!AudioContext) return null;
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = settings.muted ? 0 : settings.volume;
      master.connect(ctx.destination);
    }
    if(ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function setVolume(value){
    settings.volume = Math.max(0, Math.min(1, Number(value) || 0));
    if(master) master.gain.setTargetAtTime(settings.muted ? 0 : settings.volume, ctx.currentTime, 0.015);
    saveSettings();
    syncUi();
  }

  function setMuted(value){
    settings.muted = !!value;
    if(master && ctx) master.gain.setTargetAtTime(settings.muted ? 0 : settings.volume, ctx.currentTime, 0.015);
    saveSettings();
    syncUi();
  }

  function canPlay(key, cooldown=80){
    const now = performance.now();
    if((lastPlayed.get(key) || 0) + cooldown > now) return false;
    lastPlayed.set(key, now);
    return true;
  }

  function tone({key="tone", freq=420, endFreq=freq, type="sine", duration=0.08, gain=0.08, attack=0.006, cooldown=80, detune=0}={}){
    if(settings.muted || !canPlay(key, cooldown)) return;
    const audio = ensureAudio();
    if(!audio || !master) return;
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if(endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    osc.detune.value = detune;
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.025);
  }

  function chord(key, notes, opts={}){
    if(settings.muted || !canPlay(key, opts.cooldown ?? 180)) return;
    notes.forEach((freq, index)=>setTimeout(()=>tone(Object.assign({}, opts, {
      key:`${key}_${index}_${Date.now()}`,
      freq,
      endFreq:opts.endFreq ? opts.endFreq(freq, index) : freq,
      gain:(opts.gain ?? 0.05) * (1 - index * 0.08),
      cooldown:0
    })), index * (opts.stagger ?? 38)));
  }

  function noise({key="noise", duration=0.12, gain=0.04, cooldown=160, filter=900}={}){
    if(settings.muted || !canPlay(key, cooldown)) return;
    const audio = ensureAudio();
    if(!audio || !master) return;
    const length = Math.max(1, Math.floor(audio.sampleRate * duration));
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.7);
    const source = audio.createBufferSource();
    const amp = audio.createGain();
    const lp = audio.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = filter;
    amp.gain.setValueAtTime(gain, audio.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    source.buffer = buffer;
    source.connect(lp);
    lp.connect(amp);
    amp.connect(master);
    source.start();
    source.stop(audio.currentTime + duration + 0.02);
  }

  const api = {
    unlock:ensureAudio,
    click(){ tone({key:"click", freq:360, endFreq:520, type:"triangle", duration:0.045, gain:0.026, cooldown:42}); },
    autoClick(){ tone({key:"auto", freq:260, endFreq:330, type:"sine", duration:0.035, gain:0.012, cooldown:850}); },
    hover(){ tone({key:"hover", freq:520, endFreq:620, type:"sine", duration:0.035, gain:0.014, cooldown:120}); },
    buy(){ chord("buy", [520, 700], {type:"triangle", duration:0.07, gain:0.034, cooldown:130, stagger:34}); },
    deny(){ tone({key:"deny", freq:210, endFreq:150, type:"sawtooth", duration:0.09, gain:0.025, cooldown:260}); },
    diamond(){ chord("diamond", [860, 1280], {type:"sine", duration:0.09, gain:0.032, cooldown:260, stagger:42}); },
    rebirth(){ chord("rebirth", [330, 495, 660, 990], {type:"triangle", duration:0.16, gain:0.042, cooldown:900, stagger:70}); },
    superRebirth(){ chord("superRebirth", [220, 440, 660, 880, 1320], {type:"sine", duration:0.24, gain:0.052, cooldown:1400, stagger:85}); noise({key:"superNoise", duration:0.22, gain:0.035, filter:1300, cooldown:1400}); },
    hatch(){ chord("hatch", [420, 560, 740], {type:"triangle", duration:0.11, gain:0.028, cooldown:650, stagger:95}); },
    crate(){ noise({key:"crate", duration:0.12, gain:0.03, filter:650, cooldown:650}); tone({key:"crateTone", freq:310, endFreq:430, type:"triangle", duration:0.08, gain:0.026, cooldown:0}); },
    rare(){ chord("rare", [760, 980, 1320], {type:"sine", duration:0.18, gain:0.044, cooldown:900, stagger:75}); },
    potion(){ chord("potion", [580, 760], {type:"sine", duration:0.11, gain:0.035, cooldown:250, stagger:45}); },
    bag(){ chord("bag", [300, 520, 780], {type:"triangle", duration:0.12, gain:0.038, cooldown:450, stagger:55}); },
    boss(){ chord("boss", [160, 240, 360], {type:"sawtooth", duration:0.18, gain:0.03, cooldown:900, stagger:65}); },
    crystalMine(){ chord("crystalMine", [720, 1040], {type:"sine", duration:0.07, gain:0.022, cooldown:180, stagger:24}); },
    crystalEgg(){ chord("crystalEgg", [640, 920, 1280], {type:"triangle", duration:0.16, gain:0.04, cooldown:700, stagger:58}); },
    crystalShop(){ tone({key:"crystalShop", freq:820, endFreq:1180, type:"sine", duration:0.09, gain:0.032, cooldown:260}); },
    panel(){ tone({key:"panel", freq:430, endFreq:560, type:"sine", duration:0.055, gain:0.018, cooldown:180}); },
    close(){ tone({key:"close", freq:360, endFreq:280, type:"sine", duration:0.05, gain:0.012, cooldown:140}); },
    reward(){ chord("reward", [520, 780, 1040], {type:"sine", duration:0.12, gain:0.034, cooldown:520, stagger:55}); },
    alert(){ tone({key:"alert", freq:620, endFreq:420, type:"triangle", duration:0.12, gain:0.032, cooldown:380}); },
    setVolume,
    setMuted,
    get settings(){ return Object.assign({}, settings); }
  };

  function syncUi(){
    const root = document.getElementById("audioControl");
    if(!root) return;
    const btn = root.querySelector("[data-audio-mute]");
    const slider = root.querySelector("[data-audio-volume]");
    if(btn) btn.textContent = settings.muted ? "🔇" : "🔊";
    if(slider) slider.value = String(Math.round(settings.volume * 100));
    root.classList.toggle("muted", settings.muted);
  }

  function installUi(){
    if(document.getElementById("audioControl")) return;
    const style = document.createElement("style");
    style.textContent = `
      #audioControl{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:900;display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(8,10,18,.72);backdrop-filter:blur(12px);box-shadow:0 12px 28px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.12)}
      #audioControl button{width:34px;height:34px;border:0;border-radius:999px;cursor:pointer;background:linear-gradient(135deg,rgba(117,231,255,.28),rgba(255,255,255,.09));color:#fff;font-weight:900;font-size:17px;padding:0;display:grid;place-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.16)}
      #audioControl input{width:86px;height:18px;appearance:none;-webkit-appearance:none;background:transparent;cursor:pointer}
      #audioControl input::-webkit-slider-runnable-track{height:8px;border-radius:999px;background:linear-gradient(90deg,rgba(117,231,255,.85),rgba(255,207,102,.75));box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 0 12px rgba(117,231,255,.14)}
      #audioControl input::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-5px;border-radius:50%;border:2px solid rgba(255,255,255,.86);background:#101829;box-shadow:0 4px 12px rgba(0,0,0,.42),0 0 10px rgba(117,231,255,.42)}
      #audioControl input::-moz-range-track{height:8px;border:0;border-radius:999px;background:linear-gradient(90deg,rgba(117,231,255,.85),rgba(255,207,102,.75))}
      #audioControl input::-moz-range-thumb{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.86);background:#101829;box-shadow:0 4px 12px rgba(0,0,0,.42),0 0 10px rgba(117,231,255,.42)}
      #audioControl.muted{opacity:.72}
      @media (max-width:640px){#audioControl{padding:7px;gap:6px}#audioControl input{width:70px}}
    `;
    document.head.appendChild(style);
    const root = document.createElement("div");
    root.id = "audioControl";
    root.innerHTML = `<button type="button" data-audio-mute title="Wycisz audio">🔊</button><input type="range" min="0" max="100" value="32" data-audio-volume title="Glosnosc audio">`;
    document.body.appendChild(root);
    root.querySelector("[data-audio-mute]").addEventListener("click", ()=>{
      ensureAudio();
      setMuted(!settings.muted);
    });
    root.querySelector("[data-audio-volume]").addEventListener("input", event=>{
      ensureAudio();
      setVolume(Number(event.target.value) / 100);
      if(settings.muted) setMuted(false);
    });
    syncUi();
  }

  function wrap(name, sound, options={}){
    const original = window[name];
    if(typeof original !== "function") return;
    window[name] = function(...args){
      const beforeScore = window.game?.score;
      const beforeDiamonds = window.game?.diamonds;
      const result = original.apply(this, args);
      setTimeout(()=>{
        if(options.denyWhenNoChange && beforeScore === window.game?.score && beforeDiamonds === window.game?.diamonds) api.deny();
        else sound(...args);
      }, options.delay || 0);
      return result;
    };
  }

  function installHooks(){
    document.addEventListener("pointerdown", ensureAudio, {once:true, passive:true});
    document.addEventListener("keydown", ensureAudio, {once:true});
    document.addEventListener("pointerover", event=>{
      if(event.target.closest("button,.card,.eggCard,.petCard,.bagCard,.potionCard,.dockBtn,.panelTab,.panelAction,.freeRewardGift,.indexCard,.indexTabs button,.indexVariantPicker button")) api.hover();
    }, {passive:true});
    document.addEventListener("click", event=>{
      const target = event.target;
      if(target.closest("#kret")) api.click();
      else if(target.closest("[data-audio-close],#freeRewardsClose,#appInstallClose,#upgradeInfoClose,.slideHeader button")) api.close();
      else if(target.closest(".dockBtn,#globalBossEventBannerBtn,.gameInfoBtn,.appInstallBtn,.freeRewardsBtn,.indexTabs button,.indexVariantPicker button")) api.panel();
      else if(target.closest(".freeRewardGift.available")) api.reward();
      else if(target.closest(".card,.eggCard,.diamondCard,.endlessCard")) setTimeout(()=>api.buy(), 40);
    }, {passive:true});

    wrap("buyDiamondUpgrade", ()=>api.buy(), {delay:50});
    wrap("buyEndlessUpgrade", ()=>api.buy(), {delay:50});
    wrap("runEggReveal", (egg, pets)=>{
      api.hatch();
      const list = Array.isArray(pets) ? pets : [pets];
      if(list.some(p=>p?.secret || ["Epicki","Mityczny","Legendarny","Sekretny"].includes(p?.rarity))) setTimeout(()=>api.rare(), 900);
    });
    wrap("runCrateReveal", ()=>api.crate());
    wrap("usePotionGroup", ()=>api.potion());
    wrap("useBagGroup", ()=>api.bag());
    wrap("showBagRewardAnimation", ()=>api.bag());
    wrap("claimFreeReward", ()=>api.reward(), {delay:60});
    wrap("openFreeRewards", ()=>api.panel(), {delay:20});
    wrap("openAppInstallModal", ()=>api.panel(), {delay:20});
    wrap("closeFreeRewards", ()=>api.close(), {delay:10});
    wrap("closeAppInstallModal", ()=>api.close(), {delay:10});
    const originalPopup = window.spawnPopup;
    if(typeof originalPopup === "function"){
      window.spawnPopup = function(text, isCrit, isFrenzy, isAlert){
        const result = originalPopup.apply(this, arguments);
        const value = String(text || "").toLowerCase();
        if(isAlert || value.includes("za malo") || value.includes("maksymalnie")) api.alert();
        return result;
      };
    }
    document.getElementById("globalBossEventBannerBtn")?.addEventListener("click", ()=>api.boss());
  }

  window.kretAudio = api;
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", ()=>{ installUi(); installHooks(); });
  }else{
    installUi();
    installHooks();
  }
})();
