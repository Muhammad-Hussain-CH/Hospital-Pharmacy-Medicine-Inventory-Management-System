import Sidebar from './Sidebar';
import Header from './Header';
import Toast from './Toast';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <div
      className="min-h-screen"
      style={{ background: isDark ? '#0F0D1A' : '#F5F3FF' }}
    >
      <Sidebar />
      <Header />
      <main
        className="ml-[260px] pt-16 min-h-screen"
        style={{ background: isDark ? '#0F0D1A' : '#F5F3FF' }}
      >
        <div className="p-6">{children}</div>
      </main>
      <Toast />
    </div>
  );
}
