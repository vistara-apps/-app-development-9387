import { useState } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import { usePaymentContext } from '../hooks/usePaymentContext';
import { useTransactions } from '../hooks/useTransactions';

export default function PaymentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    receiverAddress: '',
    amount: '',
    currency: 'USDC',
    notes: '',
    file: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState(null);
  
  const { createSession } = usePaymentContext();
  const { createTransaction } = useTransactions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.receiverAddress || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      // Create payment session
      await createSession(`$${formData.amount}`);
      setPaid(true);
      
      // Create transaction data
      const transactionData = {
        transactionId: `0x${Math.random().toString(16).slice(2, 18)}`,
        receiverAddress: formData.receiverAddress,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        notes: formData.notes,
      };
      
      // Create transaction with file upload
      await createTransaction(transactionData, formData.file);
      
      // Reset form
      setFormData({
        receiverAddress: '',
        amount: '',
        currency: 'USDC',
        notes: '',
        file: null
      });
      
      // Close modal after a delay to show success
      setTimeout(() => {
        setPaid(false);
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Failed to create payment');
      setPaid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, file });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark-text">New Payment</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={formData.receiverAddress}
              onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
              placeholder="0x..."
              className="w-full p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text focus:border-blue-500 focus:outline-none"
              >
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add a note about this payment..."
              rows={3}
              className="w-full p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Attachment (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center p-3 bg-dark-surface-light border border-gray-600 rounded-lg text-dark-text-secondary hover:text-dark-text cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {formData.file ? formData.file.name : 'Upload file'}
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Send Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
