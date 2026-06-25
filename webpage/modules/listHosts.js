export function listHosts(hosts, pb) {
	const gitdomain = "https://github.com/OrifIntersection/";

	const container = document.createElement("div");
	container.className = "host-list";

	// Header row
	const headerDiv = document.createElement("div");
	headerDiv.className = "host-card";
	headerDiv.style.background = "#e9ecef";
	headerDiv.style.fontWeight = "600";
	headerDiv.innerHTML = `
  <span>Web URL</span>
  <span><span class="port-label">Port</span></span>
  <span>GitHub Repo</span>
  <span><span class="cert-label">Cert Date</span></span>
  <span></span>
`;
	container.appendChild(headerDiv);

	const deleteButtons = [];

	for (const host of hosts) {
		const div = document.createElement("div");
		div.className = "host-card";

		const weburl = document.createElement("a");
		weburl.href = `${PROTOCOL}://${host.name}.${WEB_URL}`;
		weburl.textContent = `${host.name}.${WEB_URL}`;

		const portSpan = document.createElement("span");
		portSpan.className = "data-value";
		portSpan.textContent = host.port;

		const giturl = document.createElement("a");
		giturl.href = `${gitdomain}${host.repo}`;
		giturl.textContent = host.repo;

		const certDateSpan = document.createElement("span");
		certDateSpan.className = "data-value";
		certDateSpan.textContent = host.certDate;

		const deleteBtn = document.createElement("button");
		deleteBtn.className = "delete-btn";
		deleteBtn.textContent = "Delete";
		deleteBtn.style.display = "none";
		deleteBtn.addEventListener("click", async () => {
			if (!confirm(`Delete host "${host.name}" for repo "${host.repo}"?`)) return;
			try {
				await pb.collection("hosts").delete(host.id);
				div.remove();
			} catch (err) {
				if (err.status === 401 || err.status === 403) {
					pb.authStore.clear();
				}
				console.error("Delete failed:", err.message);
			}
		});

		deleteButtons.push(deleteBtn);

		div.appendChild(weburl);
		div.appendChild(portSpan);
		div.appendChild(giturl);
		div.appendChild(certDateSpan);
		div.appendChild(deleteBtn);

		container.appendChild(div);
	}

	document.body.appendChild(container);

	function updateButtons() {
		const visible = pb.authStore.isValid;
		for (const btn of deleteButtons) {
			btn.style.display = visible ? "" : "none";
		}
	}

	pb.authStore.onChange(updateButtons);
	updateButtons();
}
