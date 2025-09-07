import { useState } from 'react';
import { Share2, FileText, Clock, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';

export default function TransactionCard({ transaction, onShare, onViewDetails }) {
  const [showNotes, setShowNotes] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount, currency) => {
    return `${amount} ${currency}`;
  };

  return (
    <div className="card hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {transaction.type === 'sent' ? 'S' : 'R'}
            </span>
          </div>
          <div>
            <h3 className="text-dark-text font-semibold">
              {transaction.type === 'sent' ? 'Sent to' : 'Received from'}
            </h3>
            <p className="text-dark-text-secondary text-sm">
              {formatAddress(transaction.type === 'sent' ? transaction.receiverAddress : transaction.senderAddress)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-lg font-bold ${transaction.type === 'sent' ? 'text-red-400' : 'text-green-400'}`}>
            {transaction.type === 'sent' ? '-' : '+'}{formatAmount(transaction.amount, transaction.currency)}
          </p>
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
            {getStatusIcon(transaction.status)}
            <span className="capitalize">{transaction.status}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-dark-text-secondary mb-4">
        <span>{new Date(transaction.timestamp).toLocaleDateString()} at {new Date(transaction.timestamp).toLocaleTimeString()}</span>
        <span>ID: {transaction.transactionId.slice(0, 8)}...</span>
      </div>

      {transaction.notes && (
        <div className="mb-4">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showNotes ? 'Hide' : 'Show'} Notes</span>
          </button>
          
          {showNotes && (
            <div className="mt-2 p-3 bg-dark-surface-light rounded-lg border border-gray-600">
              <p className="text-dark-text-secondary">{transaction.notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-4">
          {transaction.fileStorageUrl && (
            <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Attachment</span>
            </button>
          )}
          
          {transaction.sharedWith && transaction.sharedWith.length > 0 && (
            <div className="flex items-center space-x-1 text-gray-400">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Shared with {transaction.sharedWith.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(transaction)}
            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Details</span>
          </button>
          
          <button
            onClick={() => onShare(transaction)}
            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}