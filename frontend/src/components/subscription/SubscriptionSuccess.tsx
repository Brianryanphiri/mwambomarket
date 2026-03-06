import { CheckCircle, Mail, Calendar, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface SubscriptionSuccessProps {
  subscription: {
    subscriptionNumber: string;
    planName: string;
    customerName: string;
    startDate: string;
    nextDeliveryDate: string;
    totalPaid: number;
    managementLink: string;
  };
}

export const SubscriptionSuccess = ({ subscription }: SubscriptionSuccessProps) => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Subscription Confirmed!</CardTitle>
        <CardDescription>
          Your subscription has been successfully created
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm text-muted-foreground">Subscription Number</p>
          <p className="text-xl font-mono font-bold">{subscription.subscriptionNumber}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">{subscription.planName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="font-medium">{subscription.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">First Delivery</p>
            <p className="font-medium">{new Date(subscription.nextDeliveryDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount Paid</p>
            <p className="font-medium">MK {subscription.totalPaid.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            Check Your Email
          </h3>
          <p className="text-sm text-muted-foreground">
            We've sent you a management link. Use it to:
          </p>
          <ul className="text-sm space-y-1 mt-2">
            <li className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Change delivery day or time
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Update delivery address
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              Pause or cancel subscription
            </li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You can also manage your subscription using your subscription number and email/phone.
        </p>
      </CardContent>

      <CardFooter className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
        <Button onClick={() => window.open(subscription.managementLink, '_blank')}>
          Manage Subscription
        </Button>
      </CardFooter>
    </Card>
  );
};