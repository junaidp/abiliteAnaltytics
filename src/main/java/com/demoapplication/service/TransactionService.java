package com.demoapplication.service;

import com.demoapplication.model.Transaction;
import com.demoapplication.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> getTransactionsByCustomerId(int customerId) {
        return transactionRepository.findAllByCustomerId(customerId);
    }
    public List<Transaction> getTransactionsByOrderId(int orderId) {
        return transactionRepository.findAllByOrderId(orderId);
    }

    public List<Transaction> getDuplicateTransactionsByCustomerId(int customerId, int orderId) {
        return transactionRepository.findDuplicateEntriesByCustomerId(customerId,orderId);
    }
    public List<Transaction> getDuplicateEntries() {
        return transactionRepository.getDuplicateEntries();
    }

}
