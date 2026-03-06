import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Plus, RefreshCw, Download } from 'lucide-react';

const Warehouse = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Warehouse</h1>
          <p className="text-muted-foreground mt-1">Manage inventory and stock</p>
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
        </div>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Warehouse Management</p>
          <p className="text-sm text-muted-foreground">
            Track inventory levels, stock movements, and warehouse operations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Warehouse;