import type { LucideProps } from "lucide-react";
import {
  LayoutDashboard, Gauge, Quote, TrendingUp, TrendingDown, Building2, Globe,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MessageCircle, CreditCard, Settings,
  ExternalLink,
  LogOut, Play, ArrowRight, ArrowUp, ArrowLeft, Check, Lock, BadgeCheck, Leaf,
  FlaskConical, Syringe, Car, Sparkles, ShieldCheck, LineChart, WandSparkles,
  Rocket, Calendar, Bell, RefreshCw, FileText, Braces, CircleHelp, Code, Tag,
  Type, Link as LinkIcon, Zap, TriangleAlert, CircleCheckBig, Award, X, Menu, Plus,
  Users, User, Phone, ClipboardList, Search, Mail, CircleX,
  Target, Heart, Star, MapPin, Monitor, ShoppingCart, Clock, Trash2,
} from "lucide-react";

// Lucide icon registry keyed by the kebab-case names used in the design handoff.
// Server-safe (lucide icons render without client hooks). Extend as new screens
// introduce more icons — the IconName union gives autocomplete + compile errors.
const ICONS = {
  "layout-dashboard": LayoutDashboard,
  gauge: Gauge,
  quote: Quote,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "building-2": Building2,
  globe: Globe,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "external-link": ExternalLink,
  "chevron-right": ChevronRight,
  "message-circle": MessageCircle,
  "credit-card": CreditCard,
  settings: Settings,
  "log-out": LogOut,
  play: Play,
  "arrow-right": ArrowRight,
  "arrow-up": ArrowUp,
  "arrow-left": ArrowLeft,
  check: Check,
  lock: Lock,
  "badge-check": BadgeCheck,
  leaf: Leaf,
  "flask-conical": FlaskConical,
  syringe: Syringe,
  car: Car,
  sparkles: Sparkles,
  "shield-check": ShieldCheck,
  "chart-line": LineChart,
  "wand-sparkles": WandSparkles,
  rocket: Rocket,
  calendar: Calendar,
  bell: Bell,
  "refresh-cw": RefreshCw,
  "file-text": FileText,
  braces: Braces,
  "circle-help": CircleHelp,
  code: Code,
  tag: Tag,
  type: Type,
  link: LinkIcon,
  zap: Zap,
  "triangle-alert": TriangleAlert,
  "circle-check-big": CircleCheckBig,
  award: Award,
  x: X,
  menu: Menu,
  plus: Plus,
  users: Users,
  user: User,
  phone: Phone,
  "clipboard-list": ClipboardList,
  search: Search,
  mail: Mail,
  "circle-x": CircleX,
  target: Target,
  heart: Heart,
  star: Star,
  "map-pin": MapPin,
  monitor: Monitor,
  "shopping-cart": ShoppingCart,
  clock: Clock,
  "trash-2": Trash2,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  ...props
}: { name: IconName } & LucideProps) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp size={size} strokeWidth={strokeWidth} {...props} />;
}
