import React, { useEffect, useState, useCallback } from 'react';
import { MealPlan, UserProfile } from '../types';
import { Button, BackButton } from '../components/UI';
import { fetchApiMealPlans } from '../services/mealPlanService';
import { Colors, Typography, Layout, GlobalStyles } from '../theme/goqiiDesignSystem';

interface PlanSelectionProps {
  onSelect: (plan: MealPlan | null) => void;
  onBack: () => void;
  onViewDetails: (plan: MealPlan) => void;
  onEditPlan: () => void;
  profile: UserProfile | null;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({ onSelect, onBack, onViewDetails, onEditPlan, profile }) => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiPlans = await fetchApiMealPlans({ limit: 12 });
      if (apiPlans && Array.isArray(apiPlans)) {
        const mappedPlans: MealPlan[] = apiPlans.map((p: any) => ({
          id: p.id || p.plan_id || String(Math.random()),
          name: p.name || p.plan_name || p.title || 'Untitled Plan',
          calories: Number(p.daily_calories || p.calories_per_day || p.calories || 0),
          duration: `${p.duration_days || p.days || 7} Days`,
          image_url: p.image_url || p.image || `https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600`,
          description: p.description || ""
        }));
        setPlans(mappedPlans);
        if (mappedPlans.length === 0) setError("No meal plans found in the system.");
      } else {
        setError("Unable to load meal plans.");
      }
    } catch (err) {
      setError("Unable to load meal plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  return (
    <div className={`${GlobalStyles.screen} overflow-y-auto no-scrollbar`}>
      <div className="flex items-center gap-2 mb-8 px-2">
        <BackButton onClick={onBack} className="-ml-2" />
        <h1 className={`${Typography.h2} ${Typography.Black} text-[#0F172A] dark:text-white`}>Meal Plans</h1>
      </div>
      
      <div className="space-y-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className={`bg-white dark:bg-slate-800 ${Layout.radius} overflow-hidden animate-pulse border border-[#F1F5F9] dark:border-slate-700`}>
              <div className="h-44 bg-slate-200 dark:bg-slate-700"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full mt-4"></div>
              </div>
            </div>
          ))
        ) : error ? (
           <div className="text-center py-12 px-4 space-y-4">
            <p className={`${Typography.body} text-[#64748B]`}>{error}</p>
            <Button onClick={loadPlans} variant="outline" className="mx-auto">Retry Sync</Button>
          </div>
        ) : plans.length > 0 ? (
          plans.map((plan, index) => (
            <div 
              key={plan.id} 
              className={`${GlobalStyles.card} overflow-hidden flex flex-col group transition-all hover:shadow-xl hover:shadow-green-500/5`}
            >
              <div className="h-44 relative overflow-hidden">
                <img 
                  src={plan.image_url} 
                  alt={plan.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                
                {index === 0 && (
                  <div className={`absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-lg z-10 flex items-center gap-1.5`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    AI Recommended
                  </div>
                )}
                
                <div className={`absolute top-4 right-4 bg-[#39C101] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg z-10`}>
                  {plan.calories} kcal
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`${Typography.h4} ${Typography.Black} text-[#0F172A] dark:text-white group-hover:text-[#39C101] transition-colors`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0 ml-4">
                    <span className={`${Typography.caption} text-[#A5B3C1]`}>{plan.duration}</span>
                  </div>
                </div>
                
                <p className={`${Typography.body} text-[#64748B] leading-relaxed mt-1 mb-6 flex-1 line-clamp-2 italic`}>
                  {plan.description}
                </p>

                <div className="mt-auto space-y-3">
                  <Button onClick={() => onSelect(plan)} className="w-full">Start this Meal</Button>
                  <div className="flex justify-center gap-6 px-2">
                    <button onClick={() => onViewDetails(plan)} className={`${Typography.caption} text-[#39C101]`}>View Details</button>
                    <button onClick={onEditPlan} className={`${Typography.caption} text-[#39C101]`}>Change Plan</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : null}
      </div>

      <div className="mt-12 space-y-4 text-center pb-20">
        <Button variant="ghost" onClick={() => onSelect(null)} className={`${Typography.caption} w-full`}>Skip for now</Button>
      </div>
    </div>
  );
};

export default PlanSelection;