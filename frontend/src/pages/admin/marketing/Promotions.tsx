import { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  RefreshCw,
  Download,
  Search,
  Filter,
  Calendar,
  Percent,
  DollarSign,
  Loader2,
  Power,
  PowerOff,
  Edit,
  Trash2,
  Users,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, isFuture } from 'date-fns';
import api from '@/services/api';

interface Promotion {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number | null;
  max_discount: number | null;
  start_date: string;
  end_date: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
  is_expired?: boolean;
  usage_percentage?: number;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expired', label: 'Expired' },
];

const Promotions = () => {
  const { toast } = useToast();
  
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<Partial<Promotion>>({
    code: '',
    type: 'percentage',
    value: 0,
    min_order: null,
    max_discount: null,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: null,
    usage_limit: null,
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, [statusFilter, searchTerm]);

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('type', 'percentage');
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/admin/discounts?${params}`);
      setPromotions(response.data);
    } catch (error: any) {
      console.error('Error fetching promotions:', error);
      setError(error.response?.data?.message || 'Failed to load promotions');
      toast({
        title: 'Error',
        description: 'Failed to load promotions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PROMO';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.value || !formData.start_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/admin/discounts', {
        ...formData,
        type: 'percentage'
      });
      setPromotions([response.data, ...promotions]);
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Promotion created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create promotion',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPromotion) return;

    setSubmitting(true);
    try {
      const response = await api.put(`/admin/discounts/${selectedPromotion.id}`, formData);
      setPromotions(promotions.map(p => p.id === selectedPromotion.id ? response.data : p));
      setShowEditDialog(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Promotion updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update promotion',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPromotion) return;

    setSubmitting(true);
    try {
      await api.delete(`/admin/discounts/${selectedPromotion.id}`);
      setPromotions(promotions.filter(p => p.id !== selectedPromotion.id));
      setShowDeleteDialog(false);
      toast({
        title: 'Success',
        description: 'Promotion deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete promotion',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      const response = await api.patch(`/admin/discounts/${promotion.id}/toggle`);
      setPromotions(promotions.map(p => 
        p.id === promotion.id ? { ...p, is_active: response.data.is_active } : p
      ));
      toast({
        title: 'Success',
        description: `Promotion ${response.data.is_active ? 'activated' : 'deactivated'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle promotion status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      min_order: null,
      max_discount: null,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: null,
      usage_limit: null,
      is_active: true
    });
    setSelectedPromotion(null);
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      code: promotion.code,
      type: 'percentage',
      value: promotion.value,
      min_order: promotion.min_order,
      max_discount: promotion.max_discount,
      start_date: promotion.start_date.split('T')[0],
      end_date: promotion.end_date ? promotion.end_date.split('T')[0] : null,
      usage_limit: promotion.usage_limit,
      is_active: promotion.is_active
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (promotion: Promotion) => {
    if (promotion.is_expired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (!promotion.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Active</Badge>;
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'No minimum';
    return `MK ${amount.toLocaleString()}`;
  };

  const formatDateRange = (start: string, end: string | null) => {
    const startDate = format(new Date(start), 'MMM d');
    if (!end) return `From ${startDate}`;
    return `${startDate} - ${format(new Date(end), 'MMM d, yyyy')}`;
  };

  const handleRetry = () => {
    fetchPromotions();
  };

  if (loading && promotions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error && promotions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-red-600 mb-2">Error Loading Promotions</p>
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
          <h1 className="text-3xl font-display font-bold">Promotions</h1>
          <p className="text-muted-foreground mt-1">Manage marketing campaigns and promotions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPromotions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => {
              resetForm();
              generateRandomCode();
              setShowCreateDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Promotion
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {promotions.length} promotion{promotions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Promotions Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No promotions found</p>
            <p className="text-sm text-muted-foreground">
              Create your first promotion to start marketing
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-mono text-lg">{promotion.code}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateRange(promotion.start_date, promotion.end_date)}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {promotion.value}% OFF
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Min. Order</span>
                    <span className="font-medium">{formatCurrency(promotion.min_order)}</span>
                  </div>
                  {promotion.max_discount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Max Discount</span>
                      <span className="font-medium">{formatCurrency(promotion.max_discount)}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">
                        {promotion.used_count} / {promotion.usage_limit || '∞'}
                      </span>
                    </div>
                    {promotion.usage_limit && promotion.usage_limit > 0 && (
                      <Progress value={promotion.usage_percentage} className="h-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(promotion)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 p-3 flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEdit(promotion)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggleActive(promotion)}
                >
                  {promotion.is_active ? (
                    <PowerOff className="w-4 h-4" />
                  ) : (
                    <Power className="w-4 h-4" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setSelectedPromotion(promotion);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{showCreateDialog ? 'Create New Promotion' : 'Edit Promotion'}</DialogTitle>
            <DialogDescription>
              {showCreateDialog 
                ? 'Create a new percentage-based promotion' 
                : 'Edit the promotion details'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="code">Promotion Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., SUMMER20"
                  className="font-mono"
                />
                <Button type="button" variant="outline" onClick={generateRandomCode}>
                  <Gift className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Discount Percentage *</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="value"
                  type="number"
                  min="10"
                  max="100"
                  step="1"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                  className="pl-9"
                  placeholder="e.g., 20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_order">Minimum Order (MK)</Label>
              <Input
                id="min_order"
                type="number"
                min="0"
                step="100"
                value={formData.min_order || ''}
                onChange={(e) => setFormData({...formData, min_order: e.target.value ? parseFloat(e.target.value) : null})}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_discount">Maximum Discount (MK)</Label>
              <Input
                id="max_discount"
                type="number"
                min="0"
                step="100"
                value={formData.max_discount || ''}
                onChange={(e) => setFormData({...formData, max_discount: e.target.value ? parseFloat(e.target.value) : null})}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({...formData, end_date: e.target.value || null})}
                min={formData.start_date}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_limit">Usage Limit</Label>
              <Input
                id="usage_limit"
                type="number"
                min="1"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null})}
                placeholder="Unlimited"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Active immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={showCreateDialog ? handleCreate : handleUpdate}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {showCreateDialog ? 'Create Promotion' : 'Update Promotion'}
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
              This will permanently delete the promotion "{selectedPromotion?.code}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Promotions;