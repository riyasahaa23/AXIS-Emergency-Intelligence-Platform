<script lang="ts">
  import {
    communicationNodes,
    communicationLinks,
    activeCommunicationChannelId,
    activeCommunicationChannel,
    selectedCommunicationNodeId,
    focusCommunicationNode
  } from '../../stores/communicationStore';
  import type { CommunicationNode } from '../../types/communications';

  let zoom = 1.0;
  let panOffset = { x: 0, y: 0 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  // Geographic bounds mapping for Bangladesh / South Asia theater
  const bbox = { minLng: 88.0, maxLng: 93.0, minLat: 20.5, maxLat: 26.8 };

  function projectCoords(coords: [number, number]): { x: number; y: number } {
    const normX = (coords[0] - bbox.minLng) / (bbox.maxLng - bbox.minLng);
    const normY = (bbox.maxLat - coords[1]) / (bbox.maxLat - bbox.minLat);
    return {
      x: Math.round(150 + Math.max(0, Math.min(1, normX)) * 700),
      y: Math.round(70 + Math.max(0, Math.min(1, normY)) * 450)
    };
  }

  function handleMouseDown(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('.map-hud-control, .node-marker')) return;
    isDragging = true;
    dragStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    panOffset = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function getNodeColor(type: string): string {
    switch (type) {
      case 'command': return '#00E5FF';
      case 'medical': return '#EF4444';
      case 'rescue': return '#3B82F6';
      case 'logistics': return '#F59E0B';
      case 'shelter': return '#10B981';
      default: return '#8B5CF6';
    }
  }

  $: selectedNode = $communicationNodes.find((n) => n.id === $selectedCommunicationNodeId);
</script>

<div
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  class="relative flex-1 flex flex-col bg-[#020914] border border-white/10 rounded-2xl overflow-hidden select-none"
  role="region"
  aria-label="Communication Network Topology Map"
>
  <!-- Top Map Header -->
  <div class="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-[#020914]/90 to-transparent pointer-events-none">
    <div class="flex items-center gap-2 pointer-events-auto bg-[#061425]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg font-mono">
      <span class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      <span class="text-xs font-bold uppercase tracking-wider text-white">LIVE MESH COMMUNICATION NETWORK</span>
      <span class="text-[10px] text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
        {$activeCommunicationChannel.name}
      </span>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-1.5 pointer-events-auto map-hud-control bg-[#061425]/85 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg font-mono">
      <button
        on:click={() => zoom = Math.min(2.2, zoom + 0.2)}
        class="w-6 h-6 rounded bg-black/40 hover:bg-white/10 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
        title="Zoom In"
      >
        +
      </button>
      <button
        on:click={() => zoom = Math.max(0.6, zoom - 0.2)}
        class="w-6 h-6 rounded bg-black/40 hover:bg-white/10 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
        title="Zoom Out"
      >
        −
      </button>
      <button
        on:click={() => { zoom = 1.0; panOffset = { x: 0, y: 0 }; selectedCommunicationNodeId.set(null); }}
        class="px-2 py-0.5 rounded bg-black/40 hover:bg-white/10 text-[#8BA1B8] hover:text-white text-[9px] font-bold cursor-pointer"
        title="Reset Map"
      >
        RESET
      </button>
    </div>
  </div>

  <!-- Interactive SVG Map Canvas -->
  <div class="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden">
    <svg
      class="w-full h-full transition-transform duration-75"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid meet"
      style="transform: scale({zoom}) translate({panOffset.x}px, {panOffset.y}px); transform-origin: center center;"
    >
      <defs>
        <!-- Grid Pattern -->
        <pattern id="comm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 229, 255, 0.04)" stroke-width="1" />
        </pattern>

        <!-- Signal Flow Gradient -->
        <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.3" />
        </linearGradient>
      </defs>

      <rect width="1000" height="600" fill="url(#comm-grid)" />

      <!-- Vector Territory Coastline / Background Geography -->
      <path
        d="M 220 70 Q 380 110 520 220 T 720 380 Q 840 500 760 580 T 560 590 Q 360 540 240 460 Z"
        fill="rgba(6, 20, 37, 0.45)"
        stroke="rgba(0, 229, 255, 0.15)"
        stroke-width="1.5"
      />

      <!-- Mesh Communication Links -->
      {#each $communicationLinks as link}
        {@const fromNode = $communicationNodes.find((n) => n.id === link.fromNodeId)}
        {@const toNode = $communicationNodes.find((n) => n.id === link.toNodeId)}
        {#if fromNode && toNode}
          {@const p1 = projectCoords(fromNode.coords)}
          {@const p2 = projectCoords(toNode.coords)}
          {@const isChannelMatch = fromNode.channelIds.includes($activeCommunicationChannelId) || toNode.channelIds.includes($activeCommunicationChannelId)}
          
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={link.status === 'DEGRADED' ? 'rgba(245, 158, 11, 0.5)' : isChannelMatch ? 'url(#link-grad)' : 'rgba(255, 255, 255, 0.15)'}
            stroke-width={isChannelMatch ? '2.5' : '1'}
            stroke-dasharray={link.status === 'DEGRADED' ? '6 4' : 'none'}
          />

          <!-- Animated Signal Packet -->
          {#if isChannelMatch}
            <circle r="3.5" fill="#00E5FF" filter="drop-shadow(0 0 6px #00E5FF)">
              <animateMotion
                path="M {p1.x} {p1.y} L {p2.x} {p2.y}"
                dur="{link.latencyMs < 20 ? '2s' : '3.5s'}"
                repeatCount="indefinite"
              />
            </circle>
          {/if}
        {/if}
      {/each}

      <!-- Mesh Topology Nodes -->
      {#each $communicationNodes as node}
        {@const p = projectCoords(node.coords)}
        {@const isSelected = $selectedCommunicationNodeId === node.id}
        {@const isChannelMatch = node.channelIds.includes($activeCommunicationChannelId)}
        {@const nodeColor = getNodeColor(node.type)}

        <!-- Node Group -->
        <g
          class="node-marker cursor-pointer"
          on:click={() => focusCommunicationNode(node.id)}
          transform="translate({p.x}, {p.y})"
        >
          <!-- Outer Ping Ring -->
          <circle
            r={isSelected ? '22' : '15'}
            fill="none"
            stroke={nodeColor}
            stroke-width="1.5"
            stroke-dasharray="3 3"
            opacity={isChannelMatch ? '0.85' : '0.3'}
            class="animate-spin"
            style="transform-origin: center; animation-duration: 8s;"
          />

          <!-- Center Node Core -->
          <circle
            r={isSelected ? '9' : '6'}
            fill={nodeColor}
            opacity={isChannelMatch ? '1' : '0.4'}
            filter="drop-shadow(0 0 10px {nodeColor})"
          />

          <!-- Node Call-out Label -->
          <text
            x="14"
            y="4"
            fill={isChannelMatch ? '#FFFFFF' : '#8BA1B8'}
            font-family="monospace"
            font-size="10"
            font-weight="bold"
            letter-spacing="0.5"
          >
            {node.unitCallsign}
          </text>
        </g>
      {/each}
    </svg>

    <!-- Node Inspector Card (Overlaid Bottom Left of Map) -->
    {#if selectedNode}
      <div class="absolute bottom-3 left-3 z-30 p-3 rounded-xl bg-[#061425]/90 backdrop-blur-xl border border-[#00E5FF]/40 shadow-2xl font-mono text-xs w-72">
        <div class="flex items-center justify-between pb-1.5 border-b border-white/10">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" style="background: {getNodeColor(selectedNode.type)}"></span>
            <span class="font-bold text-white uppercase">{selectedNode.unitCallsign}</span>
          </div>
          <button
            on:click={() => selectedCommunicationNodeId.set(null)}
            class="text-[#8BA1B8] hover:text-white p-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="mt-2 space-y-1 text-[11px]">
          <div class="text-slate-300 font-bold">{selectedNode.name}</div>
          <div class="text-[#8BA1B8] flex justify-between">
            <span>Node Class:</span>
            <span class="text-white uppercase font-bold">{selectedNode.type}</span>
          </div>
          <div class="text-[#8BA1B8] flex justify-between">
            <span>Uplink Status:</span>
            <span class="text-emerald-400 font-bold">{selectedNode.status}</span>
          </div>
          <div class="text-[#8BA1B8] flex justify-between">
            <span>Coordinates:</span>
            <span class="text-[#00E5FF]">{selectedNode.coords[1].toFixed(2)}°N, {selectedNode.coords[0].toFixed(2)}°E</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Map Legend -->
    <div class="absolute bottom-3 right-3 z-20 p-2 rounded-xl bg-[#061425]/85 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#8BA1B8] space-y-1">
      <div class="font-bold uppercase tracking-wider text-white mb-1">NODE CLASSIFICATION</div>
      <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#00E5FF]"></span> Command Center</div>
      <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#EF4444]"></span> Field Medical Post</div>
      <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3B82F6]"></span> Air & Water Rescue</div>
      <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Logistics Depot</div>
      <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#10B981]"></span> Civil Evac Shelter</div>
    </div>
  </div>
</div>
