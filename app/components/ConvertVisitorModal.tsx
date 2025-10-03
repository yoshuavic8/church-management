import { useState, useEffect } from 'react';

interface ConvertVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitor: {
    id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
  } | null;
  meeting?: {
    cell_group?: {
      id: string;
      name: string;
      district_id?: string;
    };
    ministry?: {
      id: string;
      name: string;
    };
  };
  onConvert: (data: ConvertVisitorData) => Promise<void>;
}

export interface ConvertVisitorData {
  cell_group_id?: string;
  district_id?: string;
  baptism_date?: string;
  join_date?: string;
  additional_info?: string;
}

export default function ConvertVisitorModal({ 
  isOpen, 
  onClose, 
  visitor, 
  meeting,
  onConvert 
}: ConvertVisitorModalProps) {
  const [formData, setFormData] = useState<ConvertVisitorData>({
    join_date: new Date().toISOString().split('T')[0],
  });
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening modal
      setFormData({
        join_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitor) return;

    setIsConverting(true);
    try {
      // Use only the auto-assigned values, don't allow manual changes
      const convertData: ConvertVisitorData = {
        cell_group_id: meeting?.cell_group?.id,
        district_id: meeting?.cell_group?.district_id,
        join_date: formData.join_date,
        baptism_date: formData.baptism_date,
        additional_info: formData.additional_info,
      };
      
      await onConvert(convertData);
      
      // Reset form to initial state
      setFormData({
        join_date: new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (error) {
      console.error('Error converting visitor:', error);
      // Error handling is done in parent component
    } finally {
      setIsConverting(false);
    }
  };

  if (!isOpen || !visitor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Convert Visitor to Member
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isConverting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Converting visitor:</p>
          <p className="font-semibold text-gray-900">
            {visitor.first_name} {visitor.last_name}
          </p>
          {visitor.phone && <p className="text-sm text-gray-600">{visitor.phone}</p>}
          {visitor.email && <p className="text-sm text-gray-600">{visitor.email}</p>}
          
          {meeting?.cell_group && (
            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Auto-assigned from meeting:</p>
              <p className="text-sm text-blue-800">📍 Cell Group: {meeting.cell_group.name}</p>
              <p className="text-xs text-blue-600 mt-1">You can change the selection below if needed</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cell Group - Read Only Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cell Group Assignment
            </label>
            {meeting?.cell_group ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-800">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">{meeting.cell_group.name}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Auto-assigned from meeting attendance</p>
              </div>
            ) : (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                <span className="text-sm">No cell group (will be assigned later)</span>
              </div>
            )}
          </div>

          {/* District - Read Only Info */}
          {meeting?.cell_group?.district_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District Assignment
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 text-green-800">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Auto-assigned from cell group</span>
                </div>
                <p className="text-xs text-green-600 mt-1">District will be inherited from the cell group</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="join_date" className="block text-sm font-medium text-gray-700 mb-1">
              Join Date
            </label>
            <input
              type="date"
              id="join_date"
              name="join_date"
              value={formData.join_date || ''}
              onChange={(e) => setFormData({ ...formData, join_date: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            />
          </div>

          <div>
            <label htmlFor="baptism_date" className="block text-sm font-medium text-gray-700 mb-1">
              Baptism Date (Optional)
            </label>
            <input
              type="date"
              id="baptism_date"
              name="baptism_date"
              value={formData.baptism_date || ''}
              onChange={(e) => setFormData({ ...formData, baptism_date: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            />
          </div>

          <div>
            <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Information (Optional)
            </label>
            <textarea
              id="additional_info"
              name="additional_info"
              rows={3}
              value={formData.additional_info || ''}
              onChange={(e) => setFormData({ ...formData, additional_info: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes about this member..."
              disabled={isConverting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isConverting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isConverting}
            >
              {isConverting ? 'Converting...' : 'Convert to Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
