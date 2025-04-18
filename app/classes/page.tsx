'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';

type Class = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  meeting_day: string;
  meeting_time: string;
  location: string;
  instructor_name: string;
  student_count: number;
  status: string;
  type: string;
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // In a real implementation, this would be an actual Supabase query
        // Example:
        // const supabase = getSupabaseClient();
        // const { data, error } = await supabase
        //   .from('classes')
        //   .select('*')
        //   .order('start_date', { ascending: false });

        // if (error) throw error;

        // Placeholder data
        const mockClasses: Class[] = [
          {
            id: '1',
            name: 'Bible Study: Book of Romans',
            description: 'An in-depth study of the Book of Romans',
            start_date: '2023-04-01',
            end_date: '2023-06-30',
            meeting_day: 'Monday',
            meeting_time: '19:00',
            location: 'Room 101',
            instructor_name: 'Pastor John Doe',
            student_count: 15,
            status: 'active',
            type: 'bible_study',
          },
          {
            id: '2',
            name: 'Pre-Marriage Counseling',
            description: 'Preparation for couples planning to get married',
            start_date: '2023-05-05',
            end_date: '2023-06-09',
            meeting_day: 'Saturday',
            meeting_time: '10:00',
            location: 'Counseling Room',
            instructor_name: 'Pastor Jane Smith',
            student_count: 6,
            status: 'active',
            type: 'counseling',
          },
          {
            id: '3',
            name: 'New Believers Class',
            description: 'Introduction to Christianity for new believers',
            start_date: '2023-03-15',
            end_date: '2023-04-19',
            meeting_day: 'Wednesday',
            meeting_time: '18:30',
            location: 'Room 102',
            instructor_name: 'Elder Michael Johnson',
            student_count: 8,
            status: 'completed',
            type: 'discipleship',
          },
        ];

        setClasses(mockClasses);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(cls => {
    if (filter === 'all') return true;
    if (filter === 'active' && cls.status === 'active') return true;
    if (filter === 'completed' && cls.status === 'completed') return true;
    if (filter === 'upcoming' && new Date(cls.start_date) > new Date()) return true;
    if (filter === cls.type) return true;
    return false;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Classes</h1>
        <Link href="/classes/add" className="btn-primary">
          Add New Class
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
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-md ${
              filter === 'active'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded-md ${
              filter === 'upcoming'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
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
            onClick={() => setFilter('bible_study')}
            className={`px-3 py-1 rounded-md ${
              filter === 'bible_study'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bible Study
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
            onClick={() => setFilter('discipleship')}
            className={`px-3 py-1 rounded-md ${
              filter === 'discipleship'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Discipleship
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{cls.name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  cls.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : cls.status === 'completed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                </span>
              </div>

              <p className="text-gray-600 mt-2">{cls.description}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{cls.meeting_day}s at {cls.meeting_time}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>{cls.location}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>{cls.instructor_name}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>{cls.student_count} students</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>
                    {new Date(cls.start_date).toLocaleDateString()} - {new Date(cls.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Link href={`/classes/${cls.id}`} className="text-primary hover:underline">
                  View Details
                </Link>
              </div>
            </div>
          ))}

          {filteredClasses.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No classes found matching the selected filter
            </div>
          )}
        </div>
      )}
    </div>
  );
}
