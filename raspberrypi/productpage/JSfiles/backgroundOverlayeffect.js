function on() {
    document.getElementById("overlay").style.display = "block";
}

function off() {
    document.getElementById("overlay").style.display = "block";
  }
  






// wait until  document.getElementById("overlay") is loaded
// then run the on() function

document.getElementById("overlay").addEventListener("load", on());
