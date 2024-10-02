package com.demoapplication.controller;
import com.demoapplication.TransactionMapper;
import com.demoapplication.dto.TransactionDTO;
import com.demoapplication.model.Transaction;
import com.demoapplication.service.TransactionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.demoapplication.repository.TransactionRepository;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/api/transactions")
public class TransactionController {


    TransactionRepository transactionRepository;
    TransactionService transactionService;

    public TransactionController(TransactionService transactionService, TransactionRepository transactionRepository ) {
        this.transactionService = transactionService;  // Initialize the field
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/duplicateEntries")
    public List<Transaction> getDuplicateEntries() {
        return transactionService.getDuplicateEntries();
        // Convert entities to DTOs using the mapper

       // return TransactionMapper.toDTOList(transactions);
    }
}

