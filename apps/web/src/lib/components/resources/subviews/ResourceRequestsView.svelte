<script lang="ts">
  import {
    resourceRequests,
    approveResourceRequest,
    rejectResourceRequest,
    allocateToRequest,
    isRequestModalOpen
  } from '../../../stores/resourceStore';
  import type { ResourceRequest, RequestStatus } from '../../../types/resources';

  let rejectingRequestId: string | null = null;
  let rejectionReason = 'Insufficient field stock at regional staging depot';

  function getStatusClasses(status: RequestStatus) {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'APPROVED':
        return 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30';
      case 'ALLOCATED':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'FULFILLED':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  }

  function handleRejectSubmit(id: string) {
    rejectResourceRequest(id, rejectionReason);
    rejectingRequestId = null;
  }
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Control Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
        📥
      </div>
      <div>
        <h2 class="text-sm font-bold font-mono text-white">INBOUND FIELD RESOURCE REQUESTS</h2>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Review, approve, allocate, or reject incoming requisition demands from active operations
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <button
        on:click={() => isRequestModalOpen.set(true)}
        class="px-3 py-1.5 rounded-xl bg-[#00E5FF] text-[#020711] text-xs font-mono font-bold hover:bg-[#38BDF8] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.35)]"
      >
        + Submit Request
      </button>
    </div>
  </div>

  <!-- Rejection Reason Modal Popover if open -->
  {#if rejectingRequestId}
    <div class="p-4 rounded-2xl bg-[#260B0F]/90 border border-rose-500/40 font-mono text-xs text-white">
      <div class="text-xs font-bold text-rose-400 mb-2">
        Specify Justification for Rejecting {rejectingRequestId}:
      </div>
      <select
        bind:value={rejectionReason}
        class="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white mb-3"
      >
        <option value="Insufficient field stock at regional staging depot">Insufficient field stock at regional staging depot</option>
        <option value="Duplicate requisition ticket already in flight">Duplicate requisition ticket already in flight</option>
        <option value="Incorrect destination coordinates or route impassable">Incorrect destination coordinates or route impassable</option>
        <option value="Operational priority reallocation by Command">Operational priority reallocation by Command</option>
      </select>
      <div class="flex items-center justify-end gap-2">
        <button
          on:click={() => rejectingRequestId = null}
          class="px-3 py-1 rounded-lg bg-white/10 text-white cursor-pointer"
        >
          Cancel
        </button>
        <button
          on:click={() => handleRejectSubmit(rejectingRequestId)}
          class="px-3 py-1 rounded-lg bg-rose-500 text-white font-bold cursor-pointer"
        >
          Confirm Rejection
        </button>
      </div>
    </div>
  {/if}

  <!-- Requests Table Card -->
  <div class="flex-1 bg-[#061425]/60 border border-white/10 rounded-2xl p-3.5 flex flex-col overflow-hidden">
    <!-- Table Header -->
    <div class="grid grid-cols-12 gap-2 text-[10px] font-mono text-[#8BA1B8] uppercase px-2 py-1.5 border-b border-white/5 shrink-0">
      <div class="col-span-1">REQ ID</div>
      <div class="col-span-2">RESOURCE</div>
      <div class="col-span-1">QTY</div>
      <div class="col-span-2">REQUESTED BY</div>
      <div class="col-span-2">DESTINATION</div>
      <div class="col-span-1 text-center">PRIORITY</div>
      <div class="col-span-1 text-center">STATUS</div>
      <div class="col-span-2 text-right">ACTIONS</div>
    </div>

    <!-- Table Rows -->
    <div class="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
      {#each $resourceRequests as req (req.id)}
        <div class="grid grid-cols-12 gap-2 items-center px-2 py-2.5 rounded-xl border border-white/5 bg-[#061425]/40 hover:bg-[#061425]/80 text-xs font-mono transition-all">
          <div class="col-span-1 font-bold text-white">
            {req.id}
          </div>
          <div class="col-span-2 text-[#C5D1DE] text-[11px] truncate" title={req.resourceType}>
            {req.resourceType}
          </div>
          <div class="col-span-1 text-white font-bold">
            {req.quantity}
          </div>
          <div class="col-span-2 text-[#8BA1B8] text-[11px] truncate" title={req.requestedBy}>
            {req.requestedBy}
          </div>
          <div class="col-span-2 text-[#8BA1B8] text-[11px] truncate" title={req.destination}>
            {req.destination}
          </div>
          <div class="col-span-1 text-center">
            <span class="px-2 py-0.5 rounded text-[9px] font-bold {
              req.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
              req.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
              'bg-blue-500/20 text-blue-400'
            }">
              {req.priority}
            </span>
          </div>
          <div class="col-span-1 text-center">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold {getStatusClasses(req.status)}">
              {req.status}
            </span>
          </div>

          <!-- Actions -->
          <div class="col-span-2 flex items-center justify-end gap-1.5">
            {#if req.status === 'PENDING'}
              <button
                on:click={() => approveResourceRequest(req.id)}
                class="px-2 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 text-[9px] font-bold cursor-pointer"
              >
                Approve
              </button>
              <button
                on:click={() => rejectingRequestId = req.id}
                class="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-[9px] font-bold cursor-pointer"
              >
                Reject
              </button>
            {:else if req.status === 'APPROVED'}
              <button
                on:click={() => allocateToRequest(req.id)}
                class="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold cursor-pointer"
              >
                Allocate
              </button>
            {:else}
              <span class="text-[10px] text-[#8BA1B8] italic">
                {req.status === 'ALLOCATED' ? 'Dispatched' : 'Closed'}
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
