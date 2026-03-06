import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Zap,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  MapPin,
  Truck,
  Bike,
  Car,
  Navigation,
  Timer,
  Gauge,
  Map,
  Compass,
  Locate,
  LocateFixed,
  Waypoints,
  Radar,
  Satellite,
  Save,
  ArrowLeft,
  X,
  PlusCircle,
  MinusCircle,
  Coffee,
  Fuel,
  Wrench,
  Settings,
  Home,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
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
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import type { DeliveryZone, DeliverySlot } from '@/types/service.types';

// Mock data for development
const mockZones: DeliveryZone[] = [
  {
    id: 'z1',
    serviceId: 'express-1',
    name: 'Lilongwe City Centre',
    coverage: 'full',
    time: '30-45 min',
    fee: 0,
    minOrder: 15000,
    icon: 'Building2',
    riders: 25,
    status: 'active',
    coordinates: [
      { lat: -13.9626, lng: 33.7741, radius: 5 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'z2',
    serviceId: 'express-1',
    name: 'Area 47 & Surroundings',
    coverage: 'full',
    time: '20-30 min',
    fee: 0,
    minOrder: 10000,
    icon: 'Home',
    riders: 18,
    status: 'active',
    coordinates: [
      { lat: -13.9833, lng: 33.7833, radius: 3 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'z3',
    serviceId: 'express-1',
    name: 'Area 25 & Kanengo',
    coverage: 'partial',
    time: '35-50 min',
    fee: 2500,
    minOrder: 15000,
    icon: 'Building2',
    riders: 12,
    status: 'active',
    coordinates: [
      { lat: -13.9167, lng: 33.7667, radius: 4 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'z4',
    serviceId: 'express-1',
    name: 'Lumbadzi',
    coverage: 'partial',
    time: '45-60 min',
    fee: 3500,
    minOrder: 20000,
    icon: 'MapPin',
    riders: 8,
    status: 'active',
    coordinates: [
      { lat: -13.8833, lng: 33.8000, radius: 5 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'z5',
    serviceId: 'express-1',
    name: 'Blantyre CBD',
    coverage: 'full',
    time: '40-55 min',
    fee: 0,
    minOrder: 15000,
    icon: 'Building2',
    riders: 20,
    status: 'active',
    coordinates: [
      { lat: -15.7861, lng: 35.0058, radius: 5 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'z6',
    serviceId: 'express-1',
    name: 'Mzuzu',
    coverage: 'coming',
    time: 'Coming Soon',
    fee: 0,
    minOrder: 0,
    icon: 'MapPin',
    riders: 0,
    status: 'inactive',
    coordinates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockSlots: DeliverySlot[] = [
  {
    id: 's1',
    serviceId: 'express-1',
    time: 'As soon as possible',
    available: true,
    price: 5000,
    estimated: '15-25 min',
    icon: 'Zap',
    maxOrders: 50,
    currentOrders: 23,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 's2',
    serviceId: 'express-1',
    time: 'Within 30 minutes',
    available: true,
    price: 3500,
    estimated: '30 min',
    icon: 'Timer',
    maxOrders: 100,
    currentOrders: 45,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 's3',
    serviceId: 'express-1',
    time: 'Within 1 hour',
    available: true,
    price: 2500,
    estimated: '60 min',
    icon: 'Clock',
    maxOrders: 200,
    currentOrders: 78,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 's4',
    serviceId: 'express-1',
    time: 'Schedule for later',
    available: true,
    price: 0,
    estimated: 'Choose time',
    icon: 'Calendar',
    maxOrders: 500,
    currentOrders: 156,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const coverageOptions = [
  { value: 'full', label: 'Full Coverage' },
  { value: 'partial', label: 'Partial Coverage' },
  { value: 'coming', label: 'Coming Soon' }
];

const iconOptions = [
  { value: 'Building2', label: 'City', icon: Building2 },
  { value: 'Home', label: 'Residential', icon: Home },
  { value: 'MapPin', label: 'Area', icon: MapPin },
  { value: 'Store', label: 'Shopping', icon: Building2 },
  { value: 'Factory', label: 'Industrial', icon: Building2 }
];

const slotIconOptions = [
  { value: 'Zap', label: 'Express', icon: Zap },
  { value: 'Timer', label: 'Timer', icon: Timer },
  { value: 'Clock', label: 'Clock', icon: Clock },
  { value: 'Calendar', label: 'Calendar', icon: Clock }
];

const ExpressDelivery = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('zones');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoverage, setSelectedCoverage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSlotDialogOpen, setDeleteSlotDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Array<{ lat: number; lng: number; radius: number }>>([{ lat: 0, lng: 0, radius: 5 }]);

  // Zone Form state
  const [zoneFormData, setZoneFormData] = useState({
    name: '',
    coverage: 'full',
    time: '',
    fee: '',
    minOrder: '',
    icon: 'Building2',
    riders: '',
    status: 'active'
  });

  // Slot Form state
  const [slotFormData, setSlotFormData] = useState({
    time: '',
    available: 'true',
    price: '',
    estimated: '',
    icon: 'Zap',
    maxOrders: '',
    currentOrders: '0',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Replace with actual API calls
      // const zonesData = await serviceService.getDeliveryZones('express-1');
      // const slotsData = await serviceService.getDeliverySlots('express-1');
      // setZones(zonesData);
      // setSlots(slotsData);
      
      // Using mock data for now
      setTimeout(() => {
        setZones(mockZones);
        setSlots(mockSlots);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching express delivery data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load express delivery data',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneFormData({
      name: zone.name,
      coverage: zone.coverage,
      time: zone.time,
      fee: zone.fee.toString(),
      minOrder: zone.minOrder.toString(),
      icon: zone.icon,
      riders: zone.riders.toString(),
      status: zone.status
    });
    setCoordinates(zone.coordinates?.length ? zone.coordinates : [{ lat: 0, lng: 0, radius: 5 }]);
    setShowZoneForm(true);
  };

  const handleEditSlot = (slot: DeliverySlot) => {
    setEditingSlot(slot);
    setSlotFormData({
      time: slot.time,
      available: slot.available.toString(),
      price: slot.price.toString(),
      estimated: slot.estimated,
      icon: slot.icon,
      maxOrders: slot.maxOrders?.toString() || '',
      currentOrders: slot.currentOrders?.toString() || '0',
      status: slot.status
    });
    setShowSlotForm(true);
  };

  const handleDeleteZone = (id: string) => {
    setZoneToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSlot = (id: string) => {
    setSlotToDelete(id);
    setDeleteSlotDialogOpen(true);
  };

  const confirmDeleteZone = async () => {
    if (!zoneToDelete) return;
    
    try {
      // Replace with actual API call
      // await serviceService.deleteDeliveryZone('express-1', zoneToDelete);
      
      setZones(prev => prev.filter(z => z.id !== zoneToDelete));
      toast({
        title: 'Success',
        description: 'Delivery zone deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete zone',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
    }
  };

  const confirmDeleteSlot = async () => {
    if (!slotToDelete) return;
    
    try {
      // Replace with actual API call
      // await serviceService.deleteDeliverySlot('express-1', slotToDelete);
      
      setSlots(prev => prev.filter(s => s.id !== slotToDelete));
      toast({
        title: 'Success',
        description: 'Delivery slot deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete slot',
        variant: 'destructive',
      });
    } finally {
      setDeleteSlotDialogOpen(false);
      setSlotToDelete(null);
    }
  };

  const handleSubmitZone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const zoneData = {
        name: zoneFormData.name,
        coverage: zoneFormData.coverage as 'full' | 'partial' | 'coming',
        time: zoneFormData.time,
        fee: parseInt(zoneFormData.fee) || 0,
        minOrder: parseInt(zoneFormData.minOrder) || 0,
        icon: zoneFormData.icon,
        riders: parseInt(zoneFormData.riders) || 0,
        coordinates: coordinates.filter(c => c.lat !== 0 && c.lng !== 0),
        status: zoneFormData.status as 'active' | 'inactive'
      };

      if (editingZone) {
        // Update
        setZones(prev => prev.map(z => 
          z.id === editingZone.id 
            ? { ...z, ...zoneData, updatedAt: new Date().toISOString() }
            : z
        ));
        toast({
          title: 'Success',
          description: 'Delivery zone updated successfully',
        });
      } else {
        // Create
        const newZone: DeliveryZone = {
          id: Date.now().toString(),
          serviceId: 'express-1',
          ...zoneData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setZones(prev => [newZone, ...prev]);
        toast({
          title: 'Success',
          description: 'Delivery zone created successfully',
        });
      }

      setShowZoneForm(false);
      setEditingZone(null);
      resetZoneForm();
    } catch (error) {
      console.error('Error saving zone:', error);
      toast({
        title: 'Error',
        description: 'Failed to save zone',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slotData = {
        time: slotFormData.time,
        available: slotFormData.available === 'true',
        price: parseInt(slotFormData.price) || 0,
        estimated: slotFormData.estimated,
        icon: slotFormData.icon,
        maxOrders: slotFormData.maxOrders ? parseInt(slotFormData.maxOrders) : undefined,
        currentOrders: parseInt(slotFormData.currentOrders) || 0,
        status: slotFormData.status as 'active' | 'inactive'
      };

      if (editingSlot) {
        // Update
        setSlots(prev => prev.map(s => 
          s.id === editingSlot.id 
            ? { ...s, ...slotData, updatedAt: new Date().toISOString() }
            : s
        ));
        toast({
          title: 'Success',
          description: 'Delivery slot updated successfully',
        });
      } else {
        // Create
        const newSlot: DeliverySlot = {
          id: Date.now().toString(),
          serviceId: 'express-1',
          ...slotData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSlots(prev => [newSlot, ...prev]);
        toast({
          title: 'Success',
          description: 'Delivery slot created successfully',
        });
      }

      setShowSlotForm(false);
      setEditingSlot(null);
      resetSlotForm();
    } catch (error) {
      console.error('Error saving slot:', error);
      toast({
        title: 'Error',
        description: 'Failed to save slot',
        variant: 'destructive',
      });
    }
  };

  const resetZoneForm = () => {
    setZoneFormData({
      name: '',
      coverage: 'full',
      time: '',
      fee: '',
      minOrder: '',
      icon: 'Building2',
      riders: '',
      status: 'active'
    });
    setCoordinates([{ lat: 0, lng: 0, radius: 5 }]);
  };

  const resetSlotForm = () => {
    setSlotFormData({
      time: '',
      available: 'true',
      price: '',
      estimated: '',
      icon: 'Zap',
      maxOrders: '',
      currentOrders: '0',
      status: 'active'
    });
  };

  const addCoordinate = () => {
    setCoordinates([...coordinates, { lat: 0, lng: 0, radius: 5 }]);
  };

  const removeCoordinate = (index: number) => {
    if (coordinates.length > 1) {
      setCoordinates(coordinates.filter((_, i) => i !== index));
    }
  };

  const updateCoordinate = (index: number, field: 'lat' | 'lng' | 'radius', value: number) => {
    const newCoordinates = [...coordinates];
    newCoordinates[index][field] = value;
    setCoordinates(newCoordinates);
  };

  const getCoverageBadge = (coverage: string) => {
    switch(coverage) {
      case 'full':
        return <Badge className="bg-green-500 text-white">Full Coverage</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500 text-white">Partial Coverage</Badge>;
      case 'coming':
        return <Badge variant="outline" className="text-blue-500 border-blue-200">Coming Soon</Badge>;
      default:
        return <Badge variant="outline">{coverage}</Badge>;
    }
  };

  const getAvailabilityBadge = (available: boolean) => {
    return available 
      ? <Badge className="bg-green-500 text-white">Available</Badge>
      : <Badge variant="outline" className="text-gray-500">Unavailable</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCoverage = selectedCoverage === 'all' || zone.coverage === selectedCoverage;
    const matchesStatus = selectedStatus === 'all' || zone.status === selectedStatus;
    return matchesSearch && matchesCoverage && matchesStatus;
  });

  const filteredSlots = slots.filter(slot => {
    const matchesSearch = slot.time.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || slot.status === selectedStatus;
    return matchesSearch && matchesStatus;
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
            <h1 className="text-3xl font-display font-bold">Express Delivery</h1>
            <p className="text-muted-foreground mt-1">
              Manage delivery zones and time slots
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Zones</p>
              <p className="text-xl font-bold">{zones.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Zones</p>
              <p className="text-xl font-bold">{zones.filter(z => z.status === 'active').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Bike className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Riders</p>
              <p className="text-xl font-bold">
                {zones.reduce((sum, z) => sum + (z.riders || 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Timer className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Slots</p>
              <p className="text-xl font-bold">{slots.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Express Orders</p>
              <p className="text-xl font-bold">156</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
          <TabsTrigger value="slots">Time Slots</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search zones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={selectedCoverage} onValueChange={setSelectedCoverage}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coverage</SelectItem>
                    {coverageOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Zones Table */}
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-end">
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  onClick={() => {
                    setEditingZone(null);
                    resetZoneForm();
                    setShowZoneForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Delivery Zone
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Delivery Time</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Active Riders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredZones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No delivery zones found</p>
                        <p className="text-sm text-muted-foreground">
                          Add a new delivery zone
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredZones.map((zone) => (
                      <TableRow key={zone.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                              {zone.icon === 'Building2' && <Building2 className="w-5 h-5 text-blue-600" />}
                              {zone.icon === 'Home' && <Home className="w-5 h-5 text-blue-600" />}
                              {zone.icon === 'MapPin' && <MapPin className="w-5 h-5 text-blue-600" />}
                            </div>
                            <div>
                              <p className="font-medium">{zone.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getCoverageBadge(zone.coverage)}</TableCell>
                        <TableCell>{zone.time}</TableCell>
                        <TableCell>
                          {zone.fee === 0 ? (
                            <Badge className="bg-green-500 text-white">Free</Badge>
                          ) : (
                            `MK ${zone.fee.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell>MK {zone.minOrder.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bike className="w-4 h-4 text-muted-foreground" />
                            <span>{zone.riders}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(zone.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditZone(zone)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {}}>
                                <Users className="w-4 h-4 mr-2" />
                                View Riders
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteZone(zone.id)}
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
        </TabsContent>

        <TabsContent value="slots" className="space-y-4">
          {/* Slots Table */}
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-end">
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  onClick={() => {
                    setEditingSlot(null);
                    resetSlotForm();
                    setShowSlotForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Time Slot
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Est. Time</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No time slots found</p>
                        <p className="text-sm text-muted-foreground">
                          Add a new time slot
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSlots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                              {slot.icon === 'Zap' && <Zap className="w-5 h-5 text-orange-600" />}
                              {slot.icon === 'Timer' && <Timer className="w-5 h-5 text-orange-600" />}
                              {slot.icon === 'Clock' && <Clock className="w-5 h-5 text-orange-600" />}
                            </div>
                            <div>
                              <p className="font-medium">{slot.time}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getAvailabilityBadge(slot.available)}</TableCell>
                        <TableCell>
                          {slot.price === 0 ? (
                            <Badge className="bg-green-500 text-white">Free</Badge>
                          ) : (
                            `MK ${slot.price.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell>{slot.estimated}</TableCell>
                        <TableCell>
                          {slot.maxOrders ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Progress value={(slot.currentOrders || 0) / slot.maxOrders * 100} className="h-2 w-20" />
                                <span className="text-xs font-medium">{slot.currentOrders}/{slot.maxOrders}</span>
                              </div>
                            </div>
                          ) : (
                            'Unlimited'
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(slot.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditSlot(slot)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {}}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Orders
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteSlot(slot.id)}
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
        </TabsContent>
      </Tabs>

      {/* Add/Edit Zone Form Modal */}
      {showZoneForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitZone}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">
                  {editingZone ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowZoneForm(false);
                    setEditingZone(null);
                    resetZoneForm();
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="zoneName">Zone Name *</Label>
                      <Input
                        id="zoneName"
                        value={zoneFormData.name}
                        onChange={(e) => setZoneFormData({...zoneFormData, name: e.target.value})}
                        placeholder="e.g., Lilongwe City Centre"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="coverage">Coverage Type *</Label>
                      <Select 
                        value={zoneFormData.coverage} 
                        onValueChange={(value) => setZoneFormData({...zoneFormData, coverage: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select coverage" />
                        </SelectTrigger>
                        <SelectContent>
                          {coverageOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="time">Delivery Time *</Label>
                      <Input
                        id="time"
                        value={zoneFormData.time}
                        onChange={(e) => setZoneFormData({...zoneFormData, time: e.target.value})}
                        placeholder="e.g., 30-45 min"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fee">Delivery Fee (MK)</Label>
                        <Input
                          id="fee"
                          type="number"
                          value={zoneFormData.fee}
                          onChange={(e) => setZoneFormData({...zoneFormData, fee: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minOrder">Min Order (MK)</Label>
                        <Input
                          id="minOrder"
                          type="number"
                          value={zoneFormData.minOrder}
                          onChange={(e) => setZoneFormData({...zoneFormData, minOrder: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="riders">Number of Riders</Label>
                        <Input
                          id="riders"
                          type="number"
                          value={zoneFormData.riders}
                          onChange={(e) => setZoneFormData({...zoneFormData, riders: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zoneIcon">Icon</Label>
                        <Select 
                          value={zoneFormData.icon} 
                          onValueChange={(value) => setZoneFormData({...zoneFormData, icon: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map(option => (
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
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Select 
                        value={zoneFormData.status} 
                        onValueChange={(value) => setZoneFormData({...zoneFormData, status: value})}
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

                  {/* Right Column - Coordinates */}
                  <div className="space-y-4">
                    <Label>Service Area Coordinates</Label>
                    <div className="space-y-3">
                      {coordinates.map((coord, index) => (
                        <Card key={index}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Area {index + 1}</h4>
                              {coordinates.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCoordinate(index)}
                                >
                                  <MinusCircle className="w-4 h-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs">Latitude</Label>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  value={coord.lat}
                                  onChange={(e) => updateCoordinate(index, 'lat', parseFloat(e.target.value))}
                                  placeholder="-13.9626"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Longitude</Label>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  value={coord.lng}
                                  onChange={(e) => updateCoordinate(index, 'lng', parseFloat(e.target.value))}
                                  placeholder="33.7741"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Radius (km)</Label>
                                <Input
                                  type="number"
                                  step="0.5"
                                  value={coord.radius}
                                  onChange={(e) => updateCoordinate(index, 'radius', parseFloat(e.target.value))}
                                  placeholder="5"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCoordinate}
                        className="w-full"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Service Area
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowZoneForm(false);
                    setEditingZone(null);
                    resetZoneForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Slot Form Modal */}
      {showSlotForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitSlot}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">
                  {editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowSlotForm(false);
                    setEditingSlot(null);
                    resetSlotForm();
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="slotTime">Time Description *</Label>
                  <Input
                    id="slotTime"
                    value={slotFormData.time}
                    onChange={(e) => setSlotFormData({...slotFormData, time: e.target.value})}
                    placeholder="e.g., Within 30 minutes"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimated">Estimated Time *</Label>
                    <Input
                      id="estimated"
                      value={slotFormData.estimated}
                      onChange={(e) => setSlotFormData({...slotFormData, estimated: e.target.value})}
                      placeholder="e.g., 30 min"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slotPrice">Price (MK)</Label>
                    <Input
                      id="slotPrice"
                      type="number"
                      value={slotFormData.price}
                      onChange={(e) => setSlotFormData({...slotFormData, price: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="available">Availability</Label>
                    <Select 
                      value={slotFormData.available} 
                      onValueChange={(value) => setSlotFormData({...slotFormData, available: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Available</SelectItem>
                        <SelectItem value="false">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="slotIcon">Icon</Label>
                    <Select 
                      value={slotFormData.icon} 
                      onValueChange={(value) => setSlotFormData({...slotFormData, icon: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {slotIconOptions.map(option => (
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxOrders">Max Orders</Label>
                    <Input
                      id="maxOrders"
                      type="number"
                      value={slotFormData.maxOrders}
                      onChange={(e) => setSlotFormData({...slotFormData, maxOrders: e.target.value})}
                      placeholder="Unlimited if empty"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentOrders">Current Orders</Label>
                    <Input
                      id="currentOrders"
                      type="number"
                      value={slotFormData.currentOrders}
                      onChange={(e) => setSlotFormData({...slotFormData, currentOrders: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select 
                    value={slotFormData.status} 
                    onValueChange={(value) => setSlotFormData({...slotFormData, status: value})}
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

              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSlotForm(false);
                    setEditingSlot(null);
                    resetSlotForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {editingSlot ? 'Update Slot' : 'Create Slot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this delivery zone? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteZone} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteSlotDialogOpen} onOpenChange={setDeleteSlotDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time slot? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSlot} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpressDelivery;