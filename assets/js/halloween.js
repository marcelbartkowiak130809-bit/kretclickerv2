(() => {
  const START = Date.parse("2026-10-17T00:00:00+02:00");
  const END = Date.parse("2026-11-01T20:00:00+01:00");
  const SHOP_END = Date.parse("2026-11-08T20:00:00+01:00");
  const EGG_COST = 10000;
  const SHOP_INTERVAL = 15 * 60 * 1000;
  const eventPets = [
    {id:"halloween_sprout",name:"Dyniowy Maluch",icon:"&#127875;",weight:5200,scale:.55,color:"#f5a454"},
    {id:"halloween_lantern",name:"Kret Latarnik",icon:"&#128367;",weight:3000,scale:.7,color:"#e98233"},
    {id:"halloween_witch",name:"Dyniowy Czarodziej",icon:"&#127769;",weight:1350,scale:.85,color:"#b398dd"},
    {id:"halloween_harvest",name:"Straznik Zbiorow",icon:"&#127810;",weight:420,scale:1,color:"#d89043"},
    {id:"halloween_king",name:"Krol Dyn",icon:"&#128081;",weight:30,scale:1.15,color:"#ffb853",secret:true}
  ];
  const moonPets = [
    {id:"bloodmoon_bat",name:"Kret Nietoperz",icon:"&#129415;",weight:6000,scale:.5,color:"#a99abc"},
    {id:"bloodmoon_shadow",name:"Krwawy Cien",icon:"&#127761;",weight:2500,scale:.65,color:"#b66272"},
    {id:"bloodmoon_watcher",name:"Nocny Obserwator",icon:"&#128065;",weight:1100,scale:.8,color:"#ce788a"},
    {id:"bloodmoon_knight",name:"Ksiezycowy Rycerz",icon:"&#127769;",weight:380,scale:.95,color:"#db8e9b"},
    {id:"bloodmoon_eclipse",name:"Kret Zacmienia",icon:"&#10022;",weight:20,scale:1.1,color:"#ffb5bb",secret:true}
  ];
  const upgrades = [
    {id:"speed",name:"Ostry noz",max:10,base:45,scale:1.9,desc:"Krotsza przerwa miedzy cieciami."},
    {id:"power",name:"Precyzyjne ciecie",max:15,base:55,scale:2.05,desc:"Wiecej nasion z kazdego ciecia."},
    {id:"bonus",name:"Obfite zbiory",max:12,base:75,scale:2.1,desc:"Dodatkowe nasiona dyni."},
    {id:"luck",name:"Dyniowe szczescie",max:10,base:113,scale:2.25,desc:"Lepsze szanse w Dyniowym Jajku."}
  ];
  const supplies = [
    {id:"luck",name:"Mikstura szczescia I",type:"potion",cost:175,stock:2},
    {id:"money",name:"Mikstura monet I",type:"potion",cost:150,stock:2},
    {id:"diamonds",name:"Mikstura diamentow I",type:"potion",cost:200,stock:1},
    {id:"weak",name:"Slaba sakiewka",type:"bag",cost:300,stock:2},
    {id:"medium",name:"Srednia sakiewka",type:"bag",cost:950,stock:1}
  ];
  const seedIcon = '<i class="pumpkinSeed" aria-hidden="true"></i>';
  const view = document.getElementById("crystalEventView").cloneNode(true);
  view.id = "halloweenEventView";
  view.className = "crystalEventView halloweenEventView";
  view.querySelectorAll("[id]").forEach(node => { node.id = node.id.replace(/^crystal/, "halloween"); });
  document.body.appendChild(view);
  const node = suffix => document.getElementById(`halloween${suffix}`);
  const mole = node("Mole");
  mole.setAttribute("aria-label", "Kroj dynie i zbieraj nasiona");
  view.querySelector(".crystalEventTop > div:first-child span").textContent = "HALLOWEEN 2026";
  view.querySelector("h2").textContent = "Dyniowe Zbiory";
  view.querySelector(".crystalCurrencyPill small").textContent = "Nasiona dyni";
  view.querySelector(".crystalCurrencyPill i").outerHTML = seedIcon;
  view.querySelector(".crystalUpgradeCard h3").textContent = "Ulepszenia noza";
  view.querySelector(".crystalEggCard h3").textContent = "Dyniowe Jajko";
  view.querySelector(".crystalShopTop h3").textContent = "Halloweenowy sklep";
  const notice = document.createElement("p");
  notice.className = "halloweenNotice";
  notice.textContent = "Zbiory do 1 listopada, 20:00. Sklep do 8 listopada, 20:00 (czas polski).";
  view.querySelector(".crystalCaveShell").prepend(notice);
  view.dataset.halloweenTab="harvest";
  const tabs=document.createElement("nav");tabs.className="halloweenTabs";tabs.setAttribute("aria-label","Halloween");
  tabs.innerHTML=[["harvest","Dynia"],["upgrades","Ulepszenia"],["egg","Jajko"],["shop","Sklep"]].map(([id,label])=>`<button type="button" data-h-tab="${id}" aria-pressed="${id==="harvest"}">${label}</button>`).join("");
  view.querySelector(".crystalEventTop").after(tabs);
  tabs.addEventListener("click",event=>{
    const button=event.target.closest("[data-h-tab]");if(!button)return;
    view.dataset.halloweenTab=button.dataset.hTab;
    tabs.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
  });

  function state() {
    const s = game.halloweenEvent = game.halloweenEvent && typeof game.halloweenEvent === "object" ? game.halloweenEvent : {};
    s.currency = Math.max(0, Number(s.currency) || 0);
    for(const key of ["upgrades", "shopBought", "moonDrops"]) s[key] = s[key] && typeof s[key] === "object" ? s[key] : {};
    return s;
  }
  function phase(now=Date.now()) { return now < START ? "upcoming" : now < END ? "active" : now < SHOP_END ? "shopOnly" : "ended"; }
  const level = id => Math.max(0, Math.min(upgrades.find(u=>u.id===id)?.max || 0, Number(state().upgrades[id]) || 0));
  const cooldown = () => 950 - level("speed") * 45;
  const gain = () => Math.max(1, Math.round(1 + level("power")*.5 + level("bonus")*.35 + level("power")*level("bonus")*.04));
  const cost = def => Math.floor(def.base * Math.pow(def.scale, level(def.id)));
  const shopWindow = () => Math.floor(Date.now()/SHOP_INTERVAL);
  function shopItems() {
    const offset = Math.floor(weatherHash(`halloween:${shopWindow()}`)*supplies.length);
    return [0,1,2].map(i=>supplies[(offset+i)%supplies.length]);
  }
  function save(reason) {
    game.uiDirty = true;
    update(true, false);
    window.forceKretLocalSave?.();
    window.requestCloudSave?.({force:reason !== "halloweenCut",reason});
  }
  function weights(pool) { return pool.map((pet,i)=>pet.weight*(pool===eventPets && i>=2 ? 1+level("luck")*.07 : 1)); }
  function makePet(template, eggName) {
    const s = state();
    // Freeze the anchor once: seasonal pets cannot compound by copying each other.
    if(!s.petAnchor) {
      const best = getOwnedPets().filter(p=>!String(p.templateId).startsWith("halloween_") && !String(p.templateId).startsWith("bloodmoon_")).sort((a,b)=>getPetPowerRank(b)-getPetPowerRank(a))[0];
      s.petAnchor = {click:Math.max(20,Number(best?.click)||20),multi:Math.max(.25,Number(best?.multi)||.25),diamond:Math.max(.05,best?getPetDiamondBonusValue(best):.05)};
    }
    const a=s.petAnchor;
    const pet=buildPetInstance({id:template.id,name:template.name,icon:template.icon,rarity:"Exclusive",click:Math.max(1,Math.floor(a.click*template.scale)),multi:+(a.multi*template.scale).toFixed(4),diamond:+(a.diamond*template.scale).toFixed(4),color:template.color,secret:!!template.secret},{id:eggName=== "Dyniowe Jajko"?"halloween_event_egg":"blood_moon_egg",name:eggName});
    pet.exclusive=true;
    return pet;
  }
  function rollPet(pool, name) {
    const w=weights(pool); let roll=Math.random()*w.reduce((a,b)=>a+b,0);
    const index=w.findIndex(value=>(roll-=value)<=0);
    return makePet(pool[index<0?0:index],name);
  }
  function chanceRows(pool) {
    const w=weights(pool),total=w.reduce((a,b)=>a+b,0);
    return pool.map((pet,i)=>({pet:{...pet,rarity:pet.secret?"Sekretny":"Exclusive"},chance:`${(w[i]/total*100).toFixed(2)}%`}));
  }
  INVENTORY_EGG_CATALOG.halloween_event_egg={id:"halloween_event_egg",name:"Dyniowe Jajko",icon:"&#127875;",tint:"linear-gradient(135deg,#ffd693,#eb852f,#763a29)",voidEgg:true,chanceRows:()=>chanceRows(eventPets),rollPet:()=>rollPet(eventPets,"Dyniowe Jajko")};
  INVENTORY_EGG_CATALOG.blood_moon_egg={id:"blood_moon_egg",name:"Jajko Krwawego Ksiezyca",icon:"&#127761;",tint:"linear-gradient(135deg,#f6a8a0,#9d364b,#251b35)",voidEgg:true,chanceRows:()=>chanceRows(moonPets),rollPet:()=>rollPet(moonPets,"Jajko Krwawego Ksiezyca")};

  let lastPhase="",renderedWindow=-1;
  function sync() {
    const p=phase();
    document.body.classList.toggle("autumnTheme",Date.now()>=START && Date.now()<SHOP_END);
    const dock=document.getElementById("limitedEventDockBtn");
    dock.classList.remove("eventMystery");dock.title=p==="ended"?"Halloween - zakonczony":"Dyniowe Zbiory";
    if(dock.dataset.season!=="halloween") { dock.dataset.season="halloween";dock.innerHTML='<img src="assets/icons/pumpkin-mole.svg" alt="" width="32" height="32">'; }
    if(lastPhase!==p) {
      lastPhase=p;
      view.classList.toggle("crystalPhaseShopOnly",p!=="active");
      if(view.classList.contains("open")) render();
    }
    return p;
  }
  function render() {
    const s=state(),p=phase(),spend=p==="active"||p==="shopOnly";
    node("UpgradeList").innerHTML=upgrades.map(def=>`<div class="crystalUpgradeRow"><div class="crystalUpgradeRowTop"><b>${def.name} ${level(def.id)}/${def.max}</b><small>${def.desc}</small></div><button class="halloweenAction" data-h-upgrade="${def.id}" ${!spend||level(def.id)>=def.max||s.currency<cost(def)?"disabled":""}>${level(def.id)>=def.max?"MAX":`Kup za ${format(cost(def))} ${seedIcon}`}</button></div>`).join("");
    node("EggInfo").innerHTML=chanceRows(eventPets).map(row=>`<div class="crystalPetChance"><b>${row.pet.name}</b><small>${row.chance} | ${Math.round(row.pet.scale*100)}% bazowego peta</small></div>`).join("");
    node("OpenEggBtn").innerHTML=`Dyniowe Jajko · ${format(EGG_COST)} ${seedIcon}`;
    renderedWindow=shopWindow();
    node("ShopList").innerHTML=shopItems().map(item=>`<div class="crystalShopItem"><div class="crystalShopItemTop"><b>${item.name}</b><small>Dostepne: ${Math.max(0,item.stock-(s.shopBought[`${renderedWindow}:${item.id}`]||0))}/${item.stock}</small></div><button class="halloweenAction" data-h-shop="${item.id}">Kup za ${format(item.cost)} ${seedIcon}</button></div>`).join("")+`<div class="crystalShopItem"><b>Skin: Kret Dynia</b><small>Kosmetyczny, jeden na konto.</small><button class="halloweenAction" data-h-skin>Kup za 8000 ${seedIcon}</button></div>`;
    updateHud();
  }
  function updateHud() {
    const s=state(),p=phase(),spend=p==="active"||p==="shopOnly",left=Math.max(0,(s.cooldownUntil||0)-Date.now());
    node("CurrencyText").textContent=format(s.currency);
    const label=node("EventCountdownText").previousElementSibling;
    label.textContent=p==="active"?"Koniec zbiorow":p==="shopOnly"?"Koniec sklepu":p==="upcoming"?"Poczatek eventu":"Event zakonczony";
    node("EventCountdownText").textContent=p==="ended"?"Do zobaczenia!":formatLimitedEventTime((p==="active"?END:p==="upcoming"?START:SHOP_END)-Date.now());
    node("MineStatusText").innerHTML=p!=="active"?"Zbiory zakonczone":left?"Nastepne ciecie za "+(left/1000).toFixed(1)+" s":`Kroj dynie · +${gain()} ${seedIcon}`;
    mole.setAttribute("aria-disabled",String(p!=="active"));
    node("CooldownFill").style.width=`${Math.max(0,Math.min(100,(1-left/cooldown())*100))}%`;
    node("OpenEggBtn").disabled=!spend||s.currency<EGG_COST||hatchBusy;
    view.querySelectorAll("[data-h-upgrade]").forEach(b=>{const def=upgrades.find(u=>u.id===b.dataset.hUpgrade);b.disabled=!spend||level(def.id)>=def.max||s.currency<cost(def);});
    view.querySelectorAll("[data-h-shop]").forEach(b=>{const item=shopItems().find(i=>i.id===b.dataset.hShop);b.disabled=!spend||!item||s.currency<item.cost||(s.shopBought[`${shopWindow()}:${item.id}`]||0)>=item.stock;});
    view.querySelector("[data-h-skin]").disabled=!spend||s.currency<8000||game.skins.some(i=>i.templateId==="skin_halloween_pumpkin");
    node("ShopTimer").textContent=`Nowa dostawa za ${Math.ceil(((shopWindow()+1)*SHOP_INTERVAL-Date.now())/60000)} min`;
    if(renderedWindow!==shopWindow()) render();
  }
  function cut() {
    if(phase()!=="active") return;
    const s=state();if((s.cooldownUntil||0)>Date.now())return;
    const amount=gain();s.currency+=amount;s.cooldownUntil=Date.now()+cooldown();
    mole.classList.remove("hit");void mole.offsetWidth;mole.classList.add("hit");
    const drop=document.createElement("span");drop.className="crystalFloatGain";drop.innerHTML=`+${amount} ${seedIcon}`;mole.appendChild(drop);setTimeout(()=>drop.remove(),1000);
    window.kretAudio?.crystalMine?.();save("halloweenCut");updateHud();
  }
  view.addEventListener("click",event=>{
    const button=event.target.closest("button");if(!button||button.disabled)return;
    const s=state();if(!["active","shopOnly"].includes(phase()))return;
    if(button.hasAttribute("data-h-upgrade")) {
      const def=upgrades.find(u=>u.id===button.dataset.hUpgrade);if(!def||level(def.id)>=def.max||s.currency<cost(def))return;
      s.currency-=cost(def);s.upgrades[def.id]=level(def.id)+1;
    }else if(button.hasAttribute("data-h-shop")){
      const item=shopItems().find(i=>i.id===button.dataset.hShop);if(!item)return;
      const key=`${shopWindow()}:${item.id}`;if(s.currency<item.cost||(s.shopBought[key]||0)>=item.stock)return;
      s.currency-=item.cost;s.shopBought[key]=(s.shopBought[key]||0)+1;
      if(item.type==="bag")addBagToInventory(item.id,1);else game.potions.push(makePotionInstance(item.id,1));
    }else if(button.hasAttribute("data-h-skin")){
      if(s.currency<8000||game.skins.some(i=>i.templateId==="skin_halloween_pumpkin"))return;
      s.currency-=8000;game.skins.push({uid:`skin_${game.skinSeq++}`,templateId:"skin_halloween_pumpkin",name:"Kret Dynia",displayName:"Kret Dynia",skinClass:"skin-halloween-pumpkin",rarity:"Exclusive",sourceCrate:"Halloween 2026",accent:"#ed9b51",exclusive:true,event:true,powerRank:98000});trackExist("skins","skin_halloween_pumpkin");
    }else return;
    window.kretAudio?.crystalShop?.();save("halloweenPurchase");render();
  });
  mole.addEventListener("click",cut);
  mole.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();cut();}});
  node("OpenEggBtn").addEventListener("click",()=>{
    const s=state();if(!["active","shopOnly"].includes(phase())||s.currency<EGG_COST||hatchBusy)return;
    s.currency-=EGG_COST;addInventoryEggs("halloween_event_egg",1);showItemDropTile("egg",{icon:"&#127875;",name:"Dyniowe Jajko",color:"#ed9b51"});save("halloweenEgg");render();
  });
  function closeEvent(){view.classList.remove("open");view.classList.add("closing");document.body.classList.remove("halloweenEventActive");setTimeout(()=>view.classList.remove("closing"),360);}
  node("EventBackBtn").addEventListener("click",closeEvent);
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&view.classList.contains("open"))closeEvent();});
  document.getElementById("limitedEventDockBtn").onclick=()=>{closeAllSlidePanels();view.classList.remove("closing");view.classList.add("open");view.scrollTop=0;document.body.classList.add("halloweenEventActive");sync();render();window.kretAudio?.panel?.();};

  WEATHER_CATALOG.push({id:"bloodmoon",name:"Blood Moon",icon:"&#127761;",chance:4,duration:8*60*1000,luck:1.2,allMoney:1.15,availableFrom:START,availableUntil:END,desc:"+15% punktow, +20% szczescia. Reczne kliki: 1/18 000 na osobne Jajko Krwawego Ksiezyca (MEGA: 1/15 000). Maks. 2 na pogode, tylko do 1 listopada, 20:00."});
  function onMainClick() {
    if(phase()!=="active")return;
    const weather=getCurrentWeather();if(weather?.id!=="bloodmoon")return;
    const s=state(),key=String(weather.slotStart);
    if((s.moonDrops[key]||0)>=2||Math.random()>=(weather.mega?1/15000:1/18000))return;
    s.moonDrops[key]=(s.moonDrops[key]||0)+1;
    Object.keys(s.moonDrops).sort((a,b)=>Number(b)-Number(a)).slice(24).forEach(k=>delete s.moonDrops[k]);
    addInventoryEggs("blood_moon_egg",1);game.uiDirty=true;
    showItemDropTile("egg",{icon:"&#127761;",name:"Jajko Krwawego Ksiezyca",color:"#e89aa4"});window.kretAudio?.rare?.();
  }
  const decor=document.createElement("div");decor.id="autumnDecor";decor.setAttribute("aria-hidden","true");
  decor.innerHTML='<img class="autumnCorner autumnCornerA" src="assets/icons/autumn-corner.svg" alt=""><img class="autumnCorner autumnCornerB" src="assets/icons/autumn-corner.svg" alt=""><img class="autumnCorner autumnCornerC" src="assets/icons/autumn-corner.svg" alt="">';document.body.appendChild(decor);
  decor.querySelectorAll("img").forEach((img,index)=>{
    const offset=weatherHash(`autumn:${Date.now()}:${index}`);
    img.style.setProperty("--decor-offset",`${Math.round(offset*40-20)}px`);
    img.style.setProperty("--decor-tilt",`${offset*20-10}deg`);
  });
  window.kretHalloween={sync,phase,onMainClick,cut,endsAt:END,shopEndsAt:SHOP_END};
  sync();render();
  setInterval(()=>{if(view.classList.contains("open")){sync();updateHud();}},200);
})();
