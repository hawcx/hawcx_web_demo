// signin.js - Functions for handling the signin flow

import { showStepInSection, showMainSection } from './ui.js';
import { FlowState } from './state-manager.js';
import { decodeJwtPayload } from './utils.js';
/**
 * Handles the login process
 * @param {Object} uiElements - UI elements object
 * @param {Object} authSystem - Authentication system instance
 */
export async function handleLogin(uiElements, authSystem) {
    const userid = uiElements.signinEmailInput.value.trim();
    
    if (!userid || !userid.includes('@')) {
        window.showStatus("Please enter a valid email address.", 'error');
        return;
    }
    
    uiElements.setButtonLoading(uiElements.handleLoginButton, true);
    uiElements.showSpinner();
    window.logClient(`Attempting Sign In for: ${userid}`);

    try {
        const loginResponse = await authSystem.signIn(userid);

        if (loginResponse.success) {
            window.showStatus('Signed in successfully! Redirecting...', 'success');
            uiElements.showVerificationBadge(true); // Show badge on success

            if (loginResponse.data && loginResponse.data.access_token && loginResponse.data.refresh_token) {
                sessionStorage.setItem('access_token', loginResponse.data.access_token);
                sessionStorage.setItem('refresh_token', loginResponse.data.refresh_token);
            } 

            setTimeout(() => {
                const username = loginResponse.data?.userid || userid; // Get username
                const displayName = username.split('@')[0];
                
                // Use state manager if available
                if (uiElements.stateManager) {
                    const accessToken = sessionStorage.getItem("access_token");
                    const email = decodeJwtPayload(accessToken)?.user_name || 'User';
                    const displayName = email.split('@')[0]; 
                    uiElements.stateManager.transitionTo(FlowState.WELCOME, {
                        displayName,
                        email: username,
                        isNewUser: false, // Flag to indicate this is a signin flow
                        lastLogin: new Date().toISOString()
                    });
                } else {
                    // Fallback to old method
                    if (uiElements.welcomeUserSpan) {
                        uiElements.welcomeUserSpan.textContent = displayName;
                    }
                    if (uiElements.welcomeHeaderTitle) {
                        uiElements.welcomeHeaderTitle.textContent = "Login Successful!";
                    }
                    if (uiElements.welcomeStatusText) {
                        uiElements.welcomeStatusText.textContent = "Welcome back!";
                    }
                    if (uiElements.welcomeGreeting) {
                        uiElements.welcomeGreeting.textContent = uiElements.getGreeting();
                    }
                    
                    showMainSection('welcome', uiElements);
                }
            }, 1500); // Delay for status message visibility

        } else if (loginResponse.errorCode === "INVALID_DEVICE_TOKEN" || loginResponse.errorCode === "DEVICE_NOT_REGISTERED") {
            // Handle new device detection
            window.logClient("New device detected, showing device registration prompt.", 'warning');

            // Update UI messaging for device verification step
            if (uiElements.deviceVerificationText) {
                uiElements.deviceVerificationText.textContent = 
                    `We've detected that you're signing in to ${userid} from a new device. For your security, we need to verify your identity.`;
            }
            
            // Use state manager if available
            if (uiElements.stateManager) {
                uiElements.stateManager.transitionTo(FlowState.SIGNIN_DEVICE_VERIFY, {
                    email: userid,
                    errorCode: loginResponse.errorCode
                });
            } else {
                // Fallback to old method
                showStepInSection(uiElements.signinContainer, 'deviceVerificationStep');
            }
            
            window.showStatus("New device detected. Please verify your identity.", 'warning');
            
        } else if (loginResponse.errorCode === "USER_NOT_FOUND") {
            // Handle unregistered email - redirect to signup
           
            // Populate the signup form with the email they tried to use
            if (uiElements.signupEmailInput) {
                uiElements.signupEmailInput.value = userid;
            }
            
            // Using state manager if available
            if (uiElements.stateManager) {
                uiElements.stateManager.transitionTo(FlowState.SIGNUP, {
                    email: userid,
                    fromLogin: true
                });
                

                setTimeout(() => {
                    window.showStatus("Email not registered. Let's create an account!", 'info');
                }, 300); // delay to let transition finish
            } else {
                // Fallback to old method
                showMainSection('signupFlow', uiElements);
                // Make sure to show the first step
                showStepInSection(uiElements.signupContainer, 'step1');
            }
            
        } else {
            window.logClient(`Login failed: ${loginResponse.message || 'Unknown reason'}`, 'error');
            window.showStatus(loginResponse.message || "Login failed. Please check your email or try registering.", 'error');
        }

    } catch (error) {
        window.logClient(`Error during Sign In: ${error.message}`, 'error');
        window.showStatus("An error occurred during sign in.", 'error');
        console.error('Error handling login:', error);
    } finally {
        uiElements.hideSpinner();
        uiElements.setButtonLoading(uiElements.handleLoginButton, false);
    }
}

/**
 * Handles new device verification initiation
 * @param {Object} uiElements - UI elements object
 * @param {Object} authSystem - Authentication system instance
 */
export async function handleNewDeviceVerification(uiElements, authSystem) {
    window.logClient("User chose YES to add new device.");
    uiElements.showSpinner();
    uiElements.setButtonLoading(uiElements.newDeviceYesButton, true);
    const userid = uiElements.signinEmailInput.value.trim();

    try {
        const response = await authSystem.addDevice(userid);
        window.logServer(`New device verification initiation response`, 'info', response);

        if (response.success) {
            window.logClient("Verification initiated for new device. Showing OTP step.");
            
            // Store the current email in state manager if available
            if (uiElements.stateManager) {
                uiElements.stateManager.updateStateData({ 
                    email: userid,
                    isNewDevice: true
                });
            }
            

            if (uiElements.signupOtpEmailSpan) {
                uiElements.signupOtpEmailSpan.textContent = userid;
            }
            if (uiElements.signupOtpInput) {
                uiElements.signupOtpInput.value = '';
            }

            // Transition to OTP verification step
            if (uiElements.stateManager) {
                uiElements.stateManager.transitionTo(FlowState.SIGNUP_OTP);
            } else {
                // Fallback to old method
                showMainSection('signupFlow', uiElements);
                showStepInSection(uiElements.signupContainer, 'step3');
            }
            
            window.showStatus(response.message || "Check email for verification code.", 'info');

        } else {
            window.logClient("Failed to initiate verification for new device.", 'error', response.message);
            window.showStatus(response.message || "Failed to send verification code.", 'error');
            
            // Stay on device verification step
            if (uiElements.stateManager) {
                uiElements.stateManager.transitionTo(FlowState.SIGNIN_DEVICE_VERIFY);
            } else {
                showStepInSection(uiElements.signinContainer, 'deviceVerificationStep');
            }
        }

    } catch (error) {
        window.logClient(`Error in newDeviceYes flow: ${error.message}`, 'error');
        window.showStatus("An error occurred.", 'error');
        console.error("Error handling new device (yes):", error);
    } finally {
        uiElements.hideSpinner();
        uiElements.setButtonLoading(uiElements.newDeviceYesButton, false);
    }
}

/**
 * Handles the logout process
 * @param {Object} uiElements - UI elements object
 * @param {Object} authSystem - Authentication system instance
 */
export async function handleLogout(uiElements, authSystem) {
    uiElements.setButtonLoading(uiElements.logoutButton, true);
    uiElements.showSpinner();
    window.logClient("Logout initiated.");
    
    try {
        // Add backend logout call if necessary in your authSystem
        // await authSystem.logout();
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

        window.logClient('Logout successful.');
        window.logServer(`Session terminated successfully`, 'success');
        
        // Clear any stored tokens/state
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        authSystem.logout(); 

        // Return to initial view
        if (uiElements.stateManager) {
            uiElements.stateManager.transitionTo(FlowState.SIGNIN);
        } else {
            showMainSection('signinFlow', uiElements);
        }
        
        window.showStatus("Successfully logged out.", 'success');

    } catch(error) {
        window.logClient(`Logout failed: ${error.message}`, 'error');
        window.showStatus("Logout failed. Please try again.", 'error');
        console.error("Logout error:", error);
    } finally {
        uiElements.hideSpinner();
        uiElements.setButtonLoading(uiElements.logoutButton, false);
    }
}