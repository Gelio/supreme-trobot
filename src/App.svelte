<script lang="typescript">
  import { reloadExtension, runAllegro } from "./popup";
  import type { OffersPage } from "./marketplaces/common/messaging";

  let offers: OffersPage | null = null;

  async function openAndRunAllegro() {
    runAllegro().then((offersPage) => {
      offers = offersPage;
    });
  }
</script>

<div class="App">
  <button on:click={reloadExtension}>Reload extension</button>
  <button on:click={openAndRunAllegro}>Run Allegro</button>
  {#if offers}{JSON.stringify(offers, null, 2)}{/if}
</div>
