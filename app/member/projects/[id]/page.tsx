'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MemberLayout from '../../../components/layout/MemberLayout';
import { apiClient } from '../../../lib/api-client';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Project = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_date: string;
  target_amount: number;
  current_amount: number;
  progress: number;
  status: string;
  is_published: boolean;
  donations_count: number;
  creator?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  donations?: Array<{
    id: string;
    donor_name: string;
    amount: number;
    message?: string;
    is_anonymous: boolean;
    donated_at: string;
  }>;
};

function ProjectDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);

        if (!projectId) {
          throw new Error('Project ID is required');
        }

        // Fetch project details
        const response = await apiClient.getProject(projectId);
        setProject(response.data);

        // Pre-fill user data if available
        if (user) {
          setDonorName(`${user.first_name} ${user.last_name}`);
          setDonorEmail(user.email || '');
        }

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch project details');
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, user]);

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project) return;

    try {
      setIsSubmitting(true);

      const donationData = {
        project_id: project.id,
        donor_name: isAnonymous ? 'Hamba Tuhan' : donorName,
        donor_email: donorEmail,
        donor_phone: donorPhone,
        amount: parseFloat(donationAmount),
        message: donationMessage,
        is_anonymous: isAnonymous
      };

      const response = await apiClient.createDonation(donationData);
      
      if (response.success) {
        alert('Terima kasih atas donasi Anda! Donasi akan diverifikasi oleh admin.');
        // Refresh project data
        window.location.reload();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to submit donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Aktif';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDaysLeft = (eventDate: string) => {
    const now = new Date();
    const target = new Date(eventDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const suggestedAmounts = [50000, 100000, 250000, 500000, 1000000];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading project details</p>
            <p className="text-sm">{error || 'Project not found'}</p>
          </div>
          <Link 
            href="/member/projects"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const daysLeft = calculateDaysLeft(project.event_date);
  const canDonate = project.status === 'published' && daysLeft >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
            <p className="text-gray-600 mt-1">Detail project dan informasi donasi</p>
          </div>
          <Link
            href="/member/projects"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            ← Kembali ke Projects
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Image */}
          {project.image_url ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-64 object-cover"
              />
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8">
              <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="h-20 w-20 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          )}

          {/* Project Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deskripsi Project</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{project.description}</p>
            </div>
          </div>

          {/* Recent Donations */}
          {project.donations && project.donations.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Donasi Terbaru</h2>
              <div className="space-y-4">
                {project.donations.slice(0, 10).map((donation) => (
                  <div key={donation.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {donation.is_anonymous ? 'Hamba Tuhan' : donation.donor_name}
                        </p>
                        <p className="text-sm font-semibold text-orange-600">
                          {formatCurrency(donation.amount)}
                        </p>
                      </div>
                      {donation.message && (
                        <p className="mt-1 text-sm text-gray-600 italic">"{donation.message}"</p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(donation.donated_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Project</h3>
            
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress Donasi</span>
                <span className="font-semibold">{Math.round(project.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(project.progress, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Terkumpul</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(project.current_amount)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Target</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(project.target_amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Donatur</p>
                  <p className="text-lg font-semibold text-orange-600">{project.donations_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sisa Hari</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {daysLeft > 0 ? daysLeft : daysLeft === 0 ? 'Berakhir hari ini' : 'Berakhir'}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Date */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Target Tanggal</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(project.event_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Creator Info */}
            {project.creator && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Dibuat oleh</p>
                <p className="text-sm font-medium text-gray-900">
                  {project.creator.first_name} {project.creator.last_name}
                </p>
              </div>
            )}
          </div>

          {/* Donation Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Berikan Donasi</h3>
            
            {canDonate ? (
              <div>
                {!showDonationForm ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Dukung project ini dengan memberikan donasi Anda
                    </p>
                    <button
                      onClick={() => setShowDonationForm(true)}
                      className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                      Donasi Sekarang
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDonation} className="space-y-4">
                    {/* Suggested Amounts */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Donasi
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {suggestedAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setDonationAmount(amount.toString())}
                            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-orange-500"
                          >
                            {formatCurrency(amount)}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="Masukkan jumlah donasi"
                        min="10000"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Anonymous Option */}
                    <div className="flex items-center">
                      <input
                        id="anonymous"
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                        Donasi sebagai Hamba Tuhan (Anonim)
                      </label>
                    </div>

                    {/* Donor Info */}
                    {!isAnonymous && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Lengkap
                          </label>
                          <input
                            type="text"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            required={!isAnonymous}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            No. Telepon
                          </label>
                          <input
                            type="tel"
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </>
                    )}

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pesan (Opsional)
                      </label>
                      <textarea
                        value={donationMessage}
                        onChange={(e) => setDonationMessage(e.target.value)}
                        rows={3}
                        placeholder="Tulis pesan untuk project ini..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowDonationForm(false)}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Donasi'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {project.status !== 'published' 
                      ? 'Project belum aktif untuk menerima donasi'
                      : 'Periode donasi sudah berakhir'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute>
      <MemberLayout>
        <ProjectDetailContent />
      </MemberLayout>
    </ProtectedRoute>
  );
}
