interface UserData {
    name: string;
    email: string;
    contact: string;
    password: string;
  }
  
  export const registerUser = async (userData: UserData) => {
    try {
      const response = await fetch('http://localhost:3001/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to register user');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  