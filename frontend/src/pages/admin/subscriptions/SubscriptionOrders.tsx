import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
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
  Printer,
  Edit,
  Copy,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  DollarSign,
  CreditCard,
  FileText,
  Send,
  Ban,
  RotateCcw
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance, subDays, isToday, isThisWeek, isThisMonth } from 'date-fns';

interface SubscriptionOrder {
  id: string;
  orderNumber: string;
  subscriptionId: string;
  subscriptionNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planName: string;
  planPrice: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  grandTotal: number;
  deliveryDate: string;
  deliveryTime?: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string;
  paymentDate?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  notes?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  averageOrderValue: number;
}

const orderStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-500' },
  { value: 'ready', label: 'Ready', color: 'bg-indigo-500' },
  { value: 'shipped', label: 'Shipped', color: 'bg-orange-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-500' },
];

const paymentStatusOptions = [
  { value: 'all', label: 'All Payments' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500' },
  { value: 'refunded', label: 'Refunded', color: 'bg-purple-500' },
];

const SubscriptionOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SubscriptionOrder | null>(null);
  
  const [cancelReason, setCancelReason] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    averageOrderValue: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockOrders: SubscriptionOrder[] = [
        {
          id: '1',
          orderNumber: 'ORD-202603-001',
          subscriptionId: '1',
          subscriptionNumber: 'SUB-202602-0001',
          customerName: 'Brian Phiri',
          customerEmail: 'brian.phiri@example.com',
          customerPhone: '+265991234567',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          items: [
            { name: 'Weekly Veggie Box', quantity: 1, price: 15000 }
          ],
          totalAmount: 15000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 15000,
          deliveryDate: '2026-03-04',
          deliveryTime: '10:00 - 12:00',
          deliveryAddress: 'Area 123, Lilongwe',
          paymentMethod: 'airtel_money',
          paymentStatus: 'pending',
          orderStatus: 'confirmed',
          createdAt: '2026-02-25T10:30:00Z',
          updatedAt: '2026-02-25T10:30:00Z'
        },
        {
          id: '2',
          orderNumber: 'ORD-202603-002',
          subscriptionId: '2',
          subscriptionNumber: 'SUB-202602-0002',
          customerName: 'Mary Banda',
          customerEmail: 'mary.banda@example.com',
          customerPhone: '+265992345678',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          items: [
            { name: 'Daily Bread Club', quantity: 1, price: 9000 }
          ],
          totalAmount: 9000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 9000,
          deliveryDate: '2026-03-03',
          deliveryTime: '08:00 - 10:00',
          deliveryAddress: 'Area 25, Lilongwe',
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          orderStatus: 'processing',
          createdAt: '2026-02-24T14:20:00Z',
          updatedAt: '2026-03-02T09:00:00Z'
        },
        {
          id: '3',
          orderNumber: 'ORD-202602-003',
          subscriptionId: '3',
          subscriptionNumber: 'SUB-202602-0003',
          customerName: 'John Chimwala',
          customerEmail: 'john.chimwala@example.com',
          customerPhone: '+265993456789',
          planName: 'Dairy Delight',
          planPrice: 25000,
          items: [
            { name: 'Dairy Delight', quantity: 1, price: 25000 }
          ],
          totalAmount: 25000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 25000,
          deliveryDate: '2026-02-27',
          deliveryTime: '14:00 - 16:00',
          deliveryAddress: 'Area 47, Lilongwe',
          paymentMethod: 'tnm_mpamba',
          paymentStatus: 'paid',
          paymentReference: 'TRX789012',
          paymentDate: '2026-02-27T14:30:00Z',
          orderStatus: 'delivered',
          invoiceNumber: 'INV-202602-003',
          createdAt: '2026-02-20T09:15:00Z',
          updatedAt: '2026-02-27T15:00:00Z'
        },
        {
          id: '4',
          orderNumber: 'ORD-202602-004',
          subscriptionId: '4',
          subscriptionNumber: 'SUB-202602-0004',
          customerName: 'Alice Phiri',
          customerEmail: 'alice.phiri@example.com',
          customerPhone: '+265994567890',
          planName: 'Family Essentials',
          planPrice: 65000,
          items: [
            { name: 'Family Essentials', quantity: 1, price: 65000 }
          ],
          totalAmount: 65000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 65000,
          deliveryDate: '2026-02-29',
          deliveryTime: '09:00 - 11:00',
          deliveryAddress: 'Area 18, Lilongwe',
          paymentMethod: 'card',
          paymentStatus: 'pending',
          orderStatus: 'pending',
          createdAt: '2026-02-22T11:45:00Z',
          updatedAt: '2026-02-22T11:45:00Z'
        },
        {
          id: '5',
          orderNumber: 'ORD-202602-005',
          subscriptionId: '5',
          subscriptionNumber: 'SUB-202602-0005',
          customerName: 'David Banda',
          customerEmail: 'david.banda@example.com',
          customerPhone: '+265995678901',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          items: [
            { name: 'Weekly Veggie Box', quantity: 1, price: 15000 }
          ],
          totalAmount: 15000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 15000,
          deliveryDate: '2026-02-25',
          deliveryTime: '11:00 - 13:00',
          deliveryAddress: 'Area 33, Lilongwe',
          paymentMethod: 'airtel_money',
          paymentStatus: 'paid',
          paymentReference: 'TRX123456',
          paymentDate: '2026-02-25T12:15:00Z',
          orderStatus: 'delivered',
          invoiceNumber: 'INV-202602-005',
          createdAt: '2026-02-18T16:30:00Z',
          updatedAt: '2026-02-25T13:00:00Z'
        },
        {
          id: '6',
          orderNumber: 'ORD-202603-006',
          subscriptionId: '6',
          subscriptionNumber: 'SUB-202602-0006',
          customerName: 'Grace Mwale',
          customerEmail: 'grace.mwale@example.com',
          customerPhone: '+265996789012',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          items: [
            { name: 'Daily Bread Club', quantity: 1, price: 9000 }
          ],
          totalAmount: 9000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 9000,
          deliveryDate: '2026-03-02',
          deliveryTime: '07:00 - 09:00',
          deliveryAddress: 'Area 12, Lilongwe',
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          orderStatus: 'shipped',
          createdAt: '2026-02-23T08:15:00Z',
          updatedAt: '2026-03-02T06:30:00Z'
        },
        {
          id: '7',
          orderNumber: 'ORD-202602-007',
          subscriptionId: '7',
          subscriptionNumber: 'SUB-202602-0007',
          customerName: 'Peter Kachale',
          customerEmail: 'peter.kachale@example.com',
          customerPhone: '+265997890123',
          planName: 'Dairy Delight',
          planPrice: 25000,
          items: [
            { name: 'Dairy Delight', quantity: 1, price: 25000 }
          ],
          totalAmount: 25000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 25000,
          deliveryDate: '2026-02-22',
          deliveryTime: '15:00 - 17:00',
          deliveryAddress: 'Area 29, Lilongwe',
          paymentMethod: 'tnm_mpamba',
          paymentStatus: 'refunded',
          paymentReference: 'TRX345678',
          paymentDate: '2026-02-22T17:30:00Z',
          orderStatus: 'refunded',
          notes: 'Customer not home, order refunded',
          createdAt: '2026-02-15T12:45:00Z',
          updatedAt: '2026-02-22T17:30:00Z'
        },
        {
          id: '8',
          orderNumber: 'ORD-202603-008',
          subscriptionId: '8',
          subscriptionNumber: 'SUB-202602-0008',
          customerName: 'Chisomo Banda',
          customerEmail: 'chisomo.banda@example.com',
          customerPhone: '+265998901234',
          planName: 'Family Essentials',
          planPrice: 65000,
          items: [
            { name: 'Family Essentials', quantity: 1, price: 65000 }
          ],
          totalAmount: 65000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 65000,
          deliveryDate: '2026-03-05',
          deliveryAddress: 'Area 49, Lilongwe',
          paymentMethod: 'airtel_money',
          paymentStatus: 'pending',
          orderStatus: 'confirmed',
          createdAt: '2026-02-26T09:30:00Z',
          updatedAt: '2026-02-26T09:30:00Z'
        },
        {
          id: '9',
          orderNumber: 'ORD-202603-009',
          subscriptionId: '9',
          subscriptionNumber: 'SUB-202602-0009',
          customerName: 'Tiwonge Phiri',
          customerEmail: 'tiwonge.phiri@example.com',
          customerPhone: '+265999012345',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          items: [
            { name: 'Weekly Veggie Box', quantity: 1, price: 15000 }
          ],
          totalAmount: 15000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 15000,
          deliveryDate: '2026-03-06',
          deliveryAddress: 'Area 15, Lilongwe',
          paymentMethod: 'tnm_mpamba',
          paymentStatus: 'paid',
          paymentReference: 'TRX901234',
          paymentDate: '2026-02-26T10:15:00Z',
          orderStatus: 'ready',
          invoiceNumber: 'INV-202603-009',
          createdAt: '2026-02-26T10:15:00Z',
          updatedAt: '2026-02-26T10:15:00Z'
        },
        {
          id: '10',
          orderNumber: 'ORD-202602-010',
          subscriptionId: '10',
          subscriptionNumber: 'SUB-202602-0010',
          customerName: 'Kondwani Mwale',
          customerEmail: 'kondwani.mwale@example.com',
          customerPhone: '+265990123456',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          items: [
            { name: 'Daily Bread Club', quantity: 1, price: 9000 }
          ],
          totalAmount: 9000,
          deliveryFee: 0,
          discount: 0,
          tax: 0,
          grandTotal: 9000,
          deliveryDate: '2026-02-28',
          deliveryAddress: 'Area 37, Lilongwe',
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          orderStatus: 'cancelled',
          notes: 'Customer cancelled due to change of mind',
          createdAt: '2026-02-20T14:45:00Z',
          updatedAt: '2026-02-27T11:30:00Z'
        }
      ];
      
      setOrders(mockOrders);
      calculateStats(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: SubscriptionOrder[]) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = subDays(new Date(), 7).toISOString().split('T')[0];
    const monthAgo = subDays(new Date(), 30).toISOString().split('T')[0];
    
    const totalRevenue = data.reduce((sum, order) => sum + order.grandTotal, 0);
    const todayRevenue = data
      .filter(order => order.createdAt.split('T')[0] === today)
      .reduce((sum, order) => sum + order.grandTotal, 0);
    const weekRevenue = data
      .filter(order => order.createdAt >= weekAgo)
      .reduce((sum, order) => sum + order.grandTotal, 0);
    const monthRevenue = data
      .filter(order => order.createdAt >= monthAgo)
      .reduce((sum, order) => sum + order.grandTotal, 0);
    
    setStats({
      total: data.length,
      pending: data.filter(o => o.orderStatus === 'pending').length,
      confirmed: data.filter(o => o.orderStatus === 'confirmed').length,
      processing: data.filter(o => o.orderStatus === 'processing').length,
      shipped: data.filter(o => o.orderStatus === 'shipped').length,
      delivered: data.filter(o => o.orderStatus === 'delivered').length,
      cancelled: data.filter(o => o.orderStatus === 'cancelled').length,
      refunded: data.filter(o => o.orderStatus === 'refunded').length,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      averageOrderValue: data.length > 0 ? totalRevenue / data.length : 0
    });
  };

  const handleViewOrder = (order: SubscriptionOrder) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: SubscriptionOrder['orderStatus']) => {
    try {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, orderStatus: newStatus } : o
      ));
      calculateStats(orders);
      
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: SubscriptionOrder['paymentStatus']) => {
    try {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, paymentStatus: newStatus } : o
      ));
      
      toast({
        title: 'Payment Status Updated',
        description: `Payment status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id 
          ? { ...o, orderStatus: 'cancelled', notes: cancelReason }
          : o
      ));
      
      setShowCancelDialog(false);
      setCancelReason('');
      
      toast({
        title: 'Order Cancelled',
        description: `Order #${selectedOrder.orderNumber} has been cancelled`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const handleRefundOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id 
          ? { 
              ...o, 
              orderStatus: 'refunded', 
              paymentStatus: 'refunded',
              notes: refundReason 
            }
          : o
      ));
      
      setShowRefundDialog(false);
      setRefundReason('');
      setRefundAmount('');
      
      toast({
        title: 'Order Refunded',
        description: `Refund of MK ${refundAmount} processed for order #${selectedOrder.orderNumber}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateInvoice = (order: SubscriptionOrder) => {
    // Implement invoice generation
    toast({
      title: 'Invoice Generated',
      description: `Invoice for order #${order.orderNumber} has been generated`,
    });
  };

  const handleSendInvoice = (order: SubscriptionOrder) => {
    // Implement sending invoice via email
    toast({
      title: 'Invoice Sent',
      description: `Invoice sent to ${order.customerEmail}`,
    });
  };

  const handlePrintOrder = (order: SubscriptionOrder) => {
    // Implement print functionality
    window.print();
  };

  const getOrderStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-orange-500';
      case 'ready': return 'bg-indigo-500';
      case 'processing': return 'bg-purple-500';
      case 'confirmed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'refunded': return 'bg-gray-500';
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrderStatus = selectedOrderStatus === 'all' || order.orderStatus === selectedOrderStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus;
    
    let matchesDate = true;
    if (dateRange === 'today') {
      matchesDate = isToday(new Date(order.createdAt));
    } else if (dateRange === 'week') {
      matchesDate = isThisWeek(new Date(order.createdAt));
    } else if (dateRange === 'month') {
      matchesDate = isThisMonth(new Date(order.createdAt));
    }
    
    return matchesSearch && matchesOrderStatus && matchesPaymentStatus && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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
          <h1 className="text-3xl font-display font-bold">Subscription Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage all orders generated from subscriptions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
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
        <Card className="bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">Confirmed</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.confirmed}</p>
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
            <p className="text-sm text-orange-600 dark:text-orange-400">Shipped</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.shipped}</p>
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
            <p className="text-sm text-red-600 dark:text-red-400">Cancelled</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.cancelled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold">MK {stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Today's Revenue</p>
            <p className="text-2xl font-bold">MK {stats.todayRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">MK {stats.weekRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">MK {stats.monthRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Average Order</p>
            <p className="text-2xl font-bold">MK {stats.averageOrderValue.toLocaleString()}</p>
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
                  placeholder="Search by customer, order #, subscription #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedOrderStatus} onValueChange={setSelectedOrderStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatusOptions.map(option => (
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
                  <SelectValue placeholder="Payment Status" />
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

              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
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
                  setSelectedOrderStatus('all');
                  setSelectedPaymentStatus('all');
                  setDateRange('all');
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
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
        </p>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => handleViewOrder(order)}>
                      <span className="font-mono text-sm">{order.orderNumber}</span>
                    </TableCell>
                    <TableCell onClick={() => handleViewOrder(order)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                            {order.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewOrder(order)}>
                      <div>
                        <p className="font-medium">{order.planName}</p>
                        <p className="text-xs text-muted-foreground">{order.subscriptionNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewOrder(order)}>
                      <p className="font-medium">MK {order.grandTotal.toLocaleString()}</p>
                    </TableCell>
                    <TableCell onClick={() => handleViewOrder(order)}>
                      <Badge className={`${getOrderStatusColor(order.orderStatus)} text-white`}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewOrder(order)}>
                      <Badge className={`${getPaymentStatusColor(order.paymentStatus)} text-white`}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewOrder(order)}>
                      <div>
                        <p className="font-medium">{format(new Date(order.deliveryDate), 'MMM d, yyyy')}</p>
                        {order.deliveryTime && (
                          <p className="text-xs text-muted-foreground">{order.deliveryTime}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewOrder(order)}>
                      <p className="text-sm">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
                      </p>
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
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateInvoice(order)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendInvoice(order)}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintOrder(order)}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print Order
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'confirmed')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'processing')}>
                            <Package className="w-4 h-4 mr-2" />
                            Start Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'ready')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Ready
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'shipped')}>
                            <Package className="w-4 h-4 mr-2" />
                            Mark Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {order.paymentStatus === 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdatePaymentStatus(order.id, 'paid')}>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Mark Paid
                            </DropdownMenuItem>
                          )}
                          {order.orderStatus !== 'cancelled' && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowCancelDialog(true);
                              }}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                          {order.paymentStatus === 'paid' && order.orderStatus !== 'refunded' && (
                            <DropdownMenuItem 
                              className="text-orange-600"
                              onClick={() => {
                                setSelectedOrder(order);
                                setRefundAmount(order.grandTotal.toString());
                                setShowRefundDialog(true);
                              }}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Refund
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
      {filteredOrders.length > 0 && (
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

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Order #${selectedOrder.orderNumber}`}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Status</p>
                      <Badge className={`${getOrderStatusColor(selectedOrder.orderStatus)} text-white mt-1`}>
                        {selectedOrder.orderStatus}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge className={`${getPaymentStatusColor(selectedOrder.paymentStatus)} text-white mt-1`}>
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedOrder.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedOrder.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedOrder.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Subscription</p>
                        <p className="font-medium font-mono">{selectedOrder.subscriptionNumber}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Delivery Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Date</p>
                        <p className="font-medium">{format(new Date(selectedOrder.deliveryDate), 'PPP')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Time</p>
                        <p className="font-medium">{selectedOrder.deliveryTime || 'Anytime'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reference</p>
                        <p className="font-medium font-mono">{selectedOrder.paymentReference || 'N/A'}</p>
                      </div>
                      {selectedOrder.invoiceNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Invoice</p>
                          <p className="font-medium font-mono">{selectedOrder.invoiceNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedOrder.notes}</p>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="items" className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>MK {item.price.toLocaleString()}</TableCell>
                          <TableCell className="text-right">MK {(item.quantity * item.price).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                        <TableCell className="text-right">MK {selectedOrder.totalAmount.toLocaleString()}</TableCell>
                      </TableRow>
                      {selectedOrder.deliveryFee > 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">Delivery Fee</TableCell>
                          <TableCell className="text-right">MK {selectedOrder.deliveryFee.toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      {selectedOrder.discount > 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">Discount</TableCell>
                          <TableCell className="text-right text-green-600">-MK {selectedOrder.discount.toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      {selectedOrder.tax > 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">Tax</TableCell>
                          <TableCell className="text-right">MK {selectedOrder.tax.toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">Grand Total</TableCell>
                        <TableCell className="text-right font-bold">MK {selectedOrder.grandTotal.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="timeline" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                        <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">Order Created</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedOrder.createdAt), 'PPP p')}
                        </p>
                      </div>
                    </div>

                    {selectedOrder.orderStatus !== 'pending' && (
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
                          <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-border" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">Order Confirmed</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedOrder.updatedAt), 'PPP p')}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.paymentStatus === 'paid' && (
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                          <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-border" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">Payment Received</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.paymentDate ? format(new Date(selectedOrder.paymentDate), 'PPP p') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.orderStatus === 'shipped' && (
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5" />
                          <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-border" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">Order Shipped</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedOrder.updatedAt), 'PPP p')}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.orderStatus === 'delivered' && (
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Order Delivered</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedOrder.updatedAt), 'PPP p')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Close
            </Button>
            {selectedOrder && (
              <Button onClick={() => handlePrintOrder(selectedOrder)}>
                <Printer className="w-4 h-4 mr-2" />
                Print Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Are you sure you want to cancel order #${selectedOrder.orderNumber}?`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Cancellation</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Customer request, payment failed..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Refund for order #${selectedOrder.orderNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Refund Amount (MK)</Label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label>Reason for Refund</Label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g., Customer not satisfied, product issue..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefundOrder}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionOrders;