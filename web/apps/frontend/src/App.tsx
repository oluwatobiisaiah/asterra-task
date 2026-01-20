import { useState, Suspense, lazy } from 'react';
import { Users, UserPlus, Heart, LayoutGrid } from 'lucide-react';
import { CardSkeleton } from './components/ui/SkeletonLoader';

const AddUserForm = lazy(() => import('./components/AddUserForm'));
const AddHobbyForm = lazy(() => import('./components/AddHobbyForm'));
const UsersTable = lazy(() => import('./components/UsersTable'));

type Tab = 'add-user' | 'add-hobby' | 'view-data';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('view-data');

  return (
    <div className="min-h-screen">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="bg-black p-4 rounded-xl shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">User Management System</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Manage users and their hobbies efficiently
          </p>
        </header>

        <div className="flex justify-center mb-8 md:mb-12">
          <div className="bg-white rounded-lg md:rounded-xl p-1 md:p-2 shadow border border-gray-200">
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={() => setActiveTab('view-data')}
                className={`inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'view-data'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">All Data</span>
                <span className="sm:hidden">Data</span>
              </button>
              <button
                onClick={() => setActiveTab('add-user')}
                className={`inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'add-user'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">New User</span>
                <span className="sm:hidden">User</span>
              </button>
              <button
                onClick={() => setActiveTab('add-hobby')}
                className={`inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'add-hobby'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Add Hobby</span>
                <span className="sm:hidden">Hobby</span>
              </button>
            </div>
          </div>
        </div>

        <main className="animate-fadeIn">
          <Suspense fallback={<CardSkeleton />}>
            {activeTab === 'add-user' && <AddUserForm />}
            {activeTab === 'add-hobby' && <AddHobbyForm />}
            {activeTab === 'view-data' && <UsersTable />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;