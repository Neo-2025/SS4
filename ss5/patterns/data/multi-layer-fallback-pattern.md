# Pattern: Multi-Layer Fallback

## Status
Validated

## Classification
Data

## Problem Statement
Modern applications that depend on external APIs face several critical challenges:
- External APIs may experience downtime or performance degradation
- Network connectivity can be intermittent, especially in mobile applications
- API rate limits or quotas may restrict access during high traffic periods
- Service disruptions can lead to poor user experience or complete feature failure

Without a proper fallback strategy, these issues can lead to application failures, lost data, and frustrated users.

## Solution
Implement a Multi-Layer Fallback pattern that provides graceful degradation through a cascading series of data sources, each serving as a fallback for the tier above it:

1. **Primary Source** (External API) - Provides the most current and authoritative data
2. **Secondary Source** (Database Cache) - Stores previously fetched API data with metadata
3. **Tertiary Source** (In-Memory Cache) - Provides high-speed access to recently used data
4. **Fallback Source** (Static/Default Data) - Offers minimally viable data when all else fails

This pattern includes data quality indicators so users understand the reliability of the data they're viewing.

## Implementation Details

### 1. Data Model with Source Indicators

```typescript
export interface DataModel {
  id: string;
  name: string;
  // Other data properties...
  
  // Data quality metadata
  isFallbackData?: boolean;
  dataSource?: 'api' | 'database' | 'memory' | 'static';
  lastUpdated?: string;
}
```

### 2. Service Implementation with Multi-Layer Fallback

```typescript
export class DataService {
  private apiClient: ApiClient;
  private dbService: DatabaseService;
  private memoryCache: Map<string, CachedData<DataModel>> = new Map();
  
  constructor() {
    this.apiClient = new ApiClient();
    this.dbService = new DatabaseService();
  }
  
  async getData(id: string): Promise<DataModel> {
    try {
      // Layer 1: Try memory cache first (fastest)
      const cachedData = this.getFromMemoryCache(id);
      if (cachedData && this.isCacheValid(cachedData)) {
        return {
          ...cachedData.data,
          dataSource: 'memory',
          isFallbackData: false
        };
      }
      
      // Layer 2: Try API (most current data)
      try {
        const apiData = await this.apiClient.fetchData(id);
        
        // Update caches
        this.updateMemoryCache(id, apiData);
        await this.dbService.cacheData(id, apiData);
        
        return {
          ...apiData,
          dataSource: 'api',
          isFallbackData: false
        };
      } catch (apiError) {
        console.warn(`API error for data ${id}:`, apiError);
        
        // Layer 3: Try database cache
        const dbData = await this.dbService.getCachedData(id);
        if (dbData) {
          // Update memory cache
          this.updateMemoryCache(id, dbData);
          
          return {
            ...dbData,
            dataSource: 'database',
            isFallbackData: true
          };
        }
        
        // Layer 4: Use static fallback data
        const fallbackData = this.getFallbackData(id);
        return {
          ...fallbackData,
          dataSource: 'static',
          isFallbackData: true
        };
      }
    } catch (error) {
      console.error(`Complete fallback failure for ${id}:`, error);
      
      // Ultimate fallback - minimal data
      return {
        id,
        name: `Data ${id}`,
        dataSource: 'static',
        isFallbackData: true
      };
    }
  }
  
  private getFromMemoryCache(id: string): CachedData<DataModel> | undefined {
    return this.memoryCache.get(id);
  }
  
  private updateMemoryCache(id: string, data: DataModel): void {
    this.memoryCache.set(id, {
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  private isCacheValid(cachedData: CachedData<DataModel>, maxAgeMs: number = 60000): boolean {
    const cached = new Date(cachedData.timestamp).getTime();
    const now = new Date().getTime();
    return (now - cached) < maxAgeMs;
  }
  
  private getFallbackData(id: string): DataModel {
    // Return minimal static data
    return {
      id,
      name: `Data ${id}`
    };
  }
}

interface CachedData<T> {
  data: T;
  timestamp: string;
}
```

### 3. UI Integration with Fallback Indicators

```typescript
function DataDisplay({ id }: { id: string }) {
  const [data, setData] = useState<DataModel | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      try {
        const result = await dataService.getData(id);
        setData(result);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [id]);
  
  if (loading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage />;
  
  return (
    <div className="data-item">
      <h2>{data.name}</h2>
      {data.isFallbackData && (
        <div className="fallback-indicator">
          <WarningIcon />
          <span>Using {data.dataSource} data - Last updated: {data.lastUpdated || 'unknown'}</span>
        </div>
      )}
      <div className="data-content">
        {/* Display data properties */}
      </div>
    </div>
  );
}
```

## Benefits
- **Resilience**: Applications remain functional even during API outages
- **Improved UX**: Users experience degraded functionality rather than complete failure
- **Transparency**: Data source indicators inform users about data quality
- **Performance**: Memory caching improves response times for frequently accessed data
- **Resource Efficiency**: Reduces redundant API calls for unchanged data
- **Network Tolerance**: Applications can function with intermittent connectivity

## Evidence
This pattern has been implemented in HealthBench Branch 3.6 for API integration:
- Agency Service implementation: `/app/lib/services/agency.ts`
- Database caching layer: `/app/lib/api/db/supabaseService.ts`
- UI indicators in agency command: `/app/lib/commands/agency/list.ts`

## Limitations
- Increased complexity in data flow and state management
- Risk of stale data if cache invalidation is not properly implemented
- Additional storage requirements for caching
- UI must account for and display fallback status
- May mask underlying API issues if fallbacks are too seamless

## Related Patterns
- Circuit Breaker Pattern
- Cache-Aside Pattern
- Retry Pattern
- Data Transfer Object Pattern
- Timeout Pattern 