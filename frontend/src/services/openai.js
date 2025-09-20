// OpenAI API service for intelligent packing suggestions
class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generatePackingSuggestions(context) {
    const { destination, duration, weather, temperature, season, existingItems = [] } = context;
    
    const prompt = this.buildPrompt(context);
    
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert travel packing assistant. Provide practical, personalized packing suggestions based on trip details. Always respond with valid JSON in this exact format:
{
  "suggestions": [
    {
      "name": "item name",
      "category": "electronics|clothes|toiletries|documents|travel|medical|sports|kitchenware|books|bedding",
      "priority": "high|medium|low",
      "reason": "brief explanation why this item is recommended"
    }
  ],
  "tips": [
    "practical packing tip 1",
    "practical packing tip 2"
  ]
}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the JSON response
      const parsedResponse = JSON.parse(content);
      return {
        suggestions: parsedResponse.suggestions || [],
        tips: parsedResponse.tips || []
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Fallback to rule-based suggestions if API fails
      return this.getFallbackSuggestions(context);
    }
  }

  buildPrompt(context) {
    const { destination, duration, weather, temperature, season, existingItems = [] } = context;
    
    let prompt = `I'm planning a trip and need packing suggestions. Here are the details:

Trip Details:
- Destination: ${destination || 'Not specified'}
- Duration: ${duration || 'Not specified'} days
- Weather: ${weather || 'Not specified'}
- Temperature: ${temperature || 'Not specified'}°F
- Season: ${season || 'Current season'}

Current packing list (${existingItems.length} items):
${existingItems.length > 0 ? existingItems.map(item => `- ${item.name} (${item.category})`).join('\n') : 'Empty - starting fresh'}

Please suggest 6-8 additional items I should pack, prioritizing based on:
1. Trip destination and activities
2. Weather conditions and temperature
3. Trip duration
4. Items I don't already have
5. Seasonal considerations

Also provide 3-4 practical packing tips specific to my trip.

Focus on practical, essential items and avoid duplicating what I already have.`;

    return prompt;
  }

  getFallbackSuggestions(context) {
    // Fallback rule-based suggestions if OpenAI API fails
    const suggestions = [];
    const tips = ['Pack one extra day of clothes than your trip length', 'Roll clothes to save space'];
    
    if (context.weather?.includes('rain')) {
      suggestions.push({
        name: 'Umbrella',
        category: 'travel',
        priority: 'high',
        reason: 'Rain protection needed'
      });
    }
    
    return { suggestions, tips };
  }

  async generateSmartCategories(itemName) {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You categorize packing items. Respond only with JSON: {"category": "electronics|clothes|toiletries|documents|travel|medical|sports|kitchenware|books|bedding", "tags": ["tag1", "tag2"], "priority": "high|medium|low"}'
            },
            {
              role: 'user',
              content: `Categorize this packing item: "${itemName}"`
            }
          ],
          max_tokens: 100,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('OpenAI categorization error:', error);
    }
    
    // Fallback categorization
    return {
      category: 'travel',
      tags: [],
      priority: 'medium'
    };
  }
}

export default OpenAIService;
