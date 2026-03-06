// src/pages/OrderConfirmation.tsx
import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  CheckCircle, Package, Home, Truck, Clock, Phone, 
  Mail, MapPin, User, Calendar, Gift, Sparkles,
  ShoppingBag, Heart, Star, Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Badge } from '@/components/ui/badge';

const OrderConfirmation = () => {
  const location = useLocation();
  const { order, paymentInstructions } = location.state || {};
  const [animationStage, setAnimationStage] = useState(0);
  const [floatingItems, setFloatingItems] = useState<Array<{ id: number; icon: string; x: number; delay: number }>>([]);
  
  // Generate order number and total with fallbacks
  const orderNumber = order?.id || 'ORD' + Date.now();
  const total = order?.total || 0;
  const customerInfo = order?.customerInfo || { fullName: 'Customer', phoneNumber: '' };
  const deliveryOption = order?.deliveryOption || { estimatedTime: 'Today before 6PM' };
  const items = order?.items || [];

  // Unique animation sequence
  useEffect(() => {
    // Stage 1: Initial pop (0.5s)
    const timer1 = setTimeout(() => setAnimationStage(1), 500);
    
    // Stage 2: Items float in (1s)
    const timer2 = setTimeout(() => setAnimationStage(2), 1000);
    
    // Stage 3: Details slide (1.5s)
    const timer3 = setTimeout(() => setAnimationStage(3), 1500);
    
    // Stage 4: Buttons appear (2s)
    const timer4 = setTimeout(() => setAnimationStage(4), 2000);

    // Generate floating grocery items
    const icons = ['🥬', '🍅', '🥑', '🥕', '🍚', '🥚', '🥛', '🍞'];
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setFloatingItems(items);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-store-green-light/5 via-background to-store-amber-light/5 overflow-hidden relative">
      {/* Unique Floating Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingItems.map(item => (
          <div
            key={item.id}
            className="absolute text-4xl opacity-20 animate-float-grocery"
            style={{
              left: `${item.x}%`,
              top: '-10%',
              animationDelay: `${item.delay}s`,
              animationDuration: `${8 + item.delay}s`
            }}
          >
            {item.icon}
          </div>
        ))}
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-store-green-light/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-store-amber-light/20 rounded-full blur-3xl animate-pulse-slower" />
      </div>

      <Header />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Unique Success Animation - Not the typical checkmark */}
          <div className="text-center mb-8 relative">
            {/* Animated rings */}
            <div className="relative w-40 h-40 mx-auto">
              {/* Outer rotating ring */}
              <div className={`absolute inset-0 rounded-full border-4 border-store-success/30 
                ${animationStage >= 1 ? 'animate-spin-slow' : 'opacity-0'}`} 
                style={{ borderTopColor: '#22c55e', borderBottomColor: 'transparent' }}
              />
              
              {/* Middle pulse ring */}
              <div className={`absolute inset-2 rounded-full border-2 border-store-success/50 
                ${animationStage >= 1 ? 'animate-ping-slow' : 'opacity-0'}`} 
              />
              
              {/* Inner celebration burst */}
              <div className={`absolute inset-4 rounded-full bg-gradient-to-br from-store-success to-store-amber
                flex items-center justify-center transform transition-all duration-1000
                ${animationStage >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}
              >
                {/* Animated icons inside */}
                <div className="relative">
                  <Gift className={`w-12 h-12 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    transition-all duration-500 ${animationStage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} 
                  />
                  <Sparkles className={`w-6 h-6 text-yellow-300 absolute -top-6 -right-6
                    transition-all duration-700 delay-300 ${animationStage >= 2 ? 'opacity-100 rotate-12' : 'opacity-0'}`} 
                  />
                  <Sparkles className={`w-4 h-4 text-yellow-300 absolute -bottom-4 -left-4
                    transition-all duration-700 delay-500 ${animationStage >= 2 ? 'opacity-100 -rotate-12' : 'opacity-0'}`} 
                  />
                </div>
              </div>

              {/* Floating particles */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-store-amber rounded-full animate-float-particle
                    ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>

            {/* Animated text with unique entrance */}
            <div className="mt-6 space-y-2">
              <h1 className={`
                text-4xl md:text-5xl font-display font-bold
                transition-all duration-1000 transform
                ${animationStage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
              `}>
                <span className="bg-gradient-to-r from-store-success to-store-amber bg-clip-text text-transparent">
                  Order Confirmed!
                </span>
              </h1>
              
              <p className={`
                text-lg text-muted-foreground
                transition-all duration-1000 delay-300 transform
                ${animationStage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
              `}>
                Thank you for shopping with Mwambo Store
              </p>
            </div>
          </div>

          {/* Unique Order Card with Staggered Animation */}
          <div className={`
            bg-white/80 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden mb-6
            shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)]
            transition-all duration-1000 transform
            ${animationStage >= 2 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}
          `}>
            {/* Animated Header Strip */}
            <div className="relative bg-gradient-to-r from-store-success to-store-amber p-6 overflow-hidden">
              {/* Animated waves */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-white/20 animate-wave" />
              </div>
              
              <div className="relative flex items-center justify-between flex-wrap gap-4">
                <div className="transform transition-all duration-700 hover:scale-105">
                  <p className="text-sm text-white/80 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-MW', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-2xl font-mono font-bold text-white mt-1 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {orderNumber}
                  </p>
                </div>
                
                {/* Animated Status Badge */}
                <Badge className="bg-white/20 text-white border-none px-4 py-2 backdrop-blur-sm animate-glow">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Order Confirmed
                  </span>
                </Badge>
              </div>
            </div>

            {/* Order Body with Staggered Items */}
            <div className="p-6 space-y-6">
              {/* Customer Info with Slide Animation */}
              <div className={`
                flex items-start gap-4 p-4 bg-gradient-to-r from-store-green-light/10 to-transparent rounded-xl
                transition-all duration-700 transform hover:scale-102 hover:shadow-md
                ${animationStage >= 3 ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
              `} style={{ transitionDelay: '200ms' }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-store-green-light to-store-green-dark flex items-center justify-center shrink-0 animate-bounce-gentle">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Contact
                  </p>
                  <p className="font-medium text-lg">{customerInfo.fullName}</p>
                  <a href={`tel:${customerInfo.phoneNumber}`} className="text-primary hover:underline text-sm">
                    {customerInfo.phoneNumber}
                  </a>
                </div>
              </div>

              {/* Delivery Info with Slide Animation */}
              <div className={`
                flex items-start gap-4 p-4 bg-gradient-to-r from-store-amber-light/10 to-transparent rounded-xl
                transition-all duration-700 transform hover:scale-102 hover:shadow-md
                ${animationStage >= 3 ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}
              `} style={{ transitionDelay: '400ms' }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-store-amber-light to-store-amber flex items-center justify-center shrink-0 animate-bounce-gentle" style={{ animationDelay: '0.2s' }}>
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Delivery
                  </p>
                  <p className="font-medium">{deliveryOption.estimatedTime}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {order?.deliveryAddress?.area}, {order?.deliveryAddress?.city}
                  </p>
                </div>
              </div>

              {/* Order Items with Staggered Animation */}
              {items.length > 0 && (
                <div className={`
                  space-y-2
                  transition-all duration-700 transform
                  ${animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                `} style={{ transitionDelay: '600ms' }}>
                  <p className="font-medium flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Order Items
                  </p>
                  <div className="space-y-2">
                    {items.slice(0, 3).map((item: any, index: number) => (
                      <div 
                        key={item.id} 
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 animate-slide-in-right"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-store-green-light to-store-amber-light flex items-center justify-center">
                          🛒
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold">MK {item.price * item.quantity}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-xs text-center text-muted-foreground">
                        +{items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Total with Pop Animation */}
              <div className={`
                relative bg-gradient-to-r from-store-success/10 to-store-amber/10 rounded-xl p-6
                transition-all duration-1000 transform overflow-hidden
                ${animationStage >= 3 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
              `} style={{ transitionDelay: '800ms' }}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#22c55e_1px,_transparent_1px)] bg-[length:20px_20px]" />
                </div>
                
                <div className="relative flex justify-between items-center">
                  <span className="text-muted-foreground">Total Amount</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold bg-gradient-to-r from-store-success to-store-amber bg-clip-text text-transparent">
                      MK {total.toLocaleString()}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">Including all fees</p>
                  </div>
                </div>

                {/* Animated progress line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-store-success to-store-amber animate-progress" />
              </div>

              {/* Payment Instructions (if needed) */}
              {paymentInstructions && (
                <div className={`
                  bg-blue-50 rounded-xl p-4 animate-shake
                  transition-all duration-700
                  ${animationStage >= 4 ? 'opacity-100' : 'opacity-0'}
                `}>
                  <h3 className="font-medium flex items-center gap-2 text-blue-700 mb-2">
                    <Mail className="w-4 h-4 animate-spin-slow" />
                    Payment Instructions
                  </h3>
                  <p className="text-sm text-blue-600">
                    Please complete your payment using the instructions provided. 
                    Your order will be processed once payment is confirmed.
                  </p>
                </div>
              )}

              {/* What's Next with Unique Timeline */}
              <div className={`
                border-t border-border pt-4
                transition-all duration-700
                ${animationStage >= 4 ? 'opacity-100' : 'opacity-0'}
              `}>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-store-amber animate-pulse" />
                  What's Next?
                </h3>
                <div className="relative">
                  {/* Animated timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-store-success via-store-amber to-store-warm animate-grow-y" />
                  
                  <ul className="space-y-4 relative">
                    {[
                      { icon: Phone, text: "You'll receive an SMS confirmation shortly", color: "from-store-success to-store-amber" },
                      { icon: Clock, text: "We'll prepare your order within 30 minutes", color: "from-store-amber to-store-warm" },
                      { icon: Truck, text: "You'll get a call when it's out for delivery", color: "from-store-warm to-store-success" },
                    ].map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <li 
                          key={index} 
                          className="flex items-center gap-3 group animate-slide-in-left"
                          style={{ animationDelay: `${index * 200}ms` }}
                        >
                          <div className={`
                            w-8 h-8 rounded-full bg-gradient-to-r ${step.color} 
                            flex items-center justify-center shrink-0
                            group-hover:scale-110 group-hover:rotate-12 transition-all duration-300
                          `}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {step.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons with Unique Hover Effects */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="flex-1">
              <Button 
                variant="outline" 
                className={`
                  w-full gap-2 h-12 border-2 hover:border-store-success
                  transition-all duration-700 transform
                  hover:scale-105 hover:shadow-lg hover:bg-store-success/5
                  ${animationStage >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                `}
                style={{ transitionDelay: '1000ms' }}
              >
                <Home className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Continue Shopping
              </Button>
            </Link>
            
            <Link to="/track-order" className="flex-1">
              <Button 
                className={`
                  w-full store-gradient text-primary-foreground gap-2 h-12
                  transition-all duration-700 transform relative overflow-hidden group
                  hover:scale-105 hover:shadow-xl
                  ${animationStage >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                `}
                style={{ transitionDelay: '1200ms' }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Package className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Track Order
              </Button>
            </Link>
          </div>

          {/* Support Message with Bounce */}
          <p className={`
            text-center text-sm text-muted-foreground mt-6
            transition-all duration-1000
            ${animationStage >= 4 ? 'opacity-100' : 'opacity-0'}
            hover:scale-105 hover:text-foreground transition-all
          `} style={{ transitionDelay: '1400ms' }}>
            Need help? Call us at{' '}
            <a 
              href="tel:+265999123456" 
              className="text-primary hover:underline font-medium inline-flex items-center gap-1 group"
            >
              <Phone className="w-3 h-3 group-hover:rotate-12 transition-transform" />
              +265 999 123 456
            </a>
          </p>

          {/* Unique Thank You Message */}
          <div className={`
            text-center mt-8 p-4 rounded-xl bg-gradient-to-r from-store-green-light/20 to-store-amber-light/20
            transition-all duration-1000
            ${animationStage >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `} style={{ transitionDelay: '1600ms' }}>
            <p className="text-sm flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-store-amber animate-pulse" />
              <span>We appreciate your trust in Mwambo Store</span>
              <Star className="w-4 h-4 text-store-amber animate-pulse" />
            </p>
          </div>
        </div>
      </div>

      <Footer />

      {/* Add custom CSS animations */}
      <style>{`
        @keyframes float-grocery {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0.2; }
          50% { opacity: 0.3; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.2; }
        }
        .animate-float-grocery {
          animation: float-grocery linear infinite;
        }

        @keyframes wave {
          0% { transform: translateX(-100%) translateY(0); }
          50% { transform: translateX(0) translateY(-10px); }
          100% { transform: translateX(100%) translateY(0); }
        }
        .animate-wave {
          animation: wave 8s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.5); }
          50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes ping-slow {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slower {
          animation: pulse-slower 4s ease-in-out infinite;
        }

        @keyframes float-particle {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -100px) scale(1); opacity: 0; }
        }
        .animate-float-particle {
          animation: float-particle 1.5s ease-out forwards;
        }

        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-out forwards;
        }

        @keyframes grow-y {
          0% { height: 0; }
          100% { height: calc(100% - 2rem); }
        }
        .animate-grow-y {
          animation: grow-y 1.5s ease-out forwards;
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;