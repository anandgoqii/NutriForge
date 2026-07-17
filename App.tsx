import React, { useState, useEffect } from 'react';
import { UserProfile, HealthGoal, Cuisine, MealFrequency, DietPreference, MealPlan, Meal } from './types';
import Onboarding from './views/Onboarding';
import PlanSelection from './views/PlanSelection';
import Dashboard from './views/Dashboard';
import FreeMode from './views/FreeMode';
import Insights from './views/Insights';
import Settings from './views/Settings';
import ExploreHub from './views/ExploreHub';
import GroceryList from './views/GroceryList';
import PlanDetails from './views/PlanDetails';
import EditPlan from './views/EditPlan';
import { generateDailyMeals } from './services/geminiService';
import { fetchApiMealPlanById } from './services/mealPlanService';
import { Colors, GlobalStyles, Layout, Typography } from './theme/goqiiDesignSystem';

type View = 'onboarding' | 'plan-selection' | 'dashboard' | 'free-mode' | 'insights' | 'settings' | 'explore-hub' | 'grocery-list' | 'plan-details' | 'edit-plan';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [previewPlan, setPreviewPlan] = useState<MealPlan | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleOnboardingComplete = (data: UserProfile) => {
    setProfile(data);
    setCurrentView('plan-selection');
  };

  const handleLogout = () => {
    setProfile(null);
    setSelectedPlan(null);
    setPreviewPlan(null);
    setMeals([]);
    setCurrentView('onboarding');
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (selectedPlan) {
      setIsForging(true);
      try {
        const finalMeals = await generateDailyMeals(selectedPlan, newProfile);
        setMeals(finalMeals);
        setCurrentView('dashboard');
      } catch (err) {
        console.error("Error rebuilding plan:", err);
      } finally {
        setIsForging(false);
      }
    } else {
      setCurrentView('plan-selection');
    }
  };

  const handlePlanSelect = async (plan: MealPlan | null) => {
    if (plan && profile) {
      setIsForging(true);
      try {
        const apiPlanResponse = await fetchApiMealPlanById(plan.id);
        const apiPlanDetail = apiPlanResponse?.data || apiPlanResponse;
        const userCalories = plan.calories;
        const enrichedPlan: MealPlan = apiPlanDetail ? {
          id: apiPlanDetail.id || plan.id,
          name: apiPlanDetail.name || plan.name,
          duration: `${apiPlanDetail.duration_days || 7} Days`,
          calories: userCalories,
          description: apiPlanDetail.description || plan.description,
          image_url: apiPlanDetail.image_url || plan.image_url
        } : plan;
        setSelectedPlan(enrichedPlan);
        let finalMeals: Meal[] = [];
        if (apiPlanDetail?.days && apiPlanDetail.days["1"]) {
          finalMeals = apiPlanDetail.days["1"].map((item: any, idx: number) => ({
            id: item.recipe?.id || `api-meal-${idx}-${Date.now()}`,
            type: (item.meal_type.toLowerCase().includes('breakfast') ? 'Breakfast' : item.meal_type.toLowerCase().includes('lunch') ? 'Lunch' : item.meal_type.toLowerCase().includes('dinner') ? 'Dinner' : 'Snack'),
            name: item.recipe?.title || 'Unknown Meal',
            calories: item.recipe?.calories || 0,
            protein: item.recipe?.protein || 0,
            carbs: item.recipe?.carbs || 0,
            fat: item.recipe?.fats || 0,
            isLogged: false
          }));
        } else {
          finalMeals = await generateDailyMeals(enrichedPlan, profile);
        }
        setMeals(finalMeals);
      } catch (err) {
        setSelectedPlan(plan);
        setMeals([]);
      } finally {
        setIsForging(false);
        setPreviewPlan(null);
        setCurrentView('dashboard');
      }
    } else {
      setCurrentView('free-mode');
    }
  };

  const isMainApp = ['dashboard', 'free-mode', 'insights', 'settings', 'explore-hub', 'grocery-list', 'plan-details', 'edit-plan'].includes(currentView);

  const NavigationItems = () => (
    <>
      <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${['dashboard', 'explore-hub', 'grocery-list', 'plan-details', 'edit-plan'].includes(currentView) ? 'text-[#39C101]' : 'text-slate-400 dark:text-slate-500'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
      </button>
      <button onClick={() => setCurrentView('free-mode')} className={`flex flex-col items-center gap-1 transition-all ${currentView === 'free-mode' ? 'text-[#39C101]' : 'text-slate-400 dark:text-slate-500'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <span className="text-[10px] font-black uppercase tracking-tighter">Forge</span>
      </button>
      <button onClick={() => setCurrentView('insights')} className={`flex flex-col items-center gap-1 transition-all ${currentView === 'insights' ? 'text-[#39C101]' : 'text-slate-400 dark:text-slate-500'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        <span className="text-[10px] font-black uppercase tracking-tighter">Insights</span>
      </button>
      <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center gap-1 transition-all ${currentView === 'settings' ? 'text-[#39C101]' : 'text-slate-400 dark:text-slate-500'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        <span className="text-[10px] font-black uppercase tracking-tighter">Profile</span>
      </button>
    </>
  );

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-[#F5F6F8] dark:bg-[#020617] flex justify-center`}>
      <div className="w-full max-w-[440px] bg-transparent shadow-2xl relative overflow-hidden flex flex-col">
        {!['onboarding'].includes(currentView) && (
          <div className="h-10 flex justify-between items-center px-8 shrink-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{time}</span>
            <div className="flex gap-1.5 items-center">
              <svg className="w-4 h-4 text-slate-800 dark:text-slate-100" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-4a1 1 0 011-1h2a1 1 0 011 1v13a1 1 0 01-1 1h-2a1 1 0 01-1-1V3z"></path></svg>
              <div className="w-5 h-2.5 border border-slate-800 dark:text-slate-100 rounded-sm relative">
                <div className="absolute left-0.5 top-0.5 bottom-0.5 right-1 bg-slate-800 dark:bg-slate-100 rounded-px"></div>
              </div>
            </div>
          </div>
        )}

        <div className={GlobalStyles.screen}>
          {isForging && (
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-[100] flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
              <div className="relative w-32 h-32 mb-8">
                <div className={`absolute inset-0 border-4 border-[#F1F5F9] dark:border-slate-800 rounded-full`}></div>
                <div className={`absolute inset-0 border-4 border-[#39C101] rounded-full border-t-transparent animate-spin`}></div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">Forging Blueprint</h2>
            </div>
          )}

          {currentView === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
          {currentView === 'plan-selection' && <PlanSelection onSelect={handlePlanSelect} onBack={() => setCurrentView('onboarding')} onViewDetails={(p) => { setPreviewPlan(p); setCurrentView('plan-details'); }} onEditPlan={() => setCurrentView('edit-plan')} profile={profile} />}
          {currentView === 'dashboard' && profile && selectedPlan && <Dashboard profile={profile} plan={selectedPlan} meals={meals} setMeals={setMeals} onExit={() => setCurrentView('plan-selection')} onViewInsights={() => setCurrentView('insights')} onExplore={() => setCurrentView('explore-hub')} onViewGrocery={() => setCurrentView('grocery-list')} onViewPlanDetails={() => { setPreviewPlan(null); setCurrentView('plan-details'); }} onEditPlan={() => setCurrentView('edit-plan')} />}
          {currentView === 'plan-details' && profile && (selectedPlan || previewPlan) && <PlanDetails profile={profile} plan={previewPlan || selectedPlan!} onBack={() => selectedPlan && !previewPlan ? setCurrentView('dashboard') : setCurrentView('plan-selection')} onSelect={handlePlanSelect} />}
          {currentView === 'edit-plan' && profile && <EditPlan profile={profile} onBack={() => selectedPlan ? setCurrentView('dashboard') : setCurrentView('plan-selection')} onRebuild={handleUpdateProfile} />}
          {currentView === 'explore-hub' && profile && selectedPlan && <ExploreHub profile={profile} plan={selectedPlan} meals={meals} onBack={() => setCurrentView('dashboard')} onSelectPlan={() => setCurrentView('plan-selection')} />}
          {currentView === 'grocery-list' && <GroceryList onBack={() => setCurrentView('dashboard')} />}
          {currentView === 'free-mode' && <FreeMode onBack={() => setCurrentView('plan-selection')} meals={meals} setMeals={setMeals} plan={selectedPlan} profile={profile || undefined} onExplore={() => setCurrentView('explore-hub')} onViewGrocery={() => setCurrentView('grocery-list')} />}
          {currentView === 'insights' && profile && <Insights onBack={() => setCurrentView('dashboard')} meals={meals} targetCalories={selectedPlan?.calories || 2000} />}
          {currentView === 'settings' && <Settings onBack={() => setCurrentView('dashboard')} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={handleLogout} />}
        </div>

        {isMainApp && (
          <nav className={GlobalStyles.tabBar}>
            <NavigationItems />
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;