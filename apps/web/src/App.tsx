import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LessonsPage } from './routes/LessonsPage';
import { LessonPage } from './routes/LessonPage';
import { PracticePage } from './routes/PracticePage';
import { StoriesPage } from './routes/StoriesPage';
import { ConversationPage } from './routes/ConversationPage';

export default function App() {
  const [langId, setLangId] = useState('greek');

  return (
    <>
      <Navbar langId={langId} onLangChange={setLangId} />
      <Routes>
        <Route path="/" element={<LessonsPage langId={langId} />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
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
