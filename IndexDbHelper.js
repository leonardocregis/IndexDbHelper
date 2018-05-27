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

    open(databaseName) {
      const openDBRequest = this.indexedDB.open(databaseName,1);
      return new Promise((resolve, reject) => {
        openDBRequest.onerror = (event) => {
          console.log('couldnt open the database');
          reject(['couldnt open the database', event]);
        };
        openDBRequest.onsuccess = (event) => {
          console.log('opened database');
          this.db = openDBRequest.result;
          resolve(this.db);
        };
        openDBRequest.onupgradeneeded = (event) => {
          reject(["Database structure dont exists, use createNew", event]);
        };
      });
    }

    createNew(databaseName) {
        this.dbOpen = false;
        const openDBRequest = this.indexedDB.open(databaseName,1);
        let isNewDb = false;
        let upgradedPromise = new Promise((resolve, reject) => {
            openDBRequest.onupgradeneeded = (event) => {
              console.log('creating structure');
              isNewDb = true;
              this.db = event.target.result;
              this.objStore = this.db.createObjectStore(this.shelfName, { keyPath: "name" });
              this.objStore.transaction.oncomplete = (event) => {
                resolve(this.db);
              }
              this.objStore.transaction.onerror = (event) => {
                reject(new Error(event));
              }
            }
        });
        return new Promise( (resolve, reject) => {
          openDBRequest.onerror = (event) => {
            reject(new Error('couldnt create the structure', event));
          };
          openDBRequest.onsuccess = (event) => {
            console.log('created database');
            this.dbOpen = true;
            if (isNewDb) {
              upgradedPromise
                .then(db => resolve(db))
                .catch(err => reject(err));
            } else {
              reject(new Error('Database already exists'));
            }
          };

        });
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

    cleanActions() {
      this.callbacks = [];
    }
}

let obj = new IndexDbHelper(window);
obj.createNew('sample').then(result => console.log('Structure created')).catch(err => console.log('Error shouldnt happen', err));
obj.createNew('sample').then(result => console.log('Error Should happen')).catch(err => console.log('Expected Error Happend'));
obj.open('sample').then(result => console.log('Opened the connection')).catch(err => console.log('Unexpected Error Happend'));

// obj.createNew('sample').then( result => {
//   console.log('sample values');
//   console.log('======================================================================================');
//   obj.update({"name":"wantToRead","values":[{"title":"Life is easy"},{"title":"Fucking carol"}]});
//   obj.fetchData("reading").then(result => result.values.forEach(book => console.log(book.title)));
//   obj.fetchData("wantToRead").then(result => result.values.forEach(book => console.log(book.title)));
// });

// obj.createNew('myShelf').then(result => {
//   console.log('myShelf values');
//   console.log('======================================================================================');
//   obj.update({"name":"reading","values":[{"title":"Path to happiness 2"},{"title":"in the name of God"}]});
//   obj.update({"name":"wantToRead","values":[{"title":"Life is easy 3"},{"title":"Shots of carol"}]});
//   obj.fetchData("reading").then(result => result.values.forEach(book => console.log(book.title)));
//   obj.fetchData("wantToRead").then(result => result.values.forEach(book => console.log(book.title)));
// });
// let all = new Promise((resolve, reject)=> {
//   let readingShelf;
//   let wantToReadShelf;
//   let readShelf;
//   let readingPromise = obj.fetchData('reading').then(result => console.log(result));
//   let wantToReadPromise = obj.fetchData('wantToRead').then(result => console.log(result));
//   let readPromise = obj.fetchData('read').then(result => console.log(result));

//   Promise.all(readingPromise, wantToReadPromise, readPromise)
//     .then(result => 
//       {
//         readingShelf = result[0];
//         wantToReadShelf = result[1];
//         readShelf = result[2];
//         resolve([readingShelf, wantToReadShelf, readShelf]);
//       })
//     .catch(err => resolve(err));

// });
// all.then(results => {
//       results.forEach( result => console.log(result));
//  })
//  .catch(err => console.log(err));
