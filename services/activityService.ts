
import { ActivityData } from "../types";

export const fetchWearableData = async (): Promise<ActivityData> => {
  // Mocking an API call to Apple Health / Google Fit
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        steps: 8432,
        caloriesBurned: 342,
        avgHeartRate: 72,
        lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 800);
  });
};

export const getBadgeDefinitions = () => [
  { id: '7day', name: 'Forge Master', icon: '🔥', description: 'Log meals for 7 days straight' },
  { id: 'pro', name: 'Protein Pro', icon: '🍗', description: 'Hit protein target 3 days in a row' },
  { id: 'sync', name: 'Sync King', icon: '⌚', description: 'Connected a wearable device' },
  { id: 'early', name: 'Early Bird', icon: '☀️', description: 'Log breakfast before 8 AM' }
];
