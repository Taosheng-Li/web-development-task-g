// Format timestamp so table shows YYYY-MM-DD HH:MM:SS without ISO T/Z markers
function formatTimestamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

function setTimestamp(target) {
  const ts = target || document.getElementById("timestamp");
  if (ts) ts.value = formatTimestamp(new Date());
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg || "";
}

function clearErrors() {
  [
    "err-fullName",
    "err-email",
    "err-phone",
    "err-birthDate",
    "err-terms",
  ].forEach((id) => showError(id, ""));
}

function validateFullName(value) {
  const name = (value || "").trim().replace(/\s+/g, " ");
  if (!name) return "Full name is required.";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length < 2) return "Please enter at least two words.";
  if (!parts.every((w) => w.length >= 2))
    return "Each word must be at least 2 characters.";
  return "";
}

function validateEmail(inputEl) {
  const v = inputEl.value.trim();
  if (!v) return "Email is required.";
  if (!inputEl.checkValidity()) return "Please enter a valid email address.";
  if (/\.\./.test(v) || (v.match(/@/g) || []).length !== 1)
    return "Email format looks invalid.";
  return "";
}

function validatePhone(value) {
  const v = value.trim();
  if (!v) return "Phone number is required.";
  if (!/^[+\d][\d\s-]*$/.test(v)) {
    return "Use only numbers, spaces, dashes, and an optional leading +.";
  }
  if (v.includes("+") && !v.startsWith("+")) {
    return "If you include a country code, the + must be at the start.";
  }
  const digitsOnly = v.replace(/[^\d]/g, "");
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return "Phone number needs between 7 and 15 digits.";
  }
  return "";
}

function validateBirthDate(value) {
  if (!value) return "Birth date is required.";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dob = new Date(value);
  dob.setHours(0, 0, 0, 0);
  if (isNaN(dob.getTime())) return "Please choose a valid date.";
  if (dob > today) return "Birth date cannot be in the future.";
  const age = (today - dob) / (365.25 * 24 * 3600 * 1000);
  if (age < 13) return "You must be at least 13 years old.";
  return "";
}

function validateTerms(checked) {
  return checked ? "" : "You must accept the terms.";
}

function appendRow(record) {
  const tbody = document.getElementById("submissionsBody");
  if (!tbody) return;
  const tr = document.createElement("tr");
  [
    record.timestamp,
    record.fullName,
    record.email,
    record.phone,
    record.birthDate,
  ].forEach((value) => {
    const td = document.createElement("td");
    td.textContent = value;
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addCourseForm");
  const timestampEl = document.getElementById("timestamp");
  const fullNameEl = document.getElementById("fullName");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const birthDateEl = document.getElementById("birthDate");
  const termsEl = document.getElementById("terms");

  if (
    !form ||
    !timestampEl ||
    !fullNameEl ||
    !emailEl ||
    !phoneEl ||
    !birthDateEl ||
    !termsEl
  ) {
    console.error("Registration form setup is incomplete.");
    return;
  }

  setTimestamp(timestampEl);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();
    setTimestamp(timestampEl);
    const timestamp = timestampEl.value;

    const sanitizedFullName = fullNameEl.value.trim().replace(/\s+/g, " ");
    const sanitizedEmail = emailEl.value.trim();
    const sanitizedPhone = phoneEl.value.trim();
    const sanitizedBirth = birthDateEl.value;

    fullNameEl.value = sanitizedFullName;
    emailEl.value = sanitizedEmail;
    phoneEl.value = sanitizedPhone;

    const errFull = validateFullName(sanitizedFullName);
    const errEmail = validateEmail(emailEl);
    const errPhone = validatePhone(sanitizedPhone);
    const errBirth = validateBirthDate(sanitizedBirth);
    const errTerms = validateTerms(termsEl.checked);

    const validations = [
      { id: "err-fullName", error: errFull, field: fullNameEl },
      { id: "err-email", error: errEmail, field: emailEl },
      { id: "err-phone", error: errPhone, field: phoneEl },
      { id: "err-birthDate", error: errBirth, field: birthDateEl },
      { id: "err-terms", error: errTerms, field: termsEl },
    ];

    validations.forEach(({ id, error, field }) => {
      showError(id, error);
      field.setAttribute("aria-invalid", error ? "true" : "false");
    });

    const firstInvalid = validations.find((item) => item.error);
    if (firstInvalid) {
      firstInvalid.field.focus();
      return;
    }

    appendRow({
      timestamp,
      fullName: sanitizedFullName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      birthDate: sanitizedBirth,
    });

    form.reset();
    clearErrors();
    [fullNameEl, emailEl, phoneEl, birthDateEl, termsEl].forEach((field) =>
      field.setAttribute("aria-invalid", "false")
    );
    setTimestamp(timestampEl);
    fullNameEl.focus();
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      clearErrors();
      [fullNameEl, emailEl, phoneEl, birthDateEl, termsEl].forEach((field) =>
        field.setAttribute("aria-invalid", "false")
      );
      setTimestamp(timestampEl);
    }, 0);
  });
});
