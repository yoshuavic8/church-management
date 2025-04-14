'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';

type PastoralService = {
  id: string;
  type: string;
  member_id: string;
  member_name: string;
  requested_date: string;
  scheduled_date: string;
  status: string;
  notes: string;
  assigned_to: string;
};

export default function PastoralServicesPage() {
  const [services, setServices] = useState<PastoralService[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // In a real implementation, this would be an actual Supabase query
        // Example:
        // const supabase = getSupabaseClient();
        // const { data, error } = await supabase
        //   .from('pastoral_services')
        //   .select('*, members(first_name, last_name)')
        //   .order('requested_date', { ascending: false });

        // if (error) throw error;

        // Placeholder data
        const mockServices: PastoralService[] = [
          {
            id: '1',
            type: 'visitation',
            member_id: '1',
            member_name: 'John Doe',
            requested_date: '2023-04-10',
            scheduled_date: '2023-04-15',
            status: 'scheduled',
            notes: 'Member is recovering from surgery',
            assigned_to: 'Pastor Jane Smith',
          },
          {
            id: '2',
            type: 'counseling',
            member_id: '2',
            member_name: 'Jane Smith',
            requested_date: '2023-04-08',
            scheduled_date: '2023-04-12',
            status: 'completed',
            notes: 'Marriage counseling session',
            assigned_to: 'Pastor John Doe',
          },
          {
            id: '3',
            type: 'baptism',
            member_id: '3',
            member_name: 'Michael Johnson',
            requested_date: '2023-04-05',
            scheduled_date: '2023-04-30',
            status: 'scheduled',
            notes: 'First-time baptism',
            assigned_to: 'Pastor John Doe',
          },
          {
            id: '4',
            type: 'wedding',
            member_id: '4',
            member_name: 'Sarah Williams',
            requested_date: '2023-03-15',
            scheduled_date: '2023-06-10',
            status: 'scheduled',
            notes: 'Wedding ceremony at main sanctuary',
            assigned_to: 'Pastor Jane Smith',
          },
          {
            id: '5',
            type: 'funeral',
            member_id: '5',
            member_name: 'Robert Brown',
            requested_date: '2023-04-11',
            scheduled_date: '2023-04-14',
            status: 'pending',
            notes: 'Funeral service for member\'s father',
            assigned_to: '',
          },
        ];

        setServices(mockServices);
      } catch (error) {
        console.error('Error fetching pastoral services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    if (filter === service.status) return true;
    if (filter === service.type) return true;
    return false;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'visitation':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'counseling':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
          </svg>
        );
      case 'baptism':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
          </svg>
        );
      case 'wedding':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        );
      case 'funeral':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pastoral Services</h1>
        <Link href="/pastoral/request" className="btn-primary">
          New Service Request
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md ${
              filter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-3 py-1 rounded-md ${
              filter === 'scheduled'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md ${
              filter === 'completed'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('visitation')}
            className={`px-3 py-1 rounded-md ${
              filter === 'visitation'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Visitation
          </button>
          <button
            onClick={() => setFilter('counseling')}
            className={`px-3 py-1 rounded-md ${
              filter === 'counseling'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Counseling
          </button>
          <button
            onClick={() => setFilter('baptism')}
            className={`px-3 py-1 rounded-md ${
              filter === 'baptism'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Baptism
          </button>
          <button
            onClick={() => setFilter('wedding')}
            className={`px-3 py-1 rounded-md ${
              filter === 'wedding'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Wedding
          </button>
          <button
            onClick={() => setFilter('funeral')}
            className={`px-3 py-1 rounded-md ${
              filter === 'funeral'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Funeral
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <div key={service.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="mr-4 p-3 bg-primary/10 text-primary rounded-full">
                  {getServiceTypeIcon(service.type)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold capitalize">
                        {service.type} Service
                      </h2>
                      <p className="text-gray-600">
                        For: <Link href={`/members/${service.member_id}`} className="text-primary hover:underline">
                          {service.member_name}
                        </Link>
                      </p>
                    </div>

                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(service.status)}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Requested Date</p>
                      <p>{new Date(service.requested_date).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Scheduled Date</p>
                      <p>{service.scheduled_date ? new Date(service.scheduled_date).toLocaleDateString() : 'Not scheduled'}</p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p>{service.assigned_to || 'Not assigned'}</p>
                    </div>

                    {service.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-700">{service.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link href={`/pastoral/${service.id}`} className="text-primary hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No pastoral services found matching the selected filter
            </div>
          )}
        </div>
      )}
    </div>
  );
}
