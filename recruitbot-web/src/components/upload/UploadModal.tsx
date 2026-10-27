/**
 * Upload Modal Component
 * Inline resume upload on the search page
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui.store';
import axios from 'axios';
import toast from 'react-hot-toast';

export const UploadModal: React.FC = () => {
  const { uploadModalOpen, closeUploadModal } = useUIStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    closeUploadModal();
    setTimeout(() => {
      setFile(null);
      setSuccess(false);
      setError(null);
    }, 300);
  };

  const isPdfFile = (candidate: File) => {
    const lowerName = candidate.name.toLowerCase();
    const isExtensionPdf = lowerName.endsWith('.pdf');
    const isMimePdf = candidate.type === 'application/pdf';
    return isExtensionPdf || isMimePdf;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!isPdfFile(selectedFile)) {
        setError('Only PDF files are allowed');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!isPdfFile(droppedFile)) {
        setError('Only PDF files are allowed');
        return;
      }
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:3000/v1/resume/ingest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      toast.success('Resume uploaded successfully!');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {uploadModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            className="relative w-full max-w-lg bg-bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-bg-card hover:bg-bg-card/70 border border-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Upload Resume</h2>
                <p className="text-sm text-text-muted">
                  Upload a PDF resume to add it to the searchable database
                </p>
              </div>

              {!success ? (
                <>
                  {/* Dropzone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      file
                        ? 'border-primary bg-primary/5'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {file ? (
                      <div className="space-y-3">
                        <FileText className="w-12 h-12 text-primary mx-auto" />
                        <div>
                          <p className="font-medium text-text-primary">{file.name}</p>
                          <p className="text-sm text-text-muted">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="text-sm text-text-muted hover:text-text-primary transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-text-muted mx-auto" />
                        <div>
                          <p className="font-medium text-text-primary">
                            Drop PDF here or click to browse
                          </p>
                          <p className="text-sm text-text-muted">Maximum file size: 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`w-full mt-6 py-3 rounded-lg font-medium transition-all ${
                      file && !uploading
                        ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg'
                        : 'bg-white/5 text-text-muted cursor-not-allowed'
                    }`}
                  >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                </>
              ) : (
                /* Success State */
                <div className="py-8 text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      Upload Successful!
                    </h3>
                    <p className="text-text-muted">
                      Resume has been processed and is now searchable
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
