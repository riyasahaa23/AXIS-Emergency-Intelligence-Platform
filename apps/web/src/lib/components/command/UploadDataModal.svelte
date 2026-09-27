<script lang="ts">
  import { isUploadDataModalOpen, closeUploadDataModal } from '$lib/stores/systemStore';
  import { selectedIncident } from '$lib/stores/incidentStore';
  import { recordHistoryEvent } from '$lib/stores/historyStore';

  let fileInput: HTMLInputElement;
  let selectedFile: File | null = null;
  let isUploading = false;
  let uploadComplete = false;
  let simulatedRecords = 0;

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      selectedFile = target.files[0];
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectedFile = e.dataTransfer.files[0];
    }
  }

  async function handleIngest() {
    if (!selectedFile) return;
    isUploading = true;
    uploadComplete = false;

    await new Promise((r) => setTimeout(r, 600));

    simulatedRecords = Math.floor(120 + Math.random() * 880);

    const incName = $selectedIncident?.name || 'Global Telemetry';
    recordHistoryEvent(
      'system',
      'OPERATOR',
      'Dataset Ingested',
      selectedFile.name,
      `Ingested ${simulatedRecords} spatial telemetry records into ${incName} (SIMULATED DATASET)`,
      'info'
    );

    isUploading = false;
    uploadComplete = true;
  }

  function handleClose() {
    closeUploadDataModal();
    selectedFile = null;
    uploadComplete = false;
    isUploading = false;
  }
</script>

{#if $isUploadDataModalOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150"
    role="dialog"
    aria-modal="true"
    aria-labelledby="upload-modal-title"
  >
    <div
      class="relative w-full max-w-md bg-[#061425]/95 border border-[#00E5FF]/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col font-mono text-xs text-white"
    >
      <!-- Header -->
      <div class="flex items-start justify-between pb-3 border-b border-[#00E5FF]/20">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            📁
          </div>
          <div>
            <div class="flex items-center gap-1.5 text-[10px] text-[#00E5FF] font-bold tracking-widest uppercase">
              <span>JARVIS</span>
              <span>//</span>
              <span>TELEMETRY INGESTION</span>
            </div>
            <h2 id="upload-modal-title" class="text-sm font-bold text-white tracking-wide">
              Upload External Geospatial Data
            </h2>
          </div>
        </div>

        <button
          on:click={handleClose}
          class="text-[#8BA1B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="py-4 space-y-3.5">
        <!-- Ingestion Target Context -->
        <div class="p-2.5 rounded-xl bg-[#020914]/70 border border-white/5 flex items-center justify-between text-[11px]">
          <span class="text-[#8BA1B8]">Target Operational Context:</span>
          <span class="text-[#00E5FF] font-bold">{$selectedIncident?.name || 'Active Incident'}</span>
        </div>

        <!-- Dropzone -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:dragover|preventDefault
          on:drop={handleDrop}
          on:click={() => fileInput.click()}
          class="p-6 rounded-2xl border-2 border-dashed border-white/15 hover:border-[#00E5FF]/60 bg-[#020711]/60 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-[#061425]/40"
        >
          <input
            type="file"
            accept=".csv,.json,.geojson"
            bind:this={fileInput}
            on:change={handleFileSelect}
            class="hidden"
          />

          {#if selectedFile}
            <div class="text-xs text-white font-bold">{selectedFile.name}</div>
            <div class="text-[10px] text-[#8BA1B8] mt-1">
              {(selectedFile.size / 1024).toFixed(1)} KB • Click to replace file
            </div>
          {:else}
            <span class="text-2xl mb-1">📤</span>
            <div class="text-xs text-white font-medium">Click to browse or drop telemetry files here</div>
            <div class="text-[10px] text-[#8BA1B8] mt-1">Supports CSV, JSON, GeoJSON (Satellite radar, sensor feeds)</div>
          {/if}
        </div>

        {#if uploadComplete}
          <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1.5 animate-in fade-in">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-emerald-400">DATASET SIMULATION READY</span>
              <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                SIMULATED DATASET
              </span>
            </div>
            <p class="text-[10px] text-white/80">
              {simulatedRecords} sensor coordinate records normalized. Telemetry layer ingested into active operations cache.
            </p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="pt-3 border-t border-white/10 flex items-center justify-between">
        <button
          on:click={handleClose}
          class="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white text-xs cursor-pointer"
        >
          {uploadComplete ? 'Close' : 'Cancel'}
        </button>

        {#if selectedFile && !uploadComplete}
          <button
            on:click={handleIngest}
            disabled={isUploading}
            class="px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-black font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer flex items-center gap-1.5"
          >
            {#if isUploading}
              <span class="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>
              <span>Ingesting...</span>
            {:else}
              <span>Ingest Dataset</span>
              <span>→</span>
            {/if}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
