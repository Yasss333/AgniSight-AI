import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';

export const SessionControls = ({ onStart, onStop, isRunning }) => {
  const [conf, setConf] = useState([0.25]);
  const [iou, setIou] = useState([0.30]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStart = () => {
    if (!file) return;
    onStart({ conf: conf[0], iou: iou[0], file });
    setIsDialogOpen(false);
  };

  return (
    <div className="flex items-center justify-between w-full h-full px-6">
      <div className="flex items-center gap-6 w-1/2">
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-muted-foreground uppercase font-semibold">
              Confidence Threshold
              <span className="text-[10px] text-orange-500 ml-1">(Lower = More Detections)</span>
            </Label>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{conf[0].toFixed(2)}</span>
          </div>
          <Slider 
            value={conf} 
            min={0.1} 
            max={0.9} 
            step={0.05} 
            onValueChange={setConf} 
            disabled={isRunning}
            className="w-full"
          />
          <p className="text-[10px] text-gray-400">Optimized: 0.25 for box detection</p>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-muted-foreground uppercase font-semibold">
              IOU Threshold
              <span className="text-[10px] text-orange-500 ml-1">(Lower = Better NMS)</span>
            </Label>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{iou[0].toFixed(2)}</span>
          </div>
          <Slider 
            value={iou} 
            min={0.1} 
            max={0.9} 
            step={0.05} 
            onValueChange={setIou} 
            disabled={isRunning}
            className="w-full"
          />
          <p className="text-[10px] text-gray-400">Optimized: 0.30 for accuracy</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isRunning ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-32 bg-green-600 hover:bg-green-700">
                📹 Start
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Tracking Session</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="video">Select Video Source</Label>
                  <Input 
                    id="video" 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*" 
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  {file && (
                    <p className="text-xs text-green-600">✓ {file.name}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleStart} disabled={!file} className="bg-green-600 hover:bg-green-700">
                  Upload & Start
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg" className="w-32 animate-pulse">
                ⏹ Stop
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stop Session?</DialogTitle>
              </DialogHeader>
              <p className="py-4 text-sm text-muted-foreground">
                Are you sure you want to stop this tracking session? The AI process will be stopped immediately.
              </p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={onStop}>Confirm Stop</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
