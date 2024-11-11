import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://Hyphen:akRCsdjQPym3B5hJ@hyphen.vvshgb9.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export { client };
