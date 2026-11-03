import express from "express";
import { createRequestHandler } from "@remix-run/express";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);

app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);
app.use(express.static("build/client", { maxAge: "1h" }));

const build = await import("./build/server/index.js");

app.all(
  "*",
  createRequestHandler({
    build,
    mode: "production",
  })
);

const port = Number(process.env.PORT || 5176);
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log("listening on" + port);
});
