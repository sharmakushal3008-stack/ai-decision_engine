import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, LayoutDashboard, UserCircle, LogOut, Medal, BookOpen } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const links = [
    { to: "/dashboard", icon: <LayoutDashboard size={20}/>, label: "Dashboard" },
    { to: "/analytics", icon: <LayoutDashboard size={20}/>, label: "Analytics" },
    { to: "/profile", icon: <UserCircle size={20}/>, label: "Profile Setup" },
    { to: "/result", icon: <Sparkles size={20}/>, label: "Last Result" },
    { to: "/resources", icon: <BookOpen size={20}/>, label: "Resources" },
  ];

  return (
    <aside className="w-64 glass-panel border-y-0 border-l-0 rounded-none h-full p-4 flex flex-col justify-between relative z-10 hidden md:flex">
      <div className="flex flex-col gap-2">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-neonBlue/20 text-neonBlue border border-neonBlue/30' : 'text-gray-300 hover:bg-white/5'}`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </div>
      
      {/* Gamification Dashboard docked at bottom of sidebar */}
      <div className="p-4 bg-black/40 border border-glassBorder rounded-xl text-center shadow-[0_0_20px_rgba(59,130,246,0.1)] mt-auto">
        <Medal className="text-yellow-400 mx-auto mb-2" size={28}/>
        <h4 className="font-bold text-sm text-gray-200">Consultant Rank</h4>
        <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider block my-1">
          {user?.level || "Novice"}
        </span>
        <div className="text-xs font-bold text-gray-400 bg-black/50 px-2 py-1 rounded-full inline-block mt-2">
          {user?.xp || 0} XP
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
