
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password_hash: 'password_hash',
  role: 'role',
  branch_id: 'branch_id',
  department_id: 'department_id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  employee_level_id: 'employee_level_id',
  employee_grade_id: 'employee_grade_id',
  resetPasswordOtp: 'resetPasswordOtp',
  resetPasswordOtpExpiry: 'resetPasswordOtpExpiry',
  shift_id: 'shift_id',
  designation_id: 'designation_id',
  permissions: 'permissions'
};

exports.Prisma.ExpenseRequestScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  amount: 'amount',
  category: 'category',
  description: 'description',
  date: 'date',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  adminRemarks: 'adminRemarks'
};

exports.Prisma.BreakLogScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  attendance_id: 'attendance_id',
  start_time: 'start_time',
  end_time: 'end_time',
  duration_minutes: 'duration_minutes',
  break_type: 'break_type',
  status: 'status'
};

exports.Prisma.DocumentRequestScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  request_type: 'request_type',
  requested_data: 'requested_data',
  reason: 'reason',
  status: 'status',
  approver_id: 'approver_id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  website: 'website',
  logo_url: 'logo_url',
  tax_info: 'tax_info',
  status: 'status',
  order_index: 'order_index'
};

exports.Prisma.ZoneScalarFieldEnum = {
  id: 'id',
  name: 'name',
  order_index: 'order_index'
};

exports.Prisma.BranchScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  type: 'type',
  order_index: 'order_index',
  company_id: 'company_id',
  zone_id: 'zone_id'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  branch_id: 'branch_id',
  order_index: 'order_index'
};

exports.Prisma.SubDepartmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  department_id: 'department_id',
  order_index: 'order_index'
};

exports.Prisma.DesignationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  sub_department_id: 'sub_department_id',
  order_index: 'order_index'
};

exports.Prisma.EmployeeLevelScalarFieldEnum = {
  id: 'id',
  name: 'name',
  parent_id: 'parent_id',
  order_index: 'order_index'
};

exports.Prisma.EmployeeGradeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  status: 'status'
};

exports.Prisma.AdminBranchRestrictionScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  branch_id: 'branch_id'
};

exports.Prisma.AdminDepartmentRestrictionScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  department_id: 'department_id'
};

exports.Prisma.ActivityLogScalarFieldEnum = {
  id: 'id',
  action: 'action',
  entity_type: 'entity_type',
  entity_name: 'entity_name',
  details: 'details',
  user_id: 'user_id',
  createdAt: 'createdAt'
};

exports.Prisma.EmployeeGradeHistoryScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  grade_id: 'grade_id',
  effective_from: 'effective_from',
  effective_to: 'effective_to',
  remarks: 'remarks',
  assigned_by: 'assigned_by',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParkingSlotScalarFieldEnum = {
  id: 'id',
  slot_number: 'slot_number',
  user_id: 'user_id',
  vehicle_number: 'vehicle_number',
  access_type: 'access_type',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmergencyNumberScalarFieldEnum = {
  id: 'id',
  contact_name: 'contact_name',
  number: 'number',
  type: 'type',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WhatsAppAlertScalarFieldEnum = {
  id: 'id',
  alert_name: 'alert_name',
  trigger_event: 'trigger_event',
  recipient_type: 'recipient_type',
  message_template: 'message_template',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IdCardTemplateScalarFieldEnum = {
  id: 'id',
  template_name: 'template_name',
  template_type: 'template_type',
  branch_id: 'branch_id',
  department_id: 'department_id',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DailyAttendanceEmailScalarFieldEnum = {
  id: 'id',
  report_name: 'report_name',
  recipient_type: 'recipient_type',
  filter_value: 'filter_value',
  schedule_time: 'schedule_time',
  email_template: 'email_template',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanySettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ShiftScalarFieldEnum = {
  id: 'id',
  name: 'name',
  start_time: 'start_time',
  end_time: 'end_time',
  grace_time_minutes: 'grace_time_minutes',
  half_day_min_hours: 'half_day_min_hours',
  full_day_min_hours: 'full_day_min_hours',
  break_duration_mins: 'break_duration_mins',
  is_active: 'is_active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttendanceRecordScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  date: 'date',
  in_time: 'in_time',
  out_time: 'out_time',
  break_minutes: 'break_minutes',
  total_working_hours: 'total_working_hours',
  late_by_minutes: 'late_by_minutes',
  early_leaving_mins: 'early_leaving_mins',
  overtime_hours: 'overtime_hours',
  status: 'status',
  source: 'source',
  remarks: 'remarks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttendanceRequestScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  request_type: 'request_type',
  date: 'date',
  requested_data: 'requested_data',
  reason: 'reason',
  status: 'status',
  approver_id: 'approver_id',
  approver_remarks: 'approver_remarks',
  createdAt: 'createdAt',
  modifiedAt: 'modifiedAt'
};

exports.Prisma.PayrollScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  month: 'month',
  year: 'year',
  basic_salary: 'basic_salary',
  allowances: 'allowances',
  deductions: 'deductions',
  net_salary: 'net_salary',
  status: 'status',
  paid_at: 'paid_at',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GeofenceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  latitude: 'latitude',
  longitude: 'longitude',
  radius: 'radius',
  status: 'status',
  punchRule: 'punchRule',
  employeeCount: 'employeeCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrackingConfigScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  enabled: 'enabled',
  frequency: 'frequency',
  workingHoursOnly: 'workingHoursOnly',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrackingLogScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  latitude: 'latitude',
  longitude: 'longitude',
  location: 'location',
  status: 'status',
  batteryLevel: 'batteryLevel',
  timestamp: 'timestamp'
};

exports.Prisma.TrackingExceptionScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  type: 'type',
  severity: 'severity',
  description: 'description',
  status: 'status',
  reason: 'reason',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DailyWorkScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  work_date: 'work_date',
  check_in_time: 'check_in_time',
  check_out_time: 'check_out_time',
  total_work_hours: 'total_work_hours',
  total_distance: 'total_distance',
  tasks_completed: 'tasks_completed',
  break_time_mins: 'break_time_mins',
  status: 'status',
  admin_remark: 'admin_remark',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  work_type: 'work_type'
};

exports.Prisma.WorkActivityScalarFieldEnum = {
  id: 'id',
  daily_work_id: 'daily_work_id',
  activity_time: 'activity_time',
  latitude: 'latitude',
  longitude: 'longitude',
  activity_type: 'activity_type',
  location: 'location',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.VisitScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  date: 'date',
  client_name: 'client_name',
  client_contact: 'client_contact',
  company_name: 'company_name',
  city: 'city',
  address: 'address',
  purpose: 'purpose',
  priority_level: 'priority_level',
  remarks: 'remarks',
  status: 'status',
  check_in_time: 'check_in_time',
  check_in_latitude: 'check_in_latitude',
  check_in_longitude: 'check_in_longitude',
  check_in_photo_url: 'check_in_photo_url',
  check_out_time: 'check_out_time',
  check_out_latitude: 'check_out_latitude',
  check_out_longitude: 'check_out_longitude',
  work_summary: 'work_summary',
  next_follow_up_date: 'next_follow_up_date',
  document_url: 'document_url',
  customer_signature_url: 'customer_signature_url',
  approver_id: 'approver_id',
  approval_status: 'approval_status',
  approval_comments: 'approval_comments',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  area: 'area',
  country: 'country',
  state: 'state'
};

exports.Prisma.EarningDeductionTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  taxable: 'taxable',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalaryGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  payroll_frequency: 'payroll_frequency',
  working_days_type: 'working_days_type',
  salary_calc_type: 'salary_calc_type',
  payout_formulas: 'payout_formulas',
  slip_display_settings: 'slip_display_settings',
  common_settings: 'common_settings',
  calculation_rules: 'calculation_rules',
  incentive_settings: 'incentive_settings',
  employee_count: 'employee_count',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalaryGroupComponentScalarFieldEnum = {
  id: 'id',
  salary_group_id: 'salary_group_id',
  earning_deduction_type_id: 'earning_deduction_type_id',
  amount: 'amount'
};

exports.Prisma.IncentiveTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  incentive_type: 'incentive_type',
  calculation_method: 'calculation_method',
  applicable_on: 'applicable_on',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GratuitySettingScalarFieldEnum = {
  id: 'id',
  enabled: 'enabled',
  min_service_years: 'min_service_years',
  formula: 'formula',
  included_components: 'included_components',
  max_limit: 'max_limit',
  round_off: 'round_off',
  applicable_on_resignation: 'applicable_on_resignation',
  auto_calculate_fnf: 'auto_calculate_fnf',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeCTCScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  salary_group_id: 'salary_group_id',
  salary_type: 'salary_type',
  gross_salary: 'gross_salary',
  increment_remark: 'increment_remark',
  start_date: 'start_date',
  next_increment_date: 'next_increment_date',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalarySlipScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  employee_ctc_id: 'employee_ctc_id',
  branch_id: 'branch_id',
  department_id: 'department_id',
  month: 'month',
  year: 'year',
  salary_type: 'salary_type',
  month_working_days: 'month_working_days',
  employee_working_days: 'employee_working_days',
  paid_leaves: 'paid_leaves',
  unpaid_leaves: 'unpaid_leaves',
  total_leaves: 'total_leaves',
  paid_holidays: 'paid_holidays',
  paid_week_offs: 'paid_week_offs',
  extra_days: 'extra_days',
  joining_net_salary: 'joining_net_salary',
  joining_gross_salary: 'joining_gross_salary',
  this_month_gross: 'this_month_gross',
  per_day_salary: 'per_day_salary',
  per_day_extra: 'per_day_extra',
  total_earnings: 'total_earnings',
  total_deductions: 'total_deductions',
  net_salary: 'net_salary',
  salary_mode: 'salary_mode',
  status: 'status',
  is_shared: 'is_shared',
  description: 'description',
  generated_by: 'generated_by',
  updated_by: 'updated_by',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalarySlipItemScalarFieldEnum = {
  id: 'id',
  salary_slip_id: 'salary_slip_id',
  name: 'name',
  amount: 'amount',
  type: 'type',
  category: 'category'
};

exports.Prisma.SalaryGenerationLogScalarFieldEnum = {
  id: 'id',
  action_type: 'action_type',
  status: 'status',
  month: 'month',
  year: 'year',
  details: 'details',
  processed_by: 'processed_by',
  createdAt: 'createdAt'
};

exports.Prisma.OtherEarningDeductionScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  name: 'name',
  type: 'type',
  amount: 'amount',
  percentage: 'percentage',
  description: 'description',
  month: 'month',
  year: 'year',
  is_recurring: 'is_recurring',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeIncentiveDetailScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  incentive_type_id: 'incentive_type_id',
  amount: 'amount',
  description: 'description',
  month: 'month',
  year: 'year',
  status: 'status',
  added_by: 'added_by',
  approved_by: 'approved_by',
  approved_at: 'approved_at',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FFSettlementScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  resignation_date: 'resignation_date',
  last_working_day: 'last_working_day',
  status: 'status',
  total_earnings: 'total_earnings',
  total_deductions: 'total_deductions',
  net_settlement: 'net_settlement',
  payment_mode: 'payment_mode',
  remarks: 'remarks',
  processed_by: 'processed_by',
  settled_at: 'settled_at',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FFSettlementItemScalarFieldEnum = {
  id: 'id',
  ff_settlement_id: 'ff_settlement_id',
  name: 'name',
  amount: 'amount',
  type: 'type'
};

exports.Prisma.EmployeeBankDetailScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  bank_name: 'bank_name',
  bank_branch: 'bank_branch',
  account_number: 'account_number',
  account_type: 'account_type',
  ifsc_code: 'ifsc_code',
  account_holder_name: 'account_holder_name',
  pan_no: 'pan_no',
  crn_no: 'crn_no',
  esic_no: 'esic_no',
  pf_no: 'pf_no',
  uan_no: 'uan_no',
  micr_code: 'micr_code',
  insurance_no: 'insurance_no',
  is_primary: 'is_primary',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalaryGroupChangeLogScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  old_group_id: 'old_group_id',
  new_group_id: 'new_group_id',
  reason: 'reason',
  effective_date: 'effective_date',
  changed_by: 'changed_by',
  createdAt: 'createdAt'
};

exports.Prisma.EmployeeTaxRegimeScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  financial_year: 'financial_year',
  tax_regime: 'tax_regime',
  metro_type: 'metro_type',
  declaration_status: 'declaration_status',
  lock_status: 'lock_status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TdsGlobalRuleScalarFieldEnum = {
  id: 'id',
  financial_year: 'financial_year',
  min_ctc_new_regime: 'min_ctc_new_regime',
  min_ctc_old_regime: 'min_ctc_old_regime',
  default_cycle: 'default_cycle',
  auto_apply_ctc_rules: 'auto_apply_ctc_rules',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeTdsRuleScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  financial_year: 'financial_year',
  deduction_rule: 'deduction_rule',
  estimated_yearly_tds: 'estimated_yearly_tds',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaxBenefitCategoryScalarFieldEnum = {
  id: 'id',
  category_name: 'category_name',
  section_code: 'section_code',
  max_limit: 'max_limit',
  applicable_regime: 'applicable_regime',
  financial_year: 'financial_year',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaxBenefitSubCategoryScalarFieldEnum = {
  id: 'id',
  category_id: 'category_id',
  sub_category_name: 'sub_category_name',
  code: 'code',
  max_limit: 'max_limit',
  proof_required: 'proof_required',
  declaration_type: 'declaration_type',
  applicable_regime: 'applicable_regime',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IncomeTaxSlabScalarFieldEnum = {
  id: 'id',
  financial_year: 'financial_year',
  tax_regime: 'tax_regime',
  slab_type: 'slab_type',
  from_amount: 'from_amount',
  to_amount: 'to_amount',
  tax_percentage: 'tax_percentage',
  status: 'status',
  is_locked: 'is_locked',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaxBenefitDocumentScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  category_id: 'category_id',
  sub_category_id: 'sub_category_id',
  financial_year: 'financial_year',
  declared_amount: 'declared_amount',
  proof_url: 'proof_url',
  status: 'status',
  rejection_reason: 'rejection_reason',
  submitted_date: 'submitted_date',
  action_date: 'action_date',
  action_by_id: 'action_by_id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OtherIncomeLossScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  financial_year: 'financial_year',
  type: 'type',
  source: 'source',
  amount: 'amount',
  description: 'description',
  proof_url: 'proof_url',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TdsChallanScalarFieldEnum = {
  id: 'id',
  financial_year: 'financial_year',
  month: 'month',
  tds_type: 'tds_type',
  payment_mode: 'payment_mode',
  bank_name: 'bank_name',
  challan_date: 'challan_date',
  total_amount: 'total_amount',
  bsr_code: 'bsr_code',
  cin_no: 'cin_no',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TdsPaidSummaryScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  challan_id: 'challan_id',
  financial_year: 'financial_year',
  tds_amount: 'tds_amount',
  deposit_date: 'deposit_date',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Form12BDetailScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  financial_year: 'financial_year',
  previous_company: 'previous_company',
  tan_no: 'tan_no',
  period_from: 'period_from',
  period_to: 'period_to',
  gross_salary: 'gross_salary',
  exemptions: 'exemptions',
  professional_tax: 'professional_tax',
  standard_deduction: 'standard_deduction',
  other_deductions: 'other_deductions',
  tds_deducted: 'tds_deducted',
  other_income: 'other_income',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Form16DocumentScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  financial_year: 'financial_year',
  status: 'status',
  pdf_url: 'pdf_url',
  generated_date: 'generated_date',
  sent_date: 'sent_date',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalaryHoldRequestScalarFieldEnum = {
  id: 'id',
  employee_id: 'employee_id',
  reporting_user_id: 'reporting_user_id',
  month: 'month',
  year: 'year',
  start_date: 'start_date',
  end_date: 'end_date',
  reason: 'reason',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  priority: 'priority',
  status: 'status',
  sla_hours: 'sla_hours',
  description: 'description',
  created_by_id: 'created_by_id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkAllocationAccessScalarFieldEnum = {
  id: 'id',
  assign_by_id: 'assign_by_id',
  assign_to_id: 'assign_to_id',
  category_ids: 'category_ids',
  access_type: 'access_type',
  max_task_per_day: 'max_task_per_day',
  max_task_per_employee: 'max_task_per_employee',
  allow_reassign: 'allow_reassign',
  approval_required: 'approval_required',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkAllocationScalarFieldEnum = {
  id: 'id',
  task_id: 'task_id',
  category_id: 'category_id',
  title: 'title',
  description: 'description',
  assigned_by_id: 'assigned_by_id',
  assigned_to_id: 'assigned_to_id',
  priority: 'priority',
  status: 'status',
  start_date: 'start_date',
  due_date: 'due_date',
  completion_date: 'completion_date',
  progress: 'progress',
  delay_flag: 'delay_flag',
  attachments: 'attachments',
  comments: 'comments',
  project_sr_no: 'project_sr_no',
  site: 'site',
  location: 'location',
  branch_id: 'branch_id',
  department_id: 'department_id',
  hod_id: 'hod_id',
  hod_remark: 'hod_remark',
  engineer_status: 'engineer_status',
  engineer_remark: 'engineer_remark',
  completion_remark: 'completion_remark',
  authorized_date_by_hod: 'authorized_date_by_hod',
  authorized_remark: 'authorized_remark',
  remark_from_hod: 'remark_from_hod',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SiteScalarFieldEnum = {
  id: 'id',
  name: 'name',
  contact_name: 'contact_name',
  mobile_no: 'mobile_no',
  email: 'email',
  area: 'area',
  address: 'address',
  city_state: 'city_state',
  revenue_share_pct: 'revenue_share_pct',
  commission_bearer: 'commission_bearer',
  status: 'status',
  agreement_start: 'agreement_start',
  agreement_end: 'agreement_end',
  document_url: 'document_url',
  branch_id: 'branch_id',
  department_id: 'department_id',
  reporting_manager_id: 'reporting_manager_id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SiteEmployeeScalarFieldEnum = {
  id: 'id',
  site_id: 'site_id',
  user_id: 'user_id',
  role: 'role',
  shift_id: 'shift_id',
  join_date: 'join_date',
  exit_date: 'exit_date',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SiteAttendanceScalarFieldEnum = {
  id: 'id',
  site_employee_id: 'site_employee_id',
  date: 'date',
  punch_in: 'punch_in',
  punch_out: 'punch_out',
  working_hours: 'working_hours',
  overtime_hours: 'overtime_hours',
  late_minutes: 'late_minutes',
  status: 'status',
  remark: 'remark',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SitePurchaseScalarFieldEnum = {
  id: 'id',
  site_id: 'site_id',
  item_name: 'item_name',
  vendor_name: 'vendor_name',
  quantity: 'quantity',
  unit_price: 'unit_price',
  total_amount: 'total_amount',
  date: 'date',
  bill_url: 'bill_url',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PmsDimensionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  description: 'description',
  status: 'status',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PmsDimensionSubGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  weightage_type: 'weightage_type',
  total_weightage: 'total_weightage',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PmsDimSubGroupDimensionScalarFieldEnum = {
  id: 'id',
  subGroupId: 'subGroupId',
  dimensionId: 'dimensionId',
  weightage: 'weightage'
};

exports.Prisma.PmsScoreBandScalarFieldEnum = {
  id: 'id',
  from_score: 'from_score',
  to_score: 'to_score',
  rating: 'rating',
  grade: 'grade',
  remark: 'remark',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PmsAssignScalarFieldEnum = {
  id: 'id',
  pms_type: 'pms_type',
  pms_date: 'pms_date',
  status: 'status',
  description: 'description',
  branchId: 'branchId',
  departmentId: 'departmentId',
  subGroupId: 'subGroupId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PmsAssignEmployeeScalarFieldEnum = {
  id: 'id',
  pmsAssignId: 'pmsAssignId',
  userId: 'userId',
  evaluation_status: 'evaluation_status'
};

exports.Prisma.PmsEvaluationScalarFieldEnum = {
  id: 'id',
  pmsAssignId: 'pmsAssignId',
  userId: 'userId',
  dimensionId: 'dimensionId',
  self_score: 'self_score',
  manager_score: 'manager_score',
  final_score: 'final_score',
  weightage: 'weightage',
  weighted_score: 'weighted_score',
  remark: 'remark',
  evaluator_type: 'evaluator_type',
  evaluatedById: 'evaluatedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VehicleCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  status: 'status',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeVehicleScalarFieldEnum = {
  id: 'id',
  vehicle_name: 'vehicle_name',
  vehicle_number: 'vehicle_number',
  vehicle_value: 'vehicle_value',
  image_url_1: 'image_url_1',
  image_url_2: 'image_url_2',
  image_url_3: 'image_url_3',
  status: 'status',
  assigned_date: 'assigned_date',
  userId: 'userId',
  categoryId: 'categoryId',
  branchId: 'branchId',
  departmentId: 'departmentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IdeaCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  status: 'status',
  created_by: 'created_by',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IdeaScalarFieldEnum = {
  id: 'id',
  title: 'title',
  categoryId: 'categoryId',
  userId: 'userId',
  description: 'description',
  attachmentUrl: 'attachmentUrl',
  expectedBenefit: 'expectedBenefit',
  status: 'status',
  approvalRemarks: 'approvalRemarks',
  isAnonymous: 'isAnonymous',
  rewardPoints: 'rewardPoints',
  implementationDate: 'implementationDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IdeaVoteScalarFieldEnum = {
  id: 'id',
  ideaId: 'ideaId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.IdeaCommentScalarFieldEnum = {
  id: 'id',
  ideaId: 'ideaId',
  userId: 'userId',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.IdeaRewardScalarFieldEnum = {
  id: 'id',
  ideaId: 'ideaId',
  userId: 'userId',
  points: 'points',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.SosTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  imageUrl: 'imageUrl',
  validityMinutes: 'validityMinutes',
  status: 'status',
  isPredefined: 'isPredefined',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SosAlertScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  sosTypeId: 'sosTypeId',
  message: 'message',
  imageUrl: 'imageUrl',
  latitude: 'latitude',
  longitude: 'longitude',
  status: 'status',
  resolvedAt: 'resolvedAt',
  closedAt: 'closedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChatGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  icon: 'icon',
  type: 'type',
  visibilityType: 'visibilityType',
  isAutoCreated: 'isAutoCreated',
  autoBranchId: 'autoBranchId',
  autoDepartmentId: 'autoDepartmentId',
  autoZoneId: 'autoZoneId',
  autoLevelId: 'autoLevelId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChatGroupMemberScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  userId: 'userId',
  role: 'role',
  visibility: 'visibility',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  senderId: 'senderId',
  message: 'message',
  attachment: 'attachment',
  type: 'type',
  status: 'status',
  isPinned: 'isPinned',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HolidayScalarFieldEnum = {
  id: 'id',
  name: 'name',
  date: 'date',
  type: 'type',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  groupId: 'groupId',
  visibility: 'visibility'
};

exports.Prisma.HolidayGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'status'
};

exports.Prisma.HolidayGroupAssignScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  userId: 'userId',
  branchId: 'branchId',
  departmentId: 'departmentId',
  createdAt: 'createdAt'
};

exports.Prisma.OptionalHolidayRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  holidayId: 'holidayId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  adminRemarks: 'adminRemarks',
  reason: 'reason'
};

exports.Prisma.MobileDeviceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  deviceId: 'deviceId',
  deviceName: 'deviceName',
  osVersion: 'osVersion',
  status: 'status',
  isActive: 'isActive',
  macAddress: 'macAddress',
  deviceModel: 'deviceModel',
  appVersion: 'appVersion',
  boundAt: 'boundAt',
  lastActive: 'lastActive'
};

exports.Prisma.DeviceChangeRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  oldDeviceId: 'oldDeviceId',
  reason: 'reason',
  status: 'status',
  resolvedAt: 'resolvedAt',
  approvedById: 'approvedById',
  newDeviceId: 'newDeviceId',
  newDeviceName: 'newDeviceName',
  oldDeviceName: 'oldDeviceName',
  requestedAt: 'requestedAt'
};

exports.Prisma.VendorCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VendorSubCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  status: 'status',
  categoryId: 'categoryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VendorScalarFieldEnum = {
  id: 'id',
  name: 'name',
  categoryId: 'categoryId',
  subCategoryId: 'subCategoryId',
  contactPerson: 'contactPerson',
  mobile: 'mobile',
  email: 'email',
  gstNumber: 'gstNumber',
  panNumber: 'panNumber',
  companyName: 'companyName',
  country: 'country',
  state: 'state',
  city: 'city',
  area: 'area',
  pincode: 'pincode',
  fullAddress: 'fullAddress',
  bankName: 'bankName',
  accountNumber: 'accountNumber',
  ifscCode: 'ifscCode',
  paymentTerms: 'paymentTerms',
  status: 'status',
  attachmentUrl: 'attachmentUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EscalationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  sender_id: 'sender_id',
  receiver_id: 'receiver_id',
  branch_id: 'branch_id',
  status: 'status',
  priority: 'priority',
  category: 'category',
  reply_date: 'reply_date',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EscalationReplyScalarFieldEnum = {
  id: 'id',
  escalation_id: 'escalation_id',
  user_id: 'user_id',
  message: 'message',
  createdAt: 'createdAt'
};

exports.Prisma.EscalationAttachmentScalarFieldEnum = {
  id: 'id',
  escalation_id: 'escalation_id',
  reply_id: 'reply_id',
  file_url: 'file_url',
  name: 'name',
  file_type: 'file_type'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  ExpenseRequest: 'ExpenseRequest',
  BreakLog: 'BreakLog',
  DocumentRequest: 'DocumentRequest',
  Company: 'Company',
  Zone: 'Zone',
  Branch: 'Branch',
  Department: 'Department',
  SubDepartment: 'SubDepartment',
  Designation: 'Designation',
  EmployeeLevel: 'EmployeeLevel',
  EmployeeGrade: 'EmployeeGrade',
  AdminBranchRestriction: 'AdminBranchRestriction',
  AdminDepartmentRestriction: 'AdminDepartmentRestriction',
  ActivityLog: 'ActivityLog',
  EmployeeGradeHistory: 'EmployeeGradeHistory',
  ParkingSlot: 'ParkingSlot',
  EmergencyNumber: 'EmergencyNumber',
  WhatsAppAlert: 'WhatsAppAlert',
  IdCardTemplate: 'IdCardTemplate',
  DailyAttendanceEmail: 'DailyAttendanceEmail',
  CompanySetting: 'CompanySetting',
  Shift: 'Shift',
  AttendanceRecord: 'AttendanceRecord',
  AttendanceRequest: 'AttendanceRequest',
  Payroll: 'Payroll',
  Geofence: 'Geofence',
  TrackingConfig: 'TrackingConfig',
  TrackingLog: 'TrackingLog',
  TrackingException: 'TrackingException',
  DailyWork: 'DailyWork',
  WorkActivity: 'WorkActivity',
  Visit: 'Visit',
  EarningDeductionType: 'EarningDeductionType',
  SalaryGroup: 'SalaryGroup',
  SalaryGroupComponent: 'SalaryGroupComponent',
  IncentiveType: 'IncentiveType',
  GratuitySetting: 'GratuitySetting',
  EmployeeCTC: 'EmployeeCTC',
  SalarySlip: 'SalarySlip',
  SalarySlipItem: 'SalarySlipItem',
  SalaryGenerationLog: 'SalaryGenerationLog',
  OtherEarningDeduction: 'OtherEarningDeduction',
  EmployeeIncentiveDetail: 'EmployeeIncentiveDetail',
  FFSettlement: 'FFSettlement',
  FFSettlementItem: 'FFSettlementItem',
  EmployeeBankDetail: 'EmployeeBankDetail',
  SalaryGroupChangeLog: 'SalaryGroupChangeLog',
  EmployeeTaxRegime: 'EmployeeTaxRegime',
  TdsGlobalRule: 'TdsGlobalRule',
  EmployeeTdsRule: 'EmployeeTdsRule',
  TaxBenefitCategory: 'TaxBenefitCategory',
  TaxBenefitSubCategory: 'TaxBenefitSubCategory',
  IncomeTaxSlab: 'IncomeTaxSlab',
  TaxBenefitDocument: 'TaxBenefitDocument',
  OtherIncomeLoss: 'OtherIncomeLoss',
  TdsChallan: 'TdsChallan',
  TdsPaidSummary: 'TdsPaidSummary',
  Form12BDetail: 'Form12BDetail',
  Form16Document: 'Form16Document',
  SalaryHoldRequest: 'SalaryHoldRequest',
  WorkCategory: 'WorkCategory',
  WorkAllocationAccess: 'WorkAllocationAccess',
  WorkAllocation: 'WorkAllocation',
  Site: 'Site',
  SiteEmployee: 'SiteEmployee',
  SiteAttendance: 'SiteAttendance',
  SitePurchase: 'SitePurchase',
  PmsDimension: 'PmsDimension',
  PmsDimensionSubGroup: 'PmsDimensionSubGroup',
  PmsDimSubGroupDimension: 'PmsDimSubGroupDimension',
  PmsScoreBand: 'PmsScoreBand',
  PmsAssign: 'PmsAssign',
  PmsAssignEmployee: 'PmsAssignEmployee',
  PmsEvaluation: 'PmsEvaluation',
  VehicleCategory: 'VehicleCategory',
  EmployeeVehicle: 'EmployeeVehicle',
  IdeaCategory: 'IdeaCategory',
  Idea: 'Idea',
  IdeaVote: 'IdeaVote',
  IdeaComment: 'IdeaComment',
  IdeaReward: 'IdeaReward',
  SosType: 'SosType',
  SosAlert: 'SosAlert',
  ChatGroup: 'ChatGroup',
  ChatGroupMember: 'ChatGroupMember',
  ChatMessage: 'ChatMessage',
  Holiday: 'Holiday',
  HolidayGroup: 'HolidayGroup',
  HolidayGroupAssign: 'HolidayGroupAssign',
  OptionalHolidayRequest: 'OptionalHolidayRequest',
  MobileDevice: 'MobileDevice',
  DeviceChangeRequest: 'DeviceChangeRequest',
  VendorCategory: 'VendorCategory',
  VendorSubCategory: 'VendorSubCategory',
  Vendor: 'Vendor',
  Escalation: 'Escalation',
  EscalationReply: 'EscalationReply',
  EscalationAttachment: 'EscalationAttachment'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
