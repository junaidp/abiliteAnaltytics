package com.demoapplication.model; // Adjust the package name based on your project structure

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Document(collection = "Payments")
public class Payments {

    @Id
    @Field("_id")
    private String id;
    @Field("Customer ID")
    private String customerId;
    @Field("Due Date")
    private Date dueDate;

    @Field("Transaction Amount")
    private Date transactionAmount;

    public Date getTransactionAmount() {
        return transactionAmount;
    }

    public String getId() {
        return id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public Date getDueDate() {
        return dueDate;
    }
}
