export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  permissions?: string[];
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AdminRegistrationData {
  name: string;
  email: string;
  password: string;
  role?: 'super_admin' | 'admin' | 'manager' | 'staff';
  permissions?: string[];
  department?: string;
  position?: string;
  employeeId?: string;
  phone?: string;
}

export interface AdminAuthResponse {
  token: string;
  admin: Admin;
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  group: string;
}