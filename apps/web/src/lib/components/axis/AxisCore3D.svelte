<script lang="ts">
  import AxisCoreWebGL from './AxisCoreWebGL.svelte';

  export let size: 'sm' | 'md' | 'lg' = 'lg';
  export let interactive: boolean = true;
  export let animateActivation: boolean = true;
</script>

<AxisCoreWebGL {size} {interactive} {animateActivation} />