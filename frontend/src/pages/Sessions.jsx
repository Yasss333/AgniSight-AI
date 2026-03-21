import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { sessionAPI, exportAPI } from '../services/api';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Badge }  from '../components/ui/badge';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
};

const formatDuration = (startedAt, endedAt) => {
  if (!startedAt || !endedAt) return "—";
  const diff = Math.floor((new Date(endedAt) - new Date(startedAt)) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}m ${s}s`;
};

export const Sessions = () => {
  const { user }     = useAuth();
  const [sessions,   setSessions]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      // Managers see all, operators see their own
      const res = user?.role === "manager"
        ? await sessionAPI.getAllSessions()
        : await sessionAPI.getMySessions();
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id, format) => {
    try {
      const res = format === "csv"
        ? await exportAPI.exportCSV(id)
        : await exportAPI.exportExcel(id);

      const ext  = format === "csv" ? "csv" : "xlsx";
      const mime = format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([res.data], { type: mime });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `session_${id}_logs.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
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
          <div className="p-12 text-center flex flex-col items-center space-y-3">
            <span className="text-4xl">📦</span>
            <h3 className="text-lg font-medium">No sessions recorded yet</h3>
            <p className="text-sm text-muted-foreground">
              Start a new session from the dashboard to see history here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Final Count</TableHead>
                <TableHead>Status</TableHead>
                {user?.role === "manager" && (
                  <TableHead className="text-right">Export</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                // ✅ Fixed — using _id not id
                <TableRow key={s._id}>
                  <TableCell className="font-mono text-sm">
                    {s.batchId || s._id.slice(0, 8)}
                  </TableCell>
                  {/* ✅ Fixed — operatorId is populated object */}
                  <TableCell>
                    {s.operatorId?.name || s.operatorId?.email || "—"}
                  </TableCell>
                  <TableCell>{formatDate(s.startedAt)}</TableCell>
                  {/* ✅ Fixed — duration calculated from startedAt + endedAt */}
                  <TableCell>{formatDuration(s.startedAt, s.endedAt)}</TableCell>
                  {/* ✅ Fixed — finalBoxCount not finalCount */}
                  <TableCell className="text-right font-mono font-bold text-lg">
                    {s.finalBoxCount ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "completed" ? "default" : "secondary"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  {user?.role === "manager" && (
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => handleExport(s._id, "csv")}
                      >
                        <Download className="w-4 h-4 mr-1" /> CSV
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => handleExport(s._id, "excel")}
                      >
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