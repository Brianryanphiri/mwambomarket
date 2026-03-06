// src/pages/CheckoutPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Truck, CreditCard, MapPin, 
  Phone, User, Mail, ChevronRight, ArrowLeft,
  CheckCircle, Clock, Shield, Smartphone, 
  Landmark, Upload, AlertCircle,
  Copy, Check, Banknote, Package
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { useCart } from '@/components/store/CartProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type CheckoutStep = 'cart' | 'information' | 'delivery' | 'payment' | 'confirm';

interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
}

interface DeliveryAddress {
  city: string;
  area: string;
  streetDescription: string;
  landmark: string;
  deliveryInstructions: string;
}

interface DeliveryOption {
  id: 'same-day' | 'next-day' | 'scheduled' | 'express';
  name: string;
  price: number;
  estimatedTime: string;
  description: string;
}

type PaymentMethod = 'airtel-money' | 'tnm-mpamba' | 'bank-transfer' | 'cash-on-delivery';

// Delivery options
const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'same-day',
    name: 'Same Day Delivery',
    price: 2500,
    estimatedTime: 'Today before 6PM',
    description: 'Order before 2PM for same-day delivery'
  },
  {
    id: 'next-day',
    name: 'Next Day Delivery',
    price: 1500,
    estimatedTime: 'Tomorrow between 9AM-6PM',
    description: 'Choose your preferred time slot'
  },
  {
    id: 'scheduled',
    name: 'Scheduled Delivery',
    price: 1000,
    estimatedTime: 'Pick your date',
    description: 'Schedule for a future date'
  },
  {
    id: 'express',
    name: 'Express Delivery',
    price: 5000,
    estimatedTime: 'Within 2 hours',
    description: 'Priority handling and fast delivery'
  }
];

// Payment method details
const PAYMENT_METHODS = [
  {
    id: 'airtel-money',
    name: 'Airtel Money',
    icon: Smartphone,
    description: 'Pay instantly with Airtel Money',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    instructions: [
      'Dial *211#',
      'Select "Pay"',
      'Enter merchant number: 0999 123 456',
      'Enter amount and order ID as reference',
      'Confirm payment'
    ],
    merchantNumber: '0999123456'
  },
  {
    id: 'tnm-mpamba',
    name: 'TNM Mpamba',
    icon: Smartphone,
    description: 'Pay with TNM Mpamba',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    instructions: [
      'Dial *444#',
      'Select "Send Money"',
      'Enter merchant number: 0888 123 456',
      'Enter amount and order ID as reference',
      'Confirm payment'
    ],
    merchantNumber: '0888123456'
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    icon: Landmark,
    description: 'Direct bank transfer',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    bankDetails: {
      bank: 'National Bank of Malawi',
      accountName: 'Mwambo Store',
      accountNumber: '1001234567',
      branch: 'Lilongwe Gateway'
    }
  },
  {
    id: 'cash-on-delivery',
    name: 'Cash on Delivery',
    icon: Banknote,
    description: 'Pay when you receive',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    note: 'Additional MWK 500 convenience fee applies'
  }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);
  
  // Form data - guest checkout only
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phoneNumber: '',
    email: '',
  });
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    city: '',
    area: '',
    streetDescription: '',
    landmark: '',
    deliveryInstructions: ''
  });
  
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption>(DELIVERY_OPTIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash-on-delivery');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const deliveryFee = selectedDelivery.price;
  const codFee = paymentMethod === 'cash-on-delivery' ? 500 : 0;
  const grandTotal = totalPrice + deliveryFee + codFee;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
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

  const handleNext = () => {
    switch (currentStep) {
      case 'cart':
        markStepComplete('cart');
        setCurrentStep('information');
        break;
      case 'information':
        if (customerInfo.fullName && customerInfo.phoneNumber) {
          markStepComplete('information');
          setCurrentStep('delivery');
        }
        break;
      case 'delivery':
        if (deliveryAddress.city && deliveryAddress.area && deliveryAddress.streetDescription) {
          markStepComplete('delivery');
          setCurrentStep('payment');
        }
        break;
      case 'payment':
        if (paymentMethod && agreeToTerms) {
          markStepComplete('payment');
          setCurrentStep('confirm');
        }
        break;
      case 'confirm':
        handlePlaceOrder();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'information':
        setCurrentStep('cart');
        break;
      case 'delivery':
        setCurrentStep('information');
        break;
      case 'payment':
        setCurrentStep('delivery');
        break;
      case 'confirm':
        setCurrentStep('payment');
        break;
    }
  };

  const handlePlaceOrder = () => {
    // Generate order with all details
    const order = {
      id: 'ORD' + Date.now(),
      customerInfo,
      deliveryAddress,
      deliveryOption: selectedDelivery,
      payment: {
        method: paymentMethod,
        phoneNumber: paymentPhone || undefined,
        proofOfPayment: paymentProof ? URL.createObjectURL(paymentProof) : undefined,
        status: paymentMethod === 'cash-on-delivery' ? 'pending' : 'awaiting-payment'
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit
      })),
      subtotal: totalPrice,
      deliveryFee: selectedDelivery.price,
      codFee: codFee,
      total: grandTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    clearCart();

    // Navigate to confirmation with order data
    navigate('/order-confirmation', { 
      state: { 
        order,
        paymentInstructions: paymentMethod !== 'cash-on-delivery' 
      } 
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const steps = [
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'information', label: 'Information', icon: User },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirm', label: 'Confirm', icon: CheckCircle },
  ];

  // Don't render if cart is empty
  if (items.length === 0) {
    return null;
  }

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
                      ${isActive ? 'store-gradient text-primary-foreground scale-110' : 
                        isCompleted ? 'bg-store-success text-primary-foreground' : 
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
                        completedSteps.includes(step.id as CheckoutStep) ? 'bg-store-success' : 'bg-muted'}
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
                    <h2 className="text-xl font-display font-semibold">Review Your Cart</h2>
                    <Badge variant="outline" className="px-3 py-1">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-border">
                        <div className="w-16 h-16 rounded-lg bg-store-green-light flex items-center justify-center text-2xl shrink-0">
                          {item.image || '🛒'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {item.unit || '1 item'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">MK {item.price.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Total: MK {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-store-amber-light/20 rounded-xl p-4 mt-4">
                    <p className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-store-amber" />
                      <span>Estimated delivery: Same day before 6PM if ordered within 2 hours</span>
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Customer Information - Guest Only */}
              {currentStep === 'information' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-store-green-light text-primary px-3 py-1">Guest Checkout</Badge>
                    <p className="text-sm text-muted-foreground">No account needed</p>
                  </div>

                  <h2 className="text-xl font-display font-semibold mb-4">Your Information</h2>
                  
                  <div className="space-y-4">
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
                      <label className="text-sm font-medium mb-1 block">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={customerInfo.phoneNumber}
                          onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})}
                          className="pl-10"
                          placeholder="0999 123 456"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for delivery updates and payment confirmation
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Email (Optional)</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                          className="pl-10"
                          placeholder="john@example.com"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        For order confirmation and receipts
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 mt-2">
                    <p className="text-xs text-blue-700 flex items-start gap-2">
                      <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Your information is secure and only used for delivery. We never share your details.</span>
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: Delivery Information */}
              {currentStep === 'delivery' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-display font-semibold mb-4">Delivery Information</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">City *</label>
                      <select 
                        className="w-full h-11 rounded-xl border border-border bg-background px-3"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                      >
                        <option value="">Select city</option>
                        <option value="Lilongwe">Lilongwe</option>
                        <option value="Blantyre">Blantyre</option>
                        <option value="Mzuzu">Mzuzu</option>
                        <option value="Zomba">Zomba</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Area *</label>
                      <Input
                        value={deliveryAddress.area}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, area: e.target.value})}
                        placeholder="Area, Township"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Street Description *</label>
                    <Input
                      value={deliveryAddress.streetDescription}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, streetDescription: e.target.value})}
                      placeholder="Street name, house number"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Landmark (Optional)</label>
                    <Input
                      value={deliveryAddress.landmark}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, landmark: e.target.value})}
                      placeholder="e.g., Near Total filling station, Blue gate"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Delivery Instructions (Optional)</label>
                    <textarea
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm"
                      rows={3}
                      value={deliveryAddress.deliveryInstructions}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, deliveryInstructions: e.target.value})}
                      placeholder="e.g., Call when you arrive, Leave with guard"
                    />
                  </div>

                  {/* Delivery Options */}
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-2 block">Delivery Speed</label>
                    <div className="grid grid-cols-2 gap-3">
                      {DELIVERY_OPTIONS.map(option => (
                        <label
                          key={option.id}
                          className={`
                            p-3 border rounded-xl cursor-pointer transition-all
                            ${selectedDelivery.id === option.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'}
                          `}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            value={option.id}
                            checked={selectedDelivery.id === option.id}
                            onChange={() => setSelectedDelivery(option)}
                            className="hidden"
                          />
                          <p className="font-medium text-sm">{option.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{option.estimatedTime}</p>
                          <p className="text-sm font-semibold mt-2">
                            MK {option.price.toLocaleString()}
                          </p>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Payment Method */}
              {currentStep === 'payment' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-display font-semibold mb-4">Payment Method</h2>
                  
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map(method => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      
                      return (
                        <div key={method.id}>
                          <label className={`
                            flex items-start gap-4 p-4 border rounded-xl cursor-pointer
                            transition-all hover:border-primary/50
                            ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}
                          `}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={isSelected}
                              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                              className="mt-1"
                            />
                            <div className={`w-10 h-10 rounded-lg ${method.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 ${method.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                          </label>

                          {/* Airtel Money Details */}
                          {isSelected && method.id === 'airtel-money' && (
                            <div className="mt-3 p-4 bg-muted/30 rounded-xl">
                              <p className="text-sm font-medium mb-2">Payment Instructions:</p>
                              <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground mb-3">
                                {method.instructions.map((inst, i) => (
                                  <li key={i}>{inst}</li>
                                ))}
                              </ol>
                              <div className="flex items-center gap-2 bg-card p-3 rounded-lg">
                                <code className="text-sm">Merchant: {method.merchantNumber}</code>
                                <button 
                                  onClick={() => copyToClipboard(method.merchantNumber, 'airtel')}
                                  className="p-1 hover:bg-muted rounded"
                                >
                                  {copiedField === 'airtel' ? 
                                    <Check className="w-4 h-4 text-success" /> : 
                                    <Copy className="w-4 h-4" />
                                  }
                                </button>
                              </div>
                              <div className="mt-3">
                                <label className="text-sm font-medium mb-1 block">Your Airtel Number</label>
                                <Input
                                  value={paymentPhone}
                                  onChange={(e) => setPaymentPhone(e.target.value)}
                                  placeholder="0999 123 456"
                                />
                              </div>
                            </div>
                          )}

                          {/* TNM Mpamba Details */}
                          {isSelected && method.id === 'tnm-mpamba' && (
                            <div className="mt-3 p-4 bg-muted/30 rounded-xl">
                              <p className="text-sm font-medium mb-2">Payment Instructions:</p>
                              <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground mb-3">
                                {method.instructions.map((inst, i) => (
                                  <li key={i}>{inst}</li>
                                ))}
                              </ol>
                              <div className="flex items-center gap-2 bg-card p-3 rounded-lg">
                                <code className="text-sm">Merchant: {method.merchantNumber}</code>
                                <button 
                                  onClick={() => copyToClipboard(method.merchantNumber, 'tnm')}
                                  className="p-1 hover:bg-muted rounded"
                                >
                                  {copiedField === 'tnm' ? 
                                    <Check className="w-4 h-4 text-success" /> : 
                                    <Copy className="w-4 h-4" />
                                  }
                                </button>
                              </div>
                              <div className="mt-3">
                                <label className="text-sm font-medium mb-1 block">Your TNM Number</label>
                                <Input
                                  value={paymentPhone}
                                  onChange={(e) => setPaymentPhone(e.target.value)}
                                  placeholder="0888 123 456"
                                />
                              </div>
                            </div>
                          )}

                          {/* Bank Transfer Details */}
                          {isSelected && method.id === 'bank-transfer' && method.bankDetails && (
                            <div className="mt-3 p-4 bg-muted/30 rounded-xl">
                              <p className="text-sm font-medium mb-2">Bank Details:</p>
                              <div className="space-y-2 bg-card p-3 rounded-lg">
                                <p className="text-sm"><span className="text-muted-foreground">Bank:</span> {method.bankDetails.bank}</p>
                                <p className="text-sm"><span className="text-muted-foreground">Account Name:</span> {method.bankDetails.accountName}</p>
                                <p className="text-sm flex items-center gap-2">
                                  <span className="text-muted-foreground">Account Number:</span>
                                  <code>{method.bankDetails.accountNumber}</code>
                                  <button 
                                    onClick={() => copyToClipboard(method.bankDetails!.accountNumber, 'bank')}
                                    className="p-1 hover:bg-muted rounded"
                                  >
                                    {copiedField === 'bank' ? 
                                      <Check className="w-4 h-4" /> : 
                                      <Copy className="w-4 h-4" />
                                    }
                                  </button>
                                </p>
                                <p className="text-sm"><span className="text-muted-foreground">Branch:</span> {method.bankDetails.branch}</p>
                              </div>
                              <div className="mt-3">
                                <label className="text-sm font-medium mb-1 block">Upload Proof of Payment</label>
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
                                    <p className="text-xs text-success mt-2">
                                      ✓ {paymentProof.name} uploaded
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Cash on Delivery Details */}
                          {isSelected && method.id === 'cash-on-delivery' && (
                            <div className="mt-3 p-4 bg-amber-50 rounded-xl">
                              <p className="text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                                <span className="text-amber-800">
                                  Pay exactly MK {grandTotal.toLocaleString()} when your order arrives. 
                                  Have exact change ready for the delivery person.
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                      <button className="text-primary hover:underline">Refund Policy</button>. I understand that 
                      my information is secure and my order will be processed accordingly.
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 5: Order Confirmation */}
              {currentStep === 'confirm' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-display font-semibold mb-4">Review Your Order</h2>
                  
                  <div className="space-y-3">
                    <div className="bg-muted/30 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Contact Information
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {customerInfo.fullName}<br />
                        {customerInfo.phoneNumber}<br />
                        {customerInfo.email && <>{customerInfo.email}</>}
                      </p>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {deliveryAddress.streetDescription}<br />
                        {deliveryAddress.area}, {deliveryAddress.city}<br />
                        {deliveryAddress.landmark && <>Near: {deliveryAddress.landmark}<br /></>}
                        {deliveryAddress.deliveryInstructions && (
                          <>Note: {deliveryAddress.deliveryInstructions}</>
                        )}
                      </p>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Delivery Option
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedDelivery.name} - MK {selectedDelivery.price.toLocaleString()}<br />
                        <span className="text-xs">{selectedDelivery.estimatedTime}</span>
                      </p>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Method
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {paymentMethod.replace('-', ' ')}
                        {paymentMethod !== 'cash-on-delivery' && paymentPhone && (
                          <> - {paymentPhone}</>
                        )}
                      </p>
                    </div>

                    <div className="bg-store-success/10 rounded-xl p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-store-success" />
                        Secure Guest Checkout
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        No account created. Your information is encrypted and only used for this order.
                      </p>
                    </div>
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
                
                <Button
                  onClick={handleNext}
                  className="store-gradient text-primary-foreground gap-2"
                  disabled={
                    (currentStep === 'information' && (!customerInfo.fullName || !customerInfo.phoneNumber)) ||
                    (currentStep === 'delivery' && (!deliveryAddress.city || !deliveryAddress.area || !deliveryAddress.streetDescription)) ||
                    (currentStep === 'payment' && !agreeToTerms)
                  }
                >
                  {currentStep === 'confirm' ? (
                    <>Place Order Securely <Shield className="w-4 h-4" /></>
                  ) : (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-[140px]">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-2 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-muted shrink-0 flex items-center justify-center text-xs">
                      {item.image || '🛒'}
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
                  <span>MK {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>MK {selectedDelivery.price.toLocaleString()}</span>
                </div>
                {paymentMethod === 'cash-on-delivery' && (
                  <div className="flex justify-between text-store-amber">
                    <span className="text-muted-foreground">COD Fee</span>
                    <span>MK 500</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>MK {grandTotal.toLocaleString()}</span>
              </div>

              {totalPrice < 50000 && (
                <div className="mt-4 p-3 bg-store-amber-light/30 rounded-xl">
                  <p className="text-xs text-store-amber flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Add MK {(50000 - totalPrice).toLocaleString()} more for free delivery
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
                  <span>Est. delivery: {selectedDelivery.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>Guest checkout - no account</span>
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