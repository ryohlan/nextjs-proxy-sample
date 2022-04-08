import express from "express";
import morgan from "morgan";

import { createProxyMiddleware } from "http-proxy-middleware";

const PORT = 3000;
const HOST = "localhost";
const app = express();

app.use(morgan("dev"));

// next1へのプロキシ設定
app
  .use(
    "/next1",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
    })
  )
  .use(
    "/_next1",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
      pathRewrite: {
        _next1: "",
      },
    })
  );

// next2へのプロキシ設定
app
  .use(
    "/next2",
    createProxyMiddleware({
      target: "http://localhost:3002",
      changeOrigin: true,
    })
  )
  .use(
    "/_next2",
    createProxyMiddleware({
      target: "http://localhost:3002",
      changeOrigin: true,
      pathRewrite: {
        _next2: "",
      },
    })
  );

app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
