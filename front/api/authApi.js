// front/api/authApi.js
class AuthApi {
  static async login(credentials) {
    try {
      // Simular llamada API - reemplazar con fetch real después
      const response = await this.mockLogin(credentials);
      
      if (response.success) {
        return {
          success: true,
          user: response.user,
          token: response.token
        };
      } else {
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  static async register(userData) {
    try {
      // Simular llamada API - reemplazar con fetch real después
      const response = await this.mockRegister(userData);
      
      if (response.success) {
        return {
          success: true,
          user: response.user,
          token: response.token
        };
      } else {
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Mock para simular login - reemplazar con implementación real
  static async mockLogin(credentials) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Usuarios mock - en producción esto vendrá del backend
    const mockUsers = [
      {
        id: 1,
        name: 'Bruno',
        email: 'bruno@example.com',
        password: 'password123',
        createdAt: '2024-01-01',
        role: 'user'
      },
      {
        id: 2,
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        createdAt: '2024-01-01',
        role: 'admin'
      }
    ];

    const user = mockUsers.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      // Simular token JWT
      const token = `mock-jwt-token-${user.id}-${Date.now()}`;
      
      // No enviar la contraseña en la respuesta
      const { password, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword,
        token: token
      };
    } else {
      return {
        success: false,
        message: 'Credenciales incorrectas'
      };
    }
  }

  // Mock para simular registro - reemplazar con implementación real
  static async mockRegister(userData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar si el usuario ya existe
    const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const userExists = existingUsers.some(u => u.email === userData.email);
    
    if (userExists) {
      return {
        success: false,
        message: 'El usuario ya existe'
      };
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString(),
      role: 'user'
    };

    // Guardar en "base de datos" local (solo para mock)
    existingUsers.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(existingUsers));

    // Generar token
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    
    // No enviar la contraseña en la respuesta
    const { password, ...userWithoutPassword } = newUser;

    return {
      success: true,
      user: userWithoutPassword,
      token: token
    };
  }

  // Para futura implementación con backend real
  static async realLogin(credentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    return await response.json();
  }

  static async realRegister(userData) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    return await response.json();
  }
}