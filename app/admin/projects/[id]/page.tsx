'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';
import Layout from '../../../components/layout/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import CurrencyInput from '../../../components/ui/CurrencyInput';
import { parseCurrency } from '../../../utils/currencyFormatter';

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
  creator: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  donations: Array<{
    id: string;
    donor_name: string;
    amount: number;
    is_anonymous: boolean;
    donated_at: string;
  }>;
  created_at: string;
  updated_at: string;
};

// Client-side component for project detail
function ProjectDetailContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationLoading, setDonationLoading] = useState(false);
  
  const [donationForm, setDonationForm] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    amount: '',
    message: '',
    is_anonymous: false
  });

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProject(projectId);
      
      if (response.success) {
        setProject(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch project');
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonationLoading(true);

    try {
      if (!donationForm.donor_name || !donationForm.amount) {
        alert('Please fill in donor name and amount');
        setDonationLoading(false);
        return;
      }

      const amount = typeof donationForm.amount === 'string' 
        ? parseCurrency(donationForm.amount) 
        : parseFloat(donationForm.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        setDonationLoading(false);
        return;
      }

      const donationData = {
        project_id: projectId,
        donor_name: donationForm.donor_name,
        donor_email: donationForm.donor_email || undefined,
        donor_phone: donationForm.donor_phone || undefined,
        amount: amount,
        message: donationForm.message || undefined,
        is_anonymous: donationForm.is_anonymous
      };

      const response = await apiClient.createDonation(donationData);

      if (response.success) {
        alert('Donation added successfully!');
        setShowDonationForm(false);
        setDonationForm({
          donor_name: '',
          donor_email: '',
          donor_phone: '',
          amount: '',
          message: '',
          is_anonymous: false
        });
        // Refresh project data
        fetchProject();
      } else {
        alert(response.error?.message || 'Failed to add donation');
      }
    } catch (err: any) {
      console.error('Error creating donation:', err);
      alert(err.message || 'Failed to add donation');
    } finally {
      setDonationLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>{error || 'Project not found'}</p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            {project.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Project Details and Donations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Link href={`/admin/projects/${project.id}/edit`}>
            <Button variant="outline">
              Edit Project
            </Button>
          </Link>
          <Button onClick={() => setShowDonationForm(true)}>
            Add Donation
          </Button>
        </div>
      </div>

      {/* Project Details */}
      <Card className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Image */}
          {project.image_url && (
            <div className="lg:col-span-1">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Project Info */}
          <div className={project.image_url ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
              {project.is_published && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Published
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-6 whitespace-pre-wrap">
              {project.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Event Date</p>
                <p className="font-medium">{formatDate(project.event_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">{project.creator.first_name} {project.creator.last_name}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Fundraising Progress</span>
                <span>{Math.round(project.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(project.progress, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatCurrency(project.current_amount)} raised</span>
                <span>of {formatCurrency(project.target_amount)} goal</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Donations List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Donations ({project.donations_count})
          </h3>
        </div>

        {project.donations && project.donations.length > 0 ? (
          <div className="space-y-4">
            {project.donations.map((donation) => (
              <div key={donation.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {donation.is_anonymous ? 'Anonymous Donor' : donation.donor_name}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(donation.donated_at)}</p>
                </div>
                <p className="font-bold text-indigo-600">{formatCurrency(donation.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No donations yet</p>
        )}
      </Card>

      {/* Add Donation Modal */}
      {showDonationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">Add New Donation</h3>
            
            <form onSubmit={handleDonationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donor Name *
                </label>
                <Input
                  type="text"
                  value={donationForm.donor_name}
                  onChange={(e) => setDonationForm(prev => ({ ...prev, donor_name: e.target.value }))}
                  placeholder="Enter donor name"
                  required
                  disabled={donationLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  value={donationForm.donor_email}
                  onChange={(e) => setDonationForm(prev => ({ ...prev, donor_email: e.target.value }))}
                  placeholder="donor@email.com"
                  disabled={donationLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <Input
                  type="tel"
                  value={donationForm.donor_phone}
                  onChange={(e) => setDonationForm(prev => ({ ...prev, donor_phone: e.target.value }))}
                  placeholder="08123456789"
                  disabled={donationLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (IDR) *
                </label>
                <CurrencyInput
                  name="amount"
                  value={donationForm.amount}
                  onValueChange={(value, formattedValue) => {
                    setDonationForm(prev => ({ ...prev, amount: formattedValue }));
                  }}
                  placeholder="100.000"
                  required
                  disabled={donationLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={donationForm.message}
                  onChange={(e) => setDonationForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Optional message from donor..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={donationLoading}
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={donationForm.is_anonymous}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={donationLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Anonymous donation</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDonationForm(false)}
                  disabled={donationLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={donationLoading}
                  disabled={donationLoading}
                >
                  Add Donation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <Layout>
        <ProjectDetailContent />
      </Layout>
    </ProtectedRoute>
  );
}
