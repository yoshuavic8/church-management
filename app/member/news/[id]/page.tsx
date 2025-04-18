'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase';

export default function ArticleDetail() {
  const params = useParams();
  const articleId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticleDetails();
  }, [articleId]);

  const fetchArticleDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();
      
      // Fetch article details
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('status', 'published')
        .single();
        
      if (error) throw error;
      
      if (!data) {
        throw new Error('Article not found');
      }
      
      setArticle(data);
      
      // Increment view count
      await supabase
        .from('articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', articleId);
      
      // Fetch author details if available
      if (data.author_id) {
        const { data: authorData, error: authorError } = await supabase
          .from('members')
          .select('first_name, last_name, role')
          .eq('id', data.author_id)
          .single();
          
        if (!authorError && authorData) {
          setAuthor(authorData);
        }
      }
      
      // Fetch related articles (same category, excluding current)
      const { data: relatedData, error: relatedError } = await supabase
        .from('articles')
        .select('id, title, summary, image_url, published_at')
        .eq('category', data.category)
        .eq('status', 'published')
        .neq('id', articleId)
        .order('published_at', { ascending: false })
        .limit(3);
        
      if (!relatedError) {
        setRelatedArticles(relatedData || []);
      }
      
    } catch (error: any) {
      
      setError(error.message || 'Failed to load article');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'The article you are looking for does not exist or has been removed.'}</p>
        <Link 
          href="/member/news" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link 
          href="/member/news" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to News
        </Link>
      </div>
      
      {/* Article Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Article Header */}
        {article.image_url && (
          <div className="h-64 md:h-96 overflow-hidden">
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          {/* Category and Date */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
            <span className="inline-block px-2 py-1 text-xs font-semibold text-primary bg-primary-light rounded-full capitalize mr-3">
              {article.category}
            </span>
            <span>{formatDate(article.published_at)}</span>
            {author && (
              <>
                <span className="mx-2">•</span>
                <span>By {author.first_name} {author.last_name}</span>
              </>
            )}
          </div>
          
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          
          {/* Summary */}
          {article.summary && (
            <p className="text-lg text-gray-600 mb-6 font-medium">{article.summary}</p>
          )}
          
          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
      
      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <div key={relatedArticle.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {relatedArticle.image_url ? (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={relatedArticle.image_url} 
                      alt={relatedArticle.title} 
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
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {formatDate(relatedArticle.published_at)}
                  </p>
                  <h3 className="text-md font-medium text-gray-900 mb-2 line-clamp-2">{relatedArticle.title}</h3>
                  {relatedArticle.summary && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{relatedArticle.summary}</p>
                  )}
                  <Link 
                    href={`/member/news/${relatedArticle.id}`} 
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
