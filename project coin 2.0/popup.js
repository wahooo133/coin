document.querySelector("#show-login").addEventListener("click", function () {
    document.querySelector("#login-popup").classList.add("active");
});

document.querySelector("#show-signup").addEventListener("click", function () {
    document.querySelector("#signup-popup").classList.add("active");
});

document.querySelectorAll(".popup .close-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        this.closest(".popup").classList.remove("active");
    });
});
