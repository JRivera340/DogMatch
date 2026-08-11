import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Inicio } from './pages/Inicio';
import { Reportar } from './pages/Reportar';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="reportar" element={<Reportar />} />
      </Route>
    </Routes>
  );
}
