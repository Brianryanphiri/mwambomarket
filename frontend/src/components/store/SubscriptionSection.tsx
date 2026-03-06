import { RefreshCw, Check, ArrowRight, Calendar, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Weekly Plan',
    price: 15000,
    period: '/week',
    features: ['Bread every 2 days', 'Milk daily', 'Vegetables every 3 days', 'Choose delivery time', 'Pause anytime'],
  },
  {
    name: 'Monthly Plan',
    price: 45000,
    period: '/month',
    features: ['Full grocery refill', 'Customizable items', 'Priority delivery', 'Choose delivery days', 'Save 15% vs single orders', 'Free delivery always'],
    popular: true,
  },
];

const SubscriptionSection = () => {
  return (
    <section className="py-16 store-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <RefreshCw className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Subscribe & Save</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Never Run Out of Essentials</h2>
          <p className="text-muted-foreground mt-2 text-lg max-w-xl mx-auto">
            Set it and forget it. We deliver your groceries on schedule so you never have to worry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`bg-card rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular ? 'store-shadow-hover ring-2 ring-primary' : 'store-shadow'
              }`}
            >
              {plan.popular && (
                <span className="inline-block store-gradient text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                  Best Value
                </span>
              )}
              <h3 className="font-display text-2xl font-bold text-foreground">{plan.name}</h3>
              <div className="mt-3 mb-6">
                <span className="text-4xl font-bold text-foreground">MK {plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-store-success shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button className={`w-full h-12 rounded-xl font-semibold text-base gap-2 ${
                plan.popular
                  ? 'store-gradient text-primary-foreground hover:opacity-90'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}>
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Delivery features */}
        <div className="grid sm:grid-cols-3 gap-6 mt-14 max-w-4xl mx-auto">
          {[
            { icon: Clock, title: 'Same Day Delivery', desc: 'Order before 2pm for same day' },
            { icon: Calendar, title: 'Scheduled Delivery', desc: 'Choose your date & time' },
            { icon: Package, title: 'Express Option', desc: 'Rush delivery within 2 hours' },
          ].map(feature => (
            <div key={feature.title} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-store-green-light text-primary flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionSection;
