# Hawcx Authentication

A secure authentication system using WebAssembly (WASM) for cryptographic operations.

## Installation

### Using a CDN (Recommended)

Simply add the script tag to your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/hawcx-auth@latest/dist/hawcx-auth.umd.min.js"></script>
```

### Using NPM

```bash
npm install hawcx-auth
```

## Usage

### Basic Setup

```html
<!-- Include from CDN -->
<script src="https://cdn.jsdelivr.net/npm/hawcx-auth@latest/dist/hawcx-auth.umd.min.js"></script>

<script>
  // Get the singleton instance
  const auth = HawcxInitializer.getInstance();
  
  // Initialize with your base URL and API key
  auth.initialize('https://your-api-base-url.com', 'YOUR_API_KEY')
    .then(response => {
      if (response.success) {
        console.log("HawcxAuth Initialized!");
        // Ready to use authentication methods
      } else {
        console.error("Initialization failed:", response.message);
      }
    });
</script>
```

### Using ES Modules

```html
<script type="module">
  import { HawcxInitializer } from 'https://cdn.jsdelivr.net/npm/hawcx-auth@latest/dist/hawcx-auth.esm.min.js';
  
  const auth = HawcxInitializer.getInstance();
  
  // Initialize and use as before
  auth.initialize('https://your-api-base-url.com', 'YOUR_API_KEY')
    .then(/* ... */);
</script>
```

### Using NPM Package

```javascript
// In your JavaScript file
import { HawcxInitializer } from 'hawcx-auth';

const auth = HawcxInitializer.getInstance();

// Initialize and use as before
auth.initialize('https://your-api-base-url.com', 'YOUR_API_KEY')
  .then(/* ... */);
```

## Authentication Methods

### User Registration

```javascript
// Register a new user
auth.registerUser('user@example.com')
  .then(response => {
    if (response.success) {
      console.log("Verification code sent!", response.data.sessionId);
      // Prompt user to enter OTP
    } else {
      console.error("Registration failed:", response.message);
    }
  });

// Verify OTP for registration
auth.verifyOTP('123456')
  .then(response => {
    if (response.success) {
      console.log("Registration completed successfully!");
      // User is now registered
    } else {
      console.error("Verification failed:", response.message);
    }
  });
```

### User Authentication

```javascript
// Authenticate a user
auth.authenticateUser('user@example.com')
  .then(response => {
    if (response.success) {
      console.log("Signed in successfully!");
      // Handle authentication tokens
      const { access_token, refresh_token } = response.data;
      // Store tokens as needed
    } else if (response.errorCode === 'DEVICE_NOT_REGISTERED') {
      // This device is not registered, send verification
      return auth.addDevice();
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
auth.verifyOTP('123456')
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

## License

MIT

