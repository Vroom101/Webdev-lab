document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  const buttons = document.querySelectorAll(".submit-btn");

  function validateForm() {
    let isValid = true;

    document.querySelectorAll(".error-msg").forEach(el => {
      el.style.display = "none";
      el.textContent = "";
    });

    const showError = (id, message) => {
      const errorEl = document.getElementById(id);
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
      }
      isValid = false;
    };

    const nameStr = document.getElementById("fullName").value.trim();
    if (nameStr === "") {
      showError("nameError", "Full Name is required.");
    }

    const emailStr = document.getElementById("email").value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailStr === "") {
      showError("emailError", "Email Address is required.");
    } else if (!emailPattern.test(emailStr)) {
      showError("emailError", "Please enter a valid email format.");
    }

    const rationStr = document.getElementById("rationNumber").value.trim();
    if (rationStr === "") {
      showError("rationError", "Ration Card Number is required.");
    }

    const familyStr = document.getElementById("familySize").value.trim();
    if (familyStr === "" || parseInt(familyStr) < 1) {
      showError("familyError", "Please enter a valid family size.");
    }

    const catStr = document.getElementById("category").value;
    if (catStr === "") {
      showError("categoryError", "Please select a category.");
    }

    const addrStr = document.getElementById("address").value.trim();
    if (addrStr === "") {
      showError("addressError", "Residential Address is required.");
    }

    return isValid;
  }


  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {

      if (validateForm()) {
        const method = e.target.getAttribute("data-method");
        const action = e.target.getAttribute("data-action");

        form.method = method;
        form.action = action;

        const originalText = e.target.textContent;
        e.target.textContent = "Submitting...";

        setTimeout(() => {
          form.submit();
        }, 300);
      } else {
        console.log("Validation failed. Please fill all mandatory fields.");
      }
    });
  });
});
