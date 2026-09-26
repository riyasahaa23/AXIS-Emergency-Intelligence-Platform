import { writable } from 'svelte/store';
import { globeFocusTarget } from './incidentStore';

export type PipelineStage = 
  | 'IDLE'
  | 'UNDERSTANDING REQUEST'
  | 'IDENTIFYING LOCATION'
  | 'LOADING INCIDENT STATE'
  | 'RUNNING ANALYSIS'
  | 'CALCULATING IMPACT'
  | 'VERIFYING RESULT'
  | 'COMPLETE';

export type JarvisActivityState = 
  | 'IDLE' 
  | 'LISTENING' 
  | 'THINKING' 
  | 'ANALYSING' 
  | 'SIMULATING' 
  | 'RESPONDING';

export const currentCommand = writable<string>('');
export const isProcessingCommand = writable<boolean>(false);
export const activeStage = writable<PipelineStage>('IDLE');
export const stageProgress = writable<number>(0);

// Central JARVIS Mode states
export const isJarvisCentralActive = writable<boolean>(false);
export const jarvisState = writable<JarvisActivityState>('IDLE');
export const jarvisResponseText = writable<string>('');

export function openJarvisCentral(initialState: JarvisActivityState = 'IDLE') {
  isJarvisCentralActive.set(true);
  jarvisState.set(initialState);
}

export function closeJarvisCentral() {
  isJarvisCentralActive.set(false);
  jarvisState.set('IDLE');
}

const STAGES: { stage: PipelineStage; jarvis: JarvisActivityState; delay: number }[] = [
  { stage: 'UNDERSTANDING REQUEST', jarvis: 'LISTENING', delay: 400 },
  { stage: 'IDENTIFYING LOCATION', jarvis: 'THINKING', delay: 450 },
  { stage: 'LOADING INCIDENT STATE', jarvis: 'ANALYSING', delay: 500 },
  { stage: 'RUNNING ANALYSIS', jarvis: 'ANALYSING', delay: 550 },
  { stage: 'CALCULATING IMPACT', jarvis: 'SIMULATING', delay: 600 },
  { stage: 'VERIFYING RESULT', jarvis: 'SIMULATING', delay: 450 },
  { stage: 'COMPLETE', jarvis: 'RESPONDING', delay: 500 }
];

export async function submitCommand(promptText: string) {
  if (!promptText.trim()) return;
  currentCommand.set(promptText);
  isProcessingCommand.set(true);

  const lower = promptText.toLowerCase();

  // If central mode is open, sync JARVIS state
  for (let i = 0; i < STAGES.length; i++) {
    const item = STAGES[i];
    activeStage.set(item.stage);
    jarvisState.set(item.jarvis);
    stageProgress.set(Math.round(((i + 1) / STAGES.length) * 100));

    // When identifying location, smoothly transition Earth camera
    if (item.stage === 'IDENTIFYING LOCATION') {
      if (lower.includes('chennai') || lower.includes('bay of bengal') || lower.includes('odisha') || lower.includes('phailin')) {
        globeFocusTarget.set({ lat: 13.08, lng: 80.27, zoom: 1.35, duration: 1.5 });
      } else if (lower.includes('bangladesh') || lower.includes('dhaka') || lower.includes('sylhet') || lower.includes('flood')) {
        globeFocusTarget.set({ lat: 23.68, lng: 90.35, zoom: 1.35, duration: 1.5 });
      } else if (lower.includes('guam') || lower.includes('mawar') || lower.includes('pacific')) {
        globeFocusTarget.set({ lat: 13.44, lng: 144.79, zoom: 1.35, duration: 1.5 });
      } else if (lower.includes('canada') || lower.includes('wildfire') || lower.includes('alberta')) {
        globeFocusTarget.set({ lat: 54.1, lng: -116.8, zoom: 1.35, duration: 1.5 });
      } else if (lower.includes('malacca') || lower.includes('port')) {
        globeFocusTarget.set({ lat: 2.2, lng: 102.25, zoom: 1.35, duration: 1.5 });
      }
    }

    await new Promise((r) => setTimeout(r, item.delay));
  }

  jarvisResponseText.set(`Analysis complete for: "${promptText}". Multi-signal risk fusion verified. Geospatial impact propagation projected.`);

  setTimeout(() => {
    isProcessingCommand.set(false);
  }, 1200);
}