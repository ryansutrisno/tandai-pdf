
const translations: { [key: string]: { en: string; id: string } } = {
    // page.tsx
    'app_title': {
        en: 'Tandai PDF',
        id: 'Tandai PDF',
    },
    'app_description_1': {
        en: 'Your personal PDF library with smart bookmarks.',
        id: 'Perpustakaan PDF pribadi Anda dengan penanda buku cerdas.',
    },
    'app_description_2': {
        en: 'Continue reading from the last page, every time.',
        id: 'Lanjutkan membaca dari halaman terakhir, setiap saat.',
    },
    'upload_click': {
        en: 'Click to upload',
        id: 'Klik untuk mengunggah',
    },
    'upload_drag': {
        en: 'or drag and drop',
        id: 'atau seret dan jatuhkan',
    },
    'upload_supported': {
        en: 'Only PDF files are supported',
        id: 'Hanya file PDF yang didukung',
    },
    'library_title': {
        en: 'Your Library',
        id: 'Perpustakaan Anda',
    },
    'library_loading': {
        en: 'Loading library...',
        id: 'Memuat perpustakaan...',
    },
    'library_empty_1': {
        en: 'Your library is empty.',
        id: 'Perpustakaan Anda kosong.',
    },
    'library_empty_2': {
        en: 'Add a PDF file to get started.',
        id: 'Tambahkan file PDF untuk memulai.',
    },
    'last_opened': {
        en: 'Last opened',
        id: 'Terakhir dibuka',
    },
    'footer_credit': {
        en: 'Made with ❤️ by',
        id: 'Dibuat dengan ❤️ oleh',
    },
    'file_exists_title': {
        en: 'File already exists',
        id: 'File sudah ada',
    },
    'file_exists_desc': {
        en: '"{{fileName}}" is already in the library. Opening file...',
        id: '"{{fileName}}" sudah ada di perpustakaan. Membuka file...',
    },
    'file_added_title': {
        en: 'File Added',
        id: 'File Ditambahkan',
    },
    'file_added_desc': {
        en: '"{{fileName}}" has been added to your library.',
        id: '"{{fileName}}" telah ditambahkan ke perpustakaan Anda.',
    },
    'db_error_title': {
        en: 'Database Error',
        id: 'Error Database',
    },
    'db_error_desc': {
        en: 'Could not save the file to the library.',
        id: 'Tidak dapat menyimpan file ke perpustakaan.',
    },
    'invalid_file_title': {
        en: 'Invalid File',
        id: 'File Tidak Valid',
    },
    'invalid_file_desc_pdf_only': {
        en: 'Please select a PDF file.',
        id: 'Silakan pilih file PDF.',
    },
    'invalid_file_drop_desc': {
        en: 'Please drop a PDF file.',
        id: 'Silakan jatuhkan file PDF.',
    },
    'file_deleted_title': {
        en: 'File Deleted',
        id: 'File Dihapus',
    },
    'file_deleted_desc': {
        en: 'The file has been removed from your library.',
        id: 'File telah dihapus dari perpustakaan Anda.',
    },
    'file_delete_error_title': {
        en: 'Error Deleting File',
        id: 'Error Menghapus File',
    },
    'file_delete_error_desc': {
        en: 'Could not delete the file.',
        id: 'Tidak dapat menghapus file.',
    },
    'page_of_pages': {
        en: 'Page {{currentPage}} of {{totalPages}}',
        id: 'Halaman {{currentPage}} dari {{totalPages}}',
    },
    // pdf-viewer.tsx
    'load_state_error_title': {
        en: 'Could not load saved state',
        id: 'Gagal memuat status tersimpan',
    },
    'load_state_error_desc': {
        en: 'Your previous reading position could not be restored.',
        id: 'Posisi membaca terakhir Anda tidak dapat dipulihkan.',
    },
    'pdf_load_error_title': {
        en: 'Error loading PDF',
        id: 'Gagal memuat PDF',
    },
    'bookmark_removed_title': {
        en: 'Bookmark removed',
        id: 'Penanda dihapus',
    },
    'bookmark_removed_desc': {
        en: 'Page {{pageNumber}} has been unbookmarked.',
        id: 'Halaman {{pageNumber}} telah dihapus dari penanda.',
    },
    'bookmark_added_title': {
        en: 'Bookmark added',
        id: 'Penanda ditambahkan',
    },
    'bookmark_added_desc': {
        en: 'Page {{pageNumber}} has been bookmarked.',
        id: 'Halaman {{pageNumber}} telah ditandai.',
    },
    'search_not_found_title': {
        en: 'Not Found',
        id: 'Tidak Ditemukan',
    },
    'search_not_found_desc': {
        en: 'The phrase "{{query}}" was not found in the document.',
        id: 'Frasa "{{query}}" tidak ditemukan di dalam dokumen.',
    },
    'search_error_title': {
        en: 'Search Error',
        id: 'Error Pencarian',
    },
    'search_error_desc': {
        en: 'An error occurred while searching the document.',
        id: 'Terjadi error saat mencari di dalam dokumen.',
    },
    'back_to_library': {
        en: 'Back to Library',
        id: 'Kembali ke Perpustakaan',
    },
    'search_placeholder': {
        en: 'Search',
        id: 'Cari',
    },
    'prev_match': {
        en: 'Previous Match',
        id: 'Kecocokan Sebelumnya',
    },
    'next_match': {
        en: 'Next Match',
        id: 'Kecocokan Berikutnya',
    },
    'toggle_fullscreen': {
        en: 'Toggle Fullscreen',
        id: 'Alihkan Layar Penuh',
    },
    'loading_document': {
        en: 'Loading document',
        id: 'Memuat dokumen',
    },
    'zoom_out': {
        en: 'Zoom Out',
        id: 'Perkecil',
    },
    'reset_zoom': {
        en: 'Reset Zoom',
        id: 'Reset Zoom',
    },
    'zoom_in': {
        en: 'Zoom In',
        id: 'Perbesar',
    },
    'prev_page': {
        en: 'Previous',
        id: 'Sebelumnya',
    },
    'next_page': {
        en: 'Next',
        id: 'Berikutnya',
    },
    'of_pages': {
        en: 'of {{numPages}}',
        id: 'dari {{numPages}}',
    },
    'add_bookmark': {
        en: 'Bookmark Page',
        id: 'Tandai Halaman',
    },
    'remove_bookmark': {
        en: 'Remove Bookmark',
        id: 'Hapus Penanda',
    },
    'bookmarks_button': {
        en: 'Bookmarks ({{count}})',
        id: 'Penanda ({{count}})',
    },
    'bookmarked_pages_title': {
        en: 'Bookmarked Pages',
        id: 'Halaman yang Ditandai',
    },
    'page': {
        en: 'Page',
        id: 'Halaman',
    },
};

export default translations;

