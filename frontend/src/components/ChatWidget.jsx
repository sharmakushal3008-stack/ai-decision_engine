import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import api from '../services/api';

const ChatWidget = ({ recommendationId, initialHistory = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', message: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post(`/decision/chat/${recommendationId}`, { message: userMessage.message });
      if (res.data.success) {
        setMessages(res.data.chatHistory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 h-[30rem] glass-panel border-neonPurple/30 flex flex-col shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            <div className="p-4 border-b border-glassBorder flex justify-between items-center bg-black/20 rounded-t-2xl">
              <h3 className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                AI Mentor
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-10">Ask me anything about your roadmap!</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-neonBlue/20 text-blue-100 rounded-br-none' : 'bg-black/40 text-gray-200 rounded-bl-none'}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-black/40 text-gray-400 p-3 rounded-lg rounded-bl-none text-sm animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-glassBorder bg-black/20 rounded-b-2xl flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-black/40 border border-glassBorder rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neonPurple"
              />
              <button type="submit" disabled={loading || !input.trim()} className="bg-neonPurple/20 text-neonPurple p-2 rounded-lg hover:bg-neonPurple/40 disabled:opacity-50 transition-colors">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-neonBlue to-neonPurple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] cursor-pointer"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
