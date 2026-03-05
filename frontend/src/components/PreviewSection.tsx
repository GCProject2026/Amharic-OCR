import { useState } from 'react';
import { RotateCw, RotateCcw, Minimize2, FileText, Scan } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface PreviewSectionProps {
  file: File;
  previewUrl: string;
  rotation: number;
  onRotate: (degrees: number) => void;
  onProcess: (compress: boolean) => void;
  isProcessing: boolean;
}

export function PreviewSection({ 
  file, 
  previewUrl, 
  rotation, 
  onRotate, 
  onProcess,
  isProcessing 
}: PreviewSectionProps) {
  const [compress, setCompress] = useState(false);
  const isPDF = file.type === 'application/pdf';

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-amber-50/30 border-amber-200 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-amber-800" />
          <h3 className="text-amber-900">Document Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRotate(-90)}
            disabled={isProcessing}
            className="border-amber-300 hover:bg-amber-50 text-amber-900"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRotate(90)}
            disabled={isProcessing}
            className="border-amber-300 hover:bg-amber-50 text-amber-900"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative bg-stone-100 rounded-lg overflow-hidden mb-4 border-2 border-amber-200" style={{ minHeight: '300px' }}>
        {isPDF ? (
          <div className="flex items-center justify-center h-64 bg-stone-50/50">
            <div className="text-center">
              <FileText className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <p className="text-amber-900 mb-2">PDF Manuscript</p>
              <p className="text-sm text-amber-800/70">{file.name}</p>
              <p className="text-xs text-amber-700/60 mt-2">First page preview would appear here</p>
            </div>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-auto transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="compress" 
            checked={compress}
            onCheckedChange={(checked) => setCompress(checked as boolean)}
            disabled={isProcessing}
          />
          <Label 
            htmlFor="compress" 
            className="text-sm cursor-pointer text-amber-900/80"
          >
            Optimize image quality for better OCR accuracy
          </Label>
        </div>

        <Button 
          onClick={() => onProcess(compress)}
          disabled={isProcessing}
          className="w-full bg-amber-800 hover:bg-amber-900 text-white"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing Manuscript...
            </>
          ) : (
            'Digitize Document'
          )}
        </Button>
      </div>

      <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-200">
        <p className="text-xs text-amber-900/70">
          <strong>Note:</strong> This is a demonstration. In production, actual Amharic handwriting OCR would be performed using trained machine learning models.
        </p>
      </div>
    </Card>
  );
}