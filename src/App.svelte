<script lang="ts">
  import { changePrice, connect, reloadExtension, scanAllegro } from "./popup";
  import { onMount } from "svelte";
  import type { WorkerState } from "./worker";
  import type { Offer } from "./marketplaces/common/messaging";

  let workerState: WorkerState | null = null;
  const isExtensionPage = window.location.search.includes("fullpage");
  const extensionPageUrl = chrome.runtime.getURL("index.html?fullpage");

  onMount(() => {
    connect((state) => {
      workerState = state;
    });
  });

  const changeOfferPrice = (offer: Offer) =>
    changePrice(offer, offer.price, isExtensionPage);
</script>

<div class="App">
  <button on:click={reloadExtension}>Reload extension</button>
  {#if !isExtensionPage}
    <div>
      <a href={extensionPageUrl} target="_blank" rel="noreferrer noopener"
        >Open extension page</a
      >
    </div>
  {/if}
  <p>Worker status: {workerState?.status.type}</p>
  <button on:click={() => scanAllegro(isExtensionPage)}>Scan Allegro</button>

  {#if workerState?.offers}
    <ul>
      {#each workerState.offers as offer (offer.url)}
        <li>
          <p>{offer.title} for {offer.price}</p>
          <!-- Unsafe mutation of the offers array. TODO: use local state for the input -->

          <input bind:value={offer.price} />
          <button on:click={() => changeOfferPrice(offer)}>Change price</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
