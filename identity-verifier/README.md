# Identity Verification App

A simple web application that uses the Self protocol to verify a user's identity through a QR code.

## Features

- QR code generation for Self protocol verification
- Scannable by the official Self protocol mobile app
- Real-time verification status updates
- Privacy-preserving identity verification
- Fallback QR code option when Self SDK has issues

## Prerequisites

- Node.js 18+ and pnpm installed
- Self protocol mobile app installed on your phone (for testing)

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Start the development server:
   ```
   pnpm dev
   ```
4. For local testing, you'll need to expose your localhost to the internet using ngrok:
   ```
   ngrok http 3000
   ```
5. Update the `endpoint` URL in `src/app/page.tsx` with your ngrok URL.

## How It Works

1. The app generates a QR code using the Self protocol SDK
2. The user scans the QR code with the Self app
3. The Self app allows the user to prove their identity while preserving privacy
4. Upon successful verification, the app acknowledges the verified identity

## Self Protocol Integration Details

The app uses the following Self protocol features:
- `SelfAppBuilder`: Creates a Self app instance with verification requirements
- `SelfQRcodeWrapper`: Displays a QR code that can be scanned with the Self app
- `userId`: Generates a unique identifier for each verification session
- `disclosures`: Requests specific information from the user's passport

Example usage:
```typescript
// Create a SelfApp instance
const selfApp = new SelfAppBuilder({
  appName: "Identity Verifier",
  scope: "identity-verification-scope",
  endpoint: "https://your-endpoint.com/api/verify",
  userId,
  disclosures: { 
    name: true,
    nationality: true,
    date_of_birth: true,
    minimumAge: 18,
    excludedCountries: ["IRN", "PRK", "RUS"],
    ofac: true,
  },
}).build();

// Display the QR code
<SelfQRcodeWrapper
  selfApp={selfApp}
  onSuccess={handleVerificationSuccess}
  size={250}
/>
```

## Implementation Notes

- The Self SDK components are loaded using dynamic imports to prevent "document is not defined" errors during server-side rendering
- The initialization of the Self app is done client-side only using a window check
- A fallback QR code implementation is provided in case the Self SDK fails to load
- The backend includes a simulation of the verification process, which would be replaced with actual verification logic in production

## Troubleshooting

If the Self SDK QR code is not showing:

1. Check browser console for any errors
2. Make sure you've installed all dependencies with `pnpm install`
3. Verify that your endpoint URL is correctly set
4. Try the fallback QR code option with the toggle button
5. Use the same casing for components: `SelfQRcodeWrapper` (not `SelfQRCodeWrapper`)
6. Make sure you're passing `onSuccess` correctly to the QR code component
7. Confirm that the Self app is being built correctly with valid parameters

## Customization

- To use with real passports in production:
  - Set `devMode: false` in the SelfAppBuilder configuration
  - Implement the backend verification using `SelfBackendVerifier` from `@selfxyz/core`
  - Configure the verification rules based on your application's requirements

## Additional Resources

- [Self Protocol Documentation](https://docs.self.xyz/)
- [Self Protocol GitHub Example](https://github.com/selfxyz/happy-birthday)

## License

MIT
