import { api } from "./api";
import { bucket } from "./storage";

export const frontend = new sst.aws.Nextjs("frontend", {
    link: [bucket, api],
    path: "packages/frontend/",
  });
