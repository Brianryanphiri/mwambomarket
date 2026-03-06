import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  Plus,
  MapPin,
  Phone,
  User,
  Package,
  DollarSign,
  Printer,
  Edit,
  Copy,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
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
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance, isToday, isTomorrow, isThisWeek } from 'date-fns';

interface Delivery {
  id: string;
  deliveryNumber: string;
  subscriptionId: string;
  subscriptionNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  planName: string;
  planPrice: number;
  scheduledDate: string;
  scheduledTime?: string;
  actualDeliveryDate?: string;
  actualDeliveryTime?: string;
  status: 'scheduled' | 'processing' | 'out_for_delivery' | 'delivered' | 'failed' | 'skipped' | 'rescheduled';
  riderName?: string;
  riderPhone?: string;
  riderId?: string;
  trackingNumber?: string;
  deliveryNotes?: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentReference?: string;
  confirmedByCustomer: boolean;
  confirmationTime?: string;
  signature?: string;
  photo?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryStats {
  total: number;
  scheduled: number;
  processing: number;
  outForDelivery: number;
  delivered: number;
  failed: number;
  skipped: number;
  rescheduled: number;
  todayDeliveries: number;
  tomorrowDeliveries: number;
  weekDeliveries: number;
  completionRate: number;
  onTimeRate: number;
  averageRating: number;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-500' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500' },
  { value: 'skipped', label: 'Skipped', color: 'bg-gray-500' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'bg-yellow-500' },
];

const paymentStatusOptions = [
  { value: 'all', label: 'All Payments' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500' },
  { value: 'refunded', label: 'Refunded', color: 'bg-purple-500' },
];

const SubscriptionDeliveries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedRider, setSelectedRider] = useState<string>('all');
  
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showAssignRiderDialog, setShowAssignRiderDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  
  const [riderForm, setRiderForm] = useState({
    riderId: '',
    riderName: '',
    riderPhone: '',
    trackingNumber: ''
  });
  
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '',
    newTime: '',
    reason: ''
  });
  
  const [stats, setStats] = useState<DeliveryStats>({
    total: 0,
    scheduled: 0,
    processing: 0,
    outForDelivery: 0,
    delivered: 0,
    failed: 0,
    skipped: 0,
    rescheduled: 0,
    todayDeliveries: 0,
    tomorrowDeliveries: 0,
    weekDeliveries: 0,
    completionRate: 0,
    onTimeRate: 0,
    averageRating: 0
  });

  const [riders, setRiders] = useState<{ id: string; name: string; phone: string; activeDeliveries: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchDeliveries();
    fetchRiders();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockDeliveries: Delivery[] = [
        {
          id: '1',
          deliveryNumber: 'DEL-202603-001',
          subscriptionId: '1',
          subscriptionNumber: 'SUB-202602-0001',
          customerName: 'Brian Phiri',
          customerPhone: '+265991234567',
          customerAddress: 'Area 123, Lilongwe',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          scheduledDate: '2026-03-04',
          scheduledTime: '10:00 - 12:00',
          status: 'scheduled',
          amount: 15000,
          paymentStatus: 'pending',
          paymentMethod: 'airtel_money',
          confirmedByCustomer: false,
          createdAt: '2026-02-25T10:30:00Z',
          updatedAt: '2026-02-25T10:30:00Z'
        },
        {
          id: '2',
          deliveryNumber: 'DEL-202603-002',
          subscriptionId: '2',
          subscriptionNumber: 'SUB-202602-0002',
          customerName: 'Mary Banda',
          customerPhone: '+265992345678',
          customerAddress: 'Area 25, Lilongwe',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          scheduledDate: '2026-03-03',
          scheduledTime: '08:00 - 10:00',
          status: 'processing',
          riderName: 'James Banda',
          riderPhone: '+265991234568',
          trackingNumber: 'TRK123456',
          amount: 9000,
          paymentStatus: 'pending',
          paymentMethod: 'cash',
          confirmedByCustomer: false,
          createdAt: '2026-02-24T14:20:00Z',
          updatedAt: '2026-03-02T09:00:00Z'
        },
        {
          id: '3',
          deliveryNumber: 'DEL-202602-003',
          subscriptionId: '3',
          subscriptionNumber: 'SUB-202602-0003',
          customerName: 'John Chimwala',
          customerPhone: '+265993456789',
          customerAddress: 'Area 47, Lilongwe',
          planName: 'Dairy Delight',
          planPrice: 25000,
          scheduledDate: '2026-02-27',
          scheduledTime: '14:00 - 16:00',
          actualDeliveryDate: '2026-02-27',
          actualDeliveryTime: '14:30',
          status: 'delivered',
          riderName: 'Peter Mwale',
          riderPhone: '+265994567890',
          trackingNumber: 'TRK123457',
          amount: 25000,
          paymentStatus: 'paid',
          paymentMethod: 'tnm_mpamba',
          paymentReference: 'TRX789012',
          confirmedByCustomer: true,
          confirmationTime: '2026-02-27T15:00:00Z',
          rating: 5,
          feedback: 'Great service, on time!',
          createdAt: '2026-02-20T09:15:00Z',
          updatedAt: '2026-02-27T15:00:00Z'
        },
        {
          id: '4',
          deliveryNumber: 'DEL-202602-004',
          subscriptionId: '4',
          subscriptionNumber: 'SUB-202602-0004',
          customerName: 'Alice Phiri',
          customerPhone: '+265994567890',
          customerAddress: 'Area 18, Lilongwe',
          planName: 'Family Essentials',
          planPrice: 65000,
          scheduledDate: '2026-02-29',
          scheduledTime: '09:00 - 11:00',
          status: 'rescheduled',
          rescheduledDate: '2026-03-02',
          amount: 65000,
          paymentStatus: 'pending',
          paymentMethod: 'card',
          confirmedByCustomer: false,
          createdAt: '2026-02-22T11:45:00Z',
          updatedAt: '2026-02-28T10:00:00Z'
        },
        {
          id: '5',
          deliveryNumber: 'DEL-202602-005',
          subscriptionId: '5',
          subscriptionNumber: 'SUB-202602-0005',
          customerName: 'David Banda',
          customerPhone: '+265995678901',
          customerAddress: 'Area 33, Lilongwe',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          scheduledDate: '2026-02-25',
          scheduledTime: '11:00 - 13:00',
          actualDeliveryDate: '2026-02-25',
          actualDeliveryTime: '12:15',
          status: 'delivered',
          riderName: 'James Banda',
          riderPhone: '+265991234568',
          trackingNumber: 'TRK123458',
          amount: 15000,
          paymentStatus: 'paid',
          paymentMethod: 'airtel_money',
          paymentReference: 'TRX123456',
          confirmedByCustomer: true,
          confirmationTime: '2026-02-25T13:00:00Z',
          rating: 4,
          feedback: 'Good, but a bit late',
          createdAt: '2026-02-18T16:30:00Z',
          updatedAt: '2026-02-25T13:00:00Z'
        },
        {
          id: '6',
          deliveryNumber: 'DEL-202603-006',
          subscriptionId: '6',
          subscriptionNumber: 'SUB-202602-0006',
          customerName: 'Grace Mwale',
          customerPhone: '+265996789012',
          customerAddress: 'Area 12, Lilongwe',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          scheduledDate: '2026-03-02',
          scheduledTime: '07:00 - 09:00',
          status: 'out_for_delivery',
          riderName: 'Peter Mwale',
          riderPhone: '+265994567890',
          trackingNumber: 'TRK123459',
          amount: 9000,
          paymentStatus: 'pending',
          paymentMethod: 'cash',
          confirmedByCustomer: false,
          createdAt: '2026-02-23T08:15:00Z',
          updatedAt: '2026-03-02T06:30:00Z'
        },
        {
          id: '7',
          deliveryNumber: 'DEL-202602-007',
          subscriptionId: '7',
          subscriptionNumber: 'SUB-202602-0007',
          customerName: 'Peter Kachale',
          customerPhone: '+265997890123',
          customerAddress: 'Area 29, Lilongwe',
          planName: 'Dairy Delight',
          planPrice: 25000,
          scheduledDate: '2026-02-22',
          scheduledTime: '15:00 - 17:00',
          status: 'failed',
          failureReason: 'Customer not home',
          amount: 25000,
          paymentStatus: 'refunded',
          paymentMethod: 'tnm_mpamba',
          paymentReference: 'TRX345678',
          confirmedByCustomer: false,
          createdAt: '2026-02-15T12:45:00Z',
          updatedAt: '2026-02-22T17:30:00Z'
        }
      ];
      
      setDeliveries(mockDeliveries);
      calculateStats(mockDeliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deliveries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      // Replace with actual API call
      setRiders([
        { id: '1', name: 'James Banda', phone: '+265991234568', activeDeliveries: 3 },
        { id: '2', name: 'Peter Mwale', phone: '+265994567890', activeDeliveries: 2 },
        { id: '3', name: 'Mary Chimwala', phone: '+265993456789', activeDeliveries: 1 },
        { id: '4', name: 'John Phiri', phone: '+265992345678', activeDeliveries: 4 },
      ]);
    } catch (error) {
      console.error('Error fetching riders:', error);
    }
  };

  const calculateStats = (data: Delivery[]) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const delivered = data.filter(d => d.status === 'delivered');
    const onTime = delivered.filter(d => {
      if (!d.actualDeliveryDate || !d.scheduledDate) return false;
      return d.actualDeliveryDate === d.scheduledDate;
    });
    
    setStats({
      total: data.length,
      scheduled: data.filter(d => d.status === 'scheduled').length,
      processing: data.filter(d => d.status === 'processing').length,
      outForDelivery: data.filter(d => d.status === 'out_for_delivery').length,
      delivered: delivered.length,
      failed: data.filter(d => d.status === 'failed').length,
      skipped: data.filter(d => d.status === 'skipped').length,
      rescheduled: data.filter(d => d.status === 'rescheduled').length,
      todayDeliveries: data.filter(d => d.scheduledDate === today).length,
      tomorrowDeliveries: data.filter(d => d.scheduledDate === tomorrow).length,
      weekDeliveries: data.filter(d => d.scheduledDate >= today && d.scheduledDate <= weekFromNow).length,
      completionRate: data.length > 0 ? (delivered.length / data.length) * 100 : 0,
      onTimeRate: delivered.length > 0 ? (onTime.length / delivered.length) * 100 : 0,
      averageRating: delivered.reduce((sum, d) => sum + (d.rating || 0), 0) / delivered.length || 0
    });
  };

  const handleViewDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDetails(true);
  };

  const handleAssignRider = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setRiderForm({
      riderId: delivery.riderId || '',
      riderName: delivery.riderName || '',
      riderPhone: delivery.riderPhone || '',
      trackingNumber: delivery.trackingNumber || ''
    });
    setShowAssignRiderDialog(true);
  };

  const handleReschedule = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setRescheduleForm({
      newDate: '',
      newTime: '',
      reason: ''
    });
    setShowRescheduleDialog(true);
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: Delivery['status']) => {
    try {
      setDeliveries(prev => prev.map(d => 
        d.id === deliveryId ? { ...d, status: newStatus } : d
      ));
      calculateStats(deliveries);
      
      toast({
        title: 'Status Updated',
        description: `Delivery status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleAssignRiderSubmit = () => {
    if (!selectedDelivery) return;
    
    try {
      setDeliveries(prev => prev.map(d => 
        d.id === selectedDelivery.id 
          ? { 
              ...d, 
              riderId: riderForm.riderId,
              riderName: riderForm.riderName,
              riderPhone: riderForm.riderPhone,
              trackingNumber: riderForm.trackingNumber,
              status: 'processing'
            }
          : d
      ));
      
      setShowAssignRiderDialog(false);
      toast({
        title: 'Rider Assigned',
        description: `Delivery assigned to ${riderForm.riderName}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign rider',
        variant: 'destructive',
      });
    }
  };

  const handleRescheduleSubmit = () => {
    if (!selectedDelivery) return;
    
    try {
      setDeliveries(prev => prev.map(d => 
        d.id === selectedDelivery.id 
          ? { 
              ...d, 
              scheduledDate: rescheduleForm.newDate,
              scheduledTime: rescheduleForm.newTime,
              status: 'rescheduled'
            }
          : d
      ));
      
      setShowRescheduleDialog(false);
      toast({
        title: 'Delivery Rescheduled',
        description: `New delivery date: ${format(new Date(rescheduleForm.newDate), 'PPP')}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reschedule delivery',
        variant: 'destructive',
      });
    }
  };

  const handlePrintDeliveryNote = (delivery: Delivery) => {
    // Implement print functionality
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-500';
      case 'out_for_delivery': return 'bg-orange-500';
      case 'processing': return 'bg-purple-500';
      case 'scheduled': return 'bg-blue-500';
      case 'rescheduled': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'skipped': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerPhone.includes(searchTerm) ||
      delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || delivery.status === selectedStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || delivery.paymentStatus === selectedPaymentStatus;
    
    let matchesDate = true;
    if (selectedDate === 'today') {
      matchesDate = delivery.scheduledDate === new Date().toISOString().split('T')[0];
    } else if (selectedDate === 'tomorrow') {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      matchesDate = delivery.scheduledDate === tomorrow;
    } else if (selectedDate === 'week') {
      const today = new Date().toISOString().split('T')[0];
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      matchesDate = delivery.scheduledDate >= today && delivery.scheduledDate <= weekFromNow;
    }
    
    const matchesRider = selectedRider === 'all' || delivery.riderId === selectedRider;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate && matchesRider;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

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
          <h1 className="text-3xl font-display font-bold">Delivery Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all subscription deliveries
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchDeliveries}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Delivery
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
        <Card className="bg-purple-50 dark:bg-purple-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400">Processing</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 dark:text-orange-400">Out for Delivery</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.outForDelivery}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Delivered</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.delivered}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Rescheduled</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.rescheduled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-2xl font-bold">{stats.todayDeliveries}</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tomorrow</p>
            <p className="text-2xl font-bold">{stats.tomorrowDeliveries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">{stats.weekDeliveries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <span className="text-sm font-medium">{stats.completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">On-Time Rate</p>
              <span className="text-sm font-medium">{stats.onTimeRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.onTimeRate} className="h-2 mt-2" />
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
                  placeholder="Search by customer, delivery #, subscription #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
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

              <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                <SelectTrigger className="w-[160px]">
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

              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Delivery Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRider} onValueChange={setSelectedRider}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Rider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Riders</SelectItem>
                  {riders.map(rider => (
                    <SelectItem key={rider.id} value={rider.id}>
                      {rider.name} ({rider.activeDeliveries})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedPaymentStatus('all');
                  setSelectedDate('all');
                  setSelectedRider('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDeliveries.length)} of {filteredDeliveries.length} deliveries
        </p>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No deliveries found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or schedule a new delivery
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((delivery) => (
                  <TableRow key={delivery.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => handleViewDelivery(delivery)}>
                      <span className="font-mono text-sm">{delivery.deliveryNumber}</span>
                    </TableCell>
                    <TableCell onClick={() => handleViewDelivery(delivery)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                            {delivery.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{delivery.customerName}</p>
                          <p className="text-xs text-muted-foreground">{delivery.customerPhone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewDelivery(delivery)}>
                      <p className="font-medium">{delivery.planName}</p>
                      <p className="text-xs text-muted-foreground">MK {delivery.planPrice.toLocaleString()}</p>
                    </TableCell>
                    <TableCell onClick={() => handleViewDelivery(delivery)}>
                      <div>
                        <p className="font-medium">{format(new Date(delivery.scheduledDate), 'MMM d, yyyy')}</p>
                        {isToday(new Date(delivery.scheduledDate)) && (
                          <Badge className="bg-green-500 text-white mt-1">Today</Badge>
                        )}
                        {isTomorrow(new Date(delivery.scheduledDate)) && (
                          <Badge className="bg-blue-500 text-white mt-1">Tomorrow</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewDelivery(delivery)}>
                      {delivery.scheduledTime || 'Anytime'}
                    </TableCell>
                    <TableCell onClick={() => handleViewDelivery(delivery)}>
                      <Badge className={`${getStatusColor(delivery.status)} text-white`}>
                        {delivery.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewDelivery(delivery)}>
                      {delivery.riderName ? (
                        <div>
                          <p className="font-medium">{delivery.riderName}</p>
                          <p className="text-xs text-muted-foreground">{delivery.riderPhone}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell onClick={() => handleViewDelivery(delivery)}>
                      <p className="font-medium">MK {delivery.amount.toLocaleString()}</p>
                    </TableCell>
                    <TableCell onClick={() => handleViewDelivery(delivery)}>
                      <Badge className={`${getPaymentStatusColor(delivery.paymentStatus)} text-white`}>
                        {delivery.paymentStatus}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => handleViewDelivery(delivery)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignRider(delivery)}>
                            <User className="w-4 h-4 mr-2" />
                            Assign Rider
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReschedule(delivery)}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintDeliveryNote(delivery)}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print Note
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(delivery.id, 'out_for_delivery')}>
                            <Truck className="w-4 h-4 mr-2" />
                            Mark Out for Delivery
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(delivery.id, 'delivered')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(delivery.id, 'failed')}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Mark Failed
                          </DropdownMenuItem>
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
      {filteredDeliveries.length > 0 && (
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

      {/* Assign Rider Dialog */}
      <Dialog open={showAssignRiderDialog} onOpenChange={setShowAssignRiderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Rider</DialogTitle>
            <DialogDescription>
              {selectedDelivery && `Assign a rider for delivery #${selectedDelivery.deliveryNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Rider</Label>
              <Select 
                value={riderForm.riderId} 
                onValueChange={(value) => {
                  const rider = riders.find(r => r.id === value);
                  setRiderForm({
                    ...riderForm,
                    riderId: value,
                    riderName: rider?.name || '',
                    riderPhone: rider?.phone || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a rider" />
                </SelectTrigger>
                <SelectContent>
                  {riders.map(rider => (
                    <SelectItem key={rider.id} value={rider.id}>
                      {rider.name} ({rider.activeDeliveries} active)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                value={riderForm.trackingNumber}
                onChange={(e) => setRiderForm({...riderForm, trackingNumber: e.target.value})}
                placeholder="e.g., TRK123456"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignRiderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRiderSubmit}>
              Assign Rider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Delivery</DialogTitle>
            <DialogDescription>
              {selectedDelivery && `Change delivery date for #${selectedDelivery.deliveryNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Delivery Date *</Label>
              <Input
                type="date"
                value={rescheduleForm.newDate}
                onChange={(e) => setRescheduleForm({...rescheduleForm, newDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>New Delivery Time</Label>
              <Input
                type="time"
                value={rescheduleForm.newTime}
                onChange={(e) => setRescheduleForm({...rescheduleForm, newTime: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason for Rescheduling</Label>
              <Textarea
                value={rescheduleForm.reason}
                onChange={(e) => setRescheduleForm({...rescheduleForm, reason: e.target.value})}
                placeholder="e.g., Customer request, rider unavailable..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRescheduleSubmit}>
              Reschedule Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Details Dialog */}
      <Dialog open={showDeliveryDetails} onOpenChange={setShowDeliveryDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>
              {selectedDelivery && `Delivery #${selectedDelivery.deliveryNumber}`}
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`${getStatusColor(selectedDelivery.status)} text-white mt-1`}>
                    {selectedDelivery.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge className={`${getPaymentStatusColor(selectedDelivery.paymentStatus)} text-white mt-1`}>
                    {selectedDelivery.paymentStatus}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedDelivery.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedDelivery.customerPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedDelivery.customerAddress}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Delivery Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Date</p>
                    <p className="font-medium">{format(new Date(selectedDelivery.scheduledDate), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Time</p>
                    <p className="font-medium">{selectedDelivery.scheduledTime || 'Anytime'}</p>
                  </div>
                  {selectedDelivery.actualDeliveryDate && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Actual Date</p>
                        <p className="font-medium">{format(new Date(selectedDelivery.actualDeliveryDate), 'PPP')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Actual Time</p>
                        <p className="font-medium">{selectedDelivery.actualDeliveryTime || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {selectedDelivery.riderName && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Rider Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedDelivery.riderName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedDelivery.riderPhone}</p>
                      </div>
                      {selectedDelivery.trackingNumber && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Tracking Number</p>
                          <p className="font-medium font-mono">{selectedDelivery.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {selectedDelivery.deliveryNotes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Notes</p>
                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedDelivery.deliveryNotes}</p>
                  </div>
                </>
              )}

              {selectedDelivery.confirmedByCustomer && (
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Confirmed by customer at {selectedDelivery.confirmationTime && 
                      format(new Date(selectedDelivery.confirmationTime), 'p')}
                  </p>
                  {selectedDelivery.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < selectedDelivery.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                      <span className="text-sm ml-2">{selectedDelivery.feedback}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDetails(false)}>
              Close
            </Button>
            {selectedDelivery && (
              <Button onClick={() => handlePrintDeliveryNote(selectedDelivery)}>
                <Printer className="w-4 h-4 mr-2" />
                Print Note
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionDeliveries;