"use client";
import { useState, useEffect } from "react";
import { IoMdClose, IoMdSend } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";

function ReplyModal({ isOpen, onClose, onSend, recipientEmail, subject }) {
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const handleSend = async () => {
        if (!replyText.trim()) {
            return;
        }

        setIsSending(true);

        const replyData = {
            to: recipientEmail,
            subject: subject,
            body: replyText,
            timestamp: new Date().toISOString()
        };

        setTimeout(() => {
            onSend(replyData);
            setReplyText("");
            setIsSending(false);
        }, 1000);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#f5f5f5] rounded-3xl border-black border-2 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center h-20 px-6 bg-[#f5f5f5] border-black border-b">
                    <div className="flex items-center gap-3">
                        <h2 className="font-alan font-bold text-xl">Reply</h2>
                        <span className="font-alan text-sm text-gray-600">to {recipientEmail}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                        aria-label="Close"
                    >
                        <IoMdClose className="text-2xl" />
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="mb-4">
                        <label className="block font-alan font-semibold text-sm mb-2">
                            Subject:
                        </label>
                        <input
                            type="text"
                            value={subject}
                            readOnly
                            className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-100 font-alan text-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-alan font-semibold text-sm mb-2">
                            To:
                        </label>
                        <div className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg bg-gray-100">
                            <FaUserCircle className="text-2xl text-gray-600" />
                            <span className="font-alan text-sm">{recipientEmail}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block font-alan font-semibold text-sm mb-2">
                            Message:
                        </label>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply here..."
                            className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-black transition-colors duration-200 font-alan text-base"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center px-6 py-4 bg-[#f5f5f5] border-black border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border-2 border-gray-400 rounded-lg font-alan font-semibold text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!replyText.trim() || isSending}
                        className={`px-6 py-2 border-2 border-black rounded-lg font-alan font-semibold flex items-center gap-2 transition-all duration-200 ${!replyText.trim() || isSending
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-black text-white hover:bg-gray-800"
                            }`}
                    >
                        {isSending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-white"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <IoMdSend className="text-lg" />
                                Send Reply
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReplyModal;