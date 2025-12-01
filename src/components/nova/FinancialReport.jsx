import React from 'react';
import { motion } from 'framer-motion';
import { Euro, TrendingUp, Bot, Calendar, PieChart } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function FinancialReport({ tasks = [], robots = [] }) {
  const { t } = useLanguage();

  // Calculate costs from delegated tasks (hourly_rate * duration_minutes / 60)
  const delegatedTasks = tasks.filter(t => t.assigned_to === 'robot' && t.robot_id);
  const taskCount = delegatedTasks.length;

  // Calculate actual time from tasks
  const totalMinutes = delegatedTasks.reduce((sum, t) => sum + (Number(t.duration_minutes) || 0), 0);

  // Explicitly calculate total cost: Sum(HourlyRate * Duration / 60) for all tasks
  const totalCost = delegatedTasks.reduce((sum, task) => {
    const robot = robots.find(r => r.id === task.robot_id);
    const rate = Number(robot?.hourly_rate) || 0;
    const duration = Number(task.duration_minutes) || 0;
    return sum + (rate * duration / 60);
  }, 0);

  // Group by robot and calculate costs based on hourly rate
  const costByRobot = delegatedTasks.reduce((acc, task) => {
    const robotId = task.robot_id || 'unknown';
    const robot = robots.find(r => r.id === robotId);
    const hourlyRate = Number(robot?.hourly_rate) || 0;
    const durationMinutes = Number(task.duration_minutes) || 0;
    const taskCost = (hourlyRate * durationMinutes) / 60;

    if (!acc[robotId]) acc[robotId] = { cost: 0, tasks: 0, minutes: 0 };
    acc[robotId].cost += taskCost;
    acc[robotId].tasks += 1;
    acc[robotId].minutes += durationMinutes;
    return acc;
  }, {});

  const robotCosts = Object.entries(costByRobot).map(([robotId, data]) => {
    const robot = robots.find(r => r.id === robotId);
    return {
      name: robot?.name || 'Unknown Robot',
      avatar: robot?.avatar_url,
      hourlyRate: Number(robot?.hourly_rate) || 0,
      ...data
    };
  }).sort((a, b) => b.cost - a.cost);

  // Calculate time saved from actual task durations
  const timeSavedMinutes = totalMinutes;
  const timeSavedHours = Math.floor(timeSavedMinutes / 60);
  const timeSavedMins = timeSavedMinutes % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500">
          <Euro className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-rose-800 font-semibold">{t('financial.title')}</h3>
          <p className="text-rose-400 text-xs">{t('financial.subtitle')}</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <Euro className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">{t('financial.totalCost')}</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{totalCost.toFixed(2)} €</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-purple-600 font-medium">{t('financial.delegatedTasks')}</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{taskCount}</p>
        </div>
      </div>

      {/* Time Saved */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-rose-600 font-medium">{t('financial.timeSaved')}</span>
          </div>
          <span className="text-lg font-bold text-rose-700">
            {timeSavedHours > 0 ? `${timeSavedHours}h ` : ''}{timeSavedMins}min
          </span>
        </div>
      </div>

      {/* Robot Breakdown */}
      {robotCosts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-rose-500 font-medium uppercase tracking-wider">{t('financial.byRobot')}</span>
          </div>
          <div className="space-y-2">
            {robotCosts.map((robot, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-300 to-violet-400 flex items-center justify-center overflow-hidden">
                    {robot.avatar ? (
                      <img src={robot.avatar} alt={robot.name} className="w-full h-full object-cover" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{robot.name}</p>
                    <p className="text-xs text-gray-400">{robot.tasks} {robot.tasks === 1 ? t('financial.task') : t('financial.tasks')}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{robot.cost.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {delegatedTasks.length === 0 && (
        <div className="text-center py-4 text-rose-300">
          <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('financial.noCosts')}</p>
        </div>
      )}
    </motion.div>
  );
}