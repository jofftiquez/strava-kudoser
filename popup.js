document.getElementById('settingsForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const settings = {
    clickTimeout: document.getElementById('clickTimeout').value,
    retryTimeout: document.getElementById('retryTimeout').value,
    maxRetries: document.getElementById('maxRetries').value,
    jitter: document.getElementById('jitter').value
  };
  
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: startKudosClicker,
      args: [settings]
    }, function() {
      window.close(); // Close the popup after executing the script
    });
  });
});

function startKudosClicker(settings) {
  (async function() {
    const clickTimeout = parseInt(settings.clickTimeout);
    const retryTimeout = parseInt(settings.retryTimeout);
    const maxRetries = parseInt(settings.maxRetries);
    const jitter = parseInt(settings.jitter);

    const kudosButtonsSelector = 'button[title="Give kudos"], button[title="Be the first to give kudos!"]';

    function getRandomTimeout(base, jitter) {
      return base + Math.random() * jitter;
    }

    async function clickKudos() {
      let buttons = Array.from(document.querySelectorAll(kudosButtonsSelector));
      console.warn(`Number of kudos: ${buttons.length}`);

      if (buttons.length === 0) {
        console.warn("No kudos found. Stopping.");
        alert("No kudos found. Stopping.");
        return;
      }
      
      let retries = 0;
      let index = 0;
      let seenButtons = new Set(buttons.map(btn => btn));

      while (retries < maxRetries) {
        if (index < buttons.length) {
          try {
            buttons[index].scrollIntoView({ behavior: "smooth", block: "center" });
            const timeout = getRandomTimeout(clickTimeout, jitter);
            await new Promise(resolve => setTimeout(resolve, timeout));
            buttons[index].click();
            console.warn(`Kudos ${index + 1} took ${timeout}ms`);
          } catch (error) {
            console.error(`Error kudos ${index + 1}:`, error);
          }
          index++;
        } else {
          window.scrollBy(0, window.innerHeight);
          await new Promise(resolve => setTimeout(resolve, retryTimeout));
          let newButtons = Array.from(document.querySelectorAll(kudosButtonsSelector));
          newButtons.forEach(btn => {
            if (!seenButtons.has(btn)) {
              buttons.push(btn);
              seenButtons.add(btn);
            }
          });
          console.warn(`Retrying... Number of kudos: ${buttons.length}`);
          if (buttons.length === index) { // no new buttons found
            retries++;
          } else {
            retries = 0; // Reset retries if new buttons are found
          }
        }
      }
      console.warn("Reached retry limit. Stopping.");
      alert("Reached retry limit. Stopping.");
    }

    await clickKudos();
  })();
}
