import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
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
  Copy,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Headset
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance, addDays, subDays, isToday, isTomorrow, isThisWeek, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface CallRecord {
  id: string;
  subscriptionId: string;
  subscriptionNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar?: string;
  planName: string;
  callType: 'inbound' | 'outbound' | 'missed' | 'voicemail';
  callStatus: 'pending' | 'called' | 'confirmed' | 'no_answer' | 'call_later' | 'voicemail' | 'wrong_number' | 'not_interested';
  callDuration?: number;
  callDate: string;
  callTime?: string;
  scheduledCallDate?: string;
  scheduledCallTime?: string;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpTime?: string;
  callOutcome?: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  assignedToName?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface CallStats {
  total: number;
  pending: number;
  called: number;
  confirmed: number;
  noAnswer: number;
  callLater: number;
  voicemail: number;
  wrongNumber: number;
  notInterested: number;
  inbound: number;
  outbound: number;
  missed: number;
  avgDuration: number;
  followUpRequired: number;
}

const callTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'inbound', label: 'Inbound', color: 'bg-green-500' },
  { value: 'outbound', label: 'Outbound', color: 'bg-blue-500' },
  { value: 'missed', label: 'Missed', color: 'bg-red-500' },
  { value: 'voicemail', label: 'Voicemail', color: 'bg-purple-500' },
];

const callStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'called', label: 'Called', color: 'bg-blue-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
  { value: 'no_answer', label: 'No Answer', color: 'bg-red-500' },
  { value: 'call_later', label: 'Call Later', color: 'bg-orange-500' },
  { value: 'voicemail', label: 'Voicemail', color: 'bg-purple-500' },
  { value: 'wrong_number', label: 'Wrong Number', color: 'bg-gray-500' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-red-500' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
  { value: 'medium', label: 'Medium', color: 'bg-orange-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
];

const PendingCalls = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCallType, setSelectedCallType] = useState<string>('all');
  const [selectedCallStatus, setSelectedCallStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showCallDetails, setShowCallDetails] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const [callForm, setCallForm] = useState({
    callStatus: 'called' as const,
    notes: '',
    followUpRequired: false,
    followUpDate: '',
    followUpTime: '',
    priority: 'medium' as const
  });
  
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    priority: 'medium' as const
  });
  
  const [stats, setStats] = useState<CallStats>({
    total: 0,
    pending: 0,
    called: 0,
    confirmed: 0,
    noAnswer: 0,
    callLater: 0,
    voicemail: 0,
    wrongNumber: 0,
    notInterested: 0,
    inbound: 0,
    outbound: 0,
    missed: 0,
    avgDuration: 0,
    followUpRequired: 0
  });

  const [assignees, setAssignees] = useState<{ id: string; name: string; activeCalls: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCalls();
    fetchAssignees();
  }, []);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockCalls: CallRecord[] = [
        {
          id: '1',
          subscriptionId: '1',
          subscriptionNumber: 'SUB-202602-0001',
          customerName: 'Brian Phiri',
          customerEmail: 'brian.phiri@example.com',
          customerPhone: '+265991234567',
          planName: 'Weekly Veggie Box',
          callType: 'outbound',
          callStatus: 'confirmed',
          callDuration: 245,
          callDate: '2026-02-24',
          callTime: '14:30',
          notes: 'Customer confirmed subscription, prefers morning deliveries',
          followUpRequired: false,
          priority: 'high',
          tags: ['confirmed', 'morning-delivery'],
          createdAt: '2026-02-24T14:35:00Z',
          updatedAt: '2026-02-24T14:35:00Z'
        },
        {
          id: '2',
          subscriptionId: '2',
          subscriptionNumber: 'SUB-202602-0002',
          customerName: 'Mary Banda',
          customerEmail: 'mary.banda@example.com',
          customerPhone: '+265992345678',
          planName: 'Daily Bread Club',
          callType: 'outbound',
          callStatus: 'pending',
          callDate: '2026-02-25',
          scheduledCallDate: '2026-02-26',
          scheduledCallTime: '10:00',
          notes: 'Need to confirm subscription details',
          followUpRequired: true,
          followUpDate: '2026-02-26',
          followUpTime: '10:00',
          priority: 'high',
          tags: ['pending', 'follow-up'],
          createdAt: '2026-02-25T09:15:00Z',
          updatedAt: '2026-02-25T09:15:00Z'
        },
        {
          id: '3',
          subscriptionId: '3',
          subscriptionNumber: 'SUB-202602-0003',
          customerName: 'John Chimwala',
          customerEmail: 'john.chimwala@example.com',
          customerPhone: '+265993456789',
          planName: 'Dairy Delight',
          callType: 'inbound',
          callStatus: 'called',
          callDuration: 180,
          callDate: '2026-02-23',
          callTime: '11:15',
          notes: 'Customer called to ask about delivery schedule',
          followUpRequired: false,
          priority: 'medium',
          tags: ['inbound', 'info'],
          createdAt: '2026-02-23T11:20:00Z',
          updatedAt: '2026-02-23T11:20:00Z'
        },
        {
          id: '4',
          subscriptionId: '4',
          subscriptionNumber: 'SUB-202602-0004',
          customerName: 'Alice Phiri',
          customerEmail: 'alice.phiri@example.com',
          customerPhone: '+265994567890',
          planName: 'Family Essentials',
          callType: 'outbound',
          callStatus: 'no_answer',
          callDate: '2026-02-24',
          callTime: '15:30',
          notes: 'No answer, will try again tomorrow',
          followUpRequired: true,
          followUpDate: '2026-02-25',
          followUpTime: '09:00',
          priority: 'medium',
          tags: ['no-answer', 'follow-up'],
          createdAt: '2026-02-24T15:35:00Z',
          updatedAt: '2026-02-24T15:35:00Z'
        },
        {
          id: '5',
          subscriptionId: '5',
          subscriptionNumber: 'SUB-202602-0005',
          customerName: 'David Banda',
          customerEmail: 'david.banda@example.com',
          customerPhone: '+265995678901',
          planName: 'Weekly Veggie Box',
          callType: 'outbound',
          callStatus: 'call_later',
          callDate: '2026-02-24',
          scheduledCallDate: '2026-02-26',
          scheduledCallTime: '14:00',
          notes: 'Customer asked to call back on Thursday afternoon',
          followUpRequired: true,
          followUpDate: '2026-02-26',
          followUpTime: '14:00',
          priority: 'low',
          tags: ['call-later'],
          createdAt: '2026-02-24T16:45:00Z',
          updatedAt: '2026-02-24T16:45:00Z'
        },
        {
          id: '6',
          subscriptionId: '6',
          subscriptionNumber: 'SUB-202602-0006',
          customerName: 'Grace Mwale',
          customerEmail: 'grace.mwale@example.com',
          customerPhone: '+265996789012',
          planName: 'Daily Bread Club',
          callType: 'missed',
          callStatus: 'voicemail',
          callDate: '2026-02-25',
          callTime: '08:45',
          notes: 'Left voicemail, waiting for callback',
          followUpRequired: true,
          followUpDate: '2026-02-26',
          followUpTime: '09:00',
          priority: 'medium',
          tags: ['voicemail', 'follow-up'],
          createdAt: '2026-02-25T08:50:00Z',
          updatedAt: '2026-02-25T08:50:00Z'
        },
        {
          id: '7',
          subscriptionId: '7',
          subscriptionNumber: 'SUB-202602-0007',
          customerName: 'Peter Kachale',
          customerEmail: 'peter.kachale@example.com',
          customerPhone: '+265997890123',
          planName: 'Dairy Delight',
          callType: 'outbound',
          callStatus: 'wrong_number',
          callDate: '2026-02-22',
          callTime: '10:30',
          notes: 'Wrong number, need to find correct contact',
          followUpRequired: true,
          priority: 'high',
          tags: ['wrong-number', 'urgent'],
          createdAt: '2026-02-22T10:35:00Z',
          updatedAt: '2026-02-22T10:35:00Z'
        },
        {
          id: '8',
          subscriptionId: '8',
          subscriptionNumber: 'SUB-202602-0008',
          customerName: 'Chisomo Banda',
          customerEmail: 'chisomo.banda@example.com',
          customerPhone: '+265998901234',
          planName: 'Family Essentials',
          callType: 'outbound',
          callStatus: 'not_interested',
          callDuration: 120,
          callDate: '2026-02-21',
          callTime: '14:15',
          notes: 'Customer not interested in subscription at this time',
          followUpRequired: false,
          priority: 'low',
          tags: ['not-interested'],
          createdAt: '2026-02-21T14:20:00Z',
          updatedAt: '2026-02-21T14:20:00Z'
        },
        {
          id: '9',
          subscriptionId: '9',
          subscriptionNumber: 'SUB-202602-0009',
          customerName: 'Tiwonge Phiri',
          customerEmail: 'tiwonge.phiri@example.com',
          customerPhone: '+265999012345',
          planName: 'Weekly Veggie Box',
          callType: 'inbound',
          callStatus: 'confirmed',
          callDuration: 320,
          callDate: '2026-02-20',
          callTime: '09:30',
          notes: 'Customer called to upgrade plan',
          followUpRequired: false,
          priority: 'high',
          tags: ['inbound', 'upgrade'],
          createdAt: '2026-02-20T09:35:00Z',
          updatedAt: '2026-02-20T09:35:00Z'
        },
        {
          id: '10',
          subscriptionId: '10',
          subscriptionNumber: 'SUB-202602-0010',
          customerName: 'Kondwani Mwale',
          customerEmail: 'kondwani.mwale@example.com',
          customerPhone: '+265990123456',
          planName: 'Daily Bread Club',
          callType: 'outbound',
          callStatus: 'pending',
          callDate: '2026-02-25',
          scheduledCallDate: '2026-02-26',
          scheduledCallTime: '11:30',
          notes: 'Initial contact, need to explain subscription benefits',
          followUpRequired: true,
          followUpDate: '2026-02-26',
          followUpTime: '11:30',
          priority: 'medium',
          tags: ['pending', 'new'],
          createdAt: '2026-02-25T13:20:00Z',
          updatedAt: '2026-02-25T13:20:00Z'
        }
      ];
      
      setCalls(mockCalls);
      calculateStats(mockCalls);
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calls',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignees = async () => {
    try {
      setAssignees([
        { id: '1', name: 'John Admin', activeCalls: 5 },
        { id: '2', name: 'Mary Manager', activeCalls: 3 },
        { id: '3', name: 'Peter Support', activeCalls: 7 },
        { id: '4', name: 'Grace Sales', activeCalls: 2 },
      ]);
    } catch (error) {
      console.error('Error fetching assignees:', error);
    }
  };

  const calculateStats = (data: CallRecord[]) => {
    const avgDuration = data
      .filter(c => c.callDuration)
      .reduce((sum, c) => sum + (c.callDuration || 0), 0) / data.filter(c => c.callDuration).length || 0;
    
    setStats({
      total: data.length,
      pending: data.filter(c => c.callStatus === 'pending').length,
      called: data.filter(c => c.callStatus === 'called').length,
      confirmed: data.filter(c => c.callStatus === 'confirmed').length,
      noAnswer: data.filter(c => c.callStatus === 'no_answer').length,
      callLater: data.filter(c => c.callStatus === 'call_later').length,
      voicemail: data.filter(c => c.callStatus === 'voicemail').length,
      wrongNumber: data.filter(c => c.callStatus === 'wrong_number').length,
      notInterested: data.filter(c => c.callStatus === 'not_interested').length,
      inbound: data.filter(c => c.callType === 'inbound').length,
      outbound: data.filter(c => c.callType === 'outbound').length,
      missed: data.filter(c => c.callType === 'missed').length,
      avgDuration: Math.round(avgDuration) || 0,
      followUpRequired: data.filter(c => c.followUpRequired).length
    });
  };

  const handleViewCall = (call: CallRecord) => {
    setSelectedCall(call);
    setShowCallDetails(true);
  };

  const handleLogCall = (call: CallRecord) => {
    setSelectedCall(call);
    setCallForm({
      callStatus: call.callStatus as any,
      notes: call.notes || '',
      followUpRequired: call.followUpRequired,
      followUpDate: call.followUpDate || '',
      followUpTime: call.followUpTime || '',
      priority: call.priority as any
    });
    setShowCallDialog(true);
  };

  const handleScheduleCall = (call: CallRecord) => {
    setSelectedCall(call);
    setScheduleForm({
      scheduledDate: call.scheduledCallDate || '',
      scheduledTime: call.scheduledCallTime || '',
      notes: call.notes || '',
      priority: call.priority as any
    });
    setShowScheduleDialog(true);
  };

  const handleSaveCall = () => {
    if (!selectedCall) return;
    
    try {
      setCalls(prev => prev.map(c => 
        c.id === selectedCall.id 
          ? { 
              ...c, 
              callStatus: callForm.callStatus,
              notes: callForm.notes,
              followUpRequired: callForm.followUpRequired,
              followUpDate: callForm.followUpDate,
              followUpTime: callForm.followUpTime,
              priority: callForm.priority,
              updatedAt: new Date().toISOString()
            }
          : c
      ));
      
      setShowCallDialog(false);
      toast({
        title: 'Call Updated',
        description: 'Call record has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update call',
        variant: 'destructive',
      });
    }
  };

  const handleScheduleSave = () => {
    if (!selectedCall) return;
    
    try {
      setCalls(prev => prev.map(c => 
        c.id === selectedCall.id 
          ? { 
              ...c, 
              scheduledCallDate: scheduleForm.scheduledDate,
              scheduledCallTime: scheduleForm.scheduledTime,
              notes: scheduleForm.notes,
              priority: scheduleForm.priority,
              callStatus: 'call_later',
              followUpRequired: true,
              followUpDate: scheduleForm.scheduledDate,
              followUpTime: scheduleForm.scheduledTime,
              updatedAt: new Date().toISOString()
            }
          : c
      ));
      
      setShowScheduleDialog(false);
      toast({
        title: 'Call Scheduled',
        description: 'Call has been scheduled successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule call',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsDone = (callId: string) => {
    try {
      setCalls(prev => prev.map(c => 
        c.id === callId 
          ? { ...c, callStatus: 'called', updatedAt: new Date().toISOString() }
          : c
      ));
      
      toast({
        title: 'Call Marked',
        description: 'Call has been marked as done',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark call',
        variant: 'destructive',
      });
    }
  };

  const handleReschedule = (callId: string) => {
    const call = calls.find(c => c.id === callId);
    if (call) {
      handleScheduleCall(call);
    }
  };

  const handleAssignToMe = (callId: string) => {
    try {
      setCalls(prev => prev.map(c => 
        c.id === callId 
          ? { ...c, assignedTo: 'current-user', assignedToName: 'Current User', updatedAt: new Date().toISOString() }
          : c
      ));
      
      toast({
        title: 'Call Assigned',
        description: 'Call has been assigned to you',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign call',
        variant: 'destructive',
      });
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch(type) {
      case 'inbound': return PhoneIncoming;
      case 'outbound': return PhoneOutgoing;
      case 'missed': return PhoneMissed;
      case 'voicemail': return Voicemail;
      default: return Phone;
    }
  };

  const getCallTypeColor = (type: string) => {
    switch(type) {
      case 'inbound': return 'text-green-600';
      case 'outbound': return 'text-blue-600';
      case 'missed': return 'text-red-600';
      case 'voicemail': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-500';
      case 'called': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'no_answer': return 'bg-red-500';
      case 'call_later': return 'bg-orange-500';
      case 'voicemail': return 'bg-purple-500';
      case 'wrong_number': return 'bg-gray-500';
      case 'not_interested': return 'bg-red-500';
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = 
      call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.customerPhone.includes(searchTerm) ||
      call.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCallType = selectedCallType === 'all' || call.callType === selectedCallType;
    const matchesCallStatus = selectedCallStatus === 'all' || call.callStatus === selectedCallStatus;
    const matchesPriority = selectedPriority === 'all' || call.priority === selectedPriority;
    
    let matchesDate = true;
    if (selectedDate === 'today') {
      matchesDate = call.callDate === new Date().toISOString().split('T')[0];
    } else if (selectedDate === 'tomorrow') {
      matchesDate = call.scheduledCallDate === addDays(new Date(), 1).toISOString().split('T')[0];
    } else if (selectedDate === 'week') {
      const weekStart = startOfWeek(new Date()).toISOString().split('T')[0];
      const weekEnd = endOfWeek(new Date()).toISOString().split('T')[0];
      matchesDate = (call.callDate >= weekStart && call.callDate <= weekEnd) ||
                    (call.scheduledCallDate && call.scheduledCallDate >= weekStart && call.scheduledCallDate <= weekEnd);
    }
    
    const matchesAssignee = selectedAssignee === 'all' || call.assignedTo === selectedAssignee;
    
    return matchesSearch && matchesCallType && matchesCallStatus && matchesPriority && matchesDate && matchesAssignee;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCalls.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCalls([]);
    } else {
      setSelectedCalls(filteredCalls.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectCall = (id: string) => {
    setSelectedCalls(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  if (loading) {
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
            Manage and track all customer calls and follow-ups
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
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => {
              setSelectedCall(null);
              setScheduleForm({
                scheduledDate: '',
                scheduledTime: '',
                notes: '',
                priority: 'medium'
              });
              setShowScheduleDialog(true);
            }}
          >
            <Phone className="w-4 h-4 mr-2" />
            Schedule Call
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">Called</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.called}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Confirmed</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400">No Answer</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.noAnswer}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 dark:text-orange-400">Call Later</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.callLater}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400">Follow-up</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.followUpRequired}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Duration</p>
            <p className="text-2xl font-bold">{stats.avgDuration}s</p>
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
                  placeholder="Search by customer, email, phone, subscription #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedCallType} onValueChange={setSelectedCallType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Call Type" />
                </SelectTrigger>
                <SelectContent>
                  {callTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCallStatus} onValueChange={setSelectedCallStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Call Status" />
                </SelectTrigger>
                <SelectContent>
                  {callStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {assignees.map(assignee => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.name} ({assignee.activeCalls})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCallType('all');
                  setSelectedCallStatus('all');
                  setSelectedPriority('all');
                  setSelectedDate('all');
                  setSelectedAssignee('all');
                }}
              >
                Clear Filters
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedCalls.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedCalls.length} call{selectedCalls.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    selectedCalls.forEach(id => handleMarkAsDone(id));
                    setSelectedCalls([]);
                    setSelectAll(false);
                  }}>
                    <Phone className="w-4 h-4 mr-2" />
                    Mark as Called
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowScheduleDialog(true)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    // Assign to current user
                    selectedCalls.forEach(id => handleAssignToMe(id));
                    setSelectedCalls([]);
                    setSelectAll(false);
                  }}>
                    <User className="w-4 h-4 mr-2" />
                    Assign to Me
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCalls.length)} of {filteredCalls.length} calls
        </p>
      </div>

      {/* Calls Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No calls found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or schedule a new call
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((call) => {
                  const TypeIcon = getCallTypeIcon(call.callType);
                  
                  return (
                    <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCalls.includes(call.id)}
                          onChange={() => toggleSelectCall(call.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell onClick={() => handleViewCall(call)}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                              {getInitials(call.customerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{call.customerName}</p>
                            <p className="text-xs text-muted-foreground">{call.customerPhone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewCall(call)}>
                        <div className="flex items-center gap-2">
                          <TypeIcon className={`w-4 h-4 ${getCallTypeColor(call.callType)}`} />
                          <span className="capitalize">{call.callType}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewCall(call)}>
                        <Badge className={`${getStatusColor(call.callStatus)} text-white`}>
                          {call.callStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => handleViewCall(call)}>
                        <Badge className={`${getPriorityColor(call.priority)} text-white`}>
                          {call.priority}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => handleViewCall(call)}>
                        <div>
                          <p className="font-medium">
                            {call.scheduledCallDate ? 'Scheduled: ' : ''}
                            {format(new Date(call.scheduledCallDate || call.callDate), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {call.scheduledCallTime || call.callTime || 'Anytime'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewCall(call)}>
                        <div>
                          <p className="font-medium">{call.planName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{call.subscriptionNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewCall(call)}>
                        <p className="text-sm truncate max-w-[200px]">{call.notes || '-'}</p>
                      </TableCell>
                      <TableCell onClick={() => handleViewCall(call)}>
                        {call.followUpRequired ? (
                          <div>
                            <Badge className="bg-orange-500 text-white">Yes</Badge>
                            {call.followUpDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(call.followUpDate), 'MMM d')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewCall(call)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleLogCall(call)}>
                              <Phone className="w-4 h-4 mr-2" />
                              Log Call
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleScheduleCall(call)}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleMarkAsDone(call.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Called
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReschedule(call.id)}>
                              <Clock className="w-4 h-4 mr-2" />
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignToMe(call.id)}>
                              <User className="w-4 h-4 mr-2" />
                              Assign to Me
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredCalls.length > 0 && (
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

      {/* Call Details Dialog */}
      <Dialog open={showCallDetails} onOpenChange={setShowCallDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              {selectedCall && `Call with ${selectedCall.customerName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedCall && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Call Type</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedCall.callType === 'inbound' && <PhoneIncoming className="w-4 h-4 text-green-600" />}
                    {selectedCall.callType === 'outbound' && <PhoneOutgoing className="w-4 h-4 text-blue-600" />}
                    {selectedCall.callType === 'missed' && <PhoneMissed className="w-4 h-4 text-red-600" />}
                    {selectedCall.callType === 'voicemail' && <Voicemail className="w-4 h-4 text-purple-600" />}
                    <span className="font-medium capitalize">{selectedCall.callType}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`${getStatusColor(selectedCall.callStatus)} text-white mt-1`}>
                    {selectedCall.callStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedCall.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedCall.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedCall.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription</p>
                    <p className="font-medium font-mono">{selectedCall.subscriptionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium">{selectedCall.planName}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Call Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Call Date</p>
                    <p className="font-medium">{format(new Date(selectedCall.callDate), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Call Time</p>
                    <p className="font-medium">{selectedCall.callTime || 'N/A'}</p>
                  </div>
                  {selectedCall.callDuration && (
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{Math.floor(selectedCall.callDuration / 60)} min {selectedCall.callDuration % 60} sec</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge className={`${getPriorityColor(selectedCall.priority)} text-white`}>
                      {selectedCall.priority}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedCall.scheduledCallDate && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Scheduled Follow-up</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{format(new Date(selectedCall.scheduledCallDate), 'PPP')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">{selectedCall.scheduledCallTime || 'Anytime'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedCall.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedCall.notes}</p>
                  </div>
                </>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedCall.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Created: {format(new Date(selectedCall.createdAt), 'PPP p')}</span>
                <span>•</span>
                <span>Updated: {formatDistance(new Date(selectedCall.updatedAt), new Date(), { addSuffix: true })}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallDetails(false)}>
              Close
            </Button>
            {selectedCall && (
              <>
                <Button variant="outline" onClick={() => {
                  setShowCallDetails(false);
                  handleLogCall(selectedCall);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={() => {
                  setShowCallDetails(false);
                  handleScheduleCall(selectedCall);
                }}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>
              {selectedCall ? `Record call with ${selectedCall.customerName}` : 'Record a new call'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Call Status</Label>
              <Select 
                value={callForm.callStatus} 
                onValueChange={(value: any) => setCallForm({...callForm, callStatus: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="called">Called - Successful</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="no_answer">No Answer</SelectItem>
                  <SelectItem value="voicemail">Left Voicemail</SelectItem>
                  <SelectItem value="wrong_number">Wrong Number</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={callForm.priority} 
                onValueChange={(value: any) => setCallForm({...callForm, priority: value})}
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

            <div className="space-y-2">
              <Label>Call Notes</Label>
              <Textarea
                value={callForm.notes}
                onChange={(e) => setCallForm({...callForm, notes: e.target.value})}
                placeholder="Record details of the call..."
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="followUp"
                checked={callForm.followUpRequired}
                onCheckedChange={(checked) => setCallForm({...callForm, followUpRequired: checked})}
              />
              <Label htmlFor="followUp">Follow-up Required</Label>
            </div>

            {callForm.followUpRequired && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Follow-up Date</Label>
                  <Input
                    type="date"
                    value={callForm.followUpDate}
                    onChange={(e) => setCallForm({...callForm, followUpDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Time</Label>
                  <Input
                    type="time"
                    value={callForm.followUpTime}
                    onChange={(e) => setCallForm({...callForm, followUpTime: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCall}>
              Save Call Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Call Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Call</DialogTitle>
            <DialogDescription>
              {selectedCall ? `Schedule call with ${selectedCall.customerName}` : 'Schedule a new call'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!selectedCall && (
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Brian Phiri (SUB-202602-0001)</SelectItem>
                    <SelectItem value="2">Mary Banda (SUB-202602-0002)</SelectItem>
                    <SelectItem value="3">John Chimwala (SUB-202602-0003)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={scheduleForm.scheduledDate}
                  onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={scheduleForm.priority} 
                onValueChange={(value: any) => setScheduleForm({...scheduleForm, priority: value})}
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

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                placeholder="Purpose of call, talking points..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map(assignee => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.name} ({assignee.activeCalls} active)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={selectedCall ? handleScheduleSave : () => {
              setShowScheduleDialog(false);
              toast({
                title: 'Call Scheduled',
                description: 'Call has been scheduled successfully',
              });
            }}>
              Schedule Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingCalls;