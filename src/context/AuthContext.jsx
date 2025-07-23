import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing user on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('careercompass_user');
        const storedToken = localStorage.getItem('careercompass_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          // Simulate token validation
          if (isValidToken(storedToken)) {
            setUser(userData);
          } else {
            // Token expired, clear storage
            localStorage.removeItem('careercompass_user');
            localStorage.removeItem('careercompass_token');
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Simulate token validation (in real app, this would verify JWT)
  const isValidToken = (token) => {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  // Generate a mock JWT token
  const generateToken = (userData) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock_signature');
    return `${header}.${payload}.${signature}`;
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check credentials (simulated)
      const users = JSON.parse(localStorage.getItem('careercompass_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        // Check for default admin credentials
        if (email === 'admin@careercompass.com' && password === 'admin123') {
          const adminUser = {
            id: 'admin_1',
            email: 'admin@careercompass.com',
            name: 'Admin User',
            role: 'admin',
            createdAt: new Date().toISOString()
          };
          
          const token = generateToken(adminUser);
          localStorage.setItem('careercompass_user', JSON.stringify(adminUser));
          localStorage.setItem('careercompass_token', token);
          setUser(adminUser);
          return { success: true, user: adminUser };
        }
        
        throw new Error('Invalid email or password');
      }

      // Generate token and store user
      const token = generateToken(user);
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      localStorage.setItem('careercompass_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('careercompass_token', token);
      setUser(userWithoutPassword);
      
      return { success: true, user: userWithoutPassword };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { email, password, name } = userData;
      
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('careercompass_users') || '[]');
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password, // In real app, this would be hashed
        name,
        role: 'user', // Default role
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('careercompass_users', JSON.stringify(users));

      return { success: true, message: 'Registration successful! Please login.' };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('careercompass_user');
    localStorage.removeItem('careercompass_token');
    setUser(null);
    setError(null);
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = JSON.parse(localStorage.getItem('careercompass_users') || '[]');
      const user = users.find(u => u.email === email);

      if (!user && email !== 'admin@careercompass.com') {
        throw new Error('No account found with this email address');
      }

      // In a real app, this would send an email
      return { success: true, message: 'Password reset instructions sent to your email' };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
