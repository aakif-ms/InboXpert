"use client";
import EmailList from "@/components/EmailList";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [error, setError] = useState('');

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
      <div className="flex flex-col h-full space-y-6">
        <div className="flex justify-between items-center">
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
          <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex-grow">
          <EmailList />
        </div>
      </div>
    </ProtectedRoute>
  );
}