// jwtUtils.js

// Function to decode JWT token
export const decodeJWT = (token) => {
    try {
      if (!token) return null;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
  
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };
  
  // Function to save user data to localStorage
  export const saveUserData = (token) => {
    const payload = decodeJWT(token);
    
    if (payload) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify({
        id: payload.user_id || payload.sub,
        username: payload.username,
        email: payload.email,
        groups: payload.groups || []
      }));
    }
  };
  
  // Function to get user data from localStorage
  export const getUserData = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };
  
  // Function to check if user is authenticated
  export const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    const payload = decodeJWT(token);
    if (!payload) return false;
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  };
  
  // Function to check if user has specific group
  export const hasGroup = (groupName) => {
    const userData = getUserData();
    if (!userData || !userData.groups) return false;
    return userData.groups.includes(groupName);
  };
  
  // Function to clear user data
  export const clearUserData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };