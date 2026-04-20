import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Loader from '../components/Loader';
import api from '../services/api';
import { BookOpen, ExternalLink, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const Resources = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetchLatestResources();
  }, []);

  const fetchLatestResources = async () => {
    try {
      const res = await api.get('/decision/history');
      if (res.data.success && res.data.data.length > 0) {
        const latest = res.data.data[0];
        let aggregated = [];
        latest.skillRoadmap.forEach(skillObj => {
          if (skillObj.resources && skillObj.resources.length > 0) {
            aggregated.push({ skill: skillObj.skill, items: skillObj.resources });
          }
        });
        setResources(aggregated);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Assembling Consultant Resources..." />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neonBlue to-neonPurple flex items-center justify-center border-2 border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <BookOpen className="text-white" size={24} />
            </div>
            Consultant's Resource Library
          </h1>
        </div>

        {resources.length === 0 ? (
          <Card className="text-center py-20 flex flex-col items-center justify-center border border-neonPurple/20">
            <GraduationCap className="text-gray-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-2">No Active Resources</h2>
            <p className="text-gray-400">Generate an AI strategy first. Your consultant will automatically bind relevant study materials here.</p>
          </Card>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resBlock, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="h-full border-t-4 border-t-neonBlue/50 hover:border-t-neonBlue transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-neonBlue/5 rounded-full blur-2xl group-hover:bg-neonBlue/10 transition-colors" />
                  <h3 className="font-bold text-lg mb-4 text-gray-100 flex items-center gap-2 border-b border-glassBorder pb-2">
                    {resBlock.skill}
                  </h3>
                  <ul className="space-y-3">
                    {resBlock.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <ExternalLink size={16} className="text-neonBlue shrink-0 mt-0.5" />
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(item)}`} target="_blank" rel="noreferrer" className="hover:text-neonPurple hover:underline transition-colors leading-tight">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Resources;
