<script lang="ts">
  import AnalysisHeader from './AnalysisHeader.svelte';
  import SelectedIncidentCard from './SelectedIncidentCard.svelte';
  import AnalysisModeSelector from './AnalysisModeSelector.svelte';
  import AnalysisMapHero from './AnalysisMapHero.svelte';
  import AnalysisMetricsStrip from './AnalysisMetricsStrip.svelte';
  import ImpactProjectionChart from './ImpactProjectionChart.svelte';
  import RainfallForecastChart from './RainfallForecastChart.svelte';
  import InfrastructureImpactDonut from './InfrastructureImpactDonut.svelte';
  import RiskDriversModal from './RiskDriversModal.svelte';
</script>

<div class="analysis-workspace relative w-full min-h-full flex flex-col p-3 sm:p-5 gap-3.5 bg-[#020711]/60 backdrop-blur-[2px] font-mono select-none">
  
  <!-- 1. Top Multi-Hazard Analysis Header -->
  <header class="analysis-header-section shrink-0 w-full">
    <AnalysisHeader />
  </header>

  <!-- 2. Selected Incident + Analysis Mode Selector Row -->
  <section class="analysis-controls-section shrink-0 w-full grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-3 items-end">
    <SelectedIncidentCard />
    <AnalysisModeSelector />
  </section>

  <!-- 3. Center Geospatial Hero Map & Key Metrics Section -->
  <section class="analysis-map-section w-full">
    <div class="grid grid-cols-1 xl:grid-cols-[1fr_195px] gap-3.5 h-[clamp(440px,52vh,620px)]">
      <!-- Dedicated Map Container -->
      <div class="map-container relative w-full h-full min-h-[420px] rounded-2xl bg-[#030914] border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
        <AnalysisMapHero />
      </div>

      <!-- Right: Vertical Metrics Strip (6 Compact KPI Cards matching map height) -->
      <div class="metrics-strip-container hidden xl:flex h-full">
        <AnalysisMetricsStrip />
      </div>
    </div>

    <!-- Responsive metrics for screen sizes below xl breakpoint -->
    <div class="metrics-strip-mobile xl:hidden pt-3 w-full">
      <AnalysisMetricsStrip isResponsiveRow={true} />
    </div>
  </section>

  <!-- 4. Analytical & Forecast Insights Grid (Follows BELOW the map, pure siblings) -->
  <section class="analysis-insights-grid w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 pb-4">
    <!-- Panel 1: Impact Projection (Dual Line Chart) -->
    <ImpactProjectionChart />

    <!-- Panel 2: Rainfall Forecast (Column Bar Chart) -->
    <RainfallForecastChart />

    <!-- Panel 3: Infrastructure Impact (Radial Ring Donut & Counts) -->
    <InfrastructureImpactDonut />
  </section>

  <!-- Progressive Disclosure: Explainable Risk Drivers Modal -->
  <RiskDriversModal />

</div>
