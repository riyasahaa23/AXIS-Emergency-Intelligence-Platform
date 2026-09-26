<script lang="ts">
  import JarvisCoreWebGL from './JarvisCoreWebGL.svelte';

  export let size: 'sm' | 'md' | 'lg' = 'lg';
  export let interactive: boolean = true;
  export let animateActivation: boolean = true;
</script>

<JarvisCoreWebGL {size} {interactive} {animateActivation} />