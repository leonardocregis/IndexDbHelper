# IndexDbHelper
A tool to help to manage the indexDb into browsers

    Class to simplify the use of the IndexDB

    Build it using the window reference from the browser or other thing that will provide the following intefaces:
        window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
        window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: "readwrite" };
        window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    This class is mostly to be used by browsers, but following the above interfaces allows it to work outside the browser.


    Sample using.

    let obj = new BookShelfDb(window);//unless there is other place to get the implementation you should use window
    obj.createNew('sample');
    obj.update({"name":"reading","values":[{"title":"name of the rose"},{"title":"in the name of God"}]});
