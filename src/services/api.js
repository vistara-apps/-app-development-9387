import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Environment variables (these would be set in production)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const PINATA_API_KEY = process.env.VITE_PINATA_API_KEY || 'your-pinata-key';
const PINATA_SECRET_KEY = process.env.VITE_PINATA_SECRET_KEY || 'your-pinata-secret';
const BASE_RPC_URL = process.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Pinata API client
const pinataClient = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET_KEY,
  },
});

// Base RPC client
const baseRpcClient = axios.create({
  baseURL: BASE_RPC_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User Management
export const userService = {
  async createOrUpdateUser(walletAddress, displayName = null) {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        user_id: walletAddress,
        display_name: displayName || `User ${walletAddress.slice(0, 6)}...`,
        creation_timestamp: new Date().toISOString(),
      })
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async getUser(walletAddress) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', walletAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};

// Transaction Management
export const transactionService = {
  async createTransaction(transactionData) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionData.transactionId,
        sender_address: transactionData.senderAddress,
        receiver_address: transactionData.receiverAddress,
        amount: transactionData.amount,
        currency: transactionData.currency,
        timestamp: transactionData.timestamp,
        status: transactionData.status,
        notes: transactionData.notes,
        file_storage_url: transactionData.fileStorageUrl,
        shared_with: transactionData.sharedWith || [],
      })
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async getUserTransactions(walletAddress) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`sender_address.eq.${walletAddress},receiver_address.eq.${walletAddress},shared_with.cs.{${walletAddress}}`)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data.map(this.formatTransaction);
  },

  async updateTransaction(transactionId, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('transaction_id', transactionId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async shareTransaction(transactionId, sharedWithAddresses) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ shared_with: sharedWithAddresses })
      .eq('transaction_id', transactionId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  formatTransaction(dbTransaction) {
    return {
      transactionId: dbTransaction.transaction_id,
      senderAddress: dbTransaction.sender_address,
      receiverAddress: dbTransaction.receiver_address,
      amount: dbTransaction.amount,
      currency: dbTransaction.currency,
      timestamp: dbTransaction.timestamp,
      status: dbTransaction.status,
      notes: dbTransaction.notes,
      fileStorageUrl: dbTransaction.file_storage_url,
      sharedWith: dbTransaction.shared_with || [],
      type: 'sent', // This would be determined based on current user
    };
  },
};

// File Storage (IPFS via Pinata)
export const fileService = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: 'NotePay',
        timestamp: new Date().toISOString(),
      },
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
      const response = await pinataClient.post('/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        ipfsHash: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  },

  async uploadJSON(jsonData) {
    try {
      const response = await pinataClient.post('/pinning/pinJSONToIPFS', jsonData);
      
      return {
        ipfsHash: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      };
    } catch (error) {
      console.error('JSON upload error:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  },
};

// Blockchain Integration
export const blockchainService = {
  async getTransactionStatus(txHash) {
    try {
      const response = await baseRpcClient.post('/', {
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      });
      
      if (response.data.result) {
        return response.data.result.status === '0x1' ? 'completed' : 'failed';
      }
      return 'pending';
    } catch (error) {
      console.error('Transaction status check error:', error);
      return 'pending';
    }
  },

  async getTransactionDetails(txHash) {
    try {
      const response = await baseRpcClient.post('/', {
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1,
      });
      
      return response.data.result;
    } catch (error) {
      console.error('Transaction details error:', error);
      throw new Error('Failed to fetch transaction details');
    }
  },
};

// Notification Service (Mock implementation)
export const notificationService = {
  async scheduleReminder(transactionId, reminderDate, message) {
    // In a real implementation, this would integrate with a notification service
    console.log('Scheduling reminder:', { transactionId, reminderDate, message });
    
    // Store reminder in local storage for demo purposes
    const reminders = JSON.parse(localStorage.getItem('notepay_reminders') || '[]');
    reminders.push({
      id: Date.now().toString(),
      transactionId,
      reminderDate,
      message,
      sent: false,
    });
    localStorage.setItem('notepay_reminders', JSON.stringify(reminders));
    
    return { success: true };
  },

  async checkPendingReminders() {
    const reminders = JSON.parse(localStorage.getItem('notepay_reminders') || '[]');
    const now = new Date();
    
    const dueReminders = reminders.filter(reminder => 
      !reminder.sent && new Date(reminder.reminderDate) <= now
    );
    
    // Mark as sent
    const updatedReminders = reminders.map(reminder => 
      dueReminders.some(due => due.id === reminder.id) 
        ? { ...reminder, sent: true }
        : reminder
    );
    localStorage.setItem('notepay_reminders', JSON.stringify(updatedReminders));
    
    return dueReminders;
  },
};

// Error handling utility
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
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
