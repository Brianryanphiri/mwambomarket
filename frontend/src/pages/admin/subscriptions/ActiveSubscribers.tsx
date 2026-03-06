import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Loader2,
  Download,
  RefreshCw,
  UserPlus,
  MessageSquare,
  Bell,
  Truck,
  DollarSign,
  FileText,
  Edit,
  Trash2,
  Ban,
  Plus,
  ChevronDown,
  ArrowUpDown,
  DownloadCloud,
  Printer,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance, formatDistanceToNow } from 'date-fns';

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
  customerAvatar?: string;
  startDate: string;
  nextDeliveryDate: string;
  deliveryDay: string;
  deliveryTime?: string;
  deliveryAddress: string;
  paymentMethod: string;
  totalPaid: number;
  totalDeliveries: number;
  successfulDeliveries: number;
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
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SubscriberStats {
  total: number;
  active: number;
  pending: number;
  paused: number;
  cancelled: number;
  todayDeliveries: number;
  weekDeliveries: number;
  overduePayments: number;
  pendingCalls: number;
  monthlyRevenue: number;
  averageSubscriptionValue: number;
  retentionRate: number;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'paused', label: 'Paused', color: 'bg-blue-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'expired', label: 'Expired', color: 'bg-gray-500' },
];

const callStatusOptions = [
  { value: 'all', label: 'All Calls' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'called', label: 'Called', color: 'bg-blue-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
  { value: 'no_answer', label: 'No Answer', color: 'bg-red-500' },
  { value: 'call_later', label: 'Call Later', color: 'bg-orange-500' },
];

const paymentStatusOptions = [
  { value: 'all', label: 'All Payments' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500' },
];

const ActiveSubscribers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCallStatus, setSelectedCallStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const [showAddSubscriber, setShowAddSubscriber] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  
  const [callForm, setCallForm] = useState({
    status: 'pending' as const,
    notes: '',
    callLaterDate: ''
  });
  
  const [noteForm, setNoteForm] = useState({
    note: '',
    type: 'general' as const
  });
  
  const [stats, setStats] = useState<SubscriberStats>({
    total: 0,
    active: 0,
    pending: 0,
    paused: 0,
    cancelled: 0,
    todayDeliveries: 0,
    weekDeliveries: 0,
    overduePayments: 0,
    pendingCalls: 0,
    monthlyRevenue: 0,
    averageSubscriptionValue: 0,
    retentionRate: 0
  });

  // Plans for filter
  const [plans, setPlans] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchSubscribers();
    fetchPlans();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const data = await subscriptionService.getAllSubscribers();
      
      // Mock data
      const mockSubscribers: Subscriber[] = [
        {
          id: '1',
          subscriptionNumber: 'SUB-202602-0001',
          planId: '7',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          planInterval: 'weekly',
          customerName: 'Brian Phiri',
          customerEmail: 'brian.phiri@example.com',
          customerPhone: '+265991234567',
          startDate: '2026-02-25',
          nextDeliveryDate: '2026-03-04',
          deliveryDay: 'tuesday',
          deliveryTime: '10:00 - 12:00',
          deliveryAddress: 'Area 123, Lilongwe',
          paymentMethod: 'airtel_money',
          totalPaid: 15000,
          totalDeliveries: 1,
          successfulDeliveries: 1,
          status: 'active',
          callStatus: 'confirmed',
          paymentStatus: 'paid',
          lastPaymentDate: '2026-02-25',
          nextPaymentDate: '2026-03-04',
          reminderSent: true,
          lastReminderDate: '2026-02-24',
          createdAt: '2026-02-25T10:30:00Z',
          updatedAt: '2026-02-25T10:30:00Z',
          tags: ['vip', 'morning']
        },
        {
          id: '2',
          subscriptionNumber: 'SUB-202602-0002',
          planId: '8',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          planInterval: 'weekly',
          customerName: 'Mary Banda',
          customerEmail: 'mary.banda@example.com',
          customerPhone: '+265992345678',
          startDate: '2026-02-24',
          nextDeliveryDate: '2026-03-03',
          deliveryDay: 'wednesday',
          deliveryAddress: 'Area 25, Lilongwe',
          paymentMethod: 'cash',
          totalPaid: 9000,
          totalDeliveries: 1,
          successfulDeliveries: 0,
          status: 'pending',
          callStatus: 'pending',
          paymentStatus: 'pending',
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
          customerEmail: 'john.chimwala@example.com',
          customerPhone: '+265993456789',
          startDate: '2026-02-20',
          nextDeliveryDate: '2026-02-27',
          deliveryDay: 'friday',
          deliveryTime: '14:00 - 16:00',
          deliveryAddress: 'Area 47, Lilongwe',
          paymentMethod: 'tnm_mpamba',
          totalPaid: 50000,
          totalDeliveries: 2,
          successfulDeliveries: 2,
          status: 'active',
          callStatus: 'confirmed',
          paymentStatus: 'paid',
          lastPaymentDate: '2026-02-20',
          nextPaymentDate: '2026-02-27',
          reminderSent: true,
          lastReminderDate: '2026-02-19',
          createdAt: '2026-02-20T09:15:00Z',
          updatedAt: '2026-02-20T09:15:00Z',
          tags: ['vip']
        },
        {
          id: '4',
          subscriptionNumber: 'SUB-202602-0004',
          planId: '10',
          planName: 'Family Essentials',
          planPrice: 65000,
          planInterval: 'weekly',
          customerName: 'Alice Phiri',
          customerEmail: 'alice.phiri@example.com',
          customerPhone: '+265994567890',
          startDate: '2026-02-22',
          nextDeliveryDate: '2026-02-29',
          deliveryDay: 'monday',
          deliveryAddress: 'Area 18, Lilongwe',
          paymentMethod: 'card',
          totalPaid: 130000,
          totalDeliveries: 2,
          successfulDeliveries: 2,
          status: 'paused',
          pauseUntil: '2026-03-10',
          callStatus: 'called',
          lastCallDate: '2026-02-23',
          paymentStatus: 'paid',
          lastPaymentDate: '2026-02-22',
          nextPaymentDate: '2026-02-29',
          reminderSent: true,
          lastReminderDate: '2026-02-21',
          createdAt: '2026-02-22T11:45:00Z',
          updatedAt: '2026-02-22T11:45:00Z'
        },
        {
          id: '5',
          subscriptionNumber: 'SUB-202602-0005',
          planId: '7',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          planInterval: 'weekly',
          customerName: 'David Banda',
          customerEmail: 'david.banda@example.com',
          customerPhone: '+265995678901',
          startDate: '2026-02-18',
          nextDeliveryDate: '2026-02-25',
          deliveryDay: 'thursday',
          deliveryAddress: 'Area 33, Lilongwe',
          paymentMethod: 'airtel_money',
          totalPaid: 45000,
          totalDeliveries: 3,
          successfulDeliveries: 2,
          status: 'active',
          callStatus: 'confirmed',
          paymentStatus: 'overdue',
          lastPaymentDate: '2026-02-18',
          nextPaymentDate: '2026-02-25',
          reminderSent: true,
          lastReminderDate: '2026-02-24',
          createdAt: '2026-02-18T16:30:00Z',
          updatedAt: '2026-02-18T16:30:00Z'
        },
        {
          id: '6',
          subscriptionNumber: 'SUB-202602-0006',
          planId: '8',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          planInterval: 'weekly',
          customerName: 'Grace Mwale',
          customerEmail: 'grace.mwale@example.com',
          customerPhone: '+265996789012',
          startDate: '2026-02-23',
          nextDeliveryDate: '2026-03-02',
          deliveryDay: 'tuesday',
          deliveryAddress: 'Area 12, Lilongwe',
          paymentMethod: 'cash',
          totalPaid: 0,
          totalDeliveries: 0,
          successfulDeliveries: 0,
          status: 'pending',
          callStatus: 'no_answer',
          lastCallDate: '2026-02-24',
          nextCallDate: '2026-02-25',
          paymentStatus: 'pending',
          reminderSent: false,
          createdAt: '2026-02-23T08:15:00Z',
          updatedAt: '2026-02-23T08:15:00Z'
        },
        {
          id: '7',
          subscriptionNumber: 'SUB-202602-0007',
          planId: '9',
          planName: 'Dairy Delight',
          planPrice: 25000,
          planInterval: 'weekly',
          customerName: 'Peter Kachale',
          customerEmail: 'peter.kachale@example.com',
          customerPhone: '+265997890123',
          startDate: '2026-02-15',
          nextDeliveryDate: '2026-02-22',
          deliveryDay: 'saturday',
          deliveryAddress: 'Area 29, Lilongwe',
          paymentMethod: 'tnm_mpamba',
          totalPaid: 50000,
          totalDeliveries: 2,
          successfulDeliveries: 2,
          status: 'cancelled',
          cancelledAt: '2026-02-21',
          cancellationReason: 'Moving to another city',
          callStatus: 'called',
          lastCallDate: '2026-02-20',
          paymentStatus: 'paid',
          lastPaymentDate: '2026-02-15',
          reminderSent: false,
          createdAt: '2026-02-15T12:45:00Z',
          updatedAt: '2026-02-21T09:30:00Z'
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

  const fetchPlans = async () => {
    try {
      // Replace with actual API call
      // const data = await subscriptionService.getSubscriptionPlans();
      setPlans([
        { id: '7', name: 'Weekly Veggie Box' },
        { id: '8', name: 'Daily Bread Club' },
        { id: '9', name: 'Dairy Delight' },
        { id: '10', name: 'Family Essentials' },
      ]);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const calculateStats = (data: Subscriber[]) => {
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const active = data.filter(s => s.status === 'active');
    const totalRevenue = active.reduce((sum, s) => sum + s.planPrice * 4, 0); // Monthly estimate
    
    setStats({
      total: data.length,
      active: active.length,
      pending: data.filter(s => s.status === 'pending').length,
      paused: data.filter(s => s.status === 'paused').length,
      cancelled: data.filter(s => s.status === 'cancelled').length,
      todayDeliveries: data.filter(s => 
        s.status === 'active' && s.nextDeliveryDate === today
      ).length,
      weekDeliveries: data.filter(s => 
        s.status === 'active' && 
        s.nextDeliveryDate >= today && 
        s.nextDeliveryDate <= weekFromNow
      ).length,
      overduePayments: data.filter(s => s.paymentStatus === 'overdue').length,
      pendingCalls: data.filter(s => s.callStatus === 'pending' || s.callStatus === 'call_later').length,
      monthlyRevenue: totalRevenue,
      averageSubscriptionValue: active.length > 0 ? totalRevenue / active.length : 0,
      retentionRate: 85 // This would come from analytics
    });
  };

  const handleViewSubscriber = (id: string) => {
    navigate(`/admin/subscriptions/subscribers/${id}`);
  };

  const handleQuickCall = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setCallForm({
      status: subscriber.callStatus,
      notes: subscriber.callNotes || '',
      callLaterDate: subscriber.nextCallDate || ''
    });
    setShowCallDialog(true);
  };

  const handleAddNote = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setNoteForm({ note: '', type: 'general' });
    setShowNoteDialog(true);
  };

  const handleSendReminder = async (subscriber: Subscriber, type: 'payment' | 'delivery' | 'call') => {
    try {
      // API call would go here
      toast({
        title: 'Reminder Sent',
        description: `${type} reminder sent to ${subscriber.customerName}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Subscriber['status']) => {
    try {
      setSubscribers(prev => prev.map(s => 
        s.id === id ? { ...s, status: newStatus } : s
      ));
      calculateStats(subscribers);
      
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

  const handleBulkAction = async (action: string) => {
    if (selectedSubscribers.length === 0) return;
    
    try {
      // API call would go here
      toast({
        title: 'Bulk Action Completed',
        description: `${action} applied to ${selectedSubscribers.length} subscribers`,
      });
      setSelectedSubscribers([]);
      setSelectAll(false);
      setShowBulkActions(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      // API call would go here
      toast({
        title: 'Export Started',
        description: `Exporting ${filteredSubscribers.length} subscribers to ${format.toUpperCase()}`,
      });
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map(s => s.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectSubscriber = (id: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(id) 
        ? prev.filter(sId => sId !== id)
        : [...prev, id]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
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

  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
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
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || sub.paymentStatus === selectedPaymentStatus;
    const matchesPlan = selectedPlan === 'all' || sub.planId === selectedPlan;
    
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let matchesDate = true;
    if (dateRange === 'today') {
      matchesDate = sub.nextDeliveryDate === today;
    } else if (dateRange === 'week') {
      matchesDate = sub.nextDeliveryDate >= today && sub.nextDeliveryDate <= weekFromNow;
    } else if (dateRange === 'month') {
      const monthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      matchesDate = sub.nextDeliveryDate >= today && sub.nextDeliveryDate <= monthFromNow;
    }
    
    return matchesSearch && matchesStatus && matchesCallStatus && matchesPaymentStatus && matchesPlan && matchesDate;
  });

  const sortedSubscribers = [...filteredSubscribers].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.customerName.localeCompare(b.customerName)
        : b.customerName.localeCompare(a.customerName);
    } else if (sortBy === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.nextDeliveryDate).getTime() - new Date(b.nextDeliveryDate).getTime()
        : new Date(b.nextDeliveryDate).getTime() - new Date(a.nextDeliveryDate).getTime();
    } else {
      return sortOrder === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Active Subscribers</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your subscription customers
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchSubscribers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => setShowAddSubscriber(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Active</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">Paused</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.paused}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400">Today's Delivery</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.todayDeliveries}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 dark:text-orange-400">Pending Calls</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.pendingCalls}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400">Overdue</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.overduePayments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold">MK {stats.monthlyRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('table')}
                  className="shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCallStatus} onValueChange={setSelectedCallStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Call Status" />
                </SelectTrigger>
                <SelectContent>
                  {callStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Delivery Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedCallStatus('all');
                  setSelectedPaymentStatus('all');
                  setSelectedPlan('all');
                  setDateRange('all');
                }}
              >
                Clear Filters
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedSubscribers.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedSubscribers.length} subscriber{selectedSubscribers.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('send reminder')}>
                    <Bell className="w-4 h-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('update status')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count and sorting */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedSubscribers.length} of {subscribers.length} subscribers
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Delivery Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Call Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Next Delivery</TableHead>
                  <TableHead>Delivery Day</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-lg font-medium">No subscribers found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your filters or add a new subscriber
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedSubscribers.map((sub) => (
                    <TableRow key={sub.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(sub.id)}
                          onChange={() => toggleSelectSubscriber(sub.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                              {getInitials(sub.customerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{sub.customerName}</p>
                            <p className="text-xs text-muted-foreground">{sub.customerEmail}</p>
                            <p className="text-xs text-muted-foreground font-mono">{sub.subscriptionNumber}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                        <div>
                          <p className="font-medium">{sub.planName}</p>
                          <p className="text-xs text-muted-foreground">MK {sub.planPrice.toLocaleString()}/{sub.planInterval}</p>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                        <Badge className={`${getStatusColor(sub.status)} text-white`}>
                          {sub.status}
                        </Badge>
                        {sub.pauseUntil && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Until {format(new Date(sub.pauseUntil), 'MMM d')}
                          </p>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                        <Badge className={`${getCallStatusColor(sub.callStatus)} text-white`}>
                          {sub.callStatus.replace('_', ' ')}
                        </Badge>
                        {sub.nextCallDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(sub.nextCallDate), { addSuffix: true })}
                          </p>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                        <Badge className={`${getPaymentStatusColor(sub.paymentStatus)} text-white`}>
                          {sub.paymentStatus}
                        </Badge>
                        {sub.nextPaymentDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due {format(new Date(sub.nextPaymentDate), 'MMM d')}
                          </p>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                        <p className="font-medium">
                          {format(new Date(sub.nextDeliveryDate), 'MMM d, yyyy')}
                        </p>
                      </TableCell>
                      <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                        <p className="capitalize">{sub.deliveryDay}</p>
                        {sub.deliveryTime && (
                          <p className="text-xs text-muted-foreground">{sub.deliveryTime}</p>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                        <p className="text-sm">{format(new Date(sub.startDate), 'MMM d, yyyy')}</p>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewSubscriber(sub.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickCall(sub)}>
                              <Phone className="w-4 h-4 mr-2" />
                              Log Call
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddNote(sub)}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Add Note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSendReminder(sub, 'payment')}>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Payment Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendReminder(sub, 'delivery')}>
                              <Truck className="w-4 h-4 mr-2" />
                              Delivery Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendReminder(sub, 'call')}>
                              <Bell className="w-4 h-4 mr-2" />
                              Call Reminder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {sub.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(sub.id, 'paused')}>
                                <PauseCircle className="w-4 h-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                            ) : sub.status === 'paused' ? (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(sub.id, 'active')}>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Resume
                              </DropdownMenuItem>
                            ) : null}
                            {sub.status !== 'cancelled' && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleUpdateStatus(sub.id, 'cancelled')}
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
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSubscribers.map((sub) => (
            <Card key={sub.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        {getInitials(sub.customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{sub.customerName}</p>
                      <p className="text-xs text-muted-foreground">{sub.customerEmail}</p>
                      <p className="text-xs text-muted-foreground font-mono">{sub.subscriptionNumber}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewSubscriber(sub.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleQuickCall(sub)}>
                        <Phone className="w-4 h-4 mr-2" />
                        Log Call
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddNote(sub)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <span className="font-medium">{sub.planName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-medium">MK {sub.planPrice.toLocaleString()}/{sub.planInterval}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={`${getStatusColor(sub.status)} text-white`}>
                      {sub.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Call Status</span>
                    <Badge className={`${getCallStatusColor(sub.callStatus)} text-white`}>
                      {sub.callStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment</span>
                    <Badge className={`${getPaymentStatusColor(sub.paymentStatus)} text-white`}>
                      {sub.paymentStatus}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Next Delivery</span>
                    <span className="font-medium">
                      {format(new Date(sub.nextDeliveryDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Delivery Day</span>
                    <span className="capitalize">{sub.deliveryDay}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Started</span>
                    <span>{format(new Date(sub.startDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleQuickCall(sub)}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSendReminder(sub, 'payment')}>
                    <Bell className="w-4 h-4 mr-2" />
                    Remind
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>
              {selectedSubscriber && `Record call with ${selectedSubscriber.customerName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Call Status</Label>
              <Select 
                value={callForm.status} 
                onValueChange={(value: any) => setCallForm({...callForm, status: value})}
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
            <Button onClick={() => {
              setShowCallDialog(false);
              toast({
                title: 'Call Logged',
                description: 'Call record saved successfully',
              });
            }}>
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
              {selectedSubscriber && `Add a note for ${selectedSubscriber.customerName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Note Type</Label>
              <Select 
                value={noteForm.type} 
                onValueChange={(value: any) => setNoteForm({...noteForm, type: value})}
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
                value={noteForm.note}
                onChange={(e) => setNoteForm({...noteForm, note: e.target.value})}
                placeholder="Enter your note..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowNoteDialog(false);
              toast({
                title: 'Note Added',
                description: 'Note saved successfully',
              });
            }}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>
              Apply multiple filters to narrow down subscribers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" placeholder="Start Date" />
                <Input type="date" placeholder="End Date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Min Price" />
                <Input type="number" placeholder="Max Price" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <Input placeholder="Enter tags separated by commas" />
            </div>

            <div className="space-y-2">
              <Label>Delivery Areas</Label>
              <Input placeholder="Area 123, Area 25, etc." />
            </div>

            <div className="flex items-center gap-2">
              <Switch id="hasNotes" />
              <Label htmlFor="hasNotes">Has notes</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="hasReminders" />
              <Label htmlFor="hasReminders">Has pending reminders</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Subscribers</DialogTitle>
            <DialogDescription>
              Choose export format and options
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('excel')}>
                  Excel
                </Button>
                <Button variant="outline" onClick={() => handleExport('pdf')}>
                  PDF
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data to Export</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="basic" defaultChecked className="rounded" />
                  <Label htmlFor="basic">Basic Info</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="payment" defaultChecked className="rounded" />
                  <Label htmlFor="payment">Payment Details</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="delivery" defaultChecked className="rounded" />
                  <Label htmlFor="delivery">Delivery Details</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="calls" defaultChecked className="rounded" />
                  <Label htmlFor="calls">Call Logs</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="notes" defaultChecked className="rounded" />
                  <Label htmlFor="notes">Notes</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleExport('csv')}>
              <DownloadCloud className="w-4 h-4 mr-2" />
              Export Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subscriber Dialog */}
      <Dialog open={showAddSubscriber} onOpenChange={setShowAddSubscriber}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogDescription>
              Manually add a new subscription customer
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input placeholder="0991234567" />
            </div>
            <div className="space-y-2">
              <Label>Plan *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Delivery Day *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
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
            <div className="space-y-2 col-span-2">
              <Label>Delivery Address *</Label>
              <Textarea placeholder="Area, street, house number..." />
            </div>
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash on Delivery</SelectItem>
                  <SelectItem value="airtel_money">Airtel Money</SelectItem>
                  <SelectItem value="tnm_mpamba">TNM Mpamba</SelectItem>
                  <SelectItem value="card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial Payment *</Label>
              <Input type="number" placeholder="15000" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSubscriber(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowAddSubscriber(false);
              toast({
                title: 'Subscriber Added',
                description: 'New subscription created successfully',
              });
            }}>
              Add Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveSubscribers;