package com.demoapplication.dto;

public class TransactionDTO {

    private int count;
    private String id;
    private String customerName;  // Assuming title refers to customerName
    private int quantitySold;
    private int orderID;

    // Constructor
    public TransactionDTO(String id, String customerName, int quantitySold, int orderID, int count) {
        this.id = id;
        this.customerName = customerName;
        this.quantitySold = quantitySold;
        this.orderID = orderID;
        this.count = count;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public int getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(int quantitySold) {
        this.quantitySold = quantitySold;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public int getOrderID() {
        return orderID;
    }

    public void setOrderID(int orderID) {
        this.orderID = orderID;
    }
}
