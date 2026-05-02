import { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Link as LinkIcon, BookOpen, Mic } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { VoiceRecordingSection } from './VoiceRecordingSection';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  onVoiceInput?: (text: string) => void;
  isProcessing: boolean;
}

export function UploadSection({ onFileUpload, onVoiceInput, isProcessing }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf'];
    
    if (validTypes.includes(file.type)) {
      onFileUpload(file);
    } else {
      alert('Please upload an image (JPEG, PNG, GIF, BMP) or PDF file.');
    }
  };

  const handleUrlUpload = () => {
    if (urlInput.trim()) {
      // In a real app, this would fetch the image from the URL
      alert('URL upload feature would fetch and process the image from: ' + urlInput);
      setUrlInput('');
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-amber-50/30 border-amber-200 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-amber-800" />
        <h3 className="text-amber-900">Source Document</h3>
      </div>
      
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 bg-amber-100 border border-amber-300">
          <TabsTrigger value="file" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">File Upload</span>
            <span className="sm:hidden">File</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
            <LinkIcon className="w-4 h-4 mr-2" />
            URL
          </TabsTrigger>
          <TabsTrigger value="voice" className="data-[state=active]:bg-white data-[state=active]:text-amber-900">
            <Mic className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Voice</span>
            <span className="sm:hidden">Mic</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-amber-600 bg-amber-50' 
                : 'border-amber-300 hover:border-amber-400 bg-stone-50/50'
            } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-amber-700" />
            <p className="mb-2 text-amber-900">
              Drag and drop your manuscript here
            </p>
            <p className="text-sm text-amber-700/70 mb-4">
              or click to browse
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-amber-800 hover:bg-amber-900 text-white"
            >
              Select Document
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,application/pdf"
              onChange={handleChange}
            />
          </div>

          <div className="mt-4 text-xs text-amber-800/70">
            <p>Supported formats: JPEG, PNG, GIF, BMP, PDF</p>
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-amber-900 mb-2 block">
                Enter Image URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com/manuscript.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isProcessing}
                className="border-amber-200 focus:border-amber-400 bg-stone-50/50"
              />
            </div>
            <Button 
              onClick={handleUrlUpload} 
              disabled={isProcessing || !urlInput.trim()}
              className="w-full bg-amber-800 hover:bg-amber-900 text-white"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Load from URL
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="voice">
          {onVoiceInput ? (
            <VoiceRecordingSection 
              onVoiceText={onVoiceInput}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="text-center py-8 text-amber-800/70">
              Voice input is available for premium users
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}