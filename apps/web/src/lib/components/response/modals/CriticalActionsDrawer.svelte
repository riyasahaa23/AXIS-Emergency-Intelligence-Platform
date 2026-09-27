<script lang="ts">
  import {
    isUrgentActionsDrawerOpen,
    responseStatistics,
    responseTeams,
    upcomingOperations
  } from '../../../stores/responseStore';

  interface CriticalActionItem {
    id: string;
    title: string;
    location: string;
    details: string;
    urgency: string;
    actionLabel: string;
    executed: boolean;
  }

  let criticalActions: CriticalActionItem[] = [
    {
      id: 'crit-1',
      title: 'Inundation Barrier Breach at Sector 4',
      location: 'Uttara Riverside, Dhaka North',
      details: 'Over 14,000 residents trapped by rapid 1.8m surge; immediate inflatable watercraft required.',
      urgency: 'CRITICAL',
      actionLabel: 'Deploy 4x Zodiacs Now',
      executed: false
    },
    {
      id: 'crit-2',
      title: 'Cholera Vaccine & IV Saline Stockout',
      location: 'Sylhet MC College Relief Camp',
      details: 'Clinic reserve under 6 hours; continuous medical supply air drop essential.',
      urgency: 'CRITICAL',
      actionLabel: 'Authorize Air Drop',
      executed: false
    },
    {
      id: 'crit-3',
      title: 'Highway 1 Submersion Impasse',
      location: 'Kanchpur Arterial Bridge',
      details: 'Heavy relief convoy stalled due to 0.5m flood depth; diversion needed.',
      urgency: 'CRITICAL',
      actionLabel: 'Divert via Elevated Corridor',
      executed: false
    }
  ];

  function executeCriticalAction(item: CriticalActionItem) {
    item.executed = true;
    criticalActions = [...criticalActions];

    responseStatistics.update((s) => ({
      ...s,
      criticalActionsCount: Math.max(0, s.criticalActionsCount - 1),
      missionCompletion: Math.min(100, s.missionCompletion + 4)
    }));

    if (item.id === 'crit-1') {
      responseTeams.update((teams) =>
        teams.map((t) => (t.code === 'R-01' ? { ...t, progress: 85, status: 'Active' } : t))
      );
    } else if (item.id === 'crit-2') {
      upcomingOperations.update((ops) =>
        ops.map((op) => (op.id === 'op-01' ? { ...op, status: 'in_progress' } : op))
      );
    }
  }
</script>

{#if $isUrgentActionsDrawerOpen}
  <div class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none animate-fadeIn">
    <!-- Click backdrop to close -->
    <button
      type="button"
      aria-label="Close drawer backdrop"
      on:click={() => isUrgentActionsDrawerOpen.set(false)}
      class="flex-1 cursor-pointer bg-transparent border-0"
    ></button>

    <!-- Slide-over Drawer Panel -->
    <aside class="w-full max-w-md h-full bg-[#061425] border-l border-[#EF4444]/40 p-5 shadow-[-10px_0_50px_rgba(239,68,68,0.2)] flex flex-col justify-between animate-slideLeft">
      <div>
        <!-- Drawer Header -->
        <div class="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
              ⚠
            </div>
            <div>
              <div class="text-xs font-mono font-bold text-[#F87171] uppercase tracking-wider">
                {$responseStatistics.criticalActionsCount} CRITICAL ACTIONS
              </div>
              <div class="text-[10px] text-[#8BA1B8] font-mono">
                Urgent Commander Interventions Required
              </div>
            </div>
          </div>

          <button
            on:click={() => isUrgentActionsDrawerOpen.set(false)}
            class="text-[#8BA1B8] hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Critical Actions Cards -->
        <div class="space-y-3">
          {#each criticalActions as action (action.id)}
            <div class="p-3.5 rounded-2xl border transition-all {
              action.executed
                ? 'bg-emerald-500/10 border-emerald-500/30 opacity-75'
                : 'bg-[#260B0F]/60 border-[#EF4444]/40 hover:border-[#EF4444]'
            }">
              <div class="flex items-center justify-between mb-1.5">
                <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold {
                  action.executed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                }">
                  {action.executed ? 'RESOLVED' : action.urgency}
                </span>

                <span class="text-[10px] font-mono text-[#8BA1B8]">
                  {action.location}
                </span>
              </div>

              <h4 class="text-xs font-bold text-white font-mono mb-1">
                {action.title}
              </h4>

              <p class="text-[11px] text-[#C5D1DE] font-sans mb-3">
                {action.details}
              </p>

              <button
                on:click={() => executeCriticalAction(action)}
                disabled={action.executed}
                class="w-full py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer {
                  action.executed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                }"
              >
                {action.executed ? '✓ Mission Authorized & Dispatched' : action.actionLabel}
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="pt-4 border-t border-white/10">
        <button
          on:click={() => isUrgentActionsDrawerOpen.set(false)}
          class="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white text-xs font-mono transition-all cursor-pointer"
        >
          Close Drawer
        </button>
      </div>
    </aside>
  </div>
{/if}

<style>
  @keyframes slideLeft {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .animate-slideLeft {
    animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
</style>
