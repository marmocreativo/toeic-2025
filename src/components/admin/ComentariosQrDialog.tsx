// src/components/admin/ComentariosQrDialog.tsx

import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Check, Copy, Download, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { generateLocalizedPath } from '../../utils/languageUtils';
import type { Idioma } from '../../types/comentarioExaminado';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const buildUrl = (lang: Idioma) =>
  `${window.location.origin}${generateLocalizedPath('comentarios', lang)}`;

function QrCard({ lang }: { lang: Idioma }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const url = buildUrl(lang);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('No se pudo copiar el link:', err);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `qr-comentarios-examinado-${lang}.png`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center rounded-lg border border-border bg-white p-4">
        {/* Se dibuja a 512px (buena resolución al descargar) y se muestra a 224px */}
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={512}
          level="M"
          marginSize={2}
          style={{ width: 224, height: 224 }}
        />
      </div>

      <div className="flex gap-2">
        <Input readOnly value={url} onFocus={(e) => e.target.select()} className="border-border" />
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          className="flex-shrink-0 border-border"
          title="Copiar link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleDownload}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar QR (PNG)
        </Button>
        <Button type="button" variant="outline" asChild className="border-border">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir formulario
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function ComentariosQrDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium text-primary">
            Link y QR del formulario
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-text-muted">
          Comparte el link o imprime el QR. Cada idioma tiene su propio código; quien abra el
          formulario también puede cambiar de idioma desde la página.
        </p>

        <Tabs defaultValue="es">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="es">Español</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <TabsContent value="es" className="pt-2">
            <QrCard lang="es" />
          </TabsContent>
          <TabsContent value="en" className="pt-2">
            <QrCard lang="en" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}