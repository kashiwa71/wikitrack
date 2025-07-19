import type { WikiNode } from '../types/wiki';

export class WikiService {
  static extractWikipediaTitle(url: string): string | null {
    // Support multiple Wikipedia language versions and mobile versions
    const patterns = [
      /\/wiki\/([^#?]+)/,  // Standard desktop
      /\/wiki\/([^#?\/]+)/,  // More strict pattern
      /wikipedia\.org\/wiki\/([^#?]+)/,  // Full URL pattern
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const title = decodeURIComponent(match[1]).replace(/_/g, ' ');
        // Remove any trailing slashes or additional path elements
        return title.split('/')[0].trim();
      }
    }
    return null;
  }

  static extractWikipediaLanguage(url: string): string {
    const match = url.match(/https?:\/\/([a-z]+)\.wikipedia\.org/);
    return match ? match[1] : 'ja'; // Default to Japanese
  }

  static isValidWikipediaUrl(url: string): boolean {
    return /^https?:\/\/[a-z]+\.wikipedia\.org\/wiki\/[^\/\s]+/.test(url);
  }

  static generateNodeId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static createNode(
    title: string, 
    url: string, 
    parentId: string | null = null, 
    depth: number = 0
  ): WikiNode {
    const language = this.extractWikipediaLanguage(url);
    return {
      id: this.generateNodeId(),
      title,
      url,
      language,
      parentId,
      children: [],
      depth,
      timestamp: new Date()
    };
  }

  static async fetchWikipediaInfo(title: string, language: string = 'ja'): Promise<{ title: string; summary: string } | null> {
    try {
      const encodedTitle = encodeURIComponent(title);
      
      console.log(`Fetching Wikipedia info for "${title}" in language: ${language}`);
      
      // Try multiple API endpoints for better compatibility
      const endpoints = [
        `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`,
        `https://${language}.wikipedia.org/w/api.php?action=query&format=json&titles=${encodedTitle}&prop=extracts&exintro=&explaintext=&origin=*`,
        `https://${language}.wikipedia.org/w/api.php?action=opensearch&search=${encodedTitle}&limit=1&namespace=0&format=json&origin=*`
      ];

      // Try the REST API first
      try {
        console.log(`Trying REST API: ${endpoints[0]}`);
        const response = await fetch(endpoints[0], {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'WikiTracker/1.0 (https://example.com/contact)',
          },
          mode: 'cors'
        });
        
        console.log(`REST API response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('REST API data:', data);
          
          // Check if the page exists and is not a disambiguation page
          if (data.type !== 'disambiguation' && data.extract) {
            return {
              title: data.title || title,
              summary: data.extract || 'No summary available'
            };
          }
        } else if (response.status === 404) {
          console.log('Page not found in REST API, trying fallback methods');
        }
      } catch (restError) {
        console.warn('REST API failed:', restError);
      }

      // Fallback to action API with extracts
      try {
        console.log(`Trying Action API: ${endpoints[1]}`);
        const response = await fetch(endpoints[1], {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Action API data:', data);
          
          const pages = data.query?.pages;
          if (pages) {
            const page = Object.values(pages)[0] as any;
            if (page && !page.missing && page.extract) {
              return {
                title: page.title || title,
                summary: page.extract || 'No summary available'
              };
            }
          }
        }
      } catch (actionError) {
        console.warn('Action API failed:', actionError);
      }

      // Final fallback to opensearch
      try {
        console.log(`Trying OpenSearch API: ${endpoints[2]}`);
        const response = await fetch(endpoints[2], {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('OpenSearch API data:', data);
          
          if (data && data.length >= 3 && data[2][0]) {
            return {
              title: data[1][0] || title,
              summary: data[2][0] || 'Summary found via search'
            };
          }
        }
      } catch (searchError) {
        console.warn('OpenSearch API failed:', searchError);
      }

      // If all APIs fail, return basic info
      console.log('All APIs failed, returning basic info');
      return {
        title: title,
        summary: `Wikipedia記事「${title}」が見つかりました。詳細を表示するには記事リンクをクリックしてください。`
      };
      
    } catch (error) {
      console.error('Error fetching Wikipedia info:', error);
      return {
        title: title,
        summary: `Wikipedia記事「${title}」が見つかりました。詳細を表示するには記事リンクをクリックしてください。`
      };
    }
  }
}
