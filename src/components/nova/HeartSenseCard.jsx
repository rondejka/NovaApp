import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Sun, CloudRain, Zap, Moon } from 'lucide-react';

const moods = [
  { key: 'excellent', label: 'Výborne', icon: Sparkles, color: 'from-emerald-300 to-teal-400', bg: 'bg-emerald-100' },
  { key: 'good', label: 'Dobre', icon: Sun, color: 'from-amber-300 to-orange-400', bg: 'bg-amber-100' },
  { key: 'neutral', label: 'Neutrálne', icon: Moon, color: 'from-slate-300 to-slate-400', bg: 'bg-slate-100' },
  { key: 'tired', label: 'Unavená', icon: CloudRain, color: 'from-blue-300 to-indigo-400', bg: 'bg-blue-100' },
  { key: 'stressed', label: 'V strese', icon: Zap, color: 'from-rose-300 to-pink-400', bg: 'bg-rose-100' },
];

export default function HeartSenseCard({ currentMood, onMoodChange }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-gradient-to-br from-rose-300 to-pink-400">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-rose-800 font-semibold">HeartSense™</h3>
          <p className="text-rose-400 text-xs">Ako sa dnes cítiš?</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {moods.map((mood, i) => {
          const Icon = mood.icon;
          const isSelected = currentMood === mood.key;
          return (
            <motion.button
              key={mood.key}
              onClick={() => onMoodChange(mood.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isSelected 
                  ? `bg-gradient-to-r ${mood.color} text-white shadow-md` 
                  : `${mood.bg} text-rose-600 hover:opacity-80`
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{mood.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}