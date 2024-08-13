import Stroke from "../canvas/paintstrokes";

export default class IndexDBManager {
  private stored: Array<string> = new Array();
  private static instance: IndexDBManager;
  private version = 2;
  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new IndexDBManager();
    }
    return this.instance;
  }

  insert(id: string) {
    this.stored.push(id);
  }

  remove(id: string) {
    const request = window.indexedDB.open("canvasStorage", this.version);
    request.onsuccess = () => {
      const db = request.result;
      console.log("Database opened successfully");
      this.deleteRecord(db, id);
    };
    request.onerror = (event) => {
      console.error("Database failed to open", event);
    };
  }

  store(bitmap: ImageBitmap, id: string, paintStrokes: Array<Stroke>) {
    const request = window.indexedDB.open("canvasStorage", this.version);

    request.onerror = (e) => {
      console.log(e);
    };

    // request.onsuccess = (e) => {
    //   const db = (e.target as IDBOpenDBRequest).result;

    //   // Now add the data, whether or not the version has changed
    //   const transaction = db.transaction(["canvas"], "readwrite");
    //   const objectStore = transaction.objectStore("canvas");

    //   const addRequest = objectStore.put({
    //     id: id,
    //     bitmap: bitmap,
    //     strokes: paintStrokes,
    //   });

    //   addRequest.onerror = (e) => {
    //     console.log(e);
    //   };

    //   addRequest.onsuccess = (e) => {
    //     console.log("Data added successfully", e);
    //   };
    // };

    // request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
    //   const db = (e.target as IDBOpenDBRequest).result;

    //   // Create the object store if it doesn't exist
    //   if (!db.objectStoreNames.contains("canvas")) {
    //     db.createObjectStore("canvas", { keyPath: "id" });
    //   }
    // };
  }

  get(id: string): any {
    const request = indexedDB.open("canvasStorage", this.version);
    return new Promise((resolve, reject) => {
      request.onsuccess = async () => {
        const db = request.result;
        console.log("Database opened successfully");
        this.fetchData(db, id)
          .then((records: any) => {
            console.log("records" + records);
            resolve(records);
          })
          .catch((err) => {
            reject(err);
          });
      };

      request.onerror = (event) => {
        console.error("Database failed to open", event);
      };
    });
  }

  private async deleteRecord(db: IDBDatabase, id: string): Promise<any> {
    const transaction = db.transaction(["canvas"], "readwrite");
    const objectStore = transaction.objectStore("canvas");
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      console.log(`Record with key ${id} deleted successfully`);
    };

    request.onerror = (event) => {
      console.error(`Failed to delete record with key ${id}`, event);
    };
  }

  private async fetchData(db: IDBDatabase, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["canvas"], "readonly");
      const objectStore = transaction.objectStore("canvas");
      const request = objectStore.get(id);

      request.onerror = (event) => {
        console.error("Failed to fetch data", event);
        reject(event);
      };

      request.onsuccess = () => {
        const records = request.result;
        console.log("Data fetched successfully", records);
        resolve(records);
      };
    });
  }
}
