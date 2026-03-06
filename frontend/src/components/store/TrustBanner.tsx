import { Truck, Shield, Headphones, Clock } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Same day delivery on orders placed before 2pm' },
  { icon: Shield, title: 'Quality Guaranteed', desc: 'Fresh products or your money back, always' },
  { icon: Headphones, title: '24/7 Support', desc: 'Call or WhatsApp us anytime for help' },
  { icon: Clock, title: 'Scheduled Orders', desc: 'Set a delivery schedule that works for you' },
];

const TrustBanner = () => {
  return (
    <section className="py-14 bg-store-green-light">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map(f => (
            <div key={f.title} className="text-center">
              <div className="w-12 h-12 rounded-xl store-gradient text-primary-foreground flex items-center justify-center mx-auto mb-3">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
