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
  Percent, 
  Save, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

interface TaxSettings {
  tax_enabled: string;
  tax_rate: string;
  tax_name: string;
  tax_tpin: string;
  tax_show_on_invoice: string;
  tax_prices_include: string;
}

const TaxSettings = () => {
  const [settings, setSettings] = useState<TaxSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings/tax');
      setSettings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tax settings:', err);
      setError('Failed to load tax settings');
      toast({
        title: 'Error',
        description: 'Failed to load tax settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleChange = (field: keyof TaxSettings, checked: boolean) => {
    if (!settings) return;
    setSettings(prev => ({ ...prev!, [field]: checked.toString() }));
  };

  const handleInputChange = (field: keyof TaxSettings, value: string) => {
    if (!settings) return;
    setSettings(prev => ({ ...prev!, [field]: value }));
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await api.put('/admin/settings/tax', settings);
      toast({
        title: 'Success',
        description: 'Tax settings saved successfully',
      });
    } catch (err) {
      console.error('Error saving tax settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to save tax settings',
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

  if (error || !settings) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold">Tax Settings</h1>
            <p className="text-muted-foreground mt-1">Configure tax rates</p>
          </div>
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Percent className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Failed to load tax settings</p>
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
          <h1 className="text-3xl font-display font-bold">Tax Settings</h1>
          <p className="text-muted-foreground mt-1">Configure tax rates</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Tax Configuration
          </CardTitle>
          <CardDescription>
            Configure VAT and tax settings (Malawi VAT is 16.5%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Tax</Label>
              <p className="text-sm text-muted-foreground">
                Apply tax to all orders
              </p>
            </div>
            <Switch
              checked={settings.tax_enabled === 'true'}
              onCheckedChange={(checked) => handleToggleChange('tax_enabled', checked)}
            />
          </div>

          {settings.tax_enabled === 'true' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_name">Tax Name</Label>
                  <Input
                    id="tax_name"
                    value={settings.tax_name}
                    onChange={(e) => handleInputChange('tax_name', e.target.value)}
                    placeholder="VAT"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.tax_rate}
                    onChange={(e) => handleInputChange('tax_rate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_tpin">TPIN Number</Label>
                <Input
                  id="tax_tpin"
                  value={settings.tax_tpin}
                  onChange={(e) => handleInputChange('tax_tpin', e.target.value)}
                  placeholder="1234567890"
                />
                <p className="text-sm text-muted-foreground">
                  Your Taxpayer Identification Number (TPIN)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Tax on Invoice</Label>
                  <p className="text-sm text-muted-foreground">
                    Display tax breakdown on customer invoices
                  </p>
                </div>
                <Switch
                  checked={settings.tax_show_on_invoice === 'true'}
                  onCheckedChange={(checked) => handleToggleChange('tax_show_on_invoice', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Prices Include Tax</Label>
                  <p className="text-sm text-muted-foreground">
                    Product prices already include tax
                  </p>
                </div>
                <Switch
                  checked={settings.tax_prices_include === 'true'}
                  onCheckedChange={(checked) => handleToggleChange('tax_prices_include', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxSettings;