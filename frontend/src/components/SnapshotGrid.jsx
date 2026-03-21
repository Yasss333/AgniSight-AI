import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';

// Helper — extracts filename and builds correct URL
const getSnapshotUrl = (imagePath) => {
  if (!imagePath) return '';
  const filename = imagePath.split(/[/\\]/).pop();
  return `http://localhost:5000/data/snapshots/${filename}`;
};

export const SnapshotGrid = ({ snapshots = [] }) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-card border rounded-lg h-full">
        <p className="text-muted-foreground text-sm">No snapshots available in this session.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 h-full flex flex-col">
      <h3 className="text-sm font-medium mb-3">Live Snapshots</h3>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 flex-1 overflow-auto">
        {snapshots.map((snap, index) => {
          const delta  = (snap.newCount ?? snap.new_count ?? 0) - (snap.prevCount ?? snap.prev_count ?? 0);
          const isAdd  = delta > 0;

          return (
            <div
              key={snap.timestamp || index}
              className="relative cursor-pointer group rounded-md overflow-hidden border aspect-video bg-black"
              onClick={() => setSelectedSnapshot(snap)}
            >
              <img
                src={getSnapshotUrl(snap.imagePath || snap.image_path)}
                alt={`Count changed from ${snap.prevCount ?? snap.prev_count} to ${snap.newCount ?? snap.new_count}`}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-2 right-2">
                <Badge
                  variant={isAdd ? 'default' : 'destructive'}
                  className="font-mono text-xs"
                >
                  {isAdd ? '+' : ''}{delta}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen dialog */}
      <Dialog
        open={!!selectedSnapshot}
        onOpenChange={(open) => !open && setSelectedSnapshot(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <DialogTitle className="sr-only">Snapshot Viewer</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed view of the snapshot frame.
          </DialogDescription>

          {selectedSnapshot && (
            <div className="relative w-full flex flex-col">
              <img
                src={getSnapshotUrl(selectedSnapshot.imagePath || selectedSnapshot.image_path)}
                alt="Full size snapshot"
                className="w-full max-h-[85vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white flex justify-between items-center">
                <span>
                  Count changed:{' '}
                  {selectedSnapshot.prevCount ?? selectedSnapshot.prev_count}
                  {' → '}
                  {selectedSnapshot.newCount ?? selectedSnapshot.new_count}
                </span>
                <span className="font-mono text-sm">
                  {new Date(selectedSnapshot.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};