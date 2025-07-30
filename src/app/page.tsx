
"use client";

import { useState, useEffect } from 'react';
import { FileUp, BookOpenText, Trash2, Library, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
          title: "File sudah ada",
          description: `"${file.name}" sudah ada di perpustakaan. Membuka file...`,
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
        title: "File Ditambahkan",
        description: `"${file.name}" telah ditambahkan ke perpustakaan Anda.`,
      });
    } catch (error) {
      console.error("Gagal menambahkan file ke db", error);
      toast({
        title: "Error Database",
        description: "Tidak dapat menyimpan file ke perpustakaan.",
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
          title: "File Tidak Valid",
          description: "Silakan pilih file PDF.",
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
            title: "File Tidak Valid",
            description: "Silakan jatuhkan file PDF.",
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
      event.stopPropagation(); // mencegah file terbuka
      try {
        await db.files.delete(id);
        toast({
            title: "File Dihapus",
            description: "File telah dihapus dari perpustakaan Anda."
        })
      } catch (error) {
        toast({
            title: "Error Menghapus File",
            description: "Tidak dapat menghapus file.",
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
                        Perpustakaan PDF pribadi Anda dengan penanda buku cerdas.
                        <br/>
                        Lanjutkan membaca dari halaman terakhir, setiap saat.
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
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Klik untuk mengunggah</span> atau seret dan jatuhkan</p>
                                <p className="text-xs text-muted-foreground">Hanya file PDF yang didukung</p>
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
                            <h2 className="font-headline text-2xl text-foreground">Perpustakaan Anda</h2>
                        </div>
                        {storedFiles === undefined && <p>Memuat perpustakaan...</p>}
                        {storedFiles && storedFiles.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>Perpustakaan Anda kosong.</p>
                                <p>Tambahkan file PDF untuk memulai.</p>
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
                                           Terakhir dibuka: {file.lastOpened.toLocaleDateString()}
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
                {currentYear && <>© {currentYear} Tandai PDF. Dibuat dengan ❤️ oleh <a href='https://ryansutrisno.com' target='_blank' rel='noreferrer'>Ryan Sutrisno</a>.</>}
            </p>
        </footer>
    </div>
  );
}
