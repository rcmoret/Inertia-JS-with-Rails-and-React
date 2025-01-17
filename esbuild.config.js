const path = require('path')
const rails = require('esbuild-rails')

require("esbuild").build({
  loader: { '.js': 'jsx' },
  entryPoints: ["application.js"],
  bundle: true,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  plugins: [rails()],
}).catch(() => process.exit(1))
