'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Administration</h1>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>
      
      {activeTab === 'documents' && (
        <div>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Generate Documents</h2>
            <p className="text-gray-600 mb-6">
              Generate official church documents for members. Select a document type below.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link 
                href="/admin/documents/baptism"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                </svg>
                <h3 className="font-medium">Baptism Certificate</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate baptism certificates for members
                </p>
              </Link>
              
              <Link 
                href="/admin/documents/child-dedication"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <h3 className="font-medium">Child Dedication</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate child dedication certificates
                </p>
              </Link>
              
              <Link 
                href="/admin/documents/marriage"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <h3 className="font-medium">Marriage Certificate</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate marriage certificates
                </p>
              </Link>
              
              <Link 
                href="/admin/documents/membership"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <h3 className="font-medium">Membership Certificate</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate church membership certificates
                </p>
              </Link>
              
              <Link 
                href="/admin/documents/recommendation"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <h3 className="font-medium">Recommendation Letter</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate recommendation letters for members
                </p>
              </Link>
              
              <Link 
                href="/admin/documents/custom"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <h3 className="font-medium">Custom Document</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create a custom document or letter
                </p>
              </Link>
            </div>
          </div>
          
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated By</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4">Baptism Certificate</td>
                    <td className="py-3 px-4">John Doe</td>
                    <td className="py-3 px-4">Pastor Jane Smith</td>
                    <td className="py-3 px-4">Apr 10, 2023</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline">Download</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Membership Certificate</td>
                    <td className="py-3 px-4">Jane Smith</td>
                    <td className="py-3 px-4">Pastor John Doe</td>
                    <td className="py-3 px-4">Apr 8, 2023</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline">Download</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Marriage Certificate</td>
                    <td className="py-3 px-4">Michael & Sarah Johnson</td>
                    <td className="py-3 px-4">Pastor Jane Smith</td>
                    <td className="py-3 px-4">Apr 5, 2023</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline">Download</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600 mb-6">
            Manage user accounts and permissions for the church management system.
          </p>
          
          <div className="flex justify-end mb-4">
            <button className="btn-primary">Add New User</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4">John Doe</td>
                  <td className="py-3 px-4">john.doe@example.com</td>
                  <td className="py-3 px-4">Admin</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary hover:underline mr-2">Edit</button>
                    <button className="text-red-600 hover:underline">Deactivate</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Jane Smith</td>
                  <td className="py-3 px-4">jane.smith@example.com</td>
                  <td className="py-3 px-4">Pastor</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary hover:underline mr-2">Edit</button>
                    <button className="text-red-600 hover:underline">Deactivate</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Michael Johnson</td>
                  <td className="py-3 px-4">michael.j@example.com</td>
                  <td className="py-3 px-4">Staff</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary hover:underline mr-2">Edit</button>
                    <button className="text-red-600 hover:underline">Deactivate</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <p className="text-gray-600 mb-6">
            Configure system settings for the church management application.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Church Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="church_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Church Name
                  </label>
                  <input
                    id="church_name"
                    type="text"
                    className="input-field"
                    defaultValue="Grace Community Church"
                  />
                </div>
                
                <div>
                  <label htmlFor="church_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="church_email"
                    type="email"
                    className="input-field"
                    defaultValue="info@gracechurch.org"
                  />
                </div>
                
                <div>
                  <label htmlFor="church_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="church_phone"
                    type="tel"
                    className="input-field"
                    defaultValue="123-456-7890"
                  />
                </div>
                
                <div>
                  <label htmlFor="church_website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    id="church_website"
                    type="url"
                    className="input-field"
                    defaultValue="https://gracechurch.org"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="church_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    id="church_address"
                    type="text"
                    className="input-field"
                    defaultValue="123 Main St, City, State 12345"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">System Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="email_notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-700">
                    Enable email notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="sms_notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="sms_notifications" className="ml-2 block text-sm text-gray-700">
                    Enable SMS notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="auto_backup"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="auto_backup" className="ml-2 block text-sm text-gray-700">
                    Enable automatic daily backups
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="btn-primary">Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
