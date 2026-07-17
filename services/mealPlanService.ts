import { MealPlanApiResponse, ApiMealPlan } from "../types";

/**
 * API Credentials for GOQii NutriForge
 */
const CLIENT_ID = "pk_96fkwJVY7CQOznUyIIWZguX1TtImAqnV";
const SECRET_ID = "sk_4LCHoWSrM588XeYKEOiW0MDEUYN3fgbWF7BXe2gCDGH3rsgF";
const BASE_URL = "https://tlgvwgaggtpxpxcptnzk.supabase.co/functions/v1";

/**
 * Interface for meal plan fetching parameters.
 */
export interface FetchMealPlanParams {
  limit?: number;
  offset?: number;
  status?: string;
  country?: string;
}

/**
 * Helper to get default NutriForge headers
 */
const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-client-id": CLIENT_ID,
  "x-secret-id": SECRET_ID
});

/**
 * Fetches all meal plans from the NutriForge Supabase API.
 */
export const fetchApiMealPlans = async (params: FetchMealPlanParams = {}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.country) queryParams.append("country", params.country);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/api-meal-plans${queryString ? '?' + queryString : ''}`;
    
    console.debug(`NutriForge: Requesting master plans from ${url}`);
    
    const response = await fetch(url, { 
      method: "GET",
      headers: getHeaders()
    });
    
    if (!response.ok) {
      console.error(`Meal Plan API Error: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Expected JSON but received non-JSON content. First 100 chars:", text.substring(0, 100));
      return null;
    }

    try {
      const json = await response.json();
      // Support both standardized {data: []} and direct array responses
      if (json && json.data && Array.isArray(json.data)) return json.data;
      if (json && Array.isArray(json)) return json;
      return null;
    } catch (parseError) {
      console.error("Failed to parse Meal Plan JSON response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Global API Error [MealPlans]:", error instanceof Error ? error.message : String(error));
    return null;
  }
};

/**
 * Fetches a specific meal plan by ID.
 */
export const fetchApiMealPlanById = async (id: string): Promise<any> => {
  try {
    const url = `${BASE_URL}/api-meal-plans?id=${id}`;
    const response = await fetch(url, { 
      method: "GET",
      headers: getHeaders()
    });
    
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) return null;

    try {
      const json = await response.json();
      const data = json.data || json;
      return Array.isArray(data) ? data[0] : data;
    } catch (e) {
      return null;
    }
  } catch (error) {
    console.error("Global API Error [MealPlanById]:", error);
    return null;
  }
};