<script lang="ts">
  import { openAxisCentral } from '../../stores/commandStore';
  import AxisCore3D from '../axis/AxisCore3D.svelte';
</script>

<button
  on:click={() => openAxisCentral('LISTENING')}
  class="flex items-center gap-3 px-3 py-2 rounded-2xl bg-[#061425]/85 hover:bg-[#061425] backdrop-blur-xl border border-[#00E5FF]/40 hover:border-[#00E5FF] shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(0,229,255,0.25)] select-none text-left transition-all duration-300 group cursor-pointer hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
  title="Click to Activate AXIS Central Mode"
>
  <!-- Mini 3D Holographic AXIS Core -->
  <div class="relative w-12 h-12 flex items-center justify-center shrink-0 overflow-visible">
    <AxisCore3D size="sm" interactive={false} />
  </div>

  <div class="pr-1 min-w-0">
    <div class="text-xs font-bold font-mono tracking-wider text-white flex items-center gap-1.5 group-hover:text-[#00E5FF] transition-colors">
      <span>AXIS</span>
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-ping"></span>
    </div>
    <div class="text-[10px] text-[#8BA1B8] font-mono group-hover:text-[#00E5FF] transition-colors truncate">
      Activate Core ◈
    </div>
  </div>
</button>