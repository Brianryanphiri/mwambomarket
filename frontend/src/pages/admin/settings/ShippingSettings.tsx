import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Truck, 
  Save, 
  RefreshCw,
  Clock,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

interface ShippingSettings {
  shipping_default_fee: string;
  shipping_free_threshold: string;
  shipping_estimated_time: string;
  shipping_cutoff_time: string;
  shipping_free_enabled: string;
  shipping_same_day_enabled: string;
}

const ShippingSettings = () => {
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings/shipping');
      setSettings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching shipping settings:', err);
      setError('Failed to load shipping settings');
      toast({
        title: 'Error',
        description: 'Failed to load shipping settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleChange = (field: keyof ShippingSettings, checked: boolean) => {
    if (!settings) return;
    setSettings(prev => ({ ...prev!, [field]: checked.toString() }));
  };

  const handleInputChange = (field: keyof ShippingSettings, value: string) => {
    if (!settings) return;
    setSettings(prev => ({ ...prev!, [field]: value }));
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await api.put('/admin/settings/shipping', settings);
      toast({
        title: 'Success',
        description: 'Shipping settings saved successfully',
      });
    } catch (err) {
      console.error('Error saving shipping settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to save shipping settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
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
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold">Shipping Settings</h1>
            <p className="text-muted-foreground mt-1">Configure shipping options</p>
          </div>
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Failed to load shipping settings</p>
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
          <h1 className="text-3xl font-display font-bold">Shipping Settings</h1>
          <p className="text-muted-foreground mt-1">Configure shipping options</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSettings}>
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

      <div className="grid grid-cols-1 gap-6">
        {/* Shipping Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Rates
            </CardTitle>
            <CardDescription>
              Configure shipping fees and thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default_fee">Default Delivery Fee (MWK)</Label>
                <Input
                  id="default_fee"
                  type="number"
                  min="0"
                  value={settings.shipping_default_fee}
                  onChange={(e) => handleInputChange('shipping_default_fee', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(settings.shipping_default_fee)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="free_threshold">Free Delivery Threshold (MWK)</Label>
                <Input
                  id="free_threshold"
                  type="number"
                  min="0"
                  value={settings.shipping_free_threshold}
                  onChange={(e) => handleInputChange('shipping_free_threshold', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(settings.shipping_free_threshold)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Free Delivery</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically apply free shipping when order meets threshold
                </p>
              </div>
              <Switch
                checked={settings.shipping_free_enabled === 'true'}
                onCheckedChange={(checked) => handleToggleChange('shipping_free_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Delivery Times
            </CardTitle>
            <CardDescription>
              Configure delivery schedules and estimates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_time">Estimated Delivery Time</Label>
                <Input
                  id="estimated_time"
                  value={settings.shipping_estimated_time}
                  onChange={(e) => handleInputChange('shipping_estimated_time', e.target.value)}
                  placeholder="1-3 business days"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cutoff_time">Same-Day Cutoff Time</Label>
                <Input
                  id="cutoff_time"
                  type="time"
                  value={settings.shipping_cutoff_time}
                  onChange={(e) => handleInputChange('shipping_cutoff_time', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Same-Day Delivery</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to choose same-day delivery (if ordered before cutoff)
                </p>
              </div>
              <Switch
                checked={settings.shipping_same_day_enabled === 'true'}
                onCheckedChange={(checked) => handleToggleChange('shipping_same_day_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShippingSettings;