import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Plus,
  RefreshCw,
  Download,
  Search,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Truck,
  Users,
  DollarSign,
  Map,
  Package,
  AlertCircle,
  Loader2,
  Power,
  Globe,
  Building2,
  Store,
  Factory,
  Bike,
  Car,
  Coffee,
  Sun,
  Moon,
  Zap,
  Timer,
  Calendar,
  X,
  CheckCircle,
  CircleSlash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

// Types matching database schema
interface DeliveryZone {
  id: number;
  name: string;
  price_km: number | null;
  min_delivery_time: number | null;
  max_delivery_time: number | null;
  is_active: boolean;
  coverage: 'full' | 'partial' | 'coming';
  created_at: string;
}

interface DeliverySlot {
  id: number;
  service_id: number;
  time_description: string;
  available: boolean;
  price: number | null;
  estimated_time: string | null;
  icon: string | null;
  max_orders: number | null;
  current_orders: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Helper function to safely format currency
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString();
};

// Helper to format delivery time range
const formatDeliveryTime = (min: number | null, max: number | null): string => {
  if (min === null && max === null) return '-';
  if (min !== null && max !== null) return `${min}-${max} min`;
  if (min !== null) return `${min}+ min`;
  if (max !== null) return `up to ${max} min`;
  return '-';
};

// Coverage badge component
const CoverageBadge = ({ coverage }: { coverage: string }) => {
  switch (coverage) {
    case 'full':
      return <Badge className="bg-green-500 text-white">Full Coverage</Badge>;
    case 'partial':
      return <Badge className="bg-yellow-500 text-white">Partial Coverage</Badge>;
    case 'coming':
      return <Badge className="bg-blue-500 text-white">Coming Soon</Badge>;
    default:
      return <Badge variant="outline">{coverage}</Badge>;
  }
};

// Status badge component (for is_active)
const ActiveBadge = ({ isActive }: { isActive: boolean }) => {
  if (isActive) {
    return <Badge className="bg-green-500 text-white">Active</Badge>;
  }
  return <Badge variant="destructive">Inactive</Badge>;
};

// Slot status badge component
const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'active') {
    return <Badge className="bg-green-500 text-white">Active</Badge>;
  }
  return <Badge variant="destructive">Inactive</Badge>;
};

// Available badge component
const AvailableBadge = ({ available }: { available: boolean }) => {
  if (available) {
    return <Badge className="bg-green-500 text-white">Available</Badge>;
  }
  return <Badge variant="outline" className="text-muted-foreground">Unavailable</Badge>;
};

// Icon selector component
const IconSelector = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  const icons = [
    { value: 'MapPin', label: 'Map Pin', icon: MapPin },
    { value: 'Building2', label: 'Building', icon: Building2 },
    { value: 'Store', label: 'Store', icon: Store },
    { value: 'Factory', label: 'Factory', icon: Factory },
    { value: 'Globe', label: 'Globe', icon: Globe },
    { value: 'Bike', label: 'Bike', icon: Bike },
    { value: 'Car', label: 'Car', icon: Car },
    { value: 'Truck', label: 'Truck', icon: Truck },
    { value: 'Coffee', label: 'Coffee', icon: Coffee },
    { value: 'Sun', label: 'Sun', icon: Sun },
    { value: 'Moon', label: 'Moon', icon: Moon },
    { value: 'Zap', label: 'Zap', icon: Zap },
    { value: 'Timer', label: 'Timer', icon: Timer },
    { value: 'Clock', label: 'Clock', icon: Clock },
    { value: 'Calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select icon" />
      </SelectTrigger>
      <SelectContent>
        {icons.map((icon) => {
          const IconComponent = icon.icon;
          return (
            <SelectItem key={icon.value} value={icon.value}>
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                <span>{icon.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

// Skeleton loaders
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
  </TableRow>
);

const SlotTableRowSkeleton = () => (
  <TableRow>
    <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
  </TableRow>
);

const Warehouse = () => {
  const { toast } = useToast();
  
  // State
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState({ zones: true, slots: true });
  const [error, setError] = useState({ zones: null as string | null, slots: null as string | null });
  const [searchTerm, setSearchTerm] = useState({ zones: '', slots: '' });
  
  // Zone dialog
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [zoneForm, setZoneForm] = useState({
    name: '',
    price_km: 0,
    min_delivery_time: '',
    max_delivery_time: '',
    is_active: true,
    coverage: 'full' as 'full' | 'partial' | 'coming'
  });

  // Slot dialog
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);
  const [slotForm, setSlotForm] = useState({
    service_id: 1,
    time_description: '',
    available: true,
    price: 0,
    estimated_time: '',
    icon: 'Clock',
    max_orders: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'zone' | 'slot', id: number } | null>(null);

  // Stats
  const [stats, setStats] = useState({
    zones: {
      total: 0,
      active: 0,
      avgPriceKm: 0
    },
    slots: {
      total: 0,
      active: 0,
      totalCapacity: 0,
      currentBookings: 0
    }
  });

  // Fetch data
  const fetchZones = useCallback(async () => {
    setLoading(prev => ({ ...prev, zones: true }));
    setError(prev => ({ ...prev, zones: null }));
    try {
      const response = await api.get('/admin/delivery-zones');
      const zonesData = response.data;
      setZones(zonesData);
      
      // Calculate stats
      const activeZones = zonesData.filter((z: DeliveryZone) => z.is_active === true);
      const totalPriceKm = zonesData.reduce((sum: number, z: DeliveryZone) => sum + (z.price_km || 0), 0);
      const avgPriceKm = zonesData.length > 0 ? totalPriceKm / zonesData.length : 0;
      
      setStats(prev => ({
        ...prev,
        zones: {
          total: zonesData.length,
          active: activeZones.length,
          avgPriceKm
        }
      }));
    } catch (err) {
      console.error('Error fetching delivery zones:', err);
      setError(prev => ({ ...prev, zones: 'Failed to load delivery zones' }));
      toast({
        title: 'Error',
        description: 'Failed to load delivery zones',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, zones: false }));
    }
  }, [toast]);

  const fetchSlots = useCallback(async () => {
    setLoading(prev => ({ ...prev, slots: true }));
    setError(prev => ({ ...prev, slots: null }));
    try {
      const response = await api.get('/admin/delivery-slots');
      const slotsData = response.data;
      setSlots(slotsData);
      
      // Calculate stats
      const activeSlots = slotsData.filter((s: DeliverySlot) => s.status === 'active');
      const totalCapacity = slotsData.reduce((sum: number, s: DeliverySlot) => sum + (s.max_orders || 0), 0);
      const currentBookings = slotsData.reduce((sum: number, s: DeliverySlot) => sum + (s.current_orders || 0), 0);
      
      setStats(prev => ({
        ...prev,
        slots: {
          total: slotsData.length,
          active: activeSlots.length,
          totalCapacity,
          currentBookings
        }
      }));
    } catch (err) {
      console.error('Error fetching delivery slots:', err);
      setError(prev => ({ ...prev, slots: 'Failed to load delivery slots' }));
      toast({
        title: 'Error',
        description: 'Failed to load delivery slots',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, slots: false }));
    }
  }, [toast]);

  useEffect(() => {
    fetchZones();
    fetchSlots();
  }, [fetchZones, fetchSlots]);

  // Zone handlers
  const handleZoneSubmit = async () => {
    try {
      const submitData = {
        ...zoneForm,
        min_delivery_time: zoneForm.min_delivery_time ? parseInt(zoneForm.min_delivery_time) : null,
        max_delivery_time: zoneForm.max_delivery_time ? parseInt(zoneForm.max_delivery_time) : null,
        price_km: zoneForm.price_km
      };

      if (editingZone) {
        // Update
        await api.put(`/admin/delivery-zones/${editingZone.id}`, submitData);
        toast({
          title: 'Success',
          description: 'Delivery zone updated successfully',
        });
      } else {
        // Create
        await api.post('/admin/delivery-zones', submitData);
        toast({
          title: 'Success',
          description: 'Delivery zone created successfully',
        });
      }
      setZoneDialogOpen(false);
      resetZoneForm();
      fetchZones();
    } catch (err) {
      console.error('Error saving delivery zone:', err);
      toast({
        title: 'Error',
        description: 'Failed to save delivery zone',
        variant: 'destructive',
      });
    }
  };

  const handleZoneEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      price_km: zone.price_km || 0,
      min_delivery_time: zone.min_delivery_time?.toString() || '',
      max_delivery_time: zone.max_delivery_time?.toString() || '',
      is_active: zone.is_active,
      coverage: zone.coverage
    });
    setZoneDialogOpen(true);
  };

  const handleZoneToggle = async (id: number) => {
    try {
      await api.patch(`/admin/delivery-zones/${id}/toggle`);
      toast({
        title: 'Success',
        description: 'Delivery zone status toggled',
      });
      fetchZones();
    } catch (err) {
      console.error('Error toggling delivery zone:', err);
      toast({
        title: 'Error',
        description: 'Failed to toggle delivery zone status',
        variant: 'destructive',
      });
    }
  };

  const handleZoneDelete = async () => {
    if (!itemToDelete || itemToDelete.type !== 'zone') return;
    
    try {
      await api.delete(`/admin/delivery-zones/${itemToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Delivery zone deleted successfully',
      });
      fetchZones();
    } catch (err) {
      console.error('Error deleting delivery zone:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete delivery zone',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Slot handlers
  const handleSlotSubmit = async () => {
    try {
      const submitData = {
        ...slotForm,
        max_orders: slotForm.max_orders ? parseInt(slotForm.max_orders) : null
      };

      if (editingSlot) {
        // Update
        await api.put(`/admin/delivery-slots/${editingSlot.id}`, submitData);
        toast({
          title: 'Success',
          description: 'Delivery slot updated successfully',
        });
      } else {
        // Create
        await api.post('/admin/delivery-slots', submitData);
        toast({
          title: 'Success',
          description: 'Delivery slot created successfully',
        });
      }
      setSlotDialogOpen(false);
      resetSlotForm();
      fetchSlots();
    } catch (err) {
      console.error('Error saving delivery slot:', err);
      toast({
        title: 'Error',
        description: 'Failed to save delivery slot',
        variant: 'destructive',
      });
    }
  };

  const handleSlotEdit = (slot: DeliverySlot) => {
    setEditingSlot(slot);
    setSlotForm({
      service_id: slot.service_id,
      time_description: slot.time_description,
      available: slot.available,
      price: slot.price || 0,
      estimated_time: slot.estimated_time || '',
      icon: slot.icon || 'Clock',
      max_orders: slot.max_orders?.toString() || '',
      status: slot.status
    });
    setSlotDialogOpen(true);
  };

  const handleSlotToggle = async (id: number) => {
    try {
      await api.patch(`/admin/delivery-slots/${id}/toggle`);
      toast({
        title: 'Success',
        description: 'Delivery slot status toggled',
      });
      fetchSlots();
    } catch (err) {
      console.error('Error toggling delivery slot:', err);
      toast({
        title: 'Error',
        description: 'Failed to toggle delivery slot status',
        variant: 'destructive',
      });
    }
  };

  const handleSlotDelete = async () => {
    if (!itemToDelete || itemToDelete.type !== 'slot') return;
    
    try {
      await api.delete(`/admin/delivery-slots/${itemToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Delivery slot deleted successfully',
      });
      fetchSlots();
    } catch (err) {
      console.error('Error deleting delivery slot:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete delivery slot',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Reset forms
  const resetZoneForm = () => {
    setEditingZone(null);
    setZoneForm({
      name: '',
      price_km: 0,
      min_delivery_time: '',
      max_delivery_time: '',
      is_active: true,
      coverage: 'full'
    });
  };

  const resetSlotForm = () => {
    setEditingSlot(null);
    setSlotForm({
      service_id: 1,
      time_description: '',
      available: true,
      price: 0,
      estimated_time: '',
      icon: 'Clock',
      max_orders: '',
      status: 'active'
    });
  };

  // Filtered data
  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(searchTerm.zones.toLowerCase())
  );

  const filteredSlots = slots.filter(slot => 
    slot.time_description.toLowerCase().includes(searchTerm.slots.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Warehouse</h1>
          <p className="text-muted-foreground mt-1">Manage delivery zones and time slots</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            fetchZones();
            fetchSlots();
          }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="zones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="zones" className="gap-2">
            <MapPin className="w-4 h-4" />
            Delivery Zones
          </TabsTrigger>
          <TabsTrigger value="slots" className="gap-2">
            <Clock className="w-4 h-4" />
            Delivery Slots
          </TabsTrigger>
        </TabsList>

        {/* ============= DELIVERY ZONES TAB ============= */}
        <TabsContent value="zones" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Zones</p>
                    <p className="text-2xl font-bold mt-1">{stats.zones.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <MapPin className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Zones</p>
                    <p className="text-2xl font-bold mt-1">{stats.zones.active}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Price/km</p>
                    <p className="text-2xl font-bold mt-1">MK {formatCurrency(Math.round(stats.zones.avgPriceKm))}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search zones by name..."
                    value={searchTerm.zones}
                    onChange={(e) => setSearchTerm(prev => ({ ...prev, zones: e.target.value }))}
                    className="pl-9"
                  />
                </div>
                <Dialog open={zoneDialogOpen} onOpenChange={(open) => {
                  setZoneDialogOpen(open);
                  if (!open) resetZoneForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white gap-2">
                      <Plus className="w-4 h-4" />
                      Add Delivery Zone
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingZone ? 'Edit' : 'Create'} Delivery Zone</DialogTitle>
                      <DialogDescription>
                        {editingZone ? 'Update zone details' : 'Add a new delivery zone'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="name">Zone Name *</Label>
                        <Input
                          id="name"
                          value={zoneForm.name}
                          onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Lilongwe City Centre"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price_km">Price per km (MK)</Label>
                        <Input
                          id="price_km"
                          type="number"
                          min="0"
                          step="100"
                          value={zoneForm.price_km}
                          onChange={(e) => setZoneForm(prev => ({ ...prev, price_km: parseInt(e.target.value) || 0 }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coverage">Coverage *</Label>
                        <Select
                          value={zoneForm.coverage}
                          onValueChange={(value: 'full' | 'partial' | 'coming') => 
                            setZoneForm(prev => ({ ...prev, coverage: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select coverage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Coverage</SelectItem>
                            <SelectItem value="partial">Partial Coverage</SelectItem>
                            <SelectItem value="coming">Coming Soon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="min_delivery_time">Min Delivery Time (minutes)</Label>
                        <Input
                          id="min_delivery_time"
                          type="number"
                          min="0"
                          value={zoneForm.min_delivery_time}
                          onChange={(e) => setZoneForm(prev => ({ ...prev, min_delivery_time: e.target.value }))}
                          placeholder="e.g., 30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_delivery_time">Max Delivery Time (minutes)</Label>
                        <Input
                          id="max_delivery_time"
                          type="number"
                          min="0"
                          value={zoneForm.max_delivery_time}
                          onChange={(e) => setZoneForm(prev => ({ ...prev, max_delivery_time: e.target.value }))}
                          placeholder="e.g., 60"
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="is_active">Status</Label>
                        <div className="flex items-center space-x-2 pt-2">
                          <Switch
                            id="is_active"
                            checked={zoneForm.is_active}
                            onCheckedChange={(checked) => setZoneForm(prev => ({ ...prev, is_active: checked }))}
                          />
                          <Label htmlFor="is_active">
                            {zoneForm.is_active ? 'Active' : 'Inactive'}
                          </Label>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setZoneDialogOpen(false);
                        resetZoneForm();
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleZoneSubmit}>
                        {editingZone ? 'Update' : 'Create'} Zone
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Zones Table */}
          <Card>
            <CardContent className="p-0">
              {error.zones ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-red-600">{error.zones}</p>
                  <Button 
                    variant="outline" 
                    onClick={fetchZones}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Price/km (MK)</TableHead>
                      <TableHead>Delivery Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading.zones ? (
                      [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
                    ) : filteredZones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No delivery zones found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredZones.map((zone) => (
                        <TableRow key={zone.id}>
                          <TableCell className="font-medium">{zone.name}</TableCell>
                          <TableCell><CoverageBadge coverage={zone.coverage} /></TableCell>
                          <TableCell>MK {formatCurrency(zone.price_km)}</TableCell>
                          <TableCell>{formatDeliveryTime(zone.min_delivery_time, zone.max_delivery_time)}</TableCell>
                          <TableCell><ActiveBadge isActive={zone.is_active} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleZoneEdit(zone)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleZoneToggle(zone.id)}
                              >
                                <Power className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setItemToDelete({ type: 'zone', id: zone.id });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= DELIVERY SLOTS TAB ============= */}
        <TabsContent value="slots" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Slots</p>
                    <p className="text-2xl font-bold mt-1">{stats.slots.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Slots</p>
                    <p className="text-2xl font-bold mt-1">{stats.slots.active}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Capacity</p>
                    <p className="text-2xl font-bold mt-1">{stats.slots.totalCapacity.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Bookings</p>
                    <p className="text-2xl font-bold mt-1">{stats.slots.currentBookings.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search slots..."
                    value={searchTerm.slots}
                    onChange={(e) => setSearchTerm(prev => ({ ...prev, slots: e.target.value }))}
                    className="pl-9"
                  />
                </div>
                <Dialog open={slotDialogOpen} onOpenChange={(open) => {
                  setSlotDialogOpen(open);
                  if (!open) resetSlotForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white gap-2">
                      <Plus className="w-4 h-4" />
                      Add Delivery Slot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingSlot ? 'Edit' : 'Create'} Delivery Slot</DialogTitle>
                      <DialogDescription>
                        {editingSlot ? 'Update slot details' : 'Add a new delivery time slot'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="time_description">Time Description *</Label>
                        <Input
                          id="time_description"
                          value={slotForm.time_description}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, time_description: e.target.value }))}
                          placeholder="e.g., Morning (6AM - 11AM)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price (MK)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="100"
                          value={slotForm.price}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimated_time">Estimated Time</Label>
                        <Input
                          id="estimated_time"
                          value={slotForm.estimated_time}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, estimated_time: e.target.value }))}
                          placeholder="e.g., 30-45 min"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_orders">Max Orders</Label>
                        <Input
                          id="max_orders"
                          type="number"
                          min="0"
                          value={slotForm.max_orders}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, max_orders: e.target.value }))}
                          placeholder="Leave empty for unlimited"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="icon">Icon</Label>
                        <IconSelector 
                          value={slotForm.icon} 
                          onChange={(value) => setSlotForm(prev => ({ ...prev, icon: value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="available">Available</Label>
                        <div className="flex items-center space-x-2 pt-2">
                          <Switch
                            id="available"
                            checked={slotForm.available}
                            onCheckedChange={(checked) => setSlotForm(prev => ({ ...prev, available: checked }))}
                          />
                          <Label htmlFor="available">
                            {slotForm.available ? 'Available' : 'Unavailable'}
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={slotForm.status}
                          onValueChange={(value: 'active' | 'inactive') => 
                            setSlotForm(prev => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setSlotDialogOpen(false);
                        resetSlotForm();
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleSlotSubmit}>
                        {editingSlot ? 'Update' : 'Create'} Slot
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Slots Table */}
          <Card>
            <CardContent className="p-0">
              {error.slots ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-red-600">{error.slots}</p>
                  <Button 
                    variant="outline" 
                    onClick={fetchSlots}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time Description</TableHead>
                      <TableHead>Price (MK)</TableHead>
                      <TableHead>Est. Time</TableHead>
                      <TableHead>Max Orders</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading.slots ? (
                      [...Array(5)].map((_, i) => <SlotTableRowSkeleton key={i} />)
                    ) : filteredSlots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No delivery slots found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSlots.map((slot) => {
                        const maxOrders = slot.max_orders || 0;
                        const currentOrders = slot.current_orders || 0;
                        const capacity = maxOrders > 0 
                          ? Math.round((currentOrders / maxOrders) * 100) 
                          : 0;
                        
                        return (
                          <TableRow key={slot.id}>
                            <TableCell className="font-medium">{slot.time_description}</TableCell>
                            <TableCell>MK {formatCurrency(slot.price)}</TableCell>
                            <TableCell>{slot.estimated_time || '-'}</TableCell>
                            <TableCell>{maxOrders > 0 ? maxOrders : '∞'}</TableCell>
                            <TableCell>{currentOrders}</TableCell>
                            <TableCell>
                              {maxOrders > 0 ? (
                                <div className="w-24">
                                  <Progress value={capacity} className="h-2" />
                                  <p className="text-xs text-muted-foreground mt-1">{capacity}%</p>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">No limit</span>
                              )}
                            </TableCell>
                            <TableCell><AvailableBadge available={slot.available} /></TableCell>
                            <TableCell><StatusBadge status={slot.status} /></TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSlotEdit(slot)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSlotToggle(slot.id)}
                                >
                                  <Power className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setItemToDelete({ type: 'slot', id: slot.id });
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              {itemToDelete?.type === 'zone' ? ' delivery zone' : ' delivery slot'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={itemToDelete?.type === 'zone' ? handleZoneDelete : handleSlotDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Warehouse;