package com.demoapplication.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;



@Document(collection = "Transaction_Data")
public class Transaction {
    @Id
    @Field("_id")
    private String id;
    @Field("count")
    private int count;
    private int orderId;
    private int customerId;
    @Field("Quantity Sold")
    private Integer quantitySold;
    @Field("Per Unit Price")
    private Double perUnitPrice;


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
