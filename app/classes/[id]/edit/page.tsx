"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/api-client";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import Layout from "../../../components/layout/Layout";
import ProtectedRoute from "../../../components/ProtectedRoute";

interface ClassTopic {
  id?: string;
  name: string;
  description: string;
  order: number;
  duration_minutes?: number;
}

interface ClassLevel {
  id?: string;
  name: string;
  description: string;
  order: number;
  prerequisite_level_id?: string;
  topics: ClassTopic[];
}

interface ClassSession {
  id?: string;
  title: string;
  description: string;
  order: number;
  duration_minutes?: number;
}

interface ClassFormData {
  name: string;
  description: string;
  category: string;
  has_levels: boolean;
  status: string;
  instructor: string;
  start_date: string;
  end_date: string;
  max_participants: number | "";
  schedule: string;
  location: string;
  requirements: string;
  materials: string;
  levels: ClassLevel[];
  sessions: ClassSession[];
}

export default function EditClassPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ClassFormData>({
    name: "",
    description: "",
    category: "Discipleship",
    has_levels: false,
    status: "draft",
    instructor: "",
    start_date: "",
    end_date: "",
    max_participants: "",
    schedule: "",
    location: "",
    requirements: "",
    materials: "",
    levels: [],
    sessions: [],
  });

  const classId = params.id as string;

  const categories = [
    "Discipleship",
    "Leadership",
    "Music",
    "Children",
    "Youth",
    "Adult",
    "Marriage",
    "Evangelism",
    "Biblical Studies",
    "Spiritual Growth",
    "Ministry Training",
  ];

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getClass(classId);

      if (response.success && response.data) {
        const classData = response.data;
        setFormData({
          name: classData.name || "",
          description: classData.description || "",
          category: classData.category || "Discipleship",
          has_levels: classData.has_levels || false,
          status: classData.status || "draft",
          instructor: classData.instructor || "",
          start_date: classData.start_date ? classData.start_date.split('T')[0] : "",
          end_date: classData.end_date ? classData.end_date.split('T')[0] : "",
          max_participants: classData.max_participants || "",
          schedule: classData.schedule || "",
          location: classData.location || "",
          requirements: classData.requirements || "",
          materials: classData.materials || "",
          levels: classData.levels ? classData.levels.map((level: any) => ({
            id: level.id,
            name: level.name,
            description: level.description || "",
            order: level.order_number || level.order,
            topics: level.topics ? level.topics.map((topic: any) => ({
              id: topic.id,
              name: topic.name,
              description: topic.description || "",
              order: topic.order,
              duration_minutes: topic.duration_minutes,
            })) : [],
          })) : [],
          sessions: classData.sessions ? classData.sessions.map((session: any) => ({
            id: session.id,
            title: session.title,
            description: session.description || "",
            order: session.order_number || session.order,
            duration_minutes: session.duration_minutes,
          })) : [],
        });
      } else {
        throw new Error("Failed to load class data");
      }
    } catch (error) {
      console.error("Error loading class:", error);
      alert("Failed to load class data");
      router.push("/classes");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Reset levels when switching from multi-level to single level
        // Reset sessions when switching from single level to multi-level
        ...(name === "has_levels" && !checked && { levels: [] }),
        ...(name === "has_levels" && checked && { sessions: [] }),
      }));
    } else if (name === "max_participants") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseInt(value) || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addLevel = () => {
    const newLevel: ClassLevel = {
      name: "",
      description: "",
      order: formData.levels.length + 1,
      topics: [],
    };
    setFormData((prev) => ({
      ...prev,
      levels: [...prev.levels, newLevel],
    }));
  };

  const removeLevel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index).map((level, i) => ({
        ...level,
        order: i + 1,
      })),
    }));
  };

  const updateLevel = (index: number, field: keyof ClassLevel, value: any) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.map((level, i) =>
        i === index ? { ...level, [field]: value } : level
      ),
    }));
  };

  const addTopic = (levelIndex: number) => {
    const newTopic: ClassTopic = {
      name: "",
      description: "",
      order: formData.levels[levelIndex].topics.length + 1,
      duration_minutes: 60,
    };
    
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.map((level, i) =>
        i === levelIndex
          ? { ...level, topics: [...level.topics, newTopic] }
          : level
      ),
    }));
  };

  const removeTopic = (levelIndex: number, topicIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.map((level, i) =>
        i === levelIndex
          ? {
              ...level,
              topics: level.topics
                .filter((_, j) => j !== topicIndex)
                .map((topic, j) => ({ ...topic, order: j + 1 })),
            }
          : level
      ),
    }));
  };

  const updateTopic = (
    levelIndex: number,
    topicIndex: number,
    field: keyof ClassTopic,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.map((level, i) =>
        i === levelIndex
          ? {
              ...level,
              topics: level.topics.map((topic, j) =>
                j === topicIndex ? { ...topic, [field]: value } : topic
              ),
            }
          : level
      ),
    }));
  };

  // Functions for managing sessions (single-level classes)
  const addSession = () => {
    const newSession: ClassSession = {
      title: "",
      description: "",
      order: formData.sessions.length + 1,
      duration_minutes: 60,
    };
    setFormData((prev) => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }));
  };

  const removeSession = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index).map((session, i) => ({
        ...session,
        order: i + 1,
      })),
    }));
  };

  const updateSession = (index: number, field: keyof ClassSession, value: any) => {
    setFormData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((session, i) =>
        i === index ? { ...session, [field]: value } : session
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert("Class name is required");
      return;
    }

    if (formData.has_levels) {
      if (formData.levels.length === 0) {
        alert("Please add at least one level for multi-level classes");
        return;
      }
      
      const invalidLevels = formData.levels.filter(level => !level.name.trim());
      if (invalidLevels.length > 0) {
        alert("All levels must have a name");
        return;
      }

      // Validate topics within levels
      for (let i = 0; i < formData.levels.length; i++) {
        const level = formData.levels[i];
        const invalidTopics = level.topics.filter(topic => !topic.name.trim());
        if (invalidTopics.length > 0) {
          alert(`All topics in ${level.name || `Level ${i + 1}`} must have a name`);
          return;
        }
      }
    } else {
      if (formData.sessions.length === 0) {
        alert("Please add at least one session/topic for single-level classes");
        return;
      }
      
      const invalidSessions = formData.sessions.filter(session => !session.title.trim());
      if (invalidSessions.length > 0) {
        alert("All sessions must have a title");
        return;
      }
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      alert("End date must be after start date");
      return;
    }

    try {
      setSaving(true);
      
      const dataToSubmit = {
        ...formData,
        max_participants: formData.max_participants === "" ? null : formData.max_participants,
        levels: formData.has_levels ? formData.levels : [],
        sessions: !formData.has_levels ? formData.sessions : [],
      };

      const response = await apiClient.updateClass(classId, dataToSubmit);

      if (response.success) {
        alert("Class updated successfully");
        router.push(`/classes/${classId}`);
      } else {
        const errorMessage = (response.error && typeof response.error === 'object' && 'message' in response.error) 
          ? response.error.message 
          : response.error || "Failed to update class";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating class:", error);
      alert("Failed to update class");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-md w-1/2 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link
                  href={`/classes/${classId}`}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
                  Edit Class
                </h1>
              </div>
              <p className="text-gray-600">
                Update class information and settings
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter class name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what this class is about"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Instructor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </label>
                  <input
                    type="text"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Every Sunday 10:00 AM - 11:30 AM"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Where will this class be held?"
                  />
                </div>
              </div>
            </div>

            {/* Class Structure */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Class Structure</h2>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_levels"
                    name="has_levels"
                    checked={formData.has_levels}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="has_levels" className="ml-2 text-sm text-gray-700">
                    Multi-level class
                  </label>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {formData.has_levels
                  ? "Multi-level class: Create levels (e.g., Basic, Intermediate, Advanced) and add specific topics/classes within each level."
                  : "Single-level class: All participants follow the same curriculum with topics/sessions in sequence."}
              </p>

              {!formData.has_levels && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-900">Class Sessions/Topics</h3>
                    <button
                      type="button"
                      onClick={addSession}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Session
                    </button>
                  </div>

                  {formData.sessions.map((session, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Session {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeSession(index)}
                          className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Session Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={session.title}
                            onChange={(e) => updateSession(index, "title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="e.g., Introduction to Biblical Studies, Prayer and Worship"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Session Description
                          </label>
                          <textarea
                            value={session.description}
                            onChange={(e) => updateSession(index, "description", e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Describe what will be covered in this session"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={session.duration_minutes || ""}
                            onChange={(e) => updateSession(index, "duration_minutes", parseInt(e.target.value) || 60)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="60"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.sessions.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
                      <p className="text-gray-500">No sessions added yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Click "Add Session" to create your first class session
                      </p>
                    </div>
                  )}
                </div>
              )}

              {formData.has_levels && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-900">Class Levels</h3>
                    <button
                      type="button"
                      onClick={addLevel}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Level
                    </button>
                  </div>

                  {formData.levels.map((level, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Level {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeLevel(index)}
                          className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Level Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={level.name}
                            onChange={(e) => updateLevel(index, "name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="e.g., Beginner, Intermediate, Advanced"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Level Description
                          </label>
                          <textarea
                            value={level.description}
                            onChange={(e) => updateLevel(index, "description", e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Describe what students will learn at this level"
                          />
                        </div>
                      </div>

                      {/* Topics/Classes within this level */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-700">
                            Topics/Classes in this Level
                          </h5>
                          <button
                            type="button"
                            onClick={() => addTopic(index)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center"
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            Add Topic
                          </button>
                        </div>

                        {level.topics.length > 0 ? (
                          <div className="space-y-3">
                            {level.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-600">
                                    Topic {topicIndex + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeTopic(index, topicIndex)}
                                    className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Topic Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={topic.name}
                                      onChange={(e) => updateTopic(index, topicIndex, "name", e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="e.g., Introduction to Prayer"
                                      required
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Duration (minutes)
                                    </label>
                                    <input
                                      type="number"
                                      value={topic.duration_minutes || ""}
                                      onChange={(e) => updateTopic(index, topicIndex, "duration_minutes", parseInt(e.target.value) || 60)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="60"
                                      min="1"
                                    />
                                  </div>
                                  
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Topic Description
                                    </label>
                                    <textarea
                                      value={topic.description}
                                      onChange={(e) => updateTopic(index, topicIndex, "description", e.target.value)}
                                      rows={2}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="What will be covered in this topic?"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-md bg-gray-50">
                            <p className="text-xs text-gray-500">No topics added yet</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Click "Add Topic" to create topics for this level
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {formData.levels.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
                      <p className="text-gray-500">No levels added yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Click "Add Level" to create your first class level
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What are the prerequisites or requirements for this class?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materials
                  </label>
                  <textarea
                    name="materials"
                    value={formData.materials}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What materials or resources will students need?"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href={`/classes/${classId}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Updating..." : "Update Class"}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
