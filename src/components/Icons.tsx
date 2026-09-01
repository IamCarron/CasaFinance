import React from 'react';
import {
  Home,
  Zap,
  Wifi,
  ShoppingCart,
  Tv,
  Sparkles,
  Utensils,
  PiggyBank,
  Car,
  Receipt,
  Heart,
  Coffee,
  Shield,
  Phone,
  Plane,
  Book,
  Film,
  Dumbbell,
  Gift,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Home,
  Zap,
  Wifi,
  ShoppingCart,
  Tv,
  Sparkles,
  Utensils,
  PiggyBank,
  Car,
  Receipt,
  Heart,
  Coffee,
  Shield,
  Phone,
  Plane,
  Book,
  Film,
  Dumbbell,
  Gift,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export function CategoryIcon({
  name,
  className = 'w-5 h-5',
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} style={style} />;
}
