import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Plus, RefreshCw, Download } from 'lucide-react';

const Discounts = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Discounts</h1>
          <p className="text-muted-foreground mt-1">Manage promotional discounts and coupons</p>
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
            New Discount
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Discount Management</p>
          <p className="text-sm text-muted-foreground">
            Create and manage discounts, coupons, and promotional offers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Discounts;