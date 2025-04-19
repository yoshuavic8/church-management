'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [latestNews, setLatestNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!user) return;

      try {
        const supabase = getSupabaseClient();

        // Use user from auth context
        setMemberData(user);

        // Get cell group details if user has a cell group
        if (user.cell_group_id) {
          const { data: cellGroupData, error: cellGroupError } = await supabase
            .from('cell_groups')
            .select('id, name')
            .eq('id', user.cell_group_id)
            .single();

          if (!cellGroupError && cellGroupData) {
            setMemberData(prev => ({
              ...prev,
              cell_group: cellGroupData
            }));
          }
        }

        // Get attendance statistics
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_participants')
          .select(`
            status,
            meeting:meeting_id (
              meeting_date
            )
          `)
          .eq('member_id', user.id)
          .order('id', { ascending: false });

        if (attendanceError) throw attendanceError;

        if (attendanceData && attendanceData.length > 0) {
          const total = attendanceData.length;
          const present = attendanceData.filter(a => a.status === 'present').length;
          const absent = attendanceData.filter(a => a.status === 'absent').length;
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

          setAttendanceStats({
            total,
            present,
            absent,
            percentage
          });
        }

        // Get upcoming meetings
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('attendance_meetings')
          .select(`
            id,
            meeting_date,
            meeting_type,
            topic,
            event_category,
            cell_group:cell_group_id (name),
            ministry:ministry_id (name)
          `)
          .order('id', { ascending: false })
          .limit(3);

        if (upcomingError) throw upcomingError;

        setUpcomingMeetings(upcomingData || []);

        // Get latest news
        const { data: newsData, error: newsError } = await supabase
          .from('articles')
          .select('id, title, summary, image_url, published_at, category')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);

        if (newsError) throw newsError;

        setLatestNews(newsData || []);

      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMemberData();
    }
  }, [user]);

  const getContextName = (meeting: any) => {
    if (meeting.event_category === 'cell_group' && meeting.cell_group) {
      return meeting.cell_group.name;
    } else if (meeting.event_category === 'ministry' && meeting.ministry) {
      return meeting.ministry.name;
    } else {
      return meeting.event_category.replace('_', ' ');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {memberData?.first_name} {memberData?.last_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your church community
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/self-checkin"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              Quick Check-in
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Member QR Code */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your QR Code</h2>
          <div className="flex flex-col items-center">
            <QRCodeGenerator
              value={memberData?.id}
              size={180}
              level="H"
              className="mb-3"
            />
            <p className="text-sm text-gray-500 text-center mb-2">Use this for quick attendance</p>
            <button
              onClick={() => window.print()}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print QR Code
            </button>
          </div>
        </div>

        {/* Attendance Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Statistics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-500">Attendance Rate</span>
                <span className="text-sm font-medium text-gray-900">{attendanceStats.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${attendanceStats.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{attendanceStats.total}</p>
                <p className="text-xs text-gray-500">Total Meetings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                <p className="text-xs text-gray-500">Present</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                <p className="text-xs text-gray-500">Absent</p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/member/attendance"
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                View Full Attendance History →
              </Link>
            </div>
          </div>
        </div>

        {/* Cell Group Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Cell Group</h2>
          {memberData?.cell_group ? (
            <div>
              <p className="text-xl font-semibold text-gray-900 mb-2">{memberData.cell_group.name}</p>
              <Link
                href="/member/cell-group"
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                View Cell Group Details →
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">You are not assigned to any cell group yet.</p>
              <p className="text-sm text-gray-400">Please contact your church administrator.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Meetings</h2>
        {upcomingMeetings.length > 0 ? (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getContextName(meeting)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {meeting.topic || meeting.meeting_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(meeting.meeting_date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No upcoming meetings scheduled.</p>
          </div>
        )}
      </div>

      {/* Latest News */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Latest News & Updates</h2>
          <Link
            href="/member/news"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            View All →
          </Link>
        </div>

        {latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg overflow-hidden">
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
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-primary bg-primary-light rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(article.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">{article.title}</h3>
                  {article.summary && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{article.summary}</p>
                  )}
                  <Link
                    href={`/member/news/${article.id}`}
                    className="text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No news articles available.</p>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
