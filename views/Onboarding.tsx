import React, { useState, useEffect } from 'react';
import { UserProfile, HealthGoal, Cuisine, MealFrequency, DietPreference } from '../types';
import { Button, ProgressBar, BackButton } from '../components/UI';
import { Colors, Typography, Layout } from '../theme/goqiiDesignSystem';

interface OnboardingProps {
  onComplete: (data: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<UserProfile>({
    language: 'English',
    healthGoal: HealthGoal.WeightLoss,
    cuisine: Cuisine.Indian,
    mealFrequency: MealFrequency.ThreePlusSnacks,
    dietPreference: DietPreference.Vegetarian,
    allergies: [],
    challenges: [],
  });

  const totalSteps = 8;

  useEffect(() => {
    if (step === 7) {
      const timer = setTimeout(() => {
        onComplete(formData);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, formData, onComplete]);

  const next = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    }
  };

  const back = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };

  const toggleItem = (list: string[], item: string, key: keyof UserProfile) => {
    let newList: string[];
    if (item === 'None') {
      newList = ['None'];
    } else {
      newList = list.filter(i => i !== 'None');
      newList = newList.includes(item) 
        ? newList.filter(i => i !== item) 
        : [...newList, item];
    }
    setFormData(prev => ({ ...prev, [key]: newList }));
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="absolute inset-0 flex flex-col justify-end overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1000" 
                alt="Healthy Food" 
                className="w-full h-full object-cover scale-105 animate-pulse-slow"
                style={{ animationDuration: '8s' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            </div>
            <div className="relative z-10 p-8 pb-16 text-center space-y-6 animate-in slide-in-from-bottom-8 duration-1000">
              <div className="space-y-3">
                <h1 className={`${Typography.h1} ${Typography.Black} text-white leading-[1.1]`}>
                  Nutrition that understands your body
                </h1>
                <p className={`text-slate-200 ${Typography.bodyBold} px-4 opacity-90`}>
                  Powered by food science, genetics & lifestyle data
                </p>
              </div>
              <div className="pt-4">
                <button 
                  onClick={next} 
                  className={`w-full bg-[#39C101] hover:bg-[#32aa01] text-white font-bold py-5 px-8 ${Layout.fullRadius} shadow-none transition-all active:scale-95 text-lg flex items-center justify-center gap-2`}
                >
                  Personalise My Nutrition
                </button>
              </div>
            </div>
          </div>
        );

      case 1:
        const goalIcons: Record<string, string> = {
          [HealthGoal.WeightLoss]: '⚖️',
          [HealthGoal.MuscleGain]: '💪',
          [HealthGoal.HeartHealth]: '❤️',
          [HealthGoal.Energy]: '⚡',
          [HealthGoal.BalancedLifestyle]: '🧘',
        };
        return (
          <div className="space-y-4 pt-4">
            <BackButton onClick={back} className="mb-2 -ml-2" />
            <h2 className={`${Typography.h2} ${Typography.Black} text-[#0F172A] dark:text-white mb-6`}>What's your primary health goal?</h2>
            <div className="space-y-3">
              {Object.values(HealthGoal).map(goal => (
                <div 
                  key={goal} 
                  onClick={() => { setFormData({...formData, healthGoal: goal}); next(); }}
                  className={`transition-all border-2 ${Layout.radius} p-4 cursor-pointer flex items-center gap-4 ${formData.healthGoal === goal ? 'border-[#39C101] bg-green-50 dark:bg-green-950/20' : 'border-[#F1F5F9] dark:border-slate-800 bg-white'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${formData.healthGoal === goal ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {goalIcons[goal]}
                  </div>
                  <span className={`${Typography.bodyBold} text-[#0F172A] dark:text-white flex-1`}>{goal}</span>
                  {formData.healthGoal === goal && (
                    <div className="w-6 h-6 bg-[#39C101] rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        const cuisineIcons: Record<string, string> = {
          [Cuisine.Indian]: '🍛',
          [Cuisine.Mediterranean]: '🥗',
          [Cuisine.Asian]: '🥢',
          [Cuisine.MiddleEastern]: '🥙',
          [Cuisine.Western]: '🍔',
          [Cuisine.Mixed]: '🍱',
        };
        return (
          <div className="space-y-4 pt-4">
            <BackButton onClick={back} className="mb-2 -ml-2" />
            <h2 className={`${Typography.h2} ${Typography.Black} text-[#0F172A] dark:text-white mb-6`}>Cuisine Preference</h2>
            <div className="space-y-3">
              {Object.values(Cuisine).map(c => (
                <div 
                  key={c} 
                  onClick={() => { setFormData({...formData, cuisine: c}); next(); }}
                  className={`transition-all border-2 ${Layout.radius} p-4 cursor-pointer flex items-center gap-4 ${formData.cuisine === c ? 'border-[#39C101] bg-green-50 dark:bg-green-950/20' : 'border-[#F1F5F9] dark:border-slate-800 bg-white'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${formData.cuisine === c ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {cuisineIcons[c]}
                  </div>
                  <span className={`${Typography.bodyBold} text-[#0F172A] dark:text-white flex-1`}>{c}</span>
                  {formData.cuisine === c && (
                    <div className="w-6 h-6 bg-[#39C101] rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        const freqIcons: Record<string, string> = {
          [MealFrequency.ThreeMeals]: '🍽️',
          [MealFrequency.ThreePlusSnacks]: '🍱',
          [MealFrequency.IntermittentFasting]: '⏲️',
          [MealFrequency.Custom]: '🥣',
        };
        return (
          <div className="space-y-4 pt-4">
            <BackButton onClick={back} className="mb-2 -ml-2" />
            <h2 className={`${Typography.h2} ${Typography.Black} text-[#0F172A] dark:text-white mb-6`}>Meals Per Day</h2>
            <div className="space-y-3">
              {Object.values(MealFrequency).map(f => (
                <div 
                  key={f} 
                  onClick={() => { setFormData({...formData, mealFrequency: f}); next(); }}
                  className={`transition-all border-2 ${Layout.radius} p-4 cursor-pointer flex items-center gap-4 ${formData.mealFrequency === f ? 'border-[#39C101] bg-green-50 dark:bg-green-950/20' : 'border-[#F1F5F9] dark:border-slate-800 bg-white'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${formData.mealFrequency === f ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {freqIcons[f]}
                  </div>
                  <span className={`${Typography.bodyBold} text-[#0F172A] dark:text-white flex-1`}>{f}</span>
                  {formData.mealFrequency === f && (
                    <div className="w-6 h-6 bg-[#39C101] rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        const dietIcons: Record<string, string> = {
          [DietPreference.Vegetarian]: '🥦',
          [DietPreference.Vegan]: '🌿',
          [DietPreference.Eggetarian]: '🥚',
          [DietPreference.NonVegetarian]: '🍗',
          [DietPreference.OpenToAll]: '🥘',
          [DietPreference.Keto]: '🥓',
          [DietPreference.Balanced]: '⚖️',
        };
        return (
          <div className="space-y-4 pt-4">
            <BackButton onClick={back} className="mb-2 -ml-2" />
            <h2 className={`${Typography.h2} ${Typography.Black} text-[#0F172A] dark:text-white mb-6`}>Dietary Preference</h2>
            <div className="space-y-3">
              {Object.values(DietPreference).map((type) => (
                <div 
                  key={type} 
                  onClick={() => { setFormData({...formData, dietPreference: type}); next(); }}
                  className={`transition-all border-2 ${Layout.radius} p-4 cursor-pointer flex items-center gap-4 ${formData.dietPreference === type ? 'border-[#39C101] bg-green-50 dark:bg-green-950/20' : 'border-[#F1F5F9] dark:border-slate-800 bg-white'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${formData.dietPreference === type ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {dietIcons[type]}
                  </div>
                  <span className={`${Typography.bodyBold} text-[#0F172A] dark:text-white flex-1`}>{type}</span>
                  {formData.dietPreference === type && (
                    <div className="w-6 h-6 bg-[#39C101] rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        const allergyIcons: Record<string, string> = {
          'Nuts': '🥜',
          'Dairy': '🥛',
          'Gluten': '🍞',
          'Seafood': '🦐',
          'Eggs': '🥚',
          'None': '🚫',
        };
        return (
          <div className="space-y-4 pt-4">
            <BackButton onClick={back} className="mb-2 -ml-2" />
            <h2 className={`${Typography.h2} ${Typography.Black} text-[#0F172A] dark:text-white mb-2`}>Any Allergies?</h2>
            <p className={`${Typography.body} text-[#64748B] mb-4`}>We'll exclude these from your recipes.</p>
            <div className="space-y-3">
              {['Nuts', 'Dairy', 'Gluten', 'Seafood', 'Eggs', 'None'].map((opt) => (
                <div 
                  key={opt} 
                  onClick={() => toggleItem(formData.allergies, opt, 'allergies')}
                  className={`transition-all border-2 ${Layout.radius} p-4 cursor-pointer flex items-center gap-4 ${formData.allergies.includes(opt) ? 'border-[#39C101] bg-green-50 dark:bg-green-950/20' : 'border-[#F1F5F9] dark:border-slate-800 bg-white'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${formData.allergies.includes(opt) ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {allergyIcons[opt]}
                  </div>
                  <span className={`${Typography.bodyBold} text-[#0F172A] dark:text-white flex-1`}>{opt}</span>
                  {formData.allergies.includes(opt) && (
                    <div className="w-6 h-6 bg-[#39C101] rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Button 
                disabled={formData.allergies.length === 0}
                onClick={next}
                className="w-full h-14"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 6:
        const challengeIcons: Record<string, string> = {
          'Sugar': '🍭',
          'Fried Foods': '🍟',
          'Late-night Snacking': '🌙',
          'Portions': '🍽️',
          'Emotional Eating': '🎭',
        };
        return (
          <div className="space-y-4 pt-4">
            <BackButton onClick={back} className="mb-2 -ml-2" />
            <h2 className={`${Typography.h2} ${Typography.Black} text-[#0F172A] dark:text-white mb-2`}>Challenging Foods?</h2>
            <p className={`${Typography.body} text-[#64748B] mb-4`}>Areas where you struggle most.</p>
            <div className="space-y-3">
              {['Sugar', 'Fried Foods', 'Late-night Snacking', 'Portions', 'Emotional Eating'].map(c => (
                <div 
                  key={c} 
                  onClick={() => toggleItem(formData.challenges, c, 'challenges')}
                  className={`transition-all border-2 ${Layout.radius} p-4 cursor-pointer flex items-center gap-4 ${formData.challenges.includes(c) ? 'border-[#39C101] bg-green-50 dark:bg-green-950/20' : 'border-[#F1F5F9] dark:border-slate-800 bg-white'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${formData.challenges.includes(c) ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {challengeIcons[c]}
                  </div>
                  <span className={`${Typography.bodyBold} text-[#0F172A] dark:text-white flex-1`}>{c}</span>
                  {formData.challenges.includes(c) && (
                    <div className="w-6 h-6 bg-[#39C101] rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={next} className="w-full mt-6 h-14">Build My Plan</Button>
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col items-center justify-center space-y-8 py-20 px-8 text-center h-full">
            <div className="relative w-32 h-32">
              <div className={`absolute inset-0 border-4 border-[#F1F5F9] dark:border-slate-800 rounded-full`}></div>
              <div className={`absolute inset-0 border-4 border-[#39C101] rounded-full border-t-transparent animate-spin`}></div>
            </div>
            <div className="space-y-3">
              <h2 className={`${Typography.h2} ${Typography.Black} text-[#0F172A] dark:text-white animate-pulse`}>NutriForge is Thinking...</h2>
              <p className={`${Typography.body} text-[#64748B]`}>Synthesizing metabolic data and crafting your metabolic blueprint...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex-1 flex flex-col relative overflow-hidden bg-[#F5F6F8] dark:bg-[#020617] transition-colors duration-500`}>
      {step > 0 && step < totalSteps - 1 && (
        <div className="px-6 pt-6 z-20">
          <ProgressBar progress={(step / (totalSteps - 2)) * 100} height="h-1.5" />
        </div>
      )}
      <div className="flex-1 flex flex-col px-6 overflow-y-auto z-10 no-scrollbar">
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;