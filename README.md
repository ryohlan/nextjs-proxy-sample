# nextjs-proxy-sample

同一ドメインに対するアクセスをパス毎に複数の Next.js に割り振るサンプル

起動

```
yarn --cwd next1 dev // localhost:3001

yarn --cwd next2 dev // localhost:3002

yarn --cwd proxy start // localhost:3000
```

localhost:3000/next1 → localhost:3001/next1

localhost:3000/next2 → localhost:3001/next2

## やっていること

`proxy/index.mjs` で `express` でサーバを立てて `http-proxy-middleware` を使ってプロキシを実装している。
ページへの単純なアクセスは

```
app
  .use(
    "/next1",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
    })
  )
```

みたいな感じでアクセスを流せば良い。

また、Next.js は必要なアセットを `/_next` ディレクトリに配置している。これは配置・命名が変更ができないのでデフォルトのままだと `localhost:3000/next1` のページから `localhost:3000/_next/**` のアセットを読もうとする。プロキシサーバーは `localhost:3000/_next/**` のアクセスが `/next1` からなのか `/next2` からなのか判断できないのでここをうまくやる必要がある。 ここで `next.config.js` の`assetPrefix` を使う。これは用途としては CDN にアセットを配置する場合を想定して読み先を変更するものである。

```
const nextConfig = {
  ...
  assetPrefix: "/_next1",
};

```

こうすることでデフォルトでは `/_next/**` から読まれるアセットが `/_next1/_next/**` から読まれるようになる

```
// assetPrefix設定前
<script src="/_next/static/chunks/webpack.js?ts=1649384860667" defer=""></script>

// assetPrefix設定後
<script src="/_next1/_next/static/chunks/webpack.js?ts=1649384860667" defer=""></script>
```

これでプロキシサーバーは `_next1` のアクセスを `localhost:3001` に流せば良いことになる。

しかし今回は CDN を使うわけではないので実際には `localhost:30001/_next/**` に配置されたままなのでプロキシでパスを変更する必要がある。
パスの変更は `pathRewrite` で指定できる

```
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
```

こうすることで `localhost:3000/_next1/_next/**` のアクセスを `localhost:3001/_next/**` に流すことができる。
  ...
