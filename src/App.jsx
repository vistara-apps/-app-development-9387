import { useAccount } from 'wagmi';
import AppShell from './components/AppShell';
import Dashboard from './components/Dashboard';

function App() {
  const { isConnected } = useAccount();

  return (
    <AppShell>
      {isConnected ? (
        <Dashboard />
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-3xl font-bold text-white">NP</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to NotePay</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
              Track payments and share context seamlessly on Base
            </p>
            <div className="bg-dark-surface/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-white mb-4">Get Started</h2>
              <p className="text-gray-300 mb-4">
                Connect your wallet to start tracking payments and sharing contextual notes
              </p>
              <div className="text-sm text-gray-400">
                Connect your Base wallet using the button above
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default App;