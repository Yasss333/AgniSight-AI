import React, { useEffect, useState } from 'react';
import { reportAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Download, Sparkles } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await reportAPI.getReports();
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const res = await reportAPI.downloadReport(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `Challan_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download report', err);
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

      <div className="border rounded-lg bg-card overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-foreground">No challans available</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Challans are automatically generated when a tracking session is completed.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead className="text-right">Final Count</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">
                    {r.batchId || r.id.slice(0, 8)}
                    {r.hasAiSummary && (
                      <Badge variant="secondary" className="ml-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                        <Sparkles className="h-3 w-3 mr-1" /> AI Summary
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(r.createdAt)}</TableCell>
                  <TableCell>{r.operatorName || 'System'}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{r.finalCount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="default" size="sm" onClick={() => handleDownload(r.id, r.filename)}>
                      <Download className="w-4 h-4 mr-2" /> PDF
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
