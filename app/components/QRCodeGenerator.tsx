'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
}

const QRCodeGenerator = ({
  value,
  size = 200,
  level = 'M',
  includeMargin = true,
  className = '',
}: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    const generateQR = async () => {
      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: includeMargin ? 4 : 0,
          errorCorrectionLevel: level,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
      } catch (error) {
        
      }
    };

    generateQR();
  }, [value, size, level, includeMargin]);

  if (!value) {
    return <div className="text-red-500">No data provided for QR code</div>;
  }

  return (
    <div className={`qr-code-container ${className}`}>
      <canvas ref={canvasRef} className="mx-auto" />
    </div>
  );
};

export default QRCodeGenerator;
