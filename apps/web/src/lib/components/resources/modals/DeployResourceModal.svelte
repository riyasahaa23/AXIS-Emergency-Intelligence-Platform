<script lang="ts">
  import {
    isDeployModalOpen,
    selectedResourceId,
    selectedResource,
    allResources,
    deployResource
  } from '../../../stores/resourceStore';

  let destination = 'Sylhet Advanced Riverfront Basin';
  let operation = 'Immediate Evacuation Sortie 04';
  let priority = 'CRITICAL';
  let targetResourceId = '';

  $: if ($selectedResource) {
    targetResourceId = $selectedResource.id;
  } else if ($allResources.length > 0) {
    targetResourceId = $allResources[0].id;
  }

  function handleSubmit() {
    deployResource(targetResourceId, destination, operation, priority);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') isDeployModalOpen.set(false);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $isDeployModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
    <div class="relative w-full max-w-lg bg-[#061425] border border-[#00E5FF]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            ✈️
          </div>
          <div>
            <h2 class="text-base font-bold font-mono text-white tracking-wider">
              DEPLOY EMERGENCY ASSET
            </h2>
            <p class="text-xs text-[#8BA1B8] font-sans">
              Dispatch equipment or supplies into active operational theaters
            </p>
          </div>
        </div>

        <button
          on:click={() => isDeployModalOpen.set(false)}
          class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-[#8BA1B8] hover:text-white flex items-center justify-center font-mono cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Form Inputs -->
      <form on:submit|preventDefault={handleSubmit} class="py-4 space-y-3.5 text-xs font-mono">
        <!-- Resource Selection -->
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Selected Resource
          </label>
          <select
            bind:value={targetResourceId}
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          >
            {#each $allResources as res}
              <option value={res.id} class="bg-[#061425] text-white">
                {res.id} — {res.name} ({res.status} at {res.location})
              </option>
            {/each}
          </select>
        </div>

        <!-- Destination -->
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Operational Destination
          </label>
          <input
            type="text"
            bind:value={destination}
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <!-- Operation Name -->
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Assigned Operation Directive
          </label>
          <input
            type="text"
            bind:value={operation}
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <!-- Priority Selection -->
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Deployment Priority
          </label>
          <select
            bind:value={priority}
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          >
            <option value="CRITICAL" class="bg-[#061425] text-rose-400">CRITICAL</option>
            <option value="HIGH" class="bg-[#061425] text-amber-400">HIGH</option>
            <option value="MEDIUM" class="bg-[#061425] text-blue-400">MEDIUM</option>
          </select>
        </div>

        <!-- Consequence Warning Box Matching Safety Rules -->
        <div class="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[11px] font-sans text-[#C5D1DE]">
          <span class="font-bold text-[#00E5FF] font-mono">OPERATIONAL CONSEQUENCE:</span>
          Status will transition from <span class="text-emerald-400 font-mono">AVAILABLE</span> to <span class="text-amber-400 font-mono">EN ROUTE</span>. Live asset metrics and map coordinates will update across JARVIS.
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            on:click={() => isDeployModalOpen.set(false)}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-[#020711] font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
          >
            Confirm Deployment
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
</style>
