import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flower2, Timer } from 'lucide-react';

export default function BloomStepCard({ step, onComplete, index = 0 }) {
  const categoryColors = {
    health: 'from-emerald-200 to-teal-300',
    mindfulness: 'from-violet-200 to-purple-300',
    productivity: 'from-blue-200 to-indigo-300',
    relationships: 'from-rose-200 to-pink-300',
    'self-care': 'from-amber-200 to-orange-300',
  };

  const categoryBg = {
    health: 'bg-emerald-50',
    mindfulness: 'bg-violet-50',
    productivity: 'bg-blue-50',
    relationships: 'bg-rose-50',
    'self-care': 'bg-amber-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl p-4 border ${
        step.is_completed 
          ? 'bg-emerald-50 border-emerald-200' 
          : `bg-gradient-to-r ${categoryColors[step.category] || 'from-rose-200 to-pink-300'} border-white/50`
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Flower2 className={`w-4 h-4 ${step.is_completed ? 'text-emerald-500' : 'text-white'}`} />
            <span className={`text-xs font-medium uppercase tracking-wide ${
              step.is_completed ? 'text-emerald-500' : 'text-white/80'
            }`}>
              BloomStep
            </span>
          </div>
          <h4 className={`font-semibold ${step.is_completed ? 'text-emerald-700 line-through' : 'text-white'}`}>
            {step.title}
          </h4>
          {step.description && (
            <p className={`text-sm mt-1 ${step.is_completed ? 'text-emerald-500' : 'text-white/80'}`}>
              {step.description}
            </p>
          )}
          {step.duration_minutes && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              step.is_completed ? 'text-emerald-500' : 'text-white/70'
            }`}>
              <Timer className="w-3 h-3" />
              {step.duration_minutes} min
            </div>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onComplete(step)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            step.is_completed 
              ? 'bg-emerald-500 text-white' 
              : 'bg-white/30 text-white hover:bg-white/40'
          }`}
        >
          <Check className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}