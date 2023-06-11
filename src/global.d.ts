export {};

declare global {
  interface Window {
    showOpenFilePicker: () => Promise<FileSystemHandle[]>;
  }

  interface FileSystemHandle {
    getFile: () => Promise<File>;
    queryPermission: () => Promise<string>;
    requestPermission: () => Promise<string>;
  }
}
