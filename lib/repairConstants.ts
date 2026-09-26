export const deviceTypes = [
  { value: "laptop", label: "Laptop" },
  { value: "smartphone", label: "Smartphone" },
  { value: "tablet", label: "Tablet" },
  { value: "desktop", label: "Desktop" },
  { value: "accessory_other", label: "Accessory / Other" },
];

export const issueTypes = [
  { value: "screen_damage", label: "Screen damage" },
  { value: "battery_issue", label: "Battery issue" },
  { value: "charging_issue", label: "Charging issue" },
  { value: "keyboard_issue", label: "Keyboard issue" },
  { value: "slow_performance", label: "Slow performance" },
  { value: "software_issue", label: "Software issue" },
  { value: "data_recovery", label: "Data recovery" },
  { value: "water_damage", label: "Water damage" },
  { value: "hardware_issue", label: "Hardware issue" },
  { value: "upgrade_request", label: "Upgrade request" },
  { value: "other", label: "Other" },
];

export const serviceModes = [
  { value: "walk_in", label: "Walk-in appointment" },
  { value: "pickup_drop", label: "Pickup and drop" },
  { value: "callback", label: "Callback request" },
  { value: "whatsapp", label: "WhatsApp support" },
];

export const repairStatusFlow = [
  "request_received",
  "awaiting_customer_response",
  "device_received",
  "diagnosis_in_progress",
  "estimate_shared",
  "awaiting_approval",
  "repair_in_progress",
  "ready_for_pickup",
  "completed",
  "cancelled",
] as const;

export type RepairStatus = (typeof repairStatusFlow)[number];

export const repairStatusLabels: Record<RepairStatus, string> = {
  request_received: "Request Received",
  awaiting_customer_response: "Awaiting Customer Response",
  device_received: "Device Received",
  diagnosis_in_progress: "Diagnosis in Progress",
  estimate_shared: "Estimate Shared",
  awaiting_approval: "Awaiting Approval",
  repair_in_progress: "Repair in Progress",
  ready_for_pickup: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const repairTerms = {
  backupNotice:
    "Please back up your data before handing over your device. CLKAi is not responsible for data loss during diagnosis or repair.",
  dataRecoveryDisclaimer:
    "Data recovery, where requested, is attempted on a best-effort basis only. Successful recovery cannot be guaranteed.",
  diagnosticFeeNotice:
    "Diagnostic fees, spare-part availability, and turnaround time vary by device and issue, and will be confirmed by the store after inspection.",
};
