<script lang="typescript">
  function reloadExtension() {
    chrome.runtime.reload();
  }

  async function runAllegro() {
    const activeTab = (
      await chrome.tabs.query({ active: true, currentWindow: true })
    )[0];
    console.log(activeTab);
    chrome.runtime.onMessage.addListener((message: any) => {
      console.log(message);
    });
    chrome.tabs.sendMessage(activeTab.id!, "offers");
  }
</script>

<div class="App">
  <button on:click={reloadExtension}>Reload extension</button>
  <button on:click={runAllegro}>Run Allegro</button>
</div>
