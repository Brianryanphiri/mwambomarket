import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Download,
  RefreshCw,
  Loader2,
  ArrowLeft,
  X,
  Save,
  Package,
  TrendingUp,
  Users,
  Percent,
  Leaf,
  Milk,
  Croissant,
  Heart,
  Zap,
  Repeat,
  Star,
  Award,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import type { SubscriptionPlan } from '@/types/service.types';

const SUBSCRIPTION_SERVICE_ID = '3'; // From your database, subscription service has id=3

const intervalOptions = [
  { value: 'weekly', label: 'Weekly', icon: Repeat },
  { value: 'biweekly', label: 'Bi-Weekly', icon: Repeat },
  { value: 'monthly', label: 'Monthly', icon: Calendar }
];

const categoryOptions = [
  { value: 'vegetables', label: 'Vegetables', icon: Leaf },
  { value: 'dairy', label: 'Dairy', icon: Milk },
  { value: 'bread', label: 'Bread', icon: Croissant },
  { value: 'mixed', label: 'Mixed', icon: Package },
  { value: 'family', label: 'Family', icon: Users }
];

const iconOptions = [
  { value: 'Leaf', label: 'Vegetables', icon: Leaf },
  { value: 'Milk', label: 'Dairy', icon: Milk },
  { value: 'Croissant', label: 'Bakery', icon: Croissant },
  { value: 'Users', label: 'Family', icon: Users },
  { value: 'Package', label: 'Mixed', icon: Package },
  { value: 'Heart', label: 'Popular', icon: Heart },
  { value: 'Star', label: 'Premium', icon: Star },
  { value: 'Zap', label: 'Quick', icon: Zap },
  { value: 'Award', label: 'Best Value', icon: Award },
  { value: 'TrendingUp', label: 'Trending', icon: TrendingUp }
];

const colorOptions = [
  { value: 'text-green-600', label: 'Green', bg: 'bg-green-50' },
  { value: 'text-blue-600', label: 'Blue', bg: 'bg-blue-50' },
  { value: 'text-amber-600', label: 'Amber', bg: 'bg-amber-50' },
  { value: 'text-purple-600', label: 'Purple', bg: 'bg-purple-50' },
  { value: 'text-red-600', label: 'Red', bg: 'bg-red-50' },
  { value: 'text-orange-600', label: 'Orange', bg: 'bg-orange-50' },
  { value: 'text-indigo-600', label: 'Indigo', bg: 'bg-indigo-50' },
  { value: 'text-pink-600', label: 'Pink', bg: 'bg-pink-50' }
];

const Subscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInterval, setSelectedInterval] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [features, setFeatures] = useState<string[]>(['']);
  const [popularityRange, setPopularityRange] = useState<[number, number]>([0, 100]);
  const [viewPlanDialog, setViewPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    interval: 'weekly',
    category: 'vegetables',
    items: '',
    popularity: '90',
    savings: '',
    discount: '',
    image: '',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    icon: 'Package',
    status: 'active',
    minimumCommitment: '',
    trialDays: '0',
    setupFee: '',
    cancellationFee: '',
    popular: false,
    bestValue: false
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await serviceService.getSubscriptionPlans(SUBSCRIPTION_SERVICE_ID);
      console.log('Fetched subscription plans:', data);
      setPlans(data);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      originalPrice: plan.originalPrice?.toString() || '',
      interval: plan.interval,
      category: plan.category,
      items: plan.items.toString(),
      popularity: plan.popularity.toString(),
      savings: plan.savings.toString(),
      discount: plan.discount?.toString() || '',
      image: plan.image || '',
      color: plan.color,
      bgColor: plan.bgColor,
      icon: plan.icon,
      status: plan.status,
      minimumCommitment: plan.minimumCommitment?.toString() || '',
      trialDays: plan.trialDays?.toString() || '0',
      setupFee: plan.setupFee?.toString() || '',
      cancellationFee: plan.cancellationFee?.toString() || '',
      popular: plan.popular || false,
      bestValue: plan.bestValue || false
    });
    setFeatures(plan.features);
    setShowForm(true);
  };

  const handleView = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setViewPlanDialog(true);
  };

  const handleDelete = (id: string) => {
    setPlanToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;
    
    try {
      await serviceService.deleteSubscriptionPlan(SUBSCRIPTION_SERVICE_ID, planToDelete);
      
      setPlans(prev => prev.filter(p => p.id !== planToDelete));
      toast({
        title: 'Success',
        description: 'Subscription plan deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete plan',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const planData = {
        serviceId: SUBSCRIPTION_SERVICE_ID,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        interval: formData.interval as 'weekly' | 'biweekly' | 'monthly',
        category: formData.category as 'vegetables' | 'dairy' | 'bread' | 'mixed' | 'family',
        items: parseInt(formData.items),
        popularity: parseInt(formData.popularity),
        savings: parseFloat(formData.savings),
        discount: formData.discount ? parseInt(formData.discount) : undefined,
        features: features.filter(f => f.trim() !== ''),
        image: formData.image,
        color: formData.color,
        bg_color: formData.bgColor,
        icon: formData.icon,
        status: formData.status as 'active' | 'inactive',
        minimum_commitment: formData.minimumCommitment ? parseInt(formData.minimumCommitment) : null,
        trial_days: parseInt(formData.trialDays),
        setup_fee: formData.setupFee ? parseFloat(formData.setupFee) : 0,
        cancellation_fee: formData.cancellationFee ? parseFloat(formData.cancellationFee) : 0,
        popular: formData.popular ? 1 : 0,
        best_value: formData.bestValue ? 1 : 0
      };

      if (editingPlan) {
        await serviceService.updateSubscriptionPlan(SUBSCRIPTION_SERVICE_ID, editingPlan.id, planData);
        toast({
          title: 'Success',
          description: 'Subscription plan updated successfully',
        });
      } else {
        await serviceService.createSubscriptionPlan(SUBSCRIPTION_SERVICE_ID, planData);
        toast({
          title: 'Success',
          description: 'Subscription plan created successfully',
        });
      }

      fetchPlans();
      setShowForm(false);
      setEditingPlan(null);
      resetForm();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save plan',
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
      interval: 'weekly',
      category: 'vegetables',
      items: '',
      popularity: '90',
      savings: '',
      discount: '',
      image: '',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      icon: 'Package',
      status: 'active',
      minimumCommitment: '',
      trialDays: '0',
      setupFee: '',
      cancellationFee: '',
      popular: false,
      bestValue: false
    });
    setFeatures(['']);
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

  const handleDuplicate = async (plan: SubscriptionPlan) => {
    try {
      const { id, createdAt, updatedAt, ...planData } = plan;
      const newPlanData = {
        ...planData,
        name: `${plan.name} (Copy)`,
        popularity: Math.max(0, plan.popularity - 5),
      };
      
      await serviceService.createSubscriptionPlan(SUBSCRIPTION_SERVICE_ID, newPlanData);
      
      toast({
        title: 'Success',
        description: 'Plan duplicated successfully',
      });
      
      fetchPlans();
    } catch (error) {
      console.error('Error duplicating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate plan',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      const plan = plans.find(p => p.id === id);
      if (!plan) return;
      
      await serviceService.updateSubscriptionPlan(SUBSCRIPTION_SERVICE_ID, id, { ...plan, status: newStatus });
      
      setPlans(prev => prev.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));
      
      toast({
        title: 'Success',
        description: `Plan ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getIntervalBadge = (interval: string) => {
    switch(interval) {
      case 'weekly':
        return <Badge className="bg-blue-500 text-white gap-1"><Repeat className="w-3 h-3" /> Weekly</Badge>;
      case 'biweekly':
        return <Badge className="bg-purple-500 text-white gap-1"><Repeat className="w-3 h-3" /> Bi-Weekly</Badge>;
      case 'monthly':
        return <Badge className="bg-orange-500 text-white gap-1"><Calendar className="w-3 h-3" /> Monthly</Badge>;
      default:
        return <Badge variant="outline">{interval}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'vegetables': return <Leaf className="w-4 h-4" />;
      case 'dairy': return <Milk className="w-4 h-4" />;
      case 'bread': return <Croissant className="w-4 h-4" />;
      case 'family': return <Users className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
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

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInterval = selectedInterval === 'all' || plan.interval === selectedInterval;
    const matchesCategory = selectedCategory === 'all' || plan.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || plan.status === selectedStatus;
    const matchesPopularity = plan.popularity >= popularityRange[0] && plan.popularity <= popularityRange[1];
    return matchesSearch && matchesInterval && matchesCategory && matchesStatus && matchesPopularity;
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
            <h1 className="text-3xl font-display font-bold">Subscription Plans</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage subscription plans for your customers
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPlans}>
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
              setEditingPlan(null);
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Plans</p>
              <p className="text-xl font-bold">{plans.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Plans</p>
              <p className="text-xl font-bold">{plans.filter(p => p.status === 'active').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Savings</p>
              <p className="text-xl font-bold">
                {plans.length > 0 
                  ? Math.round(plans.reduce((sum, p) => sum + (p.discount || 0), 0) / plans.length) 
                  : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Popularity</p>
              <p className="text-xl font-bold">
                {plans.length > 0 
                  ? Math.round(plans.reduce((sum, p) => sum + p.popularity, 0) / plans.length) 
                  : 0}%
              </p>
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
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
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
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map(option => (
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

          <div className="mt-4">
            <Label>Popularity Range</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={popularityRange}
                onValueChange={(value) => setPopularityRange(value as [number, number])}
                max={100}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-2 text-sm">
                <span>{popularityRange[0]}%</span>
                <span>-</span>
                <span>{popularityRange[1]}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Popularity</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No subscription plans found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or add a new plan
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${plan.bgColor} flex items-center justify-center`}>
                          {plan.icon === 'Leaf' && <Leaf className={`w-5 h-5 ${plan.color}`} />}
                          {plan.icon === 'Milk' && <Milk className={`w-5 h-5 ${plan.color}`} />}
                          {plan.icon === 'Croissant' && <Croissant className={`w-5 h-5 ${plan.color}`} />}
                          {plan.icon === 'Users' && <Users className={`w-5 h-5 ${plan.color}`} />}
                          {plan.icon === 'Package' && <Package className={`w-5 h-5 ${plan.color}`} />}
                          {plan.icon === 'Heart' && <Heart className={`w-5 h-5 ${plan.color}`} />}
                          {plan.icon === 'Star' && <Star className={`w-5 h-5 ${plan.color}`} />}
                          {plan.icon === 'Award' && <Award className={`w-5 h-5 ${plan.color}`} />}
                        </div>
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{plan.description}</p>
                          {plan.popular && (
                            <Badge className="mt-1 bg-yellow-500 text-white text-xs">Popular</Badge>
                          )}
                          {plan.bestValue && !plan.popular && (
                            <Badge className="mt-1 bg-green-500 text-white text-xs">Best Value</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getIntervalBadge(plan.interval)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize gap-1">
                        {getCategoryIcon(plan.category)}
                        {plan.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">MK {plan.price.toLocaleString()}</p>
                        {plan.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            MK {plan.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{plan.items} items</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Progress value={plan.popularity} className="h-2 w-20" />
                          <span className="text-xs font-medium">{plan.popularity}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 text-white">
                        Save {plan.discount || Math.round((plan.savings / plan.price) * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleView(plan)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(plan)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {plan.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(plan.id, 'inactive')}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(plan.id, 'active')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(plan.id)}
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
                <h2 className="text-2xl font-display font-bold">
                  {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlan(null);
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
                      <Label htmlFor="name">Plan Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Weekly Veggie Box"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Plan description..."
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
                          min="0"
                          max="100"
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
                        <Label htmlFor="category">Category *</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData({...formData, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minimumCommitment">Minimum Commitment (weeks)</Label>
                        <Input
                          id="minimumCommitment"
                          type="number"
                          value={formData.minimumCommitment}
                          onChange={(e) => setFormData({...formData, minimumCommitment: e.target.value})}
                          placeholder="4"
                        />
                      </div>
                      <div>
                        <Label htmlFor="trialDays">Trial Days</Label>
                        <Input
                          id="trialDays"
                          type="number"
                          value={formData.trialDays}
                          onChange={(e) => setFormData({...formData, trialDays: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="setupFee">Setup Fee (MK)</Label>
                        <Input
                          id="setupFee"
                          type="number"
                          value={formData.setupFee}
                          onChange={(e) => setFormData({...formData, setupFee: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cancellationFee">Cancellation Fee (MK)</Label>
                        <Input
                          id="cancellationFee"
                          type="number"
                          value={formData.cancellationFee}
                          onChange={(e) => setFormData({...formData, cancellationFee: e.target.value})}
                          placeholder="0"
                        />
                      </div>
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
                        <Label htmlFor="color">Color Theme</Label>
                        <Select 
                          value={formData.color} 
                          onValueChange={(value) => {
                            const selected = colorOptions.find(c => c.value === value);
                            setFormData({
                              ...formData, 
                              color: value,
                              bgColor: selected?.bg || 'bg-indigo-50'
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full ${option.bg}`} />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        placeholder="/uploads/products/plan-image.jpg"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="popular"
                          checked={formData.popular}
                          onCheckedChange={(checked) => setFormData({...formData, popular: checked})}
                        />
                        <Label htmlFor="popular">Mark as Popular</Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="bestValue"
                          checked={formData.bestValue}
                          onCheckedChange={(checked) => setFormData({...formData, bestValue: checked})}
                        />
                        <Label htmlFor="bestValue">Mark as Best Value</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
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

                    {/* Preview Card */}
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-sm">Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`flex items-center gap-3 p-3 border rounded-lg ${formData.bgColor}`}>
                          <div className={`w-10 h-10 rounded-lg ${formData.bgColor} flex items-center justify-center`}>
                            {formData.icon === 'Leaf' && <Leaf className={`w-5 h-5 ${formData.color}`} />}
                            {formData.icon === 'Milk' && <Milk className={`w-5 h-5 ${formData.color}`} />}
                            {formData.icon === 'Croissant' && <Croissant className={`w-5 h-5 ${formData.color}`} />}
                            {formData.icon === 'Users' && <Users className={`w-5 h-5 ${formData.color}`} />}
                            {formData.icon === 'Package' && <Package className={`w-5 h-5 ${formData.color}`} />}
                          </div>
                          <div>
                            <p className="font-medium">{formData.name || 'Plan Name'}</p>
                            <p className="text-xs text-muted-foreground">
                              MK {formData.price || '0'}/{formData.interval}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlan(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Plan Dialog */}
      <Dialog open={viewPlanDialog} onOpenChange={setViewPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Plan Details</DialogTitle>
            <DialogDescription>
              View subscription plan information
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-6">
              <div className={`flex items-center gap-4 p-4 rounded-lg ${selectedPlan.bgColor}`}>
                <div className={`w-16 h-16 rounded-xl ${selectedPlan.bgColor} flex items-center justify-center`}>
                  {selectedPlan.icon === 'Leaf' && <Leaf className={`w-8 h-8 ${selectedPlan.color}`} />}
                  {selectedPlan.icon === 'Milk' && <Milk className={`w-8 h-8 ${selectedPlan.color}`} />}
                  {selectedPlan.icon === 'Croissant' && <Croissant className={`w-8 h-8 ${selectedPlan.color}`} />}
                  {selectedPlan.icon === 'Users' && <Users className={`w-8 h-8 ${selectedPlan.color}`} />}
                  {selectedPlan.icon === 'Package' && <Package className={`w-8 h-8 ${selectedPlan.color}`} />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedPlan.name}</h3>
                  <p className="text-muted-foreground">{selectedPlan.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-bold">MK {selectedPlan.price.toLocaleString()}</p>
                  {selectedPlan.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      MK {selectedPlan.originalPrice.toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interval</p>
                  <p className="font-medium capitalize">{selectedPlan.interval}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{selectedPlan.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Items</p>
                  <p className="font-medium">{selectedPlan.items} items</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Popularity</p>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedPlan.popularity} className="h-2 w-20" />
                    <span className="text-sm">{selectedPlan.popularity}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Savings</p>
                  <Badge className="bg-green-500 text-white">
                    Save {selectedPlan.discount || Math.round((selectedPlan.savings / selectedPlan.price) * 100)}%
                  </Badge>
                </div>
              </div>

              {selectedPlan.minimumCommitment && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Min. Commitment</p>
                    <p className="font-medium">{selectedPlan.minimumCommitment} weeks</p>
                  </div>
                  {selectedPlan.trialDays > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Trial Period</p>
                      <p className="font-medium">{selectedPlan.trialDays} days</p>
                    </div>
                  )}
                  {selectedPlan.setupFee > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Setup Fee</p>
                      <p className="font-medium">MK {selectedPlan.setupFee.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Features</p>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setViewPlanDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewPlanDialog(false);
                  handleEdit(selectedPlan);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Plan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subscription plan? This action cannot be undone.
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

export default Subscriptions;