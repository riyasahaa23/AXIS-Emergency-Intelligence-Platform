<script lang="ts">
  import { incidents, selectedIncidentId, selectIncident } from '../../stores/incidentStore';
  import { telemetry, isRightPanelCollapsed, activeNavSection, openScenarioDrawer } from '../../stores/systemStore';
  import { submitCommand, isJarvisCentralActive } from '../../stores/commandStore';
  import { runAnalysisPipeline } from '../../stores/analysisStore';
  import {
    scenarioSimulationResult,
    activeScenarioView,
    isSaveModalOpen,
    isExportModalOpen,
    setScenarioHazard
  } from '../../stores/scenarioStore';
  import type { HazardIncident } from '../../types';

  function onActionClick(actionName: string) {
    if (actionName === 'Simulate Scenario') {
      openScenarioDrawer();
    } else {
      submitCommand(`Execute ${actionName} for active planetary incidents`);
    }
  }

  function toggleCollapse() {
    isRightPanelCollapsed.update((v) => !v);
  }
</script>

{#if $isRightPanelCollapsed}
  <!-- Collapsed Mini Rail Button -->
  <div class="relative z-30 flex flex-col items-center py-4 px-1 bg-[#020711]/70 backdrop-blur-xl border-l border-white/10 select-none">
    <button
      on:click={toggleCollapse}
      class="p-2 rounded-xl bg-[#061425] hover:bg-[#061425]/80 text-[#00E5FF] border border-[#00E5FF]/30 hover:border-[#00E5FF] transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
      title="Expand Operational Context"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <div class="mt-8 [writing-mode:vertical-lr] text-[10px] font-mono tracking-widest text-[#8BA1B8] uppercase">
      Operational Context
    </div>
  </div>
{:else}
  <!-- Full Expanded Sleek Operational Context Panel Matching Reference -->
  <aside class="relative z-30 flex flex-col w-[350px] h-full overflow-y-auto px-4 py-4 bg-[#020711]/70 backdrop-blur-2xl border-l border-white/10 select-none custom-scrollbar transition-all duration-700 {$isJarvisCentralActive ? 'opacity-40 hover:opacity-100 filter brightness-90' : 'opacity-100'}">
    
    <!-- Top Header & Collapse Button -->
    <div class="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></span>
        <h2 class="text-xs font-bold font-mono tracking-wider text-white uppercase">OPERATIONAL CONTEXT</h2>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          on:click={toggleCollapse}
          class="p-1 rounded-lg text-[#8BA1B8] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Minimize Panel"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Section 1: Active Incidents -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-white">Active Incidents</span>
        <button
          on:click={() => activeNavSection.set('incidents')}
          class="text-[10px] font-mono text-[#00E5FF] hover:underline cursor-pointer bg-transparent border-0 p-0"
        >
          View all →
        </button>
      </div>

      <div class="space-y-2">
        {#each $incidents as inc}
          <button
            on:click={() => {
              selectIncident(inc);
              if ($activeNavSection === 'scenarios') {
                setScenarioHazard(inc.type);
              }
            }}
            class="w-full text-left p-2.5 rounded-xl border transition-all duration-200 cursor-pointer {
              $selectedIncidentId === inc.id
                ? 'bg-[#061425] border-[#00E5FF]/70 shadow-[0_0_20px_rgba(0,229,255,0.25)]'
                : 'bg-[#061425]/60 border-white/5 hover:border-white/20 hover:bg-[#061425]/90'
            }"
          >
            <div class="flex gap-3 items-center">
              <!-- High-Fidelity Thematic Thumbnail -->
              <div class="relative w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-slate-950">
                {#if inc.type === 'flood'}
                  <!-- Flooded Street / City Graphic -->
                  <div class="w-full h-full bg-gradient-to-b from-[#0a2540] via-[#0d3b66] to-[#041628] relative flex items-end overflow-hidden">
                    <!-- City silhouettes -->
                    <div class="absolute bottom-3 left-1 w-2.5 h-6 bg-[#061527]"></div>
                    <div class="absolute bottom-3 left-4 w-3.5 h-8 bg-[#040e1a]"></div>
                    <div class="absolute bottom-3 left-8 w-3 h-5 bg-[#081e36]"></div>
                    <!-- Flood waters -->
                    <div class="w-full h-3.5 bg-gradient-to-t from-cyan-400/40 via-blue-600/30 to-transparent"></div>
                    <div class="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-300 animate-ping"></div>
                  </div>
                {:else if inc.type === 'cyclone'}
                  <!-- Satellite Hurricane Radar Vortex -->
                  <div class="w-full h-full bg-[#031326] relative flex items-center justify-center overflow-hidden">
                    <div class="w-9 h-9 rounded-full border-2 border-dashed border-sky-300/70 animate-spin" style="animation-duration: 6s;"></div>
                    <div class="w-5 h-5 rounded-full border border-sky-200/90 animate-spin" style="animation-duration: 3s; animation-direction: reverse;"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-sky-100"></div>
                  </div>
                {:else}
                  <!-- Wildfire Inferno Night Forest -->
                  <div class="w-full h-full bg-gradient-to-t from-orange-600 via-amber-800 to-[#120703] relative flex items-end overflow-hidden">
                    <!-- Trees silhouette -->
                    <div class="absolute bottom-0 left-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[16px] border-b-black"></div>
                    <div class="absolute bottom-0 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[20px] border-b-black"></div>
                    <div class="absolute bottom-0 left-9 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[18px] border-b-black"></div>
                    <div class="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse"></div>
                  </div>
                {/if}
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1 mb-0.5">
                  <span class="text-xs font-semibold text-white truncate">{inc.name}</span>
                  <span class="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase font-mono tracking-wider {
                    inc.severity === 'critical'
                      ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50'
                      : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50'
                  }">
                    {inc.severity}
                  </span>
                </div>

                <div class="text-[11px] text-[#8BA1B8] truncate">{inc.country}</div>
                
                <div class="flex items-center justify-between mt-1 text-[10px] font-mono text-[#8BA1B8]/80">
                  <span>{inc.affectedPopulation}</span>
                  <span>{inc.relativeTime}</span>
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Section 2: Operational Tasks (2x2 Grid) -->
    <div class="mb-4">
      <div class="text-[10px] font-mono tracking-wider text-[#8BA1B8] uppercase mb-2">OPERATIONAL TASKS</div>
      <div class="grid grid-cols-2 gap-2 text-xs font-mono">
        {#if $activeNavSection === 'scenarios'}
          <button
            on:click={() => isSaveModalOpen.set(true)}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#8B5CF6]/50 text-left transition-all group cursor-pointer"
          >
            <span class="text-sm">💾</span>
            <span class="text-[11px] text-white">Save Scenario</span>
          </button>
          <button
            on:click={() => activeScenarioView.set('library')}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#00E5FF]/50 text-left transition-all group cursor-pointer"
          >
            <span class="text-sm">📂</span>
            <span class="text-[11px] text-white">Load Scenario</span>
          </button>
          <button
            on:click={() => activeScenarioView.set('comparison')}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#F59E0B]/50 text-left transition-all group cursor-pointer"
          >
            <span class="text-sm">⚖️</span>
            <span class="text-[11px] text-white">Compare</span>
          </button>
          <button
            on:click={() => isExportModalOpen.set(true)}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#10B981]/50 text-left transition-all group cursor-pointer"
          >
            <span class="text-sm">📊</span>
            <span class="text-[11px] text-white">Export Results</span>
          </button>
        {:else if $activeNavSection === 'analysis'}
          <button
            on:click={() => runAnalysisPipeline()}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#00E5FF]/50 text-left transition-all group cursor-pointer"
          >
            <span class="text-sm">🧠</span>
            <span class="text-[11px] text-white">Generate Analysis</span>
          </button>
          <button
            on:click={() => openScenarioDrawer()}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#3D7CFF]/50 text-left transition-all group cursor-pointer"
          >
            <span class="text-sm">▶</span>
            <span class="text-[11px] text-white">Run Scenario</span>
          </button>
          <button
            on:click={() => onActionClick('Export Analysis Report')}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#8B5CFF]/50 text-left transition-all group cursor-pointer"
          >
            <span class="text-sm">📄</span>
            <span class="text-[11px] text-white">Export Report</span>
          </button>
          <button
            on:click={() => onActionClick('Share Intelligence')}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#00E5FF]/50 text-left transition-all group cursor-pointer"
          >
            <span class="text-sm">🔗</span>
            <span class="text-[11px] text-white">Share Analysis</span>
          </button>
        {:else}
          <button
            on:click={() => onActionClick('Impact Analysis')}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#00E5FF]/50 text-left transition-all group cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#00E5FF] shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="text-[11px] text-white">Impact Analysis</span>
          </button>

          <button
            on:click={() => onActionClick('Simulate Scenario')}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#3D7CFF]/50 text-left transition-all group cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#3D7CFF] shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-[11px] text-white">Simulate Scenario</span>
          </button>

          <button
            on:click={() => onActionClick('Plan Resource Allocation')}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#8B5CFF]/50 text-left transition-all group cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#8B5CFF] shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-[11px] text-white">Resources</span>
          </button>

          <button
            on:click={() => onActionClick('Generate Report')}
            class="flex items-center gap-2 p-2.5 rounded-xl bg-[#061425]/60 hover:bg-[#061425] border border-white/5 hover:border-[#00E5FF]/50 text-left transition-all group cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#00E5FF] shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-[11px] text-white">Generate Report</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Section 3: Statistics (2x2 Grid) -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-mono tracking-wider text-[#8BA1B8] uppercase">
          {#if $activeNavSection === 'scenarios'}
            SCENARIO INSIGHTS
          {:else if $activeNavSection === 'analysis'}
            ANALYSIS STATISTICS
          {:else}
            GLOBAL STATISTICS
          {/if}
        </span>
        <span class="text-[10px] font-mono text-emerald-400">● Live</span>
      </div>

      {#if $activeNavSection === 'scenarios'}
        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5 flex flex-col">
            <div class="text-base font-bold text-[#8B5CF6] mb-0.5">
              {$scenarioSimulationResult.insights.potentialIncrease}
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Potential Increase</div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5 flex flex-col">
            <div class="text-base font-bold text-white mb-0.5">
              {$scenarioSimulationResult.insights.projectedAffected}
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Projected Affected</div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5 flex flex-col">
            <div class="text-base font-bold {
              $scenarioSimulationResult.insights.riskLevel === 'CRITICAL' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
            } mb-0.5">
              {$scenarioSimulationResult.insights.riskLevel}
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Risk Level</div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5 flex flex-col">
            <div class="text-base font-bold text-[#00E5FF] mb-0.5">
              {$scenarioSimulationResult.insights.infrastructureImpact}
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Infrastructure Impact</div>
          </div>
        </div>
      {:else if $activeNavSection === 'analysis'}
        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-sm">📈</span>
              <span class="text-sm font-bold text-white">12</span>
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Analyses Running</div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-sm text-emerald-400">🎯</span>
              <span class="text-sm font-bold text-emerald-400">99.3%</span>
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Model Accuracy</div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-sm text-[#F59E0B]">🗄️</span>
              <span class="text-sm font-bold text-[#F59E0B]">48</span>
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Data Sources</div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-sm text-[#00E5FF]">⏱️</span>
              <span class="text-sm font-bold text-[#00E5FF]">&lt; 30s</span>
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Avg. Analysis Time</div>
          </div>
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <svg class="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="text-sm font-bold text-white">{$telemetry.peopleAffected}</span>
            </div>
            <div class="text-[10px] text-[#8BA1B8]">People Affected</div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="text-sm font-bold text-emerald-400">{$telemetry.responseTeams}</span>
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Response Teams</div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <svg class="w-3.5 h-3.5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="text-sm font-bold text-[#F59E0B]">{$telemetry.activeShelters}</span>
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Active Shelters</div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#061425]/50 border border-white/5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <svg class="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span class="text-sm font-bold text-[#00E5FF]">{$telemetry.criticalResourcesPct}%</span>
            </div>
            <div class="text-[10px] text-[#8BA1B8]">Critical Resources</div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Section 4: System Status Card (Matching Reference Bottom Card) -->
    <div class="mt-auto p-3 rounded-2xl bg-[#061425]/80 border border-[#00E5FF]/25 shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex items-center justify-between cursor-pointer hover:border-[#00E5FF]/50 transition-all">
      <div class="flex items-center gap-3">
        <!-- Concentric Animated Radar Ring -->
        <div class="relative w-8 h-8 flex items-center justify-center shrink-0">
          <div class="absolute inset-0 rounded-full border border-[#00E5FF]/40 animate-ping"></div>
          <div class="w-6 h-6 rounded-full border border-[#00E5FF] flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></div>
          </div>
        </div>

        <div>
          <div class="text-[11px] font-mono font-bold tracking-wider text-white uppercase">SYSTEM STATUS</div>
          <div class="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
            <span>{
              $activeNavSection === 'scenarios' ? 'Simulation Engine Operational' :
              $activeNavSection === 'analysis' ? 'Analysis Engine Operational' :
              'All Systems Operational'
            }</span>
            <!-- Segmented green activity dots -->
            <span class="inline-flex gap-0.5">
              <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" style="animation-delay: 0.2s;"></span>
              <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" style="animation-delay: 0.4s;"></span>
          </div>
        </div>
      </div>

      <svg class="w-4 h-4 text-[#8BA1B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>

  </aside>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>