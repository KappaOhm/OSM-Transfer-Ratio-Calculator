// Get the modal
const modal = document.getElementById("instructionsModal");
// Get the button that opens the modal
const btn = document.getElementById("instructionsBtn");
// Get the <span> element that closes the modal
const span = document.getElementById("closeModal");

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const VALID_CODE = '1xyz';
    const CODE_VERSION = chrome.runtime.getManifest().version;  // For invalidating old codes
    
    // Load saved state but check version
    chrome.storage.sync.get(['premiumEnabled', 'codeVersion'], function(result) {
        if (result.codeVersion === CODE_VERSION) {
            document.getElementById('premiumFeatures').checked = result.premiumEnabled || false;
        } else {
            // Different version - reset premium status
            chrome.storage.sync.set({ 
                premiumEnabled: false,
                codeVersion: CODE_VERSION 
            });
            document.getElementById('premiumFeatures').checked = false;
        }
    });

    document.getElementById('validateCode').addEventListener('click', function() {
        const code = document.getElementById('activationCode').value.trim();
        if (code === VALID_CODE) {
            document.getElementById('premiumFeatures').checked = true;
            chrome.storage.sync.set({ 
                premiumEnabled: true,
                codeVersion: CODE_VERSION 
            });
            alert('Premium features activated!');
        } else {
            alert('Invalid code');
        }
    });
});