"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, UserPlus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { debounce } from 'lodash';

interface Member {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    cell_group?: {
        id: string;
        name: string;
    };
    district?: {
        id: string;
        name: string;
    };
}

interface ClassLevel {
    id: string;
    name: string;
    order_number: number;
}

interface BatchEnrollmentProps {
    classId: string;
    levels?: ClassLevel[];
    hasLevels: boolean;
    onEnrollmentComplete?: (result: any) => void;
    onClose: () => void;
}

export default function BatchEnrollmentModal({
    classId,
    levels = [],
    hasLevels,
    onEnrollmentComplete,
    onClose
}: BatchEnrollmentProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Set default level for multi-level classes
    useEffect(() => {
        if (hasLevels && levels.length > 0 && !selectedLevel) {
            const firstLevel = levels.sort((a, b) => a.order_number - b.order_number)[0];
            setSelectedLevel(firstLevel.id);
        }
    }, [levels, hasLevels, selectedLevel]);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (query.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    `/api/classes/${classId}/search-members?q=${encodeURIComponent(query)}&exclude_enrolled=true&limit=20`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.data);
                } else {
                    setError('Failed to search members');
                }
            } catch (err) {
                setError('Error searching members');
            } finally {
                setIsSearching(false);
            }
        }, 300),
        [classId]
    );

    useEffect(() => {
        debouncedSearch(searchQuery);
    }, [searchQuery, debouncedSearch]);

    const handleSelectMember = (member: Member) => {
        if (!selectedMembers.find(m => m.id === member.id)) {
            setSelectedMembers([...selectedMembers, member]);
            // Remove from search results to avoid confusion
            setSearchResults(results => results.filter(m => m.id !== member.id));
        }
    };

    const handleRemoveMember = (memberId: string) => {
        setSelectedMembers(members => members.filter(m => m.id !== memberId));
    };

    const handleBatchEnroll = async () => {
        if (selectedMembers.length === 0) {
            setError('Please select at least one member to enroll');
            return;
        }

        if (hasLevels && !selectedLevel) {
            setError('Please select a level for enrollment');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const payload: any = {
                member_ids: selectedMembers.map(m => m.id)
            };

            if (hasLevels && selectedLevel) {
                payload.level_id = selectedLevel;
            }

            const response = await fetch(`/api/classes/${classId}/batch-enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                setSuccess(`Successfully enrolled ${result.data.enrolled_count} members!`);
                
                if (onEnrollmentComplete) {
                    onEnrollmentComplete(result.data);
                }

                // Clear selections
                setSelectedMembers([]);
                setSearchQuery('');
                setSearchResults([]);

                // Auto close after success
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to enroll members');
            }
        } catch (err) {
            setError('Error enrolling members');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-99999 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <UserPlus className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold">Batch Enrollment</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Level Selection for Multi-level Classes */}
                    {hasLevels && levels.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Level
                            </label>
                            <select
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {levels
                                    .sort((a, b) => a.order_number - b.order_number)
                                    .map((level) => (
                                        <option key={level.id} value={level.id}>
                                            {level.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {/* Member Search */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Members
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="mt-3 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                                {searchResults.map((member) => (
                                    <div
                                        key={member.id}
                                        onClick={() => handleSelectMember(member)}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">
                                                    {member.first_name} {member.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {member.email}
                                                    {member.cell_group && (
                                                        <span> • {member.cell_group.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button className="text-blue-600 hover:text-blue-700">
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isSearching && (
                            <div className="mt-3 text-center text-gray-500">
                                Searching members...
                            </div>
                        )}
                    </div>

                    {/* Selected Members */}
                    {selectedMembers.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-5 h-5 text-green-600" />
                                <h3 className="font-medium">
                                    Selected Members ({selectedMembers.length})
                                </h3>
                            </div>
                            <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                                {selectedMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="p-3 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {member.first_name} {member.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {member.email}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            {success}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBatchEnroll}
                            disabled={selectedMembers.length === 0 || isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Enrolling...' : `Enroll ${selectedMembers.length} Member${selectedMembers.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
