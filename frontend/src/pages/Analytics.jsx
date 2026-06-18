import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Loader from '../components/Loader';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from 'recharts';
import { Award, CheckSquare, Target, Clock, BarChart2, TrendingUp, Sparkles, FolderGit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/decision/history');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Analyzing execution metrics..." />;

  const latestResult = history.length > 0 ? history[0] : null;

  if (!latestResult) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Card className="text-center py-20 max-w-lg border border-neonPurple/20">
            <Sparkles className="text-neonPurple mb-4 mx-auto animate-pulse" size={48} />
            <h2 className="text-2xl font-bold mb-2">No active strategy found</h2>
            <p className="text-gray-400 mb-6">Complete your profile form and generate an AI Career Masterplan first to begin tracking analytics.</p>
            <button className="btn-primary" onClick={() => navigate('/profile')}>Generate Masterplan</button>
          </Card>
        </div>
      </div>
    );
  }

  const checkedTasks = latestResult.checkedTasks || [];

  // Helper function to calculate XP rank progress
  const getLevelProgress = (xp, level) => {
    const currentXp = xp || 0;
    if (level === 'Expert') {
      return { percent: 100, current: currentXp, next: 500, label: 'Maximum Level Reached!' };
    }
    if (level === 'Adept') {
      const progress = currentXp - 250;
      const totalNeeded = 250;
      const percent = Math.min(Math.round((progress / totalNeeded) * 100), 100);
      return { percent: Math.max(0, percent), current: currentXp, next: 500, label: `${500 - currentXp} XP to Expert` };
    }
    if (level === 'Apprentice') {
      const progress = currentXp - 100;
      const totalNeeded = 150;
      const percent = Math.min(Math.round((progress / totalNeeded) * 100), 100);
      return { percent: Math.max(0, percent), current: currentXp, next: 250, label: `${250 - currentXp} XP to Adept` };
    }
    // Novice
    const percent = Math.min(Math.round((currentXp / 100) * 100), 100);
    return { percent: Math.max(0, percent), current: currentXp, next: 100, label: `${100 - currentXp} XP to Apprentice` };
  };

  const levelProgress = getLevelProgress(user?.xp, user?.level);

  // Parse Phase Completion Data
  const phaseData = latestResult.phases?.map(phase => {
    const tasks = [
      ...(phase.focusAreas || []).map(f => `[Focus] ${phase.name}: ${f}`),
      ...(phase.skillsToLearn || []).map(s => `[Skill] ${phase.name}: ${s}`)
    ];
    const total = tasks.length;
    const completed = tasks.filter(t => checkedTasks.includes(t)).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      name: phase.name,
      Percentage: percentage,
      Completed: completed,
      Total: total
    };
  }) || [];

  // Parse Weekly Sprints Completion Data
  const weeklyData = latestResult.weeklyPlan?.map(week => {
    const tasks = [
      ...(week.practiceTasks || []).map(pt => `Week ${week.week}: ${pt}`),
      ...(week.smallDeliverables || []).map(sd => `Deliverable ${week.week}: ${sd}`)
    ];
    const total = tasks.length;
    const completed = tasks.filter(t => checkedTasks.includes(t)).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      name: `Week ${week.week}`,
      Percentage: percentage,
      Completed: completed,
      Total: total
    };
  }) || [];

  // Parse Project Completion Data
  const totalProjects = latestResult.projects?.length || 0;
  const completedProjects = latestResult.projects?.filter(proj => 
    checkedTasks.includes(`Project: ${proj.title}`)
  ).length || 0;
  const projectPercentage = totalProjects === 0 ? 0 : Math.round((completedProjects / totalProjects) * 100);

  // Global completion calculation
  const allTrackableStrings = [];
  latestResult.phases?.forEach(p => {
    p.focusAreas?.forEach(f => allTrackableStrings.push(`[Focus] ${p.name}: ${f}`));
    p.skillsToLearn?.forEach(s => allTrackableStrings.push(`[Skill] ${p.name}: ${s}`));
  });
  latestResult.weeklyPlan?.forEach(w => {
    w.practiceTasks?.forEach(pt => allTrackableStrings.push(`Week ${w.week}: ${pt}`));
    w.smallDeliverables?.forEach(sd => allTrackableStrings.push(`Deliverable ${w.week}: ${sd}`));
  });
  latestResult.projects?.forEach(p => allTrackableStrings.push(`Project: ${p.title}`));

  const totalTasksCount = allTrackableStrings.length;
  const completedCount = allTrackableStrings.filter(s => checkedTasks.includes(s)).length;
  const globalPercentage = totalTasksCount === 0 ? 0 : Math.round((completedCount / totalTasksCount) * 100);

  // Consistency Score Heuristic
  const dailyHours = latestResult.dailyPlan ? 4 : 2; // Default logic or placeholder
  const activeRoadmapTimeline = latestResult.goal?.description || "Career Strategy Masterplan";

  // Advice Generator based on progress
  const getProgressInsight = (pct) => {
    if (pct === 0) return "Ground Zero: Start checking off tasks in your chronological roadmap to kickstart your growth metrics.";
    if (pct < 30) return "Early Momentum: You are laying down the core fundamentals. Stay consistent with your daily study hours.";
    if (pct < 70) return "Sustained Velocity: You are halfway through your roadmap! Accelerate by tackling the portfolio projects next.";
    return "Expert Horizon: You are close to full compliance. Time to polish your master project deliverables for recruitment.";
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto relative bg-darkBg text-white">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-1">
            <BarChart2 className="text-neonPurple" size={32} /> 
            Deep Analytics Hub
          </h1>
          <p className="text-gray-400 text-sm">Real-time statistics and execution analytics for: <span className="text-neonBlue font-semibold">{activeRoadmapTimeline}</span></p>
        </div>

        {/* Top KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Level progress */}
          <Card className="border-t-2 border-t-neonPurple/70 flex flex-col justify-between p-4 h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Consultant Status</p>
                <h3 className="text-xl font-bold text-neonPurple mt-1">{user?.level || "Novice"}</h3>
              </div>
              <Award className="text-neonPurple/80" size={24} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{user?.xp || 0} XP Total</span>
                <span>{levelProgress.label}</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-neonPurple h-full transition-all duration-500" style={{ width: `${levelProgress.percent}%` }} />
              </div>
            </div>
          </Card>

          {/* Card 2: Goal progress */}
          <Card className="border-t-2 border-t-neonBlue/70 flex flex-col justify-between p-4 h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Roadmap Execution</p>
                <h3 className="text-2xl font-bold text-neonBlue mt-1">{globalPercentage}%</h3>
              </div>
              <Target className="text-neonBlue/80" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">{completedCount} of {totalTasksCount} tasks complete</p>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-neonBlue h-full transition-all duration-500" style={{ width: `${globalPercentage}%` }} />
              </div>
            </div>
          </Card>

          {/* Card 3: Project Execution */}
          <Card className="border-t-2 border-t-emerald-500/70 flex flex-col justify-between p-4 h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Portfolio Matrix</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">{projectPercentage}%</h3>
              </div>
              <FolderGit className="text-emerald-400/80" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">{completedProjects} of {totalProjects} projects built</p>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${projectPercentage}%` }} />
              </div>
            </div>
          </Card>

          {/* Card 4: Daily study capacity */}
          <Card className="border-t-2 border-t-amber-500/70 flex flex-col justify-between p-4 h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Daily Commitment</p>
                <h3 className="text-xl font-bold text-amber-400 mt-1">Study Target</h3>
              </div>
              <Clock className="text-amber-400/80" size={24} />
            </div>
            <div className="border-t border-glassBorder pt-2 mt-2">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Learning / Practice / Revision</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                {latestResult.dailyPlan?.learning ? `L: ${latestResult.dailyPlan.learning.slice(0, 20)}... | P: ${latestResult.dailyPlan.practice.slice(0, 20)}...` : "Active split configured"}
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Phase completion bar chart */}
          <Card className="p-6 flex flex-col border-glassBorder bg-black/40">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-neonBlue" />
              Phase-wise Completion Rates
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val}%`} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} 
                    itemStyle={{ color: '#3b82f6' }}
                    formatter={(value) => [`${value}%`, 'Completion']}
                  />
                  <Bar dataKey="Percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weekly sprints progression area chart */}
          <Card className="p-6 flex flex-col border-glassBorder bg-black/40">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-neonPurple" />
              Weekly Sprint Progress
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} 
                    itemStyle={{ color: '#a855f7' }}
                    formatter={(value) => [`${value}%`, 'Completion']}
                  />
                  <Area type="monotone" dataKey="Percentage" stroke="#a855f7" fillOpacity={1} fill="url(#colorPercentage)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Insight and Recommendations */}
        <section className="bg-black/60 p-6 rounded-2xl border border-glassBorder shadow-[0_5px_20px_rgba(0,0,0,0.3)]">
          <h3 className="text-lg font-bold mb-3 text-neonBlue flex items-center gap-2">
            <CheckSquare size={20} />
            Mentor Analysis & Core Strategy Recommendations
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed font-sans pl-2 border-l-2 border-neonBlue/50">
            {getProgressInsight(globalPercentage)}
          </p>
        </section>

      </div>
    </div>
  );
};

export default Analytics;
