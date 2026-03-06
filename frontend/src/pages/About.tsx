// src/pages/About.tsx
import { 
  Heart, Target, Eye, Award, Users, Truck,
  ShoppingBag, Leaf, Clock, Shield, Star,
  Quote, ChevronRight
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: Leaf,
      title: 'Freshness First',
      description: 'We source our products daily to ensure you get the freshest groceries.'
    },
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Same-day delivery to your doorstep in Lilongwe and Blantyre.'
    },
    {
      icon: Heart,
      title: 'Customer Love',
      description: 'We treat every customer like family, because you are.'
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'Every product is checked for quality before it reaches you.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'We support local farmers and businesses in Malawi.'
    },
    {
      icon: Award,
      title: 'Best Prices',
      description: 'Affordable prices without compromising on quality.'
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: 'The Beginning',
      description: 'Mwambo Store started as a small market stall in Lilongwe.'
    },
    {
      year: '2021',
      title: 'First Expansion',
      description: 'Opened our second location and launched phone ordering.'
    },
    {
      year: '2022',
      title: 'Going Digital',
      description: 'Launched our online store with delivery service.'
    },
    {
      year: '2023',
      title: 'Growing Fast',
      description: 'Expanded to Blantyre and reached 5000+ customers.'
    },
    {
      year: '2024',
      title: 'Today',
      description: 'Serving thousands of families with the freshest groceries.'
    }
  ];

  const testimonials = [
    {
      name: 'Mary Banda',
      role: 'Regular Customer',
      content: 'Mwambo Store has changed how I shop for groceries. Fresh produce delivered on time, every time!',
      rating: 5,
      image: 'MB'
    },
    {
      name: 'John Phiri',
      role: 'Family Package Subscriber',
      content: 'The family packages save us so much money. Quality is always excellent.',
      rating: 5,
      image: 'JP'
    },
    {
      name: 'Grace Mwale',
      role: 'Loyal Customer',
      content: 'Best grocery service in Malawi. The team is always friendly and helpful.',
      rating: 5,
      image: 'GM'
    }
  ];

  return (
    <PageLayout 
      title="About Mwambo Store" 
      subtitle="Your trusted grocery partner in Malawi since 2020"
    >
      {/* Hero Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <Badge className="mb-4 bg-primary/10 text-primary border-none px-4 py-1">
            Our Story
          </Badge>
          <h2 className="text-3xl font-display font-bold mb-4">
            From a Small Dream to Your Doorstep
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Mwambo Store started with a simple idea: make grocery shopping easier, 
            faster, and more affordable for Malawian families. What began as a small 
            market stall in Lilongwe has grown into a trusted online grocery service 
            serving thousands of customers across Malawi.
          </p>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Today, we're proud to be one of Malawi's fastest-growing online grocery 
            platforms, connecting local farmers and suppliers directly to your kitchen. 
            We believe in fresh food, fair prices, and friendly service.
          </p>
          <div className="flex gap-4">
            <div>
              <p className="text-3xl font-bold text-primary">5000+</p>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">100+</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">2</p>
              <p className="text-sm text-muted-foreground">Cities</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-8xl animate-pulse">🥬</div>
          </div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-store-amber rounded-2xl -z-10 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-store-green-light rounded-3xl -z-10 animate-pulse" />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-8 border border-primary/20">
          <Target className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-2xl font-display font-semibold mb-3">Our Mission</h3>
          <p className="text-muted-foreground">
            To make quality groceries accessible to every Malawian family through 
            convenient, reliable, and affordable online shopping.
          </p>
        </div>
        <div className="bg-gradient-to-br from-store-amber/10 to-transparent rounded-2xl p-8 border border-store-amber/20">
          <Eye className="w-12 h-12 text-store-amber mb-4" />
          <h3 className="text-2xl font-display font-semibold mb-3">Our Vision</h3>
          <p className="text-muted-foreground">
            To become Malawi's most trusted and beloved grocery delivery service, 
            known for freshness, reliability, and community impact.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-display font-bold text-center mb-12">
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-16">
        <h2 className="text-3xl font-display font-bold text-center mb-12">
          Our Journey
        </h2>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary via-store-amber to-transparent" />
          
          {timeline.map((item, index) => (
            <div
              key={index}
              className={`relative flex items-center ${
                index % 2 === 0 ? 'justify-start' : 'justify-end'
              } mb-8`}
            >
              <div className={`w-5/12 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all">
                  <Badge className="mb-2 bg-primary/10 text-primary border-none">
                    {item.year}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-card z-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-16">
        <h2 className="text-3xl font-display font-bold text-center mb-4">
          What Our Customers Say
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Don't just take our word for it
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-muted-foreground mb-4 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-store-amber text-store-amber" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary/10 via-store-amber/10 to-primary/10 rounded-3xl p-12 text-center">
        <h2 className="text-3xl font-display font-bold mb-4">
          Ready to Experience the Mwambo Difference?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of happy customers who trust us for their daily groceries
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/products">
            <Button className="store-gradient text-primary-foreground h-12 px-8 gap-2">
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="h-12 px-8 gap-2">
              <Heart className="w-4 h-4" />
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default About;