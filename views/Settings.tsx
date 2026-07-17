import React from 'react';
import { Card, BackButton } from '../components/UI';
import { Colors, Typography, Layout, GlobalStyles } from '../theme/goqiiDesignSystem';

interface SettingsProps {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack, isDarkMode, onToggleDarkMode, onLogout }) => {
  return (
    <div className={`${GlobalStyles.screen} overflow-y-auto pb-32`}>
      <header className={GlobalStyles.header}>
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} className="-ml-2" />
          <h1 className={Typography.h3}>Settings</h1>
        </div>
      </header>

      <div className={Layout.padding + " space-y-6"}>
        <section className="space-y-4">
          <h3 className={`${Typography.caption} text-[${Colors.textLight}] px-1`}>Appearance</h3>
          <Card className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              {/* Corrected Layout.innerRadius to Layout.radius10 */}
              <div className={`w-10 h-10 bg-slate-100 dark:bg-slate-700 ${Layout.radius10} flex items-center justify-center`}>
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path></svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                )}
              </div>
              <div>
                <span className={Typography.bodyBold}>Dark Mode</span>
                <p className={`${Typography.caption} text-[${Colors.textMuted}]`}>Switch between themes</p>
              </div>
            </div>
            <button 
              onClick={onToggleDarkMode}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDarkMode ? `bg-[${Colors.primary}]` : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className={`${Typography.caption} text-[${Colors.textLight}] px-1`}>Account</h3>
          <Card className="p-0 overflow-hidden">
             <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                <span className={Typography.bodyBold}>Edit Profile</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
             </div>
             <div 
               onClick={onLogout}
               className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
             >
                <span className={`${Typography.bodyBold} text-[${Colors.error}]`}>Logout</span>
             </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Settings;