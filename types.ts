
export enum HealthGoal {
  WeightLoss = 'Weight Loss',
  MuscleGain = 'Muscle Gain',
  HeartHealth = 'Heart Health',
  Energy = 'Energy',
  BalancedLifestyle = 'Balanced Lifestyle'
}

export enum Cuisine {
  Indian = 'Indian',
  Mediterranean = 'Mediterranean',
  Asian = 'Asian',
  MiddleEastern = 'Middle Eastern',
  Western = 'Western',
  Mixed = 'Mixed'
}

export enum MealFrequency {
  ThreeMeals = 'Breakfast + Lunch + Dinner',
  ThreePlusSnacks = '3 Meals + Snacks',
  IntermittentFasting = 'Intermittent Fasting',
  Custom = 'Custom'
}

export enum DietPreference {
  Vegetarian = 'Vegetarian',
  Vegan = 'Vegan',
  Eggetarian = 'Eggetarian',
  NonVegetarian = 'Non-Vegetarian',
  OpenToAll = 'Open to all foods',
  Keto = 'Keto',
  Balanced = 'Balanced'
}

export interface UserProfile {
  language: string;
  healthGoal: HealthGoal;
  cuisine: Cuisine;
  mealFrequency: MealFrequency;
  dietPreference: DietPreference;
  allergies: string[];
  challenges: string[];
}

export interface ApiTag {
  id: string;
  name: string;
  category: string;
}

export interface ApiRecipe {
  id: string;
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  image_url: string;
  difficulty_level: number;
  cost_estimate: string;
  season: string[];
  available_countries: string[];
  locale: string;
  tags: ApiTag[];
}

export interface RecipeApiResponse {
  data: ApiRecipe[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ApiMealPlan {
  id: string;
  name: string;
  description: string;
  health_goal: string;
  daily_calories: number;
  duration_days: number;
  status: string;
  image_url: string;
  tags?: ApiTag[];
  days?: Record<string, any[]>;
}

export interface MealPlanApiResponse {
  data: ApiMealPlan[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface MealPlan {
  id: string;
  name: string;
  duration: string;
  calories: number;
  description: string;
  image_url?: string;
}

export interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  name: string;
  calories: number;
  isLogged: boolean;
  isManual?: boolean;
  isSkipped?: boolean;
  protein: number;
  carbs: number;
  fat: number;
  photoUri?: string;
  loggedAt?: string;
  manualItems?: DetectedFoodItem[];
  apiRecipeDetail?: {
    description?: string;
    instructions?: string[] | null;
    prepTime?: number;
    cookTime?: number;
    image_url?: string;
  };
}

export interface Recipe {
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
}

export interface MealAlternative {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timingTip: string;
  synergyTip: string;
}

export interface PlanReasoning {
  nutrientTiming: string;
  micronutrientFocus: string;
  foodSynergyTips: string;
}

export interface GamificationState {
  points: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  dateEarned?: string;
}

export interface ActivityData {
  steps: number;
  caloriesBurned: number;
  avgHeartRate: number;
  lastSynced: string;
}

export interface DetectedFoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
