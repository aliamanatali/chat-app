export interface User {
    _id?: string;
    name: string;
    email: string;
    contact?: string;
    password?: string;
  }
  
export interface MessageProps {
    username: string;
    text: string;
  }

  export interface Conversation{
    user: UserDetails
    conversationId: string
    lastMessage?: string;
  }

  export interface UserDetails{
    _id: string;
    name: string;
    email: string;
    contact: string;
  }

  export interface Message {
    message: string;
    user: User;
    createdAt: string;
  }