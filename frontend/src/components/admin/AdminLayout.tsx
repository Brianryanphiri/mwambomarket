import { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  Tag,
  Truck,
  Gift,
  Star,
  FileText,
  HelpCircle,
  Mail,
  Image,
  Database,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Grid,
  Award,
  TrendingUp,
  DollarSign,
  Percent,
  CreditCard,
  Activity,
  Clock,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Globe,
  MessageSquare,
  Printer,
  Eye,
  Edit,
  Trash2,
  Copy,
  Archive,
  Save,
  Send,
  Calendar,
  MapPin,
  Phone,
  Video,
  Mic,
  Headphones,
  Monitor,
  Smartphone,
  Laptop,
  Watch,
  Camera,
  Image as ImageIcon,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  ShoppingBag,
  ShoppingBasket,
  Wallet,
  Banknote,
  Coins,
  Receipt,
  // FileInvoice is not available, use FileText instead
  BadgePercent,
  BadgeDollarSign,
  BadgeEuro,
  BadgePoundSterling,
  BadgeYen,
  BadgeIndianRupee,
  ChartNoAxesCombined,
  LineChart,
  PieChart,
  AreaChart,
  BarChart,
  CandlestickChart,
  GanttChart,
  Network,
  GitBranch,
  GitMerge,
  GitPullRequest,
  GitCommit,
  GitCompare,
  Workflow,
  Timer,
  Hourglass,
  Sandbox,
  Puzzle,
  Blocks,
  Shapes,
  Palette,
  Brush,
  Paintbrush,
  Scissors,
  Ruler,
  Weight,
  Scale,
  Calculator,
  FileSpreadsheet,
  FileCheck,
  FileX,
  FilePlus,
  FileMinus,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  FolderTree,
  Files,
  Images,
  Video as VideoIcon,
  Podcast,
  Radio,
  Volume1,
  Volume2,
  VolumeX,
  StopCircle,
  CirclePlay,
  CirclePause,
  CircleStop,
  CircleDot,
  CircleDashed,
  CircleDotDashed,
  CircleEllipsis,
  CircleCheck,
  CircleX,
  CircleAlert,
  CircleHelp,
  CirclePlus,
  CircleMinus,
  CircleSlash,
  CircleOff,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Rhombus,
  StarHalf,
  StarOff,
  Sparkles,
  Flame,
  Zap,
  Wind,
  Droplets,
  Leaf,
  TreePine,
  Flower,
  Mountain,
  Sunrise,
  Sunset,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudSun,
  CloudMoon,
  Umbrella,
  Thermometer,
  Waves,
  Anchor,
  Ship,
  Plane,
  Train,
  Car,
  Bike,
  Bus,
  Taxi,
  Fuel,
  Wrench,
  Hammer,
  Tool,
  Construction,
  // Add these imports for Services
  Sun as SunIcon,
  Calendar as CalendarIcon,
  Briefcase,
  GraduationCap,
  Zap as ZapIcon,
  // Subscription Management Icons
  Repeat as RepeatIcon,
  CreditCard as CreditCardIcon,
  Clock as ClockIcon,
  Phone as PhoneIcon,
  Bell as BellIcon,
  FileText as FileTextIcon,
  DollarSign as DollarSignIcon,
  PieChart as PieChartIcon,
  CalendarRange,
  UsersRound,
  PackageCheck,
  PackagePlus,
  PackageMinus,
  PackageSearch,
  PackageX,
  ClipboardList,
  ClipboardCheck,
  ClipboardX,
  ClipboardEdit,
  ListTodo,
  ListChecks,
  ListPlus,
  ListMinus,
  ListX,
  ListFilter,
  ListOrdered,
  ListRestart,
  ListTree,
  ListVideo,
  ListMusic,
  ListEnd,
  ListStart,
  Kanban,
  KanbanSquare,
  KanbanSquareDashed,
  LayoutList,
  LayoutGrid,
  LayoutPanelLeft,
  LayoutPanelTop,
  LayoutPanelBottom,
  LayoutDashboard as LayoutDashboardIcon,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelTopClose,
  PanelTopOpen,
  PanelBottomClose,
  PanelBottomOpen,
  Settings2,
  Settings3,
  Sliders,
  SlidersHorizontal,
  SlidersVertical,
  ToggleLeft,
  ToggleRight,
  ToggleLeft as ToggleLeftIcon,
  ToggleRight as ToggleRightIcon,
  Toggle,
  ToggleLeft as ToggleOff,
  ToggleRight as ToggleOn,
  SwitchCamera,
  BellRing,
  BellDot,
  BellOff,
  BellPlus,
  BellMinus,
  BellElectric,
  BellRing as BellRingIcon,
  BellDot as BellDotIcon,
  BellOff as BellOffIcon,
  BellPlus as BellPlusIcon,
  BellMinus as BellMinusIcon,
  MailOpen,
  MailPlus,
  MailMinus,
  MailQuestion,
  MailSearch,
  MailWarning,
  MailX,
  MailCheck,
  Mailbox,
  Inbox,
  Archive,
  ArchiveX,
  ArchiveRestore,
  Trash,
  Trash2 as TrashIcon,
  TrashX,
  TrashRestore,
  TrashArchive,
  Ban,
  Ban as BanIcon,
  BanX,
  BanCheck,
  BanMinus,
  BanPlus,
  BanAlert,
  CircleAlert as AlertCircleIcon,
  TriangleAlert as AlertTriangleIcon,
  OctagonAlert as AlertOctagonIcon,
  HexagonAlert as AlertHexagonIcon,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  ShieldBan,
  ShieldHalf,
  ShieldOff,
  ShieldQuestion,
  ShieldPlus,
  ShieldMinus,
  LockKeyhole,
  LockKeyholeOpen,
  LockKeyholeMinus,
  LockKeyholePlus,
  LockKeyholeX,
  UnlockKeyhole,
  KeyRound,
  KeySquare,
  KeyRound as KeyIcon,
  KeySquare as KeySquareIcon,
  Fingerprint as FingerprintIcon,
  ScanFace,
  ScanLine,
  ScanText,
  ScanSearch,
  ScanBarcode,
  ScanQrCode,
  ScanEye,
  QrCode,
  Barcode,
  CreditCard as CreditCardIcon2,
  Wallet as WalletIcon,
  WalletCards,
  WalletMinimal,
  Banknote as BanknoteIcon,
  Coins as CoinsIcon,
  CircleDollarSign,
  CircleEuro,
  CirclePound,
  CircleYen,
  CircleIndianRupee,
  BadgeDollarSign as BadgeDollarSignIcon,
  BadgeEuro as BadgeEuroIcon,
  BadgePoundSterling as BadgePoundSterlingIcon,
  BadgeYen as BadgeYenIcon,
  BadgeIndianRupee as BadgeIndianRupeeIcon,
  ChartColumn,
  ChartColumnStacked,
  ChartColumnIncreasing,
  ChartColumnDecreasing,
  ChartLine,
  ChartArea,
  ChartBar,
  ChartBarStacked,
  ChartBarIncreasing,
  ChartBarDecreasing,
  ChartCandlestick,
  ChartGantt,
  ChartNetwork,
  ChartPie,
  ChartScatter,
  ChartSpline,
  ChartBubble,
  ChartFunnel,
  ChartNoAxesColumn,
  ChartNoAxesColumnIncreasing,
  ChartNoAxesColumnDecreasing,
  ChartNoAxesCombined as ChartNoAxesCombinedIcon,
  ChartNoAxesGantt,
  AreaChart as AreaChartIcon,
  BarChart as BarChartIcon,
  BarChartBig,
  BarChartHorizontal,
  BarChartHorizontalBig,
  BarChart3 as BarChart3Icon,
  BarChart4,
  CandlestickChart as CandlestickChartIcon,
  GanttChart as GanttChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon2,
  ScatterChart,
  Sparkles as SparklesIcon,
  Stars,
  Rocket,
  Zap as ZapIcon2,
  ZapOff,
  ZapFast,
  ZapPower,
  ZapCircle,
  Bolt,
  BoltOff,
  Cable,
  CableCar,
  CableCar as CableCarIcon,
  Power,
  PowerOff,
  PowerCircle,
  PowerSquare,
  PowerPlug,
  PowerPlugOff,
  PowerPlugZap,
  Plug,
  PlugZap,
  PlugZap2,
  PlugOff,
  Plug2,
  Battery,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  BatteryCharging,
  BatteryPlus,
  BatteryMinus,
  BatteryX,
  BatteryVertical,
  BatteryVerticalFull,
  BatteryVerticalMedium,
  BatteryVerticalLow,
  BatteryVerticalWarning,
  BatteryVerticalCharging,
  BatteryVerticalPlus,
  BatteryVerticalMinus,
  BatteryVerticalX,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  Wifi as WifiIcon,
  WifiHigh,
  WifiLow,
  WifiZero,
  WifiOff as WifiOffIcon,
  Radio as RadioIcon,
  RadioReceiver,
  RadioTower,
  Satellite,
  SatelliteDish,
  Radioactive,
  Atom,
  Nuclear,
  Fan,
  Fan as FanIcon,
  Blower,
  AirVent,
  AirConditioner,
  Heater,
  Dehumidifier,
  Humidifier,
  Thermometer as ThermometerIcon,
  ThermometerSun,
  ThermometerSnowflake,
  ThermometerHigh,
  ThermometerLow,
  Droplets as DropletsIcon,
  Droplet,
  DropletOff,
  DropletPlus,
  DropletMinus,
  DropletX,
  Waves as WavesIcon,
  WavesLadder,
  Waves as WavesIcon2,
  Sailboat,
  Sailboat as SailboatIcon,
  Ship as ShipIcon,
  ShipWheel,
  Anchor as AnchorIcon,
  LifeBuoy,
  LifeBuoy as LifeBuoyIcon,
  Compass,
  Compass as CompassIcon,
  Map,
  MapPinned,
  MapPlus,
  MapMinus,
  MapX,
  MapCheck,
  MapPin as MapPinIcon,
  MapPinOff,
  MapPinPlus,
  MapPinMinus,
  MapPinX,
  MapPinCheck,
  MapPinHouse,
  MapPinHospital,
  MapPinSchool,
  MapPinFactory,
  MapPinFarm,
  MapPinMountain,
  MapPinLake,
  MapPinOcean,
  MapPinForest,
  MapPinDesert,
  MapPinBeach,
  MapPinIsland,
  MapPinCave,
  MapPinVolcano,
  MapPinCanyon,
  MapPinValley,
  MapPinGlacier,
  MapPinCreek,
  MapPinRiver,
  MapPinWaterfall,
  MapPinHotSpring,
  MapPinGeyser,
  MapPinMeadow,
  MapPinField,
  MapPinOrchard,
  MapPinVineyard,
  MapPinGarden,
  MapPinPark,
  MapPinZoo,
  MapPinMuseum,
  MapPinLibrary,
  MapPinSchool as MapPinSchoolIcon,
  MapPinUniversity,
  MapPinCollege,
  MapPinChurch,
  MapPinMosque,
  MapPinTemple,
  MapPinSynagogue,
  MapPinShrine,
  MapPinPagoda,
  MapPinStupa,
  MapPinPyramid,
  MapPinSphinx,
  MapPinObelisk,
  MapPinTower,
  MapPinCastle,
  MapPinPalace,
  MapPinFort,
  MapPinWall,
  MapPinGate,
  MapPinBridge,
  MapPinTunnel,
  MapPinDam,
  MapPinLighthouse,
  MapPinWindmill,
  MapPinMill,
  MapPinFactory as MapPinFactoryIcon,
  MapPinWarehouse,
  MapPinBarn,
  MapPinSilo,
  MapPinGreenhouse,
  MapPinStable,
  MapPinKennel,
  MapPinCattery,
  MapPinAquarium,
  MapPinTerrarium,
  MapPinAviary,
  MapPinApiary,
  MapPinVineyard as MapPinVineyardIcon,
  MapPinOrchard as MapPinOrchardIcon,
  MapPinField as MapPinFieldIcon,
  MapPinMeadow as MapPinMeadowIcon,
  MapPinGarden as MapPinGardenIcon,
  MapPinPark as MapPinParkIcon,
  MapPinForest as MapPinForestIcon,
  MapPinWood,
  MapPinJungle,
  MapPinRainforest,
  MapPinTaiga,
  MapPinTundra,
  MapPinSteppe,
  MapPinSavanna,
  MapPinPrairie,
  MapPinPlain,
  MapPinPlateau,
  MapPinMesa,
  MapPinButte,
  MapPinCanyon as MapPinCanyonIcon,
  MapPinGorge,
  MapPinRavine,
  MapPinCliff,
  MapPinBluff,
  MapPinPeak,
  MapPinSummit,
  MapPinMountain as MapPinMountainIcon,
  MapPinHill,
  MapPinHill as MapPinHillIcon,
  MapPinSlope,
  MapPinRidge,
  MapPinSaddle,
  MapPinCol,
  MapPinPass,
  MapPinGap,
  MapPinNotch,
  MapPinCirque,
  MapPinCrater,
  MapPinCaldera,
  MapPinValley as MapPinValleyIcon,
  MapPinBasin,
  MapPinDepression,
  MapPinTrench,
  MapPinAbyss,
  MapPinChasm,
  MapPinGulf,
  MapPinBay,
  MapPinCove,
  MapPinInlet,
  MapPinFjord,
  MapPinSound,
  MapPinStrait,
  MapPinChannel,
  MapPinPassage,
  MapPinNarrows,
  MapPinReach,
  MapPinFirth,
  MapPinEstuary,
  MapPinDelta,
  MapPinMouth,
  MapPinSource,
  MapPinHeadwater,
  MapPinTributary,
  MapPinConfluence,
  MapPinFork,
  MapPinBranch,
  MapPinMeander,
  MapPinOxbow,
  MapPinLagoon,
  MapPinLake as MapPinLakeIcon,
  MapPinPond,
  MapPinPool,
  MapPinTarn,
  MapPinMere,
  MapPinLoch,
  MapPinLough,
  MapPinReservoir,
  MapPinTank,
  MapPinWell,
  MapPinSpring,
  MapPinGeyser as MapPinGeyserIcon,
  MapPinHotSpring as MapPinHotSpringIcon,
  MapPinFumarole,
  MapPinSolfatara,
  MapPinMudpot,
  MapPinPaintPot,
  MapPinMudVolcano,
  MapPinSaltFlat,
  MapPinSaltPan,
  MapPinAlkaliFlat,
  MapPinPlaya,
  MapPinSabkha,
  MapPinBajada,
  MapPinAlluvialFan,
  MapPinDelta as MapPinDeltaIcon,
  MapPinFloodplain,
  MapPinLevee,
  MapPinTerrace,
  MapPinBench,
  MapPinStrandline,
  MapPinBeach as MapPinBeachIcon,
  MapPinDune,
  MapPinDune as MapPinDuneIcon,
  MapPinSandDune,
  MapPinSandSheet,
  MapPinErg,
  MapPinReg,
  MapPinHamada,
  MapPinDesert as MapPinDesertIcon,
  MapPinDesertPavement,
  MapPinYardang,
  MapPinVentifact,
  MapPinMushroomRock,
  MapPinHoodoo,
  MapPinBadland,
  MapPinMesa as MapPinMesaIcon,
  MapPinButte as MapPinButteIcon,
  MapPinMonolith,
  MapPinInselberg,
  MapPinTor,
  MapPinStack,
  MapPinSeaStack,
  MapPinSeaArch,
  MapPinSeaCave,
  MapPinBlowhole,
  MapPinWave,
  MapPinWave as MapPinWaveIcon,
  MapPinSeaStack as MapPinSeaStackIcon,
  MapPinSeaArch as MapPinSeaArchIcon,
  MapPinSeaCave as MapPinSeaCaveIcon,
  MapPinBlowhole as MapPinBlowholeIcon,
  MapPinWaveCutPlatform,
  MapPinWaveBuiltTerrace,
  MapPinRaisedBeach,
  MapPinMarineTerrace,
  MapPinCoastalPlain,
  MapPinCoastalMarsh,
  MapPinTidalFlat,
  MapPinTidalChannel,
  MapPinTidalCreek,
  MapPinSaltMarsh,
  MapPinMangrove,
  MapPinMangroveSwamp,
  MapPinMudflat,
  MapPinSandflat,
  MapPinShellBank,
  MapPinOysterReef,
  MapPinCoralReef,
  MapPinCoralAtoll,
  MapPinCay,
  MapPinKey,
  MapPinIsland as MapPinIslandIcon,
  MapPinIslet,
  MapPinArchipelago,
  MapPinAtoll,
  MapPinReef,
  MapPinShoal,
  MapPinBank,
  MapPinBar,
  MapPinSpit,
  MapPinTombolo,
  MapPinPeninsula,
  MapPinCape,
  MapPinHeadland,
  MapPinPoint,
  MapPinPromontory,
  MapPinForeland,
  MapPinNess,
  MapPinMull,
  MapPinRas,
  MapPinCabo,
  MapPinKap,
  MapPinCape as MapPinCapeIcon,
  MapPinHeadland as MapPinHeadlandIcon,
  MapPinPoint as MapPinPointIcon,
  MapPinPromontory as MapPinPromontoryIcon,
  MapPinForeland as MapPinForelandIcon,
  MapPinNess as MapPinNessIcon,
  MapPinMull as MapPinMullIcon,
  MapPinRas as MapPinRasIcon,
  MapPinCabo as MapPinCaboIcon,
  MapPinKap as MapPinKapIcon
} from 'lucide-react';

// Rename Settings import to avoid naming conflict
import { Settings as SettingsIcon } from 'lucide-react';

import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'product' | 'customer' | 'system' | 'alert' | 'subscription';
}

interface QuickAction {
  id: string;
  name: string;
  icon: React.ElementType;
  href: string;
  shortcut?: string;
  color: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission: string;
  badge?: string | number;
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

// Constants
const NOTIFICATION_ICONS: Record<Notification['type'], React.ElementType> = {
  order: ShoppingCart,
  product: Package,
  customer: Users,
  system: SettingsIcon,
  alert: AlertTriangle,
  subscription: RepeatIcon,
};

const NOTIFICATION_COLORS: Record<Notification['type'], string> = {
  order: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950',
  product: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950',
  customer: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950',
  system: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
  alert: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950',
  subscription: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950',
};

const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', name: 'Add Product', icon: Package, href: '/admin/products/new', shortcut: '⌘N', color: 'text-blue-600' },
  { id: '2', name: 'New Order', icon: ShoppingCart, href: '/admin/orders/new', shortcut: '⌘O', color: 'text-green-600' },
  { id: '3', name: 'Create Discount', icon: Tag, href: '/admin/discounts/new', shortcut: '⌘D', color: 'text-purple-600' },
  { id: '4', name: 'Send Email', icon: Mail, href: '/admin/newsletter/new', shortcut: '⌘E', color: 'text-orange-600' },
  { id: '5', name: 'View Subscribers', icon: UsersRound, href: '/admin/subscriptions/subscribers', shortcut: '⌘U', color: 'text-indigo-600' },
];

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    name: 'Main',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'view_analytics' },
      { name: 'Reports', href: '/admin/reports', icon: FileText, permission: 'view_reports' },
    ]
  },
  {
    name: 'Commerce',
    items: [
      { name: 'Products', href: '/admin/products', icon: Package, permission: 'manage_products', badge: '234' },
      { name: 'Categories', href: '/admin/categories', icon: Tag, permission: 'manage_categories' },
      { name: 'Inventory', href: '/admin/inventory', icon: Database, permission: 'manage_inventory', badge: '11' },
      { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, permission: 'view_orders', badge: '12' },
      { name: 'Customers', href: '/admin/customers', icon: Users, permission: 'view_customers', badge: '892' },
      { name: 'Reviews', href: '/admin/reviews', icon: Star, permission: 'manage_reviews', badge: '45' },
    ]
  },
  {
    name: 'Subscriptions',
    items: [
      { name: 'Dashboard', href: '/admin/subscriptions', icon: RepeatIcon, permission: 'manage_subscriptions' },
      { name: 'Active Subscribers', href: '/admin/subscriptions/subscribers', icon: UsersRound, permission: 'manage_subscriptions', badge: '156' },
      { name: 'Pending Calls', href: '/admin/subscriptions/calls', icon: PhoneIcon, permission: 'manage_subscriptions', badge: '23' },
      { name: 'Delivery Schedule', href: '/admin/subscriptions/deliveries', icon: Truck, permission: 'manage_subscriptions', badge: '12' },
      { name: 'Subscription Orders', href: '/admin/subscriptions/orders', icon: PackageCheck, permission: 'manage_subscriptions', badge: '45' },
      { name: 'Invoices', href: '/admin/subscriptions/invoices', icon: Receipt, permission: 'manage_subscriptions', badge: '8' },
      { name: 'Reminders', href: '/admin/subscriptions/reminders', icon: BellIcon, permission: 'manage_subscriptions', badge: '5' },
      { name: 'Statistics', href: '/admin/subscriptions/stats', icon: PieChartIcon, permission: 'manage_subscriptions' },
      { name: 'Subscription Plans', href: '/admin/services/subscriptions', icon: CalendarIcon, permission: 'manage_subscriptions' },
    ]
  },
  {
    name: 'Services',
    items: [
      { name: 'All Services', href: '/admin/services', icon: LayoutDashboard, permission: 'manage_services', badge: '6' },
      { name: 'Family Packages', href: '/admin/services/family', icon: Users, permission: 'manage_services' },
      { name: 'Daily Fresh', href: '/admin/services/daily-fresh', icon: SunIcon, permission: 'manage_services' },
      { name: 'Office Packs', href: '/admin/services/office', icon: Briefcase, permission: 'manage_services' },
      { name: 'Student Packs', href: '/admin/services/student', icon: GraduationCap, permission: 'manage_services' },
      { name: 'Express Delivery', href: '/admin/services/express', icon: ZapIcon, permission: 'manage_services' },
    ]
  },
  {
    name: 'Inventory',
    items: [
      { name: 'Categories', href: '/admin/categories', icon: Grid, permission: 'manage_categories' },
      { name: 'Brands', href: '/admin/brands', icon: Award, permission: 'manage_brands' },
      { name: 'Suppliers', href: '/admin/suppliers', icon: Truck, permission: 'manage_suppliers' },
      { name: 'Warehouse', href: '/admin/warehouse', icon: Database, permission: 'manage_inventory' },
    ]
  },
  {
    name: 'Marketing',
    items: [
      { name: 'Discounts', href: '/admin/discounts', icon: Tag, permission: 'manage_discounts' },
      { name: 'Promotions', href: '/admin/promotions', icon: Gift, permission: 'manage_promotions' },
      { name: 'Campaigns', href: '/admin/campaigns', icon: TrendingUp, permission: 'manage_campaigns' },
      { name: 'Newsletter', href: '/admin/newsletter', icon: Mail, permission: 'manage_newsletter' },
    ]
  },
  {
    name: 'Content',
    items: [
      { name: 'Pages', href: '/admin/pages', icon: FileText, permission: 'manage_pages' },
      { name: 'Blog', href: '/admin/blog', icon: FileText, permission: 'manage_blog' },
      { name: 'Media', href: '/admin/media', icon: Image, permission: 'manage_media' },
      { name: 'FAQ', href: '/admin/faq', icon: HelpCircle, permission: 'manage_faq' },
    ]
  },
  {
    name: 'Settings',
    items: [
      { name: 'General', href: '/admin/settings', icon: SettingsIcon, permission: 'manage_settings' },
      { name: 'Payment', href: '/admin/payment', icon: CreditCard, permission: 'manage_payment' },
      { name: 'Shipping', href: '/admin/shipping', icon: Truck, permission: 'manage_shipping' },
      { name: 'Taxes', href: '/admin/taxes', icon: Percent, permission: 'manage_taxes' },
      { name: 'Users', href: '/admin/users', icon: Users, permission: 'manage_users' },
      { name: 'Permissions', href: '/admin/permissions', icon: Shield, permission: 'manage_permissions' },
    ]
  }
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Order',
      message: 'Order #ORD-2024-001 has been placed',
      time: '2 min ago',
      read: false,
      type: 'order'
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      message: 'Fresh Tomatoes are running low',
      time: '15 min ago',
      read: false,
      type: 'alert'
    },
    {
      id: '3',
      title: 'New Subscription',
      message: 'Brian Phiri subscribed to Weekly Veggie Box',
      time: '25 min ago',
      read: false,
      type: 'subscription'
    },
    {
      id: '4',
      title: 'New Customer',
      message: 'John Banda just registered',
      time: '1 hour ago',
      read: true,
      type: 'customer'
    },
    {
      id: '5',
      title: 'Delivery Scheduled',
      message: '12 deliveries scheduled for tomorrow',
      time: '2 hours ago',
      read: true,
      type: 'subscription'
    },
    {
      id: '6',
      title: 'System Update',
      message: 'System maintenance scheduled',
      time: '2 hours ago',
      read: true,
      type: 'system'
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'ORD-2024-001',
    'Fresh Tomatoes',
    'John Banda',
    'SUB-202602-0001',
    'Brian Phiri'
  ]);

  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout, hasPermission } = useAdminAuth();

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Filter navigation based on permissions
  const filteredNavigation = useMemo(() => 
    NAVIGATION_GROUPS
      .map(group => ({
        ...group,
        items: group.items.filter(item => hasPermission(item.permission))
      }))
      .filter(group => group.items.length > 0),
    [hasPermission]
  );

  const isActive = useCallback((path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/admin/login');
  }, [logout, navigate]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const getNotificationIcon = useCallback((type: Notification['type']) => 
    NOTIFICATION_ICONS[type] || Bell, []);

  const getNotificationColor = useCallback((type: Notification['type']) => 
    NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.system, []);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  // Get subscription-specific notification count
  const subscriptionNotificationCount = useMemo(() => 
    notifications.filter(n => n.type === 'subscription' && !n.read).length,
    [notifications]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Breadcrumb generation
  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const isLast = index === paths.length - 1;
      return { path, href, isLast };
    });
  }, [location.pathname]);

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300",
        darkMode && 'dark'
      )}>
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-black/5 transition-all duration-300 ease-in-out",
            sidebarCollapsed ? 'w-20' : 'w-72',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Sidebar header */}
          <div className={cn(
            "h-20 flex items-center border-b border-gray-200/50 dark:border-gray-700/50",
            sidebarCollapsed ? 'justify-center' : 'justify-between px-6'
          )}>
            {!sidebarCollapsed ? (
              <>
                <Link to="/admin/dashboard" className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <span className="font-display font-bold text-xl bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                      Admin
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">v2.0.0</span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden lg:flex hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(false)}
                  className="hidden lg:flex hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <nav className={cn("py-6 space-y-6", sidebarCollapsed ? 'px-3' : 'px-4')}>
              {filteredNavigation.map((group) => (
                <div key={group.name} className="space-y-2">
                  {!sidebarCollapsed && (
                    <h4 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {group.name}
                    </h4>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Tooltip key={item.name} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              "flex items-center rounded-xl transition-all duration-200 group relative",
                              sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5',
                              active
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Icon className={cn(
                              "shrink-0 transition-transform group-hover:scale-110",
                              sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'
                            )} />
                            
                            {!sidebarCollapsed && (
                              <>
                                <span className="flex-1 text-sm font-medium">{item.name}</span>
                                {item.badge && (
                                  <Badge className={cn(
                                    "ml-auto text-xs px-1.5",
                                    active 
                                      ? 'bg-white/20 text-white' 
                                      : 'bg-red-500 text-white'
                                  )}>
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                          </Link>
                        </TooltipTrigger>
                        {sidebarCollapsed && (
                          <TooltipContent side="right" className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.badge && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Sidebar footer */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl",
            sidebarCollapsed ? 'p-3' : 'p-5'
          )}>
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-11 w-11 ring-2 ring-orange-500/20">
                    <AvatarImage src={admin?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                      {admin?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{admin?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{admin?.email}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-11 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-orange-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                        {admin?.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{admin?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{admin?.email}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}>
          {/* Top header */}
          <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 fixed top-0 right-0 left-0 z-30 shadow-sm"
            style={{ 
              left: sidebarCollapsed ? '5rem' : '18rem',
              transition: 'left 300ms'
            }}
          >
            <div className="h-full px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="w-5 h-5" />
                </Button>

                {/* Breadcrumb */}
                <nav className="hidden sm:flex items-center gap-1.5 text-sm">
                  <Link 
                    to="/admin/dashboard" 
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                  </Link>
                  {breadcrumbs.map(({ path, href, isLast }) => (
                    <div key={path} className="flex items-center">
                      <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                      {isLast ? (
                        <span className="font-medium text-gray-900 dark:text-gray-100 capitalize px-2 py-1">
                          {path.replace(/-/g, ' ')}
                        </span>
                      ) : (
                        <Link
                          to={href}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 capitalize px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          {path.replace(/-/g, ' ')}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-2">
                {/* Quick Actions */}
                <div className="hidden md:flex items-center gap-1">
                  {QUICK_ACTIONS.map((action) => (
                    <Tooltip key={action.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(action.href)}
                          className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <action.icon className={cn("w-4 h-4", action.color)} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.name}</p>
                        {action.shortcut && (
                          <p className="text-xs text-gray-500">{action.shortcut}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                <Separator orientation="vertical" className="h-6 hidden md:block bg-gray-200/50 dark:bg-gray-700/50" />

                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearch(true)}
                    className="w-72 pl-9 pr-4 py-2 bg-gray-100/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-full focus:bg-white dark:focus:bg-gray-800 transition-all"
                  />
                </div>

                {/* Theme toggle */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDarkMode(prev => !prev)}
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{darkMode ? 'Light mode' : 'Dark mode'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Fullscreen toggle */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleFullscreen}
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Notifications */}
                <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <>
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                            {unreadCount}
                          </span>
                        </>
                      )}
                      {subscriptionNotificationCount > 0 && (
                        <span className="absolute -top-1 -left-1 w-5 h-5 bg-indigo-500 text-white text-xs flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900">
                          {subscriptionNotificationCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-96">
                    <DropdownMenuLabel className="flex items-center justify-between p-4">
                      <span className="text-lg font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllNotificationsAsRead}
                          className="h-8 text-xs rounded-full"
                        >
                          Mark all read
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-[480px]">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const Icon = getNotificationIcon(notification.type);
                          return (
                            <DropdownMenuItem
                              key={notification.id}
                              className={cn(
                                "flex items-start gap-4 p-4 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-800",
                                !notification.read && "bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/30"
                              )}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                getNotificationColor(notification.type)
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{notification.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <p className="text-xs text-gray-400">{notification.time}</p>
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                              )}
                            </DropdownMenuItem>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Bell className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">No notifications</p>
                          <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                        </div>
                      )}
                    </ScrollArea>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="p-2">
                      <Link 
                        to="/admin/notifications" 
                        className="justify-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                      >
                        View all notifications
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={admin?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                          {admin?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium">{admin?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{admin?.email}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 hidden sm:block text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="p-4">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold">{admin?.name || 'Admin User'}</span>
                        <span className="text-sm font-normal text-gray-500">{admin?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild className="p-3">
                        <Link to="/admin/profile" className="flex items-center">
                          <User className="w-4 h-4 mr-3" />
                          <span>Profile</span>
                          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-3">
                        <Link to="/admin/settings" className="flex items-center">
                          <SettingsIcon className="w-4 h-4 mr-3" />
                          <span>Settings</span>
                          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-3">
                        <Link to="/admin/activity" className="flex items-center">
                          <Activity className="w-4 h-4 mr-3" />
                          <span>Activity log</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="p-3">
                      <Link to="/admin/help" className="flex items-center">
                        <HelpCircle className="w-4 h-4 mr-3" />
                        <span>Help & support</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="p-3 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>Logout</span>
                      <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="pt-20 min-h-screen">
            <div className="p-6 md:p-8">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Quick search modal */}
        {showSearch && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in"
            onClick={() => setShowSearch(false)}
          >
            <div
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <Input
                    autoFocus
                    type="search"
                    placeholder="Search products, orders, customers, subscriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-gray-400"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSearch(false)}
                    className="rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="max-h-[480px]">
                <div className="p-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Recent searches
                  </div>
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      onClick={() => {
                        setSearchQuery(search);
                        setShowSearch(false);
                      }}
                    >
                      <Search className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      <span>{search}</span>
                    </button>
                  ))}
                  
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6">
                    Quick actions
                  </div>
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      onClick={() => {
                        navigate(action.href);
                        setShowSearch(false);
                      }}
                    >
                      <action.icon className={cn("w-4 h-4", action.color, "group-hover:scale-110 transition-transform")} />
                      <span>{action.name}</span>
                      {action.shortcut && (
                        <span className="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          {action.shortcut}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">↑</kbd>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">↓</kbd>
                    <span>to navigate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">↵</kbd>
                    <span>to select</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">ESC</kbd>
                  <span>to close</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;