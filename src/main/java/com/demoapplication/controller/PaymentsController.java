package com.demoapplication.controller;

import com.demoapplication.model.Payments;
import com.demoapplication.repository.PaymentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/payments")
public class PaymentsController {

    @Autowired
    private PaymentsRepository paymentsRepository;

    // API to get overdue payments with calculated overdue days
    @GetMapping("/overdue")
    public List<Payments> getOverduePayments() {
        Sort sort = Sort.by(Sort.Direction.DESC, "transactionAmount");

        return paymentsRepository.getOverDue(new Date(), sort);
    }


}
