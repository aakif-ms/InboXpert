"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      fetchEmails();
    }
  }, [user, selectedProvider]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedProvider !== 'all') {
        params.append('provider', selectedProvider);
      }
      
      const response = await api.get(`/auth/fetch_emails?${params.toString()}`);
      console.log("Fetch Emails Response: ", response)
    
      if (response.data.status === 'success') {
        setEmails(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch emails');
      }
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError(err.response?.data?.message || 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (emailId) => {
    router.push(`/email/${emailId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  const getProviderBadge = (provider) => {
    const colors = {
      gmail: 'bg-red-100 text-red-800',
      outlook: 'bg-blue-100 text-blue-800',
      default: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[provider] || colors.default}`}>
        {provider || 'Unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading emails...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchEmails}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Your Emails</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="provider-filter" className="text-sm font-medium text-gray-700">
            Filter by:
          </label>
          <select
            id="provider-filter"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Providers</option>
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
          </select>
          <button
            onClick={fetchEmails}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {emails.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No emails found.</p>
          <p className="text-sm text-gray-400 mt-1">
            Make sure you have connected your email accounts and have emails in your inbox.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {emails.map((email) => (
              <li
                key={email.id}
                onClick={() => handleEmailClick(email.id)}
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${email.is_read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {email.sender_name || email.sender}
                        </p>
                        {getProviderBadge(email.provider)}
                      </div>
                      <div className="flex items-center space-x-2">
                        {email.has_attachments && (
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        )}
                        <p className="text-sm text-gray-500">
                          {formatDate(email.received_date)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className={`text-sm ${email.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {email.subject}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {email.body_preview || email.snippet}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmailList;