/**
 * AXIS Emergency Response API Service
 * 
 * Fetches real tactical response plans, team deployments, and priority matrix from backend,
 * falling back to structured emergency response packages.
 */

import { apiFetch } from './client';
import { responseDatabase, floodResponseData, type HazardResponsePackage } from '../mock/response/responseDatabase';

export async function fetchResponsePackage(hazard: string): Promise<HazardResponsePackage> {
  return apiFetch<HazardResponsePackage>(
    `/api/response/${hazard}`,
    () => responseDatabase[hazard] || floodResponseData
  );
}

export async function fetchAllResponses(): Promise<Record<string, HazardResponsePackage>> {
  return apiFetch<Record<string, HazardResponsePackage>>(
    '/api/response',
    responseDatabase
  );
}
