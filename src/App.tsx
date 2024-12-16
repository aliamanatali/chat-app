import React, { ReactNode } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './pages/SignUp/signUp';
import SignIn from './pages/SignIn/signIn';
import Chat from './pages/Chat/chat';

// Protected Route Component
type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('jwt');
  return token ? <>{children}</> : <Navigate to="/sign-in" />;
};

type RedirectIfAuthenticatedProps = {
  children: ReactNode; // ReactNode type for children
};


const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps) => {
  const token = localStorage.getItem('jwt');
  return token ? <Navigate to="/" /> : <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="sign-up" 
          element={
            <RedirectIfAuthenticated>
              <SignUp />
            </RedirectIfAuthenticated>
          } 
        />
        <Route 
          path="sign-in" 
          element={
            <RedirectIfAuthenticated>
              <SignIn />
            </RedirectIfAuthenticated>
          } 
        />

        {/* Protected Routes */}
        <Route 
          index 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
