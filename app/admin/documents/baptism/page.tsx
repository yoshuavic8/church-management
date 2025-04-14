'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  baptism_date: string;
};

export default function BaptismCertificatePage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState('');
  const [baptismDate, setBaptismDate] = useState('');
  const [officiant, setOfficiant] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // In a real implementation, this would be an actual Supabase query
        // Example:
        // const supabase = getSupabaseClient();
        // const { data, error } = await supabase
        //   .from('members')
        //   .select('id, first_name, last_name, baptism_date')
        //   .order('last_name', { ascending: true });

        // if (error) throw error;

        // Placeholder data
        const mockMembers: Member[] = [
          {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            baptism_date: '2010-03-22',
          },
          {
            id: '2',
            first_name: 'Jane',
            last_name: 'Smith',
            baptism_date: '2015-06-15',
          },
          {
            id: '3',
            first_name: 'Michael',
            last_name: 'Johnson',
            baptism_date: '2022-11-05',
          },
        ];

        setMembers(mockMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    setSelectedMember(memberId);

    if (memberId) {
      const member = members.find(m => m.id === memberId);
      if (member && member.baptism_date) {
        setBaptismDate(member.baptism_date);
      }
    }
  };

  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember || !baptismDate || !officiant) {
      alert('Please fill in all required fields');
      return;
    }

    setGenerating(true);

    try {
      // In a real implementation, this would generate a PDF using jsPDF
      // and save a record in the database

      // Example:
      // const supabase = getSupabaseClient();
      // const { error } = await supabase
      //   .from('documents')
      //   .insert({
      //     type: 'baptism_certificate',
      //     member_id: selectedMember,
      //     generated_by: 'current_user_id',
      //     generated_date: new Date().toISOString(),
      //     data: {
      //       baptism_date: baptismDate,
      //       officiant: officiant
      //     }
      //   });

      // if (error) throw error;

      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert('Baptism certificate generated successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Generate Baptism Certificate</h1>

      <div className="card">
        <form onSubmit={handleGenerateCertificate} className="space-y-6">
          <div>
            <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">
              Select Member *
            </label>
            <select
              id="member"
              value={selectedMember}
              onChange={handleMemberChange}
              className="input-field"
              required
            >
              <option value="">Select a member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="baptism_date" className="block text-sm font-medium text-gray-700 mb-1">
              Baptism Date *
            </label>
            <input
              id="baptism_date"
              type="date"
              value={baptismDate}
              onChange={(e) => setBaptismDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="officiant" className="block text-sm font-medium text-gray-700 mb-1">
              Officiant (Pastor) *
            </label>
            <input
              id="officiant"
              type="text"
              value={officiant}
              onChange={(e) => setOfficiant(e.target.value)}
              className="input-field"
              placeholder="Pastor's name"
              required
            />
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
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Certificate'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <div className="border rounded-lg p-8 bg-white">
          {selectedMember ? (
            <div className="text-center">
              <h1 className="text-3xl font-serif mb-6">Certificate of Baptism</h1>
              <p className="text-lg mb-8">This certifies that</p>
              <p className="text-2xl font-bold mb-8">
                {members.find(m => m.id === selectedMember)?.first_name} {members.find(m => m.id === selectedMember)?.last_name}
              </p>
              <p className="text-lg mb-8">
                was baptized according to the ordinance of the Christian faith<br />
                on the {baptismDate ? new Date(baptismDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '_____'}<br />
                by {officiant || '_____'}
              </p>
              <div className="mt-16 flex justify-between">
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto"></div>
                  <p className="mt-2">Pastor's Signature</p>
                </div>
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto"></div>
                  <p className="mt-2">Church Seal</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Select a member to preview the certificate
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
