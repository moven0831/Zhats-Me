# Identity Verification App

A simple web application that uses the Self protocol to verify a user's identity through a QR code.

## Features

- QR code generation for Self protocol verification
- Scannable by the official Self protocol mobile app
- Real-time verification status updates
- Privacy-preserving identity verification
- Fallback QR code option when Self SDK has issues
- Email verification flow with secure token-based authentication

## Prerequisites

- Node.js 18+ and pnpm installed
- Self protocol mobile app installed on your phone (for testing)
- ngrok for creating a secure tunnel to your localhost
- Gmail account (or other email provider) for sending verification emails

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Configure email verification (see Email Configuration section below)
4. Start the development server:
   ```
   pnpm dev
   ```
5. In a separate terminal, set up ngrok to expose your localhost:
   ```
   ngrok http 3001
   ```
   This will give you a public URL like `https://xxxx-xxx-xxx-xx.ngrok-free.app`

6. Update the `endpoint` URL in `src/app/page.tsx` with your ngrok URL:
   ```typescript
   // Replace with your actual ngrok URL
   endpoint: "https://xxxx-xxx-xxx-xx.ngrok-free.app/api/verify",
   ```

7. Update the `NEXT_PUBLIC_APP_URL` in `.env.local` with your ngrok URL:
   ```
   NEXT_PUBLIC_APP_URL=https://xxxx-xxx-xxx-xx.ngrok-free.app
   ```

8. Access the application at http://localhost:3001

## Email Configuration

### Setting up Gmail for Email Verification

1. **Enable 2-Step Verification on your Google account:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Create an App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app and give it a name like "Identity Verifier"
   - Google will generate a 16-character password - this is your `EMAIL_PASSWORD`

3. **Update your .env.local file:**
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-actual-gmail@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   EMAIL_FROM="Identity Verifier <your-actual-gmail@gmail.com>"
   ```

### Using Other Email Providers

If you're using a different email provider, update the .env.local with the appropriate SMTP settings:

```
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@provider.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM="Identity Verifier <your-email@provider.com>"
```

## ngrok Configuration

The Self protocol requires that your verification endpoint is accessible from the internet, which is why we use ngrok. When ngrok is running, it will provide a web interface at http://127.0.0.1:4040 where you can:

- Monitor requests
- Inspect request/response details
- Replay requests for debugging

Example ngrok output:
```
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://bf9c-111-235-226-130.ngrok-free.app -> http://localhost:3001
```

Make sure to use the HTTPS URL provided by ngrok in your application configuration.

## How It Works

1. The user enters their email address and receives a verification link
2. After clicking the link, they're redirected back to the app with verified status
3. The app generates a QR code using the Self protocol SDK
4. The user scans the QR code with the Self app
5. The Self app allows the user to prove their identity while preserving privacy
6. Upon successful verification, the app acknowledges the verified identity

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
