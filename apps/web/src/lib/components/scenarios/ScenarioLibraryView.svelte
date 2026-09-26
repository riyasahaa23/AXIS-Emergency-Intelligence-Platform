<script lang="ts">
  import {
    savedScenarios,
    loadSavedScenario,
    duplicateSavedScenario,
    deleteSavedScenario,
    activeScenarioView,
    resetScenarioConfiguration
  } from '$lib/stores/scenarioStore';
  import type { SavedScenario } from '$lib/types/scenario';

  let searchQuery = '';

  $: filteredScenarios = $savedScenarios.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.incidentName.toLowerCase().includes(q) || s.hazardType.toLowerCase().includes(q);
  });

  function handleCreateNew() {
    resetScenarioConfiguration();
    activeScenarioView.set('builder');
  }
</script>

<div class="flex flex-col gap-4 w-full h-full font-mono select-none p-2">
  
  <!-- Header & Actions -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
    <div>
      <h2 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
        <span>SCENARIO LIBRARY</span>
        <span class="text-[#8BA1B8] text-xs">({$savedScenarios.length} SAVED PRESETS)</span>
      </h2>
      <p class="text-[11px] text-[#8BA1B8] mt-0.5">
        Explore, load, or fork pre-configured what-if counterfactual simulation packages.
      </p>
    </div>

    <div class="flex items-center gap-2">
      <input
        type="text"
        placeholder="Filter scenarios..."
        bind:value={searchQuery}
        class="px-3 py-1.5 rounded-lg bg-[#061425] border border-white/10 text-xs text-white placeholder-[#8BA1B8]/60 focus:outline-none focus:border-[#00E5FF]"
      />
      <button
        type="button"
        on:click={handleCreateNew}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition-colors cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.4)]"
      >
        <span>+</span>
        <span>New Scenario</span>
      </button>
    </div>
  </div>

  <!-- Scenario Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto custom-scrollbar pr-1 pb-4">
    {#each filteredScenarios as scen}
      <div class="flex flex-col justify-between p-4 rounded-2xl bg-[#030A16]/90 border border-white/10 hover:border-[#8B5CF6]/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] group">
        
        <!-- Card Top Details -->
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider {
              scen.hazardType === 'flood' ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40' :
              scen.hazardType === 'cyclone' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/40' :
              scen.hazardType === 'wildfire' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40' :
              scen.hazardType === 'earthquake' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40' :
              'bg-purple-500/15 text-purple-400 border border-purple-500/40'
            }">
              {scen.hazardType}
            </span>

            <span class="text-[9px] text-[#8BA1B8]">{scen.createdAt}</span>
          </div>

          <h3 class="text-xs font-bold text-white group-hover:text-[#C084FC] transition-colors mb-1 line-clamp-1">
            {scen.name}
          </h3>

          <div class="text-[10px] text-[#00E5FF] mb-2 font-semibold">
            Base: {scen.incidentName}
          </div>

          <p class="text-[11px] text-[#8BA1B8] leading-relaxed mb-3 line-clamp-2">
            {scen.summary}
          </p>

          <!-- Key Parameters Snippet -->
          <div class="p-2 rounded-lg bg-[#061425] border border-white/5 mb-3 text-[10px] text-[#8BA1B8] flex flex-wrap gap-x-3 gap-y-1">
            {#each Object.entries(scen.parameters).slice(0, 3) as [key, val]}
              <span class="flex items-center gap-1">
                <span class="text-white font-medium">{key}:</span>
                <span class="text-[#8B5CF6] font-bold">{val}</span>
              </span>
            {/each}
          </div>
        </div>

        <!-- Actions Row -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <div class="flex items-center gap-2">
            <button
              type="button"
              on:click={() => duplicateSavedScenario(scen.id)}
              class="p-1 rounded text-[#8BA1B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Duplicate scenario"
            >
              📋 Duplicate
            </button>
            <button
              type="button"
              on:click={() => deleteSavedScenario(scen.id)}
              class="p-1 rounded text-[#8BA1B8] hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
              title="Delete scenario"
            >
              🗑 Delete
            </button>
          </div>

          <button
            type="button"
            on:click={() => loadSavedScenario(scen)}
            class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/50 text-[#00E5FF] font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          >
            <span>Load</span>
            <span>→</span>
          </button>
        </div>

      </div>
    {/each}
  </div>

</div>
