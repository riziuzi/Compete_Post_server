const express = require("express")
const app = express()

// importing libraries
const cors = require("cors")
const mongoose = require("mongoose")
const { Public_Post_Model, Private_Post_Model } = require("./database")
const jwt = require('jsonwebtoken');

// using middlewares
app.use(cors())
db = "mongodb+srv://riziuzi:XmUu8mx0k42IDepu@postscluster.qxshe4b.mongodb.net/?retryWrites=true&w=majority"
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log("err"));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())     // to parse the incoming requset's JSON formatted string to JS object (accessed in the req.body)
app.use(express.urlencoded({ extended: true }))

// GET
app.get("/", (req, res) => {
  res.send("Compete_Post_server")
})
app.get("/load-post", async (req, res) => {
  const skipLastId = req.query.skipLastId;
  const isPrivate = req.query.isPrivate === "true" ? true : false;
  const userId = req.query?.userId;
  const defaultLimit = req.query.defaultLimit ? Number(req.query.defaultLimit) : 5;

  try {
    let posts;
    let totalCount;
    if(isPrivate && !userId) return res.status(400).send({success : false, error : "Private is only the property of the a defined userId, you must pass a userId"})
    const query = userId ? { userId: userId } : {};
    if (skipLastId) {
      query._id = { $lt: skipLastId };
    }
    if (isPrivate) {
      posts = await Private_Post_Model.find(query)
        .sort({ lastUpdatedDate: -1 })
        .limit(defaultLimit)
        .lean();
      totalCount = await Private_Post_Model.countDocuments({ userId: userId });
    } 
    else {
      posts = await Public_Post_Model.find(query)
        .sort({ lastUpdatedDate: -1 })
        .limit(defaultLimit)
        .lean();
      totalCount = await Public_Post_Model.countDocuments({});
    }

    res.status(200).send({
      success: true,
      data: posts,
      total: totalCount
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      error: `2p0 Error : ${e}`,
    });
  }
});


// POST
app.post("/create-post", async (req, res) => {
  try {
    const { data, userId } = req.body;

    const newPost = await Private_Post_Model.create({
      data: data,
      userId: userId,
    });

    res.status(201).json({ success: true, postId: newPost._id });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
app.post("/update-post", async (req, res) => {
  try {
    const { postId, data, coUserId } = req.body;
    const existingPost = await Private_Post_Model.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    console.log(coUserId && true)
    existingPost.data = data;
    if (coUserId && existingPost.coUserIds.indexOf(coUserId) === -1) {
      existingPost.coUserIds.push(coUserId);
    }
    const updatedPost = await existingPost.save();

    res.status(200).json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
app.post("/make-public", async (req, res) => {
  try {
    let { postId, token } = req.body;
    let decoded = null
    token = token.replace("Bearer ", "")
    try {
      decoded = jwt.verify(token, 'Random string');
    } catch (error) {
      return res.status(401).json({ success: false, error: `Unauthorized:${error}` });
    }
    const privatePost = await Private_Post_Model.findOne({ _id: postId, userId: decoded.userId });
    if (!privatePost) {
      return res.status(404).json({ success: false, error: 'Post not found or unauthorized' });
    }
    const { data, createdDate, lastUpdatedDate, userId, coUserIds } = privatePost
    const publicPost = new Public_Post_Model({
      data: data,
      userId: userId,
      createdDate: createdDate,
      lastUpdatedDate: lastUpdatedDate,
      coUserIds: coUserIds,
      publishedDate: new Date(),
    });
    const newPublicPost = await publicPost.save();
    const deletionResult = await Private_Post_Model.deleteOne({ _id: postId, userId: decoded.userId });

    res.status(200).json({ success: true, post: newPublicPost, deletedPost: deletionResult });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: `Internal Server Error! ${error}`
    })
  }
})
app.post("/make-private", async (req, res) => {
  try {
    let { postId, token } = req.body;
    let decoded = null
    token = token.replace("Bearer ", "")
    try {
      decoded = jwt.verify(token, 'Random string');
    } catch (error) {
      return res.status(401).json({ success: false, error: `Unauthorized:${error}` });
    }
    const publicPost = await Public_Post_Model.findOne({ _id: postId, userId: decoded.userId });
    if (!publicPost) {
      return res.status(404).json({ success: false, error: 'Post not found or unauthorized' });
    }
    const { data, createdDate, lastUpdatedDate, userId, coUserIds } = publicPost
    const privatePost = new Private_Post_Model({
      data: data,
      userId: userId,
      createdDate: createdDate,
      lastUpdatedDate: lastUpdatedDate,
      coUserIds: coUserIds,
    });
    const newPrivatePost = await privatePost.save();
    const deletionResult = await Public_Post_Model.deleteOne({ _id: postId, userId: decoded.userId });

    res.status(200).json({ success: true, post: newPrivatePost, deletedPost: deletionResult });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: `Internal Server Error! ${error}`
    })
  }
})


app.listen(3002, () => {
  console.log("Server started listening on localhost:3002")
})