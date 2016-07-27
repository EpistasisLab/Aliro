package org.epistasis.emergent;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.MongoCredential;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import com.mongodb.Block;
import com.mongodb.client.FindIterable;

import static com.mongodb.client.model.Filters.*;
import static com.mongodb.client.model.Sorts.ascending;
import static java.util.Arrays.asList;

public class DbAdapter {
	 public static void main(String[] args) {
		 MongoClientURI uri = new MongoClientURI("mongodb://bobberUser:jaFKeclo9ev@127.0.0.1/?authSource=bobber");
	MongoClient mongoClient = new MongoClient();
	MongoDatabase db = mongoClient.getDatabase("bobber");
	FindIterable<Document> iterable = db.getCollection("test").find();
	iterable.forEach(new Block<Document>() {
	    @Override
	    public void apply(final Document document) {
	        System.out.println(document);
	    }
	});
	 }
}
