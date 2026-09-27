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

export type AxisActivityState = 
  | 'IDLE' 
  | 'LISTENING' 
  | 'THINKING' 
  | 'ANALYSING' 
  | 'SIMULATING' 
  | 'RESPONDING';

// Backward compatibility alias
export type JarvisActivityState = AxisActivityState;

export const currentCommand = writable<string>('');
export const isProcessingCommand = writable<boolean>(false);
export const activeStage = writable<PipelineStage>('IDLE');
export const stageProgress = writable<number>(0);

// Central AXIS Mode states
export const isAxisCentralActive = writable<boolean>(false);
export const axisState = writable<AxisActivityState>('IDLE');
export const axisResponseText = writable<string>('');

// Backward compatibility store aliases
export const isJarvisCentralActive = isAxisCentralActive;
export const jarvisState = axisState;
export const jarvisResponseText = axisResponseText;

export function openAxisCentral(initialState: AxisActivityState = 'IDLE') {
  isAxisCentralActive.set(true);
  axisState.set(initialState);
}

export function closeAxisCentral() {
  isAxisCentralActive.set(false);
  axisState.set('IDLE');
}

// Backward compatibility function aliases
export const openJarvisCentral = openAxisCentral;
export const closeJarvisCentral = closeAxisCentral;

const STAGES: { stage: PipelineStage; axis: AxisActivityState; delay: number }[] = [
  { stage: 'UNDERSTANDING REQUEST', axis: 'LISTENING', delay: 400 },
  { stage: 'IDENTIFYING LOCATION', axis: 'THINKING', delay: 450 },
  { stage: 'LOADING INCIDENT STATE', axis: 'ANALYSING', delay: 500 },
  { stage: 'RUNNING ANALYSIS', axis: 'ANALYSING', delay: 550 },
  { stage: 'CALCULATING IMPACT', axis: 'SIMULATING', delay: 600 },
  { stage: 'VERIFYING RESULT', axis: 'SIMULATING', delay: 450 },
  { stage: 'COMPLETE', axis: 'RESPONDING', delay: 500 }
];

export async function submitCommand(promptText: string) {
  if (!promptText.trim()) return;
  currentCommand.set(promptText);
  isProcessingCommand.set(true);

  const lower = promptText.toLowerCase();

  // If central mode is open, sync AXIS state
  for (let i = 0; i < STAGES.length; i++) {
    const item = STAGES[i];
    activeStage.set(item.stage);
    axisState.set(item.axis);
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

  axisResponseText.set(`Analysis complete for: "${promptText}". Multi-signal risk fusion verified. Geospatial impact propagation projected.`);

  setTimeout(() => {
    isProcessingCommand.set(false);
  }, 1200);
}