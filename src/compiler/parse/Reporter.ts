interface ErrorInfo {
  from: number;
  to: number;
  message: string;
}

export class ErrorReporter {
  private errorInfo: ErrorInfo[] = [];

  get errors() {
    return this.errorInfo;
  }

  get hasError() {
    return this.errorInfo.length > 0;
  }

  error(from: number, to: number, message: string) {
    this.errorInfo.push({ from, to, message });
  }
}
