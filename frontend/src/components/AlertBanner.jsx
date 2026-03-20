import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { X, AlertTriangle, Clock } from 'lucide-react';
import { Button } from './ui/button';

export const AlertBanner = ({ alerts, onDismiss }) => {
  useEffect(() => {
    if (alerts.length > 0) {
      const ms = parseInt(import.meta.env.VITE_ALERT_DISMISS_MS || '8000', 10);
      const timer = setTimeout(() => {
        onDismiss(alerts[0].id);
      }, ms);
      return () => clearTimeout(timer);
    }
  }, [alerts, onDismiss]);

  if (!alerts || alerts.length === 0) return null;

  // Show only the most recent/first alert in the queue
  const currentAlert = alerts[0];
  const isDrop = currentAlert.type === 'drop';

  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 animate-in slide-in-from-top-4 duration-300">
      <div className="w-full max-w-xl shadow-2xl">
        <Alert variant="destructive" className="bg-destructive text-destructive-foreground border-none">
          {isDrop ? (
            <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
          ) : (
            <Clock className="h-5 w-5 text-destructive-foreground" />
          )}
          <div className="flex justify-between items-start ml-2">
            <div>
              <AlertTitle className="text-lg font-bold">
                {isDrop ? 'Sudden Drop Detected!' : 'No Activity Alert'}
              </AlertTitle>
              <AlertDescription className="text-sm opacity-90">
                {isDrop 
                  ? `Count dropped by ${currentAlert.delta || 3} or more boxes in a single frame.` 
                  : 'No changes detected for the configured timeout limit.'}
              </AlertDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive-foreground hover:bg-black/20" 
              onClick={() => onDismiss(currentAlert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  );
};
