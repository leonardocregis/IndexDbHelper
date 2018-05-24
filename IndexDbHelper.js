class IndexDbHelper {

    constructor(window) {
      this.refWindow = window;
          if (!this.readyDatabase()) {
              throw new Error("cant create a IndexedDB");
          }
      this.shelfName = "shelf"
      this.dbOpen = false;
      this.readyDatabase();
      this.callbacks = [];
    }

    readyDatabase() {
        // In the following line, you should include the prefixes of implementations you want to test.
        this.indexedDB = this.refWindow.indexedDB || this.refWindow.mozIndexedDB || this.refWindow.webkitIndexedDB || this.refWindow.msIndexedDB;
        // DON'T use "var indexedDB = ..." if you're not in a function.
        // Moreover, you may need references to some window.IDB* objects:
        this.IDBTransaction = this.refWindow.IDBTransaction || this.refWindow.webkitIDBTransaction || this.refWindow.msIDBTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
        this.IDBKeyRange = this.refWindow.IDBKeyRange || this.refWindow.webkitIDBKeyRange || this.refWindow.msIDBKeyRange;
        // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
        if (!this.indexedDB) {
            return false;
        }
        return true;
    }

    onDbOpenReady(db) {
        this.callbacks.forEach(fn => fn(db));
    }

    open(databaseName) {
      const openDBRequest = this.indexedDB.open(databaseName,1);
      
      openDBRequest.onerror = (event) => {
        console.log('couldnt open the database');
        throw new Error('couldnt open the database');
      };
      openDBRequest.onsuccess = (event) => {
        console.log('opened database');
        this.db = openDBRequest.result;
        this.onDbOpenReady(db);
      };
      openDBRequest.onupgradeneeded = (event) => {
        throw new Error("Database structure dont exists, use createNew");
      };

    
    }
    createNew(databaseName) {
        const openDBRequest = this.indexedDB.open(databaseName,1);
        openDBRequest.onerror = (event) => {
			    console.log('couldnt create the structure');
        };
        openDBRequest.onsuccess = (event) => {
          console.log('created database');
          this.db = event.target.result;
          this.dbOpen = true;
          this.onDbOpenReady(this.db);//last run in case the database already exists;
        };
        openDBRequest.onupgradeneeded = (event) => {
          console.log('creating structure');
                  this.objStore = this.db.createObjectStore(this.shelfName, { keyPath: "name" });
          this.objStore.transaction.oncomplete = (event) => {
            this.onDbOpenReady(db);
          }
        };
    }
    /*
          Function that recives the actions to be done into the Db after its ready.
          It has the format callback(db),  where the db is the indexedDBs
      */
    addAction(callback) {
      this.callbacks.push(callback);
    }

    update(data){
      console.log('inserting values');
      let action = (db) => {
        let customerObjectStore = db.transaction('shelf', 'readwrite').objectStore('shelf');
        customerObjectStore.add(data);
      }
      if(this.dbOpen){
        action(this.db);
      } else {
        this.addAction(action);
      }
    }

    fetchData(index) {
      if(this.dbOpen) {
        return new Promise((resolve,reject) => {
          let transaction = this.db.transaction(["shelf"]);
          let objectStore = transaction.objectStore("shelf");
          let request = objectStore.get(index);
          request.onerror = function(event) {
            reject(event);
          };
          request.onsuccess = function(event) {
            resolve(request.result);
          };
        });
      } else {
        return new Promise((resolve, reject) => {
          console.log('building fetch promise');
          let actionFetch = (db) => {
            console.log('running fetch');
            let transaction = db.transaction(["shelf"]);
            let objectStore = transaction.objectStore("shelf");
            let request = objectStore.get(index);
            request.onerror = function(event) {
              reject(event);
            };
            request.onsuccess = function(event) {
              resolve(request.result);
            };
          }
          this.addAction(actionFetch);
        });
      }
    }
}
let obj = new IndexDbHelper(window);
obj.createNew('sample');
obj.update({"name":"reading","values":[{"title":"name of the rose"},{"title":"in the name of God"}]});
obj.fetchData("reading").then(result => console.log(result));




