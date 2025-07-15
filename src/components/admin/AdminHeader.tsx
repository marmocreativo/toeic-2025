// src/components/admin/AdminHeader.tsx
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function AdminHeader() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {user?.email || 'Admin'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}