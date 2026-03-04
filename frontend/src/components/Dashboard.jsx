import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, ListGroup, Badge, Navbar, Nav, Tab, Tabs, Table, Modal, ProgressBar, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [url, setUrl] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [results, setResults] = useState(null);
  const [testRunId, setTestRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testHistory, setTestHistory] = useState([]);
  const [manualTests, setManualTests] = useState([]);
  const [showManualTest, setShowManualTest] = useState(false);
  const [manualTestData, setManualTestData] = useState({
    name: '',
    description: '',
    steps: '',
    expectedResult: ''
  });
  const [activeTab, setActiveTab] = useState('automated');

  useEffect(() => {
    loadTestHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'manual') {
      loadManualTests();
    }
  }, [activeTab]);

  const loadTestHistory = async () => {
    try {
      const response = await axios.get('/api/reports');
      setTestHistory(response.data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const loadManualTests = async () => {
    try {
      const response = await axios.get('/api/manual_tests');
      setManualTests(response.data || []);
    } catch (err) {
      console.error('Failed to load manual tests:', err);
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
      setSuccess('🎉 Website analyzed successfully! AI test recommendations generated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    }
    setLoading(false);
  };

  const handleRunTests = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`/api/run_tests/${testRunId}`);
      setResults(response.data.results);
      setSuccess('✅ Tests completed successfully!');
      loadTestHistory(); // Refresh history
    } catch (err) {
      setError(err.response?.data?.message || 'Test run failed');
    }
    setLoading(false);
  };

  const handleManualTest = async () => {
    // Save manual test to database
    try {
      await axios.post('/api/manual_test', manualTestData);
      setSuccess('📝 Manual test saved successfully!');
      setShowManualTest(false);
      setManualTestData({ name: '', description: '', steps: '', expectedResult: '' });
      await loadManualTests(); // Refresh the list
    } catch (err) {
      setError('Failed to save manual test');
    }
  };

  const updateManualTestStatus = async (id, status) => {
    try {
      await axios.patch(`/api/manual_test/${id}`, { status });
      await loadManualTests();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const deleteManualTest = async (testId) => {
    try {
      await axios.delete(`/api/manual_test/${testId}`);
      setSuccess('📝 Manual test deleted!');
      await loadManualTests();
    } catch (err) {
      setError('Failed to delete manual test');
    }
  };

  const exportToPDF = async (testData) => {
    try {
      // Ensure testData is an array
      const dataToExport = Array.isArray(testData) ? testData : testData.results || [testData];
      const response = await axios.post('/api/export_pdf', { testData: dataToExport }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('PDF export error:', err);
      setError('PDF export failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ 
      width: '100%',
      height: '100vh',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Navbar expand="lg" className="navbar-dark bg-dark shadow-lg" style={{ background: 'rgba(0,0,0,0.8) !important' }}>
        <Container fluid>
          <Navbar.Brand className="fw-bold fs-3">
            <span className="text-primary">🚀</span> AI Selenium SaaS
          </Navbar.Brand>          <Navbar.Text className="ms-auto text-white fw-bold">
            {user?.username ? `Welcome, ${user.username}` : ''}
          </Navbar.Text>          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                onClick={() => setActiveTab('automated')}
                className={`mx-2 ${activeTab === 'automated' ? 'text-primary fw-bold' : 'text-light'}`}
                style={{ cursor: 'pointer' }}
              >
                🤖 Automated Testing
              </Nav.Link>
              <Nav.Link
                onClick={() => setActiveTab('manual')}
                className={`mx-2 ${activeTab === 'manual' ? 'text-primary fw-bold' : 'text-light'}`}
                style={{ cursor: 'pointer' }}
              >
                📝 Manual Testing
              </Nav.Link>
              <Nav.Link
                onClick={() => setActiveTab('history')}
                className={`mx-2 ${activeTab === 'history' ? 'text-primary fw-bold' : 'text-light'}`}
                style={{ cursor: 'pointer' }}
              >
                📊 Test History
              </Nav.Link>
            </Nav>
            <Nav>
              <Button
                variant="outline-danger"
                onClick={logout}
                className="border-2 fw-bold"
              >
                🚪 Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="py-4 flex-grow-1" style={{ overflowY: 'auto', paddingLeft: '20px', paddingRight: '20px' }}>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow-lg border-0">
            <span className="fw-bold">❌ Error:</span> {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')} className="shadow-lg border-0">
            <span className="fw-bold">✅ Success:</span> {success}
          </Alert>
        )}

        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4 custom-tabs" style={{ maxHeight: 'calc(100vh - 150px)' }}>
          <Tab eventKey="automated" title="🤖 Automated Testing" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <Row className="g-3">
              <Col lg={6} className="mb-0">
                <Card className="shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', maxHeight: '500px' }}>
                  <Card.Header className="bg-primary text-white border-0" style={{ background: 'linear-gradient(45deg, #007bff, #0056b3)' }}>
                    <h5 className="mb-0 d-flex align-items-center">
                      <span className="me-2">🔍</span>
                      Website Analysis
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>🌐 Website URL</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="border-2"
                        style={{ borderRadius: '8px', fontSize: '0.9rem', padding: '8px 12px' }}
                      />
                      <Form.Text className="text-muted" style={{ fontSize: '0.8rem' }}>
                        💡 Enter any website URL
                      </Form.Text>
                    </Form.Group>

                    <Button
                      variant="primary"
                      onClick={handleAnalyze}
                      disabled={loading || !url}
                      className="w-100 py-2 fw-bold border-0"
                      style={{
                        background: 'linear-gradient(45deg, #28a745, #20c997)',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>🤖 Analyze Tests</>
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6} className="mb-0">
                {recommendations.length > 0 && (
                  <Card className="shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', maxHeight: '500px', overflowY: 'auto' }}>
                    <Card.Header className="bg-info text-white border-0" style={{ background: 'linear-gradient(45deg, #17a2b8, #138496)' }}>
                      <h5 className="mb-0 d-flex align-items-center">
                        <span className="me-2">🧠</span>
                        AI Recommendations
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-3">
                      <ListGroup variant="flush" className="mb-3">
                        {recommendations.map((rec, index) => (
                          <ListGroup.Item
                            key={index}
                            className="d-flex justify-content-between align-items-center border-0 py-2 px-0"
                            style={{ background: 'transparent', fontSize: '0.85rem' }}
                          >
                            <div className="d-flex align-items-center flex-grow-1">
                              <Badge bg="secondary" className="me-2" style={{ minWidth: '60px', fontSize: '0.7rem' }}>
                                {rec.element_type}
                              </Badge>
                              <span className="fw-medium">{rec.description.substring(0, 30)}...</span>
                            </div>
                            <Badge bg="primary" className="ms-2" style={{ fontSize: '0.65rem' }}>{rec.action}</Badge>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      <Button
                        variant="success"
                        onClick={handleRunTests}
                        disabled={loading}
                        className="w-100 py-2 fw-bold border-0"
                        style={{
                          background: 'linear-gradient(45deg, #ffc107, #fd7e14)',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)'
                        }}
                      >
                        {loading ? <>⚡ Running...</> : <>🚀 Run Tests</>}
                      </Button>
                    </Card.Body>
                  </Card>
                )}

                {results && (
                  <Card className="shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', maxHeight: '500px', overflowY: 'auto' }}>
                    <Card.Header className="bg-success text-white border-0" style={{ background: 'linear-gradient(45deg, #28a745, #20c997)' }}>
                      <h5 className="mb-0 d-flex align-items-center">
                        <span className="me-2">📊</span>
                        Results
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-3">
                      <div className="mb-3">
                        <div className="d-flex justify-content-around mb-2">
                          <div className="text-center">
                            <Badge bg="info" className="p-2" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
                              📊 Total: {results.length}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <Badge bg="success" className="p-2" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
                              ✅ Passed: {results.filter(r => r.status === 'PASS').length}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <Badge bg="danger" className="p-2" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
                              ❌ Failed: {results.filter(r => r.status !== 'PASS').length}
                            </Badge>
                          </div>
                        </div>
                        <ProgressBar style={{ height: '10px', borderRadius: '4px' }}>
                          <ProgressBar
                            variant="success"
                            now={(results.filter(r => r.status === 'PASS').length / results.length) * 100}
                            label={`${((results.filter(r => r.status === 'PASS').length / results.length) * 100).toFixed(1)}%`}
                          />
                          <ProgressBar
                            variant="danger"
                            now={(results.filter(r => r.status !== 'PASS').length / results.length) * 100}
                          />
                        </ProgressBar>
                      </div>
                      
                      {/* Individual Test Results */}
                      <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '15px' }}>
                        <h6 className="mb-2 fw-bold text-dark">Test Details:</h6>
                        {results.map((result, idx) => (
                          <div key={idx} className="mb-2 p-2" style={{ background: '#f8f9fa', borderRadius: '6px' }}>
                            <div className="d-flex align-items-center">
                              <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>
                                {result.status === 'PASS' ? '✅' : '❌'}
                              </span>
                              <strong style={{ fontSize: '0.95rem' }}>{result.name || `Test ${idx + 1}`}</strong>
                            </div>
                            {result.error && (
                              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', marginTop: '4px', maxHeight: '120px', overflowY: 'auto' }}>
{result.error}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          onClick={() => exportToPDF(results)}
                          className="flex-fill py-2 fw-bold border-0"
                          style={{ borderRadius: '8px', fontSize: '0.9rem', background: 'linear-gradient(45deg, #0056b3, #004085)' }}
                          title="Download test results as PDF"
                        >
                          📄 Export PDF
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => setResults(null)}
                          className="flex-fill py-2 fw-bold border-2"
                          style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                          title="Clear results"
                        >
                          🗑️ Clear
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="manual" title="📝 Manual Testing">
            <Card className="shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
              <Card.Header className="bg-warning text-dark border-0" style={{ background: 'linear-gradient(45deg, #ffc107, #fd7e14)' }}>
                <h4 className="mb-0 d-flex align-items-center">
                  <span className="me-2">📝</span>
                  Manual Test Cases
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Button
                  variant="primary"
                  onClick={() => setShowManualTest(true)}
                  className="mb-4 py-3 px-4 fw-bold fs-5 border-0"
                  style={{
                    background: 'linear-gradient(45deg, #007bff, #0056b3)',
                    borderRadius: '15px',
                    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
                    minWidth: '220px',
                    color: '#fff'
                  }}
                  title="Create a new manual test case"
                >
                  ➕ Create Manual Test
                </Button>

                {manualTests && manualTests.length > 0 ? (
                  <Table striped bordered hover className="shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <thead className="bg-dark text-white">
                      <tr>
                        <th className="py-3">📋 Test Name</th>
                        <th className="py-3">📖 Description</th>
                        <th className="py-3">📊 Status</th>
                        <th className="py-3">⚙️ Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualTests.map((test, idx) => (
                        <tr key={idx} className="align-middle">
                          <td className="fw-medium">{test.name}</td>
                          <td className="text-truncate" style={{ maxWidth: '300px' }}>{test.description}</td>
                          <td>
                            <Badge 
                              bg={test.status === 'PENDING' ? 'warning' : test.status === 'PASS' ? 'success' : 'danger'} 
                              className="fs-6 py-2 px-3"
                              style={{ borderRadius: '8px', minWidth: '100px' }}
                            >
                              {test.status === 'PENDING' ? '⏳ Pending' : test.status === 'PASS' ? '✅ Passed' : '❌ Failed'}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              className="me-2 border-2" 
                              style={{ borderRadius: '8px' }}
                              onClick={() => updateManualTestStatus(test._id, 'PASS')}
                              title="Mark as passed"
                            >
                              ✅
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="me-2 border-2" 
                              style={{ borderRadius: '8px' }}
                              onClick={() => updateManualTestStatus(test._id, 'FAIL')}
                              title="Mark as failed"
                            >
                              ❌
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm" 
                              className="border-2" 
                              style={{ borderRadius: '8px' }}
                              onClick={() => deleteManualTest(test._id)}
                              title="Delete this test"
                            >
                              🗑️
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted fs-5">No manual tests yet. Create one to get started! 🚀</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="history" title="📊 Test History">
            <Card className="shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
              <Card.Header className="bg-secondary text-white border-0" style={{ background: 'linear-gradient(45deg, #6c757d, #495057)' }}>
                <h4 className="mb-0 d-flex align-items-center">
                  <span className="me-2">📚</span>
                  Test History & Reports
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Table striped bordered hover className="shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                  <thead className="bg-dark text-white">
                    <tr>
                      <th className="py-3">📅 Date</th>
                      <th className="py-3">🌐 URL</th>
                      <th className="py-3">📊 Status</th>
                      <th className="py-3">🔢 Tests Run</th>
                      <th className="py-3">⚙️ Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testHistory.map((test, index) => (
                      <tr key={index} className="align-middle">
                        <td className="fw-medium">{new Date(test.timestamp).toLocaleString()}</td>
                        <td className="text-truncate" style={{ maxWidth: '200px' }}>{test.url}</td>
                        <td>
                          <Badge
                            bg={test.summary?.passed > test.summary?.failed ? 'success' : 'danger'}
                            className="fs-6 py-2 px-3"
                            style={{ borderRadius: '8px' }}
                          >
                            {test.summary?.passed}/{test.summary?.total} Passed
                          </Badge>
                        </td>
                        <td className="fw-bold">{test.summary?.total || 0}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => exportToPDF(test)}
                            className="border-2"
                            style={{ borderRadius: '8px' }}
                          >
                            📄 PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>

      {/* Manual Test Modal */}
      <Modal show={showManualTest} onHide={() => setShowManualTest(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white" style={{ background: 'linear-gradient(45deg, #007bff, #0056b3)' }}>
          <Modal.Title className="d-flex align-items-center">
            <span className="me-2">📝</span>
            Create Manual Test Case
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark fs-5">📋 Test Name</Form.Label>
              <Form.Control
                type="text"
                value={manualTestData.name}
                onChange={(e) => setManualTestData({...manualTestData, name: e.target.value})}
                placeholder="Enter test name"
                className="form-control-lg border-2"
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark fs-5">📖 Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={manualTestData.description}
                onChange={(e) => setManualTestData({...manualTestData, description: e.target.value})}
                placeholder="Describe the test case"
                className="border-2"
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark fs-5">📝 Test Steps</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={manualTestData.steps}
                onChange={(e) => setManualTestData({...manualTestData, steps: e.target.value})}
                placeholder="Step by step instructions"
                className="border-2"
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark fs-5">🎯 Expected Result</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={manualTestData.expectedResult}
                onChange={(e) => setManualTestData({...manualTestData, expectedResult: e.target.value})}
                placeholder="Expected outcome"
                className="border-2"
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="secondary"
            onClick={() => setShowManualTest(false)}
            className="px-4 py-2 fw-bold border-2"
            style={{ borderRadius: '10px' }}
          >
            ❌ Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleManualTest}
            disabled={!manualTestData.name || !manualTestData.description}
            className="px-4 py-2 fw-bold border-0"
            style={{
              background: 'linear-gradient(45deg, #28a745, #20c997)',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
            }}
            title="Save Test Case"
          >
            💾 Save Test Case
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;