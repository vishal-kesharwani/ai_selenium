import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Badge, Navbar, Nav, Tab, Tabs, Table, Modal, Spinner, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import FileManager from './FileManager';
import axios from 'axios';

const DashboardCompact = () => {
  const { logout } = useAuth();
  const [url, setUrl] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [results, setResults] = useState(null);
  const [testRunId, setTestRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testHistory, setTestHistory] = useState([]);
  const [showManualTest, setShowManualTest] = useState(false);
  const [manualTestData, setManualTestData] = useState({ name: '', description: '', steps: '', expectedResult: '' });
  const [activeTab, setActiveTab] = useState('auto');

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    try {
      const response = await axios.get('/api/reports');
      setTestHistory(response.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleAnalyze = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await axios.post('/api/analyze', { url });
      setTestRunId(response.data.test_run_id);
      setRecommendations(response.data.recommendations);
      setSuccess('✅ Analysis complete!');
    } catch (err) {
      setError('Analysis failed');
    }
    setLoading(false);
  };

  const handleRunTests = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`/api/run_tests/${testRunId}`);
      setResults(response.data.results);
      setSuccess('✅ Tests completed!');
      loadTestHistory();
    } catch (err) {
      setError('Test run failed');
    }
    setLoading(false);
  };

  const exportToPDF = async (testData) => {
    try {
      const response = await axios.post('/api/export_pdf', { testData }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('PDF export failed');
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', overflow: 'hidden' }}>
      <Navbar expand="lg" className="navbar-dark" style={{ background: 'rgba(0,0,0,0.9)', flexShrink: 0, borderBottom: '2px solid #007bff' }}>
        <Container fluid>
          <Navbar.Brand className="fw-bold text-primary">🚀 AI Selenium</Navbar.Brand>
          <Nav className="ms-auto">
            <Button variant="outline-danger" size="sm" onClick={logout} className="fw-bold">🚪 Logout</Button>
          </Nav>
        </Container>
      </Navbar>

      <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
        {error && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '10px', fontSize: '0.9rem' }}>❌ {error}</div>}
        {success && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '10px', fontSize: '0.9rem' }}>✅ {success}</div>}

        <Tabs activeKey={activeTab} onSelect={setActiveTab} style={{ marginBottom: '10px' }}>
          {/* Automated Testing */}
          <Tab eventKey="auto" title="🤖 Test" style={{ padding: '15px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {/* Input Card */}
              <Card style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <Card.Body style={{ padding: '20px' }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '1rem', color: '#007bff' }}>🔍 Enter URL</h6>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{ borderRadius: '10px', marginBottom: '12px', fontSize: '0.9rem' }}
                  />
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading || !url}
                    className="w-100 fw-bold py-2"
                    style={{ background: 'linear-gradient(45deg, #28a745, #20c997)', border: 'none', borderRadius: '10px', fontSize: '0.9rem' }}
                  >
                    {loading ? <>⏳ Analyzing...</> : <>🤖 Analyze</>}
                  </Button>
                </Card.Body>
              </Card>

              {/* Results Card */}
              <Card style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <Card.Body style={{ padding: '20px' }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '1rem', color: '#28a745' }}>✨ Results</h6>
                  {results ? (
                    <>
                      <div style={{ marginBottom: '12px' }}>
                        <Badge bg="info" style={{ marginRight: '8px', fontSize: '0.8rem' }}>Total: {results.length}</Badge>
                        <Badge bg="success" style={{ marginRight: '8px', fontSize: '0.8rem' }}>✅ {results.filter(r => r.status === 'PASS').length}</Badge>
                        <Badge bg="danger" style={{ fontSize: '0.8rem' }}>❌ {results.filter(r => r.status !== 'PASS').length}</Badge>
                      </div>
                      <Button onClick={() => exportToPDF(results)} size="sm" className="w-100 fw-bold py-1" style={{ background: '#007bff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '8px' }}>📄 PDF</Button>
                      <Button onClick={() => setResults(null)} size="sm" variant="outline-secondary" className="w-100 fw-bold py-1" style={{ borderRadius: '8px', fontSize: '0.8rem' }}>🗑️ Clear</Button>
                    </>
                  ) : recommendations.length > 0 ? (
                    <>
                      <div style={{ marginBottom: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                        {recommendations.slice(0, 5).map((rec, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', padding: '8px', background: '#f8f9fa', borderRadius: '6px', marginBottom: '6px' }}>
                            <Badge bg="secondary" style={{ fontSize: '0.65rem', marginRight: '6px' }}>{rec.element_type}</Badge>
                            <span className="fw-medium">{rec.description.substring(0, 20)}...</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={handleRunTests}
                        disabled={loading}
                        className="w-100 fw-bold py-2"
                        style={{ background: 'linear-gradient(45deg, #ffc107, #fd7e14)', border: 'none', borderRadius: '10px', fontSize: '0.9rem', color: '#000' }}
                      >
                        {loading ? <>⚡ Running...</> : <>🚀 Run Tests</>}
                      </Button>
                    </>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>No results yet</p>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Tab>

          {/* Manual Testing */}
          <Tab eventKey="manual" title="📝 Manual" style={{ padding: '15px 0' }}>
            <Card style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <Card.Body style={{ padding: '20px' }}>
                <Button onClick={() => setShowManualTest(true)} className="mb-3 fw-bold" style={{ background: '#007bff', border: 'none', borderRadius: '10px', fontSize: '0.9rem' }}>➕ New Test</Button>
                <Table size="sm" striped bordered style={{ marginBottom: 0, fontSize: '0.85rem' }}>
                  <thead className="bg-dark text-white">
                    <tr><th>Name</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Sample</td><td><Badge bg="warning">Pending</Badge></td><td><Button size="sm" variant="outline-primary">✏️</Button></td></tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          {/* History */}
          <Tab eventKey="hist" title="📊 History" style={{ padding: '15px 0' }}>
            <Card style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', maxHeight: '400px', overflowY: 'auto' }}>
              <Card.Body style={{ padding: '20px' }}>
                <Table size="sm" striped bordered style={{ marginBottom: 0, fontSize: '0.8rem' }}>
                  <thead className="bg-dark text-white">
                    <tr><th>Date</th><th>URL</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {testHistory.slice(0, 10).map((test, idx) => (
                      <tr key={idx}>
                        <td style={{ fontSize: '0.75rem' }}>{new Date(test.timestamp).toLocaleString().substring(0, 12)}</td>
                        <td style={{ fontSize: '0.75rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{test.url}</td>
                        <td><Badge bg="success" style={{ fontSize: '0.7rem' }}>{test.summary?.passed || 0}/{test.summary?.total || 0}</Badge></td>
                        <td><Button size="sm" variant="outline-primary" onClick={() => exportToPDF(test)} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>📄</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          {/* Files */}
          <Tab eventKey="files" title="📁 Files" style={{ padding: '15px 0' }}>
            <FileManager />
          </Tab>
        </Tabs>
      </div>

      {/* Manual Test Modal */}
      <Modal show={showManualTest} onHide={() => setShowManualTest(false)} size="sm">
        <Modal.Header closeButton style={{ background: '#007bff', color: 'white', border: 'none' }}>
          <Modal.Title>📝 Create Test</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '0.9rem' }}>
          <Form.Group className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>Name</Form.Label>
            <Form.Control size="sm" value={manualTestData.name} onChange={(e) => setManualTestData({...manualTestData, name: e.target.value})} style={{ fontSize: '0.85rem' }} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>Description</Form.Label>
            <Form.Control as="textarea" rows={2} size="sm" value={manualTestData.description} onChange={(e) => setManualTestData({...manualTestData, description: e.target.value})} style={{ fontSize: '0.85rem' }} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>Steps</Form.Label>
            <Form.Control as="textarea" rows={2} size="sm" value={manualTestData.steps} onChange={(e) => setManualTestData({...manualTestData, steps: e.target.value})} style={{ fontSize: '0.85rem' }} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none' }}>
          <Button size="sm" variant="secondary" onClick={() => setShowManualTest(false)}>Cancel</Button>
          <Button size="sm" style={{ background: '#28a745', border: 'none' }} onClick={() => setShowManualTest(false)}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DashboardCompact;