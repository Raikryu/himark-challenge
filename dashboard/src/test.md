```js

FileAttachment("data/cleaned_mc1-reports-data.csv").text().then(text => {
  console.log("📄 RAW CSV CONTENT:\n", text.slice(0, 1000)); // show first 1000 characters
});
