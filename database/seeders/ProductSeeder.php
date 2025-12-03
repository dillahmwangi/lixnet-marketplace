<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        $bySlug = fn($slug) => Category::where('slug', $slug)->firstOrFail()->id;

        $products = [
            // Payroll & HR
            [
                'category' => 'payroll-hr',
                'title' => 'Evolve Payroll & HR System',
                'description' => 'Complete payroll & HR solution with NHIF, NSSF, KRA tax, and compliance reports.',
                'rating' => 4.5,
                'rating_count' => 2524,
                'note' => 'Handles all Kenyan compliance',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => "Basic employee database management|Simple salary sheet generation|Manual payroll processing|Basic attendance tracking|Email payslip delivery|Monthly summary reports"
                    ],
                    'basic' => [
                        'price' => 1,
                        'features' => "Support for up to 50 employees|Automated NHIF deductions|NSSF contribution calculations|Advanced attendance tracking|Employee self-service portal|Monthly statutory reporting|Leave management system|Tax bracket calculations|Bulk payroll processing"
                    ],
                    'premium' => [
                        'price' => 2,
                        'features' => "Unlimited employee capacity|Full KRA tax compliance and PAYE submissions|Automated NHIF & NSSF integrations|Advanced leave management with accruals|Multi-department payroll processing|Real-time salary analytics dashboard|Custom benefit configurations|Audit trail and compliance logging|Priority technical support"
                    ]
                ]
            ],

            // SACCO
            [
                'category' => 'sacco',
                'title' => 'Evolve SACCO Manager Pro',
                'description' => 'Loans, savings, dividends, and member management.',
                'rating' => 5.0,
                'rating_count' => 2112,
                'note' => 'SASRA compliant reports',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => "Basic member profile management|Manual savings account tracking|Simple transaction recording|Monthly member statements|Basic member search functionality|Contact information storage"
                    ],
                    'basic' => [
                        'price' => 1,
                        'features' => "Support for up to 500 members|Loan application workflow|Automated interest calculations|Savings account management|Dividend eligibility tracking|Member portfolio analysis|Payment reminder system|Monthly financial summaries|Member communication notifications"
                    ],
                    'premium' => [
                        'price' => 2,
                        'features' => "Unlimited member capacity|SASRA-compliant regulatory reporting|Sophisticated dividend distribution engine|Advanced risk assessment tools|Real-time financial dashboards|Multi-branch management support|Member mobile access portal|Automated compliance audits|Dedicated account manager support"
                    ]
                ]
            ],

            [
                'category' => 'sacco',
                'title' => 'Evolve SACCO Loan Manager',
                'description' => 'Specialized loan management with flexible schedules and interest calculations.',
                'rating' => 4.5,
                'rating_count' => 956,
                'note' => 'Integrated with M-Pesa',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => "Basic loan tracking up to 50 loans|Simple application forms|Manual payment recording|Monthly loan status reports|Basic borrower statements|Email notifications"
                    ],
                    'basic' => [
                        'price' => 1,
                        'features' => "Support for up to 500 active loans|M-Pesa payment integration|Flexible repayment schedules|Automated interest calculations|Loan documentation management|Weekly collection reports|Payment reminder system|Portfolio performance analysis|Borrower communication system"
                    ],
                    'premium' => [
                        'price' => 2,
                        'features' => "Unlimited loan capacity|Advanced M-Pesa and payment integrations|Multiple interest calculation methods|Automated SMS payment reminders|Advanced credit scoring system|Risk assessment and analytics|Multi-channel payment processing|Delinquency management tools|Comprehensive financial reporting"
                    ]
                ]
            ],

            // School
            [
                'category' => 'school',
                'title' => 'Evolve SchoolSoft Kenya',
                'description' => 'Student records, fees, exams, and reporting.',
                'rating' => 5.0,
                'rating_count' => 1756,
                'note' => 'For primary & secondary schools',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => "Basic student database for up to 100 students|Simple class management|Manual exam entry|Basic attendance marking|Monthly summary reports|Contact information storage"
                    ],
                    'basic' => [
                        'price' => 1,
                        'features' => "Support for up to 500 students|Advanced academic tracking system|Continuous assessment recording|Fee management and tracking|Examination result compilation|Digital report card generation|Parent access portal|Class performance analytics|Payment history tracking"
                    ],
                    'premium' => [
                        'price' => 2,
                        'features' => "Unlimited student capacity|Comprehensive parent portal with real-time updates|Online fee payment integration|Advanced examination analytics|Performance tracking and trending|Staff evaluation features|Payroll integration support|Customizable report cards|Mobile app access for parents"
                    ]
                ]
            ],

            [
                'category' => 'school',
                'title' => 'Evolve EduFinance Manager',
                'description' => 'School fee management with M-Pesa integration, receipting, and balances.',
                'rating' => 4.5,
                'rating_count' => 1328,
                'note' => '+KSh 10 per student',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => "Basic fee tracking for up to 50 students|Manual payment recording|Simple balance calculation|Monthly fee reports|Email statements|Receipt generation"
                    ],
                    'basic' => [
                        'price' => 1999,
                        'features' => "Fee management for up to 300 students|M-Pesa payment integration|Automated receipt generation|Customizable fee structures|Payment reminder system|Arrears tracking and reporting|Multiple program support|Weekly collection reports|Balance inquiry system"
                    ],
                    'premium' => [
                        'price' => 4499,
                        'features' => "Unlimited student capacity|Advanced payment gateway integration|Multi-channel payment processing|Sophisticated reporting and analytics|Automated dunning system for overdue accounts|Parent portal with online payment|Bank reconciliation tools|Payment trend analysis|Priority support and training"
                    ]
                ]
            ],

            // POS
            [
                'category' => 'pos',
                'title' => 'Evolve POS Kenya Pro',
                'description' => 'POS with inventory, sales tracking, and receipts.',
                'rating' => 4.5,
                'rating_count' => 2451,
                'note' => 'Includes hardware support',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => "Single terminal POS system|Basic sales recording|Manual product entry|Daily sales summary|Simple receipts|Cash reconciliation"
                    ],
                    'basic' => [
                        'price' => 2999,
                        'features' => "Single store operation|Barcode scanning capability|Real-time inventory tracking|Low stock alerts|Daily sales reports|Revenue tracking by category|Customer database|Hardware printer support|Transaction history"
                    ],
                    'premium' => [
                        'price' => 6999,
                        'features' => "Multi-terminal and multi-store support|Advanced inventory management across branches|Supplier integration features|Comprehensive sales analytics|Customer loyalty programs|Sales commission tracking|Hardware setup and support|Advanced reporting dashboards|Performance metrics analysis"
                    ]
                ]
            ],

            [
                'category' => 'pos',
                'title' => 'Evolve Retail Manager Kenya',
                'description' => 'Inventory, sales reports, customers, and suppliers.',
                'rating' => 4.0,
                'rating_count' => 1637,
                'note' => 'Multi-store support',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => "Single store inventory management|Basic stock tracking|Manual product entry|Customer contact management|Monthly reports|Supplier contact storage"
                    ],
                    'basic' => [
                        'price' => 2499,
                        'features' => "Support for up to 2 stores|Centralized inventory control|Customer management system|Supplier tracking and orders|Purchase order generation|Stock movement reports|Multi-user access|Weekly inventory analysis|Performance metrics"
                    ],
                    'premium' => [
                        'price' => 5499,
                        'features' => "Unlimited store and branch capacity|Real-time inventory synchronization|Advanced supplier portal|Predictive analytics and forecasting|Profitability analysis by store|Automated reordering system|Comprehensive financial reporting|Integration with accounting system|Advanced dashboards and analytics"
                    ]
                ]
            ],

            // Accounting
            [
                'category' => 'accounting',
                'title' => 'Evolve BizBooks Accounting',
                'description' => 'Complete accounting with KRA tax compliance features.',
                'rating' => 5.0,
                'rating_count' => 1892,
                'note' => 'KRA compliant',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => "Basic invoicing system|Expense tracking|Customer management|Simple income reports|Manual tax calculation|Receipt storage"
                    ],
                    'basic' => [
                        'price' => 1999,
                        'features' => "Full double-entry bookkeeping|KRA tax integration|Monthly financial statements|Bank reconciliation system|Invoice and receipt generation|Payment tracking system|Expense categorization|Monthly profit & loss reports|Vendor management"
                    ],
                    'premium' => [
                        'price' => 4999,
                        'features' => "Multi-company accounting operations|Full tax compliance features|Advanced financial analysis tools|Budgeting and forecasting|Automated bank feeds|Transaction matching system|Comprehensive audit trails|User activity logging|Multi-user with role management"
                    ]
                ]
            ],

            // Inventory
            [
                'category' => 'inventory',
                'title' => 'Evolve Inventory Tracker',
                'description' => 'Stock, barcodes, reorder alerts, suppliers.',
                'rating' => 4.5,
                'rating_count' => 945,
                'note' => 'Mobile app included',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => "Basic inventory tracking up to 500 items|Manual stock entry|Simple balance reports|Monthly reorder tracking|Basic supplier list|Email notifications"
                    ],
                    'basic' => [
                        'price' => 1499,
                        'features' => "Support for up to 5000 items|Barcode generation and scanning|Automated reorder alerts|Purchase order generation|Supplier management system|Stock movement reports|Inventory aging analysis|Mobile app access|Weekly performance reports"
                    ],
                    'premium' => [
                        'price' => 3999,
                        'features' => "Unlimited item capacity|Multi-location warehouse management|Serialization support|Supplier integration for automated ordering|Advanced demand forecasting|Inventory optimization tools|Real-time synchronization|Mobile app with offline capability|Advanced analytics dashboard"
                    ]
                ]
            ],
        ];

        foreach ($products as $p) {
            // Get basic tier price to use as display price
            $basicPrice = $p['subscription_tiers']['basic']['price'] ?? 0;

            Product::updateOrCreate(
                ['title' => $p['title']],
                [
                    'category_id' => $bySlug($p['category']),
                    'description' => $p['description'],
                    'price' => $basicPrice,
                    'rating' => $p['rating'],
                    'rating_count' => $p['rating_count'],
                    'note' => $p['note'],
                    'is_subscription' => $p['is_subscription'] ?? false,
                    'subscription_tiers' => $p['subscription_tiers'] ?? null,
                ]
            );
        }
    }
}