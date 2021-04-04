<script lang="typescript">
  function reloadExtension() {
    chrome.runtime.reload();
  }

  async function runAllegro() {
    const activeTab = (
      await chrome.tabs.query({ active: true, currentWindow: true })
    )[0];
    chrome.scripting.executeScript({
      files: ["./dist/marketplaces/allegro/index.js"],
      target: { tabId: activeTab.id! },
    });
    chrome.runtime.onMessage.addListener((message: any) => {
      console.log(message);
    });
  }
</script>

<div class="App">
  <button on:click={reloadExtension}>Reload extension</button>
  <button on:click={runAllegro}>Run Allegro</button>
</div>
