import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('hello world');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`);
});

