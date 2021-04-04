(() => {
  const price = document.querySelector(".price");
  chrome.runtime.sendMessage({ price: price?.textContent });
})();
