import { Coffee, Play, Square, Clock , Hourglass} from 'lucide-react';
import './attendance.css';
import { useBreaks, formatTime } from './useAttendanceHooks';

const PendingBreak = () => {
  const { activeBreak, loading, startBreak, endBreak } = useBreaks();

  if (loading) return <div className="attendance-module-container">Loading break status...</div>;

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><Hourglass className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Pending & Active Breaks</h2>
          <p className="attendance-subtitle">Track your current break status and total time taken today.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Active Break Control */}
        <div className="attendance-chart-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: activeBreak ? '#fff7ed' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Coffee size={40} color={activeBreak ? '#f97316' : '#10b981'} />
          </div>

          <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            {activeBreak ? 'On Break' : 'Not on Break'}
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 32 }}>
            {activeBreak
              ? `You started your ${activeBreak.break_type} break at ${formatTime(activeBreak.start_time)}.`
              : 'You are currently working. Start a break when you need to step away.'}
          </p>

          {activeBreak ? (
            <button className="btn-primary" onClick={() => endBreak()} style={{ background: '#ef4444', height: 48, padding: '0 32px', fontSize: 16 }}>
              <Square size={20} style={{ marginRight: 8 }} /> End Break
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={() => startBreak('Lunch')} style={{ height: 48, padding: '0 24px' }}>
                <Play size={20} style={{ marginRight: 8 }} /> Start Lunch
              </button>
              <button className="btn-secondary" onClick={() => startBreak('Short Break')} style={{ height: 48, padding: '0 24px' }}>
                Short Break
              </button>
            </div>
          )}
        </div>

        {/* Today's Stats */}
        <div className="attendance-chart-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>Break Guidelines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              <Clock size={16} color="#64748b" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Standard Lunch</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>45-60 minutes allocated daily.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              <Clock size={16} color="#64748b" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Tea/Short Breaks</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>2 breaks of 15 mins each allowed.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingBreak;
