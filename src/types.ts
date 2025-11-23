export type ProjectState = {
    currentPage: 'main' | 'frameSelection' | 'aiGenerator' | 'guidance' | 'capture' | 'selection' | 'edit';
    selectedFrame: Frame | null;
    capturedPhotos: CapturedPhoto[];
    selectedPhotos: CapturedPhoto[];
    editOptions: {
      brightness: number;
      contrast: number;
      saturation: number;
      hue: number;
      blur: number;
    };
  };
  
  export type Frame = {
    id: string;
    name: string;
    type: '3cut' | '4cut';
    thumbnail: string;
    description: string;
    aiUrl?: string;
  };
  
  export type CapturedPhoto = {
    dataUrl: string;
    id: string;
    url: string;
    timestamp: number;
  };
  
  export type PhotoEditOptions = {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
  };
  