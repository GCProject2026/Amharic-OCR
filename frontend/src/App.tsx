import { useState } from 'react';
import { Files, FileEdit, Archive } from 'lucide-react';
import { Toaster, toast } from 'sonner';
 fatuma-auth

import axios from 'axios';
 main
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { PreviewSection } from './components/PreviewSection';
import { EditorSection } from './components/EditorSection';
import { DownloadSection } from './components/DownloadSection';
import { AuthModal } from './components/AuthModal';
import { HistoryPanel } from './components/HistoryPanel';
import { ProfileModal } from './components/ProfileModal';
import { UpgradeModal } from './components/UpgradeModal';

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  isPremium?: boolean;
}

interface OCRResult {
  id: string;
  originalFileName: string;
  fileType: string;
  uploadDate: Date;
  text: string;
  fileUrl: string;
}

const FREE_DAILY_LIMIT = 5;

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    isPremium: false
  });
  const [history, setHistory] = useState<OCRResult[]>([]);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('image', file);

      // Upload to backend
      const response = await axios.post('http://localhost:5000/api/ocr/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUploadedFile(file);
        setRotation(0);
        setOcrText('');
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
        
        toast.success('File uploaded successfully!');
      } else {
        toast.error('Upload failed: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response) {
        toast.error('Upload failed: ' + (error.response.data.message || 'Server error'));
      } else {
        toast.error('Upload failed: Network error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    // Check usage limits for non-premium users
    if (!userProfile.isPremium && dailyUsage >= FREE_DAILY_LIMIT) {
      toast.error('Daily limit reached. Upgrade to Premium for unlimited conversions!');
      setShowUpgrade(true);
      return;
    }

    // Voice input sets the text directly without needing file upload
    setOcrText(text);
    
    // Increment usage counter
    setDailyUsage(prev => prev + 1);
    
    toast.success('Voice input processed successfully');
  };

  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const handleProcessOCR = async (compress: boolean) => {
    // Check usage limits for non-premium users
    if (!userProfile.isPremium && dailyUsage >= FREE_DAILY_LIMIT) {
      toast.error('Daily limit reached. Upgrade to Premium for unlimited conversions!');
      setShowUpgrade(true);
      return;
    }

    if (!uploadedFile) {
      toast.error('Please upload a file first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // For now, we'll simulate OCR processing since the backend doesn't have OCR implemented yet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock OCR result in Amharic
      const mockText = `የተመለከተው ሰነድ ስም: ${uploadedFile.name}

ይህ የናሙና አማርኛ ጽሑፍ ነው። በትክክለኛው አፕሊኬሽን ውስጥ፣ የእጅ ጽሑፍ ምስሎች፣ የተቃኘ ፒዲኤፍ ወይም ሌሎች ሰነዶች ወደ ሊታረም የሚችል ጽሑፍ ይቀየራሉ።

የኢትዮጵያ ታሪካዊ እና ሃይማኖታዊ ጽሑፎችን ለማስቀመጥ እና ለማቆየት ይህ ቴክኖሎጂ በጣም አስፈላጊ ነው። የአማርኛ የእጅ ጽሑፍ ማንበብ ቴክኖሎጂ የቅርስ ጥበቃን ይደግፋል።

${compress ? '(ፋይሉ ተጨምቋል - ጥራት ሳይቀንስ)' : ''}`;

      setOcrText(mockText);

      // Increment usage counter
      setDailyUsage(prev => prev + 1);

      toast.success('Document processed successfully!');

      // Add to history if authenticated
      if (isAuthenticated) {
        const newResult: OCRResult = {
          id: Date.now().toString(),
          originalFileName: uploadedFile.name,
          fileType: uploadedFile.type,
          uploadDate: new Date(),
          text: mockText,
          fileUrl: filePreviewUrl
        };
        setHistory(prev => [newResult, ...prev]);
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.error('OCR processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = (profile: UserProfile) => {
    setIsAuthenticated(true);
    setUserProfile(profile);
    setShowAuth(false);
    toast.success(`Welcome back, ${profile.name}!`);
  };

  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  setIsAuthenticated(false);
  setUserProfile({
    name: '',
    email: '',
    phone: '',
    organization: '',
    isPremium: false
  });
  setHistory([]);
  setDailyUsage(0);
  toast.info('You have been logged out');
};

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    setShowProfile(false);
    toast.success('Profile updated successfully');
  };

  const handleLoadFromHistory = (result: OCRResult) => {
    setOcrText(result.text);
    setShowHistory(false);
    toast.success('Loaded from history');
  };

  const handleUpgrade = () => {
    // Simulate upgrade process
    setUserProfile(prev => ({ ...prev, isPremium: true }));
    setShowUpgrade(false);
    toast.success('🎉 Congratulations! You are now a Premium member!');
  };

  const canUseVoiceInput = true; // Voice input available for all users, just counts toward daily limit

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-stone-50 to-amber-50/50">
      <Toaster position="top-right" richColors />
      <Header 
        isAuthenticated={isAuthenticated}
        userName={userProfile.name}
        onLoginClick={() => setShowAuth(true)}
        onLogoutClick={handleLogout}
        onHistoryClick={() => setShowHistory(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-900 bg-clip-text text-transparent">
            የአማርኛ የእጅ ጽሑፍ OCR
          </h1>
          <p className="text-lg text-amber-900/80 max-w-2xl mx-auto">
            Preserve and digitize ancient Amharic scriptures and manuscripts
          </p>
          <p className="text-sm text-amber-800/60 mt-2">
            Advanced OCR technology for historical document preservation
          </p>
          
          {/* Usage Counter */}
          {!userProfile.isPremium && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-300 rounded-full text-sm text-amber-900">
              <span>
                Daily usage: {dailyUsage} / {FREE_DAILY_LIMIT}
              </span>
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-amber-800 hover:text-amber-900 underline font-medium"
              >
                Upgrade for unlimited
              </button>
            </div>
          )}
          
          {userProfile.isPremium && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full text-sm text-white">
              <span className="text-yellow-300">👑</span>
              <span>Premium Member - Unlimited Access</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <UploadSection 
              onFileUpload={handleFileUpload}
              onVoiceInput={canUseVoiceInput ? handleVoiceInput : undefined}
              isProcessing={isProcessing}
            />
            
            {uploadedFile && (
              <PreviewSection
                file={uploadedFile}
                previewUrl={filePreviewUrl}
                rotation={rotation}
                onRotate={handleRotate}
                onProcess={handleProcessOCR}
                isProcessing={isProcessing}
              />
            )}
          </div>

          <div className="space-y-6">
            {ocrText && (
              <>
                <EditorSection 
                  text={ocrText}
                  onTextChange={setOcrText}
                />
                
                <DownloadSection 
                  text={ocrText}
                  fileName={uploadedFile?.name || 'document'}
                />
              </>
            )}
          </div>
        </div>

        {!uploadedFile && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Files className="w-12 h-12 text-amber-700" strokeWidth={1.5} />}
              title="Multiple Formats"
              titleAmharic="በርካታ ቅርጾች"
              description="Upload images, scanned PDFs, or provide URLs. Preview before processing."
            />
            <FeatureCard
              icon={<FileEdit className="w-12 h-12 text-amber-700" strokeWidth={1.5} />}
              title="Edit & Export"
              titleAmharic="አርትዕ እና ላክ"
              description="Edit converted text and download as plain text, Word document, or PDF."
            />
            <FeatureCard
              icon={<Archive className="w-12 h-12 text-amber-700" strokeWidth={1.5} />}
              title="Archive Tracking"
              titleAmharic="ማህደር መከታተል"
              description="Register to save your digitization history and access previous conversions anytime."
            />
          </div>
        )}
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
        />
      )}

      {showHistory && (
        <HistoryPanel
          history={history}
          onClose={() => setShowHistory(false)}
          onLoadResult={handleLoadFromHistory}
        />
      )}

      {showProfile && (
        <ProfileModal
          profile={userProfile}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
        />
      )}

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onUpgrade={handleUpgrade}
          currentUsage={dailyUsage}
          maxFreeUsage={FREE_DAILY_LIMIT}
        />
      )}
    </div>
  );
}

function FeatureCard({ icon, title, titleAmharic, description }: {
  icon: React.ReactNode;
  title: string;
  titleAmharic: string;
  description: string;
}) {
  return (
    <div className="bg-gradient-to-br from-white to-amber-50/30 p-6 rounded-xl shadow-md border-2 border-amber-200 hover:shadow-lg hover:border-amber-300 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-1 text-amber-900">{title}</h3>
      <p className="text-sm text-amber-800/70 mb-2">{titleAmharic}</p>
      <p className="text-sm text-amber-900/60">{description}</p>
    </div>
  );
}

export default App;
