let express = require('express');

let app = express();
let personRoute = require('./routes/person');
let path = require('path');

app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`);
    // res.send(''); // if you want to send back a response
    next(); // in order for the next request to be called.
});
app.use(personRoute);
app.use(express.static('public'));



// for a 404 handler for Resource Not Found
app.use((req, res, next) => {
    res.status(404).send('We think you are lost');
});

// handler for Error 500
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.sendFile(path.join(__dirname, '../public/500.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.info(`Server has started on ${PORT}`));
