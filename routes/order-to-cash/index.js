import express from "express";
import { abnormalInventoryChanges } from "../../controllers/order-to-cash/abnormalInventoryChanges.js";
import { duplicateTransactions } from "../../controllers/order-to-cash/duplicateTransactions.js";
import { latePayments } from "../../controllers/order-to-cash/latePayments.js";
import { inconsistentHandlingOfSalesTaxCalculation } from "../../controllers/order-to-cash/inconsistentHandlingOfSalesTaxCalculation.js";
import { inconsistentTaxCalculations } from "../../controllers/order-to-cash/inconsistentTaxCalculations.js";
import { inconsistentTaxRates } from "../../controllers/order-to-cash/inconsistentTaxRates.js";
import { inconsistentUnitCosts } from "../../controllers/order-to-cash/inconsistentUnitCosts.js";
import { inconsistentUnitPrices } from "../../controllers/order-to-cash/inconsistentUnitPrices.js";
import { unusualTimeGapsInShippedAndDeliveredDates } from "../../controllers/order-to-cash/unusualTimeGapsInShippedAndDeliveredDates.js";
import { unusualTimeGapsInPaymentProcessing } from "../../controllers/order-to-cash/unusualTimeGapsInPaymentProcessing.js";
import { inconsistenciesInPaymentMethods } from "../../controllers/order-to-cash/inconsistenciesInPaymentMethods.js";
import { suspiciousCustomerBehavior } from "../../controllers/order-to-cash/suspiciousCustomerBehavior.js";
import { unusualDiscounts } from "../../controllers/order-to-cash/unusualDiscounts.js";
import { unusualOrderAmounts } from "../../controllers/order-to-cash/unusualOrderAmounts.js";
import { unusualPatternsInCustomerReturns } from "../../controllers/order-to-cash/unusualPatternsInCustomerReturn.js";
import { unusualPatternsInEmployeeSalesPerformance } from "../../controllers/order-to-cash/unusualPatternsInEmployeeSalesPerformance.js";
import { unusualPatternsInGiftCardUsage } from "../../controllers/order-to-cash/unusualPatternsInGiftCardUsage.js";
import { unusualPatternsInInvoiceAmounts } from "../../controllers/order-to-cash/unusualPatternsInInvoiceAmounts.js";
import { unusualPatternsInProductReturns } from "../../controllers/order-to-cash/unusualPatternsInProductReturns.js";
import { unusualPatternsInRefunds } from "../../controllers/order-to-cash/unusualPatternsInRefunds.js";

const router = express.Router();

router.get("/abnormalInventoryChanges", abnormalInventoryChanges);
router.get("/duplicateTransactions", duplicateTransactions);
router.get("/latePayments", latePayments);
router.get(
  "/inconsistentHandlingOfSalesTaxCalculation",
  inconsistentHandlingOfSalesTaxCalculation
);
router.get("/inconsistentTaxCalculations", inconsistentTaxCalculations);
router.get("/inconsistentTaxRates", inconsistentTaxRates);
router.get("/inconsistentUnitCosts", inconsistentUnitCosts);
router.get("/inconsistentUnitPrices", inconsistentUnitPrices);
router.get(
  "/unusualTimeGapsInShippedAndDeliveredDates",
  unusualTimeGapsInShippedAndDeliveredDates
);
router.get(
  "/unusualTimeGapsInPaymentProcessing",
  unusualTimeGapsInPaymentProcessing
);
router.get("/inconsistenciesInPaymentMethods", inconsistenciesInPaymentMethods);
router.get("/suspiciousCustomerBehavior", suspiciousCustomerBehavior);
router.get("/unusualDiscounts", unusualDiscounts);
router.get("/unusualOrderAmounts", unusualOrderAmounts);
router.get(
  "/unusualPatternsInCustomerReturns",
  unusualPatternsInCustomerReturns
);
router.get(
  "/unusualPatternsInEmployeeSalesPerformance",
  unusualPatternsInEmployeeSalesPerformance
);
router.get("/unusualPatternsInGiftCardUsage", unusualPatternsInGiftCardUsage);
router.get("/unusualPatternsInInvoiceAmounts", unusualPatternsInInvoiceAmounts);
router.get("/unusualPatternsInProductReturns", unusualPatternsInProductReturns);
router.get("/unusualPatternsInRefunds", unusualPatternsInRefunds);

export default router;
