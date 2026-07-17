import React, { useState, useMemo, useRef } from 'react';
import { UserProfile, MealPlan, Meal, MealAlternative, GamificationState, Recipe, DetectedFoodItem } from '../types';
import { Card, Button, BackButton } from '../components/UI';
import { generateMealAlternatives, generateRecipe, analyzeFoodImage } from '../services/geminiService';
import { GlobalStyles, Typography, Colors, Layout } from '../theme/goqiiDesignSystem';

interface DashboardProps {
  profile: UserProfile;
  plan: MealPlan;
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  onExit: () => void;
  onViewInsights: () => void;
  onExplore: () => void;
  onViewGrocery: () => void;
  onViewPlanDetails: () => void;
  onEditPlan: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, plan, meals, setMeals, onExit, onViewInsights, onExplore, onViewGrocery, onViewPlanDetails, onEditPlan }) => {
  const [selectedMealForAlt, setSelectedMealForAlt] = useState<Meal | null>(null);
  const [alternativeMeals, setAlternativeMeals] = useState<MealAlternative[]>([]);
  const [selectedMealForRecipe, setSelectedMealForRecipe] = useState<Meal | null>(null);
  const [recipeData, setRecipeData] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [loadingAlts, setLoadingAlts] = useState(false);
  
  const [showLoggingOptions, setShowLoggingOptions] = useState<Meal | null>(null);
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedFoodItem[]>([]);
  const [logTime, setLogTime] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [showLogModal, setShowLogModal] = useState<Meal | null>(null);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [gamification] = useState<GamificationState>({
    points: 0,
    streak: 4,
    badges: [{ id: 'sync', name: 'Sync King', icon: '⌚', description: 'Connected a wearable device' }]
  });

  const weekDays = useMemo(() => {
    const today = new Date();
    const days = [];
    const start = new Date(today);
    start.setDate(today.getDate() - 3);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
      });
    }
    return days;
  }, []);

  const totalConsumed = useMemo(() => 
    meals.reduce((sum, m) => (m.isLogged && !m.isSkipped) ? sum + m.calories : sum, 0),
    [meals]
  );
  
  const targetCals = plan.calories;
  const progressPercent = targetCals > 0 ? Math.round((totalConsumed / targetCals) * 100) : 0;

  const handleQuickLog = (mealId: string) => {
    setMeals(prev => prev.map(m => m.id === mealId ? { 
      ...m, 
      isLogged: true,
      isManual: false,
      isSkipped: false,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    } : m));
    setShowLoggingOptions(null);
  };

  const handleSkipMeal = (mealId: string) => {
    setMeals(prev => prev.map(m => m.id === mealId ? { 
      ...m, 
      isLogged: true,
      isSkipped: true,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    } : m));
  };

  const handleSaveLog = (mealId: string, finalItems: DetectedFoodItem[]) => {
    const totalCals = finalItems.reduce((s, i) => s + i.calories, 0);
    const totalPro = finalItems.reduce((s, i) => s + i.protein, 0);
    const totalCarb = finalItems.reduce((s, i) => s + i.carbs, 0);
    const totalFat = finalItems.reduce((s, i) => s + i.fat, 0);

    setMeals(prev => prev.map(m => m.id === mealId ? { 
      ...m, 
      isLogged: true,
      isSkipped: false,
      calories: totalCals,
      protein: totalPro,
      carbs: totalCarb,
      fat: totalFat,
      photoUri: tempPhoto || m.photoUri,
      loggedAt: logTime,
      manualItems: finalItems,
      name: (m.isManual || (!m.isLogged && showLogModal?.isManual)) && finalItems.length > 0 ? finalItems.map(i => i.name).join(", ") : m.name
    } : m));
    
    setShowLogModal(null);
    setShowLoggingOptions(null);
    setTempPhoto(null);
    setDetectedItems([]);
  };

  const handleEditLog = (meal: Meal) => {
    const itemsToEdit = meal.manualItems && meal.manualItems.length > 0 
      ? [...meal.manualItems] 
      : [{ name: meal.name, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat }];
    
    setDetectedItems(itemsToEdit);
    setTempPhoto(meal.photoUri || null);
    setLogTime(meal.loggedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    setShowLogModal(meal);
    setShowLoggingOptions(null);
  };

  const handleImageInput = async (e: React.ChangeEvent<HTMLInputElement>, meal: Meal | null, replaceOnly: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!replaceOnly) {
        setShowLoggingOptions(null);
        setIsAnalyzingFood(true);
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setTempPhoto(base64);
        
        if (!replaceOnly && meal) {
          try {
            const items = await analyzeFoodImage(base64);
            setDetectedItems(items);
            setLogTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
          } catch (err) {
            console.error("Analysis error:", err);
          } finally {
            setIsAnalyzingFood(false);
            setShowLogModal({ ...meal, isManual: true });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDetectedItem = (index: number, field: keyof DetectedFoodItem, value: any) => {
    setDetectedItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: field === 'name' ? value : Number(value) };
      return copy;
    });
  };

  const removeDetectedItem = (index: number) => {
    setDetectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const openAlternative = async (meal: Meal) => {
    setSelectedMealForAlt(meal);
    setLoadingAlts(true);
    const alts = await generateMealAlternatives(meal, profile);
    setAlternativeMeals(alts);
    setLoadingAlts(false);
  };

  const handleSwapMeal = (alt: MealAlternative) => {
    if (!selectedMealForAlt) return;
    setMeals(prev => prev.map(m => m.id === selectedMealForAlt.id ? {
      ...m,
      name: alt.name,
      calories: alt.calories,
      protein: alt.protein,
      carbs: alt.carbs,
      fat: alt.fat,
      isLogged: false,
      isSkipped: false,
      manualItems: [{ name: alt.name, calories: alt.calories, protein: alt.protein, carbs: alt.carbs, fat: alt.fat }]
    } : m));
    setSelectedMealForAlt(null);
    setAlternativeMeals([]);
  };

  const openRecipe = async (meal: Meal) => {
    setSelectedMealForRecipe(meal);
    if (meal.apiRecipeDetail && (meal.apiRecipeDetail.description || (meal.apiRecipeDetail.instructions && meal.apiRecipeDetail.instructions.length > 0))) {
      setRecipeData({
        ingredients: [],
        instructions: meal.apiRecipeDetail.instructions || [],
        prepTime: meal.apiRecipeDetail.prepTime ? `${meal.apiRecipeDetail.prepTime}m` : '15m',
        cookTime: meal.apiRecipeDetail.cookTime ? `${meal.apiRecipeDetail.cookTime}m` : '15m'
      });
      return;
    }
    setLoadingRecipe(true);
    const recipe = await generateRecipe(meal.name, profile);
    setRecipeData(recipe);
    setLoadingRecipe(false);
  };

  return (
    <div className={GlobalStyles.screen}>
      <header className={GlobalStyles.header}>
        <div className="flex items-center gap-3">
          <BackButton onClick={onExit} className="-ml-2" />
          <div className="flex flex-col">
            <h2 className={`${Typography.h3} ${Typography.Black}`}>NutriForge</h2>
            <div className="flex items-center gap-2">
              <span className={Typography.label}>{plan.name}</span>
              <div className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              <div className="flex items-center gap-1 text-orange-500 font-bold text-[10px] tracking-tight">
                <span>🔥</span> {gamification.streak} Day Streak
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={Typography.caption}>Target Energy</span>
          <span className={`${Typography.h3} ${Typography.Black}`}>{targetCals} kcal</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-6 py-4 flex gap-4 overflow-x-auto no-scrollbar bg-white dark:bg-[#1E293B] border-b border-[#F1F5F9] dark:border-slate-700 transition-colors">
          {weekDays.map((day, i) => (
            <div key={i} className={`flex-shrink-0 w-12 h-16 rounded-[20px] flex flex-col items-center justify-center gap-1.5 transition-all ${day.isToday ? 'bg-[#39C101] text-white shadow-lg shadow-[#39C101]/25' : 'text-[#A5B3C1] hover:text-slate-500'}`}>
              <span className="text-[11px] font-black uppercase tracking-tight">{day.label}</span>
              <span className="text-base font-black tracking-tighter">{day.date}</span>
            </div>
          ))}
        </div>

        <div className="px-6 py-6">
          <Card onClick={onViewInsights} className="relative overflow-hidden p-8 group max-w-[800px] mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span className={Typography.caption}>Daily Energy</span>
                  <svg className="w-3.5 h-3.5 text-[#A5B3C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={Typography.energy}>{totalConsumed}</span>
                  <span className="text-base text-[#A5B3C1] font-bold">/ {targetCals || '---'} kcal</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-[5px] border-slate-100 dark:border-slate-700 flex items-center justify-center relative shadow-inner">
                <svg className="w-full h-full absolute inset-0 -rotate-90">
                  <circle cx="32" cy="32" r="27.5" fill="transparent" stroke="currentColor" strokeWidth="5" className="text-slate-50 dark:text-slate-700/50"/>
                  <circle cx="32" cy="32" r="27.5" fill="transparent" stroke="currentColor" strokeWidth="5" className="text-[#39C101]" strokeDasharray="172.7" strokeDashoffset={172.7 - (172.7 * (progressPercent / 100))} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
                </svg>
                <span className="text-xs font-black text-slate-900 dark:text-white">{progressPercent}%</span>
              </div>
            </div>
            <div className="w-full h-4 bg-slate-50 dark:bg-slate-900/50 rounded-full overflow-hidden relative shadow-inner">
               <div className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
            </div>
          </Card>
          <div className="flex justify-center gap-8 mt-4 px-2">
            <button onClick={onViewPlanDetails} className={Typography.label + " text-[#39C101]"}>View Plan Details</button>
            <button onClick={onEditPlan} className={Typography.label + " text-[#39C101]"}>Change Plan</button>
          </div>
        </div>

        <div className="px-6 space-y-6">
          <h3 className={Typography.label + " mb-4 pl-1"}>Today's Meals</h3>
          {meals.map(meal => (
            <div 
              key={meal.id} 
              className={`${GlobalStyles.card} p-7 relative group overflow-hidden ${meal.isSkipped ? 'opacity-50 grayscale bg-slate-50 dark:bg-slate-900 pointer-events-none' : 'hover:shadow-xl hover:shadow-slate-200/50'}`}
            >
              {!meal.isSkipped && (
                <button 
                  onClick={() => {
                    if (meal.isLogged) {
                      handleEditLog(meal);
                    } else {
                      setShowLoggingOptions(meal);
                    }
                  }}
                  className={`absolute top-7 right-7 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${meal.isLogged ? 'bg-[#39C101] border-[#39C101] shadow-none' : 'bg-slate-50 dark:bg-slate-800 border-[#F1F5F9] dark:border-slate-700 hover:border-[#39C101]/50 shadow-none'}`}
                >
                  {meal.isLogged ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  ) : (
                    <svg className="w-6 h-6 text-[#39C101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                  )}
                </button>
              )}

              <div className="flex flex-col gap-1.5 mb-8 pr-16">
                <div className="flex items-center gap-2">
                  <span className={Typography.label}>{meal.type}</span>
                  {meal.isSkipped && (
                    <span className={`text-[9px] font-black text-white bg-slate-500 dark:bg-slate-600 px-3 py-1 ${Layout.radius10} uppercase tracking-widest shadow-none`}>Skipped</span>
                  )}
                  {meal.isLogged && !meal.isSkipped && meal.isManual && (
                    <span className={`text-[9px] font-black text-white bg-[#39C101] px-2 py-0.5 ${Layout.radius10} uppercase tracking-widest shadow-none`}>Logged manually</span>
                  )}
                  {meal.loggedAt && !meal.isSkipped && (
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{meal.loggedAt}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {meal.photoUri && (
                    <div className={`w-10 h-10 ${Layout.radius10} overflow-hidden shrink-0 border border-[#F1F5F9] dark:border-slate-700 shadow-none`}>
                      <img src={meal.photoUri} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <h4 className={`${Typography.h3} ${Typography.Black} transition-colors ${meal.isSkipped ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{meal.name}</h4>
                </div>
                <span className="text-xs font-bold text-[#A5B3C1]">{meal.isSkipped ? 0 : meal.calories} kcal</span>
              </div>

              {meal.isSkipped ? (
                <div className="w-full flex justify-center py-2 animate-in fade-in zoom-in-95 duration-500">
                  <div className={`text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] bg-slate-100 dark:bg-slate-800 px-14 py-4 ${Layout.radius10} border border-[#F1F5F9] dark:border-slate-700 shadow-none`}>
                    Skipped
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 mt-auto">
                  <Button variant="outline" onClick={() => openRecipe(meal)} className="flex-1 min-w-[80px]">Recipe</Button>
                  <Button variant="outline" onClick={() => openAlternative(meal)} className="flex-1 min-w-[80px]">Swap</Button>
                  <Button variant="outline" onClick={() => handleSkipMeal(meal.id)} className="flex-1 min-w-[80px] !text-red-500 !border-red-100">Skip</Button>
                  <Button 
                    onClick={() => {
                      if (meal.isLogged) {
                        handleEditLog(meal);
                      } else {
                        setShowLoggingOptions(meal);
                      }
                    }}
                    className="flex-1 min-w-[100px]"
                  >
                    {meal.isLogged ? 'Edit' : 'Log'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showLoggingOptions && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex flex-col items-center justify-center p-4" onClick={() => setShowLoggingOptions(null)}>
          <div className={`bg-white dark:bg-slate-900 rounded-[40px] p-10 max-w-md w-full animate-in zoom-in-95 duration-500 shadow-2xl`} onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
            <div className="flex justify-between items-center mb-10">
              <h3 className={`${Typography.h2} ${Typography.Black} uppercase`}>Log {showLoggingOptions.type}</h3>
              <button onClick={() => setShowLoggingOptions(null)} className={`p-3 bg-slate-100 dark:bg-slate-800 ${Layout.fullRadius} hover:bg-slate-200 transition-colors shadow-none`}>
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="space-y-4">
              <button onClick={() => handleQuickLog(showLoggingOptions.id)} className={`w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 ${Layout.radius} border-2 border-[#F1F5F9] dark:border-slate-700 hover:border-[#39C101]/50 transition-all active:scale-95 shadow-none`}>
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 bg-[#39C101]/10 ${Layout.radius10} flex items-center justify-center text-[#39C101] shadow-none`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg></div>
                  <div className="text-left">
                    <span className={`block ${Typography.Bold} text-slate-900 dark:text-white uppercase text-sm tracking-tight`}>Select from My Plan</span>
                    <span className={Typography.caption}>Standard metabolic entry</span>
                  </div>
                </div>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className={`w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 ${Layout.radius} border-2 border-[#F1F5F9] dark:border-slate-700 hover:border-[#39C101]/50 transition-all active:scale-95 shadow-none`}>
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 bg-[#39C101]/10 ${Layout.radius10} flex items-center justify-center text-[#39C101] shadow-none`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                  <div className="text-left">
                    <span className={`block ${Typography.Bold} text-slate-900 dark:text-white uppercase text-sm tracking-tight`}>Upload Food Photo</span>
                    <span className={Typography.caption}>Instant AI Vision Forge</span>
                  </div>
                </div>
              </button>
              <button onClick={() => galleryInputRef.current?.click()} className={`w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 ${Layout.radius} border-2 border-[#F1F5F9] dark:border-slate-700 hover:border-[#39C101]/50 transition-all active:scale-95 shadow-none`}>
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 bg-[#39C101]/10 ${Layout.radius10} flex items-center justify-center text-[#39C101] shadow-none`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                  <div className="text-left">
                    <span className={`block ${Typography.Bold} text-slate-900 dark:text-white uppercase text-sm tracking-tight`}>Choose from Gallery</span>
                    <span className={Typography.caption}>Analyze past capture</span>
                  </div>
                </div>
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={e => handleImageInput(e, showLoggingOptions!)}/>
            <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" onChange={e => handleImageInput(e, showLoggingOptions!)}/>
          </div>
        </div>
      )}

      {isAnalyzingFood && (
        <div className="fixed inset-0 bg-white/95 dark:bg-slate-950/95 z-[150] flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 border-4 border-[#39C101] border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className={`${Typography.h2} ${Typography.Black} uppercase`}>AI Vision Forge</h2>
          <p className={Typography.caption + " max-w-xs leading-relaxed italic animate-pulse"}>Deconstructing metabolic density...</p>
        </div>
      )}

      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[130] flex flex-col items-center justify-center p-6">
          <div className={`bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md overflow-hidden flex flex-col shadow-2xl h-[85%] animate-in zoom-in-95 duration-300`}>
            <div className="h-48 relative shrink-0">
              {tempPhoto ? (
                <img src={tempPhoto} className="w-full h-full object-cover" alt="" />
              ) : showLogModal.photoUri ? (
                <img src={showLogModal.photoUri} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 shadow-none">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              
              <button 
                onClick={() => editFileInputRef.current?.click()}
                className={`absolute bottom-4 right-4 p-2.5 bg-white/20 backdrop-blur-md ${Layout.radius10} text-white border border-white/30 hover:bg-white/30 transition-all flex items-center gap-2 shadow-none`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                <span className={Typography.caption}>Change Photo</span>
              </button>
              <input type="file" ref={editFileInputRef} className="hidden" accept="image/*" onChange={e => handleImageInput(e, null, true)}/>

              <button onClick={() => { setShowLogModal(null); setTempPhoto(null); }} className={`absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md ${Layout.fullRadius} text-white shadow-none`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="absolute bottom-6 left-8 right-8">
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest block mb-1">Metabolic Log</span>
                <h4 className={`${Typography.h3} ${Typography.Black} text-white uppercase`}>
                  {showLogModal.isManual || (!showLogModal.isLogged && showLogModal.isManual) ? 'Edit Manual Log' : 'Edit Plan Log'}
                </h4>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h5 className={Typography.label}>Logged Time</h5>
                  <input 
                    type="time" 
                    value={logTime} 
                    onChange={e => setLogTime(e.target.value)}
                    className={`bg-slate-50 dark:bg-slate-800 border-none ${Layout.radius10} text-xs font-black text-[#39C101] uppercase p-2 focus:ring-2 focus:ring-[#39C101] shadow-none`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h5 className={Typography.label}>Food Breakdown</h5>
                  {(showLogModal.isManual || !showLogModal.isLogged) && (
                    <button onClick={() => setDetectedItems([...detectedItems, { name: 'New Item', calories: 100, protein: 10, carbs: 10, fat: 5 }])} className={Typography.caption + " text-[#39C101] shadow-none"}>+ Add Item</button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {detectedItems.map((item, idx) => (
                    <div key={idx} className={`bg-slate-50 dark:bg-slate-800 p-5 ${Layout.radius} border border-[#F1F5F9] dark:border-slate-700 space-y-4 shadow-none`}>
                      <div className="flex justify-between items-start gap-4">
                        <input 
                          value={item.name} 
                          onChange={e => updateDetectedItem(idx, 'name', e.target.value)}
                          disabled={!(showLogModal.isManual || (!showLogModal.isLogged && showLogModal.isManual))}
                          className={`flex-1 bg-transparent border-none p-0 text-sm ${Typography.Black} text-slate-900 dark:text-white focus:ring-0 uppercase tracking-tight ${!(showLogModal.isManual || (!showLogModal.isLogged && showLogModal.isManual)) ? 'opacity-50' : ''}`}
                          placeholder="Food Name"
                        />
                        {(showLogModal.isManual || (!showLogModal.isLogged && showLogModal.isManual)) && (
                          <button onClick={() => removeDetectedItem(idx)} className="text-red-400 p-1 shadow-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col"><span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Kcal</span><input type="number" value={item.calories} onChange={e => updateDetectedItem(idx, 'calories', e.target.value)} className={`text-[11px] ${Typography.Black} bg-transparent border-none p-0 focus:ring-0 text-slate-800 dark:text-white`} /></div>
                        <div className="flex flex-col"><span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Pro</span><input type="number" value={item.protein} onChange={e => updateDetectedItem(idx, 'protein', e.target.value)} className={`text-[11px] ${Typography.Black} bg-transparent border-none p-0 focus:ring-0 text-slate-800 dark:text-white`} /></div>
                        <div className="flex flex-col"><span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Carb</span><input type="number" value={item.carbs} onChange={e => updateDetectedItem(idx, 'carbs', e.target.value)} className={`text-[11px] ${Typography.Black} bg-transparent border-none p-0 focus:ring-0 text-slate-800 dark:text-white`} /></div>
                        <div className="flex flex-col"><span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Fat</span><input type="number" value={item.fat} onChange={e => updateDetectedItem(idx, 'fat', e.target.value)} className={`text-[11px] ${Typography.Black} bg-transparent border-none p-0 focus:ring-0 text-slate-800 dark:text-white`} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-8 bg-[#39C101]/5 ${Layout.radius} border-2 border-dashed border-[#39C101]/20 text-center shadow-none`}>
                 <span className={Typography.caption + " text-[#39C101] block mb-2"}>Total Energy Forge</span>
                 <span className={`${Typography.h1} ${Typography.Black}`}>{detectedItems.reduce((s, i) => s + i.calories, 0)} kcal</span>
              </div>
            </div>

            <div className="p-8 pt-0">
               <Button 
                onClick={() => handleSaveLog(showLogModal.id, detectedItems)}
                className="w-full shadow-none"
               >
                 Save & Update Log
               </Button>
            </div>
          </div>
        </div>
      )}

      {selectedMealForAlt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex flex-col items-center justify-center p-4" onClick={() => {setSelectedMealForAlt(null); setAlternativeMeals([]);}}>
          <div className={`bg-white dark:bg-slate-900 rounded-[40px] p-8 max-h-[85%] max-w-2xl w-full overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-500 no-scrollbar`} onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <span className={Typography.caption + " text-[#39C101]"}>Active Swap</span>
                <h3 className={`${Typography.h2} ${Typography.Black}`}>Swap {selectedMealForAlt.type}</h3>
              </div>
              <button onClick={() => {setSelectedMealForAlt(null); setAlternativeMeals([]);}} className={`p-3 bg-slate-100 dark:bg-slate-800 ${Layout.fullRadius}`}>
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {loadingAlts ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-[#39C101] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className={Typography.caption}>Forging Alternatives...</p>
              </div>
            ) : alternativeMeals.length > 0 ? (
              <div className="space-y-4 mb-8">
                {alternativeMeals.map((alt, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleSwapMeal(alt)}
                    className={`p-6 bg-slate-50 dark:bg-slate-800 ${Layout.radius} border-2 border-transparent hover:border-[#39C101]/40 transition-all cursor-pointer group active:scale-[0.98] shadow-none`}
                  >
                    <h4 className={`${Typography.h4} ${Typography.Black} mb-2`}>{alt.name}</h4>
                    <div className="flex gap-4 mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">🔥 {alt.calories} kcal</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">🥩 {alt.protein}g P</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">🥑 {alt.fat}g F</span>
                    </div>
                    <div className={`p-3 bg-[#39C101]/5 ${Layout.radius10} border border-[#39C101]/10 shadow-none`}>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">"{alt.timingTip}"</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <Button onClick={() => {setSelectedMealForAlt(null); setAlternativeMeals([]);}} className="w-full" variant="ghost">Cancel Swap</Button>
          </div>
        </div>
      )}

      {selectedMealForRecipe && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex flex-col items-center justify-center p-4" onClick={() => setSelectedMealForRecipe(null)}>
           <div className={`bg-white dark:bg-slate-900 rounded-[40px] p-8 max-h-[85%] max-w-2xl w-full overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-500 no-scrollbar`} onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <span className={Typography.caption + " text-[#39C101]"}>Culinary Blueprint</span>
                <h3 className={`${Typography.h2} ${Typography.Black}`}>{selectedMealForRecipe.name}</h3>
              </div>
              <button onClick={() => setSelectedMealForRecipe(null)} className={`p-3 bg-slate-100 dark:bg-slate-800 ${Layout.fullRadius} shadow-none`}>
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            {loadingRecipe ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-[#39C101] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className={Typography.caption}>Decrypting Recipe Intel...</p>
              </div>
            ) : recipeData ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 bg-slate-50 dark:bg-slate-800 ${Layout.radius10} flex flex-col items-center justify-center text-center shadow-none`}>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prep Time</span>
                    <span className={`text-sm ${Typography.Black} text-slate-800 dark:text-white`}>{recipeData.prepTime}</span>
                  </div>
                  <div className={`p-4 bg-slate-50 dark:bg-slate-800 ${Layout.radius10} flex flex-col items-center justify-center text-center shadow-none`}>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cook Time</span>
                    <span className={`text-sm ${Typography.Black} text-slate-800 dark:text-white`}>{recipeData.cookTime}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className={`text-sm ${Typography.Black} text-slate-900 dark:text-white uppercase tracking-widest border-l-4 border-[#39C101] pl-3`}>Instructions</h4>
                  <div className="space-y-6">
                    {recipeData.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <span className={`flex-shrink-0 w-8 h-8 bg-[#39C101] text-white ${Layout.radius10} flex items-center justify-center text-xs font-black shadow-none`}>{i + 1}</span>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={() => setSelectedMealForRecipe(null)} className="w-full shadow-none">Done</Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;