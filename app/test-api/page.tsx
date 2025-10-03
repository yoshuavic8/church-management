'use client';

import { useEffect } from 'react';
import { apiClient } from '../lib/api-client';

export default function TestApiClientPage() {
  useEffect(() => {
    console.log('Testing apiClient...');
    console.log('apiClient:', apiClient);
    
    // Check if changePassword method exists
    console.log('changePassword method:', apiClient.changePassword);
    console.log('typeof changePassword:', typeof apiClient.changePassword);
    
    // List all methods
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient))
      .filter(name => typeof (apiClient as any)[name] === 'function');
    console.log('Available methods:', methods);
    
    // Try to call the method (this should work)
    if (typeof apiClient.changePassword === 'function') {
      console.log('✅ changePassword method is available!');
    } else {
      console.log('❌ changePassword method is NOT available!');
    }
  }, []);

  const testChangePassword = async () => {
    try {
      console.log('Testing changePassword call...');
      const result = await apiClient.changePassword('test', 'test');
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test API Client</h1>
      
      <button 
        onClick={testChangePassword}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test changePassword Method
      </button>
      
      <div className="mt-4">
        <p>Check the browser console for details.</p>
      </div>
    </div>
  );
}
