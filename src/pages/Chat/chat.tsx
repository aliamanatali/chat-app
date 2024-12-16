import React, { useEffect, useRef, useState } from "react";
import chatAppLogo from "../../assets/chat-app-logo.png";
import { CiPaperplane } from "react-icons/ci";
import { Conversation, Message, User } from "../../types/types";
import { io, Socket } from "socket.io-client";

const Chat = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modal, setModal] = useState(false);
  const [user] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reciever, setReciever] = useState<User>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  const [conversationId, setConversationId] = useState("");
  const [messageInput, setMessageInput] = useState<string>("");
  const [searchModalTerm, setSearchModalTerm] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<
    { socketId: String; userId: String }[]
  >([]);

  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket?.emit("addUser", user?._id);
    socket?.on("getUsers", (users) => {
      setActiveUsers(users);
    });
    socket?.on("getMessage", (data) => {
      console.log("data bhai data:", data);
      if (user && data) {
        setMessages((prev) => [
          ...prev,
          { message: data.message, user: data.user, createdAt: data.createdAt },
        ]);
      }
    });

    socket?.on("newConversation", (data) => {
      console.log("New conversation created:", data);

      setConversations((prevConversations) => [
        ...prevConversations,
        { conversationId: data.conversationId, user: data.user },
      ]);
    });

  }, [socket]);

  const inputRef = useRef<HTMLInputElement>(null);
  const sendMessage = async () => {
    if (!messageInput || !user || !conversationId || !reciever?._id) {
      console.error("Missing required fields for sending a message");
      return;
    }

    try {
      socket?.emit("sendMessage", {
        conversationId,
        senderId: user._id,
        message: messageInput,
        receiverId: reciever._id,
      });

      const res = await fetch("http://localhost:3001/api/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          senderId: user._id,
          message: messageInput,
          receiverId: reciever._id,
        }),
      });
      if (inputRef.current) {
        inputRef.current.focus(); // Refocus input field
      }
      setMessageInput("");

      const resData: Message = await res.json();
      console.log("resData", resData);

      setMessages((prevMessages) => [...prevMessages, resData]);

    } catch (error) {
      console.error(
        "Error sending message:",
        error instanceof Error ? error.message : error
      );
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchModalTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchModalTerm.toLowerCase())
  );

  const handleModal = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/user/getUsers", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch Users: ${res.status}`);
      }
      const resData: User[] = await res.json();
      setUsers(resData);
      setModal(true);
    } catch (error) {
      console.error("Error fetching Users:", error);
    }
  };

  const closeModal = () => setModal(false);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(
          `http://localhost:3001/api/conversation/get/${user._id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch conversations: ${res.status}`);
        }

        const resData: Conversation[] = await res.json();

        const updatedConversations = await Promise.all(
          resData.map(async (conversation) => {
            const messageRes = await fetch(
              `http://localhost:3001/api/message/get/last/${conversation.conversationId}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );

            const lastMessage = messageRes.ok ? await messageRes.json() : null;

            return {
              ...conversation,
              lastMessage: lastMessage?.message || "No messages yet",
            };
          })
        );

        setConversations(updatedConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  const getInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length > 1) {
      return words[0][0] + words[1][0];
    }
    return name.slice(0, 2).toUpperCase();
  };
useEffect(()=>{
  const filteredConversations = conversations.filter((conv) =>
    conv.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  setFilteredConversations(filteredConversations);
},[conversations, searchTerm])


  const fetchMessages = async (conversationId: string, user: User) => {
    try {
      if (!conversationId) {
        console.log("No conversation Id");
        return;
      }
      setMessageInput("");
      const res = await fetch(
        `http://localhost:3001/api/message/get/${conversationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.status}`);
      }
      setReciever(user);
      const resData: Message[] = await res.json();
      setMessages(resData);
      setConversationId(conversationId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const messagesContainer = document.querySelector(".messages-container");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleUserClick = async (selectedUser: User) => {
    if (selectedUser._id === user?._id) return;

    try {
      const res = await fetch("http://localhost:3001/api/conversation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user?._id,
          recieverId: selectedUser._id,
        }),
      });
      setReciever(selectedUser);
      if (!res.ok) {
        throw new Error(`Failed to create conversation: ${res.status}`);
      }

      const newConversation: Conversation = await res.json();

      setConversations((prevConversations) => [
        newConversation,
        ...prevConversations,
      ]);
      setModal(false);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Conversations List */}
      <div className="w-1/4 border-gray-300 border pt-1 p-5">
        <img src={chatAppLogo} alt="chat app logo" className="my-2" />
        <div className="flex items-center justify-center py-4 gap-2">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Users"
            className="block w-full p-2 bg-gray-100 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            className="p-4 rounded-full flex items-center text-gray-400 justify-center w-3 h-3 bg-gray-100"
            onClick={handleModal}
          >
            +
          </button>
        </div>

        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const isActive = activeUsers.some(
              (user) => user.userId === conv.user._id
            );

            return (
              <div
                className="flex p-2 pl-0 cursor-pointer"
                key={conv.conversationId}
                onClick={() => fetchMessages(conv?.conversationId, conv?.user)}
              >
                <div className="relative">
                  <div className="border border-primary p-3 bg-gray-400 text-white rounded-full flex items-center justify-center w-12 h-12">
                    {getInitials(conv.user.name)}
                  </div>

                  {/* Conditionally render the green box */}
                  {isActive && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="ml-4">
                  <h3 className="text-lg font-medium">{conv.user.name}</h3>
                  <p className="text-sm font-light text-gray-500">
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 mt-4">No contacts found.</p>
        )}
      </div>

      {/* Center Section - Chat */}
      <div
        className={`w-${
          showSidebar ? "1/2" : "full"
        } bg-slate-100 transition-all duration-300`}
      >
        {/* Display receiver details if available, else show a welcome message */}
        {reciever ? (
          <div
            className="flex p-2 bg-white items-center justify-start border-b border-gray-300"
            onClick={() => setShowSidebar(true)}
          >
            <div className="border border-primary p-3 bg-gray-400 text-white rounded-full flex items-center justify-center w-12 h-12">
              {getInitials(reciever?.name || "AR")}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium">{reciever?.name}</h3>
            </div>
          </div>
        ) : (
          <div className="text-center text-lg font-semibold mt-24">
            Welcome to Chat App
          </div>
        )}

        {/* Messages Container */}
        {reciever && (
          <div className="h-[80%] p-8 border w-full overflow-scroll messages-container">
            {messages.length > 0 ? (
              messages.map(({ message, user: sender, createdAt }, index) => (
                <div
                  key={`message-${index}`}
                  className={`max-w-[40%] rounded-xl p-3 mb-4 relative ${
                    sender?._id === user?._id
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-white"
                  }`}
                >
                  <div>{message}</div>
                  <div className="absolute bottom-2 right-2 text-xs text-black">
                    {new Date(createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-lg font-semibold mt-24">
                No Messages
              </div>
            )}
          </div>
        )}

        {/* Input and Send Message */}
        {reciever && (
          <div className="flex items-center w-full max-w-xl mx-auto p-2 bg-white rounded-full my-4 shadow-sm">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Send Message"
              className="flex-grow bg-transparent border-none outline-none p-2 rounded-full text-sm"
            />
            <div className="ml-2">
              <button type="button" onClick={sendMessage}>
                <CiPaperplane
                  size={24}
                  className="text-blue-500 cursor-pointer"
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white rounded-lg shadow-lg w-2/3 max-h-[80%] overflow-y-auto p-4">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-gray-400"
      >
        X
      </button>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by Contact No or Email"
          value={searchModalTerm}
          onChange={(e) => setSearchModalTerm(e.target.value)}
          className="p-2 border rounded-md w-full"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Search
        </button>
      </div>
      <div className="mt-4">
      {filteredUsers.length > 0 ? (
    filteredUsers
      .filter((user) => {
        // If there are no conversations, show all users
        if (conversations.length === 0) return true;

        // Otherwise, exclude users who already have a conversation
        return !conversations?.some(
          (conv) =>
            conv?.user?._id === user?._id || conv?.user?._id === user?._id
        );
      })
      .filter(
        (user) =>
          // Search logic based on contact or email
          (user.contact?.includes(searchModalTerm) ||
            user.email?.toLowerCase().includes(searchModalTerm.toLowerCase()))
      )
      .map((user) => (
        <div
          className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
          key={user._id}
          onClick={() => handleUserClick(user)}
        >
          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white">
            {getInitials(user.name)}
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-medium">{user.name}</h4>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ))
  ) : (
    <p className="text-gray-500">No users found.</p>
  )}
      </div>
    </div>
  </div>
)}
      {/* Right Section - Details */}
      {/* Right Section - Details */}
      {showSidebar && (
        <div className="relative flex flex-col items-center justify-start w-1/4 bg-white p-5 border border-primary">
          {/* Cross Button on Top Left */}
          <button
            type="button"
            className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowSidebar(false)}
          >
            X
          </button>
          {/* Add any sidebar details here */}
          <div className="border border-primary p-3 my-4 mx-auto text-3xl bg-gray-400 text-white rounded-full flex items-center justify-center w-32 h-32">
            {getInitials(reciever?.name || "")}
          </div>
          <div className="text-sm text-center text-slate-500">
            <p>Name: {reciever?.name}</p>
            <p>Email: {reciever?.email}</p>
            {/* Add more details as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
