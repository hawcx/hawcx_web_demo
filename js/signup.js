// signup.js - Functions for handling the signup flow

import { showStepInSection, showMainSection } from './ui.js';
import { FlowState } from './state-manager.js';
import { decodeJwtPayload } from "./utils.js"

/**
 * Handles the username availability check and initiates verification
 * @param {Object} uiElements - UI elements object
 * @param {Object} authSystem - Authentication system instance
 */
export async function initiateRegistration(uiElements, authSystem) {
    const userid = uiElements.signupEmailInput.value.trim();
    
    if (!userid || !userid.includes('@')) {
        window.showStatus("Please enter a valid email address.", 'error');
        return;
    }
    
    uiElements.setButtonLoading(uiElements.checkAvailabilityButton, true);
    uiElements.showSpinner();
    window.logClient(`Checking username/email availability: ${userid}`);

    try {
        const ruResponse = await authSystem.signUp(userid);

        if (ruResponse.success) { // Username is available
           
            if (uiElements.stateManager) {
                uiElements.stateManager.updateStateData({ email: userid });
            }
            
            // Update UI with user's email (for backward compatibility)
            if (uiElements.signupOtpEmailSpan) {
                uiElements.signupOtpEmailSpan.textContent = userid;
            }

            window.logServer(`Initiate verification response for ${userid}`, 'info', ruResponse);

            if (ruResponse.success) {
                window.logClient("Verification initiated successfully.");
                window.showStatus('Verification code sent! Check your email.', 'success');
                
                // Use state manager if available
                if (uiElements.stateManager) {
                    uiElements.stateManager.transitionTo(FlowState.SIGNUP_OTP);
                } else {
                    showStepInSection(uiElements.signupContainer, 'step3'); // Show OTP step (fallback)
                }
            } else {
                window.logClient("Initiating email verification failed.", 'error', ruResponse.message);
                window.showStatus(ruResponse.message || "Failed to send verification code. Please try again.", 'error');
            }
        } else { // Username not available (already registered)
            window.logClient(`Email ${userid} already exists.`, 'warning');
            window.showStatus("This email is already registered. Please Sign In.", 'error');
        }
    } catch (error) {
        window.logClient(`Error during username check/initiation: ${error.message}`, 'error');
        window.showStatus("An error occurred. Please try again.", 'error');
        console.error("Error in handleUsernameCheck:", error);
    } finally {
        uiElements.hideSpinner();
        uiElements.setButtonLoading(uiElements.checkAvailabilityButton, false);
    }
}

/**
 * Handles OTP verification during signup or device registration
 * @param {Object} uiElements - UI elements object
 * @param {Object} authSystem - Authentication system instance
 */
export async function verifyOtp(uiElements, authSystem) {
    const otp = uiElements.signupOtpInput.value.trim();
    
    if (!otp) {
        window.showStatus("Please enter the verification code.", 'error');
        return;
    }
    
    uiElements.setButtonLoading(uiElements.verifyOtpButtonSignup, true);
    uiElements.showSpinner();
    window.logClient(`Verifying OTP: ${otp}`);

    try {
        const isNewDevice = uiElements.stateManager?.getStateData()?.isNewDevice === true; 
        const response = await authSystem.verifyOTP(otp, isNewDevice);
        window.logServer(`Verify OTP NDR response`, 'info', response);

        if (response.success) {
            window.logClient("OTP Verification successful. Proceeding to welcome screen.");
            window.showStatus("Email verified! Logging in...", 'success');
            
            if (uiElements.signupOtpInput) {
                uiElements.signupOtpInput.blur(); // This closes mobile keyboards
            }

            // Instead of showing the device trust step, go directly to welcome screen
            // Get email from state manager if available
            let email = null;
            let isNewUser = false;
            
            if (uiElements.stateManager) {
                const stateData = uiElements.stateManager.getStateData();
                email = stateData.email;
                // Check if this is a signup flow or a device verification flow
                isNewUser = !stateData.isNewDevice;
            }
            
            // Fallback to input value if state manager doesn't have it
            if (!email) {
                email = uiElements.signupEmailInput?.value;
            }
            
            // Navigate directly to Welcome Section using state manager if available
            const loginResponse = await authSystem.signIn(email);
            if (uiElements.stateManager && loginResponse?.success) {
                const accessToken = sessionStorage.getItem("access_token");
                const email = decodeJwtPayload(accessToken)?.user_name || 'User';
                const displayName = email.split('@')[0]; 
                uiElements.stateManager.transitionTo(FlowState.WELCOME, {
                    displayName,
                    isNewUser, // Flag to indicate whether this is signup or device verification
                    deviceTrusted: true, // Automatically trust the device
                    lastLogin: new Date().toISOString()
                });
            } 

        } else {
            window.logClient("OTP Verification failed.", 'error', response.message);
            window.showStatus(response.message || "Verification failed. Invalid or expired code.", 'error');
        }
    } catch (error) {
        window.logClient(`Error during OTP verification: ${error.message}`, 'error');
        window.showStatus("An error occurred during verification.", 'error');
        console.error('Error verifying OTP:', error);
    } finally {
        uiElements.hideSpinner();
        uiElements.setButtonLoading(uiElements.verifyOtpButtonSignup, false);
    }
}

/**
 * Handles the device trust decision
 * @param {boolean} trustDevice - Whether to trust the device
 * @param {Object} uiElements - UI elements object
 * @param {Object} authSystem - Authentication system instance
 */
export async function handleDeviceTrust(trustDevice, uiElements, authSystem) {
    window.logClient(`User chose ${trustDevice ? 'YES' : 'NO'} to trust device.`);
    uiElements.showSpinner();
    
    try {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async action

        window.logClient(`Device trust preference noted (${trustDevice ? 'Yes' : 'No'}). Proceeding to welcome.`);
        
        // Get email from state manager if available
        let email = null;
        if (uiElements.stateManager) {
            const stateData = uiElements.stateManager.getStateData();
            email = stateData.email;
        }
        
        // Fallback to input value if state manager doesn't have it
        if (!email) {
            email = uiElements.signupEmailInput.value;
        }
        
        // Navigate to final Welcome Section using state manager if available
        if (uiElements.stateManager) {
            const accessToken = sessionStorage.getItem("access_token");
            const email = decodeJwtPayload(accessToken)?.user_name || 'User';
            const displayName = email.split('@')[0]; 
            uiElements.stateManager.transitionTo(FlowState.WELCOME, {
                displayName,
                isNewUser: true, // Flag to indicate this is a signup flow
                deviceTrusted: trustDevice
            });
        } else {
            // Fallback to old method
            const displayName = email.split('@')[0];
            
            if (uiElements.welcomeUserSpan) {
                uiElements.welcomeUserSpan.textContent = displayName;
            }
            if (uiElements.welcomeHeaderTitle) {
                uiElements.welcomeHeaderTitle.textContent = "Account Created!";
            }
            if (uiElements.welcomeStatusText) {
                uiElements.welcomeStatusText.textContent = "Signup & Login Successful!";
            }
            if (uiElements.welcomeGreeting) {
                uiElements.welcomeGreeting.textContent = uiElements.getGreeting();
            }
            
            showMainSection('welcome', uiElements);
        }
    } catch (error) {
        window.logClient(`Error during device trust (${trustDevice ? 'Yes' : 'No'}): ${error.message}`, 'error');
        window.showStatus("Error saving preference.", 'error');
    } finally {
        uiElements.hideSpinner();
    }
}