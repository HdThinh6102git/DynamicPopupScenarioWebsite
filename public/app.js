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

      // Re-enable custom buttons
      const btn01 = document.getElementById('btn-custom-01');
      const btn02 = document.getElementById('btn-custom-02');
      const btn03 = document.getElementById('btn-custom-03');
      const btn04 = document.getElementById('btn-custom-04');
      if (btn01) btn01.disabled = false;
      if (btn02) btn02.disabled = false;
      if (btn03) btn03.disabled = false;
      if (btn04) btn04.disabled = false;
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
const btnCustom03 = document.getElementById('btn-custom-03');
const btnCustom04 = document.getElementById('btn-custom-04');
const btnLogout = document.getElementById('btn-logout');

if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });
}

if (btnCustom01) {
  btnCustom01.addEventListener('click', () => {
    showCustomPopup('This is click 01');
    if (btnCustom02) btnCustom02.disabled = true;
    if (btnCustom03) btnCustom03.disabled = true;
    if (btnCustom04) btnCustom04.disabled = true;
    console.log('All other buttons disabled.');
  });
}

if (btnCustom02) {
  btnCustom02.addEventListener('click', () => {
    showCustomPopup('This is click 02');
    if (btnCustom01) btnCustom01.disabled = true;
    if (btnCustom03) btnCustom03.disabled = true;
    if (btnCustom04) btnCustom04.disabled = true;
    console.log('All other buttons disabled.');
  });
}

if (btnCustom03) {
  btnCustom03.addEventListener('click', () => {
    // Open popup1 with real URL
    const popup1 = window.open('popup1.html', 'popup1', 'width=400,height=320,top=150,left=150');
    // Open popup2 with real URL, slightly offset so they overlap
    const popup2 = window.open('popup2.html', 'popup2', 'width=400,height=320,top=190,left=190');

    if (btnCustom01) btnCustom01.disabled = true;
    if (btnCustom02) btnCustom02.disabled = true;
    if (btnCustom03) btnCustom03.disabled = true;
    if (btnCustom04) btnCustom04.disabled = true;
    console.log('All buttons disabled while popups are open.');

    // Monitor closure of both popups
    const checkPopupTimer = setInterval(() => {
      const isClosed1 = !popup1 || popup1.closed;
      const isClosed2 = !popup2 || popup2.closed;

      if (isClosed1 && isClosed2) {
        clearInterval(checkPopupTimer);
        if (btnCustom01) btnCustom01.disabled = false;
        if (btnCustom02) btnCustom02.disabled = false;
        if (btnCustom03) btnCustom03.disabled = false;
        if (btnCustom04) btnCustom04.disabled = false;
        console.log('Both popups are closed. All buttons are now enabled.');
      }
    }, 500);
  });
}

if (btnCustom04) {
  btnCustom04.addEventListener('click', () => {
    showSuccessPopup('Congratulations! Scenario completed successfully!');
    if (btnCustom01) btnCustom01.disabled = true;
    if (btnCustom02) btnCustom02.disabled = true;
    if (btnCustom03) btnCustom03.disabled = true;
    console.log('All other buttons disabled.');
  });
}

// Success Congratulatory Popup Function
function showSuccessPopup(message) {
  const uniqueId = `success-popup-${Date.now()}`;
  activePopupsCount++;

  const popupModal = document.createElement('div');
  popupModal.className = `popup-modal popup-newsletter`;
  popupModal.id = uniqueId;
  popupModal.style.zIndex = 3000 + activePopupsCount;
  popupModal.style.top = '50%';
  popupModal.style.left = '50%';
  popupModal.style.transform = 'translate(-50%, -50%)';

  const closeButton = document.createElement('button');
  closeButton.className = 'close-x';
  closeButton.innerHTML = '&times;';
  closeButton.id = `btn-close-x-${uniqueId}`;
  closeButton.onclick = () => removePopupModal(uniqueId);

  const popupInnerContent = `
    <h3 style="color: #10b981; margin-top: 0;">🎉 Congratulations!</h3>
    <p class="body" style="font-size: 1.1rem; color: #f3f4f6; margin-bottom: 1.5rem;">${message}</p>
    <button class="btn btn-primary" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 100%; border: none; padding: 0.75rem;" onclick="removePopupModal('${uniqueId}')">Dismiss</button>
  `;

  popupModal.appendChild(closeButton);
  popupModal.insertAdjacentHTML('beforeend', popupInnerContent);
  popupOverlay.appendChild(popupModal);
  popupOverlay.classList.remove('hidden');

  // Automatically close after 3 seconds
  setTimeout(() => {
    removePopupModal(uniqueId);
  }, 3000);
}

// Auto initialize and run scenario on load
window.addEventListener('DOMContentLoaded', async () => {
  await fetchConfig();
  displayPopupsScenario();
});
