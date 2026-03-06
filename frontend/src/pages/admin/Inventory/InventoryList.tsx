// src/pages/admin/Inventory/InventoryList.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Edit,
  Save,
  X,
  RefreshCw,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Product {
  id: number;
  name: string;
  category: string;
  category_name: string;
  price: number;
  stock: number;
  low_stock_alert: number;
  sku: string;
  status: string;
}

interface InventorySummary {
  total_products: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  total_stock_value: number;
}

const InventoryList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [editingStock, setEditingStock] = useState<{ id: number; value: string } | null>(null);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');

  // Determine active tab from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    if (filter === 'low-stock') {
      setActiveTab('low');
    } else if (filter === 'out-of-stock') {
      setActiveTab('out');
    } else {
      setActiveTab('all');
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch summary
      const summaryRes = await axios.get(`${API_BASE}/products/inventory/summary`, { headers });
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary);
      }

      // Fetch products based on tab
      let productsRes;
      if (activeTab === 'low') {
        productsRes = await axios.get(`${API_BASE}/products/inventory/low-stock`, { headers });
        // Low stock endpoint returns a plain array
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } else if (activeTab === 'out') {
        productsRes = await axios.get(`${API_BASE}/products/inventory/out-of-stock`, { headers });
        // Out of stock endpoint returns a plain array
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } else {
        // For 'all' products, use the regular products endpoint which returns paginated object
        productsRes = await axios.get(`${API_BASE}/products?limit=100`, { headers });
        // Extract products array from the paginated response
        const productsArray = productsRes.data.products || productsRes.data || [];
        setProducts(Array.isArray(productsArray) ? productsArray : []);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching inventory data:', err);
      setError(err.response?.data?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct || !newStock) return;

    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `${API_BASE}/products/${selectedProduct.id}/stock`,
        { stock: parseInt(newStock) },
        { headers }
      );

      // Refresh data
      fetchData();
      setShowStockDialog(false);
      setSelectedProduct(null);
      setNewStock('');
    } catch (err: any) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock: ' + (err.response?.data?.message || err.message));
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

  const getStockStatusColor = (product: Product) => {
    if (product.stock === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (product.stock <= product.low_stock_alert) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStockStatusText = (product: Product) => {
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock <= product.low_stock_alert) return 'Low Stock';
    return 'In Stock';
  };

  // Safely ensure products is an array before mapping
  const safeProducts = Array.isArray(products) ? products : [];

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
        <Button onClick={fetchData} className="mt-4" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/inventory')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{summary.total_products}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                  <p className="text-2xl font-bold text-green-600">{summary.in_stock}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-600">{summary.low_stock}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{summary.out_of_stock}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Value</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.total_stock_value)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="low">Low Stock</TabsTrigger>
          <TabsTrigger value="out">Out of Stock</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Alert Threshold</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeProducts.map((product) => (
                    <TableRow 
                      key={product.id}
                      className={product.stock === 0 ? 'bg-red-50' : product.stock <= product.low_stock_alert ? 'bg-amber-50' : ''}
                    >
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category_name || product.category}</TableCell>
                      <TableCell>
                        {editingStock?.id === product.id ? (
                          <Input
                            type="number"
                            value={editingStock.value}
                            onChange={(e) => setEditingStock({ id: product.id, value: e.target.value })}
                            className="w-20 h-8"
                            min="0"
                          />
                        ) : (
                          product.stock
                        )}
                      </TableCell>
                      <TableCell>{product.low_stock_alert}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{formatCurrency(product.price * product.stock)}</TableCell>
                      <TableCell>
                        <Badge className={getStockStatusColor(product)}>
                          {getStockStatusText(product)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setNewStock(product.stock.toString());
                            setShowStockDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Update Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {safeProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Update Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update the stock quantity for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Stock</label>
                <p className="text-lg font-bold">{selectedProduct?.stock}</p>
              </div>
              <div>
                <label className="text-sm font-medium">New Stock Quantity</label>
                <Input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  min="0"
                  placeholder="Enter new stock quantity"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockUpdate} disabled={!newStock}>
              <Save className="w-4 h-4 mr-2" />
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryList;