// store or retrieve LocalStorage to retain data from previous sessions

function saveLocalData(strKey,strVal) {
    // Check browser support
    if (typeof(Storage) !== "undefined") {
    // Store
    localStorage.setItem(strKey, strVal);
   // alert("Storing the data " + strKey + " " + strVal );

    } 
        else {
    alert("Sorry, your browser does not support Web Storage...");
        }
 } 
   
var retval;
  function retrieveLocalData(strKey2) {
       retval= localStorage.getItem(strKey2);
       return  retval;      
    } 