import React from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import {
  LayoutDashboard,
  Activity,
  Waves,
  Flame,
  Map,
  Sliders,
  BarChart3,
  Bell,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Server,
  Users,
  Smartphone
} from 'lucide-react';

export type NavigationPage =
  | 'command-center'
  | 'live-monitoring'
  | 'flood'
  | 'wildfire'
  | 'risk-map'
  | 'simulator'
  | 'analytics'
  | 'alerts-events'
  | 'sensor-network'
  | 'gateways'
  | 'citizen-impact'
  | 'apk-distribution'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  collapsed,
  onToggleCollapse
}) => {
  const { snapshot, floodRisk, wildfireRisk } = useEarthSync();

  const unacknowledgedAlerts = snapshot.alerts.filter((a) => !a.acknowledged).length;
  const isFloodCritical = floodRisk.riskLevel === 'CRITICAL' || floodRisk.riskLevel === 'HIGH';
  const isFireCritical = wildfireRisk.riskLevel === 'CRITICAL' || wildfireRisk.riskLevel === 'HIGH';

  const navItems = [
    {
      id: 'command-center' as NavigationPage,
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'live-monitoring' as NavigationPage,
      label: 'Live Monitoring',
      icon: Activity,
      badge: 'LIVE'
    },
    {
      id: 'flood' as NavigationPage,
      label: 'Flood Intelligence',
      icon: Waves,
      badge: isFloodCritical ? `${floodRisk.riskScore}%` : null,
      badgeColor: isFloodCritical ? 'bg-orange-950 text-orange-400 border-orange-700' : ''
    },
    {
      id: 'wildfire' as NavigationPage,
      label: 'Wildfire Intelligence',
      icon: Flame,
      badge: isFireCritical ? `${wildfireRisk.riskScore}%` : null,
      badgeColor: isFireCritical ? 'bg-red-950 text-red-400 border-red-700' : ''
    },
    {
      id: 'risk-map' as NavigationPage,
      label: 'Risk Map',
      icon: Map,
      badge: '12 NODES'
    },
    {
      id: 'simulator' as NavigationPage,
      label: 'Scenario Simulator',
      icon: Sliders,
      badge: snapshot.activeScenario !== 'NORMAL' ? 'ACTIVE' : null,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700'
    },
    {
      id: 'analytics' as NavigationPage,
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'alerts-events' as NavigationPage,
      label: 'Alerts & Events',
      icon: Bell,
      badge: unacknowledgedAlerts > 0 ? `${unacknowledgedAlerts}` : null,
      badgeColor: 'bg-red-900 text-red-200 border-red-700 font-bold'
    },
    {
      id: 'sensor-network' as NavigationPage,
      label: 'Connected Sensors',
      icon: Radio,
      badge: null
    },
    {
      id: 'gateways' as NavigationPage,
      label: 'Raspberry Pi Gateways',
      icon: Server,
      badge: `${snapshot.gateways?.length || 2} GW`
    },
    {
      id: 'citizen-impact' as NavigationPage,
      label: 'Citizen Impact & CAP',
      icon: Users,
      badge: 'NDMA'
    },
    {
      id: 'apk-distribution' as NavigationPage,
      label: 'APK & Mobile Release',
      icon: Smartphone,
      badge: 'APK'
    },
    {
      id: 'settings' as NavigationPage,
      label: 'System Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside
      className={`bg-[#080d1a] border-r border-slate-800/80 transition-all duration-300 ease-in-out flex flex-col justify-between select-none z-20 flex-shrink-0 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Navigation Header / Items */}
      <div className="p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        <div className="px-3 py-2 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
          {!collapsed ? 'OPERATIONS DECK' : 'OPS'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-700/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />

              {!collapsed && (
                <span className="truncate tracking-wide">{item.label}</span>
              )}

              {/* Badges */}
              {!collapsed && item.badge && (
                <span
                  className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    item.badgeColor ||
                    'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {collapsed && item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Section: Collapse Toggle & Hackathon Prototype Notice */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SIH PROTOTYPE</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Decoupled Multi-Hazard Architecture Ready for ESP32 Hardware
            </p>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>COLLAPSE</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
