export function authForm(pb) {
	const form = document.createElement("form");
	form.setAttribute("id", "loginForm");

	const emailInput = document.createElement("input");
	emailInput.setAttribute("type", "email");
	emailInput.setAttribute("placeholder", "Email");
	emailInput.setAttribute("required", true);

	const passInput = document.createElement("input");
	passInput.setAttribute("type", "password");
	passInput.setAttribute("placeholder", "Password");
	passInput.setAttribute("required", true);

	const submitButton = document.createElement("button");
	submitButton.setAttribute("type", "submit");
	submitButton.textContent = "Login";

	const statusSpan = document.createElement("span");
	statusSpan.className = "auth-status";

	form.appendChild(emailInput);
	form.appendChild(passInput);
	form.appendChild(submitButton);
	form.appendChild(statusSpan);

	function updateFormState() {
		const isAuthed = pb.authStore.isValid;
		emailInput.style.display = isAuthed ? "none" : "";
		passInput.style.display = isAuthed ? "none" : "";
		submitButton.style.display = isAuthed ? "none" : "";
		statusSpan.textContent = isAuthed
			? `Logged in as ${pb.authStore.record?.email}`
			: "";
	}

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		try {
			await pb
				.collection("_superusers")
				.authWithPassword(emailInput.value, passInput.value);
		} catch (err) {
			console.error("Auth failed:", err.message);
		}
	});

	pb.authStore.onChange(updateFormState);
	updateFormState();

	if (pb.authStore.isValid) {
		pb.collection("_superusers").authRefresh().catch(() => {
			pb.authStore.clear();
		});
	}

	document.body.prepend(form);
}
