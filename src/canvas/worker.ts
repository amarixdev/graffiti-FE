self.onmessage = function (msg) {
  let { computed, canvas } = msg.data;
  const ctx = canvas.getContext("2d");
  console.log("computing");
  // Perform drawing operations on the OffscreenCanvas
  computed.forEach((data: any) => {
    data.forEach((d: any) => {
      const normalizedAlpha = d.color[3] / 255;

      ctx.fillStyle = `rgba(${d.color[0]}, ${d.color[1]}, ${d.color[2]}, ${normalizedAlpha})`;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.size, d.size, 0, 0, 2 * Math.PI);
      ctx.fill();
    });
  });

  // Transfer the canvas content as an ImageBitmap to the main thread
  canvas.convertToBlob().then((blob: any) => {
    createImageBitmap(blob).then((bitmap) => {
      self.postMessage(bitmap);
    });
  });
};
