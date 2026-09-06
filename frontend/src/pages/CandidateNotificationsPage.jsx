import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Briefcase, Sparkles, Trash2 } from 'lucide-react';
import RoleLayout from '../components/RoleLayout';

const CandidateNotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Application Received',
      message: 'Your application for Senior Full Stack React & Node Engineer was submitted successfully.',
      time: '2 hours ago',
      read: false,
      type: 'app',
    },
    {
      id: 2,
      title: 'New Matching Job Alert',
      message: 'Anthropic AI Labs posted a new role: Senior Full Stack AI Engineer matching your skills.',
      time: '1 day ago',
      read: true,
      type: 'job',
    },
    {
      id: 3,
      title: 'Profile Recommendation',
      message: 'Add more details to your Education and Experience fields to increase profile visibility.',
      time: '3 days ago',
      read: true,
      type: 'tip',
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <RoleLayout
      role="candidate"
      title="Notifications & Alerts"
      subtitle="Stay updated on application status changes and new job matches."
      actions={
        <button
          onClick={markAllAsRead}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >
          Mark all as read
        </button>
      }
    >
      <div className="max-w-3xl space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No new notifications</h3>
            <p className="text-xs text-slate-500">You are completely up to date!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !item.read ? 'border-blue-300 bg-blue-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      !item.read ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>{item.title}</span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">{item.message}</p>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">
                      {item.time}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => clearNotification(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default CandidateNotificationsPage;
