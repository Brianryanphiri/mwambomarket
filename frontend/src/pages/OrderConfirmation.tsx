import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  CheckCircle, Package, Home, Truck, Clock, Phone, 
  Mail, MapPin, User, Calendar, Gift, Sparkles,
  ShoppingBag, Heart, Star, Coffee, Loader2,
  AlertCircle, ChevronRight, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Order {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  deliveryZone: string;
  deliverySlot: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  paymentReference?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    unit?: string;
    image?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  status: string;
  estimatedDelivery: string;
  statusHistory: Array<{
    status: string;
    note?: string;
    created_at: string;
  }>;
  createdAt: string;
}

const OrderConfirmation = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationStage, setAnimationStage] = useState(0);
  const [copied, setCopied] = useState(false);

  // Fetch order details
  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  // Animation sequence
  useEffect(() => {
    if (order) {
      const timer1 = setTimeout(() => setAnimationStage(1), 300);
      const timer2 = setTimeout(() => setAnimationStage(2), 600);
      const timer3 = setTimeout(() => setAnimationStage(3), 900);
      const timer4 = setTimeout(() => setAnimationStage(4), 1200);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [order]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/track?orderNumber=${orderNumber}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error instanceof Error ? error.message : 'Failed to load order');
      toast({
        title: 'Error',
        description: 'Could not load order details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Order number copied to clipboard' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MW', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStep = (status: string): number => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'confirmed': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string, index: number, currentStep: number) => {
    if (index < currentStep) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (index === currentStep) return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Order Not Found</h2>
            <p className="text-muted-foreground mb-8">
              {error || "We couldn't find an order with that number. Please check and try again."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/shop">
                <Button variant="outline" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </Link>
              <Link to="/track-order">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white gap-2">
                  <Package className="w-4 h-4" />
                  Track Another Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStatusIndex = getStatusStep(order.status);
  const statusSteps = [
    { label: 'Pending', description: 'Order received' },
    { label: 'Confirmed', description: 'Payment verified' },
    { label: 'Processing', description: 'Preparing your items' },
    { label: 'Shipped', description: 'On the way' },
    { label: 'Delivered', description: 'Completed' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-200/30 rounded-full blur-3xl animate-pulse-slower" />
      </div>

      <Header />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-6">
              {/* Animated rings */}
              <div className={`absolute inset-0 rounded-full border-4 border-green-500/30 
                ${animationStage >= 1 ? 'animate-spin-slow' : 'opacity-0'}`} 
                style={{ borderTopColor: '#22c55e', borderBottomColor: 'transparent' }}
              />
              
              <div className={`absolute inset-2 rounded-full border-2 border-green-500/50 
                ${animationStage >= 1 ? 'animate-ping-slow' : 'opacity-0'}`} 
              />
              
              <div className={`absolute inset-4 rounded-full bg-gradient-to-br from-green-500 to-green-600
                flex items-center justify-center transform transition-all duration-1000
                ${animationStage >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </div>

              {/* Floating particles */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-green-500 rounded-full animate-float-particle
                    ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>

            <h1 className={`
              text-4xl md:text-5xl font-display font-bold mb-3
              transition-all duration-1000 transform
              ${animationStage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
            `}>
              <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                Order Confirmed!
              </span>
            </h1>
            
            <p className={`
              text-lg text-muted-foreground
              transition-all duration-1000 delay-300 transform
              ${animationStage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
            `}>
              Thank you for shopping with Mwambo Store
            </p>
          </div>

          {/* Order Number Card */}
          <div className={`
            bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-6
            shadow-lg transform transition-all duration-1000
            ${animationStage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-mono font-bold">{order.orderNumber}</p>
                  <button 
                    onClick={copyOrderNumber}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  {order.status.toUpperCase()}
                </span>
              </Badge>
            </div>
          </div>

          {/* Order Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Customer Info */}
            <div className={`
              bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6
              transform transition-all duration-700 hover:shadow-md
              ${animationStage >= 2 ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
            `} style={{ transitionDelay: '200ms' }}>
              <h3 className="font-medium mb-4 flex items-center gap-2 text-primary">
                <User className="w-4 h-4" />
                Customer Details
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {order.customerEmail}
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {order.customerPhone}
                </p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className={`
              bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6
              transform transition-all duration-700 hover:shadow-md
              ${animationStage >= 2 ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}
            `} style={{ transitionDelay: '400ms' }}>
              <h3 className="font-medium mb-4 flex items-center gap-2 text-primary">
                <Truck className="w-4 h-4" />
                Delivery Details
              </h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>{order.deliveryAddress}, {order.city}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{order.deliverySlot}</span>
                </p>
                {order.deliveryInstructions && (
                  <p className="text-muted-foreground italic">
                    Note: {order.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className={`
            bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-6
            transform transition-all duration-1000
            ${animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 animate-slide-in-right"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.unit && `${item.unit} • `}
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">MK {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className={`
            bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-6
            transform transition-all duration-1000
            ${animationStage >= 3 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{order.paymentMethod.replace('-', ' ')}</span>
              </div>
              {order.paymentReference && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-xs">{order.paymentReference}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>MK {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>MK {order.deliveryFee.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-muted-foreground">Discount</span>
                  <span>- MK {order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>MK {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className={`
            bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-6
            transform transition-all duration-1000
            ${animationStage >= 3 ? 'opacity-100' : 'opacity-0'}
          `}>
            <h3 className="font-medium mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Order Status
            </h3>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              <div className="space-y-6 relative">
                {statusSteps.map((step, index) => {
                  const isCompleted = index < currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  
                  return (
                    <div key={step.label} className="flex items-start gap-4 relative">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center z-10
                        ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-yellow-500' : 'bg-gray-300'}
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-white animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.label}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                        {order.statusHistory[index] && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(order.statusHistory[index].created_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className={`
            bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6
            transform transition-all duration-1000
            ${animationStage >= 4 ? 'opacity-100' : 'opacity-0'}
          `}>
            <h3 className="font-medium mb-4 flex items-center gap-2 text-blue-700">
              <Sparkles className="w-4 h-4" />
              What's Next?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Processing</p>
                <p className="text-xs text-muted-foreground">We'll prepare your order within 30 minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">SMS Updates</p>
                <p className="text-xs text-muted-foreground">You'll receive delivery updates via SMS</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Delivery</p>
                <p className="text-xs text-muted-foreground">Estimated: {order.estimatedDelivery || 'Today'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop" className="flex-1">
              <Button 
                variant="outline" 
                className={`
                  w-full gap-2 h-12 border-2 hover:border-primary
                  transition-all duration-1000 transform
                  hover:scale-105 hover:shadow-lg
                  ${animationStage >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                `}
                style={{ transitionDelay: '1000ms' }}
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>
            
            <Link to={`/track-order?order=${order.orderNumber}`} className="flex-1">
              <Button 
                className={`
                  w-full bg-gradient-to-r from-orange-500 to-red-500 text-white gap-2 h-12
                  transition-all duration-1000 transform relative overflow-hidden group
                  hover:scale-105 hover:shadow-xl
                  ${animationStage >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                `}
                style={{ transitionDelay: '1200ms' }}
              >
                <Package className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Track Order
              </Button>
            </Link>
          </div>

          {/* Support Message */}
          <p className={`
            text-center text-sm text-muted-foreground mt-6
            transition-all duration-1000
            ${animationStage >= 4 ? 'opacity-100' : 'opacity-0'}
          `} style={{ transitionDelay: '1400ms' }}>
            Need help? Call us at{' '}
            <a 
              href="tel:+265999123456" 
              className="text-primary hover:underline font-medium"
            >
              +265 999 123 456
            </a>
          </p>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes float-particle {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -80px) scale(1); opacity: 0; }
        }
        .animate-float-particle {
          animation: float-particle 1.5s ease-out forwards;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes ping-slow {
          75%, 100% { transform: scale(1.3); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;