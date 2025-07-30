
"use client";

import { useState, useEffect } from 'react';
import { FileUp, BookOpenText, Link, Trash2, Library, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { ThemeToggle } from '@/components/theme-toggle';
import { db, type StoredFile } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [activeFile, setActiveFile] = useState<StoredFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
  const { toast } = useToast();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const storedFiles = useLiveQuery(() => db.files.toArray(), []);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  const addFileToDb = async (file: File) => {
    try {
      const existingFile = await db.files.where('name').equalsIgnoreCase(file.name).first();
      if (existingFile) {
        toast({
          title: "File already exists",
          description: `"${file.name}" is already in your library. Opening it instead.`,
        });
        openFile(existingFile);
        return;
      }

      const id = await db.files.add({
        name: file.name,
        file: file,
        lastOpened: new Date(),
      });
      const newFile = await db.files.get(id);
      if (newFile) {
        openFile(newFile);
      }
      toast({
        title: "File Added",
        description: `"${file.name}" has been added to your library.`,
      });
    } catch (error) {
      console.error("Failed to add file to db", error);
      toast({
        title: "Database Error",
        description: "Could not save the file to the library.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      addFileToDb(selectedFile);
    } else if (selectedFile) {
      toast({
          title: "Invalid File",
          description: "Please select a PDF file.",
          variant: "destructive"
      });
    }
  };
  
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
        addFileToDb(droppedFile);
    } else if(droppedFile) {
        toast({
            title: "Invalid File",
            description: "Please drop a PDF file.",
            variant: "destructive"
        });
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

    let finalUrl = url;
    // Handle Google Drive links
    if (url.includes('drive.google.com')) {
      const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const fileId = match[1];
        finalUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      } else {
         toast({
            title: "Invalid Google Drive URL",
            description: "The URL format is not recognized. Please use a valid share link.",
            variant: "destructive"
        });
        setIsLoadingFromUrl(false);
        return;
      }
    }


    try {
        const response = await fetch(`/api/cors-proxy?url=${encodeURIComponent(finalUrl)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
             const text = await response.text();
             console.error("Non-PDF content received:", text);
            throw new Error('The URL does not point to a PDF file. Check browser console for more details.');
        }

        const blob = await response.blob();
        let fileName = url.substring(url.lastIndexOf('/') + 1) || 'document.pdf';
        if (!fileName.toLowerCase().endsWith('.pdf')) {
            fileName += '.pdf';
        }
        const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
        addFileToDb(pdfFile);
        setUrl('');
    } catch (error: any) {
        toast({
            title: "Failed to load PDF from URL",
            description: error.message || "Please check the URL and CORS policy of the server.",
            variant: "destructive"
        });
    } finally {
        setIsLoadingFromUrl(false);
    }
  };
  
  const openFile = async (file: StoredFile) => {
    await db.files.update(file.id!, { lastOpened: new Date() });
    setActiveFile(file);
  }

  const deleteFile = async (id: number, event: React.MouseEvent) => {
      event.stopPropagation(); // prevent opening the file
      try {
        await db.files.delete(id);
        toast({
            title: "File Deleted",
            description: "The file has been removed from your library."
        })
      } catch (error) {
        toast({
            title: "Error Deleting File",
            description: "Could not remove the file.",
            variant: 'destructive'
        })
      }
  }

  if (activeFile) {
    return <PdfViewer storedFile={activeFile} onBack={() => setActiveFile(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background font-body transition-colors duration-300">
        <main 
            className="flex-1 flex flex-col items-center justify-center p-4"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-4xl">
                <Card className={`shadow-2xl border-2 ${isDragging ? 'border-primary' : 'border-transparent'} transition-all duration-300`}>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex justify-center items-center mb-4">
                        <BookOpenText className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl sm:text-4xl text-center">Tandai PDF</CardTitle>
                    <CardDescription className="text-muted-foreground pt-2 text-sm sm:text-base text-center">
                        Your personal PDF library with smart bookmarking.
                        <br/>
                        Pick up right where you left off, every time.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 p-4 sm:p-8">
                    <div className="w-full max-w-2xl space-y-4">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-muted-foreground" />
                            <p className="font-semibold text-foreground text-sm sm:text-base">Add New PDF to Library</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Link className="w-4 h-4" />
                                    <p>From Web Address</p>
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
                            <div className="space-y-2">
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileUp className="w-4 h-4" />
                                    <p>From Your Device</p>
                                </div>
                                <Button size="lg" asChild className="w-full">
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
                            </div>
                        </div>
                         <p className="text-center text-muted-foreground text-xs sm:text-sm">
                            Or drag & drop a PDF file anywhere on this page.
                        </p>
                    </div>

                    <div className="w-full border-t border-border my-4"></div>

                    <div className="w-full max-w-4xl space-y-4">
                        <div className="flex items-center gap-2">
                            <Library className="w-6 h-6 text-muted-foreground" />
                            <h2 className="font-headline text-2xl text-foreground">Your Library</h2>
                        </div>
                        {storedFiles === undefined && <p>Loading library...</p>}
                        {storedFiles && storedFiles.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>Your library is empty.</p>
                                <p>Add a PDF to get started.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                           {storedFiles?.sort((a,b) => b.lastOpened.getTime() - a.lastOpened.getTime()).map(file => (
                               <Card key={file.id} className="cursor-pointer hover:shadow-lg hover:border-primary transition-all group" onClick={() => openFile(file)}>
                                   <CardContent className="p-4 flex flex-col items-center text-center relative">
                                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => deleteFile(file.id!, e)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                       <BookOpenText className="w-16 h-16 text-primary mb-2"/>
                                       <p className="font-semibold text-sm break-all">{file.name}</p>
                                       <p className="text-xs text-muted-foreground mt-1">
                                           Last opened: {file.lastOpened.toLocaleDateString()}
                                       </p>
                                   </CardContent>
                               </Card>
                           ))}
                        </div>
                    </div>
                </CardContent>
                </Card>
            </div>
        </main>
        <footer className="w-full p-4 text-center">
            <p className="text-sm text-muted-foreground">
                {currentYear && <>© {currentYear} Tandai PDF. Made with ❤️ by <a href='https://ryansutrisno.com' target='_blank' rel='noreferrer'>Ryan Sutrisno</a>.</>}
            </p>
        </footer>
    </div>
  );
}
