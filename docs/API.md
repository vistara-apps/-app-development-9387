# NotePay API Documentation

This document outlines the API integrations and services used in NotePay.

## 🏗 Architecture Overview

NotePay integrates with multiple APIs to provide a complete payment tracking experience:

- **Supabase** - Database and user management
- **Pinata** - IPFS file storage for receipts and documents
- **Base RPC** - Blockchain transaction monitoring
- **Turnkey** - Payment processing (optional)
- **Browser Notifications** - Payment reminders

## 📊 Data Models

### User Model
```typescript
interface User {
  user_id: string;           // Wallet address
  display_name: string;      // User's display name
  creation_timestamp: string; // ISO timestamp
}
```

### Transaction Model
```typescript
interface Transaction {
  transaction_id: string;    // Unique transaction identifier
  sender_address: string;    // Sender wallet address
  receiver_address: string;  // Receiver wallet address
  amount: number;           // Transaction amount
  currency: string;         // Currency (USDC, ETH, etc.)
  timestamp: string;        // ISO timestamp
  status: 'pending' | 'completed' | 'failed';
  notes?: string;           // Optional transaction notes
  file_storage_url?: string; // IPFS URL for attached files
  shared_with: string[];    // Array of wallet addresses
  type: 'sent' | 'received'; // Computed based on current user
}
```

## 🗄 Supabase Integration

### Database Schema

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
```

### API Methods

#### User Service
```typescript
// Create or update user
userService.createOrUpdateUser(walletAddress: string, displayName?: string): Promise<User>

// Get user by wallet address
userService.getUser(walletAddress: string): Promise<User | null>
```

#### Transaction Service
```typescript
// Create new transaction
transactionService.createTransaction(transactionData: TransactionData): Promise<Transaction>

// Get user's transactions
transactionService.getUserTransactions(walletAddress: string): Promise<Transaction[]>

// Update transaction
transactionService.updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction>

// Share transaction with other users
transactionService.shareTransaction(transactionId: string, sharedWithAddresses: string[]): Promise<Transaction>
```

## 📁 Pinata IPFS Integration

### File Upload
```typescript
// Upload file to IPFS
fileService.uploadFile(file: File): Promise<{
  ipfsHash: string;
  url: string;
}>

// Upload JSON data to IPFS
fileService.uploadJSON(jsonData: object): Promise<{
  ipfsHash: string;
  url: string;
}>
```

### Configuration
```typescript
const pinataClient = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET_KEY,
  },
});
```

### File Metadata
Files uploaded to IPFS include metadata:
```json
{
  "name": "receipt.pdf",
  "keyvalues": {
    "uploadedBy": "NotePay",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## ⛓ Base Blockchain Integration

### RPC Methods
```typescript
// Get transaction status
blockchainService.getTransactionStatus(txHash: string): Promise<'pending' | 'completed' | 'failed'>

// Get transaction details
blockchainService.getTransactionDetails(txHash: string): Promise<TransactionDetails>
```

### Configuration
```typescript
const baseRpcClient = axios.create({
  baseURL: BASE_RPC_URL, // https://mainnet.base.org
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Example RPC Calls
```typescript
// Check transaction receipt
{
  "jsonrpc": "2.0",
  "method": "eth_getTransactionReceipt",
  "params": ["0x..."],
  "id": 1
}

// Get transaction by hash
{
  "jsonrpc": "2.0",
  "method": "eth_getTransactionByHash",
  "params": ["0x..."],
  "id": 1
}
```

## 💳 Payment Processing (x402-axios)

### Payment Session Creation
```typescript
// Create payment session
const { createSession } = usePaymentContext();
await createSession("$0.001"); // Micro-transaction amount
```

### Configuration
```typescript
const baseClient = axios.create({
  baseURL: "https://payments.vistara.dev",
  headers: {
    "Content-Type": "application/json",
  },
});

const apiClient = withPaymentInterceptor(baseClient, walletClient);
```

## 🔔 Notification Service

### Reminder Management
```typescript
// Schedule payment reminder
notificationService.scheduleReminder(
  transactionId: string,
  reminderDate: string,
  message: string
): Promise<{ success: boolean }>

// Check for due reminders
notificationService.checkPendingReminders(): Promise<Reminder[]>
```

### Browser Notifications
```typescript
// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Show notification
new Notification('NotePay Reminder', {
  body: 'Payment reminder message',
  icon: '/favicon.ico',
});
```

## 🔧 Error Handling

### API Error Handler
```typescript
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data.message || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Network error - please check your connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};
```

### Error Types
- **Network Errors** - Connection issues, timeouts
- **Authentication Errors** - Invalid API keys, expired tokens
- **Validation Errors** - Invalid data format, missing fields
- **Blockchain Errors** - Transaction failures, insufficient funds
- **File Upload Errors** - File too large, invalid format

## 🔐 Security Considerations

### API Key Management
- Store API keys as environment variables
- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly

### Data Privacy
- User wallet addresses are public by design
- Transaction notes and files are stored off-chain
- IPFS provides content-addressed storage (tamper-proof)
- Supabase provides row-level security (RLS)

### Rate Limiting
- Pinata: 1000 requests per month (free tier)
- Base RPC: Varies by provider
- Supabase: Based on plan limits
- Implement client-side rate limiting for better UX

## 📈 Performance Optimization

### Caching Strategy
- Cache user data in React state
- Cache transaction lists with pagination
- Use React Query for server state management
- Implement optimistic updates for better UX

### File Upload Optimization
- Compress images before upload
- Validate file types and sizes
- Show upload progress
- Handle upload failures gracefully

### Database Optimization
- Use indexes on frequently queried columns
- Implement pagination for large datasets
- Use database functions for complex queries
- Monitor query performance

## 🧪 Testing

### API Testing
```typescript
// Mock API responses for testing
jest.mock('../services/api', () => ({
  userService: {
    createOrUpdateUser: jest.fn(),
    getUser: jest.fn(),
  },
  transactionService: {
    createTransaction: jest.fn(),
    getUserTransactions: jest.fn(),
  },
}));
```

### Integration Testing
- Test wallet connection flow
- Test transaction creation end-to-end
- Test file upload to IPFS
- Test notification scheduling

## 📊 Monitoring & Analytics

### Error Tracking
- Log API errors with context
- Monitor failed transactions
- Track file upload failures
- Alert on high error rates

### Performance Metrics
- API response times
- File upload success rates
- Transaction confirmation times
- User engagement metrics

## 🚀 Deployment Considerations

### Environment Variables
```bash
# Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_PINATA_API_KEY=prod-pinata-key

# Staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_PINATA_API_KEY=staging-pinata-key
```

### API Limits
- Monitor usage against plan limits
- Implement graceful degradation
- Cache responses where possible
- Use CDN for static assets

### Backup & Recovery
- Regular database backups via Supabase
- IPFS content is distributed by design
- Monitor API key usage and rotation
- Document recovery procedures
