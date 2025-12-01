import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, User, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import RobotRecommendationModal from './RobotRecommendationModal';


export default function AddTaskModal({ open, onClose, onSave, selectedDate, editTask = null, initialData = null, robots = [] }) {
  const { t } = useLanguage();
  const [task, setTask] = useState({
    title: '',
    description: '',
    category: 'personal',
    assigned_to: 'human',
    start_time: '',
    duration_minutes: 30,
    priority: 'medium',
  });
  const [showRobotRecommendation, setShowRobotRecommendation] = useState(false);

  React.useEffect(() => {
    if (editTask) {
      setTask({
        title: editTask.title || '',
        description: editTask.description || '',
        category: editTask.category || 'personal',
        assigned_to: editTask.assigned_to || 'human',
        start_time: editTask.start_time || '',
        duration_minutes: editTask.duration_minutes || 30,
        priority: editTask.priority || 'medium',
      });
    } else if (open && initialData) {
      setTask({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'personal',
        assigned_to: initialData.assigned_to || 'human',
        start_time: initialData.start_time || '',
        duration_minutes: initialData.duration_minutes || 30,
        priority: initialData.priority || 'medium',
      });
    } else if (open) {
      setTask({
        title: '',
        description: '',
        category: 'personal',
        assigned_to: 'human',
        start_time: '',
        duration_minutes: 30,
        priority: 'medium',
      });
    }
  }, [editTask, open, initialData]);

  const handleSave = () => {
    if (!task.title) return;
    
    let end_time = undefined;
    if (task.start_time && task.duration_minutes) {
      const [h, m] = task.start_time.split(':').map(Number);
      const totalMins = h * 60 + m + parseInt(task.duration_minutes);
      const eh = Math.floor(totalMins / 60);
      const em = totalMins % 60;
      end_time = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
    }

    onSave({
      ...task,
      end_time,
      scheduled_date: selectedDate,
      status: 'planned',
    }, editTask?.id);
    onClose();
  };

  const categories = [
    { value: 'personal', label: t('task.categories.personal'), emoji: '👤' },
    { value: 'children', label: t('task.categories.children'), emoji: '👶' },
    { value: 'sport', label: t('task.categories.sport'), emoji: '🏃‍♀️' },
    { value: 'work', label: t('task.categories.work'), emoji: '💼' },
    { value: 'relax', label: t('task.categories.relax'), emoji: '🧘‍♀️' },
    { value: 'health', label: t('task.categories.health'), emoji: '❤️' },
    { value: 'learning', label: t('task.categories.learning'), emoji: '📚' },
    { value: 'household', label: t('task.categories.household'), emoji: '🏠' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-rose-100 text-rose-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-rose-800">
            {editTask ? t('modal.editTask') : t('modal.newTask')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-rose-600">{t('modal.title')}</Label>
            <Input
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              placeholder={t('modal.placeholders.title')}
              className="bg-rose-50 border-rose-200 text-rose-800 placeholder:text-rose-300 mt-1"
            />
          </div>

          <div>
            <Label className="text-rose-600">{t('modal.description')}</Label>
            <Textarea
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              placeholder={t('modal.placeholders.desc')}
              className="bg-rose-50 border-rose-200 text-rose-800 placeholder:text-rose-300 mt-1 h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-rose-600">{t('modal.category')}</Label>
              <Select value={task.category} onValueChange={(v) => setTask({ ...task, category: v })}>
                <SelectTrigger className="bg-rose-50 border-rose-200 text-rose-800 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-rose-100">
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="text-rose-800">
                      {cat.emoji} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-rose-600">{t('modal.priority')}</Label>
              <Select value={task.priority} onValueChange={(v) => setTask({ ...task, priority: v })}>
                <SelectTrigger className="bg-rose-50 border-rose-200 text-rose-800 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-rose-100">
                  <SelectItem value="low" className="text-rose-800">🟢 {t('task.priority.low')}</SelectItem>
                  <SelectItem value="medium" className="text-rose-800">🟡 {t('task.priority.medium')}</SelectItem>
                  <SelectItem value="high" className="text-rose-800">🔴 {t('task.priority.high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-rose-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {t('modal.startTime')}
              </Label>
              <Input
                type="time"
                value={task.start_time}
                onChange={(e) => setTask({ ...task, start_time: e.target.value })}
                className="bg-rose-50 border-rose-200 text-rose-800 mt-1"
              />
            </div>

            <div>
              <Label className="text-rose-600">{t('modal.duration')}</Label>
              <Input
                type="number"
                value={task.duration_minutes}
                onChange={(e) => setTask({ ...task, duration_minutes: parseInt(e.target.value) || 30 })}
                className="bg-rose-50 border-rose-200 text-rose-800 mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-rose-600 mb-2 block">{t('modal.assignee')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTask({ ...task, assigned_to: 'human' })}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  task.assigned_to === 'human'
                    ? 'bg-rose-100 border-rose-300 text-rose-700'
                    : 'bg-rose-50 border-rose-100 text-rose-400 hover:border-rose-200'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{t('modal.me')}</span>
              </button>
              <button
                onClick={() => {
                  if (task.title) {
                    setShowRobotRecommendation(true);
                  } else {
                    setTask({ ...task, assigned_to: 'robot' });
                  }
                }}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  task.assigned_to === 'robot'
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-purple-50 border-purple-100 text-purple-400 hover:border-purple-200'
                }`}
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">{t('modal.robot')}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
            >
              {t('modal.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
            >
              {editTask ? t('modal.save') : t('modal.add')}
            </Button>
          </div>
        </div>
      </DialogContent>

      <RobotRecommendationModal
        open={showRobotRecommendation}
        onClose={() => setShowRobotRecommendation(false)}
        task={task}
        robots={robots}
        onConfirm={(robot) => {
          setTask({ 
            ...task, 
            assigned_to: 'robot',
            robot_id: robot.id,
            // Optional: set estimated cost or duration based on robot
            // estimated_cost: robot.hourly_rate * (task.duration_minutes / 60)
          });
        }}
      />
    </Dialog>
  );
}