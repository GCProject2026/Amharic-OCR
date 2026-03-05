import { X, BookMarked, Calendar, Archive } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { OCRResult } from '../App';

interface HistoryPanelProps {
  history: OCRResult[];
  onClose: () => void;
  onLoadResult: (result: OCRResult) => void;
}

export function HistoryPanel({ history, onClose, onLoadResult }: HistoryPanelProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl bg-gradient-to-br from-white to-amber-50/30 rounded-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border-2 border-amber-200">
        <div className="p-6 border-b-2 border-amber-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-stone-50">
          <div>
            <h2 className="text-2xl text-amber-900">Document Archives</h2>
            <p className="text-sm text-amber-800/70 mt-1">
              Your digitization history ({history.length})
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-amber-900 hover:bg-amber-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <BookMarked className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-900 mb-2">No archived documents yet</p>
              <p className="text-sm text-amber-700/70">
                Your digitized scriptures will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((result) => (
                <div
                  key={result.id}
                  className="border-2 border-amber-200 bg-white rounded-lg p-4 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onLoadResult(result)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <BookMarked className="w-4 h-4 text-amber-800 flex-shrink-0" />
                        <h3 className="truncate text-sm text-amber-900">
                          {result.originalFileName}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-amber-700/70 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(result.uploadDate)}
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 rounded">
                          {result.fileType.split('/')[1].toUpperCase()}
                        </span>
                      </div>

                      <p className="text-sm text-amber-900/80 line-clamp-2">
                        {result.text}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // In a real app, this would delete the history item
                        alert('Delete history item');
                      }}
                      className="flex-shrink-0 text-amber-900 hover:bg-amber-100"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t-2 border-amber-200 bg-amber-50">
            <p className="text-xs text-amber-900/70 text-center">
              Click on any document to load it into the editor
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}