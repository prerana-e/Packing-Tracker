import { useCallback, useState } from 'react';
import OpenAIService from '../services/openai';

export const useAIsuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [openAIService, setOpenAIService] = useState(null);

  const initializeAI = useCallback((apiKey) => {
    if (apiKey) {
      setOpenAIService(new OpenAIService(apiKey));
      return true;
    }
    return false;
  }, []);

  const getAIPoweredSuggestions = useCallback(async (context) => {
    if (!openAIService) {
      console.warn('OpenAI service not initialized, using fallback suggestions');
      return getFallbackSuggestions(context);
    }

    setIsLoading(true);
    try {
      const result = await openAIService.generatePackingSuggestions(context);
      return result;
    } catch (error) {
      console.error('AI suggestions error:', error);
      return getFallbackSuggestions(context);
    } finally {
      setIsLoading(false);
    }
  }, [openAIService]);

  const getSmartItemCategories = useCallback(async (itemName) => {
    if (!openAIService) {
      return getFallbackCategories(itemName);
    }

    try {
      return await openAIService.generateSmartCategories(itemName);
    } catch (error) {
      console.error('AI categorization error:', error);
      return getFallbackCategories(itemName);
    }
  }, [openAIService]);

  // Fallback functions for when AI is not available
  const getFallbackSuggestions = useCallback((context) => {
    const { weather, temperature, duration, destination } = context;
    const suggestions = [];
    const tips = [
      '💡 Pack one extra day of clothes than your trip length',
      '👕 Roll clothes instead of folding to save 30% more space',
      '🔌 Keep electronics in carry-on to prevent damage'
    ];

    // Basic weather-based suggestions
    if (weather?.toLowerCase().includes('rain')) {
      suggestions.push({
        name: 'Umbrella',
        category: 'travel',
        priority: 'high',
        reason: 'Rainy weather expected'
      });
    }

    if (temperature > 80 || weather?.toLowerCase().includes('hot')) {
      suggestions.push({
        name: 'Sunscreen',
        category: 'toiletries',
        priority: 'high',
        reason: 'UV protection in hot weather'
      });
    }

    if (destination?.toLowerCase().includes('beach')) {
      suggestions.push({
        name: 'Swimsuit',
        category: 'clothes',
        priority: 'high',
        reason: 'Beach destination'
      });
    }

    return { suggestions, tips };
  }, []);

  const getFallbackCategories = useCallback((itemName) => {
    const name = itemName.toLowerCase();
    
    if (name.includes('phone') || name.includes('laptop') || name.includes('charger')) {
      return { category: 'electronics', tags: ['tech'], priority: 'medium' };
    }
    if (name.includes('shirt') || name.includes('pants') || name.includes('shoes')) {
      return { category: 'clothes', tags: ['apparel'], priority: 'medium' };
    }
    if (name.includes('toothbrush') || name.includes('shampoo') || name.includes('soap')) {
      return { category: 'toiletries', tags: ['hygiene'], priority: 'medium' };
    }
    
    return { category: 'travel', tags: [], priority: 'medium' };
  }, []);

  // Legacy functions for backward compatibility
  const getWeatherBasedSuggestions = useCallback((weather, temperature) => {
    return getFallbackSuggestions({ weather, temperature }).suggestions;
  }, [getFallbackSuggestions]);

  const getTripDurationSuggestions = useCallback((duration) => {
    return getFallbackSuggestions({ duration }).suggestions;
  }, [getFallbackSuggestions]);

  const getDestinationSuggestions = useCallback((destination) => {
    return getFallbackSuggestions({ destination }).suggestions;
  }, [getFallbackSuggestions]);

  const getSeasonalSuggestions = useCallback((month) => {
    return getFallbackSuggestions({ month }).suggestions;
  }, [getFallbackSuggestions]);

  const getSmartCombinedSuggestions = useCallback(async (context) => {
    // Use AI if available, otherwise fallback
    const result = await getAIPoweredSuggestions(context);
    return result.suggestions || [];
  }, [getAIPoweredSuggestions]);

  const generatePackingTips = useCallback(async (belongings, context = {}) => {
    if (openAIService) {
      const result = await getAIPoweredSuggestions({
        ...context,
        existingItems: belongings
      });
      return result.tips || [];
    }
    
    return getFallbackSuggestions(context).tips;
  }, [openAIService, getAIPoweredSuggestions, getFallbackSuggestions]);

  return {
    // New AI-powered functions
    initializeAI,
    getAIPoweredSuggestions,
    getSmartItemCategories,
    isLoading,
    
    // Legacy functions for backward compatibility
    getWeatherBasedSuggestions,
    getTripDurationSuggestions,
    getDestinationSuggestions,
    getSeasonalSuggestions,
    getSmartCombinedSuggestions,
    generatePackingTips
  };
};
