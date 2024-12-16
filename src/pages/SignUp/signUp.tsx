import React, { useState } from 'react';
import { signUpUser } from '../../api/authApi';
import chatAppLogo from "../../assets/chat-app-logo.png";
import { User } from '../../types/types';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    contact: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await signUpUser(formData);
      console.log('User registered successfully:', data);
      navigate('/sign-in');
    } catch (error: any) {
      if (error.message === 'User already exists') {
        setErrorMessage('A user with this email already exists.');
      } else {
        setErrorMessage('An error occurred during registration. Please try again.');
      }
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="bg-[#8BABD8] w-full h-screen flex items-center justify-center">
      <div className="bg-white px-12 p-9 h-auto w-auto rounded-md">
        <div className="flex my-5 mt-6 items-center justify-center">
          <img src={chatAppLogo} alt="chat app logo" />
        </div>
        <form className="space-y-4 mb-10 w-80" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Contact Field */}
          <div>
            <input
              type="text"
              id="contact"
              name="contact"
              placeholder="Contact"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Error Message */}
          {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}

          <div className="mt-10">
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
