import { MongoClient } from "mongodb";

const uri =
  "hyphen-mongodb-url";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export { client };
