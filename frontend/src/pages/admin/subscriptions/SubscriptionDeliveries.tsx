import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
  User,
  Package,
  Printer,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Star,
  Bike,
  Car,
  Users,
  Award,
  Mail,
  IdCard,
  FileText,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Zap
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow } from 'date-fns';
import api from '@/services/api';

interface Delivery {
  id: string;
  delivery_number: string;
  subscription_id: string;
  subscription_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_instructions?: string;
  plan_name: string;
  plan_price: number;
  delivery_date: string;
  delivery_time?: string;
  actual_delivery_time?: string;
  status: 'scheduled' | 'processing' | 'out_for_delivery' | 'delivered' | 'failed' | 'skipped' | 'rescheduled';
  rider_id?: string;
  rider_name?: string;
  rider_phone?: string;
  tracking_number?: string;
  notes?: string;
  amount: number;
  payment_status: 'pending' | 'paid';
  confirmed_by_customer: boolean;
  confirmation_time?: string;
  rating?: number;
  feedback?: string;
  created_at: string;
}

interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  national_id: string | null;
  vehicle_type: 'bicycle' | 'motorcycle' | 'car';
  vehicle_plate: string | null;
  zone_id: number | null;
  zone_name: string | null;
  status: 'active' | 'inactive' | 'on_delivery';
  total_deliveries: number;
  rating: number;
  notes: string | null;
  completed_deliveries?: number;
  active_deliveries?: number;
  created_at: string;
  updated_at: string;
}

interface DeliveryZone {
  id: number;
  name: string;
  coverage: string;
}

interface ApiResponse {
  deliveries: Delivery[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface RidersApiResponse {
  riders: Rider[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const deliveryStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'processing', label: 'Processing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

const riderStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'on_delivery', label: 'On Delivery' },
  { value: 'inactive', label: 'Inactive' },
];

const vehicleTypeOptions = [
  { value: 'bicycle', label: 'Bicycle', icon: Bike },
  { value: 'motorcycle', label: 'Motorcycle', icon: Bike },
  { value: 'car', label: 'Car', icon: Car },
];

const SubscriptionDeliveries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('deliveries');
  
  // Deliveries state
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);
  const [deliveriesError, setDeliveriesError] = useState<string | null>(null);
  const [deliverySearch, setDeliverySearch] = useState('');
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState<string>('all');
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string>('all');
  const [selectedRider, setSelectedRider] = useState<string>('all');
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [deliveryTotalPages, setDeliveryTotalPages] = useState(1);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  
  // Riders state
  const [riders, setRiders] = useState<Rider[]>([]);
  const [ridersLoading, setRidersLoading] = useState(true);
  const [ridersError, setRidersError] = useState<string | null>(null);
  const [riderSearch, setRiderSearch] = useState('');
  const [selectedRiderStatus, setSelectedRiderStatus] = useState<string>('all');
  const [riderPage, setRiderPage] = useState(1);
  const [riderTotalPages, setRiderTotalPages] = useState(1);
  const [totalRiders, setTotalRiders] = useState(0);
  const [riderStats, setRiderStats] = useState({
    total: 0,
    active: 0,
    on_delivery: 0,
    avg_rating: 0
  });
  
  // Delivery zones for dropdown
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  
  // UI state
  const [showAssignRiderDialog, setShowAssignRiderDialog] = useState(false);
  const [showRiderDialog, setShowRiderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  
  // Form state for riders
  const [riderForm, setRiderForm] = useState<Partial<Rider>>({
    name: '',
    phone: '',
    email: '',
    national_id: '',
    vehicle_type: 'motorcycle',
    vehicle_plate: '',
    zone_id: null,
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchDeliveryZones();
  }, []);

  useEffect(() => {
    if (activeTab === 'deliveries') {
      fetchDeliveries();
      fetchRidersForDropdown();
    } else {
      fetchRiders();
      fetchRiderStats();
    }
  }, [
    activeTab, 
    deliveryPage, 
    selectedDeliveryStatus, 
    selectedDeliveryDate, 
    selectedRider, 
    deliverySearch,
    riderPage,
    selectedRiderStatus,
    riderSearch
  ]);

  const fetchDeliveries = async () => {
    setDeliveriesLoading(true);
    setDeliveriesError(null);
    try {
      const params = new URLSearchParams({
        page: deliveryPage.toString(),
        limit: '10',
        ...(selectedDeliveryStatus !== 'all' && { status: selectedDeliveryStatus }),
        ...(selectedDeliveryDate !== 'all' && { date: selectedDeliveryDate }),
        ...(selectedRider !== 'all' && { riderId: selectedRider }),
        ...(deliverySearch && { search: deliverySearch })
      });

      const response = await api.get<ApiResponse>(`/admin/subscriptions/deliveries?${params}`);
      
      setDeliveries(response.data.deliveries);
      setDeliveryTotalPages(response.data.pages);
      setTotalDeliveries(response.data.total);
    } catch (error: any) {
      console.error('Error fetching deliveries:', error);
      setDeliveriesError(error.response?.data?.message || 'Failed to load deliveries');
      toast({
        title: 'Error',
        description: 'Failed to load deliveries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeliveriesLoading(false);
    }
  };

  const fetchRiders = async () => {
    setRidersLoading(true);
    setRidersError(null);
    try {
      const params = new URLSearchParams({
        page: riderPage.toString(),
        limit: '10',
        ...(selectedRiderStatus !== 'all' && { status: selectedRiderStatus }),
        ...(riderSearch && { search: riderSearch })
      });

      const response = await api.get<RidersApiResponse>(`/admin/riders?${params}`);
      
      setRiders(response.data.riders);
      setRiderTotalPages(response.data.pages);
      setTotalRiders(response.data.total);
    } catch (error: any) {
      console.error('Error fetching riders:', error);
      setRidersError(error.response?.data?.message || 'Failed to load riders');
      toast({
        title: 'Error',
        description: 'Failed to load riders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRidersLoading(false);
    }
  };

  const fetchRiderStats = async () => {
    try {
      const response = await api.get('/admin/riders/stats');
      setRiderStats(response.data);
    } catch (error) {
      console.error('Error fetching rider stats:', error);
    }
  };

  const fetchRidersForDropdown = async () => {
    try {
      const response = await api.get('/admin/riders?limit=100');
      setRiders(response.data.riders);
    } catch (error) {
      console.error('Error fetching riders for dropdown:', error);
    }
  };

  const fetchDeliveryZones = async () => {
    try {
      const response = await api.get('/admin/delivery-zones');
      setDeliveryZones(response.data);
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId: string, newStatus: Delivery['status'], notes?: string) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/subscriptions/deliveries/${deliveryId}`, {
        status: newStatus,
        notes,
        actualDeliveryTime: newStatus === 'delivered' ? new Date().toISOString() : undefined
      });
      
      fetchDeliveries();
      
      toast({
        title: 'Status Updated',
        description: `Delivery status changed to ${newStatus.replace('_', ' ')}`,
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

  const handleAssignRider = async () => {
    if (!selectedDelivery) return;
    
    try {
      setUpdating(true);
      await api.patch(`/admin/subscriptions/deliveries/${selectedDelivery.id}`, {
        riderId: selectedDelivery.rider_id,
        status: 'processing'
      });
      
      setShowAssignRiderDialog(false);
      fetchDeliveries();
      
      toast({
        title: 'Rider Assigned',
        description: `Delivery assigned successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to assign rider',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateRider = async () => {
    if (!riderForm.name || !riderForm.phone) {
      toast({
        title: 'Validation Error',
        description: 'Name and phone are required',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await api.post('/admin/riders', riderForm);
      setRiders([response.data, ...riders]);
      setShowRiderDialog(false);
      resetRiderForm();
      fetchRiderStats();
      toast({
        title: 'Success',
        description: 'Rider created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create rider',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateRider = async () => {
    if (!editingRider) return;

    setUpdating(true);
    try {
      const response = await api.put(`/admin/riders/${editingRider.id}`, riderForm);
      setRiders(riders.map(r => r.id === editingRider.id ? response.data : r));
      setShowRiderDialog(false);
      resetRiderForm();
      fetchRiderStats();
      toast({
        title: 'Success',
        description: 'Rider updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update rider',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRider = async () => {
    if (!selectedItem) return;

    setUpdating(true);
    try {
      await api.delete(`/admin/riders/${selectedItem.id}`);
      setRiders(riders.filter(r => r.id !== selectedItem.id));
      setShowDeleteDialog(false);
      fetchRiderStats();
      toast({
        title: 'Success',
        description: 'Rider deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete rider',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleRiderStatus = async (rider: Rider) => {
    try {
      const response = await api.patch(`/admin/riders/${rider.id}/toggle`);
      setRiders(riders.map(r => r.id === rider.id ? { ...r, status: response.data.status } : r));
      fetchRiderStats();
      toast({
        title: 'Status Updated',
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle status',
        variant: 'destructive',
      });
    }
  };

  const resetRiderForm = () => {
    setRiderForm({
      name: '',
      phone: '',
      email: '',
      national_id: '',
      vehicle_type: 'motorcycle',
      vehicle_plate: '',
      zone_id: null,
      status: 'active',
      notes: ''
    });
    setEditingRider(null);
  };

  const handleEditRider = (rider: Rider) => {
    setEditingRider(rider);
    setRiderForm({
      name: rider.name,
      phone: rider.phone,
      email: rider.email || '',
      national_id: rider.national_id || '',
      vehicle_type: rider.vehicle_type,
      vehicle_plate: rider.vehicle_plate || '',
      zone_id: rider.zone_id,
      status: rider.status,
      notes: rider.notes || ''
    });
    setShowRiderDialog(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDeliveryStatusColor = (status: string) => {
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

  const getRiderStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'on_delivery': return 'bg-blue-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getVehicleIcon = (type: string) => {
    switch(type) {
      case 'bicycle': return <Bike className="w-4 h-4" />;
      case 'motorcycle': return <Bike className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      default: return <Bike className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-3 h-3 text-gray-300" />
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 absolute top-0 left-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Delivery Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage deliveries and delivery riders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={activeTab === 'deliveries' ? fetchDeliveries : fetchRiders} disabled={activeTab === 'deliveries' ? deliveriesLoading : ridersLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${(activeTab === 'deliveries' ? deliveriesLoading : ridersLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="riders">Riders</TabsTrigger>
        </TabsList>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries" className="space-y-6">
          {/* Stats Cards - Deliveries */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{totalDeliveries}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-950/30">
              <CardContent className="p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">Scheduled</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {deliveries.filter(d => d.status === 'scheduled').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-950/30">
              <CardContent className="p-4">
                <p className="text-sm text-orange-600 dark:text-orange-400">Out for Delivery</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {deliveries.filter(d => d.status === 'out_for_delivery').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/30">
              <CardContent className="p-4">
                <p className="text-sm text-green-600 dark:text-green-400">Delivered Today</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {deliveries.filter(d => d.status === 'delivered' && isToday(new Date(d.delivery_date))).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters - Deliveries */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by customer, delivery #, subscription #..."
                      value={deliverySearch}
                      onChange={(e) => setDeliverySearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={selectedDeliveryStatus} onValueChange={setSelectedDeliveryStatus}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryStatusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDeliveryDate} onValueChange={setSelectedDeliveryDate}>
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
                          {rider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setDeliverySearch('');
                      setSelectedDeliveryStatus('all');
                      setSelectedDeliveryDate('all');
                      setSelectedRider('all');
                      setDeliveryPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliveries Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveriesLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                      </TableCell>
                    </TableRow>
                  ) : deliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No deliveries found</p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your filters
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    deliveries.map((delivery) => (
                      <TableRow key={delivery.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <span className="font-mono text-sm">{delivery.delivery_number}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                                {getInitials(delivery.customer_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{delivery.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{delivery.customer_phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{delivery.plan_name}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{format(new Date(delivery.delivery_date), 'MMM d, yyyy')}</p>
                            {delivery.delivery_time && (
                              <p className="text-xs text-muted-foreground">{delivery.delivery_time}</p>
                            )}
                            {isToday(new Date(delivery.delivery_date)) && (
                              <Badge className="bg-green-500 text-white mt-1">Today</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getDeliveryStatusColor(delivery.status)} text-white`}>
                            {delivery.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {delivery.rider_name ? (
                            <div>
                              <p className="font-medium">{delivery.rider_name}</p>
                              <p className="text-xs text-muted-foreground">{delivery.rider_phone}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm truncate max-w-[200px]">{delivery.delivery_address}</p>
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
                              <DropdownMenuItem 
                                onClick={() => handleUpdateDeliveryStatus(delivery.id, 'out_for_delivery')}
                                disabled={delivery.status === 'out_for_delivery' || delivery.status === 'delivered'}
                              >
                                <Truck className="w-4 h-4 mr-2" />
                                Mark Out for Delivery
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateDeliveryStatus(delivery.id, 'delivered')}
                                disabled={delivery.status === 'delivered'}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Delivered
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateDeliveryStatus(delivery.id, 'failed')}
                                disabled={delivery.status === 'delivered'}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Mark Failed
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedDelivery(delivery);
                                setShowAssignRiderDialog(true);
                              }}>
                                <User className="w-4 h-4 mr-2" />
                                Assign Rider
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

          {/* Pagination - Deliveries */}
          {deliveryTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {deliveryPage} of {deliveryTotalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeliveryPage(p => Math.max(1, p - 1))}
                  disabled={deliveryPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeliveryPage(p => Math.min(deliveryTotalPages, p + 1))}
                  disabled={deliveryPage === deliveryTotalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Riders Tab */}
        <TabsContent value="riders" className="space-y-6">
          {/* Stats Cards - Riders */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Riders</p>
                <p className="text-2xl font-bold">{riderStats.total}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/30">
              <CardContent className="p-4">
                <p className="text-sm text-green-600 dark:text-green-400">Active</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{riderStats.active}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-950/30">
              <CardContent className="p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">On Delivery</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{riderStats.on_delivery}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">{riderStats.avg_rating.toFixed(1)}</p>
                  <div className="flex">{renderStars(riderStats.avg_rating)}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Add - Riders */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone or email..."
                value={riderSearch}
                onChange={(e) => setRiderSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedRiderStatus} onValueChange={setSelectedRiderStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {riderStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                onClick={() => {
                  resetRiderForm();
                  setShowRiderDialog(true);
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                New Rider
              </Button>
            </div>
          </div>

          {/* Riders Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rider</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ridersLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                      </TableCell>
                    </TableRow>
                  ) : riders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No riders found</p>
                        <p className="text-sm text-muted-foreground">
                          Add your first rider to get started
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    riders.map((rider) => (
                      <TableRow key={rider.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                                {getInitials(rider.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{rider.name}</p>
                              {rider.national_id && (
                                <p className="text-xs text-muted-foreground">ID: {rider.national_id}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <span>{rider.phone}</span>
                            </div>
                            {rider.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs">{rider.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getVehicleIcon(rider.vehicle_type)}
                            <span className="capitalize">{rider.vehicle_type}</span>
                            {rider.vehicle_plate && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {rider.vehicle_plate}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rider.zone_name ? (
                            <Badge variant="outline">{rider.zone_name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRiderStatusColor(rider.status)} text-white`}>
                            {rider.status === 'on_delivery' ? 'On Delivery' : rider.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{rider.total_deliveries} total</p>
                            {rider.active_deliveries ? (
                              <p className="text-xs text-blue-600">{rider.active_deliveries} active</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">No active deliveries</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {renderStars(rider.rating)}
                            <span className="text-xs text-muted-foreground">
                              ({rider.rating.toFixed(1)})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={updating}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditRider(rider)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleRiderStatus(rider)}>
                                {rider.status === 'active' ? (
                                  <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Mark On Delivery
                                  </>
                                ) : rider.status === 'on_delivery' ? (
                                  <>
                                    <PowerOff className="w-4 h-4 mr-2" />
                                    Mark Inactive
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedItem(rider);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
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

          {/* Pagination - Riders */}
          {riderTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {riderPage} of {riderTotalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRiderPage(p => Math.max(1, p - 1))}
                  disabled={riderPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRiderPage(p => Math.min(riderTotalPages, p + 1))}
                  disabled={riderPage === riderTotalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Rider Dialog */}
      <Dialog open={showAssignRiderDialog} onOpenChange={setShowAssignRiderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Rider</DialogTitle>
            <DialogDescription>
              {selectedDelivery && `Assign a rider for delivery #${selectedDelivery.delivery_number}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Rider</Label>
              <Select 
                value={selectedDelivery?.rider_id || ''} 
                onValueChange={(value) => {
                  if (selectedDelivery) {
                    const rider = riders.find(r => r.id === value);
                    setSelectedDelivery({
                      ...selectedDelivery,
                      rider_id: value,
                      rider_name: rider?.name,
                      rider_phone: rider?.phone
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a rider" />
                </SelectTrigger>
                <SelectContent>
                  {riders
                    .filter(r => r.status === 'active' || r.status === 'on_delivery')
                    .map(rider => (
                      <SelectItem key={rider.id} value={rider.id}>
                        {rider.name} ({rider.vehicle_type}) - {rider.total_deliveries} deliveries
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tracking Number (Optional)</Label>
              <Input
                value={selectedDelivery?.tracking_number || ''}
                onChange={(e) => {
                  if (selectedDelivery) {
                    setSelectedDelivery({
                      ...selectedDelivery,
                      tracking_number: e.target.value
                    });
                  }
                }}
                placeholder="e.g., TRK123456"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignRiderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRider} disabled={!selectedDelivery?.rider_id}>
              Assign Rider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rider Create/Edit Dialog */}
      <Dialog open={showRiderDialog} onOpenChange={(open) => {
        if (!open) {
          setShowRiderDialog(false);
          resetRiderForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRider ? 'Edit Rider' : 'Create New Rider'}</DialogTitle>
            <DialogDescription>
              {editingRider ? 'Edit the rider details' : 'Add a new delivery rider'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={riderForm.name}
                onChange={(e) => setRiderForm({...riderForm, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={riderForm.phone}
                onChange={(e) => setRiderForm({...riderForm, phone: e.target.value})}
                placeholder="+265 991 234 567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={riderForm.email}
                onChange={(e) => setRiderForm({...riderForm, email: e.target.value})}
                placeholder="rider@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="national_id">National ID</Label>
              <Input
                id="national_id"
                value={riderForm.national_id}
                onChange={(e) => setRiderForm({...riderForm, national_id: e.target.value})}
                placeholder="MW-1234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select 
                value={riderForm.vehicle_type} 
                onValueChange={(value: any) => setRiderForm({...riderForm, vehicle_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_plate">Vehicle Plate</Label>
              <Input
                id="vehicle_plate"
                value={riderForm.vehicle_plate}
                onChange={(e) => setRiderForm({...riderForm, vehicle_plate: e.target.value})}
                placeholder="AB 1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone">Assigned Zone</Label>
              <Select 
                value={riderForm.zone_id?.toString() || ''} 
                onValueChange={(value) => setRiderForm({...riderForm, zone_id: value ? parseInt(value) : null})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Zone</SelectItem>
                  {deliveryZones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id.toString()}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={riderForm.status} 
                onValueChange={(value: any) => setRiderForm({...riderForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_delivery">On Delivery</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={riderForm.notes}
                onChange={(e) => setRiderForm({...riderForm, notes: e.target.value})}
                placeholder="Additional information about the rider..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRiderDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={editingRider ? handleUpdateRider : handleCreateRider}
              disabled={updating}
            >
              {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingRider ? 'Update Rider' : 'Create Rider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedItem?.name}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRider}
              className="bg-red-600 hover:bg-red-700"
            >
              {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionDeliveries;