import NodeCache from 'node-cache';

interface CacheConfig {
  stdTTL: number;
  checkperiod: number;
  useClones: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  hitRate: string;
}

class CacheService {
  private cache: NodeCache;
  private hits: number = 0;
  private misses: number = 0;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new NodeCache({
      stdTTL: config?.stdTTL ?? Number(process.env.CACHE_TTL) ?? 3600,
      checkperiod: config?.checkperiod ?? 120,
      useClones: config?.useClones ?? false,
    });

    this.cache.on('expired', (key) => {
      console.log(`Cache key expired: ${key}`);
    });
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    
    if (value !== undefined) {
      this.hits++;
    } else {
      this.misses++;
    }

    return value;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl ?? 0);
  }

  delete(key: string): number {
    return this.cache.del(key);
  }

  deletePattern(pattern: string): number {
    const keys = this.cache.keys().filter(key => key.includes(pattern));
    return this.cache.del(keys);
  }

  flush(): void {
    this.cache.flushAll();
    this.hits = 0;
    this.misses = 0;
  }

  getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      keys: this.cache.keys().length,
      hitRate: this.hits + this.misses > 0 
        ? (this.hits / (this.hits + this.misses) * 100).toFixed(2) 
        : '0',
    };
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  getTTL(key: string): number | undefined {
    return this.cache.getTtl(key);
  }

  keys(): string[] {
    return this.cache.keys();
  }

  getKeyCount(): number {
    return this.cache.keys().length;
  }
}

export const cacheService = new CacheService();