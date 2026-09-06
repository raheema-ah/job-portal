import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Users,
  Briefcase,
  Clock,
  Trash2,
  MailCheck,
} from 'lucide-react';
import RoleLayout from '../components/RoleLayout';

const sampleNotifications = [
  {
    id: 1,
    title: 'New Applicant Received',
    message: 'Elena Rostova applied for Senior Full-Stack Engineer.',
    time: '25 minutes ago',
    type: 'applicant',
    read: false,
  },
  {
    id: 2,
    title: 'Job Posting Activated',
    message: 'Your job posting "Lead Product Designer" is now active and visible to candidates.',
    time: '3 hours ago',
    type: 'system',
    read: false,
  },
  {
    id: 3,
    title: 'Candidate Profile Update',
    message: 'Candidate Alex Mercer updated their attached resume.',
    time: '1 day ago',
    type: 'applicant',
    read: true,
  },
  {
    id: 4,
    title: 'Scheduled Interview Reminder',
    message: 'Technical screening interview with candidate scheduled for tomorrow at 2:00 PM.',
    time: '2 days ago',
    type: 'calendar',
    read: true,
  },
];

const EmployerNotificationsPage = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <RoleLayout
      role="employer"
      title="Notifications"
      subtitle="Stay updated with new candidate applications, pipeline changes, and platform alerts."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <MailCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">All Caught Up!</h3>
            <p className="text-xs text-slate-500">
              You have no unread notifications or new activity at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  n.read
                    ? 'bg-white border-slate-200/70'
                    : 'bg-blue-50/50 border-blue-200 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      n.type === 'applicant'
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {n.type === 'applicant' ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                      <Clock className="w-2.5 h-2.5" /> {n.time}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Delete notification"
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

export default EmployerNotificationsPage;
