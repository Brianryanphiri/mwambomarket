import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Sun,
  Calendar,
  Briefcase,
  GraduationCap,
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
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  BarChart3,
  Activity
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import type { Service, ServiceStats } from '@/types/service.types';

// Service type icons mapping
const serviceIcons: Record<string, any> = {
  family: Users,
  daily: Sun,
  subscription: Calendar,
  office: Briefcase,
  student: GraduationCap,
  express: Zap,
};

// Service type colors
const serviceColors: Record<string, { bg: string, text: string, badge: string }> = {
  family: { bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-500' },
  daily: { bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-500' },
  subscription: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-500' },
  office: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-500' },
  student: { bg: 'bg-rose-100', text: 'text-rose-600', badge: 'bg-rose-500' },
  express: { bg: 'bg-orange-100', text: 'text-orange-600', badge: 'bg-orange-500' },
};

// Service display names
const serviceNames: Record<string, string> = {
  family: 'Family Packages',
  daily: 'Daily Fresh',
  subscription: 'Subscriptions',
  office: 'Office Packs',
  student: 'Student Packs',
  express: 'Express Delivery',
};

const ServiceList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Record<string, ServiceStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await serviceService.getServices();
      setServices(data);
      
      // Fetch stats for each service
      const statsData: Record<string, ServiceStats> = {};
      for (const service of data) {
        try {
          statsData[service.id] = await serviceService.getServiceStats(service.id);
        } catch (error) {
          console.error(`Error fetching stats for ${service.id}:`, error);
        }
      }
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await serviceService.deleteService(id);
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await serviceService.updateService(id, { status: newStatus });
      toast({
        title: 'Success',
        description: `Service ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
      fetchServices();
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500 text-white">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-display font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your store services and packages
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchServices}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(serviceNames).map(([key, name]) => {
          const Icon = serviceIcons[key];
          const color = serviceColors[key];
          const serviceStats = Object.values(stats).filter(s => s.totalPackages > 0).length;
          
          return (
            <Card key={key} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/admin/services/${key}`)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${color.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color.text}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{name}</p>
                    <p className="text-lg font-bold">{serviceStats}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Services</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Packages</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No services found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or add a new service
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => {
                  const Icon = serviceIcons[service.type] || Package;
                  const color = serviceColors[service.type] || serviceColors.family;
                  const serviceStats = stats[service.id] || {
                    totalPackages: 0,
                    activePackages: 0,
                    totalOrders: 0,
                    totalRevenue: 0,
                    averageRating: 0,
                    popularItems: []
                  };

                  return (
                    <TableRow key={service.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/services/${service.type}`)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${color.bg} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color.text}`} />
                          </div>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {service.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(service.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{serviceStats.totalPackages}</p>
                          <p className="text-xs text-muted-foreground">
                            {serviceStats.activePackages} active
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{serviceStats.totalOrders}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">MK {serviceStats.totalRevenue.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{serviceStats.averageRating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/services/${service.type}`);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/services/${service.type}/settings`);
                            }}>
                              <Settings className="w-4 h-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/services/${service.type}/analytics`);
                            }}>
                              <Activity className="w-4 h-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleStatusToggle(service.id, service.status);
                            }}>
                              {service.status === 'active' ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(service.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Packages</p>
              <p className="text-xl font-bold">
                {Object.values(stats).reduce((sum, s) => sum + s.totalPackages, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold">
                {Object.values(stats).reduce((sum, s) => sum + s.totalOrders, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Services</p>
              <p className="text-xl font-bold">
                {services.filter(s => s.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
              <p className="text-xl font-bold">
                {(Object.values(stats).reduce((sum, s) => sum + s.averageRating, 0) / 
                  Object.values(stats).length || 0).toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceList;