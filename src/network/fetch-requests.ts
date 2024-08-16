import IndexDBManager from "../client-storage/indexed-db";

export class FetchRequests {
  static PORT: number = 3000;
  static HOSTNAME: string = "localhost";
  private static cache: Map<string, any> = new Map();

  static removeCache(id: string) {
    this.cache.delete(id);
  }

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
    return await this.fetchWithCache(
      `http://${this.HOSTNAME}:${this.PORT}/render-canvas`,
      id,
      {
        method: "POST",
        body: id,
      }
    );
  }

  private static async fetchWithCache(url: string, id: string, options: {}) {
    const cacheKey = id;
    const storedCanvas = await IndexDBManager.getInstance().get(id);

    if (storedCanvas) {
      console.log("fetching from IndexDB");
      return { isLocal: true, canvas: storedCanvas };
    }

    if (this.cache.has(cacheKey)) {
      console.log("fetching cache" + this.cache);
      return this.cache.get(cacheKey);
    }

    console.log("fetching normal");

    return await fetch(url, options)
      .then((response) => {
        const json = response.json();
        this.cache.set(cacheKey, json);
        return json;
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }
}
