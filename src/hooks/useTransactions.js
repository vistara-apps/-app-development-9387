import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { 
  transactionService, 
  userService, 
  fileService, 
  blockchainService,
  notificationService,
  handleApiError 
} from '../services/api';

export function useTransactions() {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Initialize user when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      initializeUser();
      loadTransactions();
      checkReminders();
    }
  }, [isConnected, address]);

  const initializeUser = useCallback(async () => {
    try {
      let userData = await userService.getUser(address);
      if (!userData) {
        userData = await userService.createOrUpdateUser(address);
      }
      setUser(userData);
    } catch (err) {
      console.error('User initialization error:', err);
      setError(handleApiError(err));
    }
  }, [address]);

  const loadTransactions = useCallback(async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userTransactions = await transactionService.getUserTransactions(address);
      
      // Determine transaction type based on current user
      const processedTransactions = userTransactions.map(tx => ({
        ...tx,
        type: tx.senderAddress.toLowerCase() === address.toLowerCase() ? 'sent' : 'received'
      }));
      
      setTransactions(processedTransactions);
    } catch (err) {
      console.error('Load transactions error:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [address]);

  const createTransaction = useCallback(async (transactionData, file = null) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      let fileStorageUrl = null;
      
      // Upload file to IPFS if provided
      if (file) {
        const uploadResult = await fileService.uploadFile(file);
        fileStorageUrl = uploadResult.url;
      }
      
      const newTransaction = {
        ...transactionData,
        senderAddress: address,
        timestamp: new Date().toISOString(),
        status: 'pending',
        fileStorageUrl,
        sharedWith: [],
      };
      
      // Save to database
      const savedTransaction = await transactionService.createTransaction(newTransaction);
      
      // Add to local state
      const processedTransaction = {
        ...transactionService.formatTransaction(savedTransaction),
        type: 'sent'
      };
      
      setTransactions(prev => [processedTransaction, ...prev]);
      
      return processedTransaction;
    } catch (err) {
      console.error('Create transaction error:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address]);

  const updateTransaction = useCallback(async (transactionId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTransaction = await transactionService.updateTransaction(transactionId, updates);
      const processedTransaction = transactionService.formatTransaction(updatedTransaction);
      
      setTransactions(prev => 
        prev.map(tx => 
          tx.transactionId === transactionId 
            ? { ...processedTransaction, type: tx.type }
            : tx
        )
      );
      
      return processedTransaction;
    } catch (err) {
      console.error('Update transaction error:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const shareTransaction = useCallback(async (transactionId, sharedWithAddresses) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTransaction = await transactionService.shareTransaction(transactionId, sharedWithAddresses);
      const processedTransaction = transactionService.formatTransaction(updatedTransaction);
      
      setTransactions(prev => 
        prev.map(tx => 
          tx.transactionId === transactionId 
            ? { ...processedTransaction, type: tx.type }
            : tx
        )
      );
      
      return processedTransaction;
    } catch (err) {
      console.error('Share transaction error:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkTransactionStatus = useCallback(async (transactionId, txHash) => {
    try {
      const status = await blockchainService.getTransactionStatus(txHash);
      
      if (status !== 'pending') {
        await updateTransaction(transactionId, { status });
      }
      
      return status;
    } catch (err) {
      console.error('Check transaction status error:', err);
      return 'pending';
    }
  }, [updateTransaction]);

  const scheduleReminder = useCallback(async (transactionId, reminderDate, message) => {
    try {
      await notificationService.scheduleReminder(transactionId, reminderDate, message);
      return { success: true };
    } catch (err) {
      console.error('Schedule reminder error:', err);
      setError(handleApiError(err));
      throw err;
    }
  }, []);

  const checkReminders = useCallback(async () => {
    try {
      const dueReminders = await notificationService.checkPendingReminders();
      
      if (dueReminders.length > 0) {
        // In a real app, this would trigger actual notifications
        console.log('Due reminders:', dueReminders);
        
        // You could dispatch custom events or use a notification library here
        dueReminders.forEach(reminder => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('NotePay Reminder', {
              body: reminder.message,
              icon: '/favicon.ico',
            });
          }
        });
      }
      
      return dueReminders;
    } catch (err) {
      console.error('Check reminders error:', err);
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Calculate stats
  const stats = {
    totalReceived: transactions
      .filter(t => t.type === 'received' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalSent: transactions
      .filter(t => t.type === 'sent' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    pendingCount: transactions.filter(t => t.status === 'pending').length,
    completedCount: transactions.filter(t => t.status === 'completed').length,
  };

  return {
    transactions,
    loading,
    error,
    user,
    stats,
    createTransaction,
    updateTransaction,
    shareTransaction,
    checkTransactionStatus,
    scheduleReminder,
    checkReminders,
    refreshTransactions: loadTransactions,
    clearError: () => setError(null),
  };
}
