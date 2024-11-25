import express from "express";
const router = express.Router();

import { abnormalFrequencyOfChangeOrders } from "../../controllers/procurement/abnormalFrequencyOfChangeOrders.js";
import { abnormalOrderApprovalDelays } from "../../controllers/procurement/abnormalOrderApprovalDelays.js";
import { abnormalEmployeeVacationKickback } from "../../controllers/procurement/abnormalEmployeeVacationKickback.js";
import { abnormalProcurementLogins } from "../../controllers/procurement/abnormalProcurementLogins.js";
import { abnormalTransactionTiming } from "../../controllers/procurement/abnormalTransactionTiming.js";
import { abnormalTrendsInWarrantyClaims } from "../../controllers/procurement/abnormalTrendsInWarrantyClaims.js";
import { abnormalVendorRelationshipDurations } from "../../controllers/procurement/abnormalVendorRelationshipDurations.js";
import { anomaliesInVendorBidSubmissionTimes } from "../../controllers/procurement/anomaliesInVendorBidSubmissionTimes.js";
import { findDuplicateEntries } from "../../controllers/procurement/findDuplicateEntries.js";
import { inactiveVendorTransactions } from "../../controllers/procurement/inactiveVendorTransactions.js";
import { outliersInPurchaseAmounts } from "../../controllers/procurement/outliersInPurchaseAmounts.js";
import { unexpectedCancellationPatterns } from "../../controllers/procurement/unexpectedCancellationPatterns.js";
import { vendorCreditLimitViolations } from "../../controllers/procurement/vendorCreditLimitViolations.js";

router.get("/abnormalFrequencyOfChangeOrders", abnormalFrequencyOfChangeOrders);
router.get("/abnormalOrderApprovalDelays", abnormalOrderApprovalDelays);
router.get(
  "/abnormalEmployeeVacationKickback",
  abnormalEmployeeVacationKickback
);
router.get("/abnormalProcurementLogins", abnormalProcurementLogins);
router.get("/abnormalTransactionTiming", abnormalTransactionTiming);
router.get("/abnormalTrendsInWarrantyClaims", abnormalTrendsInWarrantyClaims);
router.get(
  "/abnormalVendorRelationshipDurations",
  abnormalVendorRelationshipDurations
);
router.get(
  "/anomaliesInVendorBidSubmissionTimes",
  anomaliesInVendorBidSubmissionTimes
);
router.get("/findDuplicateEntries", findDuplicateEntries);
router.get("/inactiveVendorTransactions", inactiveVendorTransactions);
router.get("/outliersInPurchaseAmounts", outliersInPurchaseAmounts);
router.get("/unexpectedCancellationPatterns", unexpectedCancellationPatterns);
router.get("/vendorCreditLimitViolations", vendorCreditLimitViolations);

export default router;
