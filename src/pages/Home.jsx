import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { 
  Plus, Calendar, Bot, Sparkles, ChevronLeft, ChevronRight,
  Mic, Bell, User, Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageProvider';

import NovaLogo from '../components/nova/NovaLogo';
import LifeHarmonyWheel from '../components/nova/LifeHarmonyWheel';
import BloomStepCard from '../components/nova/BloomStepCard';
import FlowTimeline from '../components/nova/FlowTimeline';
import WorldWhispers from '../components/nova/WorldWhispers';
import EnergyScanner from '../components/nova/EnergyScanner';
import TaskCard from '../components/nova/TaskCard';
import AddTaskModal from '../components/nova/AddTaskModal';
import DelegateModal from '../components/nova/DelegateModal';
import UserProfileSidebar from '../components/nova/UserProfileSidebar';
import FinancialReport from '../components/nova/FinancialReport';

export default function Home() {
  const { t, language, setLanguage, formatDate } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddTask, setShowAddTask] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [taskToDelegate, setTaskToDelegate] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [suggestedTaskData, setSuggestedTaskData] = useState(null);
  const [currentMood, setCurrentMood] = useState('good');
  const [selectedLifeArea, setSelectedLifeArea] = useState(null);
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedDate],
    queryFn: () => base44.entities.Task.filter({ scheduled_date: selectedDate }),
  });

  const { data: robots = [] } = useQuery({
    queryKey: ['robots'],
    queryFn: async () => {
      const all = await base44.entities.Robot.list();
      return all.filter(r => r.type !== 'archived');
    },
  });

  const { data: bloomSteps = [] } = useQuery({
    queryKey: ['bloomSteps', selectedDate],
    queryFn: () => base44.entities.BloomStep.filter({ scheduled_date: selectedDate }),
  });

  const { data: wellbeingEntry } = useQuery({
    queryKey: ['wellbeing', selectedDate],
    queryFn: async () => {
      const entries = await base44.entities.WellbeingEntry.filter({ date: selectedDate });
      return entries[0] || null;
    },
  });

  const energyLevel = wellbeingEntry?.energy_level || 7;

  const generatePlanMutation = useMutation({
    mutationFn: async ({ level, message }) => {
      // 1. Save energy level only (MyDay Planner cooperation interrupted)
      if (wellbeingEntry) {
        await base44.entities.WellbeingEntry.update(wellbeingEntry.id, { energy_level: level });
      } else {
        await base44.entities.WellbeingEntry.create({ date: selectedDate, energy_level: level });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellbeing'] });
    }
  });

  const handleScanComplete = (level, message) => {
    generatePlanMutation.mutate({ level, message });
  };

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateBloomStepMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BloomStep.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloomSteps'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleAddTask = (task, editId) => {
    if (editId) {
      updateTaskMutation.mutate({ id: editId, data: task });
    } else {
      createTaskMutation.mutate(task);
    }
    setTaskToEdit(null);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowAddTask(true);
  };

  const handleDeleteTask = (task) => {
    deleteTaskMutation.mutate(task.id);
  };

  const handleDelegate = (task, robot, cost) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: {
        assigned_to: 'robot',
        robot_id: robot.id,
        estimated_cost: cost,
        status: 'delegated',
      },
    });
  };

  const handleCompleteBloomStep = (step) => {
    updateBloomStepMutation.mutate({
      id: step.id,
      data: { is_completed: !step.is_completed },
    });
  };

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const lifeAreas = wellbeingEntry?.life_areas || {
    health: 7,
    work: 6,
    relationships: 8,
    learning: 5,
    relax: 4,
  };

  const humanTasks = tasks.filter(t => t.assigned_to !== 'robot');
  const robotTasks = tasks.filter(t => t.assigned_to === 'robot');

  const groupTasks = (list) => {
    const grouped = list.reduce((acc, task) => {
      const cat = task.category || 'general';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(task);
      return acc;
    }, {});
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const lifeAreaMapping = {
    health: ['health', 'sport'],
    work: ['work'],
    relationships: ['children', 'household', 'personal'],
    learning: ['learning'],
    relax: ['relax']
  };

  const highlightedCategories = selectedLifeArea ? lifeAreaMapping[selectedLifeArea] : null;

  const findSmartSlot = (durationMinutes = 30, breakMinutes = 15) => {
    const now = new Date();
    const isToday = selectedDate === format(now, 'yyyy-MM-dd');
    
    // Defined active hours (7:00 - 22:00)
    const MIN_HOUR = 7;
    const MAX_HOUR = 22; 

    let searchStartMinutes = MIN_HOUR * 60;

    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      const roundedCurrent = Math.ceil(currentTotalMinutes / 15) * 15;
      searchStartMinutes = Math.max(roundedCurrent, searchStartMinutes);
    }

    const endOfDayMinutes = MAX_HOUR * 60;

    // Convert existing tasks to minutes ranges and expand with break buffer
    const busySlots = tasks
      .filter(t => t.start_time && t.end_time && t.status !== 'cancelled')
      .map(t => {
        try {
          const [sh, sm] = t.start_time.split(':').map(Number);
          const [eh, em] = t.end_time.split(':').map(Number);
          return {
            start: (sh * 60 + sm) - breakMinutes,
            end: (eh * 60 + em) + breakMinutes
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);

    // Look for a slot
    let currentTime = searchStartMinutes;

    while (currentTime + durationMinutes <= endOfDayMinutes) {
      const slotStart = currentTime;
      const slotEnd = currentTime + durationMinutes;
      
      // Check if this slot overlaps with any buffered existing task
      const hasOverlap = busySlots.some(slot => 
        (slotStart < slot.end && slotEnd > slot.start)
      );

      if (!hasOverlap) {
        const h = Math.floor(slotStart / 60);
        const m = slotStart % 60;
        const eh = Math.floor(slotEnd / 60);
        const em = slotEnd % 60;
        return {
          start_time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
          end_time: `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`
        };
      }

      currentTime += 15;
    }

    return null;
  };

  const handleOpenAddTask = () => {
    const smartSlot = findSmartSlot(60, 15); // Default 60 min duration, 15 min break
    if (smartSlot) {
      setSuggestedTaskData({
        start_time: smartSlot.start_time,
        duration_minutes: 60,
        assigned_to: 'human',
        priority: 'medium'
      });
    } else {
      setSuggestedTaskData(null);
    }
    setShowAddTask(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <NovaLogo />
            </motion.div>
            <p className="text-rose-400 text-sm mt-2 ml-1 font-medium tracking-wide opacity-80">{t('home.subtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/50 rounded-lg border border-rose-100 p-1">
              <Globe className="w-4 h-4 text-rose-400 ml-2" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[100px] h-8 bg-transparent border-0 focus:ring-0 text-rose-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sk">Slovensky</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="cn">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
            >
              <Mic className="w-5 h-5" />
            </Button>
            {/* Profile Button */}
            <button 
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center hover:scale-105 transition-transform shadow-md shadow-rose-200 cursor-pointer overflow-hidden border-2 border-white"
            >
              <img 
                src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Nova&backgroundColor=b6e3f4,c0aede,d1d4f9&eyes=cute&mouth=lilSmile" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </header>

        {/* Date Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeDate(-1)}
            className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 border border-rose-100 shadow-sm">
            <Calendar className="w-4 h-4 text-rose-400" />
            <span className="text-rose-700 font-medium">
              {formatDate(new Date(selectedDate))}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeDate(1)}
            className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Wellbeing */}
          <div className="space-y-6">


            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100 shadow-sm">
              <h3 className="text-rose-800 font-semibold mb-4">{t('home.lumiScan')}</h3>
              <EnergyScanner 
                onScanComplete={handleScanComplete} 
                currentEnergyLevel={energyLevel}
                tasks={tasks}
                onAddTask={(title, type, durationMinutes, category) => {
                    const duration = durationMinutes || (type === 'short' ? 5 : 30);
                    let smartSlot = findSmartSlot(duration);
                    
                    // Fallback to current time if no smart slot found
                    if (!smartSlot) {
                        const now = new Date();
                        const h = now.getHours().toString().padStart(2, '0');
                        const m = now.getMinutes().toString().padStart(2, '0');
                        // Calculate end time
                        const endMins = now.getHours() * 60 + now.getMinutes() + duration;
                        const eh = Math.floor(endMins / 60).toString().padStart(2, '0');
                        const em = (endMins % 60).toString().padStart(2, '0');
                        
                        smartSlot = {
                            start_time: `${h}:${m}`,
                            end_time: `${eh}:${em}`
                        };
                    }

                    createTaskMutation.mutate({
                        title,
                        status: 'planned',
                        priority: 'medium',
                        category: category || (energyLevel < 5 ? 'relax' : 'health'),
                        scheduled_date: selectedDate,
                        start_time: smartSlot.start_time,
                        end_time: smartSlot.end_time,
                        duration_minutes: duration,
                        description: 'Navrhnuté Lumi na základe energetického skenu'
                    });
                }}
              />
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-rose-800 font-semibold">{t('home.lifeHarmony')}</h3>
                  <p className="text-rose-400 text-xs">{t('home.lifeBalance')}</p>
                </div>
              </div>
              <div className="flex justify-center">
                <LifeHarmonyWheel 
                  values={lifeAreas} 
                  size={180} 
                  onSelect={setSelectedLifeArea}
                  selectedArea={selectedLifeArea}
                />
              </div>
            </div>

            <WorldWhispers />

            {/* Financial Report */}
            <FinancialReport tasks={tasks} robots={robots} />

            {/* BloomSteps - Moved here */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-rose-800 font-semibold">{t('home.bloomSteps')}</h3>
                  <p className="text-rose-400 text-xs">{t('home.microGoals')}</p>
                </div>
              </div>

              {/* Daily Motivational Quote */}
              <div className="mb-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100 italic text-rose-600 text-center text-sm">
                "{t('quotes')[new Date(selectedDate).getDay()]}"
              </div>

              <div className="grid gap-3">
                {bloomSteps.map((step, i) => (
                  <BloomStepCard
                    key={step.id}
                    step={step}
                    index={i}
                    onComplete={handleCompleteBloomStep}
                  />
                ))}
                {bloomSteps.length === 0 && (
                  <div className="text-center py-6 text-rose-300">
                    <p>{t('home.noBloomSteps')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* FlowTimeline - Disconnected from Energy Scan */}
            <FlowTimeline tasks={tasks} highlightedCategories={highlightedCategories} />

            {/* Tasks Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-rose-800 font-semibold text-lg">{t('home.myDayPlanner')}</h3>
                  <p className="text-rose-400 text-sm">
                    {tasks.length} {t('home.tasksCount')} • {robotTasks.length} {t('home.delegatedCount')}
                  </p>
                </div>
                <Button
                  onClick={handleOpenAddTask}
                  className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white shadow-md shadow-rose-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('home.addTask')}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-600 text-sm font-medium">{t('home.myTasks')}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-500 text-xs">
                      {humanTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {humanTasks.length > 0 ? (
                      groupTasks(humanTasks).map(([category, categoryTasks]) => (
                        <div key={category} className="space-y-2 mb-4">
                          <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider ml-1 opacity-70">{category}</h4>
                          <AnimatePresence>
                            {categoryTasks.map((task, i) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                index={i}
                                onDelegate={() => setTaskToDelegate(task)}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      ))
                    ) : null}
                    {humanTasks.length === 0 && (
                      <div className="text-center py-8 text-rose-300">
                        <p>{t('home.noTasks')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-rose-600 text-sm font-medium">{t('home.delegatedTasks')}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-500 text-xs">
                      {robotTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {robotTasks.length > 0 ? (
                      groupTasks(robotTasks).map(([category, categoryTasks]) => (
                        <div key={category} className="space-y-2 mb-4">
                          <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider ml-1 opacity-70">{category}</h4>
                          <AnimatePresence>
                            {categoryTasks.map((task, i) => {
                              const robot = robots.find(r => r.id === task.robot_id);
                              const currentCost = robot ? (robot.hourly_rate * (task.duration_minutes || 0) / 60) : 0;
                              
                              return (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  index={i}
                                  cost={currentCost}
                                  onEdit={handleEditTask}
                                  onDelete={handleDeleteTask}
                                />
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      ))
                    ) : null}
                    {robotTasks.length === 0 && (
                      <div className="text-center py-8 text-rose-300">
                        <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{t('home.noDelegated')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        open={showAddTask}
        onClose={() => { setShowAddTask(false); setTaskToEdit(null); }}
        onSave={handleAddTask}
        selectedDate={selectedDate}
        editTask={taskToEdit}
        initialData={suggestedTaskData}
        robots={robots}
      />

      <DelegateModal
        open={!!taskToDelegate}
        onClose={() => setTaskToDelegate(null)}
        task={taskToDelegate}
        robots={robots}
        onDelegate={handleDelegate}
      />
      
      <UserProfileSidebar 
        open={showProfile} 
        onClose={() => setShowProfile(false)} 
        onAddTask={() => {
          setShowProfile(false);
          handleOpenAddTask();
        }}
      />
    </div>
  );
}