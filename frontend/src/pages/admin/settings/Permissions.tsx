import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Save, RefreshCw } from 'lucide-react';

const Permissions = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage role permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Permission Management</p>
          <p className="text-sm text-muted-foreground">
            Configure permissions for different user roles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;