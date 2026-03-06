import { useState } from 'react';
import { Mail, Send, CheckCircle, TrendingUp, Tag, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  { icon: Tag, text: 'Exclusive deals & discounts' },
  { icon: TrendingUp, text: 'Weekly price drops' },
  { icon: Newspaper, text: 'New product announcements' },
];

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative bg-card rounded-3xl store-shadow-hover overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-store-amber/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative p-8 md:p-12 lg:p-16 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl store-gradient text-primary-foreground flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7" />
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Stay in the Loop</h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Subscribe to our newsletter for the latest deals, new arrivals, and weekly price drops.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-6 mb-8">
              {benefits.map(b => (
                <div key={b.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <b.icon className="w-4 h-4 text-primary" />
                  {b.text}
                </div>
              ))}
            </div>

            {subscribed ? (
              <div className="flex items-center justify-center gap-3 bg-store-green-light text-primary p-4 rounded-xl animate-fade-in">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">You're subscribed! Watch your inbox for amazing deals.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <Button type="submit" className="store-gradient text-primary-foreground h-12 px-6 rounded-xl font-semibold gap-2 hover:opacity-90">
                  Subscribe
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}

            <p className="text-xs text-muted-foreground mt-4">No spam, ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
