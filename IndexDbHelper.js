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

    createNew(databaseName) {
        let idboOpenDBRequest = this.indexedDB.open(databaseName,1);
        idboOpenDBRequest.onerror = (event) => {
			console.log('couldnt create the structure');
        };
        idboOpenDBRequest.onsuccess = (event) => {
			console.log('created database');
        };
		idboOpenDBRequest.onupgradeneeded = (event) => {
				let db = event.target.result;
				console.log('creating structure');
                this.objStore = db.createObjectStore(this.shelfName, { keyPath: "name" });
				this.objStore.transaction.oncomplete = (event) => {
					this.dbOpen = true;
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
			action(this.indexedDB);
		} else {
			this.addAction(action);
		}
	}
	
	fetchData(index) {
		return new Promise((resolve,reject) {
			let transaction = db.transaction(["customers"]);
			let objectStore = transaction.objectStore("customers");
			let request = objectStore.get(index);
			request.onerror = function(event) {
			  reject(event);
			};
			request.onsuccess = function(event) {
			  resolve(request.result);
			};			
		});
	}
}
let obj = new IndexDbHelper(window);
obj.createNew('sample');
obj.update({"name":"reading","values":[{"title":"name of the rose"},{"title":"in the name of God"}]});





