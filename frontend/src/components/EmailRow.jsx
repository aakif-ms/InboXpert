"use client";
import { useState } from "react";
import { MdAttachFile, MdCircle } from "react-icons/md";
import { SiGmail } from "react-icons/si";
import { HiOutlineMail } from "react-icons/hi";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";


function EmailRow({ email }) {
  const [isSelected, setIsSelected] = useState(false);

  const getProviderIcon = (provider) => {
    switch (provider.toLowerCase()) {
      case "gmail":
        return <SiGmail className="text-red-500" />;
      case "outlook":
        return <PiMicrosoftOutlookLogoFill className="text-blue-600" />;
      default:
        return <HiOutlineMail className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className={`flex items-center px-6 py-4 border-b border-gray-100  hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
        isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
      } ${!email.is_read ? "bg-blue-25 dark:bg-blue-950/10" : ""}`}
      onClick={() => setIsSelected(!isSelected)}>
      <div className="flex items-center mr-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            setIsSelected(e.target.checked);
          }}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
        />
      </div>

      <div className="flex items-center mr-3">
        {!email.is_read && (
          <MdCircle className="text-blue-600 text-xs" />
        )}
      </div>

      <div className="flex items-center mr-4">
        {getProviderIcon(email.email_provider)}
      </div>

      <div className="flex items-center mr-6 min-w-0 w-48">
        <span className={`truncate ${!email.is_read ? 'font-semibold' : 'font-normal'} text-gray-900`}>
          {email.sender_name}
        </span>
      </div>

      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center">
          <span className={`${!email.is_read ? 'font-semibold' : 'font-normal'} text-gray-900 dark:text-gray-100 mr-2`}>
            {email.subject}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm truncate">
            - {email.body_snippet}
          </span>
        </div>
      </div>

      <div className="flex items-center mr-4">
        {email.has_attachment && (
          <MdAttachFile className="text-gray-400 text-lg" />
        )}
      </div>

      <div className="flex items-center min-w-0 w-20">
        <span className={`text-sm ${!email.is_read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'} truncate`}>
          {formatDate(email.date_sent)}
        </span>
      </div>
    </div>
  );
}

export default EmailRow;