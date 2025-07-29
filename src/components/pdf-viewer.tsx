"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';
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
  Search,
  ChevronUp,
  ChevronDown,
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
import { ThemeToggle } from '@/components/theme-toggle';

// Set up worker to avoid issues with bundlers
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

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

interface SearchResult {
  pageNumber: number;
  // We don't need detailed position info for now, just navigating is enough
}

export default function PdfViewer({ file, onBack }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const { toast } = useToast();
  const viewerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  const storageKey = `tandai-pdf-${file.name}`;

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const { page, scrollTop, bookmarks: savedBookmarks, zoom: savedZoom } = JSON.parse(savedState) as DocInfo;
        setPageNumber(page || 1);
        setBookmarks(savedBookmarks || []);
        // Don't set zoom from storage on initial load for mobile, we'll calculate it
        if (window.innerWidth >= 768) {
             setZoom(savedZoom || 1);
        }
        setTimeout(() => {
          if (viewerRef.current) {
            viewerRef.current.scrollTop = scrollTop || 0;
          }
        }, 500);
      }
    } catch (error) {
      console.error("Failed to load reading state", error);
      // We can't call toast here directly as it would be a side-effect in render
      // A separate effect could handle this, or we could just log it.
      // For now, console.error is safe.
    }
  }, [storageKey]);

  // Save state to localStorage
  useEffect(() => {
    if(isLoading) return;
    
    const saveState = () => {
      try {
        if (!viewerRef.current) return;
        const state: DocInfo = {
          page: pageNumber,
          scrollTop: viewerRef.current.scrollTop,
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
  }, [pageNumber, bookmarks, zoom, storageKey, isLoading]);

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    pdfRef.current = pdf;
    setNumPages(pdf.numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = useCallback((error: Error) => {
     toast({
        title: "Error loading PDF",
        description: error.message,
        variant: "destructive"
      });
  }, [toast]);

  const onPageLoadSuccess = (page: any) => {
      if (isInitialLoad && window.innerWidth < 768) {
          const viewerWidth = viewerRef.current?.clientWidth ?? window.innerWidth;
          // Add some padding to the calculation
          const scale = (viewerWidth / page.width) * 0.95;
          setZoom(scale);
          setIsInitialLoad(false);
      }
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
    const isCurrentlyBookmarked = bookmarks.includes(pageNumber);
    setBookmarks(prev => {
      const newBookmarks = isCurrentlyBookmarked
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber];
      return newBookmarks.sort((a, b) => a - b);
    });
    toast({
        title: isCurrentlyBookmarked ? "Bookmark removed" : "Bookmark added",
        description: `Page ${pageNumber} has ${isCurrentlyBookmarked ? 'been unbookmarked' : 'been bookmarked'}.`,
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

  const handleSearch = async () => {
      if (!searchQuery || !pdfRef.current) {
          setSearchResults([]);
          setCurrentResultIndex(-1);
          return;
      }
      setIsSearching(true);
      const results: SearchResult[] = [];
      const searchText = searchQuery.toLowerCase();

      try {
          for (let i = 1; i <= pdfRef.current.numPages; i++) {
              const page = await pdfRef.current.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => (item as TextItem).str).join(' ').toLowerCase();

              if (pageText.includes(searchText)) {
                  results.push({ pageNumber: i });
              }
          }

          setSearchResults(results);
          if (results.length > 0) {
              setCurrentResultIndex(0);
              setPageNumber(results[0].pageNumber);
          } else {
              setCurrentResultIndex(-1);
              toast({
                  title: "Not Found",
                  description: `The phrase "${searchQuery}" was not found in the document.`,
              });
          }
      } catch (error) {
          console.error("Error during search:", error);
          toast({
              title: "Search Error",
              description: "An error occurred while searching the document.",
              variant: "destructive",
          });
      } finally {
          setIsSearching(false);
      }
  };

  const goToNextResult = () => {
      if (searchResults.length === 0) return;
      const nextIndex = (currentResultIndex + 1) % searchResults.length;
      setCurrentResultIndex(nextIndex);
      setPageNumber(searchResults[nextIndex].pageNumber);
  };

  const goToPrevResult = () => {
      if (searchResults.length === 0) return;
      const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
      setCurrentResultIndex(prevIndex);
      setPageNumber(searchResults[prevIndex].pageNumber);
  };

  const textRenderer = useCallback((textItem: any) => {
    if (!searchQuery) return textItem.str;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return textItem.str.replace(regex, (match: string) => `<mark>${match}</mark>`);
  }, [searchQuery]);
  
  const isBookmarked = bookmarks.includes(pageNumber);

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
        <h1 className="font-headline text-lg truncate mx-2 sm:mx-4 flex-1 text-center">{file.name}</h1>
        <div className="flex items-center gap-1 sm:gap-2">
             <div className="relative flex items-center">
                <Input
                    type="search"
                    placeholder="Search..."
                    className="h-9 w-28 sm:w-40 md:w-64 pr-10"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if(e.target.value === '') {
                            setSearchResults([]);
                            setCurrentResultIndex(-1);
                        }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isSearching}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-0 h-9 w-10 text-muted-foreground" 
                    onClick={handleSearch}
                    disabled={isSearching}
                >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </div>
            {searchResults.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="hidden sm:inline">{currentResultIndex + 1}/{searchResults.length}</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={goToPrevResult}><ChevronUp/></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Previous Match</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={goToNextResult}><ChevronDown/></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Next Match</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
            <div className="hidden sm:flex items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleFullScreen}><Expand /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Toggle Fullscreen</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
             <ThemeToggle />
        </div>
      </header>

      <main ref={viewerRef} className="flex-1 overflow-auto p-2 sm:p-4">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="flex justify-center"
          loading={<div className="flex flex-col items-center justify-center h-full gap-4 text-lg"><Loader2 className="animate-spin h-8 w-8" />Loading document...</div>}
        >
          {!isLoading && <Page 
            pageNumber={pageNumber} 
            scale={zoom}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            customTextRenderer={textRenderer}
            loading={<Skeleton className="h-[842px] w-[595px]" />}
            onLoadSuccess={onPageLoadSuccess}
           />}
        </Document>
      </main>

      <footer className="p-2 border-t bg-card shadow-sm z-10 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-center sm:justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}><ZoomOut /></Button></TooltipTrigger>
                    <TooltipContent><p>Zoom Out</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" className="w-20" onClick={() => setZoom(1)}>{(zoom * 100).toFixed(0)}%</Button></TooltipTrigger>
                    <TooltipContent><p>Reset Zoom</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(5, z + 0.25))}><ZoomIn /></Button></TooltipTrigger>
                    <TooltipContent><p>Zoom In</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}><ChevronLeft /></Button></TooltipTrigger>
                    <TooltipContent><p>Previous Page</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-1 text-sm">
                <Input type="number" value={pageNumber} onChange={handlePageInputChange} className="w-14 h-9 text-center" />
                <span>of {numPages || '...'}</span>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages}><ChevronRight /></Button></TooltipTrigger>
                    <TooltipContent><p>Next Page</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2 order-3">
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

    