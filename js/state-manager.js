// state-manager.js - A centralized state management system for UI state
import { config } from "./config.js";
import { fetchAndDisplayDevices } from "./utils.js"
/**
 * Enum-like object for application flow states
 */
export const FlowState = {
    INITIAL: 'initial',
    SIGNUP: 'signup',
    SIGNUP_OTP: 'signup_otp',
    SIGNIN: 'signin',
    SIGNIN_DEVICE_VERIFY: 'signin_device_verify',
    WELCOME: 'welcome'
};

/**
 * StateManager - Centralized state management for the application
 */
export class StateManager {
    constructor(uiElements) {
        this.uiElements = uiElements;
        this.currentState = FlowState.SIGNIN;
        this.stateData = {}; // For storing data related to the current state
        this.stateChangeListeners = [];
        
        // Define mapping of states to UI elements
        this.stateToUIMapping = {
            [FlowState.SIGNUP]: {
                section: 'signupFlow',
                step: 'step1'
            },
            [FlowState.SIGNUP_OTP]: {
                section: 'signupFlow',
                step: 'step3'
            },
            [FlowState.SIGNIN]: {
                section: 'signinFlow',
                step: 'loginStep'
            },
            [FlowState.SIGNIN_DEVICE_VERIFY]: {
                section: 'signinFlow',
                step: 'deviceVerificationStep'
            },
            [FlowState.WELCOME]: {
                section: 'welcome'
            }
        };
        
        this.initializeStateListeners();
    }
    
    /**
     * Initialize event listeners for UI elements that should trigger state changes
     */
    initializeStateListeners() {
        // This function can be extended to add automatic state transitions
        // based on UI interactions if needed in the future
    }
    
    /**
     * Subscribe to state changes
     * @param {Function} listener - Function to be called on state change
     * @returns {Function} - Unsubscribe function
     */
    subscribe(listener) {
        this.stateChangeListeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
        };
    }
    
    /**
     * Transition to a new state
     * @param {string} newState - State to transition to (from FlowState enum)
     * @param {Object} data - Optional data related to the state
     */
    transitionTo(newState, data = {}) {
        if (!Object.values(FlowState).includes(newState)) {
            console.error(`Invalid state transition attempted: ${newState}`);
            return false;
        }
        
        // Log the transition
        window.logClient?.(`State transition: ${this.currentState} -> ${newState}`);
        
        const oldState = this.currentState;
        this.currentState = newState;
        
        // Update state data
        this.stateData = {
            ...this.stateData,
            ...data
        };
        
        // Update UI based on the new state
        this.updateUI(newState);
        
        // Notify listeners
        this.stateChangeListeners.forEach(listener => {
            listener(newState, oldState, this.stateData);
        });
        
        return true;
    }
    
    /**
     * Update UI elements based on the current state
     * @param {string} state - Current state
     */
    updateUI(state) {
        const mapping = this.stateToUIMapping[state];
        if (!mapping) {
            console.error(`No UI mapping found for state: ${state}`);
            return;
        }
        
        // Update main section
        if (mapping.section) {
            this.showMainSection(mapping.section);
        }
        
        // Update step within section if applicable
        if (mapping.step) {
            this.showStepInSection(
                this.uiElements.sections[mapping.section], 
                mapping.step
            );
        }
        
        // Additional state-specific UI updates
        this.performStateSpecificUpdates(state);
    }
    
    /**
     * Perform state-specific UI updates
     * @param {string} state - Current state
     */
    performStateSpecificUpdates(state) {
        switch (state) {
            case FlowState.SIGNUP_OTP:
                // Update email display in OTP step
                if (this.stateData.email && this.uiElements.signupOtpEmailSpan) {
                    this.uiElements.signupOtpEmailSpan.textContent = this.stateData.email;
                }
                break;
                
            case FlowState.SIGNIN_DEVICE_VERIFY:
                // Update device verification step with relevant info
                this.updateDeviceVerificationInfo();
                break;
                
            case FlowState.WELCOME:
                // Update welcome screen with username
                if (this.stateData.email && this.uiElements.welcomeUserSpan) {
                    const displayName = this.stateData.email.split('@')[0];
                    this.uiElements.welcomeUserSpan.textContent = displayName;
                }
                
                // Update welcome header based on flow (signup vs signin)
                if (this.uiElements.welcomeHeaderTitle) {
                    const isNewUser = this.stateData.isNewUser;
                    this.uiElements.welcomeHeaderTitle.textContent = 
                        isNewUser ? "Account Created!" : "Login Successful!";
                }
                // Trigger welcome animations (using opacity instead of display)
                const welcomeElements = document.querySelectorAll('#welcome-section .welcome-text, #welcome-section .user-name, #welcome-section .decoration, #welcome-section .message');
                welcomeElements.forEach(el => {
                    // The animations are now controlled via CSS with the .active class on the parent section
                });
                // reset state
                this.updateStateData({
                    isNewDevice: false,
                    fromLogin: false
                });
                break;
        }
    }
    
    /**
     * Update device verification info with current browser data
     */
    updateDeviceVerificationInfo() {
        const deviceNameElement = document.getElementById('device-name');
        const deviceTimeElement = document.getElementById('device-time');
        const deviceVerificationText = document.getElementById('deviceVerificationText');
        
        if (deviceNameElement) {
            // Get browser and OS info
            const userAgent = navigator.userAgent;
            let deviceName = "Unknown Device";
            
            if (/Windows/.test(userAgent)) {
                deviceName = "Windows";
            } else if (/Macintosh|Mac OS X/.test(userAgent)) {
                deviceName = "Mac";
            } else if (/Android/.test(userAgent)) {
                deviceName = "Android";
            } else if (/iPhone|iPad|iPod/.test(userAgent)) {
                deviceName = "iOS";
            } else if (/Linux/.test(userAgent)) {
                deviceName = "Linux";
            }
            
            // Add browser info
            if (/Chrome/.test(userAgent)) {
                deviceName += " - Chrome";
            } else if (/Firefox/.test(userAgent)) {
                deviceName += " - Firefox";
            } else if (/Safari/.test(userAgent)) {
                deviceName += " - Safari";
            } else if (/Edge/.test(userAgent)) {
                deviceName += " - Edge";
            }
            
            deviceNameElement.textContent = deviceName;
        }
        
        if (deviceTimeElement) {
            const now = new Date();
            deviceTimeElement.textContent = now.toLocaleTimeString();
        }
        
        if (deviceVerificationText && this.stateData.email) {
            deviceVerificationText.textContent = 
                `We've detected that you're signing in to ${this.stateData.email} from a new device. For your security, we need to verify your identity.`;
        }
    }
    
    /**
     * Shows the specified main section and hides others
     * Re-implemented to work with Bootstrap classes
     * @param {string} sectionKey - The section to show
     */
    showMainSection(sectionKey) {
        this.uiElements.allSections.forEach(section => {
            if (section && section.id === this.uiElements.sections[sectionKey]?.id) {
                section.classList.remove('inactive');
                section.classList.add('active');
            } else if (section) {
                section.classList.remove('active');
                section.classList.add('inactive');
            }
        });
        
        // Hide any lingering status messages
        window.hideStatus?.();
    }
    
    /**
     * Shows a specific step within a section
     * Re-implemented to work with Bootstrap
     * @param {HTMLElement} sectionContainer - The parent section container
     * @param {string} stepId - The ID of the step to show
     */
    showStepInSection(sectionContainer, stepId) {
        if (!sectionContainer) return;
        
        const steps = sectionContainer.querySelectorAll('.flow-step');
        steps.forEach(step => {
            if (step.id === stepId) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Scroll the section to the top if needed
        sectionContainer.scrollTop = 0;
    }
    
    /**
     * Get current state
     * @returns {string} Current state
     */
    getCurrentState() {
        return this.currentState;
    }
    
    /**
     * Get state data
     * @returns {Object} Current state data
     */
    getStateData() {
        return { ...this.stateData };
    }
    
    /**
     * Update state data without changing state
     * @param {Object} data - Data to merge with current state data
     */
    updateStateData(data) {
        this.stateData = {
            ...this.stateData,
            ...data
        };
    }
}