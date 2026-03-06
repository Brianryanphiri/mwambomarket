// src/pages/DeliveryPolicy.tsx
import PageLayout from '@/components/PageLayout';
import { Truck, MapPin, Clock, Package, CheckCircle } from 'lucide-react';

const DeliveryPolicy = () => {
  return (
    <PageLayout title="Delivery Policy" subtitle="Fast, reliable delivery to your doorstep">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold">Delivery Policy</h2>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Areas
              </h3>
              <p className="text-muted-foreground">
                We currently deliver to Lilongwe and Blantyre. Delivery to other areas may be 
                available upon request for a minimum order value.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Delivery Times
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p><span className="font-medium">Same-day delivery:</span> Order before 2PM</p>
                <p><span className="font-medium">Next-day delivery:</span> Orders after 2PM</p>
                <p><span className="font-medium">Express delivery:</span> Within 2 hours (MK 5,000)</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Delivery Fees
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p><span className="font-medium">Free delivery:</span> Orders above MK 50,000</p>
                <p><span className="font-medium">Standard delivery:</span> MK 2,500</p>
                <p><span className="font-medium">Express delivery:</span> MK 5,000</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Delivery Instructions
              </h3>
              <p className="text-muted-foreground">
                Our delivery person will call you 15 minutes before arrival. If you're not available, 
                we'll attempt delivery again. Missed deliveries may incur an additional fee.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DeliveryPolicy;