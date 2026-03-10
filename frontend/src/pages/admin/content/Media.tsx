import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Image, 
  Upload, 
  RefreshCw, 
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Grid3x3,
  List,
  FolderOpen,
  FileText,
  FileImage,
  Loader2,
  MoreHorizontal,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { format } from 'date-fns';

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
  type: string;
}

interface UploadFile extends File {
  preview?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const STATIC_URL = API_URL.replace('/api', '');

const Media = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    totalSize: 0
  });

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Dialog states
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('images');

  useEffect(() => {
    if (activeTab === 'images') {
      fetchMediaFiles();
    }
  }, [activeTab]);

  useEffect(() => {
    // Filter files based on search
    const filtered = files.filter(file => 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [searchTerm, files]);

  const fetchMediaFiles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/media');
      setFiles(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const totalSize = response.data.reduce((acc: number, file: MediaFile) => acc + file.size, 0);
      setStats({ total, totalSize });
    } catch (error) {
      console.error('Error fetching media files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load media files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => {
        // Create preview for images
        const preview = URL.createObjectURL(file);
        return Object.assign(file, {
          preview,
          progress: 0,
          status: 'pending' as const
        });
      });
      setUploadFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    const newFiles = droppedFiles.map(file => {
      const preview = URL.createObjectURL(file);
      return Object.assign(file, {
        preview,
        progress: 0,
        status: 'pending' as const
      });
    });

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeUploadFile = (index: number) => {
    const file = uploadFiles[index];
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateFiles = (files: UploadFile[]) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    return files.map(file => {
      if (!allowedTypes.includes(file.type)) {
        return { ...file, status: 'error', error: 'Invalid file type' };
      }
      if (file.size > maxSize) {
        return { ...file, status: 'error', error: 'File too large (max 5MB)' };
      }
      return file;
    });
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select files to upload',
        variant: 'destructive',
      });
      return;
    }

    // Validate files
    const validatedFiles = validateFiles(uploadFiles);
    setUploadFiles(validatedFiles);

    const validFiles = validatedFiles.filter(f => f.status === 'pending');
    
    if (validFiles.length === 0) {
      toast({
        title: 'No valid files',
        description: 'Please check file types and sizes',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const formData = new FormData();
      formData.append('image', file);

      try {
        // Update progress
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading', progress: 50 } : f
        ));

        await api.post('/admin/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success', progress: 100 } : f
        ));
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', error: 'Upload failed' } : f
        ));
      }
    }

    setUploading(false);

    // Check if all uploads completed
    const allSuccess = uploadFiles.every(f => f.status === 'success');
    if (allSuccess) {
      toast({
        title: 'Upload Complete',
        description: 'All files uploaded successfully',
      });
      
      // Clear upload files and switch to images tab after a delay
      setTimeout(() => {
        uploadFiles.forEach(f => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
        setUploadFiles([]);
        setActiveTab('images');
        fetchMediaFiles();
      }, 1500);
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;

    try {
      await api.delete(`/admin/media/${encodeURIComponent(selectedFile.filename)}`);

      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully',
      });

      setShowDeleteDialog(false);
      setSelectedFile(null);
      fetchMediaFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    try {
      // Delete files one by one
      for (const filename of selectedFiles) {
        await api.delete(`/admin/media/${encodeURIComponent(filename)}`);
      }

      toast({
        title: 'Files Deleted',
        description: `${selectedFiles.length} file(s) deleted successfully`,
      });

      setSelectedFiles([]);
      setShowBulkDeleteDialog(false);
      fetchMediaFiles();
    } catch (error) {
      console.error('Error deleting files:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete some files',
        variant: 'destructive',
      });
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'URL copied to clipboard',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleFileSelection = (filename: string) => {
    setSelectedFiles(prev => 
      prev.includes(filename) 
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const toggleAllFiles = () => {
    if (selectedFiles.length === paginatedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(paginatedFiles.map(f => f.filename));
    }
  };

  // Pagination
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage images and files for your store
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchMediaFiles}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Images</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Storage Used</p>
              <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search images..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedFiles.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedFiles.length} image(s) selected
                    </span>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setShowBulkDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image Grid */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No images found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? 'Try a different search term' : 'Upload your first image to get started'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Select All Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectedFiles.length === paginatedFiles.length && paginatedFiles.length > 0}
                  onChange={toggleAllFiles}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="selectAll" className="text-sm">
                  Select All ({paginatedFiles.length} images)
                </Label>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedFiles.map((file) => (
                  <Card 
                    key={file.filename} 
                    className={`group cursor-pointer transition-all hover:shadow-lg relative ${
                      selectedFiles.includes(file.filename) ? 'ring-2 ring-orange-500' : ''
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <img 
                          src={file.url} 
                          alt={file.filename}
                          className="w-full h-full object-cover rounded-t-lg"
                          onClick={() => {
                            setSelectedFile(file);
                            setShowPreviewDialog(true);
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.filename)}
                            onChange={() => toggleFileSelection(file.filename)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300"
                          />
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                setSelectedFile(file);
                                setShowPreviewDialog(true);
                              }}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyUrl(file.url)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedFile(file);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="p-3" onClick={() => {
                        setSelectedFile(file);
                        setShowPreviewDialog(true);
                      }}>
                        <p className="text-sm font-medium truncate" title={file.filename}>
                          {file.filename}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                    : 'border-gray-300 hover:border-orange-500'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {isDragging ? 'Drop files here' : 'Drag and drop images here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: JPG, JPEG, PNG, WEBP, GIF (Max 5MB per file)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* File List */}
              {uploadFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Selected Files ({uploadFiles.length})</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        uploadFiles.forEach(f => {
                          if (f.preview) URL.revokeObjectURL(f.preview);
                        });
                        setUploadFiles([]);
                      }}
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                          {file.preview ? (
                            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                          ) : (
                            <FileImage className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{file.name}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeUploadFile(index)}
                              disabled={file.status === 'uploading'}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                          
                          {/* Progress Bar */}
                          {file.status === 'uploading' && (
                            <Progress value={file.progress} className="h-1 mt-2" />
                          )}
                          
                          {/* Status */}
                          {file.status === 'success' && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                              <Check className="w-3 h-3" />
                              <span>Uploaded successfully</span>
                            </div>
                          )}
                          
                          {file.status === 'error' && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>{file.error || 'Upload failed'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      uploadFiles.forEach(f => {
                        if (f.preview) URL.revokeObjectURL(f.preview);
                      });
                      setUploadFiles([]);
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpload} 
                      disabled={uploading}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    >
                      {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {uploading ? 'Uploading...' : `Upload ${uploadFiles.length} File(s)`}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4 max-h-[60vh] overflow-auto">
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.filename}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Filename</p>
                  <p className="font-medium break-all">{selectedFile.filename}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{format(new Date(selectedFile.uploadedAt), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">URL</p>
                  <p className="font-medium text-sm break-all">{selectedFile.url}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleCopyUrl(selectedFile.url)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <Button onClick={() => setShowPreviewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="py-4">
              <p className="font-medium">{selectedFile.filename}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Images</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedFiles.length} image(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete {selectedFiles.length} Image(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Media;