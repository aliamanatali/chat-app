import React, { useState } from "react";
import chatAppLogo from "../../assets/chat-app-logo.png";
import { useNavigate } from "react-router-dom";
import { signInUser } from "../../api/authApi";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await signInUser(formData);

      localStorage.setItem("jwt", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("User authenticated successfully:", data);
      navigate('/');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="bg-[#8BABD8] w-full h-screen flex items-center justify-center">
      <div className="bg-white px-12 p-9 h-auto w-auto rounded-md">
        <div className="flex my-5 mt-6 items-center justify-center">
          <img src={chatAppLogo} alt="chat app logo" />
        </div>
        <form className="space-y-4 mb-10 w-80" onSubmit={handleSubmit}>

          {/* Email Field */}
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
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
              onChange={handleChange}
            />
          </div>
          <div className="mt-10">
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
