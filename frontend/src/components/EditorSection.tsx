import { PenTool } from 'lucide-react';
import { Card } from '../../ui/card';
import { Textarea } from '../../ui/textarea';

interface EditorSectionProps {
  text: string;
  onTextChange: (text: string) => void;
}

export function EditorSection({ text, onTextChange }: EditorSectionProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-white to-amber-50/30 border-amber-200 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <PenTool className="w-5 h-5 text-amber-800" />
        <h3 className="text-amber-900">Text Editor</h3>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-amber-900/70">
          Review and refine the digitized text. Make corrections to preserve accuracy.
        </p>
        
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className="min-h-[400px] font-mono bg-stone-50/50 border-amber-200 focus:border-amber-400"
          placeholder="Converted text will appear here..."
          style={{ 
            lineHeight: '1.8',
            fontSize: '16px'
          }}
        />

        <div className="flex justify-between text-xs text-amber-800/70">
          <span>Characters: {text.length}</span>
          <span>Words: {text.trim().split(/\s+/).filter(w => w).length}</span>
        </div>
      </div>
    </Card>
  );
}