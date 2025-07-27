# Bastyon QR Payment App

<p align='center'>
  <img src='./logo.png' alt='PocketNet' width='200'/>
</p>

<h6 align='center'>
<a href="https://github.com/DaniilKimlb/bastyon-miniapp-vue-template">GitHub Repository</a>
</h6>

<h5 align='center'>
<b>Generate QR Codes to Receive PKOIN Payments on the Bastyon Network</b>
</h5>

---

## 🚀 Features

- 💰 **Payment QR Generation** - Create QR codes for receiving PKOIN payments
- 🔐 **Wallet Integration** - Automatically gets your wallet address from Bastyon
- 📱 **Mobile Friendly** - Responsive design optimized for mobile devices
- 🎯 **Payment Details** - Specify amount and description for payment requests
- 📤 **Share & Copy** - Easy sharing and copying of QR codes and wallet addresses
- 🌙 **Dark Mode** - Supports both light and dark themes
- 🔒 **Privacy-First** - Built on the decentralized Bastyon platform

## 📱 How It Works

1. **Login to Bastyon** and open this mini-app
2. **Grant permissions** for the app to access your account information
3. **Set payment details** - Enter the amount and description (optional)
4. **Generate QR code** - A Bitcoin-compatible payment QR code is created
5. **Share the QR** - Others can scan it to send you PKOIN

## 🛠️ Technical Details

- Built with **Vue 3** and **TypeScript**
- Uses **Bastyon SDK** for wallet integration
- Generates **Bitcoin-compatible QR codes** using `qrcode-generator`
- **Progressive Web App** capabilities with Service Worker
- Styled with **UnoCSS/Tailwind** for modern UI

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## 🔑 Bastyon SDK Integration

This app integrates with the Bastyon SDK to:

- **Access user wallet** - Automatically retrieves your Bastyon wallet address
- **Request permissions** - Asks for account access permissions
- **Generate payment URIs** - Creates Bitcoin-compatible payment URLs
- **Handle errors gracefully** - Falls back to demo mode if permissions aren't granted

### Required Permissions

- `account` - To access your wallet address and account information

## 📋 Payment QR Format

The app generates QR codes in Bitcoin URI format:

```
bitcoin:YOUR_WALLET_ADDRESS?amount=1.5&label=Payment%20for%20service
```

This format is compatible with:

- Bastyon wallet
- Most Bitcoin wallets
- Payment processing apps

## 🌐 Bastyon Platform

Bastyon is a decentralized, censorship-resistant social media and content platform that includes:

- **Decentralized social network**
- **PKOIN cryptocurrency**
- **Content monetization**
- **Mini-app ecosystem**

Learn more at [bastyon.com](https://bastyon.com)

## 📄 License

Apache-2.0 - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

This project is based on the [Bastyon Mini-App Vue Template](https://github.com/DaniilKimlb/bastyon-miniapp-vue-template).

For questions about Bastyon SDK integration, refer to:

- [Bastyon SDK Documentation](https://bastyon.com/application?id=app.pocketnet.docs&p=6465762f617070732f6d696e69617070732f73646b2e68746d6c)
- [SDK Type Definitions](https://github.com/DaniilKimlb/types-bastyon-sdk)
