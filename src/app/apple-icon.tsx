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
          background: '#FD6A3B', // El Naranja Real de la App
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '120px', // Acorde al tamaño grande de 180x180
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
