// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { createLogger, exportLogs } from '@/lib/core/debug';
import { showErrorAlert } from '@/lib/core/alert';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

const logger = createLogger('ErrorBoundary');

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    logger.error('Error caught by boundary', error);
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error details', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    this.setState({
      errorInfo,
    });

    // In production, report to error tracking service
    if (!__DEV__) {
      this.reportError(error, errorInfo);
    }
  }

  reportError(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Send to crash reporting service
    console.error('Production error:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  resetError = () => {
    logger.info('Resetting error boundary');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  exportDebugInfo = () => {
    const logs = exportLogs();
    const errorDetails = `
Error: ${this.state.error?.toString()}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}

Logs:
${logs}
`;

    if (Platform.OS === 'web') {
      // Create a blob and download
      const blob = new Blob([errorDetails], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `error-debug-${Date.now()}.txt`;
      a.click();
    } else {
      // On mobile, show alert with option to copy
      showErrorAlert('Debug Info', 'Debug information has been logged to console');
      console.log(errorDetails);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      return (
        <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 24,
                maxWidth: 500,
                width: '100%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#dc2626',
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                Oops! Something went wrong
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: '#4b5563',
                  marginBottom: 24,
                  textAlign: 'center',
                }}
              >
                We apologize for the inconvenience. The app encountered an unexpected error.
              </Text>

              {__DEV__ && (
                <View
                  style={{
                    backgroundColor: '#fee2e2',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 24,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#991b1b',
                      marginBottom: 8,
                    }}
                  >
                    Error Details (Development Only):
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#7f1d1d',
                      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
                    }}
                  >
                    {this.state.error?.toString()}
                  </Text>
                </View>
              )}

              <View style={{ gap: 12 }}>
                <Pressable
                  onPress={this.resetError}
                  style={{
                    backgroundColor: '#3b82f6',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    Try Again
                  </Text>
                </Pressable>

                {__DEV__ && (
                  <Pressable
                    onPress={this.exportDebugInfo}
                    style={{
                      backgroundColor: '#6b7280',
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      Export Debug Info
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return (error: Error) => {
    setError(error);
  };
}