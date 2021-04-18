<script lang="typescript">
  import { connect, reloadExtension, runAllegro } from "./popup";
  import { onMount } from "svelte";
  import type { WorkerState } from "./worker";

  let workerState: WorkerState | null = null;

  onMount(() => {
    connect((state) => {
      workerState = state;
    });
  });
</script>

<div class="App">
  <button on:click={reloadExtension}>Reload extension</button>
  <button on:click={runAllegro}>Run Allegro</button>
  {#if workerState?.offers}
    <ul>
      {#each workerState.offers as offer}
        <li>{offer.title} for {offer.price}</li>
      {/each}
    </ul>
  {/if}
</div>
