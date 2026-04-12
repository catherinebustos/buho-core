import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b', // Zinc 950 (Negro Premium)
        }}
      >
        <span
          style={{
            color: '#d98f0b', // Naranja Búho ('buho.500')
            fontSize: '110px',
            fontWeight: 900,
            fontFamily: 'sans-serif',
          }}
        >
          B
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
