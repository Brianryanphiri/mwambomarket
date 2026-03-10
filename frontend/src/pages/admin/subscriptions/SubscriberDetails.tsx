import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
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
  Plus,
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
import { format, formatDistance, addDays } from 'date-fns';

interface Subscriber {
  id: string;
  subscription_number: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  plan_interval: string;
  plan_description: string;
  plan_features: string[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_avatar?: string;
  admin_notes?: string;
  start_date: string;
  next_delivery_date: string;
  delivery_day: string;
  delivery_time?: string;
  delivery_address: string;
  delivery_instructions?: string;
  payment_method: string;
  payment_reference?: string;
  total_paid: number;
  status: 'pending' | 'active' | 'paused' | 'cancelled' | 'expired';
  pause_until?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  call_status: 'pending' | 'called' | 'confirmed' | 'no_answer' | 'call_later';
  call_notes?: string;
  last_call_date?: string;
  next_call_date?: string;
  reminder_sent: boolean;
  last_reminder_date?: string;
  next_reminder_date?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Delivery {
  id: string;
  delivery_number: string;
  delivery_date: string;
  delivery_time?: string;
  status: 'scheduled' | 'processing' | 'out_for_delivery' | 'delivered' | 'failed' | 'skipped' | 'rescheduled';
  rider_name?: string;
  tracking_number?: string;
  notes?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  total: number;
  amount_paid: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  payment_reference?: string;
}

interface Note {
  id: string;
  content: string;
  type: string;
  created_by: string;
  created_at: string;
}

interface Reminder {
  id: string;
  reminder_type: string;
  message: string;
  scheduled_date: string;
  sent: boolean;
  sent_at?: string;
  created_at: string;
}

const SubscriberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialogs state
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showAddDeliveryDialog, setShowAddDeliveryDialog] = useState(false);
  const [showGenerateInvoiceDialog, setShowGenerateInvoiceDialog] = useState(false);
  const [showEditAdminNotes, setShowEditAdminNotes] = useState(false);
  
  // Form states
  const [callForm, setCallForm] = useState({
    call_status: 'called',
    notes: '',
    next_call_date: ''
  });
  
  const [noteForm, setNoteForm] = useState({
    content: '',
    type: 'general'
  });
  
  const [reminderForm, setReminderForm] = useState({
    reminder_type: 'payment',
    message: '',
    scheduled_date: ''
  });
  
  const [pauseForm, setPauseForm] = useState({
    until_date: '',
    reason: ''
  });
  
  const [deliveryForm, setDeliveryForm] = useState({
    delivery_date: '',
    delivery_time: '',
    status: 'scheduled',
    tracking_number: '',
    notes: ''
  });
  
  const [invoiceForm, setInvoiceForm] = useState({
    amount: '',
    due_date: '',
    notes: ''
  });
  
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch all data
  useEffect(() => {
    if (id) {
      fetchSubscriberDetails();
      fetchDeliveries();
      fetchInvoices();
      fetchNotes();
      fetchReminders();
    }
  }, [id]);

  const fetchSubscriberDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/subscriptions/${id}`);
      setSubscriber(response.data);
      setAdminNotes(response.data.admin_notes || '');
    } catch (error) {
      console.error('Error fetching subscriber:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriber details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await api.get(`/admin/subscriptions/${id}/deliveries`);
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deliveries',
        variant: 'destructive',
      });
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await api.get(`/admin/subscriptions/${id}/invoices`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive',
      });
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/admin/subscriptions/${id}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      // This would be a separate endpoint or we can filter from all reminders
      // For now, we'll just use the reminders from the subscription_reminders table
      // You might need to create an endpoint for this
      const response = await api.get(`/admin/subscriptions/reminders?subscription_id=${id}`);
      setReminders(response.data.reminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  // Action handlers
  const handleUpdateStatus = async (newStatus: Subscriber['status']) => {
    if (!subscriber) return;
    
    try {
      if (newStatus === 'active' && subscriber.status === 'paused') {
        await api.post(`/subscriptions/${id}/resume`);
      } else if (newStatus === 'paused') {
        setShowPauseDialog(true);
        return;
      } else if (newStatus === 'cancelled') {
        setShowCancelDialog(true);
        return;
      }
      
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

  const handleLogCall = async () => {
    if (!subscriber) return;
    
    try {
      await api.patch(`/admin/subscriptions/${id}/call-status`, {
        call_status: callForm.call_status,
        call_notes: callForm.notes,
        next_call_date: callForm.next_call_date || null
      });
      
      // Refresh subscriber data
      fetchSubscriberDetails();
      
      setShowCallDialog(false);
      setCallForm({ call_status: 'called', notes: '', next_call_date: '' });
      
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

  const handleAddNote = async () => {
    if (!subscriber || !noteForm.content.trim()) return;
    
    try {
      const response = await api.post(`/admin/subscriptions/${id}/notes`, {
        content: noteForm.content,
        type: noteForm.type
      });
      
      setNotes([response.data, ...notes]);
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

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/admin/subscriptions/${id}/notes/${noteId}`);
      setNotes(notes.filter(n => n.id !== noteId));
      
      toast({
        title: 'Note Deleted',
        description: 'Note has been deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  const handleSendReminder = async () => {
    if (!subscriber) return;
    
    try {
      await api.post('/admin/subscriptions/reminders', {
        subscription_id: id,
        reminder_type: reminderForm.reminder_type,
        message: reminderForm.message,
        scheduled_date: reminderForm.scheduled_date
      });
      
      fetchReminders();
      setShowReminderDialog(false);
      setReminderForm({ reminder_type: 'payment', message: '', scheduled_date: '' });
      
      toast({
        title: 'Reminder Created',
        description: 'Reminder has been scheduled',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create reminder',
        variant: 'destructive',
      });
    }
  };

  const handlePauseSubscription = async () => {
    if (!subscriber) return;
    
    try {
      await api.post(`/subscriptions/${id}/pause`, {
        untilDate: pauseForm.until_date
      });
      
      setSubscriber({
        ...subscriber,
        status: 'paused',
        pause_until: pauseForm.until_date
      });
      
      setShowPauseDialog(false);
      setPauseForm({ until_date: '', reason: '' });
      
      toast({
        title: 'Subscription Paused',
        description: `Paused until ${format(new Date(pauseForm.until_date), 'PPP')}`,
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
      await api.post(`/subscriptions/${id}/cancel`, {
        reason: pauseForm.reason
      });
      
      setSubscriber({
        ...subscriber,
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: pauseForm.reason
      });
      
      setShowCancelDialog(false);
      setPauseForm({ until_date: '', reason: '' });
      
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

  const handleAddDelivery = async () => {
    if (!subscriber) return;
    
    try {
      await api.post(`/admin/subscriptions/${id}/deliveries`, deliveryForm);
      
      fetchDeliveries();
      setShowAddDeliveryDialog(false);
      setDeliveryForm({
        delivery_date: '',
        delivery_time: '',
        status: 'scheduled',
        tracking_number: '',
        notes: ''
      });
      
      toast({
        title: 'Delivery Added',
        description: 'New delivery has been scheduled',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add delivery',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateInvoice = async () => {
    if (!subscriber) return;
    
    try {
      await api.post(`/admin/subscriptions/${id}/invoices`, {
        amount: parseFloat(invoiceForm.amount),
        due_date: invoiceForm.due_date,
        notes: invoiceForm.notes
      });
      
      fetchInvoices();
      setShowGenerateInvoiceDialog(false);
      setInvoiceForm({ amount: '', due_date: '', notes: '' });
      
      toast({
        title: 'Invoice Generated',
        description: 'New invoice has been created',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate invoice',
        variant: 'destructive',
      });
    }
  };

  const handleMarkInvoicePaid = async (invoiceId: string) => {
    try {
      await api.patch(`/admin/subscriptions/${id}/invoices/${invoiceId}/paid`, {});
      
      // Update invoice in state
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, status: 'paid', paid_date: new Date().toISOString() }
          : inv
      ));
      
      toast({
        title: 'Invoice Marked Paid',
        description: 'Invoice has been marked as paid',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark invoice as paid',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAdminNotes = async () => {
    if (!subscriber) return;
    
    try {
      await api.patch(`/admin/subscriptions/${id}/admin-notes`, {
        admin_notes: adminNotes
      });
      
      setSubscriber({ ...subscriber, admin_notes: adminNotes });
      setShowEditAdminNotes(false);
      
      toast({
        title: 'Notes Updated',
        description: 'Admin notes have been updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notes',
        variant: 'destructive',
      });
    }
  };

  // Helper functions
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
              <h1 className="text-3xl font-display font-bold">{subscriber.customer_name}</h1>
              <Badge className={`${getStatusColor(subscriber.status)} text-white`}>
                {subscriber.status}
              </Badge>
              <Badge className={`${getCallStatusColor(subscriber.call_status)} text-white`}>
                {subscriber.call_status?.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {subscriber.subscription_number} • Subscribed {format(new Date(subscriber.start_date), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCallDialog(true)}>
            <Phone className="w-4 h-4 mr-2" />
            Log Call
          </Button>
          <Button variant="outline" onClick={() => setShowReminderDialog(true)}>
            <Bell className="w-4 h-4 mr-2" />
            Send Reminder
          </Button>
          <Button variant="outline" onClick={() => setShowNoteDialog(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Note
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => window.open(`mailto:${subscriber.customer_email}`)}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`tel:${subscriber.customer_phone}`)}>
                <Phone className="w-4 h-4 mr-2" />
                Call Customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAddDeliveryDialog(true)}>
                <Truck className="w-4 h-4 mr-2" />
                Schedule Delivery
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowGenerateInvoiceDialog(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
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
              <p className="font-medium">{subscriber.plan_name}</p>
              <p className="text-xs text-muted-foreground">MK {subscriber.plan_price.toLocaleString()}/{subscriber.plan_interval}</p>
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
              <p className="font-medium">{format(new Date(subscriber.next_delivery_date), 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground capitalize">{subscriber.delivery_day}</p>
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
              <p className="font-medium">MK {subscriber.total_paid.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Lifetime value</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{format(new Date(subscriber.created_at), 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistance(new Date(subscriber.created_at), new Date(), { addSuffix: true })}
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
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Customer Information */}
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Information</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/customers/${subscriber.id}`)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-lg">
                      {getInitials(subscriber.customer_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{subscriber.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{subscriber.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{subscriber.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium capitalize">{subscriber.payment_method?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Delivery Address</p>
                  <p className="font-medium">{subscriber.delivery_address}</p>
                  {subscriber.delivery_instructions && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Instructions:</span> {subscriber.delivery_instructions}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Delivery Day:</p>
                  <Badge variant="outline" className="capitalize">
                    {subscriber.delivery_day}
                  </Badge>
                  {subscriber.delivery_time && (
                    <>
                      <p className="text-sm text-muted-foreground ml-2">Time:</p>
                      <Badge variant="outline">
                        {subscriber.delivery_time}
                      </Badge>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {subscriber.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-lg font-bold">{subscriber.plan_name}</p>
                  <p className="text-sm text-muted-foreground">{subscriber.plan_description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-medium">MK {subscriber.plan_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Interval</span>
                    <span className="font-medium capitalize">{subscriber.plan_interval}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Start Date</span>
                    <span className="font-medium">{format(new Date(subscriber.start_date), 'PPP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={`${getStatusColor(subscriber.status)} text-white`}>
                      {subscriber.status}
                    </Badge>
                  </div>
                  {subscriber.status === 'paused' && subscriber.pause_until && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Paused Until</span>
                      <span className="font-medium">{format(new Date(subscriber.pause_until), 'PPP')}</span>
                    </div>
                  )}
                  {subscriber.status === 'cancelled' && subscriber.cancellation_reason && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cancellation Reason</p>
                      <p className="text-sm mt-1 p-2 bg-red-50 dark:bg-red-950/30 rounded">
                        {subscriber.cancellation_reason}
                      </p>
                    </div>
                  )}
                </div>

                {subscriber.plan_features && subscriber.plan_features.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Plan Features</p>
                      <ul className="space-y-2">
                        {subscriber.plan_features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Admin Notes Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Admin Notes</CardTitle>
                <CardDescription>Internal notes about this subscriber</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEditAdminNotes(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              {adminNotes ? (
                <p className="whitespace-pre-wrap">{adminNotes}</p>
              ) : (
                <p className="text-muted-foreground italic">No admin notes added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Delivery History</CardTitle>
                <CardDescription>All deliveries for this subscription</CardDescription>
              </div>
              <Button onClick={() => setShowAddDeliveryDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Delivery
              </Button>
            </CardHeader>
            <CardContent>
              {deliveries.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium">No deliveries yet</p>
                  <p className="text-sm text-muted-foreground">
                    Schedule the first delivery for this subscriber
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Delivery #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-mono text-sm">{delivery.delivery_number}</TableCell>
                        <TableCell>{format(new Date(delivery.delivery_date), 'PPP')}</TableCell>
                        <TableCell>{delivery.delivery_time || '-'}</TableCell>
                        <TableCell>
                          <Badge className={`${getDeliveryStatusColor(delivery.status)} text-white`}>
                            {delivery.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{delivery.rider_name || '-'}</TableCell>
                        <TableCell>{delivery.tracking_number || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{delivery.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Payment history and invoices</CardDescription>
              </div>
              <Button onClick={() => setShowGenerateInvoiceDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium">No invoices yet</p>
                  <p className="text-sm text-muted-foreground">
                    Generate the first invoice for this subscriber
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                        <TableCell>{format(new Date(invoice.issue_date), 'PPP')}</TableCell>
                        <TableCell>{format(new Date(invoice.due_date), 'PPP')}</TableCell>
                        <TableCell>MK {invoice.total.toLocaleString()}</TableCell>
                        <TableCell>MK {invoice.amount_paid.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={`${getInvoiceStatusColor(invoice.status)} text-white`}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.status !== 'paid' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMarkInvoicePaid(invoice.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notes & Interactions</CardTitle>
                <CardDescription>All notes and call logs</CardDescription>
              </div>
              <Button onClick={() => setShowNoteDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium">No notes yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first note about this subscriber
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {note.type === 'call' && <Phone className="w-4 h-4 text-primary" />}
                        {note.type === 'delivery' && <Truck className="w-4 h-4 text-primary" />}
                        {note.type === 'payment' && <DollarSign className="w-4 h-4 text-primary" />}
                        {note.type === 'reminder' && <Bell className="w-4 h-4 text-primary" />}
                        {note.type === 'general' && <MessageSquare className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {note.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {note.created_by}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(note.created_at), 'PPP p')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Call History</CardTitle>
                <CardDescription>Recent call activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Status:</span>
                    <Badge className={`${getCallStatusColor(subscriber.call_status)} text-white`}>
                      {subscriber.call_status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  {subscriber.last_call_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Call:</span>
                      <span className="font-medium">{format(new Date(subscriber.last_call_date), 'PPP p')}</span>
                    </div>
                  )}
                  {subscriber.next_call_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Next Call:</span>
                      <span className="font-medium">{format(new Date(subscriber.next_call_date), 'PPP p')}</span>
                    </div>
                  )}
                  {subscriber.call_notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Call Notes:</p>
                      <p className="text-sm p-3 bg-muted/50 rounded-lg whitespace-pre-wrap">
                        {subscriber.call_notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reminder History</CardTitle>
                <CardDescription>Scheduled and sent reminders</CardDescription>
              </CardHeader>
              <CardContent>
                {reminders.length === 0 ? (
                  <p className="text-muted-foreground italic">No reminders found</p>
                ) : (
                  <div className="space-y-4">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="outline" className="text-xs capitalize mb-1">
                              {reminder.reminder_type}
                            </Badge>
                            <p className="text-sm">{reminder.message}</p>
                          </div>
                          <Badge className={reminder.sent ? 'bg-green-500' : 'bg-yellow-500'}>
                            {reminder.sent ? 'Sent' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Scheduled: {format(new Date(reminder.scheduled_date), 'PPP')}</span>
                          {reminder.sent_at && (
                            <>
                              <span>•</span>
                              <span>Sent: {format(new Date(reminder.sent_at), 'PPP p')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
              Record call with {subscriber.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Call Status</Label>
              <Select 
                value={callForm.call_status} 
                onValueChange={(value) => setCallForm({...callForm, call_status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="called">Called - Successful</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="no_answer">No Answer</SelectItem>
                  <SelectItem value="call_later">Call Later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {callForm.call_status === 'call_later' && (
              <div className="space-y-2">
                <Label>Call Later Date</Label>
                <Input
                  type="datetime-local"
                  value={callForm.next_call_date}
                  onChange={(e) => setCallForm({...callForm, next_call_date: e.target.value})}
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
              Add a note for {subscriber.customer_name}
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
            <DialogTitle>Create Reminder</DialogTitle>
            <DialogDescription>
              Schedule a reminder for {subscriber.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <Select 
                value={reminderForm.reminder_type} 
                onValueChange={(value) => setReminderForm({...reminderForm, reminder_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment Reminder</SelectItem>
                  <SelectItem value="delivery">Delivery Reminder</SelectItem>
                  <SelectItem value="call">Call Reminder</SelectItem>
                  <SelectItem value="renewal">Renewal Reminder</SelectItem>
                  <SelectItem value="expiry">Expiry Reminder</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={reminderForm.scheduled_date}
                onChange={(e) => setReminderForm({...reminderForm, scheduled_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminder}>
              Create Reminder
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
              Pause subscription for {subscriber.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resume Date</Label>
              <Input
                type="date"
                value={pauseForm.until_date}
                onChange={(e) => setPauseForm({...pauseForm, until_date: e.target.value})}
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

      {/* Add Delivery Dialog */}
      <Dialog open={showAddDeliveryDialog} onOpenChange={setShowAddDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Delivery</DialogTitle>
            <DialogDescription>
              Add a new delivery for {subscriber.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Date *</Label>
                <Input
                  type="date"
                  value={deliveryForm.delivery_date}
                  onChange={(e) => setDeliveryForm({...deliveryForm, delivery_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Delivery Time</Label>
                <Input
                  type="time"
                  value={deliveryForm.delivery_time}
                  onChange={(e) => setDeliveryForm({...deliveryForm, delivery_time: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select 
                value={deliveryForm.status} 
                onValueChange={(value) => setDeliveryForm({...deliveryForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                value={deliveryForm.tracking_number}
                onChange={(e) => setDeliveryForm({...deliveryForm, tracking_number: e.target.value})}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={deliveryForm.notes}
                onChange={(e) => setDeliveryForm({...deliveryForm, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDeliveryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDelivery}>
              Schedule Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Invoice Dialog */}
      <Dialog open={showGenerateInvoiceDialog} onOpenChange={setShowGenerateInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for {subscriber.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (MK) *</Label>
              <Input
                type="number"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                placeholder="15000"
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={invoiceForm.due_date}
                onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                placeholder="Additional invoice notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateInvoiceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateInvoice}>
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Notes Dialog */}
      <Dialog open={showEditAdminNotes} onOpenChange={setShowEditAdminNotes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin Notes</DialogTitle>
            <DialogDescription>
              Update internal notes for {subscriber.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Enter admin notes..."
              rows={8}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAdminNotes(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAdminNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriberDetails;