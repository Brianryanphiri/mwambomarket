import { useState, useEffect } from 'react';
import api from '@/services/api';
import {
  Bell,
  Search,
  MoreHorizontal,
  Eye,
  Calendar,
  CheckCircle,
  Loader2,
  Download,
  RefreshCw,
  Plus,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Edit,
  Copy,
  ChevronLeft,
  ChevronRight,
  Ban,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance } from 'date-fns';

interface Reminder {
  id: string;
  subscription_id: string;
  subscription_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  plan_name: string;
  reminder_type: 'payment' | 'delivery' | 'call' | 'renewal' | 'expiry' | 'custom';
  message: string;
  scheduled_date: string;
  sent: boolean;
  sent_at?: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

interface ReminderStats {
  total: number;
  sent: number;
  pending: number;
  sent_today: number;
}

const reminderTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'payment', label: 'Payment' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'call', label: 'Call' },
  { value: 'renewal', label: 'Renewal' },
  { value: 'expiry', label: 'Expiry' },
  { value: 'custom', label: 'Custom' },
];

const SubscriptionReminders = () => {
  const { toast } = useToast();
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats>({
    total: 0,
    sent: 0,
    pending: 0,
    sent_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  
  const [reminderForm, setReminderForm] = useState({
    subscription_id: '',
    reminder_type: 'payment',
    message: '',
    scheduled_date: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchReminders();
    fetchSubscriptions();
  }, [selectedType, selectedStatus, searchTerm, currentPage]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await api.get('/admin/subscriptions/reminders', { params });
      setReminders(response.data.reminders);
      setStats(response.data.stats);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reminders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/admin/subscriptions', { 
        params: { limit: 100, status: 'active' }
      });
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleCreateReminder = async () => {
    if (!reminderForm.subscription_id || !reminderForm.message || !reminderForm.scheduled_date) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await api.post('/admin/subscriptions/reminders', reminderForm);
      
      fetchReminders();
      setShowCreateDialog(false);
      setReminderForm({
        subscription_id: '',
        reminder_type: 'payment',
        message: '',
        scheduled_date: '',
        priority: 'medium'
      });
      
      toast({
        title: 'Reminder Created',
        description: 'New reminder has been created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create reminder',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsSent = async (reminderId: string) => {
    try {
      await api.patch(`/admin/subscriptions/reminders/${reminderId}/sent`);
      
      // Update local state
      setReminders(reminders.map(r => 
        r.id === reminderId 
          ? { ...r, sent: true, sent_at: new Date().toISOString() }
          : r
      ));
      
      toast({
        title: 'Reminder Sent',
        description: 'Reminder has been marked as sent',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark reminder as sent',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReminder = async () => {
    if (!selectedReminder) return;
    
    try {
      await api.delete(`/admin/subscriptions/reminders/${selectedReminder.id}`);
      
      setReminders(reminders.filter(r => r.id !== selectedReminder.id));
      setShowDeleteDialog(false);
      setSelectedReminder(null);
      
      toast({
        title: 'Reminder Deleted',
        description: 'Reminder has been deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete reminder',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = (reminder: Reminder) => {
    setReminderForm({
      subscription_id: reminder.subscription_id,
      reminder_type: reminder.reminder_type,
      message: reminder.message,
      scheduled_date: '',
      priority: reminder.priority
    });
    setShowCreateDialog(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'payment': return 'bg-green-500';
      case 'delivery': return 'bg-blue-500';
      case 'call': return 'bg-orange-500';
      case 'renewal': return 'bg-purple-500';
      case 'expiry': return 'bg-red-500';
      case 'custom': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading && reminders.length === 0) {
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
          <h1 className="text-3xl font-display font-bold">Subscription Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Manage all automated and manual reminders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchReminders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Reminder
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Reminders</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">Pending</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Sent</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400">Sent Today</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.sent_today}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, subscription, or message..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={(value) => {
                setSelectedType(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Reminder Type" />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedStatus('all');
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {reminders.length} of {stats.total} reminders
        </p>
      </div>

      {/* Reminders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No reminders found</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first reminder to get started
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                reminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                            {getInitials(reminder.customer_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{reminder.customer_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {reminder.subscription_number}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeColor(reminder.reminder_type)} text-white`}>
                        {reminder.reminder_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-2">{reminder.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {reminder.plan_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{format(new Date(reminder.scheduled_date), 'MMM d, yyyy')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {reminder.sent ? (
                        <div>
                          <Badge className="bg-green-500 text-white">Sent</Badge>
                          {reminder.sent_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistance(new Date(reminder.sent_at), new Date(), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Badge className="bg-yellow-500 text-white">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(reminder.priority)} text-white`}>
                        {reminder.priority}
                      </Badge>
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
                          {!reminder.sent && (
                            <DropdownMenuItem onClick={() => handleMarkAsSent(reminder.id)}>
                              <Send className="w-4 h-4 mr-2" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDuplicate(reminder)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedReminder(reminder);
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Reminder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Reminder</DialogTitle>
            <DialogDescription>
              Schedule a new reminder for a subscriber
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Subscriber *</Label>
              <Select 
                value={reminderForm.subscription_id} 
                onValueChange={(value) => setReminderForm({...reminderForm, subscription_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subscriber" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.customer_name} ({sub.subscription_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reminder Type *</Label>
              <Select 
                value={reminderForm.reminder_type} 
                onValueChange={(value) => setReminderForm({...reminderForm, reminder_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment Reminder</SelectItem>
                  <SelectItem value="delivery">Delivery Reminder</SelectItem>
                  <SelectItem value="call">Call Reminder</SelectItem>
                  <SelectItem value="renewal">Renewal Reminder</SelectItem>
                  <SelectItem value="expiry">Expiry Reminder</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={reminderForm.priority} 
                onValueChange={(value) => setReminderForm({...reminderForm, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Scheduled Date *</Label>
              <Input
                type="date"
                value={reminderForm.scheduled_date}
                onChange={(e) => setReminderForm({...reminderForm, scheduled_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={reminderForm.message}
                onChange={(e) => setReminderForm({...reminderForm, message: e.target.value})}
                placeholder="Enter reminder message..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReminder}>
              Create Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reminder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reminder? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReminder && (
            <div className="py-4">
              <p className="font-medium">{selectedReminder.message}</p>
              <p className="text-sm text-muted-foreground mt-1">
                For {selectedReminder.customer_name} - {selectedReminder.subscription_number}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReminder}>
              Delete Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionReminders;