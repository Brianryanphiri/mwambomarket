// src/components/PageLayout.tsx
import { ReactNode } from 'react';
import Header from './store/Header';
import Footer from './store/Footer';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const PageLayout = ({ children, title, subtitle }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent pt-12 pb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default PageLayout;