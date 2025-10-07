declare module '@react-pdf/renderer' {
  import * as React from 'react';
  export const Document: React.ComponentType<any>;
  export const Page: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const View: React.ComponentType<any>;
  export const Image: React.ComponentType<any>;
  export const Svg: React.ComponentType<any>;
  export const Path: React.ComponentType<any>;
  export const Circle: React.ComponentType<any>;
  export const StyleSheet: { create: (styles: any) => any };
  export const Font: { register: (options: any) => void };
  export const pdf: (node: React.ReactElement) => { toBlob: () => Promise<Blob> };
  export const PDFDownloadLink: React.ComponentType<any>;
}


