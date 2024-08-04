export type ImagePreviews = {
  imageFile: ImageFile;
};

type ImageFile = {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
