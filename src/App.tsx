import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './lib/supabase';
import type {
  Profile, Group, Level, ArchivedLevel, ArchivedLevelTag,
  LevelUpload, VoteType, Direction, Outcome,
} from './types';
import { cn } from './utils/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════════════════════ */

const IconArrowUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
  </svg>
);
const IconArrowDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const IconX = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const IconHistory = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const IconUpload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const IconCopy = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconChart = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconTrophy = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const IconShare = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);
const IconExpand = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const formatPrice = (p: number) =>
  Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const getLocalDatetimeString = () => {
  const n = new Date();
  const pad = (v: number) => v.toString().padStart(2, '0');
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}T${pad(n.getHours())}:${pad(n.getMinutes())}`;
};

const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const validateTag = (tag: string) => tag.trim().split(/\s+/).filter(Boolean).length <= 2;

const GROUP_PERMISSION_CODE = 'YESPLS';

const upsertTagText = async (text: string): Promise<string | null> => {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;
  const { data: existing } = await supabase
    .from('tags').select('id').eq('text', normalized).maybeSingle();
  if (existing) return existing.id;
  const { data: inserted } = await supabase
    .from('tags').insert({ text: normalized }).select('id').single();
  return inserted?.id ?? null;
};

const upsertLevelTag = async (levelId: string, tagId: string) => {
  const { data: existing } = await supabase
    .from('level_tags').select('id, count').eq('level_id', levelId).eq('tag_id', tagId).maybeSingle();
  if (existing) {
    await supabase.from('level_tags').update({ count: existing.count + 1 }).eq('id', existing.id);
  } else {
    await supabase.from('level_tags').insert({ level_id: levelId, tag_id: tagId, count: 1 });
  }
};

const getSignedUrl = async (path: string): Promise<string | null> => {
  const { data } = await supabase.storage.from('level-uploads').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
};

const resolveUploadUrls = async (uploads: LevelUpload[]): Promise<LevelUpload[]> =>
  Promise.all(uploads.map(async (u) => {
    if (u.image_path) {
      const url = await getSignedUrl(u.image_path);
      return { ...u, image_url: url };
    }
    return u;
  }));

const fetchMemberCount = async (groupId: string): Promise<number> => {
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);
  return count || 0;
};

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return (
    <svg className={cn(s, 'animate-spin text-blue-400')} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
};

type ToastType = 'success' | 'error' | 'info';
interface ToastMsg { id: number; msg: string; type: ToastType }
let toastId = 0;
let toastSetter: React.Dispatch<React.SetStateAction<ToastMsg[]>> | null = null;

export const toast = (msg: string, type: ToastType = 'info') => {
  if (!toastSetter) return;
  const id = ++toastId;
  toastSetter(prev => [...prev, { id, msg, type }]);
  setTimeout(() => toastSetter?.(prev => prev.filter(t => t.id !== id)), 3500);
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  useEffect(() => { toastSetter = setToasts; return () => { toastSetter = null; }; }, []);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          'rounded-lg px-4 py-3 text-sm font-medium shadow-2xl border backdrop-blur-sm',
          t.type === 'success' && 'bg-emerald-900/90 border-emerald-700/60 text-emerald-200',
          t.type === 'error'   && 'bg-red-900/90 border-red-700/60 text-red-200',
          t.type === 'info'    && 'bg-gray-800/90 border-gray-700/60 text-gray-200',
        )}>{t.msg}</div>
      ))}
    </div>
  );
};

const Modal: React.FC<{ onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ onClose, children, wide }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
    <div
      className={cn(
        'bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full overflow-hidden',
        wide ? 'max-w-2xl' : 'max-w-md',
      )}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const ImageLightbox: React.FC<{
  src: string;
  onClose: () => void;
}> = ({ src, onClose }) => (
  <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4" onClick={onClose}>
    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/60 hover:text-white bg-gray-900/80 rounded-lg transition-colors">
      <IconX />
    </button>
    <img src={src} alt="Trade chart" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
  </div>
);

const inputClass = 'w-full px-4 py-3 bg-gray-950 border border-gray-700/60 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 text-sm transition-colors';
const labelClass = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

/* AUTH SCREEN */

const AuthScreen: React.FC<{ onAuth: (profile: Profile) => void }> = ({ onAuth }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err || !data.user) { setError(err?.message || 'Sign in failed'); setLoading(false); return; }
    const { data: profile, error: pErr } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single();
    if (pErr || !profile) { setError('Could not load profile'); setLoading(false); return; }
    onAuth(profile);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 2) { setError('Username must be at least 2 characters'); return; }
    if (trimmed.length > 24) { setError('Username must be 24 characters or less'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    if (err || !data.user) { setError(err?.message || 'Sign up failed'); setLoading(false); return; }
    const { data: profile, error: pErr } = await supabase.from('profiles').insert({
      id: data.user.id, username: trimmed, group_id: null, is_admin: false,
    }).select().single();
    if (pErr) {
      setError(pErr.message.includes('unique') ? 'Username already taken' : pErr.message);
      setLoading(false); return;
    }
    if (profile) onAuth(profile);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 mb-4 shadow-lg shadow-blue-600/20">
            <IconChart />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Consensus</h1>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex mb-5 bg-gray-950 rounded-lg p-0.5">
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={cn('flex-1 py-2 rounded-md text-xs font-semibold tracking-wide transition-all',
                  mode === m ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300')}>
                {m === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>
            ))}
          </div>

          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className={labelClass}>Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="tradername" autoComplete="username" className={inputClass} />
              </div>
            )}
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className={inputClass} />
            </div>
            {error && (
              <div className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm mt-1">
              {loading ? <Spinner size="sm" /> : null}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* GROUP SCREEN */

interface LeaderboardEntry {
  user_id: string;
  username: string;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
}

const GroupScreen: React.FC<{
  profile: Profile;
  onJoin: (p: Profile, g: Group) => void;
}> = ({ profile, onJoin }) => {
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [inviteCode, setInviteCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [permissionCode, setPermissionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const code = inviteCode.trim().toUpperCase();
    if (!code) { setError('Enter an invite code'); setLoading(false); return; }

    const { data: group, error: gErr } = await supabase
      .from('groups').select('*').eq('invite_code', code).maybeSingle();
    if (gErr || !group) { setError('Invalid invite code'); setLoading(false); return; }

    const currentCount = await fetchMemberCount(group.id);
    if (currentCount >= 50) { setError('This group is full (50/50)'); setLoading(false); return; }

    const { error: mErr } = await supabase
      .from('group_members').insert({ group_id: group.id, user_id: profile.id });
    if (mErr && !mErr.message.includes('duplicate') && !mErr.code?.includes('23505')) {
      setError(mErr.message); setLoading(false); return;
    }

    const { data: updated } = await supabase
      .from('profiles').update({ group_id: group.id }).eq('id', profile.id).select().single();
    if (updated) onJoin(updated, group);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) { setError('Group name is required'); return; }
    if (permissionCode.trim().toUpperCase() !== GROUP_PERMISSION_CODE) {
      setError('Invalid permission code'); return;
    }
    setLoading(true); setError('');

    const invite_code = generateInviteCode();
    const { data: group, error: gErr } = await supabase
      .from('groups')
      .insert({ name: groupName.trim(), invite_code, admin_id: profile.id, member_count: 1 })
      .select().single();
    if (gErr || !group) { setError(gErr?.message || 'Failed to create group'); setLoading(false); return; }

    await supabase.from('group_members').insert({ group_id: group.id, user_id: profile.id });

    const { data: updated } = await supabase
      .from('profiles')
      .update({ group_id: group.id, is_admin: true })
      .eq('id', profile.id).select().single();
    if (updated) onJoin(updated, group);
    setLoading(false);
  };



  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-gray-800 border border-gray-700/60 mb-3">
            <span className="text-xl">📊</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome, {profile.username}</h2>
          <p className="text-gray-500 mt-1 text-xs">Join an existing group or create your own</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex mb-5 bg-gray-950 rounded-lg p-0.5">
            {(['join', 'create'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={cn('flex-1 py-2 rounded-md text-xs font-semibold tracking-wide transition-all',
                  mode === m ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300')}>
                {m === 'join' ? 'JOIN GROUP' : 'CREATE GROUP'}
              </button>
            ))}
          </div>

          {mode === 'join' ? (
            <form onSubmit={handleJoin} className="space-y-3.5">
              <div>
                <label className={labelClass}>Invite Code</label>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="ABC123" maxLength={8}
                  className={cn(inputClass, 'font-mono tracking-[0.3em] text-center uppercase')} />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? <Spinner size="sm" /> : null} Join
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className={labelClass}>Group Name</label>
                <input value={groupName} onChange={e => setGroupName(e.target.value)}
                  placeholder="Alpha Traders" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Permission Code</label>
                <input value={permissionCode}
                  onChange={e => setPermissionCode(e.target.value)}
                  placeholder="Required to create a group"
                  className={cn(inputClass, 'font-mono tracking-wider uppercase')} />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? <Spinner size="sm" /> : null} Create Group
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* SUBMIT LEVEL MODAL */

const SubmitLevelModal: React.FC<{
  onClose: () => void;
  onSubmit: (price: number, dir: Direction, tp?: number, sl?: number, tag?: string) => Promise<void>;
}> = ({ onClose, onSubmit }) => {
  const [price, setPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [direction, setDirection] = useState<Direction>('long');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(price);
    if (isNaN(num) || num <= 0) { setError('Enter a valid positive price'); return; }
    const tp = takeProfit.trim() ? parseFloat(takeProfit) : null;
    const sl = stopLoss.trim() ? parseFloat(stopLoss) : null;
    if (tp !== null && (isNaN(tp) || tp <= 0)) { setError('Invalid take profit value'); return; }
    if (sl !== null && (isNaN(sl) || sl <= 0)) { setError('Invalid stop loss value'); return; }
    if (tag && !validateTag(tag)) { setError('Tag must be at most 2 words'); return; }
    setLoading(true);
    try { await onSubmit(num, direction, tp ?? undefined, sl ?? undefined, tag.trim() || undefined); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-tight">Submit Price Level</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><IconX /></button>
        </div>
        <form onSubmit={handle} className="space-y-3.5">
          <div>
            <label className={labelClass}>Price</label>
            <input type="number" step="any" value={price}
              onChange={e => { setPrice(e.target.value); setError(''); }}
              placeholder="0.00" className={cn(inputClass, 'font-mono')} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Take Profit <span className="normal-case text-gray-600 font-normal">(optional)</span></label>
              <input type="number" step="any" value={takeProfit}
                onChange={e => setTakeProfit(e.target.value)}
                placeholder="0.00" className={cn(inputClass, 'font-mono')} />
            </div>
            <div>
              <label className={labelClass}>Stop Loss <span className="normal-case text-gray-600 font-normal">(optional)</span></label>
              <input type="number" step="any" value={stopLoss}
                onChange={e => setStopLoss(e.target.value)}
                placeholder="0.00" className={cn(inputClass, 'font-mono')} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Direction</label>
            <div className="grid grid-cols-2 gap-2.5">
              {(['long', 'short'] as Direction[]).map(d => (
                <button key={d} type="button" onClick={() => setDirection(d)}
                  className={cn(
                    'py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-all border',
                    direction === d
                      ? d === 'long'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-rose-600 text-white border-rose-500'
                      : 'bg-gray-950 text-gray-500 border-gray-700/60 hover:border-gray-600',
                  )}>
                  {d === 'long' ? <IconArrowUp /> : <IconArrowDown />}
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>
              Tag <span className="normal-case text-gray-600 font-normal">(optional, max 2 words)</span>
            </label>
            <input value={tag} onChange={e => setTag(e.target.value)} placeholder="support level" className={inputClass} />
          </div>
          {error && <p className="text-rose-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
            {loading ? <Spinner size="sm" /> : null} Submit Level
          </button>
        </form>
      </div>
    </Modal>
  );
};

/* VOTE MODAL */

const VoteModal: React.FC<{
  level: Level;
  voteType: VoteType;
  onClose: () => void;
  onVote: (tag?: string) => Promise<void>;
}> = ({ level, voteType, onClose, onVote }) => {
  const [tag, setTag] = useState('');
  const [tagError, setTagError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tag && !validateTag(tag)) { setTagError('Max 2 words'); return; }
    setLoading(true);
    try { await onVote(tag.trim() || undefined); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">{voteType === 'like' ? '👍 Like' : '👎 Dislike'} Level</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><IconX /></button>
        </div>

        <div className={cn('rounded-lg p-3.5 mb-4 border', level.direction === 'long' ? 'bg-emerald-950/40 border-emerald-800/40' : 'bg-rose-950/40 border-rose-800/40')}>
          <span className={cn('text-[10px] font-bold uppercase tracking-widest', level.direction === 'long' ? 'text-emerald-400' : 'text-rose-400')}>
            {level.direction}
          </span>
          <div className="text-xl font-bold text-white mt-0.5 font-mono">${formatPrice(level.price)}</div>
          <p className="text-[11px] text-gray-500 mt-1">by {level.creator?.username || '—'}</p>
        </div>

        <form onSubmit={handle} className="space-y-3.5">
          <div>
            <label className={labelClass}>
              Tag <span className="normal-case text-gray-600 font-normal">(optional, max 2 words)</span>
            </label>
            <input value={tag} onChange={e => { setTag(e.target.value); setTagError(''); }} placeholder="key resistance" className={inputClass} />
            {tagError && <p className="text-rose-400 text-xs mt-1">{tagError}</p>}
          </div>
          <div className="flex gap-2.5">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={cn(
                'flex-1 py-2.5 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40',
                voteType === 'like' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white',
              )}>
              {loading ? <Spinner size="sm" /> : null} Confirm
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

/* TAPPED MODAL */

const TappedModal: React.FC<{
  level: Level;
  onClose: () => void;
  onConfirm: (timestamp: string) => Promise<void>;
}> = ({ level, onClose, onConfirm }) => {
  const [datetime, setDatetime] = useState(getLocalDatetimeString);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    const iso = new Date(datetime).toISOString();
    await onConfirm(iso);
    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-tight">Confirm Tapped ✓</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><IconX /></button>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3.5 mb-4">
          <span className={cn('text-[10px] font-bold uppercase tracking-widest', level.direction === 'long' ? 'text-emerald-400' : 'text-rose-400')}>
            {level.direction}
          </span>
          <div className="text-xl font-bold text-white mt-0.5 font-mono">${formatPrice(level.price)}</div>
          <p className="text-[11px] text-gray-500 mt-1">by {level.creator?.username || '—'}</p>
        </div>

        <div className="mb-5">
          <label className={labelClass}>Tapped At</label>
          <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} className={inputClass} />
          <p className="text-[11px] text-gray-600 mt-1.5">Defaults to now. Adjust if the level was tapped earlier.</p>
        </div>

        <div className="flex gap-2.5">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors">
            Cancel
          </button>
          <button onClick={handle} disabled={loading}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
            {loading ? <Spinner size="sm" /> : <IconCheck />}
            Confirm Tapped
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* FAILED MODAL */

const FailedModal: React.FC<{
  level: Level;
  onClose: () => void;
  onConfirm: (timestamp: string) => Promise<void>;
}> = ({ level, onClose, onConfirm }) => {
  const [datetime, setDatetime] = useState(getLocalDatetimeString);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    const iso = new Date(datetime).toISOString();
    await onConfirm(iso);
    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-tight">Confirm Failed ✗</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><IconX /></button>
        </div>

        <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg p-3.5 mb-4">
          <span className={cn('text-[10px] font-bold uppercase tracking-widest', level.direction === 'long' ? 'text-emerald-400' : 'text-rose-400')}>
            {level.direction}
          </span>
          <div className="text-xl font-bold text-white mt-0.5 font-mono">${formatPrice(level.price)}</div>
          <p className="text-[11px] text-gray-500 mt-1">by {level.creator?.username || '—'}</p>
        </div>

        <div className="mb-5">
          <label className={labelClass}>Failed At</label>
          <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} className={inputClass} />
          <p className="text-[11px] text-gray-600 mt-1.5">Defaults to now. Adjust if the level failed earlier.</p>
        </div>

        <div className="flex gap-2.5">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors">
            Cancel
          </button>
          <button onClick={handle} disabled={loading}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
            {loading ? <Spinner size="sm" /> : <IconX className="w-4 h-4" />}
            Confirm Failed
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* PERFORMANCE CARD MODAL (Shareable) */

const PerformanceCardModal: React.FC<{
  level: Level;
  creatorStats?: CreatorStats;
  onClose: () => void;
}> = ({ level, creatorStats, onClose }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);

  const tp = level.take_profit;
  const sl = level.stop_loss;
  const rr = tp && sl ? ((tp - level.price) / (level.price - sl)).toFixed(2) : null;

  return (
    <Modal onClose={onClose}>
      <div className="p-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-base font-bold text-white tracking-tight">Level Performance Card</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><IconX /></button>
        </div>

        <div className="p-5">
          {/* Shareable Card */}
          <div ref={cardRef} className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl border border-gray-800 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <IconChart />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">Consensus</span>
              </div>
              <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest', level.direction === 'long' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400')}>
                {level.direction}
              </span>
            </div>

            <div className="text-center py-4">
              <div className="text-3xl font-bold text-white font-mono">${formatPrice(level.price)}</div>
              <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Entry Price</div>
            </div>

            {(tp || sl) && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {tp && (
                  <div className="bg-emerald-950/30 rounded-lg p-2 text-center border border-emerald-800/30">
                    <div className="text-emerald-400 font-mono font-bold">${formatPrice(tp)}</div>
                    <div className="text-[9px] text-emerald-600 uppercase tracking-wider mt-0.5">Take Profit</div>
                  </div>
                )}
                {sl && (
                  <div className="bg-rose-950/30 rounded-lg p-2 text-center border border-rose-800/30">
                    <div className="text-rose-400 font-mono font-bold">${formatPrice(sl)}</div>
                    <div className="text-[9px] text-rose-600 uppercase tracking-wider mt-0.5">Stop Loss</div>
                  </div>
                )}
                {rr && (
                  <div className={cn('rounded-lg p-2 text-center border',
                    parseFloat(rr) >= 1 ? 'bg-emerald-950/30 border-emerald-800/30' : 'bg-rose-950/30 border-rose-800/30'
                  )}>
                    <div className={cn('font-mono font-bold', parseFloat(rr) >= 1 ? 'text-emerald-400' : 'text-rose-400')}>R:{rr}</div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Risk/Reward</div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-950/70 rounded-lg p-2 text-center border border-gray-800/70">
                <div className="text-white font-mono font-bold">{level.likes}</div>
                <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Likes</div>
              </div>
              <div className="bg-gray-950/70 rounded-lg p-2 text-center border border-gray-800/70">
                <div className="text-white font-mono font-bold">{level.dislikes}</div>
                <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Dislikes</div>
              </div>
              <div className="bg-gray-950/70 rounded-lg p-2 text-center border border-gray-800/70">
                <div className="text-white font-mono font-bold">{timeAgo(level.last_interaction_at)}</div>
                <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Activity</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-white font-bold text-xs">
                  {level.creator?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{level.creator?.username || 'Unknown'}</div>
                  {creatorStats && (
                    <div className="text-[10px] text-gray-500 font-mono">{creatorStats.wins}W-{creatorStats.losses}L</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={cn('text-lg font-bold font-mono', level.score > 0 ? 'text-emerald-400' : level.score < 0 ? 'text-rose-400' : 'text-gray-500')}>
                  {level.score > 0 ? '+' : ''}{level.score}
                </div>
                <div className="text-[9px] text-gray-600 uppercase tracking-wider">Score</div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 text-center">
            Screenshot this card to share with your trading group
          </p>
        </div>
      </div>
    </Modal>
  );
};

/* ARCHIVED PERFORMANCE CARD MODAL (Shareable) */

const ArchivedPerformanceCardModal: React.FC<{
  archived: ArchivedLevel;
  onClose: () => void;
}> = ({ archived, onClose }) => {
  const tp = archived.take_profit;
  const sl = archived.stop_loss;
  const rr = tp && sl && (archived.price - sl) !== 0 ? ((tp - archived.price) / (archived.price - sl)).toFixed(2) : null;

  return (
    <Modal onClose={onClose}>
      <div className="p-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-base font-bold text-white tracking-tight">Level Performance Card</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><IconX /></button>
        </div>

        <div className="p-5">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl border border-gray-800 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <IconChart />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">Consensus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest', archived.direction === 'long' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400')}>
                  {archived.direction}
                </span>
                <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold', archived.outcome === 'tapped' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}>
                  {archived.outcome === 'tapped' ? '✓ WIN' : '✗ LOSS'}
                </span>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-3xl font-bold text-white font-mono">${formatPrice(archived.price)}</div>
              <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Entry Price</div>
            </div>

            {(tp || sl) && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {tp && (
                  <div className="bg-emerald-950/30 rounded-lg p-2 text-center border border-emerald-800/30">
                    <div className="text-emerald-400 font-mono font-bold">${formatPrice(tp)}</div>
                    <div className="text-[9px] text-emerald-600 uppercase tracking-wider mt-0.5">Take Profit</div>
                  </div>
                )}
                {sl && (
                  <div className="bg-rose-950/30 rounded-lg p-2 text-center border border-rose-800/30">
                    <div className="text-rose-400 font-mono font-bold">${formatPrice(sl)}</div>
                    <div className="text-[9px] text-rose-600 uppercase tracking-wider mt-0.5">Stop Loss</div>
                  </div>
                )}
                {rr && (
                  <div className={cn('rounded-lg p-2 text-center border',
                    parseFloat(rr) >= 1 ? 'bg-emerald-950/30 border-emerald-800/30' : 'bg-rose-950/30 border-rose-800/30'
                  )}>
                    <div className={cn('font-mono font-bold', parseFloat(rr) >= 1 ? 'text-emerald-400' : 'text-rose-400')}>R:{rr}</div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Risk/Reward</div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-950/70 rounded-lg p-2 text-center border border-gray-800/70">
                <div className="text-white font-mono font-bold">{archived.likes}</div>
                <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Likes</div>
              </div>
              <div className="bg-gray-950/70 rounded-lg p-2 text-center border border-gray-800/70">
                <div className="text-white font-mono font-bold">{archived.dislikes}</div>
                <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Dislikes</div>
              </div>
              <div className="bg-gray-950/70 rounded-lg p-2 text-center border border-gray-800/70">
                <div className={cn('font-mono font-bold', archived.score > 0 ? 'text-emerald-400' : archived.score < 0 ? 'text-rose-400' : 'text-gray-500')}>
                  {archived.score > 0 ? '+' : ''}{archived.score}
                </div>
                <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Score</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-white font-bold text-xs">
                  {archived.creator?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{archived.creator?.username || 'Unknown'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500">{archived.outcome === 'tapped' ? 'Tapped' : 'Failed'}</div>
                <div className="text-[10px] text-gray-600">{formatTimestamp(archived.archived_at)}</div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 text-center">
            Screenshot this card to share with your trading group
          </p>
        </div>
      </div>
    </Modal>
  );
};

/* LEVEL DETAIL MODAL */

const LevelDetailModal: React.FC<{
  archived: ArchivedLevel;
  userId: string;
  isAdmin: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onDelete: () => Promise<void>;
}> = ({ archived, userId, isAdmin, onClose, onRefresh, onDelete }) => {
  const canDelete = isAdmin || archived.creator_id === userId;
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPerformanceCard, setShowPerformanceCard] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploads = archived.level_uploads || [];
  const tags = archived.archived_level_tags || [];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('level_uploads').insert({
      archived_level_id: archived.id, user_id: userId, body: note.trim(), image_path: null,
    });
    if (error) toast('Failed to add note: ' + error.message, 'error');
    else { setNote(''); toast('Note added', 'success'); }
    await onRefresh();
    setSubmitting(false);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Only image files are allowed', 'error'); return; }
    if (file.size > 10 * 1024 * 1024) { toast('File too large (max 10 MB)', 'error'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${archived.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('level-uploads').upload(path, file, {
      contentType: file.type, upsert: false,
    });
    if (upErr) { toast('Upload failed: ' + upErr.message, 'error'); setUploading(false); return; }
    const { error: dbErr } = await supabase.from('level_uploads').insert({
      archived_level_id: archived.id, user_id: userId, image_path: path, body: null,
    });
    if (dbErr) toast('Could not save upload record: ' + dbErr.message, 'error');
    else toast('Image uploaded', 'success');
    await onRefresh();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const sortedTags = [...tags].sort((a: ArchivedLevelTag, b: ArchivedLevelTag) => b.count - a.count);
  const imageUploads = uploads.filter((u: LevelUpload) => u.image_path || u.image_url);
  const noteUploads  = uploads.filter((u: LevelUpload) => u.body);

  const handleDelete = async () => {
    if (!window.confirm('Delete this level permanently?')) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  return (
    <Modal onClose={onClose} wide>
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest', archived.direction === 'long' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400')}>
                {archived.direction}
              </span>
              <span className="text-lg font-bold text-white font-mono">${formatPrice(archived.price)}</span>
              <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold', archived.outcome === 'tapped' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}>
                {archived.outcome === 'tapped' ? '✓ TAPPED' : '✗ FAILED'}
              </span>
            </div>
            <p className="text-gray-500 text-[11px] mt-1.5">
              by {archived.creator?.username || '—'} · {archived.outcome === 'tapped' ? 'Tapped' : 'Failed'} {formatTimestamp(archived.archived_at)}
            </p>
            {(archived.take_profit || archived.stop_loss) && (
              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono">
                {archived.take_profit && <span className="text-emerald-400">TP: ${formatPrice(archived.take_profit)}</span>}
                {archived.stop_loss && <span className="text-rose-400">SL: ${formatPrice(archived.stop_loss)}</span>}
                {archived.take_profit && archived.stop_loss && (
                  <span className={cn('px-1.5 py-0.5 rounded font-semibold',
                    (archived.take_profit - archived.price) / archived.price >= (archived.price - archived.stop_loss) / archived.price
                      ? 'bg-emerald-950/50 text-emerald-400'
                      : 'bg-rose-950/50 text-rose-400'
                  )}>
                    R:{((archived.take_profit - archived.price) / (archived.price - archived.stop_loss)).toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowPerformanceCard(true)}
              className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-950/30 rounded-lg transition-colors" title="Share performance card">
              <IconShare />
            </button>
            {canDelete && (
              <button onClick={handleDelete} disabled={deleting}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors disabled:opacity-40">
                {deleting ? <Spinner size="sm" /> : <IconTrash />}
              </button>
            )}
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><IconX /></button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">👍 {archived.likes}</span>
            <span className="text-xs text-gray-500">👎 {archived.dislikes}</span>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded font-mono', archived.score > 0 ? 'text-emerald-400 bg-emerald-950/60' : archived.score < 0 ? 'text-rose-400 bg-rose-950/60' : 'text-gray-500 bg-gray-800')}>
              {archived.score > 0 ? '+' : ''}{archived.score}
            </span>
          </div>

          <div>
            <h3 className={cn(labelClass, 'mb-2')}>Tags</h3>
            {sortedTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {sortedTags.map((lt: ArchivedLevelTag) => (
                  <span key={lt.id} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[11px] font-medium">
                    {lt.tag_text} <span className="text-gray-600">×{lt.count}</span>
                  </span>
                ))}
              </div>
            ) : <p className="text-gray-600 text-xs">No tags</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className={labelClass}>Trades</h3>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-40 font-medium">
                {uploading ? <Spinner size="sm" /> : <IconUpload />}
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
            </div>
            {imageUploads.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {imageUploads.map((u: LevelUpload) => (
                  u.image_url ? (
                    <button
                      key={u.id}
                      onClick={() => u.image_url && setLightboxImage(u.image_url)}
                      className="relative rounded-lg w-full h-36 border border-gray-800 overflow-hidden group/img hover:border-gray-600 transition-colors"
                    >
                      <img src={u.image_url} alt="chart" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover/img:opacity-100 transition-opacity p-1.5 bg-gray-900/80 rounded-lg">
                          <IconExpand />
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div key={u.id} className="rounded-lg w-full h-36 bg-gray-800 flex items-center justify-center"><Spinner size="sm" /></div>
                  )
                ))}
              </div>
            ) : <p className="text-gray-600 text-xs">No trades yet</p>}
          </div>

          <div>
            <h3 className={cn(labelClass, 'mb-2.5')}>Notes</h3>
            {noteUploads.length > 0 ? (
              <div className="space-y-2 mb-3">
                {noteUploads.map((u: LevelUpload) => (
                  <div key={u.id} className="bg-gray-950 rounded-lg px-3.5 py-2.5 border border-gray-800/60">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-semibold text-gray-400">{u.uploader?.username || '—'}</span>
                      <span className="text-[10px] text-gray-600">{timeAgo(u.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{u.body}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-600 text-xs mb-3">No notes yet</p>}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…" className={cn(inputClass, 'flex-1 !py-2')} />
              <button type="submit" disabled={!note.trim() || submitting}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-lg text-sm font-medium transition-colors">
                {submitting ? <Spinner size="sm" /> : 'Add'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showPerformanceCard && (
        <ArchivedPerformanceCardModal
          archived={archived}
          onClose={() => setShowPerformanceCard(false)}
        />
      )}

      {lightboxImage && (
        <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </Modal>
  );
};

/* LEVEL CARD */

interface CreatorStats { wins: number; losses: number }

const LevelCard: React.FC<{
  level: Level;
  profile: Profile;
  group: Group;
  creatorStats?: CreatorStats;
  onVoteDone: () => void;
  onArchiveDone: () => void;
}> = ({ level, profile, group, creatorStats, onVoteDone, onArchiveDone }) => {
  const [voteModal, setVoteModal] = useState<VoteType | null>(null);
  const [archiving, setArchiving] = useState<Outcome | null>(null);
  const [showTappedModal, setShowTappedModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [showPerformanceCard, setShowPerformanceCard] = useState(false);

  const isAdmin = group.admin_id === profile.id;
  const tags = level.level_tags || [];
  const topTags = [...tags].sort((a, b) => b.count - a.count).slice(0, 3);
  const scoreColor = level.score > 0 ? 'text-emerald-400' : level.score < 0 ? 'text-rose-400' : 'text-gray-500';

  const handleVoteClick = (type: VoteType) => {
    if (level.user_vote === type) {
      void performVote(type, undefined);
    } else {
      setVoteModal(type);
    }
  };

  const performVote = async (type: VoteType, tag?: string) => {
    const existing = level.user_vote;
    let newLikes = level.likes;
    let newDislikes = level.dislikes;

    if (existing === type) {
      await supabase.from('votes').delete().eq('level_id', level.id).eq('user_id', profile.id);
      if (type === 'like') newLikes -= 1; else newDislikes -= 1;
    } else if (existing) {
      await supabase.from('votes')
        .update({ vote_type: type, updated_at: new Date().toISOString() })
        .eq('level_id', level.id).eq('user_id', profile.id);
      if (type === 'like') { newLikes += 1; newDislikes -= 1; } else { newLikes -= 1; newDislikes += 1; }
    } else {
      await supabase.from('votes').insert({ level_id: level.id, user_id: profile.id, vote_type: type });
      if (type === 'like') newLikes += 1; else newDislikes += 1;
    }

    await supabase.from('levels').update({
      likes: newLikes, dislikes: newDislikes, score: newLikes - newDislikes,
      last_interaction_at: new Date().toISOString(),
    }).eq('id', level.id);

    if (tag) {
      const tagId = await upsertTagText(tag);
      if (tagId) await upsertLevelTag(level.id, tagId);
    }
    onVoteDone();
  };

  const handleArchive = async (outcome: Outcome, customTimestamp?: string) => {
    setArchiving(outcome);
    const levelTagsSnapshot = level.level_tags || [];

    const { data: arch, error: aErr } = await supabase.from('archived_levels').insert({
      original_level_id: level.id,
      group_id: level.group_id,
      price: level.price,
      direction: level.direction,
      take_profit: level.take_profit ?? null,
      stop_loss: level.stop_loss ?? null,
      creator_id: level.creator_id,
      outcome,
      likes: level.likes,
      dislikes: level.dislikes,
      score: level.score,
      archived_at: customTimestamp || new Date().toISOString(),
    }).select().single();

    if (aErr || !arch) {
      toast('Failed to archive: ' + (aErr?.message || 'unknown error'), 'error');
      setArchiving(null); return;
    }

    if (levelTagsSnapshot.length > 0) {
      await supabase.from('archived_level_tags').insert(
        levelTagsSnapshot.map(lt => ({
          archived_level_id: arch.id, tag_text: lt.tags.text, count: lt.count,
        }))
      );
    }

    await supabase.from('levels').delete().eq('id', level.id);
    onArchiveDone();
    setArchiving(null);
    toast(`Level marked as ${outcome}`, 'success');
  };

  const creatorName = level.creator?.username || '—';
  const wlString = creatorStats ? `(${creatorStats.wins}-${creatorStats.losses})` : '';

  return (
    <>
      <div className="bg-gray-900 rounded-xl border border-gray-800/80 hover:border-gray-700/80 transition-all overflow-hidden group/card">
        <div className={cn('h-0.5', level.direction === 'long' ? 'bg-emerald-500' : 'bg-rose-500')} />

        <div className="p-4">
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', level.direction === 'long' ? 'bg-emerald-950/80 text-emerald-400' : 'bg-rose-950/80 text-rose-400')}>
                {level.direction === 'long' ? <IconArrowUp /> : <IconArrowDown />}
              </div>
              <div>
                <div className={cn('text-[10px] font-bold uppercase tracking-widest', level.direction === 'long' ? 'text-emerald-500' : 'text-rose-500')}>
                  {level.direction}
                </div>
                <div className="text-lg font-bold text-white font-mono tracking-tight">${formatPrice(level.price)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn('text-lg font-bold tabular-nums font-mono', scoreColor)}>
                {level.score > 0 ? '+' : ''}{level.score}
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">{timeAgo(level.last_interaction_at)}</div>
            </div>
          </div>

          {(level.take_profit || level.stop_loss) && (
            <div className="flex items-center gap-3 mb-2.5 text-[10px] font-mono">
              {level.take_profit && (
                <span className="text-emerald-400">TP: <span className="text-white">${formatPrice(level.take_profit)}</span></span>
              )}
              {level.stop_loss && (
                <span className="text-rose-400">SL: <span className="text-white">${formatPrice(level.stop_loss)}</span></span>
              )}
              {level.take_profit && level.stop_loss && (
                <span className={cn('px-1.5 py-0.5 rounded font-semibold',
                  (level.take_profit - level.price) / level.price >= (level.price - level.stop_loss) / level.price
                    ? 'bg-emerald-950/50 text-emerald-400'
                    : 'bg-rose-950/50 text-rose-400'
                )}>
                  R:{((level.take_profit - level.price) / (level.price - level.stop_loss)).toFixed(2)}
                </span>
              )}
            </div>
          )}

          <div className="text-[11px] text-gray-500 mb-2.5">
            by <span className="text-gray-400 font-medium">{creatorName}</span>
            {wlString && <span className="text-gray-600 ml-1 font-mono text-[10px]">{wlString}</span>}
          </div>

          {topTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {topTags.map(lt => (
                <span key={lt.id} className="px-1.5 py-0.5 bg-gray-800/80 text-gray-500 rounded text-[10px] font-medium">
                  {lt.tags.text}
                  {lt.count > 1 && <span className="text-gray-600 ml-0.5">×{lt.count}</span>}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2.5 border-t border-gray-800/50">
            <button onClick={() => handleVoteClick('like')}
              className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all',
                level.user_vote === 'like' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-800 hover:text-gray-300')}>
              👍 <span className="tabular-nums font-mono">{level.likes}</span>
            </button>
            <button onClick={() => handleVoteClick('dislike')}
              className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all',
                level.user_vote === 'dislike' ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-800 hover:text-gray-300')}>
              👎 <span className="tabular-nums font-mono">{level.dislikes}</span>
            </button>
            <button onClick={() => setShowPerformanceCard(true)}
              className="ml-auto p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-950/30 rounded-md transition-colors" title="Share performance card">
              <IconShare />
            </button>
          </div>

          {isAdmin && (
            <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-gray-800/50">
              <button onClick={() => setShowTappedModal(true)} disabled={archiving !== null}
                className="flex-1 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-400 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-40">
                {archiving === 'tapped' ? <Spinner size="sm" /> : <IconCheck />}
                Tapped ✓
              </button>
              <button onClick={() => setShowFailedModal(true)} disabled={archiving !== null}
                className="flex-1 py-1.5 bg-rose-950/50 hover:bg-rose-900/50 border border-rose-800/40 text-rose-400 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-40">
                {archiving === 'failed' ? <Spinner size="sm" /> : <IconX className="w-4 h-4" />}
                Failed ✗
              </button>
            </div>
          )}
        </div>
      </div>

      {voteModal && (
        <VoteModal level={level} voteType={voteModal} onClose={() => setVoteModal(null)}
          onVote={async (tag) => { await performVote(voteModal, tag); setVoteModal(null); }} />
      )}

      {showTappedModal && (
        <TappedModal level={level} onClose={() => setShowTappedModal(false)}
          onConfirm={async (timestamp) => {
            await handleArchive('tapped', timestamp);
            setShowTappedModal(false);
          }} />
      )}

      {showFailedModal && (
        <FailedModal level={level} onClose={() => setShowFailedModal(false)}
          onConfirm={async (timestamp) => {
            await handleArchive('failed', timestamp);
            setShowFailedModal(false);
          }} />
      )}

      {showPerformanceCard && (
        <PerformanceCardModal
          level={level}
          creatorStats={creatorStats}
          onClose={() => setShowPerformanceCard(false)}
        />
      )}
    </>
  );
};

/* ARCHIVED LEVEL CARD */

const ArchivedCard: React.FC<{
  archived: ArchivedLevel;
  onOpen: () => void;
}> = ({ archived, onOpen }) => {
  const tags = [...(archived.archived_level_tags || [])]
    .sort((a: ArchivedLevelTag, b: ArchivedLevelTag) => b.count - a.count)
    .slice(0, 3);
  const uploadCount = archived.level_uploads?.length || 0;

  return (
    <div
      className={cn(
        'rounded-xl border p-3.5 cursor-pointer transition-all hover:scale-[1.005]',
        archived.outcome === 'tapped'
          ? 'bg-emerald-950/20 border-emerald-800/30 hover:border-emerald-700/50'
          : 'bg-rose-950/20 border-rose-800/30 hover:border-rose-700/50',
      )}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold', archived.outcome === 'tapped' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}>
            {archived.outcome === 'tapped' ? '✓' : '✗'}
          </div>
          <div>
            <div className={cn('text-[10px] font-bold uppercase tracking-widest', archived.direction === 'long' ? 'text-emerald-500' : 'text-rose-500')}>
              {archived.direction}
            </div>
            <div className="text-base font-bold text-white font-mono">${formatPrice(archived.price)}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={cn('text-sm font-bold tabular-nums font-mono', archived.score > 0 ? 'text-emerald-400' : archived.score < 0 ? 'text-rose-400' : 'text-gray-500')}>
            {archived.score > 0 ? '+' : ''}{archived.score}
          </div>
        </div>
      </div>

      {(archived.take_profit || archived.stop_loss) && (
        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono">
          {archived.take_profit && <span className="text-emerald-400">TP: ${formatPrice(archived.take_profit)}</span>}
          {archived.stop_loss && <span className="text-rose-400">SL: ${formatPrice(archived.stop_loss)}</span>}
          {archived.take_profit && archived.stop_loss && (
            <span className={cn('px-1.5 py-0.5 rounded font-semibold',
              (archived.take_profit - archived.price) / archived.price >= (archived.price - archived.stop_loss) / archived.price
                ? 'bg-emerald-950/50 text-emerald-400'
                : 'bg-rose-950/50 text-rose-400'
            )}>
              R:{((archived.take_profit - archived.price) / (archived.price - archived.stop_loss)).toFixed(2)}
            </span>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {tags.map((lt: ArchivedLevelTag) => (
            <span key={lt.id} className="px-1.5 py-0.5 bg-gray-800/50 text-gray-500 rounded text-[10px] font-medium">
              {lt.tag_text}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2.5 text-[10px] text-gray-600">
        <span>by {archived.creator?.username || '—'}</span>
        <span>·</span>
        <span>{archived.outcome === 'tapped' ? 'Tapped' : 'Failed'} {formatTimestamp(archived.archived_at)}</span>
        {uploadCount > 0 && <span>· {uploadCount} upload{uploadCount > 1 ? 's' : ''}</span>}
        <span className="ml-auto text-gray-700">details →</span>
      </div>
    </div>
  );
};

/* LEADERBOARD PAGE */

const LeaderboardPage: React.FC<{
  profile: Profile;
  group: Group;
  onNavigate: (p: 'previous' | 'profile' | 'toptraders') => void;
}> = ({ profile, group, onNavigate }) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [creatorStats, setCreatorStats] = useState<Record<string, CreatorStats>>({});

  const fetchLevels = useCallback(async () => {
    const { data, error } = await supabase
      .from('levels')
      .select('*, creator:profiles!creator_id(id,username), level_tags(id,level_id,tag_id,count,tags(id,text))')
      .eq('group_id', group.id)
      .order('score', { ascending: false })
      .order('last_interaction_at', { ascending: false });
    if (error) { console.error('fetchLevels error:', error); return; }

    const { data: myVotes } = await supabase
      .from('votes').select('level_id,vote_type').eq('user_id', profile.id);
    const voteMap: Record<string, VoteType> = {};
    (myVotes || []).forEach(v => { voteMap[v.level_id] = v.vote_type as VoteType; });

    const enriched: Level[] = (data || []).map((l: Level) => ({ ...l, user_vote: voteMap[l.id] || null }));
    setLevels(enriched);
    setLoading(false);

    const mc = await fetchMemberCount(group.id);
    setMemberCount(mc);

    const { data: archData } = await supabase
      .from('archived_levels')
      .select('creator_id, outcome')
      .eq('group_id', group.id);
    const stats: Record<string, CreatorStats> = {};
    (archData || []).forEach((a: { creator_id: string; outcome: string }) => {
      if (!stats[a.creator_id]) stats[a.creator_id] = { wins: 0, losses: 0 };
      if (a.outcome === 'tapped') stats[a.creator_id].wins++;
      else stats[a.creator_id].losses++;
    });
    setCreatorStats(stats);
  }, [group.id, profile.id]);

  useEffect(() => {
    void fetchLevels();
    const channel = supabase
      .channel(`levels-${group.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'levels', filter: `group_id=eq.${group.id}`,
      }, () => { void fetchLevels(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [fetchLevels, group.id]);

  const handleSubmitLevel = async (price: number, dir: Direction, tp?: number, sl?: number, tag?: string) => {
    const { data: existing } = await supabase
      .from('levels').select('id')
      .eq('group_id', group.id).eq('price', price).eq('direction', dir)
      .maybeSingle();
    if (existing) {
      await supabase.from('levels').delete().eq('id', existing.id);
    }

    const { data: newLevel, error } = await supabase.from('levels').insert({
      price, direction: dir, take_profit: tp ?? null, stop_loss: sl ?? null,
      group_id: group.id, creator_id: profile.id, likes: 1, dislikes: 0, score: 1,
    }).select().single();
    if (error || !newLevel) {
      toast('Failed to submit: ' + (error?.message || 'unknown'), 'error'); return;
    }

    await supabase.from('votes').insert({ level_id: newLevel.id, user_id: profile.id, vote_type: 'like' });

    if (tag) {
      const tagId = await upsertTagText(tag);
      if (tagId) await upsertLevelTag(newLevel.id, tagId);
    }

    setShowSubmit(false);
    await fetchLevels();
    toast('Level submitted!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/60 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">{group.name}</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-0.5">
              {memberCount} member{memberCount !== 1 ? 's' : ''} · LEADERBOARD
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={() => onNavigate('toptraders')}
              className="p-2 text-amber-500/70 hover:text-amber-400 hover:bg-amber-950/30 rounded-lg transition-colors" title="Top Traders">
              <IconTrophy />
            </button>
            <button onClick={() => onNavigate('previous')}
              className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Previous Levels">
              <IconHistory />
            </button>
            <button onClick={() => onNavigate('profile')}
              className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Profile">
              <IconUser />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-3">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : levels.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-40">📊</div>
            <h3 className="text-sm font-bold text-white mb-1">No levels yet</h3>
            <p className="text-gray-600 text-xs">Be the first to submit a price level</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {levels.map(l => (
              <LevelCard
                key={l.id}
                level={l}
                profile={profile}
                group={group}
                creatorStats={creatorStats[l.creator_id]}
                onVoteDone={fetchLevels}
                onArchiveDone={fetchLevels}
              />
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setShowSubmit(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
        <IconPlus />
      </button>

      {showSubmit && <SubmitLevelModal onClose={() => setShowSubmit(false)} onSubmit={handleSubmitLevel} />}
    </div>
  );
};

/* PREVIOUS PAGE */

const PreviousPage: React.FC<{
  profile: Profile;
  group: Group;
  onBack: () => void;
  onGoTopTraders: () => void;
}> = ({ profile, group, onBack, onGoTopTraders }) => {
  const [items, setItems] = useState<ArchivedLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ArchivedLevel | null>(null);

  const isAdmin = group.admin_id === profile.id;

  const fetchArchived = useCallback(async () => {
    const { data, error } = await supabase
      .from('archived_levels')
      .select(`
        *,
        creator:profiles!creator_id(id,username),
        archived_level_tags(id,archived_level_id,tag_text,count),
        level_uploads(id,archived_level_id,user_id,image_path,body,created_at,uploader:profiles!user_id(id,username))
      `)
      .eq('group_id', group.id)
      .order('archived_at', { ascending: false });
    if (error) { console.error('fetchArchived error:', error); return; }

    const enriched: ArchivedLevel[] = await Promise.all(
      (data || []).map(async (a: ArchivedLevel) => {
        if (!a.level_uploads?.length) return a;
        const resolved = await resolveUploadUrls(a.level_uploads);
        return { ...a, level_uploads: resolved };
      })
    );
    setItems(enriched);
    setLoading(false);
  }, [group.id]);

  useEffect(() => { void fetchArchived(); }, [fetchArchived]);

  const handleRefresh = async () => {
    await fetchArchived();
    if (selected) {
      const { data } = await supabase
        .from('archived_levels')
        .select(`
          *,
          creator:profiles!creator_id(id,username),
          archived_level_tags(id,archived_level_id,tag_text,count),
          level_uploads(id,archived_level_id,user_id,image_path,body,created_at,uploader:profiles!user_id(id,username))
        `)
        .eq('id', selected.id).single();
      if (data) {
        const resolved = data.level_uploads?.length ? await resolveUploadUrls(data.level_uploads) : data.level_uploads;
        setSelected({ ...data, level_uploads: resolved });
      }
    }
  };

  const handleDeleteArchived = async () => {
    if (!selected) return;

    // Simple delete - cascade handles dependent rows
    const { error } = await supabase
      .from('archived_levels')
      .delete()
      .eq('id', selected.id);

    if (error) {
      console.error('Delete error:', error);
      toast('Failed to delete: ' + error.message, 'error');
      return;
    }

    // Verify deletion by checking if row still exists
    const { data: stillExists } = await supabase
      .from('archived_levels')
      .select('id')
      .eq('id', selected.id)
      .maybeSingle();

    if (stillExists) {
      toast('Delete blocked by RLS policy. Check permissions.', 'error');
      return;
    }

    toast('Level deleted', 'success');
    setSelected(null);
    await fetchArchived();
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-8">
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/60 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <button onClick={onBack} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <IconChevronLeft />
            </button>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Previous Levels</h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">{group.name}</p>
            </div>
          </div>
          <button onClick={onGoTopTraders}
            className="px-3 py-2 rounded-lg bg-amber-800/60 hover:bg-amber-700/60 text-amber-200 text-xs font-semibold transition-colors flex items-center gap-1.5">
            <IconTrophy /> Top Traders
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-3">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-40">📁</div>
            <h3 className="text-sm font-bold text-white mb-1">No archived levels</h3>
            <p className="text-gray-600 text-xs">Levels appear here after admin resolution</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map(a => (
              <ArchivedCard key={a.id} archived={a} onOpen={() => setSelected(a)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <LevelDetailModal archived={selected} userId={profile.id} isAdmin={isAdmin}
          onClose={() => setSelected(null)} onRefresh={handleRefresh} onDelete={handleDeleteArchived} />
      )}
    </div>
  );
};

/* TOP TRADERS PAGE */

const TopTradersPage: React.FC<{
  group: Group;
  onBack: () => void;
}> = ({ group, onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('archived_levels')
        .select('creator_id, outcome, creator:profiles!creator_id(id, username)')
        .eq('group_id', group.id);

      if (error || !data) { setLoading(false); return; }

      const stats: Record<string, { username: string; wins: number; losses: number }> = {};
      data.forEach((a: any) => {
        if (!a.creator_id) return;
        const uid = a.creator_id;
        const creatorData = Array.isArray(a.creator) ? a.creator[0] : a.creator;
        if (!creatorData) return;
        if (!stats[uid]) stats[uid] = { username: creatorData.username || 'Unknown', wins: 0, losses: 0 };
        if (a.outcome === 'tapped') stats[uid].wins++;
        else stats[uid].losses++;
      });

      const all: LeaderboardEntry[] = Object.entries(stats)
        .map(([user_id, s]) => ({
          user_id,
          username: s.username,
          wins: s.wins,
          losses: s.losses,
          total: s.wins + s.losses,
          winRate: s.wins + s.losses > 0 ? Math.round((s.wins / (s.wins + s.losses)) * 100) : 0,
        }))
        .filter(e => e.total >= 3)
        .sort((a, b) => b.winRate - a.winRate || b.total - a.total);

      setEntries(all);
      setLoading(false);
    };
    void fetch();
  }, [group.id]);

  const medalColors = [
    'bg-amber-500 text-gray-900',
    'bg-gray-500 text-white',
    'bg-amber-700 text-white',
  ];

  const rowColors = [
    'bg-amber-950/20 border-amber-800/30',
    'bg-gray-800/50 border-gray-700/50',
    'bg-gray-800/30 border-gray-700/30',
  ];

  return (
    <div className="min-h-screen bg-gray-950 pb-8">
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/60 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2.5">
          <button onClick={onBack} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <IconChevronLeft />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Top Traders</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide">{group.name} · min 3 signals</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-3">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-40">🏆</div>
            <h3 className="text-sm font-bold text-white mb-1">No qualifying traders yet</h3>
            <p className="text-gray-600 text-xs">Traders need at least 3 resolved signals to appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <div key={entry.user_id}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border transition-all',
                  idx < 3 ? rowColors[idx] : 'bg-gray-900/50 border-gray-800/50'
                )}>
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
                  idx < 3 ? medalColors[idx] : 'bg-gray-800 text-gray-500'
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{entry.username}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{entry.wins}W - {entry.losses}L · {entry.total} signals</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={cn('text-xl font-bold font-mono', entry.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400')}>
                    {entry.winRate}%
                  </div>
                  <div className="text-[10px] text-gray-600">win rate</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* PROFILE PAGE */

const ProfilePage: React.FC<{
  profile: Profile;
  group: Group;
  onBack: () => void;
  onSignOut: () => void;
  onLeaveGroup: () => void;
  onGoTopTraders: () => void;
}> = ({ profile, group, onBack, onSignOut, onLeaveGroup, onGoTopTraders }) => {
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [groupActionLoading, setGroupActionLoading] = useState(false);

  const isAdmin = group.admin_id === profile.id;

  useEffect(() => {
    const load = async () => {
      const [{ count: w }, { count: l }, mc] = await Promise.all([
        supabase.from('archived_levels').select('*', { count: 'exact', head: true })
          .eq('creator_id', profile.id).eq('outcome', 'tapped').eq('group_id', group.id),
        supabase.from('archived_levels').select('*', { count: 'exact', head: true })
          .eq('creator_id', profile.id).eq('outcome', 'failed').eq('group_id', group.id),
        fetchMemberCount(group.id),
      ]);
      setWins(w || 0);
      setLosses(l || 0);
      setMemberCount(mc);
    };
    void load();
  }, [profile.id, group.id]);

  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('Invite code copied!', 'success');
    } catch {
      toast('Could not copy — invite code: ' + group.invite_code, 'info');
    }
  };

  const copyInviteMessage = async () => {
    const message = `Join my trading group on Consensus!\n\n🔗 https://aaa-iota-six.vercel.app/\n📝 Invite Code: ${group.invite_code}`;
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
      toast('Invite message copied!', 'success');
    } catch {
      toast('Could not copy message', 'error');
    }
  };

  const handleSignOut = async () => {
    localStorage.setItem('consensus_group_id', group.id);
    await supabase.auth.signOut();
    onSignOut();
  };

  const handleLeaveGroup = async () => {
    const confirmed = window.confirm(
      isAdmin
        ? 'Delete this group permanently? This will remove all group data for every member.'
        : 'Leave this group?'
    );
    if (!confirmed) return;

    setGroupActionLoading(true);

    try {
      if (isAdmin) {
        const { error: deleteGroupError } = await supabase
          .from('groups')
          .delete()
          .eq('id', group.id)
          .eq('admin_id', profile.id);

        if (deleteGroupError) {
          toast('Failed to delete group: ' + deleteGroupError.message, 'error');
          return;
        }

        const { error: clearProfileError } = await supabase
          .from('profiles')
          .update({ group_id: null, is_admin: false })
          .eq('id', profile.id);

        if (clearProfileError) {
          toast('Group deleted, but failed to clear your profile: ' + clearProfileError.message, 'error');
          return;
        }

        localStorage.removeItem('consensus_group_id');
        toast('Group deleted successfully', 'success');
        onLeaveGroup();
        return;
      }

      const { error: removeMemberError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', profile.id);

      if (removeMemberError) {
        toast('Failed to leave group: ' + removeMemberError.message, 'error');
        return;
      }

      const { error: clearProfileError } = await supabase
        .from('profiles')
        .update({ group_id: null, is_admin: false })
        .eq('id', profile.id);

      if (clearProfileError) {
        toast('Left group, but failed to update your profile: ' + clearProfileError.message, 'error');
        return;
      }

      localStorage.removeItem('consensus_group_id');
      toast('You left the group', 'success');
      onLeaveGroup();
    } finally {
      setGroupActionLoading(false);
    }
  };

  const stats = [
    { label: 'Wins', value: wins, color: 'text-emerald-400' },
    { label: 'Losses', value: losses, color: 'text-rose-400' },
    { label: 'Win %', value: `${winRate}%`, color: winRate >= 50 ? 'text-emerald-400' : 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pb-8">
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/60 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <button onClick={onBack} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <IconChevronLeft />
            </button>
            <h1 className="text-base font-bold text-white tracking-tight">Profile</h1>
          </div>
          <button onClick={onGoTopTraders}
            className="px-3 py-2 rounded-lg bg-amber-800/60 hover:bg-amber-700/60 text-amber-200 text-xs font-semibold transition-colors flex items-center gap-1.5">
            <IconTrophy /> Top Traders
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-3 space-y-3">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-600/20">
              {profile.username[0].toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">{profile.username}</div>
              <div className={cn('text-[10px] font-semibold px-2 py-0.5 rounded mt-1 inline-block tracking-wider uppercase', isAdmin ? 'bg-amber-900/40 text-amber-400' : 'bg-gray-800 text-gray-500')}>
                {isAdmin ? '⭐ Admin' : 'Member'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {stats.map(({ label, value, color }) => (
              <div key={label} className="bg-gray-950 rounded-lg p-2.5 text-center border border-gray-800/40">
                <div className={cn('text-xl font-bold tabular-nums font-mono', color)}>{value}</div>
                <div className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wider font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 className={cn(labelClass, 'mb-3')}>Group</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Name</span>
              <span className="text-white font-medium text-xs">{group.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Members</span>
              <span className="text-white font-medium text-xs font-mono">{memberCount} / 50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Invite Code</span>
              <button onClick={copyCode}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-mono font-bold text-xs transition-colors">
                {group.invite_code}
                {copied ? <span className="text-emerald-400 text-[10px]">✓</span> : <IconCopy />}
              </button>
            </div>
          </div>

          <button onClick={copyInviteMessage}
            className="w-full mt-3 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs">
            <IconShare />
            {copiedMessage ? 'Copied!' : 'Share Invite'}
          </button>
        </div>

        <button onClick={handleLeaveGroup} disabled={groupActionLoading}
          className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-800 text-amber-400 hover:text-amber-300 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
          {groupActionLoading ? <Spinner size="sm" /> : '🚪'} {isAdmin ? 'Delete Group' : 'Leave Group'}
        </button>

        <button onClick={handleSignOut}
          className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-rose-400 hover:text-rose-300 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
          <IconLogout /> Sign Out
        </button>
      </div>
    </div>
  );
};

/* ROOT APP */

type Page = 'leaderboard' | 'previous' | 'profile' | 'toptraders';

const App: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [page, setPage] = useState<Page>('leaderboard');
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (p) {
          setProfile(p);
          if (p.group_id) {
            const { data: g } = await supabase.from('groups').select('*').eq('id', p.group_id).single();
            if (g) setGroup(g);
          } else {
            const savedGroupId = localStorage.getItem('consensus_group_id');
            if (savedGroupId) {
              const { data: membership } = await supabase
                .from('group_members').select('group_id')
                .eq('user_id', p.id).eq('group_id', savedGroupId).maybeSingle();
              if (membership) {
                const { data: g } = await supabase.from('groups').select('*').eq('id', savedGroupId).single();
                if (g) {
                  await supabase.from('profiles').update({ group_id: savedGroupId }).eq('id', p.id);
                  setProfile({ ...p, group_id: savedGroupId });
                  setGroup(g);
                } else {
                  localStorage.removeItem('consensus_group_id');
                }
              } else {
                localStorage.removeItem('consensus_group_id');
              }
            }
          }
        }
      }
      setBooting(false);
    };
    void init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setGroup(null);
        setPage('leaderboard');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (booting) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
        <IconChart />
      </div>
      <Spinner size="lg" />
    </div>
  );

  if (!profile) return (
    <>
      <AuthScreen onAuth={async (p) => {
        setProfile(p);
        if (p.group_id) {
          const { data: g } = await supabase.from('groups').select('*').eq('id', p.group_id).single();
          if (g) setGroup(g);
        } else {
          const savedGroupId = localStorage.getItem('consensus_group_id');
          if (savedGroupId) {
            const { data: membership } = await supabase
              .from('group_members').select('group_id')
              .eq('user_id', p.id).eq('group_id', savedGroupId).maybeSingle();
            if (membership) {
              const { data: g } = await supabase.from('groups').select('*').eq('id', savedGroupId).single();
              if (g) {
                await supabase.from('profiles').update({ group_id: savedGroupId }).eq('id', p.id);
                setProfile({ ...p, group_id: savedGroupId });
                setGroup(g);
              } else {
                localStorage.removeItem('consensus_group_id');
              }
            } else {
              localStorage.removeItem('consensus_group_id');
            }
          }
        }
      }} />
      <ToastContainer />
    </>
  );

  if (!group) return (
    <>
      <GroupScreen profile={profile} onJoin={(p, g) => { setProfile(p); setGroup(g); }} />
      <ToastContainer />
    </>
  );

  return (
    <>
      {page === 'leaderboard' && <LeaderboardPage profile={profile} group={group} onNavigate={setPage} />}
      {page === 'previous' && (
        <PreviousPage
          profile={profile}
          group={group}
          onBack={() => setPage('leaderboard')}
          onGoTopTraders={() => setPage('toptraders')}
        />
      )}
      {page === 'toptraders' && (
        <TopTradersPage
          group={group}
          onBack={() => setPage('leaderboard')}
        />
      )}
      {page === 'profile' && (
        <ProfilePage profile={profile} group={group}
          onBack={() => setPage('leaderboard')}
          onGoTopTraders={() => setPage('toptraders')}
          onSignOut={() => { setProfile(null); setGroup(null); }}
          onLeaveGroup={() => {
            setGroup(null);
            setProfile(prev => prev ? { ...prev, group_id: null } : null);
            setPage('leaderboard');
          }}
        />
      )}
      <ToastContainer />
    </>
  );
};

export default App;
