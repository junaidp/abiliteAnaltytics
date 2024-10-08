package com.demoapplication.controller;
import com.demoapplication.model.Payments;
import com.demoapplication.model.Transaction;
import com.demoapplication.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.demoapplication.repository.TransactionRepository;


import com.demoapplication.repository.PaymentsRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

import java.util.concurrent.TimeUnit;


@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    TransactionService transactionService;
    TransactionRepository transactionRepository;


    public TransactionController(TransactionService transactionService, TransactionRepository transactionRepository ) {
        this.transactionService = transactionService;  // Initialize the field
        this.transactionRepository = transactionRepository;
    }



    // API to get all transactions by customer ID
    @GetMapping("/customer/{customerId}")
    public List<Transaction> getTransactionsByCustomerId(@PathVariable int customerId) {
        return transactionService.getTransactionsByCustomerId(customerId);
    }

    @GetMapping("/orderId/{orderId}")
    public List<Transaction> getTransactionsByorderId(@PathVariable int orderId) {
        return transactionService.getTransactionsByOrderId(orderId);
    }
    @GetMapping("/orderCustomer")
    public ResponseEntity<List<Transaction>> getDuplicateTransactionsByCustomerId(@RequestParam("customerId") int customerId, @RequestParam("orderId") int orderId) {
        List<Transaction> duplicateTransactions = transactionService.getDuplicateTransactionsByCustomerId(customerId, orderId);
        if (duplicateTransactions.isEmpty()) {
            return ResponseEntity.noContent().build(); // Return 204 if no duplicates found
        } else {
            return ResponseEntity.ok(duplicateTransactions); // Return 200 with the duplicate transactions
        }
    }

    @GetMapping("/duplicateEntries")
    public List<Transaction> getDuplicateEntries() {
        return transactionService.getDuplicateEntries();
        // Convert entities to DTOs using the mapper

       // return TransactionMapper.toDTOList(transactions);
    }
}

