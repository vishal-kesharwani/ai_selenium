import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Tabs, Tab, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔄 User is authenticated, redirecting to dashboard...");
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    identifier: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log("📤 Sending login:", formData.identifier || formData.email);
    const identifier = formData.identifier || formData.email || formData.username;
    const result = await login(identifier, formData.password);
    console.log("📥 Login result:", result);

    if (!result.success) {
      console.log("❌ Login failed:", result.error);
      setError(result.error);
    } else {
      console.log("✅ Login succeeded!");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('❌ Passwords do not match');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log("📤 Sending registration:", formData.email);

    const result = await register(formData.username, formData.email, formData.password);
    console.log("📥 Registration result:", result);

    if (result.success) {
      console.log("✅ Registration succeeded!");
      setSuccess('🎉 Registration successful! Please login.');
      setActiveTab('login');
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    } else {
      console.log("❌ Registration failed:", result.error);
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <Container fluid>
        <Row className="min-vh-100 align-items-center justify-content-center">
          <Col lg={5} md={7} sm={10}>
            <Card className="auth-card border-0">
              {/* Header */}
              <div className="auth-header">
                <h1 className="auth-title">AI Selenium</h1>
                <p className="auth-subtitle">Intelligent Web Testing Platform</p>
              </div>

              {/* Body */}
              <Card.Body className="auth-body p-5">
                <Tabs
                  activeKey={activeTab}
                  onSelect={setActiveTab}
                  className="auth-tabs mb-4"
                  justify
                >
                  {/* LOGIN TAB */}
                  <Tab eventKey="login" title="Sign In" className="auth-tab-content">
                    <Form onSubmit={handleLogin} className="mt-4">
                      {/* Identifier Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="auth-label">Email or Username</Form.Label>
                        <Form.Control
                          type="text"
                          name="identifier"
                          value={formData.identifier || ''}
                          onChange={handleInputChange}
                          placeholder="Email or username"
                          required
                          className="auth-input"
                        />
                      </Form.Group>

                      {/* Password Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="auth-label">Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          required
                          className="auth-input"
                        />
                      </Form.Group>

                      {/* Error Alert */}
                      {error && (
                        <Alert variant="danger" className="auth-alert-error mb-4 border-0">
                          <small>{error}</small>
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="auth-btn-primary w-100 py-3 fw-bold border-0"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Signing In...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </Form>
                  </Tab>

                  {/* REGISTER TAB */}
                  <Tab eventKey="register" title="Register" className="auth-tab-content">
                    <Form onSubmit={handleRegister} className="mt-4">
                      {/* Username Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="auth-label">Username</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Choose a username"
                          required
                          className="auth-input"
                        />
                      </Form.Group>

                      {/* Email Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="auth-label">Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          required
                          className="auth-input"
                        />
                      </Form.Group>

                      {/* Password Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="auth-label">Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create a strong password"
                          required
                          className="auth-input"
                        />
                      </Form.Group>

                      {/* Confirm Password Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="auth-label">Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your password"
                          required
                          className="auth-input"
                        />
                      </Form.Group>

                      {/* Error Alert */}
                      {error && (
                        <Alert variant="danger" className="auth-alert-error mb-4 border-0">
                          <small>{error}</small>
                        </Alert>
                      )}

                      {/* Success Alert */}
                      {success && (
                        <Alert variant="success" className="auth-alert-success mb-4 border-0">
                          <small>{success}</small>
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="auth-btn-secondary w-100 py-3 fw-bold border-0"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </Form>
                  </Tab>
                </Tabs>

                {/* Footer */}
                <div className="auth-footer mt-5 text-center">
                  <p className="auth-footer-text">Secure & Encrypted</p>
                  <small className="auth-footer-subtext">Powered by AI</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Auth;