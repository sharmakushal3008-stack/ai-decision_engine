import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ text = "Processing..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 border-4 border-neonBlue/30 border-t-neonBlue rounded-full mb-4"
    />
    <p className="text-gray-400 animate-pulse">{text}</p>
  </div>
);

export default Loader;
