'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';
import MemberLayout from '../../../components/layout/MemberLayout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import DOMPurify from 'isomorphic-dompurify';
import { resolveImageUrl, handleImageError } from '../../../utils/image-helpers';

interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  image_url?: string;
  published_at: string;
  view_count: number;
  featured: boolean;
  author: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export default function MemberArticleDetail() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Use sessionStorage untuk persistent tracking across component remounts
  const VIEW_TRACKING_KEY = 'article_views_tracked';
  const viewTrackingInProgress = useRef<Set<string>>(new Set());
  
  const getTrackedViews = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = sessionStorage.getItem(VIEW_TRACKING_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };
  
  const saveTrackedViews = (viewsSet: Set<string>) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(VIEW_TRACKING_KEY, JSON.stringify(Array.from(viewsSet)));
    } catch (error) {
      console.error('Failed to save tracked views:', error);
    }
  };
  
  const trackView = async (id: string) => {
    const trackedViews = getTrackedViews();
    
    // Double check: jika sudah di-track di sessionStorage atau sedang dalam proses
    if (trackedViews.has(id) || viewTrackingInProgress.current.has(id)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('View already tracked or in progress for article:', id);
      }
      return;
    }
    
    // Mark sebagai sedang dalam proses untuk prevent race condition
    viewTrackingInProgress.current.add(id);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Tracking view for article:', id);
      }
      
      await apiClient.incrementArticleView(id);
      
      // Update tracked views di sessionStorage
      trackedViews.add(id);
      saveTrackedViews(trackedViews);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('View successfully tracked for article:', id);
      }
    } catch (error) {
      console.error('Failed to track view:', error);
    } finally {
      // Remove dari progress tracking
      viewTrackingInProgress.current.delete(id);
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      console.log('Fetching article with ID:', articleId); // Debug log
      const response = await apiClient.getArticle(articleId);
      
      console.log('Article response:', response); // Debug log
      
      if (response.success && response.data) {
        setArticle(response.data);
        setError('');
        
        // Track view setelah artikel berhasil di-load
        await trackView(articleId);
      } else {
        setError('Artikel tidak ditemukan');
      }
    } catch (err: any) {
      console.error('Error fetching article:', err); // Debug log
      setError(err.message || 'Gagal memuat artikel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <MemberLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </MemberLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <MemberLayout>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
            <div className="mt-4">
              <Link
                href="/member/news"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Kembali ke Artikel & Informasi
              </Link>
            </div>
          </div>
        </MemberLayout>
      </ProtectedRoute>
    );
  }

  if (!article) {
    return (
      <ProtectedRoute>
        <MemberLayout>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-600">Artikel tidak ditemukan</p>
            </div>
            <div className="mt-4">
              <Link
                href="/member/news"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Kembali ke Artikel & Informasi
              </Link>
            </div>
          </div>
        </MemberLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MemberLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link
              href="/member/news"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Kembali ke Artikel & Informasi
            </Link>
          </div>

          {/* Article Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {article.image_url && (
              <div className="aspect-video relative">
                <img
                  src={resolveImageUrl(article.image_url) || ''}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e)}
                  onLoad={() => {
                    console.log('Detail image loaded successfully:', article.image_url);
                  }}
                />
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-4">
                  {article.category}
                </span>
                <span>
                  {new Date(article.published_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="mx-2">•</span>
                <span>{article.view_count} views</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              
              <div className="flex items-center text-sm text-gray-600 mb-6">
                <span>Oleh: {article.author.first_name} {article.author.last_name}</span>
              </div>
              
              {article.summary && (
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
                  <p className="text-gray-700 font-medium">{article.summary}</p>
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(article.content)
              }}
            />
          </div>

          {/* Navigation Footer */}
          <div className="mt-8 text-center">
            <Link
              href="/member/news"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Lihat Artikel Lainnya
            </Link>
          </div>
        </div>
      </MemberLayout>
    </ProtectedRoute>
  );
}