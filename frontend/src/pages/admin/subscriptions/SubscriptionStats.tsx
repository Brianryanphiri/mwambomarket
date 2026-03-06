import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Activity,
  Target,
  Award,
  Star,
  UserPlus,
  UserMinus,
  CreditCard,
  Truck,
  Package,
  Percent,
  Zap,
  Flame,
  TrendingDown,
  Eye,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface SubscriptionStats {
  overview: {
    totalSubscribers: number;
    activeSubscribers: number;
    newSubscribers: number;
    churnedSubscribers: number;
    churnRate: number;
    growthRate: number;
    totalRevenue: number;
    mrr: number;
    arr: number;
    averageRevenuePerUser: number;
    lifetimeValue: number;
  };
  plans: Array<{
    id: string;
    name: string;
    subscribers: number;
    revenue: number;
    growth: number;
    churn: number;
    popular: boolean;
  }>;
  trends: {
    daily: Array<{ date: string; subscribers: number; revenue: number }>;
    weekly: Array<{ week: string; subscribers: number; revenue: number }>;
    monthly: Array<{ month: string; subscribers: number; revenue: number }>;
  };
  retention: {
    cohortRetention: Array<{ cohort: string; rates: number[] }>;
    overallRetention: number;
    averageLifetime: number;
  };
  payments: {
    successful: number;
    failed: number;
    pending: number;
    refunded: number;
    totalCollected: number;
    averagePaymentSize: number;
    paymentMethods: Array<{ method: string; count: number; amount: number }>;
  };
  deliveries: {
    total: number;
    onTime: number;
    delayed: number;
    failed: number;
    averageDeliveryTime: string;
    coverage: Array<{ area: string; count: number; success: number }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    active: number;
    inactive: number;
    topCustomers: Array<{ name: string; spent: number; subscriptions: number }>;
  };
}

const timeRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '12m', label: 'Last 12 Months' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'all', label: 'All Time' },
];

const SubscriptionStats = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<SubscriptionStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockStats: SubscriptionStats = {
        overview: {
          totalSubscribers: 1250,
          activeSubscribers: 987,
          newSubscribers: 156,
          churnedSubscribers: 43,
          churnRate: 4.2,
          growthRate: 12.5,
          totalRevenue: 45875000,
          mrr: 3825000,
          arr: 45900000,
          averageRevenuePerUser: 3875,
          lifetimeValue: 48500
        },
        plans: [
          { id: '1', name: 'Weekly Veggie Box', subscribers: 450, revenue: 6750000, growth: 15.2, churn: 3.1, popular: true },
          { id: '2', name: 'Daily Bread Club', subscribers: 280, revenue: 2520000, growth: 8.4, churn: 4.5, popular: false },
          { id: '3', name: 'Dairy Delight', subscribers: 320, revenue: 8000000, growth: 12.8, churn: 2.8, popular: true },
          { id: '4', name: 'Family Essentials', subscribers: 180, revenue: 11700000, growth: 10.2, churn: 3.2, popular: false },
          { id: '5', name: 'Fruit Fanatic', subscribers: 120, revenue: 2160000, growth: 18.5, churn: 2.1, popular: false },
          { id: '6', name: 'Monthly Pantry', subscribers: 90, revenue: 4050000, growth: 6.7, churn: 5.1, popular: false }
        ],
        trends: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
            subscribers: Math.floor(Math.random() * 50) + 900,
            revenue: Math.floor(Math.random() * 500000) + 3500000
          })),
          weekly: Array.from({ length: 12 }, (_, i) => ({
            week: `Week ${i + 1}`,
            subscribers: Math.floor(Math.random() * 200) + 850,
            revenue: Math.floor(Math.random() * 2000000) + 35000000
          })),
          monthly: Array.from({ length: 12 }, (_, i) => ({
            month: format(subMonths(new Date(), 11 - i), 'MMM yyyy'),
            subscribers: Math.floor(Math.random() * 300) + 700,
            revenue: Math.floor(Math.random() * 5000000) + 40000000
          }))
        },
        retention: {
          cohortRetention: [
            { cohort: 'Jan 2026', rates: [100, 85, 72, 68, 65, 62, 58, 55, 52, 48, 45, 42] },
            { cohort: 'Feb 2026', rates: [100, 88, 75, 70, 66, 63, 59, 56, 53, 49, 46] },
            { cohort: 'Mar 2026', rates: [100, 86, 73, 69, 65, 62, 58, 55, 52, 48] },
            { cohort: 'Apr 2026', rates: [100, 89, 76, 71, 67, 64, 60, 57, 54] },
            { cohort: 'May 2026', rates: [100, 87, 74, 70, 66, 63, 59, 56] },
            { cohort: 'Jun 2026', rates: [100, 90, 77, 72, 68, 65, 61] },
            { cohort: 'Jul 2026', rates: [100, 88, 75, 71, 67, 64] },
            { cohort: 'Aug 2026', rates: [100, 91, 78, 73, 69] },
            { cohort: 'Sep 2026', rates: [100, 89, 76, 72] },
            { cohort: 'Oct 2026', rates: [100, 92, 79] },
            { cohort: 'Nov 2026', rates: [100, 90] },
            { cohort: 'Dec 2026', rates: [100] }
          ],
          overallRetention: 68.5,
          averageLifetime: 8.2
        },
        payments: {
          successful: 3450,
          failed: 87,
          pending: 234,
          refunded: 45,
          totalCollected: 42500000,
          averagePaymentSize: 12300,
          paymentMethods: [
            { method: 'Airtel Money', count: 1850, amount: 22200000 },
            { method: 'TNM Mpamba', count: 920, amount: 11040000 },
            { method: 'Cash', count: 580, amount: 6960000 },
            { method: 'Card', count: 320, amount: 3840000 }
          ]
        },
        deliveries: {
          total: 4120,
          onTime: 3780,
          delayed: 260,
          failed: 80,
          averageDeliveryTime: '45 minutes',
          coverage: [
            { area: 'Area 123', count: 850, success: 98 },
            { area: 'Area 25', count: 720, success: 95 },
            { area: 'Area 47', count: 680, success: 97 },
            { area: 'Area 18', count: 590, success: 94 },
            { area: 'Area 33', count: 520, success: 96 },
            { area: 'Area 12', count: 480, success: 93 }
          ]
        },
        customers: {
          total: 1120,
          new: 156,
          returning: 964,
          active: 987,
          inactive: 133,
          topCustomers: [
            { name: 'Brian Phiri', spent: 285000, subscriptions: 3 },
            { name: 'Mary Banda', spent: 234000, subscriptions: 2 },
            { name: 'John Chimwala', spent: 198000, subscriptions: 2 },
            { name: 'Alice Phiri', spent: 156000, subscriptions: 1 },
            { name: 'David Banda', spent: 142000, subscriptions: 1 }
          ]
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `MK ${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Subscription Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive statistics and insights for your subscription business
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-3xl font-bold mt-1">{stats.overview.totalSubscribers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(stats.overview.growthRate)}
                  <span className={`text-sm ${stats.overview.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.overview.growthRate > 0 ? '+' : ''}{stats.overview.growthRate}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue (MRR)</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.overview.mrr)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+8.2%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
                <p className="text-3xl font-bold mt-1">{stats.overview.activeSubscribers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600">
                    {((stats.overview.activeSubscribers / stats.overview.totalSubscribers) * 100).toFixed(1)}% active
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
                <p className="text-3xl font-bold mt-1">{stats.overview.churnRate}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">-0.5%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <UserMinus className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Subscribers</p>
                <p className="text-2xl font-bold">{stats.overview.newSubscribers}</p>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Churned</p>
                <p className="text-2xl font-bold">{stats.overview.churnedSubscribers}</p>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <UserMinus className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ARPU</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.overview.averageRevenuePerUser)}</p>
                <p className="text-xs text-muted-foreground mt-1">Per subscriber</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LTV</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.overview.lifetimeValue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Customer lifetime</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-950/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed stats */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between gap-2">
                {stats.trends.monthly.map((month, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${(month.revenue / 60000000) * 200}px` }}
                    />
                    <span className="text-xs text-muted-foreground rotate-45 origin-left">
                      {month.month}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscriber Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Growth</CardTitle>
              <CardDescription>Daily active subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end justify-between gap-1">
                {stats.trends.daily.slice(-14).map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg"
                      style={{ height: `${(day.subscribers / 1000) * 150}px` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(day.date), 'dd')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Customer Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active</span>
                      <span className="font-medium">{stats.overview.activeSubscribers}</span>
                    </div>
                    <Progress value={(stats.overview.activeSubscribers / stats.overview.totalSubscribers) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Inactive</span>
                      <span className="font-medium">{stats.overview.totalSubscribers - stats.overview.activeSubscribers}</span>
                    </div>
                    <Progress value={((stats.overview.totalSubscribers - stats.overview.activeSubscribers) / stats.overview.totalSubscribers) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{stats.retention.overallRetention}%</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Average customer lifetime: {stats.retention.averageLifetime} months
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">New vs Returning</span>
                    <span className="text-sm font-medium">
                      {stats.customers.new} / {stats.customers.returning}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Growth Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      +{stats.overview.growthRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Churn Rate</span>
                    <span className="text-sm font-medium text-red-600">
                      {stats.overview.churnRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Performance</CardTitle>
              <CardDescription>Breakdown by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Churn</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        {plan.name}
                        {plan.popular && (
                          <Badge className="ml-2 bg-yellow-500 text-white text-xs">Popular</Badge>
                        )}
                      </TableCell>
                      <TableCell>{plan.subscribers}</TableCell>
                      <TableCell>{formatCurrency(plan.revenue)}</TableCell>
                      <TableCell>
                        <span className={plan.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                          {plan.growth > 0 ? '+' : ''}{plan.growth}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600">{plan.churn}%</span>
                      </TableCell>
                      <TableCell>
                        <div className="w-20">
                          <Progress value={(plan.subscribers / stats.overview.activeSubscribers) * 100} className="h-2" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.plans.map((plan) => (
                    <div key={plan.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{plan.name}</span>
                        <span className="font-medium">{((plan.revenue / stats.overview.totalRevenue) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(plan.revenue / stats.overview.totalRevenue) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscriber Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.plans.map((plan) => (
                    <div key={plan.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{plan.name}</span>
                        <span className="font-medium">{((plan.subscribers / stats.overview.activeSubscribers) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(plan.subscribers / stats.overview.activeSubscribers) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention</CardTitle>
              <CardDescription>Customer retention by cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cohort</TableHead>
                      {Array.from({ length: 12 }, (_, i) => (
                        <TableHead key={i}>Month {i + 1}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.retention.cohortRetention.map((cohort, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{cohort.cohort}</TableCell>
                        {cohort.rates.map((rate, i) => (
                          <TableCell key={i}>
                            <span className={rate >= 70 ? 'text-green-600' : rate >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                              {rate}%
                            </span>
                          </TableCell>
                        ))}
                        {Array.from({ length: 12 - cohort.rates.length }, (_, i) => (
                          <TableCell key={i}>-</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Overall Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{stats.retention.overallRetention}%</p>
                <Progress value={stats.retention.overallRetention} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Lifetime</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{stats.retention.averageLifetime} months</p>
                <p className="text-xs text-muted-foreground mt-2">
                  ≈ {formatCurrency(stats.overview.lifetimeValue)} LTV
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Churn Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{stats.overview.churnRate}%</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.overview.churnedSubscribers} customers lost
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Successful Payments</p>
                <p className="text-2xl font-bold mt-1">{stats.payments.successful}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Failed Payments</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.payments.failed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.payments.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Refunded</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">{stats.payments.refunded}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.payments.paymentMethods.map((method, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{method.method}</TableCell>
                      <TableCell>{method.count}</TableCell>
                      <TableCell>{formatCurrency(method.amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={(method.amount / stats.payments.totalCollected) * 100} className="h-2 w-20" />
                          <span className="text-sm">
                            {((method.amount / stats.payments.totalCollected) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-5xl font-bold text-green-600">
                    {((stats.payments.successful / (stats.payments.successful + stats.payments.failed)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats.payments.successful} successful out of {stats.payments.successful + stats.payments.failed} attempts
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">
                    {formatCurrency(stats.payments.averagePaymentSize)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Per transaction
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold mt-1">{stats.deliveries.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">On Time</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.deliveries.onTime}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Delayed</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.deliveries.delayed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.deliveries.failed}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>On-Time Delivery Rate</span>
                    <span className="font-medium">
                      {((stats.deliveries.onTime / stats.deliveries.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(stats.deliveries.onTime / stats.deliveries.total) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Delivery Time</span>
                    <span className="font-medium">{stats.deliveries.averageDeliveryTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coverage Areas</CardTitle>
              <CardDescription>Delivery performance by area</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.deliveries.coverage.map((area, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{area.area}</TableCell>
                      <TableCell>{area.count}</TableCell>
                      <TableCell>{area.success}%</TableCell>
                      <TableCell>
                        <Progress value={area.success} className="h-2 w-20" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Spending</CardTitle>
          <CardDescription>Highest value subscribers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Active Subscriptions</TableHead>
                <TableHead>Average per Subscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.customers.topCustomers.map((customer, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{formatCurrency(customer.spent)}</TableCell>
                  <TableCell>{customer.subscriptions}</TableCell>
                  <TableCell>{formatCurrency(customer.spent / customer.subscriptions)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionStats;