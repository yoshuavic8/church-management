'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase';
import { hashPassword, generatePasswordFromDOB } from '../utils/passwordUtils';

type MemberFormProps = {
  initialData?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    gender?: string;
    marital_status?: string;
    join_date?: string;
    baptism_date?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    notes?: string;
    status?: string;
    visitor_id?: string; // For tracking conversion from visitor
  };
  mode: 'add' | 'edit';
};

export default function MemberForm({ initialData = {}, mode }: MemberFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: initialData.first_name || '',
    last_name: initialData.last_name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    date_of_birth: initialData.date_of_birth || '',
    gender: initialData.gender || '',
    marital_status: initialData.marital_status || '',
    join_date: initialData.join_date || new Date().toISOString().split('T')[0],
    baptism_date: initialData.baptism_date || '',
    emergency_contact_name: initialData.emergency_contact_name || '',
    emergency_contact_phone: initialData.emergency_contact_phone || '',
    notes: initialData.notes || '',
    status: initialData.status || 'active',
    is_baptized: initialData.baptism_date ? 'yes' : 'no', // Track baptism status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Special handling for baptism status
    if (name === 'is_baptized') {
      if (value === 'no') {
        // If not baptized, clear baptism date
        setFormData(prev => ({
          ...prev,
          [name]: value,
          baptism_date: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Create a copy of formData without the is_baptized field
      const { is_baptized, ...dataToSubmit } = formData;

      // If not baptized, ensure baptism_date is null
      if (is_baptized === 'no') {
        dataToSubmit.baptism_date = null;
      }

      // If this is a conversion from a visitor, we'll need to update the visitor record later
      const isConvertingVisitor = initialData.visitor_id ? true : false;

      if (mode === 'add') {
        // Validate email is provided for new members
        if (!formData.email) {
          throw new Error('Email is required to create a member account');
        }

        // Check if email already exists in auth system
        const { data: existingUsers, error: userCheckError } = await supabase
          .from('members')
          .select('email')
          .eq('email', formData.email);

        if (userCheckError) throw userCheckError;

        if (existingUsers && existingUsers.length > 0) {
          throw new Error('A member with this email already exists');
        }

        // Create a UUID for the new member
        const memberId = crypto.randomUUID();

        // Generate default password from date of birth
        const defaultPassword = generatePasswordFromDOB(formData.date_of_birth);

        // Hash the password
        const passwordHash = await hashPassword(defaultPassword);

        // Insert new member with the generated ID and password hash
        const { error } = await supabase
          .from('members')
          .insert([{
            id: memberId,
            ...dataToSubmit,
            password_hash: passwordHash,
            password_reset_required: true,
            last_password_change: new Date().toISOString()
          }]);

        if (error) throw error;

        // Log the default password for the admin to see
        console.log(`Default password for ${formData.first_name} ${formData.last_name}: ${defaultPassword}`);

        // Add password info to success message
        const passwordInfo = formData.date_of_birth
          ? `Default password is the date of birth in format DDMMYYYY.`
          : `Default password is "Welcome123".`;

        // No need to create auth user or send password reset email since we're using custom password auth

        // Set success message with password info
        setSuccess(`Member created successfully. ${passwordInfo} Member will be prompted to change password on first login.`);



        // If converting from visitor, update the visitor record
        if (isConvertingVisitor && initialData.visitor_id) {
          // Update the visitor record to mark as converted
          const { error: visitorError } = await supabase
            .from('attendance_visitors')
            .update({
              converted_to_member_id: memberId,
              converted_at: new Date().toISOString()
            })
            .eq('id', initialData.visitor_id);

          if (visitorError) {

            // Don't throw here, as the member was already created successfully
          }
        }
      } else {
        // Update existing member
        const { error } = await supabase
          .from('members')
          .update(dataToSubmit)
          .eq('id', initialData.id!);

        if (error) throw error;


      }

      // Show success message and delay redirect
      if (success) {
        setTimeout(() => {
          router.push('/members');
        }, 3000);
      } else {
        router.push('/members');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showPasswordInfo && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Member created successfully, but there was an issue sending the password reset email.</p>
          <p>Please use the "Reset Password" feature in the members list to send a password reset email manually.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            value={formData.first_name}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            value={formData.last_name}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email {mode === 'add' && '*'}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required={mode === 'add'}
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder={mode === 'add' ? 'Required for account creation' : ''}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="input-field"
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
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="marital_status" className="block text-sm font-medium text-gray-700 mb-1">
            Marital Status
          </label>
          <select
            id="marital_status"
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div>
          <label htmlFor="join_date" className="block text-sm font-medium text-gray-700 mb-1">
            Join Date *
          </label>
          <input
            id="join_date"
            name="join_date"
            type="date"
            required
            value={formData.join_date}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="is_baptized" className="block text-sm font-medium text-gray-700 mb-1">
            Baptism Status
          </label>
          <select
            id="is_baptized"
            name="is_baptized"
            value={formData.is_baptized}
            onChange={handleChange}
            className="input-field"
          >
            <option value="no">Not Baptized</option>
            <option value="yes">Baptized</option>
          </select>
        </div>

        <div>
          <label htmlFor="baptism_date" className="block text-sm font-medium text-gray-700 mb-1">
            Baptism Date
          </label>
          <input
            id="baptism_date"
            name="baptism_date"
            type="date"
            value={formData.baptism_date}
            onChange={handleChange}
            className="input-field"
            disabled={formData.is_baptized === 'no'}
          />
          {formData.is_baptized === 'no' && (
            <p className="text-xs text-gray-500 mt-1">Enable by selecting "Baptized" above</p>
          )}
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
            onChange={handleChange}
            className="input-field"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>

        <div>
          <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
            Emergency Contact Name
          </label>
          <input
            id="emergency_contact_name"
            name="emergency_contact_name"
            type="text"
            value={formData.emergency_contact_name}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Emergency Contact Phone
          </label>
          <input
            id="emergency_contact_phone"
            name="emergency_contact_phone"
            type="tel"
            value={formData.emergency_contact_phone}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="input-field"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : mode === 'add' ? 'Add Member' : 'Update Member'}
        </button>
      </div>
    </form>
  );
}
