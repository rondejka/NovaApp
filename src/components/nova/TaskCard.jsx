import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Bot, GripVertical, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageProvider';

export default function TaskCard({ task, onDelegate, onEdit, onDelete, draggable = false, index = 0, cost }) {
  const { t } = useLanguage();
  
  const categoryConfig = {
    personal: { emoji: '👤', color: 'from-violet-300 to-purple-400', label: t('task.categories.personal') },
    children: { emoji: '👶', color: 'from-pink-300 to-rose-400', label: t('task.categories.children') },
    sport: { emoji: '🏃‍♀️', color: 'from-emerald-300 to-teal-400', label: t('task.categories.sport') },
    work: { emoji: '💼', color: 'from-blue-300 to-indigo-400', label: t('task.categories.work') },
    relax: { emoji: '🧘‍♀️', color: 'from-amber-300 to-orange-400', label: t('task.categories.relax') },
    health: { emoji: '❤️', color: 'from-rose-300 to-red-400', label: t('task.categories.health') },
    learning: { emoji: '📚', color: 'from-indigo-300 to-violet-400', label: t('task.categories.learning') },
    household: { emoji: '🏠', color: 'from-teal-300 to-cyan-400', label: t('task.categories.household') },
  };

  const config = categoryConfig[task.category] || categoryConfig.personal;
  const isRobot = task.assigned_to === 'robot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border transition-all shadow-sm ${
        isRobot 
          ? 'border-purple-200 hover:border-purple-300' 
          : 'border-rose-100 hover:border-rose-200'
      }`}
    >
      {draggable && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="w-4 h-4 text-rose-300" />
        </div>
      )}

      <div className={`flex items-start gap-3 ${draggable ? 'pl-4' : ''}`}>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-lg shrink-0 shadow-sm`}>
          {config.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-rose-800 font-medium truncate">{task.title}</h4>
              <span className="text-rose-400 text-xs">{config.label}</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              isRobot 
                ? 'bg-purple-100 text-purple-600' 
                : 'bg-rose-100 text-rose-600'
            }`}>
              {isRobot ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {isRobot ? 'Robot' : 'Ty'}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            {task.start_time && (
              <div className="flex items-center gap-1 text-rose-400 text-sm">
                <Clock className="w-3.5 h-3.5" />
                {task.start_time}
                {task.end_time && ` - ${task.end_time}`}
              </div>
            )}
            {task.duration_minutes && (
              <span className="text-rose-300 text-xs">
                {task.duration_minutes} min
              </span>
            )}
            {isRobot && (cost || task.estimated_cost) && (
              <span className="text-emerald-500 text-xs font-medium">
                {(Number(cost || task.estimated_cost)).toFixed(2)}€
              </span>
            )}
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 pt-3 border-t border-rose-100 flex items-center gap-2"
      >
        {!isRobot && onDelegate && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelegate(task)}
            className="flex-1 text-purple-500 hover:text-purple-600 hover:bg-purple-50"
          >
            <Bot className="w-4 h-4 mr-2" />
            Delegovať
          </Button>
        )}
        {onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task)}
            className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task)}
            className="text-red-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}