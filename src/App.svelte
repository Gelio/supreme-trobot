<script lang="typescript">
  function reloadExtension() {
    chrome.runtime.reload();
  }

  async function runAllegro() {
    const activeTab = (
      await chrome.tabs.query({ active: true, currentWindow: true })
    )[0];
    console.log(activeTab);
    const port = chrome.tabs.connect(activeTab.id!);
    port.onMessage.addListener((message: any) => {
      console.log(message);
    });
    port.postMessage("offers");
  }
</script>

<div class="App">
  <button on:click={reloadExtension}>Reload extension</button>
  <button on:click={runAllegro}>Run Allegro</button>
</div>
