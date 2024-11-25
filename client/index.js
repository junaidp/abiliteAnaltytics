import { MongoClient } from "mongodb";

const uri = "MONGO_DB_URL";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export { client };
