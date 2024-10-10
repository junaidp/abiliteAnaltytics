package com.demoapplication.repository;

import com.demoapplication.model.Payments;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface PaymentsRepository extends MongoRepository<Payments, String> {

    // Query to find overdue payments by comparing dueDate with the current date
    @Query("{ 'dueDate': { $lt: ?0 } }")
    List<Payments> getOverDue(Date date, Sort sort);
}
