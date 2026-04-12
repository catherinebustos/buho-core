import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '25%',   // Un ligero borde curvado
        }}
      >
        <span
          style={{
            color: '#d98f0b', // Naranja Búho ('buho.500')
            fontSize: '22px',
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
