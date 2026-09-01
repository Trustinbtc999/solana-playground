import { PgRouter } from "../../utils";
import { handleRoute } from "../common";

export const sshKeyGenerator = PgRouter.create({
  path: "/ssh-key-generator",
  handle: () => handleRoute({ main: "SshKeyGenerator" }),
});
