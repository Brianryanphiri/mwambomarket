// src/pages/Contact.tsx
import { useState } from 'react';
import { 
  Phone, Mail, MapPin, Clock, Send, MessageCircle,
  Facebook, Twitter, Instagram, ChevronRight, CheckCircle,
  AlertCircle, HelpCircle
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+265 999 123 456', '+265 888 123 456'],
      action: 'Call now',
      href: 'tel:+265999123456',
      bg: 'bg-green-100',
      color: 'text-green-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: ['+265 999 123 456'],
      action: 'Chat with us',
      href: 'https://wa.me/265999123456',
      bg: 'bg-emerald-100',
      color: 'text-emerald-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@mwambostore.mw', 'support@mwambostore.mw'],
      action: 'Send email',
      href: 'mailto:info@mwambostore.mw',
      bg: 'bg-blue-100',
      color: 'text-blue-600'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Area 47, Lilongwe', 'Malawi'],
      action: 'Get directions',
      href: 'https://maps.google.com',
      bg: 'bg-purple-100',
      color: 'text-purple-600'
    }
  ];

  const faqs = [
    {
      question: 'What are your business hours?',
      answer: 'We are open Monday to Saturday from 8:00 AM to 6:00 PM. Sunday: 10:00 AM to 4:00 PM.'
    },
    {
      question: 'How fast is your response time?',
      answer: 'We typically respond within 1 hour during business hours. For urgent matters, please call us directly.'
    },
    {
      question: 'Do you have a physical store?',
      answer: 'Yes, you can visit our store in Area 47, Lilongwe. We also offer online ordering and delivery.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Use our Order Tracking page with your order number and phone number to track your delivery in real-time.'
    }
  ];

  return (
    <PageLayout 
      title="Contact Us" 
      subtitle="We're here to help! Reach out to us any way that's convenient for you."
    >
      {/* Quick Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <a
              key={index}
              href={method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${method.color}`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
              {method.details.map((detail, i) => (
                <p key={i} className="text-sm text-muted-foreground">{detail}</p>
              ))}
              <p className="text-sm text-primary mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
                {method.action} <ChevronRight className="w-3 h-3" />
              </p>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-2xl font-display font-semibold mb-6">Send us a Message</h2>
            
            {isSubmitted ? (
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">Message Sent!</h3>
                <p className="text-green-600">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="0999 123 456"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Subject *</label>
                    <Input
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Message *</label>
                  <Textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button type="submit" className="store-gradient text-primary-foreground h-12 px-8 gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Business Info */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 sticky top-[140px]">
            <h2 className="text-2xl font-display font-semibold mb-6">Business Hours</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Monday - Saturday</p>
                  <p className="text-sm text-muted-foreground">8:00 AM - 6:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Sunday</p>
                  <p className="text-sm text-muted-foreground">10:00 AM - 4:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Public Holidays</p>
                  <p className="text-sm text-muted-foreground">10:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium mb-2">Emergency Support</p>
              <p className="text-xs text-muted-foreground mb-3">
                For urgent issues outside business hours
              </p>
              <a 
                href="tel:+265999123456" 
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="w-3 h-3" />
                +265 999 123 456
              </a>
            </div>

            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center hover:scale-110 transition-transform">
                <Facebook className="w-5 h-5 text-blue-600" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center hover:scale-110 transition-transform">
                <Twitter className="w-5 h-5 text-sky-500" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center hover:scale-110 transition-transform">
                <Instagram className="w-5 h-5 text-pink-600" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-display font-semibold">Frequently Asked Questions</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 p-4 bg-primary/5 rounded-xl">
          <p className="text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              Can't find what you're looking for? {' '}
              <button className="text-primary hover:underline font-medium">
                Contact our support team
              </button>
            </span>
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;