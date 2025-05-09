// events.js - Sets up all event listeners for the application

import { showMainSection } from './ui.js';
import { initiateRegistration, verifyOtp, handleDeviceTrust } from './signup.js';
import { handleLogin, handleNewDeviceVerification, handleLogout } from './signin.js';


/**
 * Sets up all event listeners for the application
 * @param {Object} uiElements - UI element references
 * @param {Object} authSystem - Authentication system instance
 */
export function setupEventListeners(uiElements, authSystem) {
    // Back to signin link
    if (uiElements.backToSigninLink) {
        uiElements.backToSigninLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.logClient("User clicked: Back to Sign In");
            showMainSection('signinFlow', uiElements);
        });
    } else {
        console.warn("Back to Sign In link not found in the DOM");
    }

    // === Sign Up Flow Logic ===
    if (uiElements.checkAvailabilityButton) {
        uiElements.checkAvailabilityButton.addEventListener('click', () => {
            initiateRegistration(uiElements, authSystem);
        });
    }

    if (uiElements.verifyOtpButtonSignup) {
        uiElements.verifyOtpButtonSignup.addEventListener('click', () => {
            verifyOtp(uiElements, authSystem);
        });
    }

    if (uiElements.trustDeviceYesButton) {
        uiElements.trustDeviceYesButton.addEventListener('click', () => {
            handleDeviceTrust(true, uiElements, authSystem);
        });
    }

    if (uiElements.trustDeviceNoButton) {
        uiElements.trustDeviceNoButton.addEventListener('click', () => {
            handleDeviceTrust(false, uiElements, authSystem);
        });
    }
    // — Register link on Sign-In screen —
    if (uiElements.showSignupFromSigninButton) {
        uiElements.showSignupFromSigninButton.addEventListener('click', () => {
            window.logClient("User selected: Register from Sign-In");
            // Swap over to the Sign-Up flow
            showMainSection('signupFlow', uiElements);
            // (Optionally pre-fill the email they entered)
            if (uiElements.signupEmailInput && uiElements.signinEmailInput) {
                uiElements.signupEmailInput.value = uiElements.signinEmailInput.value.trim();
            }
            if (uiElements.signupOtpInput) uiElements.signupOtpInput.value = '';
        });
    } else {
        console.warn("Register-from-SignIn button not found in the DOM");
    }
    if (uiElements.handleLoginButton) {
        uiElements.handleLoginButton.addEventListener('click', () => {
            handleLogin(uiElements, authSystem);
        });
    }

    if (uiElements.newDeviceYesButton) {
        uiElements.newDeviceYesButton.addEventListener('click', () => {
            handleNewDeviceVerification(uiElements, authSystem);
        });
    }

    if (uiElements.newDeviceNoButton) {
        uiElements.newDeviceNoButton.addEventListener('click', () => {
            window.logClient("User chose NO to add new device (Cancel Login).");
            showMainSection('signinFlow', uiElements);
        });
    }
      
    // === Welcome Screen Logic ===
    if (uiElements.logoutButton) {
        uiElements.logoutButton.addEventListener('click', () => {
            handleLogout(uiElements, authSystem);
        });
    }
}