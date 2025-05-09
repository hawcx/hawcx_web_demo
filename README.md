
# Hawcx Authentication

A secure authentication system using WebAssembly (WASM) for cryptographic operations.

## Installation

```html
<script type="module">
  import { HawcxInitializer } from 'https://websdkcdn.hawcx.com/hawcx-auth.esm.min.js';
  
  const auth = await HawcxInitializer.init('YOUR_API_KEY');
</script>
```

## Authentication Methods

### User Registration

```javascript
// Register a new user
auth.signUp('user@example.com').then(response => {
  if (response.success) {
    console.log('Verification code sent!', response.data.sessionId);
    // Prompt user to enter OTP
  } else {
    console.error('Registration failed:', response.message);
  }
});
// Verify OTP for registration
auth.verifyOTP('123456').then(response => {
  if (response.success) {
    console.log('Registration completed successfully!');
    // User is now registered
  } else {
    console.error('Verification failed:', response.message);
  }
});
```

### User Authentication

```javascript
// Authenticate a user
auth.signIn('user@example.com')
  .then(response => {
    if (response.success) {
      console.log("Signed in successfully!");
      // Handle authentication tokens
      const { access_token, refresh_token } = response.data;
      // Store tokens as needed
    } else if (response.errorCode === 'DEVICE_NOT_REGISTERED') {
      // This device is not registered, send verification
      return await auth.addDevice();
    } else {
      console.error("Authentication failed:", response.message);
    }
  });
```

## Advanced Options

### Adding a New Device

```javascript
// When a user tries to login from a new device
auth.addDevice()
  .then(response => {
    if (response.success) {
      console.log("Verification code sent for new device!");
      // Prompt user to enter the verification code
    } else {
      console.error("Device verification initiation failed:", response.message);
    }
  });
// Verify the OTP for the new device
auth.verifyOTP('123456', isNewDevice = true})
  .then(response => {
    if (response.success) {
      console.log("New device registered successfully!");
      // Now the user can login from this device
    } else {
      console.error("Device verification failed:", response.message);
    }
  });
```

## Error Handling

The authentication methods return a standardized response object:

```javascript
{
  success: true/false,        // Whether the operation succeeded
  message: "Message text",    // User-friendly message
  errorCode: "ERROR_CODE",    // Error code (null if success)
  data: { ... }               // Additional data (varies by method)
}
```

## Browser Compatibility

This library works in all modern browsers that support WebAssembly:

- Chrome 57+
- Firefox 53+
- Safari 11+
- Edge 16+
