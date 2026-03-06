// src/pages/admin/AdminRegister.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Eye, EyeOff, AlertCircle,
  CheckCircle, Shield, UserPlus, ArrowLeft,
  Briefcase, Smartphone, Building, Phone,
  Globe, MapPin, Calendar, Clock, Award,
  Users, Key, Bell, Settings, Server,
  ChevronRight, ChevronLeft, Store,
  CreditCard, Package, ShoppingCart, Truck,
  BarChart3, FileText, HelpCircle,
  Moon, Sun, Laptop, Database, XCircle,
  Check, Copy, Edit, Trash2, Plus,
  Upload, Download, Printer, Search,
  Filter, Grid, List, Star, Heart,
  TrendingUp, TrendingDown, DollarSign,
  Percent, Gift, Tag, ShoppingBag,
  Headphones, MessageCircle, MailOpen,
  AlertTriangle, Info, HelpCircle as Help
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import heroImage from '@/assets/hero-grocery.jpg';

interface AdminRegistrationForm {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  
  // Account Security
  password: string;
  confirmPassword: string;
  
  // Professional Information
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  department: string;
  position: string;
  employeeId: string;
  
  // Permissions
  permissions: string[];
  
  // Additional Information
  address?: string;
  city?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Preferences
  language: string;
  timezone: string;
  notificationPreferences: string[];
}

interface PasswordStrength {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const AdminRegister = () => {
  const navigate = useNavigate();
  const { register } = useAdminAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [registrationStep, setRegistrationStep] = useState(1);
  const totalSteps = 4;
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Terms acceptance
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  
  // Dark mode
  const [darkMode, setDarkMode] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<AdminRegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternativePhone: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    department: '',
    position: '',
    employeeId: '',
    permissions: [],
    address: '',
    city: '',
    emergencyContact: '',
    emergencyPhone: '',
    language: 'en',
    timezone: 'Africa/Blantyre',
    notificationPreferences: ['email', 'sms']
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Available roles
  const roles = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access with user management', icon: Shield },
    { value: 'admin', label: 'Admin', description: 'Full access to all features except user management', icon: Award },
    { value: 'manager', label: 'Manager', description: 'Can manage products, orders, and inventory', icon: Briefcase },
    { value: 'staff', label: 'Staff', description: 'Limited access based on permissions', icon: User }
  ];

  // Available departments
  const departments = [
    'Administration',
    'Sales',
    'Inventory Management',
    'Customer Service',
    'Marketing',
    'IT',
    'Finance',
    'Human Resources',
    'Operations',
    'Logistics'
  ];

  // Available permissions (simplified for compact view)
  const permissionGroups = [
    {
      name: 'Products',
      permissions: [
        { id: 'view_products', label: 'View' },
        { id: 'create_products', label: 'Create' },
        { id: 'edit_products', label: 'Edit' },
        { id: 'delete_products', label: 'Delete' }
      ]
    },
    {
      name: 'Orders',
      permissions: [
        { id: 'view_orders', label: 'View' },
        { id: 'process_orders', label: 'Process' },
        { id: 'cancel_orders', label: 'Cancel' },
        { id: 'refund_orders', label: 'Refund' }
      ]
    },
    {
      name: 'Inventory',
      permissions: [
        { id: 'view_inventory', label: 'View' },
        { id: 'update_stock', label: 'Update' },
        { id: 'manage_suppliers', label: 'Suppliers' },
        { id: 'stock_alerts', label: 'Alerts' }
      ]
    },
    {
      name: 'Customers',
      permissions: [
        { id: 'view_customers', label: 'View' },
        { id: 'manage_customers', label: 'Manage' },
        { id: 'customer_support', label: 'Support' }
      ]
    }
  ];

  // Languages
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ny', label: 'Chichewa' },
    { value: 'fr', label: 'French' }
  ];

  // Timezones (simplified)
  const timezones = [
    'Africa/Blantyre',
    'Africa/Lusaka',
    'Africa/Harare',
    'Africa/Johannesburg'
  ];

  // Notification preferences
  const notificationOptions = [
    { id: 'email', label: 'Email' },
    { id: 'sms', label: 'SMS' },
    { id: 'push', label: 'Push' }
  ];

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle permission toggle
  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Handle permission group toggle
  const handlePermissionGroupToggle = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every(p => formData.permissions.includes(p));
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !groupPermissions.includes(p))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...groupPermissions])]
      }));
    }
  };

  // Handle notification preference toggle
  const handleNotificationToggle = (prefId: string) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: prev.notificationPreferences.includes(prefId)
        ? prev.notificationPreferences.filter(p => p !== prefId)
        : [...prev.notificationPreferences, prefId]
    }));
  };

  // Navigation between steps
  const nextStep = () => {
    if (registrationStep < totalSteps) {
      setRegistrationStep(registrationStep + 1);
      
      // Update tab based on step
      if (registrationStep === 1) setActiveTab('security');
      else if (registrationStep === 2) setActiveTab('permissions');
      else if (registrationStep === 3) setActiveTab('preferences');
    }
  };

  const prevStep = () => {
    if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1);
      
      // Update tab based on step
      if (registrationStep === 2) setActiveTab('personal');
      else if (registrationStep === 3) setActiveTab('security');
      else if (registrationStep === 4) setActiveTab('permissions');
    }
  };

  // Validate current step (simplified)
  const validateStep = (): boolean => {
    if (registrationStep === 1) {
      if (!formData.firstName || formData.firstName.length < 2) {
        setError('First name must be at least 2 characters');
        return false;
      }
      if (!formData.lastName || formData.lastName.length < 2) {
        setError('Last name must be at least 2 characters');
        return false;
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.phone || formData.phone.length < 10) {
        setError('Please enter a valid phone number');
        return false;
      }
      if (!formData.employeeId) {
        setError('Employee ID is required');
        return false;
      }
    } else if (registrationStep === 2) {
      if (!formData.password) {
        setError('Password is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    } else if (registrationStep === 4) {
      if (!acceptTerms || !acceptPrivacy) {
        setError('You must accept the terms and privacy policy');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  // Handle next button click
  const handleNext = () => {
    if (validateStep()) {
      nextStep();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateStep()) {
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData);
      
      if (response.success) {
        setSuccess('Admin account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  // Get password strength score
  const getPasswordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };

  const passwordScore = getPasswordStrengthScore();
  const passwordStrengthColor = 
    passwordScore <= 2 ? 'bg-red-500' :
    passwordScore <= 3 ? 'bg-yellow-500' :
    passwordScore <= 4 ? 'bg-blue-500' : 'bg-green-500';
  
  const passwordStrengthText = 
    passwordScore <= 2 ? 'Weak' :
    passwordScore <= 3 ? 'Fair' :
    passwordScore <= 4 ? 'Good' : 'Strong';

  // Calculate progress percentage
  const progressPercentage = (registrationStep / totalSteps) * 100;

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      darkMode ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Fresh groceries" 
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-950/95 via-gray-900/95 to-gray-950/95' 
            : 'bg-gradient-to-br from-white/95 via-white/90 to-white/95'
        }`} />
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
      >
        {darkMode ? (
          <Sun className="w-4 h-4 text-yellow-400" />
        ) : (
          <Moon className="w-4 h-4 text-gray-700" />
        )}
      </button>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Store className={`w-4 h-4 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Mwambo Store Admin Portal
              </span>
            </div>
            
            <h1 className={`text-2xl md:text-3xl font-display font-bold mt-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Create Admin Account
            </h1>
            
            <p className={`text-sm max-w-xl mx-auto ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Join the team that's revolutionizing grocery delivery in Malawi
            </p>
          </div>

          {/* Main Content - Compact Grid */}
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Left Side - Quick Stats (Compact) */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className={`p-4 rounded-2xl backdrop-blur-md border ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-gray-200'
              }`}>
                <h3 className={`text-lg font-display font-bold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Quick Stats
                </h3>

                <div className="space-y-2">
                  {[
                    { icon: Users, label: 'Active Admins', value: '24' },
                    { icon: ShoppingCart, label: 'Today\'s Orders', value: '156' },
                    { icon: Package, label: 'Products', value: '1,234' },
                    { icon: TrendingUp, label: 'Growth', value: '+23%' }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3 h-3 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Separator className={`my-3 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />

                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-white/5' : 'bg-gray-100'
                }`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold">Already have an account?</span>
                  </p>
                  <Link to="/admin/login" className="block mt-1">
                    <Button variant="link" className={`p-0 h-auto text-xs ${
                      darkMode ? 'text-orange-400' : 'text-orange-600'
                    }`}>
                      Sign in →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form (Compact) */}
            <div className="lg:col-span-3">
              <div className={`rounded-2xl backdrop-blur-md border overflow-hidden ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-gray-200'
              }`}>
                {/* Form Header - Compact */}
                <div className={`p-4 border-b ${
                  darkMode ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                      }`}>
                        <UserPlus className={`w-4 h-4 ${
                          darkMode ? 'text-orange-400' : 'text-orange-600'
                        }`} />
                      </div>
                      <div>
                        <h2 className={`text-base font-display font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Registration
                        </h2>
                        <p className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Fill in your details
                        </p>
                      </div>
                    </div>

                    {/* Step indicator - Compact */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            step === registrationStep
                              ? 'w-4 bg-orange-500'
                              : step < registrationStep
                              ? 'bg-green-500'
                              : darkMode ? 'bg-white/20' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar - Compact */}
                  <div className="mt-3">
                    <Progress 
                      value={progressPercentage} 
                      className={`h-1 ${
                        darkMode ? 'bg-white/10' : 'bg-gray-200'
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Step {registrationStep}/{totalSteps}
                      </span>
                      <span className={`text-[10px] font-medium ${
                        darkMode ? 'text-orange-400' : 'text-orange-600'
                      }`}>
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alerts - Compact */}
                <div className="p-4 space-y-2">
                  {error && (
                    <Alert variant="destructive" className="py-2 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-500 text-white border-none py-2 text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Form Content - Compact with Tabs */}
                <div className="px-4 pb-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className={`grid grid-cols-4 gap-1 p-1 rounded-lg mb-4 ${
                      darkMode ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      {[
                        { value: 'personal', icon: User, label: 'Personal' },
                        { value: 'security', icon: Lock, label: 'Security' },
                        { value: 'permissions', icon: Key, label: 'Access' },
                        { value: 'preferences', icon: Settings, label: 'Settings' }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            disabled={
                              (tab.value === 'security' && registrationStep < 2) ||
                              (tab.value === 'permissions' && registrationStep < 3) ||
                              (tab.value === 'preferences' && registrationStep < 4)
                            }
                            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs py-1"
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{tab.label}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    <form onSubmit={handleSubmit}>
                      {/* Personal Information Tab - Compact */}
                      <TabsContent value="personal" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>First Name *</Label>
                            <div className="relative">
                              <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                name="firstName"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className={`pl-7 h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Last Name *</Label>
                            <div className="relative">
                              <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                name="lastName"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className={`pl-7 h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-span-2 space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Email *</Label>
                            <div className="relative">
                              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                name="email"
                                type="email"
                                placeholder="john@mwambo.store"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`pl-7 h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Phone *</Label>
                            <div className="relative">
                              <Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                name="phone"
                                placeholder="0999123456"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`pl-7 h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Employee ID *</Label>
                            <div className="relative">
                              <Briefcase className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                name="employeeId"
                                placeholder="EMP-001"
                                value={formData.employeeId}
                                onChange={handleInputChange}
                                className={`pl-7 h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Department</Label>
                            <Select 
                              value={formData.department}
                              onValueChange={(value) => handleSelectChange('department', value)}
                            >
                              <SelectTrigger className={`h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.slice(0, 5).map(dept => (
                                  <SelectItem key={dept} value={dept} className="text-sm">{dept}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Role</Label>
                            <Select 
                              value={formData.role}
                              onValueChange={(value: any) => handleSelectChange('role', value)}
                            >
                              <SelectTrigger className={`h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map(role => (
                                  <SelectItem key={role.value} value={role.value} className="text-sm">
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Security Tab - Compact */}
                      <TabsContent value="security" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Password *</Label>
                            <div className="relative">
                              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`pl-7 pr-7 h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                                ) : (
                                  <Eye className="w-3 h-3 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Confirm *</Label>
                            <div className="relative">
                              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={`pl-7 pr-7 h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                                ) : (
                                  <Eye className="w-3 h-3 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {formData.password && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                Strength:
                              </span>
                              <Badge variant="outline" className={`text-[8px] px-1 py-0 ${passwordStrengthColor.replace('bg-', 'text-')}`}>
                                {passwordStrengthText}
                              </Badge>
                            </div>
                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${passwordStrengthColor} transition-all`}
                                style={{ width: `${(passwordScore / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Permissions Tab - Compact Grid */}
                      <TabsContent value="permissions" className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {permissionGroups.map((group) => {
                          const groupPermissionIds = group.permissions.map(p => p.id);
                          const allGroupSelected = groupPermissionIds.every(p => formData.permissions.includes(p));

                          return (
                            <div key={group.name} className={`border rounded-lg p-2 ${
                              darkMode ? 'border-white/10' : 'border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1">
                                  <Checkbox
                                    id={`group-${group.name}`}
                                    checked={allGroupSelected}
                                    onCheckedChange={() => handlePermissionGroupToggle(groupPermissionIds)}
                                    className="h-3 w-3"
                                  />
                                  <Label htmlFor={`group-${group.name}`} className={`text-xs font-medium ${
                                    darkMode ? 'text-white' : ''
                                  }`}>
                                    {group.name}
                                  </Label>
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-1 pl-4">
                                {group.permissions.map((permission) => (
                                  <div key={permission.id} className="flex items-center space-x-1">
                                    <Checkbox
                                      id={permission.id}
                                      checked={formData.permissions.includes(permission.id)}
                                      onCheckedChange={() => handlePermissionChange(permission.id)}
                                      className="h-3 w-3"
                                    />
                                    <Label
                                      htmlFor={permission.id}
                                      className={`text-[10px] ${
                                        darkMode ? 'text-gray-300' : ''
                                      }`}
                                    >
                                      {permission.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </TabsContent>

                      {/* Preferences Tab - Compact */}
                      <TabsContent value="preferences" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Language</Label>
                            <Select 
                              value={formData.language}
                              onValueChange={(value) => handleSelectChange('language', value)}
                            >
                              <SelectTrigger className={`h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map(lang => (
                                  <SelectItem key={lang.value} value={lang.value} className="text-sm">{lang.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Timezone</Label>
                            <Select 
                              value={formData.timezone}
                              onValueChange={(value) => handleSelectChange('timezone', value)}
                            >
                              <SelectTrigger className={`h-8 text-sm ${darkMode ? 'bg-white/10 border-white/20 text-white' : ''}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timezones.map(tz => (
                                  <SelectItem key={tz} value={tz} className="text-sm">{tz.split('/')[1]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className={`text-xs ${darkMode ? 'text-gray-300' : ''}`}>Notifications</Label>
                          <div className="flex gap-3">
                            {notificationOptions.map(option => (
                              <div key={option.id} className="flex items-center space-x-1">
                                <Checkbox
                                  id={option.id}
                                  checked={formData.notificationPreferences.includes(option.id)}
                                  onCheckedChange={() => handleNotificationToggle(option.id)}
                                  className="h-3 w-3"
                                />
                                <Label htmlFor={option.id} className={`text-[10px] ${
                                  darkMode ? 'text-gray-300' : ''
                                }`}>
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Terms - Compact */}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="terms" 
                              checked={acceptTerms}
                              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                              className="h-3 w-3"
                            />
                            <Label htmlFor="terms" className={`text-[10px] ${darkMode ? 'text-gray-300' : ''}`}>
                              Accept <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="privacy" 
                              checked={acceptPrivacy}
                              onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                              className="h-3 w-3"
                            />
                            <Label htmlFor="privacy" className={`text-[10px] ${darkMode ? 'text-gray-300' : ''}`}>
                              Accept <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>
                            </Label>
                          </div>
                        </div>
                      </TabsContent>
                    </form>
                  </Tabs>
                </div>

                {/* Form Footer - Compact */}
                <div className={`p-4 border-t flex justify-between items-center ${
                  darkMode ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div>
                    {registrationStep > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={prevStep}
                        size="sm"
                        className={`h-8 px-2 text-xs gap-1 ${
                          darkMode ? 'text-white hover:bg-white/10' : ''
                        }`}
                      >
                        <ChevronLeft className="w-3 h-3" />
                        Back
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to="/admin/login">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-3 text-xs ${darkMode ? 'text-white hover:bg-white/10' : ''}`}
                      >
                        Cancel
                      </Button>
                    </Link>

                    {registrationStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        size="sm"
                        className="h-8 px-3 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white gap-1"
                      >
                        Next
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        size="sm"
                        className="h-8 px-3 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white gap-1"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            Create
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;