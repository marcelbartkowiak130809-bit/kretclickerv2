(() => {
  // Only navigation/category strips opt in. Purchase and gameplay buttons never do.
  const selectors = ["#petPanel > .panelTabs", ".marketTabs", ".indexTabs", ".indexVariantPicker", ".halloweenTabs", ".leaderboardCategoryGrid", ".bossLeaderboardTabs", ".bossMetricTabs"];
  const selector = selectors.join(",");
  const groups = new Map(), geometry = new Map(), pending = new Set();
  let frame = 0, gesture = null, suppressClickUntil = 0;
  const buttons = bar => Array.from(bar.children).filter(node => node.matches("button") && !node.disabled && node.getAttribute("aria-disabled") !== "true");
  const selected = bar => {
    const items = buttons(bar);
    return items.find(button => button.classList.contains("active")) || items.find(button => button.getAttribute("aria-selected") === "true") || items.find(button => button.getAttribute("aria-pressed") === "true");
  };
  function setRect(lens, rect) {
    lens.style.width = `${rect.w}px`;
    lens.style.height = `${rect.h}px`;
    lens.style.transform = `translate3d(${rect.x}px,${rect.y}px,0)`;
  }
  function update(bar) {
    const state = groups.get(bar);
    if(!state || !bar.isConnected || !bar.getClientRects().length || getComputedStyle(bar).visibility === "hidden") return;
    const active = selected(bar);
    if(!active) return;
    const rect = {x:active.offsetLeft,y:active.offsetTop,w:active.offsetWidth,h:active.offsetHeight};
    setRect(state.lens, rect);
    geometry.set(state.key, rect);
    if(!bar.classList.contains("liquidTabsReady")) bar.classList.add("liquidTabsReady");
    if(bar.matches(selectors[0]) && !bar.classList.contains("lensReady")) bar.classList.add("lensReady");
    for(const button of buttons(bar)) {
      const value = String(button === active);
      if(button.getAttribute("aria-pressed") !== value) button.setAttribute("aria-pressed", value);
    }
  }
  function refresh(bar) {
    if(bar) pending.add(bar); else groups.forEach((_, node) => pending.add(node));
    if(frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      pending.forEach(update); pending.clear();
      groups.forEach((state, node) => { if(!node.isConnected) { state.resize.disconnect(); groups.delete(node); } });
    });
  }
  function install(bar) {
    if(groups.has(bar)) return;
    const key = selectors.find(value => bar.matches(value));
    const lens = document.createElement("i");
    lens.className = "liquidTabLens" + (bar.matches(selectors[0]) ? " inventoryTabLens" : "");
    lens.setAttribute("aria-hidden", "true");
    bar.classList.add("liquidTabs");
    bar.appendChild(lens);
    if(geometry.has(key)) { setRect(lens, geometry.get(key)); lens.getBoundingClientRect(); }
    const resize = new ResizeObserver(() => refresh(bar));
    groups.set(bar, {key,lens,resize}); resize.observe(bar); refresh(bar);
    if(gesture?.key === key) bar.classList.add("liquidTabsDragging");
  }
  function discover(node) {
    if(!(node instanceof Element)) return;
    if(node.matches(selector)) install(node);
    node.querySelectorAll(selector).forEach(install);
  }
  new MutationObserver(records => {
    let removedStrip = false;
    for(const record of records) {
      if(record.type === "childList") {
        record.addedNodes.forEach(discover);
        record.removedNodes.forEach(node => {
          if(node instanceof Element && (node.matches(selector) || node.querySelector(selector))) removedStrip = true;
        });
      }
      else if(record.target.matches("button")) {
        const bar = record.target.closest(selector);
        if(bar) refresh(bar);
      }
      else if(record.target.matches(".slidePanel,.marketplaceView,.halloweenEventView")) refresh();
    }
    if(removedStrip) refresh();
  }).observe(document.body, {subtree:true,childList:true,attributes:true,attributeFilter:["class","aria-pressed","aria-selected"]});
  document.querySelectorAll(selector).forEach(install);

  function liveBar(key, host) {
    const candidates = Array.from(groups).filter(([bar,state]) => state.key === key && bar.isConnected && bar.getClientRects().length && getComputedStyle(bar).visibility !== "hidden");
    return (candidates.find(([bar]) => host?.contains(bar)) || candidates[0])?.[0];
  }
  function activateAt(event, force=false) {
    const bar = liveBar(gesture.key, gesture.host);
    if(!bar) return;
    const bounds = bar.getBoundingClientRect();
    if(event.clientX < bounds.left-8 || event.clientX > bounds.right+8 || event.clientY < bounds.top-8 || event.clientY > bounds.bottom+8) return;
    if(bar.scrollHeight > bar.clientHeight) {
      if(event.clientY < bounds.top+18) bar.scrollTop -= 12;
      if(event.clientY > bounds.bottom-18) bar.scrollTop += 12;
    }
    if(bar.scrollWidth > bar.clientWidth) {
      if(event.clientX < bounds.left+18) bar.scrollLeft -= 12;
      if(event.clientX > bounds.right-18) bar.scrollLeft += 12;
    }
    const target = buttons(bar).find(button => {
      const rect = button.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    });
    if(!target || target === selected(bar)) return;
    const now = performance.now();
    if(!force && now-gesture.lastActivation < 80) return;
    gesture.lastActivation = now;
    target.click();
    refresh();
  }
  document.addEventListener("pointerdown", event => {
    suppressClickUntil = 0;
    if(gesture || !event.isPrimary || event.button !== 0) return;
    const bar = event.target instanceof Element ? event.target.closest(selector) : null;
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if(!bar || !button || button.parentElement !== bar || !buttons(bar).includes(button) || getComputedStyle(bar).pointerEvents === "none") return;
    gesture = {id:event.pointerId,key:groups.get(bar)?.key,host:bar.parentElement,x:event.clientX,y:event.clientY,dragged:false,lastActivation:0};
  }, true);
  document.addEventListener("pointermove", event => {
    if(!gesture || gesture.id !== event.pointerId) return;
    if(!gesture.dragged && Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y) < 6) return;
    if(!gesture.dragged) {
      gesture.dragged = true;
      document.documentElement.setPointerCapture(event.pointerId);
      liveBar(gesture.key, gesture.host)?.classList.add("liquidTabsDragging");
    }
    event.preventDefault();
    activateAt(event);
  }, {capture:true,passive:false});
  function finish(event, cancelled=false) {
    if(!gesture || gesture.id !== event.pointerId) return;
    if(gesture.dragged) {
      if(!cancelled) activateAt(event, true);
      suppressClickUntil = performance.now()+300;
      event.preventDefault();
    }
    const id = gesture.id;
    gesture = null;
    groups.forEach((_, bar) => bar.classList.remove("liquidTabsDragging"));
    if(document.documentElement.hasPointerCapture(id)) document.documentElement.releasePointerCapture(id);
    refresh();
  }
  document.addEventListener("pointerup", event => finish(event), true);
  document.addEventListener("pointercancel", event => finish(event, true), true);
  document.addEventListener("lostpointercapture", event => {
    // Touch starts with implicit capture on the button; transferring it to the
    // stable root must not cancel a drag when a tab rerenders its own strip.
    if(event.target === document.documentElement && gesture?.id === event.pointerId) finish(event, true);
  }, true);
  document.addEventListener("click", event => {
    if(event.isTrusted && event.detail && performance.now() < suppressClickUntil) {
      suppressClickUntil = 0;
      event.preventDefault(); event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener("dragstart", event => { if(event.target instanceof Element && event.target.closest(selector)) event.preventDefault(); });
  document.addEventListener("keydown", event => {
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(event.key)) return;
    const bar = event.target instanceof Element ? event.target.closest(selector) : null;
    if(!bar || !event.target.matches("button")) return;
    const items = buttons(bar),index = items.indexOf(event.target);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length-1 : (index + (["ArrowLeft","ArrowUp"].includes(event.key) ? -1 : 1) + items.length) % items.length;
    event.preventDefault();
    const key = groups.get(bar).key, host = bar.parentElement;
    items[next]?.click();
    requestAnimationFrame(() => selected(liveBar(key, host) || bar)?.focus({preventScroll:true}));
  });
  window.addEventListener("resize", () => refresh());
  window.kretLiquidTabs = {refresh};
})();
