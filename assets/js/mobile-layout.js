(() => {
  const phone = matchMedia("(max-width:700px), (max-height:500px) and (pointer:coarse)");
  const placements = new Map();
  let lastFocus = null;

  function move(id, parent) {
    const node = document.getElementById(id);
    if(!node) return;
    if(!placements.has(node)) {
      const marker = document.createComment(`mobile:${id}`);
      node.before(marker);
      placements.set(node, marker);
    }
    parent.appendChild(node);
  }

  function init() {
    const navigation = document.createElement("nav");
    navigation.id = "mobileNavigation";
    navigation.setAttribute("aria-label", "Menu gry");
    const utility = document.createElement("div");
    utility.id = "mobileUtility";
    const toggle = document.createElement("button");
    toggle.id = "mobileShopToggle";
    toggle.type = "button";
    toggle.textContent = "Ulepszenia";
    toggle.setAttribute("aria-controls", "mobileShopPanel");
    toggle.setAttribute("aria-expanded", "false");
    const drawer = document.createElement("div");
    drawer.id = "mobileShopPanel";
    drawer.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="mobileShopTitle"><header><b id="mobileShopTitle">Ulepszenia</b><button type="button" aria-label="Zamknij ulepszenia">&times;</button></header><div id="mobileShopContent"></div></section>';
    drawer.inert = true;
    document.body.append(navigation, utility, toggle, drawer);

    function setShop(open, restoreFocus = true) {
      const changed = drawer.classList.contains("open") !== open;
      if(open) {
        lastFocus = document.activeElement;
        window.closeAllSlidePanels?.();
      }
      drawer.inert = !open;
      drawer.classList.toggle("open", open);
      document.body.classList.toggle("mobileShopOpen", open);
      toggle.setAttribute("aria-expanded", String(open));
      if(open) drawer.querySelector("header button").focus({preventScroll:true});
      else if(restoreFocus && lastFocus?.isConnected) lastFocus.focus({preventScroll:true});
      if(changed) window.kretAudio?.[open ? "panel" : "close"]?.();
    }

    function sync() {
      setShop(false, false);
      document.body.classList.toggle("compactPhone", phone.matches);
      if(phone.matches) {
        move("leftDock", navigation);
        move("rightDock", navigation);
        ["gameInfoBtn", "streakHud", "appInstallBtn", "freeRewardsBtn", "audioControl"].forEach(id => move(id, utility));
        move("shop", document.getElementById("mobileShopContent"));
        move("stopAutoEggBtn", document.getElementById("hatchOverlay"));
        window.scrollTo(0, 0);
      } else {
        placements.forEach((marker, node) => marker.after(node));
      }
    }

    toggle.addEventListener("click", () => setShop(!drawer.classList.contains("open")));
    drawer.querySelector("header button").addEventListener("click", () => setShop(false));
    drawer.addEventListener("click", event => { if(event.target === drawer) setShop(false); });
    document.addEventListener("keydown", event => {
      if(!drawer.classList.contains("open")) return;
      if(event.key === "Escape") { event.preventDefault(); setShop(false); }
      if(event.key !== "Tab") return;
      const buttons = [...drawer.querySelectorAll('button:not([disabled]), input, select, [tabindex="0"]')].filter(node => node.getClientRects().length);
      const first = buttons[0], last = buttons.at(-1);
      if(event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if(!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    navigation.addEventListener("click", () => {
      if(drawer.classList.contains("open")) setShop(false, false);
    }, true);
    phone.addEventListener("change", sync);
    sync();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
