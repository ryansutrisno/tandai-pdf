"use client";

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Bookmark,
  BookMarked,
  ArrowLeft,
  Expand,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from './ui/skeleton';

// Set up worker to avoid issues with bundlers
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  file: File;
  onBack: () => void;
}

interface DocInfo {
  page: number;
  scrollTop: number;
  bookmarks: number[];
  zoom: number;
}

const PdfViewerLoading = () => (
    <div className="flex flex-col h-screen w-screen bg-background">
        <header className="flex items-center justify-between p-2 border-b bg-card shadow-sm z-10">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-10" />
        </header>
        <main className="flex-1 overflow-hidden p-4 flex justify-center">
            <Skeleton className="h-full w-full max-w-4xl" />
        </main>
        <footer className="p-2 border-t bg-card shadow-sm z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
        </footer>
    </div>
)


export default function PdfViewer({ file, onBack }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const { toast } = useToast();
  const viewerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const storageKey = `tandai-pdf-${file.name}`;

  // Load state from localStorage
  useEffect(() => {
    if(!isClient) return;
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const { page, scrollTop, bookmarks: savedBookmarks, zoom: savedZoom } = JSON.parse(savedState) as DocInfo;
        setPageNumber(page || 1);
        setBookmarks(savedBookmarks || []);
        setZoom(savedZoom || 1);
        setTimeout(() => {
          if (viewerRef.current) {
            viewerRef.current.scrollTop = scrollTop || 0;
          }
        }, 500);
      }
    } catch (error) {
      console.error("Failed to load reading state", error);
      toast({
        title: "Error",
        description: "Could not load your saved reading position.",
        variant: "destructive",
      });
    }
  }, [file, storageKey, toast, isClient]);

  // Save state to localStorage
  useEffect(() => {
    if(!isClient || isLoading) return;
    
    const saveState = () => {
      try {
        const state: DocInfo = {
          page: pageNumber,
          scrollTop: viewerRef.current?.scrollTop || 0,
          bookmarks,
          zoom
        };
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save reading state", error);
      }
    };
    
    const handler = setTimeout(saveState, 500);
    return () => clearTimeout(handler);
  }, [pageNumber, bookmarks, zoom, storageKey, isClient, isLoading]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value, 10);
    if (!isNaN(newPage) && newPage > 0 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
    }
  };

  const toggleBookmark = () => {
    setBookmarks(prev => {
      const newBookmarks = prev.includes(pageNumber)
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber];
      
      toast({
        title: prev.includes(pageNumber) ? "Bookmark removed" : "Bookmark added",
        description: `Page ${pageNumber} is no longer bookmarked.`,
      });

      return newBookmarks.sort((a, b) => a - b);
    });
  };

  const handleFullScreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }
  
  const isBookmarked = bookmarks.includes(pageNumber);

  if (!isClient) {
    return <PdfViewerLoading />;
  }

  return (
    <div ref={containerRef} className="flex flex-col h-screen w-screen bg-background text-foreground font-body">
      <header className="flex items-center justify-between p-2 border-b bg-card shadow-sm z-10 flex-shrink-0">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft /></Button>
                </TooltipTrigger>
                <TooltipContent><p>Back to file selection</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <h1 className="font-headline text-lg truncate mx-4 flex-1 text-center">{file.name}</h1>
        <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleFullScreen}><Expand /></Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Toggle Fullscreen</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
      </header>

      <main ref={viewerRef} className="flex-1 overflow-auto p-4">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => toast({ title: "Error loading PDF", description: error.message, variant: "destructive" })}
          className="flex justify-center"
          loading={<div className="flex flex-col items-center justify-center h-full gap-4 text-lg"><Loader2 className="animate-spin h-8 w-8" />Loading document...</div>}
        >
          {!isLoading && <Page 
            pageNumber={pageNumber} 
            scale={zoom}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={<Skeleton className="h-[842px] w-[595px]" />}
           />}
        </Document>
      </main>

      <footer className="p-2 border-t bg-card shadow-sm z-10 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}><ZoomOut /></Button></TooltipTrigger>
                    <TooltipContent><p>Zoom Out</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" className="w-20">{(zoom * 100).toFixed(0)}%</Button></TooltipTrigger>
                    <TooltipContent><p>Reset Zoom</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(5, z + 0.25))}><ZoomIn /></Button></TooltipTrigger>
                    <TooltipContent><p>Zoom In</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}><ChevronLeft /></Button></TooltipTrigger>
                    <TooltipContent><p>Previous Page</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-1 text-sm">
                <Input type="number" value={pageNumber} onChange={handlePageInputChange} className="w-16 h-9 text-center" />
                <span>of {numPages || '...'}</span>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages}><ChevronRight /></Button></TooltipTrigger>
                    <TooltipContent><p>Next Page</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={toggleBookmark} className={isBookmarked ? "text-accent" : ""}><BookMarked className={`transition-all duration-300 ${isBookmarked ? 'fill-accent' : ''}`} /></Button></TooltipTrigger>
                    <TooltipContent><p>{isBookmarked ? 'Remove Bookmark' : 'Bookmark Page'}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {bookmarks.length > 0 && (
                <Popover>
                    <PopoverTrigger asChild><Button variant="outline">Bookmarks ({bookmarks.length})</Button></PopoverTrigger>
                    <PopoverContent className="w-60" align="end">
                        <div className="grid gap-4">
                            <h4 className="font-medium leading-none">Bookmarked Pages</h4>
                            <ScrollArea className="h-40">
                                <div className="grid gap-1">
                                    {bookmarks.map(p => (
                                        <Button key={p} variant="ghost" className="justify-start" onClick={() => setPageNumber(p)}>Page {p}</Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </PopoverContent>
                </Popover>
            )}
          </div>

        </div>
      </footer>
    </div>
  );
}
