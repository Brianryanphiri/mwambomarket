import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Percent, Save, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TaxSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Tax Settings</h1>
          <p className="text-muted-foreground mt-1">Configure tax rates</p>
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
          <CardTitle>Tax Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tax Name</Label>
              <Input defaultValue="VAT" />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input type="number" defaultValue="16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="taxIncluded" defaultChecked className="rounded" />
            <Label htmlFor="taxIncluded">Prices include tax</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxSettings;