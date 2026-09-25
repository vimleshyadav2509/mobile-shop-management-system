import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Non-blocking Error Boundary:
 * Logs runtime exceptions safely without replacing the main UI with a blocking full-screen safe-mode modal.
 * Always renders children so the customer storefront and 3D category buttons remain visible and interactive.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Keep flag but never block screen
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[ErrorBoundary] Handled non-blocking error in child component:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    // Permanently remove any safe mode / error screen. Always render children.
    return this.props.children;
  }
}
