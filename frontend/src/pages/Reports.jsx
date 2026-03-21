import React, { useEffect, useState } from 'react';
import { sessionAPI, reportAPI } from '../services/api';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Badge }   from '../components/ui/badge';
import { Button }  from '../components/ui/button';
import { Download } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
};

export const Reports = () => {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      // Reports = completed sessions
      const res = await sessionAPI.getMySessions();
      const completed = (res.data.sessions || []).filter(
        (s) => s.status === "completed"
      );
      setSessions(completed);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (sessionId, batchId) => {
    setDownloading(sessionId);
    try {
      const res  = await reportAPI.downloadReport(sessionId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `Challan_${batchId || sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download challan:", err);
    } finally {
      setDownloading(null);
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
      <h1 className="text-2xl font-bold tracking-tight">Generated Challans</h1>
      <p className="text-sm text-muted-foreground">
        Challans are available for all completed sessions.
      </p>

      <div className="border rounded-lg bg-card overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center space-y-3">
            <span className="text-4xl">📄</span>
            <h3 className="text-lg font-medium">No challans available</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Challans are generated when a session is completed.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead className="text-right">Final Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-mono text-sm">
                    {s.batchId || s._id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{formatDate(s.endedAt)}</TableCell>
                  <TableCell>
                    {s.operatorId?.name || s.operatorId?.email || "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {s.finalBoxCount ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">completed</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="default"
                      size="sm"
                      disabled={downloading === s._id}
                      onClick={() => handleDownload(s._id, s.batchId)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloading === s._id ? "Generating..." : "PDF"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};