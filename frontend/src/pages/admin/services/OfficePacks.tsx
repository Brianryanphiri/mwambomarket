import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase,
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
  Building,
  Building2,
  UserPlus,
  Users2,
  Crown,
  Award,
  Percent,
  Save,
  ArrowLeft,
  X,
  Calendar,
  Coffee,
  Printer,
  FileText,
  Pen,
  Folder,
  ShoppingBag,
  Briefcase as BriefcaseIcon
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
import type { OfficePack } from '@/types/service.types';

// Mock data for development
const mockOfficePacks: OfficePack[] = [
  {
    id: '1',
    serviceId: 'office-1',
    name: 'Startup Essentials',
    description: 'Perfect for small teams and startups',
    price: 45000,
    originalPrice: 55000,
    interval: 'one-time',
    size: 'small',
    teamSize: '1-5 people',
    items: 25,
    popularity: 95,
    savings: 10000,
    discount: 18,
    features: [
      'Free delivery',
      '30-day guarantee',
      'Bulk pricing',
      'Reorder anytime',
      'Business receipt'
    ],
    includes: [
      'Coffee & tea (50 packs)',
      'Sugar & creamer',
      'Printer paper (5 reams)',
      'Pens (2 dozen)',
      'Notebooks (10)',
      'Paper clips',
      'Stapler & staples',
      'Sticky notes'
    ],
    image: '🚀',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: 'Rocket',
    recommended: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    serviceId: 'office-1',
    name: 'Growth Pack',
    description: 'For growing teams and departments',
    price: 95000,
    originalPrice: 115000,
    interval: 'monthly',
    size: 'medium',
    teamSize: '6-15 people',
    items: 45,
    popularity: 88,
    savings: 20000,
    discount: 17,
    features: [
      'Free delivery',
      'Monthly restock',
      'Flexible schedule',
      'Dedicated support',
      'Expense tracking'
    ],
    includes: [
      'Coffee & tea (100 packs)',
      'Sugar & creamer',
      'Printer paper (10 reams)',
      'Pens (4 dozen)',
      'Notebooks (20)',
      'Binders (10)',
      'File folders (50)',
      'Whiteboard markers',
      'Desk organizers',
      'Hand sanitizer'
    ],
    image: '📈',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: 'TrendingUp',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    serviceId: 'office-1',
    name: 'Enterprise Bundle',
    description: 'Complete office solution for large teams',
    price: 195000,
    originalPrice: 250000,
    interval: 'monthly',
    size: 'large',
    teamSize: '16-30 people',
    items: 75,
    popularity: 92,
    savings: 55000,
    discount: 22,
    features: [
      'Free delivery',
      'Weekly restock option',
      'Account manager',
      'Custom branding',
      'Priority support',
      'Inventory management'
    ],
    includes: [
      'Coffee & tea (200 packs)',
      'Sugar & creamer bulk',
      'Printer paper (20 reams)',
      'Pens (8 dozen)',
      'Notebooks (40)',
      'Professional binders',
      'File folders (100)',
      'Presentation materials',
      'Breakroom supplies',
      'Cleaning supplies',
      'First aid kit'
    ],
    image: '🏢',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: 'Building',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sizeOptions = [
  { value: 'small', label: 'Small (1-5 people)', icon: UserPlus },
  { value: 'medium', label: 'Medium (6-15 people)', icon: Users },
  { value: 'large', label: 'Large (16-30 people)', icon: Users2 },
  { value: 'enterprise', label: 'Enterprise (30+ people)', icon: Building }
];

const intervalOptions = [
  { value: 'one-time', label: 'One Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const iconOptions = [
  { value: 'Rocket', label: 'Rocket', icon: TrendingUp },
  { value: 'TrendingUp', label: 'Growth', icon: TrendingUp },
  { value: 'Building', label: 'Building', icon: Building },
  { value: 'Building2', label: 'Enterprise', icon: Building2 },
  { value: 'Users', label: 'Team', icon: Users },
  { value: 'Crown', label: 'Premium', icon: Crown },
  { value: 'Coffee', label: 'Breakroom', icon: Coffee },
  { value: 'Printer', label: 'Printing', icon: Printer }
];

const OfficePacks = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [packs, setPacks] = useState<OfficePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedInterval, setSelectedInterval] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPack, setEditingPack] = useState<OfficePack | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packToDelete, setPackToDelete] = useState<string | null>(null);
  const [features, setFeatures] = useState<string[]>(['']);
  const [includes, setIncludes] = useState<string[]>(['']);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    interval: 'one-time',
    size: 'small',
    teamSize: '',
    items: '',
    popularity: '90',
    savings: '',
    discount: '',
    image: '📦',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: 'Package',
    recommended: false,
    minQuantity: '',
    status: 'active'
  });

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const data = await serviceService.getOfficePacks('office-1');
      // setPacks(data);
      
      // Using mock data for now
      setTimeout(() => {
        setPacks(mockOfficePacks);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching office packs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load office packs',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleEdit = (pack: OfficePack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      description: pack.description,
      price: pack.price.toString(),
      originalPrice: pack.originalPrice?.toString() || '',
      interval: pack.interval,
      size: pack.size,
      teamSize: pack.teamSize,
      items: pack.items.toString(),
      popularity: pack.popularity.toString(),
      savings: pack.savings.toString(),
      discount: pack.discount?.toString() || '',
      image: pack.image,
      color: pack.color,
      bgColor: pack.bgColor,
      icon: pack.icon,
      recommended: pack.recommended || false,
      minQuantity: pack.minQuantity?.toString() || '',
      status: pack.status
    });
    setFeatures(pack.features);
    setIncludes(pack.includes);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setPackToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!packToDelete) return;
    
    try {
      // Replace with actual API call
      // await serviceService.deleteOfficePack('office-1', packToDelete);
      
      setPacks(prev => prev.filter(p => p.id !== packToDelete));
      toast({
        title: 'Success',
        description: 'Office pack deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting pack:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete pack',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPackToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const packData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        interval: formData.interval as 'one-time' | 'weekly' | 'monthly',
        size: formData.size as 'small' | 'medium' | 'large' | 'enterprise',
        teamSize: formData.teamSize,
        items: parseInt(formData.items),
        popularity: parseInt(formData.popularity),
        savings: parseFloat(formData.savings),
        discount: formData.discount ? parseInt(formData.discount) : undefined,
        features: features.filter(f => f.trim() !== ''),
        includes: includes.filter(i => i.trim() !== ''),
        image: formData.image,
        color: formData.color,
        bgColor: formData.bgColor,
        icon: formData.icon,
        recommended: formData.recommended,
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : undefined,
        status: formData.status as 'active' | 'inactive'
      };

      if (editingPack) {
        // Update
        setPacks(prev => prev.map(p => 
          p.id === editingPack.id 
            ? { ...p, ...packData, updatedAt: new Date().toISOString() }
            : p
        ));
        toast({
          title: 'Success',
          description: 'Office pack updated successfully',
        });
      } else {
        // Create
        const newPack: OfficePack = {
          id: Date.now().toString(),
          serviceId: 'office-1',
          ...packData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setPacks(prev => [newPack, ...prev]);
        toast({
          title: 'Success',
          description: 'Office pack created successfully',
        });
      }

      setShowForm(false);
      setEditingPack(null);
      resetForm();
    } catch (error) {
      console.error('Error saving pack:', error);
      toast({
        title: 'Error',
        description: 'Failed to save pack',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      interval: 'one-time',
      size: 'small',
      teamSize: '',
      items: '',
      popularity: '90',
      savings: '',
      discount: '',
      image: '📦',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: 'Package',
      recommended: false,
      minQuantity: '',
      status: 'active'
    });
    setFeatures(['']);
    setIncludes(['']);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addInclude = () => {
    setIncludes([...includes, '']);
  };

  const removeInclude = (index: number) => {
    if (includes.length > 1) {
      setIncludes(includes.filter((_, i) => i !== index));
    }
  };

  const updateInclude = (index: number, value: string) => {
    const newIncludes = [...includes];
    newIncludes[index] = value;
    setIncludes(newIncludes);
  };

  const handleDuplicate = async (pack: OfficePack) => {
    try {
      const { id, createdAt, updatedAt, ...packData } = pack;
      const newPack: OfficePack = {
        ...packData,
        id: Date.now().toString(),
        serviceId: 'office-1',
        name: `${pack.name} (Copy)`,
        popularity: pack.popularity - 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPacks(prev => [newPack, ...prev]);
      toast({
        title: 'Success',
        description: 'Office pack duplicated successfully',
      });
    } catch (error) {
      console.error('Error duplicating pack:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate pack',
        variant: 'destructive',
      });
    }
  };

  const getSizeIcon = (size: string) => {
    switch(size) {
      case 'small': return <UserPlus className="w-4 h-4" />;
      case 'medium': return <Users className="w-4 h-4" />;
      case 'large': return <Users2 className="w-4 h-4" />;
      case 'enterprise': return <Building className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getSizeBadge = (size: string, teamSize: string) => {
    const colors = {
      small: 'bg-blue-500',
      medium: 'bg-green-500',
      large: 'bg-purple-500',
      enterprise: 'bg-orange-500'
    };
    
    return (
      <Badge className={`${colors[size as keyof typeof colors]} text-white gap-1`}>
        {getSizeIcon(size)}
        <span className="capitalize">{size}</span>
        <span className="ml-1 text-xs opacity-90">({teamSize})</span>
      </Badge>
    );
  };

  const getIntervalBadge = (interval: string) => {
    switch(interval) {
      case 'one-time':
        return <Badge variant="outline">One Time</Badge>;
      case 'weekly':
        return <Badge className="bg-blue-500 text-white">Weekly</Badge>;
      case 'monthly':
        return <Badge className="bg-purple-500 text-white">Monthly</Badge>;
      default:
        return <Badge variant="outline">{interval}</Badge>;
    }
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

  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSize = selectedSize === 'all' || pack.size === selectedSize;
    const matchesInterval = selectedInterval === 'all' || pack.interval === selectedInterval;
    const matchesStatus = selectedStatus === 'all' || pack.status === selectedStatus;
    return matchesSearch && matchesSize && matchesInterval && matchesStatus;
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
            <h1 className="text-3xl font-display font-bold">Office Packs</h1>
            <p className="text-muted-foreground mt-1">
              Manage office supply packs for businesses
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPacks}>
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
              setEditingPack(null);
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pack
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Packs</p>
              <p className="text-xl font-bold">{packs.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enterprise</p>
              <p className="text-xl font-bold">{packs.filter(p => p.size === 'enterprise').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Popularity</p>
              <p className="text-xl font-bold">
                {Math.round(packs.reduce((sum, p) => sum + p.popularity, 0) / packs.length)}%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-xl font-bold">245</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Companies Served</p>
              <p className="text-xl font-bold">189</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search office packs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Team Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {sizeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedInterval} onValueChange={setSelectedInterval}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intervals</SelectItem>
                {intervalOptions.map(option => (
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

      {/* Packs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pack</TableHead>
                <TableHead>Team Size</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Popularity</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No office packs found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or add a new pack
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPacks.map((pack) => (
                  <TableRow key={pack.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${pack.bgColor} flex items-center justify-center text-2xl`}>
                          {pack.image}
                        </div>
                        <div>
                          <p className="font-medium">{pack.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{pack.description}</p>
                          {pack.recommended && (
                            <Badge className="mt-1 bg-yellow-500 text-white text-xs">Recommended</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getSizeBadge(pack.size, pack.teamSize)}</TableCell>
                    <TableCell>{getIntervalBadge(pack.interval)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">MK {pack.price.toLocaleString()}</p>
                        {pack.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            MK {pack.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pack.items} items</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Progress value={pack.popularity} className="h-2 w-20" />
                          <span className="text-xs font-medium">{pack.popularity}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 text-white">
                        Save {pack.discount || Math.round((pack.savings / pack.price) * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(pack.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(pack)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(pack)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {}}>
                            <Users className="w-4 h-4 mr-2" />
                            View Subscribers
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(pack.id)}
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">
                  {editingPack ? 'Edit Office Pack' : 'Add New Office Pack'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPack(null);
                    resetForm();
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
                      <Label htmlFor="name">Pack Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Startup Essentials"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Pack description..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (MK) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">Original Price (MK)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="savings">Savings (MK) *</Label>
                        <Input
                          id="savings"
                          type="number"
                          value={formData.savings}
                          onChange={(e) => setFormData({...formData, savings: e.target.value})}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount">Discount %</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={formData.discount}
                          onChange={(e) => setFormData({...formData, discount: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="items">Number of Items *</Label>
                        <Input
                          id="items"
                          type="number"
                          value={formData.items}
                          onChange={(e) => setFormData({...formData, items: e.target.value})}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="popularity">Popularity %</Label>
                        <Input
                          id="popularity"
                          type="number"
                          value={formData.popularity}
                          onChange={(e) => setFormData({...formData, popularity: e.target.value})}
                          placeholder="90"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="interval">Interval *</Label>
                        <Select 
                          value={formData.interval} 
                          onValueChange={(value) => setFormData({...formData, interval: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            {intervalOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="size">Team Size *</Label>
                        <Select 
                          value={formData.size} 
                          onValueChange={(value) => setFormData({...formData, size: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {sizeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="teamSize">Team Size Description *</Label>
                      <Input
                        id="teamSize"
                        value={formData.teamSize}
                        onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
                        placeholder="e.g., 1-5 people"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="minQuantity">Minimum Quantity</Label>
                      <Input
                        id="minQuantity"
                        type="number"
                        value={formData.minQuantity}
                        onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <Label>Features *</Label>
                      <div className="space-y-2 mt-2">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={feature}
                              onChange={(e) => updateFeature(index, e.target.value)}
                              placeholder={`Feature ${index + 1}`}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFeature(index)}
                              disabled={features.length === 1}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addFeature}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Feature
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Includes *</Label>
                      <div className="space-y-2 mt-2">
                        {includes.map((include, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={include}
                              onChange={(e) => updateInclude(index, e.target.value)}
                              placeholder={`Item ${index + 1}`}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInclude(index)}
                              disabled={includes.length === 1}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addInclude}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="icon">Icon</Label>
                        <Select 
                          value={formData.icon} 
                          onValueChange={(value) => setFormData({...formData, icon: value})}
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
                      <div>
                        <Label htmlFor="image">Display Emoji</Label>
                        <Input
                          id="image"
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                          placeholder="🚀"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="color">Color</Label>
                        <Select 
                          value={formData.color} 
                          onValueChange={(value) => {
                            const colors: Record<string, string> = {
                              'text-blue-600': 'bg-blue-50',
                              'text-green-600': 'bg-green-50',
                              'text-purple-600': 'bg-purple-50',
                              'text-orange-600': 'bg-orange-50',
                              'text-amber-600': 'bg-amber-50',
                              'text-red-600': 'bg-red-50'
                            };
                            setFormData({
                              ...formData, 
                              color: value,
                              bgColor: colors[value] || 'bg-blue-50'
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text-blue-600">Blue</SelectItem>
                            <SelectItem value="text-green-600">Green</SelectItem>
                            <SelectItem value="text-purple-600">Purple</SelectItem>
                            <SelectItem value="text-orange-600">Orange</SelectItem>
                            <SelectItem value="text-amber-600">Amber</SelectItem>
                            <SelectItem value="text-red-600">Red</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value) => setFormData({...formData, status: value})}
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

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="recommended"
                        checked={formData.recommended}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, recommended: checked as boolean})
                        }
                      />
                      <Label htmlFor="recommended">Mark as Recommended</Label>
                    </div>

                    {/* Preview Card */}
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-sm">Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className={`w-10 h-10 rounded-lg ${formData.bgColor} flex items-center justify-center text-2xl`}>
                            {formData.image}
                          </div>
                          <div>
                            <p className="font-medium">{formData.name || 'Pack Name'}</p>
                            <p className="text-xs text-muted-foreground">MK {formData.price || '0'}</p>
                            {formData.recommended && (
                              <Badge className="mt-1 bg-yellow-500 text-white text-xs">Recommended</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPack(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {editingPack ? 'Update Pack' : 'Create Pack'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Office Pack</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this office pack? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OfficePacks;