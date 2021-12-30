const path = require("path");
const fs = require("fs/promises");
const esbuild = require("esbuild");
const glob = require("tiny-glob");
const cssModules = require("@parcel/css");
const { stripIndent } = require("common-tags");

const cssModulesPlugin = {
  name: "css-modules",
  setup(build) {
    build.onResolve(
      { filter: /\.modules?\.css$/, namespace: "file" },
      async (args) => {
        const fullPath = path.resolve(args.resolveDir, args.path);
        const code = await fs.readFile(fullPath, "utf8");

        const { code: cssContent, exports: cssExports } = cssModules.transform({
          filename: args.path,
          minify: build.initialOptions.minify ?? false,
          code: Buffer.from(code),
          cssModules: true,
        });

        const styles = JSON.stringify(
          Object.entries(cssExports).reduce((memo, [key, value]) => {
            memo[key] = value.map((item) => item.value).join(" ");
            return memo;
          }, {}),
          null,
          "  "
        );

        return {
          path: `${fullPath}.js`,
          namespace: "css-modules",
          pluginData: {
            jsContent: stripIndent`import "${fullPath}.css";
                export default ${styles};
                `,
            cssContent: cssContent.toString(),
            originalFile: args.path,
            resolvedPath: path.resolve(args.resolveDir, args.path),
            resolveDir: args.resolveDir,
          },
        };
      }
    );

    build.onLoad(
      { filter: /\.modules?\.css\.js$/, namespace: "css-modules" },
      async (args) => {
        return {
          resolveDir: args.pluginData.resolveDir,
          contents: args.pluginData.jsContent,
          loader: "js",
          pluginData: args.pluginData,
        };
      }
    );

    build.onResolve(
      { filter: /\.modules?\.css\.css/, namespace: "css-modules" },
      (args) => {
        return {
          path: args.path,
          namespace: "css-modules",
          pluginData: args.pluginData,
        };
      }
    );

    build.onLoad(
      { filter: /\.modules?\.css\.css/, namespace: "css-modules" },
      async (args) => {
        return {
          contents: args.pluginData.cssContent,
          loader: "css",
        };
      }
    );

    // catch all
    build.onResolve({ filter: /.+/ }, async (args) => {
      const isEntry = args.kind === "entry-point";
      const isExternal = !isEntry && !args.path.startsWith(".");
      return {
        external: isExternal,
      };
    });
  },
};

(async () => {
  const rootPath = path.join(__dirname, "../app/components/routes");
  const files = await fs.readdir(rootPath, { withFileTypes: true });
  const entryPoints = await Promise.all(
    files.map(async (file) => {
      if (file.isDirectory()) {
        const files = await glob(
          `${rootPath}/${file.name}/index.{tsx,ts,jsx,js}`
        );
        if (files.length) {
          return files[0];
        }
        return false;
      } else if (file.isFile()) {
        return path.join(rootPath, file.name);
      }
      return false;
    })
  );
  await fs.rm(path.join(__dirname, "../app/routes-built"), {
    recursive: true,
    force: true,
  });
  const args = process.argv.slice(2);
  await esbuild.build({
    bundle: true,
    format: "esm",
    write: true,
    logLevel: "debug",
    target: "es2020",
    minify: args.includes("--minify"),
    watch: args.includes("--watch"),
    sourcemap: false,
    entryPoints: entryPoints.filter(Boolean),
    outdir: path.join(__dirname, "../app/routes-built/"),
    outbase: path.join(__dirname, "../app/components/routes/"),
    plugins: [cssModulesPlugin],
  });
})();

process.on("uncaughtException", function (err) {
  console.error(err);
  process.exit(1);
});
