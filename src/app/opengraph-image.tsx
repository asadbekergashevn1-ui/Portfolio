import { ImageResponse } from 'next/og';
import { profile } from '@/content/profile';
import { sortedProjects } from '@/content/projects';

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0a0b0d', color: '#ece8df', padding: 72, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, color: '#d8b55f', letterSpacing: 3 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#4fbf7f' }} />
          ASADBEK ERGASHEV · SOFTWARE ENGINEER
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, maxWidth: 1000 }}>{profile.headline}</div>
        <div style={{ display: 'flex', fontSize: 26, color: '#9aa0aa' }}>
          {sortedProjects().length} products shipped · CRM, education, automation, mobile
        </div>
      </div>
    ),
    size,
  );
}
