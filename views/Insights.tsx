
import React from 'react';
import { BackButton, ProgressBar, Card } from '../components/UI';
import { Meal } from '../types';
import { GlobalStyles, Typography, Colors } from '../theme/goqiiDesignSystem';

interface InsightsProps {
  onBack: () => void;
  meals: Meal[];
  targetCalories: number;
}

const Insights: React.FC<InsightsProps> = ({ onBack, meals, targetCalories }) => {
  const loggedMeals = meals.filter(m => m.isLogged && !m.isSkipped);
  
  const totalMacros = loggedMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const totalGrams = totalMacros.protein + totalMacros.carbs + totalMacros.fat || 1;
  const pPct = Math.round((totalMacros.protein / totalGrams) * 100);
  const cPct = Math.round((totalMacros.carbs / totalGrams) * 100);
  const fPct = 100 - pPct - cPct;

  const targets = {
    calories: targetCalories,
    carbs: 313,
    fat: 319,
    protein: 313,
    fiber: 30,
  };

  return (
    <div className={GlobalStyles.screen + " overflow-y-auto"}>
      <header className={GlobalStyles.header + " sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-20"}>
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} className="-ml-2" />
          <h1 className={Typography.h3}>Daily Insights</h1>
        </div>
      </header>

      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 rounded-full border-[12px] border-white dark:border-slate-800 shadow-xl overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900">
             <div 
               className="absolute inset-0"
               style={{
                 background: `conic-gradient(
                   #8c71d6 0% ${pPct}%, 
                   #f5b61a ${pPct}% ${pPct + fPct}%, 
                   #26b1b5 ${pPct + fPct}% 100%
                 )`
               }}
             />
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full flex flex-col items-center justify-center shadow-inner">
                 <span className={Typography.caption}>Macros</span>
                 <span className={Typography.h3}>{totalMacros.calories}</span>
               </div>
             </div>
             
             <div className="absolute top-6 right-6 text-[10px] font-black text-white drop-shadow-sm text-center">
               Protein<br/>{pPct}%
             </div>
             <div className="absolute bottom-10 right-10 text-[10px] font-black text-white drop-shadow-sm text-center">
               Fats<br/>{fPct}%
             </div>
             <div className="absolute top-1/2 left-8 -translate-y-1/2 text-[10px] font-black text-white drop-shadow-sm text-center">
               Carbs<br/>{cPct}%
             </div>
          </div>
        </div>

        <section className="space-y-6">
          <h3 className={Typography.label + " border-b border-slate-100 dark:border-slate-800 pb-2"}>Nutrition Targets</h3>
          
          <div className="grid grid-cols-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            <span>Nutrition</span>
            <span className="text-center">Today's Intake</span>
            <span className="text-right">Targets</span>
          </div>

          <div className="space-y-5">
            <NutrientRow label="Calories" current={totalMacros.calories} target={targets.calories} unit="" color="bg-orange-500" />
            <NutrientRow label="Carbs" current={totalMacros.carbs} target={targets.carbs} unit="g" color="bg-[#26b1b5]" />
            <NutrientRow label="Fat" current={totalMacros.fat} target={targets.fat} unit="g" color="bg-[#f5b61a]" />
            <NutrientRow label="Protein" current={totalMacros.protein} target={targets.protein} unit="g" color="bg-[#8c71d6]" />
            <NutrientRow label="Fiber" current={18} target={targets.fiber} unit="g" color="bg-cyan-400" />
          </div>
        </section>

        <section className="space-y-3 pt-4">
          <DetailRow label="Net Carbs" value={`${totalMacros.carbs}g`} />
          <DetailRow label="Sodium" value="864mg" />
          <DetailRow label="Potassium" value="3957mg" />
          <div className="border-t border-slate-100 dark:border-slate-800 border-dashed my-2"></div>
          <DetailRow label="Cholesterol" value="162mg" />
        </section>

        <section className="space-y-4 pt-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span>Sugar</span>
            <span>%DV</span>
          </div>
          <DetailRow label="Sugar" value="103g" />
          <DetailRow label="Sucrose" value="11.3g" />
          <DetailRow label="Glucose" value="46.2g" />
        </section>
      </div>
    </div>
  );
};

const NutrientRow: React.FC<{ label: string; current: number; target: number; unit: string; color: string }> = ({ label, current, target, unit, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
      <span className="w-1/3">{label}</span>
      <span className="w-1/3 text-center">{current}{unit}</span>
      <span className="w-1/3 text-right text-slate-400">{target}{unit}</span>
    </div>
    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
      <div 
        className={`${color} h-full rounded-full transition-all duration-1000`} 
        style={{ width: `${Math.min((current/target)*100, 100)}%` }}
      />
    </div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-1 px-1">
    <span className="text-xs text-slate-500 font-medium">{label}</span>
    <span className="text-xs text-slate-800 dark:text-slate-200 font-bold">{value}</span>
  </div>
);

export default Insights;
