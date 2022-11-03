let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  console.log("slides",slides);
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

//   wait until slides[(slideIndex - 1)] is defined
    if (slides[(slideIndex - 1)]) {
        slides[(slideIndex - 1)].style.display = "block";
        dots[(slideIndex - 1)].className += " active";
    }

//   slides[slideIndex-1].style.display = "block";
//   dots[slideIndex-1].className += " active";
} 