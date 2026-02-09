import React from 'react';

const ChatBubble = ({ role, content }) => {
    const isUser = role === 'user';
    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-lg ${isUser
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-gray-700 text-gray-100 rounded-tl-sm'
                    }`}
            >
                {content}
            </div>
        </div>
    );
};

export default ChatBubble;
