const mongoose = require('mongoose');
const express = require("express")
const app = express()
const cors = require("cors")
const { Public_Post_Model, Private_Post_Model } = require("./database")
const jwt = require('jsonwebtoken');
run().catch(err => console.log(err));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())     // to parse the incoming requset's JSON formatted string to JS object (accessed in the req.body)
app.use(express.urlencoded({ extended: true }))
async function run() {
  db = "mongodb+srv://riziuzi:XmUu8mx0k42IDepu@postscluster.qxshe4b.mongodb.net/?retryWrites=true&w=majority"
  mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log("err"));

  const subSchema = new mongoose.Schema({
    data: {
      type: Object,
      default: {}
    },
    style: {
      type: Object,
      default: {}
    }
  }, {
    _id: false,
    strict: false,
    minimize: false
  });

  const schema = new mongoose.Schema({
    data: {
      type: subSchema
    }
    // other fields
  });

  const Model = mongoose.model('Test', schema);
  await Model.create({ data: {} });
  const doc = await Model.findOne();
  // await Private_Post_Model.create({ data: {} });
  // const doc = await Private_Post_Model.findOne();
  console.log(doc);
}