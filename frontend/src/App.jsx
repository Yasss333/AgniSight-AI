import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppSidebar } from './components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
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
                <SidebarProvider>
                  <div className="flex min-h-screen w-full bg-background text-foreground font-sans antialiased">
                    <AppSidebar />
                    <SidebarInset className="flex min-h-screen flex-1 flex-col">
                      <header className="flex h-12 items-center gap-2 border-b border-border bg-card px-4 md:hidden">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-primary text-xs font-bold text-primary-foreground">
                            AS
                          </div>
                          <span className="text-sm font-semibold">AgniSight</span>
                        </div>
                      </header>
                      <main className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">
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
                    </SidebarInset>
                  </div>
                </SidebarProvider>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
