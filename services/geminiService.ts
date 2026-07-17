
import { GoogleGenAI, Type } from "@google/genai";
import { Meal, MealAlternative, UserProfile, Recipe, MealPlan, PlanReasoning, DetectedFoodItem } from "../types";

// Always use named parameter for apiKey and obtain directly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePlanReasoning = async (
  plan: MealPlan,
  profile: UserProfile
): Promise<PlanReasoning> => {
  const prompt = `Provide a scientific reasoning for the metabolic meal plan "${plan.name}" built for a ${profile.dietPreference} user with a goal of ${profile.healthGoal}. 
  Include:
  1. Nutrient timing logic (when to eat what for maximum metabolic efficiency).
  2. Micronutrient focus (key vitamins/minerals emphasized in this plan).
  3. Food synergy tips (combinations of foods that enhance nutrient absorption).
  Format as JSON.`;

  try {
    // Using gemini-3-pro-preview for complex scientific reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nutrientTiming: { type: Type.STRING },
            micronutrientFocus: { type: Type.STRING },
            foodSynergyTips: { type: Type.STRING },
          },
          required: ["nutrientTiming", "micronutrientFocus", "foodSynergyTips"]
        },
      },
    });

    // Directly access .text property from response
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to generate plan reasoning", error);
    return {
      nutrientTiming: "Plan optimized for steady glucose release throughout the day.",
      micronutrientFocus: "High focus on magnesium and potassium for muscle recovery.",
      foodSynergyTips: "Combine iron-rich greens with citrus for 3x better absorption."
    };
  }
};

export const generateMealAlternatives = async (
  meal: Meal,
  profile: UserProfile
): Promise<MealAlternative[]> => {
  const prompt = `As a high-end nutrition AI for GOQii NutriForge, suggest 3 alternative meals for a ${profile.dietPreference} user with a goal of ${profile.healthGoal}. 
  The original meal is ${meal.name} (${meal.calories} kcal). 
  The user prefers ${profile.cuisine} cuisine and has these allergies: ${profile.allergies.join(', ') || 'none'}.
  Provide calorie/macro breakdowns, a nutrient timing tip, and a food synergy tip for each.`;

  try {
    // Using gemini-3-pro-preview for complex nutrition reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              timingTip: { type: Type.STRING },
              synergyTip: { type: Type.STRING },
            },
            required: ["name", "calories", "protein", "carbs", "fat", "timingTip", "synergyTip"]
          }
        },
      },
    });

    // Directly access .text property from response
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Failed to generate alternatives", error);
    return [];
  }
};

export const generateRecipe = async (
  mealName: string,
  profile: UserProfile
): Promise<Recipe | null> => {
  const prompt = `Provide a healthy recipe for ${mealName} suitable for a ${profile.dietPreference} diet.
  Cuisine style: ${profile.cuisine}. 
  Avoid these allergens: ${profile.allergies.join(', ') || 'none'}.
  Format as JSON with ingredients list, step-by-step instructions, prep time, and cook time.`;

  try {
    // Using gemini-3-flash-preview for basic text task like recipe generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
          },
          required: ["ingredients", "instructions", "prepTime", "cookTime"]
        },
      },
    });

    // Directly access .text property from response
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Failed to generate recipe", error);
    return null;
  }
};

export const generateDailyMeals = async (
  plan: MealPlan,
  profile: UserProfile
): Promise<Meal[]> => {
  const prompt = `Forge a specific one-day metabolic meal blueprint for the plan: "${plan.name}".
  Target Total Calories: ${plan.calories} kcal.
  User Profile: ${profile.dietPreference}, Goal: ${profile.healthGoal}, Cuisine: ${profile.cuisine}.
  Allergies: ${profile.allergies.join(', ') || 'none'}.
  
  Generate exactly 4 meals (Breakfast, Lunch, Snack, Dinner) that together sum up to approximately ${plan.calories} calories.
  Ensure they are culturally relevant to ${profile.cuisine}.`;

  try {
    // Using gemini-3-pro-preview for complex blueprint forging
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['Breakfast', 'Lunch', 'Snack', 'Dinner'] },
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["type", "name", "calories", "protein", "carbs", "fat"]
          }
        },
      },
    });

    // Directly access .text property from response
    const generated = JSON.parse(response.text || "[]");
    return generated.map((m: any, i: number) => ({
      ...m,
      id: `ai-meal-${i}-${Date.now()}`,
      isLogged: false
    }));
  } catch (error) {
    console.error("Failed to forge daily meals", error);
    return [];
  }
};

export const analyzeFoodImage = async (base64Image: string): Promise<DetectedFoodItem[]> => {
  const prompt = `Identify the food items in this image and provide an estimate of their calories and macro-nutrients (protein, carbs, fat) in grams. 
  Focus on common healthy meal portions. If there are multiple items, list them individually.
  Return ONLY the JSON array of objects with the keys: name, calories, protein, carbs, fat.`;

  try {
    // gemini-2.5-flash-image is a nano banana series model.
    // GUIDELINE: DO NOT set responseMimeType or responseSchema for nano banana series models.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Native multi-modal support
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    });

    // Clean potential markdown and parse the response text
    let text = response.text || "[]";
    const cleanedText = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Food image analysis failed", error);
    return [];
  }
};
