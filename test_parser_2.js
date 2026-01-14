
try {
  const babel = require('@babel/core');
  if (babel.parse) {
      console.log("Babel core parse available");
  } else {
      console.log("Babel core loaded but parse method missing");
  }
} catch (e) {
  console.log("Babel core NOT available: " + e.message);
}
