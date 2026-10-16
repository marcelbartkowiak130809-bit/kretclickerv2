(() => {
  const panel = document.getElementById("petPanel");
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
