// src/pages/admin/AdminLogin.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, AlertCircle,
  CheckCircle, Shield, ArrowLeft, Store,
  ShoppingCart, Package, Truck, CreditCard,
  BarChart3, Users, Moon, Sun, LogIn,
  HelpCircle, Fingerprint, Key, UserCheck,
  AlertTriangle, Info, Loader2
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-grocery.jpg';
import api from '@/services/api';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Form data
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  });

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/health');
        if (response.ok) {
          setBackendStatus('online');
          console.log('✅ Backend is online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        console.error('❌ Backend is offline:', error);
        setBackendStatus('offline');
      }
    };
    
    checkBackend();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    if (backendStatus === 'offline') {
      setError('Backend server is offline. Please check if the server is running.');
      return;
    }

    setLoading(true);

    try {
      // Use the actual login function from context
      const success = await login(formData.email, formData.password, formData.rememberMe);
      
      if (success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        setError('Invalid email or password');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Test backend connection
  const testBackend = async () => {
    try {
      const response = await api.get('/health');
      alert(`Backend is online! Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      alert('Backend is offline! Check if server is running on port 5001');
    }
  };

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
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all group"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-90 transition-transform" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700 group-hover:rotate-90 transition-transform" />
        )}
      </button>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Header with Backend Status */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <Store className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Mwambo Store Admin
              </span>
              {backendStatus === 'online' && (
                <Badge variant="success" className="bg-green-500 text-white text-xs">
                  Backend Online
                </Badge>
              )}
              {backendStatus === 'offline' && (
                <Badge variant="destructive" className="text-xs">
                  Backend Offline
                </Badge>
              )}
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-display font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome Back
            </h1>
            
            <p className={`text-lg max-w-md mx-auto ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sign in to access your admin dashboard
            </p>

            {/* Test Button (remove in production) */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testBackend}
              className="mt-2"
            >
              Test Backend Connection
            </Button>
          </div>

          {/* Login Card */}
          <div className={`rounded-3xl backdrop-blur-md border overflow-hidden ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-gray-200'
          }`}>
            {/* Card Header */}
            <div className={`p-6 border-b ${
              darkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                }`}>
                  <LogIn className={`w-6 h-6 ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-xl font-display font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Admin Login
                  </h2>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Enter your credentials to continue
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="p-6 space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-slide-down">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500 text-white border-none animate-slide-down">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {backendStatus === 'offline' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Backend server is offline. Please start the server on port 5001.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Login Form */}
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className={darkMode ? 'text-gray-300' : ''}>
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@mwambo.store"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-9 ${
                        darkMode ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-500' : ''
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className={darkMode ? 'text-gray-300' : ''}>
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`pl-9 pr-9 ${
                        darkMode ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-500' : ''
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                      }
                    />
                    <Label htmlFor="rememberMe" className={`text-sm ${
                      darkMode ? 'text-gray-300' : ''
                    }`}>
                      Remember me
                    </Label>
                  </div>
                  <Link 
                    to="/admin/forgot-password"
                    className={`text-sm hover:underline ${
                      darkMode ? 'text-orange-400' : 'text-orange-600'
                    }`}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || backendStatus === 'offline'}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white h-12 gap-2 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In to Dashboard
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* MFA Section - If MFA is required */}
            {mfaRequired && (
              <div className="px-6 pb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className={darkMode ? 'bg-white/10' : ''} />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className={`px-2 ${
                      darkMode ? 'bg-gray-950 text-gray-500' : 'bg-white text-gray-500'
                    }`}>
                      Two-Factor Authentication
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <p className={`text-sm text-center ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Please enter the 6-digit code from your authenticator app
                  </p>
                  
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <Input
                        key={index}
                        type="text"
                        maxLength={1}
                        className={`w-12 h-12 text-center text-lg ${
                          darkMode ? 'bg-white/10 border-white/20 text-white' : ''
                        }`}
                        value={mfaCode[index] || ''}
                        onChange={(e) => {
                          const newCode = mfaCode.split('');
                          newCode[index] = e.target.value.replace(/[^0-9]/g, '');
                          setMfaCode(newCode.join(''));
                          
                          // Auto-focus next input
                          if (e.target.value && index < 5) {
                            const nextInput = document.querySelector(`input[name=mfa-${index + 1}]`) as HTMLInputElement;
                            if (nextInput) nextInput.focus();
                          }
                        }}
                        name={`mfa-${index}`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      // Verify MFA code
                      console.log('Verifying MFA code:', mfaCode);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white h-12 gap-2"
                    disabled={mfaCode.length !== 6}
                  >
                    <Fingerprint className="w-4 h-4" />
                    Verify Code
                  </Button>

                  <p className={`text-xs text-center ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Having trouble? <Link to="/admin/mfa-recovery" className="text-orange-500 hover:underline">Use recovery code</Link>
                  </p>
                </div>
              </div>
            )}

            {/* Card Footer */}
            <CardFooter className={`p-6 border-t flex justify-center ${
              darkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Don't have an account?{' '}
                <Link 
                  to="/admin/register" 
                  className={`font-semibold hover:underline ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
                  }`}
                >
                  Register here
                </Link>
              </p>
            </CardFooter>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 text-sm">
              <Link 
                to="/" 
                className={`flex items-center gap-1 hover:underline ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowLeft className="w-3 h-3" />
                Return to Store
              </Link>
              <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
              <Link 
                to="/help" 
                className={`flex items-center gap-1 hover:underline ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                Need Help?
              </Link>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm">
              <Shield className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Secure login with 256-bit encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;