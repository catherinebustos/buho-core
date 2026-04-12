import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrPreviewProps {
  token: string;
  nickname: string;
}

export async function QrPreview({ token, nickname }: QrPreviewProps) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/v/${token}`;
  const dataUrl = await QRCode.toDataURL(url, { width: 320, margin: 1 });

  return (
    <div className="flex flex-col items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`QR ${nickname}`} className="rounded-md border border-border" />
      <div className="text-center">
        <p className="text-sm font-medium">{nickname}</p>
        <p className="break-all text-xs text-muted-foreground">{url}</p>
      </div>
      <a href={dataUrl} download={`qr-${nickname.replace(/\s+/g, '-')}.png`}>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Descargar PNG
        </Button>
      </a>
    </div>
  );
}
