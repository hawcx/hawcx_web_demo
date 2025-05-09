// main.js - Main entry point for the Hawcx authentication system
  import { HawcxInitializer } from 'https://websdkcdn.hawcx.com/hawcx-auth.esm.min.js';
// import { HawcxInitializer } from "../dist/hawcx-auth.esm.min.js"
// import { HawcxInitializer } from "../lib.js"

import { config } from './js/config.js';
import { initializeUI, showMainSection } from './js/ui.js';
import { setupEventListeners } from './js/events.js';

window.config = config;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI components and get references to DOM elements
    const uiElements = initializeUI();
    const logClient = () => {};
    const logServer = () => {};
    
    // Make logging functions globally accessible
    window.logClient = logClient;
    window.logServer = logServer;
    
    // Disable all buttons during initialization
    uiElements.allButtons.forEach(button => button.disabled = true);
    uiElements.showSpinner();
    
    try {
        // Initialize the authentication system
        const authSystem = await HawcxInitializer.init(config.apiKey,  config.baseUrl);
        
        // Setup event listeners for all UI components
        setupEventListeners(uiElements, authSystem);
        
        // Show initial screen
        showMainSection('signinFlow', uiElements);
        logClient('UI Initialized. Hawcx Style Applied.');
        
        
            
    } catch (error) {
        logClient(`Critical Error during Authentication System Initialization: ${error.message}`, 'error');
        window.showStatus("Critical Error: Failed to initialize authentication. Please refresh.", 'error');
        console.error("Initialization Error:", error);
    } finally {
        uiElements.allButtons.forEach(button => button.disabled = false);
        uiElements.hideSpinner();
    }
});