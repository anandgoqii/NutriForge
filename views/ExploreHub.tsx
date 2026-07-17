import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, MealPlan, Meal, ApiRecipe, ApiMealPlan, Recipe } from '../types';
import { Card, BackButton, Button } from '../components/UI';
import { fetchApiRecipes } from '../services/recipeService';
import { fetchApiMealPlans } from '../services/mealPlanService';
import { generateRecipe } from '../services/geminiService';
import { Colors, Typography, Layout } from '../theme/goqiiDesignSystem';

interface ExploreHubProps {
  profile: UserProfile;
  plan: MealPlan;
  meals: Meal[];
  onBack: () => void;
  onSelectPlan: () => void;
}

const ExploreHub: React.FC<ExploreHubProps> = ({ profile, plan, meals, onBack, onSelectPlan }) => {
  const [apiRecipes, setApiRecipes] = useState<ApiRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [apiMealPlans, setApiMealPlans] = useState<ApiMealPlan[]>([]);
  const [loadingMealPlans, setLoadingMealPlans] = useState(true);
  
  const [selectedRecipe, setSelectedRecipe] = useState<ApiRecipe | null>(null);
  const [recipeDetail, setRecipeDetail] = useState<Recipe | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const localeMap: Record<string, string> = {
    'English': 'en',
    'Hindi': 'hi',
    'Chinese': 'zh',
    'Arabic': 'ar'
  };

  useEffect(() => {
    const loadData = async () => {
      setLoadingRecipes(true);
      setLoadingMealPlans(true);
      const locale = localeMap[profile.language] || 'en';
      const recipesResult = await fetchApiRecipes({ limit: 15, country: 'IN', locale: locale });
      if (recipesResult && recipesResult.data) setApiRecipes(recipesResult.data);
      setLoadingRecipes(false);
      const mealPlansResult = await fetchApiMealPlans({ limit: 8, country: 'IN', status: 'published' });
      if (mealPlansResult && Array.isArray(mealPlansResult)) setApiMealPlans(mealPlansResult);
      setLoadingMealPlans(false);
    };
    loadData();
  }, [profile.language]);

  const handleOpenRecipe = async (r: ApiRecipe) => {
    setSelectedRecipe(r);
    setLoadingDetail(true);
    const detail = await generateRecipe(r.title, profile);
    setRecipeDetail(detail);
    setLoadingDetail(false);
  };

  const totalConsumed = meals.reduce((sum, m) => m.isLogged ? sum + m.calories : sum, 0);
  const progressPercent = Math.round((totalConsumed / plan.calories) * 100);

  const totalMacros = meals.reduce((acc, m) => m.isLogged ? {
    pro: acc.pro + m.protein,
    carb: acc.carb + m.carbs,
    fat: acc.fat + m.fat
  } : acc, { pro: 0, carb: 0, fat: 0 });

  const getPlanColor = (index: number) => {
    const colors = ['bg-orange-500', 'bg-indigo-600', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F6F8] dark:bg-slate-900 overflow-y-auto pb-32 no-scrollbar">
      <div className="relative h-72 flex-shrink-0 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200" alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30"></div>
        <div className="absolute top-4 left-4 z-30">
          <button onClick={onBack} className={`p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md ${Layout.radius} text-white transition-all active:scale-95 shadow-none`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 bg-[#39C101] text-white text-[9px] ${Typography.Black} uppercase tracking-widest ${Layout.fullRadius} shadow-none`}>Active Plan</span>
              <div className="h-1 w-1 bg-white/40 rounded-full"></div>
              <span className={`text-[10px] text-white/70 ${Typography.Bold} uppercase tracking-widest`}>{plan.duration} Journey</span>
            </div>
            <h1 className={`text-3xl ${Typography.Black} text-white tracking-tight leading-none drop-shadow-md`}>{plan.name}</h1>
          </div>
        </div>
      </div>

      <div className="space-y-8 py-8">
        <div className="px-6">
          <Card className="bg-white dark:bg-slate-800 border-none shadow-xl shadow-slate-200/50 dark:shadow-black/20 relative overflow-hidden p-6 -mt-12 z-20 mx-2">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
                  <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - (isNaN(progressPercent) ? 0 : progressPercent) / 100)}`} strokeLinecap="round" className="text-[#39C101] transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-lg ${Typography.Black} text-slate-900 dark:text-slate-100 leading-none`}>{totalConsumed}</span>
                  <span className={`text-[8px] ${Typography.Black} text-slate-400 dark:text-slate-500 uppercase`}>Calories</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <div className={`flex justify-between text-[9px] ${Typography.Black} uppercase text-slate-500 dark:text-slate-400`}>
                    <span>Protein</span>
                    <span>{totalMacros.pro}g / 120g</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min((totalMacros.pro / 120) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <div className="px-6 flex justify-between items-center mb-4">
            <h3 className={`text-[11px] ${Typography.Black} text-[#A5B3C1] uppercase tracking-widest`}>Fresh Recipes for You</h3>
            <span className={`text-[9px] ${Typography.Black} text-[#39C101] uppercase tracking-widest cursor-pointer hover:underline`}>See All</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6">
            {!loadingRecipes && apiRecipes.map((r) => (
              <div key={r.id} onClick={() => handleOpenRecipe(r)} className={`flex-shrink-0 w-56 bg-white dark:bg-slate-800 ${Layout.radius} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#F1F5F9] dark:border-slate-700 group cursor-pointer`}>
                <div className="h-36 relative">
                  <img src={r.image_url || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400'} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-4">
                  <h4 className={`${Typography.Bold} text-xs text-slate-800 dark:text-slate-100 mb-2 h-8 line-clamp-2 leading-tight`}>{r.title}</h4>
                  <div className="flex justify-between items-center pt-2 border-t border-[#F1F5F9] dark:border-slate-700">
                    <span className={`text-[9px] ${Typography.Black} text-[#A5B3C1] uppercase tracking-tighter`}>{r.calories} kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-10">
          <div className="px-6 flex justify-between items-center mb-6">
            <h3 className={`text-[11px] ${Typography.Black} text-[#A5B3C1] uppercase tracking-widest`}>From the GOQii Health Desk</h3>
          </div>
          <div className="px-6 space-y-4">
            {[
              { title: 'Superfoods for Metabolism', read: '4 min read', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400' },
            ].map((blog, i) => (
              <div key={i} className={`flex gap-4 items-center group cursor-pointer bg-white dark:bg-slate-800/40 p-3 ${Layout.radius} hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all`}>
                <div className={`w-16 h-16 ${Layout.radius10} overflow-hidden flex-shrink-0 border border-[#F1F5F9] dark:border-slate-700 shadow-none`}>
                  <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1">
                  <h4 className={`${Typography.Bold} text-xs text-slate-800 dark:text-slate-100 leading-tight mb-1`}>{blog.title}</h4>
                  <p className={`text-[9px] text-[#A5B3C1] ${Typography.Bold} uppercase tracking-widest`}>{blog.read}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreHub;