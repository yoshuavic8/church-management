'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';
import Layout from '../../../components/layout/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  occupation?: string;
  join_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  status: string;
  cell_group_id?: string;
  district_id?: string;
  cell_group?: {
    id: string;
    name: string;
  };
  district?: {
    id: string;
    name: string;
  };
  cell_group_memberships?: Array<{
    id: string;
    status: string;
    joined_date: string;
    cell_group: {
      id: string;
      name: string;
      district?: {
        id: string;
        name: string;
      };
    };
  }>;
};

type District = {
  id: string;
  name: string;
};

type CellGroup = {
  id: string;
  name: string;
  district_id: string;
};

function EditMemberContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [member, setMember] = useState<Member | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    occupation: '',
    join_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
    status: 'active',
    cell_group_id: '',
    district_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data concurrently
        const [memberResponse, districtsResponse, cellGroupsResponse] = await Promise.all([
          apiClient.getMember(id as string),
          apiClient.getDistricts(),
          apiClient.getCellGroups()
        ]);

        // Check member response
        if (!memberResponse.success || !memberResponse.data) {
          throw new Error(memberResponse.error?.message || 'Failed to fetch member');
        }
        
        const memberData = memberResponse.data;
        setMember(memberData);
        
        console.log('Member data received:', memberData);
        console.log('Cell group data (legacy):', memberData.cell_group);
        console.log('Cell group memberships (current):', memberData.cell_group_memberships);
        console.log('District data:', memberData.district);
        
        // Extract actual cell group and district from memberships
        const activeMembership = memberData.cell_group_memberships?.find(
          (membership: any) => membership.status === 'active'
        );
        const currentCellGroup = activeMembership?.cell_group;
        const currentDistrict = currentCellGroup?.district || memberData.district;
        
        // Load districts
        if (districtsResponse.success && districtsResponse.data) {
          setDistricts(districtsResponse.data);
          console.log('Districts loaded:', districtsResponse.data);
        }

        // Load cell groups
        if (cellGroupsResponse.success && cellGroupsResponse.data) {
          setCellGroups(cellGroupsResponse.data);
          console.log('Cell groups loaded:', cellGroupsResponse.data);
        }

        // Set form data AFTER all related data is loaded
        setFormData({
          first_name: memberData.first_name || '',
          last_name: memberData.last_name || '',
          email: memberData.email || '',
          phone: memberData.phone || '',
          address: memberData.address || '',
          date_of_birth: memberData.date_of_birth ? memberData.date_of_birth.split('T')[0] : '',
          gender: memberData.gender || '',
          marital_status: memberData.marital_status || '',
          occupation: memberData.occupation || '',
          join_date: memberData.join_date ? memberData.join_date.split('T')[0] : '',
          emergency_contact_name: memberData.emergency_contact_name || '',
          emergency_contact_phone: memberData.emergency_contact_phone || '',
          notes: memberData.notes || '',
          status: memberData.status || 'active',
          cell_group_id: currentCellGroup?.id || memberData.cell_group_id || '',
          district_id: currentDistrict?.id || memberData.district_id || '',
        });

        console.log('Form data set with:', {
          cell_group_id: currentCellGroup?.id || memberData.cell_group_id || '',
          district_id: currentDistrict?.id || memberData.district_id || '',
          currentCellGroupName: currentCellGroup?.name,
          currentDistrictName: currentDistrict?.name,
        });

        // Validate that the IDs exist in loaded data
        const finalDistrictId = currentDistrict?.id || memberData.district_id || '';
        const finalCellGroupId = currentCellGroup?.id || memberData.cell_group_id || '';
        
        if (finalDistrictId && districtsResponse.success && districtsResponse.data) {
          const districtExists = districtsResponse.data.find(d => d.id === finalDistrictId);
          console.log('District validation:', finalDistrictId, 'exists:', !!districtExists, 'name:', districtExists?.name);
        }
        
        if (finalCellGroupId && cellGroupsResponse.success && cellGroupsResponse.data) {
          const cellGroupExists = cellGroupsResponse.data.find(cg => cg.id === finalCellGroupId);
          console.log('Cell group validation:', finalCellGroupId, 'exists:', !!cellGroupExists, 'name:', cellGroupExists?.name);
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch member data');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !user) return;

    try {
      setSaving(true);
      setError(null);

      // Prepare data for API
      const updateData = {
        ...formData,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : null,
        join_date: formData.join_date ? new Date(formData.join_date).toISOString() : null,
        // Send cell group and district data separately for proper handling
        cell_group_id: formData.cell_group_id || null,
        district_id: formData.district_id || null,
      };

      // First update the member basic data
      const response = await apiClient.updateMember(member.id, updateData);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update member');
      }

      // Handle cell group membership update if cell group changed
      if (formData.cell_group_id) {
        // Find current active membership to compare
        const currentActiveMembership = member.cell_group_memberships?.find(m => m.status === 'ACTIVE');
        const currentCellGroupId = currentActiveMembership?.cell_group.id;
        
        // Only update cell group membership if it changed
        if (currentCellGroupId !== formData.cell_group_id) {
          console.log('Cell group changed, updating membership...');
          
          // Note: The actual cell group membership update should be handled by the API
          // when updating the member's cell_group_id field. This is just for logging.
          console.log(`Changed from cell group ${currentCellGroupId} to ${formData.cell_group_id}`);
        }
      }

      alert('Member updated successfully!');
      router.push(`/members/${member.id}`);
      
    } catch (error: any) {
      console.error('Error updating member:', error);
      setError(error.message || 'Failed to update member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading member data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error loading member</p>
        <p className="text-sm">{error}</p>
        <Link
          href="/members"
          className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Back to Members
        </Link>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Member not found</p>
        <Link
          href="/members"
          className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Member</h1>
          <p className="text-gray-600 mt-2">
            Update {member.first_name} {member.last_name}'s information
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Link
            href={`/members/${member.id}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="edit-member-form"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form id="edit-member-form" onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            
            <div>
              <label htmlFor="marital_status" className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                id="marital_status"
                name="marital_status"
                value={formData.marital_status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="join_date" className="block text-sm font-medium text-gray-700 mb-1">
                Join Date
              </label>
              <input
                type="date"
                id="join_date"
                name="join_date"
                value={formData.join_date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="district_id" className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <select
                id="district_id"
                name="district_id"
                value={formData.district_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                    {district.id === formData.district_id ? ' (Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cell_group_id" className="block text-sm font-medium text-gray-700 mb-1">
                Cell Group
              </label>
              <select
                id="cell_group_id"
                name="cell_group_id"
                value={formData.cell_group_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Cell Group</option>
                {cellGroups
                  .filter(cg => {
                    // Show all cell groups if no district is selected
                    if (!formData.district_id) return true;
                    // Show cell groups that match the selected district
                    if (cg.district_id === formData.district_id) return true;
                    // Also show the currently selected cell group even if it doesn't match district
                    // This prevents the current selection from disappearing
                    if (cg.id === formData.cell_group_id) return true;
                    return false;
                  })
                  .map((cellGroup) => (
                    <option key={cellGroup.id} value={cellGroup.id}>
                      {cellGroup.name}
                      {cellGroup.id === formData.cell_group_id ? ' (Current)' : ''}
                      {cellGroup.district_id && cellGroup.district_id !== formData.district_id ? ' (Different District)' : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Any additional notes about this member..."
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default function EditMemberPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <EditMemberContent />
      </Layout>
    </ProtectedRoute>
  );
}
