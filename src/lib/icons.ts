import {
  ShoppingCart, Home, Plug, Car, UtensilsCrossed, Clapperboard,
  HeartPulse, ShoppingBag, Wallet, Laptop, CircleDollarSign,
  Circle, Gift, Plane, BookOpen, Dumbbell, Coffee, Smartphone,
  PiggyBank, CreditCard, TrendingUp, TrendingDown, Plus, Minus,
  LayoutDashboard, ArrowLeftRight, Target, Trash2, X, Check,
  ChevronDown, Wallet2, Receipt, Settings, Calendar, Search,
  Sparkles, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
  Umbrella, GraduationCap, Heart, Briefcase, Shield, Star, Trophy,
  Anchor, Mountain, Palmtree, Camera, Gamepad2, Dog, Baby,
  Wrench, Flag, Rocket, Zap, Diamond,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart, Home, Plug, Car, UtensilsCrossed, Clapperboard,
  HeartPulse, ShoppingBag, Wallet, Laptop, CircleDollarSign,
  Circle, Gift, Plane, BookOpen, Dumbbell, Coffee, Smartphone,
  PiggyBank, CreditCard, TrendingUp, TrendingDown, Plus, Minus,
  LayoutDashboard, ArrowLeftRight, Target, Trash2, X, Check,
  ChevronDown, Wallet2, Receipt, Settings, Calendar, Search,
  Sparkles, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
  Umbrella, GraduationCap, Heart, Briefcase, Shield, Star, Trophy,
  Anchor, Mountain, Palmtree, Camera, Gamepad2, Dog, Baby,
  Wrench, Flag, Rocket, Zap, Diamond,
};

export function getCategoryIcon(name: string): LucideIcon {
  return iconMap[name] || Circle;
}

export const availableIcons = Object.keys(iconMap);

export {
  LayoutDashboard, ArrowLeftRight, Target, Plus, Trash2, X, Check,
  ChevronDown, Wallet2, TrendingUp, TrendingDown, Receipt,
  CircleDollarSign, PiggyBank, Calendar, Search, Sparkles,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
};
