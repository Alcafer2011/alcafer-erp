import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Image, FileText, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cloudinaryService, UploadResult } from '../../services/cloudinaryService';
import { ocrService, OCRResult } from '../../services/ocrService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFilesUploaded: (files: UploadResult[]) => void;
  onOCRResult?: (result: OCRResult) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  folder?: string;
  enableOCR?: boolean;
  className?: string;
}

interface UploadedFile extends UploadResult {
  file: File;
  ocrResult?: OCRResult;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  onOCRResult,
  acceptedTypes = ['image/*', 'application/pdf', '.dxf', '.dwg', '.igs', '.stp', '.z3prt'],
  maxFiles = 10,
  folder = 'uploads',
  enableOCR = false,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    const newUploadedFiles: UploadedFile[] = [];

    try {
      for (const file of acceptedFiles) {
        // Upload to Cloudinary
        const uploadResult = await cloudinaryService.uploadFile(file, folder);
        
        let ocrResult: OCRResult | undefined;
        
        // Perform OCR if enabled and file is image/PDF
        if (enableOCR && (file.type.includes('image') || file.type.includes('pdf'))) {
          try {
            ocrResult = await ocrService.processInvoiceDocument(file);
            if (onOCRResult) {
              onOCRResult(ocrResult);
            }
          } catch (ocrError) {
            console.warn('OCR failed for file:', file.name, ocrError);
          }
        }

        const uploadedFile: UploadedFile = {
          ...uploadResult,
          file,
          ocrResult
        };

        newUploadedFiles.push(uploadedFile);
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      onFilesUploaded(newUploadedFiles);
      
      toast.success(`${newUploadedFiles.length} file caricati con successo`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Errore nel caricamento dei file');
    } finally {
      setUploading(false);
    }
  }, [folder, enableOCR, onFilesUploaded, onOCRResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    disabled: uploading
  });

  const removeFile = async (fileToRemove: UploadedFile) => {
    try {
      await cloudinaryService.deleteFile(fileToRemove.public_id);
      setUploadedFiles(prev => prev.filter(f => f.public_id !== fileToRemove.public_id));
      toast.success('File eliminato');
    } catch (error) {
      toast.error('Errore nell\'eliminazione del file');
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('image')) return <Image className="h-6 w-6" />;
    if (file.type.includes('pdf')) return <FileText className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const getFilePreviewUrl = (uploadedFile: UploadedFile) => {
    if (uploadedFile.resource_type === 'image') {
      return cloudinaryService.getThumbnailUrl(uploadedFile.public_id);
    }
    return uploadedFile.secure_url;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600">Caricamento in corso...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Rilascia i file qui' : 'Trascina i file qui o clicca per selezionare'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supportati: Immagini, PDF, DXF, DWG, IGS, STP, Z3PRT
              </p>
              {enableOCR && (
                <p className="text-xs text-blue-600 mt-1">
                  ✨ OCR automatico abilitato per immagini e PDF
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-gray-900">File caricati ({uploadedFiles.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadedFiles.map((uploadedFile, index) => (
                <motion.div
                  key={uploadedFile.public_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {uploadedFile.resource_type === 'image' ? (
                      <img
                        src={getFilePreviewUrl(uploadedFile)}
                        alt={uploadedFile.file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                        {getFileIcon(uploadedFile.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.bytes / 1024).toFixed(1)} KB
                      {uploadedFile.ocrResult && (
                        <span className="ml-2 text-green-600">
                          ✓ OCR completato ({uploadedFile.ocrResult.confidence.toFixed(0)}%)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewFile(uploadedFile)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Anteprima"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFile(uploadedFile)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Elimina"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{previewFile.file.name}</h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4">
                {previewFile.resource_type === 'image' ? (
                  <img
                    src={previewFile.secure_url}
                    alt={previewFile.file.name}
                    className="max-w-full h-auto"
                  />
                ) : (
                  <div className="text-center py-8">
                    <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Anteprima non disponibile per questo tipo di file</p>
                    <a
                      href={previewFile.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apri file
                    </a>
                  </div>
                )}

                {/* OCR Results */}
                {previewFile.ocrResult && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Dati estratti (OCR)</h4>
                    <div className="space-y-2 text-sm">
                      {previewFile.ocrResult.extractedData?.importo && (
                        <p><strong>Importo:</strong> €{previewFile.ocrResult.extractedData.importo}</p>
                      )}
                      {previewFile.ocrResult.extractedData?.data && (
                        <p><strong>Data:</strong> {previewFile.ocrResult.extractedData.data}</p>
                      )}
                      {previewFile.ocrResult.extractedData?.numeroDocumento && (
                        <p><strong>Numero:</strong> {previewFile.ocrResult.extractedData.numeroDocumento}</p>
                      )}
                      {previewFile.ocrResult.extractedData?.fornitore && (
                        <p><strong>Fornitore:</strong> {previewFile.ocrResult.extractedData.fornitore}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;