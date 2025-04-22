import React from 'react';

type VisitorsFormProps = {
  newVisitor: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    notes: string;
  };
  handleVisitorChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAddVisitor: () => void;
  handleRemoveVisitor: (index: number) => void;
  visitors: any[];
  saving: boolean;
  success: boolean;
};

export default function VisitorsForm({
  newVisitor,
  handleVisitorChange,
  handleAddVisitor,
  handleRemoveVisitor,
  visitors,
  saving,
  success
}: VisitorsFormProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">New Visitors</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="visitor_first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            id="visitor_first_name"
            name="first_name"
            type="text"
            value={newVisitor.first_name}
            onChange={handleVisitorChange}
            className="input-field"
            disabled={saving || success}
            placeholder="First name"
          />
        </div>

        <div>
          <label htmlFor="visitor_last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            id="visitor_last_name"
            name="last_name"
            type="text"
            value={newVisitor.last_name}
            onChange={handleVisitorChange}
            className="input-field"
            disabled={saving || success}
            placeholder="Last name"
          />
        </div>

        <div>
          <label htmlFor="visitor_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            id="visitor_phone"
            name="phone"
            type="tel"
            value={newVisitor.phone}
            onChange={handleVisitorChange}
            className="input-field"
            disabled={saving || success}
            placeholder="Phone number"
          />
        </div>

        <div>
          <label htmlFor="visitor_email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="visitor_email"
            name="email"
            type="email"
            value={newVisitor.email}
            onChange={handleVisitorChange}
            className="input-field"
            disabled={saving || success}
            placeholder="Email address"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="visitor_notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="visitor_notes"
            name="notes"
            value={newVisitor.notes}
            onChange={handleVisitorChange}
            className="input-field"
            disabled={saving || success}
            rows={2}
            placeholder="Any notes about this visitor"
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={handleAddVisitor}
            className="btn-secondary"
            disabled={!newVisitor.first_name || !newVisitor.last_name || saving || success}
          >
            Add Visitor
          </button>
        </div>
      </div>

      {visitors.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Added Visitors</h3>
          <div className="space-y-3">
            {visitors.map((visitor, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{visitor.first_name} {visitor.last_name}</p>
                  <p className="text-sm text-gray-600">
                    {visitor.phone && <span className="mr-3">{visitor.phone}</span>}
                    {visitor.email && <span>{visitor.email}</span>}
                  </p>
                  {visitor.notes && <p className="text-sm text-gray-500 mt-1">{visitor.notes}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVisitor(index)}
                  className="text-red-600 hover:text-red-800"
                  disabled={saving || success}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
