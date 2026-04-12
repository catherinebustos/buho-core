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
          background: '#000000', // Negro absoluto (OLED aesthetic)
          border: '8px solid rgba(253, 106, 59, 0.1)', // Borde interior de contraste sutil naranja
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, rgba(253, 106, 59, 0.05), transparent)',
            borderRadius: '30%',
          }}
        >
          <span
            style={{
              color: '#FD6A3B', // El verdadero "Electric Core Orange"
              fontSize: '90px',
              fontWeight: 900,
              fontFamily: 'sans-serif',
              lineHeight: 1,
              marginTop: '5px' // Ajuste fino óptico para centrado vertical
            }}
          >
            B
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
