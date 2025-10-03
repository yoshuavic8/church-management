'use client';

import { getFileUrl, getApiUrl, getApiBaseUrl } from '../utils/fileUtils';

export default function FileUrlTester() {
  // Test various URL scenarios
  const testUrls = [
    '/uploads/images/test.jpg',
    'uploads/images/test.jpg',
    'http://external-site.com/image.jpg',
    'https://example.com/photo.png'
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-bold mb-3">File URL Testing</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>API Base URL:</strong> {getApiBaseUrl()}</div>
        <div><strong>API URL:</strong> {getApiUrl()}</div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold mb-2">URL Conversions:</h4>
        {testUrls.map((url, index) => (
          <div key={index} className="text-xs bg-white p-2 rounded mb-1">
            <div><strong>Input:</strong> {url}</div>
            <div><strong>Output:</strong> {getFileUrl(url)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
