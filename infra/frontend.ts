import { bucket } from "./storage";

export const frontend = new sst.aws.Nextjs("frontend", {
    link: [bucket],
    path: "packages/frontend/",
  });
