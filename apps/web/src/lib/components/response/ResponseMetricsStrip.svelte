<script lang="ts">
  import { responseStatistics } from '../../stores/responseStore';
</script>

<div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 shrink-0">
  <!-- Card 1: Response Teams -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#3D7CFF]/40 transition-all flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-[#3D7CFF]/15 border border-[#3D7CFF]/30 flex items-center justify-center text-[#3D7CFF] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-white tracking-tight">
        {$responseStatistics.responseTeams}
      </div>
      <div class="text-[11px] text-[#8BA1B8] font-sans">
        Response Teams
      </div>
    </div>
  </div>

  <!-- Card 2: Personnel Deployed -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#10B981]/40 transition-all flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-white tracking-tight">
        {$responseStatistics.personnelDeployed.toLocaleString()}
      </div>
      <div class="text-[11px] text-[#8BA1B8] font-sans">
        Personnel Deployed
      </div>
    </div>
  </div>

  <!-- Card 3: Active Operations -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#8B5CF6]/40 transition-all flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-white tracking-tight">
        {$responseStatistics.activeOperations}
      </div>
      <div class="text-[11px] text-[#8BA1B8] font-sans">
        Active Operations
      </div>
    </div>
  </div>

  <!-- Card 4: Mission Completion -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#00E5FF]/40 transition-all flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-white tracking-tight">
        {$responseStatistics.missionCompletion}%
      </div>
      <div class="text-[11px] text-[#8BA1B8] font-sans">
        Mission Completion
      </div>
    </div>
  </div>

  <!-- Card 5: High Priority Areas -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#EF4444]/40 transition-all flex items-center gap-3 col-span-2 md:col-span-1">
    <div class="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-white tracking-tight">
        {$responseStatistics.highPriorityAreas}
      </div>
      <div class="text-[11px] text-[#8BA1B8] font-sans">
        High Priority Areas
      </div>
    </div>
  </div>
</div>
