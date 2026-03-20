import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { sessionAPI, exportAPI } from '../services/api';
import { formatDate, formatDuration } from '../utils/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await sessionAPI.getSessions();
      setSessions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id, format) => {
    try {
      const apiCall = format === 'csv' ? exportAPI.exportCSV : exportAPI.exportExcel;
      const res = await apiCall(id);
      
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session_${id}_export.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(`Failed to export ${format}`, err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Sessions History</h1>
      
      <div className="border rounded-lg bg-card overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-foreground">No sessions recorded yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Start a new session from the dashboard to see your tracking history here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Final Count</TableHead>
                <TableHead>Status</TableHead>
                {user?.role === 'manager' && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.batchId || s.id.slice(0, 8)}</TableCell>
                  <TableCell>{s.operatorName || 'System'}</TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  <TableCell>{formatDuration(s.duration)}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-lg">{s.finalCount}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'completed' ? 'default' : 'secondary'}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  {user?.role === 'manager' && (
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleExport(s.id, 'csv')} title="Export CSV">
                        <Download className="w-4 h-4 mr-1" /> CSV
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExport(s.id, 'excel')} title="Export Excel">
                        <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
