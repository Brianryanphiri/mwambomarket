import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/services/api';
import { Admin, AdminRegistrationData, AdminAuthResponse } from '@/types/admin.types';

interface AdminAuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  register: (data: AdminRegistrationData) => Promise<{ success: boolean; message: string }>;
  hasPermission: (permission: string) => boolean;
  updateAdmin: (data: Partial<Admin>) => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

// Define role-based permissions
const rolePermissions = {
  super_admin: ['*'], // Wildcard for all permissions
  admin: [
    'view_dashboard',
    'view_analytics',
    'manage_products',
    'view_orders',
    'manage_orders',
    'view_customers',
    'manage_customers',
    'manage_inventory',
    'manage_discounts',
    'view_settings'
  ],
  manager: [
    'view_dashboard',
    'view_products',
    'view_orders',
    'view_customers',
    'view_inventory',
    'view_reports'
  ],
  staff: [
    'view_dashboard',
    'view_products',
    'view_orders',
    'view_inventory'
  ]
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        await refreshAdmin();
      } else {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshAdmin = async () => {
    try {
      const response = await api.get('/admin/me');
      if (response.data.success) {
        setAdmin(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh admin:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await api.post<AdminAuthResponse>('/admin/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token, admin: adminData } = response.data;
        
        // Store token
        localStorage.setItem('adminToken', token);
        
        // Store in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        setAdmin(adminData);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: AdminRegistrationData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      // Format the data for the backend
      const adminData = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        role: data.role || 'staff',
        permissions: data.permissions || []
      };

      console.log('Sending registration data:', { ...adminData, password: '[REDACTED]' });

      const response = await api.post('/admin/register', adminData);
      
      console.log('Registration response:', response.data);
      
      return {
        success: true,
        message: response.data.message || 'Registration successful!'
      };
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const hasPermission = (permission: string): boolean => {
    if (!admin) return false;
    
    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;
    
    // Check custom permissions if they exist
    if (admin.permissions && admin.permissions.length > 0) {
      return admin.permissions.includes(permission);
    }
    
    // Fallback to role-based permissions
    const userPermissions = rolePermissions[admin.role as keyof typeof rolePermissions] || [];
    return userPermissions.includes(permission) || userPermissions.includes('*');
  };

  const updateAdmin = async (data: Partial<Admin>) => {
    try {
      const response = await api.put(`/admin/update/${admin?.id}`, data);
      if (response.data.success) {
        setAdmin(prev => prev ? { ...prev, ...response.data.admin } : null);
      }
    } catch (error) {
      console.error('Failed to update admin:', error);
      throw error;
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      admin,
      isAuthenticated: !!admin,
      isLoading,
      login,
      logout,
      register,
      hasPermission,
      updateAdmin,
      refreshAdmin
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};