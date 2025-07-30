
"use client";

import { useState, useEffect } from 'react';
import { BookOpenText, Trash2, Library, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { ThemeToggle } from '@/components/theme-toggle';
import { db, type StoredFile } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/language-context';
import { LanguageToggle } from '@/components/language-toggle';

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
  const { toast } = useToast();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const { t } = useLanguage();

  const storedFiles = useLiveQuery(() => db.files.toArray(), []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedFiles = storedFiles?.sort((a, b) => b.lastOpened.getTime() - a.lastOpened.getTime()) || [];
  const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
  const paginatedFiles = sortedFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  const addFileToDb = async (file: File) => {
    try {
      const existingFile = await db.files.where('name').equalsIgnoreCase(file.name).first();
      if (existingFile) {
        toast({
          title: t('file_exists_title'),
          description: t('file_exists_desc', { fileName: file.name }),
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
        title: t('file_added_title'),
        description: t('file_added_desc', { fileName: file.name }),
      });
    } catch (error) {
      console.error("Failed to add file to db", error);
      toast({
        title: t('db_error_title'),
        description: t('db_error_desc'),
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
          title: t('invalid_file_title'),
          description: t('invalid_file_desc_pdf_only'),
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
            title: t('invalid_file_title'),
            description: t('invalid_file_drop_desc'),
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
  
  const openFile = async (file: StoredFile) => {
    await db.files.update(file.id!, { lastOpened: new Date() });
    setActiveFile(file);
  }

  const deleteFile = async (id: number, event: React.MouseEvent) => {
      event.stopPropagation();
      try {
        await db.files.delete(id);
        toast({
            title: t('file_deleted_title'),
            description: t('file_deleted_desc')
        })
        if (paginatedFiles.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast({
            title: t('file_delete_error_title'),
            description: t('file_delete_error_desc'),
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
            <div className="absolute top-4 right-4 flex gap-2">
                <LanguageToggle />
                <ThemeToggle />
            </div>
            <div className="w-full max-w-4xl">
                <Card className={`shadow-2xl border-2 ${isDragging ? 'border-primary' : 'border-transparent'} transition-all duration-300`}>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex justify-center items-center mb-4">
                        <BookOpenText className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl sm:text-4xl text-center">{t('app_title')}</CardTitle>
                    <CardDescription className="text-muted-foreground pt-2 text-sm sm:text-base text-center">
                        {t('app_description_1')}
                        <br/>
                        {t('app_description_2')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 p-4 sm:p-8">
                    <div className="w-full max-w-md">
                        <label 
                            htmlFor="file-upload" 
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">{t('upload_click')}</span> {t('upload_drag')}</p>
                                <p className="text-xs text-muted-foreground">{t('upload_supported')}</p>
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="w-full border-t border-border my-2"></div>

                    <div className="w-full max-w-4xl space-y-4">
                        <div className="flex items-center gap-2">
                            <Library className="w-6 h-6 text-muted-foreground" />
                            <h2 className="font-headline text-2xl text-foreground">{t('library_title')}</h2>
                        </div>
                        {storedFiles === undefined && <p>{t('library_loading')}</p>}
                        {storedFiles && storedFiles.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>{t('library_empty_1')}</p>
                                <p>{t('library_empty_2')}</p>
                            </div>
                        )}
                        <div className="space-y-3">
                           {paginatedFiles.map(file => (
                               <div key={file.id} className="group flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer" onClick={() => openFile(file)}>
                                   <div className="flex items-center gap-4 min-w-0">
                                        <BookOpenText className="w-8 h-8 text-primary flex-shrink-0"/>
                                        <div className="flex-grow min-w-0">
                                           <p className="font-semibold text-sm sm:text-base truncate">{file.name}</p>
                                           <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                               {t('last_opened')}: {file.lastOpened.toLocaleDateString()}
                                           </p>
                                        </div>
                                   </div>
                                   <Button variant="destructive" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => deleteFile(file.id!, e)}>
                                       <Trash2 className="h-4 w-4" />
                                   </Button>
                               </div>
                           ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    {t('prev_page')}
                                </Button>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {t('page_of_pages', { currentPage, totalPages })}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                     {t('next_page')}
                                     <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
                </Card>
            </div>
        </main>
        <footer className="w-full p-4 text-center">
            <p className="text-sm text-muted-foreground">
                {currentYear !== null && <>© {currentYear} {t('app_title')}. {t('footer_credit')} <a href='https://ryansutrisno.com' target='_blank' rel='noreferrer'>Ryan Sutrisno</a>.</>}
            </p>
        </footer>
    </div>
  );
}

