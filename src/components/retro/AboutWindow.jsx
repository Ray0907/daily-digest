import { useDesktopTheme } from '../../contexts/DesktopThemeContext';

function MemoryBar({ label, used, total, color }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
      <span style={{ width: 60, textAlign: 'right' }}>{label}</span>
      <div
        className="os-sunken"
        style={{ flex: 1, height: 12, position: 'relative', background: '#fff' }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${pct}%`,
            background: color,
          }}
        />
      </div>
      <span style={{ width: 40, textAlign: 'right' }}>{used} MB</span>
    </div>
  );
}

function Win95About() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 8 }}>
      <div style={{ fontSize: 32, lineHeight: 1 }}>
        &#128240;
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: 14 }}>Daily Digest 95</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>Version 1.0</div>
      </div>
      <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #808080', borderBottom: '1px solid #fff' }} />
      <div style={{ fontSize: 10, color: '#444', textAlign: 'center', lineHeight: 1.6 }}>
        Intel Pentium 133MHz<br />
        16MB RAM<br />
        1.2GB HDD<br />
        800x600 16 colors
      </div>
      <button className="os-btn os-raised" style={{ minWidth: 80, marginTop: 4 }}>
        OK
      </button>
    </div>
  );
}

function MacAbout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: 13 }}>About This Macintosh</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>System Software 7.5.3</div>
      </div>
      <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #808080', borderBottom: '1px solid #fff' }} />
      <div style={{ fontSize: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total Memory:</span>
          <span style={{ fontWeight: 'bold' }}>16 MB</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span>Largest Unused Block:</span>
          <span style={{ fontWeight: 'bold' }}>8 MB</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        <MemoryBar label="System" used={4} total={16} color="#888" />
        <MemoryBar label="Finder" used={2} total={16} color="#4488cc" />
        <MemoryBar label="Digest" used={2} total={16} color="#cc4444" />
      </div>
    </div>
  );
}

export default function AboutWindow() {
  const { desktopTheme } = useDesktopTheme();

  if (desktopTheme === 'mac') {
    return <MacAbout />;
  }

  return <Win95About />;
}
