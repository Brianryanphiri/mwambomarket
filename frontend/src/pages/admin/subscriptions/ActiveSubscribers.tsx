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
  Loader2,
  RefreshCw,
  UserPlus,
  MessageSquare,
  Bell,
  Truck,
  DollarSign,
  Edit,
  PauseCircle,
  PlayCircle,
  Ban,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { format, formatDistanceToNow } from 'date-fns';
import api from '@/services/api';

interface Subscriber {
  id: string;
  subscription_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  plan_interval: string;
  start_date: string;
  next_delivery_date: string;
  delivery_day: string;
  delivery_time?: string;
  delivery_address: string;
  payment_method: string;
  total_paid: number;
  total_deliveries: number;
  successful_deliveries: number;
  status: 'pending' | 'active' | 'paused' | 'cancelled' | 'expired';
  pause_until?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  call_status?: 'pending' | 'called' | 'confirmed' | 'no_answer' | 'call_later';
  call_notes?: string;
  last_call_date?: string;
  payment_status: 'paid' | 'pending' | 'overdue';
  last_payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  subscriptions: Subscriber[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Plan {
  id: string;
  name: string;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

const ActiveSubscribers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, selectedStatus, selectedPlan, searchTerm]);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedPlan !== 'all' && { planId: selectedPlan }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get<ApiResponse>(`/admin/subscriptions?${params}`);
      
      setSubscribers(response.data.subscriptions);
      setTotalPages(response.data.pages);
      setTotalSubscribers(response.data.total);
    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      setError(error.response?.data?.message || 'Failed to load subscribers');
      toast({
        title: 'Error',
        description: 'Failed to load subscribers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscriber = (id: string) => {
    navigate(`/admin/subscriptions/subscribers/${id}`);
  };

  const handleUpdateStatus = async (id: string, newStatus: Subscriber['status'], reason?: string) => {
    try {
      setUpdating(true);
      let endpoint = '';
      let method = 'post';
      
      switch(newStatus) {
        case 'paused':
          endpoint = `/subscriptions/${id}/pause`;
          break;
        case 'active':
          endpoint = `/subscriptions/${id}/resume`;
          break;
        case 'cancelled':
          endpoint = `/subscriptions/${id}/cancel`;
          break;
        default:
          return;
      }
      
      await api.post(endpoint, { reason });
      
      // Refresh the list
      fetchSubscribers();
      
      toast({
        title: 'Status Updated',
        description: `Subscription status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickCall = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setShowCallDialog(true);
  };

  const handleLogCall = async () => {
    if (!selectedSubscriber) return;
    
    try {
      // This would need an API endpoint - you may need to add one
      await api.post(`/admin/subscriptions/${selectedSubscriber.id}/call`, {
        status: 'called',
        notes: selectedSubscriber.call_notes
      });
      
      toast({
        title: 'Call Logged',
        description: 'Call record saved successfully',
      });
      setShowCallDialog(false);
      fetchSubscribers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log call',
        variant: 'destructive',
      });
    }
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

  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return `MK ${amount.toLocaleString()}`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    fetchSubscribers();
  };

  if (loading && subscribers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error && subscribers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-red-600 mb-2">Error Loading Subscribers</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Subscribers</h1>
          <p className="text-muted-foreground mt-1">
            Manage all subscription customers
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSubscribers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => navigate('/admin/subscriptions/new')}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {/* Stats Cards - These would come from a stats endpoint */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{totalSubscribers}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Active</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {subscribers.filter(s => s.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {subscribers.filter(s => s.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <p className="text-2xl font-bold">
              {formatCurrency(subscribers
                .filter(s => s.status === 'active')
                .reduce((sum, s) => sum + s.plan_price, 0)
              )}
            </p>
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
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedPlan('all');
                  setCurrentPage(1);
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
          Showing {subscribers.length} of {totalSubscribers} subscribers
        </p>
      </div>

      {/* Table View */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscriber</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Next Delivery</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                  </TableCell>
                </TableRow>
              ) : subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No subscribers found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or add a new subscriber
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((sub) => (
                  <TableRow key={sub.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                            {getInitials(sub.customer_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{sub.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{sub.customer_email}</p>
                          <p className="text-xs text-muted-foreground">{sub.customer_phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                      <div>
                        <p className="font-medium">{sub.plan_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(sub.plan_price)}/{sub.plan_interval}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                      <Badge className={`${getStatusColor(sub.status)} text-white`}>
                        {sub.status}
                      </Badge>
                      {sub.pause_until && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Until {format(new Date(sub.pause_until), 'MMM d')}
                        </p>
                      )}
                    </TableCell>
                    <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                      <Badge className={`${getPaymentStatusColor(sub.payment_status)} text-white`}>
                        {sub.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                      <p className="font-medium">
                        {format(new Date(sub.next_delivery_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{sub.delivery_day}</p>
                    </TableCell>
                    <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                      {formatCurrency(sub.total_paid)}
                    </TableCell>
                    <TableCell onClick={() => handleViewSubscriber(sub.id)}>
                      <p className="text-sm">{format(new Date(sub.start_date), 'MMM d, yyyy')}</p>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={updating}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>
              {selectedSubscriber && `Record call with ${selectedSubscriber.customer_name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Call Status</Label>
              <Select 
                value={selectedSubscriber?.call_status || 'called'}
                onValueChange={(value: any) => {
                  if (selectedSubscriber) {
                    setSelectedSubscriber({
                      ...selectedSubscriber,
                      call_status: value
                    });
                  }
                }}
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

            <div className="space-y-2">
              <Label>Call Notes</Label>
              <Textarea
                value={selectedSubscriber?.call_notes || ''}
                onChange={(e) => {
                  if (selectedSubscriber) {
                    setSelectedSubscriber({
                      ...selectedSubscriber,
                      call_notes: e.target.value
                    });
                  }
                }}
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
    </div>
  );
};

export default ActiveSubscribers;