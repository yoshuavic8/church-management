'use client';

import { useState } from 'react';
import { Member } from '../contexts/AuthContext';

type MemberTokenManagerProps = {
  member: Member;
};

export default function MemberTokenManager({ member }: MemberTokenManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [daysValid, setDaysValid] = useState(30);
  const [showToken, setShowToken] = useState(false);

  const generateToken = async () => {
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const response = await fetch('/api/auth/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: member.id,
          days_valid: daysValid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate token');
      }

      setToken(data.token);
      setShowToken(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the token');
    } finally {
      setLoading(false);
    }
  };

  const invalidateTokens = async () => {
    if (!confirm('Are you sure you want to invalidate all tokens for this member? They will need a new token to log in.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/invalidate-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: member.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invalidate tokens');
      }

      setToken(null);
      setShowToken(false);
      alert('All tokens for this member have been invalidated');
    } catch (err: any) {
      setError(err.message || 'An error occurred while invalidating tokens');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      alert('Token copied to clipboard');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Member Access Token</h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="daysValid" className="block text-sm font-medium text-gray-700">
          Token Valid For (Days)
        </label>
        <select
          id="daysValid"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          value={daysValid}
          onChange={(e) => setDaysValid(parseInt(e.target.value))}
          disabled={loading}
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
          <option value={180}>180 days</option>
          <option value={365}>365 days</option>
        </select>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={generateToken}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {loading ? 'Generating...' : 'Generate New Token'}
        </button>
        <button
          onClick={invalidateTokens}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Invalidate All Tokens
        </button>
      </div>

      {token && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
          <div className="flex items-center">
            <div className="flex-grow bg-gray-100 p-2 rounded-md font-mono text-sm overflow-x-auto">
              {showToken ? token : '••••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </div>
            <button
              onClick={() => setShowToken(!showToken)}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              title={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? '👁️' : '👁️‍🗨️'}
            </button>
            <button
              onClick={copyToClipboard}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            This token will be valid for {daysValid} days. Share it securely with the member.
          </p>
        </div>
      )}
    </div>
  );
}
