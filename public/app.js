// app.js - Supporting sequential and simultaneous multi-popup testing
let popupData = []; // array of { type, count }
let activePopupsCount = 0;
let displayMode = 'cascade'; // or 'overlap'

const countDisplay = document.getElementById('popup-count-display');
const typeDisplay = document.getElementById('popup-type-display');
const btnRefresh = document.getElementById('btn-refresh');
const btnTrigger = document.getElementById('btn-trigger');
const popupOverlay = document.getElementById('popup-overlay');

// Fetch the configuration from the backend Express API
async function fetchConfig() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Network error fetching config');
    const data = await response.json();

    displayMode = data.display_mode || 'cascade';
    popupData = [];

    // Support new 'popups' array format for multiple popups at the same time
    if (Array.isArray(data.popups)) {
      popupData = data.popups.map(p => ({
        type: p.type || 'promotional',
        count: p.count ?? 1
      }));
    } else {
      // Backwards compatibility with the single popup config
      popupData = [{
        type: data.popup_type || 'promotional',
        count: data.popup_count ?? 1
      }];
    }


    // Update the UI meta counters for transparency
    const totalPopups = popupData.reduce((acc, curr) => acc + curr.count, 0);
    const popupTypes = popupData.map(p => p.type).join(', ');

    countDisplay.textContent = totalPopups;
    countDisplay.classList.remove('loading');

    typeDisplay.textContent = popupTypes.toUpperCase();
    typeDisplay.classList.remove('loading');

    console.log(`Loaded config successfully: Total = ${totalPopups}, Types = ${popupTypes}`);
  } catch (error) {
    console.error('Error fetching config:', error);
    countDisplay.textContent = 'Error';
    typeDisplay.textContent = 'Error';
  }
}

// Render popups side by side if configured
function displayPopupsScenario() {
  popupOverlay.innerHTML = '';
  activePopupsCount = 0;

  if (popupData.length === 0) {
    popupOverlay.classList.add('hidden');
    return;
  }

  // Iterate over popup types specified in config and construct their modals
  popupData.forEach((popupConfig, index) => {
    for (let c = 0; c < popupConfig.count; c++) {
      activePopupsCount++;
      const uniqueId = `popup-item-${index}-${c}`;

      const popupModal = document.createElement('div');
      popupModal.className = `popup-modal popup-${popupConfig.type}`;
      popupModal.id = uniqueId;
      popupModal.style.zIndex = 1000 + activePopupsCount;
      if (displayMode === 'cascade') {
        popupModal.style.top = `calc(50% + ${(activePopupsCount - 1) * 15}px)`;
        popupModal.style.left = `calc(50% + ${(activePopupsCount - 1) * 15}px)`;
      } else {
        popupModal.style.top = '50%';
        popupModal.style.left = '50%';
      }
      popupModal.style.transform = 'translate(-50%, -50%)';


      const closeButton = document.createElement('button');

      closeButton.className = 'close-x';
      closeButton.innerHTML = '&times;';
      closeButton.id = `btn-close-x-${uniqueId}`;
      closeButton.onclick = () => removePopupModal(uniqueId);

      const titleSuffix = popupConfig.count > 1 ? ` #${c + 1}` : '';

      let popupInnerContent = '';
      switch (popupConfig.type) {
        case 'promotional':
          popupInnerContent = `
            <h3>Special Offer!${titleSuffix}</h3>
            <p class="body">Get a 25% limited time discount. Apply this special voucher at checkout.</p>
            <button class="btn btn-primary" onclick="removePopupModal('${uniqueId}')">Claim Discount</button>
          `;
          break;

        case 'newsletter':
          popupInnerContent = `
            <h3>Subscribe!${titleSuffix}</h3>
            <p class="body">Enter your email below to subscribe to our guides.</p>
            <input type="email" id="input-email-${uniqueId}" placeholder="Enter your email" />
            <button class="btn btn-primary" onclick="removePopupModal('${uniqueId}')">Subscribe</button>
          `;
          break;

        case 'notification':
          popupInnerContent = `
            <h3>Maintenance!${titleSuffix}</h3>
            <p class="body">Scheduled system updates starting at 10 PM. Thanks for your patience.</p>
            <button class="btn btn-primary" onclick="removePopupModal('${uniqueId}')">I Understand</button>
          `;
          break;

        case 'cookie':
          popupInnerContent = `
            <h3>Your Privacy${titleSuffix}</h3>
            <p class="body">We use functional cookies to enrich your experience.</p>
            <button class="btn btn-primary" onclick="removePopupModal('${uniqueId}')">Accept All</button>
          `;
          break;

        case 'survey':
          popupInnerContent = `
            <h3>Feedback${titleSuffix}</h3>
            <p class="body">Rate our automation testing services on a scale of 1 to 5.</p>
            <div class="survey-stars">
              <span onclick="removePopupModal('${uniqueId}')">★</span>
              <span onclick="removePopupModal('${uniqueId}')">★</span>
              <span onclick="removePopupModal('${uniqueId}')">★</span>
              <span onclick="removePopupModal('${uniqueId}')">★</span>
              <span onclick="removePopupModal('${uniqueId}')">★</span>
            </div>
          `;
          break;

        default:
          popupInnerContent = `
            <h3>Generic Popup${titleSuffix}</h3>
            <p class="body">Generic popup contents for testing.</p>
            <button class="btn btn-primary" onclick="removePopupModal('${uniqueId}')">Dismiss</button>
          `;
      }


      popupModal.appendChild(closeButton);
      popupModal.insertAdjacentHTML('beforeend', popupInnerContent);
      popupOverlay.appendChild(popupModal);
    }
  });

  if (activePopupsCount > 0) {
    popupOverlay.classList.remove('hidden');
  } else {
    popupOverlay.classList.add('hidden');
  }
}

// Handle removing individual modals
function removePopupModal(popupId) {
  const popupElement = document.getElementById(popupId);
  if (popupElement) {
    popupElement.remove();
    activePopupsCount--;
    console.log(`Removed popup: ${popupId}. Remaining: ${activePopupsCount}`);

    // If there are no more active popups, hide the dark overlay
    if (activePopupsCount <= 0) {
      popupOverlay.classList.add('hidden');
      console.log('All visible popups have been successfully dismissed.');
    }
  }
}

// Expose the function to the global scope
window.removePopupModal = removePopupModal;

// Custom Popup Function
function showCustomPopup(message) {
  const uniqueId = `custom-popup-${Date.now()}`;
  activePopupsCount++;

  const popupModal = document.createElement('div');
  popupModal.className = `popup-modal popup-notification`;
  popupModal.id = uniqueId;
  popupModal.style.zIndex = 2000 + activePopupsCount;
  popupModal.style.top = '50%';
  popupModal.style.left = '50%';
  popupModal.style.transform = 'translate(-50%, -50%)';

  const closeButton = document.createElement('button');
  closeButton.className = 'close-x';
  closeButton.innerHTML = '&times;';
  closeButton.id = `btn-close-x-${uniqueId}`;
  closeButton.onclick = () => removePopupModal(uniqueId);

  const popupInnerContent = `
    <h3>Action Triggered</h3>
    <p class="body">${message}</p>
    <button class="btn btn-primary" onclick="removePopupModal('${uniqueId}')">Dismiss</button>
  `;

  popupModal.appendChild(closeButton);
  popupModal.insertAdjacentHTML('beforeend', popupInnerContent);
  popupOverlay.appendChild(popupModal);
  popupOverlay.classList.remove('hidden');
}

// Event listeners
btnRefresh.addEventListener('click', async () => {
  await fetchConfig();
  displayPopupsScenario();
});


btnTrigger.addEventListener('click', async () => {
  await fetchConfig();
  displayPopupsScenario();
});

// Custom Button Listeners
const btnCustom01 = document.getElementById('btn-custom-01');
const btnCustom02 = document.getElementById('btn-custom-02');

if (btnCustom01) {
  btnCustom01.addEventListener('click', () => {
    showCustomPopup('This is click 01');
  });
}

if (btnCustom02) {
  btnCustom02.addEventListener('click', () => {
    showCustomPopup('This is click 02');
  });
}

// Auto initialize and run scenario on load
window.addEventListener('DOMContentLoaded', async () => {
  await fetchConfig();
  displayPopupsScenario();
});
