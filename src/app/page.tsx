"use client";

import { useState } from 'react';
import { FileUp, BookOpenText, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { ThemeToggle } from '@/components/theme-toggle';

const PdfViewer = dynamic(() => import('@/components/pdf-viewer'), {
  ssr: false,
  loading: () => <PdfViewerLoading />,
});

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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
          title: "Invalid File",
          description: "Please select a PDF file.",
          variant: "destructive"
      });
      setFile(null);
    }
  };
  
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
    } else {
        toast({
            title: "Invalid File",
            description: "Please drop a PDF file.",
            variant: "destructive"
        });
        setFile(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  const handleUrlLoad = async () => {
    if (!url) {
        toast({
            title: "Invalid URL",
            description: "Please enter a URL.",
            variant: "destructive"
        });
        return;
    }
    setIsLoadingFromUrl(true);
    try {
        // Basic URL validation
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
            throw new Error('The URL does not point to a PDF file.');
        }

        const blob = await response.blob();
        const fileName = url.substring(url.lastIndexOf('/') + 1) || 'document.pdf';
        const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
        setFile(pdfFile);
    } catch (error: any) {
        toast({
            title: "Failed to load PDF from URL",
            description: error.message || "Please check the URL and try again.",
            variant: "destructive"
        });
    } finally {
        setIsLoadingFromUrl(false);
    }
  };

  if (file) {
    return <PdfViewer file={file} onBack={() => setFile(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background font-body transition-colors duration-300">
        <main className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div 
                className="w-full max-w-2xl text-center"
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <Card className={`shadow-2xl border-2 ${isDragging ? 'border-primary' : 'border-transparent'} transition-all duration-300`}>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex justify-center items-center mb-4">
                    <BookOpenText className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl sm:text-4xl">Tandai PDF</CardTitle>
                    <CardDescription className="text-muted-foreground pt-2 text-sm sm:text-base">
                    Your personal PDF reader with smart bookmarking.
                    <br/>
                    Pick up right where you left off, every time.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 p-4 sm:p-8">
                    <div className="w-full space-y-2">
                        <div className="flex items-center gap-2">
                            <Link className="w-5 h-5 text-muted-foreground" />
                            <p className="font-semibold text-foreground text-sm sm:text-base">Load from Web Address</p>
                        </div>
                        <div className="flex gap-2">
                            <Input 
                                type="url" 
                                placeholder="https://example.com/document.pdf"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
                                disabled={isLoadingFromUrl}
                            />
                            <Button onClick={handleUrlLoad} disabled={isLoadingFromUrl}>
                                {isLoadingFromUrl ? 'Loading...' : 'Load'}
                            </Button>
                        </div>
                    </div>

                    <div className="w-full flex items-center gap-2">
                        <div className="flex-1 border-t border-border"></div>
                        <p className="text-muted-foreground text-xs sm:text-sm">OR</p>
                        <div className="flex-1 border-t border-border"></div>
                    </div>

                    <div className={`flex flex-col items-center justify-center w-full p-6 sm:p-8 border-2 border-dashed rounded-lg ${isDragging ? 'border-primary bg-primary/10' : 'border-border bg-card'} transition-colors duration-300`}>
                        <FileUp className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mb-4" />
                        <p className="font-semibold text-foreground text-sm sm:text-base">Drag & drop your PDF here</p>
                    </div>
                    <Button size="lg" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                        Select PDF From Device
                    </label>
                    </Button>
                    <input
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    />
                </CardContent>
                </Card>
            </div>
        </main>
        <footer className="w-full p-4 text-center">
            <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Tandai PDF. Dibuat dengan ❤️ oleh Studio Firebase.
            </p>
        </footer>
    </div>
  );
}