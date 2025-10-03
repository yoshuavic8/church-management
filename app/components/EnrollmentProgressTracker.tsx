"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Users, Award, ChevronRight } from 'lucide-react';

interface SessionProgress {
    id: string;
    title: string;
    session_date: string;
    attended: boolean;
}

interface EnrollmentProgress {
    id: string;
    status: string;
    enrolled_at: string;
    member: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    level: {
        id: string;
        name: string;
        order_number: number;
    };
    class: {
        id: string;
        name: string;
        has_levels: boolean;
    };
    progress: {
        total_sessions: number;
        attended_sessions: number;
        attendance_rate: number;
        can_progress: boolean;
        session_details: SessionProgress[];
    };
}

interface ProgressTrackerProps {
    enrollmentId: string;
    onPromote?: (enrollmentId: string) => void;
}

export default function EnrollmentProgressTracker({ enrollmentId, onPromote }: ProgressTrackerProps) {
    const [progress, setProgress] = useState<EnrollmentProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [promoting, setPromoting] = useState(false);

    useEffect(() => {
        fetchProgress();
    }, [enrollmentId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/enrollments/${enrollmentId}/progress`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProgress(data.data);
            } else {
                setError('Failed to fetch enrollment progress');
            }
        } catch (err) {
            setError('Error loading progress data');
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async () => {
        if (!progress) return;

        setPromoting(true);
        try {
            const response = await fetch(`/api/enrollments/${enrollmentId}/promote`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notes: `Promoted based on ${progress.progress.attendance_rate}% attendance rate`
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (onPromote) {
                    onPromote(enrollmentId);
                }
                // Refresh progress data
                fetchProgress();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to promote member');
            }
        } catch (err) {
            setError('Error promoting member');
        } finally {
            setPromoting(false);
        }
    };

    const getProgressColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600 bg-green-100';
        if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'enrolled':
                return <Clock className="w-5 h-5 text-blue-600" />;
            case 'dropped':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !progress) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>{error || 'Progress data not available'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Progress Tracker
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {progress.member.first_name} {progress.member.last_name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(progress.status)}
                        <span className="text-sm font-medium capitalize">
                            {progress.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Class and Level Info */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Users className="w-4 h-4" />
                        <span>{progress.class.name}</span>
                        {progress.class.has_levels && progress.level && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span>{progress.level.name}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Attendance Overview */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Attendance Overview</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(progress.progress.attendance_rate)}`}>
                            {progress.progress.attendance_rate}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                            className={`h-3 rounded-full transition-all ${
                                progress.progress.attendance_rate >= 80 ? 'bg-green-500' :
                                progress.progress.attendance_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${progress.progress.attendance_rate}%` }}
                        ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {progress.progress.attended_sessions}
                            </div>
                            <div className="text-gray-600">Sessions Attended</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-700">
                                {progress.progress.total_sessions}
                            </div>
                            <div className="text-gray-600">Total Sessions</div>
                        </div>
                    </div>
                </div>

                {/* Session Details */}
                {progress.progress.session_details.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-medium mb-3">Session Details</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {progress.progress.session_details.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                >
                                    <div>
                                        <div className="font-medium text-sm">
                                            {session.title}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(session.session_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {session.attended ? (
                                            <span className="flex items-center gap-1 text-green-600 text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                                Present
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600 text-sm">
                                                <XCircle className="w-4 h-4" />
                                                Absent
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Promotion Section */}
                {progress.class.has_levels && progress.progress.can_progress && progress.status === 'enrolled' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Award className="w-6 h-6 text-green-600" />
                                <div>
                                    <div className="font-medium text-green-800">
                                        Ready for Promotion!
                                    </div>
                                    <div className="text-sm text-green-600">
                                        Member meets the requirements to advance to the next level
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handlePromote}
                                disabled={promoting}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {promoting ? 'Promoting...' : 'Promote'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Cannot Progress Message */}
                {progress.class.has_levels && !progress.progress.can_progress && progress.status === 'enrolled' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                            <div>
                                <div className="font-medium text-yellow-800">
                                    Attendance Requirement Not Met
                                </div>
                                <div className="text-sm text-yellow-600">
                                    Member needs at least 80% attendance to progress to the next level
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
