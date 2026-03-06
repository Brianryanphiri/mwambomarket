// src/pages/FAQ.tsx
import { useState } from 'react';
import { 
  HelpCircle, Search, Truck, CreditCard, 
  RotateCcw, Package, User, ShoppingBag,
  ChevronDown, ChevronUp, Mail,
  Phone
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'delivery', name: 'Delivery', icon: Truck },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'returns', name: 'Returns & Refunds', icon: RotateCcw },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'account', name: 'Account', icon: User },
  ];

  const faqs = [
    {
      category: 'delivery',
      question: 'How long does delivery take?',
      answer: 'We offer same-day delivery for orders placed before 2 PM. Orders after 2 PM are delivered the next day. Express delivery is available within 2 hours for an additional fee.'
    },
    {
      category: 'delivery',
      question: 'What areas do you deliver to?',
      answer: 'We currently deliver to Lilongwe and Blantyre. More cities coming soon!'
    },
    {
      category: 'delivery',
      question: 'How much is delivery?',
      answer: 'Delivery is free for orders above MK 50,000. For orders below MK 50,000, delivery is MK 2,500. Express delivery is MK 5,000.'
    },
    {
      category: 'delivery',
      question: 'Can I schedule delivery for a specific time?',
      answer: 'Yes, you can choose a delivery time during checkout. We offer morning (8AM-12PM), afternoon (12PM-4PM), and evening (4PM-8PM) slots.'
    },
    {
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept Airtel Money, TNM Mpamba, Bank Transfer, and Cash on Delivery. Mobile money payments are processed instantly.'
    },
    {
      category: 'payment',
      question: 'Is it safe to pay online?',
      answer: 'Absolutely! We use secure encryption for all transactions. We never store your payment details.'
    },
    {
      category: 'payment',
      question: 'Do you offer payment on delivery?',
      answer: 'Yes, we offer Cash on Delivery. A small convenience fee of MK 500 applies.'
    },
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'You can return items within 24 hours of delivery if they are damaged or incorrect. Contact us immediately with photos of the issue.'
    },
    {
      category: 'returns',
      question: 'How do I get a refund?',
      answer: 'Refunds are processed within 3-5 business days to your original payment method. For cash on delivery, we can provide store credit or bank transfer.'
    },
    {
      category: 'returns',
      question: 'Can I cancel my order?',
      answer: 'Orders can be canceled before they are out for delivery. Contact us immediately if you need to cancel.'
    },
    {
      category: 'products',
      question: 'Are your products fresh?',
      answer: 'Yes! We source fresh produce daily from local farmers. Our dairy and meat products are delivered fresh multiple times a week.'
    },
    {
      category: 'products',
      question: 'Do you offer organic products?',
      answer: 'Yes, we have a selection of organic products. Look for the "Organic" badge on product pages.'
    },
    {
      category: 'products',
      question: 'What if an item is out of stock?',
      answer: 'We will notify you immediately and offer a substitute or refund. You can specify substitute preferences during checkout.'
    },
    {
      category: 'account',
      question: 'Do I need an account to order?',
      answer: 'No, you can checkout as a guest. However, creating an account lets you track orders and save your preferences.'
    },
    {
      category: 'account',
      question: 'How do I track my order?',
      answer: 'Use your order number and phone number on our Order Tracking page to see real-time updates.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout 
      title="Frequently Asked Questions" 
      subtitle="Find answers to common questions about our service"
    >
      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No questions found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Still have questions */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 to-store-amber/5 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-display font-semibold mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? We're here to help.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/contact">
              <Button className="store-gradient text-primary-foreground gap-2">
                <Mail className="w-4 h-4" />
                Contact Us
              </Button>
            </Link>
            <a href="tel:+265999123456">
              <Button variant="outline" className="gap-2">
                <Phone className="w-4 h-4" />
                Call Us
              </Button>
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQ;