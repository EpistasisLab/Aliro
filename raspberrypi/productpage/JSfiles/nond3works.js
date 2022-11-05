document.getElementById("class1text").addEventListener("mouseover", mouseOverClass1);
document.getElementById("class1text").addEventListener("mouseout", mouseOutClass1);

document.getElementById("class2text").addEventListener("mouseover", mouseOverClass2);
document.getElementById("class2text").addEventListener("mouseout", mouseOutClass2);

document.getElementById("class3text").addEventListener("mouseover", mouseOverClass3);
document.getElementById("class3text").addEventListener("mouseout", mouseOutClass3);



function mouseOverClass1() {

console.log(document.getElementsByClassName("0"));
// change all the circle elements with class "0" to red


for (var i = 0; i < document.getElementsByClassName("0").length; i++) {


    
    // make .style("stroke", "red")
    document.getElementsByClassName("0")[i].style.stroke = "white";

}

}

function mouseOutClass1() {
console.log(document.getElementsByClassName("0"));

for (var i = 0; i < document.getElementsByClassName("0").length; i++) {
    document.getElementsByClassName("0")[i].style.stroke = "black";

}
}



function mouseOverClass2() {

    console.log(document.getElementsByClassName("0"));
    // change all the circle elements with class "0" to red
    
    
    for (var i = 0; i < document.getElementsByClassName("0").length; i++) {
    
    
        
        // make .style("stroke", "red")
        document.getElementsByClassName("1")[i].style.stroke = "white";
    
    }
    
    }
    
function mouseOutClass2() {
console.log(document.getElementsByClassName("0"));

for (var i = 0; i < document.getElementsByClassName("0").length; i++) {
    document.getElementsByClassName("1")[i].style.stroke = "black";

}
}



function mouseOverClass3() {

    console.log(document.getElementsByClassName("0"));
    // change all the circle elements with class "0" to red
    
    
    for (var i = 0; i < document.getElementsByClassName("0").length; i++) {
    
    
        
        // make .style("stroke", "red")
        document.getElementsByClassName("2")[i].style.stroke = "white";
    
    }
    
    }
    
function mouseOutClass3() {
console.log(document.getElementsByClassName("0"));

for (var i = 0; i < document.getElementsByClassName("0").length; i++) {
    document.getElementsByClassName("2")[i].style.stroke = "black";

}
}


