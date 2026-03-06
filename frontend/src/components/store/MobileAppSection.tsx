import { Smartphone, Bell, MapPin, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import appMockup from '@/assets/app-mockup.jpg';

const features = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Order groceries in under 60 seconds' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Get alerts on deals & delivery updates' },
  { icon: MapPin, title: 'Live Tracking', desc: 'Track your delivery in real-time on a map' },
];

const MobileAppSection = () => {
  return (
    <section className="py-20 bg-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Smartphone className="w-4 h-4" />
                Coming Soon
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground leading-tight">
                Mwambo Store
                <br />
                <span className="text-store-amber">In Your Pocket</span>
              </h2>
              <p className="text-primary-foreground/70 mt-4 text-lg max-w-md">
                Our mobile app is on the way. Shop even faster, track deliveries live, and get exclusive app-only deals.
              </p>
            </div>

            <div className="space-y-4">
              {features.map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-foreground text-sm">{f.title}</h3>
                    <p className="text-primary-foreground/60 text-sm mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="store-gradient text-primary-foreground h-12 px-7 text-base font-semibold rounded-xl hover:opacity-90 gap-2">
                <Bell className="w-4 h-4" />
                Notify Me When It's Ready
              </Button>
              <Button variant="outline" className="h-12 px-7 text-base font-semibold rounded-xl bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground gap-2">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-72 md:w-80">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />
              <img
                src={appMockup}
                alt="Mwambo Store Mobile App Preview"
                className="relative rounded-3xl store-shadow-hover w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;
