<script lang="ts">
  import { incidents, selectIncident } from '../../stores/incidentStore';
  import type { HazardIncident } from '../../types';

  const palette: Record<string, string> = {
    flood: '#00E5FF',
    cyclone: '#8B5CF6',
    wildfire: '#F97316',
    earthquake: '#EF4444',
    storm: '#3D7CFF',
    multi_hazard: '#F59E0B'
  };

  function colorFor(type: string) {
    return palette[type] || '#F59E0B';
  }

  function labelFor(type: string) {
    if (type === 'cyclone') return 'Storm';
    if (type === 'wildfire') return 'Wildfire';
    return type.replace('_', ' ');
  }

  function plotX(lng: number) {
    return 8 + ((Math.max(-180, Math.min(180, lng)) + 180) / 360) * 184;
  }

  function plotY(lat: number) {
    return 8 + ((90 - Math.max(-90, Math.min(90, lat))) / 180) * 104;
  }

  $: recent = [...$incidents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  $: categoryCounts = Object.entries(
    $incidents.reduce<Record<string, number>>((counts, incident) => {
      const category = incident.type === 'cyclone' ? 'storm' : incident.type;
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {})
  ).sort(([, a], [, b]) => b - a).slice(0, 4);

  function focus(incident: HazardIncident) {
    selectIncident(incident);
  }
</script>

<section class="w-[300px] rounded-2xl border border-[#00E5FF]/20 bg-[#061425]/80 p-3 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.55)] select-none">
  <div class="mb-2 flex items-center justify-between border-b border-[#00E5FF]/15 pb-2">
    <div>
      <div class="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#00E5FF]">Geospatial Intelligence</div>
      <div class="mt-0.5 text-[9px] font-mono uppercase tracking-wider text-[#8BA1B8]">Live incident distribution</div>
    </div>
    <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
  </div>

  <div class="relative mb-2 h-[120px] overflow-hidden rounded-lg border border-white/10 bg-[#020914]">
    <div class="absolute inset-0 opacity-50" style="background-image: linear-gradient(rgba(0,229,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,.12) 1px, transparent 1px); background-size: 25% 25%;"></div>
    <div class="absolute left-1 top-1 text-[8px] font-mono text-[#8BA1B8]">90°N</div>
    <div class="absolute bottom-1 left-1 text-[8px] font-mono text-[#8BA1B8]">90°S</div>
    <div class="absolute bottom-1 right-1 text-[8px] font-mono text-[#8BA1B8]">180°E</div>
    {#each $incidents as incident (incident.id)}
      <button
        class="absolute rounded-full border border-white/60 shadow-[0_0_7px_currentColor] transition-transform hover:scale-150"
        style={`left:${plotX(incident.coords.lng)}px;top:${plotY(incident.coords.lat)}px;width:${Math.max(4, Math.min(9, 3 + incident.riskScore / 20))}px;height:${Math.max(4, Math.min(9, 3 + incident.riskScore / 20))}px;background:${colorFor(incident.type)};color:${colorFor(incident.type)};transform:translate(-50%,-50%);`}
        title={`${incident.name} · ${incident.country}`}
        aria-label={`Focus ${incident.name}`}
        on:click={() => focus(incident)}
      ></button>
    {/each}
    {#if $incidents.length === 0}
      <div class="absolute inset-0 flex items-center justify-center text-[9px] font-mono uppercase tracking-wider text-[#8BA1B8]">Awaiting incidents</div>
    {/if}
  </div>

  <div class="mb-2 flex flex-wrap gap-x-3 gap-y-1">
    {#each categoryCounts as [category, count]}
      <div class="flex items-center gap-1 text-[9px] font-mono uppercase text-[#8BA1B8]">
        <span class="h-1.5 w-1.5 rounded-full" style={`background:${colorFor(category)}`}></span>
        {labelFor(category)} <span class="text-white">{count}</span>
      </div>
    {/each}
  </div>

  <div class="space-y-1 border-t border-white/10 pt-2">
    <div class="text-[9px] font-mono uppercase tracking-wider text-[#8BA1B8]">Recent incident intelligence</div>
    {#each recent as incident}
      <button class="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left hover:bg-white/5" on:click={() => focus(incident)}>
        <span class="min-w-0 truncate text-[10px] text-white">{incident.name}</span>
        <span class="shrink-0 text-[9px] font-mono" style={`color:${colorFor(incident.type)}`}>{incident.country}</span>
      </button>
    {/each}
  </div>
</section>
