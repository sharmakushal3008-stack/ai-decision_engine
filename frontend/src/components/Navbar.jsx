import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BrainCircuit, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel rounded-none border-t-0 border-x-0 border-b border-glassBorder z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <BrainCircuit className="text-neonBlue group-hover:text-neonPurple transition-colors" size={28} />
          <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-neonBlue to-neonPurple bg-clip-text text-transparent">Decision Engine</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm hover:text-neonBlue transition-colors">Dashboard</Link>
              <Link to="/profile" className="text-sm hover:text-neonPurple transition-colors">Profile</Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors font-semibold border border-transparent hover:border-red-500/30">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:text-neonBlue transition-colors">Login</Link>
              <Link to="/signup" className="btn-primary text-sm py-1">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
