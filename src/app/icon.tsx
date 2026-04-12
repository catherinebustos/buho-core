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
          background: '#FD6A3B', // El Naranja Real de la App
          borderRadius: '25%',   // Los bordes redondeados clásicos
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '22px', // Tamaño proporcional al contenedor de 32x32
            fontWeight: 900,  // Ultra negrita
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
