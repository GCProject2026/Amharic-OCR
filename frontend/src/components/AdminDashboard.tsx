import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Download,
  Bell,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCheck,
  UserPlus,
  Crown,
  AlertCircle,
  Upload
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  role: 'User' | 'Premium User' | 'Admin';
  lastExportFormat: 'TXT' | 'DOCX' | 'PDF' | 'N/A';
  lastUploadedDoc: string;
  joinDate: Date;
  totalUploads: number;
  totalExports: number;
}

interface AdminStats {
  totalUsers: number;
  totalUploads: number;
  totalExports: number;
}

interface AdminDashboardProps {
  onClose: () => void;
}

// Mock data for demonstration
const mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'አበበ ተስፋዬ',
    email: 'abebe.tesfaye@email.com',
    isPremium: true,
    role: 'Premium User',
    lastExportFormat: 'PDF',
    lastUploadedDoc: 'ancient_manuscript_1.pdf',
    joinDate: new Date('2024-01-15'),
    totalUploads: 45,
    totalExports: 42
  },
  {
    id: '2',
    name: 'ብርሃን መኮንን',
    email: 'birhan.mekonnen@email.com',
    isPremium: false,
    role: 'User',
    lastExportFormat: 'TXT',
    lastUploadedDoc: 'church_document.jpg',
    joinDate: new Date('2024-02-10'),
    totalUploads: 8,
    totalExports: 7
  },
  {
    id: '3',
    name: 'ደሳለኝ አለማየሁ',
    email: 'desalegn.alemayehu@email.com',
    isPremium: true,
    role: 'Premium User',
    lastExportFormat: 'DOCX',
    lastUploadedDoc: 'historical_text_2024.pdf',
    joinDate: new Date('2023-11-20'),
    totalUploads: 127,
    totalExports: 115
  },
  {
    id: '4',
    name: 'እስቴር ካሳሁን',
    email: 'ester.kassahun@email.com',
    isPremium: false,
    role: 'User',
    lastExportFormat: 'PDF',
    lastUploadedDoc: 'family_records.png',
    joinDate: new Date('2024-03-05'),
    totalUploads: 3,
    totalExports: 3
  },
  {
    id: '5',
    name: 'ጌታቸው አስፋው',
    email: 'getachew.asfaw@email.com',
    isPremium: true,
    role: 'Premium User',
    lastExportFormat: 'TXT',
    lastUploadedDoc: 'religious_scripture_15.pdf',
    joinDate: new Date('2023-12-01'),
    totalUploads: 89,
    totalExports: 82
  },
  {
    id: '6',
    name: 'ሄለን በቀለ',
    email: 'helen.bekele@email.com',
    isPremium: false,
    role: 'User',
    lastExportFormat: 'DOCX',
    lastUploadedDoc: 'letter_scan.jpg',
    joinDate: new Date('2024-02-28'),
    totalUploads: 5,
    totalExports: 4
  },
  {
    id: '7',
    name: 'ኪዳነ ገብረመስቀል',
    email: 'kidane.gebremeskel@email.com',
    isPremium: true,
    role: 'Premium User',
    lastExportFormat: 'PDF',
    lastUploadedDoc: 'museum_archive_34.pdf',
    joinDate: new Date('2023-10-15'),
    totalUploads: 203,
    totalExports: 198
  },
  {
    id: '8',
    name: 'ሊያ ገብሩ',
    email: 'liya.gebru@email.com',
    isPremium: false,
    role: 'User',
    lastExportFormat: 'N/A',
    lastUploadedDoc: 'N/A',
    joinDate: new Date('2024-03-10'),
    totalUploads: 0,
    totalExports: 0
  },
];

interface Notification {
  id: string;
  type: 'user_joined' | 'upgrade' | 'upload' | 'alert';
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: '1', type: 'user_joined', message: 'New user registered', detail: 'ሊያ ገብሩ joined just now', time: '2 min ago', read: false },
  { id: '2', type: 'upgrade', message: 'Premium upgrade', detail: 'ኪዳነ ገብረመስቀል upgraded to Premium', time: '1 hour ago', read: false },
  { id: '3', type: 'upload', message: 'Large batch upload', detail: 'ደሳለኝ አለማየሁ uploaded 12 files', time: '3 hours ago', read: false },
  { id: '4', type: 'alert', message: 'Daily limit hit', detail: 'ብርሃን መኮንን reached free tier limit', time: '5 hours ago', read: true },
  { id: '5', type: 'user_joined', message: 'New user registered', detail: 'እስቴር ካሳሁን joined', time: '1 day ago', read: true },
];

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 5;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  // Calculate statistics
  const stats: AdminStats = {
    totalUsers: mockUsers.length,
    totalUploads: mockUsers.reduce((sum, user) => sum + user.totalUploads, 0),
    totalExports: mockUsers.reduce((sum, user) => sum + user.totalExports, 0),
  };

  // Filter users
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastUploadedDoc.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPremium = filterPremium === 'all' || 
                          (filterPremium === 'premium' && user.isPremium) ||
                          (filterPremium === 'free' && !user.isPremium);
    
    return matchesSearch && matchesPremium;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-amber-50 to-stone-50 border-r-2 border-amber-200 shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b-2 border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-800 to-amber-700 rounded flex items-center justify-center">
                      <span className="text-white text-lg">አ</span>
                    </div>
                    <div>
                      <h2 className="text-amber-900 font-semibold">Admin Panel</h2>
                      <p className="text-xs text-amber-700">Control Center</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-amber-900 hover:bg-amber-100 p-2 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === 'dashboard'
                    ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>

              <button
                onClick={() => setActiveSection('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === 'users'
                    ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">User Management</span>
              </button>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t-2 border-amber-200">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full border-amber-300 text-amber-900 hover:bg-amber-100"
              >
                Back to Main App
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <header className="bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50 border-b-2 border-amber-200 shadow-sm">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-amber-900 hover:bg-amber-100 p-2 rounded"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl text-amber-900 font-semibold">
                    {activeSection === 'dashboard' ? 'Dashboard Overview' : 'User Management'}
                  </h1>
                  <p className="text-sm text-amber-700">
                    {activeSection === 'dashboard' 
                      ? 'System statistics and analytics' 
                      : 'Manage users and monitor activity'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(prev => !prev)}
                    className="relative p-2 text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold px-0.5">{unreadCount}</span>
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border-2 border-amber-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-stone-50 border-b-2 border-amber-200">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-800" />
                          <span className="font-semibold text-amber-900 text-sm">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification List */}
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-amber-700 text-sm">No notifications</div>
                        ) : (
                          notifications.map(n => (
                            <button
                              key={n.id}
                              onClick={() => markRead(n.id)}
                              className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-amber-100 last:border-0 transition-colors ${
                                n.read ? 'bg-white hover:bg-amber-50/40' : 'bg-amber-50/60 hover:bg-amber-100/60'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                                n.type === 'user_joined' ? 'bg-blue-100' :
                                n.type === 'upgrade' ? 'bg-amber-100' :
                                n.type === 'upload' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {n.type === 'user_joined' && <UserPlus className="w-4 h-4 text-blue-600" />}
                                {n.type === 'upgrade' && <Crown className="w-4 h-4 text-amber-700" />}
                                {n.type === 'upload' && <Upload className="w-4 h-4 text-green-600" />}
                                {n.type === 'alert' && <AlertCircle className="w-4 h-4 text-red-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-amber-900">{n.message}</p>
                                <p className="text-xs text-amber-700 mt-0.5 truncate">{n.detail}</p>
                                <p className="text-xs text-amber-500 mt-1">{n.time}</p>
                              </div>
                              {!n.read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-amber-600 rounded-full mt-2" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 border border-amber-300 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-800 to-amber-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">A</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-amber-900">Admin User</p>
                    <p className="text-xs text-amber-700">System Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-amber-50/30 via-stone-50 to-amber-50/50">
            <div className="p-6">
              {activeSection === 'dashboard' && (
                <DashboardSection stats={stats} />
              )}

              {activeSection === 'users' && (
                <UserManagementSection
                  users={paginatedUsers}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filterPremium={filterPremium}
                  onFilterChange={setFilterPremium}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalResults={filteredUsers.length}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}
    </div>
  );
}

function DashboardSection({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Users className="w-8 h-8 text-amber-700" />}
          title="Total Registered Users"
          value={stats.totalUsers}
          subtitle="Active user accounts"
          gradient="from-blue-50 to-blue-100/50"
          borderColor="border-blue-200"
        />

        <StatCard
          icon={<FileText className="w-8 h-8 text-amber-700" />}
          title="Total Uploaded Files"
          value={stats.totalUploads}
          subtitle="Documents processed"
          gradient="from-green-50 to-green-100/50"
          borderColor="border-green-200"
        />

        <StatCard
          icon={<Download className="w-8 h-8 text-amber-700" />}
          title="Total Exported Files"
          value={stats.totalExports}
          subtitle="Downloads completed"
          gradient="from-purple-50 to-purple-100/50"
          borderColor="border-purple-200"
        />
      </div>

      {/* Additional Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-amber-200 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem
              user="አበበ ተስፋዬ"
              action="uploaded ancient_manuscript_1.pdf"
              time="2 hours ago"
            />
            <ActivityItem
              user="ደሳለኝ አለማየሁ"
              action="exported historical_text_2024.pdf as DOCX"
              time="5 hours ago"
            />
            <ActivityItem
              user="ኪዳነ ገብረመስቀል"
              action="upgraded to Premium"
              time="1 day ago"
            />
            <ActivityItem
              user="ብርሃን መኮንን"
              action="uploaded church_document.jpg"
              time="2 days ago"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-amber-200 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">System Overview</h3>
          <div className="space-y-4">
            <OverviewItem
              label="Premium Users"
              value={`${mockUsers.filter(u => u.isPremium).length} / ${stats.totalUsers}`}
              percentage={(mockUsers.filter(u => u.isPremium).length / stats.totalUsers * 100).toFixed(0)}
            />
            <OverviewItem
              label="Conversion Rate"
              value={`${((stats.totalExports / stats.totalUploads) * 100).toFixed(1)}%`}
              percentage={((stats.totalExports / stats.totalUploads) * 100).toFixed(0)}
            />
            <OverviewItem
              label="Avg Uploads per User"
              value={(stats.totalUploads / stats.totalUsers).toFixed(1)}
              percentage="85"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  gradient, 
  borderColor 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: number; 
  subtitle: string;
  gradient: string;
  borderColor: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl border-2 ${borderColor} p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-amber-800/80 mb-1">{title}</p>
          <p className="text-3xl font-bold text-amber-900 mb-1">{value.toLocaleString()}</p>
          <p className="text-xs text-amber-700/70">{subtitle}</p>
        </div>
        <div className="bg-white/80 p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, time }: { user: string; action: string; time: string }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-amber-100 last:border-0">
      <div className="w-8 h-8 bg-gradient-to-br from-amber-700 to-amber-800 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs">{user[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-900">
          <span className="font-medium amharic-text">{user}</span> {action}
        </p>
        <p className="text-xs text-amber-700/70">{time}</p>
      </div>
    </div>
  );
}

function OverviewItem({ label, value, percentage }: { label: string; value: string; percentage: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-amber-800">{label}</span>
        <span className="text-sm font-semibold text-amber-900">{value}</span>
      </div>
      <div className="w-full bg-amber-100 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-amber-700 to-amber-800 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function UserManagementSection({
  users,
  searchQuery,
  onSearchChange,
  filterPremium,
  onFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  totalResults
}: {
  users: AdminUser[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterPremium: 'all' | 'premium' | 'free';
  onFilterChange: (value: 'all' | 'premium' | 'free') => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalResults: number;
}) {
  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border-2 border-amber-200 p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600" />
            <Input
              placeholder="Search by name, email, or document..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-amber-200 focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-700" />
            <Select value={filterPremium} onValueChange={(value: any) => onFilterChange(value)}>
              <SelectTrigger className="w-[180px] border-amber-200">
                <SelectValue placeholder="Filter users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 text-sm text-amber-700">
          Showing {users.length} of {totalResults} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border-2 border-amber-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-amber-50 to-stone-50 border-b-2 border-amber-200">
                <TableHead className="text-amber-900 font-semibold">User Name</TableHead>
                <TableHead className="text-amber-900 font-semibold">Email</TableHead>
                <TableHead className="text-amber-900 font-semibold">Status</TableHead>
                <TableHead className="text-amber-900 font-semibold">Last Export</TableHead>
                <TableHead className="text-amber-900 font-semibold">Last Document</TableHead>
                <TableHead className="text-amber-900 font-semibold">Role</TableHead>
                <TableHead className="text-amber-900 font-semibold text-right">Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="border-b border-amber-100 hover:bg-amber-50/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-700 to-amber-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">{user.name[0]}</span>
                      </div>
                      <span className="amharic-text text-amber-900">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-amber-800">{user.email}</TableCell>
                  <TableCell>
                    {user.isPremium ? (
                      <Badge className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
                        <span className="mr-1">👑</span> Premium
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-300 text-amber-700">
                        Free
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={
                        user.lastExportFormat === 'PDF' ? 'bg-red-100 text-red-800' :
                        user.lastExportFormat === 'DOCX' ? 'bg-blue-100 text-blue-800' :
                        user.lastExportFormat === 'TXT' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }
                    >
                      {user.lastExportFormat}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-amber-800 text-sm">
                    {user.lastUploadedDoc}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm text-amber-900">
                      <div className="font-medium">{user.totalUploads} uploads</div>
                      <div className="text-xs text-amber-700">{user.totalExports} exports</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t-2 border-amber-200 bg-gradient-to-r from-amber-50 to-stone-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-amber-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-amber-300 text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(i + 1)}
                    className={
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white"
                        : "border-amber-300 text-amber-900 hover:bg-amber-100"
                    }
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-amber-300 text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
