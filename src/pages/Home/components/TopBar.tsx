import { Bell, Clock, FileText, Target } from "lucide-react"
import { useState } from "react";
import { Link } from "react-router-dom"

import { useAuthStore } from "../../../stores/authStore";
import NotificationModal from "../../../components/notifications/NotificationModal";

export const TopBar = () => {
  const { user } = useAuthStore();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white pt-8 pb-8">
        <div className="max-w-3xl mx-auto px-4">

          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-400 text-sm">Welcome Back</p>
              <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</h1>
            </div>
            <div className="flex items-center">
              <span className="font-poppins italic text-2xl tracking-tight text-white select-none mr-3">
                LivePlan<sup className="align-super text-xs ml-0.5 italic">3</sup>
              </span>

              <button 
                onClick={() => setIsNotificationModalOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs text-white bg-red-500 rounded-full">
                  2
                </span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4">
            <Link 
              to="/income" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/icon income.png" alt="Income" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-sm">Income</span>
            </Link>

            <Link 
              to="/expenses" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-sm">Expenses</span>
            </Link>

            <Link 
              to="/goals" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6" />
              </div>
              <span className="text-sm">Goals</span>
            </Link>

            <Link 
              to="/statement" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-sm">Statement</span>
            </Link>
          </div>
        </div>
      </div>

      <NotificationModal 
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
      />
    </>
  )
}