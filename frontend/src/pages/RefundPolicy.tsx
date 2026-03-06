// src/pages/RefundPolicy.tsx
import PageLayout from '@/components/PageLayout';
import { RotateCcw, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <PageLayout title="Refund Policy" subtitle="Our commitment to your satisfaction">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold">Refund & Return Policy</h2>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">30-Day Satisfaction Guarantee</h3>
              <p className="text-muted-foreground">
                We want you to be completely satisfied with your purchase. If you're not happy 
                with a product, contact us within 24 hours of delivery.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Eligible for Refund
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Damaged or spoiled items (photo proof required)</li>
                <li>Wrong items delivered</li>
                <li>Items missing from order</li>
                <li>Quality issues reported immediately</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Not Eligible for Refund
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Perishable items after 24 hours</li>
                <li>Change of mind</li>
                <li>Items consumed or used</li>
                <li>Clearance or sale items</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Refund Processing Time
              </h3>
              <p className="text-muted-foreground">
                Refunds are processed within 3-5 business days after approval. The time it takes 
                for the refund to appear in your account depends on your payment method.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RefundPolicy;