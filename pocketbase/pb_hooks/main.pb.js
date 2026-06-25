// hooks/main.pb.js
onRecordDelete((e) => {
  if ($os.getenv("ENVIRONMENT") !== "dev") {
    const repo = e.record.get("repo");
    const name = e.record.get("name");
    const webUrl = $os.getenv("RUNNER_URL");
    $os.exec("sudo", "a2dissite", repo, `${repo}-le-ssl`).run();
    $os.exec(
      "sudo",
      "rm",
      `/etc/apache2/sites-available/${repo}.conf`,
      `/etc/apache2/sites-available/${repo}-le-ssl.conf`
    ).run();
    $os.exec("docker", "stop", `${name}-container`).run();
    $os.exec("docker", "rm", `${name}-container`).run();
    $os.exec("docker", "rmi", `${name}-image`).run();
    $os.exec(
      "certbot",
      "delete",
      "--cert-name",
      `${name}.${webUrl}`,
      "--non-interactive"
    ).run();
    $os.exec("apache2ctl", "restart").run();
  } else {
    console.log("Host metadata cannot be deleted in a dev environment.");
  }
  e.next();
}, "hosts");
