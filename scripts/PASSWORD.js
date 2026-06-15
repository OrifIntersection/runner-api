// this is a workaround because github doesn't allow for secrets on private repositories
// (unless you pay a github subscription)
// for the generate-host.js, dotenv doesn't work, because the execution environment is the github actions runner
// essentially, the only way to add environment variables for scripts executed by an actions runner is through github secrets
// (which you have to pay for to use on private repos)
// so the workaround is just to set the database password manually in this file by ssh-ing into the server.
//
// NOTE: this only applies to the generate-host.js script, because it needs to write the new host to the database, which requires auth
// => the only easy way to authenticate without leaking the database password is by setting it manually here
// other scripts could use dotenv (delete-host.js, ...), but for consistency it's simpler to set the password here and be done.

const password = null;

if (!password)
	throw new Error("Forgot to set db password in ~/scripts/PASSWORD.js.");
export default password;
