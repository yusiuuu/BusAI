import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="p-8 bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                    <div className="bg-slate-800 p-6 rounded-lg max-w-2xl w-full overflow-auto border border-slate-700">
                        <h2 className="text-xl font-semibold mb-2 text-slate-300">Error:</h2>
                        <pre className="text-red-300 whitespace-pre-wrap mb-4 font-mono text-sm bg-black/30 p-4 rounded">
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <h2 className="text-xl font-semibold mb-2 text-slate-300">Component Stack:</h2>
                        <pre className="text-slate-400 whitespace-pre-wrap font-mono text-xs bg-black/30 p-4 rounded">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
