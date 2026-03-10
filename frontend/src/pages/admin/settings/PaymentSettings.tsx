import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, 
  Save, 
  RefreshCw, 
  Smartphone, 
  Landmark,
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

interface PaymentSettings {
  payment_cod_enabled: string;
  payment_airtel_enabled: string;
  payment_airtel_number: string;
  payment_tnm_enabled: string;
  payment_tnm_number: string;
  payment_bank_enabled: string;
  payment_bank_details: string;
}

const PaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings/payment');
      setSettings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      setError('Failed to load payment settings');
      toast({
        title: 'Error',
        description: 'Failed to load payment settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleChange = (field: keyof PaymentSettings, checked: boolean) => {
    if (!settings) return;
    setSettings(prev => ({ ...prev!, [field]: checked.toString() }));
  };

  const handleInputChange = (field: keyof PaymentSettings, value: string) => {
    if (!settings) return;
    setSettings(prev => ({ ...prev!, [field]: value }));
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await api.put('/admin/settings/payment', settings);
      toast({
        title: 'Success',
        description: 'Payment settings saved successfully',
      });
    } catch (err) {
      console.error('Error saving payment settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to save payment settings',
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
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
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
            <h1 className="text-3xl font-display font-bold">Payment Settings</h1>
            <p className="text-muted-foreground mt-1">Configure payment methods</p>
          </div>
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Failed to load payment settings</p>
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
          <h1 className="text-3xl font-display font-bold">Payment Settings</h1>
          <p className="text-muted-foreground mt-1">Configure payment methods</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cash on Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Cash on Delivery
            </CardTitle>
            <CardDescription>
              Accept cash payments on delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Cash on Delivery</Label>
                <p className="text-sm text-muted-foreground">
                  Customers can pay with cash when order arrives
                </p>
              </div>
              <Switch
                checked={settings.payment_cod_enabled === 'true'}
                onCheckedChange={(checked) => handleToggleChange('payment_cod_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Airtel Money */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Airtel Money
            </CardTitle>
            <CardDescription>
              Accept Airtel Money payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Airtel Money</Label>
              </div>
              <Switch
                checked={settings.payment_airtel_enabled === 'true'}
                onCheckedChange={(checked) => handleToggleChange('payment_airtel_enabled', checked)}
              />
            </div>
            
            {settings.payment_airtel_enabled === 'true' && (
              <div className="space-y-2">
                <Label htmlFor="airtel_number">Airtel Money Number</Label>
                <Input
                  id="airtel_number"
                  value={settings.payment_airtel_number}
                  onChange={(e) => handleInputChange('payment_airtel_number', e.target.value)}
                  placeholder="0999123456"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* TNM Mpamba */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              TNM Mpamba
            </CardTitle>
            <CardDescription>
              Accept TNM Mpamba payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable TNM Mpamba</Label>
              </div>
              <Switch
                checked={settings.payment_tnm_enabled === 'true'}
                onCheckedChange={(checked) => handleToggleChange('payment_tnm_enabled', checked)}
              />
            </div>
            
            {settings.payment_tnm_enabled === 'true' && (
              <div className="space-y-2">
                <Label htmlFor="tnm_number">TNM Mpamba Number</Label>
                <Input
                  id="tnm_number"
                  value={settings.payment_tnm_number}
                  onChange={(e) => handleInputChange('payment_tnm_number', e.target.value)}
                  placeholder="0888123456"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Transfer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Bank Transfer
            </CardTitle>
            <CardDescription>
              Accept bank transfer payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Bank Transfer</Label>
              </div>
              <Switch
                checked={settings.payment_bank_enabled === 'true'}
                onCheckedChange={(checked) => handleToggleChange('payment_bank_enabled', checked)}
              />
            </div>
            
            {settings.payment_bank_enabled === 'true' && (
              <div className="space-y-2">
                <Label htmlFor="bank_details">Bank Account Details</Label>
                <Textarea
                  id="bank_details"
                  value={settings.payment_bank_details}
                  onChange={(e) => handleInputChange('payment_bank_details', e.target.value)}
                  placeholder="Bank: NBS Bank&#10;Account: 1234567890&#10;Branch: City Centre"
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSettings;