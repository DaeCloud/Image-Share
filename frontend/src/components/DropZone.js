import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage } from 'lucide-react';
import './DropZone.css';

export default function DropZone({ onUpload, uploading }) {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0 && !uploading) {
      onUpload(acceptedFiles);
    }
  }, [onUpload, uploading]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    disabled: uploading,
    multiple: true,
  });

  return (
    <div className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${uploading ? 'dropzone-uploading' : ''}`} {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="dropzone-content">
        {uploading ? (
          <>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <p>Uploading files...</p>
          </>
        ) : isDragActive ? (
          <>
            <FileImage size={40} strokeWidth={1} className="dropzone-icon active" />
            <p>Drop files here</p>
          </>
        ) : (
          <>
            <Upload size={36} strokeWidth={1} className="dropzone-icon" />
            <div className="dropzone-text">
              <p><strong>Drop files here</strong> or click to browse</p>
              <p className="dropzone-hint">Photos, videos, or any file format · Up to 500MB each · Multiple files at once</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
