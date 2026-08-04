// Dummy Authentication Service
export const authService = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          if (password === 'wrongpassword') {
            reject(new Error('Invalid email or password.'));
          } else {
            resolve({
              user: {
                id: 'usr_123',
                name: 'Alex Chen',
                email: email,
                avatar: 'https://i.pravatar.cc/150?u=alex',
              },
              token: 'dummy-jwt-token-12345',
            });
          }
        } else {
          reject(new Error('Email and password are required.'));
        }
      }, 1500); // Simulate network latency
    });
  },

  signup: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password && userData.fullName) {
          resolve({
            user: {
              id: `usr_${Date.now()}`,
              name: userData.fullName,
              email: userData.email,
              avatar: `https://i.pravatar.cc/150?u=${userData.email}`,
            },
            token: 'dummy-jwt-token-newuser',
          });
        } else {
          reject(new Error('Please fill in all required fields.'));
        }
      }, 2000); // Simulate network latency
    });
  },
};
