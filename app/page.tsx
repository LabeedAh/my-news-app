'use client';

import { useState, useEffect } from 'react';

const NEWS_API_KEY = '81b4dec40e4346d08dff028ccd52c254';
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';


type Category = 'general' | 'business' | 'technology' | 'entertainment' | 'health' | 'science' | 'sports';
const CATEGORIES: Category[] = ['general', 'business', 'technology', 'entertainment', 'health', 'science', 'sports'];

// Define the shape of a single news article returned by the API
interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// --- COMPONENTS ---

interface CategoryButtonProps {
  category: Category;
  isSelected: boolean;
  onClick: (cat: Category) => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, isSelected, onClick }) => {
  const baseClasses = "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm whitespace-nowrap capitalize";
  const selectedClasses = "bg-blue-600 text-white shadow-md hover:bg-blue-700";
  const unselectedClasses = "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200";

  return (
    <button
      onClick={() => onClick(category)}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
    >
      {category}
    </button>
  );
};

interface NewsCardProps {
    article: Article;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
 
  const imageUrl = article.urlToImage || 'https://placehold.co/600x400/94a3b8/e2e8f0?text=Image+Missing';

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Article Image */}
      <a href={article.url} target="_blank" rel="noopener noreferrer">
        <img
          src={imageUrl}
          alt={article.title}
          className="w-full h-48 object-cover object-center"
          // Fallback in case the provided image URL is broken
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/94a3b8/e2e8f0?text=Image+Missing';
          }}
        />
      </a>
      
      {/* Content Area */}
      <div className="p-5 flex flex-col">
        {/* Source */}
        <p className="text-xs font-semibold text-blue-600 mb-1 tracking-wider uppercase">
          {article.source.name || 'Unknown Source'}
        </p>
        
        {/* Title */}
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-700 transition-colors leading-tight">
          {article.title}
        </a>
        
        {/* Excerpt (using description field from API) */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {article.description || 'No summary available for this article.'}
        </p>
      </div>
    </div>
  );
};

// Loading and Error Components
const LoadingState: React.FC = () => (
  <div className="col-span-full p-10 text-center flex flex-col items-center justify-center bg-white rounded-xl shadow-lg">
    <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-xl font-semibold text-gray-700">Fetching the latest headlines...</p>
    <p className="text-gray-500 mt-1">This may take a moment.</p>
  </div>
);

interface ErrorStateProps {
    message: string | null;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => (
  <div className="col-span-full p-10 text-center bg-red-50 border border-red-300 rounded-xl shadow-lg">
    <p className="text-xl font-bold text-red-800">Error Fetching News</p>
    <p className="text-red-700 mt-2">{message}</p>
    <p className="text-sm text-red-500 mt-1">Please try refreshing or selecting another category.</p>
  </div>
);


// --- MAIN PAGE COMPONENT ---
export default function Home() {
  // Initialize state with explicit TypeScript types
  const [selectedCategory, setSelectedCategory] = useState<Category>('general');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setArticles([]);
      setError(null);
      setIsLoading(true);

      const url = `${NEWS_API_URL}?country=us&category=${selectedCategory}&pageSize=24&apiKey=${NEWS_API_KEY}`;
      
      let attempt = 0;
      const MAX_ATTEMPTS = 3;

      while (attempt < MAX_ATTEMPTS) {
        try {
          const response = await fetch(url);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown issue'}`);
          }

          const data: { articles: Article[] } = await response.json();
          setArticles(data.articles || []);
          setError(null); 
          break; 
        } catch (err) {
          attempt++;
          // Ensure err is treated as an Error object for safe logging
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error(`Attempt ${attempt} failed:`, errorMessage);
          
          if (attempt >= MAX_ATTEMPTS) {
            setError(`Failed to load news: ${errorMessage}`);
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
          }
        }
      }
      
      setIsLoading(false);
    };

    fetchNews();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Header and Subtitle Section */}
      <header className="py-12 bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2">
            Live News Feed
          </h1>
          <p className="text-lg text-gray-500">
            Your daily brief on what's happening
          </p>
        </div>
      </header>
      
      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Category Navigation Tabs */}
        <div className="mb-10 overflow-x-auto whitespace-nowrap py-2 flex space-x-3 items-center justify-center">
          {CATEGORIES.map((category) => (
            <CategoryButton
              key={category}
              category={category}
              isSelected={category === selectedCategory}
              onClick={setSelectedCategory}
            />
          ))}
        </div>
        
        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {isLoading && <LoadingState />}

          {!isLoading && error && <ErrorState message={error} />}

          {!isLoading && !error && articles.length > 0 && (
            articles.map((article, index) => (
              // Using article.url as the key is the most reliable method
              <NewsCard key={article.url || article.title + index} article={article} />
            ))
          )}

          {!isLoading && !error && articles.length === 0 && (
            // Empty State
            <div className="col-span-full p-10 text-center bg-white rounded-xl shadow-lg">
              <p className="text-xl font-semibold text-gray-700">No articles found in the "{selectedCategory.toUpperCase()}" category.</p>
              <p className="text-gray-500 mt-2">Try selecting a different category or wait for new headlines to be published.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer (Simple example) */}
      <footer className="py-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} News Feed App. Powered by Invodev.</p>
      </footer>
    </div>
  );
}
