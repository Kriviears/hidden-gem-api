const { DATABASE_URL } = require("./config.js");
const { MongoClient } = require("mongodb");
// const client = new MongoClient(DATABASE_URL)
// async function run() {
//   try {
//       await client.connect();
//       console.log("Connected correctly to server");
//       const db = client.db("local_library")

//       const col = db.collection("Gems")

//       // let newGem = {
//       //   "text": "this is a gem"
//       // }

//       // const p = await col.insertOne(newGem)

//       const myDoc = await col.findOne()

//       console.log("document proof", myDoc)
//   } catch (err) {
//       console.log(err.stack);
//   }finally {
//     await client.close();
// }
// }

// run().catch(console.dir);

const client = new MongoClient(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const collection = client
    .db("local_library")
    .collection("Gems")
    .collection("users");
  // perform actions on the collection object
  client.close();
});
