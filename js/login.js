document.addEventListener("DOMContentLoaded", () => {
  const users = [
    { username: "Admin", password: "123", role: "admin" },
    { username: "User", password: "123", role: "user" },
  ];

  const loginForm = document.querySelector("form.login-form");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = loginForm.querySelector('input[type="text"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value;

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );

    if (user) {
      sessionStorage.setItem("role", user.role);
      
      // Redirect based on role
      if (user.role === "admin") {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "technician-dashboard.html";
      }
    } else {
      alert("Invalid username or password!");
    }
  });
});
