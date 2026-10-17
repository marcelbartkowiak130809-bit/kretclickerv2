(() => {
  // Atlas cells only describe cosmetics; pet data and variant multipliers stay untouched.
  const rules = [
    [/singer/, "singer", 0], [/miner/, "miner", 1], [/egg1_gold/, "sun", 2],
    [/mechanic/, "mechanic", 3], [/sailor/, "sailor", 4], [/explorer/, "explorer", 5],
    [/ninja/, "ninja", 6], [/robot/, "robot", 7], [/egg4_king/, "king", 8],
    [/egg5_wind/, "lightning", 9], [/egg5_star/, "star", 10], [/egg6_diamond/, "diamond", 11],
    [/cosmic|weather_avatar/, "cosmic", 12], [/nebula/, "nebula", 13],
    [/void_echo/, "echo", 14], [/void_oracle/, "oracle", 15], [/abyss/, "abyss", 16],
    [/singularity/, "singularity", 17], [/void_overseer|void_nullking/, "overlord", 18],
    [/chrono/, "chrono", 19], [/crystal_scout/, "scout", 20], [/crystal_oracle/, "crystalOracle", 21],
    [/crystal_emperor|crystal_overlord/, "crystalKing", 22], [/crystal_guard/, "diamond", 11],
    [/water_splash|water_flooded/, "diver", 23], [/water_wave|water_tide|tornado/, "admiral", 24],
    [/halloween_sprout/, "sprout", 25], [/halloween_lantern/, "lantern", 26],
    [/halloween_witch/, "witch", 27], [/halloween_harvest/, "harvest", 28], [/halloween_king/, "king", 8],
    [/bloodmoon_bat/, "bat", 29], [/bloodmoon_shadow/, "abyss", 16], [/bloodmoon_watcher/, "oracle", 15],
    [/bloodmoon_eclipse/, "singularity", 17], [/bloodmoon_knight/, "moonKnight", 30],
    [/boss_pet/, "boss", 31]
  ];
  const outfit = pet => rules.find(([pattern]) => pattern.test(pet?.templateId || pet?.id || ""));
  window.kretPetWardrobe = {
    classFor(pet) { const found = outfit(pet); return found ? `petDressed petLook-${found[1]}` : ""; },
    html(pet) {
      const found = outfit(pet);
      if(!found) return "";
      const index = found[2];
      return `<span class="petOutfit" aria-hidden="true" style="--outfit-x:${index % 8 / 7 * 100}%;--outfit-y:${Math.floor(index / 8) / 3 * 100}%"></span>`;
    }
  };
})();
