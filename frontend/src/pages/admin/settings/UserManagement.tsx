import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, RefreshCw, Download } from 'lucide-react';

const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage admin users and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">User Management</p>
          <p className="text-sm text-muted-foreground">
            Manage admin users, roles, and permissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;