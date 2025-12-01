import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Euro, Calendar, CheckCircle2, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function EarningsModal({ open, onClose, robot, simulatedTasks = [] }) {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['robot-earnings', robot?.id],
    queryFn: () => base44.entities.Task.filter({ robot_id: robot.id }),
    enabled: !!robot?.id && open,
  });

  // Filter for tasks that represent earnings
  const realTasks = tasks?.filter(t => t.status === 'completed' || t.status === 'delegated' || t.assigned_to === 'robot') || [];
  const earningTasks = [...realTasks, ...simulatedTasks];
  
  const totalEarnings = earningTasks.reduce((sum, task) => sum + (task.estimated_cost || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-xl border-rose-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-rose-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Aktivity a zárobky - {robot?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
            </div>
          ) : earningTasks.length > 0 ? (
            <>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {earningTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100">
                    <div className="flex-1 mr-2">
                      <div className="font-medium text-rose-800 text-sm">{task.title}</div>
                      <div className="flex items-center gap-2 text-xs text-rose-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        {task.scheduled_date ? format(new Date(task.scheduled_date), 'd. M. yyyy') : 'Bez dátumu'}
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="font-bold text-emerald-600">+{task.estimated_cost || 0} €</div>
                      <div className="text-[10px] text-emerald-500 uppercase font-medium tracking-wide">
                        {task.status === 'completed' ? 'Hotovo' : 'Prebieha'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between bg-emerald-50/50 p-3 rounded-xl">
                <span className="text-rose-700 font-medium">Celkový zárobok</span>
                <span className="text-2xl font-bold text-emerald-600">{totalEarnings} €</span>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-rose-300 bg-rose-50/30 rounded-xl border border-rose-100 border-dashed">
              <Euro className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Tento robot zatiaľ nemá žiadne zaznamenané zárobky.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}