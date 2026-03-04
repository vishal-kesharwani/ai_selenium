import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Spinner, Alert, Modal, Form, Badge } from 'react-bootstrap';
import axios from 'axios';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileType, setFileType] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadFiles();
  }, [filterType]);

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const query = filterType === 'all' ? '' : `?type=${filterType}`;
      const response = await axios.get(`/api/files${query}`);
      setFiles(response.data);
    } catch (err) {
      setError('Failed to load files');
    }
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('file_type', fileType);

      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(`✅ ${response.data.filename} uploaded successfully!`);
      setSelectedFile(null);
      setShowUploadModal(false);
      loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await axios.get(`/api/files/${fileId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Download failed');
    }
  };

  const handleDelete = async (fileId, filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;

    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/files/${fileId}`);
      setSuccess('✅ File deleted successfully');
      loadFiles();
    } catch (err) {
      setError('Delete failed');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'report': return 'info';
      case 'screenshot': return 'success';
      case 'upload': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div style={{ padding: '15px' }}>
      <Card style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <Card.Header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📁 File Manager</span>
            <Button size="sm" variant="light" onClick={() => setShowUploadModal(true)}>
              ⬆️ Upload File
            </Button>
          </div>
        </Card.Header>

        <Card.Body style={{ padding: '15px' }}>
          {error && <Alert variant="danger" style={{ fontSize: '0.85rem', marginBottom: '10px' }}>{error}</Alert>}
          {success && <Alert variant="success" style={{ fontSize: '0.85rem', marginBottom: '10px' }}>{success}</Alert>}

          <Form.Group style={{ marginBottom: '10px' }}>
            <Form.Label style={{ fontSize: '0.85rem', marginBottom: '5px' }}>Filter by Type:</Form.Label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['all', 'upload', 'report', 'screenshot'].map(type => (
                <Button
                  key={type}
                  size="sm"
                  variant={filterType === type ? 'primary' : 'outline-secondary'}
                  onClick={() => setFilterType(type)}
                  style={{ fontSize: '0.75rem' }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </Form.Group>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spinner animation="border" size="sm" />
            </div>
          ) : files.length === 0 ? (
            <Alert variant="info" style={{ fontSize: '0.85rem', marginBottom: '0' }}>
              No files yet. Upload your first file! 📤
            </Alert>
          ) : (
            <Table striped bordered hover size="sm" style={{ fontSize: '0.8rem', marginBottom: '0' }}>
              <thead style={{ background: '#f8f9fa' }}>
                <tr>
                  <th style={{ width: '30%' }}>Filename</th>
                  <th style={{ width: '15%' }}>Type</th>
                  <th style={{ width: '15%' }}>Size</th>
                  <th style={{ width: '20%' }}>Uploaded</th>
                  <th style={{ width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map(file => (
                  <tr key={file.file_id}>
                    <td style={{ wordBreak: 'break-word' }}>{file.filename}</td>
                    <td><Badge bg={getTypeColor(file.file_type)}>{file.file_type}</Badge></td>
                    <td>{formatFileSize(file.size)}</td>
                    <td style={{ fontSize: '0.75rem' }}>
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleDownload(file.file_id, file.filename)}
                        style={{ fontSize: '0.7rem', marginRight: '5px' }}
                      >
                        ⬇️
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(file.file_id, file.filename)}
                        style={{ fontSize: '0.7rem' }}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem' }}>Upload File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group style={{ marginBottom: '15px' }}>
            <Form.Label style={{ fontSize: '0.9rem' }}>File Type:</Form.Label>
            <Form.Select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            >
              <option value="upload">Test File</option>
              <option value="report">Test Report</option>
              <option value="screenshot">Screenshot</option>
            </Form.Select>
          </Form.Group>

          <Form.Group style={{ marginBottom: '15px' }}>
            <Form.Label style={{ fontSize: '0.9rem' }}>Select File:</Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileSelect}
              style={{ fontSize: '0.9rem' }}
              accept=".txt,.pdf,.png,.jpg,.jpeg,.gif,.csv,.json"
            />
            <Form.Text style={{ fontSize: '0.8rem', color: '#666' }}>
              Max 50MB. Allowed: txt, pdf, png, jpg, jpeg, gif, csv, json
            </Form.Text>
          </Form.Group>

          {selectedFile && (
            <Alert variant="info" style={{ fontSize: '0.85rem' }}>
              📄 {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUploadModal(false)}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            size="sm"
          >
            {uploading ? <Spinner animation="border" size="sm" /> : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FileManager;
