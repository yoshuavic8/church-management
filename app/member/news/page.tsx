'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api-client';
import MemberLayout from '../../components/layout/MemberLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

interface Article {
  id: string;
  title: string;
  summary?: string;
  category: string;
  image_url?: string;
  published_at: string;
  view_count: number;
  featured: boolean;
  author: {
    first_name: string;
    last_name: string;
  };
}

export default function MemberNews() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  const articlesPerPage = 6;

  useEffect(() => {
    fetchFeaturedArticles();
    fetchCategories();
    fetchArticles();
  }, [currentPage, selectedCategory]);

  const fetchFeaturedArticles = async () => {
    try {
      const response = await apiClient.getArticles({ 
        status: 'published',
        limit: 3
      });
      
      if (response.success && response.data) {
        const featured = response.data.filter((article: Article) => article.featured);
        setFeaturedArticles(featured.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch featured articles:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getArticles({ 
        status: 'published',
        limit: 1000 
      });
      
      if (response.success && response.data) {
        const categories = response.data.map((article: Article) => article.category).filter(Boolean);
        const uniqueCategories = Array.from(new Set(categories));
        setCategories(uniqueCategories as string[]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        status: 'published',
        page: currentPage,
        limit: articlesPerPage,
      };
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      const response = await apiClient.getArticles(params);
      
      if (response.success && response.data) {
        setArticles(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      } else {
        setArticles([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <ProtectedRoute>
      <MemberLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Berita & Informasi Gereja</h1>
            <p className="mt-2 text-gray-600">Tetap terhubung dengan informasi terbaru dari komunitas gereja kita</p>
          </div>

          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Artikel Unggulan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/member/news/${article.id}`}
                    className="group cursor-pointer"
                  >
                    {article.image_url && (
                      <div className="aspect-w-16 aspect-h-9 mb-3">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-48 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          {article.category}
                        </span>
                        <span>{new Date(article.published_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary line-clamp-2">
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p className="text-gray-600 text-sm line-clamp-2">{article.summary}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Oleh {article.author.first_name} {article.author.last_name}
                        </span>
                        <span>{article.view_count} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories Filter */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'Semua Artikel' : `Artikel ${selectedCategory}`}
              </h2>
              <div className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-2 text-gray-500">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 1v1m-1 10H9m12 0a2 2 0 01-2 2H7m0 0a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V7a2 2 0 012-2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada artikel</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCategory === 'all' 
                    ? 'Belum ada artikel yang dipublikasikan' 
                    : `Belum ada artikel dalam kategori "${selectedCategory}"`
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/member/news/${article.id}`}
                      className="group cursor-pointer border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {article.image_url && (
                        <div className="aspect-w-16 aspect-h-9 mb-3">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-32 object-cover rounded group-hover:opacity-90 transition-opacity"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium capitalize">
                            {article.category}
                          </span>
                          <span>{new Date(article.published_at).toLocaleDateString('id-ID')}</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary line-clamp-2">
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className="text-gray-600 text-sm line-clamp-2">{article.summary}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            Oleh {article.author.first_name} {article.author.last_name}
                          </span>
                          <span>{article.view_count} views</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            pageNumber === currentPage
                              ? 'bg-primary text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </MemberLayout>
    </ProtectedRoute>
  );
}
