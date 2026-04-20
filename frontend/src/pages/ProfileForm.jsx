import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import Card from '../components/Card';
import Loader from '../components/Loader';

const ProfileForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorStr, setErrorStr] = useState(null);
  const [profile, setProfile] = useState({
    currentSkills: '',
    currentLevel: 'Intermediate',
    targetRole: '',
    timeAvailableMonths: 6,
    dailyStudyHours: 2
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.data.success) {
          setProfile({
            ...res.data.data,
            currentSkills: res.data.data.currentSkills?.join(', ') || ''
          });
        }
      } catch (err) {
        console.log("No existing profile found, proceed with creation.");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...profile,
        currentSkills: profile.currentSkills.split(',').map(s => s.trim()).filter(s => s),
        timeAvailableMonths: Number(profile.timeAvailableMonths),
        dailyStudyHours: Number(profile.dailyStudyHours)
      };
      await api.post('/user/profile', payload);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrorStr(err.response?.data?.message || "Failed to save profile. Please try again.");
      setTimeout(() => setErrorStr(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  if (loading) return <Loader text="Saving your profile..." />;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative z-10">
      <AnimatePresence>
        {errorStr && (
          <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="fixed top-20 right-1/2 translate-x-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] z-50 pointer-events-none">
            {errorStr}
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full max-w-lg relative overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-1 absolute top-0 left-0">
          <div className="bg-neonBlue h-1 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center mt-4">Complete Your Profile</h2>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">What are your current skills? (comma separated)</label>
                  <input type="text" name="currentSkills" value={profile.currentSkills} onChange={handleChange} required placeholder="e.g. JavaScript, React, Python"
                    className="w-full bg-black/30 border border-glassBorder rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">What is your current experience level?</label>
                  <select name="currentLevel" value={profile.currentLevel} onChange={handleChange}
                    className="w-full bg-black/30 border border-glassBorder rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue transition-colors">
                    <option value="Beginner" className="bg-darkBg">Beginner</option>
                    <option value="Intermediate" className="bg-darkBg">Intermediate</option>
                    <option value="Advanced" className="bg-darkBg">Advanced</option>
                  </select>
                </div>
                <button type="button" onClick={nextStep} className="btn-primary mt-4 py-3">Next Step</button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm justify-between flex text-gray-400 mb-2">
                    What is your Target Role? <span className="text-neonPurple text-xs">Specific or General</span>
                  </label>
                  <input type="text" name="targetRole" value={profile.targetRole} onChange={handleChange} required placeholder="e.g. Senior Machine Learning Engineer, Lead Data Scientist"
                    className="w-full bg-black/30 border border-glassBorder rounded-lg p-3 text-white focus:outline-none focus:border-neonPurple transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2 mt-2">How many months do you have to achieve this?</label>
                  <input type="number" min="1" max="60" name="timeAvailableMonths" value={profile.timeAvailableMonths} onChange={handleChange} required
                    className="w-full bg-black/30 border border-glassBorder rounded-lg p-3 text-white focus:outline-none focus:border-neonPurple transition-colors" />
                </div>
                <div className="flex gap-4 mt-4">
                  <button type="button" onClick={prevStep} className="btn-secondary py-3 flex-1">Back</button>
                  <button type="button" onClick={nextStep} className="btn-primary py-3 flex-1 bg-neonPurple/20 text-neonPurple border-neonPurple/50 hover:bg-neonPurple/40">Next Step</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">How many hours can you dedicate EVERY DAY to studying?</label>
                  <input type="number" min="1" max="16" name="dailyStudyHours" value={profile.dailyStudyHours} onChange={handleChange} required
                    className="w-full bg-black/30 border border-glassBorder rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue transition-colors font-bold text-xl text-center" />
                </div>
                <div className="flex gap-4 mt-4">
                  <button type="button" onClick={prevStep} className="btn-secondary py-3 flex-1">Back</button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-neonBlue to-emerald-400 text-white hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(52,211,153,0.5)]">Generate Masterplan</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Card>
    </div>
  );
};

export default ProfileForm;
