import { useDesktopTheme } from '../../contexts/DesktopThemeContext';

function MemoryBar({ label, used, total, color }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
        <span>{label}</span>
        <span>{used} MB</span>
      </div>
      <div
        style={{
          background: '#fff',
          border: '1px solid #000',
          height: 14,
          width: '100%',
        }}
      >
        <div
          style={{
            background: color,
            height: '100%',
            width: pct + '%',
          }}
        />
      </div>
    </div>
  );
}

function Win95Content() {
  return (
    <div
      style={{
        padding: 16,
        fontFamily: '"MS Sans Serif", Tahoma, sans-serif',
        fontSize: 12,
        color: '#000',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="18" rx="1" fill="#c0c0c0" stroke="#000" strokeWidth="1" />
          <rect x="8" y="11" width="16" height="11" fill="#000080" />
          <rect x="10" y="24" width="12" height="3" fill="#c0c0c0" stroke="#000" strokeWidth="0.5" />
          <rect x="6" y="27" width="20" height="2" rx="1" fill="#808080" />
        </svg>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 14 }}>My Computer</div>
          <div style={{ color: '#808080', marginTop: 2 }}>System Properties</div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #808080', margin: '12px 0' }} />

      <table style={{ fontSize: 12, borderSpacing: '8px 4px' }}>
        <tbody>
          <tr>
            <td style={{ color: '#808080' }}>Processor:</td>
            <td>Intel Pentium 133 MHz</td>
          </tr>
          <tr>
            <td style={{ color: '#808080' }}>Memory:</td>
            <td>16 MB RAM</td>
          </tr>
          <tr>
            <td style={{ color: '#808080' }}>Hard Disk:</td>
            <td>1.2 GB</td>
          </tr>
          <tr>
            <td style={{ color: '#808080' }}>Display:</td>
            <td>800x600, 16 colors</td>
          </tr>
          <tr>
            <td style={{ color: '#808080' }}>Modem:</td>
            <td>28.8k bps</td>
          </tr>
          <tr>
            <td style={{ color: '#808080' }}>OS:</td>
            <td>Windows 95</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function MacContent() {
  const totalMB = 16;

  return (
    <div
      style={{
        padding: 16,
        fontFamily: 'Chicago, Geneva, sans-serif',
        fontSize: 12,
        color: '#000',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="18" rx="2" fill="#f0f0f0" stroke="#000" strokeWidth="1" />
          <rect x="7" y="7" width="18" height="12" fill="#6699cc" />
          <polygon points="12,22 20,22 22,28 10,28" fill="#c0c0c0" stroke="#000" strokeWidth="0.5" />
          <rect x="8" y="28" width="16" height="1" fill="#808080" />
        </svg>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 14 }}>About This Macintosh</div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '12px 0' }} />

      <p style={{ margin: '8px 0', fontSize: 11 }}>
        System Software 7.5.3
      </p>
      <p style={{ margin: '8px 0 16px', fontSize: 11, color: '#808080' }}>
        Total Memory: {totalMB} MB
      </p>

      <MemoryBar label="System" used={4} total={totalMB} color="#ff6699" />
      <MemoryBar label="Finder" used={2} total={totalMB} color="#6699ff" />
      <MemoryBar label="Digest" used={3} total={totalMB} color="#66cc66" />
    </div>
  );
}

export default function MyComputer() {
  const { desktopTheme } = useDesktopTheme();

  if (desktopTheme === 'mac') {
    return <MacContent />;
  }

  return <Win95Content />;
}
