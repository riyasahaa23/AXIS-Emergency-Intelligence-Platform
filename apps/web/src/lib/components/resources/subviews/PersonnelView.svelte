<script lang="ts">
  import { emergencyPersonnel } from '../../../stores/resourceStore';
  import type { PersonnelItem } from '../../../types/resources';

  let selectedSpec = 'All';

  $: filteredPersonnel = $emergencyPersonnel.filter((p) => {
    if (selectedSpec !== 'All' && p.specialization !== selectedSpec) return false;
    return true;
  });

  function getStatusClasses(status: string) {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'DEPLOYED':
        return 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30';
      case 'RESTING':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  }

  function handleDeploy(person: PersonnelItem) {
    emergencyPersonnel.update((list) =>
      list.map((p) => (p.id === person.id ? { ...p, status: 'DEPLOYED', assignment: 'Active Field Sortie' } : p))
    );
  }

  function handleRelieve(person: PersonnelItem) {
    emergencyPersonnel.update((list) =>
      list.map((p) => (p.id === person.id ? { ...p, status: 'RESTING', assignment: 'Mandatory Rest Cycle' } : p))
    );
  }
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Control Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
        👨‍✈️
      </div>
      <div>
        <h2 class="text-sm font-bold font-mono text-white">EMERGENCY RESPONSE PERSONNEL ROSTER</h2>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Manage operational readiness, shift rotations, and field commander deployments
        </p>
      </div>
    </div>

    <!-- Specialization Filter Pills -->
    <div class="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 overflow-x-auto">
      {#each ['All', 'Medical', 'Rescue', 'Logistics', 'Engineering', 'Communications', 'Command'] as spec}
        <button
          on:click={() => selectedSpec = spec}
          class="px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap {
            selectedSpec === spec
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
              : 'text-[#8BA1B8] hover:text-white'
          }"
        >
          {spec}
        </button>
      {/each}
    </div>
  </div>

  <!-- Personnel Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
    {#each filteredPersonnel as person (person.id)}
      <div class="p-4 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="text-[9px] font-mono text-[#00E5FF] uppercase font-bold tracking-wider">
                {person.specialization} // {person.id}
              </span>
              <h3 class="text-sm font-bold text-white font-mono">{person.name}</h3>
              <div class="text-[11px] text-[#8BA1B8] font-sans">{person.role}</div>
            </div>

            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase {getStatusClasses(person.status)}">
              {person.status}
            </span>
          </div>

          <!-- Assignment & Location -->
          <div class="space-y-1.5 p-2.5 rounded-xl bg-black/30 border border-white/5 font-mono text-xs mb-3">
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Station:</span>
              <span class="text-white truncate max-w-[150px]">{person.location}</span>
            </div>
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Assignment:</span>
              <span class="text-[#00E5FF] truncate max-w-[150px]">{person.assignment}</span>
            </div>
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Comm Channel:</span>
              <span class="text-white">{person.contact}</span>
            </div>
          </div>
        </div>

        <!-- Action Row -->
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 shrink-0">
          <button
            on:click={() => handleDeploy(person)}
            class="py-1.5 px-2 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Deploy
          </button>
          <button
            on:click={() => handleRelieve(person)}
            class="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-[10px] font-mono transition-all text-center cursor-pointer"
          >
            Relieve Shift
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
