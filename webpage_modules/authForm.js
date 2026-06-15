export function authForm() {
	const form = document.createElement("form");
	form.setAttribute("id", "loginForm");

	const emailInput = document.createElement("input");
	emailInput.setAttribute("type", "email");
	emailInput.setAttribute("id", "email");
	emailInput.setAttribute("placeholder", "Email");
	emailInput.setAttribute("required", true);

	const passInput = document.createElement("input");
	passInput.setAttribute("type", "password");
	passInput.setAttribute("id", "password");
	passInput.setAttribute("placeholder", "Password");
	passInput.setAttribute("required", true);

	const submitButton = document.createElement("button");
	submitButton.setAttribute("type", "submit");
	submitButton.textContent = "Login";

	form.appendChild(emailInput);
	form.appendChild(passInput);
	form.appendChild(submitButton);
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;

		const response = await fetch(
			`https://${WEB_URL}/api/collections/_superusers/auth-with-password`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ identity: email, password }),
			},
		);

		const data = await response.json();

		if (response.ok) {
			// Store the auth token
			sessionStorage.setItem("pb_token", data.token);
			console.log("Logged in as:", data.record);
		} else {
			console.error("Auth failed:", data.message);
		}
	});

	document.body.appendChild(form);
}
