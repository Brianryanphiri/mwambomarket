import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage system settings</p>
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

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input defaultValue="Mwambo Store" />
                </div>
                <div className="space-y-2">
                  <Label>Store Email</Label>
                  <Input defaultValue="info@mwambostore.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+265 999 123 456" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input defaultValue="MWK" disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input defaultValue="Lilongwe, Malawi" />
              </div>

              <div className="flex items-center gap-2">
                <Switch id="maintenance" />
                <Label htmlFor="maintenance">Maintenance Mode</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card>
            <CardContent className="p-6 text-center">
              <SettingsIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Store Settings</p>
              <p className="text-sm text-muted-foreground">
                Configure store settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardContent className="p-6 text-center">
              <SettingsIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Email Settings</p>
              <p className="text-sm text-muted-foreground">
                Configure email templates and SMTP settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardContent className="p-6 text-center">
              <SettingsIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">SEO Settings</p>
              <p className="text-sm text-muted-foreground">
                Configure SEO meta tags and sitemap settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;