import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Save, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ShippingSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Shipping Settings</h1>
          <p className="text-muted-foreground mt-1">Configure shipping options</p>
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
        <CardHeader>
          <CardTitle>Shipping Zones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Zone Name</Label>
              <Input defaultValue="Lilongwe City" />
            </div>
            <div className="space-y-2">
              <Label>Delivery Fee (MK)</Label>
              <Input type="number" defaultValue="2000" />
            </div>
            <div className="space-y-2">
              <Label>Free Shipping Threshold (MK)</Label>
              <Input type="number" defaultValue="50000" />
            </div>
            <div className="space-y-2">
              <Label>Estimated Delivery (days)</Label>
              <Input defaultValue="1-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingSettings;