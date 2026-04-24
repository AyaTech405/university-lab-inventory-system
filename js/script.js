// ===== Navbar and Search Form =====
const navbar = document.querySelector(".navbar");
const searchForm = document.querySelector(".search-form");

document.querySelector("#menu-btn").onclick = () => {
  navbar.classList.toggle("active");
  searchForm.classList.remove("active");
};

document.querySelector("#search-btn").onclick = () => {
  navbar.classList.remove("active");
  searchForm.classList.toggle("active");
};

window.onscroll = () => {
  navbar.classList.remove("active");
  searchForm.classList.remove("active");
};

// ===== Login / Reset Password =====
const loginForm = document.querySelector(".login-form");
const resetForm = document.getElementById("resetForm");
const forgotLink = loginForm.querySelector("p a");
const showLoginLink = resetForm.querySelector("#showLogin");

forgotLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  resetForm.style.display = "block";
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  resetForm.style.display = "none";
  loginForm.style.display = "block";
});
