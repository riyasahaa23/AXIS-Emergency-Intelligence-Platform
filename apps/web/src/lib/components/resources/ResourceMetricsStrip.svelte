<script lang="ts">
  import { resourceMetrics } from '../../stores/resourceStore';
</script>

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4 shrink-0 select-none">
  <!-- 1. Total Assets -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#3D7CFF]/40 transition-all flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-[#3D7CFF]/15 border border-[#3D7CFF]/30 flex items-center justify-center text-[#3D7CFF] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-white tracking-tight">
        {$resourceMetrics.totalAssets}
      </div>
      <div class="text-[10px] text-[#8BA1B8] font-mono uppercase tracking-wider">
        TOTAL ASSETS
      </div>
    </div>
  </div>

  <!-- 2. Available -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#10B981]/40 transition-all flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-emerald-400 tracking-tight">
        {$resourceMetrics.available}
      </div>
      <div class="text-[10px] text-[#8BA1B8] font-mono uppercase tracking-wider">
        AVAILABLE
      </div>
    </div>
  </div>

  <!-- 3. Deployed -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#00E5FF]/40 transition-all flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-[#00E5FF] tracking-tight">
        {$resourceMetrics.deployed}
      </div>
      <div class="text-[10px] text-[#8BA1B8] font-mono uppercase tracking-wider">
        DEPLOYED
      </div>
    </div>
  </div>

  <!-- 4. In Maintenance -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#F59E0B]/40 transition-all flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-[#F59E0B] tracking-tight">
        {$resourceMetrics.inMaintenance}
      </div>
      <div class="text-[10px] text-[#8BA1B8] font-mono uppercase tracking-wider">
        IN MAINTENANCE
      </div>
    </div>
  </div>

  <!-- 5. Requested -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-[#8B5CF6]/40 transition-all flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-[#A78BFA] tracking-tight">
        {$resourceMetrics.requested}
      </div>
      <div class="text-[10px] text-[#8BA1B8] font-mono uppercase tracking-wider">
        REQUESTED
      </div>
    </div>
  </div>

  <!-- 6. Readiness Rate -->
  <div class="p-3 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-emerald-400/40 transition-all flex items-center gap-3 col-span-2 md:col-span-1">
    <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <div>
      <div class="text-xl font-bold font-mono text-emerald-400 tracking-tight">
        {$resourceMetrics.readinessRate}%
      </div>
      <div class="text-[10px] text-[#8BA1B8] font-mono uppercase tracking-wider">
        READINESS RATE
      </div>
    </div>
  </div>
</div>
