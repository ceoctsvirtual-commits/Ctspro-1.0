
import React from 'react';
import { 
  Truck, 
  Bus, 
  User, 
  Settings, 
  MapPin, 
  PlusCircle, 
  ShieldCheck, 
  TrendingUp, 
  FileText,
  LogOut
} from 'lucide-react';

export const PLATFORMS = [
  { id: 'WTDS', name: 'World Truck Driving Simulator' },
  { id: 'WBDS', name: 'World Bus Driving Simulator' },
  { id: 'GTO', name: 'Global Truck Online' },
  { id: 'TOE3', name: 'Truckers of Europe 3' },
  { id: 'ETS2', name: 'Euro Truck Simulator 2' }
];

export const ICONS = {
  Truck: <Truck className="w-5 h-5" />,
  Bus: <Bus className="w-5 h-5" />,
  User: <User className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  MapPin: <MapPin className="w-5 h-5" />,
  Plus: <PlusCircle className="w-5 h-5" />,
  Shield: <ShieldCheck className="w-5 h-5" />,
  Ranking: <TrendingUp className="w-5 h-5" />,
  Doc: <FileText className="w-5 h-5" />,
  Logout: <LogOut className="w-5 h-5" />
};
