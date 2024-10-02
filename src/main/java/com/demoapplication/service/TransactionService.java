package com.demoapplication.service;

import com.demoapplication.model.Transaction;
import com.demoapplication.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> getDuplicateEntries() {
        return transactionRepository.getDuplicateEntries();
    }

}
