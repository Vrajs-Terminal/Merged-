import React from "react";

type Props = {
  moduleKey: string;
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

class ModuleErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    message: "",
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.moduleKey !== this.props.moduleKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || "Unexpected rendering error",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Module crashed:", this.props.moduleKey, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="lm-container lm-fade">
          <div className="lm-card" style={{ padding: "20px" }}>
            <h3 style={{ marginBottom: "8px", color: "#7c3aed" }}>Module failed to load</h3>
            <p style={{ marginBottom: "12px", color: "#64748b" }}>
              This section hit a runtime error and was stopped to avoid a white blank screen.
            </p>
            <p style={{ marginBottom: "16px", color: "#475569", fontSize: "13px" }}>
              <strong>Module:</strong> {this.props.moduleKey}
              <br />
              <strong>Error:</strong> {this.state.message}
            </p>
            <button
              className="btn-primary"
              type="button"
              onClick={() => this.setState({ hasError: false, message: "" })}
            >
              Retry Module
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ModuleErrorBoundary;