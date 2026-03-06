import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  ArrowLeft,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Ban,
  Play,
  Pause,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Home,
  User,
  ShoppingBag,
  Bell,
  Phone as PhoneIcon,
  MessageSquare,
  FileText,
  Calendar as CalendarIcon,
  Truck,
  Clock as ClockIcon,
  AlertTriangle,
  Check,
  X,
  Plus,
  Save,
  Printer,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { subscriptionService } from '@/services/subscriptionService';
import { format, formatDistance, addDays, isAfter, isBefore } from 'date-fns';

interface Subscriber {
  id: string;
  subscriptionNumber: string;
  planId: string;
  planName: string;
  planPrice: number;
  planInterval: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  nextDeliveryDate: string;
  deliveryDay: string;
  deliveryTime?: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  totalPaid: number;
  status: 'pending' | 'active' | 'paused' | 'cancelled' | 'expired';
  pauseUntil?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  adminNotes?: string;
  callStatus: 'pending' | 'called' | 'confirmed' | 'no_answer' | 'call_later';
  callNotes?: string;
  reminderSent: boolean;
  nextReminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Delivery {
  id: string;
  deliveryNumber: string;
  scheduledDate: string;
  actualDeliveryDate?: string;
  status: 'scheduled' | 'processing' | 'out_for_delivery' | 'delivered' | 'failed' | 'skipped' | 'rescheduled';
  trackingNumber?: string;
  riderName?: string;
  riderPhone?: string;
  deliveryNotes?: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string;
  confirmedByCustomer: boolean;
  confirmationTime?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentReference?: string;
  reminderCount: number;
  lastReminderSent?: string;
}

interface Note {
  id: string;
  note: string;
  type: 'general' | 'call' | 'delivery' | 'payment' | 'issue' | 'resolution';
  adminName?: string;
  createdAt: string;
}

const callStatusOptions = [
  { value: 'pending', label: 'Pending Call', color: 'bg-yellow-500', icon: PhoneIcon },
  { value: 'called', label: 'Called', color: 'bg-blue-500', icon: Check },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500', icon: CheckCircle },
  { value: 'no_answer', label: 'No Answer', color: 'bg-red-500', icon: XCircle },
  { value: 'call_later', label: 'Call Later', color: 'bg-orange-500', icon: ClockIcon },
];

const subscriptionStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'paused', label: 'Paused', color: 'bg-blue-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'expired', label: 'Expired', color: 'bg-gray-500' },
];

const AdminSubscribers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCallStatus, setSelectedCallStatus] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [showSubscriberDialog, setShowSubscriberDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'call' | 'delivery' | 'payment' | 'issue' | 'resolution'>('general');
  const [callNotes, setCallNotes] = useState('');
  const [callStatus, setCallStatus] = useState<'pending' | 'called' | 'confirmed' | 'no_answer' | 'call_later'>('pending');
  const [callLaterDate, setCallLaterDate] = useState('');
  const [deliveryForm, setDeliveryForm] = useState({
    scheduledDate: '',
    riderName: '',
    riderPhone: '',
    trackingNumber: '',
    deliveryNotes: '',
    status: 'scheduled' as const
  });
  const [invoiceForm, setInvoiceForm] = useState({
    amount: '',
    dueDate: '',
    paymentMethod: '',
    paymentReference: ''
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    paused: 0,
    cancelled: 0,
    todayDeliveries: 0,
    weekDeliveries: 0,
    monthRevenue: 0,
    pendingCalls: 0,
    overduePayments: 0
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const data = await subscriptionService.getAllSubscribers();
      // setSubscribers(data);
      
      // Mock data for demonstration
      const mockSubscribers: Subscriber[] = [
        {
          id: '1',
          subscriptionNumber: 'SUB-202602-0001',
          planId: '7',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          planInterval: 'weekly',
          customerName: 'Brian Phiri',
          customerEmail: 'brian@example.com',
          customerPhone: '+265991234567',
          startDate: '2026-02-25',
          nextDeliveryDate: '2026-03-04',
          deliveryDay: 'tuesday',
          deliveryAddress: 'Area 123, Lilongwe',
          paymentMethod: 'airtel_money',
          totalPaid: 15000,
          status: 'active',
          callStatus: 'confirmed',
          reminderSent: true,
          createdAt: '2026-02-25T10:30:00Z',
          updatedAt: '2026-02-25T10:30:00Z'
        },
        {
          id: '2',
          subscriptionNumber: 'SUB-202602-0002',
          planId: '8',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          planInterval: 'weekly',
          customerName: 'Mary Banda',
          customerEmail: 'mary@example.com',
          customerPhone: '+265992345678',
          startDate: '2026-02-24',
          nextDeliveryDate: '2026-03-03',
          deliveryDay: 'wednesday',
          deliveryAddress: 'Area 25, Lilongwe',
          paymentMethod: 'cash',
          totalPaid: 9000,
          status: 'pending',
          callStatus: 'pending',
          reminderSent: false,
          createdAt: '2026-02-24T14:20:00Z',
          updatedAt: '2026-02-24T14:20:00Z'
        },
        {
          id: '3',
          subscriptionNumber: 'SUB-202602-0003',
          planId: '9',
          planName: 'Dairy Delight',
          planPrice: 25000,
          planInterval: 'weekly',
          customerName: 'John Chimwala',
          customerEmail: 'john@example.com',
          customerPhone: '+265993456789',
          startDate: '2026-02-20',
          nextDeliveryDate: '2026-02-27',
          deliveryDay: 'friday',
          deliveryAddress: 'Area 47, Lilongwe',
          paymentMethod: 'tnm_mpamba',
          totalPaid: 25000,
          status: 'active',
          callStatus: 'confirmed',
          reminderSent: true,
          createdAt: '2026-02-20T09:15:00Z',
          updatedAt: '2026-02-20T09:15:00Z'
        },
        {
          id: '4',
          subscriptionNumber: 'SUB-202602-0004',
          planId: '10',
          planName: 'Family Essentials',
          planPrice: 65000,
          planInterval: 'weekly',
          customerName: 'Alice Phiri',
          customerEmail: 'alice@example.com',
          customerPhone: '+265994567890',
          startDate: '2026-02-22',
          nextDeliveryDate: '2026-02-29',
          deliveryDay: 'monday',
          deliveryAddress: 'Area 18, Lilongwe',
          paymentMethod: 'card',
          totalPaid: 65000,
          status: 'paused',
          pauseUntil: '2026-03-10',
          callStatus: 'called',
          reminderSent: true,
          createdAt: '2026-02-22T11:45:00Z',
          updatedAt: '2026-02-22T11:45:00Z'
        }
      ];
      
      setSubscribers(mockSubscribers);
      calculateStats(mockSubscribers);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscribers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Subscriber[]) => {
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = addDays(new Date(), 7).toISOString().split('T')[0];
    
    setStats({
      total: data.length,
      pending: data.filter(s => s.status === 'pending').length,
      active: data.filter(s => s.status === 'active').length,
      paused: data.filter(s => s.status === 'paused').length,
      cancelled: data.filter(s => s.status === 'cancelled').length,
      todayDeliveries: data.filter(s => s.nextDeliveryDate === today && s.status === 'active').length,
      weekDeliveries: data.filter(s => 
        s.status === 'active' && 
        s.nextDeliveryDate >= today && 
        s.nextDeliveryDate <= weekFromNow
      ).length,
      monthRevenue: data
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.planPrice * 4, 0),
      pendingCalls: data.filter(s => s.callStatus === 'pending').length,
      overduePayments: 0 // This would come from invoices
    });
  };

  const handleViewSubscriber = async (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setActiveTab('overview');
    
    // Fetch deliveries, invoices, notes
    try {
      // const deliveriesData = await subscriptionService.getSubscriberDeliveries(subscriber.id);
      // setDeliveries(deliveriesData);
      // const invoicesData = await subscriptionService.getSubscriberInvoices(subscriber.id);
      // setInvoices(invoicesData);
      // const notesData = await subscriptionService.getSubscriberNotes(subscriber.id);
      // setNotes(notesData);
      
      // Mock data
      setDeliveries([
        {
          id: 'd1',
          deliveryNumber: 'DEL-202603-001',
          scheduledDate: '2026-03-04',
          status: 'scheduled',
          amount: 15000,
          paymentStatus: 'pending',
          confirmedByCustomer: false
        },
        {
          id: 'd2',
          deliveryNumber: 'DEL-202602-001',
          scheduledDate: '2026-02-25',
          actualDeliveryDate: '2026-02-25T14:30:00Z',
          status: 'delivered',
          riderName: 'James Banda',
          riderPhone: '+265991234568',
          amount: 15000,
          paymentStatus: 'paid',
          paymentReference: 'TRX123456',
          confirmedByCustomer: true,
          confirmationTime: '2026-02-25T15:00:00Z'
        }
      ]);
      
      setInvoices([
        {
          id: 'i1',
          invoiceNumber: 'INV-202603-001',
          amount: 15000,
          dueDate: '2026-03-04',
          status: 'pending',
          reminderCount: 0
        },
        {
          id: 'i2',
          invoiceNumber: 'INV-202602-001',
          amount: 15000,
          dueDate: '2026-02-25',
          paidDate: '2026-02-25T14:30:00Z',
          status: 'paid',
          paymentMethod: 'airtel_money',
          paymentReference: 'TRX123456',
          reminderCount: 1,
          lastReminderSent: '2026-02-24T09:00:00Z'
        }
      ]);
      
      setNotes([
        {
          id: 'n1',
          note: 'Customer prefers morning deliveries between 8-10am',
          type: 'delivery',
          adminName: 'Admin User',
          createdAt: '2026-02-25T10:35:00Z'
        },
        {
          id: 'n2',
          note: 'Called to confirm subscription - customer confirmed',
          type: 'call',
          adminName: 'Admin User',
          createdAt: '2026-02-25T11:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching subscriber details:', error);
    }
    
    setShowSubscriberDialog(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // await subscriptionService.updateSubscriberStatus(id, newStatus);
      setSubscribers(prev => prev.map(s => 
        s.id === id ? { ...s, status: newStatus as any } : s
      ));
      if (selectedSubscriber?.id === id) {
        setSelectedSubscriber({ ...selectedSubscriber, status: newStatus as any });
      }
      calculateStats(subscribers);
      toast({
        title: 'Success',
        description: `Subscription status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCallStatus = async () => {
    if (!selectedSubscriber) return;
    
    try {
      // await subscriptionService.updateCallStatus(selectedSubscriber.id, {
      //   status: callStatus,
      //   notes: callNotes,
      //   callLaterDate: callLaterDate || null
      // });
      
      setSubscribers(prev => prev.map(s => 
        s.id === selectedSubscriber.id 
          ? { ...s, callStatus, callNotes, nextReminderDate: callLaterDate || s.nextReminderDate }
          : s
      ));
      
      setSelectedSubscriber({ 
        ...selectedSubscriber, 
        callStatus, 
        callNotes,
        nextReminderDate: callLaterDate || selectedSubscriber.nextReminderDate
      });
      
      toast({
        title: 'Success',
        description: 'Call status updated',
      });
      
      setShowCallDialog(false);
      setCallNotes('');
      setCallLaterDate('');
    } catch (error) {
      console.error('Error updating call status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update call status',
        variant: 'destructive',
      });
    }
  };

  const handleAddNote = async () => {
    if (!selectedSubscriber || !noteText.trim()) return;
    
    try {
      // await subscriptionService.addNote(selectedSubscriber.id, {
      //   note: noteText,
      //   type: noteType
      // });
      
      const newNote: Note = {
        id: Date.now().toString(),
        note: noteText,
        type: noteType,
        adminName: 'Admin User',
        createdAt: new Date().toISOString()
      };
      
      setNotes([newNote, ...notes]);
      setNoteText('');
      
      toast({
        title: 'Success',
        description: 'Note added successfully',
      });
      
      setShowNoteDialog(false);
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  const handleScheduleDelivery = async () => {
    if (!selectedSubscriber) return;
    
    try {
      // await subscriptionService.scheduleDelivery(selectedSubscriber.id, deliveryForm);
      
      toast({
        title: 'Success',
        description: 'Delivery scheduled successfully',
      });
      
      setShowDeliveryDialog(false);
      // Refresh deliveries
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule delivery',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedSubscriber) return;
    
    try {
      // await subscriptionService.generateInvoice(selectedSubscriber.id, invoiceForm);
      
      toast({
        title: 'Success',
        description: 'Invoice generated successfully',
      });
      
      setShowInvoiceDialog(false);
      // Refresh invoices
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate invoice',
        variant: 'destructive',
      });
    }
  };

  const handleSendReminder = async (type: 'payment' | 'delivery' | 'call') => {
    if (!selectedSubscriber) return;
    
    try {
      // await subscriptionService.sendReminder(selectedSubscriber.id, type);
      
      toast({
        title: 'Success',
        description: `${type} reminder sent successfully`,
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
        variant: 'destructive',
      });
    }
  };

  const handleMarkDelivery = async (deliveryId: string, status: string) => {
    try {
      // await subscriptionService.updateDeliveryStatus(deliveryId, status);
      
      setDeliveries(prev => prev.map(d => 
        d.id === deliveryId ? { ...d, status: status as any } : d
      ));
      
      toast({
        title: 'Success',
        description: `Delivery marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast({
        title: 'Error',
        description: 'Failed to update delivery',
        variant: 'destructive',
      });
    }
  };

  const handleMarkInvoicePaid = async (invoiceId: string) => {
    try {
      // await subscriptionService.markInvoicePaid(invoiceId);
      
      setInvoices(prev => prev.map(i => 
        i.id === invoiceId 
          ? { ...i, status: 'paid', paidDate: new Date().toISOString() }
          : i
      ));
      
      toast({
        title: 'Success',
        description: 'Invoice marked as paid',
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice',
        variant: 'destructive',
      });
    }
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
      case 'out_for_delivery': return 'bg-blue-500';
      case 'processing': return 'bg-purple-500';
      case 'scheduled': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'skipped': return 'bg-gray-500';
      case 'rescheduled': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = 
      sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customerPhone.includes(searchTerm) ||
      sub.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || sub.status === selectedStatus;
    const matchesCallStatus = selectedCallStatus === 'all' || sub.callStatus === selectedCallStatus;
    const matchesPlan = selectedPlan === 'all' || sub.planId === selectedPlan;
    
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = addDays(new Date(), 7).toISOString().split('T')[0];
    
    let matchesDate = true;
    if (dateRange === 'today') {
      matchesDate = sub.nextDeliveryDate === today;
    } else if (dateRange === 'week') {
      matchesDate = sub.nextDeliveryDate >= today && sub.nextDeliveryDate <= weekFromNow;
    } else if (dateRange === 'month') {
      const monthFromNow = addDays(new Date(), 30).toISOString().split('T')[0];
      matchesDate = sub.nextDeliveryDate >= today && sub.nextDeliveryDate <= monthFromNow;
    }
    
    return matchesSearch && matchesStatus && matchesCallStatus && matchesPlan && matchesDate;
  });

  if (loading) {
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
            onClick={() => navigate('/admin/services')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Active Subscribers</h1>
            <p className="text-muted-foreground mt-1">
              Manage all customer subscriptions, deliveries, and payments
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSubscribers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Deliveries</p>
              <p className="text-xl font-bold">{stats.todayDeliveries}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <PhoneIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Calls Pending</p>
              <p className="text-xl font-bold">{stats.pendingCalls}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Week's Deliveries</p>
              <p className="text-xl font-bold">{stats.weekDeliveries}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-xl font-bold">MK {stats.monthRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue Payments</p>
              <p className="text-xl font-bold">{stats.overduePayments}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <PauseCircle className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paused</p>
              <p className="text-xl font-bold">{stats.paused}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, subscription #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {subscriptionStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCallStatus} onValueChange={setSelectedCallStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Call Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Calls</SelectItem>
                  {callStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="7">Weekly Veggie Box</SelectItem>
                  <SelectItem value="8">Daily Bread Club</SelectItem>
                  <SelectItem value="9">Dairy Delight</SelectItem>
                  <SelectItem value="10">Family Essentials</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Delivery Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="sm:ml-auto" onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedCallStatus('all');
                setSelectedPlan('all');
                setDateRange('all');
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscription #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Call Status</TableHead>
                <TableHead>Next Delivery</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No subscribers found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((sub) => (
                  <TableRow key={sub.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewSubscriber(sub)}>
                    <TableCell>
                      <span className="font-mono text-sm">{sub.subscriptionNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.customerName}</p>
                        <p className="text-xs text-muted-foreground">{sub.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.planName}</p>
                        <p className="text-xs text-muted-foreground">MK {sub.planPrice.toLocaleString()}/{sub.planInterval}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(sub.status)} text-white`}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getCallStatusColor(sub.callStatus)} text-white gap-1`}>
                        {callStatusOptions.find(o => o.value === sub.callStatus)?.icon && (
                          <span className="w-3 h-3" />
                        )}
                        {sub.callStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{format(new Date(sub.nextDeliveryDate), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground capitalize">{sub.deliveryDay}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {sub.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{format(new Date(sub.startDate), 'MMM d, yyyy')}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewSubscriber(sub); }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedSubscriber(sub); setShowCallDialog(true); }}>
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            Log Call
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSendReminder('payment'); }}>
                            <Bell className="w-4 h-4 mr-2" />
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {sub.status === 'active' ? (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(sub.id, 'paused'); }}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                          ) : sub.status === 'paused' ? (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(sub.id, 'active'); }}>
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </DropdownMenuItem>
                          ) : null}
                          {sub.status !== 'cancelled' && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(sub.id, 'cancelled'); }}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscriber Details Dialog */}
      <Dialog open={showSubscriberDialog} onOpenChange={setShowSubscriberDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Subscription Details</DialogTitle>
            <DialogDescription>
              Manage subscriber information, deliveries, and payments
            </DialogDescription>
          </DialogHeader>

          {selectedSubscriber && (
            <div className="space-y-6">
              {/* Subscriber Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedSubscriber.customerName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSubscriber.subscriptionNumber}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(selectedSubscriber.status)} text-white`}>
                    {selectedSubscriber.status}
                  </Badge>
                  <Badge className={`${getCallStatusColor(selectedSubscriber.callStatus)} text-white`}>
                    {selectedSubscriber.callStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
                <Button size="sm" variant="outline" onClick={() => setShowCallDialog(true)}>
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Log Call
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleSendReminder('payment')}>
                  <Bell className="w-4 h-4 mr-2" />
                  Send Reminder
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowDeliveryDialog(true)}>
                  <Truck className="w-4 h-4 mr-2" />
                  Schedule Delivery
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowInvoiceDialog(true)}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNoteDialog(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${selectedSubscriber.customerEmail}`)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(`tel:${selectedSubscriber.customerPhone}`)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Customer Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedSubscriber.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a href={`mailto:${selectedSubscriber.customerEmail}`} className="hover:text-primary">
                            {selectedSubscriber.customerEmail}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${selectedSubscriber.customerPhone}`} className="hover:text-primary">
                            {selectedSubscriber.customerPhone}
                          </a>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-sm">{selectedSubscriber.deliveryAddress}</span>
                        </div>
                        {selectedSubscriber.deliveryInstructions && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                            <p className="font-medium">Instructions:</p>
                            <p className="text-muted-foreground">{selectedSubscriber.deliveryInstructions}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Plan Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="font-medium">{selectedSubscriber.planName}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-medium">MK {selectedSubscriber.planPrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Interval</p>
                            <p className="font-medium capitalize">{selectedSubscriber.planInterval}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Started</p>
                            <p className="font-medium">{format(new Date(selectedSubscriber.startDate), 'PP')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment</p>
                            <p className="font-medium capitalize">{selectedSubscriber.paymentMethod.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Delivery Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Next Delivery</p>
                          <p className="text-xl font-bold">
                            {format(new Date(selectedSubscriber.nextDeliveryDate), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize mt-1">
                            Delivery Day: {selectedSubscriber.deliveryDay}
                            {selectedSubscriber.deliveryTime && ` at ${selectedSubscriber.deliveryTime}`}
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => setShowDeliveryDialog(true)}>
                          Reschedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedSubscriber.pauseUntil && (
                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <PauseCircle className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Subscription Paused</p>
                            <p className="text-sm text-muted-foreground">
                              Paused until {format(new Date(selectedSubscriber.pauseUntil), 'PP')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedSubscriber.cancelledAt && (
                    <Card className="bg-red-50 dark:bg-red-950/30 border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium">Subscription Cancelled</p>
                            <p className="text-sm text-muted-foreground">
                              Cancelled on {format(new Date(selectedSubscriber.cancelledAt), 'PP')}
                              {selectedSubscriber.cancellationReason && `: ${selectedSubscriber.cancellationReason}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Deliveries Tab */}
                <TabsContent value="deliveries">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Delivery History</CardTitle>
                      <Button size="sm" onClick={() => setShowDeliveryDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Delivery
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {deliveries.length === 0 ? (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-lg font-medium">No deliveries yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {deliveries.map((delivery) => (
                            <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Truck className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{delivery.deliveryNumber}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Scheduled: {format(new Date(delivery.scheduledDate), 'PPP')}
                                  </p>
                                  {delivery.actualDeliveryDate && (
                                    <p className="text-sm text-muted-foreground">
                                      Delivered: {format(new Date(delivery.actualDeliveryDate), 'PPP p')}
                                    </p>
                                  )}
                                  {delivery.riderName && (
                                    <p className="text-sm">
                                      Rider: {delivery.riderName} {delivery.riderPhone && `(${delivery.riderPhone})`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={`${getDeliveryStatusColor(delivery.status)} text-white mb-2`}>
                                  {delivery.status.replace(/_/g, ' ')}
                                </Badge>
                                <p className="text-sm font-medium">MK {delivery.amount.toLocaleString()}</p>
                                <Badge variant="outline" className="mt-1">
                                  {delivery.paymentStatus}
                                </Badge>
                                {delivery.confirmedByCustomer && (
                                  <p className="text-xs text-green-600 mt-1">Confirmed by customer</p>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleMarkDelivery(delivery.id, 'out_for_delivery')}>
                                    <Truck className="w-4 h-4 mr-2" />
                                    Mark Out for Delivery
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMarkDelivery(delivery.id, 'delivered')}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Delivered
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMarkDelivery(delivery.id, 'failed')}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Mark Failed
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print Delivery Note
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Invoices Tab */}
                <TabsContent value="invoices">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Invoices</CardTitle>
                      <Button size="sm" onClick={() => setShowInvoiceDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Invoice
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {invoices.length === 0 ? (
                        <div className="text-center py-8">
                          <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-lg font-medium">No invoices yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {invoices.map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{invoice.invoiceNumber}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Due: {format(new Date(invoice.dueDate), 'PPP')}
                                  </p>
                                  {invoice.paidDate && (
                                    <p className="text-sm text-muted-foreground">
                                      Paid: {format(new Date(invoice.paidDate), 'PPP p')}
                                    </p>
                                  )}
                                  {invoice.reminderCount > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Reminders sent: {invoice.reminderCount}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">MK {invoice.amount.toLocaleString()}</p>
                                <Badge className={`${getInvoiceStatusColor(invoice.status)} text-white mt-1`}>
                                  {invoice.status}
                                </Badge>
                                {invoice.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="link" 
                                    className="text-xs mt-1"
                                    onClick={() => handleMarkInvoicePaid(invoice.id)}
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Subscription Notes</CardTitle>
                      <Button size="sm" onClick={() => setShowNoteDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {notes.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-lg font-medium">No notes yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {notes.map((note) => (
                            <div key={note.id} className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="capitalize">
                                  {note.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(note.createdAt), 'PPP p')}
                                </span>
                                {note.adminName && (
                                  <span className="text-xs text-muted-foreground">by {note.adminName}</span>
                                )}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                            <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-border" />
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium">Subscription Created</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(selectedSubscriber.createdAt), 'PPP p')}
                            </p>
                            <p className="text-sm mt-1">Customer subscribed to {selectedSubscriber.planName}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
                            <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-border" />
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium">Call Logged</p>
                            <p className="text-sm text-muted-foreground">Feb 25, 2026, 11:00 AM</p>
                            <p className="text-sm mt-1">Customer confirmed subscription details</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">First Delivery Scheduled</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(selectedSubscriber.nextDeliveryDate), 'PPP')}
                            </p>
                            <p className="text-sm mt-1">Delivery #DEL-202603-001 scheduled</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Call Log Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>
              Record call outcome and set follow-up if needed
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Call Status</Label>
              <Select value={callStatus} onValueChange={(value: any) => setCallStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {callStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {callStatus === 'call_later' && (
              <div className="space-y-2">
                <Label>Call Later Date</Label>
                <Input
                  type="datetime-local"
                  value={callLaterDate}
                  onChange={(e) => setCallLaterDate(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Call Notes</Label>
              <Textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Record details of the call..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCallStatus}>
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
              Add a note to this subscription
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Note Type</Label>
              <Select value={noteType} onValueChange={(value: any) => setNoteType(value)}>
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
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
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

      {/* Schedule Delivery Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Delivery</DialogTitle>
            <DialogDescription>
              Schedule a new delivery for this subscription
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Delivery Date *</Label>
              <Input
                type="date"
                value={deliveryForm.scheduledDate}
                onChange={(e) => setDeliveryForm({...deliveryForm, scheduledDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rider Name</Label>
                <Input
                  value={deliveryForm.riderName}
                  onChange={(e) => setDeliveryForm({...deliveryForm, riderName: e.target.value})}
                  placeholder="e.g., James Banda"
                />
              </div>
              <div className="space-y-2">
                <Label>Rider Phone</Label>
                <Input
                  value={deliveryForm.riderPhone}
                  onChange={(e) => setDeliveryForm({...deliveryForm, riderPhone: e.target.value})}
                  placeholder="0991234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                value={deliveryForm.trackingNumber}
                onChange={(e) => setDeliveryForm({...deliveryForm, trackingNumber: e.target.value})}
                placeholder="e.g., TRK123456"
              />
            </div>

            <div className="space-y-2">
              <Label>Delivery Notes</Label>
              <Textarea
                value={deliveryForm.deliveryNotes}
                onChange={(e) => setDeliveryForm({...deliveryForm, deliveryNotes: e.target.value})}
                placeholder="Special instructions for the rider..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleDelivery}>
              Schedule Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for this subscription
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
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={invoiceForm.paymentMethod} 
                onValueChange={(value) => setInvoiceForm({...invoiceForm, paymentMethod: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="airtel_money">Airtel Money</SelectItem>
                  <SelectItem value="tnm_mpamba">TNM Mpamba</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <Input
                value={invoiceForm.paymentReference}
                onChange={(e) => setInvoiceForm({...invoiceForm, paymentReference: e.target.value})}
                placeholder="Transaction ID"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateInvoice}>
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscribers;