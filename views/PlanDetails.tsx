import React, { useState, useEffect } from 'react';
import { UserProfile, MealPlan } from '../types';
import { BackButton, Button } from '../components/UI';
import { Colors, Typography, Layout } from '../theme/goqiiDesignSystem';

interface PlanDetailsProps {
  profile: UserProfile;
  plan: MealPlan;
  onBack: () => void;
  onSelect?: (plan: MealPlan) => void;
}

const PlanDetails: React.FC<PlanDetailsProps> = ({ profile, plan, onBack, onSelect }) => {
  const [budget, setBudget] = useState(plan.calories || 2000);
  
  const [macros, setMacros] = useState({
    carbs: 40,
    protein: 30,
    fat: 30
  });

  const [splits, setSplits] = useState({
    breakfast: 25,
    lunch: 35,
    dinner: 20,
    snack: 20
  });

  const calcGrams = (pct: number, divisor: number) => Math.round((budget * (pct / 100)) / divisor);
  const calcCals = (pct: number) => Math.round(budget * (pct / 100));

  const handleUpdateMacro = (key: keyof typeof macros, delta: number) => {
    setMacros(prev => {
      const newVal = Math.max(0, Math.min(100, prev[key] + delta));
      return { ...prev, [key]: newVal };
    });
  };

  const handleUpdateSplit = (key: keyof typeof splits, delta: number) => {
    setSplits(prev => {
      const newVal = Math.max(0, Math.min(100, prev[key] + delta));
      return { ...prev, [key]: newVal };
    });
  };

  const totalMacro = macros.carbs + macros.protein + macros.fat;
  const totalSplit = splits.breakfast + splits.lunch + splits.dinner + splits.snack;

  return (
    <div className="flex-1 flex flex-col bg-[#F5F6F8] dark:bg-slate-950 transition-colors no-scrollbar overflow-y-auto pb-32">
      <div className="p-6 pt-2 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
        <BackButton onClick={onBack} className="-ml-2 dark:text-slate-300" />
        <h1 className={`text-lg ${Typography.Bold} text-slate-700 dark:text-white tracking-tight`}>Edit Nutritional Budgets</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className={`bg-white dark:bg-slate-900 p-6 ${Layout.radius} border border-slate-100 dark:border-slate-800 shadow-sm`}>
          <h2 className={`text-xl ${Typography.Black} text-slate-900 dark:text-white mb-2`}>{plan.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
            {plan.description || "This metabolic blueprint is designed to optimize your energy levels and support your primary health goals through precision nutrition."}
          </p>
        </div>

        <div className={`bg-white dark:bg-slate-900 p-6 ${Layout.radius} border border-slate-100 dark:border-slate-800 shadow-sm`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`${Typography.Bold} text-slate-800 dark:text-white`}>Calorie Budget</h3>
            <div className="flex items-center gap-4">
              <button onClick={() => setBudget(b => b - 50)} className={`w-10 h-10 ${Layout.fullRadius} border-2 border-[#39C101] flex items-center justify-center text-[#39C101] text-2xl font-light hover:bg-green-50 transition-colors`}>−</button>
              <div className="flex flex-col items-center">
                <span className={`text-xl ${Typography.Black} text-slate-900 dark:text-white border-b-2 border-slate-100 w-20 text-center pb-1`}>{budget}</span>
              </div>
              <button onClick={() => setBudget(b => b + 50)} className={`w-10 h-10 ${Layout.fullRadius} border-2 border-[#39C101] flex items-center justify-center text-[#39C101] text-2xl font-light hover:bg-green-50 transition-colors`}>+</button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-50 dark:border-slate-800 border-dashed space-y-2">
            <p className={`text-[11px] ${Typography.Bold} text-slate-700 dark:text-slate-300`}>Recommendation of Calories - {budget}</p>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Based on following assumptions:</p>
              <p className="text-[10px] text-slate-400 font-medium">Goal: {profile.healthGoal}, Preference: {profile.dietPreference}</p>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-slate-900 p-6 ${Layout.radius} border border-slate-100 dark:border-slate-800 shadow-sm`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={`${Typography.Bold} text-slate-800 dark:text-white`}>Macronutrient Budget</h3>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${totalMacro === 100 ? 'text-slate-400' : 'text-red-500'}`}>
                Total Macronutrient Budget = {totalMacro}%
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <BudgetRow 
              icon="🍞" 
              label="Carbs" 
              value={`${calcGrams(macros.carbs, 4)} g`} 
              percentage={macros.carbs} 
              onUpdate={(d) => handleUpdateMacro('carbs', d)} 
            />
            <BudgetRow 
              icon="🍗" 
              label="Protein" 
              value={`${calcGrams(macros.protein, 4)} g`} 
              percentage={macros.protein} 
              onUpdate={(d) => handleUpdateMacro('protein', d)} 
            />
            <BudgetRow 
              icon="🧀" 
              label="Fat" 
              value={`${calcGrams(macros.fat, 9)} g`} 
              percentage={macros.fat} 
              onUpdate={(d) => handleUpdateMacro('fat', d)} 
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-40">
        <Button 
          disabled={totalMacro !== 100 || totalSplit !== 100}
          onClick={() => onSelect?.({...plan, calories: budget})} 
          className="w-full h-14"
        >
          Save & Start Plan
        </Button>
      </div>
    </div>
  );
};

const BudgetRow: React.FC<{ 
  icon: string; 
  label: string; 
  value: string; 
  percentage: number; 
  onUpdate: (d: number) => void;
}> = ({ icon, label, value, percentage, onUpdate }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${Layout.fullRadius} border border-slate-100 dark:border-slate-800 flex items-center justify-center text-xl bg-slate-50 dark:bg-slate-800/50`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={`text-sm ${Typography.Bold} text-slate-800 dark:text-slate-200`}>{label}</span>
        <span className="text-[11px] font-bold text-slate-400">{value}</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={() => onUpdate(-5)} className={`w-8 h-8 ${Layout.fullRadius} border border-[#39C101] flex items-center justify-center text-[#39C101] hover:bg-green-50`}>−</button>
      <span className={`text-sm ${Typography.Black} text-slate-800 dark:text-white w-10 text-center`}>{percentage}%</span>
      <button onClick={() => onUpdate(5)} className={`w-8 h-8 ${Layout.fullRadius} border border-[#39C101] flex items-center justify-center text-[#39C101] hover:bg-green-50`}>+</button>
    </div>
  </div>
);

export default PlanDetails;