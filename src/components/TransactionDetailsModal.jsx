import { useState } from 'react';
import { X, Edit2, Save, FileText, Share2, Copy, ExternalLink } from 'lucide-react';

export default function TransactionDetailsModal({ isOpen, onClose, transaction, onUpdate }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(transaction?.notes || '');

  const handleSaveNotes = () => {
    if (transaction) {
      const updatedTransaction = {
        ...transaction,
        notes: editedNotes
      };
      onUpdate(updatedTransaction);
    }
    setIsEditingNotes(false);
  };

  const copyTransactionId = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction.transactionId);
      alert('Transaction ID copied to clipboard!');
    }
  };

  const viewOnExplorer = () => {
    if (transaction) {
      window.open(`https://basescan.org/tx/${transaction.transactionId}`, '_blank');
    }
  };

  if (!isOpen || !transaction) return null;

  const formatAddress = (address) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface rounded-xl p-6 w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark-text">Transaction Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Transaction Summary */}
          <div className="bg-dark-surface-light rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-text">
                {transaction.type === 'sent' ? 'Payment Sent' : 'Payment Received'}
              </h3>
              <span className={`text-2xl font-bold ${
                transaction.type === 'sent' ? 'text-red-400' : 'text-green-400'
              }`}>
                {transaction.type === 'sent' ? '-' : '+'}{transaction.amount} {transaction.currency}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-dark-text-secondary">From</p>
                <p className="text-dark-text font-mono">{formatAddress(transaction.senderAddress)}</p>
              </div>
              <div>
                <p className="text-dark-text-secondary">To</p>
                <p className="text-dark-text font-mono">{formatAddress(transaction.receiverAddress)}</p>
              </div>
              <div>
                <p className="text-dark-text-secondary">Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${
                  transaction.status === 'completed' ? 'text-green-400 bg-green-400/10' :
                  transaction.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10' :
                  'text-red-400 bg-red-400/10'
                }`}>
                  {transaction.status}
                </span>
              </div>
              <div>
                <p className="text-dark-text-secondary">Date</p>
                <p className="text-dark-text">{new Date(transaction.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Transaction ID
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={transaction.transactionId}
                readOnly
                className="flex-1 p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text-secondary text-sm font-mono"
              />
              <button
                onClick={copyTransactionId}
                className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={viewOnExplorer}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-dark-text">
                Notes
              </label>
              <button
                onClick={() => {
                  if (isEditingNotes) {
                    handleSaveNotes();
                  } else {
                    setIsEditingNotes(true);
                    setEditedNotes(transaction.notes || '');
                  }
                }}
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isEditingNotes ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="text-sm">Save</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </>
                )}
              </button>
            </div>
            
            {isEditingNotes ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add notes about this transaction..."
                rows={4}
                className="w-full p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text focus:border-blue-500 focus:outline-none resize-none"
              />
            ) : (
              <div className="p-3 bg-dark-surface-light border border-gray-600 rounded-lg min-h-[100px]">
                {transaction.notes ? (
                  <p className="text-dark-text">{transaction.notes}</p>
                ) : (
                  <p className="text-dark-text-secondary italic">No notes added</p>
                )}
              </div>
            )}
          </div>

          {/* File Attachment */}
          {transaction.fileStorageUrl && (
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Attachment
              </label>
              <div className="flex items-center space-x-3 p-3 bg-dark-surface-light border border-gray-600 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-dark-text">Receipt.pdf</span>
                <button className="ml-auto text-blue-400 hover:text-blue-300 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Sharing Info */}
          {transaction.sharedWith && transaction.sharedWith.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Shared With ({transaction.sharedWith.length})
              </label>
              <div className="space-y-2">
                {transaction.sharedWith.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-dark-surface-light border border-gray-600 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {address.slice(2, 4).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-dark-text font-mono text-sm">
                      {formatAddress(address)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Close
            </button>
            <button
              onClick={() => {
                // This would open the share modal with this transaction
                onClose();
              }}
              className="flex items-center justify-center space-x-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}