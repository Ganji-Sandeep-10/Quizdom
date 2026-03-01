import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, Github, Sparkles, Info, MessageCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: <Github className="w-5 h-5" />, label: 'GitHub', to: 'https://github.com/Ganji-Sandeep-10/QuizMeter' },
    { icon: <Sparkles className="w-5 h-5" />, label: 'Features', to: '/features' },
    { icon: <Info className="w-5 h-5" />, label: 'About', to: '/about' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'FAQ', to: '/faq' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex flex-col items-end gap-3 mb-2"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.to}
                  className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-4 py-2.5 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all group"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                  <div className="w-8 h-8 rounded-full bg-black dark:bg-zinc-100 flex items-center justify-center text-white dark:text-black">
                    {item.icon}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-black dark:bg-zinc-100 flex items-center justify-center text-white dark:text-black shadow-2xl hover:bg-gray-900 dark:hover:bg-zinc-200 transition-colors"
      >
        {isOpen ? (
          <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
          >
            <X className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
          >
            <ArrowUpRight className="w-6 h-6" />
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
