import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <div className="border-b border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <div className="flex h-14 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-2 mr-6">
          <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AS</span>
          </div>
          <span className="font-semibold hidden sm:inline-block text-foreground">AgniSight</span>
        </div>
        
        <nav className="flex items-center space-x-6 shrink-0 flex-1">
          <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
          <NavLink to="/sessions" className={navClass}>Sessions</NavLink>
          <NavLink to="/reports" className={navClass}>Reports</NavLink>
          {user.role === 'manager' && (
            <NavLink to="/analytics" className={navClass}>Analytics</NavLink>
          )}
        </nav>

        <div className="flex items-center justify-end space-x-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium leading-none text-foreground">{user.name}</span>
            <span className="text-xs text-muted-foreground uppercase">{user.role}</span>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-1.5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
