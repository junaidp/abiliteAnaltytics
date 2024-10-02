package com.demoapplication;

import com.demoapplication.dto.TransactionDTO;
import com.demoapplication.model.Transaction;

import java.util.List;
import java.util.stream.Collectors;

public class TransactionMapper {

    // Convert a single Transaction to TransactionDTO
    private static TransactionDTO toDTO(Transaction transaction) {

        return new TransactionDTO(transaction.getId(),transaction.getCustomerId()+"",transaction.getQuantitySold(),transaction.getOrderId(), transaction.count());
    }

    // Convert a list of Transaction entities to TransactionDTOs
    public static List<TransactionDTO> toDTOList(List<Transaction> transactions) {
        return transactions.stream()
                .map(TransactionMapper::toDTO)  // Convert each Transaction to DTO
                .collect(Collectors.toList());
    }
}
