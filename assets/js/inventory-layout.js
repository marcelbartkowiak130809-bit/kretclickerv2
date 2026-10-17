(() => {
  const panel = document.getElementById("petPanel");
  const tabs = panel.querySelector(".panelTabs");
  const lens = document.createElement("i");
  lens.className = "inventoryTabLens";
  lens.setAttribute("aria-hidden", "true");
  tabs.appendChild(lens);
  const reducedMotion = matchMedia("(prefers-reduced-motion:reduce)");
  let lastTab = null, contentTransition = null, lensFrame = 0;
  reducedMotion.addEventListener("change", () => {
    if(reducedMotion.matches) contentTransition?.cancel();
  });
  function positionLens() {
    cancelAnimationFrame(lensFrame);
    lensFrame = requestAnimationFrame(() => {
      const active = tabs.querySelector(".panelTab.active");
      if(!active || !panel.classList.contains("open")) return;
      lens.style.width = `${active.offsetWidth}px`;
      lens.style.height = `${active.offsetHeight}px`;
      lens.style.transform = `translate3d(${active.offsetLeft}px,${active.offsetTop}px,0)`;
      tabs.classList.add("lensReady");
    });
  }
  new ResizeObserver(positionLens).observe(tabs);
  const backdrop = document.createElement("div");
  backdrop.className = "inventoryBackdrop";
  backdrop.setAttribute("aria-hidden", "true");
  panel.before(backdrop);
  backdrop.addEventListener("click", () => closeSlidePanel(panel));
  const tools = document.getElementById("inventoryTools");
  const search = document.getElementById("inventorySearch");
  const filter = document.getElementById("inventoryFilter");
  const sort = document.getElementById("inventorySort");
  const normalize = text => String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pl");
  function filterPetGroups(groups) {
    const query = normalize(search.value.trim());
    const result = groups.filter(group => {
      if(query && !normalize(`${group.name} ${group.templateName} ${group.rarity} ${group.variant}`).includes(query)) return false;
      if(filter.value === "available" && !group.items.some(pet => !game.activePetIds.includes(pet.uid))) return false;
      return filter.value !== "rare" || group.items.some(isRareInventoryItem);
    });
    if(sort.value === "name") result.sort((a,b) => a.name.localeCompare(b.name, "pl"));
    if(sort.value === "level") result.sort((a,b) => Math.max(...b.items.map(getPetLevel)) - Math.max(...a.items.map(getPetLevel)));
    return result;
  }
  function syncTab(tab) {
    panel.dataset.inventoryTab = tab;
    tools.hidden = tab !== "pets";
    panel.querySelectorAll(".panelTab").forEach(button => button.setAttribute("aria-pressed", String(button.classList.contains("active"))));
    positionLens();
    if(lastTab !== null && tab !== lastTab) {
      contentTransition?.cancel();
      if(panel.classList.contains("open") && !reducedMotion.matches) {
        const list = Array.from(panel.querySelectorAll(".panelScroll")).find(node => node.style.display !== "none");
        contentTransition = list?.animate([{opacity:.35,transform:"translateY(7px)"},{opacity:1,transform:"translateY(0)"}], {duration:240,easing:"cubic-bezier(.2,.8,.2,1)"});
      }
    }
    lastTab = tab;
  }
  function refresh() {
    renderInventoryPanelStable(true);
    document.getElementById("petList").scrollTop = 0;
  }
  let timer;
  search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(refresh, 120); });
  filter.addEventListener("change", refresh);
  sort.addEventListener("change", refresh);
  const originalSetTab = setInventoryTab;
  setInventoryTab = function(tab) {
    originalSetTab(tab);
    panel.querySelectorAll(".panelScroll").forEach(list => { list.scrollTop = 0; });
  };
  let wasOpen = panel.classList.contains("open"), returnFocus = null;
  new MutationObserver(() => {
    const open = panel.classList.contains("open");
    if(open === wasOpen) return;
    wasOpen = open;
    if(open) {
      returnFocus = document.activeElement;
      syncTab(game.inventoryTab || "pets");
      panel.querySelector(".panelCloseBtn")?.focus({preventScroll:true});
    } else if(!document.querySelector("#hatchOverlay.open, #eggChoiceOverlay.open")) {
      returnFocus?.focus?.({preventScroll:true});
    }
  }).observe(panel, {attributes:true, attributeFilter:["class"]});
  document.addEventListener("keydown", event => {
    if(event.key !== "Escape" || !panel.classList.contains("open")) return;
    const chanceClose = document.querySelector(".chanceOverlay.open .chanceOverlayClose");
    if(!chanceClose) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    chanceClose.click();
  }, true);
  panel.addEventListener("keydown", event => {
    if(event.key !== "Tab" || document.querySelector(".chanceOverlay.open, #eggChoiceOverlay.open")) return;
    const focusable = Array.from(panel.querySelectorAll('button,input,select,[tabindex="0"]')).filter(el => !el.disabled && el.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if(event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if(!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  window.kretInventory = {filterPetGroups, syncTab};
  syncTab(game.inventoryTab || "pets");
})();
