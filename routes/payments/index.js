import express from "express";
const router = express.Router();

import { duplicatePayments } from "../../controllers/payments/duplicatePayments.js";
import { paymentsExceedingApprovedLimits } from "../../controllers/payments/paymentsExceedingApprovedLimits.js";
import { paymentsInconsistentWithContractualAgreements } from "../../controllers/payments/paymentsInconsistentWithContractualAgreements.js";
import { paymentsOutsideStandardBusinessHours } from "../../controllers/payments/paymentsOutsideStandardBusinessHours.js";
import { paymentsWithHighTransactionFees } from "../../controllers/payments/paymentsWithHighTransactionFees.js";
import { paymentsWithHighTransactionVelocity } from "../../controllers/payments/paymentsWithHighTransactionVelocity.js";
import { paymentsWithInconsistentHandlingOfAdvancePayments } from "../../controllers/payments/paymentsWithInconsistentHandlingOfAdvancePayments.js";
import { PaymentsWithInconsistentPaymentDateVSInvoiceDueDate } from "../../controllers/payments/PaymentsWithInconsistentPaymentDateVSInvoiceDueDate.js";
import { paymentsWithInconsistentVAT_GSTApplication } from "../../controllers/payments/paymentsWithInconsistentVAT_GSTApplication.js";
import { paymentsWithUnexpectedCrossCurrencyTransactions } from "../../controllers/payments/paymentsWithUnexpectedCrossCurrencyTransactions.js";
import { paymentsWithUnexpectedDelays } from "../../controllers/payments/paymentsWithUnexpectedDelays.js";
import { paymentsWithUnexpectedExpenseCategories } from "../../controllers/payments/paymentsWithUnexpectedExpenseCategories.js";
import { paymentsWithUnexpectedLateFees } from "../../controllers/payments/paymentsWithUnexpectedLateFees.js";
import { paymentsWithUnexpectedPaymentSources } from "../../controllers/payments/paymentsWithUnexpectedPaymentSources.js";
import { paymentsWithUnexpectedThirdPartyInvolvement } from "../../controllers/payments/paymentsWithUnexpectedThirdPartyInvolvement.js";
import { paymentsWithUnusualPatternsInInvoiceMatching } from "../../controllers/payments/paymentsWithUnusualPatternsInInvoiceMatching.js";
import { paymentsWithUnusualPaymentDuration } from "../../controllers/payments/paymentsWithUnusualPaymentDuration.js";
import { paymentsWithUnusualTimingOrFrequencyByVendor } from "../../controllers/payments/paymentsWithUnusualTimingOrFrequencyByVendor.js";
import { unexpectedChangesInPaymentPatternsOverTime } from "../../controllers/payments/unexpectedChangesInPaymentPatternsOverTime.js";
import { unusualPatternsInPaymentApprovalChains } from "../../controllers/payments/unusualPatternsInPaymentApprovalChains.js";
import { unusualPatternsInPaymentApprovalTimes } from "../../controllers/payments/unusualPatternsInPaymentApprovalTimes.js";
import { unusualPatternsInPaymentMetadata } from "../../controllers/payments/unusualPatternsInPaymentMetadata.js";
import { unusualPatternsInPaymentRejectionsOrFailures } from "../../controllers/payments/unusualPatternsInPaymentRejectionsOrFailures.js";

router.get("/duplicatePayments", duplicatePayments);
router.get("/paymentsExceedingApprovedLimits", paymentsExceedingApprovedLimits);
router.get(
  "/paymentsInconsistentWithContractualAgreements",
  paymentsInconsistentWithContractualAgreements
);
router.get(
  "/paymentsOutsideStandardBusinessHours",
  paymentsOutsideStandardBusinessHours
);
router.get("/paymentsWithHighTransactionFees", paymentsWithHighTransactionFees);
router.get("/paymentsWithHighTransactionVelocity", paymentsWithHighTransactionVelocity);
router.get("/paymentsWithInconsistentHandlingOfAdvancePayments", paymentsWithInconsistentHandlingOfAdvancePayments);
router.get("/PaymentsWithInconsistentPaymentDateVSInvoiceDueDate", PaymentsWithInconsistentPaymentDateVSInvoiceDueDate);
router.get("/paymentsWithInconsistentVAT_GSTApplication", paymentsWithInconsistentVAT_GSTApplication);
router.get("/paymentsWithUnexpectedCrossCurrencyTransactions", paymentsWithUnexpectedCrossCurrencyTransactions);
router.get("/paymentsWithUnexpectedDelays", paymentsWithUnexpectedDelays);
router.get("/paymentsWithUnexpectedExpenseCategories", paymentsWithUnexpectedExpenseCategories);
router.get("/paymentsWithUnexpectedLateFees", paymentsWithUnexpectedLateFees);
router.get(
  "/paymentsWithUnexpectedPaymentSources",
  paymentsWithUnexpectedPaymentSources
);
router.get(
  "/paymentsWithUnexpectedThirdPartyInvolvement",
  paymentsWithUnexpectedThirdPartyInvolvement
);
router.get(
  "/paymentsWithUnusualPatternsInInvoiceMatching",
  paymentsWithUnusualPatternsInInvoiceMatching
);
router.get(
  "/paymentsWithUnusualPaymentDuration",
  paymentsWithUnusualPaymentDuration
);
router.get(
  "/paymentsWithUnusualTimingOrFrequencyByVendor",
  paymentsWithUnusualTimingOrFrequencyByVendor
);
router.get(
  "/unexpectedChangesInPaymentPatternsOverTime",
  unexpectedChangesInPaymentPatternsOverTime
);
router.get(
  "/unusualPatternsInPaymentApprovalChains",
  unusualPatternsInPaymentApprovalChains
);
router.get(
  "/unusualPatternsInPaymentApprovalTimes",
  unusualPatternsInPaymentApprovalTimes
);
router.get(
  "/unusualPatternsInPaymentMetadata",
  unusualPatternsInPaymentMetadata
);
router.get(
  "/unusualPatternsInPaymentRejectionsOrFailures",
  unusualPatternsInPaymentRejectionsOrFailures
);

export default router;
