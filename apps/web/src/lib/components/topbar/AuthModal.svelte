<script lang="ts">
  import { onMount } from 'svelte';
  import { authError, authLoading, authUser, hydrateAuth, login, logout, register, rememberedEmail } from '../../stores/authStore';

  export let open = false;
  let mode: 'login' | 'register' = 'login';
  let email = '';
  let password = '';
  let confirmPassword = '';

  onMount(() => {
    email = rememberedEmail();
    hydrateAuth();
  });

  function switchMode(nextMode: 'login' | 'register') {
    mode = nextMode;
    email = nextMode === 'login' ? rememberedEmail() : '';
    password = '';
    confirmPassword = '';
    authError.set('');
  }

  async function continueSession() {
    await hydrateAuth();
    if ($authUser) open = false;
    else authError.set('Your saved session expired. Enter your password to sign in again.');
  }

  async function submit() {
    if (mode === 'register' && password !== confirmPassword) {
      authError.set('Passwords do not match');
      return;
    }
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
      password = '';
      confirmPassword = '';
      open = false;
    } catch {
      // The store exposes the safe, server-provided error message.
    }
  }
</script>

{#if open}
  <div class="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" on:click={(event) => event.target === event.currentTarget && (open = false)}>
    <div class="w-full max-w-sm rounded-2xl border border-[#00E5FF]/30 bg-[#061425] p-5 font-mono shadow-[0_12px_50px_rgba(0,0,0,.7)]" role="dialog" aria-modal="true" aria-label="AXIS account access">
      <div class="mb-4 flex items-start justify-between">
        <div>
          <div class="text-[10px] font-bold uppercase tracking-[.18em] text-[#00E5FF]">AXIS ACCESS</div>
          <h2 class="mt-1 text-lg font-bold text-white">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
          <p class="mt-1 text-[10px] text-[#8BA1B8]">Your password is hashed on the server and never stored in the browser.</p>
        </div>
        <button class="text-xl text-[#8BA1B8] hover:text-white" on:click={() => (open = false)} aria-label="Close">×</button>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-black/30 p-1">
        <button class="rounded-md py-2 text-[10px] font-bold uppercase {mode === 'login' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'text-[#8BA1B8]'}" on:click={() => switchMode('login')}>Sign in</button>
        <button class="rounded-md py-2 text-[10px] font-bold uppercase {mode === 'register' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'text-[#8BA1B8]'}" on:click={() => switchMode('register')}>Register</button>
      </div>

      {#if mode === 'login' && email}
        <button type="button" on:click={continueSession} class="mb-3 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20">
          Continue as {email}
        </button>
      {/if}

      <form class="space-y-3" on:submit|preventDefault={submit}>
        <label class="block text-[10px] uppercase tracking-wider text-[#8BA1B8]">Email
          <input bind:value={email} type="email" required autocomplete="email" class="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#00E5FF]" />
        </label>
        <label class="block text-[10px] uppercase tracking-wider text-[#8BA1B8]">Password
          <input bind:value={password} type="password" required minlength="8" autocomplete={mode === 'login' ? 'current-password' : 'new-password'} class="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#00E5FF]" />
        </label>
        {#if mode === 'register'}
          <label class="block text-[10px] uppercase tracking-wider text-[#8BA1B8]">Confirm password
            <input bind:value={confirmPassword} type="password" required minlength="8" autocomplete="new-password" class="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#00E5FF]" />
          </label>
        {/if}
        {#if $authError}<div class="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-[10px] text-red-300">{$authError}</div>{/if}
        <button disabled={$authLoading} class="w-full rounded-lg border border-[#00E5FF]/50 bg-[#00E5FF]/15 py-2.5 text-xs font-bold uppercase tracking-wider text-[#00E5FF] hover:bg-[#00E5FF]/25 disabled:opacity-50">{$authLoading ? 'Working…' : mode === 'login' ? 'Sign in' : 'Register'}</button>
      </form>
    </div>
  </div>
{/if}

{#if $authUser}
  <div class="fixed bottom-4 right-4 z-[70] flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#061425]/95 px-3 py-2 font-mono text-[10px] text-emerald-300 shadow-lg">
    <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
    <span class="max-w-[180px] truncate">{$authUser.email}</span>
    <button class="text-[#8BA1B8] hover:text-white" on:click={logout}>Sign out</button>
  </div>
{/if}
