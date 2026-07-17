import React, { useState } from 'react';
import { UserProfile, HealthGoal, Cuisine, DietPreference, MealFrequency } from '../types';
import { BackButton, Card, Button } from '../components/UI';
import { Colors, Typography, Layout, GlobalStyles } from '../theme/goqiiDesignSystem';

interface EditPlanProps {
  profile: UserProfile;
  onBack: () => void;
  onRebuild: (p: UserProfile) => void;
}

const EditPlan: React.FC<EditPlanProps> = ({ profile, onBack, onRebuild }) => {
  const [editProfile, setEditProfile] = useState<UserProfile>({ ...profile });

  return (
    <div className={`${GlobalStyles.screen} overflow-y-auto pb-32`}>
      <header className={GlobalStyles.header + " sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-20"}>
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} className="-ml-2" />
          <h1 className={`${Typography.h3} ${Typography.Black}`}>Edit Plan</h1>
        </div>
      </header>

      <div className={Layout.padding + " space-y-10"}>
        <section className="space-y-4">
          <label className={`${Typography.caption} text-[#A5B3C1] px-1`}>Health Goal</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {Object.values(HealthGoal).map(goal => (
              <button 
                key={goal} 
                onClick={() => setEditProfile({...editProfile, healthGoal: goal})}
                className={`px-6 py-3 ${Layout.radius10} text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${editProfile.healthGoal === goal ? `bg-[#39C101] border-[#39C101] text-white shadow-lg` : `bg-white dark:bg-slate-800 border-[#F1F5F9] dark:border-slate-700 text-slate-500`}`}
              >
                {goal}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <label className={`${Typography.caption} text-[#A5B3C1] px-1`}>Cuisine Style</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(Cuisine).map(c => (
              <div 
                key={c} 
                onClick={() => setEditProfile({...editProfile, cuisine: c})}
                className={`p-4 transition-all border-2 ${Layout.radius10} text-center cursor-pointer ${editProfile.cuisine === c ? `border-[#39C101] bg-green-50 dark:bg-green-950/20` : `border-slate-50 dark:border-slate-800`}`}
              >
                <span className={`${Typography.label} ${editProfile.cuisine === c ? `text-[#39C101]` : 'text-slate-500'}`}>{c}</span>
              </div>
            ))}
          </div>
        </section>

        <Button onClick={() => onRebuild(editProfile)} className="w-full">
          Rebuild Plan
        </Button>
      </div>
    </div>
  );
};

export default EditPlan;
