package com.demoapplication.repository;
import com.demoapplication.model.Transaction;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.mongodb.repository.Query;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    @Aggregation(pipeline = {
            "{ '$group': { '_id': { 'orderId': '$Order ID', 'customerId': '$Customer ID', 'quantitySold': '$Quantity Sold', 'perUnitPrice': '$Per Unit Price' }, 'count': { '$sum': 1 } } }",
            "{ '$match': { 'count': { '$gt': 1 } } }",
            "{ '$project': { '_id': 0, 'orderId': '$_id.orderId', 'customerId': '$_id.customerId', 'quantitySold': '$_id.quantitySold', 'perUnitPrice': '$_id.perUnitPrice', 'duplicateCount': '$count' } }",
            "{ '$sort': { 'duplicateCount': -1 } }"
   })
    List<Transaction> getDuplicateEntries();
    @Aggregation(pipeline = {
            "{ '$match': { 'Customer ID': 7 } }",
            "{ '$group' : { '_id' : { 'orderId': '$Order ID', 'customerId': '$Customer ID', 'quantitySold': '$Quantity Sold', 'perUnitPrice': '$Per Unit Price' }, 'duplicateCount': { '$sum' : 1 } } }",
            "{ '$match': { 'duplicateCount': { '$gt': 1 } } }",
            "{ '$project': { '_id': 0, 'orderId': '$_id.orderId', 'customerId': '$_id.customerId', 'quantitySold': '$_id.quantitySold', 'perUnitPrice': '$_id.perUnitPrice', 'duplicateCount': '$duplicateCount' } }"
    })
    List<Transaction> getTransactionsByCustomerId();
    @Query("{'customerId':  ?0}")
    List<Transaction> findAllByCustomerId(int customerId);


    @Aggregation(pipeline = {
            "{ '$match': { 'orderId': 'Order ID' } }",
            "{ '$group' : { '_id' : { 'orderId': '$Order ID', 'customerId': '$Customer ID', 'quantitySold': '$Quantity Sold', 'perUnitPrice': '$Per Unit Price' }, 'duplicateCount': { '$sum' : 1 } } }",
            "{ '$match': { 'duplicateCount': { '$gt': 1 } } }",
            "{ '$project': { '_id': 0, 'orderId': '$_id.orderId', 'customerId': '$_id.customerId', 'quantitySold': '$_id.quantitySold', 'perUnitPrice': '$_id.perUnitPrice', 'duplicateCount': '$duplicateCount' } }"
    })

    List<Transaction> getTransactionsByorderId();
    @Query("{'orderId': ?1}")
        List<Transaction> findAllByOrderId(int OrderId);


    @Query("{ $and: [ {'customerId': ?0}, {'orderId': ?1} ] }")
    List<Transaction> findDuplicateEntriesByCustomerId(int customerId, int orderId);










}

