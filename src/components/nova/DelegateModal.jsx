import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight, Clock, Euro, Sparkles } from 'lucide-react';
import RobotCard from './RobotCard';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageProvider';

export default function DelegateModal({ open, onClose, task, robots = [], onDelegate }) {
  const { t } = useLanguage();
  const [selectedRobot, setSelectedRobot] = useState(null);

  const estimatedCost = selectedRobot && task 
    ? (selectedRobot.hourly_rate || 0) * ((task.duration_minutes || 60) / 60)
    : 0;

  const handleSelectRobot = (robot) => {
    setSelectedRobot(robot);
  };

  const handleDelegate = () => {
    if (!selectedRobot || !task) return;
    onDelegate(task, selectedRobot, parseFloat(estimatedCost.toFixed(1)));
    onClose();
  };

  const availableRobots = robots.filter(r => r.availability === 'available');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-rose-100 text-rose-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-rose-800">
            <Bot className="w-6 h-6 text-purple-500" />
            {t('delegate.title')}
          </DialogTitle>
        </DialogHeader>

        {task && (
          <div className="bg-rose-50 rounded-xl p-4 mb-4 border border-rose-100">
            <h3 className="text-rose-800 font-medium">{task.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-rose-500">
              {task.start_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {task.start_time}
                </span>
              )}
              {task.duration_minutes && (
                <span>{task.duration_minutes} {t('delegate.min')}</span>
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="text-rose-600 font-medium">{t('delegate.selectRobot')}</h4>
          </div>

          {availableRobots.length > 0 ? (
            <div className="grid gap-3">
              {availableRobots.map((robot, i) => (
                <motion.div
                  key={robot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <RobotCard
                    robot={robot}
                    compact
                    isSelected={selectedRobot?.id === robot.id}
                    onSelect={handleSelectRobot}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-rose-300">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('delegate.noRobots')}</p>
            </div>
          )}
        </div>

        {selectedRobot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-50 rounded-xl p-4 border border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-purple-500 text-sm">{t('delegate.estimatedCost')}</span>
                <div className="flex items-center gap-1 text-2xl font-bold text-purple-700">
                  <Euro className="w-6 h-6 text-emerald-500" />
                  {estimatedCost.toFixed(1)}
                </div>
              </div>
              <div className="text-right text-purple-500 text-sm">
                <div>{Math.round(selectedRobot.hourly_rate)}{t('delegate.perHour')}</div>
                <div>{task?.duration_minutes || 60} {t('delegate.min')}</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
          >
            {t('delegate.cancel')}
          </Button>
          <Button
            onClick={handleDelegate}
            disabled={!selectedRobot}
            className="flex-1 bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600 text-white disabled:opacity-50"
          >
            {t('delegate.confirm')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}