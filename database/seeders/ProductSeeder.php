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
                'price' => 1,
                'rating' => 4.5,
                'rating_count' => 2524,
                'note' => 'Handles all Kenyan compliance',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => 'Up to 10 employees, basic payroll'
                    ],
                    'basic' => [
                        'price' => 2500,
                        'features' => 'Up to 50 employees, NHIF & NSSF integration'
                    ],
                    'premium' => [
                        'price' => 5999,
                        'features' => 'Unlimited employees, KRA compliance, advanced reports'
                    ]
                ]
            ],

            // SACCO
            [
                'category' => 'sacco',
                'title' => 'Evolve SACCO Manager Pro',
                'description' => 'Loans, savings, dividends, and member management.',
                'price' => 25999,
                'rating' => 5.0,
                'rating_count' => 2112,
                'note' => 'SASRA compliant reports',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => 'Up to 100 members, basic member management'
                    ],
                    'basic' => [
                        'price' => 3999,
                        'features' => 'Up to 500 members, loan management, savings tracking'
                    ],
                    'premium' => [
                        'price' => 8999,
                        'features' => 'Unlimited members, full SASRA compliance, dividend distribution'
                    ]
                ]
            ],

            [
                'category' => 'sacco',
                'title' => 'Evolve SACCO Loan Manager',
                'description' => 'Specialized loan management with flexible schedules and interest calculations.',
                'price' => 18500,
                'rating' => 4.5,
                'rating_count' => 956,
                'note' => 'Integrated with M-Pesa',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => 'Up to 50 active loans'
                    ],
                    'basic' => [
                        'price' => 2999,
                        'features' => 'Up to 500 active loans, M-Pesa integration'
                    ],
                    'premium' => [
                        'price' => 6499,
                        'features' => 'Unlimited loans, advanced interest calculations, SMS reminders'
                    ]
                ]
            ],

            // School
            [
                'category' => 'school',
                'title' => 'Evolve SchoolSoft Kenya',
                'description' => 'Student records, fees, exams, and reporting.',
                'price' => 19999,
                'rating' => 5.0,
                'rating_count' => 1756,
                'note' => 'For primary & secondary schools',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => 'Up to 100 students, basic records'
                    ],
                    'basic' => [
                        'price' => 3500,
                        'features' => 'Up to 500 students, fee management, exam tracking'
                    ],
                    'premium' => [
                        'price' => 7999,
                        'features' => 'Unlimited students, parent portal, online fee payment'
                    ]
                ]
            ],

            [
                'category' => 'school',
                'title' => 'Evolve EduFinance Manager',
                'description' => 'School fee management with M-Pesa integration, receipting, and balances.',
                'price' => 14500,
                'rating' => 4.5,
                'rating_count' => 1328,
                'note' => '+KSh 10 per student',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => 'Up to 50 students, basic fee tracking'
                    ],
                    'basic' => [
                        'price' => 1999,
                        'features' => 'Up to 300 students, M-Pesa integration, receipts'
                    ],
                    'premium' => [
                        'price' => 4499,
                        'features' => 'Unlimited students, payment reminders, detailed reports'
                    ]
                ]
            ],

            // POS
            [
                'category' => 'pos',
                'title' => 'Evolve POS Kenya Pro',
                'description' => 'POS with inventory, sales tracking, and receipts.',
                'price' => 15999,
                'rating' => 4.5,
                'rating_count' => 2451,
                'note' => 'Includes hardware support',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => 'Single store, basic sales tracking'
                    ],
                    'basic' => [
                        'price' => 2999,
                        'features' => 'Single store, inventory management, daily reports'
                    ],
                    'premium' => [
                        'price' => 6999,
                        'features' => 'Multiple stores, advanced inventory, hardware support'
                    ]
                ]
            ],

            [
                'category' => 'pos',
                'title' => 'Evolve Retail Manager Kenya',
                'description' => 'Inventory, sales reports, customers, and suppliers.',
                'price' => 12900,
                'rating' => 4.0,
                'rating_count' => 1637,
                'note' => 'Multi-store support',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => 'Single store, basic inventory'
                    ],
                    'basic' => [
                        'price' => 2499,
                        'features' => 'Up to 2 stores, customer management, supplier tracking'
                    ],
                    'premium' => [
                        'price' => 5499,
                        'features' => 'Unlimited stores, advanced reporting, analytics dashboard'
                    ]
                ]
            ],

            // Accounting
            [
                'category' => 'accounting',
                'title' => 'Evolve BizBooks Accounting',
                'description' => 'Complete accounting with KRA tax compliance features.',
                'price' => 8999,
                'rating' => 5.0,
                'rating_count' => 1892,
                'note' => 'KRA compliant',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => 'Basic invoicing, simple reports'
                    ],
                    'basic' => [
                        'price' => 1999,
                        'features' => 'Full accounting, KRA integration, monthly reconciliation'
                    ],
                    'premium' => [
                        'price' => 4999,
                        'features' => 'Multi-company accounting, tax compliance, audit trail'
                    ]
                ]
            ],

            // Inventory
            [
                'category' => 'inventory',
                'title' => 'Evolve Inventory Tracker',
                'description' => 'Stock, barcodes, reorder alerts, suppliers.',
                'price' => 7499,
                'rating' => 4.5,
                'rating_count' => 945,
                'note' => 'Mobile app included',
                'is_subscription' => true,
                'subscription_tiers' => [
                    'free' => [
                        'price' => 0,
                        'features' => 'Up to 500 items, basic tracking'
                    ],
                    'basic' => [
                        'price' => 1499,
                        'features' => 'Up to 5000 items, barcodes, reorder alerts'
                    ],
                    'premium' => [
                        'price' => 3999,
                        'features' => 'Unlimited items, mobile app, supplier integration, analytics'
                    ]
                ]
            ],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(
                ['title' => $p['title']],
                [
                    'category_id' => $bySlug($p['category']),
                    'description' => $p['description'],
                    'price' => $p['price'],
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