export type ImagePreviews = {
  id: string;
  imageFile: ImageFile;
};

type ImageFile = {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
