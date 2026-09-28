import React, { useState, useEffect, useRef } from 'react';
import { getUserDocuments, uploadDocument, deleteDocument } from '../services/meetingService';

const CATEGORY_ICONS = {
  pdf: 'picture_as_pdf',
  docx: 'description',
  doc: 'description',
  pptx: 'slideshow',
  ppt: 'slideshow',
  xlsx: 'table_chart',
  xls: 'table_chart',
  md: 'code',
  txt: 'text_snippet',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'gif',
  svg: 'image',
  fig: 'palette',
  zip: 'folder_zip'
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsView() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  async function fetchDocs() {
    try {
      setLoading(true);
      setError('');
      const data = await getUserDocuments();
      setDocs(data);
    } catch (err) {
      console.error('[DocumentsView] Failed to load docs:', err);
      setError('Could not load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const result = await uploadDocument(file);
      setDocs((prev) => [result.document, ...prev]);
      setUploadSuccess(`"${file.name}" uploaded successfully.`);
      // Clear success message after 4 seconds
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch (err) {
      console.error('[DocumentsView] Upload failed:', err);
      setUploadError(err?.response?.data?.error || 'Upload failed. Please check the file type and try again.');
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    setDeletingId(doc._id);
    try {
      await deleteDocument(doc._id);
      setDocs((prev) => prev.filter((d) => d._id !== doc._id));
    } catch (err) {
      console.error('[DocumentsView] Delete failed:', err);
      alert(err?.response?.data?.error || 'Failed to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Shared Workspace Documents</h2>
          <p className="text-xs text-on-surface-variant mt-1">Access project files, meeting recordings, and design specifications.</p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          id="doc-upload-input"
          className="sr-only"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.png,.jpg,.jpeg,.gif,.svg,.fig,.zip"
          onChange={handleFileChange}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">upload_file</span>
              <span>Upload Document</span>
            </>
          )}
        </button>
      </div>

      {/* Status banners */}
      {uploadSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {uploadSuccess}
        </div>
      )}
      {uploadError && (
        <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError('')} className="ml-4 text-red-300 hover:text-white">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <span>{error}</span>
          <button type="button" onClick={fetchDocs} className="flex items-center gap-1 font-bold hover:text-white">
            <span className="material-symbols-outlined text-sm">refresh</span> Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-low border border-outline-variant p-5 rounded-2xl animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-surface-container-high mb-4" />
              <div className="h-4 rounded bg-surface-container-high mb-2 w-3/4" />
              <div className="h-3 rounded bg-surface-container w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Document grid */}
      {!loading && (
        <>
          {docs.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-outline-variant">
              <span className="material-symbols-outlined text-5xl text-outline mb-4">folder_open</span>
              <p className="font-semibold text-sm text-on-surface">No documents yet</p>
              <p className="text-xs text-on-surface-variant mt-1">Click "Upload Document" to add your first file.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc) => {
              const ext = (doc.fileType || '').toLowerCase();
              const icon = CATEGORY_ICONS[ext] || 'insert_drive_file';
              const isDeleting = deletingId === doc._id;
              const downloadUrl = doc.url?.startsWith('http')
                ? doc.url
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.url}`;

              return (
                <div key={doc._id} className="bg-surface-container-low border border-outline-variant p-5 rounded-2xl hover:border-primary/50 transition-all group shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">{icon}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.name}
                        title="Download"
                        className="text-on-surface-variant hover:text-primary p-1 rounded-lg hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">download</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc)}
                        disabled={isDeleting}
                        title="Delete document"
                        className="text-on-surface-variant hover:text-error p-1 rounded-lg hover:bg-error/10 transition-colors disabled:opacity-50"
                      >
                        {isDeleting
                          ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                          : <span className="material-symbols-outlined text-lg">delete</span>
                        }
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate" title={doc.name}>{doc.name}</h4>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant mt-4 font-mono">
                    <span className="truncate max-w-[55%]">{doc.owner?.name || 'You'}</span>
                    <span>{formatBytes(doc.sizeBytes || 0)}</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-mono">
                    {new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
