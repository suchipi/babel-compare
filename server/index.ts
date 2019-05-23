const createServer = require("little-api/server");
const babel6 = require("babel-core");
const babel7 = require("@babel/core");
const prettier = require("prettier");

const server = createServer({
  methods: {
    compileCode(code: string, babelVersion: 6 | 7, config: Object): string {
      if (babelVersion === 6) {
        const result = babel6.transform(code, config).code;
        return prettier.format(result, { parser: "babel" });
      } else if (babelVersion === 7) {
        const result = babel7.transformSync(code, config).code;
        return prettier.format(result, { parser: "babel" });
      } else {
        throw new Error("Invalid babel version");
      }
    }
  }
});

server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
