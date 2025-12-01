import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Clock, Euro, Battery, BatteryCharging, Zap } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

const categoryIcons = {
  personal: '👤',
  children: '👶',
  sport: '🏃‍♀️',
  work: '💼',
  relax: '🧘‍♀️',
  health: '❤️',
  learning: '📚',
  household: '🏠',
  recharge: '🔋',
};

const categoryColors = {
  personal: 'bg-red-400', // Included in relationships concept
  children: 'bg-red-400',
  relationships: 'bg-red-500', // VZŤAHY - Červená
  sport: 'bg-green-500',
  health: 'bg-green-500', // ZDRAVIE - Zelená
  work: 'bg-purple-500', // PRÁCA - Fialová
  relax: 'bg-blue-400', // RELAX - Modrá
  recharge: 'bg-blue-500', // RELAX/RECHARGE - Modrá
  learning: 'bg-yellow-400', // UČENIE - Žltá
  household: 'bg-teal-400',
};

export default function FlowTimeline({ tasks = [], energyLevel = 7, highlightedCategories }) {
  const { t } = useLanguage();
  
  // Determine visual mode based on energy
  const mode = useMemo(() => {
    if (energyLevel < 5) return { 
        name: 'recharge', 
        label: 'Recharge Mode', 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-100',
        icon: BatteryCharging 
    };
    if (energyLevel > 7) return { 
        name: 'high', 
        label: 'High Performance', 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        border: 'border-orange-100',
        icon: Zap
    };
    return { 
        name: 'balanced', 
        label: 'Balanced Flow', 
        color: 'text-rose-600', 
        bg: 'bg-rose-50', 
        border: 'border-rose-100',
        icon: Battery 
    };
  }, [energyLevel]);

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Config constants
  const PIXELS_PER_MINUTE = 2.5;
  const MIN_TASK_WIDTH = 180;
  const START_HOUR = 5;
  const START_MINUTES = START_HOUR * 60; // 300
  const HOURS_COUNT = 20; // 5:00 to 24:00

  // Smart single-row layout that prevents overlaps by shifting items right
  const calculateSmartLayout = (taskList) => {
    if (!taskList.length) return { tasksWithLayout: [], totalWidth: 0 };

    // Sort by time
    const sorted = [...taskList].sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time));
    
    let lastEndPx = 0;
    const tasksWithLayout = sorted.map(task => {
      const startMins = parseTime(task.start_time);
      const duration = task.duration_minutes || 60;
      
      // Calculate ideal start position based on time
      let startPx = (startMins - START_MINUTES) * PIXELS_PER_MINUTE;
      if (startPx < 0) startPx = 0;

      // If this position overlaps with previous task, push it to the right
      if (startPx < lastEndPx + 10) { // 10px gap
        startPx = lastEndPx + 10;
      }

      // Calculate width
      let widthPx = duration * PIXELS_PER_MINUTE;
      if (widthPx < MIN_TASK_WIDTH) widthPx = MIN_TASK_WIDTH;

      const endPx = startPx + widthPx;
      lastEndPx = endPx;

      return {
        ...task,
        visual: { left: startPx, width: widthPx }
      };
    });

    // Calculate total container width needed (with some padding)
    const contentWidth = Math.max(lastEndPx + 100, HOURS_COUNT * 60 * PIXELS_PER_MINUTE);

    return { tasksWithLayout, totalWidth: contentWidth };
  };

  const humanTasksRaw = tasks.filter(t => t.assigned_to === 'human');
  const robotTasksRaw = tasks.filter(t => t.assigned_to === 'robot');

  const humanLayout = useMemo(() => calculateSmartLayout(humanTasksRaw), [humanTasksRaw]);
  const robotLayout = useMemo(() => calculateSmartLayout(robotTasksRaw), [robotTasksRaw]);
  
  // Use the larger width of the two timelines
  const containerWidth = Math.max(humanLayout.totalWidth, robotLayout.totalWidth, 1200);


  const hours = Array.from({ length: HOURS_COUNT }, (_, i) => i + START_HOUR);

  const ModeIcon = mode.icon;

  return (
    <div className={`backdrop-blur-xl rounded-3xl p-6 border shadow-sm transition-colors duration-500 ${mode.bg} ${mode.border}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div>
                <h3 className={`font-semibold text-lg ${mode.color}`}>{t('timeline.title')}</h3>
                <p className={`${mode.color} opacity-70 text-sm`}>{t('timeline.subtitle')}</p>
            </div>
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border ${mode.border} bg-white/50`}>
                <ModeIcon className={`w-4 h-4 ${mode.color}`} />
                <span className={`text-xs font-medium ${mode.color}`}>{mode.label}</span>
            </div>
        </div>

      </div>

      <div className="overflow-x-auto pb-4">
        <div style={{ width: `${containerWidth}px`, minWidth: '100%' }} className="relative px-4">
          {/* Time axis - Absolute positioning to match scale */}
          <div className="relative h-6 mb-2">
            {hours.map(h => {
                const mins = h * 60;
                const leftPx = (mins - START_MINUTES) * PIXELS_PER_MINUTE;
                return (
                    <div 
                        key={h} 
                        className={`absolute top-0 text-xs ${mode.color} opacity-60 transform -translate-x-1/2`}
                        style={{ left: `${leftPx}px` }}
                    >
                        {h}:00
                    </div>
                );
            })}
          </div>

          {/* Human timeline */}
          <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${energyLevel < 5 ? 'bg-emerald-200' : energyLevel > 7 ? 'bg-orange-200' : 'bg-rose-200'}`}>
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className={`text-sm font-medium ${mode.color}`}>{t('timeline.you')}</span>
        </div>
        
        <div 
            className="relative rounded-xl border bg-white/40 transition-all duration-300"
            style={{ 
                height: '100px',
                borderColor: mode.border.replace('border-', '') 
            }}
        >
          {/* Background grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {hours.map(h => {
                const mins = h * 60;
                const leftPx = (mins - START_MINUTES) * PIXELS_PER_MINUTE;
                return (
                    <div 
                        key={h} 
                        className={`absolute top-0 bottom-0 border-r ${mode.border} opacity-30`}
                        style={{ left: `${leftPx}px` }}
                    />
                );
            })}
          </div>

          {humanLayout.tasksWithLayout.map((task, i) => {
            const isDimmed = highlightedCategories && !highlightedCategories.includes(task.category);
            return (
              <motion.div
                key={task.id || i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isDimmed ? 0.3 : 1, 
                  scale: isDimmed ? 0.95 : 1,
                  filter: isDimmed ? 'grayscale(80%)' : 'none',
                  left: task.visual.left,
                  width: task.visual.width
                }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                className={`absolute ${categoryColors[task.category]} rounded-lg px-3 py-2 shadow-sm hover:z-50 hover:shadow-xl transition-all cursor-default group border border-white/20`}
                style={{ 
                    top: '10px',
                    height: '80px'
                }}
              >
                <div className="flex flex-col justify-center gap-1 h-full overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="shrink-0 text-sm">{categoryIcons[task.category]}</span>
                    <span className="text-[10px] opacity-90 font-mono whitespace-nowrap bg-black/10 px-1.5 rounded-full">
                      {task.start_time}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium leading-tight line-clamp-2">
                    {task.title}
                  </span>
                </div>
              </motion.div>
            );
          })}
          
          {humanTasksRaw.length === 0 && (
             <div className={`absolute inset-0 flex items-center justify-center ${mode.color} opacity-40 text-sm`}>
                {t('home.noTasks')}
             </div>
          )}
        </div>
      </div>

      {/* Robot timeline */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-purple-200 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <span className={`text-sm font-medium ${mode.color}`}>{t('timeline.robots')}</span>
        </div>
        
        <div 
            className="relative rounded-xl border bg-white/40 transition-all duration-300"
            style={{ 
                height: '100px',
                borderColor: mode.border.replace('border-', '') 
            }}
        >
          {/* Background grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {hours.map(h => {
                const mins = h * 60;
                const leftPx = (mins - START_MINUTES) * PIXELS_PER_MINUTE;
                return (
                    <div 
                        key={h} 
                        className={`absolute top-0 bottom-0 border-r ${mode.border} opacity-30`}
                        style={{ left: `${leftPx}px` }}
                    />
                );
            })}
          </div>

          {robotLayout.tasksWithLayout.map((task, i) => {
            const isDimmed = highlightedCategories && !highlightedCategories.includes(task.category);
            return (
              <motion.div
                key={task.id || i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isDimmed ? 0.3 : 1, 
                  scale: isDimmed ? 0.95 : 1,
                  filter: isDimmed ? 'grayscale(80%)' : 'none',
                  left: task.visual.left,
                  width: task.visual.width
                }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="absolute bg-gradient-to-r from-purple-400 to-violet-400 rounded-lg px-3 py-2 shadow-sm hover:z-50 hover:shadow-xl transition-all cursor-default group border border-white/20"
                style={{ 
                    top: '10px',
                    height: '80px'
                }}
              >
                <div className="flex flex-col justify-center gap-1 h-full overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-white/90 shrink-0" />
                    <span className="text-[10px] opacity-90 font-mono whitespace-nowrap bg-black/10 px-1.5 rounded-full text-white">
                      {task.start_time}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium leading-tight line-clamp-2">
                    {task.title}
                  </span>
                </div>
              </motion.div>
            );
          })}
          
          {robotTasksRaw.length === 0 && (
            <div className={`absolute inset-0 flex items-center justify-center ${mode.color} opacity-40 text-sm`}>
              {t('timeline.noDelegated')}
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}