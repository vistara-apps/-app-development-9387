import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import TransactionCard from './TransactionCard';
import PaymentModal from './PaymentModal';
import ShareModal from './ShareModal';
import TransactionDetailsModal from './TransactionDetailsModal';

// Mock data for demonstration
const mockTransactions = [
  {
    transactionId: '0xa1b2c3d4e5f67890',
    senderAddress: '0x1234567890abcdef1234567890abcdef12345678',
    receiverAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: 150.00,
    currency: 'USDC',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    notes: 'Payment for design work - Logo and branding materials',
    fileStorageUrl: 'ipfs://QmX4k2...',
    type: 'received',
    sharedWith: ['0x9876543210fedcba9876543210fedcba98765432']
  },
  {
    transactionId: '0xb2c3d4e5f6789012',
    senderAddress: '0x9876543210fedcba9876543210fedcba98765432',
    receiverAddress: '0x1234567890abcdef1234567890abcdef12345678',
    amount: 75.50,
    currency: 'USDC',
    timestamp: '2024-01-14T15:45:00Z',
    status: 'completed',
    notes: 'Coffee shop payment - Meeting with client',
    fileStorageUrl: null,
    type: 'sent',
    sharedWith: []
  },
  {
    transactionId: '0xc3d4e5f678901234',
    senderAddress: '0x1234567890abcdef1234567890abcdef12345678',
    receiverAddress: '0xfedcba0987654321fedcba0987654321fedcba09',
    amount: 200.00,
    currency: 'ETH',
    timestamp: '2024-01-13T09:20:00Z',
    status: 'pending',
    notes: 'Monthly subscription payment',
    fileStorageUrl: null,
    type: 'sent',
    sharedWith: []
  }
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalSent: 0,
    pendingCount: 0,
    completedCount: 0
  });

  useEffect(() => {
    // Calculate stats
    const received = transactions
      .filter(t => t.type === 'received' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const sent = transactions
      .filter(t => t.type === 'sent' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pending = transactions.filter(t => t.status === 'pending').length;
    const completed = transactions.filter(t => t.status === 'completed').length;

    setStats({
      totalReceived: received,
      totalSent: sent,
      pendingCount: pending,
      completedCount: completed
    });
  }, [transactions]);

  const handlePaymentCreated = (newTransaction) => {
    setTransactions([newTransaction, ...transactions]);
  };

  const handleShare = (transaction) => {
    setSelectedTransaction(transaction);
    setIsShareModalOpen(true);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    setTransactions(transactions.map(t => 
      t.transactionId === updatedTransaction.transactionId ? updatedTransaction : t
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Dashboard</h1>
          <p className="text-gray-300">Track your payments and share context seamlessly</p>
        </div>
        
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>New Payment</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-text-secondary text-sm font-medium">Total Received</p>
              <p className="text-2xl font-bold text-green-400">${stats.totalReceived.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-text-secondary text-sm font-medium">Total Sent</p>
              <p className="text-2xl font-bold text-red-400">${stats.totalSent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-text-secondary text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-text-secondary text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-blue-400">{stats.completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
          <div className="flex items-center space-x-2">
            <select className="bg-dark-surface text-dark-text px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
              <option value="all">All Transactions</option>
              <option value="received">Received</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionCard
                key={transaction.transactionId}
                transaction={transaction}
                onShare={handleShare}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className="card text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-text mb-2">No transactions yet</h3>
              <p className="text-dark-text-secondary mb-6">
                Get started by creating your first payment
              </p>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="btn-primary"
              >
                Create Payment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentCreated={handlePaymentCreated}
      />
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        transaction={selectedTransaction}
        onUpdate={handleUpdateTransaction}
      />
      
      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        transaction={selectedTransaction}
        onUpdate={handleUpdateTransaction}
      />
    </div>
  );
}