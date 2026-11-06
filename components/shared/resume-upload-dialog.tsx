'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type UploadState = 'waiting' | 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';

interface UploadFile {
  id: string;
  file: File;
  state: UploadState;
  progress: number;
  error?: string;
}

const stateMeta: Record<UploadState, { label: string; icon: React.ElementType; className: string }> = {
  waiting: { label: 'Waiting', icon: Clock, className: 'text-muted-foreground' },
  uploading: { label: 'Uploading', icon: Loader2, className: 'text-primary' },
  uploaded: { label: 'Uploaded', icon: CheckCircle2, className: 'text-primary' },
  processing: { label: 'Processing', icon: Loader2, className: 'text-primary' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'text-success' },
  failed: { label: 'Failed', icon: AlertCircle, className: 'text-destructive' },
};

let fileCounter = 0;

export function ResumeUploadDialog({
  children,
  onUploaded,
}: {
  children: React.ReactNode;
  onUploaded?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFiles([]);
    setDragging(false);
  }, []);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    setFiles((prev) => {
      const existing = new Map(prev.map((f) => [`${f.file.name}-${f.file.size}`, f.id]));
      const next: UploadFile[] = [];
      for (const file of arr) {
        const key = `${file.name}-${file.size}`;
        if (existing.has(key)) {
          toast.warning(`Duplicate skipped: ${file.name}`);
          continue;
        }
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          next.push({
            id: `f${++fileCounter}`,
            file,
            state: 'failed',
            progress: 0,
            error: 'Only PDF files are supported.',
          });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          next.push({
            id: `f${++fileCounter}`,
            file,
            state: 'failed',
            progress: 0,
            error: 'File exceeds 10 MB limit.',
          });
          continue;
        }
        existing.set(key, `f${fileCounter + 1}`);
        next.push({ id: `f${++fileCounter}`, file, state: 'waiting', progress: 0 });
      }
      return [...prev, ...next];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const processFile = useCallback((uf: UploadFile, allFiles: UploadFile[]) => {
    const update = (id: string, patch: Partial<UploadFile>) => {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    };

    update(uf.id, { state: 'uploading', progress: 0 });
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        clearInterval(uploadInterval);
        update(uf.id, { state: 'uploaded', progress: 100 });

        setTimeout(() => update(uf.id, { state: 'processing' }), 400);

        setTimeout(() => {
          // Simulate occasional failure
          const willFail = uf.file.name.toLowerCase().includes('corrupt');
          if (willFail) {
            update(uf.id, { state: 'failed', error: 'The PDF could not be parsed.' });
          } else {
            update(uf.id, { state: 'completed' });
          }
          const done = allFiles.filter(
            (f) => f.id !== uf.id && (f.state === 'completed' || f.state === 'failed'),
          ).length;
          if (done + 1 === allFiles.length) {
            setTimeout(() => {
              toast.success('Upload complete', {
                description: `${allFiles.length} resume${allFiles.length > 1 ? 's' : ''} processed.`,
              });
              onUploaded?.();
            }, 600);
          }
        }, 1600);
      } else {
        update(uf.id, { progress: Math.min(progress, 100) });
      }
    }, 350);
  }, [onUploaded]);

  const startUpload = useCallback(() => {
    const waiting = files.filter((f) => f.state === 'waiting');
    if (waiting.length === 0) return;
    // snapshot for completion check
    const snapshot = [...files];
    waiting.forEach((uf) => processFile(uf, snapshot));
  }, [files, processFile]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const completedCount = files.filter((f) => f.state === 'completed').length;
  const failedCount = files.filter((f) => f.state === 'failed').length;
  const activeCount = files.filter((f) =>
    ['waiting', 'uploading', 'uploaded', 'processing'].includes(f.state),
  ).length;
  const allDone = files.length > 0 && activeCount === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload resumes</DialogTitle>
          <DialogDescription>
            Drag and drop multiple PDF resumes. Files are processed individually so you can track
            each one's status.
          </DialogDescription>
        </DialogHeader>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40',
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium">Drag and drop PDF resumes here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse — you can add more files at any time
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="max-h-72 space-y-2 overflow-y-auto scrollbar-thin pr-1">
            {files.map((uf) => {
              const meta = stateMeta[uf.state];
              const Icon = meta.icon;
              return (
                <div
                  key={uf.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{uf.file.name}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatFileSize(uf.file.size)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={cn('flex items-center gap-1 text-xs font-medium', meta.className)}>
                        <Icon className={cn('h-3.5 w-3.5', uf.state === 'uploading' && 'animate-spin', uf.state === 'processing' && 'animate-spin')} />
                        {meta.label}
                      </span>
                      {uf.error && (
                        <span className="text-xs text-destructive">{uf.error}</span>
                      )}
                      {(uf.state === 'uploading') && (
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${uf.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {(uf.state === 'waiting' || uf.state === 'failed') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(uf.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {files.length > 0
              ? `${completedCount} completed · ${failedCount} failed · ${activeCount} in progress`
              : 'PDF only, up to 10 MB per file.'}
          </p>
          <div className="flex gap-2">
            {allDone ? (
              <>
                <Button variant="outline" onClick={() => reset()}>
                  Upload more
                </Button>
                <Button
                  onClick={() => {
                    setOpen(false);
                    reset();
                    onUploaded?.();
                    router.push('/candidates');
                  }}
                >
                  View candidates
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => reset()} disabled={files.length === 0}>
                  Clear all
                </Button>
                <Button
                  onClick={startUpload}
                  disabled={files.filter((f) => f.state === 'waiting').length === 0}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload {files.filter((f) => f.state === 'waiting').length > 0 && `(${files.filter((f) => f.state === 'waiting').length})`}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { UploadState };
