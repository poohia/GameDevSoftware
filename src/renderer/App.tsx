import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { DefaultPage, HomePage, TranslationPage } from './pages';
import useApp from './pages/useApp';

export default function App() {
  const { path } = useApp();

  if (path === undefined) {
    return <div>Loading....</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={path ? <HomePage /> : <DefaultPage />} />
        <Route path="/module/translate" element={<TranslationPage />} />
      </Routes>
    </Router>
  );
}
