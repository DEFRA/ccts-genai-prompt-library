declare interface Window {
  acquireVsCodeApi?: () => {
    postMessage: (message: {
      command: string;
      text: string;
      [key: string]: any;
    }) => void;
  };
}
