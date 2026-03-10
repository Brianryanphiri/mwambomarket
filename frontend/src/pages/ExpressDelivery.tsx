import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Clock, Truck, MapPin, Phone, Mail,
  CheckCircle, AlertCircle, Award, Star,
  Navigation, Battery, Thermometer, Wind,
  Shield, CreditCard, Users, Package,
  ChevronRight, Timer, Target, Gauge,
  Sparkles, Flame, Heart, RefreshCw,
  ShoppingBag, Map, Compass, Route,
  Bike, Car, Footprints, Activity,
  TrendingUp, BadgeCheck, BellRing,
  Locate, LocateFixed, Waypoints,
  Radar, Satellite, Signal,
  CloudSun, CloudRain, CloudSnow,
  Factory, Store, Building2,
  Calendar, X, Copy, CircleCheck,
  CircleAlert, CircleDollarSign,
  CircleDot, CircleSlash, CircleUser,
  CirclePower, CircleArrowOutUpRight,
  Loader2
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { serviceService } from '@/services/serviceService';
import type { DeliveryZone, DeliverySlot } from '@/types/service.types';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Skeleton loader
const ZoneCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="h-4 bg-muted rounded w-3/4 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </CardContent>
  </Card>
);

const ExpressDelivery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postcode, setPostcode] = useState('');
  const [isZoneChecked, setIsZoneChecked] = useState(false);
  const [inZone, setInZone] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [urgency, setUrgency] = useState<'normal' | 'express' | 'flash'>('normal');
  const [trackingMode, setTrackingMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 45, seconds: 0 });
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [showFlashSale, setShowFlashSale] = useState(true);
  const [deliveryProgress, setDeliveryProgress] = useState(0);

  // Simulate real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch delivery data
  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching delivery zones...');
      const zonesData = await serviceService.getDeliveryZones();
      console.log('Fetched zones:', zonesData);
      setZones(zonesData);

      console.log('Fetching delivery slots...');
      const slotsData = await serviceService.getDeliverySlots();
      console.log('Fetched slots:', slotsData);
      setSlots(slotsData);
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      setError('Failed to load delivery information');
      toast({
        title: 'Error',
        description: 'Failed to load delivery information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Simulate active delivery tracking
  useEffect(() => {
    if (trackingMode) {
      setActiveDelivery({
        id: 'DEL' + Math.floor(Math.random() * 1000),
        status: 'on-way',
        driver: 'James Banda',
        vehicle: 'Toyota Hilux - AB 1234',
        eta: '12 minutes',
        location: 'Area 47, Lilongwe',
        progress: 65
      });

      // Simulate progress updates
      const interval = setInterval(() => {
        setDeliveryProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [trackingMode]);

  // Update delivery progress
  useEffect(() => {
    if (activeDelivery) {
      setActiveDelivery(prev => prev ? { ...prev, progress: deliveryProgress } : null);
    }
  }, [deliveryProgress]);

  const checkZone = () => {
    // Simulate zone check based on available zones
    if (postcode.length > 2) {
      setIsZoneChecked(true);
      // Random check for demo - in real app, would check against actual zones
      setInZone(Math.random() > 0.3);
      
      if (Math.random() > 0.3) {
        toast({
          title: 'Available!',
          description: 'We deliver to your area',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Not Available',
          description: 'We don\'t deliver to this area yet',
          variant: 'destructive',
          duration: 3000,
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'preparing': return 'bg-yellow-500';
      case 'picked-up': return 'bg-blue-500';
      case 'on-way': return 'bg-green-500';
      case 'arriving': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'preparing': return Package;
      case 'picked-up': return Bike;
      case 'on-way': return Car;
      case 'arriving': return MapPin;
      default: return Truck;
    }
  };

  const getCoverageBadge = (coverage: string) => {
    switch(coverage) {
      case 'full':
        return <Badge className="bg-green-500 text-white border-none">Full Coverage</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500 text-white border-none">Partial Coverage</Badge>;
      case 'coming':
        return <Badge className="bg-blue-500 text-white border-none">Coming Soon</Badge>;
      default:
        return <Badge variant="outline">{coverage}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <ZoneCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-red-50 to-yellow-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-yellow-950/20">
      <Header />
      
      {/* Flash Sale Banner */}
      {showFlashSale && (
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-300 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="container mx-auto px-4 flex items-center justify-between relative z-10 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 animate-pulse" />
              <span className="font-bold text-lg">FLASH SALE:</span>
              <span>50% off express delivery for the next</span>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 font-mono text-xl">
                {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
              </div>
            </div>
            <button 
              onClick={() => setShowFlashSale(false)} 
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 overflow-hidden">
        {/* Speed lines animation */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 bg-white/10 animate-speed-line"
              style={{
                top: `${i * 6}%`,
                left: '-10%',
                width: '20%',
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Floating delivery icons */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-float">
            <Bike className="w-20 h-20 text-white" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float-delayed">
            <Car className="w-24 h-24 text-white" />
          </div>
          <div className="absolute top-1/2 right-1/4 animate-float-slow">
            <Truck className="w-16 h-16 text-white" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Urgency selector */}
            <div className="mb-8 flex flex-wrap gap-3 justify-center">
              {(['normal', 'express', 'flash'] as const).map((level) => {
                const Icon = level === 'flash' ? Flame : level === 'express' ? Zap : Truck;
                return (
                  <button
                    key={level}
                    onClick={() => setUrgency(level)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      urgency === level
                        ? 'bg-white text-orange-600 scale-110 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{level}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative mb-8">
              <div className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 ${
                urgency === 'flash' ? 'animate-pulse' : ''
              }`}>
                {urgency === 'flash' ? (
                  <Flame className="w-6 h-6" />
                ) : urgency === 'express' ? (
                  <Zap className="w-6 h-6" />
                ) : (
                  <Truck className="w-6 h-6" />
                )}
                <span className="text-lg font-medium">
                  {urgency === 'flash' ? 'Flash Delivery' : 
                   urgency === 'express' ? 'Express Delivery' : 
                   'Standard Delivery'}
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Get groceries delivered{' '}
              <span className="text-yellow-300">in 2-4 hours</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              When you need it now. Fast, reliable delivery to your doorstep.
            </p>

            {/* Live stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Timer className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">2-4</p>
                <p className="text-sm text-white/80">Hours</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <BadgeCheck className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">100%</p>
                <p className="text-sm text-white/80">On Time</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Bike className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-white/80">Daily Rides</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <MapPin className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">50km</p>
                <p className="text-sm text-white/80">Coverage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 70C840 80 960 100 1080 105C1200 110 1320 100 1380 95L1440 90V120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchDeliveryData}
                  className="ml-auto"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Check Delivery Zone */}
        <Card className="mb-8 border-2 border-orange-200 dark:border-orange-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Check if we deliver to you
                </h3>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter your area or postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={checkZone} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6">
                    <Locate className="w-4 h-4 mr-2" />
                    Check
                  </Button>
                </div>
              </div>
              
              {isZoneChecked && (
                <Card className={`min-w-[200px] ${
                  inZone ? 'bg-green-50 dark:bg-green-950/30 border-green-200' : 'bg-red-50 dark:bg-red-950/30 border-red-200'
                }`}>
                  <CardContent className="p-4">
                    {inZone ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-700 dark:text-green-400">Available!</p>
                          <p className="text-sm text-green-600 dark:text-green-500">We deliver here</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-700 dark:text-red-400">Not available</p>
                          <p className="text-sm text-red-600 dark:text-red-500">Coming soon</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-red-600" />
              </div>
              <p className="font-semibold">2-Hour Express</p>
              <p className="text-xs text-muted-foreground mt-1">For urgent needs</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
              <p className="font-semibold">24/7 Service</p>
              <p className="text-xs text-muted-foreground mt-1">Always available</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Radar className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-semibold">Real-time Tracking</p>
              <p className="text-xs text-muted-foreground mt-1">Know where we are</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-purple-600" />
              </div>
              <p className="font-semibold">Insured Delivery</p>
              <p className="text-xs text-muted-foreground mt-1">100% protection</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Tracking Demo */}
        {trackingMode && activeDelivery ? (
          <Card className="mb-8 bg-gradient-to-br from-green-600 to-emerald-600 text-white border-none shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Radar className="w-5 h-5 animate-pulse" />
                  Live Tracking: Order #{activeDelivery.id}
                </h3>
                <Badge className="bg-white/20 text-white border-none">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  LIVE
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Status timeline */}
                  <div className="space-y-3">
                    {['preparing', 'picked-up', 'on-way', 'arriving'].map((status, index) => {
                      const StatusIcon = getStatusIcon(status);
                      const isActive = 
                        (status === 'preparing' && activeDelivery.progress >= 0) ||
                        (status === 'picked-up' && activeDelivery.progress >= 25) ||
                        (status === 'on-way' && activeDelivery.progress >= 50) ||
                        (status === 'arriving' && activeDelivery.progress >= 75);
                      
                      return (
                        <div key={status} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-white text-green-600' : 'bg-white/20 text-white'
                          }`}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-sm ${isActive ? 'text-white font-medium' : 'text-white/60'}`}>
                              {status.replace('-', ' ').toUpperCase()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-bold">{activeDelivery.progress}%</span>
                    </div>
                    <Progress value={activeDelivery.progress} className="h-2 bg-white/20" />
                  </div>

                  {/* Driver info */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="font-medium mb-2">Driver: {activeDelivery.driver}</p>
                    <p className="text-sm opacity-90">{activeDelivery.vehicle}</p>
                  </div>
                </div>

                {/* Map preview */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">Current Location</p>
                    <LocateFixed className="w-4 h-4 animate-pulse" />
                  </div>
                  <p className="text-lg mb-2">{activeDelivery.location}</p>
                  <p className="text-sm opacity-90 mb-3">ETA: {activeDelivery.eta}</p>
                  
                  {/* Simulated map */}
                  <div className="relative h-32 bg-white/5 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMjAgMjBhMTAgMTAgMCAxIDAgMjAgMCAxMCAxMCAwIDEgMC0yMCAweiIgZmlsbD0iI2ZmZmZmZjEwIi8+PC9zdmc+')] opacity-20" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button 
            onClick={() => setTrackingMode(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-12 gap-2 text-base mb-8"
          >
            <Radar className="w-5 h-5" />
            Try Live Tracking Demo
          </Button>
        )}

        {/* Time Slots */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Timer className="w-6 h-6 text-orange-500" />
            Choose Delivery Speed
          </h2>

          {slots.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No delivery slots available at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {slots.map((slot) => {
                const Icon = slot.icon === 'Zap' ? Zap : slot.icon === 'Timer' ? Timer : Clock;
                return (
                  <Card
                    key={slot.id}
                    className={`cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
                      selectedSlot === slot.id ? 'border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/30' : ''
                    }`}
                    onClick={() => {
                      if (slot.available) {
                        setSelectedSlot(slot.id);
                      } else {
                        toast({
                          title: 'Not Available',
                          description: 'This time slot is currently not available',
                          variant: 'destructive',
                          duration: 2000,
                        });
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className={`w-12 h-12 rounded-full ${
                          selectedSlot === slot.id ? 'bg-orange-500' : 'bg-orange-100'
                        } flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${
                            selectedSlot === slot.id ? 'text-white' : 'text-orange-600'
                          }`} />
                        </div>
                        {slot.price > 0 ? (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
                            +MK {slot.price.toLocaleString()}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white border-none">
                            Free
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{slot.time}</h3>
                      <p className="text-sm text-muted-foreground">Est. {slot.estimated}</p>
                      {!slot.available && (
                        <Badge variant="destructive" className="mt-2">Unavailable</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Delivery Zones */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Map className="w-6 h-6 text-orange-500" />
            Delivery Zones
          </h2>

          {zones.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No delivery zones configured</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone) => {
                const Icon = zone.icon === 'Building2' ? Building2 : 
                            zone.icon === 'Store' ? Store : 
                            zone.icon === 'Factory' ? Factory : MapPin;
                return (
                  <Card key={zone.id} className="hover:shadow-lg transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${
                            zone.coverage === 'full' ? 'bg-green-100' :
                            zone.coverage === 'partial' ? 'bg-yellow-100' : 'bg-blue-100'
                          } flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${
                              zone.coverage === 'full' ? 'text-green-600' :
                              zone.coverage === 'partial' ? 'text-yellow-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <h3 className="font-semibold">{zone.name}</h3>
                        </div>
                        {getCoverageBadge(zone.coverage)}
                      </div>

                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{zone.time}</span>
                        </div>
                        
                        {zone.fee > 0 ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="w-4 h-4 text-muted-foreground" />
                            <span>Delivery: MK {zone.fee.toLocaleString()}</span>
                          </div>
                        ) : zone.coverage !== 'coming' && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Free Delivery</span>
                          </div>
                        )}

                        {zone.minOrder > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            <span>Min. MK {zone.minOrder.toLocaleString()}</span>
                          </div>
                        )}

                        {zone.riders && zone.riders > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Bike className="w-4 h-4 text-muted-foreground" />
                            <span>{zone.riders} active riders</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/shop')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white h-14 px-12 text-lg gap-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            Order Now
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Free delivery on orders over MK 15,000
          </p>
        </div>
      </div>

      <Footer />

      {/* Custom animations */}
      <style>{`
        @keyframes speed-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
        .animate-speed-line {
          animation: speed-line 2s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ExpressDelivery;