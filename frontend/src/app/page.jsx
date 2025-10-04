"use client";
import NavIcon from "@/components/NavIcon";
import EmailRow from "@/components/EmailRow";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import { IoMdRefresh } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineArchive } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import { useState, useEffect } from "react";
import emailsData from "./dummy.json";

export default function Dashboard() {
  const { user } = useAuth();
  const [emails, setEmails] = useState(emailsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.fetchEmails();
      if (response.status === 'success') {
        setEmails(response.data);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to fetch emails. Please connect your email account.');
      // Fallback to dummy data
      setEmails(emailsData);
    } finally {
      setLoading(false);
    }
  };

  const connectEmailAccount = async (provider) => {
    try {
      let response;
      if (provider === 'gmail') {
        response = await authAPI.connectGmail();
      } else if (provider === 'microsoft') {
        response = await authAPI.connectMicrosoft();
      }
      
      if (response.auth_url) {
        window.open(response.auth_url, '_blank');
      }
    } catch (error) {
      console.error(`Error connecting ${provider}:`, error);
      setError(`Failed to connect ${provider} account.`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black font-alan">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => connectEmailAccount('gmail')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Connect Gmail
            </button>
            <button
              onClick={() => connectEmailAccount('microsoft')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Connect Outlook
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            {error}
          </div>
        )}
        
        <div className="bg-white min-h-full rounded-xl flex flex-col border border-gray-200 flex-grow">
          <div className="flex justify-between items-center h-20 px-6 min-w-full bg-[#f5f5f5] rounded-t-xl border-b border-gray-300">
            <div className="flex justify-between w-1/5">
              <NavIcon 
                icon={<IoMdRefresh />} 
                onClick={fetchEmails}
                disabled={loading}
              />
              <NavIcon icon={<MdDeleteOutline />} />
              <NavIcon icon={<MdOutlineArchive />} />
              <NavIcon icon={<HiDotsVertical/>} />
            </div>
            
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading emails...</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {emails.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No emails found</p>
                  <button
                    onClick={fetchEmails}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>
            ) : (
              emails.map((email) => (
                <EmailRow key={email.id} email={email} />
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}