package com.demoapplication.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;


@Document(collection = "Transaction_Data")
public class Transaction {
    @Id
    @Field("_id")
    private String id;
    @Field("count")
    private int count;
    @Field("Order ID")
    private int orderId;
    @Field("Customer ID")
    private int customerId;
    @Field("Quantity Sold")
    private Integer quantitySold;
    @Field("Per Unit Price")
    private Double perUnitPrice;

    private String duplicateCount;

    public String getDuplicateCount() {
        return duplicateCount;
    }

    public int getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(int quantitySold) {
        this.quantitySold = quantitySold;
    }


    public String getId() {
        return id;
    }

    public int getOrderId() {
        return orderId;
    }

    public int getCustomerId() {
        return customerId;
    }

    public int count() {return count;}

    public Double getPerUnitPrice() {
        return perUnitPrice;
    }
}
