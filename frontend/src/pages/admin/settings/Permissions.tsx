import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Save, 
  RefreshCw,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

interface PermissionMatrix {
  staff: Record<string, boolean>;
  manager: Record<string, boolean>;
  admin: Record<string, boolean>;
  super_admin: Record<string, boolean>;
}

interface PermissionsResponse {
  permissions: string[];
  matrix: PermissionMatrix;
  roleHierarchy: Record<string, string[]>;
}

const Permissions = () => {
  const [data, setData] = useState<PermissionsResponse | null>(null);
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const roles = [
    { id: 'staff', label: 'Staff', color: 'gray' },
    { id: 'manager', label: 'Manager', color: 'green' },
    { id: 'admin', label: 'Admin', color: 'blue' },
    { id: 'super_admin', label: 'Super Admin', color: 'purple' }
  ];

  const permissionLabels: Record<string, string> = {
    view_orders: 'View Orders',
    manage_orders: 'Manage Orders',
    manage_products: 'Manage Products',
    manage_inventory: 'Manage Inventory',
    view_analytics: 'View Analytics',
    manage_settings: 'Manage Settings',
    manage_subscriptions: 'Manage Subscriptions',
    manage_marketing: 'Manage Marketing',
    manage_content: 'Manage Content',
    manage_users: 'Manage Users'
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/permissions');
      setData(response.data);
      setMatrix(response.data.matrix);
      setError(null);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permissions');
      toast({
        title: 'Error',
        description: 'Failed to load permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handlePermissionChange = (role: string, permission: string, checked: boolean) => {
    if (!matrix) return;
    
    // Super admin permissions cannot be changed
    if (role === 'super_admin') return;

    setMatrix(prev => ({
      ...prev!,
      [role]: {
        ...prev![role as keyof PermissionMatrix],
        [permission]: checked
      }
    }));
  };

  const handleSave = async () => {
    if (!matrix) return;

    try {
      setSaving(true);
      await api.put('/admin/permissions', { matrix });
      toast({
        title: 'Success',
        description: 'Permissions updated successfully',
      });
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast({
        title: 'Error',
        description: 'Failed to save permissions',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !data || !matrix) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold">Permissions</h1>
            <p className="text-muted-foreground mt-1">Manage role permissions</p>
          </div>
          <Button variant="outline" onClick={fetchPermissions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Failed to load permissions</p>
            <p className="text-sm text-muted-foreground">
              {error || 'Please try again later'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage role permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPermissions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Configure which permissions each role has. Super Admin always has all permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Permission</TableHead>
                  {roles.map(role => (
                    <TableHead key={role.id} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge className={`bg-${role.color}-100 text-${role.color}-800`}>
                          {role.label}
                        </Badge>
                        {role.id === 'super_admin' && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.permissions.map(permission => (
                  <TableRow key={permission}>
                    <TableCell className="font-medium">
                      {permissionLabels[permission] || permission}
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={`${permission}-${role.id}`} className="text-center">
                        {role.id === 'super_admin' ? (
                          <Checkbox 
                            checked={true}
                            disabled
                            className="border-purple-500 data-[state=checked]:bg-purple-500"
                          />
                        ) : (
                          <Checkbox 
                            checked={matrix[role.id as keyof PermissionMatrix]?.[permission] || false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(role.id, permission, checked as boolean)
                            }
                          />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-medium mb-2">Role Hierarchy</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-purple-600">Super Admin:</span> Full system access, can manage users and permissions</p>
              <p><span className="font-medium text-blue-600">Admin:</span> Can manage all aspects except user management</p>
              <p><span className="font-medium text-green-600">Manager:</span> Can manage orders, products, and view analytics</p>
              <p><span className="font-medium text-gray-600">Staff:</span> Limited to viewing and processing orders</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;