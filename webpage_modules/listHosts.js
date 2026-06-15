export function listHosts(hosts) {
	const gitdomain = "https://github.com/OrifIntersection/";

	// Create container with styling
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
`;
	container.appendChild(headerDiv);

	for (const host of hosts) {
		const div = document.createElement("div");
		div.className = "host-card";

		const weburl = document.createElement("a");
		weburl.href = `https://${host.name}.${WEB_URL}`;
		weburl.textContent = `${host.name}.${WEB_URL}`;

		const giturl = document.createElement("a");
		giturl.href = `${gitdomain}${host.repo}`;
		giturl.textContent = host.repo;

		const portSpan = document.createElement("span");
		portSpan.className = "data-value";
		portSpan.textContent = host.port;

		const certDateSpan = document.createElement("span");
		certDateSpan.className = "data-value";
		certDateSpan.textContent = host.certDate;

		div.appendChild(weburl);
		div.appendChild(portSpan);
		div.appendChild(giturl);
		div.appendChild(certDateSpan);

		container.appendChild(div);
	}

	document.body.appendChild(container);
}
