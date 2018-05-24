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


//Updating uses internally a promise, next iteration i will have a promise with the result of the process
obj.update({"name":"reading","values":[{"title":"name of the rose"},{"title":"in the name of God"}]});

// fetch has to wait for the return from the DB so it uses a promise, any error uses the catch.
obj.fetch("reading").then(result => console.log(result));


There is a index.html to run the project locally, just clone it and see it in action.
