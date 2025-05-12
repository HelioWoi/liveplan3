import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { useForm } from 'react-hook-form';
import { User, Shield, LogOut, Mail, HelpCircle, Receipt, Landmark, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/layout/BottomNavigation';
import SpreadsheetUploadModal from '../components/modals/SpreadsheetUploadModal';

interface ProfileFormValues {
  email: string;
  fullName: string;
  currency: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const { user } = useAuthStore();
  const { supabase } = useSupabase();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    defaultValues: {
      email: user?.email || '',
      fullName: user?.user_metadata?.full_name || '',
      currency: 'USD',
    }
  });
  
  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors },
    watch,
  } = useForm<PasswordFormValues>();
  
  const newPassword = watch('newPassword');
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  const onSubmitProfile = async (_data: ProfileFormValues) => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const onSubmitPassword = async (_data: PasswordFormValues) => {
    setIsChangingPassword(true);
    setPasswordSuccess(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to change password', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleOpenSpreadsheetModal = () => {
    setShowSpreadsheetModal(true);
  };

  const handleCloseSpreadsheetModal = () => {
    setShowSpreadsheetModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SpreadsheetUploadModal open={showSpreadsheetModal} onClose={handleCloseSpreadsheetModal} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold">{user?.user_metadata?.full_name || 'User'}</h2>
                <p className="text-gray-500 mb-4">{user?.email}</p>
                <button 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Sign Out
                </button>
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="px-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">Member Since</span>
                    <span className="text-sm font-medium">Jan 2025</span>
                  </div>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link 
                      to="/bank-onboarding"
                      className="flex items-center justify-between py-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <span className="flex items-center">
                        <Landmark className="h-4 w-4 mr-2" />
                        Connect Bank Account
                      </span>
                    </Link>
                    <button 
                      onClick={handleOpenSpreadsheetModal}
                      className="w-full flex items-center justify-between py-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <span className="flex items-center">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Import Data
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Available</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              
              <form onSubmit={handleSubmit(onSubmitProfile)}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled
                    {...register('email')}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    {...register('fullName', { required: 'Full name is required' })}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
                
                {updateSuccess && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                    Profile updated successfully!
                  </div>
                )}
              </form>
            </div>
            
            {/* Password Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              
              <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  />
                  {passwordErrors?.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    {...registerPassword('newPassword', { 
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })}
                  />
                  {passwordErrors?.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    {...registerPassword('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === newPassword || 'Passwords do not match'
                    })}
                  />
                  {passwordErrors?.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
                
                {passwordSuccess && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                    Password changed successfully!
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
