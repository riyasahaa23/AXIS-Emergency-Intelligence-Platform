<script lang="ts">
  import { activeNavSection, isNavCollapsed } from '../../stores/systemStore';
  import { isJarvisCentralActive } from '../../stores/commandStore';
  import { severityCounts } from '../../stores/incidentStore';
  import MiniGlobe from '../widgets/MiniGlobe.svelte';

  const navItems = [
    { id: 'global', label: 'Global View', icon: 'globe', badge: null },
    { id: 'incidents', label: 'Incidents', icon: 'bell', badge: '2', badgeColor: 'bg-[#EF4444]' },
    { id: 'analysis', label: 'Analysis', icon: 'barChart', badge: null },
    { id: 'scenarios', label: 'Scenarios', icon: 'gitBranch', badge: null },
    { id: 'response', label: 'Response', icon: 'shield', badge: null },
    { id: 'resources', label: 'Resources', icon: 'box', badge: null },
    { id: 'comms', label: 'Communications', icon: 'radio', badge: null },
    { id: 'history', label: 'History', icon: 'clock', badge: null }
  ];

  function setSection(id: string) {
    activeNavSection.set(id);
  }

  function toggleCollapse() {
    isNavCollapsed.update((v) => !v);
  }
</script>

<aside class="relative z-30 flex flex-col items-center py-3.5 px-2 bg-[#020711]/60 backdrop-blur-xl border-r border-white/10 select-none transition-all duration-700 {$isNavCollapsed ? 'w-14' : 'w-48'} {$isJarvisCentralActive ? 'opacity-30 hover:opacity-90 filter brightness-75' : 'opacity-100'}">
  
  <!-- Collapse/Expand Rail Toggle -->
  <button
    on:click={toggleCollapse}
    class="w-full flex items-center {$isNavCollapsed ? 'justify-center' : 'justify-between'} px-2 py-1 mb-2 rounded-lg text-[#8BA1B8] hover:text-white hover:bg-white/5 transition-all text-xs font-mono"
    title={$isNavCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
  >
    {#if !$isNavCollapsed}
      <span class="text-[9px] uppercase tracking-widest text-[#8BA1B8]/60 font-bold">Navigation</span>
    {/if}
    <svg class="w-3.5 h-3.5 {$isNavCollapsed ? 'rotate-180' : ''} transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  </button>

  <div class="w-full space-y-1">
    {#each navItems as item}
      <button
        on:click={() => setSection(item.id)}
        class="w-full flex items-center {$isNavCollapsed ? 'justify-center px-1' : 'justify-between px-3'} py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer {
          $activeNavSection === item.id
            ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.25)] font-semibold'
            : 'text-[#8BA1B8] hover:text-white hover:bg-[#061425]/60 border border-transparent'
        }"
        title={item.label}
      >
        <div class="flex items-center gap-2.5">
          {#if item.icon === 'globe'}
            <svg class="w-4 h-4 shrink-0 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          {:else if item.icon === 'bell'}
            <svg class="w-4 h-4 shrink-0 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          {:else if item.icon === 'barChart'}
            <svg class="w-4 h-4 shrink-0 text-[#3D7CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          {:else if item.icon === 'gitBranch'}
            <svg class="w-4 h-4 shrink-0 text-[#8B5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          {:else if item.icon === 'shield'}
            <svg class="w-4 h-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          {:else if item.icon === 'box'}
            <svg class="w-4 h-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          {:else if item.icon === 'radio'}
            <svg class="w-4 h-4 shrink-0 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          {:else}
            <svg class="w-4 h-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          {/if}

          {#if !$isNavCollapsed}
            <span class="truncate">{item.label}</span>
          {/if}
        </div>

        {#if item.badge && !$isNavCollapsed}
          <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white {item.badgeColor}">
            {item.badge}
          </span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Bottom-Left Orbital Card: A SAFER PLANET THROUGH INTELLIGENCE -->
  <div class="mt-auto w-full pt-3">
    {#if !$isNavCollapsed}
      <div class="p-2.5 rounded-2xl bg-[#061425]/80 border border-[#00E5FF]/25 shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex flex-col items-center text-center">
        <MiniGlobe />
        <div class="text-[9px] font-mono font-bold tracking-wider text-[#F0F6FC] uppercase leading-tight mt-1.5">
          A SAFER<br/>PLANET<br/>THROUGH<br/>INTELLIGENCE
        </div>
        <div class="text-[8px] font-mono tracking-widest text-[#00E5FF] mt-2 uppercase font-semibold">
          JARVIS ORBITAL
        </div>
      </div>
    {:else}
      <div class="w-full flex justify-center py-2 text-[#00E5FF] text-xs">
        ●
      </div>
    {/if}
  </div>
</aside>