class IndexDbHelper {

    constructor(window, shelfName) {
      this.refWindow = window;
          if (!this.readyDatabase()) {
              throw new Error("cant create a IndexedDB");
          }
      if (shelfName) {
        this.shelfName = shelfName
      } else {
        this.shelfName = 'shelf';
      }
      this.dbOpen = false;
      this.readyDatabase();
      this.databaseName = undefined;
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
      if (this.db && this.databaseName == databaseName) {
        throw new Error("database already open");
      }
      const openDBRequest = this.indexedDB.open(databaseName,1);
      let hasUpgrade = false;//suposed that the event onUpgradeneeded always happens before onsucess
      let upgradedPromise = new Promise((resolve, reject) => {
        openDBRequest.onupgradeneeded = (event) => {
          console.log('creating structure');
          this.db = event.target.result;
          this.objStore = this.db.createObjectStore(this.shelfName, { keyPath: "name" });
          this.objStore.transaction.oncomplete = (event) => {
            resolve(this.db);
          }
          this.objStore.transaction.onerror = (event) => {
            reject(new Error(event.target.error));
          }
        }
      });
      return new Promise( (resolve, reject) => {
        openDBRequest.onerror = (event) => {
          reject(new Error(event.target.error));
        };
        openDBRequest.onsuccess = (event) => {
          console.log('connection created');
          this.dbOpen = true;
          upgradedPromise
           .then(db => resolve(db))
           .catch(err => reject(err));
        };
      });

    }

    update(data){
      return new Promise((resolve, reject) => {
        console.log('inserting values');
        const transaction = this.db.transaction(this.shelfName, 'readwrite');
        const customerObjectStore = transaction.objectStore(this.shelfName);
        customerObjectStore.put(data);

        transaction.oncomplete = function(event) {
          resolve(data);
        };
        
        transaction.onerror = function(event) {
          resolve(new Error(event.target.error));
        };
      });
    }

    insert(data){
      return new Promise((resolve, reject) => {
        console.log('inserting values');
        const transaction = this.db.transaction(this.shelfName, 'readwrite');
        const customerObjectStore = transaction.objectStore(this.shelfName);
        customerObjectStore.add(data);

        transaction.oncomplete = event =>  resolve(data);
        
        transaction.onerror = event => reject(event.target.error);
      });
    }

    delete(index) {
      return new Promise((resolve, reject) => {
        console.log('deleting index', index);
        const transaction = this.db.transaction(this.shelfName, 'readwrite');
        const customerObjectStore = transaction.objectStore(this.shelfName);
        customerObjectStore.del(index);

        transaction.oncomplete = function(event) {
          resolve(data);
        };
        
        transaction.onerror = function(event) {
          reject(event.target.error);
        };
      });
      
    }

    fetchData(index) {
      if(this.dbOpen) {
        console.log('fetching index', index);
        return new Promise((resolve,reject) => {
          const transaction = this.db.transaction([this.shelfName]);
          const objectStore = transaction.objectStore(this.shelfName);
          const request = objectStore.get(index);
          transaction.onerror = function(event) {
            reject(event.target.error);
          };
          request.onerror = function(event) {
            reject(event.target.error);
          };
          request.onsuccess = function(event) {
           resolve(request.result);
          }
        });
      } else {
        return Promise.reject("Database not open");
      }
    }

    cleanActions() {
      this.promises = [];
    }
}
// Some scenarios just for testing
// TODO create Unit tests
// let obj = new IndexDbHelper(window);
// obj.open('sample').then(result => console.log('Opened the connection')).catch(err => console.log('Unexpected Error Happend'));

//scenario - open and create
// let obj = new IndexDbHelper(window);
// obj.open('sample')
//    .then(result => console.log('Should have a error, since its opening something not supposed to open'))
//    .catch(err => {
//     console.log('expected error [' + err + ']');
//     // obj.createNew('sample').then(result => console.log('should be fine')).catch(err => console.log('Undexpected error happend', err));
//    });

// let creatingReq = obj.indexedDB.open('sample2');

// creatingReq.onsuccess = () => {
//   let request = obj.indexedDB.deleteDatabase('sample2')
//   request.onsuccess =  data =>  console.log('erased ?', data);
//   request.onerror = err => console.log('bad thing',err); 
// };
// creatingReq.onerror = () => {console.log('bad thing happend')};
// console.log('testings');
// let request = obj.indexedDB.deleteDatabase('sample2');
// request.onsuccess =  data =>  console.log('erased ?', data);
// request.onerror = err => console.log('bad thing',err); 


// obj.open('sample').then( result => {
//   console.log('sample values');
//   console.log('======================================================================================');
//   obj.insert({"name":"readed","values":[{"title":"Life is easy"},{"title":"Fucking carol"}]})
//     .then(data => {
//       obj.insert({"name":"readed","values":[{"title":"Life is easy2"},{"title":"Fucking carol2"}]});
//     }).catch(err => console.log('expected error: object already exists', err));
  // obj.insert({"name":"wantToRead","values":[{"title":"Life is easy"},{"title":"Fucking carol"}]})
  //   .then(data => {
  //      let promise1 = obj.fetchData("wantToRead");
  //      let promise2 = obj.fetchData("something"); 
  //      Promise.all([promise1, promise2])
  //       .then(results => {
  //         console.log(results);
  //         if (result && result.values) {
  //           result.values.forEach(book => console.log(book.title));
  //         }
  //       });
  //       obj.update({"name":"wantToRead","values":[{"title":"Life is easy2"},{"title":"Fucking carol"}]})
  //         .then(data => {
  //           obj.fetchData("wantToRead").then(result => console.log(result));
  //         }
  //       );
    
  //   }).catch( err => console.log('something bad happend', err));

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
