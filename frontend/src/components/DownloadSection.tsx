import { Archive, FileText, BookOpen, Scroll } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface DownloadSectionProps {
  text: string;
  fileName: string;
}

export function DownloadSection({ text, fileName }: DownloadSectionProps) {
  const baseFileName = fileName.replace(/\.[^/.]+$/, '');

  const downloadAsText = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFileName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsWord = () => {
    // Create a simple HTML document that Word can open
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${baseFileName}</title>
        </head>
        <body>
          <pre style="font-family: 'Nyala', 'Ebrima', Arial; font-size: 14pt; white-space: pre-wrap;">${text}</pre>
        </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFileName}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = async () => {
    // In a real application, you would use a library like jsPDF or pdfmake
    // For now, we'll create a simple HTML version
    alert('PDF generation would use a library like jsPDF to create a properly formatted PDF document with Amharic text support.');
    
    // Mock implementation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${baseFileName}</title>
          <style>
            body { font-family: 'Nyala', 'Ebrima', Arial; padding: 40px; }
            pre { white-space: pre-wrap; font-size: 12pt; }
          </style>
        </head>
        <body>
          <pre>${text}</pre>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFileName}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-amber-50/30 border-amber-200 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Archive className="w-5 h-5 text-amber-800" />
        <h3 className="text-amber-900">Export Options</h3>
      </div>

      <p className="text-sm text-amber-900/70 mb-4">
        Preserve your digitized text in various archival formats
      </p>

      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="outline"
          className="justify-start h-auto py-3 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
          onClick={downloadAsText}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-amber-100 rounded border border-amber-300 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-800" />
            </div>
            <div className="text-left flex-1">
              <div className="text-sm text-amber-900">Plain Text (.txt)</div>
              <div className="text-xs text-amber-700/70">Raw text format</div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="justify-start h-auto py-3 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
          onClick={downloadAsWord}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-amber-100 rounded border border-amber-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-800" />
            </div>
            <div className="text-left flex-1">
              <div className="text-sm text-amber-900">Word Document (.doc)</div>
              <div className="text-xs text-amber-700/70">Microsoft Word compatible</div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="justify-start h-auto py-3 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
          onClick={downloadAsPDF}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-amber-100 rounded border border-amber-300 flex items-center justify-center">
              <Scroll className="w-5 h-5 text-amber-800" />
            </div>
            <div className="text-left flex-1">
              <div className="text-sm text-amber-900">PDF Document (.pdf)</div>
              <div className="text-xs text-amber-700/70">Portable archival format</div>
            </div>
          </div>
        </Button>
      </div>

      <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-200">
        <p className="text-xs text-amber-900">
          ✓ All exports preserve Amharic characters and formatting for archival purposes
        </p>
      </div>
    </Card>
  );
}