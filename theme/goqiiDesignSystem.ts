/**
 * GOQii 2.0 Design System
 * Single source of truth for NutriForge UI styling tokens.
 */

export const Colors = {
  primary: '#39C101',        // Core GOQii Green
  primaryDark: '#32aa01',
  blueBtn: '#007AFF',        // GOQii Secondary Blue
  secondary: '#1E293B',      // Slate 800
  background: '#F5F6F8',     // GOQii Global Background
  backgroundDark: '#020617', // Slate 950
  card: '#FFFFFF',
  cardDark: '#1E293B',
  textPrimary: '#0F172A',    // Slate 900
  textSecondary: '#FFFFFF',  // White Text
  textMuted: '#64748B',      // Slate 500
  textLight: '#A5B3C1',      // Neutral Light
  border: '#F1F5F9',         // Slate 100
  white: '#FFFFFF',
  error: '#EF4444',
  success: '#39C101',
  warning: '#F59E0B',
};

export const Typography = {
  Medium: "font-medium",
  SemiBold: "font-semibold",
  Bold: "font-bold",
  Black: "font-black",
  h1: "text-4xl tracking-tight",
  h2: "text-2xl tracking-tight",
  h3: "text-xl tracking-tight",
  h4: "text-lg tracking-tight",
  h6: "text-sm tracking-tight",
  body: "text-sm font-medium leading-relaxed",
  bodyBold: "text-sm font-bold tracking-tight",
  caption: "text-[10px] font-black uppercase tracking-[0.2em]",
  label: "text-[11px] font-black uppercase tracking-[0.2em]",
  energy: "text-5xl font-black tracking-tighter leading-none",
};

export const Layout = {
  radius: "rounded-[24px]",    // Standard Box/Card Radius
  radius10: "rounded-[10px]",  // Small selectable boxes / Chips
  fullRadius: "rounded-full",  // Rounded Buttons
  padding: "p-6",
};

export const GlobalStyles = {
  screen: "flex-1 flex flex-col bg-[#F5F6F8] dark:bg-[#020617] transition-colors duration-500 overflow-hidden relative",
  card: `bg-white dark:bg-[#1E293B] rounded-[24px] shadow-sm border border-[#F1F5F9] dark:border-slate-700 transition-all`,
  header: "p-6 pt-2 bg-white dark:bg-[#1E293B] border-b border-[#F1F5F9] dark:border-slate-700 flex justify-between items-center z-10",
  tabBar: "absolute bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-[#F1F5F9] dark:border-slate-800 flex items-center justify-around px-4 pb-2 z-50",
};