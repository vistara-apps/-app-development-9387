import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bell, Settings, Search } from 'lucide-react';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-dark-bg/80 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">NotePay</h1>
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="bg-dark-surface text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}