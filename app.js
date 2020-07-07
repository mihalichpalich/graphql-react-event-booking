const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT || 3000, function (err) {
    if (err) {
        return console.log(err)
    }
    console.log('Server run');
});