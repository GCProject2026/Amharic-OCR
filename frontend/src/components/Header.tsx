import { User, BookOpen, LogOut, ScrollText } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  isAuthenticated: boolean;
  userName: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onHistoryClick: () => void;
  onProfileClick: () => void;
}

export function Header({ 
  isAuthenticated, 
  userName, 
  onLoginClick, 
  onLogoutClick,
  onHistoryClick,
  onProfileClick 
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50 border-b-2 border-amber-900/20 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-800 via-amber-700 to-yellow-900 rounded border-2 border-amber-900/30 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">አ</span>
          </div>
          <div>
            <div className="text-amber-900">Amharic Scripture Digitizer</div>
            <div className="text-xs text-amber-800/70">የአማርኛ ጽሑፍ መለወጫ • Manuscript Preservation</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* History Button - Desktop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onHistoryClick}
                className="hidden sm:flex text-amber-900 hover:text-amber-950 hover:bg-amber-100"
              >
                <ScrollText className="w-4 h-4 mr-2" />
                Archives
              </Button>
              
              {/* History Button - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onHistoryClick}
                className="sm:hidden text-amber-900 hover:bg-amber-100"
              >
                <ScrollText className="w-4 h-4" />
              </Button>
              
              {/* Profile Button - Desktop */}
              <button
                onClick={onProfileClick}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded hover:bg-amber-200 transition-colors"
              >
                <User className="w-4 h-4 text-amber-900" />
                <span className="text-sm text-amber-900">{userName}</span>
              </button>
              
              {/* Profile Button - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onProfileClick}
                className="sm:hidden text-amber-900 hover:bg-amber-100"
              >
                <User className="w-4 h-4" />
              </Button>
              
              {/* Logout Button - Desktop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogoutClick}
                className="hidden sm:flex text-amber-900 hover:text-amber-950 hover:bg-amber-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              
              {/* Logout Button - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogoutClick}
                className="sm:hidden text-amber-900 hover:bg-amber-100"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              className="bg-amber-800 hover:bg-amber-900 text-white shadow-md"
              size="sm"
              onClick={onLoginClick}
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
