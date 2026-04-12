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
          background: '#000000', // Negro absoluto para máxima sofisticación (OLED aesthetic)
          borderRadius: '25%',   // Curvatura delicada
          border: '2px solid rgba(253, 106, 59, 0.15)', // Reflejo naranja muy sutil en el borde exterior
        }}
      >
        <span
          style={{
            color: '#FD6A3B', // El verdadero "Electric Core Orange" de la app
            fontSize: '20px',
            fontWeight: 900,
            fontFamily: 'sans-serif',
            lineHeight: 1,
            marginTop: '2px' // Ajuste fino óptico para centrado vertical
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
