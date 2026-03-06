import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Package,
  Truck,
  CreditCard,
  DollarSign,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Ban,
  Trash2,
  Loader2,
  MoreHorizontal,
  Download,
  Printer,
  Send,
  Bell,
  MessageSquare,
  FileText,
  History,
  Settings,
  Shield,
  Award,
  Star,
  TrendingUp,
  Users,
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance, addDays, subDays } from 'date-fns';

interface Subscriber {
  id: string;
  subscriptionNumber: string;
  planId: string;
  planName: string;
  planPrice: number;
  planInterval: string;
  planDescription: string;
  planFeatures: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar?: string;
  customerNotes?: string;
  startDate: string;
  nextDeliveryDate: string;
  deliveryDay: string;
  deliveryTime?: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  paymentDetails?: {
    accountName?: string;
    accountNumber?: string;
    bank?: string;
  };
  totalPaid: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  missedDeliveries: number;
  status: 'pending' | 'active' | 'paused' | 'cancelled' | 'expired';
  pauseUntil?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  callStatus: 'pending' | 'called' | 'confirmed' | 'no_answer' | 'call_later';
  callNotes?: string;
  lastCallDate?: string;
  nextCallDate?: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  reminderSent: boolean;
  lastReminderDate?: string;
  reminderPreferences: {
    email: boolean;
    sms: boolean;
    payment: boolean;
    delivery: boolean;
  };
  notes: Array<{
    id: string;
    content: string;
    type: string;
    createdBy: string;
    createdAt: string;
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Delivery {
  id: string;
  deliveryNumber: string;
  scheduledDate: string;
  actualDeliveryDate?: string;
  status: 'scheduled' | 'processing' | 'out_for_delivery' | 'delivered' | 'failed' | 'skipped' | 'rescheduled';
  riderName?: string;
  trackingNumber?: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: Array<{ name: string; quantity: number }>;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

const SubscriberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const [callForm, setCallForm] = useState({
    status: 'pending',
    notes: '',
    callLaterDate: ''
  });
  
  const [noteForm, setNoteForm] = useState({
    content: '',
    type: 'general'
  });
  
  const [reminderForm, setReminderForm] = useState({
    type: 'payment',
    message: '',
    sendEmail: true,
    sendSms: false
  });
  
  const [pauseForm, setPauseForm] = useState({
    untilDate: '',
    reason: ''
  });
  
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryInstructions: '',
    deliveryDay: '',
    deliveryTime: '',
    paymentMethod: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchSubscriberDetails();
    }
  }, [id]);

  const fetchSubscriberDetails = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockSubscriber: Subscriber = {
        id: id || '1',
        subscriptionNumber: 'SUB-202602-0001',
        planId: '7',
        planName: 'Weekly Veggie Box',
        planPrice: 15000,
        planInterval: 'weekly',
        planDescription: 'Fresh vegetables delivered every week',
        planFeatures: [
          '8-10 seasonal vegetables',
          'Free delivery',
          'Skip or cancel anytime',
          'Flexible delivery day',
          'Quality guarantee'
        ],
        customerName: 'Brian Phiri',
        customerEmail: 'brian.phiri@example.com',
        customerPhone: '+265991234567',
        customerNotes: 'Prefers morning deliveries, has a dog at home',
        startDate: '2026-02-25',
        nextDeliveryDate: '2026-03-04',
        deliveryDay: 'tuesday',
        deliveryTime: '10:00 - 12:00',
        deliveryAddress: 'Area 123, Lilongwe, Near the market',
        deliveryInstructions: 'Leave with security guard if not home',
        paymentMethod: 'airtel_money',
        paymentDetails: {
          accountName: 'Brian Phiri',
          accountNumber: '0991234567'
        },
        totalPaid: 15000,
        totalDeliveries: 1,
        successfulDeliveries: 1,
        missedDeliveries: 0,
        status: 'active',
        callStatus: 'confirmed',
        lastCallDate: '2026-02-24T14:30:00Z',
        paymentStatus: 'paid',
        lastPaymentDate: '2026-02-25T10:30:00Z',
        nextPaymentDate: '2026-03-04T10:30:00Z',
        reminderSent: true,
        lastReminderDate: '2026-02-24T09:00:00Z',
        reminderPreferences: {
          email: true,
          sms: true,
          payment: true,
          delivery: true
        },
        notes: [
          {
            id: '1',
            content: 'Customer confirmed subscription details over phone',
            type: 'call',
            createdBy: 'Admin User',
            createdAt: '2026-02-24T14:35:00Z'
          },
          {
            id: '2',
            content: 'Prefers delivery between 10am-12pm',
            type: 'delivery',
            createdBy: 'Admin User',
            createdAt: '2026-02-24T14:36:00Z'
          }
        ],
        tags: ['vip', 'morning-delivery', 'verified'],
        createdAt: '2026-02-25T10:30:00Z',
        updatedAt: '2026-02-25T10:30:00Z'
      };

      const mockDeliveries: Delivery[] = [
        {
          id: '1',
          deliveryNumber: 'DEL-202602-001',
          scheduledDate: '2026-02-25',
          actualDeliveryDate: '2026-02-25T12:15:00Z',
          status: 'delivered',
          riderName: 'James Banda',
          trackingNumber: 'TRK123456',
          amount: 15000,
          paymentStatus: 'paid',
          items: [{ name: 'Weekly Veggie Box', quantity: 1 }]
        },
        {
          id: '2',
          deliveryNumber: 'DEL-202603-001',
          scheduledDate: '2026-03-04',
          status: 'scheduled',
          amount: 15000,
          paymentStatus: 'pending',
          items: [{ name: 'Weekly Veggie Box', quantity: 1 }]
        }
      ];

      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-202602-001',
          issueDate: '2026-02-25',
          dueDate: '2026-03-04',
          paidDate: '2026-02-25',
          amount: 15000,
          status: 'paid'
        },
        {
          id: '2',
          invoiceNumber: 'INV-202603-001',
          issueDate: '2026-03-04',
          dueDate: '2026-03-11',
          amount: 15000,
          status: 'sent'
        }
      ];

      setSubscriber(mockSubscriber);
      setDeliveries(mockDeliveries);
      setInvoices(mockInvoices);
      
      setEditForm({
        customerName: mockSubscriber.customerName,
        customerEmail: mockSubscriber.customerEmail,
        customerPhone: mockSubscriber.customerPhone,
        deliveryAddress: mockSubscriber.deliveryAddress,
        deliveryInstructions: mockSubscriber.deliveryInstructions || '',
        deliveryDay: mockSubscriber.deliveryDay,
        deliveryTime: mockSubscriber.deliveryTime || '',
        paymentMethod: mockSubscriber.paymentMethod,
        notes: mockSubscriber.customerNotes || ''
      });
    } catch (error) {
      console.error('Error fetching subscriber details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriber details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: Subscriber['status']) => {
    if (!subscriber) return;
    
    try {
      setSubscriber({ ...subscriber, status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Subscription status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleAddNote = async () => {
    if (!subscriber || !noteForm.content.trim()) return;
    
    try {
      const newNote = {
        id: Date.now().toString(),
        content: noteForm.content,
        type: noteForm.type,
        createdBy: 'Admin User',
        createdAt: new Date().toISOString()
      };
      
      setSubscriber({
        ...subscriber,
        notes: [newNote, ...subscriber.notes]
      });
      
      setShowNoteDialog(false);
      setNoteForm({ content: '', type: 'general' });
      
      toast({
        title: 'Note Added',
        description: 'Note has been added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  const handleLogCall = async () => {
    if (!subscriber) return;
    
    try {
      const newNote = {
        id: Date.now().toString(),
        content: `Call logged: ${callForm.notes}`,
        type: 'call',
        createdBy: 'Admin User',
        createdAt: new Date().toISOString()
      };
      
      setSubscriber({
        ...subscriber,
        callStatus: callForm.status as any,
        callNotes: callForm.notes,
        lastCallDate: new Date().toISOString(),
        nextCallDate: callForm.callLaterDate || undefined,
        notes: [newNote, ...subscriber.notes]
      });
      
      setShowCallDialog(false);
      setCallForm({ status: 'pending', notes: '', callLaterDate: '' });
      
      toast({
        title: 'Call Logged',
        description: 'Call record saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log call',
        variant: 'destructive',
      });
    }
  };

  const handleSendReminder = async () => {
    if (!subscriber) return;
    
    try {
      const newNote = {
        id: Date.now().toString(),
        content: `${reminderForm.type} reminder sent: ${reminderForm.message}`,
        type: 'reminder',
        createdBy: 'Admin User',
        createdAt: new Date().toISOString()
      };
      
      setSubscriber({
        ...subscriber,
        reminderSent: true,
        lastReminderDate: new Date().toISOString(),
        notes: [newNote, ...subscriber.notes]
      });
      
      setShowReminderDialog(false);
      
      toast({
        title: 'Reminder Sent',
        description: `${reminderForm.type} reminder sent successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
        variant: 'destructive',
      });
    }
  };

  const handlePauseSubscription = async () => {
    if (!subscriber) return;
    
    try {
      setSubscriber({
        ...subscriber,
        status: 'paused',
        pauseUntil: pauseForm.untilDate
      });
      
      setShowPauseDialog(false);
      setPauseForm({ untilDate: '', reason: '' });
      
      toast({
        title: 'Subscription Paused',
        description: `Paused until ${format(new Date(pauseForm.untilDate), 'PPP')}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to pause subscription',
        variant: 'destructive',
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriber) return;
    
    try {
      setSubscriber({
        ...subscriber,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
      
      setShowCancelDialog(false);
      
      toast({
        title: 'Subscription Cancelled',
        description: 'Subscription has been cancelled',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!subscriber) return;
    
    try {
      setSubscriber({
        ...subscriber,
        customerName: editForm.customerName,
        customerEmail: editForm.customerEmail,
        customerPhone: editForm.customerPhone,
        deliveryAddress: editForm.deliveryAddress,
        deliveryInstructions: editForm.deliveryInstructions,
        deliveryDay: editForm.deliveryDay,
        deliveryTime: editForm.deliveryTime,
        paymentMethod: editForm.paymentMethod,
        customerNotes: editForm.notes
      });
      
      setIsEditing(false);
      setShowEditDialog(false);
      
      toast({
        title: 'Changes Saved',
        description: 'Subscriber information updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'paused': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCallStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-500';
      case 'called': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'no_answer': return 'bg-red-500';
      case 'call_later': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-500';
      case 'out_for_delivery': return 'bg-orange-500';
      case 'processing': return 'bg-purple-500';
      case 'scheduled': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-500';
      case 'sent': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading || !subscriber) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin/subscriptions/subscribers')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold">{subscriber.customerName}</h1>
              <Badge className={`${getStatusColor(subscriber.status)} text-white`}>
                {subscriber.status}
              </Badge>
              <Badge className={`${getCallStatusColor(subscriber.callStatus)} text-white`}>
                {subscriber.callStatus.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {subscriber.subscriptionNumber} • Subscribed {format(new Date(subscriber.startDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCallDialog(true)}>
            <Phone className="w-4 h-4 mr-2" />
            Log Call
          </Button>
          <Button variant="outline" onClick={() => setShowNoteDialog(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Note
          </Button>
          <Button variant="outline" onClick={() => setShowReminderDialog(true)}>
            <Bell className="w-4 h-4 mr-2" />
            Send Reminder
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* Export */}}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {subscriber.status === 'active' && (
                <DropdownMenuItem onClick={() => setShowPauseDialog(true)}>
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Pause Subscription
                </DropdownMenuItem>
              )}
              {subscriber.status === 'paused' && (
                <DropdownMenuItem onClick={() => handleUpdateStatus('active')}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Resume Subscription
                </DropdownMenuItem>
              )}
              {subscriber.status !== 'cancelled' && (
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-medium">{subscriber.planName}</p>
              <p className="text-xs text-muted-foreground">MK {subscriber.planPrice.toLocaleString()}/{subscriber.planInterval}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Delivery</p>
              <p className="font-medium">{format(new Date(subscriber.nextDeliveryDate), 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground capitalize">{subscriber.deliveryDay}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="font-medium">MK {subscriber.totalPaid.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{subscriber.totalDeliveries} deliveries</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{format(new Date(subscriber.createdAt), 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistance(new Date(subscriber.createdAt), new Date(), { addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="notes">Notes & History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Customer Information */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-lg">
                      {getInitials(subscriber.customerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{subscriber.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{subscriber.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{subscriber.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium capitalize">{subscriber.paymentMethod.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Delivery Address</p>
                  <p className="font-medium">{subscriber.deliveryAddress}</p>
                  {subscriber.deliveryInstructions && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Instructions:</span> {subscriber.deliveryInstructions}
                    </p>
                  )}
                </div>

                {subscriber.customerNotes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Notes</p>
                      <p className="text-sm">{subscriber.customerNotes}</p>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-2">
                  {subscriber.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plan Details */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-lg font-bold">{subscriber.planName}</p>
                  <p className="text-sm text-muted-foreground">{subscriber.planDescription}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-medium">MK {subscriber.planPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Interval</span>
                    <span className="font-medium capitalize">{subscriber.planInterval}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Delivery Day</span>
                    <span className="font-medium capitalize">{subscriber.deliveryDay}</span>
                  </div>
                  {subscriber.deliveryTime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Delivery Time</span>
                      <span className="font-medium">{subscriber.deliveryTime}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Features</p>
                  <ul className="space-y-2">
                    {subscriber.planFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery #</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.filter(d => d.status !== 'delivered').map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-mono text-sm">{delivery.deliveryNumber}</TableCell>
                      <TableCell>{format(new Date(delivery.scheduledDate), 'PPP')}</TableCell>
                      <TableCell>
                        <Badge className={`${getDeliveryStatusColor(delivery.status)} text-white`}>
                          {delivery.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{delivery.riderName || 'Not assigned'}</TableCell>
                      <TableCell>MK {delivery.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          delivery.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }>
                          {delivery.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriber.notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {note.createdBy} • {format(new Date(note.createdAt), 'PPP p')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries">
          <Card>
            <CardHeader>
              <CardTitle>Delivery History</CardTitle>
              <CardDescription>All deliveries for this subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery #</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Actual Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-mono text-sm">{delivery.deliveryNumber}</TableCell>
                      <TableCell>{format(new Date(delivery.scheduledDate), 'PPP')}</TableCell>
                      <TableCell>
                        {delivery.actualDeliveryDate 
                          ? format(new Date(delivery.actualDeliveryDate), 'PPP p')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getDeliveryStatusColor(delivery.status)} text-white`}>
                          {delivery.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{delivery.riderName || '-'}</TableCell>
                      <TableCell>{delivery.trackingNumber || '-'}</TableCell>
                      <TableCell>MK {delivery.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          delivery.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }>
                          {delivery.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Payment history and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{format(new Date(invoice.issueDate), 'PPP')}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), 'PPP')}</TableCell>
                      <TableCell>
                        {invoice.paidDate ? format(new Date(invoice.paidDate), 'PPP') : '-'}
                      </TableCell>
                      <TableCell>MK {invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`${getInvoiceStatusColor(invoice.status)} text-white`}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notes & History</CardTitle>
                <CardDescription>All interactions and notes</CardDescription>
              </div>
              <Button onClick={() => setShowNoteDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriber.notes.map((note) => (
                  <div key={note.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {note.type === 'call' && <Phone className="w-4 h-4 text-primary" />}
                      {note.type === 'delivery' && <Truck className="w-4 h-4 text-primary" />}
                      {note.type === 'payment' && <DollarSign className="w-4 h-4 text-primary" />}
                      {note.type === 'reminder' && <Bell className="w-4 h-4 text-primary" />}
                      {note.type === 'general' && <MessageSquare className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {note.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {note.createdBy}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(note.createdAt), 'PPP p')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Reminder Preferences</CardTitle>
                <CardDescription>How this customer wants to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Send reminders via email</p>
                  </div>
                  <Switch checked={subscriber.reminderPreferences.email} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Send reminders via SMS</p>
                  </div>
                  <Switch checked={subscriber.reminderPreferences.sms} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-muted-foreground">Remind before payment due</p>
                  </div>
                  <Switch checked={subscriber.reminderPreferences.payment} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delivery Reminders</p>
                    <p className="text-sm text-muted-foreground">Remind before delivery</p>
                  </div>
                  <Switch checked={subscriber.reminderPreferences.delivery} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Actions</CardTitle>
                <CardDescription>Manage this subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowEditDialog(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Customer Details
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {/* Change Plan */}}>
                  <Package className="w-4 h-4 mr-2" />
                  Change Plan
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {/* Update Payment */}}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
                <Separator />
                {subscriber.status === 'active' ? (
                  <Button variant="outline" className="w-full justify-start text-blue-600" onClick={() => setShowPauseDialog(true)}>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Pause Subscription
                  </Button>
                ) : subscriber.status === 'paused' ? (
                  <Button variant="outline" className="w-full justify-start text-green-600" onClick={() => handleUpdateStatus('active')}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Resume Subscription
                  </Button>
                ) : null}
                {subscriber.status !== 'cancelled' && (
                  <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => setShowCancelDialog(true)}>
                    <Ban className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>
              Record call with {subscriber.customerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Call Status</Label>
              <Select 
                value={callForm.status} 
                onValueChange={(value) => setCallForm({...callForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="called">Called - No Answer</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="no_answer">No Answer</SelectItem>
                  <SelectItem value="call_later">Call Later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {callForm.status === 'call_later' && (
              <div className="space-y-2">
                <Label>Call Later Date</Label>
                <Input
                  type="datetime-local"
                  value={callForm.callLaterDate}
                  onChange={(e) => setCallForm({...callForm, callLaterDate: e.target.value})}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Call Notes</Label>
              <Textarea
                value={callForm.notes}
                onChange={(e) => setCallForm({...callForm, notes: e.target.value})}
                placeholder="Record details of the call..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogCall}>
              Save Call Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note for {subscriber.customerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Note Type</Label>
              <Select 
                value={noteForm.type} 
                onValueChange={(value) => setNoteForm({...noteForm, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="issue">Issue</SelectItem>
                  <SelectItem value="resolution">Resolution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                placeholder="Enter your note..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
            <DialogDescription>
              Send a reminder to {subscriber.customerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <Select 
                value={reminderForm.type} 
                onValueChange={(value) => setReminderForm({...reminderForm, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment Reminder</SelectItem>
                  <SelectItem value="delivery">Delivery Reminder</SelectItem>
                  <SelectItem value="call">Call Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={reminderForm.message}
                onChange={(e) => setReminderForm({...reminderForm, message: e.target.value})}
                placeholder="Enter reminder message..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Send Via</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="reminderEmail" 
                    checked={reminderForm.sendEmail}
                    onChange={(e) => setReminderForm({...reminderForm, sendEmail: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="reminderEmail">Email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="reminderSms" 
                    checked={reminderForm.sendSms}
                    onChange={(e) => setReminderForm({...reminderForm, sendSms: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="reminderSms">SMS</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminder}>
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Subscription</DialogTitle>
            <DialogDescription>
              Pause subscription for {subscriber.customerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resume Date</Label>
              <Input
                type="date"
                value={pauseForm.untilDate}
                onChange={(e) => setPauseForm({...pauseForm, untilDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                value={pauseForm.reason}
                onChange={(e) => setPauseForm({...pauseForm, reason: e.target.value})}
                placeholder="e.g., Customer on vacation..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePauseSubscription}>
              Pause Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Cancellation</Label>
              <Textarea
                value={pauseForm.reason}
                onChange={(e) => setPauseForm({...pauseForm, reason: e.target.value})}
                placeholder="e.g., Customer request, payment issues..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer Details</DialogTitle>
            <DialogDescription>
              Update information for {subscriber.customerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editForm.customerName}
                onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.customerEmail}
                onChange={(e) => setEditForm({...editForm, customerEmail: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editForm.customerPhone}
                onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery Day</Label>
              <Select 
                value={editForm.deliveryDay} 
                onValueChange={(value) => setEditForm({...editForm, deliveryDay: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Delivery Time</Label>
              <Input
                value={editForm.deliveryTime}
                onChange={(e) => setEditForm({...editForm, deliveryTime: e.target.value})}
                placeholder="e.g., 10:00 - 12:00"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={editForm.paymentMethod} 
                onValueChange={(value) => setEditForm({...editForm, paymentMethod: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash on Delivery</SelectItem>
                  <SelectItem value="airtel_money">Airtel Money</SelectItem>
                  <SelectItem value="tnm_mpamba">TNM Mpamba</SelectItem>
                  <SelectItem value="card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Delivery Address</Label>
              <Textarea
                value={editForm.deliveryAddress}
                onChange={(e) => setEditForm({...editForm, deliveryAddress: e.target.value})}
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Delivery Instructions</Label>
              <Textarea
                value={editForm.deliveryInstructions}
                onChange={(e) => setEditForm({...editForm, deliveryInstructions: e.target.value})}
                placeholder="e.g., Leave with security guard..."
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Internal notes about this customer..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriberDetails;