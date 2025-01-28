import * as core from "@actions/core";
import * as fs from "fs/promises";
import * as Bunny from "./bunny";

export async function run() {
  try {
    const scriptId = core.getInput("script_id", { required: true });
    const deployKey = core.getInput("deploy_key", { required: false });
    const apiKey = core.getInput("api_key", { required: false });
    const base = core.getInput("base", { required: false });

    let token: Bunny.Token;

    if (deployKey !== "") {
      token = Bunny.newDeployKey(deployKey);
    } else if (apiKey !== "") {
      token = Bunny.newApiKey(apiKey);
    } else {
      token = Bunny.newOIDCToken(await core.getIDToken());
    }

    const client = Bunny.createClient(base, token);

    const file_path = core.getInput("file", { required: true });

    const fileContent = await fs.readFile(file_path, { encoding: "utf-8" });

    await Bunny.deployScript(client)(scriptId, fileContent);
  } catch (error: unknown) {
    console.error(error as Error);
    core.setFailed((error as Error).message);
  }
}
