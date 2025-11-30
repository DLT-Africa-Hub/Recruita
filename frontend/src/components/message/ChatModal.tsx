import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { FiX } from 'react-icons/fi';
import { AiOutlineSend } from 'react-icons/ai';
import { GrAttachment } from 'react-icons/gr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApi } from '../../api/message';
import { useAuth } from '../../context/AuthContext';

interface Company {
  id?: string | number;
  name: string;
  role?: string;
  image?: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
  offerId?: string;
  applicationId?: string;
}

interface ChatModalProps {
  company: Company | null;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ company, onClose }) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

 
  const {
    data: messages,
    isLoading,
  } = useQuery({
    queryKey: ['conversation', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const response = await messageApi.getConversation(company.id as string);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!company?.id,
    refetchInterval: 3000, 
  });

 
  useEffect(() => {
    if (company?.id && messages && messages.length > 0) {
      const hasUnread = messages.some(
        (msg: Message) => 
          !msg.read && 
          msg.receiverId === (user?.id ) &&
          msg.senderId === company.id
      );
      
      if (hasUnread) {
        messageApi.markAsRead(company.id as string).then(() => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        });
      }
    }
  }, [company?.id, messages, user, queryClient]);

 
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!company?.id) throw new Error('No conversation selected');
      return await messageApi.sendMessage({
        receiverId: company.id as string,
        message: messageText,
        type: 'text',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', company?.id] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

 
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate(input.trim());
    setInput('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isMyMessage = (msg: Message) => {
    const myId = user?.id ;
    return msg.senderId === myId || msg.senderId.toString() === myId?.toString();
  };

  return (
    <div
      className="fixed inset-0 z-40 md:inset-auto lg:bottom-0 lg:right-0 md:w-[530px] md:h-[571px] font-inter md:rounded-[12px]"
      aria-modal="true"
      role="dialog"
    >
      {/* Mobile backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/40"
        onClick={onClose}
      ></div>

      <div className="relative h-full md:h-full md:border md:border-fade bg-white shadow-2xl md:shadow-lg md:rounded-[20px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start gap-[22px] px-4 py-3 w-full">
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-[22px]">
              <div className="w-[71px] aspect-square relative overflow-hidden rounded-full">
                {company?.image && (
                  <img
                    src={company.image}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-semibold text-[22px] text-[#1C1C1C]">
                  {company?.name}
                </p>
                {company?.role && (
                  <p className="text-[#1C1C1C80] text-[18px] font-medium">
                    {company?.role}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-[5px] py-2.5 px-5 border-2 border-[#5CFF0D] rounded-[20px] bg-[#EFFFE2]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#5CFF0D]"></span>
                <p className="text-[#5CFF0D] font-medium text-[14px]">online</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md hover:bg-[#00000006] p-1"
            aria-label="Close chat"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="w-full flex items-center justify-center mb-2">
          <p className="text-[14px] px-[20px] rounded-[20px] py-[10px] text-[#1C1C1C] bg-fade">
            Today
          </p>
        </div>

        {/* Messages area */}
        <div
          ref={messagesRef}
          className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-white to-[#fafafa]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#1C1C1C80]">Loading messages...</p>
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#1C1C1C80]">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg: Message) => {
              const isMine = isMyMessage(msg);
              return (
                <div
                  key={msg._id}
                  className={`max-w-[80%] ${isMine ? 'ml-auto text-left' : ''}`}
                >
                  <div
                    className={`inline-block px-3 py-2 text-[14px] font-medium rounded-lg break-words ${
                      isMine
                        ? 'bg-[#5CFF0D20] text-[#1C1C1C]'
                        : 'bg-fade text-[#1C1C1C]'
                    }`}
                  >
                    {msg.message}

                    {/* Display file attachment if present */}
                    {msg.fileUrl && msg.fileName && (
                      <div className="mt-2 pt-2 border-t border-[#00000020]">
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#0066CC] hover:underline"
                        >
                          <GrAttachment size={14} />
                          <span className="text-[13px]">{msg.fileName}</span>
                        </a>
                      </div>
                    )}

                    {/* Display offer badge if it's an offer message */}
                    {msg.type === 'offer' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-[#5CFF0D] text-white text-[11px] rounded-md font-semibold">
                        📄 Offer Letter
                      </div>
                    )}
                  </div>
                  <div className={`text-[11px] text-[#00000066] mt-1 ${isMine ? 'text-right' : ''}`}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSend}
          className="px-[20px] py-[28px] border-t-2 border-fade flex items-center gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message"
            className="flex-1 outline-none placeholder:text-[#1C1C1C80] bg-fade px-3 py-2 rounded-[20px] text-[14px]"
            disabled={sendMessageMutation.isPending}
          />

          <button
            type="button"
            className="p-2 rounded-full bg-fade cursor-pointer text-[#1C1C1C80] hover:bg-[#00000010] transition-colors"
            aria-label="Attach file"
          >
            <GrAttachment size={18} />
          </button>

          <button
            type="submit"
            className="p-2 rounded-full cursor-pointer bg-fade text-[#1C1C1C80] disabled:opacity-50 hover:bg-[#00000010] transition-colors"
            aria-label="Send message"
            disabled={sendMessageMutation.isPending || !input.trim()}
          >
            <AiOutlineSend size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;