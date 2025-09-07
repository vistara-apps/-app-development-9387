# NotePay - Track Payments & Share Context

A Base MiniApp for easily tracking payments and sharing contextual notes with others.

## 🚀 Features

### Core Features
- **Real-time Payment Dashboard** - Centralized view of all incoming and outgoing payments
- **Automated Payment Reminders** - Set up reminders for upcoming or overdue payments
- **Integrated Note & File Sharing** - Attach notes, receipts, or documents to transactions
- **Shared Payment History** - Collaborative tracking of shared expenses with multiple users

### Technical Features
- **Base Blockchain Integration** - Native support for Base network transactions
- **IPFS File Storage** - Decentralized storage for receipts and documents via Pinata
- **Real-time Notifications** - Browser notifications for payment reminders
- **Wallet Integration** - Seamless connection with Base-compatible wallets
- **Responsive Design** - Optimized for both desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Blockchain**: Base, Wagmi, RainbowKit
- **Backend**: Supabase (PostgreSQL)
- **File Storage**: IPFS via Pinata
- **Payments**: x402-axios for micro-transactions
- **UI Components**: Lucide React icons

## 📋 Prerequisites

Before running NotePay, you'll need:

1. **Node.js** (v18 or higher)
2. **Supabase Account** - For database and user management
3. **Pinata Account** - For IPFS file storage
4. **Base-compatible Wallet** - MetaMask, Coinbase Wallet, etc.

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd notepay
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your-pinata-api-key
VITE_PINATA_SECRET_KEY=your-pinata-secret-key

# Base RPC Configuration (optional - defaults to public RPC)
VITE_BASE_RPC_URL=https://mainnet.base.org
```

### 3. Database Setup

Create the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  display_name TEXT,
  creation_timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  transaction_id TEXT PRIMARY KEY,
  sender_address TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  amount DECIMAL(18,8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  file_storage_url TEXT,
  shared_with TEXT[] DEFAULT '{}'
);

-- Add indexes for better performance
CREATE INDEX idx_transactions_sender ON transactions(sender_address);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_address);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
```

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL commands above to create tables
3. Get your project URL and anon key from Settings > API
4. Add them to your `.env` file

### Pinata Setup

1. Sign up at [Pinata](https://pinata.cloud)
2. Generate API keys from your account dashboard
3. Add them to your `.env` file

### Base Network

The app is configured to work with Base mainnet by default. For development, you can:

1. Use Base Sepolia testnet
2. Get test ETH from Base faucet
3. Update the RPC URL in your `.env` if needed

## 📱 Usage

### Connecting Your Wallet

1. Click "Connect Wallet" in the top navigation
2. Select your preferred Base-compatible wallet
3. Approve the connection

### Creating a Payment

1. Click "New Payment" on the dashboard
2. Enter recipient address and amount
3. Add optional notes and file attachments
4. Confirm the transaction in your wallet

### Sharing Transactions

1. Click on any transaction card
2. Select "Share" from the transaction details
3. Add wallet addresses to share with
4. Shared users will see the transaction in their dashboard

### Setting Reminders

1. Open transaction details
2. Click "Set Reminder"
3. Choose date and custom message
4. Receive browser notifications when due

## 🏗 Architecture

### Frontend Architecture
```
src/
├── components/          # React components
│   ├── AppShell.jsx    # Main layout wrapper
│   ├── Dashboard.jsx   # Main dashboard view
│   ├── PaymentModal.jsx # Payment creation modal
│   ├── ShareModal.jsx  # Transaction sharing modal
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useTransactions.js # Transaction management
│   └── usePaymentContext.js # Payment processing
├── services/           # API service layer
│   └── api.js         # All external API integrations
└── main.jsx           # App entry point with providers
```

### Data Flow
1. **User Authentication** - Wallet connection via RainbowKit/Wagmi
2. **Transaction Creation** - Form → API → Blockchain → Database
3. **File Upload** - File → IPFS (Pinata) → URL stored in database
4. **Real-time Updates** - Database changes → React state updates
5. **Notifications** - Browser API for payment reminders

## 🔐 Security

- **Wallet Security** - Private keys never leave the user's wallet
- **API Keys** - Stored as environment variables, never in code
- **File Storage** - IPFS provides decentralized, tamper-proof storage
- **Database** - Supabase provides row-level security (RLS)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Base Network**: [Base Documentation](https://docs.base.org)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-chain support (Ethereum, Polygon, etc.)
- [ ] Advanced analytics and reporting
- [ ] Integration with accounting software
- [ ] Recurring payment automation
- [ ] Team collaboration features

---

Built with ❤️ for the Base ecosystem
