import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import TransactionCard from './TransactionCard';
import PaymentModal from './PaymentModal';
import ShareModal from './ShareModal';
import TransactionDetailsModal from './TransactionDetailsModal';
import { useTransactions } from '../hooks/useTransactions';

export default function Dashboard() {
  const {
    transactions,
    loading,
    error,
    user,
    stats,
    updateTransaction,
    shareTransaction,
    refreshTransactions,
    clearError
  } = useTransactions();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState('all');

  const handleShare = (transaction) => {
    setSelectedTransaction(transaction);
    setIsShareModalOpen(true);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateTransaction = async (transactionId, updates) => {
    try {
      await updateTransaction(transactionId, updates);
    } catch (err) {
      console.error('Failed to update transaction:', err);
    }
  };

  const handleShareTransaction = async (transactionId, sharedWithAddresses) => {
    try {
      await shareTransaction(transactionId, sharedWithAddresses);
    } catch (err) {
      console.error('Failed to share transaction:', err);
    }
  };

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => {
    switch (filter) {
      case 'received':
        return transaction.type === 'received';
      case 'sent':
        return transaction.type === 'sent';
      case 'pending':
        return transaction.status === 'pending';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Dashboard</h1>
          <p className="text-gray-300">
            Track your payments and share context seamlessly
            {user && (
              <span className="block text-sm text-gray-400 mt-1">
                Welcome back, {user.display_name}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshTransactions}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            <span>New Payment</span>
          </button>
        </div>
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
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-dark-surface text-dark-text px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Transactions</option>
              <option value="received">Received</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {loading && transactions.length === 0 ? (
          <div className="card text-center py-12">
            <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-dark-text mb-2">Loading transactions...</h3>
            <p className="text-dark-text-secondary">
              Please wait while we fetch your payment history
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.transactionId}
                  transaction={transaction}
                  onShare={handleShare}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : transactions.length > 0 ? (
              <div className="card text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-text mb-2">No {filter} transactions</h3>
                <p className="text-dark-text-secondary mb-6">
                  Try changing the filter or create a new payment
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="btn-secondary mr-3"
                >
                  Show All
                </button>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="btn-primary"
                >
                  Create Payment
                </button>
              </div>
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
        )}
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        transaction={selectedTransaction}
        onShare={handleShareTransaction}
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
