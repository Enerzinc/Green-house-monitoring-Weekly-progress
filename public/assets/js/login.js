const body = document.querySelector("body");
const modal = document.querySelector(".modal");
const modalButton = document.querySelector(".modal-button");
const closeButton = document.querySelector(".close-button");
const scrollDown = document.querySelector(".scroll-down");

const threshold = 100; 
let lastScrollY = window.scrollY;

// Force page to top on refresh
window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});

// open modal
const openModal = () => {
  modal.classList.add("is-open");
  body.style.overflow = "hidden";
  scrollDown.style.display = "none";
};

// close modal
const closeModal = () => {
  modal.classList.remove("is-open");
  body.style.overflow = "initial";
  window.scrollTo({ top: 0, behavior: "smooth" });
  scrollDown.style.display = "flex";
};

// open modal on scroll
window.addEventListener("scroll", () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.body.offsetHeight;
  const scrollingDown = window.scrollY > lastScrollY;
  lastScrollY = window.scrollY;

  if (
    scrollingDown &&
    scrollPosition >= pageHeight - threshold &&
    !modal.classList.contains("is-open")
  ) {
    openModal();
  }
});

// manual open via button
modalButton.addEventListener("click", openModal);

// close via X button
closeButton.addEventListener("click", closeModal);

// close via ESC key
document.addEventListener("keydown", evt => {
  if (evt.key === "Escape") closeModal();
});


// ======================================================
// ✅ DUMMY LOGIN SYSTEM (added)
// ======================================================
document.querySelector(".input-button").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Dummy credentials
  if (email === "admin" && password === "admin123") {
    window.location.href = "../../pages/dashboard.html";  // redirect to dashboard page
  } else {
    alert("Invalid email or password");
  }
});
