import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const timezones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'];

export default function SettingsPage() {
  const { user, updateSettings } = useAuth();
  const [form, setForm] = useState({
    name: '',
    cloudStorageEmail: '',
    calendarEmail: '',
    timezone: 'UTC',
    emailNotifications: true
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      cloudStorageEmail: user?.cloudStorageEmail || '',
      calendarEmail: user?.calendarEmail || '',
      timezone: user?.timezone || 'UTC',
      emailNotifications: user?.emailNotifications !== false
    });
  }, [user]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      await updateSettings(form);
      setStatus({ type: 'success', message: 'Settings saved successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Unable to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Workspace preferences</p>
        <h1 className="mt-2 font-display text-3xl font-black text-on-surface">Settings</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Manage your profile, calendar, cloud storage, and notifications.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/20 text-xl font-black text-primary">
            {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-on-surface">Account details</h2>
            <p className="text-sm text-on-surface-variant">{user?.email || 'Authenticated workspace member'}</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-on-surface">
            Display name
            <input value={form.name} onChange={(event) => setField('name', event.target.value)} required className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-3 font-normal outline-none focus:border-primary" />
          </label>
          <label className="text-sm font-semibold text-on-surface">
            Login email
            <input value={user?.email || ''} readOnly className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container/60 px-3 py-3 font-normal text-on-surface-variant" />
          </label>
          <label className="text-sm font-semibold text-on-surface">
            Cloud storage email
            <input type="email" value={form.cloudStorageEmail} onChange={(event) => setField('cloudStorageEmail', event.target.value)} placeholder="drive-account@example.com" className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-3 font-normal outline-none focus:border-primary" />
            <span className="mt-1 block text-xs font-normal text-on-surface-variant">Used for recording and document delivery.</span>
          </label>
          <label className="text-sm font-semibold text-on-surface">
            Calendar email
            <input type="email" value={form.calendarEmail} onChange={(event) => setField('calendarEmail', event.target.value)} placeholder="calendar@example.com" className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-3 font-normal outline-none focus:border-primary" />
            <span className="mt-1 block text-xs font-normal text-on-surface-variant">Used when creating calendar invitations.</span>
          </label>
          <label className="text-sm font-semibold text-on-surface">
            Time zone
            <select value={form.timezone} onChange={(event) => setField('timezone', event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-3 font-normal outline-none focus:border-primary">
              {timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface">
          <input type="checkbox" checked={form.emailNotifications} onChange={(event) => setField('emailNotifications', event.target.checked)} className="h-4 w-4 accent-primary" />
          Receive meeting reminders and recording notifications by email
        </label>

        {status.message && <p className={`rounded-xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-error/30 bg-error/10 text-error'}`}>{status.message}</p>}

        <div className="flex justify-end border-t border-outline-variant pt-5">
          <button type="submit" disabled={saving} className="rounded-xl bg-primary px-5 py-3 font-bold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </section>
  );
}
