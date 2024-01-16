import { MongoClient } from 'mongodb';

const clearCollection = async (collectionName: string) => {
    const client: any = await MongoClient.connect(
        "mongodb://localhost:27017/",
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        } as any
    );
    const db = await client.db("element-test");
    const collection = db.collection(collectionName);
    //   const documents = await collection.find({}).toArray();
    await collection.deleteMany({});
    await client.close();
};

export {
    clearCollection,
}