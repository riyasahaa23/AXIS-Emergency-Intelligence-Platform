<script lang="ts">
  import {
    currentHazardConfig,
    scenarioParameters,
    scenarioFactors,
    scenarioActiveExtraFactorIds,
    updateScenarioParameter,
    toggleScenarioFactor,
    addScenarioExtraFactor,
    removeScenarioExtraFactor,
    resetScenarioConfiguration,
    runScenarioSimulation,
    isSimulating,
    simulationStage,
    simulationProgressPct,
    activeScenarioName,
    activeScenarioPresetId,
    applyScenarioPreset,
    scenarioSimulationResult
  } from '$lib/stores/scenarioStore';
  import { selectedIncident, incidents, selectIncident } from '$lib/stores/incidentStore';

  let isIncidentPickerOpen = false;
  let isAddFactorOpen = false;

  $: baselineRisk = $currentHazardConfig?.baseMetrics?.riskScore ?? 64;
  $: scenarioRisk = $scenarioSimulationResult?.simulatedMetrics?.riskScore ?? baselineRisk;
  $: riskDelta = scenarioRisk - baselineRisk;

  function handleSliderChange(id: string, e: Event) {
    const target = e.target as HTMLInputElement;
    updateScenarioParameter(id, parseFloat(target.value));
  }

  function formatParamValue(id: string, value: number, unit: string): string {
    const isPlus = (unit === '%' || unit === 'm' || unit === 'km/h' || unit === 'Mw') && value > 0;
    return `${isPlus ? '+' : ''}${value}${unit}`;
  }

  function handleSelectIncident(inc: any) {
    selectIncident(inc);
    isIncidentPickerOpen = false;
  }
</script>

<div class="flex flex-col h-full bg-[#030A16]/90 border border-white/10 rounded-2xl p-4 font-mono select-none overflow-y-auto custom-scrollbar shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
  
  <!-- Panel Top Bar: Configuration Title & Reset Button -->
  <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <span class="w-1.5 h-3.5 bg-[#8B5CF6] rounded-sm"></span>
      <h2 class="text-xs font-bold tracking-wider text-white uppercase">SCENARIO CONFIGURATION</h2>
    </div>

    <button
      type="button"
      on:click={resetScenarioConfiguration}
      class="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[#8BA1B8] hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
      title="Reset parameters to incident baseline"
    >
      <svg class="w-3 h-3 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Reset</span>
    </button>
  </div>

  <!-- Editable Scenario Name Input -->
  <div class="mb-3 shrink-0">
    <div class="text-[9px] uppercase tracking-wider text-[#8BA1B8] mb-1">SCENARIO TITLE</div>
    <input
      type="text"
      bind:value={$activeScenarioName}
      class="w-full px-2.5 py-1.5 rounded-lg bg-[#061425] border border-white/15 focus:border-[#00E5FF] focus:outline-none text-xs text-white placeholder-white/40"
      placeholder="Enter scenario name..."
    />
  </div>

  <!-- 1. Base Incident Card -->
  <div class="mb-4 shrink-0 relative">
    <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8BA1B8] mb-1.5">
      <span>BASE INCIDENT</span>
      <button
        type="button"
        on:click={() => isIncidentPickerOpen = !isIncidentPickerOpen}
        class="text-[#00E5FF] hover:underline font-bold cursor-pointer"
      >
        Change →
      </button>
    </div>

    <!-- Active Incident Card Box -->
    <div class="p-2.5 rounded-xl bg-[#061425] border border-white/10 hover:border-[#00E5FF]/40 transition-colors">
      <div class="flex items-center gap-3">
        <!-- Thumbnail / Icon -->
        <div class="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-950 flex items-center justify-center">
          {#if $currentHazardConfig.hazardType === 'flood'}
            <div class="w-full h-full bg-gradient-to-b from-[#0a2540] to-[#041628] flex items-center justify-center text-xl">🌊</div>
          {:else if $currentHazardConfig.hazardType === 'cyclone'}
            <div class="w-full h-full bg-gradient-to-b from-[#082f49] to-[#031326] flex items-center justify-center text-xl">🌀</div>
          {:else if $currentHazardConfig.hazardType === 'wildfire'}
            <div class="w-full h-full bg-gradient-to-b from-[#451a03] to-[#120703] flex items-center justify-center text-xl">🔥</div>
          {:else if $currentHazardConfig.hazardType === 'earthquake'}
            <div class="w-full h-full bg-gradient-to-b from-[#3f2c06] to-[#1a1202] flex items-center justify-center text-xl">⚡</div>
          {:else}
            <div class="w-full h-full bg-gradient-to-b from-[#2e1065] to-[#0f0426] flex items-center justify-center text-xl">⚡🌊</div>
          {/if}
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <span class="text-xs font-bold text-white uppercase tracking-wide truncate">
              {$currentHazardConfig.incidentName}
            </span>
            <span class="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider {
              $currentHazardConfig.severity === 'critical'
                ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50'
                : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50'
            }">
              {$currentHazardConfig.severity}
            </span>
          </div>

          <div class="text-[11px] text-[#8BA1B8] truncate mb-1">
            {$currentHazardConfig.country} • {$currentHazardConfig.location}
          </div>

          <div class="text-[10px] text-[#00E5FF] font-semibold">
            {$currentHazardConfig.baseMetrics.affectedPopulation} affected • {$currentHazardConfig.baseMetrics.affectedDistricts} districts
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Incident Picker Dropdown -->
    {#if isIncidentPickerOpen}
      <div class="absolute top-full left-0 right-0 mt-2 z-30 p-2 rounded-xl bg-[#061425] border border-[#00E5FF]/40 shadow-[0_12px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1.5 max-h-56 overflow-y-auto custom-scrollbar">
        <div class="text-[10px] uppercase text-[#8BA1B8] px-1 pb-1 border-b border-white/10">Select Active Incident</div>
        {#each $incidents as inc}
          <button
            type="button"
            on:click={() => handleSelectIncident(inc)}
            class="flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-white/10 transition-colors cursor-pointer {
              $selectedIncident?.id === inc.id ? 'bg-[#00E5FF]/15 text-[#00E5FF]' : 'text-white'
            }"
          >
            <div class="truncate mr-2">
              <span class="font-bold">{inc.name}</span>
              <span class="text-[10px] text-[#8BA1B8] ml-1">({inc.country})</span>
            </div>
            <span class="text-[9px] uppercase px-1 py-0.5 rounded border border-white/20 shrink-0">{inc.type}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Presets Selector Bar -->
  {#if $currentHazardConfig.presets && $currentHazardConfig.presets.length > 0}
    <div class="mb-4 shrink-0">
      <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8BA1B8] mb-1.5">
        <span>HAZARD PRESETS</span>
        <span class="text-[9px] text-[#00E5FF]">ONE-CLICK CALIBRATION</span>
      </div>
      <div class="grid grid-cols-2 gap-1.5">
        {#each $currentHazardConfig.presets as preset}
          <button
            type="button"
            on:click={() => applyScenarioPreset(preset.id)}
            class="flex flex-col p-2 rounded-lg border text-left transition-all cursor-pointer {
              $activeScenarioPresetId === preset.id
                ? 'bg-[#8B5CF6]/20 border-[#00E5FF] text-white shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                : 'bg-[#061425]/60 border-white/10 text-[#8BA1B8] hover:border-white/30 hover:text-white'
            }"
          >
            <span class="text-[10px] font-bold uppercase truncate tracking-wide flex items-center gap-1">
              {#if $activeScenarioPresetId === preset.id}
                <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
              {/if}
              {preset.label}
            </span>
            <span class="text-[8px] text-[#8BA1B8]/80 line-clamp-1 mt-0.5">{preset.description}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Simulated Risk Delta Box -->
  <div class="mb-4 p-3 rounded-xl bg-gradient-to-br from-[#061425] to-[#0A1A2F] border border-white/10 shrink-0">
    <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8BA1B8] mb-2">
      <span>SIMULATED RISK DELTA</span>
      <span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase {
        riskDelta > 15 ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
        riskDelta > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
      }">
        {riskDelta > 0 ? `+${riskDelta}` : riskDelta} PTS
      </span>
    </div>
    <div class="grid grid-cols-2 gap-2 mb-2">
      <div class="p-2 rounded-lg bg-black/40 border border-white/5">
        <div class="text-[9px] uppercase text-[#8BA1B8]">Baseline Risk</div>
        <div class="text-base font-bold text-white mt-0.5">{baselineRisk} <span class="text-[10px] font-normal text-[#8BA1B8]">/ 100</span></div>
      </div>
      <div class="p-2 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30">
        <div class="text-[9px] uppercase text-[#C084FC]">Projected Risk</div>
        <div class="text-base font-bold text-[#00E5FF] mt-0.5">{scenarioRisk} <span class="text-[10px] font-normal text-[#8BA1B8]">/ 100</span></div>
      </div>
    </div>
    <!-- Visual Delta Bar -->
    <div class="w-full h-1.5 bg-[#0F2238] rounded-full overflow-hidden flex">
      <div class="h-full bg-slate-500" style="width: {baselineRisk}%"></div>
      {#if riskDelta > 0}
        <div class="h-full bg-[#EF4444] animate-pulse" style="width: {Math.min(riskDelta, 100 - baselineRisk)}%"></div>
      {/if}
    </div>
  </div>

  <!-- 2. Scenario Parameters (Sliders) -->
  <div class="mb-5 shrink-0 flex flex-col gap-3.5">
    <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8BA1B8] border-b border-white/5 pb-1">
      <span>SCENARIO PARAMETERS</span>
      <span class="text-[#8B5CF6] text-[9px] font-semibold">REAL-TIME PROPAGATION</span>
    </div>

    {#each $currentHazardConfig.parameters as param}
      {@const val = $scenarioParameters[param.id] !== undefined ? $scenarioParameters[param.id] : param.defaultValue}
      <div class="flex flex-col gap-1.5 bg-[#061425]/40 p-2.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
        <div class="flex items-center justify-between text-xs">
          <span class="text-[#C084FC] font-bold text-[11px] tracking-wide flex items-center gap-1.5">
            <span class="w-1 h-1 rounded-full bg-[#8B5CF6]"></span>
            {param.label}
          </span>
          <span class="text-sm font-bold text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30">
            {formatParamValue(param.id, val, param.unit)}
          </span>
        </div>

        <!-- Slider Input -->
        <input
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={val}
          on:input={(e) => handleSliderChange(param.id, e)}
          class="w-full h-1.5 bg-[#0F2238] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6] focus:outline-none"
        />

        <div class="flex items-center justify-between text-[9px] text-[#8BA1B8]/60 px-0.5">
          <span>{param.min}{param.unit}</span>
          <span class="text-[9px] text-[#8BA1B8]/80 truncate max-w-[140px]">{param.description}</span>
          <span>{param.max}{param.unit}</span>
        </div>
      </div>
    {/each}

    <!-- Extra dynamic factors if added -->
    {#each $scenarioActiveExtraFactorIds as extraId}
      {@const extraParam = $currentHazardConfig.availableExtraFactors.find((f) => f.id === extraId)}
      {#if extraParam}
        {@const val = $scenarioParameters[extraParam.id] !== undefined ? $scenarioParameters[extraParam.id] : extraParam.defaultValue}
        <div class="flex flex-col gap-1.5 bg-[#8B5CF6]/10 p-2.5 rounded-xl border border-[#8B5CF6]/30">
          <div class="flex items-center justify-between text-xs">
            <span class="text-[#C084FC] font-bold text-[11px] tracking-wide flex items-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-[#00E5FF]"></span>
              {extraParam.label}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30">
                {formatParamValue(extraParam.id, val, extraParam.unit)}
              </span>
              <button
                type="button"
                on:click={() => removeScenarioExtraFactor(extraParam.id)}
                class="text-red-400 hover:text-red-300 text-xs px-1 hover:bg-white/10 rounded cursor-pointer"
                title="Remove parameter"
              >
                ✕
              </button>
            </div>
          </div>

          <input
            type="range"
            min={extraParam.min}
            max={extraParam.max}
            step={extraParam.step}
            value={val}
            on:input={(e) => handleSliderChange(extraParam.id, e)}
            class="w-full h-1.5 bg-[#0F2238] rounded-lg appearance-none cursor-pointer accent-[#00E5FF] focus:outline-none"
          />

          <div class="flex items-center justify-between text-[9px] text-[#8BA1B8]/60 px-0.5">
            <span>{extraParam.min}{extraParam.unit}</span>
            <span>{extraParam.max}{extraParam.unit}</span>
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <!-- 3. Additional Factors (Toggles) -->
  <div class="mb-5 shrink-0 flex flex-col gap-2.5">
    <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8BA1B8] border-b border-white/5 pb-1">
      <span>ADDITIONAL FACTORS</span>
      <span class="text-[#00E5FF] text-[9px] font-semibold">COMPOUND FORCING</span>
    </div>

    <div class="space-y-2">
      {#each $currentHazardConfig.factors as factor}
        {@const active = $scenarioFactors[factor.id] !== undefined ? $scenarioFactors[factor.id] : factor.defaultActive}
        <button
          type="button"
          on:click={() => toggleScenarioFactor(factor.id)}
          class="w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer {
            active
              ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/50 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
              : 'bg-[#061425]/40 border-white/5 hover:border-white/15'
          }"
        >
          <div class="flex-1 pr-2 min-w-0">
            <div class="text-[11px] font-bold {active ? 'text-white' : 'text-[#8BA1B8]'} truncate">
              {factor.label}
            </div>
            <div class="text-[9px] text-[#8BA1B8]/70 line-clamp-1">
              {factor.description}
            </div>
          </div>

          <!-- Switch Pill -->
          <div class="relative w-8 h-4 rounded-full transition-colors duration-200 shrink-0 {
            active ? 'bg-[#8B5CF6]' : 'bg-[#1E293B]'
          }">
            <span class="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 {
              active ? 'translate-x-4' : 'translate-x-0'
            }"></span>
          </div>
        </button>
      {/each}
    </div>

    <!-- + Add Factor Button & Menu -->
    <div class="relative pt-1">
      <button
        type="button"
        on:click={() => isAddFactorOpen = !isAddFactorOpen}
        class="w-full py-2 px-3 rounded-xl border border-dashed border-white/20 hover:border-[#8B5CF6]/60 text-[11px] text-[#8BA1B8] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white/5"
      >
        <span class="text-sm font-bold text-[#8B5CF6]">+</span>
        <span>Add Factor</span>
      </button>

      {#if isAddFactorOpen}
        <div class="absolute bottom-full left-0 right-0 mb-2 z-30 p-2 rounded-xl bg-[#061425] border border-[#8B5CF6]/50 shadow-[0_12px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1">
          <div class="text-[10px] uppercase text-[#8BA1B8] px-1 pb-1 border-b border-white/10">Available Modifiers</div>
          {#each $currentHazardConfig.availableExtraFactors as extra}
            <button
              type="button"
              on:click={() => { addScenarioExtraFactor(extra.id); isAddFactorOpen = false; }}
              class="flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <span>{extra.label}</span>
              <span class="text-[10px] text-[#00E5FF] font-semibold">+{extra.defaultValue}{extra.unit}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- 4. Primary CTA: RUN SCENARIO SIMULATION Button -->
  <div class="mt-auto pt-2 shrink-0">
    <button
      type="button"
      on:click={runScenarioSimulation}
      disabled={$isSimulating}
      class="relative w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(139,92,246,0.4)] transition-all duration-300 cursor-pointer overflow-hidden group {
        $isSimulating
          ? 'bg-[#1E1B4B] cursor-wait border border-[#8B5CF6]/50'
          : 'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#00E5FF] hover:opacity-95 hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] active:scale-[0.98]'
      }"
    >
      <!-- Telemetry Progress Bar Fill -->
      {#if $isSimulating}
        <div
          class="absolute inset-0 bg-[#8B5CF6]/30 transition-all duration-200"
          style="width: {$simulationProgressPct}%"
        ></div>
      {/if}

      <div class="relative z-10 flex items-center justify-center gap-2">
        {#if $isSimulating}
          <svg class="w-4 h-4 animate-spin text-[#00E5FF]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-[11px] tracking-wider text-[#00E5FF]">{$simulationStage}</span>
        {:else}
          <svg class="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <span class="tracking-wider">RUN SCENARIO SIMULATION</span>
        {/if}
      </div>
    </button>
  </div>

</div>
