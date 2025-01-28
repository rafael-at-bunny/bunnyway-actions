type BunnyClient = {
  base: string,
  token: Token,
};

export type DeployKey = {
  _internal: "deploy",
  token: string;
}

export type OIDCToken = {
  _internal: "oidc",
  token: string;
}

export type ApiKey = {
  _internal: "api",
  token: string;
}

export type Token = OIDCToken | DeployKey | ApiKey;

const newDeployKey = (token: string): DeployKey => ({ _internal: "deploy", token });
const newOIDCToken = (token: string): OIDCToken => ({ _internal: "oidc", token });
const newApiKey = (token: string): ApiKey => ({ _internal: "api", token });

const createClient = (base: string, token: Token): BunnyClient => { return ({ base, token }) };

const deployScript = (client: BunnyClient) => async (scriptId: string, code: string) => {
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  switch (client.token._internal) {
    case "deploy":
      headers["DeploymentKey"] = client.token.token;
      break;
    case "oidc":
      headers["GithubToken"] = client.token.token;
      break;
    case "api":
      headers["AccessKey"] = client.token.token;
      break;
  }

  const endpoint_save = `${client.base}/compute/script/${scriptId}/code`;
  const response = await fetch(endpoint_save, {
    method: "POST",
    headers,
    body: JSON.stringify({ Code: code }),
  });

  if (!response.ok) {
    console.error(`Failed to update script: ${response.statusText}`);
    console.error(await response.text());
    throw new Error("");
  }

  const endpoint_publish = `${client.base}/compute/script/${scriptId}/publish`;
  const responsePublish = await fetch(endpoint_publish, {
    method: "POST",
    headers,
  });

  if (!responsePublish.ok) {
    console.error(`Failed to publish script: ${response.statusText}`);
    console.error(await response.text());
    throw new Error("");
  }

  console.log("Script updated and published successfully");
}

export {
  BunnyClient,
  deployScript,
  createClient,
  newDeployKey,
  newOIDCToken,
  newApiKey
}
