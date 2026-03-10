import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, CreditCard, ShoppingBag, Heart,
  RefreshCw, CheckCircle, Award, Gift, Star,
  Zap, TrendingUp, Bell, Truck, Shield, Sparkles,
  Coffee, Droplets, Leaf, Users, ChevronRight,
  Percent, Wallet, Smartphone, Mail,
  HelpCircle, Package, Box, Boxes,
  Wheat, Apple, Milk, Egg, Croissant,
  Timer, AlertCircle, ThumbsUp, Globe,
  Home, Settings, Moon, Sun, Cloud,
  Tag, BadgePercent, CircleCheck, CircleDollarSign,
  Loader2, ExternalLink, User, Info, ArrowLeft,
  ArrowRight, Check, X, Phone, MapPin, PenLine
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { subscriptionService } from '@/services/subscriptionService';
import { SubscriptionSuccess } from '@/components/subscription/SubscriptionSuccess';
import type { SubscriptionPlan, DeliverySlot } from '@/types/service.types';

// Icon mapping component
const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
  switch(iconName) {
    case 'Leaf': return <Leaf className={className} />;
    case 'Milk': return <Milk className={className} />;
    case 'Croissant': return <Croissant className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Package': return <Package className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Apple': return <Apple className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    default: return <Package className={className} />;
  }
};

interface FormData {
  // Step 1 - Plan (already selected)
  // Step 2 - Personal
  fullName: string;
  email: string;
  phone: string;
  // Step 3 - Delivery
  deliveryAddress: string;
  deliveryDay: string;
  deliveryTime: string;
  deliveryInstructions: string;
  // Step 4 - Payment
  paymentMethod: 'cash' | 'airtel_money' | 'tnm_mpamba' | 'card';
  paymentReference: string;
  // Step 5 - Confirmation
  termsAccepted: boolean;
}

const STORAGE_KEY = 'subscription_form_data';

const Subscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {
          fullName: '',
          email: '',
          phone: '',
          deliveryAddress: '',
          deliveryDay: '',
          deliveryTime: '',
          deliveryInstructions: '',
          paymentMethod: 'cash',
          paymentReference: '',
          termsAccepted: false
        };
      }
    }
    return {
      fullName: '',
      email: '',
      phone: '',
      deliveryAddress: '',
      deliveryDay: '',
      deliveryTime: '',
      deliveryInstructions: '',
      paymentMethod: 'cash',
      paymentReference: '',
      termsAccepted: false
    };
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdSubscription, setCreatedSubscription] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { id: 'all', name: 'All Plans', icon: Package },
    { id: 'vegetables', name: 'Vegetables', icon: Leaf },
    { id: 'dairy', name: 'Dairy', icon: Milk },
    { id: 'bread', name: 'Bread', icon: Croissant },
    { id: 'family', name: 'Family', icon: Users },
    { id: 'mixed', name: 'Mixed', icon: Package }
  ];

  useEffect(() => {
    fetchPlans();
    fetchDeliverySlots();
  }, []);

  useEffect(() => {
    // Save form data to localStorage when it changes
    if (selectedPlan) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, selectedPlan]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.getPublicPlans();
      console.log('Fetched subscription plans:', data);
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliverySlots = async () => {
    setSlotsLoading(true);
    try {
      const slots = await subscriptionService.getDeliverySlots();
      setDeliverySlots(slots);
    } catch (error) {
      console.error('Error fetching delivery slots:', error);
      // Don't show toast, just use empty array
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubscribe = (e: React.MouseEvent, plan: SubscriptionPlan) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Subscribe clicked for plan:', plan.name, plan.id);
    setSelectedPlan(plan);
    setCurrentStep(1);
    // Clear previous errors
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
    setCurrentStep(1);
    // Don't clear form data in case user reopens
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^(\+?265|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Invalid Malawi phone number';
      }
    }

    if (step === 3) {
      if (!formData.deliveryAddress.trim()) {
        newErrors.deliveryAddress = 'Delivery address is required';
      }
      if (!formData.deliveryDay) {
        newErrors.deliveryDay = 'Please select a delivery day';
      }
      if (!formData.deliveryTime) {
        newErrors.deliveryTime = 'Please select a delivery time';
      }
    }

    if (step === 4) {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = 'Please select a payment method';
      }
      if ((formData.paymentMethod === 'airtel_money' || formData.paymentMethod === 'tnm_mpamba') && 
          !formData.paymentReference.trim()) {
        newErrors.paymentReference = 'Payment reference is required for mobile money';
      }
    }

    if (step === 5) {
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = 'You must accept the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(5) || !selectedPlan) return;

    setSubmitting(true);
    try {
      // Calculate total paid (first payment)
      const totalPaid = selectedPlan.price + (selectedPlan.setupFee || 0);

      const subscriptionData = {
        planId: selectedPlan.id,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        startDate: new Date().toISOString().split('T')[0],
        deliveryDay: formData.deliveryDay,
        deliveryTime: formData.deliveryTime,
        deliveryAddress: formData.deliveryAddress,
        deliveryInstructions: formData.deliveryInstructions || undefined,
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference || undefined,
        totalPaid: totalPaid
      };

      const response = await subscriptionService.createSubscription(subscriptionData);
      
      setCreatedSubscription(response.subscription);
      setShowSuccess(true);
      
      // Clear saved form data
      localStorage.removeItem(STORAGE_KEY);
      
      toast({
        title: 'Subscription Created!',
        description: 'Check your email for the management link.',
      });
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'complete';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const filteredPlans = plans.filter(plan => {
    if (selectedCategory === 'all') return true;
    return plan.category === selectedCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Badge className="bg-white/20 text-white border-none mb-4 px-4 py-1">
              🎉 Save up to 20% on subscriptions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Fresh Groceries, <br />
              <span className="text-yellow-300">Delivered on Your Schedule</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Choose from our curated subscription plans. Skip, pause, or cancel anytime. 
              No fees, no commitments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-white/90 text-lg gap-2"
                onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Package className="w-5 h-5" />
                View Plans
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20 text-lg gap-2"
                onClick={() => navigate('/manage/find')}
              >
                <ExternalLink className="w-5 h-5" />
                Manage Existing
              </Button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="var(--background)" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Benefits Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: 'Flexible Schedule', desc: 'Choose your delivery day' },
            { icon: RefreshCw, label: 'Skip or Pause', desc: 'Adjust anytime' },
            { icon: Truck, label: 'Free Delivery', desc: 'On all subscriptions' },
            { icon: Shield, label: 'Quality Guarantee', desc: 'Fresh or replaced' }
          ].map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <Card key={i} className="border-2 border-muted hover:border-primary/20 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-sm">{benefit.label}</p>
                  <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Category Filters */}
        <section id="plans-section">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold">Choose Your Plan</h2>
              <p className="text-muted-foreground mt-1">
                Select the subscription that works best for you
              </p>
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredPlans.length} subscription {filteredPlans.length === 1 ? 'plan' : 'plans'}
          </p>
        </section>

        {/* Subscription Plans Grid */}
        <section>
          {filteredPlans.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No plans found</h3>
              <p className="text-muted-foreground mb-6">Try selecting a different category</p>
              <Button onClick={() => setSelectedCategory('all')} variant="outline" className="rounded-full">
                View All Plans
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPlans.map((plan, index) => {
                const yearlyPrice = plan.price * 12;
                const yearlyDiscount = plan.discount ? plan.discount + 5 : 15;
                const yearlySavings = yearlyPrice * (yearlyDiscount / 100);
                const displayOriginalPrice = plan.originalPrice;

                return (
                  <Card
                    key={plan.id}
                    className={`relative group hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in overflow-hidden ${
                      plan.popular ? 'border-2 border-yellow-400' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none shadow-lg">
                          <Award className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    {/* Best Value badge */}
                    {plan.bestValue && !plan.popular && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none shadow-lg">
                          <BadgePercent className="w-3 h-3 mr-1" />
                          Best Value
                        </Badge>
                      </div>
                    )}

                    {/* Background pattern */}
                    <div className={`absolute inset-0 opacity-5 ${plan.bgColor}`}>
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, ${plan.color.replace('text-', '')} 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                      }} />
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-xl ${plan.bgColor} flex items-center justify-center`}>
                            <IconComponent iconName={plan.icon} className={`w-7 h-7 ${plan.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{plan.popularity}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Price */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-3xl font-bold text-primary">
                          MK {plan.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{plan.interval}
                        </span>
                        {displayOriginalPrice && displayOriginalPrice > plan.price && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              MK {displayOriginalPrice.toLocaleString()}
                            </span>
                            <Badge className="bg-green-500 text-white border-none">
                              <BadgePercent className="w-3 h-3 mr-1" />
                              Save {plan.discount}%
                            </Badge>
                          </>
                        )}
                      </div>

                      {/* Items count */}
                      <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-lg">
                        <Package className="w-4 h-4 text-primary" />
                        <span>{plan.items} items per delivery</span>
                      </div>

                      {/* Setup fee */}
                      {plan.setupFee && plan.setupFee > 0 && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                          <Info className="w-3 h-3" />
                          <span>One-time setup fee: MK {plan.setupFee.toLocaleString()}</span>
                        </div>
                      )}

                      {/* Trial days */}
                      {plan.trialDays && plan.trialDays > 0 && (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 p-2 rounded-lg">
                          <Gift className="w-3 h-3" />
                          <span>{plan.trialDays} days free trial</span>
                        </div>
                      )}

                      {/* Features */}
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3">
                      <Button 
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white h-12 gap-2 text-base hover:from-indigo-600 hover:to-purple-600 transition-all cursor-pointer relative z-20"
                        onClick={(e) => handleSubscribe(e, plan)}
                        type="button"
                      >
                        <Calendar className="w-4 h-4" />
                        Subscribe Now
                      </Button>
                      
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Skip anytime
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Free delivery
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Guaranteed
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="bg-muted/30 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-display font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Choose Plan', desc: 'Select your favorite subscription plan' },
              { step: 2, title: 'Set Details', desc: 'Choose delivery day and address' },
              { step: 3, title: 'We Deliver', desc: 'Fresh groceries on your schedule' },
              { step: 4, title: 'Enjoy & Save', desc: 'Skip, pause, or cancel anytime' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* No Account Banner */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-display font-bold mb-4">No Account Needed</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe without creating an account. You'll receive a secure link to manage your subscription via email.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-white/90 text-lg gap-2"
              onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Package className="w-5 h-5" />
              Start Subscribing
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/20 text-lg gap-2"
              onClick={() => navigate('/manage/find')}
            >
              <Mail className="w-5 h-5" />
              Already have a subscription?
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-display font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: 'Can I skip a delivery?',
                a: 'Yes! You can skip any delivery through your management link. No questions asked.'
              },
              {
                q: 'How do I cancel?',
                a: 'Cancel anytime with one click from your management link. No fees, no hassle.'
              },
              {
                q: 'What areas do you deliver to?',
                a: 'We currently deliver to Lilongwe and Blantyre city areas. Check your address during checkout.'
              },
              {
                q: 'What if I\'m not home?',
                a: 'You can leave delivery instructions, or we\'ll attempt delivery the next day.'
              }
            ].map((faq, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Subscription Modal */}
      {selectedPlan && (
        <Dialog open={showModal} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">
                Subscribe to {selectedPlan.name}
              </DialogTitle>
              <DialogDescription>
                Complete the steps below to start your subscription
              </DialogDescription>
            </DialogHeader>

            {/* Progress Steps */}
            <div className="my-6">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4, 5].map(step => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      getStepStatus(step) === 'complete' ? 'bg-green-500 text-white' :
                      getStepStatus(step) === 'current' ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {getStepStatus(step) === 'complete' ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">
                      {step === 1 && 'Plan'}
                      {step === 2 && 'Personal'}
                      {step === 3 && 'Delivery'}
                      {step === 4 && 'Payment'}
                      {step === 5 && 'Confirm'}
                    </span>
                  </div>
                ))}
              </div>
              <Progress value={(currentStep - 1) * 25} className="h-2" />
            </div>

            {/* Step 1: Plan Summary */}
            {currentStep === 1 && (
              <div className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${selectedPlan.bgColor} flex items-center justify-center`}>
                        <IconComponent iconName={selectedPlan.icon} className={`w-6 h-6 ${selectedPlan.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{selectedPlan.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold">MK {selectedPlan.price.toLocaleString()}/{selectedPlan.interval}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items per delivery</span>
                      <span>{selectedPlan.items} items</span>
                    </div>
                    {selectedPlan.setupFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Setup fee</span>
                        <span className="text-amber-600">MK {selectedPlan.setupFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-2">Includes:</p>
                      <ul className="space-y-1">
                        {selectedPlan.features.map((feature, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <div className="space-y-4 py-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="John Doe"
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Your management link will be sent to this email
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="0999123456"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Delivery Details */}
            {currentStep === 3 && (
              <div className="space-y-4 py-4">
                <h3 className="font-semibold text-lg">Delivery Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                      placeholder="Street address, area, landmark"
                      rows={3}
                      className={errors.deliveryAddress ? 'border-red-500' : ''}
                    />
                    {errors.deliveryAddress && <p className="text-xs text-red-500 mt-1">{errors.deliveryAddress}</p>}
                  </div>
                  <div>
                    <Label htmlFor="deliveryDay">Preferred Delivery Day *</Label>
                    <Select 
                      value={formData.deliveryDay} 
                      onValueChange={(value) => setFormData({...formData, deliveryDay: value})}
                    >
                      <SelectTrigger className={errors.deliveryDay ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.deliveryDay && <p className="text-xs text-red-500 mt-1">{errors.deliveryDay}</p>}
                  </div>
                  <div>
                    <Label htmlFor="deliveryTime">Preferred Delivery Time *</Label>
                    <Select 
                      value={formData.deliveryTime} 
                      onValueChange={(value) => setFormData({...formData, deliveryTime: value})}
                    >
                      <SelectTrigger className={errors.deliveryTime ? 'border-red-500' : ''}>
                        <SelectValue placeholder={slotsLoading ? "Loading slots..." : "Select a time slot"} />
                      </SelectTrigger>
                      <SelectContent>
                        {deliverySlots.length > 0 ? (
                          deliverySlots.map(slot => (
                            <SelectItem key={slot.id} value={slot.time}>
                              {slot.description} {slot.estimated_time && `(${slot.estimated_time})`}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                            <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.deliveryTime && <p className="text-xs text-red-500 mt-1">{errors.deliveryTime}</p>}
                  </div>
                  <div>
                    <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      value={formData.deliveryInstructions}
                      onChange={(e) => setFormData({...formData, deliveryInstructions: e.target.value})}
                      placeholder="Gate code, landmarks, special instructions"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className="space-y-4 py-4">
                <h3 className="font-semibold text-lg">Payment Method</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="paymentMethod">Select Payment Method *</Label>
                    <Select 
                      value={formData.paymentMethod} 
                      onValueChange={(value: any) => setFormData({...formData, paymentMethod: value, paymentReference: ''})}
                    >
                      <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Choose payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash on Delivery</SelectItem>
                        <SelectItem value="airtel_money">Airtel Money</SelectItem>
                        <SelectItem value="tnm_mpamba">TNM Mpamba</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && <p className="text-xs text-red-500 mt-1">{errors.paymentMethod}</p>}
                  </div>

                  {(formData.paymentMethod === 'airtel_money' || formData.paymentMethod === 'tnm_mpamba') && (
                    <div>
                      <Label htmlFor="paymentReference">
                        {formData.paymentMethod === 'airtel_money' ? 'Airtel Money Number *' : 'TNM Mpamba Number *'}
                      </Label>
                      <Input
                        id="paymentReference"
                        value={formData.paymentReference}
                        onChange={(e) => setFormData({...formData, paymentReference: e.target.value})}
                        placeholder="0999123456"
                        className={errors.paymentReference ? 'border-red-500' : ''}
                      />
                      {errors.paymentReference && <p className="text-xs text-red-500 mt-1">{errors.paymentReference}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        You'll receive a payment prompt on your phone
                      </p>
                    </div>
                  )}

                  <div className="bg-muted/50 p-4 rounded-lg mt-4">
                    <p className="font-medium mb-2">Payment Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Plan price</span>
                        <span>MK {selectedPlan.price.toLocaleString()}</span>
                      </div>
                      {selectedPlan.setupFee > 0 && (
                        <div className="flex justify-between">
                          <span>Setup fee</span>
                          <span>MK {selectedPlan.setupFee.toLocaleString()}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total due today</span>
                        <span>MK {(selectedPlan.price + (selectedPlan.setupFee || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-4 py-4">
                <h3 className="font-semibold text-lg">Confirm Your Subscription</h3>
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-medium">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span>MK {selectedPlan.price.toLocaleString()}/{selectedPlan.interval}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span>{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span>{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Day</span>
                      <span className="capitalize">{formData.deliveryDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Time</span>
                      <span className="capitalize">{formData.deliveryTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="capitalize">{formData.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total due today</span>
                      <span>MK {(selectedPlan.price + (selectedPlan.setupFee || 0)).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="terms" 
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, termsAccepted: checked as boolean})
                    }
                    className={errors.termsAccepted ? 'border-red-500' : ''}
                  />
                  <div>
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary hover:underline" target="_blank">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                        Privacy Policy
                      </Link>
                    </Label>
                    {errors.termsAccepted && (
                      <p className="text-xs text-red-500 mt-1">{errors.termsAccepted}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex justify-between gap-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              {currentStep < 5 ? (
                <Button onClick={handleNext} className="gap-2 ml-auto">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="gap-2 ml-auto bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm & Subscribe
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Dialog */}
      {createdSubscription && (
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-2xl p-0">
            <SubscriptionSuccess 
              subscription={createdSubscription} 
              onClose={() => {
                setShowSuccess(false);
                setSelectedPlan(null);
                setCurrentStep(1);
                setFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  deliveryAddress: '',
                  deliveryDay: '',
                  deliveryTime: '',
                  deliveryInstructions: '',
                  paymentMethod: 'cash',
                  paymentReference: '',
                  termsAccepted: false
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <Footer />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Subscriptions;