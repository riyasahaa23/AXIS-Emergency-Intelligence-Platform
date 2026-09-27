<script lang="ts">
  import {
    responseTeams,
    selectedTeamId,
    selectTeam,
    reassignTeam,
    recallTeam,
    isDeployTeamModalOpen
  } from '../../../stores/responseStore';
  import type { TeamStatus, ResponseTeam } from '../../../types/response';

  let filterStatus: 'All' | TeamStatus = 'All';
  let searchTerm = '';

  $: filteredTeams = $responseTeams.filter((t) => {
    const matchesFilter = filterStatus === 'All' || t.status === filterStatus;
    const matchesSearch =
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leader.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function getStatusClasses(status: TeamStatus) {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'En Route':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'Delayed':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
    }
  }
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Subview Control Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
        👥
      </div>
      <div>
        <h2 class="text-sm font-bold font-mono text-white">TACTICAL TEAM DEPLOYMENT ROSTER</h2>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Manage, reassign, and track field response strike forces in real time
        </p>
      </div>
    </div>

    <!-- Actions & Filters -->
    <div class="flex items-center gap-2.5">
      <!-- Search Input -->
      <div class="relative">
        <input
          type="text"
          bind:value={searchTerm}
          placeholder="Filter team, code, leader..."
          class="px-3 py-1.5 pl-8 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#00E5FF]/60 w-48"
        />
        <svg class="w-3.5 h-3.5 text-[#8BA1B8] absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Status Pills -->
      <div class="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
        {#each ['All', 'Active', 'En Route', 'Delayed', 'Standby'] as st}
          <button
            on:click={() => filterStatus = st}
            class="px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer {
              filterStatus === st
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                : 'text-[#8BA1B8] hover:text-white'
            }"
          >
            {st}
          </button>
        {/each}
      </div>

      <!-- Dispatch Button -->
      <button
        on:click={() => isDeployTeamModalOpen.set(true)}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E5FF] text-[#020711] text-xs font-mono font-bold hover:bg-[#38BDF8] transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
      >
        <span>+</span>
        <span>Dispatch Team</span>
      </button>
    </div>
  </div>

  <!-- Teams Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {#each filteredTeams as team (team.id)}
      <div
        on:click={() => selectTeam(team.id)}
        on:keydown={(e) => e.key === 'Enter' && selectTeam(team.id)}
        tabindex="0"
        role="button"
        class="p-4 rounded-2xl border transition-all text-left flex flex-col justify-between {
          $selectedTeamId === team.id
            ? 'bg-[#091E36] border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.25)]'
            : 'bg-[#061425]/60 border-white/10 hover:border-white/25 hover:bg-[#061425]/90'
        }"
      >
        <!-- Top Row -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold">
                {team.code}
              </span>
              <span class="text-sm font-bold text-white truncate max-w-[160px]">
                {team.name}
              </span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide {getStatusClasses(team.status)}">
              {team.status}
            </span>
          </div>

          <!-- Location & Sector -->
          <div class="text-xs text-[#E6EDF3] font-mono mb-1 flex items-center gap-1.5">
            <span class="text-[#00E5FF]">📍</span>
            <span>{team.location}</span>
            <span class="text-[#8BA1B8]">({team.sector})</span>
          </div>

          <!-- Mission Narrative -->
          <p class="text-[11px] text-[#8BA1B8] font-sans mb-3 line-clamp-2">
            {team.mission}
          </p>

          <!-- Telemetry Badges -->
          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3 p-2 rounded-xl bg-black/30 border border-white/5">
            <div>
              <span class="text-[#8BA1B8]">Commander:</span>
              <div class="text-white truncate font-medium">{team.leader}</div>
            </div>
            <div>
              <span class="text-[#8BA1B8]">Strength:</span>
              <div class="text-emerald-400 font-bold">{team.personnel} Personnel</div>
            </div>
            <div class="col-span-2">
              <span class="text-[#8BA1B8]">Asset:</span>
              <div class="text-[#00E5FF] truncate">{team.vehicle}</div>
            </div>
            <div class="col-span-2">
              <span class="text-[#8BA1B8]">Radio Comm:</span>
              <div class="text-[#F59E0B] font-mono">{team.radioChannel}</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-3">
            <div class="flex justify-between text-[10px] font-mono text-[#8BA1B8] mb-1">
              <span>Mission Progress</span>
              <span class="text-[#00E5FF] font-bold">{team.progress}%</span>
            </div>
            <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                class="h-full bg-gradient-to-r from-[#00E5FF]/70 to-[#00E5FF] rounded-full"
                style="width: {team.progress}%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 shrink-0">
          <button
            on:click|stopPropagation={() => reassignTeam(team.id, 'Surge Sector Delta', 'Surging immediate emergency evacuation aid')}
            class="py-1.5 px-2 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Reassign Sector
          </button>

          <button
            on:click|stopPropagation={() => recallTeam(team.id)}
            class="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-[10px] font-mono transition-all text-center cursor-pointer"
          >
            Recall to Depot
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
