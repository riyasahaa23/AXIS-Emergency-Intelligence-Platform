/**
 * AXIS Resources API Service
 * 
 * Fetches real resource inventory, fleet telemetry and forward base status from backend,
 * falling back to structured tactical resource datasets.
 */

import { apiFetch } from './client';
import { resourceDatabase, floodResourceData, type HazardResourcePackage } from '../mock/resources/resourceDatabase';

export async function fetchResourcePackage(hazard: string): Promise<HazardResourcePackage> {
  return apiFetch<HazardResourcePackage>(
    `/api/resources/${hazard}`,
    () => resourceDatabase[hazard] || floodResourceData
  );
}

export async function fetchAllResources(): Promise<Record<string, HazardResourcePackage>> {
  return apiFetch<Record<string, HazardResourcePackage>>(
    '/api/resources',
    resourceDatabase
  );
}
