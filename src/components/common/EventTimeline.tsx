import React from 'react';
import { TimelineEvent } from '../../types/alert';
import { Clock, ShieldAlert, AlertTriangle, Info, BellRing } from 'lucide-react';

interface EventTimelineProps {
  events: TimelineEvent[];
  maxItems?: number;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events, maxItems = 7 }) => {
  const displayed = events.slice(0, maxItems);

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-slate-100 text-base">Live Event Timeline</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">CHRONOLOGICAL LOG</span>
      </div>

      <div className="relative pl-4 border-l border-slate-800/80 space-y-4 font-mono text-xs">
        {displayed.map((event) => {
          const isCritical = event.level === 'critical';
          const isHigh = event.level === 'high';
          const isWatch = event.level === 'watch';

          const dotColor = isCritical
            ? 'bg-red-500'
            : isHigh
            ? 'bg-orange-500'
            : isWatch
            ? 'bg-amber-500'
            : 'bg-cyan-500';

          return (
            <div key={event.id} className="relative group">
              {/* Timeline Pin Dot */}
              <div
                className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${dotColor} ring-4 ring-[#080d1a]`}
              />

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="text-[11px] font-bold text-slate-400">
                  {event.timestamp}
                </span>

                <div className="flex-1">
                  <p
                    className={`leading-relaxed ${
                      isCritical
                        ? 'text-red-300 font-bold'
                        : isHigh
                        ? 'text-orange-300 font-medium'
                        : isWatch
                        ? 'text-amber-200'
                        : 'text-slate-300'
                    }`}
                  >
                    {event.message}
                  </p>
                  {event.details && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{event.details}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
