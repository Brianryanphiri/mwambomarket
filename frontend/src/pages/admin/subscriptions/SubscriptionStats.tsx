import { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Loader2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Truck,
  AlertCircle,
  CheckCircle,
  XCircle
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import api from '@/services/api';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface SubscriptionStats {
  overview: {
    total_subscribers: number;
    active_subscribers: number;
    new_subscribers_this_month: number;
    churned_this_month: number;
    churn_rate: number;
    growth_rate: number;
    total_revenue: number;
    mrr: number;
    arr: number;
    average_revenue_per_user: number;
    lifetime_value: number;
    upcoming_deliveries_today: number;
    upcoming_deliveries_week: number;
    pending_payments: number;
    overdue_payments: number;
  };
  plans: Array<{
    id: string;
    name: string;
    subscribers: number;
    revenue: number;
    growth: number;
  }>;
  trends: {
    daily: Array<{ date: string; subscribers: number; revenue: number }>;
    monthly: Array<{ month: string; subscribers: number; revenue: number }>;
  };
  payments: {
    payment_methods: Array<{ method: string; count: number; amount: number }>;
    success_rate: number;
    average_payment: number;
  };
  deliveries: {
    status_breakdown: Array<{ status: string; count: number }>;
    on_time_rate: number;
    average_delivery_time: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const timeRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '12m', label: 'Last 12 Months' },
];

const SubscriptionStats = () => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState<SubscriptionStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/subscriptions/stats?range=${timeRange}`);
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.response?.data?.message || 'Failed to load statistics');
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

  const handleRetry = () => {
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-red-600 mb-2">Error Loading Statistics</p>
          <p className="text-sm text-muted-foreground mb-4">{error || 'Failed to load data'}</p>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
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
            Key metrics and insights for your subscription business
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
          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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
                <p className="text-3xl font-bold mt-1">{stats.overview.total_subscribers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stats.overview.growth_rate > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ${stats.overview.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.overview.growth_rate > 0 ? '+' : ''}{stats.overview.growth_rate}%
                  </span>
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
                <p className="text-xs text-muted-foreground mt-2">ARR: {formatCurrency(stats.overview.arr)}</p>
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
                <p className="text-3xl font-bold mt-1">{stats.overview.active_subscribers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600">
                    {((stats.overview.active_subscribers / stats.overview.total_subscribers) * 100).toFixed(1)}% active
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
                <p className="text-3xl font-bold mt-1">{stats.overview.churn_rate}%</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.overview.churned_this_month} churned this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
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
                <p className="text-sm text-muted-foreground">ARPU</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.overview.average_revenue_per_user)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LTV</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.overview.lifetime_value)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Deliveries</p>
                <p className="text-2xl font-bold">{stats.overview.upcoming_deliveries_today}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{stats.overview.pending_payments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscriber Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
            <CardDescription>Daily active subscribers over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trends.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'PPP')}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="subscribers" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Subscribers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trends.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis 
                    tickFormatter={(value) => `MK ${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'PPP')}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ff7300" 
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscribers by Plan</CardTitle>
            <CardDescription>Distribution across subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.plans}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.subscribers}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="subscribers"
                  >
                    {stats.plans.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.payments.payment_methods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Performance</CardTitle>
          <CardDescription>Key delivery metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">On-Time Delivery Rate</p>
              <div className="flex items-center gap-4">
                <Progress value={stats.deliveries.on_time_rate} className="flex-1" />
                <span className="font-medium">{stats.deliveries.on_time_rate.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Average Delivery Time</p>
              <p className="text-2xl font-bold">{stats.deliveries.average_delivery_time}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Payment Success Rate</p>
              <div className="flex items-center gap-4">
                <Progress value={stats.payments.success_rate} className="flex-1" />
                <span className="font-medium">{stats.payments.success_rate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionStats;