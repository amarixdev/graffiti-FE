private sprayB(stroke: Stroke) {
    let { x, y, px, py, size, color } = stroke;
    let p = this.p;
    let density = 50;
    const rgb = Paint.stringToRGB(color);

    // Store the previous mouse position
    if (!px || !py) {
      px = x;
      py = y;
    }

    // Calculate the distance between the current and previous positions
    let distance = p.dist(x, y, px, py);
    let steps = Math.ceil(distance / size);

    for (let i = 0; i < steps; i++) {
      let interX = p.lerp(px, x, i / steps);
      let interY = p.lerp(py, y, i / steps);

      for (let j = 0; j < density; j++) {
        let angle = p.random(p.TWO_PI);
        let radius = p.random(0, 12);
        let offsetX = p.cos(angle) * radius;
        let offsetY = p.sin(angle) * radius;
        let alpha = p.map(radius, 0, 12, 255, 0);

        p.noStroke();
        p.fill(rgb[0], rgb[1], rgb[2], alpha * 0.3); // Adjust opacity as needed
        p.ellipse(interX + offsetX, interY + offsetY, size, size);
      }
    }

    // Update the previous mouse position
    this.prevX = x;
    this.prevY = y;
  }
  private spray(stroke: Stroke) {
    let { x, y, size, color } = stroke;
    let p = this.p;
    let density = 50;

    let rgb = Paint.stringToRGB(color);

    // Store the previous mouse position
    if (!this.prevX || !this.prevY) {
      this.prevX = x;
      this.prevY = y;
    }

    // Calculate the distance between the current and previous positions
    let distance = p.dist(x, y, this.prevX, this.prevY);
    let steps = Math.ceil(distance / size);

    for (let i = 0; i < steps; i++) {
      let interX = p.lerp(this.prevX, x, i / steps);
      let interY = p.lerp(this.prevY, y, i / steps);

      for (let j = 0; j < density; j++) {
        let angle = p.random(p.TWO_PI);
        let radius = p.random(0, 12);
        let offsetX = p.cos(angle) * radius;
        let offsetY = p.sin(angle) * radius;
        let alpha = p.map(radius, 0, 12, 255, 0);

        if (p.mouseIsPressed) {
          p.noStroke();
          p.fill(rgb[0], rgb[1], rgb[2], alpha * 0.3); // Adjust opacity as needed
          p.ellipse(interX + offsetX, interY + offsetY, size, size);
        }
      }
    }

    // Update the previous mouse position
    this.prevX = x;
    this.prevY = y;
  }