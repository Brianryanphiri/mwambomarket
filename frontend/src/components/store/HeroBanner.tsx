import { ShoppingCart, Package, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-grocery.jpg';

const HeroBanner = () => {
  return (
    <section className="relative min-h-[520px] md:min-h-[600px] flex items-center overflow-hidden">
      <img
        src={heroImage}
        alt="Fresh groceries beautifully arranged"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="hero-overlay absolute inset-0" />
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-1.5 text-primary-foreground text-sm">
            <span className="w-2 h-2 rounded-full bg-store-success animate-pulse" />
            Now delivering in Lilongwe & Blantyre
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight">
            Groceries Delivered
            <br />
            <span className="text-store-amber">To Your Door</span>
            <br />
            Fast & Fresh
          </h2>
          
          <p className="text-lg text-primary-foreground/80 max-w-lg font-light">
            From daily essentials to family packages — we make grocery shopping simple, 
            affordable, and stress-free.
          </p>
          
          <div className="flex flex-wrap gap-3 pt-2">
            <Button className="store-gradient text-primary-foreground h-12 px-7 text-base font-semibold rounded-xl hover:opacity-90 transition-opacity gap-2">
              <ShoppingCart className="w-4 h-4" />
              Shop Now
            </Button>
            <Button variant="outline" className="h-12 px-7 text-base font-semibold rounded-xl bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground gap-2">
              <Package className="w-4 h-4" />
              Family Packages
            </Button>
            <Button variant="outline" className="h-12 px-7 text-base font-semibold rounded-xl bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground gap-2">
              <RefreshCw className="w-4 h-4" />
              Subscribe & Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
