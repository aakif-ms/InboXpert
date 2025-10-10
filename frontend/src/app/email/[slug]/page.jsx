"use client";
import EmailDetail from "@/components/EmailDetail";
import ProtectedRoute from "@/components/ProtectedRoute";

function EmailDetailPage({ params }) {
    const emailId = params.slug;

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-6">
                <EmailDetail emailId={emailId} />
            </div>
        </ProtectedRoute>
    );
}

export default EmailDetailPage;
