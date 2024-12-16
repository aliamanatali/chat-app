import { User } from '../types/types';

const API_URL = 'http://localhost:3001/api/auth';

export const signUpUser = async ({ name, email, contact, password }: User): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, contact, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred during registration');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || 'An error occurred during registration');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const signInUser = async ({ email, password }: { email: string; password: string }): Promise<{ user: User; token: string }> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }
  
      return await response.json(); // Assuming the response contains the user and token
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'An error occurred during sign-in');
      }
      throw new Error('An unexpected error occurred');
    }
  };