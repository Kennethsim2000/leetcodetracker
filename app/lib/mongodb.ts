import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Unable to locate MONGODB_URI");
}
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {});
const clientPromise: Promise<MongoClient> = client.connect();

export default clientPromise;
