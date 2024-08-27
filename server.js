const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cityControllers = require('./controllers/index.js');


mongoose.connect('mongodb+srv://vivekreddy897:16p31A0108%40123@cluster0.vg6pgcs.mongodb.net/', { useNewUrlParser: true});

app.use(express.json());
app.use('/cityes', cityControllers);

app.listen(3654, () => {
  console.log('Server started on port 3654');
});
