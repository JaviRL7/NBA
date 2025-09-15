// apiService.ts - Servicio con caché del lado cliente y múltiples endpoints

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private readonly BASE_URL = 'http://localhost:4000';

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 Client cache hit: ${key}`);
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 Client cached: ${key}`);
  }

  private async fetchWithFallback<T>(
    primaryEndpoint: string,
    fallbackEndpoint?: string,
    cacheKey?: string
  ): Promise<T> {
    // 1. Check cache first
    if (cacheKey) {
      const cached = this.getCachedData<T>(cacheKey);
      if (cached) return cached;
    }

    const endpoints = [primaryEndpoint];
    if (fallbackEndpoint) {
      endpoints.push(fallbackEndpoint);
    }

    for (const endpoint of endpoints) {
      try {
        console.log(`🌐 Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const data = await response.json();
          
          // Cache successful response
          if (cacheKey) {
            this.setCachedData(cacheKey, data);
          }
          
          return data;
        } else {
          console.warn(`❌ Endpoint failed: ${endpoint} - ${response.status}`);
        }
      } catch (error) {
        console.warn(`❌ Endpoint error: ${endpoint}`, error);
      }
    }

    throw new Error('All API endpoints failed');
  }

  async getTeams(): Promise<any[]> {
    return this.fetchWithFallback(
      `${this.BASE_URL}/teams`,
      `${this.BASE_URL}/nba-api/teams`,
      'teams'
    );
  }

  async searchPlayers(query: string): Promise<any[]> {
    if (query.length < 2) return [];

    const cacheKey = `players_${query.toLowerCase()}`;

    return this.fetchWithFallback(
      `${this.BASE_URL}/players/search?name=${encodeURIComponent(query)}`,
      `${this.BASE_URL}/nba-api/players/search?name=${encodeURIComponent(query)}`,
      cacheKey
    );
  }

  async getPlayerTeamHistory(playerId: number): Promise<any> {
    const cacheKey = `player_teams_${playerId}`;

    try {
      return await this.fetchWithFallback(
        `${this.BASE_URL}/player-teams/${playerId}`,
        undefined, // No fallback for this endpoint yet
        cacheKey
      );
    } catch (error) {
      console.error(`Failed to get team history for player ${playerId}:`, error);
      return { playerId, teams: [], error: 'Failed to fetch team history' };
    }
  }

  async validatePlayerSelection(firstName: string, lastName: string, team1Id: number, team2Id: number): Promise<any> {
    const cacheKey = `validate_${firstName}_${lastName}_${team1Id}_${team2Id}`;

    // Check cache first
    const cached = this.getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.BASE_URL}/validate-player?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&team1Id=${team1Id}&team2Id=${team2Id}`;

      console.log(`🌐 Validating player: ${firstName} ${lastName} for teams ${team1Id} and ${team2Id}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Validation API error: ${response.status}`);
      }

      const data = await response.json();

      // Cache the result
      this.setCachedData(cacheKey, data);

      return data;

    } catch (error) {
      console.error(`Failed to validate player ${firstName} ${lastName}:`, error);
      return {
        player: `${firstName} ${lastName}`,
        isValid: false,
        error: 'Failed to validate player',
        method: 'error-fallback'
      };
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export default new ApiService();