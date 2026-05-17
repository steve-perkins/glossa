import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LessonsPage } from './routes/LessonsPage';
import { LessonPage } from './routes/LessonPage';
import { PracticePage } from './routes/PracticePage';
import { StoriesPage } from './routes/StoriesPage';
import { ConversationPage } from './routes/ConversationPage';
import { useAuth } from './context/AuthContext';
import { useTweaks, applyTweaksToDOM } from './hooks/useTweaks';
import type { Theme, Accent, Density, Tweaks } from './hooks/useTweaks';
import { apiFetch } from './api/client';

export default function App() {
  const [langId, setLangId] = useState('greek');
  const { tweaks, setTweaks } = useTweaks();
  const { user, accessToken } = useAuth();

  // When the user logs in, apply their server prefs without triggering a server sync
  useEffect(() => {
    if (!user?.prefs) return;
    const { theme, accent, density } = user.prefs;
    const next: Partial<Tweaks> = {};
    if (theme) next.theme = theme as Theme;
    if (accent) next.accent = accent as Accent;
    if (density) next.density = density as Density;
    if (Object.keys(next).length) {
      setTweaks(next);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wrap setTweaks so changes are also synced to the server when logged in
  function handleSetTweaks(patch: Partial<Tweaks>) {
    setTweaks(patch);
    if (accessToken) {
      const next = { ...tweaks, ...patch };
      apiFetch('/me/prefs', { method: 'PUT', body: next, token: accessToken }).catch(() => {});
    }
    applyTweaksToDOM({ ...tweaks, ...patch });
  }

  return (
    <>
      <Navbar langId={langId} onLangChange={setLangId} tweaks={tweaks} setTweaks={handleSetTweaks} />
      <Routes>
        <Route path="/" element={<LessonsPage langId={langId} />} />
        <Route path="/lesson/:lessonId" element={<LessonPage langId={langId} />} />
        <Route path="/practice" element={<PracticePage langId={langId} />} />
        <Route path="/stories" element={<StoriesPage langId={langId} />} />
        <Route path="/conversation" element={<ConversationPage langId={langId} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="g-foot">
        <span>Glossa · learn languages slowly, on purpose</span>
        <span className="g-foot-links">
          <a href="#">About</a>
        </span>
      </footer>
    </>
  );
}
