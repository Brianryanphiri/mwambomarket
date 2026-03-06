import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar, Loader2, Info } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import type { SubscriptionPlan } from '@/types/service.types';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan;
  onSuccess: (subscription: any) => void;
}

const deliveryDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const paymentMethods = [
  { value: 'cash', label: 'Cash on Delivery' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'tnm_mpamba', label: 'TNM Mpamba' },
  { value: 'card', label: 'Credit/Debit Card' }
];

// Helper function to format Malawi phone numbers
const formatMalawiPhone = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.length === 9) {
    // 991234567 -> +265991234567
    return '+265' + cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // 0991234567 -> +265991234567
    return '+265' + cleaned.slice(1);
  } else if (cleaned.length === 12 && cleaned.startsWith('265')) {
    // 265991234567 -> +265991234567
    return '+' + cleaned;
  } else if (cleaned.length === 13 && cleaned.startsWith('0265')) {
    // 0265991234567 -> +265991234567
    return '+265' + cleaned.slice(3);
  }
  
  // Return as is if it already has + and correct format
  if (phone.startsWith('+265') && phone.length === 13) {
    return phone;
  }
  
  // Default: assume it's a local number without 0
  return '+265' + cleaned;
};

export const SubscriptionModal = ({ open, onOpenChange, plan, onSuccess }: SubscriptionModalProps) => {
  const { createSubscription, loading } = useSubscription();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    startDate: '',
    deliveryDay: '',
    deliveryTime: '',
    deliveryAddress: '',
    deliveryInstructions: '',
    paymentMethod: '',
    paymentReference: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    try {
      // Format phone number to Malawi standard
      const formattedPhone = formatMalawiPhone(formData.customerPhone);
      console.log('Original phone:', formData.customerPhone);
      console.log('Formatted phone:', formattedPhone);
      
      // Calculate total price
      const totalPrice = plan.price + (plan.setupFee || 0);
      
      const subscriptionData = {
        planId: plan.id,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim().toLowerCase(),
        customerPhone: formattedPhone,
        startDate: formData.startDate,
        deliveryDay: formData.deliveryDay.toLowerCase(),
        deliveryTime: formData.deliveryTime || undefined,
        deliveryAddress: formData.deliveryAddress.trim(),
        deliveryInstructions: formData.deliveryInstructions.trim() || undefined,
        paymentMethod: formData.paymentMethod as 'cash' | 'airtel_money' | 'tnm_mpamba' | 'card',
        paymentReference: formData.paymentReference.trim() || undefined,
        totalPaid: totalPrice
      };
      
      console.log('Sending to backend:', subscriptionData);
      
      const result = await createSubscription(subscriptionData);
      
      console.log('Subscription created:', result);
      onSuccess(result.subscription);
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Subscribe to {plan.name}</DialogTitle>
          <DialogDescription>
            Fill in your details to start your subscription. No account needed!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              placeholder="0991234567"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter Malawi phone number (e.g., 0991234567 or 991234567)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                min={minDate}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDay">Delivery Day *</Label>
              <Select 
                value={formData.deliveryDay} 
                onValueChange={(value) => setFormData({...formData, deliveryDay: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryDays.map(day => (
                    <SelectItem key={day} value={day.toLowerCase()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Preferred Delivery Time (Optional)</Label>
            <Input
              id="deliveryTime"
              value={formData.deliveryTime}
              onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
              placeholder="e.g., Between 10am - 2pm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
              placeholder="Area, street, house number, landmarks..."
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              value={formData.deliveryInstructions}
              onChange={(e) => setFormData({...formData, deliveryInstructions: e.target.value})}
              placeholder="Any special instructions for delivery"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.paymentMethod && formData.paymentMethod !== 'cash' && (
            <div className="space-y-2">
              <Label htmlFor="paymentRef">Payment Reference</Label>
              <Input
                id="paymentRef"
                value={formData.paymentReference}
                onChange={(e) => setFormData({...formData, paymentReference: e.target.value})}
                placeholder="Transaction ID"
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Plan Price ({plan.interval})</span>
                <span>MK {plan.price.toLocaleString()}</span>
              </div>
              {plan.setupFee && plan.setupFee > 0 && (
                <div className="flex justify-between">
                  <span>Setup Fee</span>
                  <span>MK {plan.setupFee.toLocaleString()}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total Due Today</span>
                <span>MK {(plan.price + (plan.setupFee || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <p className="text-xs text-muted-foreground">
            By subscribing, you agree to our{" "}
            <button
              type="button"
              onClick={() => window.open('/terms', '_blank')}
              className="text-primary hover:underline"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => window.open('/privacy', '_blank')}
              className="text-primary hover:underline"
            >
              Privacy Policy
            </button>
            . You'll receive a management link via email.
          </p>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white min-w-[160px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Confirm Subscription
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};