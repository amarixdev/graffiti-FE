export class FetchRequests {
  static PORT: number = 3000;
  static HOSTNAME: string = "localhost";

  static async postCanvas(formData: FormData) {
    return await fetch(`http://${this.HOSTNAME}:${this.PORT}/post-canvas`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .catch((err) => {
        console.error("Error:", err);
      });
  }

  static async renderCanvas(id: string) {
    return await fetch(`http://${this.HOSTNAME}:${this.PORT}/render-canvas`, {
      method: "POST",
      body: id,
    })
      .then((response) => response.json())
      .catch((err) => {
        console.error("Error:", err);
      });
  }

}
