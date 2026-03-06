// src/pages/Terms.tsx
import { Link } from 'react-router-dom';
import { 
  Scale, FileText, AlertCircle, Shield, 
  CreditCard, Truck, RefreshCw, Users,
  ChevronRight, BookOpen, Gavel, Lock,
  Globe, Mail, Phone, Clock, HelpCircle
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  const lastUpdated = "February 20, 2025";
  const effectiveDate = "March 1, 2025";

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Scale className="w-4 h-4" />
                <span className="text-sm font-medium">Legal Information</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Terms &{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Conditions
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Please read these terms carefully before using our service. By accessing Mwambo Store, 
                you agree to be bound by these conditions.
              </p>
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <Badge variant="outline" className="px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Last Updated: {lastUpdated}
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Effective: {effectiveDate}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Quick Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: FileText, label: 'Terms of Service', href: '#terms' },
                { icon: Shield, label: 'Privacy Policy', href: '#privacy' },
                { icon: CreditCard, label: 'Payments', href: '#payments' },
                { icon: Truck, label: 'Shipping', href: '#shipping' },
                { icon: RefreshCw, label: 'Returns', href: '#returns' },
                { icon: Users, label: 'User Conduct', href: '#conduct' },
                { icon: Gavel, label: 'Legal', href: '#legal' },
                { icon: HelpCircle, label: 'FAQ', href: '#faq' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center p-4 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <item.icon className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-center">{item.label}</span>
                </a>
              ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    On this page
                  </h3>
                  <nav className="space-y-2">
                    {[
                      'Acceptance of Terms',
                      'Eligibility',
                      'Account Registration',
                      'Products & Pricing',
                      'Orders & Payment',
                      'Shipping & Delivery',
                      'Returns & Refunds',
                      'User Conduct',
                      'Intellectual Property',
                      'Limitation of Liability',
                      'Indemnification',
                      'Termination',
                      'Governing Law',
                      'Contact Information'
                    ].map((item) => (
                      <a
                        key={item}
                        href={`#${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-primary/5"
                      >
                        {item}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Terms Content */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border border-border p-8 md:p-10">
                  <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                    
                    {/* Introduction */}
                    <div className="bg-primary/5 rounded-xl p-6 mb-8">
                      <h2 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-primary" />
                        Introduction
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Welcome to Mwambo Store. These Terms and Conditions govern your use of our website, 
                        mobile application, and services. By accessing or using Mwambo Store, you agree to be 
                        bound by these Terms and our Privacy Policy. If you do not agree to any part of these 
                        terms, please do not use our services.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> These terms constitute a legally binding agreement between you 
                        and Mwambo Store (Mwambo Enterprises Ltd). Please read them carefully.
                      </p>
                    </div>

                    <Accordion type="multiple" className="space-y-4">
                      {/* Section 1 */}
                      <AccordionItem value="item-1" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            By accessing or using Mwambo Store's services, you agree to be bound by these Terms 
                            and Conditions. If you do not agree to all terms, please do not use our services.
                          </p>
                          <p className="text-muted-foreground">
                            We reserve the right to update, change, or replace any part of these Terms by posting 
                            updates and changes to our website. It is your responsibility to check this page 
                            periodically for changes. Your continued use of or access to the website following 
                            the posting of any changes constitutes acceptance of those changes.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 2 */}
                      <AccordionItem value="item-2" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">2. Eligibility</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            You must be at least 18 years old to use our service. By using Mwambo Store, you 
                            represent and warrant that you:
                          </p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Are at least 18 years of age</li>
                            <li>Have the legal capacity to enter into a binding contract</li>
                            <li>Are not located in a country that is subject to trade sanctions</li>
                            <li>Will provide accurate, current, and complete information</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 3 */}
                      <AccordionItem value="item-3" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">3. Account Registration</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            To access certain features, you may need to create an account. You are responsible 
                            for maintaining the confidentiality of your account credentials and for all activities 
                            that occur under your account.
                          </p>
                          <p className="text-muted-foreground">
                            You agree to notify us immediately of any unauthorized use of your account. We 
                            reserve the right to refuse service, terminate accounts, remove or edit content, 
                            or cancel orders at our sole discretion.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 4 */}
                      <AccordionItem value="item-4" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">4. Products & Pricing</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            All prices are in Malawian Kwacha (MK) and include VAT where applicable. We strive 
                            to display accurate pricing information, but errors may occur.
                          </p>
                          <p className="text-muted-foreground mb-3">
                            <strong>Pricing Policy:</strong>
                          </p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Prices are subject to change without notice</li>
                            <li>We reserve the right to modify or discontinue products</li>
                            <li>In case of pricing errors, we will contact you before processing</li>
                            <li>Promotional codes and discounts cannot be combined</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 5 */}
                      <AccordionItem value="item-5" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">5. Orders & Payment</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            We accept various payment methods including mobile money, credit/debit cards, and 
                            bank transfers. By placing an order, you authorize us to charge your chosen payment 
                            method.
                          </p>
                          <p className="text-muted-foreground mb-3">
                            <strong>Order Acceptance:</strong> We reserve the right to refuse or cancel any 
                            order for reasons including but not limited to:
                          </p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Product availability issues</li>
                            <li>Errors in product or pricing information</li>
                            <li>Suspected fraud or unauthorized transactions</li>
                            <li>Shipping address verification failures</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 6 */}
                      <AccordionItem value="item-6" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">6. Shipping & Delivery</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            We strive to deliver products within the estimated timeframe, but delays may occur 
                            due to factors beyond our control.
                          </p>
                          <p className="text-muted-foreground mb-3">
                            <strong>Delivery Policy:</strong>
                          </p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Delivery times are estimates, not guarantees</li>
                            <li>Risk of loss passes to you upon delivery</li>
                            <li>You are responsible for providing accurate delivery information</li>
                            <li>Failed delivery attempts may incur additional fees</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 7 */}
                      <AccordionItem value="item-7" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">7. Returns & Refunds</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            Our return policy allows returns within 7 days of delivery for eligible items. 
                            Products must be unused and in original packaging.
                          </p>
                          <p className="text-muted-foreground mb-3">
                            <strong>Non-returnable items:</strong>
                          </p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Perishable goods</li>
                            <li>Personal care items</li>
                            <li>Opened electronics</li>
                            <li>Custom or personalized products</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 8 */}
                      <AccordionItem value="item-8" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">8. User Conduct</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            You agree not to use Mwambo Store for any unlawful purpose or in any way that 
                            could damage, disable, or impair our services.
                          </p>
                          <p className="text-muted-foreground mb-3">Prohibited activities include:</p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Attempting to gain unauthorized access to our systems</li>
                            <li>Interfering with other users' enjoyment of the service</li>
                            <li>Using bots or automated methods to access our services</li>
                            <li>Posting false, misleading, or fraudulent information</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 9 */}
                      <AccordionItem value="item-9" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">9. Intellectual Property</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            All content on Mwambo Store, including text, graphics, logos, images, and software, 
                            is the property of Mwambo Enterprises Ltd and is protected by copyright and other 
                            intellectual property laws.
                          </p>
                          <p className="text-muted-foreground">
                            You may not reproduce, distribute, modify, or create derivative works of any content 
                            without our express written permission.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 10 */}
                      <AccordionItem value="item-10" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">10. Limitation of Liability</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground">
                            To the fullest extent permitted by law, Mwambo Store shall not be liable for any 
                            indirect, incidental, special, consequential, or punitive damages, including without 
                            limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                            resulting from:
                          </p>
                          <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
                            <li>Your use or inability to use our service</li>
                            <li>Any products purchased or obtained through our service</li>
                            <li>Unauthorized access to or alteration of your data</li>
                            <li>Statements or conduct of any third party</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 11 */}
                      <AccordionItem value="item-11" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">11. Indemnification</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground">
                            You agree to indemnify, defend, and hold harmless Mwambo Store, its officers, 
                            directors, employees, and agents from and against any claims, liabilities, damages, 
                            losses, and expenses arising out of or in any way connected with:
                          </p>
                          <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
                            <li>Your use of our services</li>
                            <li>Your violation of these Terms</li>
                            <li>Your violation of any third-party rights</li>
                            <li>Any content you submit or post</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 12 */}
                      <AccordionItem value="item-12" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">12. Termination</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground">
                            We may terminate or suspend your account and bar access to our services immediately, 
                            without prior notice or liability, under our sole discretion, for any reason whatsoever, 
                            including without limitation if you breach the Terms.
                          </p>
                          <p className="text-muted-foreground mt-3">
                            Upon termination, your right to use the service will immediately cease. All provisions 
                            of the Terms which by their nature should survive termination shall survive, including 
                            ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 13 */}
                      <AccordionItem value="item-13" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold">13. Governing Law</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground">
                            These Terms shall be governed and construed in accordance with the laws of Malawi, 
                            without regard to its conflict of law provisions. Any disputes arising under or in 
                            connection with these Terms shall be subject to the exclusive jurisdiction of the 
                            courts of Malawi.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Contact Section */}
                    <div className="mt-10 pt-8 border-t border-border">
                      <h3 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Contact Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Email</p>
                              <a href="mailto:legal@mwambo.com" className="text-sm text-muted-foreground hover:text-primary">
                                legal@mwambo.com
                              </a>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Phone className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Phone</p>
                              <a href="tel:+265888123456" className="text-sm text-muted-foreground hover:text-primary">
                                +265 888 123 456
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Globe className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Address</p>
                              <p className="text-sm text-muted-foreground">
                                Mwambo Enterprises Ltd<br />
                                Area 47, Lilongwe<br />
                                Malawi
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Business Hours</p>
                              <p className="text-sm text-muted-foreground">
                                Mon-Fri: 8:00 AM - 5:00 PM<br />
                                Sat: 9:00 AM - 1:00 PM
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acknowledgment */}
                    <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/10">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-2">Acknowledgment</h4>
                          <p className="text-sm text-muted-foreground">
                            By using Mwambo Store, you acknowledge that you have read these Terms and Conditions, 
                            understand them, and agree to be bound by them. If you have any questions about these 
                            terms, please contact our legal department.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Last updated notice */}
                    <div className="mt-8 text-sm text-muted-foreground text-center">
                      <p>Last updated: {lastUpdated} | Effective date: {effectiveDate}</p>
                      <p className="mt-2">
                        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        {' · '}
                        <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link>
                        {' · '}
                        <Link to="/faq" className="text-primary hover:underline">FAQ</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;