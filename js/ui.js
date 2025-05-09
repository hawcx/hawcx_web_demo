// ui.js - Contains UI management functions and element references
import { StateManager } from './state-manager.js';

/**
 * Initializes UI components and returns references to DOM elements
 * @returns {Object} Object containing references to DOM elements and state manager
 */
export function initializeUI() {
    // Define section references
    const sections = {
        signupFlow: document.getElementById('signup-flow-section'),
        signinFlow: document.getElementById('signin-flow-section'),
        welcome: document.getElementById('welcome-section'),
        logs: document.getElementById('logs-section')
    };
    
    const allSections = Object.values(sections);
    const allButtons = document.querySelectorAll('button');
    const spinnerOverlay = document.querySelector('.spinner-overlay');
    const statusDiv = document.getElementById('status');
    
    const backToSigninLink = document.querySelector('.back-to-signin-link');

    // Signup Flow Elements
    const signupContainer = sections.signupFlow;
    const signupSteps = {
        step1: signupContainer ? signupContainer.querySelector('#step1') : null,
        step3: signupContainer ? signupContainer.querySelector('#step3') : null,
    };
    const signupEmailInput = document.getElementById('userid');
    const signupOtpEmailSpan = document.getElementById('signup-otp-email');
    const signupOtpInput = document.getElementById('otp');
    const checkAvailabilityButton = document.getElementById('handle-username-check-button');
    const verifyOtpButtonSignup = document.getElementById('verifyOTP');
    
    // Signin Flow Elements
    const signinContainer = sections.signinFlow;
    const signinSteps = {
        loginStep: signinContainer ? signinContainer.querySelector('#loginStep') : null,
        deviceVerificationStep: signinContainer ? signinContainer.querySelector('#deviceVerificationStep') : null,
    };
    const signinEmailInput = document.getElementById('signinUserid');
    const handleLoginButton = document.getElementById('handle-login-button');
    const showSignupFromSigninButton = document.getElementById('show-signup-from-signin');

    const newDeviceYesButton = document.getElementById('new-device-yes-button');
    const newDeviceNoButton = document.getElementById('new-device-no-button');
    const deviceVerificationText = document.getElementById('deviceVerificationText');
    const deviceNameElement = document.getElementById('device-name');
    const deviceTimeElement = document.getElementById('device-time');

    // Welcome Section Elements
    const welcomeHeaderTitle = document.getElementById('welcome-header-title');
    const welcomeStatusText = document.getElementById('welcome-status-text');
    const welcomeGreeting = document.getElementById('welcome-greeting');
    const welcomeUserSpan = document.getElementById('welcome-user-name');
    const logoutButton = document.getElementById('logout-button');
    
    // Logging Elements
    const clientLogOutput = document.getElementById('client-log');
    const serverLogOutput = document.getElementById('server-log');

    // Define UI helper functions
    let lottieInstance = null;

    function showSpinner() {
        const overlay = document.getElementById('global-spinner');
        if (!overlay) return;
    
        overlay.classList.add('show');
    
        if (!lottieInstance) {
            lottieInstance = lottie.loadAnimation({
                container: document.getElementById('lottie-spinner'),
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: 'assets/spinner.json'
            });
        } else {
            lottieInstance.play();
        }
    }

    function hideSpinner() {
        const overlay = document.getElementById('global-spinner');
        if (!overlay) return;
    
        overlay.classList.remove('show');
        if (lottieInstance) lottieInstance.stop();
    }

    /**
     * Shows/Hides the verification badge
     */
    function showVerificationBadge(show) {
        const badge = document.getElementById('verificationBadge');
        if (badge) {
            badge.style.display = show ? 'inline-block' : 'none';
            window.logClient?.(`UI Update: Verification badge ${show ? 'shown' : 'hidden'}`);
        } else {
            window.logClient?.("Warning: Verification badge element not found.", 'warning');
        }
    }

    /**
     * Displays a status message
     */
    window.showStatus = (message, type = 'info') => {
        if (!message) {
            hideStatus();
            return;
        }
        
        window.logClient?.(`Status Update [${type}]: ${message}`);
        
        if (statusDiv) {
            // Clear previous classes and set new ones
            statusDiv.className = 'alert';
            
            // Map type to Bootstrap alert classes
            switch (type) {
                case 'success':
                    statusDiv.classList.add('alert-success');
                    break;
                case 'error':
                    statusDiv.classList.add('alert-danger');
                    break;
                case 'warning':
                    statusDiv.classList.add('alert-warning');
                    break;
                default:
                    statusDiv.classList.add('alert-info');
            }
            
            statusDiv.textContent = message;
            statusDiv.style.display = 'block';

            window.setTimeout(() => {
                hideStatus();
            }, 2500);
        }
    };

    /** Hides the status message div */
    window.hideStatus = () => {
        if (statusDiv) {
            statusDiv.style.display = 'none';
            statusDiv.textContent = '';
        }
    };

    /**
     * Sets the loading state for a button
     */
    function setButtonLoading(button, isLoading) {
        if (!button) return;
        button.disabled = isLoading;
        if (isLoading) {
            button.classList.add('loading');
        } else {
            button.classList.remove('loading');
        }
    }

    /**
     * Generates a greeting message based on time of day
     */
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning! Ready for today?";
        if (hour < 18) return "Good afternoon! Hope your day is productive.";
        return "Good evening! Welcome back.";
    }

    // Create UI elements object
    const uiElements = {
        sections,
        allSections,
        allButtons,
        // showSignupButton,
        // showSigninButton,
        backToSigninLink,
        signupContainer,
        signupSteps,
        signupEmailInput,
        signupOtpEmailSpan,
        signupOtpInput,
        checkAvailabilityButton,
        verifyOtpButtonSignup,
        deviceVerificationText,
        deviceNameElement,
        deviceTimeElement,
        signinContainer,
        signinSteps,
        signinEmailInput,
        handleLoginButton,
        showSignupFromSigninButton,
        newDeviceYesButton,
        newDeviceNoButton,
        welcomeHeaderTitle,
        welcomeStatusText,
        welcomeGreeting,
        welcomeUserSpan,
        logoutButton,
        clientLogOutput,
        serverLogOutput,
        statusDiv,
        showSpinner,
        hideSpinner,
        showVerificationBadge,
        setButtonLoading,
        getGreeting
    };
    
    // Create the state manager with UI elements
    const stateManager = new StateManager(uiElements);
    
    // Add state manager to uiElements for convenience
    uiElements.stateManager = stateManager;
    
    return uiElements;
}

/**
 * Shows the specified main section and hides others
 * @param {string} sectionKey - The section to show
 * @param {Object} uiElements - Object containing UI element references
 */
export function showMainSection(sectionKey, uiElements) {
    window.logClient?.(`UI Flow: Showing main section '${sectionKey}'`);
    
    // If state manager is available, use it
    if (uiElements.stateManager) {
        // Map the section keys to appropriate states
        const sectionToStateMap = {
            'signupFlow': 'signup',
            'signinFlow': 'signin',
            'welcome': 'welcome'
        };
        
        if (sectionToStateMap[sectionKey]) {
            uiElements.stateManager.transitionTo(sectionToStateMap[sectionKey]);
            return;
        }
    }
    
    // Fallback to manual section toggling if needed
    uiElements.allSections.forEach(section => {
        if (section && section.id === uiElements.sections[sectionKey]?.id) {
            section.classList.remove('inactive');
            section.classList.add('active');
        } else if (section) {
            section.classList.remove('active');
            section.classList.add('inactive');
        }
    });

    // Reset steps within the shown flow section if applicable
    if (sectionKey === 'signupFlow') {
        showStepInSection(uiElements.signupContainer, 'step1');
    } else if (sectionKey === 'signinFlow') {
        showStepInSection(uiElements.signinContainer, 'loginStep');
    }
    
    window.hideStatus?.(); // Hide any lingering status messages
}

/**
 * Shows a specific step within a section
 * @param {HTMLElement} sectionContainer - The parent section container
 * @param {string} stepId - The ID of the step to show
 */
export function showStepInSection(sectionContainer, stepId) {
    if (!sectionContainer) return;
    
    window.logClient?.(`UI Flow: Showing step '${stepId}' within section '${sectionContainer.id}'`);
    
    const steps = sectionContainer.querySelectorAll('.flow-step');
    steps.forEach(step => {
        if (step.id === stepId) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Scroll to top if needed
    sectionContainer.scrollTop = 0;
}