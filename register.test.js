/** @jest-environment jsdom */

function loadRegistrationForm(password, confirmation) {
  document.body.innerHTML = `
    <form id="reg-form">
      <input id="username" value="test@example.com" />
      <input id="password" value="${password}" />
      <input id="confirm" value="${confirmation}" />
      <div id="validation"></div>
      <div id="success"></div>
      <input id="profile-pic-input" type="file" />
      <div id="profile-pic-preview"></div>
      <button id="get-location-btn" type="button"></button>
    </form>
  `;

  const form = document.getElementById("reg-form");
  jest.spyOn(form, "submit").mockImplementation(() => {});
  jest.resetModules();
  require("./public/register.js");

  return form;
}

describe("registration form validation", () => {
  it("blocks submission when the password is too weak", () => {
    const form = loadRegistrationForm("abc123", "abc123");

    form.dispatchEvent(new Event("submit", { cancelable: true }));

    expect(document.getElementById("validation").textContent).toContain(
      "Password must be at least 8 characters"
    );
    expect(form.submit).not.toHaveBeenCalled();
  });

  it("blocks submission when passwords do not match", () => {
    const form = loadRegistrationForm("StrongPass1", "DifferentPass1");

    form.dispatchEvent(new Event("submit", { cancelable: true }));

    expect(document.getElementById("validation").textContent).toContain(
      "Passwords do not match"
    );
    expect(form.submit).not.toHaveBeenCalled();
  });

  it("submits when the email and password are valid", () => {
    const form = loadRegistrationForm("StrongPass1", "StrongPass1");

    form.dispatchEvent(new Event("submit", { cancelable: true }));

    expect(document.getElementById("success").textContent).toContain("Success");
    expect(form.submit).toHaveBeenCalledTimes(1);
  });
});