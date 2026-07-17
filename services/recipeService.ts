import { RecipeApiResponse } from "../types";

const CLIENT_ID = "pk_96fkwJVY7CQOznUyIIWZguX1TtImAqnV";
const SECRET_ID = "sk_4LCHoWSrM588XeYKEOiW0MDEUYN3fgbWF7BXe2gCDGH3rsgF";
const BASE_URL = "https://tlgvwgaggtpxpxcptnzk.supabase.co/functions/v1";

export interface FetchRecipeParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  country?: string;
  locale?: string;
  difficulty?: number;
}

/**
 * Fetches recipes from the NutriForge Supabase API.
 */
export const fetchApiRecipes = async (params: FetchRecipeParams = {}): Promise<RecipeApiResponse | null> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.country) queryParams.append("country", params.country);
    if (params.locale) queryParams.append("locale", params.locale);
    if (params.difficulty) queryParams.append("difficulty", params.difficulty.toString());
    
    queryParams.append("include_tags", "true");

    const url = `${BASE_URL}/api-recipes?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CLIENT_ID,
        "x-secret-id": SECRET_ID
      }
    });
    
    if (!response.ok) {
      console.error(`Recipe API Error: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      console.error("Recipe API returned non-JSON content");
      return null;
    }

    try {
      const json = await response.json();
      return json as RecipeApiResponse;
    } catch (parseError) {
      console.error("Failed to parse Recipe JSON response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Global API Error [Recipes]:", error);
    return null;
  }
};