let express = require('express');

let app = express();

app.use(express.static('public'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.info(`Server has started on ${PORT}`));
