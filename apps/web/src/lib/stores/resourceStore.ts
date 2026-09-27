import { writable, derived, get } from 'svelte/store';
import type {
  ResourceCategory,
  ResourceStatus,
  ResourcesMode,
  ResourceItem,
  ResourceRequest,
  ShipmentItem,
  FacilityItem,
  PersonnelItem,
  ResourceOperationItem,
  ResourceMetrics,
  ResourceActivityEntry,
  ResourceMapContext,
  ResourceMapMarker,
  ResourceMapRoute
} from '../types/resources';
import { resourceDatabase, floodResourceData, type HazardResourcePackage } from '../mock/resources/resourceDatabase';
import { selectedIncident } from './incidentStore';

// Mode Navigation Tab (7 Sub-modes)
export const activeResourcesMode = writable<ResourcesMode>('overview');

// Category Selection (Left Panel)
export const selectedResourceCategory = writable<ResourceCategory>('All Resources');

// Map Layer Filters
export const activeResourceMapLayer = writable<
  'ALL RESOURCES' | 'HELICOPTERS' | 'BOATS' | 'VEHICLES' | 'SUPPLIES' | 'FACILITIES'
>('ALL RESOURCES');

// Active Hazard Theatre
export const activeResourceHazard = writable<string>('flood');
export const currentResourcePackage = writable<HazardResourcePackage>(floodResourceData);

// Active Selections
export const selectedResourceId = writable<string | null>('H-001');
export const selectedFacilityId = writable<string | null>(null);
export const selectedShipmentId = writable<string | null>(null);
export const hoveredMarkerId = writable<string | null>(null);

// Inventory Search & Filters
export const inventorySearchQuery = writable<string>('');
export const inventoryTypeFilter = writable<string>('All Types');
export const inventoryStatusFilter = writable<string>('All Status');
export const inventoryLocationFilter = writable<string>('All Locations');

// Map Camera & Focus State
export const resourceMapFocus = writable<{
  center: [number, number];
  zoom: number;
  highlightId?: string;
}>({
  center: [90.4125, 23.8103],
  zoom: 1.0
});

// Modal State
export const isDeployModalOpen = writable<boolean>(false);
export const isRequestModalOpen = writable<boolean>(false);
export const isAllocateModalOpen = writable<boolean>(false);
export const isTrackShipmentModalOpen = writable<boolean>(false);
export const isResourceReportModalOpen = writable<boolean>(false);
export const isOptimizeModalOpen = writable<boolean>(false);
export const isDetailModalOpen = writable<boolean>(false);

// Active Entity Data Stores
export const resourceMetrics = writable<ResourceMetrics>(floodResourceData.metrics);
export const resourceCategoryCounts = writable<Record<ResourceCategory, number>>(
  floodResourceData.categoryCounts
);
export const allResources = writable<ResourceItem[]>(floodResourceData.resources);
export const resourceRequests = writable<ResourceRequest[]>(floodResourceData.requests);
export const activeShipments = writable<ShipmentItem[]>(floodResourceData.shipments);
export const allFacilities = writable<FacilityItem[]>(floodResourceData.facilities);
export const emergencyPersonnel = writable<PersonnelItem[]>(floodResourceData.personnel);
export const upcomingResourceOperations = writable<ResourceOperationItem[]>(
  floodResourceData.operations
);

// Derived Selected Resource (Single Source of Truth, Validated against Active Context)
export const selectedResource = derived(
  [
    allResources,
    selectedResourceId,
    selectedResourceCategory,
    activeResourceMapLayer,
    activeResourcesMode
  ],
  ([$resources, $id, $cat, $mapLayer, $mode]) => {
    if (!$id) return null;
    let list = $resources;

    // In non-resource modes (facilities, supply_chain, requests, personnel), resources are not visible
    if ($mode === 'facilities' || $mode === 'supply_chain' || $mode === 'requests' || $mode === 'personnel') {
      return null;
    }

    // Category filter (Overview)
    if ($mode === 'overview' && $cat !== 'All Resources') {
      list = list.filter((r) => r.category === $cat);
    }

    // Map layer filter (Overview)
    if ($mode === 'overview') {
      if ($mapLayer === 'HELICOPTERS') {
        list = list.filter((r) => r.category === 'Helicopters');
      } else if ($mapLayer === 'BOATS') {
        list = list.filter((r) => r.category === 'Boats');
      } else if ($mapLayer === 'VEHICLES') {
        list = list.filter((r) => r.category === 'Ground Vehicles');
      } else if ($mapLayer === 'SUPPLIES') {
        list = list.filter(
          (r) =>
            r.category === 'Medical Supplies' ||
            r.category === 'Food & Water' ||
            r.category === 'Temporary Shelters' ||
            r.category === 'Fuel & Energy'
        );
      } else if ($mapLayer === 'FACILITIES') {
        return null;
      }
    }

    // Assets subview filter
    if ($mode === 'assets') {
      list = list.filter(
        (r) =>
          r.category === 'Helicopters' ||
          r.category === 'Boats' ||
          r.category === 'Ground Vehicles' ||
          r.category === 'Communication Equipment' ||
          r.category === 'Search & Rescue Equipment'
      );
    }

    // Supplies subview filter
    if ($mode === 'supplies') {
      list = list.filter(
        (r) =>
          r.category === 'Medical Supplies' ||
          r.category === 'Food & Water' ||
          r.category === 'Temporary Shelters' ||
          r.category === 'Fuel & Energy'
      );
    }

    return list.find((r) => r.id === $id) || null;
  }
);

// Audit Activity Log
export const resourceAuditLog = writable<ResourceActivityEntry[]>([
  {
    id: 'log-01',
    timestamp: '14:22 UTC',
    action: 'Shelter capacity updated',
    target: 'National Relief Center',
    operator: 'JARVIS-LOGISTICS',
    severity: 'info'
  },
  {
    id: 'log-02',
    timestamp: '14:14 UTC',
    action: 'Shipment SH-021 departed',
    target: 'Forward Logistics Airhead',
    operator: 'Logistics Command',
    severity: 'info'
  },
  {
    id: 'log-03',
    timestamp: '14:07 UTC',
    action: 'Medical supplies allocated',
    target: 'Central Forward Staging Depot',
    operator: 'Chief Medical Officer',
    severity: 'success'
  },
  {
    id: 'log-04',
    timestamp: '14:02 UTC',
    action: 'Rotary Wing prepped for sortie',
    target: 'Emergency Air Base Hangar',
    operator: 'Aviation Lead',
    severity: 'info'
  }
]);

// Helper styles
function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'Helicopters': return '#8B5CF6';
    case 'Boats': return '#3B82F6';
    case 'Ground Vehicles': return '#10B981';
    case 'Medical Supplies': return '#EF4444';
    case 'Temporary Shelters': return '#F97316';
    case 'Food & Water': return '#10B981';
    case 'Fuel & Energy': return '#F59E0B';
    case 'Communication Equipment': return '#00E5FF';
    case 'Search & Rescue Equipment': return '#EC4899';
    default: return '#00E5FF';
  }
}

function getCategoryBorder(cat: string): string {
  switch (cat) {
    case 'Helicopters': return 'border-purple-400';
    case 'Boats': return 'border-blue-400';
    case 'Ground Vehicles': return 'border-emerald-400';
    case 'Medical Supplies': return 'border-rose-400';
    case 'Temporary Shelters': return 'border-orange-400';
    case 'Fuel & Energy': return 'border-amber-400';
    case 'Communication Equipment': return 'border-cyan-400';
    case 'Search & Rescue Equipment': return 'border-pink-400';
    default: return 'border-cyan-400';
  }
}

function getCategoryIcon(cat: string): string {
  switch (cat) {
    case 'Helicopters': return '🚁';
    case 'Boats': return '🚤';
    case 'Ground Vehicles': return '🚛';
    case 'Medical Supplies': return '✚';
    case 'Temporary Shelters': return '⛺';
    case 'Food & Water': return '🍞';
    case 'Fuel & Energy': return '⚡';
    case 'Communication Equipment': return '📡';
    case 'Search & Rescue Equipment': return '🛟';
    default: return '📦';
  }
}

// -------------------------------------------------------------
// CENTRAL DATA-DRIVEN RESOURCE MAP CONTEXT (Single Source of Truth)
// -------------------------------------------------------------
export const resourceMapContext = derived(
  [
    currentResourcePackage,
    activeResourcesMode,
    selectedResourceCategory,
    activeResourceMapLayer,
    allResources,
    allFacilities,
    activeShipments,
    emergencyPersonnel,
    resourceRequests,
    selectedResource,
    selectedResourceId,
    selectedFacilityId,
    selectedShipmentId
  ],
  ([
    $pkg,
    $mode,
    $category,
    $mapLayer,
    $resources,
    $facilities,
    $shipments,
    $personnel,
    $requests,
    $selectedRes,
    $selectedResId,
    $selectedFacId,
    $selectedShipId
  ]): ResourceMapContext => {
    // 1. Dynamic Map Title & Subtitle based on Tab + Hazard Theatre
    let mapTitle = 'RESOURCE DEPLOYMENT MAP';
    let mapSubtitle = `${$pkg.locationName} (${$pkg.theatreName})`;

    if ($mode === 'assets') {
      mapTitle = 'ASSET & EQUIPMENT FLEET MAP';
      mapSubtitle = `${$pkg.theatreName} // Operational Condition & Reserves`;
    } else if ($mode === 'supplies') {
      mapTitle = 'SUPPLY LOGISTICS & DISTRIBUTION MAP';
      mapSubtitle = `${$pkg.theatreName} // Regional Depots & Burn Rates`;
    } else if ($mode === 'personnel') {
      mapTitle = 'PERSONNEL DEPLOYMENT MAP';
      mapSubtitle = `${$pkg.theatreName} // Field Rosters & Stationed Units`;
    } else if ($mode === 'facilities') {
      mapTitle = 'STRATEGIC LOGISTICS FACILITIES NETWORK';
      mapSubtitle = `${$pkg.theatreName} // Emergency Airheads, Ports & Depots`;
    } else if ($mode === 'supply_chain') {
      mapTitle = 'SUPPLY CHAIN PIPELINE & FREIGHT CONVOYS';
      mapSubtitle = `${$pkg.theatreName} // Active Multimodal Logistics Routes`;
    } else if ($mode === 'requests') {
      mapTitle = 'RESOURCE GAPS & OPERATIONAL DEFICITS';
      mapSubtitle = `${$pkg.theatreName} // Real-Time Field Shortage Hotspots`;
    }

    if ($category !== 'All Resources' && $mode === 'overview') {
      mapSubtitle += ` // Category: ${$category}`;
    }

    // 2. Generate Context-Aware Markers
    const markers: ResourceMapMarker[] = [];

    if ($mode === 'overview') {
      // Filter resources by category
      let resList = $resources;
      if ($category !== 'All Resources') {
        resList = resList.filter((r) => r.category === $category);
      }
      // Filter by layer buttons
      if ($mapLayer === 'HELICOPTERS') {
        resList = resList.filter((r) => r.category === 'Helicopters');
      } else if ($mapLayer === 'BOATS') {
        resList = resList.filter((r) => r.category === 'Boats');
      } else if ($mapLayer === 'VEHICLES') {
        resList = resList.filter((r) => r.category === 'Ground Vehicles');
      } else if ($mapLayer === 'SUPPLIES') {
        resList = resList.filter(
          (r) =>
            r.category === 'Medical Supplies' ||
            r.category === 'Food & Water' ||
            r.category === 'Temporary Shelters' ||
            r.category === 'Fuel & Energy'
        );
      }

      if ($mapLayer !== 'FACILITIES') {
        resList.forEach((r) => {
          markers.push({
            id: r.id,
            entityType: 'resource',
            name: r.name,
            category: r.category,
            coords: r.coords,
            status: r.status,
            metricLabel: `${r.status} (${r.fuelOrStockPct}% fuel)`,
            color: getCategoryColor(r.category),
            bgColor: 'bg-[#030914]/90',
            borderColor: getCategoryBorder(r.category),
            icon: getCategoryIcon(r.category),
            details: r
          });
        });
      }

      if ($mapLayer === 'ALL RESOURCES' || $mapLayer === 'FACILITIES') {
        $facilities.forEach((f) => {
          markers.push({
            id: f.id,
            entityType: 'facility',
            name: f.name,
            category: f.type,
            coords: f.coords,
            status: f.status,
            metricLabel: `CAPACITY: ${f.capacityPct}%`,
            color: '#00E5FF',
            bgColor: 'bg-cyan-950/90',
            borderColor: 'border-cyan-400',
            icon: f.type === 'Air Base' ? '🛫' : f.type === 'Port' ? '⚓' : '🏢',
            details: f
          });
        });
      }
    } else if ($mode === 'assets') {
      // Fleet machinery with condition & telemetry
      $resources.forEach((r) => {
        markers.push({
          id: r.id,
          entityType: 'resource',
          name: r.name,
          category: r.category,
          coords: r.coords,
          status: r.status,
          metricLabel: `${r.condition} • ${r.fuelOrStockPct}% PWR`,
          color: r.status === 'MAINTENANCE' ? '#F43F5E' : r.status === 'DEPLOYED' ? '#00E5FF' : '#10B981',
          bgColor: 'bg-[#030914]/90',
          borderColor: r.status === 'MAINTENANCE' ? 'border-rose-500' : 'border-cyan-400',
          icon: getCategoryIcon(r.category),
          details: r
        });
      });
    } else if ($mode === 'supplies') {
      // Supply facilities & hubs with stock reserves
      $facilities.forEach((f) => {
        markers.push({
          id: f.id,
          entityType: 'facility',
          name: f.name,
          category: f.type,
          coords: f.coords,
          status: f.status,
          metricLabel: `RESERVES: ${f.capacityPct}% FULL`,
          color: '#EAB308',
          bgColor: 'bg-amber-950/90',
          borderColor: 'border-amber-400',
          icon: '📦',
          details: f
        });
      });
      // In-transit supply cargo
      $shipments.forEach((s) => {
        if (s.path && s.path.length > 0) {
          const mid = s.path[Math.floor(s.path.length / 2)];
          markers.push({
            id: s.id,
            entityType: 'shipment',
            name: s.contents,
            category: s.transportMode,
            coords: mid,
            status: s.status,
            metricLabel: `IN TRANSIT (${s.progressPct}%)`,
            color: s.status === 'DELAYED' ? '#F59E0B' : '#8B5CF6',
            bgColor: 'bg-purple-950/90',
            borderColor: 'border-purple-400',
            icon: s.transportMode === 'Air' ? '✈️' : s.transportMode === 'Sea' ? '🚢' : '🚛',
            details: s
          });
        }
      });
    } else if ($mode === 'personnel') {
      // Emergency teams plotted at their duty stations
      $personnel.forEach((p) => {
        const coords = p.coords || $pkg.center;
        markers.push({
          id: p.id,
          entityType: 'personnel',
          name: `${p.name} (${p.role})`,
          category: p.specialization,
          coords,
          status: p.status,
          metricLabel: `${p.specialization.toUpperCase()} • ${p.status}`,
          color: '#10B981',
          bgColor: 'bg-emerald-950/90',
          borderColor: 'border-emerald-400',
          icon: p.specialization === 'Medical' ? '⚕️' : p.specialization === 'Rescue' ? '🛟' : '👷',
          details: p
        });
      });
    } else if ($mode === 'facilities') {
      // Strategic logistics nodes
      $facilities.forEach((f) => {
        markers.push({
          id: f.id,
          entityType: 'facility',
          name: f.name,
          category: f.type,
          coords: f.coords,
          status: f.status,
          metricLabel: `CAPACITY ${f.capacityPct}% // ${f.status}`,
          color: f.status === 'LIMITED CAPACITY' || f.status === 'SURGE CAPACITY' ? '#F59E0B' : '#00E5FF',
          bgColor: 'bg-[#061425]',
          borderColor: f.status === 'SURGE CAPACITY' ? 'border-amber-400' : 'border-[#00E5FF]',
          icon: f.type === 'Air Base' ? '🛫' : f.type === 'Port' ? '⚓' : f.type === 'Hospital' ? '🏥' : '🏢',
          details: f
        });
      });
    } else if ($mode === 'supply_chain') {
      // Supply chain nodes and active convoys
      $facilities.forEach((f) => {
        markers.push({
          id: f.id,
          entityType: 'facility',
          name: f.name,
          category: 'Logistics Hub',
          coords: f.coords,
          status: f.status,
          metricLabel: `HUB: ${f.incomingShipments} In / ${f.outgoingShipments} Out`,
          color: '#00E5FF',
          bgColor: 'bg-cyan-950/90',
          borderColor: 'border-cyan-400',
          icon: '🏭',
          details: f
        });
      });
      $shipments.forEach((s) => {
        if (s.path && s.path.length > 0) {
          const mid = s.path[Math.floor(s.path.length / 2)];
          markers.push({
            id: s.id,
            entityType: 'shipment',
            name: `${s.id} (${s.transportMode})`,
            category: s.transportMode,
            coords: mid,
            status: s.status,
            metricLabel: `${s.contents} [${s.progressPct}%]`,
            color: s.status === 'DELAYED' ? '#EF4444' : '#8B5CF6',
            bgColor: 'bg-purple-950/90',
            borderColor: s.status === 'DELAYED' ? 'border-rose-400' : 'border-purple-400',
            icon: s.transportMode === 'Air' ? '✈️' : s.transportMode === 'Sea' ? '🚢' : '🚚',
            details: s
          });
        }
      });
    } else if ($mode === 'requests') {
      // Highlight geographic resource deficits
      $requests.forEach((req, idx) => {
        const destCity = $pkg.mapMetadata.cities.find((c) =>
          req.destination.toLowerCase().includes(c.name.toLowerCase())
        );
        const reqCoords: [number, number] = destCity
          ? [destCity.coords[0] + (idx * 0.04 - 0.02), destCity.coords[1] + (idx * 0.03 - 0.015)]
          : [$pkg.center[0] + (idx * 0.15 - 0.1), $pkg.center[1] + (idx * 0.12 - 0.06)];

        markers.push({
          id: req.id,
          entityType: 'request',
          name: `${req.id}: ${req.resourceType}`,
          category: req.category,
          coords: reqCoords,
          status: req.status,
          metricLabel: `GAP: -${req.quantity} Units (${req.priority})`,
          priority: req.priority,
          color: req.priority === 'CRITICAL' ? '#EF4444' : '#F59E0B',
          bgColor: req.priority === 'CRITICAL' ? 'bg-rose-950/90' : 'bg-amber-950/90',
          borderColor: req.priority === 'CRITICAL' ? 'border-rose-500' : 'border-amber-400',
          icon: '⚠️',
          details: req
        });
      });
    }

    // 3. Generate Routes
    const routes: ResourceMapRoute[] = [];
    if ($mode === 'overview' || $mode === 'supplies' || $mode === 'supply_chain') {
      $shipments.forEach((s) => {
        routes.push({
          id: s.id,
          name: `${s.origin} → ${s.destination}`,
          path: s.path,
          mode: s.transportMode,
          status: s.status,
          color: s.status === 'DELAYED' ? '#F59E0B' : s.status === 'ARRIVED' ? '#10B981' : '#00E5FF'
        });
      });
    }

    // 4. Dynamic Legend
    let legend = [
      { label: 'Helicopters', color: '#8B5CF6', icon: '🚁' },
      { label: 'Boats', color: '#3B82F6', icon: '🚤' },
      { label: 'Vehicles', color: '#10B981', icon: '🚛' },
      { label: 'Supplies', color: '#EF4444', icon: '✚' },
      { label: 'Facilities', color: '#00E5FF', icon: '🏢' }
    ];

    if ($mode === 'assets') {
      legend = [
        { label: 'Available Asset', color: '#10B981', icon: '●' },
        { label: 'Deployed Sortie', color: '#00E5FF', icon: '▲' },
        { label: 'Under Maintenance', color: '#F43F5E', icon: '■' }
      ];
    } else if ($mode === 'supplies') {
      legend = [
        { label: 'Supply Depots', color: '#EAB308', icon: '📦' },
        { label: 'In-Transit Freight', color: '#8B5CF6', icon: '🚚' },
        { label: 'Low Stock Alert', color: '#EF4444', icon: '⚠️' }
      ];
    } else if ($mode === 'personnel') {
      legend = [
        { label: 'Medical Squads', color: '#EF4444', icon: '⚕️' },
        { label: 'SAR Rescue Units', color: '#3B82F6', icon: '🛟' },
        { label: 'Engineering Teams', color: '#F59E0B', icon: '👷' },
        { label: 'Command Staff', color: '#10B981', icon: '🎖️' }
      ];
    } else if ($mode === 'facilities') {
      legend = [
        { label: 'Operational Airhead/Port', color: '#00E5FF', icon: '🏢' },
        { label: 'Surge Capacity Staging', color: '#F59E0B', icon: '⚠️' },
        { label: 'Strategic Depot', color: '#8B5CF6', icon: '⚓' }
      ];
    } else if ($mode === 'supply_chain') {
      legend = [
        { label: 'Air Transport Route', color: '#00E5FF', icon: '✈️' },
        { label: 'Maritime Route', color: '#3B82F6', icon: '🚢' },
        { label: 'Road Transit Route', color: '#10B981', icon: '🚛' },
        { label: 'Delayed Conveyance', color: '#EF4444', icon: '⚠️' }
      ];
    } else if ($mode === 'requests') {
      legend = [
        { label: 'Critical Gap', color: '#EF4444', icon: '🚨' },
        { label: 'High Priority Need', color: '#F59E0B', icon: '⚠️' },
        { label: 'Approved Requisition', color: '#10B981', icon: '✓' }
      ];
    }

    return {
      incidentId: $pkg.hazardId,
      incidentName: $pkg.hazardName,
      theatreName: $pkg.theatreName,
      mapTitle,
      mapSubtitle,
      bbox: $pkg.mapMetadata.bbox,
      center: $pkg.center,
      defaultZoom: $pkg.defaultZoom,
      territoryPath: $pkg.mapMetadata.territoryPath,
      waterwayPaths: $pkg.mapMetadata.waterwayPaths,
      surroundingLabels: $pkg.mapMetadata.surroundingLabels,
      cities: $pkg.mapMetadata.cities,
      activeTab: $mode,
      activeCategory: $category,
      activeMapLayer: $mapLayer,
      markers,
      routes,
      legend,
      selectedResource: $selectedRes,
      selectedFacility: $selectedFacId ? $facilities.find((f) => f.id === $selectedFacId) || null : null,
      selectedShipment: $selectedShipId ? $shipments.find((s) => s.id === $selectedShipId) || null : null
    };
  }
);

// -------------------------------------------------------------
// Synchronize Hazard Context (Triggered directly or via selectedIncident)
// -------------------------------------------------------------
export function setResourceHazard(hazard: string) {
  const norm = hazard.toLowerCase().replace('-', '_');
  const pkg = resourceDatabase[norm] || resourceDatabase['flood'];
  activeResourceHazard.set(norm);
  currentResourcePackage.set(pkg);

  resourceMetrics.set({ ...pkg.metrics });
  resourceCategoryCounts.set({ ...pkg.categoryCounts });
  allResources.set([...pkg.resources]);
  resourceRequests.set([...pkg.requests]);
  activeShipments.set([...pkg.shipments]);
  allFacilities.set([...pkg.facilities]);
  emergencyPersonnel.set([...pkg.personnel]);
  upcomingResourceOperations.set([...pkg.operations]);

  // Clear stale selections across hazards (Acceptance Test step 10)
  selectedResourceId.set(null);
  selectedFacilityId.set(null);
  selectedShipmentId.set(null);

  // Focus map camera on new theatre
  resourceMapFocus.set({
    center: pkg.center,
    zoom: pkg.defaultZoom
  });

  addResourceAudit(`Switched resource command to ${pkg.hazardName} (${pkg.theatreName})`, 'info');
}

// Global subscription to incidentStore
if (typeof window !== 'undefined') {
  (window as any).setResourceHazard = setResourceHazard;
  (window as any).selectResource = selectResource;
  selectedIncident.subscribe(($inc) => {
    if ($inc) {
      const typeKey = $inc.type.toLowerCase();
      let targetHaz = 'flood';
      if (typeKey.includes('cyclone')) targetHaz = 'cyclone';
      else if (typeKey.includes('wildfire')) targetHaz = 'wildfire';
      else if (typeKey.includes('earthquake')) targetHaz = 'earthquake';
      else if (typeKey.includes('multi')) targetHaz = 'multi_hazard';
      else targetHaz = 'flood';

      const currentHaz = get(activeResourceHazard);
      if (targetHaz !== currentHaz) {
        setResourceHazard(targetHaz);
      }
    }
  });
}

// Select Category (Clears selection if not matching new category)
export function setCategory(category: ResourceCategory) {
  selectedResourceCategory.set(category);
  const currentId = get(selectedResourceId);
  if (currentId) {
    const items = get(allResources);
    const found = items.find((r) => r.id === currentId);
    if (!found || (category !== 'All Resources' && found.category !== category)) {
      selectedResourceId.set(null);
    }
  }
}

// Set Map Layer Filter (Clears selection if not matching new layer)
export function setMapLayer(
  layer: 'ALL RESOURCES' | 'HELICOPTERS' | 'BOATS' | 'VEHICLES' | 'SUPPLIES' | 'FACILITIES'
) {
  activeResourceMapLayer.set(layer);
  const currentId = get(selectedResourceId);
  if (currentId) {
    const items = get(allResources);
    const found = items.find((r) => r.id === currentId);
    if (!found) {
      selectedResourceId.set(null);
    } else if (layer === 'HELICOPTERS' && found.category !== 'Helicopters') {
      selectedResourceId.set(null);
    } else if (layer === 'BOATS' && found.category !== 'Boats') {
      selectedResourceId.set(null);
    } else if (layer === 'VEHICLES' && found.category !== 'Ground Vehicles') {
      selectedResourceId.set(null);
    } else if (
      layer === 'SUPPLIES' &&
      !['Medical Supplies', 'Food & Water', 'Temporary Shelters', 'Fuel & Energy'].includes(found.category)
    ) {
      selectedResourceId.set(null);
    } else if (layer === 'FACILITIES') {
      selectedResourceId.set(null);
    }
  }
}

// Set Resources Mode Tab (Clears or preserves selection based on relevance)
export function setResourcesMode(mode: ResourcesMode) {
  activeResourcesMode.set(mode);
  const currentId = get(selectedResourceId);
  if (currentId) {
    const items = get(allResources);
    const found = items.find((r) => r.id === currentId);
    if (!found) {
      selectedResourceId.set(null);
    } else if (
      mode === 'supplies' &&
      !['Medical Supplies', 'Food & Water', 'Temporary Shelters', 'Fuel & Energy'].includes(found.category)
    ) {
      selectedResourceId.set(null);
    } else if (
      mode === 'assets' &&
      !['Helicopters', 'Boats', 'Ground Vehicles', 'Communication Equipment', 'Search & Rescue Equipment'].includes(found.category)
    ) {
      selectedResourceId.set(null);
    } else if (mode === 'facilities' || mode === 'supply_chain' || mode === 'requests' || mode === 'personnel') {
      selectedResourceId.set(null);
    }
  }
}

// Select Resource & Sync Map
export function selectResource(resourceId: string) {
  selectedResourceId.set(resourceId);
  selectedFacilityId.set(null);
  selectedShipmentId.set(null);
  const items = get(allResources);
  const found = items.find((r) => r.id === resourceId);
  if (found) {
    resourceMapFocus.set({
      center: found.coords,
      zoom: 1.35,
      highlightId: resourceId
    });
  }
}

// Select Facility & Sync Map
export function selectFacility(facilityId: string) {
  selectedFacilityId.set(facilityId);
  selectedResourceId.set(null);
  selectedShipmentId.set(null);
  const facs = get(allFacilities);
  const found = facs.find((f) => f.id === facilityId);
  if (found) {
    resourceMapFocus.set({
      center: found.coords,
      zoom: 1.35,
      highlightId: facilityId
    });
  }
}

// Track Shipment on Map
export function trackShipment(shipmentId: string) {
  selectedShipmentId.set(shipmentId);
  selectedResourceId.set(null);
  selectedFacilityId.set(null);
  const ships = get(activeShipments);
  const found = ships.find((s) => s.id === shipmentId);
  if (found && found.path && found.path.length > 0) {
    const mid = found.path[Math.floor(found.path.length / 2)];
    resourceMapFocus.set({
      center: mid,
      zoom: 1.35,
      highlightId: shipmentId
    });
  }
}

// Deploy Resource Action
export function deployResource(
  resourceId: string,
  destination: string,
  operation: string,
  priority: string = 'HIGH'
) {
  let deployedItemName = '';
  allResources.update((items) =>
    items.map((r) => {
      if (r.id === resourceId) {
        deployedItemName = r.name;
        return {
          ...r,
          status: 'EN ROUTE',
          location: destination,
          assignedTo: operation,
          lastUpdated: 'Just now'
        };
      }
      return r;
    })
  );

  // Recalculate Metrics dynamically
  resourceMetrics.update((m) => {
    const nextAvailable = Math.max(0, m.available - 1);
    const nextDeployed = m.deployed + 1;
    const readiness = Math.round((nextAvailable / m.totalAssets) * 100);
    const utilization = Math.round((nextDeployed / m.totalAssets) * 100) + 15;
    return {
      ...m,
      available: nextAvailable,
      deployed: nextDeployed,
      readinessRate: readiness,
      utilizationRate: Math.min(100, utilization)
    };
  });

  addResourceAudit(
    `Deployed ${resourceId} (${deployedItemName}) to ${destination} for ${operation}`,
    'success'
  );
  isDeployModalOpen.set(false);
}

// Submit Inbound Resource Request
export function submitResourceRequest(data: {
  resourceType: string;
  category: ResourceCategory;
  quantity: number;
  requestedBy: string;
  destination: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  requiredBy: string;
  reason: string;
}) {
  const newReq: ResourceRequest = {
    id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
    resourceType: data.resourceType,
    category: data.category,
    quantity: data.quantity,
    requestedBy: data.requestedBy,
    destination: data.destination,
    priority: data.priority,
    status: 'PENDING',
    requiredBy: data.requiredBy,
    reason: data.reason,
    created: 'Just now'
  };

  resourceRequests.update((reqs) => [newReq, ...reqs]);
  resourceMetrics.update((m) => ({
    ...m,
    requested: m.requested + 1
  }));

  addResourceAudit(
    `Submitted request ${newReq.id} for ${data.quantity}x ${data.resourceType} at ${data.destination}`,
    'info'
  );
  isRequestModalOpen.set(false);
}

// Approve Resource Request
export function approveResourceRequest(requestId: string) {
  resourceRequests.update((reqs) =>
    reqs.map((r) => (r.id === requestId ? { ...r, status: 'APPROVED' } : r))
  );
  addResourceAudit(`Approved request ${requestId}`, 'success');
}

// Reject Resource Request with Reason
export function rejectResourceRequest(requestId: string, reason: string) {
  resourceRequests.update((reqs) =>
    reqs.map((r) =>
      r.id === requestId ? { ...r, status: 'REJECTED', rejectionReason: reason } : r
    )
  );
  resourceMetrics.update((m) => ({
    ...m,
    requested: Math.max(0, m.requested - 1)
  }));
  addResourceAudit(`Rejected request ${requestId}: ${reason}`, 'warning');
}

// Allocate to Request
export function allocateToRequest(requestId: string) {
  resourceRequests.update((reqs) =>
    reqs.map((r) => (r.id === requestId ? { ...r, status: 'ALLOCATED' } : r))
  );
  resourceMetrics.update((m) => ({
    ...m,
    requested: Math.max(0, m.requested - 1),
    deployed: m.deployed + 1,
    available: Math.max(0, m.available - 1)
  }));
  addResourceAudit(`Allocated resources to satisfy request ${requestId}`, 'success');
}

// Allocate Resources Directly
export function directAllocateResource(data: {
  resourceId: string;
  quantity: number;
  destination: string;
  operation: string;
}) {
  deployResource(data.resourceId, data.destination, data.operation, 'HIGH');
  isAllocateModalOpen.set(false);
}

// Focus Upcoming Operation
export function focusOperation(op: ResourceOperationItem) {
  resourceMapFocus.set({
    center: op.coords,
    zoom: 1.35,
    highlightId: op.id
  });
  selectResource(op.resourceId);
}

// Apply Optimization Recommendation
export function applyOptimizationRecommendation(item: {
  resourceId: string;
  destination: string;
  operation: string;
}) {
  deployResource(item.resourceId, item.destination, item.operation, 'HIGH');
  addResourceAudit(
    `Applied AI optimization recommendation for ${item.resourceId} to ${item.destination}`,
    'success'
  );
}

// Helper to record audit events
export function addResourceAudit(action: string, severity: 'info' | 'success' | 'warning' | 'critical' = 'info') {
  const now = new Date();
  const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')} UTC`;
  resourceAuditLog.update((logs) => [
    {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: timeStr,
      action,
      target: 'Resource Logistics Center',
      operator: 'COMMANDER',
      severity
    },
    ...logs.slice(0, 19)
  ]);
}
