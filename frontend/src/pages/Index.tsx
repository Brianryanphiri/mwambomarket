import Header from '@/components/store/Header';
import HeroBanner from '@/components/store/HeroBanner';
import Categories from '@/components/store/Categories';
import FeaturedProducts from '@/components/store/FeaturedProducts';
import FamilyPackages from '@/components/store/Services';
import DailyEssentials from '@/components/store/DailyEssentials';
import SpecialPacks from '@/components/store/BrandPartners';
import SubscriptionSection from '@/components/store/SubscriptionSection';
import MobileAppSection from '@/components/store/MobileAppSection';
import Newsletter from '@/components/store/Newsletter';
import TrustBanner from '@/components/store/TrustBanner';
import Footer from '@/components/store/Footer';
import Services from '@/components/store/Services';
import BrandPartners from '@/components/store/BrandPartners';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <Categories />
      <FeaturedProducts />
      <Services />
      <DailyEssentials />
      <BrandPartners />
      <SubscriptionSection />
      <MobileAppSection />
      <Newsletter />
      <TrustBanner />
      <Footer />
    </div>
  );
};

export default Index;
