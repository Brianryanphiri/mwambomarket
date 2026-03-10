import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Users,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  Calendar,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  TrendingUp,
  Copy,
  FileText,
  Settings,
  Play,
  Pause,
  StopCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance } from 'date-fns';
import api from '@/services/api';

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string;
}

interface Campaign {
  id: number;
  title: string;
  subject: string;
  preview_text: string | null;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  scheduled_for: string | null;
  sent_at: string | null;
  recipient_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  created_by_name: string;
  created_at: string;
}

interface Template {
  id: number;
  name: string;
  subject: string;
  content: string;
  is_default: boolean;
  created_by_name: string;
  created_at: string;
}

interface Stats {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  recentSignups: Array<{ date: string; count: number }>;
  campaigns: {
    total_campaigns: number;
    sent_campaigns: number;
    avg_open_rate: number;
    avg_click_rate: number;
  };
  topSources: Array<{ source: string; count: number }>;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
  { value: 'bounced', label: 'Bounced' },
];

const campaignStatusOptions = [
  { value: 'all', label: 'All Campaigns' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sending', label: 'Sending' },
  { value: 'sent', label: 'Sent' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Newsletter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('subscribers');
  
  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(true);
  const [subscribersError, setSubscribersError] = useState<string | null>(null);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberStatus, setSubscriberStatus] = useState('all');
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [subscriberTotal, setSubscriberTotal] = useState(0);
  const [subscriberPages, setSubscriberPages] = useState(1);
  
  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatus, setCampaignStatus] = useState('all');
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [campaignPages, setCampaignPages] = useState(1);
  
  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Dialogs state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    source: 'admin'
  });
  
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    subject: '',
    preview_text: '',
    content: '',
    scheduled_for: '',
    template_id: ''
  });
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    is_default: false
  });
  
  const [importData, setImportData] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    } else if (activeTab === 'campaigns') {
      fetchCampaigns();
    } else if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab, subscriberPage, subscriberStatus, subscriberSearch, campaignPage, campaignStatus, campaignSearch]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/admin/newsletter/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    setSubscribersError(null);
    try {
      const params = new URLSearchParams({
        page: subscriberPage.toString(),
        limit: '10',
        ...(subscriberStatus !== 'all' && { status: subscriberStatus }),
        ...(subscriberSearch && { search: subscriberSearch })
      });

      const response = await api.get(`/admin/newsletter/subscribers?${params}`);
      setSubscribers(response.data.subscribers);
      setSubscriberTotal(response.data.total);
      setSubscriberPages(response.data.pages);
    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      setSubscribersError(error.response?.data?.message || 'Failed to load subscribers');
      toast({
        title: 'Error',
        description: 'Failed to load subscribers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubscribersLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setCampaignsLoading(true);
    setCampaignsError(null);
    try {
      const params = new URLSearchParams({
        page: campaignPage.toString(),
        limit: '10',
        ...(campaignStatus !== 'all' && { status: campaignStatus }),
        ...(campaignSearch && { search: campaignSearch })
      });

      const response = await api.get(`/admin/newsletter/campaigns?${params}`);
      setCampaigns(response.data.campaigns);
      setCampaignTotal(response.data.total);
      setCampaignPages(response.data.pages);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      setCampaignsError(error.response?.data?.message || 'Failed to load campaigns');
      toast({
        title: 'Error',
        description: 'Failed to load campaigns. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCampaignsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await api.get('/admin/newsletter/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/newsletter/subscribers', formData);
      fetchSubscribers();
      fetchStats();
      setShowAddDialog(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Subscriber added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add subscriber',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      await api.delete(`/admin/newsletter/subscribers/${selectedItem.id}`);
      fetchSubscribers();
      fetchStats();
      setShowDeleteDialog(false);
      toast({
        title: 'Success',
        description: 'Subscriber deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete subscriber',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async () => {
    try {
      const lines = importData.split('\n').filter(line => line.trim());
      const subscribers = lines.map(line => {
        const [email, name] = line.split(',').map(s => s.trim());
        return { email, name };
      });

      const response = await api.post('/admin/newsletter/subscribers/import', { subscribers });
      
      fetchSubscribers();
      fetchStats();
      setShowImportDialog(false);
      setImportData('');
      
      toast({
        title: 'Import Completed',
        description: `Added: ${response.data.results.added}, Skipped: ${response.data.results.skipped}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to import subscribers',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/newsletter/subscribers/export?format=csv', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'newsletter-subscribers.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export subscribers',
        variant: 'destructive',
      });
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.title || !campaignForm.subject || !campaignForm.content) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/admin/newsletter/campaigns', campaignForm);
      setCampaigns([response.data, ...campaigns]);
      setShowCampaignDialog(false);
      resetCampaignForm();
      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCampaign = async (campaign: Campaign) => {
    setSelectedItem(campaign);
    setShowSendDialog(true);
  };

  const handleConfirmSend = async () => {
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      await api.post(`/admin/newsletter/campaigns/${selectedItem.id}/send`);
      fetchCampaigns();
      setShowSendDialog(false);
      toast({
        title: 'Success',
        description: 'Campaign sending started',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send campaign',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/admin/newsletter/templates', templateForm);
      setTemplates([response.data, ...templates]);
      setShowTemplateDialog(false);
      resetTemplateForm();
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create template',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      source: 'admin'
    });
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      title: '',
      subject: '',
      preview_text: '',
      content: '',
      scheduled_for: '',
      template_id: ''
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      content: '',
      is_default: false
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'unsubscribed':
        return <Badge variant="secondary">Unsubscribed</Badge>;
      case 'bounced':
        return <Badge variant="destructive">Bounced</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCampaignStatusBadge = (status: string) => {
    switch(status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500 text-white">Scheduled</Badge>;
      case 'sending':
        return <Badge className="bg-yellow-500 text-white">Sending</Badge>;
      case 'sent':
        return <Badge className="bg-green-500 text-white">Sent</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (subscribersLoading && subscribers.length === 0 && activeTab === 'subscribers') {
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
          <h1 className="text-3xl font-display font-bold">Newsletter</h1>
          <p className="text-muted-foreground mt-1">
            Manage subscribers and email campaigns
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            if (activeTab === 'subscribers') fetchSubscribers();
            else if (activeTab === 'campaigns') fetchCampaigns();
            else if (activeTab === 'templates') fetchTemplates();
          }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {activeTab === 'subscribers' && (
            <>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subscriber
              </Button>
            </>
          )}
          {activeTab === 'campaigns' && (
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
              onClick={() => setShowCampaignDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          )}
          {activeTab === 'templates' && (
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
              onClick={() => setShowTemplateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                  <p className="text-3xl font-bold mt-1">{stats.total.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold mt-1">
                    {stats.byStatus.find(s => s.status === 'active')?.count || 0}
                  </p>
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
                  <p className="text-sm text-muted-foreground">Campaigns Sent</p>
                  <p className="text-3xl font-bold mt-1">{stats.campaigns.sent_campaigns}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Open Rate</p>
                  <p className="text-3xl font-bold mt-1">{stats.campaigns.avg_open_rate?.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={subscriberStatus} onValueChange={setSubscriberStatus}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscribers Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                      </TableCell>
                    </TableRow>
                  ) : subscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No subscribers found</p>
                        <p className="text-sm text-muted-foreground">
                          Add your first subscriber to get started
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                                {getInitials(subscriber.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{subscriber.name || 'No name'}</p>
                              <p className="text-xs text-muted-foreground">{subscriber.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                        <TableCell className="capitalize">{subscriber.source}</TableCell>
                        <TableCell>
                          <p className="text-sm">{format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistance(new Date(subscriber.subscribed_at), new Date(), { addSuffix: true })}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedItem(subscriber);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {subscriberPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {subscriberPage} of {subscriberPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubscriberPage(p => Math.max(1, p - 1))}
                  disabled={subscriberPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubscriberPage(p => Math.min(subscriberPages, p + 1))}
                  disabled={subscriberPage === subscriberPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={campaignStatus} onValueChange={setCampaignStatus}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignStatusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Grid */}
          {campaignsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No campaigns found</p>
                <p className="text-sm text-muted-foreground">
                  Create your first email campaign
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {campaign.subject}
                        </CardDescription>
                      </div>
                      {getCampaignStatusBadge(campaign.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{campaign.recipient_count} recipients</span>
                        </div>
                        {campaign.scheduled_for && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{format(new Date(campaign.scheduled_for), 'MMM d')}</span>
                          </div>
                        )}
                      </div>

                      {campaign.status === 'sent' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Opens</span>
                            <span className="font-medium">
                              {((campaign.opened_count / campaign.recipient_count) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={(campaign.opened_count / campaign.recipient_count) * 100} 
                            className="h-2" 
                          />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Clicks</span>
                            <span className="font-medium">
                              {((campaign.clicked_count / campaign.recipient_count) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={(campaign.clicked_count / campaign.recipient_count) * 100} 
                            className="h-2" 
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created by {campaign.created_by_name}</span>
                        <span>{format(new Date(campaign.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 p-3 flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/admin/newsletter/campaigns/${campaign.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {campaign.status === 'draft' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSendCampaign(campaign)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedItem(campaign);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {campaignPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {campaignPage} of {campaignPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCampaignPage(p => Math.max(1, p - 1))}
                  disabled={campaignPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCampaignPage(p => Math.min(campaignPages, p + 1))}
                  disabled={campaignPage === campaignPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {templatesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No templates found</p>
                <p className="text-sm text-muted-foreground">
                  Create your first email template
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.subject}
                        </CardDescription>
                      </div>
                      {template.is_default && (
                        <Badge className="bg-blue-500 text-white">Default</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 p-3 flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Subscriber Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
            <DialogDescription>
              Add a new email subscriber to your newsletter list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="customer@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscriber} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Subscribers</DialogTitle>
            <DialogDescription>
              Paste your subscriber list (one email per line, or email,name format)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="john@example.com, John Doe&#10;jane@example.com, Jane Smith&#10;mark@example.com"
              rows={8}
              className="font-mono"
            />
            
            <p className="text-xs text-muted-foreground">
              Format: email,name (optional). One per line.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>
              Create a new email campaign for your subscribers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                value={campaignForm.title}
                onChange={(e) => setCampaignForm({...campaignForm, title: e.target.value})}
                placeholder="Summer Sale 2026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
                placeholder="Don't miss our biggest sale of the year!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preview">Preview Text</Label>
              <Input
                id="preview"
                value={campaignForm.preview_text}
                onChange={(e) => setCampaignForm({...campaignForm, preview_text: e.target.value})}
                placeholder="Short preview that appears in inbox"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Use Template (Optional)</Label>
              <Select 
                value={campaignForm.template_id} 
                onValueChange={(value) => {
                  const template = templates.find(t => t.id.toString() === value);
                  if (template) {
                    setCampaignForm({
                      ...campaignForm,
                      template_id: value,
                      subject: template.subject,
                      content: template.content
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Email Content *</Label>
              <Textarea
                id="content"
                value={campaignForm.content}
                onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
                placeholder="Write your email content here..."
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule (Optional)</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={campaignForm.scheduled_for}
                onChange={(e) => setCampaignForm({...campaignForm, scheduled_for: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>
              Create a reusable email template
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                placeholder="Summer Sale Template"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateSubject">Default Subject *</Label>
              <Input
                id="templateSubject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                placeholder="Subject line for this template"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateContent">Template Content *</Label>
              <Textarea
                id="templateContent"
                value={templateForm.content}
                onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                placeholder="Write your template HTML here..."
                rows={10}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_default"
                checked={templateForm.is_default}
                onCheckedChange={(checked) => setTemplateForm({...templateForm, is_default: checked})}
              />
              <Label htmlFor="is_default">Set as default template</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Campaign Dialog */}
      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send "{selectedItem?.title}" to all active subscribers.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
              {selectedItem?.email && ` This will permanently delete ${selectedItem.email}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={activeTab === 'subscribers' ? handleDeleteSubscriber : undefined}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Newsletter;