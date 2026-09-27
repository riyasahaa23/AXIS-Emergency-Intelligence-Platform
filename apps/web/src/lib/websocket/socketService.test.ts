import { describe, it, expect, vi } from 'vitest';
import { socketService } from './socketService';
import { get } from 'svelte/store';

describe('socketService', () => {
  it('initializes with a valid status store', () => {
    const status = get(socketService.status);
    expect(['DISCONNECTED', 'CONNECTING', 'CONNECTED', 'FALLBACK_SIMULATION']).toContain(status);
  });

  it('allows subscription and unsubscription of packet handlers', () => {
    const handler = vi.fn();
    const unsubscribe = socketService.subscribe(handler);

    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('handles destroy without throwing errors', () => {
    expect(() => {
      socketService.destroy();
    }).not.toThrow();

    expect(get(socketService.status)).toBe('DISCONNECTED');
  });
});
