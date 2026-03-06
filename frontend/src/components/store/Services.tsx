// src/components/store/Services.tsx
import { Link } from 'react-router-dom';
import { 
  Users, Sun, Calendar, Briefcase, GraduationCap, Zap,
  ArrowRight, Sparkles, Clock, Coffee, Heart, Award,
  Leaf, Package, ShoppingBag, Star, Rocket, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const services = [
  {
    id: 'family',
    title: 'Family Packages',
    description: 'Curated bundles for 2, 4, or 6+ family members',
    icon: Users,
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    link: '/family-packages',
    badge: 'Save 25%',
    features: ['Meal plans', 'Bulk savings', 'Weekly delivery']
  },
  {
    id: 'daily',
    title: 'Daily Fresh',
    description: 'Fresh produce, bread, and dairy delivered daily',
    icon: Sun,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    link: '/daily-fresh',
    badge: 'Fresh',
    features: ['Morning harvest', 'Same-day', 'Quality guaranteed']
  },
  {
    id: 'subscriptions',
    title: 'Smart Subscriptions',
    description: 'Never run out of essentials. Auto-delivery at your pace',
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    link: '/subscriptions',
    badge: 'Save 20%',
    features: ['Skip anytime', 'Flexible dates', 'Priority support']
  },
  {
    id: 'office',
    title: 'Office Packs',
    description: 'Keep your team productive with office essentials',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    link: '/office-packs',
    badge: 'Business',
    features: ['Bulk pricing', 'Corporate accounts', 'Monthly billing']
  },
  {
    id: 'student',
    title: 'Student Packs',
    description: 'Budget-friendly essentials for campus life',
    icon: GraduationCap,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    link: '/student-packs',
    badge: '-30% off',
    features: ['Student ID required', 'Meal plans', 'Exam specials']
  },
  {
    id: 'express',
    title: 'Express Delivery',
    description: 'Need it now? Get groceries in as little as 15 minutes',
    icon: Zap,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    link: '/express-delivery',
    badge: '15 min',
    features: ['Real-time tracking', '24/7 service', 'On-time guarantee']
  }
];

const Services = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-none px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1 inline" />
            Our Services
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            More Than Just <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Groceries</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our specialized services designed to make your life easier, 
            whether you're feeding a family, running an office, or studying late.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            
            return (
              <Link
                key={service.id}
                to={service.link}
                className="group relative bg-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Animated gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Decorative circles */}
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/5 to-transparent group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative p-6 lg:p-8">
                  {/* Header with icon and badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-2xl ${service.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${service.textColor}`} />
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none group-hover:scale-105 transition-transform">
                      {service.badge}
                    </Badge>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.color}`} />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-between group-hover:translate-x-2 transition-transform duration-300">
                    <span className={`text-sm font-semibold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>
                      Learn More
                    </span>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center text-white transform group-hover:rotate-45 transition-transform duration-300`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Bottom gradient line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </div>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-20 h-20">
                  <div className={`absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-transparent group-hover:border-${service.textColor} transition-all duration-500`} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border rounded-full px-6 py-3">
            <Heart className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-muted-foreground">
              Not sure which service fits you best? 
            </span>
            <Link to="/contact" className="text-primary font-semibold hover:underline flex items-center gap-1">
              Talk to us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { icon: Users, label: 'Happy Families', value: '5,000+' },
            { icon: Package, label: 'Monthly Orders', value: '15,000+' },
            { icon: Clock, label: 'Avg. Delivery', value: '32 min' },
            { icon: Award, label: 'Satisfaction', value: '98%' }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="text-center group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .group {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default Services;