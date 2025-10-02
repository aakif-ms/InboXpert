"use client";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import ButtonGroup from '@/components/ButtonGroup';
import ReplyModal from '@/components/ReplyModal';

function EmailDetailPage({ params }) {
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

    const handleButtonClick = (buttonLabel) => {
        switch (buttonLabel) {
            case 'Reply':
                setIsReplyModalOpen(true);
                break;
            case 'Summarize':
                // Handle summarize functionality
                console.log('Summarize clicked');
                break;
            case 'Delete':
                // Handle delete functionality
                console.log('Delete clicked');
                break;
            default:
                break;
        }
    };

    const handleCloseModal = () => {
        setIsReplyModalOpen(false);
    };

    const handleSendReply = (replyData) => {
        // Handle sending the reply
        console.log('Reply sent:', replyData);
        setIsReplyModalOpen(false);
        // You can add API call here to send the email
    };

    return (
        <>
            <div className="min-w-full min-h-full bg-[#f5f5f5] rounded-3xl border-black border-2">
                <div className="flex justify-between items-center h-20 px-6 min-w-full bg-[#f5f5f5] rounded-t-3xl border-black border-b">
                    <div className="flex justify-between w-1/5">
                        <ButtonGroup 
                            buttons={["Summarize", "Reply", "Delete"]} 
                            onButtonClick={handleButtonClick}
                        />
                    </div>
                </div>
                {/*DashBoard */}
                <div className='flex flex-col gap-7 overflow-y-auto px-6 py-5'>
                    {/*Sender Details */}
                    <div className='flex items-center gap-4'>
                        <FaUserCircle className="text-4xl" />
                        <div className="flex flex-col">
                            <h4 className="font-alan font-bold">Contact for "Web Design"</h4>
                            <p className="font-alan text-sm">aakif.msiddiqui@gmail.com</p>
                        </div>
                    </div>
                    {/*Message Body*/}
                    <div>
                        <p className="font-alan font-normal text-lg">Hello Dear Alexander,
                            <br />
                            <br />
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut rutrum mi. Aenean ac leo non justo suscipit consectetur. Nam vestibulum eleifend magna quis porta. ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut rutrum mi. Aenean ac leo
                            <br />
                            <br />
                            Praesent ut rutrum mi. Aenean ac leo non justo suscipit consectetur. Nam vestibulum eleifend magna quis porta.
                            <br />
                            <br />
                            Nullam tincidunt sodales diam, quis rhoncus dolor aliquet a. Nulla a rhoncus lectus. In nunc neque, pellentesque non massa ornare, accumsan ornare massa. odales diam, quis rhoncus dolor aliquet a. Nulla a rhoncus lectus. In nunc neque
                            <br />
                            <br />
                            Suspendisse semper vel turpis vitae aliquam. Aenean semper dui in consequat ullamcorper.
                            <br />
                            <br />
                            Nullam tincidunt sodales diam, quis rhoncus dolor aliquet a. Nulla a rhoncus lectus. In nunc neque, pellentesque non massa ornare, accumsan ornare massa. sodales diam, quis rhoncus dolor aliquet a. Nulla a rhoncus lectus. In nunc neque
                            <br />
                            <br />
                            Praesent ut rutrum mi. Aenean ac leo non justo suscipit consectetur. Nam vestibulum eleifend magna quis porta.</p>
                    </div>
                </div>
            </div>
            
            {/* Reply Modal */}
            <ReplyModal 
                isOpen={isReplyModalOpen}
                onClose={handleCloseModal}
                onSend={handleSendReply}
                recipientEmail="aakif.msiddiqui@gmail.com"
                subject="Re: Contact for 'Web Design'"
            />
        </>
    )
}

export default EmailDetailPage
