import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { useForm } from 'react-hook-form';
import { User, Shield, LogOut, Mail, HelpCircle, Receipt, Landmark, FileSpreadsheet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/layout/BottomNavigation';
import SpreadsheetUploadModal from '../components/modals/SpreadsheetUploadModal';
import LogoutConfirmationModal from '../components/modals/LogoutConfirmationModal';
import { PageHeader } from '../components/layout/PageHeader';

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
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
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
  
  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Importar o serviço de toast para mostrar notificação de logout bem-sucedido
      const { showSuccessToast, ToastEvent } = await import('../utils/toastService');
      showSuccessToast(ToastEvent.LOGOUT_SUCCESS);
      // Redirecionar para a página de login após o logout
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Importar o serviço de toast para mostrar notificação de erro
      const { showErrorToast } = await import('../utils/toastService');
      showErrorToast('Erro ao fazer logout. Tente novamente.');
    }
  };
  
  const onSubmitProfile = async (_formData: ProfileFormValues) => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const onSubmitPassword = async (_formData: PasswordFormValues) => {
    setIsChangingPassword(true);
    setPasswordSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPasswordSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
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
      <LogoutConfirmationModal 
        open={showLogoutModal} 
        onClose={handleCloseLogoutModal} 
        onConfirm={handleSignOut} 
      />
      <PageHeader title="Your Profile" />
      <div className="max-w-4xl mx-auto pb-24 px-4 pt-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold">{user?.user_metadata?.full_name || 'User'}</h2>
                <p className="text-gray-500 mb-4">{user?.email}</p>
                <button 
                  className="btn btn-outline w-full"
                  onClick={handleOpenLogoutModal}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="px-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">Member Since</span>
                    <span className="text-sm font-medium">Jan 2025</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">Account Type</span>
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                      BETA
                    </span>
                  </div>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    {/* Link removido e transformado em elemento não clicável */}
                    <div className="flex items-center justify-between py-2 text-sm text-primary-600">
                      <span className="flex items-center">
                        <Receipt className="h-4 w-4 mr-2" />
                        Invoices
                      </span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Coming Soon</span>
                    </div>
                    <Link 
                      to="/tax"
                      className="flex items-center justify-between py-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <span className="flex items-center">
                        <Receipt className="h-4 w-4 mr-2" />
                        Tax Overview
                      </span>
                    </Link>
                    <Link 
                      to="/help"
                      className="flex items-center justify-between py-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <span className="flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help & Support
                      </span>
                    </Link>
                    {/* Link removido e transformado em elemento não clicável, mas com cor azul */}
                    <div className="flex items-center justify-between py-2 text-sm text-primary-600">
                      <span className="flex items-center">
                        <Landmark className="h-4 w-4 mr-2" />
                        Connect Bank Account
                      </span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Coming Soon</span>
                    </div>
                    <button 
                      onClick={handleOpenSpreadsheetModal}
                      className="w-full flex items-center justify-between py-2 text-sm text-primary-600 hover:text-primary-700"
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
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                Account Information
              </h2>
              
              <form onSubmit={handleSubmit(onSubmitProfile)}>
                <div className="form-group">
                  <label htmlFor="email" className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      className="input pl-10"
                      disabled
                      {...register('email')}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed for security reasons</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="fullName" className="label">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    className={`input ${errors.fullName ? 'input-error' : ''}`}
                    {...register('fullName', { required: 'Full name is required' })}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="currency" className="label">Preferred Currency</label>
                  <select
                    id="currency"
                    className="input"
                    {...register('currency')}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
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
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary-600" />
                Security
              </h2>
              
              <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
                <div className="form-group">
                  <label htmlFor="currentPassword" className="label">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    className={`input ${passwordErrors?.currentPassword ? 'input-error' : ''}`}
                    {...registerPassword('currentPassword', { 
                      required: 'Current password is required' 
                    })}
                  />
                  {passwordErrors?.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword" className="label">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    className={`input ${passwordErrors?.newPassword ? 'input-error' : ''}`}
                    {...registerPassword('newPassword', { 
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                  {passwordErrors?.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className={`input ${passwordErrors?.confirmPassword ? 'input-error' : ''}`}
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
                    className="btn btn-primary"
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