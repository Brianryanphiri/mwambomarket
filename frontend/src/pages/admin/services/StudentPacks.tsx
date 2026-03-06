import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  GraduationCap,
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
  BookOpen,
  Backpack,
  Crown,
  Globe,
  Target,
  Calendar,
  Percent,
  Save,
  ArrowLeft,
  X,
  Coffee,
  Pizza,
  Apple,
  BookMarked,
  GraduationCap as GradIcon,
  User,
  Users as UsersIcon,
  Sparkles,
  Zap
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
import type { StudentPack, StudentDeal } from '@/types/service.types';

// Mock data for development
const mockStudentPacks: StudentPack[] = [
  {
    id: '1',
    serviceId: 'student-1',
    name: 'Budget Student Starter',
    description: 'Everything you need for the semester on a budget',
    price: 25000,
    originalPrice: 32000,
    duration: 'monthly',
    lifestyle: 'budget',
    items: 15,
    popularity: 98,
    savings: 7000,
    discount: 22,
    features: [
      'Free delivery to campus',
      'Flexible pause anytime',
      'Student budget friendly',
      'No commitment',
      'Easy cancellation'
    ],
    includes: [
      'Instant noodles (10 packs)',
      'Rice (2kg)',
      'Cooking oil (1L)',
      'Eggs (15pcs)',
      'Bread (2 loaves)',
      'Milk (2L)',
      'Sugar (1kg)',
      'Tea/Coffee',
      'Snacks (5 packs)'
    ],
    image: '🎒',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: 'Backpack',
    recommended: true,
    studentType: 'all',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    serviceId: 'student-1',
    name: 'Standard Student Living',
    description: 'Balanced meals and study essentials',
    price: 45000,
    originalPrice: 55000,
    duration: 'monthly',
    lifestyle: 'standard',
    items: 25,
    popularity: 95,
    savings: 10000,
    discount: 18,
    features: [
      'Free campus delivery',
      'Study snacks included',
      'Weekly fresh items',
      'Priority support',
      'Meal planning guide'
    ],
    includes: [
      'Rice (5kg)',
      'Cooking oil (2L)',
      'Eggs (30pcs)',
      'Fresh vegetables',
      'Fruits',
      'Bread (4 loaves)',
      'Milk (4L)',
      'Sugar (2kg)',
      'Pasta & sauces',
      'Study snacks',
      'Instant coffee',
      'Cereal'
    ],
    image: '📚',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: 'BookOpen',
    studentType: 'all',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    serviceId: 'student-1',
    name: 'International Student Pack',
    description: 'Familiar foods for international students',
    price: 65000,
    originalPrice: 80000,
    duration: 'monthly',
    lifestyle: 'international',
    items: 30,
    popularity: 92,
    savings: 15000,
    discount: 19,
    features: [
      'International foods',
      'Halal options available',
      'Vegetarian options',
      'Cultural snacks',
      'English instructions',
      'Recipe cards'
    ],
    includes: [
      'Rice (5kg)',
      'Cooking oil',
      'Halal chicken',
      'International spices',
      'Pasta & sauces',
      'Canned goods',
      'Breakfast cereals',
      'Snacks from home',
      'Tea/coffee',
      'Biscuits',
      'Instant meals'
    ],
    image: '🌍',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: 'Globe',
    studentType: 'international',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    serviceId: 'student-1',
    name: 'Exam Cram Survival Kit',
    description: 'Stay fueled during exam week',
    price: 18000,
    originalPrice: 23000,
    duration: 'weekly',
    lifestyle: 'standard',
    items: 12,
    popularity: 99,
    savings: 5000,
    discount: 22,
    features: [
      'Next-day delivery',
      'Exam week special',
      'Energy boosters',
      'Late night study',
      'Brain foods included'
    ],
    includes: [
      'Energy drinks (6 cans)',
      'Coffee (premium)',
      'Study snacks (10 packs)',
      'Instant noodles',
      'Protein bars',
      'Chocolate',
      'Nuts',
      'Fruit juice',
      'Biscuits',
      'Gum/mints'
    ],
    image: '📝',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: 'Target',
    studentType: 'all',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockStudentDeals: StudentDeal[] = [
  {
    id: 'd1',
    serviceId: 'student-1',
    name: 'First Order Discount',
    discount: 20,
    code: 'STUDENT20',
    expiry: '2025-03-30',
    image: '🎓',
    icon: 'GraduationCap',
    used: 1234,
    limit: 2000,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd2',
    serviceId: 'student-1',
    name: 'Refer a Friend',
    discount: 15,
    code: 'FRIEND15',
    expiry: '2025-04-15',
    image: '👥',
    icon: 'Users',
    used: 567,
    limit: 1000,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'd3',
    serviceId: 'student-1',
    name: 'Exam Week Special',
    discount: 25,
    code: 'EXAM25',
    expiry: '2025-05-10',
    image: '📚',
    icon: 'BookOpen',
    used: 892,
    limit: 1500,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const durationOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'semester', label: 'Semester' }
];

const lifestyleOptions = [
  { value: 'budget', label: 'Budget', icon: Backpack },
  { value: 'standard', label: 'Standard', icon: BookOpen },
  { value: 'premium', label: 'Premium', icon: Crown },
  { value: 'international', label: 'International', icon: Globe }
];

const studentTypeOptions = [
  { value: 'all', label: 'All Students' },
  { value: 'local', label: 'Local Students' },
  { value: 'international', label: 'International Students' }
];

const iconOptions = [
  { value: 'Backpack', label: 'Backpack', icon: Backpack },
  { value: 'BookOpen', label: 'Book', icon: BookOpen },
  { value: 'Globe', label: 'Globe', icon: Globe },
  { value: 'Crown', label: 'Crown', icon: Crown },
  { value: 'Target', label: 'Target', icon: Target },
  { value: 'Coffee', label: 'Coffee', icon: Coffee },
  { value: 'Pizza', label: 'Pizza', icon: Pizza },
  { value: 'Apple', label: 'Apple', icon: Apple }
];

const StudentPacks = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [packs, setPacks] = useState<StudentPack[]>([]);
  const [deals, setDeals] = useState<StudentDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLifestyle, setSelectedLifestyle] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedStudentType, setSelectedStudentType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingPack, setEditingPack] = useState<StudentPack | null>(null);
  const [editingDeal, setEditingDeal] = useState<StudentDeal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDealDialogOpen, setDeleteDealDialogOpen] = useState(false);
  const [packToDelete, setPackToDelete] = useState<string | null>(null);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [features, setFeatures] = useState<string[]>(['']);
  const [includes, setIncludes] = useState<string[]>(['']);

  // Pack Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    duration: 'monthly',
    lifestyle: 'standard',
    items: '',
    popularity: '90',
    savings: '',
    discount: '',
    image: '📦',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: 'Package',
    recommended: false,
    studentType: 'all',
    status: 'active'
  });

  // Deal Form state
  const [dealFormData, setDealFormData] = useState({
    name: '',
    discount: '',
    code: '',
    expiry: '',
    image: '🎓',
    icon: 'GraduationCap',
    used: '0',
    limit: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Replace with actual API calls
      // const packsData = await serviceService.getStudentPacks('student-1');
      // const dealsData = await serviceService.getStudentDeals('student-1');
      // setPacks(packsData);
      // setDeals(dealsData);
      
      // Using mock data for now
      setTimeout(() => {
        setPacks(mockStudentPacks);
        setDeals(mockStudentDeals);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student packs',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleEditPack = (pack: StudentPack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      description: pack.description,
      price: pack.price.toString(),
      originalPrice: pack.originalPrice?.toString() || '',
      duration: pack.duration,
      lifestyle: pack.lifestyle,
      items: pack.items.toString(),
      popularity: pack.popularity.toString(),
      savings: pack.savings.toString(),
      discount: pack.discount?.toString() || '',
      image: pack.image,
      color: pack.color,
      bgColor: pack.bgColor,
      icon: pack.icon,
      recommended: pack.recommended || false,
      studentType: pack.studentType,
      status: pack.status
    });
    setFeatures(pack.features);
    setIncludes(pack.includes);
    setShowForm(true);
  };

  const handleEditDeal = (deal: StudentDeal) => {
    setEditingDeal(deal);
    setDealFormData({
      name: deal.name,
      discount: deal.discount.toString(),
      code: deal.code,
      expiry: deal.expiry,
      image: deal.image,
      icon: deal.icon,
      used: deal.used.toString(),
      limit: deal.limit.toString(),
      status: deal.status
    });
    setShowDealForm(true);
  };

  const handleDeletePack = (id: string) => {
    setPackToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDeal = (id: string) => {
    setDealToDelete(id);
    setDeleteDealDialogOpen(true);
  };

  const confirmDeletePack = async () => {
    if (!packToDelete) return;
    
    try {
      // Replace with actual API call
      // await serviceService.deleteStudentPack('student-1', packToDelete);
      
      setPacks(prev => prev.filter(p => p.id !== packToDelete));
      toast({
        title: 'Success',
        description: 'Student pack deleted successfully',
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

  const confirmDeleteDeal = async () => {
    if (!dealToDelete) return;
    
    try {
      // Replace with actual API call
      // await serviceService.deleteStudentDeal('student-1', dealToDelete);
      
      setDeals(prev => prev.filter(d => d.id !== dealToDelete));
      toast({
        title: 'Success',
        description: 'Student deal deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete deal',
        variant: 'destructive',
      });
    } finally {
      setDeleteDealDialogOpen(false);
      setDealToDelete(null);
    }
  };

  const handleSubmitPack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const packData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        duration: formData.duration as 'weekly' | 'monthly' | 'semester',
        lifestyle: formData.lifestyle as 'budget' | 'standard' | 'premium' | 'international',
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
        studentType: formData.studentType as 'local' | 'international' | 'all',
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
          description: 'Student pack updated successfully',
        });
      } else {
        // Create
        const newPack: StudentPack = {
          id: Date.now().toString(),
          serviceId: 'student-1',
          ...packData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setPacks(prev => [newPack, ...prev]);
        toast({
          title: 'Success',
          description: 'Student pack created successfully',
        });
      }

      setShowForm(false);
      setEditingPack(null);
      resetPackForm();
    } catch (error) {
      console.error('Error saving pack:', error);
      toast({
        title: 'Error',
        description: 'Failed to save pack',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dealData = {
        name: dealFormData.name,
        discount: parseInt(dealFormData.discount),
        code: dealFormData.code.toUpperCase(),
        expiry: dealFormData.expiry,
        image: dealFormData.image,
        icon: dealFormData.icon,
        used: parseInt(dealFormData.used),
        limit: parseInt(dealFormData.limit),
        status: dealFormData.status as 'active' | 'expired' | 'disabled'
      };

      if (editingDeal) {
        // Update
        setDeals(prev => prev.map(d => 
          d.id === editingDeal.id 
            ? { ...d, ...dealData, updatedAt: new Date().toISOString() }
            : d
        ));
        toast({
          title: 'Success',
          description: 'Student deal updated successfully',
        });
      } else {
        // Create
        const newDeal: StudentDeal = {
          id: Date.now().toString(),
          serviceId: 'student-1',
          ...dealData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDeals(prev => [newDeal, ...prev]);
        toast({
          title: 'Success',
          description: 'Student deal created successfully',
        });
      }

      setShowDealForm(false);
      setEditingDeal(null);
      resetDealForm();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to save deal',
        variant: 'destructive',
      });
    }
  };

  const resetPackForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      duration: 'monthly',
      lifestyle: 'standard',
      items: '',
      popularity: '90',
      savings: '',
      discount: '',
      image: '📦',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: 'Package',
      recommended: false,
      studentType: 'all',
      status: 'active'
    });
    setFeatures(['']);
    setIncludes(['']);
  };

  const resetDealForm = () => {
    setDealFormData({
      name: '',
      discount: '',
      code: '',
      expiry: '',
      image: '🎓',
      icon: 'GraduationCap',
      used: '0',
      limit: '',
      status: 'active'
    });
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

  const handleDuplicatePack = async (pack: StudentPack) => {
    try {
      const { id, createdAt, updatedAt, ...packData } = pack;
      const newPack: StudentPack = {
        ...packData,
        id: Date.now().toString(),
        serviceId: 'student-1',
        name: `${pack.name} (Copy)`,
        popularity: pack.popularity - 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPacks(prev => [newPack, ...prev]);
      toast({
        title: 'Success',
        description: 'Student pack duplicated successfully',
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

  const getLifestyleIcon = (lifestyle: string) => {
    switch(lifestyle) {
      case 'budget': return <Backpack className="w-4 h-4" />;
      case 'standard': return <BookOpen className="w-4 h-4" />;
      case 'premium': return <Crown className="w-4 h-4" />;
      case 'international': return <Globe className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getLifestyleBadge = (lifestyle: string) => {
    const colors = {
      budget: 'bg-green-500',
      standard: 'bg-blue-500',
      premium: 'bg-purple-500',
      international: 'bg-amber-500'
    };
    
    return (
      <Badge className={`${colors[lifestyle as keyof typeof colors]} text-white gap-1`}>
        {getLifestyleIcon(lifestyle)}
        <span className="capitalize">{lifestyle}</span>
      </Badge>
    );
  };

  const getDurationBadge = (duration: string) => {
    switch(duration) {
      case 'weekly':
        return <Badge className="bg-blue-500 text-white">Weekly</Badge>;
      case 'monthly':
        return <Badge className="bg-purple-500 text-white">Monthly</Badge>;
      case 'semester':
        return <Badge className="bg-orange-500 text-white">Semester</Badge>;
      default:
        return <Badge variant="outline">{duration}</Badge>;
    }
  };

  const getStudentTypeBadge = (type: string) => {
    switch(type) {
      case 'all':
        return <Badge variant="outline" className="border-green-500 text-green-600">All Students</Badge>;
      case 'local':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Local</Badge>;
      case 'international':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">International</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-500 border-red-200">Expired</Badge>;
      case 'disabled':
        return <Badge variant="outline" className="text-gray-500">Disabled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLifestyle = selectedLifestyle === 'all' || pack.lifestyle === selectedLifestyle;
    const matchesDuration = selectedDuration === 'all' || pack.duration === selectedDuration;
    const matchesStudentType = selectedStudentType === 'all' || pack.studentType === selectedStudentType;
    const matchesStatus = selectedStatus === 'all' || pack.status === selectedStatus;
    return matchesSearch && matchesLifestyle && matchesDuration && matchesStudentType && matchesStatus;
  });

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || deal.status === selectedStatus;
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
            <h1 className="text-3xl font-display font-bold">Student Packs</h1>
            <p className="text-muted-foreground mt-1">
              Manage student meal plans and exclusive deals
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
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
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Students</p>
              <p className="text-xl font-bold">892</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
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
              <Percent className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Deals</p>
              <p className="text-xl font-bold">{deals.filter(d => d.status === 'active').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">International</p>
              <p className="text-xl font-bold">{packs.filter(p => p.studentType === 'international').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="packs">Student Packs</TabsTrigger>
          <TabsTrigger value="deals">Exclusive Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="packs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search student packs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={selectedLifestyle} onValueChange={setSelectedLifestyle}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Lifestyle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lifestyles</SelectItem>
                    {lifestyleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    {durationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStudentType} onValueChange={setSelectedStudentType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Student Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {studentTypeOptions.map(option => (
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
              <div className="p-4 border-b flex justify-end">
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  onClick={() => {
                    setEditingPack(null);
                    resetPackForm();
                    setShowForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student Pack
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pack</TableHead>
                    <TableHead>Lifestyle</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Student Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Popularity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPacks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No student packs found</p>
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
                        <TableCell>{getLifestyleBadge(pack.lifestyle)}</TableCell>
                        <TableCell>{getDurationBadge(pack.duration)}</TableCell>
                        <TableCell>{getStudentTypeBadge(pack.studentType)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleEditPack(pack)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicatePack(pack)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeletePack(pack.id)}
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

        <TabsContent value="deals" className="space-y-4">
          {/* Deals Table */}
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-end">
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  onClick={() => {
                    setEditingDeal(null);
                    resetDealForm();
                    setShowDealForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student Deal
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No deals found</p>
                        <p className="text-sm text-muted-foreground">
                          Add a new student deal
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-2xl">
                              {deal.image}
                            </div>
                            <div>
                              <p className="font-medium">{deal.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {deal.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 text-white">
                            {deal.discount}% OFF
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(deal.expiry).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress value={(deal.used / deal.limit) * 100} className="h-2 w-20" />
                              <span className="text-xs font-medium">{deal.used}/{deal.limit}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(deal.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditDeal(deal)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteDeal(deal.id)}
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

      {/* Add/Edit Pack Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitPack}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">
                  {editingPack ? 'Edit Student Pack' : 'Add New Student Pack'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPack(null);
                    resetPackForm();
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Similar to other forms but with student-specific fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Pack Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Budget Student Starter"
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
                        <Label htmlFor="duration">Duration *</Label>
                        <Select 
                          value={formData.duration} 
                          onValueChange={(value) => setFormData({...formData, duration: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            {durationOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="lifestyle">Lifestyle *</Label>
                        <Select 
                          value={formData.lifestyle} 
                          onValueChange={(value) => setFormData({...formData, lifestyle: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select lifestyle" />
                          </SelectTrigger>
                          <SelectContent>
                            {lifestyleOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="studentType">Student Type *</Label>
                      <Select 
                        value={formData.studentType} 
                        onValueChange={(value) => setFormData({...formData, studentType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student type" />
                        </SelectTrigger>
                        <SelectContent>
                          {studentTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          placeholder="🎒"
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
                              'text-green-600': 'bg-green-50',
                              'text-blue-600': 'bg-blue-50',
                              'text-purple-600': 'bg-purple-50',
                              'text-amber-600': 'bg-amber-50',
                              'text-red-600': 'bg-red-50',
                              'text-orange-600': 'bg-orange-50'
                            };
                            setFormData({
                              ...formData, 
                              color: value,
                              bgColor: colors[value] || 'bg-green-50'
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text-green-600">Green</SelectItem>
                            <SelectItem value="text-blue-600">Blue</SelectItem>
                            <SelectItem value="text-purple-600">Purple</SelectItem>
                            <SelectItem value="text-amber-600">Amber</SelectItem>
                            <SelectItem value="text-red-600">Red</SelectItem>
                            <SelectItem value="text-orange-600">Orange</SelectItem>
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
                    resetPackForm();
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

      {/* Add/Edit Deal Form Modal */}
      {showDealForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitDeal}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">
                  {editingDeal ? 'Edit Student Deal' : 'Add New Student Deal'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowDealForm(false);
                    setEditingDeal(null);
                    resetDealForm();
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="dealName">Deal Name *</Label>
                  <Input
                    id="dealName"
                    value={dealFormData.name}
                    onChange={(e) => setDealFormData({...dealFormData, name: e.target.value})}
                    placeholder="e.g., First Order Discount"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Discount % *</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={dealFormData.discount}
                      onChange={(e) => setDealFormData({...dealFormData, discount: e.target.value})}
                      placeholder="20"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Promo Code *</Label>
                    <Input
                      id="code"
                      value={dealFormData.code}
                      onChange={(e) => setDealFormData({...dealFormData, code: e.target.value.toUpperCase()})}
                      placeholder="STUDENT20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date *</Label>
                    <Input
                      id="expiry"
                      type="date"
                      value={dealFormData.expiry}
                      onChange={(e) => setDealFormData({...dealFormData, expiry: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="limit">Usage Limit *</Label>
                    <Input
                      id="limit"
                      type="number"
                      value={dealFormData.limit}
                      onChange={(e) => setDealFormData({...dealFormData, limit: e.target.value})}
                      placeholder="1000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dealImage">Display Emoji</Label>
                    <Input
                      id="dealImage"
                      value={dealFormData.image}
                      onChange={(e) => setDealFormData({...dealFormData, image: e.target.value})}
                      placeholder="🎓"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select 
                      value={dealFormData.status} 
                      onValueChange={(value) => setDealFormData({...dealFormData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDealForm(false);
                    setEditingDeal(null);
                    resetDealForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {editingDeal ? 'Update Deal' : 'Create Deal'}
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
            <AlertDialogTitle>Delete Student Pack</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student pack? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePack} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDealDialogOpen} onOpenChange={setDeleteDealDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student deal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDeal} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentPacks;