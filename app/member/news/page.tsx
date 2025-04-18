'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';

export default function MemberNews() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const articlesPerPage = 6;

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [selectedCategory, currentPage]);

  const fetchCategories = async () => {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('articles')
        .select('category')
        .eq('status', 'published')
        .order('category', { ascending: true });
        
      if (error) throw error;
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      // Calculate pagination
      const from = (currentPage - 1) * articlesPerPage;
      const to = from + articlesPerPage - 1;
      
      // Build query
      let query = supabase
        .from('articles')
        .select('id, title, summary, content, image_url, published_at, category, author_id, view_count, featured', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false });
        
      // Apply category filter if selected
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      // Get paginated results
      const { data, error, count } = await query
        .range(from, to);
        
      if (error) throw error;
      
      // Calculate total pages
      if (count !== null) {
        setTotalPages(Math.ceil(count / articlesPerPage));
      }
      
      // Find featured article
      if (currentPage === 1 && selectedCategory === 'all') {
        const { data: featuredData, error: featuredError } = await supabase
          .from('articles')
          .select('id, title, summary, image_url, published_at, category')
          .eq('status', 'published')
          .eq('featured', true)
          .order('published_at', { ascending: false })
          .limit(1)
          .single();
          
        if (!featuredError && featuredData) {
          setFeaturedArticle(featuredData);
          
          // Remove featured article from the list to avoid duplication
          const filteredArticles = data.filter(article => article.id !== featuredData.id);
          setArticles(filteredArticles);
        } else {
          setFeaturedArticle(null);
          setArticles(data || []);
        }
      } else {
        setFeaturedArticle(null);
        setArticles(data || []);
      }
      
    } catch (error) {
      
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Church News & Updates</h1>
        <p className="text-gray-500">Stay informed about what's happening in our church community</p>
      </div>
      
      {/* Featured Article */}
      {featuredArticle && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="relative">
            {featuredArticle.image_url ? (
              <div className="h-64 md:h-96 overflow-hidden">
                <img 
                  src={featuredArticle.image_url} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-64 md:h-96 bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                Featured
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span>{formatDate(featuredArticle.published_at)}</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{featuredArticle.category}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{featuredArticle.title}</h2>
            {featuredArticle.summary && (
              <p className="text-gray-600 mb-4">{featuredArticle.summary}</p>
            )}
            <Link 
              href={`/member/news/${featuredArticle.id}`} 
              className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
            >
              Read Full Article
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}
      
      {/* Filters and Articles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`block w-full text-left px-3 py-2 rounded-md ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`block w-full text-left px-3 py-2 rounded-md capitalize ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Articles Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <div key={article.id} className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-full">
                    {article.image_url ? (
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt={article.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-4 flex-grow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-primary bg-primary-light rounded-full capitalize">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(article.published_at)}
                        </span>
                      </div>
                      <h3 className="text-md font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                      {article.summary && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-3">{article.summary}</p>
                      )}
                    </div>
                    <div className="px-4 pb-4 mt-auto">
                      <Link 
                        href={`/member/news/${article.id}`} 
                        className="text-sm text-primary hover:text-primary-dark font-medium"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      &laquo;
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === i + 1
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      &raquo;
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h2>
              <p className="text-gray-500">
                {selectedCategory !== 'all' 
                  ? `There are no articles in the "${selectedCategory}" category yet.` 
                  : 'There are no articles published yet.'}
              </p>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  View All Categories
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
