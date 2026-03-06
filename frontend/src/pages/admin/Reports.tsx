import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Download,
  RefreshCw,
  Printer,
  Calendar,
  FileSpreadsheet,
  FilePieChart,
  Users,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and export custom reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="p-6 text-center">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <p className="font-medium">Sales Report</p>
            <p className="text-xs text-muted-foreground mt-1">Daily, weekly, monthly</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <p className="font-medium">Customer Report</p>
            <p className="text-xs text-muted-foreground mt-1">New, active, churned</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 mx-auto text-purple-600 mb-4" />
            <p className="font-medium">Product Report</p>
            <p className="text-xs text-muted-foreground mt-1">Best sellers, inventory</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="p-6 text-center">
            <FilePieChart className="w-12 h-12 mx-auto text-orange-600 mb-4" />
            <p className="font-medium">Financial Report</p>
            <p className="text-xs text-muted-foreground mt-1">Revenue, payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="customers">Customer Report</SelectItem>
                  <SelectItem value="products">Product Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="subscriptions">Subscription Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="12m">Last 12 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Include</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="charts" defaultChecked className="rounded" />
                  <Label htmlFor="charts">Charts & Graphs</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="summary" defaultChecked className="rounded" />
                  <Label htmlFor="summary">Executive Summary</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="details" defaultChecked className="rounded" />
                  <Label htmlFor="details">Detailed Data</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No reports generated yet</p>
            <p className="text-sm text-muted-foreground">
              Generate your first report using the options above
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;