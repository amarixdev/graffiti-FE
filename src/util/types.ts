export type ImagePreview = {
  id: string;
  imageFile: ImageFile;
};

export type ImageFile = {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
