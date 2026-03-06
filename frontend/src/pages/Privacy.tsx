// src/pages/Privacy.tsx
import { Link } from 'react-router-dom';
import { 
  Shield, Lock, Eye, Database, Cookie,
  Mail, Phone, Globe, Clock, AlertCircle,
  CheckCircle, XCircle, Settings, UserCheck,
  FileText, Download, Trash2, Bell,
  ChevronRight, HelpCircle, ShieldCheck
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Privacy = () => {
  const lastUpdated = "February 20, 2025";
  const effectiveDate = "March 1, 2025";

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Your Privacy Matters</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Privacy{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Policy
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We take your privacy seriously. Learn how we collect, use, and protect your personal information.
              </p>
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <Badge variant="outline" className="px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Last Updated: {lastUpdated}
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  GDPR Compliant
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: Lock, label: '256-bit Encryption', desc: 'Bank-level security' },
                { icon: UserCheck, label: 'Privacy Shield', desc: 'Certified protection' },
                { icon: Eye, label: 'No Tracking', desc: 'We respect your privacy' },
                { icon: Shield, label: 'Data Protection', desc: 'GDPR compliant' },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 bg-card rounded-xl border border-border">
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Privacy Sections
                  </h3>
                  <nav className="space-y-2">
                    {[
                      'Information We Collect',
                      'How We Use Your Information',
                      'Information Sharing',
                      'Data Security',
                      'Your Rights',
                      'Cookies & Tracking',
                      'Children\'s Privacy',
                      'International Transfers',
                      'Data Retention',
                      'Changes to Policy',
                      'Contact Us'
                    ].map((item) => (
                      <a
                        key={item}
                        href={`#${item.toLowerCase().replace(/[&\s]/g, '-').replace(/--/g, '-')}`}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-primary/5"
                      >
                        {item}
                      </a>
                    ))}
                  </nav>

                  {/* Quick Contact */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-medium mb-3">Need help?</h4>
                    <Link to="/contact">
                      <Button variant="outline" className="w-full">
                        Contact Privacy Officer
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Privacy Content */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border border-border p-8 md:p-10">
                  <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                    
                    {/* Introduction */}
                    <div className="bg-blue-500/5 rounded-xl p-6 mb-8">
                      <h2 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500" />
                        Our Commitment to Privacy
                      </h2>
                      <p className="text-muted-foreground">
                        At Mwambo Store, we are committed to protecting your privacy and ensuring the security 
                        of your personal information. This Privacy Policy explains how we collect, use, disclose, 
                        and safeguard your information when you use our website, mobile application, and services.
                      </p>
                      <p className="text-sm text-muted-foreground mt-3">
                        By using Mwambo Store, you consent to the practices described in this policy.
                      </p>
                    </div>

                    <Accordion type="multiple" className="space-y-4">
                      {/* Section 1 */}
                      <AccordionItem value="item-1" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Database className="w-4 h-4 text-primary" />
                            1. Information We Collect
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Information You Provide Directly:</h4>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>Name and contact information (email, phone number, address)</li>
                              <li>Account credentials (username, password)</li>
                              <li>Payment information (processed securely by our partners)</li>
                              <li>Delivery preferences and instructions</li>
                              <li>Communications with customer support</li>
                              <li>Reviews and feedback you provide</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Information Collected Automatically:</h4>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>Device information (IP address, browser type, operating system)</li>
                              <li>Usage data (pages visited, time spent, clicks)</li>
                              <li>Location information (with your consent)</li>
                              <li>Cookies and similar tracking technologies</li>
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 2 */}
                      <AccordionItem value="item-2" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Eye className="w-4 h-4 text-primary" />
                            2. How We Use Your Information
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">We use your information for:</p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Order Processing:</strong> To process and deliver your orders, send order confirmations</li>
                            <li><strong>Account Management:</strong> To create and manage your account</li>
                            <li><strong>Customer Support:</strong> To respond to your inquiries and resolve issues</li>
                            <li><strong>Improvement:</strong> To analyze usage and improve our services</li>
                            <li><strong>Communications:</strong> To send updates, promotions (with consent), and important notices</li>
                            <li><strong>Security:</strong> To detect and prevent fraud or abuse</li>
                            <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                          </ul>
                          <p className="text-sm text-primary mt-3">
                            We NEVER sell your personal information to third parties.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 3 */}
                      <AccordionItem value="item-3" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-primary" />
                            3. Information Sharing
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">We may share your information with:</p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Delivery Partners:</strong> To facilitate product delivery</li>
                            <li><strong>Payment Processors:</strong> To process transactions securely</li>
                            <li><strong>Service Providers:</strong> Who assist in operating our business</li>
                            <li><strong>Legal Authorities:</strong> When required by law or to protect rights</li>
                          </ul>
                          <p className="text-muted-foreground mt-3">
                            All third-party providers are contractually obligated to protect your information 
                            and use it only for specified purposes.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 4 */}
                      <AccordionItem value="item-4" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Lock className="w-4 h-4 text-primary" />
                            4. Data Security
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            We implement comprehensive security measures to protect your information:
                          </p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>256-bit SSL encryption for all data transmission</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Access controls and authentication requirements</li>
                            <li>Secure data centers with 24/7 monitoring</li>
                            <li>Employee training on data protection</li>
                          </ul>
                          <p className="text-muted-foreground mt-3">
                            While we strive to protect your information, no method of transmission over the 
                            Internet is 100% secure. We encourage you to take precautions to protect your 
                            personal information.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 5 */}
                      <AccordionItem value="item-5" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-primary" />
                            5. Your Rights
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">You have the right to:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {[
                              'Access your personal data',
                              'Correct inaccurate data',
                              'Delete your data (right to be forgotten)',
                              'Restrict processing',
                              'Data portability',
                              'Object to processing',
                              'Withdraw consent',
                              'Lodge a complaint'
                            ].map((right) => (
                              <div key={right} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                <span>{right}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-muted-foreground">
                            To exercise these rights, contact our Privacy Officer at privacy@mwambostore.mw
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 6 */}
                      <AccordionItem value="item-6" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Cookie className="w-4 h-4 text-primary" />
                            6. Cookies & Tracking
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">
                            We use cookies and similar technologies to enhance your experience:
                          </p>
                          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                            <li><strong>Functional Cookies:</strong> Remember your preferences</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand site usage</li>
                            <li><strong>Marketing Cookies:</strong> Used only with your consent</li>
                          </ul>
                          <p className="text-muted-foreground mt-3">
                            You can control cookies through your browser settings. However, disabling certain 
                            cookies may affect site functionality.
                          </p>
                          <Link to="/cookie-preferences" className="text-primary hover:underline text-sm mt-2 inline-block">
                            Manage Cookie Preferences →
                          </Link>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 7 */}
                      <AccordionItem value="item-7" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            7. Children's Privacy
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground">
                            Our services are not directed to individuals under 18. We do not knowingly collect 
                            personal information from children. If you become aware that a child has provided 
                            us with personal information, please contact us immediately.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 8 */}
                      <AccordionItem value="item-8" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            8. International Data Transfers
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground">
                            Your information may be transferred to and processed in countries other than your own. 
                            We ensure appropriate safeguards are in place to protect your information in accordance 
                            with this policy and applicable laws.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 9 */}
                      <AccordionItem value="item-9" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Database className="w-4 h-4 text-primary" />
                            9. Data Retention
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground">
                            We retain your personal information for as long as necessary to fulfill the purposes 
                            outlined in this policy, unless a longer retention period is required or permitted by law. 
                            When we no longer need your information, we will securely delete or anonymize it.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Section 10 */}
                      <AccordionItem value="item-10" className="border rounded-lg px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            10. Changes to This Policy
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground">
                            We may update this Privacy Policy from time to time. We will notify you of any material 
                            changes by posting the new policy on this page and updating the "Last Updated" date. 
                            We encourage you to review this policy periodically.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Contact Section */}
                    <div className="mt-10 pt-8 border-t border-border">
                      <h3 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Privacy Contact Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-medium mb-4">Data Protection Officer</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-primary" />
                              <a href="mailto:dpo@mwambostore.mw" className="text-sm hover:text-primary">
                                dpo@mwambostore.mw
                              </a>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-primary" />
                              <a href="tel:+265888123457" className="text-sm hover:text-primary">
                                +265 888 123 457
                              </a>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-4">Privacy Officer</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-primary" />
                              <a href="mailto:privacy@mwambostore.mw" className="text-sm hover:text-primary">
                                privacy@mwambostore.mw
                              </a>
                            </div>
                            <div className="flex items-center gap-3">
                              <Globe className="w-4 h-4 text-primary" />
                              <span className="text-sm">
                                Mwambo Enterprises Ltd<br />
                                Area 47, Lilongwe<br />
                                Malawi
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data Request Section */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download Your Data
                          </CardTitle>
                          <CardDescription>
                            Request a copy of your personal information
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            Request Data Export
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete Your Account
                          </CardTitle>
                          <CardDescription>
                            Permanently delete your account and data
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="destructive" className="w-full">
                            Request Deletion
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground text-center">
                      <p>Last updated: {lastUpdated} | Effective date: {effectiveDate}</p>
                      <p className="mt-2">
                        <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                        {' · '}
                        <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>
                        {' · '}
                        <Link to="/gdpr" className="text-primary hover:underline">GDPR Compliance</Link>
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

export default Privacy;