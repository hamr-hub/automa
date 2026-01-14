
try {
  const parser = require('@babel/parser');
  console.log("Babel parser available");
} catch (e) {
  console.log("Babel parser NOT available: " + e.message);
}

try {
  const vueCompiler = require('@vue/compiler-sfc');
  console.log("Vue compiler SFC available");
} catch (e) {
  console.log("Vue compiler SFC NOT available: " + e.message);
}
