import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxSize?: number; // in bytes
  maxFiles?: number;
  files: Array<{ id: string; name: string; url?: string; type: string; }>;
  onFileRemove: (fileId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  maxSize = 10 * 1024 * 1024, // 10MB by default
  maxFiles = 5,
  files,
  onFileRemove
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter files that would exceed the max count
    const filesToAdd = acceptedFiles.slice(0, Math.max(0, maxFiles - files.length));
    if (filesToAdd.length > 0) {
      onFileUpload(filesToAdd);
    }
  }, [files.length, maxFiles, onFileUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles,
    disabled: files.length >= maxFiles
  });
  
  // Helper to get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('xls')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('ppt')) return '📑';
    return '📁';
  };
  
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        } ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        
        {isDragActive ? (
          <p className="mt-2 text-sm text-gray-600">Drop your files here...</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-gray-600">
              Drag & drop files here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: images, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Max file size: {maxSize / (1024 * 1024)}MB (max {maxFiles} files)
            </p>
          </>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Attached files ({files.length}/{maxFiles})</h4>
          <ul className="mt-2 border rounded-md divide-y divide-gray-200">
            {files.map(file => (
              <li key={file.id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                <div className="flex items-center flex-1 min-w-0">
                  <span className="mr-2">{getFileIcon(file.type)}</span>
                  <span className="flex-1 min-w-0 truncate">{file.name}</span>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={() => onFileRemove(file.id)}
                    className="font-medium text-red-600 hover:text-red-500 focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;