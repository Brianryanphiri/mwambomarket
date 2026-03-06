import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Truck,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
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
  ChevronRight,
  Users,
  Route,
  Navigation,
  Map,
  ListTodo,
  Grid,
  CalendarDays,
  CalendarRange,
  ListChecks,
  ListFilter,
  ListOrdered,
  ListX,
  ListRestart,
  ListEnd,
  ListStart,
  ListTree,
  ListVideo,
  ListMusic,
  Kanban,
  KanbanSquare,
  KanbanSquareDashed,
  LayoutList,
  LayoutGrid,
  LayoutPanelLeft,
  LayoutPanelTop,
  LayoutPanelBottom,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelTopClose,
  PanelTopOpen,
  PanelBottomClose,
  PanelBottomOpen,
  Settings2,
  Settings3,
  Sliders,
  SlidersHorizontal,
  SlidersVertical,
  ToggleLeft,
  ToggleRight,
  ToggleLeft as ToggleOff,
  ToggleRight as ToggleOn,
  SwitchCamera,
  BellRing,
  BellDot,
  BellOff,
  BellPlus,
  BellMinus,
  BellElectric,
  MailOpen,
  MailPlus,
  MailMinus,
  MailQuestion,
  MailSearch,
  MailWarning,
  MailX,
  MailCheck,
  Mailbox,
  Inbox,
  Archive,
  ArchiveX,
  ArchiveRestore,
  Trash,
  Trash2 as TrashIcon,
  TrashX,
  TrashRestore,
  TrashArchive,
  Ban,
  Ban as BanIcon,
  BanX,
  BanCheck,
  BanMinus,
  BanPlus,
  BanAlert,
  CircleAlert as AlertCircleIcon,
  TriangleAlert as AlertTriangleIcon,
  OctagonAlert as AlertOctagonIcon,
  HexagonAlert as AlertHexagonIcon,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  ShieldBan,
  ShieldHalf,
  ShieldOff,
  ShieldQuestion,
  ShieldPlus,
  ShieldMinus,
  LockKeyhole,
  LockKeyholeOpen,
  LockKeyholeMinus,
  LockKeyholePlus,
  LockKeyholeX,
  UnlockKeyhole,
  KeyRound,
  KeySquare,
  KeyRound as KeyIcon,
  KeySquare as KeySquareIcon,
  Fingerprint as FingerprintIcon,
  ScanFace,
  ScanLine,
  ScanText,
  ScanSearch,
  ScanBarcode,
  ScanQrCode,
  ScanEye,
  QrCode,
  Barcode
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance, addDays, subDays, isToday, isTomorrow, isThisWeek, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface Delivery {
  id: string;
  deliveryNumber: string;
  subscriptionId: string;
  subscriptionNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerArea: string;
  planName: string;
  planPrice: number;
  scheduledDate: string;
  scheduledTime?: string;
  actualDeliveryDate?: string;
  actualDeliveryTime?: string;
  status: 'scheduled' | 'processing' | 'out_for_delivery' | 'delivered' | 'failed' | 'skipped' | 'rescheduled';
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  trackingNumber?: string;
  deliveryNotes?: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  items: Array<{ name: string; quantity: number }>;
  priority: 'normal' | 'high' | 'urgent';
  estimatedTime?: string;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

interface Rider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
  activeDeliveries: number;
  completedDeliveries: number;
  rating: number;
  currentLocation?: string;
  vehicleType: 'bike' | 'car' | 'van';
  vehiclePlate?: string;
  area: string[];
  joinedAt: string;
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
  averageDeliveryTime: string;
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

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const viewOptions = [
  { value: 'list', label: 'List View', icon: ListTodo },
  { value: 'calendar', label: 'Calendar', icon: CalendarDays },
  { value: 'kanban', label: 'Kanban', icon: Kanban },
  { value: 'map', label: 'Map View', icon: Map },
];

const DeliverySchedule = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedRider, setSelectedRider] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban' | 'map'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showRiderDialog, setShowRiderDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedRiderDetail, setSelectedRiderDetail] = useState<Rider | null>(null);
  
  const [assignForm, setAssignForm] = useState({
    riderId: '',
    trackingNumber: '',
    estimatedTime: ''
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
    averageDeliveryTime: '45 min'
  });

  const [areas, setAreas] = useState<string[]>([]);
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
          customerAddress: 'Area 123, Lilongwe, Near the market',
          customerArea: 'Area 123',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          scheduledDate: '2026-03-04',
          scheduledTime: '10:00 - 12:00',
          status: 'scheduled',
          amount: 15000,
          paymentStatus: 'pending',
          paymentMethod: 'airtel_money',
          items: [{ name: 'Weekly Veggie Box', quantity: 1 }],
          priority: 'normal',
          estimatedTime: '45 min',
          distance: 5.2,
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
          customerArea: 'Area 25',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          scheduledDate: '2026-03-03',
          scheduledTime: '08:00 - 10:00',
          status: 'processing',
          riderId: '1',
          riderName: 'James Banda',
          riderPhone: '+265991234568',
          trackingNumber: 'TRK123456',
          amount: 9000,
          paymentStatus: 'pending',
          paymentMethod: 'cash',
          items: [{ name: 'Daily Bread Club', quantity: 1 }],
          priority: 'normal',
          estimatedTime: '30 min',
          distance: 3.1,
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
          customerArea: 'Area 47',
          planName: 'Dairy Delight',
          planPrice: 25000,
          scheduledDate: '2026-02-27',
          scheduledTime: '14:00 - 16:00',
          actualDeliveryDate: '2026-02-27',
          actualDeliveryTime: '14:30',
          status: 'delivered',
          riderId: '2',
          riderName: 'Peter Mwale',
          riderPhone: '+265994567890',
          trackingNumber: 'TRK123457',
          amount: 25000,
          paymentStatus: 'paid',
          paymentMethod: 'tnm_mpamba',
          items: [{ name: 'Dairy Delight', quantity: 1 }],
          priority: 'high',
          estimatedTime: '35 min',
          distance: 4.5,
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
          customerArea: 'Area 18',
          planName: 'Family Essentials',
          planPrice: 65000,
          scheduledDate: '2026-02-29',
          scheduledTime: '09:00 - 11:00',
          status: 'rescheduled',
          amount: 65000,
          paymentStatus: 'pending',
          paymentMethod: 'card',
          items: [{ name: 'Family Essentials', quantity: 1 }],
          priority: 'high',
          estimatedTime: '60 min',
          distance: 7.8,
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
          customerArea: 'Area 33',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          scheduledDate: '2026-02-25',
          scheduledTime: '11:00 - 13:00',
          actualDeliveryDate: '2026-02-25',
          actualDeliveryTime: '12:15',
          status: 'delivered',
          riderId: '1',
          riderName: 'James Banda',
          riderPhone: '+265991234568',
          trackingNumber: 'TRK123458',
          amount: 15000,
          paymentStatus: 'paid',
          paymentMethod: 'airtel_money',
          items: [{ name: 'Weekly Veggie Box', quantity: 1 }],
          priority: 'normal',
          estimatedTime: '40 min',
          distance: 4.2,
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
          customerArea: 'Area 12',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          scheduledDate: '2026-03-02',
          scheduledTime: '07:00 - 09:00',
          status: 'out_for_delivery',
          riderId: '2',
          riderName: 'Peter Mwale',
          riderPhone: '+265994567890',
          trackingNumber: 'TRK123459',
          amount: 9000,
          paymentStatus: 'pending',
          paymentMethod: 'cash',
          items: [{ name: 'Daily Bread Club', quantity: 1 }],
          priority: 'urgent',
          estimatedTime: '25 min',
          distance: 2.8,
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
          customerArea: 'Area 29',
          planName: 'Dairy Delight',
          planPrice: 25000,
          scheduledDate: '2026-02-22',
          scheduledTime: '15:00 - 17:00',
          status: 'failed',
          amount: 25000,
          paymentStatus: 'refunded',
          paymentMethod: 'tnm_mpamba',
          items: [{ name: 'Dairy Delight', quantity: 1 }],
          priority: 'normal',
          estimatedTime: '35 min',
          distance: 5.1,
          createdAt: '2026-02-15T12:45:00Z',
          updatedAt: '2026-02-22T17:30:00Z'
        },
        {
          id: '8',
          deliveryNumber: 'DEL-202603-008',
          subscriptionId: '8',
          subscriptionNumber: 'SUB-202602-0008',
          customerName: 'Chisomo Banda',
          customerPhone: '+265998901234',
          customerAddress: 'Area 49, Lilongwe',
          customerArea: 'Area 49',
          planName: 'Family Essentials',
          planPrice: 65000,
          scheduledDate: '2026-03-05',
          scheduledTime: '10:00 - 12:00',
          status: 'scheduled',
          amount: 65000,
          paymentStatus: 'pending',
          paymentMethod: 'airtel_money',
          items: [{ name: 'Family Essentials', quantity: 1 }],
          priority: 'high',
          estimatedTime: '55 min',
          distance: 8.2,
          createdAt: '2026-02-26T09:30:00Z',
          updatedAt: '2026-02-26T09:30:00Z'
        },
        {
          id: '9',
          deliveryNumber: 'DEL-202603-009',
          subscriptionId: '9',
          subscriptionNumber: 'SUB-202602-0009',
          customerName: 'Tiwonge Phiri',
          customerPhone: '+265999012345',
          customerAddress: 'Area 15, Lilongwe',
          customerArea: 'Area 15',
          planName: 'Weekly Veggie Box',
          planPrice: 15000,
          scheduledDate: '2026-03-06',
          scheduledTime: '09:00 - 11:00',
          status: 'scheduled',
          amount: 15000,
          paymentStatus: 'paid',
          paymentMethod: 'tnm_mpamba',
          items: [{ name: 'Weekly Veggie Box', quantity: 1 }],
          priority: 'normal',
          estimatedTime: '30 min',
          distance: 3.5,
          createdAt: '2026-02-26T10:15:00Z',
          updatedAt: '2026-02-26T10:15:00Z'
        },
        {
          id: '10',
          deliveryNumber: 'DEL-202602-010',
          subscriptionId: '10',
          subscriptionNumber: 'SUB-202602-0010',
          customerName: 'Kondwani Mwale',
          customerPhone: '+265990123456',
          customerAddress: 'Area 37, Lilongwe',
          customerArea: 'Area 37',
          planName: 'Daily Bread Club',
          planPrice: 9000,
          scheduledDate: '2026-02-28',
          scheduledTime: '08:00 - 10:00',
          status: 'skipped',
          amount: 9000,
          paymentStatus: 'refunded',
          paymentMethod: 'cash',
          items: [{ name: 'Daily Bread Club', quantity: 1 }],
          priority: 'normal',
          estimatedTime: '25 min',
          distance: 3.2,
          createdAt: '2026-02-20T14:45:00Z',
          updatedAt: '2026-02-27T11:30:00Z'
        }
      ];
      
      setDeliveries(mockDeliveries);
      
      // Extract unique areas
      const uniqueAreas = [...new Set(mockDeliveries.map(d => d.customerArea))];
      setAreas(uniqueAreas);
      
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
      const mockRiders: Rider[] = [
        {
          id: '1',
          name: 'James Banda',
          phone: '+265991234568',
          email: 'james.banda@example.com',
          status: 'available',
          activeDeliveries: 2,
          completedDeliveries: 156,
          rating: 4.8,
          currentLocation: 'Area 25',
          vehicleType: 'bike',
          vehiclePlate: 'BL 1234',
          area: ['Area 25', 'Area 123', 'Area 33'],
          joinedAt: '2025-01-15'
        },
        {
          id: '2',
          name: 'Peter Mwale',
          phone: '+265994567890',
          email: 'peter.mwale@example.com',
          status: 'busy',
          activeDeliveries: 3,
          completedDeliveries: 234,
          rating: 4.9,
          currentLocation: 'Area 47',
          vehicleType: 'car',
          vehiclePlate: 'BL 5678',
          area: ['Area 47', 'Area 12', 'Area 29'],
          joinedAt: '2024-11-20'
        },
        {
          id: '3',
          name: 'Mary Chimwala',
          phone: '+265993456789',
          email: 'mary.chimwala@example.com',
          status: 'available',
          activeDeliveries: 1,
          completedDeliveries: 89,
          rating: 4.7,
          currentLocation: 'Area 18',
          vehicleType: 'bike',
          vehiclePlate: 'BL 9012',
          area: ['Area 18', 'Area 49', 'Area 15'],
          joinedAt: '2025-02-01'
        },
        {
          id: '4',
          name: 'John Phiri',
          phone: '+265992345678',
          email: 'john.phiri@example.com',
          status: 'offline',
          activeDeliveries: 0,
          completedDeliveries: 312,
          rating: 4.6,
          currentLocation: 'Area 37',
          vehicleType: 'van',
          vehiclePlate: 'BL 3456',
          area: ['Area 37', 'Area 29', 'Area 123'],
          joinedAt: '2024-09-10'
        }
      ];
      
      setRiders(mockRiders);
    } catch (error) {
      console.error('Error fetching riders:', error);
    }
  };

  const calculateStats = (data: Delivery[]) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = addDays(new Date(), 1).toISOString().split('T')[0];
    const weekStart = startOfWeek(new Date()).toISOString().split('T')[0];
    const weekEnd = endOfWeek(new Date()).toISOString().split('T')[0];
    
    const delivered = data.filter(d => d.status === 'delivered');
    const onTime = delivered.filter(d => d.actualDeliveryDate?.split('T')[0] === d.scheduledDate);
    
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
      weekDeliveries: data.filter(d => d.scheduledDate >= weekStart && d.scheduledDate <= weekEnd).length,
      completionRate: data.length > 0 ? (delivered.length / data.length) * 100 : 0,
      onTimeRate: delivered.length > 0 ? (onTime.length / delivered.length) * 100 : 0,
      averageDeliveryTime: '45 min'
    });
  };

  const handleViewDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDialog(true);
  };

  const handleAssignRider = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setAssignForm({
      riderId: delivery.riderId || '',
      trackingNumber: delivery.trackingNumber || '',
      estimatedTime: delivery.estimatedTime || ''
    });
    setShowAssignDialog(true);
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

  const handleViewRider = (rider: Rider) => {
    setSelectedRiderDetail(rider);
    setShowRiderDialog(true);
  };

  const handleAssignSubmit = () => {
    if (!selectedDelivery) return;
    
    const rider = riders.find(r => r.id === assignForm.riderId);
    
    try {
      setDeliveries(prev => prev.map(d => 
        d.id === selectedDelivery.id 
          ? { 
              ...d, 
              riderId: assignForm.riderId,
              riderName: rider?.name,
              riderPhone: rider?.phone,
              trackingNumber: assignForm.trackingNumber,
              estimatedTime: assignForm.estimatedTime,
              status: 'processing'
            }
          : d
      ));
      
      setShowAssignDialog(false);
      toast({
        title: 'Rider Assigned',
        description: `Delivery assigned to ${rider?.name}`,
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

  const handleUpdateStatus = (deliveryId: string, newStatus: Delivery['status']) => {
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

  const handleOptimizeRoute = () => {
    setShowRouteDialog(true);
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

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  const getRiderStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerPhone.includes(searchTerm) ||
      delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerArea.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || delivery.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || delivery.priority === selectedPriority;
    const matchesRider = selectedRider === 'all' || delivery.riderId === selectedRider;
    const matchesArea = selectedArea === 'all' || delivery.customerArea === selectedArea;
    
    let matchesDate = true;
    if (selectedDate === 'today') {
      matchesDate = delivery.scheduledDate === new Date().toISOString().split('T')[0];
    } else if (selectedDate === 'tomorrow') {
      matchesDate = delivery.scheduledDate === addDays(new Date(), 1).toISOString().split('T')[0];
    } else if (selectedDate === 'week') {
      const weekStart = startOfWeek(new Date()).toISOString().split('T')[0];
      const weekEnd = endOfWeek(new Date()).toISOString().split('T')[0];
      matchesDate = delivery.scheduledDate >= weekStart && delivery.scheduledDate <= weekEnd;
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesRider && matchesArea && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  // Calendar view data
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate)
  });

  const getDeliveriesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return deliveries.filter(d => d.scheduledDate === dateStr);
  };

  // Kanban view columns
  const kanbanColumns = [
    { id: 'scheduled', title: 'Scheduled', icon: Calendar, color: 'blue' },
    { id: 'processing', title: 'Processing', icon: Settings2, color: 'purple' },
    { id: 'out_for_delivery', title: 'Out for Delivery', icon: Truck, color: 'orange' },
    { id: 'delivered', title: 'Delivered', icon: CheckCircle, color: 'green' },
  ];

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
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              {viewOptions.map(option => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchDeliveries}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => setShowDeliveryDialog(true)}
          >
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
                  placeholder="Search by customer, area, delivery #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {viewMode === 'list' && (
                <Button variant="outline" onClick={handleOptimizeRoute}>
                  <Route className="w-4 h-4 mr-2" />
                  Optimize Route
                </Button>
              )}
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

              <Select value={selectedRider} onValueChange={setSelectedRider}>
                <SelectTrigger className="w-[140px]">
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

              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Delivery Date" />
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
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                  setSelectedRider('all');
                  setSelectedArea('all');
                  setSelectedDate('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Content */}
      {viewMode === 'list' && (
        <>
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
                    <TableHead>Area</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
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
                          Try adjusting your filters
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
                          <Badge variant="outline">{delivery.customerArea}</Badge>
                        </TableCell>
                        <TableCell onClick={() => handleViewDelivery(delivery)}>
                          <div>
                            <p className="font-medium">{format(new Date(delivery.scheduledDate), 'MMM d')}</p>
                            <p className="text-xs text-muted-foreground">{delivery.scheduledTime || 'Anytime'}</p>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleViewDelivery(delivery)}>
                          <Badge className={`${getStatusColor(delivery.status)} text-white`}>
                            {delivery.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={() => handleViewDelivery(delivery)}>
                          <Badge className={`${getPriorityColor(delivery.priority)} text-white`}>
                            {delivery.priority}
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
                          MK {delivery.amount.toLocaleString()}
                        </TableCell>
                        <TableCell onClick={() => handleViewDelivery(delivery)}>
                          <Badge variant="outline" className={
                            delivery.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }>
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
        </>
      )}

      {viewMode === 'calendar' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subDays(currentDate, 7))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addDays(currentDate, 7))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium py-2">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((day, index) => {
                const dayDeliveries = getDeliveriesForDay(day);
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <Card key={index} className={`min-h-[120px] ${isToday ? 'border-2 border-primary' : ''}`}>
                    <CardContent className="p-2">
                      <p className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </p>
                      <div className="space-y-1">
                        {dayDeliveries.slice(0, 3).map(delivery => (
                          <div
                            key={delivery.id}
                            className="text-xs p-1 rounded bg-muted/50 truncate cursor-pointer hover:bg-muted"
                            onClick={() => handleViewDelivery(delivery)}
                          >
                            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getStatusColor(delivery.status)}`} />
                            {delivery.customerName}
                          </div>
                        ))}
                        {dayDeliveries.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{dayDeliveries.length - 3} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-4 gap-4">
          {kanbanColumns.map(column => {
            const columnDeliveries = filteredDeliveries.filter(d => d.status === column.id);
            const Icon = column.icon;
            
            return (
              <Card key={column.id}>
                <CardHeader className={`bg-${column.color}-50 dark:bg-${column.color}-950/30 pb-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${column.color}-600`} />
                      <CardTitle className="text-sm">{column.title}</CardTitle>
                    </div>
                    <Badge variant="outline">{columnDeliveries.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                  {columnDeliveries.map(delivery => (
                    <Card key={delivery.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3" onClick={() => handleViewDelivery(delivery)}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs">{delivery.deliveryNumber}</span>
                          <Badge className={`${getPriorityColor(delivery.priority)} text-white text-xs`}>
                            {delivery.priority}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm mb-1">{delivery.customerName}</p>
                        <p className="text-xs text-muted-foreground mb-2">{delivery.customerArea}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>{format(new Date(delivery.scheduledDate), 'MMM d')}</span>
                          <span>MK {delivery.amount.toLocaleString()}</span>
                        </div>
                        {delivery.riderName && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{delivery.riderName}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === 'map' && (
        <Card>
          <CardContent className="p-6 text-center">
            <Map className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Map View</h3>
            <p className="text-muted-foreground mb-4">
              Interactive map view for delivery route optimization
            </p>
            <Button onClick={handleOptimizeRoute}>
              <Route className="w-4 h-4 mr-2" />
              Open Route Optimizer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delivery Details Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
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
                    {selectedDelivery.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge className={`${getPriorityColor(selectedDelivery.priority)} text-white mt-1`}>
                    {selectedDelivery.priority}
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
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <Badge variant="outline">{selectedDelivery.customerArea}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription</p>
                    <p className="font-medium font-mono text-sm">{selectedDelivery.subscriptionNumber}</p>
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
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-medium">{selectedDelivery.distance} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Time</p>
                    <p className="font-medium">{selectedDelivery.estimatedTime}</p>
                  </div>
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

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDelivery.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">MK {selectedDelivery.planPrice.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="text-right font-medium">Total</TableCell>
                      <TableCell className="text-right font-bold">MK {selectedDelivery.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{selectedDelivery.paymentMethod.replace('_', ' ')}</p>
                </div>
                <Badge variant="outline" className={
                  selectedDelivery.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }>
                  {selectedDelivery.paymentStatus}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>
              Close
            </Button>
            {selectedDelivery && (
              <>
                <Button variant="outline" onClick={() => handleAssignRider(selectedDelivery)}>
                  <User className="w-4 h-4 mr-2" />
                  Assign Rider
                </Button>
                <Button onClick={() => handleReschedule(selectedDelivery)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Rider Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
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
                value={assignForm.riderId} 
                onValueChange={(value) => setAssignForm({...assignForm, riderId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a rider" />
                </SelectTrigger>
                <SelectContent>
                  {riders.map(rider => (
                    <SelectItem key={rider.id} value={rider.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{rider.name}</span>
                        <Badge className={`${getRiderStatusColor(rider.status)} text-white ml-2 text-xs`}>
                          {rider.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                value={assignForm.trackingNumber}
                onChange={(e) => setAssignForm({...assignForm, trackingNumber: e.target.value})}
                placeholder="e.g., TRK123456"
              />
            </div>

            <div className="space-y-2">
              <Label>Estimated Delivery Time</Label>
              <Input
                value={assignForm.estimatedTime}
                onChange={(e) => setAssignForm({...assignForm, estimatedTime: e.target.value})}
                placeholder="e.g., 45 min"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit}>
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

      {/* Rider Details Dialog */}
      <Dialog open={showRiderDialog} onOpenChange={setShowRiderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rider Details</DialogTitle>
            <DialogDescription>
              {selectedRiderDetail && `Information for ${selectedRiderDetail.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRiderDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-lg">
                    {selectedRiderDetail.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedRiderDetail.name}</h3>
                  <Badge className={`${getRiderStatusColor(selectedRiderDetail.status)} text-white mt-1`}>
                    {selectedRiderDetail.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedRiderDetail.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRiderDetail.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-medium capitalize">{selectedRiderDetail.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plate Number</p>
                  <p className="font-medium">{selectedRiderDetail.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{selectedRiderDetail.rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{format(new Date(selectedRiderDetail.joinedAt), 'MMM yyyy')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Coverage Areas</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRiderDetail.area.map((area, index) => (
                    <Badge key={index} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedRiderDetail.activeDeliveries}</p>
                    <p className="text-xs text-muted-foreground">Active Deliveries</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedRiderDetail.completedDeliveries}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRiderDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowRiderDialog(false);
              // Navigate to rider management
            }}>
              View All Deliveries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Route Optimizer Dialog */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Route Optimizer</DialogTitle>
            <DialogDescription>
              Optimize delivery routes for maximum efficiency
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Deliveries</p>
                  <p className="text-2xl font-bold">{filteredDeliveries.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Available Riders</p>
                  <p className="text-2xl font-bold">{riders.filter(r => r.status === 'available').length}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Label>Optimization Strategy</Label>
              <Select defaultValue="distance">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Shortest Distance</SelectItem>
                  <SelectItem value="time">Fastest Time</SelectItem>
                  <SelectItem value="balanced">Balanced (Distance + Time)</SelectItem>
                  <SelectItem value="priority">Priority Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Window</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deliveries</SelectItem>
                  <SelectItem value="today">Today Only</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow Only</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Optimization Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Estimated distance saved</span>
                  <span className="font-medium text-green-600">~45 km</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated time saved</span>
                  <span className="font-medium text-green-600">~2.5 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Riders needed</span>
                  <span className="font-medium">4</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRouteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowRouteDialog(false);
              toast({
                title: 'Route Optimized',
                description: 'Delivery routes have been optimized successfully',
              });
            }}>
              Optimize Routes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliverySchedule;