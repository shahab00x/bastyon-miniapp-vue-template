# Bastyon QR Payment App

A modern, user-friendly QR payment application built for the Bastyon network. Send and receive PKTC payments easily using QR codes with a beautiful Vue 3 interface.

![Bastyon Pay](./logo.png)

## 🚀 Features

- **QR Code Generation**: Create payment request QR codes instantly
- **QR Code Scanning**: Scan payment QR codes to send payments (demo mode)
- **Real-time Balance**: View your current PKTC balance
- **Transaction History**: Track your payment history with confirmations
- **Address Validation**: Validate recipient addresses before sending
- **Responsive Design**: Works perfectly on mobile and desktop
- **Dark Mode Support**: Automatic dark/light theme switching
- **Bastyon SDK Integration**: Full integration with Bastyon blockchain
- **Privacy-First**: Tor routing for external requests when available

## 🛠️ Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: UnoCSS + Tailwind CSS classes
- **QR Codes**: QRCode.js library
- **Blockchain**: Bastyon SDK for PKTC transactions
- **Build Tool**: Vite with hot module replacement
- **Package Manager**: pnpm

## 📱 How to Use

### For Users (Within Bastyon)

1. **Open the App**: Launch the Bastyon QR Payment App from within the Bastyon platform
2. **Login**: Your Bastyon account will be automatically connected
3. **View Balance**: See your current PKTC balance in the header
4. **Request Payment**:
   - Enter the amount you want to request
   - Tap "Request Payment" to generate a QR code
   - Show the QR code to the person who will pay you
5. **Send Payment**:
   - Enter the recipient's address and amount
   - Tap "Send Payment" to complete the transaction
   - Or scan a payment QR code (demo mode)
6. **Track Transactions**: View your payment history with confirmation status

### For Developers

## 🏗️ Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd bastyon-qr-payment-app

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🔧 Development

### Project Structure

```
src/
├── components/
│   ├── QRCodeVue3.vue      # QR code generation component
│   ├── TheCounter.vue      # Demo counter component
│   ├── TheFooter.vue       # App footer
│   └── TheInput.vue        # Input component
├── composables/
│   ├── sdkService.ts       # Bastyon SDK integration
│   ├── dark.ts             # Dark mode utilities
│   └── index.ts            # Composables exports
├── pages/
│   ├── index.vue           # Main payment app page
│   └── [...all].vue        # 404 fallback
├── styles/
│   └── main.css            # Global styles
├── App.vue                 # Root component
└── main.ts                 # App entry point
```

### Key Components

#### SdkService (`src/composables/sdkService.ts`)

Provides methods for:

- `getBalance()` - Get current wallet balance
- `getAddress()` - Get wallet address
- `sendPayment()` - Send PKTC to an address
- `validateAddress()` - Validate recipient address
- `getTransactionHistory()` - Fetch transaction history
- `estimateFee()` - Estimate transaction fees

#### QRCodeVue3 (`src/components/QRCodeVue3.vue`)

Custom QR code component with:

- Canvas-based rendering
- Configurable size and colors
- Fallback image support
- Responsive design

## 🌐 Bastyon Integration

### SDK Methods Used

- **Authentication**: Automatic login detection
- **Permissions**: Request `account` and `payment` permissions
- **RPC Calls**: Direct blockchain interaction for payments
- **Balance Queries**: Real-time balance updates
- **Transaction Broadcasting**: Secure payment processing

### Payment Flow

1. **Validation**: Check recipient address validity
2. **Balance Check**: Ensure sufficient funds
3. **Fee Estimation**: Calculate transaction fees
4. **Broadcasting**: Submit transaction to blockchain
5. **Confirmation**: Track transaction status

## 🔒 Security Features

- **Address Validation**: Prevents payments to invalid addresses
- **Balance Verification**: Checks available funds before sending
- **Permission System**: Uses Bastyon's permission model
- **Secure RPC**: All blockchain calls go through Bastyon SDK
- **Privacy-First**: Tor routing for enhanced privacy

## 🎨 UI/UX Features

- **Modern Interface**: Clean, intuitive design
- **Responsive Layout**: Works on all screen sizes
- **Loading States**: Visual feedback during operations
- **Error Handling**: Clear error messages and recovery options
- **Success Feedback**: Confirmation messages and status updates
- **Transaction History**: Easy-to-read payment timeline

## 📝 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript checks
pnpm test         # Run unit tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Bastyon Community**: Join the Bastyon platform discussions
- **Issues**: Report bugs via GitHub issues
- **Documentation**: Check Bastyon SDK documentation

## 🔗 Links

- **Bastyon Platform**: https://bastyon.com
- **Bastyon SDK Documentation**: https://bastyon.com/application?id=app.pocketnet.docs
- **Vue 3 Documentation**: https://vuejs.org
- **UnoCSS Documentation**: https://unocss.dev

---

**Built with ❤️ for the Bastyon community**
