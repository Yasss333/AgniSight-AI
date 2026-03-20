import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Sessions } from './pages/Sessions';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/sessions" element={
                        <ProtectedRoute>
                          <Sessions />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/reports" element={
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/analytics" element={
                        <ProtectedRoute requiredRole="manager">
                          <Analytics />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
