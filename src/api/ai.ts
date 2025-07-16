// AI Service for Wine Tasting Notes
// This service provides AI-powered suggestions for wine tasting notes

import { Wine, TastingSession } from '@/types';

export interface AISuggestion {
  title: string;
  content: string;
  confidence: number;
}

export interface AIWineAnalysis {
  tastingNotes: string;
  foodPairings: string[];
  servingRecommendations: string;
  agingPotential: string;
  priceRange: string;
  similarWines: string[];
  expertInsights: string;
}

export interface AIRecommendation {
  wineName: string;
  reason: string;
  confidence: number;
  category: 'similar' | 'upgrade' | 'discovery' | 'value';
}

// Mock AI service - in a real app, this would connect to OpenAI, Claude, or similar
export class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // In a real app, this would come from environment variables
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  private async makeRequest(prompt: string, maxTokens: number = 500): Promise<string> {
    if (!this.apiKey) {
      // Fallback to mock responses for demo purposes
      return this.getMockResponse(prompt);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional sommelier and wine expert with deep knowledge of wine tasting, food pairing, and wine recommendations. Provide detailed, accurate, and helpful insights about wines.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate response';
    } catch (error) {
      console.error('AI API Error:', error);
      return this.getMockResponse(prompt);
    }
  }

  private getMockResponse(prompt: string): string {
    // Intelligent mock responses based on the prompt content
    if (prompt.includes('tasting notes')) {
      return `Based on this wine's characteristics, here are detailed tasting notes:

**Appearance**: Deep ruby red with purple hues, clear and bright
**Nose**: Intense aromas of black cherry, plum, and dark chocolate with hints of vanilla and oak
**Palate**: Full-bodied with rich tannins, flavors of blackberry, cassis, and tobacco
**Finish**: Long and complex with notes of leather and spice

This wine shows excellent balance and structure, typical of its region and grape variety.`;
    }

    if (prompt.includes('food pairing')) {
      return `Perfect food pairings for this wine:

• Grilled red meats (beef, lamb, venison)
• Aged cheeses (Parmigiano-Reggiano, aged cheddar)
• Rich pasta dishes with tomato-based sauces
• Dark chocolate desserts
• Mushroom-based dishes

The wine's tannins and acidity complement rich, fatty foods beautifully.`;
    }

    if (prompt.includes('recommendation')) {
      return `Based on your preferences, I recommend:

1. **Similar Style**: Try a Malbec from Argentina or a Shiraz from Australia
2. **Upgrade Option**: Consider a premium Cabernet Sauvignon from Napa Valley
3. **Discovery**: Explore a Tempranillo from Spain's Ribera del Duero
4. **Value Pick**: Look for a Chilean Carmenère or South African Pinotage

These wines share similar characteristics while offering new experiences.`;
    }

    return 'AI analysis would provide detailed insights about this wine, including tasting notes, food pairings, and recommendations based on your preferences.';
  }

  async generateTastingNotes(wine: Wine): Promise<string> {
    const prompt = `Generate professional tasting notes for this wine:
    
Wine: ${wine.name}
Grape: ${wine.grape}
Region: ${wine.region}
Vintage: ${wine.vintage}
Rating: ${wine.rating}/5

Please provide detailed tasting notes covering appearance, nose, palate, and finish.`;

    return await this.makeRequest(prompt, 400);
  }

  async generateFoodPairings(wine: Wine): Promise<string[]> {
    const prompt = `Suggest 5-7 specific food pairings for this wine:
    
Wine: ${wine.name}
Grape: ${wine.grape}
Region: ${wine.region}

Provide specific dishes, not just general categories.`;

    const response = await this.makeRequest(prompt, 300);
    
    // Parse the response into an array
    const pairings = response
      .split('\n')
      .filter(line => line.trim() && (line.includes('•') || line.includes('-') || /^\d+\./.test(line)))
      .map(line => line.replace(/^[•\-\d\.\s]+/, '').trim())
      .filter(pairing => pairing.length > 0);

    return pairings.length > 0 ? pairings : [
      'Grilled red meats',
      'Aged cheeses',
      'Rich pasta dishes',
      'Dark chocolate',
      'Mushroom-based dishes'
    ];
  }

  async suggestFoodPairings(grape: string, region: string): Promise<string[]> {
    const prompt = `Suggest 5-7 specific food pairings for a ${grape} wine from ${region}:

Provide specific dishes, not just general categories.`;

    const response = await this.makeRequest(prompt, 300);
    
    // Parse the response into an array
    const pairings = response
      .split('\n')
      .filter(line => line.trim() && (line.includes('•') || line.includes('-') || /^\d+\./.test(line)))
      .map(line => line.replace(/^[•\-\d\.\s]+/, '').trim())
      .filter(pairing => pairing.length > 0);

    return pairings.length > 0 ? pairings : [
      'Grilled red meats',
      'Aged cheeses',
      'Rich pasta dishes',
      'Dark chocolate',
      'Mushroom-based dishes'
    ];
  }

  async analyzeWine(wine: Wine): Promise<AIWineAnalysis> {
    const prompt = `Provide a comprehensive analysis of this wine:
    
Wine: ${wine.name}
Grape: ${wine.grape}
Region: ${wine.region}
Vintage: ${wine.vintage}
Rating: ${wine.rating}/5

Please provide:
1. Detailed tasting notes
2. 5-7 specific food pairings
3. Serving recommendations (temperature, decanting, glassware)
4. Aging potential assessment
5. Price range estimation
6. 3-4 similar wines to try
7. Expert insights and tips`;

    const response = await this.makeRequest(prompt, 800);
    
    // Parse the comprehensive response
    const sections = response.split(/\d+\./).filter(section => section.trim());
    
    return {
      tastingNotes: sections[0] || 'Detailed tasting notes would be generated here.',
      foodPairings: sections[1]?.split('\n').filter(item => item.trim()) || ['Grilled meats', 'Aged cheeses'],
      servingRecommendations: sections[2] || 'Serve at 16-18°C, decant for 1 hour if young.',
      agingPotential: sections[3] || 'Can age 5-10 years under proper conditions.',
      priceRange: sections[4] || '$20-40 range typical for this style.',
      similarWines: sections[5]?.split('\n').filter(item => item.trim()) || ['Similar wines would be suggested'],
      expertInsights: sections[6] || 'Expert insights and tips would be provided here.'
    };
  }

  async getPersonalizedRecommendations(userWines: Wine[], preferences: any): Promise<AIRecommendation[]> {
    const prompt = `Based on this user's wine collection and preferences, suggest 5 personalized wine recommendations:

User's wines: ${userWines.map(w => `${w.name} (${w.grape}, ${w.region})`).join(', ')}
Average rating: ${(userWines.reduce((sum, w) => sum + w.rating, 0) / userWines.length).toFixed(1)}/5
Preferred regions: ${preferences.regions?.join(', ') || 'Various'}
Preferred grapes: ${preferences.grapes?.join(', ') || 'Various'}

Provide recommendations in these categories:
1. Similar style wines they might enjoy
2. Upgrade options to try
3. Discovery wines outside their comfort zone
4. Value picks under $30`;

    const response = await this.makeRequest(prompt, 600);
    
    // Parse recommendations
    const recommendations: AIRecommendation[] = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      if (line.includes(':')) {
        const [name, reason] = line.split(':').map(part => part.trim());
        recommendations.push({
          wineName: name,
          reason: reason || 'Recommended based on your preferences',
          confidence: 0.8 - (index * 0.1),
          category: index === 0 ? 'similar' : index === 1 ? 'upgrade' : index === 2 ? 'discovery' : 'value'
        });
      }
    });

    return recommendations.length > 0 ? recommendations : [
      {
        wineName: 'Château Margaux 2015',
        reason: 'Premium Bordeaux that matches your taste for full-bodied reds',
        confidence: 0.9,
        category: 'upgrade'
      },
      {
        wineName: 'Barolo Riserva 2016',
        reason: 'Italian Nebbiolo with similar structure to your favorites',
        confidence: 0.8,
        category: 'similar'
      }
    ];
  }

  async generateSessionInsights(session: TastingSession): Promise<string> {
    const prompt = `Analyze this tasting session and provide insights:

Session: ${session.name}
Date: ${session.date}
Wines tasted: ${session.wines.length}
Average rating: ${session.wines.reduce((sum, w) => sum + w.rating, 0) / session.wines.length}/5

Provide insights about:
1. Overall session quality
2. Wine variety and diversity
3. Rating patterns
4. Recommendations for future sessions`;

    return await this.makeRequest(prompt, 400);
  }

  async transcribeVoiceNote(_audioBlob: Blob): Promise<string> {
    // In a real implementation, this would use OpenAI's Whisper API
    // For now, return a placeholder
    return "Voice note transcription would be available with OpenAI's Whisper API integration.";
  }

  async generateWineDescription(wine: Wine): Promise<string> {
    const prompt = `Write a compelling, professional description for this wine:

Wine: ${wine.name}
Grape: ${wine.grape}
Region: ${wine.region}
Vintage: ${wine.vintage}

Make it engaging and informative for wine enthusiasts.`;

    return await this.makeRequest(prompt, 300);
  }

  async suggestWineImprovements(wine: Wine): Promise<string[]> {
    const prompt = `Suggest 3-5 specific improvements or variations for this wine:

Wine: ${wine.name}
Grape: ${wine.grape}
Region: ${wine.region}
Current rating: ${wine.rating}/5

Consider different regions, producers, vintages, or styles.`;

    const response = await this.makeRequest(prompt, 300);
    
    return response
      .split('\n')
      .filter(line => line.trim() && (line.includes('•') || line.includes('-') || /^\d+\./.test(line)))
      .map(line => line.replace(/^[•\-\d\.\s]+/, '').trim())
      .filter(suggestion => suggestion.length > 0);
  }
}

// Create and export a single instance
export const aiService = new AIService(); 