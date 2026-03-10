import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import {
  Phone,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
  Plus,
  User,
  Mail,
  Phone as PhoneIcon,
  MessageSquare,
  Bell,
  Edit,
  ChevronLeft,
  ChevronRight,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Headset
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance } from 'date-fns';

interface CallRecord {
  id: string;
  subscription_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  plan_name: string;
  call_status: 'pending' | 'called' | 'confirmed' | 'no_answer' | 'call_later';
  call_notes?: string;
  next_reminder_date?: string;
  created_at: string;
}

interface CallStats {
  total: number;
  pending: number;
  no_answer: number;
  call_later: number;
  called_today: number;
}

const PendingCalls = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [stats, setStats] = useState<CallStats>({
    total: 0,
    pending: 0,
    no_answer: 0,
    call_later: 0,
    called_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  
  const [callForm, setCallForm] = useState({
    call_status: 'called',
    notes: '',
    next_call_date: ''
  });

  useEffect(() => {
    fetchCalls();
  }, [selectedStatus, searchTerm, currentPage]);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await api.get('/admin/subscriptions/pending-calls', { params });
      setCalls(response.data.calls);
      setStats(response.data.stats);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending calls',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCallStatus = async (callId: string, status: string, notes?: string, nextCallDate?: string) => {
    try {
      await api.patch(`/admin/subscriptions/${callId}/call-status`, {
        call_status: status,
        call_notes: notes,
        next_call_date: nextCallDate
      });
      
      // Refresh the list
      fetchCalls();
      
      toast({
        title: 'Call Updated',
        description: `Call status changed to ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update call status',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsCalled = (call: CallRecord) => {
    handleUpdateCallStatus(call.id, 'called');
  };

  const handleMarkAsConfirmed = (call: CallRecord) => {
    handleUpdateCallStatus(call.id, 'confirmed');
  };

  const handleNoAnswer = (call: CallRecord) => {
    handleUpdateCallStatus(call.id, 'no_answer');
  };

  const handleCallLater = (call: CallRecord) => {
    setSelectedCall(call);
    setCallForm({
      call_status: 'call_later',
      notes: '',
      next_call_date: ''
    });
    setShowCallDialog(true);
  };

  const handleAddNotes = (call: CallRecord) => {
    setSelectedCall(call);
    setCallForm({
      call_status: call.call_status,
      notes: call.call_notes || '',
      next_call_date: call.next_reminder_date || ''
    });
    setShowNotesDialog(true);
  };

  const handleSaveCallLater = () => {
    if (!selectedCall) return;
    
    handleUpdateCallStatus(
      selectedCall.id, 
      'call_later', 
      callForm.notes, 
      callForm.next_call_date
    );
    
    setShowCallDialog(false);
    setSelectedCall(null);
    setCallForm({ call_status: 'called', notes: '', next_call_date: '' });
  };

  const handleSaveNotes = () => {
    if (!selectedCall) return;
    
    handleUpdateCallStatus(
      selectedCall.id, 
      selectedCall.call_status, 
      callForm.notes
    );
    
    setShowNotesDialog(false);
    setSelectedCall(null);
    setCallForm({ call_status: 'called', notes: '', next_call_date: '' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-500';
      case 'called': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'no_answer': return 'bg-red-500';
      case 'call_later': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && calls.length === 0) {
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
          <h1 className="text-3xl font-display font-bold">Pending Calls</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all customer calls that need attention
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchCalls}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pending</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400">No Answer</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.no_answer}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 dark:text-orange-400">Call Later</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.call_later}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Called Today</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.called_today}</p>
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
                  placeholder="Search by name, phone, email, or subscription #..."
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
              <Select value={selectedStatus} onValueChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="no_answer">No Answer</SelectItem>
                  <SelectItem value="call_later">Call Later</SelectItem>
                </SelectContent>
              </Select>

              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {calls.length} of {stats.total} pending calls
        </p>
      </div>

      {/* Calls Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Call</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No pending calls found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                            {getInitials(call.customer_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{call.customer_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{call.customer_phone}</p>
                        <p className="text-xs text-muted-foreground">{call.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-sm">{call.subscription_number}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{call.plan_name}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(call.call_status)} text-white`}>
                        {call.call_status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {call.next_reminder_date ? (
                        <div>
                          <p className="text-sm">{format(new Date(call.next_reminder_date), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(call.next_reminder_date), 'h:mm a')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[200px]">{call.call_notes || '-'}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigate(`/admin/subscriptions/subscribers/${call.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleMarkAsCalled(call)}>
                            <Phone className="w-4 h-4 mr-2" />
                            Mark as Called
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkAsConfirmed(call)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleNoAnswer(call)}>
                            <XCircle className="w-4 h-4 mr-2" />
                            No Answer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCallLater(call)}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Call Later
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAddNotes(call)}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Add Notes
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

      {/* Call Later Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Call Later</DialogTitle>
            <DialogDescription>
              {selectedCall && `Schedule a follow-up call with ${selectedCall.customer_name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Call Later Date & Time</Label>
              <Input
                type="datetime-local"
                value={callForm.next_call_date}
                onChange={(e) => setCallForm({...callForm, next_call_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={callForm.notes}
                onChange={(e) => setCallForm({...callForm, notes: e.target.value})}
                placeholder="Add notes about why you're calling later..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCallLater}>
              Schedule Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Call Notes</DialogTitle>
            <DialogDescription>
              {selectedCall && `Add notes for ${selectedCall.customer_name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={callForm.notes}
                onChange={(e) => setCallForm({...callForm, notes: e.target.value})}
                placeholder="Enter your notes about the call..."
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingCalls;