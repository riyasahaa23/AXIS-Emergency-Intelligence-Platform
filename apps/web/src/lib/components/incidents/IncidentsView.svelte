<script lang="ts">
  import IncidentFilterBar from './IncidentFilterBar.svelte';
  import IncidentCarousel from './IncidentCarousel.svelte';
  import IncidentDetailPanel from './IncidentDetailPanel.svelte';
  import IncidentMapHero from './IncidentMapHero.svelte';
</script>

<div class="relative w-full h-full flex flex-col justify-between p-3 sm:p-4.5 gap-2.5 overflow-hidden bg-[#020711]/40 backdrop-blur-[2px]">
  
  <!-- 1. Top Severity & Search Filter Bar -->
  <div class="shrink-0 w-full">
    <IncidentFilterBar />
  </div>

  <!-- 2. Horizontal Incident Selection Carousel Strip -->
  <div class="shrink-0 w-full">
    <IncidentCarousel />
  </div>

  <!-- 3. Main Operational Inspection Split Stage -->
  <div class="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden relative">
    
    <!-- Left: Incident Detail Inspector Panel with 4 functional tabs -->
    <div class="shrink-0 flex h-full">
      <IncidentDetailPanel />
    </div>

    <!-- Center/Right: Hero Geospatial Interactive Visualization -->
    <div class="flex-1 flex h-full min-h-[300px]">
      <IncidentMapHero />
    </div>

  </div>

</div>
