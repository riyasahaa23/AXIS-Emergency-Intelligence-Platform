<script lang="ts">
  import { telemetry } from '../../stores/systemStore';
</script>

<div class="p-3.5 rounded-2xl bg-[#061425]/60 backdrop-blur-md border border-[#00E5FF]/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)] select-none min-w-[210px]">
  <div class="flex items-center justify-between pb-2 mb-2 border-b border-[#00E5FF]/15">
    <span class="text-[10px] uppercase font-mono tracking-widest text-[#00E5FF]">Real-Time Monitoring</span>
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-ping"></span>
  </div>

  <div class="space-y-1.5 text-xs font-mono">
    <div class="flex items-center justify-between">
      <span class="text-[#8BA1B8] flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        Satellites
      </span>
      <span class="text-emerald-400 font-semibold">{$telemetry.satellitesOnline} Online</span>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-[#8BA1B8] flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-[#3D7CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        Weather Feeds
      </span>
      <span class="text-emerald-400 font-semibold">{$telemetry.weatherFeedsStatus}</span>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-[#8BA1B8] flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-[#8B5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Ground Sensors
      </span>
      <span class="text-white font-semibold">{$telemetry.groundSensors.toLocaleString()}</span>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-[#8BA1B8] flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7z" />
        </svg>
        Data Sources
      </span>
      <span class="text-white font-semibold">{$telemetry.dataSources}</span>
    </div>
  </div>
</div>
