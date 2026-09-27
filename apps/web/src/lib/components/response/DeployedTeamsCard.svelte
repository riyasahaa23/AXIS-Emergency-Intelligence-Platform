<script lang="ts">
  import {
    responseTeams,
    selectedTeamId,
    selectTeam,
    activeResponseMode
  } from '../../stores/responseStore';
  import type { TeamStatus } from '../../types/response';

  $: visibleTeams = $responseTeams.slice(0, 5);

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

<div class="flex flex-col h-full bg-[#061425]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3 select-none">
  <!-- Header with View All -->
  <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-3.5 h-3.5 rounded-full border border-[#00E5FF] flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      </div>
      <h3 class="text-xs font-mono font-bold tracking-wider text-white uppercase">
        DEPLOYED TEAMS
      </h3>
    </div>

    <button
      on:click={() => activeResponseMode.set('teams')}
      class="text-[10px] font-mono text-[#00E5FF] hover:underline cursor-pointer bg-transparent border-0 p-0"
    >
      View all →
    </button>
  </div>

  <!-- Table Header -->
  <div class="grid grid-cols-12 gap-2 text-[10px] font-mono text-[#8BA1B8] uppercase px-2 py-1 shrink-0">
    <div class="col-span-2">TEAM</div>
    <div class="col-span-4">LOCATION</div>
    <div class="col-span-3 text-center">STATUS</div>
    <div class="col-span-3 text-right">PROGRESS</div>
  </div>

  <!-- Table Body Rows -->
  <div class="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
    {#each visibleTeams as team (team.id)}
      <div
        on:click={() => selectTeam(team.id)}
        on:keydown={(e) => e.key === 'Enter' && selectTeam(team.id)}
        tabindex="0"
        role="button"
        class="grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer {
          $selectedTeamId === team.id
            ? 'bg-[#091E36] border-[#00E5FF]/60 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
            : 'bg-[#061425]/40 border-white/5 hover:border-white/20 hover:bg-[#061425]/80'
        }"
      >
        <!-- Team Code -->
        <div class="col-span-2 font-bold text-white">
          {team.code}
        </div>

        <!-- Location -->
        <div class="col-span-4 text-[#C5D1DE] text-[11px] truncate" title={team.location}>
          {team.location}
        </div>

        <!-- Status Badge -->
        <div class="col-span-3 flex justify-center">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold tracking-wide {getStatusClasses(team.status)}">
            {team.status}
          </span>
        </div>

        <!-- Progress -->
        <div class="col-span-3 flex items-center justify-end gap-1.5">
          <div class="w-12 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              class="h-full bg-gradient-to-r from-[#00E5FF]/70 to-[#00E5FF] rounded-full"
              style="width: {team.progress}%"
            ></div>
          </div>
          <span class="text-[10px] text-[#00E5FF] w-7 text-right font-bold">
            {team.progress}%
          </span>
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
