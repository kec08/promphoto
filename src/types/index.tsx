export interface Frame {
    width: unknown;
    height: unknown;
    id: string;
    name: string;
    type: '3cut' | '4cut';
    thumbnail: string;
    description: string;
  }
  
  export interface CapturedPhoto {
    id: string;
    timestamp: number;
    dataUrl: string;
  }
  
  export interface PhotoEditOptions {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
  }
  
  export interface ProjectState {
    currentPage: 'main' | 'frameSelection' | 'guidance' | 'capture' | 'selection' | 'edit';
    selectedFrame: Frame | null;
    capturedPhotos: CapturedPhoto[];
    selectedPhotos: CapturedPhoto[];
    editOptions: PhotoEditOptions;
    frameType?: '3cut' | '4cut';
  }
  
  export type PageType = 'main' | 'frameSelection' | 'guidance' | 'capture' | 'selection' | 'edit';