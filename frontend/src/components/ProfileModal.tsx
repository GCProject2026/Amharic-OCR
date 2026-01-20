import { useState } from 'react';
import { X, User, Mail, Phone, Building, LogOut, Save } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { UserProfile } from '../App';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onLogout: () => void;
}

export function ProfileModal({ profile, onClose, onUpdateProfile, onLogout }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-linear-to-br from-white to-amber-50/30 rounded-xl shadow-2xl relative animate-in fade-in zoom-in duration-200 border-2 border-amber-200">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-linear-to-br from-amber-800 via-amber-700 to-yellow-900 rounded-full border-2 border-amber-900/30 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl mb-2 text-amber-900">My Profile</h2>
            <p className="text-sm text-amber-800/70">Manage your account information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="profile-name">Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="profile-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profile-email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="profile-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profile-phone">Phone Number (Optional)</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="+251 (optional)"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profile-organization">Organization (Optional)</Label>
              <div className="relative mt-1">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="profile-organization"
                  type="text"
                  placeholder="University, Library, etc."
                  value={formData.organization || ''}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-amber-800 hover:bg-amber-900 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}
                  className="flex-1 border-amber-300 hover:bg-amber-50"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                type="button" 
                onClick={() => setIsEditing(true)}
                className="w-full bg-amber-800 hover:bg-amber-900 text-white"
              >
                Edit Profile
              </Button>
            )}
          </form>

          <Separator className="my-6" />

          <div className="space-y-3">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-sm text-amber-900/70 mb-2">Account Actions</div>
              <Button
                variant="outline"
                className="w-full justify-start text-amber-900 border-amber-300 hover:text-amber-950 hover:bg-amber-100"
                onClick={handleLogoutClick}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout from Account
              </Button>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
              <p className="text-xs text-amber-900/70">
                <strong>Privacy:</strong> Your profile information is stored securely. 
                In production, all data would be encrypted and protected according to 
                industry standards.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}