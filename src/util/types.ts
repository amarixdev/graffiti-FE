export type ImagePreview = {
  id: string;
  imageFile: ImageFile;
  artists: string[] | null;
};


export type ImageFile = {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
