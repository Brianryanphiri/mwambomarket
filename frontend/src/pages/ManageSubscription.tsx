import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Edit,
  Save,
  Pause,
  Play,
  Trash2,
  History,
  CreditCard,
  Home,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Gift,
  Download,
  Printer,
  ExternalLink
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { subscriptionService } from '@/services/subscriptionService';

const deliveryDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const ManageSubscription = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pauseDate, setPauseDate] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any[]>([]);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    deliveryDay: '',
    deliveryTime: '',
    deliveryAddress: '',
    deliveryInstructions: ''
  });

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      toast({
        title: 'Access Denied',
        description: 'Valid management link required',
        variant: 'destructive',
      });
      navigate('/subscriptions');
      return;
    }

    fetchSubscription();
  }, [token, email]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.getSubscriptionByToken(token!, email!);
      setSubscription(data);
      setFormData({
        deliveryDay: data.deliveryDay,
        deliveryTime: data.deliveryTime || '',
        deliveryAddress: data.deliveryAddress,
        deliveryInstructions: data.deliveryInstructions || ''
      });
      
      // Fetch delivery history
      const history = await subscriptionService.getDeliveryHistory(data.id);
      setDeliveries(history);
      
      // Calculate upcoming deliveries
      calculateUpcomingDeliveries(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive',
      });
      navigate('/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const calculateUpcomingDeliveries = (sub: any) => {
    const upcoming = [];
    let currentDate = new Date(sub.nextDeliveryDate);
    const intervalWeeks = sub.planInterval === 'weekly' ? 1 : sub.planInterval === 'biweekly' ? 2 : 4;
    
    // Calculate next 3 deliveries
    for (let i = 0; i < 3; i++) {
      upcoming.push({
        date: new Date(currentDate),
        status: i === 0 ? 'Next' : 'Scheduled'
      });
      currentDate.setDate(currentDate.getDate() + (intervalWeeks * 7));
    }
    
    setUpcomingDeliveries(upcoming);
  };

  const handleUpdate = async () => {
    try {
      await subscriptionService.updateSubscription(subscription.id, formData);
      
      toast({
        title: 'Success',
        description: 'Your subscription has been updated successfully',
      });
      
      setEditing(false);
      fetchSubscription();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const handlePause = async () => {
    if (!pauseDate) {
      toast({
        title: 'Date Required',
        description: 'Please select a date to resume',
        variant: 'destructive',
      });
      return;
    }

    try {
      await subscriptionService.pauseSubscription(subscription.id, pauseDate);
      
      toast({
        title: 'Subscription Paused',
        description: `Your subscription is paused until ${new Date(pauseDate).toLocaleDateString()}`,
      });
      
      setPausing(false);
      fetchSubscription();
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause subscription',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async () => {
    try {
      await subscriptionService.cancelSubscription(subscription.id, cancelReason);
      
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled successfully',
      });
      
      setCancelling(false);
      fetchSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
  };

  const handleResume = async () => {
    try {
      await subscriptionService.resumeSubscription(subscription.id);
      
      toast({
        title: 'Subscription Resumed',
        description: 'Your subscription is now active again',
      });
      
      fetchSubscription();
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to resume subscription',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active ✓</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500 text-white">Paused ⏸️</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Cancelled ✕</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered':
        return <Badge className="bg-green-500 text-white">Delivered ✓</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500 text-white">Scheduled 📅</Badge>;
      case 'processing':
        return <Badge className="bg-purple-500 text-white">Processing 🔄</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-orange-500 text-white">Out for Delivery 🚚</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">Failed ⚠️</Badge>;
      case 'skipped':
        return <Badge className="bg-gray-500 text-white">Skipped ⏭️</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-display font-bold mb-4">Subscription Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The subscription you're looking for doesn't exist or the link has expired.
          </p>
          <Button onClick={() => navigate('/subscriptions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse Subscriptions
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <button onClick={() => navigate('/subscriptions')} className="text-muted-foreground hover:text-primary transition-colors">
              Subscriptions
            </button>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium text-foreground">Manage Subscription</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Manage Your Subscription</h1>
            <p className="text-muted-foreground mt-1">
              No account needed - manage using this secure link
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1 font-mono">
              #{subscription.subscriptionNumber}
            </Badge>
            {getStatusBadge(subscription.status)}
          </div>
        </div>

        {/* Security Notice */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Secure Management Link
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                You're managing subscription for {subscription.customerEmail}. 
                This link is unique and expires in 24 hours. Don't share it with others.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Banner */}
        {subscription.status === 'active' && (
          <Card className="mb-6 bg-green-50 dark:bg-green-950/30 border-green-200">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">Active Subscription</p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Next delivery: {new Date(subscription.nextDeliveryDate).toLocaleDateString('en-MW', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setPausing(true)} 
                  variant="outline" 
                  className="bg-white dark:bg-gray-900 gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
                <Button 
                  onClick={() => setCancelling(true)} 
                  variant="outline" 
                  className="bg-white dark:bg-gray-900 text-red-600 hover:text-red-700 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {subscription.status === 'paused' && (
          <Card className="mb-6 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Pause className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">Paused Subscription</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    Paused until: {new Date(subscription.pauseUntil).toLocaleDateString('en-MW', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <Button onClick={handleResume} variant="outline" className="bg-white dark:bg-gray-900 gap-2">
                <Play className="w-4 h-4" />
                Resume Subscription
              </Button>
            </CardContent>
          </Card>
        )}

        {subscription.status === 'cancelled' && (
          <Card className="mb-6 bg-red-50 dark:bg-red-950/30 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">Cancelled Subscription</p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    Cancelled on: {new Date(subscription.cancelledAt).toLocaleDateString('en-MW', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {subscription.cancellationReason && (
                    <p className="text-xs text-red-500 mt-1">
                      Reason: {subscription.cancellationReason}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Home className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="gap-2">
              <History className="w-4 h-4" />
              Deliveries
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Edit className="w-4 h-4" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Plan Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Plan Details</CardTitle>
                  <CardDescription>Your subscription plan information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl ${subscription.planBgColor} flex items-center justify-center text-3xl`}>
                      {subscription.planIcon === 'Leaf' && '🥬'}
                      {subscription.planIcon === 'Milk' && '🥛'}
                      {subscription.planIcon === 'Croissant' && '🥐'}
                      {subscription.planIcon === 'Users' && '👪'}
                      {subscription.planIcon === 'Package' && '📦'}
                      {subscription.planIcon === 'Heart' && '❤️'}
                      {subscription.planIcon === 'Apple' && '🍎'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{subscription.planName}</h3>
                      <p className="text-sm text-muted-foreground">{subscription.planDescription}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-bold">MK {subscription.planPrice.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">per {subscription.planInterval}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Items per delivery</p>
                      <p className="text-lg font-bold">{subscription.planItems} items</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Started on</p>
                      <p className="font-medium">
                        {new Date(subscription.startDate).toLocaleDateString('en-MW')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total paid to date</p>
                      <p className="font-medium">MK {subscription.totalPaid.toLocaleString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Plan Features</p>
                    <ul className="space-y-2">
                      {subscription.planFeatures?.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details & Upcoming */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{subscription.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${subscription.customerEmail}`} className="hover:text-primary">
                        {subscription.customerEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${subscription.customerPhone}`} className="hover:text-primary">
                        {subscription.customerPhone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm">{subscription.deliveryAddress}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Deliveries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingDeliveries.map((delivery, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm">
                              {delivery.date.toLocaleDateString('en-MW', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <Badge variant={i === 0 ? 'default' : 'outline'}>
                            {delivery.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Deliveries Tab */}
          <TabsContent value="deliveries">
            <Card>
              <CardHeader>
                <CardTitle>Delivery History</CardTitle>
                <CardDescription>Track all your past and upcoming deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                {deliveries.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No deliveries yet</p>
                    <p className="text-sm text-muted-foreground">
                      Your first delivery is scheduled for{' '}
                      {new Date(subscription.nextDeliveryDate).toLocaleDateString('en-MW')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deliveries.map((delivery, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(delivery.deliveryDate).toLocaleDateString('en-MW', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            {delivery.trackingNumber && (
                              <p className="text-xs text-muted-foreground">
                                Tracking: {delivery.trackingNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {getDeliveryStatusBadge(delivery.status)}
                          {delivery.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{delivery.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Subscription</CardTitle>
                <CardDescription>
                  Update your delivery preferences (changes apply to future deliveries)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Day</p>
                        <p className="font-medium capitalize">{subscription.deliveryDay}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Time</p>
                        <p className="font-medium">{subscription.deliveryTime || 'Anytime'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Address</p>
                      <p className="font-medium">{subscription.deliveryAddress}</p>
                    </div>
                    {subscription.deliveryInstructions && (
                      <div>
                        <p className="text-sm text-muted-foreground">Instructions</p>
                        <p className="text-sm">{subscription.deliveryInstructions}</p>
                      </div>
                    )}
                    <Button onClick={() => setEditing(true)} className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Details
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deliveryDay">Delivery Day</Label>
                        <Select 
                          value={formData.deliveryDay} 
                          onValueChange={(value) => setFormData({...formData, deliveryDay: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryDays.map(day => (
                              <SelectItem key={day} value={day.toLowerCase()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="deliveryTime">Preferred Time</Label>
                        <Input
                          id="deliveryTime"
                          value={formData.deliveryTime}
                          onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                          placeholder="e.g., Between 10am-2pm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions">Delivery Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={formData.deliveryInstructions}
                        onChange={(e) => setFormData({...formData, deliveryInstructions: e.target.value})}
                        placeholder="Gate code, landmarks, etc."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleUpdate} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Your payment method and billing history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="font-medium capitalize">{subscription.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  {subscription.paymentReference && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Reference: {subscription.paymentReference}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Billing Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Plan price ({subscription.planInterval})</span>
                      <span>MK {subscription.planPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total paid to date</span>
                      <span className="font-bold">MK {subscription.totalPaid.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Invoices
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Printer className="w-4 h-4" />
                    Print Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Need Help Section */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Need help with your subscription?</p>
                <p className="text-sm text-muted-foreground">
                  Contact our support team for assistance
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="mailto:support@mwambostore.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+265999123456">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pause Dialog */}
      <Dialog open={pausing} onOpenChange={setPausing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Subscription</DialogTitle>
            <DialogDescription>
              Your subscription will be paused until the date you select.
              You can resume anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="pauseDate">Resume Date</Label>
            <Input
              id="pauseDate"
              type="date"
              value={pauseDate}
              onChange={(e) => setPauseDate(e.target.value)}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              No deliveries will be made until this date.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPausing(false)}>
              Cancel
            </Button>
            <Button onClick={handlePause} className="bg-yellow-500 hover:bg-yellow-600">
              Pause Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelling} onOpenChange={setCancelling}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancelReason">Reason for cancelling (optional)</Label>
            <Textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Tell us why you're leaving..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-500 hover:bg-red-600">
              Yes, Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default ManageSubscription;