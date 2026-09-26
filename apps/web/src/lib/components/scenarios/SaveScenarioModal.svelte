<script lang="ts">
  import {
    isSaveModalOpen,
    saveCurrentScenario,
    currentHazardConfig,
    scenarioParameters
  } from '$lib/stores/scenarioStore';

  let name = '';
  let summary = '';

  function handleSave() {
    if (!name.trim()) {
      name = `${$currentHazardConfig.name} (Custom)`;
    }
    saveCurrentScenario(name, summary);
    name = '';
    summary = '';
  }
</script>

{#if $isSaveModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none font-mono">
    <div class="w-full max-w-md p-5 rounded-2xl bg-[#030A16] border border-[#8B5CF6]/50 shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4">
      
      <!-- Top Bar -->
      <div class="flex items-center justify-between pb-2 border-b border-white/10">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
          <h3 class="text-xs font-bold text-white uppercase tracking-wider">SAVE SCENARIO SIMULATION</h3>
        </div>
        <button
          type="button"
          on:click={() => isSaveModalOpen.set(false)}
          class="text-[#8BA1B8] hover:text-white text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>

      <p class="text-[11px] text-[#8BA1B8] leading-relaxed">
        Save your active parameter modifications and factor configurations into the Scenario Library.
      </p>

      <!-- Form Inputs -->
      <div class="space-y-3 text-xs">
        <div>
          <label for="save-scenario-name-input" class="block text-[10px] uppercase text-[#8BA1B8] mb-1">Scenario Name</label>
          <input
            id="save-scenario-name-input"
            type="text"
            bind:value={name}
            placeholder="e.g. Monsoon Extreme Surge (+80% Rainfall)"
            class="w-full p-2.5 rounded-xl bg-[#061425] border border-white/10 text-white placeholder-[#8BA1B8]/50 focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>

        <div>
          <label for="save-scenario-notes-input" class="block text-[10px] uppercase text-[#8BA1B8] mb-1">Operational Description / Notes</label>
          <textarea
            id="save-scenario-notes-input"
            bind:value={summary}
            rows="3"
            placeholder="Document rationale, meteorological forcing assumptions, and strategic focus..."
            class="w-full p-2.5 rounded-xl bg-[#061425] border border-white/10 text-white placeholder-[#8BA1B8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs resize-none"
          ></textarea>
        </div>

        <!-- Current Params Pill -->
        <div class="p-2 rounded-lg bg-white/5 text-[10px] text-[#8BA1B8]">
          <span class="text-white font-semibold">Active Hazard:</span> {$currentHazardConfig.hazardType.toUpperCase()}
          • {Object.keys($scenarioParameters).length} customized parameters
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/10 text-xs">
        <button
          type="button"
          on:click={() => isSaveModalOpen.set(false)}
          class="px-3 py-1.5 rounded-lg text-[#8BA1B8] hover:text-white transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          on:click={handleSave}
          class="px-4 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)] cursor-pointer"
        >
          Save to Library
        </button>
      </div>

    </div>
  </div>
{/if}
