import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Loader from '../components/Loader';
import api from '../services/api';
import { Sparkles, Calendar, Star, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [errorStr, setErrorStr] = useState(null);

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
      console.log("No history found");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/decision/generate');
      if (res.data.success) {
        navigate('/result', { state: { resultData: res.data.data } });
      }
    } catch (err) {
      console.error(err);
      setErrorStr(err.response?.data?.message || "Generation failed. Did you finish your profile setup?");
      setTimeout(() => {
        setErrorStr(null);
        navigate('/profile');
      }, 3000);
    } finally {
      setGenerating(false);
    }
  };

  const handleRating = async (id, rating) => {
    try {
      await api.post(`/decision/rate/${id}`, { rating });
      fetchHistory(); 
    } catch (err) {
      console.error("Failed to rate");
    }
  };

  if (loading) return <Loader text="Loading your analytics..." />;

  const latestResult = history.length > 0 ? history[0] : null;

  // Chart 1: Progress Ring
  let totalTasks = 0;
  let completedTasks = latestResult?.checkedTasks?.length || 0;
  if (latestResult) {
    latestResult.phases?.forEach(p => { totalTasks += (p.focusAreas?.length || 0) + (p.skillsToLearn?.length || 0); });
    latestResult.weeklyPlan?.forEach(w => { totalTasks += (w.practiceTasks?.length || 0) + (w.smallDeliverables?.length || 0); });
    totalTasks += (latestResult.projects?.length || 0);
  }
  const pendingTasks = totalTasks - completedTasks;
  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks > 0 ? pendingTasks : (totalTasks === 0 ? 1 : 0) }
  ];
  const PIE_COLORS = ['#10b981', '#1e293b']; // Emerald for Execution

  // Chart 2: Progress Metrics Bar
  const barData = [
    { name: "Projects", Value: latestResult?.progressMetrics?.projectsToComplete || 0 },
    { name: "Problems", Value: latestResult?.progressMetrics?.problemsToSolve || 0 },
    { name: "Skills", Value: latestResult?.progressMetrics?.skillsToAchieve || 0 }
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto relative">
        <AnimatePresence>
          {errorStr && (
            <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="fixed top-20 right-1/2 translate-x-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] z-50 pointer-events-none">
              {errorStr}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Data Hub: <span className="text-neonBlue">{user?.name}</span></h1>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2 font-bold px-6 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            {generating ? <span className="animate-pulse">Accessing Gemini AI...</span> : <><Sparkles size={18} /> Initialize Gemini Strategy</>}
          </button>
        </div>

        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="h-64 flex flex-col items-center justify-center border-emerald-500/20">
              <h3 className="font-bold mb-2 flex items-center gap-2"><PieIcon size={18} className="text-emerald-400"/> Goal Execution Velocity</h3>
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#064e3b' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400">{completedTasks} / {totalTasks} Sub-tasks Completed</p>
            </Card>

            <Card className="h-64 flex flex-col items-center justify-center border-indigo-500/20">
              <h3 className="font-bold mb-2 flex items-center gap-2"><BarChart2 size={18} className="text-indigo-400"/> Quantified Metrics Target</h3>
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#312e81' }} itemStyle={{ color: '#818cf8' }} />
                    <Bar dataKey="Value" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400">Total requirements generated by Consultant Blueprint</p>
            </Card>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4 border-b border-glassBorder pb-2">Generation Timeline Log</h2>
        
        {history.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400 mb-4">You haven't generated any AI roadmaps yet.</p>
            <button onClick={handleGenerate} className="text-neonBlue underline hover:text-neonPurple transition-colors">Start your first generation</button>
          </Card>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-glassBorder before:to-transparent">
            {history.map((rec, index) => (
              <motion.div key={rec._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-glassBorder bg-darkBg text-slate-500 group-[.is-active]:text-neonPurple shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Calendar size={18} />
                </div>
                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
                  <div className="flex justify-between flex-wrap gap-2 mb-2">
                    <span className="text-sm font-semibold text-neonBlue">{new Date(rec.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => handleRating(rec._id, star)} className={`${rec.rating >= star ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300 transition-colors`}>
                          <Star fill={rec.rating >= star ? 'currentColor' : 'none'} size={16} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <h3 className="font-bold mb-2 cursor-pointer hover:text-neonBlue transition-colors" onClick={() => navigate('/result', { state: { resultData: rec } })}>
                    Target: {user?.name}'s Executive Path
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{rec.goal?.description || "Mastering the required execution modules."}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
