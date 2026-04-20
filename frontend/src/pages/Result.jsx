import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import ChatWidget from '../components/ChatWidget';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Map, Download, CheckCircle, Clock, ChevronDown, ChevronUp, Code, Database, Compass, BrainCircuit, GitCommit } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ExpandableListCard = ({ title, items, icon, checkedTasks, toggleTask, colorClass }) => {
  const [isOpen, setIsOpen] = useState(true);
  const total = items?.length || 0;
  const completed = items?.filter(s => checkedTasks.includes(s)).length || 0;

  return (
    <Card className={`h-full border-t-2 ${colorClass} hover:border-t-4 transition-all flex flex-col cursor-pointer`}>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            {icon} {title}
          </h3>
        </div>
        {total > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <span>{completed}/{total} completed</span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && items && items.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-3 border-t border-glassBorder mt-2 overflow-hidden">
            <ul className="text-gray-300 text-sm space-y-2">
              {items.map((step, j) => {
                const isChecked = checkedTasks.includes(step);
                return (
                  <li key={j} className="flex items-start gap-2 group hover:text-white" onClick={(e) => { e.stopPropagation(); toggleTask(step); }}>
                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-neonBlue border-neonBlue' : 'border-gray-500 group-hover:border-neonBlue'}`}>
                      {isChecked && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <span className={`transition-all break-words ${isChecked ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      {step}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useContext(AuthContext);
  const data = location.state?.resultData;

  const [checkedTasks, setCheckedTasks] = useState(data?.checkedTasks || []);
  const [toastStr, setToastStr] = useState(null);

  if (!data) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="text-center">
            <h2 className="text-xl mb-4 font-bold">No roadmap found.</h2>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </Card>
        </div>
      </div>
    );
  }

  const { masterplanTimeline, goal, phases, weeklyPlan, dailyPlan, projects, progressMetrics, _id, chatHistory } = data;

  const toggleTask = async (taskString) => {
    const newChecked = checkedTasks.includes(taskString) 
      ? checkedTasks.filter(t => t !== taskString) 
      : [...checkedTasks, taskString];
    setCheckedTasks(newChecked);

    try {
      const res = await api.post(`/decision/task/${_id}`, { taskString });
      if (res.data.success) {
        updateUser({ xp: res.data.xp, level: res.data.level });
        if (res.data.leveledUp) {
          setToastStr(`\uD83C\uDF89 CONSULTANT RANK UP: ${res.data.level.toUpperCase()}! \uD83C\uDF89`);
          setTimeout(() => setToastStr(null), 4000);
        } else if (res.data.xpGain > 0) {
          setToastStr(`+${res.data.xpGain} XP Gained!`);
          setTimeout(() => setToastStr(null), 2000);
        }
      }
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  // Extract all trackable sub-strings
  const allTrackableStrings = [];
  phases?.forEach(p => {
    p.focusAreas?.forEach(f => allTrackableStrings.push(`[Focus] ${p.name}: ${f}`));
    p.skillsToLearn?.forEach(s => allTrackableStrings.push(`[Skill] ${p.name}: ${s}`));
  });
  weeklyPlan?.forEach(w => {
    w.practiceTasks?.forEach(pt => allTrackableStrings.push(`Week ${w.week}: ${pt}`));
    w.smallDeliverables?.forEach(sd => allTrackableStrings.push(`Deliverable ${w.week}: ${sd}`));
  });
  projects?.forEach(p => allTrackableStrings.push(`Project: ${p.title}`));

  const totalTasksCount = allTrackableStrings.length;
  // Calculate completion by seeing how many checkedTasks match our trackable array
  const completedCount = allTrackableStrings.filter(s => checkedTasks.includes(s)).length;
  const progressPercent = totalTasksCount === 0 ? 0 : Math.round((completedCount / totalTasksCount) * 100);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-darkBg">
      <Sidebar />
      <div className="flex-1 py-8 px-4 md:px-12 overflow-y-auto relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neonBlue to-emerald-400 bg-clip-text text-transparent print:text-black">Execution Blueprint</h1>
          <button className="btn-secondary flex items-center gap-2 print:hidden" onClick={() => window.print()}>
            <Download size={18} /> Export PDF
          </button>
        </div>

        <AnimatePresence>
          {toastStr && (
            <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="fixed top-20 right-1/2 translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)] z-50 pointer-events-none">
              {toastStr}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Progress Gauge */}
        <div className="mb-8 p-4 glass-panel flex items-center gap-4 border border-glassBorder shadow-[0_0_15px_rgba(52,211,153,0.15)] bg-emerald-900/10">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-700" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-emerald-400 transition-all duration-500 ease-out"
                strokeDasharray="175" strokeDashoffset={175 - (175 * Math.min(progressPercent, 100)) / 100} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-emerald-400">{Math.min(progressPercent, 100)}%</div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-emerald-300">Master Execution Tracker</h3>
            <p className="text-sm text-gray-400">Velocity driven. Completing your Phases, Weekly sprints, and Projects drives this engine forward.</p>
          </div>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
          
          {/* Consultant's Masterplan Letter */}
          {masterplanTimeline && (
            <section className="bg-black/60 p-8 rounded-2xl border-l-4 border-l-emerald-500 border-y border-r border-y-glassBorder border-r-glassBorder shadow-[0_5px_30px_rgba(52,211,153,0.1)] relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center border-2 border-white/20 shrink-0">
                  <BrainCircuit size={20} className="text-white" />
                </div>
                <span className="bg-gradient-to-r from-emerald-300 to-teal-500 bg-clip-text text-transparent">Consultant's Ground-Zero Narrative</span>
              </h2>
              <div className="text-gray-300 leading-relaxed font-serif text-lg tracking-wide whitespace-pre-line pl-2 border-l-2 border-emerald-900/50">
                {masterplanTimeline}
              </div>
            </section>
          )}

           {/* Goal Definition */}
           {goal && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Target className="text-red-400"/> 
                  <span className="bg-gradient-to-r from-red-400 to-rose-600 bg-clip-text text-transparent">Primary Objective</span>
                </h2>
                <Card className="border-l-4 border-l-red-500 bg-red-900/10 mb-10">
                   <h3 className="text-xl font-bold text-red-100 mb-2">{goal.description}</h3>
                   <div className="text-sm text-gray-400 mb-2 font-bold">Expected Outcomes:</div>
                   <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                     {goal.expectedOutcomes?.map((out, oIdx) => <li key={oIdx}>{out}</li>)}
                   </ul>
                </Card>
              </section>
           )}

           {/* Flowchart Visualizer */}
           {phases && phases.length > 0 && (
             <section className="hidden md:block mb-12">
               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                 <GitCommit className="text-blue-400"/>
                 <span className="bg-gradient-to-r from-blue-300 to-indigo-500 bg-clip-text text-transparent">Strategic Flowchart</span>
               </h2>
               <div className="relative flex justify-between items-start bg-black/40 p-8 rounded-2xl border border-glassBorder shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                 {/* Connecting Line */}
                 <div className="absolute top-14 left-16 right-16 h-1 bg-gradient-to-r from-blue-900 via-emerald-800 to-indigo-900 z-0"></div>
                 
                 {phases.map((phase, i) => {
                   const phaseTasks = [
                     ...((phase.focusAreas || []).map(f => `[Focus] ${phase.name}: ${f}`)), 
                     ...((phase.skillsToLearn || []).map(s => `[Skill] ${phase.name}: ${s}`))
                   ];
                   const isCompleted = phaseTasks.length > 0 && phaseTasks.every(t => checkedTasks.includes(t));
                   
                   return (
                     <div key={i} className="relative z-10 flex flex-col items-center group w-32">
                       <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center mb-3 transition-all ${isCompleted ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'bg-darkBg border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-110 group-hover:border-emerald-400'}`}>
                         {isCompleted ? <CheckCircle size={20} className="text-emerald-400" /> : <span className="font-bold text-white">{i + 1}</span>}
                       </div>
                       <div className="text-center">
                         <h4 className={`text-sm font-bold transition-colors break-words ${isCompleted ? 'text-emerald-400' : 'text-gray-200 group-hover:text-white'}`}>{phase.name}</h4>
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${isCompleted ? 'text-emerald-900 bg-emerald-400/80' : 'text-blue-400 bg-blue-900/30'}`}>{phase.duration}</span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </section>
           )}

          {/* Phase Mapping */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Map className="text-amber-400"/> 
              <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">Chronological Phases</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {phases?.map((phase, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <ExpandableListCard 
                    title={`${phase.name} (${phase.duration})`}
                    colorClass="border-amber-500/50"
                    icon={<Compass size={18} className="text-amber-400"/>}
                    items={[
                      ...((phase.focusAreas || []).map(f => `[Focus] ${phase.name}: ${f}`)), 
                      ...((phase.skillsToLearn || []).map(s => `[Skill] ${phase.name}: ${s}`))
                    ]}
                    checkedTasks={checkedTasks}
                    toggleTask={toggleTask}
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Daily Architecture */}
          {dailyPlan && (
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Clock className="text-cyan-400"/> 
                <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">Daily Architecture Split</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-t-2 border-t-cyan-400"><div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Learning Block</div><div className="text-sm text-cyan-100 break-words">{dailyPlan.learning}</div></Card>
                <Card className="border-t-2 border-t-purple-400"><div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Practice Block</div><div className="text-sm text-purple-100 break-words">{dailyPlan.practice}</div></Card>
                <Card className="border-t-2 border-t-pink-400"><div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Revision Block</div><div className="text-sm text-pink-100 break-words">{dailyPlan.revision}</div></Card>
              </div>
            </section>
          )}

          {/* Deep Projects Matrix */}
          <section>
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
               <Database className="text-indigo-400" /> 
               <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Portfolio Project Matrix</span>
             </h2>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {projects?.map((proj, i) => {
                  const pTaskStr = `Project: ${proj.title}`;
                  const isChecked = checkedTasks.includes(pTaskStr);
                  return (
                    <motion.div key={i} variants={itemVariants}>
                      <Card className={`h-full border border-indigo-500/20 hover:border-indigo-500/50 transition-all ${isChecked ? 'bg-indigo-900/20 opacity-50' : ''}`} >
                         <div className="flex justify-between items-start mb-3 cursor-pointer group" onClick={() => toggleTask(pTaskStr)}>
                           <h3 className={`font-bold text-lg ${isChecked ? 'line-through text-gray-500' : 'text-indigo-200 group-hover:text-white'}`}>{proj.title}</h3>
                           <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'}`}>
                             {isChecked && <CheckCircle size={14} className="text-white" />}
                           </div>
                         </div>
                         <div className="text-xs font-bold text-gray-500 mb-1">TECH STACK:</div>
                         <div className="flex flex-wrap gap-2 mb-3">
                           {proj.techStack?.map((t, idx) => <span key={idx} className="bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded text-[10px] uppercase">{t}</span>)}
                         </div>
                         <p className="text-sm text-gray-400">{proj.applicationDemonstration}</p>
                      </Card>
                    </motion.div>
                  )
                })}
             </div>
          </section>

          {/* Weekly Setup */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Code className="text-emerald-400"/> 
              <span className="bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">Initial Sprint Iterations</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weeklyPlan?.map((week, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="h-full border-t-2 border-t-emerald-400/50 hover:border-t-emerald-400 transition-colors p-4">
                    <h3 className="font-bold text-lg mb-1 text-emerald-300">Week {week.week}</h3>
                    <p className="text-xs text-gray-400 mb-3 pb-2 border-b border-glassBorder">{week.focus}</p>
                    
                    <div className="text-xs uppercase font-bold text-emerald-500/70 mb-2">Tasks</div>
                    <ul className="text-gray-300 text-sm space-y-2 mb-4">
                      {week.practiceTasks?.map((task, j) => {
                        const tStr = `Week ${week.week}: ${task}`;
                        const isChecked = checkedTasks.includes(tStr);
                        return (
                          <li key={j} className="flex items-start gap-2 cursor-pointer group" onClick={() => toggleTask(tStr)}>
                            <div className={`mt-0.5 w-3 h-3 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 group-hover:border-emerald-400'}`}></div>
                            <span className={`text-xs leading-tight ${isChecked ? 'line-through text-gray-600' : 'group-hover:text-white'}`}>{task}</span>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="text-xs uppercase font-bold text-yellow-500/70 mb-2">Deliverables</div>
                    <ul className="text-gray-300 text-sm space-y-2">
                      {week.smallDeliverables?.map((deliv, j) => {
                        const dStr = `Deliverable ${week.week}: ${deliv}`;
                        const isChecked = checkedTasks.includes(dStr);
                        return (
                          <li key={j} className="flex items-start gap-2 cursor-pointer group" onClick={() => toggleTask(dStr)}>
                            <div className={`mt-0.5 w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${isChecked ? 'bg-yellow-500 border-yellow-500' : 'border-gray-500 group-hover:border-yellow-400'}`}></div>
                            <span className={`text-xs leading-tight ${isChecked ? 'line-through text-gray-600' : 'group-hover:text-white text-gray-400'}`}>{deliv}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

        </motion.div>

        <ChatWidget recommendationId={_id} initialHistory={chatHistory} />

      </div>
    </div>
  );
};

export default Result;
