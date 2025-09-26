import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, FileText, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFilesUploaded: (files: any[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  allowCamera?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowCamera = true
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      const processedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          // Simula upload del file
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          };
        })
      );

      setUploadedFiles(prev => [...prev, ...processedFiles]);
      onFilesUploaded(processedFiles);
      toast.success(`${processedFiles.length} file caricati con successo`);
    } catch (error) {
      toast.error('Errore durante il caricamento dei file');
    } finally {
      setUploading(false);
    }
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles,
    maxSize
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Implementa cattura da camera
          toast.success('Funzionalità camera in sviluppo');
        })
        .catch(err => {
          toast.error('Impossibile accedere alla camera');
        });
    } else {
      toast.error('Camera non supportata su questo dispositivo');
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-gray-400" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Rilascia i file qui' : 'Trascina i file qui o clicca per selezionare'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supportati: PDF, JPG, PNG (max {maxSize / (1024 * 1024)}MB)
            </p>
          </div>

          {allowCamera && (
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleCameraCapture}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
                Scansiona con Camera
              </button>
            </div>
          )}
        </div>
      </div>

      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento in corso...</span>
        </div>
      )}

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-gray-900">File caricati:</h4>
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
