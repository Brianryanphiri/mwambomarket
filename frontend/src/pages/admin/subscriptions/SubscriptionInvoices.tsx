import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
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
  Send,
  Edit,
  Copy,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  Mail,
  FileDown,
  Receipt,
  Ban,
  RotateCcw,
  Plus
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  subscriptionNumber: string;
  orderId?: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  planName: string;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  discountType?: 'percentage' | 'fixed';
  discountCode?: string;
  tax: number;
  taxRate?: number;
  deliveryFee: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  terms?: string;
  footer?: string;
  pdfUrl?: string;
  reminderCount: number;
  lastReminderSent?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceStats {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  cancelled: number;
  refunded: number;
  totalAmount: number;
  paidAmount: number;
  overdueAmount: number;
  averageInvoiceValue: number;
  collectionRate: number;
}

const invoiceStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-500' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-yellow-500' },
  { value: 'refunded', label: 'Refunded', color: 'bg-purple-500' },
];

const SubscriptionInvoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const [reminderMessage, setReminderMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  
  const [stats, setStats] = useState<InvoiceStats>({
    total: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
    refunded: 0,
    totalAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    averageInvoiceValue: 0,
    collectionRate: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-202602-001',
          subscriptionId: '1',
          subscriptionNumber: 'SUB-202602-0001',
          orderId: '1',
          orderNumber: 'ORD-202602-001',
          customerName: 'Brian Phiri',
          customerEmail: 'brian.phiri@example.com',
          customerPhone: '+265991234567',
          customerAddress: 'Area 123, Lilongwe',
          planName: 'Weekly Veggie Box',
          items: [
            { name: 'Weekly Veggie Box', quantity: 1, unitPrice: 15000, total: 15000 }
          ],
          subtotal: 15000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 15000,
          amountPaid: 15000,
          balanceDue: 0,
          issueDate: '2026-02-25',
          dueDate: '2026-03-04',
          paidDate: '2026-02-25',
          status: 'paid',
          paymentMethod: 'airtel_money',
          paymentReference: 'TRX123456',
          reminderCount: 0,
          createdAt: '2026-02-25T10:30:00Z',
          updatedAt: '2026-02-25T10:30:00Z'
        },
        {
          id: '2',
          invoiceNumber: 'INV-202603-002',
          subscriptionId: '2',
          subscriptionNumber: 'SUB-202602-0002',
          orderId: '2',
          orderNumber: 'ORD-202603-002',
          customerName: 'Mary Banda',
          customerEmail: 'mary.banda@example.com',
          customerPhone: '+265992345678',
          customerAddress: 'Area 25, Lilongwe',
          planName: 'Daily Bread Club',
          items: [
            { name: 'Daily Bread Club', quantity: 1, unitPrice: 9000, total: 9000 }
          ],
          subtotal: 9000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 9000,
          amountPaid: 0,
          balanceDue: 9000,
          issueDate: '2026-03-03',
          dueDate: '2026-03-10',
          status: 'sent',
          reminderCount: 1,
          lastReminderSent: '2026-03-04T09:00:00Z',
          createdAt: '2026-03-03T08:00:00Z',
          updatedAt: '2026-03-03T08:00:00Z'
        },
        {
          id: '3',
          invoiceNumber: 'INV-202602-003',
          subscriptionId: '3',
          subscriptionNumber: 'SUB-202602-0003',
          orderId: '3',
          orderNumber: 'ORD-202602-003',
          customerName: 'John Chimwala',
          customerEmail: 'john.chimwala@example.com',
          customerPhone: '+265993456789',
          customerAddress: 'Area 47, Lilongwe',
          planName: 'Dairy Delight',
          items: [
            { name: 'Dairy Delight', quantity: 1, unitPrice: 25000, total: 25000 }
          ],
          subtotal: 25000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 25000,
          amountPaid: 25000,
          balanceDue: 0,
          issueDate: '2026-02-20',
          dueDate: '2026-02-27',
          paidDate: '2026-02-27',
          status: 'paid',
          paymentMethod: 'tnm_mpamba',
          paymentReference: 'TRX789012',
          reminderCount: 0,
          createdAt: '2026-02-20T09:15:00Z',
          updatedAt: '2026-02-27T15:00:00Z'
        },
        {
          id: '4',
          invoiceNumber: 'INV-202602-004',
          subscriptionId: '4',
          subscriptionNumber: 'SUB-202602-0004',
          orderId: '4',
          orderNumber: 'ORD-202602-004',
          customerName: 'Alice Phiri',
          customerEmail: 'alice.phiri@example.com',
          customerPhone: '+265994567890',
          customerAddress: 'Area 18, Lilongwe',
          planName: 'Family Essentials',
          items: [
            { name: 'Family Essentials', quantity: 1, unitPrice: 65000, total: 65000 }
          ],
          subtotal: 65000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 65000,
          amountPaid: 0,
          balanceDue: 65000,
          issueDate: '2026-02-22',
          dueDate: '2026-02-29',
          status: 'overdue',
          reminderCount: 2,
          lastReminderSent: '2026-03-01T10:00:00Z',
          createdAt: '2026-02-22T11:45:00Z',
          updatedAt: '2026-02-22T11:45:00Z'
        },
        {
          id: '5',
          invoiceNumber: 'INV-202602-005',
          subscriptionId: '5',
          subscriptionNumber: 'SUB-202602-0005',
          orderId: '5',
          orderNumber: 'ORD-202602-005',
          customerName: 'David Banda',
          customerEmail: 'david.banda@example.com',
          customerPhone: '+265995678901',
          customerAddress: 'Area 33, Lilongwe',
          planName: 'Weekly Veggie Box',
          items: [
            { name: 'Weekly Veggie Box', quantity: 1, unitPrice: 15000, total: 15000 }
          ],
          subtotal: 15000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 15000,
          amountPaid: 15000,
          balanceDue: 0,
          issueDate: '2026-02-18',
          dueDate: '2026-02-25',
          paidDate: '2026-02-25',
          status: 'paid',
          paymentMethod: 'airtel_money',
          paymentReference: 'TRX123456',
          reminderCount: 0,
          createdAt: '2026-02-18T16:30:00Z',
          updatedAt: '2026-02-25T13:00:00Z'
        },
        {
          id: '6',
          invoiceNumber: 'INV-202603-006',
          subscriptionId: '6',
          subscriptionNumber: 'SUB-202602-0006',
          orderId: '6',
          orderNumber: 'ORD-202603-006',
          customerName: 'Grace Mwale',
          customerEmail: 'grace.mwale@example.com',
          customerPhone: '+265996789012',
          customerAddress: 'Area 12, Lilongwe',
          planName: 'Daily Bread Club',
          items: [
            { name: 'Daily Bread Club', quantity: 1, unitPrice: 9000, total: 9000 }
          ],
          subtotal: 9000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 9000,
          amountPaid: 0,
          balanceDue: 9000,
          issueDate: '2026-03-02',
          dueDate: '2026-03-09',
          status: 'sent',
          reminderCount: 0,
          createdAt: '2026-03-02T06:30:00Z',
          updatedAt: '2026-03-02T06:30:00Z'
        },
        {
          id: '7',
          invoiceNumber: 'INV-202602-007',
          subscriptionId: '7',
          subscriptionNumber: 'SUB-202602-0007',
          orderId: '7',
          orderNumber: 'ORD-202602-007',
          customerName: 'Peter Kachale',
          customerEmail: 'peter.kachale@example.com',
          customerPhone: '+265997890123',
          customerAddress: 'Area 29, Lilongwe',
          planName: 'Dairy Delight',
          items: [
            { name: 'Dairy Delight', quantity: 1, unitPrice: 25000, total: 25000 }
          ],
          subtotal: 25000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 25000,
          amountPaid: 0,
          balanceDue: 25000,
          issueDate: '2026-02-15',
          dueDate: '2026-02-22',
          status: 'cancelled',
          notes: 'Subscription cancelled',
          reminderCount: 0,
          createdAt: '2026-02-15T12:45:00Z',
          updatedAt: '2026-02-21T09:30:00Z'
        },
        {
          id: '8',
          invoiceNumber: 'INV-202603-008',
          subscriptionId: '8',
          subscriptionNumber: 'SUB-202602-0008',
          orderId: '8',
          orderNumber: 'ORD-202603-008',
          customerName: 'Chisomo Banda',
          customerEmail: 'chisomo.banda@example.com',
          customerPhone: '+265998901234',
          customerAddress: 'Area 49, Lilongwe',
          planName: 'Family Essentials',
          items: [
            { name: 'Family Essentials', quantity: 1, unitPrice: 65000, total: 65000 }
          ],
          subtotal: 65000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 65000,
          amountPaid: 65000,
          balanceDue: 0,
          issueDate: '2026-02-26',
          dueDate: '2026-03-05',
          paidDate: '2026-02-26',
          status: 'paid',
          paymentMethod: 'airtel_money',
          paymentReference: 'TRX901234',
          reminderCount: 0,
          createdAt: '2026-02-26T09:30:00Z',
          updatedAt: '2026-02-26T09:30:00Z'
        },
        {
          id: '9',
          invoiceNumber: 'INV-202603-009',
          subscriptionId: '9',
          subscriptionNumber: 'SUB-202602-0009',
          orderId: '9',
          orderNumber: 'ORD-202603-009',
          customerName: 'Tiwonge Phiri',
          customerEmail: 'tiwonge.phiri@example.com',
          customerPhone: '+265999012345',
          customerAddress: 'Area 15, Lilongwe',
          planName: 'Weekly Veggie Box',
          items: [
            { name: 'Weekly Veggie Box', quantity: 1, unitPrice: 15000, total: 15000 }
          ],
          subtotal: 15000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 15000,
          amountPaid: 15000,
          balanceDue: 0,
          issueDate: '2026-02-26',
          dueDate: '2026-03-05',
          paidDate: '2026-02-26',
          status: 'paid',
          paymentMethod: 'tnm_mpamba',
          paymentReference: 'TRX901235',
          reminderCount: 0,
          createdAt: '2026-02-26T10:15:00Z',
          updatedAt: '2026-02-26T10:15:00Z'
        },
        {
          id: '10',
          invoiceNumber: 'INV-202602-010',
          subscriptionId: '10',
          subscriptionNumber: 'SUB-202602-0010',
          orderId: '10',
          orderNumber: 'ORD-202602-010',
          customerName: 'Kondwani Mwale',
          customerEmail: 'kondwani.mwale@example.com',
          customerPhone: '+265990123456',
          customerAddress: 'Area 37, Lilongwe',
          planName: 'Daily Bread Club',
          items: [
            { name: 'Daily Bread Club', quantity: 1, unitPrice: 9000, total: 9000 }
          ],
          subtotal: 9000,
          discount: 0,
          tax: 0,
          deliveryFee: 0,
          total: 9000,
          amountPaid: 0,
          balanceDue: 9000,
          issueDate: '2026-02-20',
          dueDate: '2026-02-27',
          status: 'cancelled',
          notes: 'Order cancelled',
          reminderCount: 0,
          createdAt: '2026-02-20T14:45:00Z',
          updatedAt: '2026-02-27T11:30:00Z'
        }
      ];
      
      setInvoices(mockInvoices);
      calculateStats(mockInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Invoice[]) => {
    const totalAmount = data.reduce((sum, inv) => sum + inv.total, 0);
    const paidAmount = data
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdueAmount = data
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.balanceDue, 0);
    
    setStats({
      total: data.length,
      draft: data.filter(i => i.status === 'draft').length,
      sent: data.filter(i => i.status === 'sent').length,
      paid: data.filter(i => i.status === 'paid').length,
      overdue: data.filter(i => i.status === 'overdue').length,
      cancelled: data.filter(i => i.status === 'cancelled').length,
      refunded: data.filter(i => i.status === 'refunded').length,
      totalAmount,
      paidAmount,
      overdueAmount,
      averageInvoiceValue: data.length > 0 ? totalAmount / data.length : 0,
      collectionRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Implement PDF download
    toast({
      title: 'Download Started',
      description: `Downloading invoice #${invoice.invoiceNumber}`,
    });
  };

  const handleSendInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowSendDialog(true);
  };

  const handleSendInvoiceSubmit = () => {
    if (!selectedInvoice) return;
    
    toast({
      title: 'Invoice Sent',
      description: `Invoice #${selectedInvoice.invoiceNumber} sent to ${selectedInvoice.customerEmail}`,
    });
    setShowSendDialog(false);
  };

  const handleSendReminder = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setReminderMessage(
      `Dear ${invoice.customerName},\n\nThis is a reminder that invoice #${invoice.invoiceNumber} for MK ${invoice.balanceDue.toLocaleString()} is due on ${format(new Date(invoice.dueDate), 'PPP')}. Please make payment at your earliest convenience.\n\nThank you for your business!`
    );
    setShowReminderDialog(true);
  };

  const handleSendReminderSubmit = () => {
    if (!selectedInvoice) return;
    
    toast({
      title: 'Reminder Sent',
      description: `Reminder sent to ${selectedInvoice.customerEmail}${sendSms ? ' and SMS' : ''}`,
    });
    setShowReminderDialog(false);
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      setInvoices(prev => prev.map(i => 
        i.id === invoice.id 
          ? { 
              ...i, 
              status: 'paid', 
              paidDate: new Date().toISOString(),
              amountPaid: i.total,
              balanceDue: 0
            }
          : i
      ));
      
      toast({
        title: 'Invoice Marked as Paid',
        description: `Invoice #${invoice.invoiceNumber} has been marked as paid`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invoice',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsOverdue = async (invoice: Invoice) => {
    try {
      setInvoices(prev => prev.map(i => 
        i.id === invoice.id ? { ...i, status: 'overdue' } : i
      ));
      
      toast({
        title: 'Invoice Marked as Overdue',
        description: `Invoice #${invoice.invoiceNumber} has been marked as overdue`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invoice',
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvoice = async (invoice: Invoice) => {
    try {
      setInvoices(prev => prev.map(i => 
        i.id === invoice.id ? { ...i, status: 'cancelled' } : i
      ));
      
      toast({
        title: 'Invoice Cancelled',
        description: `Invoice #${invoice.invoiceNumber} has been cancelled`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel invoice',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-500';
      case 'sent': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      case 'overdue': return 'bg-red-500';
      case 'cancelled': return 'bg-yellow-500';
      case 'refunded': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    
    let matchesDate = true;
    if (dateRange === 'today') {
      matchesDate = isToday(new Date(invoice.issueDate));
    } else if (dateRange === 'week') {
      matchesDate = isThisWeek(new Date(invoice.issueDate));
    } else if (dateRange === 'month') {
      matchesDate = isThisMonth(new Date(invoice.issueDate));
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

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
          <h1 className="text-3xl font-display font-bold">Subscription Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage all invoices generated from subscriptions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchInvoices}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
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
            <p className="text-sm text-blue-600 dark:text-blue-400">Sent</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Paid</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.paid}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400">Overdue</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.overdue}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Cancelled</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.cancelled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">MK {stats.totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Paid Amount</p>
            <p className="text-2xl font-bold text-green-600">MK {stats.paidAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-600">MK {stats.overdueAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Average Invoice Value</p>
            <p className="text-2xl font-bold">MK {stats.averageInvoiceValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <span className="text-sm font-medium">{stats.collectionRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.collectionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Draft Invoices</p>
            <p className="text-2xl font-bold">{stats.draft}</p>
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
                  placeholder="Search by customer, invoice #, subscription #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Invoice Status" />
                </SelectTrigger>
                <SelectContent>
                  {invoiceStatusOptions.map(option => (
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
                  <SelectValue placeholder="Issue Date" />
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
                  setSelectedStatus('all');
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
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} invoices
        </p>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Reminders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No invoices found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or create a new invoice
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => handleViewInvoice(invoice)}>
                      <span className="font-mono text-sm">{invoice.invoiceNumber}</span>
                    </TableCell>
                    <TableCell onClick={() => handleViewInvoice(invoice)}>
                      <div>
                        <p className="font-medium">{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewInvoice(invoice)}>
                      <div>
                        <p className="font-medium">{invoice.planName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{invoice.subscriptionNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewInvoice(invoice)}>
                      <div>
                        <p className="font-medium">MK {invoice.total.toLocaleString()}</p>
                        {invoice.balanceDue > 0 && (
                          <p className="text-xs text-red-500">Due: MK {invoice.balanceDue.toLocaleString()}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewInvoice(invoice)}>
                      <Badge className={`${getStatusColor(invoice.status)} text-white`}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewInvoice(invoice)}>
                      {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell onClick={() => handleViewInvoice(invoice)}>
                      <div>
                        <p>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</p>
                        {invoice.status === 'overdue' && (
                          <p className="text-xs text-red-500">
                            {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewInvoice(invoice)}>
                      {invoice.paidDate ? format(new Date(invoice.paidDate), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell onClick={() => handleViewInvoice(invoice)}>
                      <div className="text-center">
                        <p className="font-medium">{invoice.reminderCount}</p>
                        {invoice.lastReminderSent && (
                          <p className="text-xs text-muted-foreground">
                            {formatDistance(new Date(invoice.lastReminderSent), new Date(), { addSuffix: true })}
                          </p>
                        )}
                      </div>
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
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendInvoice(invoice)}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendReminder(invoice)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(invoice.pdfUrl, '_blank')}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {invoice.status !== 'paid' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          {invoice.status !== 'overdue' && invoice.status !== 'paid' && (
                            <DropdownMenuItem onClick={() => handleMarkAsOverdue(invoice)}>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Mark as Overdue
                            </DropdownMenuItem>
                          )}
                          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                            <DropdownMenuItem 
                              className="text-yellow-600"
                              onClick={() => handleCancelInvoice(invoice)}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Cancel Invoice
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
      {filteredInvoices.length > 0 && (
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

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Invoice #${selectedInvoice.invoiceNumber}`}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Invoice Details</TabsTrigger>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={`${getStatusColor(selectedInvoice.status)} text-white mt-1`}>
                        {selectedInvoice.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{selectedInvoice.paymentMethod?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedInvoice.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedInvoice.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedInvoice.customerPhone}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{selectedInvoice.customerAddress}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Invoice Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Issue Date</p>
                        <p className="font-medium">{format(new Date(selectedInvoice.issueDate), 'PPP')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium">{format(new Date(selectedInvoice.dueDate), 'PPP')}</p>
                      </div>
                      {selectedInvoice.paidDate && (
                        <div>
                          <p className="text-sm text-muted-foreground">Paid Date</p>
                          <p className="font-medium">{format(new Date(selectedInvoice.paidDate), 'PPP')}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Subscription</p>
                        <p className="font-medium font-mono">{selectedInvoice.subscriptionNumber}</p>
                      </div>
                      {selectedInvoice.orderNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Order</p>
                          <p className="font-medium font-mono">{selectedInvoice.orderNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedInvoice.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedInvoice.notes}</p>
                      </div>
                    </>
                  )}

                  {selectedInvoice.terms && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Terms & Conditions</p>
                        <p className="text-sm mt-1">{selectedInvoice.terms}</p>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="items" className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.description || '-'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>MK {item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right">MK {item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">Subtotal</TableCell>
                        <TableCell className="text-right">MK {selectedInvoice.subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                      {selectedInvoice.discount > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-medium">
                            Discount
                            {selectedInvoice.discountCode && ` (${selectedInvoice.discountCode})`}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            -MK {selectedInvoice.discount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )}
                      {selectedInvoice.tax > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-medium">
                            Tax {selectedInvoice.taxRate ? `(${selectedInvoice.taxRate}%)` : ''}
                          </TableCell>
                          <TableCell className="text-right">MK {selectedInvoice.tax.toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      {selectedInvoice.deliveryFee > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-medium">Delivery Fee</TableCell>
                          <TableCell className="text-right">MK {selectedInvoice.deliveryFee.toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold">MK {selectedInvoice.total.toLocaleString()}</TableCell>
                      </TableRow>
                      {selectedInvoice.amountPaid > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-medium text-green-600">Amount Paid</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            MK {selectedInvoice.amountPaid.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )}
                      {selectedInvoice.balanceDue > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-medium text-red-600">Balance Due</TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            MK {selectedInvoice.balanceDue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="timeline" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
                        <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">Invoice Created</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedInvoice.createdAt), 'PPP p')}
                        </p>
                      </div>
                    </div>

                    {selectedInvoice.status !== 'draft' && (
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
                          <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-border" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">Invoice Sent</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedInvoice.updatedAt), 'PPP p')}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedInvoice.reminderCount > 0 && (
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5" />
                          <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-border" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">Reminder Sent</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedInvoice.lastReminderSent 
                              ? format(new Date(selectedInvoice.lastReminderSent), 'PPP p')
                              : `${selectedInvoice.reminderCount} reminder(s) sent`}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedInvoice.status === 'paid' && selectedInvoice.paidDate && (
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Payment Received</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedInvoice.paidDate), 'PPP p')}
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
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
              Close
            </Button>
            {selectedInvoice && (
              <>
                <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => handleSendInvoice(selectedInvoice)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Invoice Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Send invoice #${selectedInvoice.invoiceNumber} to customer`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Send to Email</Label>
              <Input 
                value={selectedInvoice?.customerEmail || ''} 
                readOnly 
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input 
                defaultValue={`Invoice #${selectedInvoice?.invoiceNumber} from Mwambo Store`} 
              />
            </div>

            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea 
                placeholder="Add a personal message..." 
                rows={4}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="attachPDF" 
                  defaultChecked 
                  className="rounded"
                />
                <Label htmlFor="attachPDF">Attach PDF</Label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="sendCopy" 
                  className="rounded"
                />
                <Label htmlFor="sendCopy">Send me a copy</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvoiceSubmit}>
              Send Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Send reminder for invoice #${selectedInvoice.invoiceNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reminder Message</Label>
              <Textarea 
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Send Via</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="reminderEmail" 
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="reminderEmail">Email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="reminderSms" 
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="reminderSms">SMS</Label>
                </div>
              </div>
            </div>

            {selectedInvoice && (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Invoice #{selectedInvoice.invoiceNumber} is {selectedInvoice.status === 'overdue' ? 'overdue' : 'pending'} 
                  by MK {selectedInvoice.balanceDue.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminderSubmit}>
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Generate a new invoice for a subscription
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Subscription *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sub1">SUB-202602-0001 - Brian Phiri</SelectItem>
                  <SelectItem value="sub2">SUB-202602-0002 - Mary Banda</SelectItem>
                  <SelectItem value="sub3">SUB-202602-0003 - John Chimwala</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Invoice Date *</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" />
            </div>

            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select defaultValue="net15">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                  <SelectItem value="net7">Net 7</SelectItem>
                  <SelectItem value="net15">Net 15</SelectItem>
                  <SelectItem value="net30">Net 30</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Items</Label>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center py-8">
                  Items will be loaded from the subscription plan
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Discount</Label>
              <Input type="number" placeholder="0" />
            </div>

            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select defaultValue="percentage">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input type="number" placeholder="16" defaultValue="16" />
            </div>

            <div className="space-y-2">
              <Label>Delivery Fee</Label>
              <Input type="number" placeholder="0" />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea placeholder="Add any notes for the customer..." rows={3} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowCreateDialog(false);
              toast({
                title: 'Invoice Created',
                description: 'New invoice has been created',
              });
            }}>
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionInvoices;