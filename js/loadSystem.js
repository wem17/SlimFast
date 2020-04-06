
//saveLocalData("fac","SCT");
saveLocalData("sec","3P," + "&nbsp;Pomona");
//saveLocalData("sys","STARS");
document.getElementById("fac1").innerHTML = document.getElementById("fac1").innerHTML + "&nbsp;"+ retrieveLocalData("fac");
document.getElementById("sec1").innerHTML = document.getElementById("sec1").innerHTML + "&nbsp;"+ retrieveLocalData("sec");
document.getElementById("sys1").innerHTML = document.getElementById("sys1").innerHTML + "&nbsp;"+ retrieveLocalData("sys");