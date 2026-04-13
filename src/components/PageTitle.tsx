import {
  Users, UserCheck, UserPlus, UserX, UserMinus, UserCog,
  CalendarDays, CalendarCheck, CalendarX,
  Clock, Timer, AlarmClock,
  FileText, FilePlus, FileSearch, FileSpreadsheet, FileBarChart, FileClock,
  BarChart2, BarChart3, PieChart, TrendingUp,
  Settings, SlidersHorizontal,
  ShieldCheck, Shield, Lock,
  Banknote, Coins, Wallet, Receipt, BadgeDollarSign,
  Building, Building2,
  Package, PackagePlus, PackageSearch,
  ShoppingCart, Store,
  MapPin, Map, Navigation, Globe, Route,
  SearchCheck,
  LayoutGrid, Table, Columns,
  AlertTriangle, AlertCircle, Bell,
  CheckCircle, CheckSquare,
  ClipboardList, ClipboardCheck, ClipboardPen,
  Tag, Tags,
  Layers,
  BookOpen, GraduationCap,
  Image,
  MessageSquare,
  Gift,
  RefreshCw, RefreshCcw,
  Wrench,
  List,
  ChevronRight,
  Plus, Trash2,
  Monitor, Camera,
  Activity, Calculator,
} from "lucide-react";


interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

/** Auto-select an icon from the title text */
function resolveIcon(title: string): React.ReactNode {
  const t = title.toLowerCase();

  // Employee / HR
  if (t.includes("onboard")) return <UserPlus size={26} />;
  if (t.includes("offboard") || t.includes("exit")) return <UserMinus size={26} />;
  if (t.includes("resignation")) return <UserX size={26} />;
  if (t.includes("promotion")) return <TrendingUp size={26} />;
  if (t.includes("manager") || t.includes("admin")) return <UserCog size={26} />;
  if (t.includes("level") || t.includes("hierarchy")) return <LayoutGrid size={26} />;
  if (t.includes("nominee") || t.includes("nomination")) return <UserCheck size={26} />;
  if (t.includes("employee") || t.includes("staff")) return <Users size={26} />;
  if (t.includes("structure")) return <Building2 size={26} />;
  if (t.includes("profile")) return <UserCog size={26} />;

  // Lost & Found
  if (t.includes("lost") || t.includes("found") || t.includes("claim")) return <SearchCheck size={26} />;

  // Shift
  if (t.includes("shift rotation")) return <RefreshCw size={26} />;
  if (t.includes("shift calendar")) return <CalendarDays size={26} />;
  if (t.includes("shift assignment")) return <UserCheck size={26} />;
  if (t.includes("shift request") || t.includes("change request")) return <RefreshCcw size={26} />;
  if (t.includes("shift penalty") || t.includes("penalty rule")) return <AlertTriangle size={26} />;
  if (t.includes("shift report")) return <BarChart2 size={26} />;
  if (t.includes("shift")) return <Clock size={26} />;

  // Leave
  if (t.includes("leave calendar")) return <CalendarCheck size={26} />;
  if (t.includes("leave balance")) return <Wallet size={26} />;
  if (t.includes("leave policy")) return <Shield size={26} />;
  if (t.includes("leave payout")) return <Banknote size={26} />;
  if (t.includes("leave report")) return <BarChart2 size={26} />;
  if (t.includes("leave approval")) return <CheckCircle size={26} />;
  if (t.includes("apply leave") || t.includes("leave request")) return <FilePlus size={26} />;
  if (t.includes("short leave")) return <Timer size={26} />;
  if (t.includes("auto leave")) return <AlarmClock size={26} />;
  if (t.includes("leave group")) return <Users size={26} />;
  if (t.includes("leave reason")) return <MessageSquare size={26} />;
  if (t.includes("leave type")) return <Tags size={26} />;
  if (t.includes("leave setting")) return <Settings size={26} />;
  if (t.includes("leave")) return <CalendarX size={26} />;

  // Holiday
  if (t.includes("holiday exchange")) return <RefreshCw size={26} />;
  if (t.includes("holiday")) return <CalendarDays size={26} />;

  // Payroll / Salary / Finance
  if (t.includes("advance salary") || t.includes("salary request")) return <BadgeDollarSign size={26} />;
  if (t.includes("payroll") || t.includes("payslip")) return <FileText size={26} />;
  if (t.includes("salary")) return <Banknote size={26} />;
  if (t.includes("expense setting")) return <SlidersHorizontal size={26} />;
  if (t.includes("expense")) return <Receipt size={26} />;
  if (t.includes("advance payment") || t.includes("advance")) return <Coins size={26} />;
  if (t.includes("balance sheet")) return <BarChart3 size={26} />;
  if (t.includes("finance") || t.includes("accounting")) return <Calculator size={26} />;

  // Orders / Sales / Products
  if (t.includes("sales dashboard")) return <BarChart3 size={26} />;
  if (t.includes("sales summary") || t.includes("sales dump") || t.includes("sales report")) return <FileBarChart size={26} />;
  if (t.includes("daily sales")) return <TrendingUp size={26} />;
  if (t.includes("stock in") || t.includes("stock out")) return <PackageSearch size={26} />;
  if (t.includes("product stock") || t.includes("available stock")) return <Package size={26} />;
  if (t.includes("product variant")) return <Layers size={26} />;
  if (t.includes("product sub")) return <Tag size={26} />;
  if (t.includes("product category")) return <Tags size={26} />;
  if (t.includes("manage product")) return <PackagePlus size={26} />;
  if (t.includes("order route")) return <Route size={26} />;
  if (t.includes("job location")) return <MapPin size={26} />;
  if (t.includes("order setting")) return <Settings size={26} />;
  if (t.includes("view order")) return <ShoppingCart size={26} />;
  if (t.includes("retailer beat")) return <Map size={26} />;
  if (t.includes("retailer")) return <Store size={26} />;
  if (t.includes("distributor")) return <Navigation size={26} />;
  if (t.includes("manage route") || t.includes("employee route")) return <Navigation size={26} />;
  if (t.includes("manage area")) return <Globe size={26} />;
  if (t.includes("manage cit")) return <Building size={26} />;
  if (t.includes("country")) return <Globe size={26} />;
  if (t.includes("unit measurement")) return <Columns size={26} />;
  if (t.includes("assigned distributor")) return <UserCheck size={26} />;
  if (t.includes("order")) return <ClipboardList size={26} />;

  // Task Sheet
  if (t.includes("task dashboard")) return <LayoutGrid size={26} />;
  if (t.includes("task priority")) return <AlertCircle size={26} />;
  if (t.includes("task category")) return <Tags size={26} />;
  if (t.includes("task report") || t.includes("task sheet report")) return <BarChart2 size={26} />;
  if (t.includes("task setting")) return <Settings size={26} />;
  if (t.includes("manage task") || t.includes("main task")) return <ClipboardCheck size={26} />;
  if (t.includes("task")) return <CheckSquare size={26} />;

  // Quotation
  if (t.includes("generate quotation")) return <FilePlus size={26} />;
  if (t.includes("quotation label")) return <Tag size={26} />;
  if (t.includes("quotation template")) return <FileText size={26} />;
  if (t.includes("quotation table") || t.includes("quotation column")) return <Table size={26} />;
  if (t.includes("manage quotation")) return <ClipboardList size={26} />;
  if (t.includes("quotation")) return <FileSearch size={26} />;

  // LMS
  if (t.includes("course")) return <BookOpen size={26} />;
  if (t.includes("lms") || t.includes("learning")) return <GraduationCap size={26} />;
  if (t.includes("assign lms")) return <UserCheck size={26} />;

  // Penalty
  if (t.includes("penalty to leave")) return <CalendarX size={26} />;
  if (t.includes("pending penalt")) return <AlertCircle size={26} />;
  if (t.includes("manage penalt")) return <AlertTriangle size={26} />;
  if (t.includes("penalties report") || t.includes("penalty report")) return <FileBarChart size={26} />;
  if (t.includes("penalty rule")) return <Shield size={26} />;
  if (t.includes("penalty")) return <AlertTriangle size={26} />;

  // Assets
  if (t.includes("asset dashboard")) return <LayoutGrid size={26} />;
  if (t.includes("asset categor")) return <Tags size={26} />;
  if (t.includes("manage asset")) return <Package size={26} />;
  if (t.includes("asset bulk")) return <FileSpreadsheet size={26} />;
  if (t.includes("asset audit") || t.includes("asset history")) return <FileClock size={26} />;
  if (t.includes("upcoming maintenance")) return <Bell size={26} />;
  if (t.includes("missing maintenance")) return <AlertCircle size={26} />;
  if (t.includes("completed maintenance")) return <CheckCircle size={26} />;
  if (t.includes("maintenance")) return <Wrench size={26} />;
  if (t.includes("asset report")) return <BarChart2 size={26} />;
  if (t.includes("scrap") || t.includes("disposal")) return <Trash2 size={26} />;
  if (t.includes("asset setting")) return <Settings size={26} />;
  if (t.includes("asset")) return <Monitor size={26} />;

  // Settings / Access
  if (t.includes("app access") || t.includes("admin view")) return <ShieldCheck size={26} />;
  if (t.includes("check admin")) return <CheckCircle size={26} />;
  if (t.includes("setting")) return <Settings size={26} />;
  if (t.includes("access")) return <Lock size={26} />;

  // App Banner
  if (t.includes("banner") || t.includes("gallery")) return <Image size={26} />;

  // Survey / Poll / Engagement
  if (t.includes("add survey") || t.includes("create survey")) return <FilePlus size={26} />;
  if (t.includes("manage survey")) return <ClipboardList size={26} />;
  if (t.includes("add poll") || t.includes("create poll")) return <Plus size={26} />;
  if (t.includes("poll summary")) return <PieChart size={26} />;
  if (t.includes("poll")) return <BarChart2 size={26} />;
  if (t.includes("survey")) return <ClipboardPen size={26} />;
  if (t.includes("engagement")) return <Activity size={26} />;
  if (t.includes("celebration")) return <Gift size={26} />;
  if (t.includes("event")) return <CalendarCheck size={26} />;

  // Logs
  if (t.includes("session log")) return <Monitor size={26} />;
  if (t.includes("log")) return <List size={26} />;

  // Template
  if (t.includes("template question")) return <MessageSquare size={26} />;
  if (t.includes("template")) return <FileText size={26} />;

  // Facex / Attendance
  if (t.includes("facex") || t.includes("face")) return <Camera size={26} />;
  if (t.includes("attendance")) return <Activity size={26} />;

  // Bulk update
  if (t.includes("bulk")) return <FileSpreadsheet size={26} />;

  // Dashboard
  if (t.includes("dashboard")) return <LayoutGrid size={26} />;

  // Reports generic
  if (t.includes("report")) return <BarChart2 size={26} />;

  // Default
  return <ChevronRight size={26} />;
}

const PageTitle = ({ title, subtitle, icon }: PageTitleProps) => {
  const resolvedIcon = icon ?? resolveIcon(title);

  return (
    <div className="page-title-block">
      <div className="page-title-row">
        <span className="page-title-icon">{resolvedIcon}</span>
        <h1 className="page-title">{title}</h1>
      </div>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;
