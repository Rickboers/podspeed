let isEnabled = true;

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleButton');
    const wpsSlider = document.getElementById('wpsSlider');
    const wpsValue = document.getElementById('wpsValue');

    chrome.storage.sync.get(['isEnabled', 'targetWPS'], function (data) {
        isEnabled = data.isEnabled !== false;
        updateButtonText();

        if (data.targetWPS) {
            wpsSlider.value = data.targetWPS;
            wpsValue.textContent = data.targetWPS;
        }
    });

    toggleButton.addEventListener('click', function () {
        isEnabled = !isEnabled;
        chrome.storage.sync.set({ isEnabled: isEnabled });
        updateButtonText();
        sendMessageToContentScript();
    });

    wpsSlider.addEventListener('input', function () {
        wpsValue.textContent = this.value;
    });

    wpsSlider.addEventListener('change', function () {
        chrome.storage.sync.set({ targetWPS: parseFloat(this.value) });
        if (isEnabled) {
            sendMessageToContentScript();
        }
    });

    function updateButtonText() {
        toggleButton.textContent = isEnabled ? 'Turn Off' : 'Turn On';
    }

    function sendMessageToContentScript() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "update",
                isEnabled: isEnabled,
                targetWPS: parseFloat(wpsSlider.value)
            });
        });
    }
});