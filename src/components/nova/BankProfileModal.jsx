import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Save, Building, User, Hash, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function BankProfileModal({ isOpen, onClose, robotName }) {
  const [isEditing, setIsEditing] = useState(false);
  const [bankData, setBankData] = useState({
    bankName: "Tatra Banka",
    accountHolder: "Anna Nováková",
    iban: "SK12 1100 0000 0012 3456 7890",
    swift: "TATRASKBX"
  });

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you would save to backend here
    toast.success("Bankové údaje boli aktualizované");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-rose-100"
      >
        <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-b border-rose-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-rose-500">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-rose-900">Bankový profil</h3>
              <p className="text-xs text-rose-500">Pre platby robotovi {robotName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-rose-400 hover:text-rose-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Visual Card Representation */}
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-rose-500/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <CreditCard className="w-8 h-8 text-rose-400" />
                <span className="text-xs font-mono opacity-70">{bankData.bankName}</span>
              </div>
              <div className="mb-4">
                <div className="text-xs opacity-50 mb-1">IBAN</div>
                <div className="font-mono text-lg tracking-wider">{bankData.iban}</div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-50 mb-1">Držiteľ účtu</div>
                  <div className="font-medium text-sm uppercase">{bankData.accountHolder}</div>
                </div>
                <div className="text-xs font-mono opacity-70">{bankData.swift}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-xs text-rose-500">Banka</Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
                <Input 
                  value={bankData.bankName}
                  onChange={(e) => setBankData({...bankData, bankName: e.target.value})}
                  disabled={!isEditing}
                  className="pl-9 bg-rose-50/50 border-rose-100 focus:border-rose-300"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs text-rose-500">Držiteľ účtu</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
                <Input 
                  value={bankData.accountHolder}
                  onChange={(e) => setBankData({...bankData, accountHolder: e.target.value})}
                  disabled={!isEditing}
                  className="pl-9 bg-rose-50/50 border-rose-100 focus:border-rose-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs text-rose-500">IBAN</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
                  <Input 
                    value={bankData.iban}
                    onChange={(e) => setBankData({...bankData, iban: e.target.value})}
                    disabled={!isEditing}
                    className="pl-9 bg-rose-50/50 border-rose-100 focus:border-rose-300"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs text-rose-500">SWIFT / BIC</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-4 h-4 text-rose-300" />
                  <Input 
                    value={bankData.swift}
                    onChange={(e) => setBankData({...bankData, swift: e.target.value})}
                    disabled={!isEditing}
                    className="pl-9 bg-rose-50/50 border-rose-100 focus:border-rose-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-rose-50/50 border-t border-rose-100 flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-rose-500 hover:text-rose-700">
                Zrušiť
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Save className="w-4 h-4 mr-1.5" />
                Uložiť zmeny
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)} className="bg-rose-400 hover:bg-rose-500 text-white w-full">
              Upraviť údaje
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}