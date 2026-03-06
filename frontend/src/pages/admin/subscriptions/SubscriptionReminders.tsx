import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  Download,
  RefreshCw,
  Plus,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Edit,
  Copy,
  ChevronLeft,
  ChevronRight,
  Ban,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface Reminder {
  id: string;
  subscriptionId: string;
  subscriptionNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar?: string;
  planName: string;
  reminderType: 'payment' | 'delivery' | 'call' | 'renewal' | 'expiry' | 'custom';
  reminderMethod: 'email' | 'sms' | 'both' | 'push' | 'in_app';
  title: string;
  message: string;
  scheduledDate: string;
  scheduledTime?: string;
  sentDate?: string;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  recurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: string;
  readReceipt?: boolean;
  readAt?: string;
  clickedAt?: string;
  actionTaken?: boolean;
  actionType?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReminderStats {
  total: number;
  scheduled: number;
  sent: number;
  failed: number;
  cancelled: number;
  paymentReminders: number;
  deliveryReminders: number;
  callReminders: number;
  renewalReminders: number;
  expiryReminders: number;
  customReminders: number;
  emailReminders: number;
  smsReminders: number;
  bothReminders: number;
  pushReminders: number;
  inAppReminders: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  recurring: number;
  readRate: number;
  actionRate: number;
}

// Simplified options without icons
const reminderTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'payment', label: 'Payment', color: 'bg-green-500' },
  { value: 'delivery', label: 'Delivery', color: 'bg-blue-500' },
  { value: 'call', label: 'Call', color: 'bg-orange-500' },
  { value: 'renewal', label: 'Renewal', color: 'bg-purple-500' },
  { value: 'expiry', label: 'Expiry', color: 'bg-red-500' },
  { value: 'custom', label: 'Custom', color: 'bg-yellow-500' },
];

const reminderMethodOptions = [
  { value: 'all', label: 'All Methods' },
  { value: 'email', label: 'Email', color: 'bg-blue-500' },
  { value: 'sms', label: 'SMS', color: 'bg-green-500' },
  { value: 'both', label: 'Both', color: 'bg-purple-500' },
  { value: 'push', label: 'Push', color: 'bg-orange-500' },
  { value: 'in_app', label: 'In-App', color: 'bg-indigo-500' },
];

const reminderStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
  { value: 'sent', label: 'Sent', color: 'bg-green-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
  { value: 'medium', label: 'Medium', color: 'bg-orange-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
];

const SubscriptionReminders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showReminderDetails, setShowReminderDetails] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const [reminderForm, setReminderForm] = useState({
    reminderType: 'payment' as const,
    reminderMethod: 'email' as const,
    title: '',
    message: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'medium' as const,
    recurring: false,
    recurringPattern: 'weekly' as const,
    recurringEndDate: '',
    subscriptionId: ''
  });
  
  const [stats, setStats] = useState<ReminderStats>({
    total: 0,
    scheduled: 0,
    sent: 0,
    failed: 0,
    cancelled: 0,
    paymentReminders: 0,
    deliveryReminders: 0,
    callReminders: 0,
    renewalReminders: 0,
    expiryReminders: 0,
    customReminders: 0,
    emailReminders: 0,
    smsReminders: 0,
    bothReminders: 0,
    pushReminders: 0,
    inAppReminders: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    recurring: 0,
    readRate: 0,
    actionRate: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockReminders: Reminder[] = [
        {
          id: '1',
          subscriptionId: '1',
          subscriptionNumber: 'SUB-202602-0001',
          customerName: 'Brian Phiri',
          customerEmail: 'brian.phiri@example.com',
          customerPhone: '+265991234567',
          planName: 'Weekly Veggie Box',
          reminderType: 'payment',
          reminderMethod: 'email',
          title: 'Payment Due Reminder',
          message: 'Your payment of MK 15,000 for Weekly Veggie Box is due tomorrow.',
          scheduledDate: '2026-03-03',
          scheduledTime: '09:00',
          status: 'scheduled',
          priority: 'high',
          recurring: false,
          createdAt: '2026-03-01T10:00:00Z',
          updatedAt: '2026-03-01T10:00:00Z'
        },
        {
          id: '2',
          subscriptionId: '2',
          subscriptionNumber: 'SUB-202602-0002',
          customerName: 'Mary Banda',
          customerEmail: 'mary.banda@example.com',
          customerPhone: '+265992345678',
          planName: 'Daily Bread Club',
          reminderType: 'delivery',
          reminderMethod: 'sms',
          title: 'Delivery Reminder',
          message: 'Your Daily Bread Club delivery is scheduled for tomorrow between 08:00 - 10:00.',
          scheduledDate: '2026-03-02',
          scheduledTime: '18:00',
          sentDate: '2026-03-02T18:05:00Z',
          status: 'sent',
          priority: 'medium',
          recurring: true,
          recurringPattern: 'weekly',
          recurringEndDate: '2026-06-02',
          readReceipt: true,
          readAt: '2026-03-02T18:15:00Z',
          createdAt: '2026-02-25T14:20:00Z',
          updatedAt: '2026-03-02T18:15:00Z'
        },
        {
          id: '3',
          subscriptionId: '3',
          subscriptionNumber: 'SUB-202602-0003',
          customerName: 'John Chimwala',
          customerEmail: 'john.chimwala@example.com',
          customerPhone: '+265993456789',
          planName: 'Dairy Delight',
          reminderType: 'call',
          reminderMethod: 'both',
          title: 'Follow-up Call Reminder',
          message: 'Follow-up call scheduled to confirm satisfaction with Dairy Delight.',
          scheduledDate: '2026-03-05',
          scheduledTime: '14:30',
          status: 'scheduled',
          priority: 'medium',
          recurring: false,
          createdAt: '2026-03-01T09:15:00Z',
          updatedAt: '2026-03-01T09:15:00Z'
        },
        {
          id: '4',
          subscriptionId: '4',
          subscriptionNumber: 'SUB-202602-0004',
          customerName: 'Alice Phiri',
          customerEmail: 'alice.phiri@example.com',
          customerPhone: '+265994567890',
          planName: 'Family Essentials',
          reminderType: 'renewal',
          reminderMethod: 'email',
          title: 'Subscription Renewal',
          message: 'Your Family Essentials subscription will renew in 7 days.',
          scheduledDate: '2026-03-10',
          scheduledTime: '10:00',
          status: 'scheduled',
          priority: 'high',
          recurring: true,
          recurringPattern: 'monthly',
          recurringEndDate: '2026-12-31',
          createdAt: '2026-02-22T11:45:00Z',
          updatedAt: '2026-02-22T11:45:00Z'
        },
        {
          id: '5',
          subscriptionId: '5',
          subscriptionNumber: 'SUB-202602-0005',
          customerName: 'David Banda',
          customerEmail: 'david.banda@example.com',
          customerPhone: '+265995678901',
          planName: 'Weekly Veggie Box',
          reminderType: 'payment',
          reminderMethod: 'sms',
          title: 'Payment Overdue',
          message: 'Your payment of MK 15,000 is overdue. Please make payment immediately.',
          scheduledDate: '2026-02-26',
          scheduledTime: '09:00',
          sentDate: '2026-02-26T09:05:00Z',
          status: 'sent',
          priority: 'high',
          recurring: false,
          readReceipt: false,
          actionTaken: true,
          actionType: 'payment_made',
          createdAt: '2026-02-25T16:30:00Z',
          updatedAt: '2026-02-26T09:05:00Z'
        },
        {
          id: '6',
          subscriptionId: '6',
          subscriptionNumber: 'SUB-202602-0006',
          customerName: 'Grace Mwale',
          customerEmail: 'grace.mwale@example.com',
          customerPhone: '+265996789012',
          planName: 'Daily Bread Club',
          reminderType: 'delivery',
          reminderMethod: 'email',
          title: 'Delivery Rescheduled',
          message: 'Your delivery has been rescheduled to March 3rd due to public holiday.',
          scheduledDate: '2026-03-02',
          scheduledTime: '08:00',
          sentDate: '2026-03-01T14:30:00Z',
          status: 'sent',
          priority: 'high',
          recurring: false,
          readReceipt: true,
          readAt: '2026-03-01T15:45:00Z',
          createdAt: '2026-03-01T14:30:00Z',
          updatedAt: '2026-03-01T15:45:00Z'
        },
        {
          id: '7',
          subscriptionId: '7',
          subscriptionNumber: 'SUB-202602-0007',
          customerName: 'Peter Kachale',
          customerEmail: 'peter.kachale@example.com',
          customerPhone: '+265997890123',
          planName: 'Dairy Delight',
          reminderType: 'expiry',
          reminderMethod: 'both',
          title: 'Subscription Expiring Soon',
          message: 'Your Dairy Delight subscription will expire in 3 days. Renew now to continue receiving deliveries.',
          scheduledDate: '2026-02-25',
          scheduledTime: '10:00',
          sentDate: '2026-02-25T10:05:00Z',
          status: 'failed',
          priority: 'high',
          recurring: false,
          notes: 'SMS delivery failed, email sent successfully',
          createdAt: '2026-02-20T12:45:00Z',
          updatedAt: '2026-02-25T10:05:00Z'
        },
        {
          id: '8',
          subscriptionId: '8',
          subscriptionNumber: 'SUB-202602-0008',
          customerName: 'Chisomo Banda',
          customerEmail: 'chisomo.banda@example.com',
          customerPhone: '+265998901234',
          planName: 'Family Essentials',
          reminderType: 'custom',
          reminderMethod: 'email',
          title: 'Special Promotion',
          message: 'As a valued subscriber, enjoy 20% off on your next order!',
          scheduledDate: '2026-03-15',
          scheduledTime: '12:00',
          status: 'scheduled',
          priority: 'low',
          recurring: false,
          createdAt: '2026-03-01T09:30:00Z',
          updatedAt: '2026-03-01T09:30:00Z'
        },
        {
          id: '9',
          subscriptionId: '9',
          subscriptionNumber: 'SUB-202602-0009',
          customerName: 'Tiwonge Phiri',
          customerEmail: 'tiwonge.phiri@example.com',
          customerPhone: '+265999012345',
          planName: 'Weekly Veggie Box',
          reminderType: 'call',
          reminderMethod: 'push',
          title: 'Quality Feedback Call',
          message: 'Please call customer to get feedback on recent deliveries.',
          scheduledDate: '2026-03-04',
          scheduledTime: '11:00',
          status: 'scheduled',
          priority: 'medium',
          recurring: false,
          createdAt: '2026-03-02T10:15:00Z',
          updatedAt: '2026-03-02T10:15:00Z'
        },
        {
          id: '10',
          subscriptionId: '10',
          subscriptionNumber: 'SUB-202602-0010',
          customerName: 'Kondwani Mwale',
          customerEmail: 'kondwani.mwale@example.com',
          customerPhone: '+265990123456',
          planName: 'Daily Bread Club',
          reminderType: 'payment',
          reminderMethod: 'email',
          title: 'Payment Confirmation',
          message: 'Thank you for your payment of MK 9,000. Your next delivery is scheduled for March 5th.',
          scheduledDate: '2026-02-28',
          scheduledTime: '15:00',
          sentDate: '2026-02-28T15:05:00Z',
          status: 'sent',
          priority: 'low',
          recurring: false,
          readReceipt: true,
          readAt: '2026-02-28T16:20:00Z',
          actionTaken: false,
          createdAt: '2026-02-28T14:45:00Z',
          updatedAt: '2026-02-28T16:20:00Z'
        }
      ];
      
      setReminders(mockReminders);
      calculateStats(mockReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reminders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Reminder[]) => {
    const sent = data.filter(r => r.status === 'sent');
    const read = sent.filter(r => r.readReceipt);
    const action = sent.filter(r => r.actionTaken);
    
    setStats({
      total: data.length,
      scheduled: data.filter(r => r.status === 'scheduled').length,
      sent: sent.length,
      failed: data.filter(r => r.status === 'failed').length,
      cancelled: data.filter(r => r.status === 'cancelled').length,
      paymentReminders: data.filter(r => r.reminderType === 'payment').length,
      deliveryReminders: data.filter(r => r.reminderType === 'delivery').length,
      callReminders: data.filter(r => r.reminderType === 'call').length,
      renewalReminders: data.filter(r => r.reminderType === 'renewal').length,
      expiryReminders: data.filter(r => r.reminderType === 'expiry').length,
      customReminders: data.filter(r => r.reminderType === 'custom').length,
      emailReminders: data.filter(r => r.reminderMethod === 'email').length,
      smsReminders: data.filter(r => r.reminderMethod === 'sms').length,
      bothReminders: data.filter(r => r.reminderMethod === 'both').length,
      pushReminders: data.filter(r => r.reminderMethod === 'push').length,
      inAppReminders: data.filter(r => r.reminderMethod === 'in_app').length,
      highPriority: data.filter(r => r.priority === 'high').length,
      mediumPriority: data.filter(r => r.priority === 'medium').length,
      lowPriority: data.filter(r => r.priority === 'low').length,
      recurring: data.filter(r => r.recurring).length,
      readRate: sent.length > 0 ? (read.length / sent.length) * 100 : 0,
      actionRate: sent.length > 0 ? (action.length / sent.length) * 100 : 0
    });
  };

  const handleViewReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowReminderDetails(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setReminderForm({
      reminderType: reminder.reminderType,
      reminderMethod: reminder.reminderMethod,
      title: reminder.title,
      message: reminder.message,
      scheduledDate: reminder.scheduledDate,
      scheduledTime: reminder.scheduledTime || '',
      priority: reminder.priority,
      recurring: reminder.recurring,
      recurringPattern: reminder.recurringPattern || 'weekly',
      recurringEndDate: reminder.recurringEndDate || '',
      subscriptionId: reminder.subscriptionId
    });
    setShowCreateDialog(true);
  };

  const handleCreateReminder = () => {
    setShowCreateDialog(false);
    toast({
      title: 'Reminder Created',
      description: 'New reminder has been created successfully',
    });
  };

  const handleSendReminder = (reminderId: string) => {
    try {
      setReminders(prev => prev.map(r => 
        r.id === reminderId 
          ? { 
              ...r, 
              status: 'sent', 
              sentDate: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : r
      ));
      
      toast({
        title: 'Reminder Sent',
        description: 'Reminder has been sent successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
        variant: 'destructive',
      });
    }
  };

  const handleCancelReminder = (reminderId: string) => {
    try {
      setReminders(prev => prev.map(r => 
        r.id === reminderId 
          ? { ...r, status: 'cancelled', updatedAt: new Date().toISOString() }
          : r
      ));
      
      toast({
        title: 'Reminder Cancelled',
        description: 'Reminder has been cancelled',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel reminder',
        variant: 'destructive',
      });
    }
  };

  const handleReschedule = (reminderId: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
      handleEditReminder(reminder);
    }
  };

  const handleDuplicate = (reminder: Reminder) => {
    setReminderForm({
      reminderType: reminder.reminderType,
      reminderMethod: reminder.reminderMethod,
      title: `${reminder.title} (Copy)`,
      message: reminder.message,
      scheduledDate: '',
      scheduledTime: '',
      priority: reminder.priority,
      recurring: reminder.recurring,
      recurringPattern: reminder.recurringPattern || 'weekly',
      recurringEndDate: '',
      subscriptionId: reminder.subscriptionId
    });
    setShowCreateDialog(true);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedReminders([]);
    } else {
      setSelectedReminders(filteredReminders.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectReminder = (id: string) => {
    setSelectedReminders(prev => 
      prev.includes(id) 
        ? prev.filter(rId => rId !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'sent': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
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

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = 
      reminder.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.customerPhone.includes(searchTerm) ||
      reminder.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || reminder.reminderType === selectedType;
    const matchesMethod = selectedMethod === 'all' || reminder.reminderMethod === selectedMethod;
    const matchesStatus = selectedStatus === 'all' || reminder.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || reminder.priority === selectedPriority;
    
    let matchesDate = true;
    if (selectedDate === 'today') {
      matchesDate = reminder.scheduledDate === new Date().toISOString().split('T')[0];
    } else if (selectedDate === 'tomorrow') {
      matchesDate = reminder.scheduledDate === addDays(new Date(), 1).toISOString().split('T')[0];
    } else if (selectedDate === 'week') {
      const weekStart = startOfWeek(new Date()).toISOString().split('T')[0];
      const weekEnd = endOfWeek(new Date()).toISOString().split('T')[0];
      matchesDate = reminder.scheduledDate >= weekStart && reminder.scheduledDate <= weekEnd;
    }
    
    return matchesSearch && matchesType && matchesMethod && matchesStatus && matchesPriority && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReminders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReminders.length / itemsPerPage);

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
          <h1 className="text-3xl font-display font-bold">Subscription Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all automated and manual reminders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchReminders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => {
              setSelectedReminder(null);
              setReminderForm({
                reminderType: 'payment',
                reminderMethod: 'email',
                title: '',
                message: '',
                scheduledDate: '',
                scheduledTime: '',
                priority: 'medium',
                recurring: false,
                recurringPattern: 'weekly',
                recurringEndDate: '',
                subscriptionId: ''
              });
              setShowCreateDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Reminder
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
        <Card className="bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">Scheduled</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.scheduled}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Sent</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Payment</p>
            <p className="text-2xl font-bold">{stats.paymentReminders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Delivery</p>
            <p className="text-2xl font-bold">{stats.deliveryReminders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">High Priority</p>
            <p className="text-2xl font-bold">{stats.highPriority}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Recurring</p>
            <p className="text-2xl font-bold">{stats.recurring}</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-2xl font-bold">{stats.emailReminders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">SMS</p>
            <p className="text-2xl font-bold">{stats.smsReminders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Read Rate</p>
              <span className="text-sm font-medium">{stats.readRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.readRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Action Rate</p>
              <span className="text-sm font-medium">{stats.actionRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.actionRate} className="h-2 mt-2" />
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
                  placeholder="Search by customer, subscription, title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Reminder Type" />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {reminderMethodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {reminderStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedMethod('all');
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                  setSelectedDate('all');
                }}
              >
                Clear Filters
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedReminders.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedReminders.length} reminder{selectedReminders.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    selectedReminders.forEach(id => handleSendReminder(id));
                    setSelectedReminders([]);
                    setSelectAll(false);
                  }}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Now
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    // Handle reschedule bulk action
                    setSelectedReminders([]);
                    setSelectAll(false);
                  }}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    // Handle duplicate bulk action
                    setSelectedReminders([]);
                    setSelectAll(false);
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReminders.length)} of {filteredReminders.length} reminders
        </p>
      </div>

      {/* Reminders Table */}
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
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No reminders found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or create a new reminder
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((reminder) => (
                  <TableRow key={reminder.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedReminders.includes(reminder.id)}
                        onChange={() => toggleSelectReminder(reminder.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell onClick={() => handleViewReminder(reminder)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                            {getInitials(reminder.customerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{reminder.customerName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{reminder.subscriptionNumber}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewReminder(reminder)}>
                      <span className="capitalize">{reminder.reminderType}</span>
                    </TableCell>
                    <TableCell onClick={() => handleViewReminder(reminder)}>
                      <span className="capitalize">{reminder.reminderMethod.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell onClick={() => handleViewReminder(reminder)}>
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{reminder.message}</p>
                    </TableCell>
                    <TableCell onClick={() => handleViewReminder(reminder)}>
                      <div>
                        <p className="font-medium">{format(new Date(reminder.scheduledDate), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{reminder.scheduledTime || 'Anytime'}</p>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewReminder(reminder)}>
                      <Badge className={`${getStatusColor(reminder.status)} text-white`}>
                        {reminder.status}
                      </Badge>
                      {reminder.sentDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistance(new Date(reminder.sentDate), new Date(), { addSuffix: true })}
                        </p>
                      )}
                    </TableCell>
                    <TableCell onClick={() => handleViewReminder(reminder)}>
                      <Badge className={`${getPriorityColor(reminder.priority)} text-white`}>
                        {reminder.priority}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewReminder(reminder)}>
                      {reminder.recurring ? (
                        <div>
                          <Badge className="bg-purple-500 text-white">Yes</Badge>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">{reminder.recurringPattern}</p>
                        </div>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
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
                          <DropdownMenuItem onClick={() => handleViewReminder(reminder)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditReminder(reminder)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(reminder)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {reminder.status === 'scheduled' && (
                            <DropdownMenuItem onClick={() => handleSendReminder(reminder.id)}>
                              <Send className="w-4 h-4 mr-2" />
                              Send Now
                            </DropdownMenuItem>
                          )}
                          {reminder.status === 'scheduled' && (
                            <DropdownMenuItem onClick={() => handleReschedule(reminder.id)}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Reschedule
                            </DropdownMenuItem>
                          )}
                          {reminder.status !== 'cancelled' && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleCancelReminder(reminder.id)}
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

      {/* Pagination */}
      {filteredReminders.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reminder Details Dialog */}
      <Dialog open={showReminderDetails} onOpenChange={setShowReminderDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reminder Details</DialogTitle>
            <DialogDescription>
              {selectedReminder && `Reminder for ${selectedReminder.customerName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedReminder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedReminder.reminderType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="font-medium capitalize">{selectedReminder.reminderMethod.replace('_', ' ')}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedReminder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedReminder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedReminder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription</p>
                    <p className="font-medium font-mono">{selectedReminder.subscriptionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium">{selectedReminder.planName}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Reminder Content</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{selectedReminder.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Message</p>
                    <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedReminder.message}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Date</p>
                    <p className="font-medium">{format(new Date(selectedReminder.scheduledDate), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Time</p>
                    <p className="font-medium">{selectedReminder.scheduledTime || 'Anytime'}</p>
                  </div>
                  {selectedReminder.sentDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sent Date</p>
                      <p className="font-medium">{format(new Date(selectedReminder.sentDate), 'PPP p')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(selectedReminder.status)} text-white mt-1`}>
                      {selectedReminder.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge className={`${getPriorityColor(selectedReminder.priority)} text-white mt-1`}>
                      {selectedReminder.priority}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedReminder.recurring && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Recurring Schedule</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Pattern</p>
                        <p className="font-medium capitalize">{selectedReminder.recurringPattern}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">
                          {selectedReminder.recurringEndDate 
                            ? format(new Date(selectedReminder.recurringEndDate), 'PPP')
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedReminder.readReceipt && (
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Read on {selectedReminder.readAt && format(new Date(selectedReminder.readAt), 'PPP p')}
                  </p>
                  {selectedReminder.actionTaken && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Action taken: {selectedReminder.actionType}
                    </p>
                  )}
                </div>
              )}

              {selectedReminder.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedReminder.notes}</p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Created: {format(new Date(selectedReminder.createdAt), 'PPP p')}</span>
                <span>•</span>
                <span>Updated: {formatDistance(new Date(selectedReminder.updatedAt), new Date(), { addSuffix: true })}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDetails(false)}>
              Close
            </Button>
            {selectedReminder && (
              <>
                <Button variant="outline" onClick={() => {
                  setShowReminderDetails(false);
                  handleEditReminder(selectedReminder);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {selectedReminder.status === 'scheduled' && (
                  <Button onClick={() => {
                    handleSendReminder(selectedReminder.id);
                    setShowReminderDetails(false);
                  }}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Now
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Reminder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReminder ? 'Edit Reminder' : 'Create Reminder'}</DialogTitle>
            <DialogDescription>
              {selectedReminder ? 'Edit reminder details' : 'Create a new reminder for subscribers'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Reminder Type *</Label>
              <Select 
                value={reminderForm.reminderType} 
                onValueChange={(value: any) => setReminderForm({...reminderForm, reminderType: value})}
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
                  <SelectItem value="custom">Custom Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Method *</Label>
              <Select 
                value={reminderForm.reminderMethod} 
                onValueChange={(value: any) => setReminderForm({...reminderForm, reminderMethod: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="both">Both Email & SMS</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="in_app">In-App Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Title *</Label>
              <Input
                value={reminderForm.title}
                onChange={(e) => setReminderForm({...reminderForm, title: e.target.value})}
                placeholder="e.g., Payment Due Reminder"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={reminderForm.message}
                onChange={(e) => setReminderForm({...reminderForm, message: e.target.value})}
                placeholder="Enter reminder message..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Scheduled Date *</Label>
              <Input
                type="date"
                value={reminderForm.scheduledDate}
                onChange={(e) => setReminderForm({...reminderForm, scheduledDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Scheduled Time</Label>
              <Input
                type="time"
                value={reminderForm.scheduledTime}
                onChange={(e) => setReminderForm({...reminderForm, scheduledTime: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={reminderForm.priority} 
                onValueChange={(value: any) => setReminderForm({...reminderForm, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subscription</Label>
              <Select 
                value={reminderForm.subscriptionId} 
                onValueChange={(value) => setReminderForm({...reminderForm, subscriptionId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Brian Phiri - Weekly Veggie Box</SelectItem>
                  <SelectItem value="2">Mary Banda - Daily Bread Club</SelectItem>
                  <SelectItem value="3">John Chimwala - Dairy Delight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="recurring"
                  checked={reminderForm.recurring}
                  onCheckedChange={(checked) => setReminderForm({...reminderForm, recurring: checked})}
                />
                <Label htmlFor="recurring">Recurring Reminder</Label>
              </div>
            </div>

            {reminderForm.recurring && (
              <>
                <div className="space-y-2">
                  <Label>Repeat Pattern</Label>
                  <Select 
                    value={reminderForm.recurringPattern} 
                    onValueChange={(value: any) => setReminderForm({...reminderForm, recurringPattern: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={reminderForm.recurringEndDate}
                    onChange={(e) => setReminderForm({...reminderForm, recurringEndDate: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReminder}>
              {selectedReminder ? 'Update Reminder' : 'Create Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionReminders;