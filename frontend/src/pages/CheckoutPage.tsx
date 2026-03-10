import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Truck, CreditCard, MapPin, 
  Phone, User, Mail, ChevronRight, ArrowLeft,
  CheckCircle, Clock, Shield, Smartphone, 
  Landmark, Upload, AlertCircle, Copy, Check,
  Banknote, Package, Tag, Percent, Loader2,
  Calendar, Home, X, Plus, Minus, Trash2
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { useCart } from '@/components/store/CartProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

type CheckoutStep = 'cart' | 'delivery' | 'payment' | 'review';

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

interface DeliveryDetails {
  address: string;
  city: string;
  instructions: string;
  // For subscriptions/delivery
  deliveryDay?: string;
  deliveryTime?: string;
}

// For regular orders, we need delivery zone info
interface DeliveryZone {
  id: number;
  name: string;
  price_km: number;
  min_delivery_time: number | null;
  max_delivery_time: number | null;
  is_active: boolean;
  coverage: 'full' | 'partial' | 'coming';
}

interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalItems, subtotal, deliveryFee: defaultDeliveryFee, removeItem, updateQuantity, clearCart } = useCart();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Customer info
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(() => {
    const saved = localStorage.getItem('mwambo_customer_info');
    return saved ? JSON.parse(saved) : { fullName: '', email: '', phone: '' };
  });
  
  // Delivery details
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>(() => {
    const saved = localStorage.getItem('mwambo_delivery_details');
    return saved ? JSON.parse(saved) : {
      address: '',
      city: 'Lilongwe',
      instructions: '',
      deliveryDay: 'Monday',
      deliveryTime: '09:00-12:00'
    };
  });

  // Delivery zones (from your admin endpoints - but these need public endpoints)
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [loadingZones, setLoadingZones] = useState(false);
  const [zonesError, setZonesError] = useState<string | null>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'airtel' | 'tnm' | 'bank'>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Terms
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Calculate delivery fee based on selected zone
  const calculateDeliveryFee = (zone: DeliveryZone | undefined): number => {
    if (!zone) return defaultDeliveryFee;
    // Estimate 5km distance - in production this would come from geocoding
    const estimatedDistance = 5;
    return zone.price_km * estimatedDistance;
  };

  const selectedZone = deliveryZones.find(z => z.id.toString() === selectedZoneId);
  const deliveryFee = selectedZone ? calculateDeliveryFee(selectedZone) : defaultDeliveryFee;

  // Calculate totals with coupon
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + deliveryFee - discountAmount;

  // Save to localStorage when customer info changes
  useEffect(() => {
    localStorage.setItem('mwambo_customer_info', JSON.stringify(customerInfo));
  }, [customerInfo]);

  // Save to localStorage when delivery details change
  useEffect(() => {
    localStorage.setItem('mwambo_delivery_details', JSON.stringify(deliveryDetails));
  }, [deliveryDetails]);

  // Load delivery zones - You need to create a public endpoint for this
  // For now, we'll use a placeholder
  useEffect(() => {
    const fetchZones = async () => {
      setLoadingZones(true);
      setZonesError(null);
      try {
        // This endpoint doesn't exist yet - you need to create it
        // For now, we'll use mock data
        // const response = await fetch(`${API_URL}/delivery-zones/public`);
        // const data = await response.json();
        
        // Mock data for now
        const mockZones: DeliveryZone[] = [
          { id: 1, name: 'Lilongwe City Centre', price_km: 500, min_delivery_time: 20, max_delivery_time: 40, is_active: true, coverage: 'full' },
          { id: 2, name: 'Area 47', price_km: 600, min_delivery_time: 25, max_delivery_time: 45, is_active: true, coverage: 'full' },
          { id: 3, name: 'Area 25', price_km: 700, min_delivery_time: 30, max_delivery_time: 50, is_active: true, coverage: 'full' },
          { id: 4, name: 'Kanengo', price_km: 800, min_delivery_time: 35, max_delivery_time: 55, is_active: true, coverage: 'partial' },
        ];
        
        setDeliveryZones(mockZones);
        
        // Set default zone if available
        if (mockZones.length > 0 && !selectedZoneId) {
          setSelectedZoneId(mockZones[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching delivery zones:', error);
        setZonesError('Failed to load delivery zones');
      } finally {
        setLoadingZones(false);
      }
    };
    
    fetchZones();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items, navigate]);

  const markStepComplete = (step: CheckoutStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const goToStep = (step: CheckoutStep) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  const validateDeliveryStep = (): boolean => {
    if (!customerInfo.fullName) {
      toast({ title: 'Validation Error', description: 'Full name is required', variant: 'destructive' });
      return false;
    }
    if (!customerInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      toast({ title: 'Validation Error', description: 'Valid email is required', variant: 'destructive' });
      return false;
    }
    if (!customerInfo.phone || !/^(\+?[0-9]{10,13})$/.test(customerInfo.phone)) {
      toast({ title: 'Validation Error', description: 'Valid phone number is required', variant: 'destructive' });
      return false;
    }
    if (!deliveryDetails.address) {
      toast({ title: 'Validation Error', description: 'Delivery address is required', variant: 'destructive' });
      return false;
    }
    if (!deliveryDetails.city) {
      toast({ title: 'Validation Error', description: 'City is required', variant: 'destructive' });
      return false;
    }
    if (!selectedZoneId) {
      toast({ title: 'Validation Error', description: 'Delivery zone is required', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'cart':
        markStepComplete('cart');
        setCurrentStep('delivery');
        break;
      case 'delivery':
        if (validateDeliveryStep()) {
          markStepComplete('delivery');
          setCurrentStep('payment');
        }
        break;
      case 'payment':
        if (paymentMethod) {
          if ((paymentMethod === 'airtel' || paymentMethod === 'tnm' || paymentMethod === 'bank') && !paymentReference) {
            toast({ 
              title: 'Validation Error', 
              description: 'Please enter your payment reference number', 
              variant: 'destructive' 
            });
            return;
          }
          if (paymentMethod === 'bank' && !paymentProof) {
            toast({ 
              title: 'Validation Error', 
              description: 'Please upload proof of payment', 
              variant: 'destructive' 
            });
            return;
          }
          markStepComplete('payment');
          setCurrentStep('review');
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'delivery':
        setCurrentStep('cart');
        break;
      case 'payment':
        setCurrentStep('delivery');
        break;
      case 'review':
        setCurrentStep('payment');
        break;
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setValidatingCoupon(true);
    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setAppliedCoupon({
          code: couponCode,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount
        });
        toast({ title: 'Success', description: `Coupon applied! You saved MK ${data.discountAmount.toLocaleString()}` });
      } else {
        toast({ title: 'Invalid Coupon', description: data.message, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({ title: 'Error', description: 'Failed to validate coupon', variant: 'destructive' });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    if (!agreeToTerms) {
      toast({ title: 'Validation Error', description: 'You must agree to the terms and conditions', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    
    try {
      // Prepare order data - using the orders endpoint from your backend
      const orderData = {
        customer: {
          name: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone
        },
        deliveryAddress: deliveryDetails.address,
        city: deliveryDetails.city,
        deliveryInstructions: deliveryDetails.instructions,
        deliveryZoneId: parseInt(selectedZoneId),
        paymentMethod,
        paymentReference: paymentReference || undefined,
        couponCode: appliedCoupon?.code,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        deliveryFee,
        total
      };

      // You need to create an orders endpoint in your backend
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Clear cart and saved data
      clearCart();
      localStorage.removeItem('mwambo_customer_info');
      localStorage.removeItem('mwambo_delivery_details');

      // Navigate to confirmation
      navigate(`/order-confirmation/${data.orderNumber}`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to place order',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard' });
  };

  const steps = [
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: CheckCircle },
  ];

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.includes(step.id as CheckoutStep);
              
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => goToStep(step.id as CheckoutStep)}
                    disabled={!completedSteps.includes(step.id as CheckoutStep) && step.id !== currentStep}
                    className="flex flex-col items-center group"
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${isActive ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white scale-110' : 
                        isCompleted ? 'bg-green-500 text-white' : 
                        'bg-muted text-muted-foreground'}
                      ${!isActive && !isCompleted && 'group-hover:bg-muted/80'}
                    `}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className={`
                      text-xs mt-1 font-medium transition-colors
                      ${isActive ? 'text-primary' : 'text-muted-foreground'}
                    `}>
                      {step.label}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-colors
                      ${completedSteps.includes(steps[index + 1].id as CheckoutStep) || 
                        completedSteps.includes(step.id as CheckoutStep) ? 'bg-green-500' : 'bg-muted'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6">
              
              {/* STEP 1: Cart Review */}
              {currentStep === 'cart' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-display font-semibold">Your Cart ({totalItems} items)</h2>
                    <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-600">
                      Clear Cart
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {items.map(item => (
                      <div key={item.productId} className="flex gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-border">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Unit: {item.unit || 'piece'} | Price: MK {item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-muted/80"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-muted/80"
                              disabled={item.stock !== undefined && item.quantity >= item.stock}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-semibold">MK {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.productId)}
                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code */}
                  <div className="bg-muted/30 rounded-xl p-4 mt-4">
                    <label className="text-sm font-medium mb-2 block">Coupon Code</label>
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        disabled={!!appliedCoupon}
                      />
                      {appliedCoupon ? (
                        <Button variant="outline" onClick={removeCoupon} className="gap-2">
                          <X className="w-4 h-4" /> Remove
                        </Button>
                      ) : (
                        <Button 
                          onClick={validateCoupon} 
                          disabled={!couponCode.trim() || validatingCoupon}
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white gap-2"
                        >
                          {validatingCoupon ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Tag className="w-4 h-4" />
                          )}
                          Apply
                        </Button>
                      )}
                    </div>
                    {appliedCoupon && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Coupon applied: {appliedCoupon.discountType === 'percentage' 
                          ? `${appliedCoupon.discountValue}% off` 
                          : `MK ${appliedCoupon.discountValue.toLocaleString()} off`}
                      </p>
                    )}
                  </div>

                  {/* Estimated delivery info */}
                  <div className="bg-blue-50 rounded-xl p-4 mt-2">
                    <p className="text-sm flex items-center gap-2 text-blue-700">
                      <Clock className="w-4 h-4" />
                      <span>Estimated delivery: Same day before 6PM if ordered within 2 hours</span>
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Delivery Details */}
              {currentStep === 'delivery' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-display font-semibold mb-4">Delivery Details</h2>
                  
                  {/* Loading/Error States */}
                  {loadingZones && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading delivery zones...</span>
                    </div>
                  )}
                  
                  {zonesError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {zonesError}
                      </p>
                    </div>
                  )}
                  
                  {!loadingZones && !zonesError && (
                    <div className="space-y-4">
                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={customerInfo.fullName}
                              onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                              className="pl-10"
                              placeholder="John Doe"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="email"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                              className="pl-10"
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-medium mb-1 block">Phone Number *</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                              className="pl-10"
                              placeholder="0999 123 456"
                              required
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            For delivery updates and payment confirmation
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Delivery Address */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Delivery Address *</label>
                        <textarea
                          className="w-full rounded-xl border border-border bg-background p-3 text-sm min-h-[80px]"
                          value={deliveryDetails.address}
                          onChange={(e) => setDeliveryDetails({...deliveryDetails, address: e.target.value})}
                          placeholder="Street name, house number, landmark..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">City *</label>
                          <select 
                            className="w-full h-11 rounded-xl border border-border bg-background px-3"
                            value={deliveryDetails.city}
                            onChange={(e) => setDeliveryDetails({...deliveryDetails, city: e.target.value})}
                          >
                            <option value="Lilongwe">Lilongwe</option>
                            <option value="Blantyre">Blantyre</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Delivery Zone *</label>
                          <select 
                            className="w-full h-11 rounded-xl border border-border bg-background px-3"
                            value={selectedZoneId}
                            onChange={(e) => setSelectedZoneId(e.target.value)}
                            disabled={loadingZones || deliveryZones.length === 0}
                          >
                            <option value="">Select zone</option>
                            {deliveryZones.map(zone => (
                              <option key={zone.id} value={zone.id}>
                                {zone.name} (MK {zone.price_km.toLocaleString()}/km)
                              </option>
                            ))}
                          </select>
                          {deliveryZones.length === 0 && !loadingZones && (
                            <p className="text-xs text-red-500 mt-1">No delivery zones available</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Special Instructions (Optional)</label>
                        <textarea
                          className="w-full rounded-xl border border-border bg-background p-3 text-sm"
                          rows={3}
                          value={deliveryDetails.instructions}
                          onChange={(e) => setDeliveryDetails({...deliveryDetails, instructions: e.target.value})}
                          placeholder="e.g., Call when you arrive, Leave with guard"
                        />
                      </div>

                      {/* Delivery Day and Time (for subscriptions) */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Preferred Delivery Day</label>
                          <select 
                            className="w-full h-11 rounded-xl border border-border bg-background px-3"
                            value={deliveryDetails.deliveryDay}
                            onChange={(e) => setDeliveryDetails({...deliveryDetails, deliveryDay: e.target.value})}
                          >
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Preferred Delivery Time</label>
                          <select 
                            className="w-full h-11 rounded-xl border border-border bg-background px-3"
                            value={deliveryDetails.deliveryTime}
                            onChange={(e) => setDeliveryDetails({...deliveryDetails, deliveryTime: e.target.value})}
                          >
                            <option value="09:00-12:00">Morning (9AM - 12PM)</option>
                            <option value="12:00-15:00">Afternoon (12PM - 3PM)</option>
                            <option value="15:00-18:00">Evening (3PM - 6PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Payment Method */}
              {currentStep === 'payment' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-display font-semibold mb-4">Payment Method</h2>
                  
                  <div className="space-y-3">
                    {/* Cash on Delivery */}
                    <label className={`
                      flex items-start gap-4 p-4 border rounded-xl cursor-pointer
                      transition-all hover:border-primary/50
                      ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border'}
                    `}>
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod('cash')}
                        className="mt-1"
                      />
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </label>

                    {/* Airtel Money */}
                    <label className={`
                      flex items-start gap-4 p-4 border rounded-xl cursor-pointer
                      transition-all hover:border-primary/50
                      ${paymentMethod === 'airtel' ? 'border-primary bg-primary/5' : 'border-border'}
                    `}>
                      <input
                        type="radio"
                        name="payment"
                        value="airtel"
                        checked={paymentMethod === 'airtel'}
                        onChange={(e) => setPaymentMethod('airtel')}
                        className="mt-1"
                      />
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Airtel Money</p>
                        <p className="text-sm text-muted-foreground">Pay instantly with Airtel Money</p>
                      </div>
                    </label>

                    {paymentMethod === 'airtel' && (
                      <div className="ml-14 p-4 bg-muted/30 rounded-xl space-y-3">
                        <div className="flex items-center justify-between bg-card p-3 rounded-lg">
                          <code className="text-sm">Send to: 0991 234 567</code>
                          <button 
                            onClick={() => copyToClipboard('0991234567')}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Payment Reference *</label>
                          <Input
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="Enter transaction reference"
                          />
                        </div>
                      </div>
                    )}

                    {/* TNM Mpamba */}
                    <label className={`
                      flex items-start gap-4 p-4 border rounded-xl cursor-pointer
                      transition-all hover:border-primary/50
                      ${paymentMethod === 'tnm' ? 'border-primary bg-primary/5' : 'border-border'}
                    `}>
                      <input
                        type="radio"
                        name="payment"
                        value="tnm"
                        checked={paymentMethod === 'tnm'}
                        onChange={(e) => setPaymentMethod('tnm')}
                        className="mt-1"
                      />
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">TNM Mpamba</p>
                        <p className="text-sm text-muted-foreground">Pay with TNM Mpamba</p>
                      </div>
                    </label>

                    {paymentMethod === 'tnm' && (
                      <div className="ml-14 p-4 bg-muted/30 rounded-xl space-y-3">
                        <div className="flex items-center justify-between bg-card p-3 rounded-lg">
                          <code className="text-sm">Send to: 0881 234 567</code>
                          <button 
                            onClick={() => copyToClipboard('0881234567')}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Payment Reference *</label>
                          <Input
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="Enter transaction reference"
                          />
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer */}
                    <label className={`
                      flex items-start gap-4 p-4 border rounded-xl cursor-pointer
                      transition-all hover:border-primary/50
                      ${paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-border'}
                    `}>
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod('bank')}
                        className="mt-1"
                      />
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                      </div>
                    </label>

                    {paymentMethod === 'bank' && (
                      <div className="ml-14 p-4 bg-muted/30 rounded-xl space-y-3">
                        <div className="bg-card p-3 rounded-lg space-y-2">
                          <p className="text-sm"><span className="text-muted-foreground">Bank:</span> National Bank of Malawi</p>
                          <p className="text-sm"><span className="text-muted-foreground">Account Name:</span> Mwambo Store</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm"><span className="text-muted-foreground">Account:</span> 1001234567</p>
                            <button 
                              onClick={() => copyToClipboard('1001234567')}
                              className="p-1 hover:bg-muted rounded"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Payment Reference *</label>
                          <Input
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="Enter your name as reference"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Upload Proof of Payment *</label>
                          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                              className="hidden"
                              id="proof-upload"
                            />
                            <label htmlFor="proof-upload" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm font-medium">Click to upload screenshot</p>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                            </label>
                            {paymentProof && (
                              <p className="text-xs text-green-600 mt-2">
                                ✓ {paymentProof.name} uploaded
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Place Order */}
              {currentStep === 'review' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-display font-semibold mb-4">Review Your Order</h2>
                  
                  <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Contact Information
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {customerInfo.fullName}<br />
                        {customerInfo.phone}<br />
                        {customerInfo.email}
                      </p>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {deliveryDetails.address}<br />
                        {deliveryDetails.city}
                        {deliveryDetails.instructions && <><br />Note: {deliveryDetails.instructions}</>}
                      </p>
                    </div>

                    {/* Delivery Zone */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery Zone
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedZone?.name}
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Method
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {paymentMethod.replace('-', ' ')}
                        {paymentReference && <> - Ref: {paymentReference}</>}
                      </p>
                    </div>

                    {/* Items Summary */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Order Items ({totalItems})
                      </h3>
                      <div className="space-y-2">
                        {items.slice(0, 3).map(item => (
                          <div key={item.productId} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>MK {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <p className="text-xs text-muted-foreground">+{items.length - 3} more items</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms agreement */}
                  <div className="flex items-start gap-2 mt-4 p-4 bg-muted/30 rounded-xl">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I agree to the <button className="text-primary hover:underline">Terms & Conditions</button>, 
                      <button className="text-primary hover:underline">Delivery Policy</button>, and 
                      <button className="text-primary hover:underline">Refund Policy</button>.
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 'cart'}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                
                {currentStep === 'review' ? (
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={!agreeToTerms || submitting}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white gap-2 min-w-[160px]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order <Shield className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={currentStep === 'delivery' && loadingZones}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-[140px]">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-2 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-muted shrink-0 flex items-center justify-center text-xs overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">MK {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>MK {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>MK {deliveryFee.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-muted-foreground">Discount</span>
                    <span>- MK {discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>MK {total.toLocaleString()}</span>
              </div>

              {subtotal < 10000 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Add MK {(10000 - subtotal).toLocaleString()} more for free delivery
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Secure SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;