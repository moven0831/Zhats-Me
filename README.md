# Zhats-Me: Identity & Ticket Verification App

A web application for ETHGlobal Taipei 2025 that verifies both user identity through the Self protocol and event tickets through ZK-Email proofs.

Check demo branch for local deployment showcase: [demo branch](https://github.com/moven0831/Zhats-Me/tree/demo)

## Features

- **Dual Verification System**:
  - Identity verification using Self protocol
  - Ticket verification using ZK-Email zero-knowledge proofs
- **Privacy-Preserving Verification**:
  - QR code scanning with the Self protocol mobile app
  - Local email processing with ZK-Email
- **User-Friendly Interface**:
  - Real-time verification status updates
  - Guided verification process
  - Dark/light mode support
- **Email Verification Flow**:
  - Secure token-based authentication
  - Optional email verification step

## Prerequisites

- Node.js 18+ and pnpm installed
- Self protocol mobile app installed on your phone (for identity verification)
- Email ticket from ETHGlobal Taipei 2025 (saved as .eml file)
- ngrok for creating a secure tunnel to your localhost (for development)

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Configure environment variables (copy env.local.example to .env.local)
4. Start the development server:
   ```
   pnpm dev
   ```
5. In a separate terminal, set up ngrok to expose your localhost:
   ```
   ngrok http 3001
   ```
   This will give you a public URL like `https://xxxx-xxx-xxx-xx.ngrok-free.app`

6. Update the environment variables in `.env.local` with your ngrok URL:
   ```
   NEXT_PUBLIC_APP_URL=https://xxxx-xxx-xxx-xx.ngrok-free.app
   ```

7. Access the application at http://localhost:3001

## Email Configuration (Optional)

### Setting up Gmail for Email Verification

1. **Enable 2-Step Verification on your Google account:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Create an App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app and give it a name like "Zhats-Me"
   - Google will generate a 16-character password - this is your `EMAIL_PASSWORD`

3. **Update your .env.local file:**
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-actual-gmail@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   EMAIL_FROM="Zhats-Me <your-actual-gmail@gmail.com>"
   ```

## How It Works

### Identity Verification with Self Protocol
1. The app generates a QR code using the Self protocol SDK
2. The user scans the QR code with the Self app
3. The Self app allows the user to prove their identity while preserving privacy
4. Upon successful verification, the app acknowledges the verified identity

### Ticket Verification with ZK-Email
1. The user uploads their ETHGlobal Taipei 2025 ticket email file (.eml format)
2. The app processes the email using ZK-Email SDK to generate a zero-knowledge proof
3. The proof verifies the email's authenticity without revealing sensitive information
4. Upon successful verification, the app confirms the ticket's validity

## Implementation Details

### Self Protocol Integration
The app uses the following Self protocol features:
- `SelfAppBuilder`: Creates a Self app instance with verification requirements
- `SelfQRcodeWrapper`: Displays a QR code that can be scanned with the Self app
- `userId`: Generates a unique identifier for each verification session

### ZK-Email Integration
The app uses the ZK-Email SDK to:
- Process email tickets locally or remotely
- Generate zero-knowledge proofs that verify ticket authenticity
- Validate proofs against the ETHGlobal Taipei 2025 email blueprint

## Troubleshooting

If the Self SDK QR code is not showing:
1. Check browser console for any errors
2. Make sure you've installed all dependencies with `pnpm install`
3. Verify that your endpoint URL is correctly set
4. Use the browser network tab to check for API errors

For email verification issues:
1. Make sure your .eml file is properly formatted
2. Try both local and remote proof generation options
3. Check that you're using a valid ETHGlobal Taipei 2025 ticket email

## Additional Resources

- [Self Protocol Documentation](https://docs.self.xyz/)
- [ZK-Email SDK Documentation](https://zkemail.dev/)
- [ETHGlobal Taipei 2025](https://ethglobal.com/)

## License

MIT
