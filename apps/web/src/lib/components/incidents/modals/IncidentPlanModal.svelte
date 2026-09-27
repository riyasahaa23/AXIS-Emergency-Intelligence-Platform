<script lang="ts">
  import {
    isIncidentPlanModalOpen,
    closeIncidentPlanModal,
    activeNavSection
  } from '$lib/stores/systemStore';
  import { selectedIncident } from '$lib/stores/incidentStore';
  import {
    responseTeams,
    responsePriorities,
    setResponseHazard
  } from '$lib/stores/responseStore';
  import {
    allResources,
    resourceMetrics,
    deployResource,
    addResourceAudit
  } from '$lib/stores/resourceStore';
  import { recordHistoryEvent } from '$lib/stores/historyStore';

  interface DirectiveItem {
    id: string;
    priorityNumber: number;
    priorityLabel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    action: string;
    location: string;
    team: string;
    resources: string;
    resourceId?: string;
    reason: string;
    eta: string;
    expectedImpact: string;
    confidence: number;
  }

  let isGenerating = false;
  let isReady = false;
  let planStatus: 'draft' | 'confirming_approval' | 'approved' | 'confirming_rejection' | 'rejected' | 'editing' = 'draft';
  let rejectionReason = '';
  let generationStep = 0;

  const GENERATION_STAGES = [
    'Assessing incident telemetry & spatial hazard footprint',
    'Evaluating population vulnerability & displacement risks',
    'Checking regional depots & available equipment reserves',
    'Checking active response teams & operator credentials',
    'Optimizing deployment logistics & travel corridors',
    'Verifying operational safety & command constraints'
  ];

  let directives: DirectiveItem[] = [];
  let editingIndex: number | null = null;
  let editForm: Partial<DirectiveItem> = {};

  $: if ($isIncidentPlanModalOpen && !isReady && !isGenerating && $selectedIncident) {
    generatePlan();
  }

  function getDirectivesForIncident(type: string, name: string, region: string): DirectiveItem[] {
    const t = type.toLowerCase();
    if (t.includes('earthquake')) {
      return [
        {
          id: 'dir-eq-01',
          priorityNumber: 1,
          priorityLabel: 'CRITICAL',
          action: 'Deploy Urban Search & Rescue Team R-04',
          location: `${region} — Northern Sector`,
          team: 'USAR Team R-04 (Seismic Unit)',
          resources: '2x Heavy Rescue Transporters, 1x Acoustic Locator Pod',
          resourceId: 'V-102',
          reason: 'Severe ground displacement & structural damage to older wood-frame constructions',
          eta: '25 mins',
          expectedImpact: 'Immediate life-safety extrication across collapsed dwellings',
          confidence: 0.94
        },
        {
          id: 'dir-eq-02',
          priorityNumber: 2,
          priorityLabel: 'HIGH',
          action: 'Mobilize Emergency Trauma Field Hospital',
          location: `${region} — Central Municipal Hub`,
          team: 'WHO Emergency Surgical Corps',
          resources: '1x Trauma Pod (30 Beds), 12x Medical Specialists',
          resourceId: 'M-201',
          reason: 'Municipal hospital surge capacity exceeded; water mains fractured',
          eta: '45 mins',
          expectedImpact: 'Triage and emergency surgical stabilization for 200+ injured',
          confidence: 0.91
        },
        {
          id: 'dir-eq-03',
          priorityNumber: 3,
          priorityLabel: 'MEDIUM',
          action: 'Route 249 Coastal Bypass Highway Clearance',
          location: `${region} — Coastal Bypass`,
          team: 'Civil Defense Engineering Detachment',
          resources: '2x Heavy Bulldozers, 1x Geotechnical Survey Crew',
          resourceId: 'V-101',
          reason: 'Slope failure debris blocking secondary evacuation access',
          eta: '1h 15m',
          expectedImpact: 'Restores primary supply corridor into isolated towns',
          confidence: 0.88
        }
      ];
    } else if (t.includes('cyclone')) {
      return [
        {
          id: 'dir-cy-01',
          priorityNumber: 1,
          priorityLabel: 'CRITICAL',
          action: 'Maritime Evacuation & Coastal Search Sortie',
          location: `${region} — Deepwater Coastal Reach`,
          team: 'Coast Guard Marine Rescue Fleet',
          resources: '1x Offshore Patrol Vessel, 1x Marine Recon Helicopter (H-C01)',
          resourceId: 'H-C01',
          reason: 'Category 3 landfall driving severe storm surge along outer sandbars',
          eta: '20 mins',
          expectedImpact: 'Evacuate 350+ maritime workers and fishermen to secure naval head',
          confidence: 0.95
        },
        {
          id: 'dir-cy-02',
          priorityNumber: 2,
          priorityLabel: 'HIGH',
          action: 'Surge Cyclone Shelter Life Support Staging',
          location: `${region} — Inland Transit Base`,
          team: 'Disaster Relief Logistics Unit',
          resources: '400x HexTents, 2,000x High-Calorie Rations',
          reason: 'Local cyclone shelters operating at 92% capacity',
          eta: '40 mins',
          expectedImpact: 'Sustenance and sanitary shelter for 4,500 evacuees',
          confidence: 0.92
        }
      ];
    } else if (t.includes('wildfire')) {
      return [
        {
          id: 'dir-wf-01',
          priorityNumber: 1,
          priorityLabel: 'CRITICAL',
          action: 'Air Tanker Aerial Retardant Drops',
          location: `${region} — Northern Timberline`,
          team: 'Forestry Air Attack Wing',
          resources: '2x Heavy Water Bombers (H-003), 1x Spotter Craft',
          resourceId: 'H-003',
          reason: '45 km/h wind gusts pushing crown fire toward settlement fringe',
          eta: '18 mins',
          expectedImpact: 'Suppresses thermal front spread by 65%',
          confidence: 0.93
        },
        {
          id: 'dir-wf-02',
          priorityNumber: 2,
          priorityLabel: 'HIGH',
          action: 'Construct Western Perimeter Firebreak',
          location: `${region} — Firebreak Sector 3`,
          team: 'Wildland Heavy Equipment Taskforce',
          resources: '4x Bulldozers, 2x Fire Tender Trucks',
          reason: 'Prevent fire jumping across the highway corridor',
          eta: '35 mins',
          expectedImpact: 'Creates 80-meter mineral soil buffer protecting power grid',
          confidence: 0.89
        }
      ];
    } else {
      // Default: Flood
      return [
        {
          id: 'dir-fl-01',
          priorityNumber: 1,
          priorityLabel: 'CRITICAL',
          action: 'Amphibious Swiftwater Extraction Taskforce',
          location: `${region} — Sunamganj Basin`,
          team: 'Fire Service & Civil Defence Water Unit',
          resources: '4x Rigid Inflatable Boats (B-001), 2x Amphibious Transporters',
          resourceId: 'B-001',
          reason: 'Surma River breach with current velocity exceeding 2.2 m/s',
          eta: '15 mins',
          expectedImpact: 'Rescue 400+ citizens isolated on elevated roofs',
          confidence: 0.96
        },
        {
          id: 'dir-fl-02',
          priorityNumber: 2,
          priorityLabel: 'HIGH',
          action: 'Forward Operating Triage Unit Deployment',
          location: `${region} — Sylhet MC College Relief Camp`,
          team: 'Red Crescent Emergency Medical Squad',
          resources: '1x Cholera Treatment Pod (M-201), 10x Field Medics',
          resourceId: 'M-201',
          reason: 'Waterborne contamination reported in waterlogged zones',
          eta: '30 mins',
          expectedImpact: 'Rapid diagnosis and rehydration therapy for 500 patients',
          confidence: 0.92
        },
        {
          id: 'dir-fl-03',
          priorityNumber: 3,
          priorityLabel: 'MEDIUM',
          action: 'High-Capacity Sump Pump Drainage Barrier',
          location: `${region} — Power Substation 2`,
          team: 'Water Board Engineering Logistics',
          resources: '6x High-Flow Dewatering Pumps, 10 Tons Geotextiles',
          reason: 'Prevent electrical grid outage for 450,000 households',
          eta: '45 mins',
          expectedImpact: 'Maintains critical municipal power infrastructure online',
          confidence: 0.90
        }
      ];
    }
  }

  async function generatePlan() {
    if (!$selectedIncident) return;
    isGenerating = true;
    isReady = false;
    planStatus = 'draft';
    generationStep = 0;

    const inc = $selectedIncident;
    recordHistoryEvent(
      'response',
      'COMMANDER',
      'Response Planner Initiated',
      inc.name,
      `Synthesizing tactical response plan for ${inc.name} (${inc.region})`,
      'info'
    );

    for (let i = 0; i < GENERATION_STAGES.length; i++) {
      generationStep = i;
      await new Promise((r) => setTimeout(r, 180));
    }

    directives = getDirectivesForIncident(inc.type, inc.name, inc.region);
    isGenerating = false;
    isReady = true;

    recordHistoryEvent(
      'response',
      'JARVIS-CORE',
      'Response Plan Generated',
      inc.name,
      `Generated ${directives.length} prioritized tactical operations. Pending Human Commander Approval.`,
      'info'
    );
  }

  function handleConfirmApproval() {
    if (!$selectedIncident) return;
    const inc = $selectedIncident;

    // 1. Allocate resources & mark them EN ROUTE / ALLOCATED
    directives.forEach((dir) => {
      if (dir.resourceId) {
        deployResource(dir.resourceId, dir.location, dir.action, dir.priorityLabel);
      }
    });

    // 2. Update response teams to ASSIGNED
    responseTeams.update((teams) =>
      teams.map((t, idx) =>
        idx < directives.length ? { ...t, status: 'DEPLOYED', location: directives[idx].location } : t
      )
    );

    // 3. Log History Events
    recordHistoryEvent(
      'response',
      'COMMANDER',
      'Response Directive Plan Approved',
      inc.name,
      `Commander approved ${directives.length} tactical deployment directives for immediate execution`,
      'success'
    );

    recordHistoryEvent(
      'resources',
      'LOGISTICS-LEAD',
      'Resources Allocated for Plan',
      inc.name,
      `Committed rescue vehicles, medical pods and equipment to active sorties`,
      'success'
    );

    recordHistoryEvent(
      'response',
      'TACTICAL-OPS',
      'Teams Deployed to Theater',
      inc.name,
      `Dispatched designated search & rescue, healthcare and engineering squads`,
      'success'
    );

    addResourceAudit(`Approved operational plan for ${inc.name}. Dispatched tactical assets.`, 'success');

    planStatus = 'approved';
  }

  function startEdit(idx: number) {
    editingIndex = idx;
    editForm = { ...directives[idx] };
    planStatus = 'editing';
  }

  function saveEdit() {
    if (editingIndex !== null && editForm) {
      directives[editingIndex] = {
        ...directives[editingIndex],
        ...editForm
      } as DirectiveItem;

      recordHistoryEvent(
        'response',
        'COMMANDER',
        'Plan Modified',
        directives[editingIndex].action,
        `Updated priority to ${directives[editingIndex].priorityLabel}, ETA to ${directives[editingIndex].eta}`,
        'warning'
      );
    }
    editingIndex = null;
    planStatus = 'draft';
  }

  function handleConfirmRejection() {
    if (!$selectedIncident) return;
    const inc = $selectedIncident;

    recordHistoryEvent(
      'response',
      'COMMANDER',
      'Response Plan Rejected',
      inc.name,
      `Plan rejected by operator. Reason: ${rejectionReason || 'Tactical reassessment required'}`,
      'warning'
    );

    planStatus = 'rejected';
  }

  function handleViewInResponse() {
    closeIncidentPlanModal();
    activeNavSection.set('response');
  }

  function handleClose() {
    closeIncidentPlanModal();
    planStatus = 'draft';
    isReady = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !isGenerating) {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $isIncidentPlanModalOpen && $selectedIncident}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-plan-title"
  >
    <div
      class="relative w-full max-w-2xl bg-[#061425]/95 border border-[#8B5CF6]/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(139,92,246,0.3)] flex flex-col font-mono text-xs text-white max-h-[90vh] overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-start justify-between pb-3.5 border-b border-[#8B5CF6]/20 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.35)]">
            📋
          </div>
          <div>
            <div class="flex items-center gap-1.5 text-[10px] text-[#8B5CF6] font-bold tracking-widest uppercase">
              <span>JARVIS</span>
              <span>//</span>
              <span>TACTICAL RESPONSE PLANNER</span>
            </div>
            <h2 id="modal-plan-title" class="text-sm font-bold text-white tracking-wide truncate max-w-[420px]">
              {$selectedIncident.name}
            </h2>
          </div>
        </div>

        <button
          on:click={handleClose}
          disabled={isGenerating}
          class="text-[#8BA1B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Close Modal (Esc)"
        >
          ✕
        </button>
      </div>

      <!-- Main Body -->
      <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
        {#if isGenerating}
          <!-- Generating Pipeline Sequence -->
          <div class="p-6 rounded-2xl bg-[#020711]/70 border border-white/5 space-y-3">
            <div class="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#8B5CF6] animate-ping"></span>
              <span>Synthesizing Optimal Emergency Response Plan...</span>
            </div>

            <div class="space-y-2 pt-2">
              {#each GENERATION_STAGES as stage, idx}
                <div class="flex items-center gap-2.5 text-[11px] {
                  idx === generationStep
                    ? 'text-[#00E5FF] font-bold'
                    : idx < generationStep
                    ? 'text-emerald-400'
                    : 'text-[#8BA1B8]/40'
                }">
                  {#if idx < generationStep}
                    <span class="text-emerald-400 text-xs">✓</span>
                  {:else if idx === generationStep}
                    <span class="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping"></span>
                  {:else}
                    <span class="w-2 h-2 rounded-full bg-white/20"></span>
                  {/if}
                  <span>{stage}</span>
                </div>
              {/each}
            </div>
          </div>
        {:else if planStatus === 'confirming_approval'}
          <!-- Human Approval Confirmation Dialog -->
          <div class="p-5 rounded-2xl bg-[#020711]/90 border border-amber-500/50 space-y-3.5 animate-in fade-in">
            <div class="flex items-center gap-2.5 text-amber-400">
              <span class="text-xl">⚠️</span>
              <h3 class="text-sm font-bold uppercase tracking-wider">COMMAND CONFIRMATION: APPROVE RESPONSE PLAN?</h3>
            </div>
            <p class="text-xs text-[#C5D1DE] leading-relaxed">
              Authorizing this response plan will immediately:
            </p>
            <ul class="text-[11px] text-[#8BA1B8] space-y-1 list-disc list-inside bg-[#061425] p-3 rounded-xl border border-white/5">
              <li>Commit active resources from regional depots into active deployment status (<span class="text-amber-400 font-bold">EN ROUTE</span>)</li>
              <li>Assign tactical squads & dispatch orders to operational sectors</li>
              <li>Record irrevocable decision entries into the Planetary Audit Log</li>
              <li>Propagate deployment posture to the central Response command map</li>
            </ul>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                on:click={() => (planStatus = 'draft')}
                class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                on:click={handleConfirmApproval}
                class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                CONFIRM & DEPLOY ASSETS
              </button>
            </div>
          </div>
        {:else if planStatus === 'confirming_rejection'}
          <!-- Rejection Dialog -->
          <div class="p-5 rounded-2xl bg-[#020711]/90 border border-rose-500/50 space-y-3.5 animate-in fade-in">
            <div class="flex items-center gap-2.5 text-rose-400">
              <span class="text-xl">🛑</span>
              <h3 class="text-sm font-bold uppercase tracking-wider">REJECT RESPONSE PLAN</h3>
            </div>
            <p class="text-xs text-[#C5D1DE]">
              Please state the operational justification for rejecting this generated plan:
            </p>
            <textarea
              bind:value={rejectionReason}
              placeholder="e.g. Insufficient reserve aircraft, weather window closed, prioritizing eastern sector..."
              rows="3"
              class="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-rose-400 font-mono"
            ></textarea>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                on:click={() => (planStatus = 'draft')}
                class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white cursor-pointer"
              >
                Back
              </button>
              <button
                on:click={handleConfirmRejection}
                class="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold text-xs cursor-pointer"
              >
                CONFIRM REJECTION
              </button>
            </div>
          </div>
        {:else if planStatus === 'approved'}
          <!-- Approved State -->
          <div class="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-in fade-in">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5 text-emerald-400">
                <span class="text-2xl">✓</span>
                <div>
                  <h3 class="text-sm font-bold uppercase tracking-wider">RESPONSE PLAN AUTHORIZED & COMMITTED</h3>
                  <p class="text-[11px] text-emerald-400/80">Tactical units notified, emergency assets dispatched</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[10px] font-bold uppercase">
                STATUS: APPROVED
              </span>
            </div>

            <div class="p-3 rounded-xl bg-[#020711]/60 border border-white/5 space-y-1.5 text-[11px]">
              <div class="flex justify-between">
                <span class="text-[#8BA1B8]">Authorizing Commander:</span>
                <span class="text-white font-bold">JARVIS COMMAND HQ</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#8BA1B8]">Assigned Operational Sector:</span>
                <span class="text-[#00E5FF]">{$selectedIncident.region}, {$selectedIncident.country}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#8BA1B8]">Dispatched Directives:</span>
                <span class="text-white font-medium">{directives.length} Tactical Squads Active</span>
              </div>
            </div>
          </div>
        {:else if planStatus === 'rejected'}
          <!-- Rejected State -->
          <div class="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2 animate-in fade-in">
            <div class="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <span>🛑</span>
              <span>PLAN REJECTED BY COMMANDER</span>
            </div>
            <p class="text-xs text-[#8BA1B8]">
              Reason: <span class="text-white">{rejectionReason || 'No justification provided'}</span>
            </p>
            <p class="text-[10px] text-rose-300/70 pt-2 border-t border-rose-500/20">
              Recorded in Planetary Audit Trail. You may re-generate a new plan with revised parameters.
            </p>
          </div>
        {:else if planStatus === 'editing' && editingIndex !== null}
          <!-- In-Place Modify Form -->
          <div class="p-4 rounded-2xl bg-[#020711]/80 border border-[#00E5FF]/40 space-y-3 animate-in fade-in">
            <h3 class="text-xs font-bold text-[#00E5FF] uppercase tracking-wider">
              Modify Directive #{directives[editingIndex].priorityNumber}
            </h3>

            <div class="space-y-2 text-[11px]">
              <div>
                <label class="text-[#8BA1B8] block text-[10px] mb-1">Action Title</label>
                <input
                  type="text"
                  bind:value={editForm.action}
                  class="w-full p-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[#8BA1B8] block text-[10px] mb-1">Target Sector</label>
                  <input
                    type="text"
                    bind:value={editForm.location}
                    class="w-full p-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label class="text-[#8BA1B8] block text-[10px] mb-1">Priority</label>
                  <select
                    bind:value={editForm.priorityLabel}
                    class="w-full p-2 rounded-lg bg-[#061425] border border-white/10 text-white text-xs"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[#8BA1B8] block text-[10px] mb-1">Assigned Team</label>
                  <input
                    type="text"
                    bind:value={editForm.team}
                    class="w-full p-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label class="text-[#8BA1B8] block text-[10px] mb-1">ETA</label>
                  <input
                    type="text"
                    bind:value={editForm.eta}
                    class="w-full p-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                on:click={() => (planStatus = 'draft')}
                class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                on:click={saveEdit}
                class="px-4 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#38BDF8] text-black font-bold"
              >
                Save Directive
              </button>
            </div>
          </div>
        {:else}
          <!-- Plan Presentation (Prioritized Directives List) -->
          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-white uppercase tracking-wider">
                Recommended Directives ({directives.length} Prioritized Operations)
              </span>
              <span class="text-[10px] text-[#00E5FF] font-bold">
                CONFIDENCE: 94%
              </span>
            </div>

            {#each directives as dir, idx}
              <div class="p-3.5 rounded-xl bg-[#020914]/70 border border-white/10 hover:border-white/20 transition-all space-y-2">
                <!-- Top Row: Priority Badge, Title, Modify Button -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 {
                      dir.priorityLabel === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : dir.priorityLabel === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }">
                      PRIORITY {dir.priorityNumber} // {dir.priorityLabel}
                    </span>
                    <h4 class="text-xs font-bold text-white truncate">{dir.action}</h4>
                  </div>

                  <button
                    on:click={() => startEdit(idx)}
                    class="text-[10px] text-[#8BA1B8] hover:text-[#00E5FF] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 cursor-pointer shrink-0"
                    title="Modify directive parameters"
                  >
                    ✎ Edit
                  </button>
                </div>

                <!-- Middle Grid: Team, Resources, Location -->
                <div class="grid grid-cols-2 gap-2 text-[11px] text-[#8BA1B8] bg-[#061425]/40 p-2 rounded-lg border border-white/5">
                  <div>
                    <span class="text-[10px] text-white/50 block">Target Sector:</span>
                    <span class="text-white font-medium">{dir.location}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-white/50 block">Assigned Squad:</span>
                    <span class="text-[#00E5FF] font-medium">{dir.team}</span>
                  </div>
                  <div class="col-span-2">
                    <span class="text-[10px] text-white/50 block">Allocated Equipment:</span>
                    <span class="text-amber-300 font-medium">{dir.resources}</span>
                  </div>
                </div>

                <!-- Bottom Row: Reason & ETA -->
                <div class="flex items-center justify-between text-[10px] text-[#8BA1B8] pt-1">
                  <span class="truncate max-w-[340px]" title={dir.reason}>
                    Reason: <span class="text-white/80">{dir.reason}</span>
                  </span>
                  <span class="font-bold text-white shrink-0">
                    ETA: <span class="text-[#00E5FF]">{dir.eta}</span>
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3.5 border-t border-white/10 flex items-center justify-between shrink-0">
        {#if planStatus === 'approved'}
          <button
            on:click={handleClose}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs cursor-pointer"
          >
            Close
          </button>
          <button
            on:click={handleViewInResponse}
            class="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-black font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer flex items-center gap-1.5"
          >
            <span>VIEW IN RESPONSE WORKSTATION</span>
            <span>→</span>
          </button>
        {:else if planStatus === 'rejected'}
          <button
            on:click={generatePlan}
            class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
          >
            RE-GENERATE PLAN
          </button>
          <button
            on:click={handleClose}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs cursor-pointer"
          >
            Close
          </button>
        {:else if planStatus === 'draft'}
          <div class="flex items-center gap-2">
            <button
              on:click={() => (planStatus = 'confirming_rejection')}
              class="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs cursor-pointer"
            >
              Reject Plan
            </button>
            <button
              on:click={generatePlan}
              class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white text-xs cursor-pointer"
            >
              Re-optimize
            </button>
          </div>

          <button
            on:click={() => (planStatus = 'confirming_approval')}
            class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer flex items-center gap-1.5"
          >
            <span>APPROVE PLAN</span>
            <span>✓</span>
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
