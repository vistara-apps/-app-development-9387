import { useState } from 'react';
import { X, Plus, UserPlus, Copy } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, transaction, onShare }) {
  const [sharedAddresses, setSharedAddresses] = useState(
    transaction?.sharedWith || []
  );
  const [newAddress, setNewAddress] = useState('');
  const [shareNote, setShareNote] = useState('');

  const handleAddAddress = () => {
    if (newAddress && !sharedAddresses.includes(newAddress)) {
      setSharedAddresses([...sharedAddresses, newAddress]);
      setNewAddress('');
    }
  };

  const handleRemoveAddress = (address) => {
    setSharedAddresses(sharedAddresses.filter(addr => addr !== address));
  };

  const handleShare = async () => {
    if (transaction && onShare) {
      try {
        await onShare(transaction.transactionId, sharedAddresses);
        onClose();
      } catch (error) {
        console.error('Failed to share transaction:', error);
        // You could add error state here if needed
      }
    }
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/shared/${transaction?.transactionId}`;
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark-text">Share Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Transaction Summary */}
          <div className="bg-dark-surface-light rounded-lg p-4 border border-gray-600">
            <h3 className="text-dark-text font-medium mb-2">Transaction Details</h3>
            <p className="text-dark-text-secondary text-sm">
              {transaction.type === 'sent' ? 'Sent' : 'Received'} {transaction.amount} {transaction.currency}
            </p>
            <p className="text-dark-text-secondary text-sm">
              ID: {transaction.transactionId.slice(0, 12)}...
            </p>
          </div>

          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Share Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/shared/${transaction.transactionId}`}
                readOnly
                className="flex-1 p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text-secondary text-sm"
              />
              <button
                onClick={copyShareLink}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Share with Wallet Address
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleAddAddress}
                className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shared Addresses List */}
          {sharedAddresses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Shared With ({sharedAddresses.length})
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {sharedAddresses.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-dark-surface-light rounded border border-gray-600"
                  >
                    <span className="text-dark-text-secondary text-sm">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                    <button
                      onClick={() => handleRemoveAddress(address)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Note */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Share Note (Optional)
            </label>
            <textarea
              value={shareNote}
              onChange={(e) => setShareNote(e.target.value)}
              placeholder="Add a note about why you're sharing this..."
              rows={3}
              className="w-full p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              className="flex-1 btn-primary"
            >
              Share Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
