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
  Loader2, ExternalLink, User, Info
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { subscriptionService } from '@/services/subscriptionService';
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal';
import { SubscriptionSuccess } from '@/components/subscription/SubscriptionSuccess';
import type { SubscriptionPlan } from '@/types/service.types';

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

const Subscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdSubscription, setCreatedSubscription] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPlans: 0,
    activeSubscribers: 0,
    totalSavings: 0
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (plans.length > 0) {
      fetchStats();
    }
  }, [plans]);

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

  const fetchStats = async () => {
    try {
      const totalSavings = plans.reduce((sum, plan) => sum + (plan.savings || 0), 0);
      
      setStats({
        totalPlans: plans.length,
        activeSubscribers: 1234,
        totalSavings: totalSavings
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubscribe = (e: React.MouseEvent, plan: SubscriptionPlan) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Subscribe clicked for plan:', plan.name, plan.id);
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleSubscriptionSuccess = (subscription: any) => {
    console.log('Subscription success:', subscription);
    setCreatedSubscription(subscription);
    setShowModal(false);
    setShowSuccess(true);
    
    localStorage.setItem('last_subscription', JSON.stringify({
      id: subscription.id,
      number: subscription.subscriptionNumber,
      email: subscription.customerEmail
    }));
  };

  const handleFindSubscription = () => {
    toast({
      title: 'Find Your Subscription',
      description: 'Please check your email for the management link or contact support',
    });
  };

  const handleGetStarted = () => {
    document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredPlans = plans.filter(plan => {
    const intervalMatch = selectedInterval === 'all' || plan.interval === selectedInterval;
    const categoryMatch = selectedCategory === 'all' || plan.category === selectedCategory;
    return intervalMatch && categoryMatch;
  });

  const categoryIcons = {
    vegetables: Leaf,
    dairy: Milk,
    bread: Croissant,
    family: Users,
    mixed: Package
  };

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
      
      {/* Hero Section - keep as is */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        {/* ... hero section content ... */}
      </div>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Benefits Grid - keep as is */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* ... benefits cards ... */}
        </section>

        {/* Filters */}
        <section id="plans-section">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Subscription Plans</h2>
                <p className="text-sm text-muted-foreground">Choose what works for you</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedInterval === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedInterval('all')}
                className="rounded-full gap-2"
              >
                <Calendar className="w-4 h-4" />
                All
              </Button>
              <Button
                variant={selectedInterval === 'weekly' ? 'default' : 'outline'}
                onClick={() => setSelectedInterval('weekly')}
                className="rounded-full gap-2"
              >
                <Clock className="w-4 h-4" />
                Weekly
              </Button>
              <Button
                variant={selectedInterval === 'biweekly' ? 'default' : 'outline'}
                onClick={() => setSelectedInterval('biweekly')}
                className="rounded-full gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Bi-Weekly
              </Button>
              <Button
                variant={selectedInterval === 'monthly' ? 'default' : 'outline'}
                onClick={() => setSelectedInterval('monthly')}
                className="rounded-full gap-2"
              >
                <Calendar className="w-4 h-4" />
                Monthly
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className={`px-4 py-2 cursor-pointer text-sm gap-2 ${
                  selectedCategory === 'all' ? 'bg-primary' : 'hover:bg-primary/10'
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                <Package className="w-4 h-4" />
                All Categories
              </Badge>
              {Object.entries(categoryIcons).map(([cat, Icon]) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className={`px-4 py-2 cursor-pointer text-sm gap-2 capitalize ${
                    selectedCategory === cat ? 'bg-primary' : 'hover:bg-primary/10'
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <Icon className="w-4 h-4" />
                  {cat}
                </Badge>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="rounded-full gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {billingCycle === 'monthly' ? 'Show Yearly Pricing' : 'Show Monthly Pricing'}
            </Button>
          </div>

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
              <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
              <Button onClick={() => {
                setSelectedInterval('all');
                setSelectedCategory('all');
              }} variant="outline" className="rounded-full">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPlans.map((plan, index) => {
                const yearlyPrice = plan.price * 12;
                const yearlyDiscount = plan.discount ? plan.discount + 5 : 15;
                const yearlySavings = yearlyPrice * (yearlyDiscount / 100);
                const displayPrice = billingCycle === 'yearly' ? yearlyPrice - yearlySavings : plan.price;
                const displayOriginalPrice = billingCycle === 'yearly' ? yearlyPrice : plan.originalPrice;

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
                          MK {displayPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{billingCycle === 'yearly' ? 'year' : plan.interval}
                        </span>
                        {displayOriginalPrice && displayOriginalPrice > displayPrice && (
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

        {/* Rest of the sections remain the same */}
        {/* How It Works, No Account Banner, FAQ, Newsletter */}
      </div>

      {/* Subscription Modal */}
      {selectedPlan && (
        <SubscriptionModal
          open={showModal}
          onOpenChange={setShowModal}
          plan={selectedPlan}
          onSuccess={handleSubscriptionSuccess}
        />
      )}

      {/* Success Dialog */}
      {createdSubscription && (
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-2xl p-0">
            <SubscriptionSuccess subscription={createdSubscription} />
          </DialogContent>
        </Dialog>
      )}

      <Footer />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
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