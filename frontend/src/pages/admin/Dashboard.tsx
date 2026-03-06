// src/components/admin/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Users, Package, DollarSign, TrendingUp, Clock,
  AlertCircle, ChevronRight, ArrowUp, ArrowDown, Calendar,
  ShoppingCart, Eye, Download, Filter, MoreHorizontal,
  Truck, CheckCircle, XCircle, RefreshCw, Star, Bell,
  CreditCard, Wallet, BarChart, PieChart, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  Legend
} from 'recharts';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  todayOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStock: number;
  outOfStock: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  averageOrderValue: number;
  conversionRate: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  items: number;
  date: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
  image: string;
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'order' | 'product' | 'user' | 'inventory';
}

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    todayOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    lowStock: 0,
    outOfStock: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    averageOrderValue: 0,
    conversionRate: 0
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const [topProducts, setTopProducts] = useState<TopProduct[]>([
    { id: 'p1', name: 'Fresh Tomatoes', sales: 450, revenue: 1125000, stock: 200, image: '/products/tomatoes.jpg' },
    { id: 'p2', name: 'Farm Eggs', sales: 380, revenue: 2280000, stock: 150, image: '/products/eggs.jpg' },
    { id: 'p3', name: 'Maize Flour', sales: 320, revenue: 1760000, stock: 80, image: '/products/maize-flour.jpg' },
    { id: 'p4', name: 'Cooking Oil', sales: 290, revenue: 1305000, stock: 45, image: '/products/cooking-oil.jpg' },
    { id: 'p5', name: 'White Rice', sales: 250, revenue: 2125000, stock: 120, image: '/products/rice.jpg' }
  ]);

  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: 'a1', action: 'New order #ORD-2024-001', user: 'John Banda', timestamp: '2 min ago', type: 'order' },
    { id: 'a2', action: 'Product stock updated: Tomatoes', user: 'Admin', timestamp: '15 min ago', type: 'inventory' },
    { id: 'a3', action: 'New user registered', user: 'Mary Phiri', timestamp: '1 hour ago', type: 'user' },
    { id: 'a4', action: 'Order #ORD-2024-002 shipped', user: 'System', timestamp: '2 hours ago', type: 'order' },
    { id: 'a5', action: 'New product added: Fresh Oranges', user: 'Admin', timestamp: '3 hours ago', type: 'product' }
  ]);

  // Chart data
  const salesData = [
    { name: 'Mon', sales: 4000, orders: 24 },
    { name: 'Tue', sales: 3000, orders: 18 },
    { name: 'Wed', sales: 5000, orders: 30 },
    { name: 'Thu', sales: 4500, orders: 27 },
    { name: 'Fri', sales: 6000, orders: 35 },
    { name: 'Sat', sales: 5500, orders: 32 },
    { name: 'Sun', sales: 4800, orders: 28 }
  ];

  const categoryData = [
    { name: 'Fresh Produce', value: 35 },
    { name: 'Dairy & Eggs', value: 25 },
    { name: 'Pantry', value: 20 },
    { name: 'Meat', value: 15 },
    { name: 'Beverages', value: 5 }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.get(`${API_BASE}/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'shipped': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'unpaid': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'order': return ShoppingCart;
      case 'product': return Package;
      case 'user': return Users;
      case 'inventory': return RefreshCw;
      default: return Bell;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
        <Button 
          onClick={fetchDashboardData} 
          className="mt-4"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.revenueGrowth > 0 ? (
                    <ArrowUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${stats.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(stats.revenueGrowth)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.ordersGrowth > 0 ? (
                    <ArrowUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${stats.ordersGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(stats.ordersGrowth)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.customersGrowth > 0 ? (
                    <ArrowUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${stats.customersGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(stats.customersGrowth)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-500">{stats.lowStock} low stock</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AOV</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'yellow' },
          { label: 'Processing', value: stats.processingOrders, icon: RefreshCw, color: 'blue' },
          { label: 'Shipped', value: stats.shippedOrders, icon: Truck, color: 'purple' },
          { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle, color: 'green' },
          { label: 'Cancelled', value: stats.cancelledOrders, icon: XCircle, color: 'red' },
          { label: 'Today', value: stats.todayOrders, icon: Calendar, color: 'orange' }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className={`bg-${item.color}-50 dark:bg-${item.color}-950/30`}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-${item.color}-500 flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-bold">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Overview</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Revenue</Badge>
                <Badge variant="outline">Orders</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(order.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{product.sales} sales</span>
                      <span>•</span>
                      <span>{formatCurrency(product.revenue)}</span>
                    </div>
                  </div>
                  <Badge variant={product.stock < 50 ? "destructive" : "outline"}>
                    {product.stock} left
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Link to="/admin/products">
                <Button variant="outline" className="w-full">
                  View All Products
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full bg-${activity.type === 'order' ? 'blue' : activity.type === 'product' ? 'green' : activity.type === 'user' ? 'purple' : 'orange'}-100 dark:bg-${activity.type}-900/20 flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/products/new">
              <Button variant="outline" className="w-full justify-between">
                Add New Product
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/admin/orders">
              <Button variant="outline" className="w-full justify-between">
                Process Orders
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/admin/inventory">
              <Button variant="outline" className="w-full justify-between">
                Update Inventory
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/admin/discounts">
              <Button variant="outline" className="w-full justify-between">
                Create Discount
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full justify-between">
                Generate Report
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Status</span>
                <Badge className="bg-green-500">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-500">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache</span>
                <Badge className="bg-green-500">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Gateway</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge className="bg-yellow-500">Degraded</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <Badge variant="outline">78% Used</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;