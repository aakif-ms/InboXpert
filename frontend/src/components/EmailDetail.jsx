"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const EmailDetail = ({ emailId }) => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (emailId && user?.email) {
      fetchEmailDetail();
    }
  }, [emailId, user]);

  const fetchEmailDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/auth/email/${emailId}`);
      
      if (response.data.status === 'success') {
        setEmail(response.data.email);
      } else {
        setError(response.data.message || 'Failed to fetch email details');
      }
    } catch (err) {
      console.error('Error fetching email details:', err);
      setError(err.response?.data?.message || 'Failed to fetch email details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
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

  const handleReply = () => {
    setShowReplyModal(true);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading email...</span>
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
            <div className="mt-4 space-x-2">
              <button
                onClick={fetchEmailDetail}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
              <button
                onClick={handleBack}
                className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Email not found.</p>
        <button
          onClick={handleBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-150"
        >
          <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inbox
        </button>
        <div className="flex items-center space-x-2">
          {getProviderBadge(email.provider)}
          {email.has_attachments && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded-full">
              📎 Attachments
            </span>
          )}
        </div>
      </div>

      {/* Email content */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Email header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {email.subject}
              </h1>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">From:</span>
                  <span className="ml-2">
                    {email.sender_name ? `${email.sender_name} <${email.sender}>` : email.sender}
                  </span>
                </div>
                {email.to_recipients && email.to_recipients.length > 0 && (
                  <div className="flex items-start text-sm text-gray-600">
                    <span className="font-medium">To:</span>
                    <span className="ml-2">
                      {email.to_recipients.join(', ')}
                    </span>
                  </div>
                )}
                {email.cc_recipients && email.cc_recipients.length > 0 && (
                  <div className="flex items-start text-sm text-gray-600">
                    <span className="font-medium">CC:</span>
                    <span className="ml-2">
                      {email.cc_recipients.join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{formatDate(email.received_date)}</span>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${email.is_read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
              <span className="text-sm text-gray-500">
                {email.is_read ? 'Read' : 'Unread'}
              </span>
            </div>
          </div>
        </div>

        {/* Email body */}
        <div className="px-6 py-6">
          {email.body ? (
            <div 
              className="prose max-w-none text-gray-900 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          ) : (
            <div className="text-gray-500 italic">
              No content available
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReply}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reply
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Forward
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Mark as {email.is_read ? 'Unread' : 'Read'}
            </button>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reply to Email</h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">To:</label>
                  <input
                    type="text"
                    value={email.sender}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject:</label>
                  <input
                    type="text"
                    value={`Re: ${email.subject}`}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message:</label>
                  <textarea
                    rows={8}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your reply here..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDetail;