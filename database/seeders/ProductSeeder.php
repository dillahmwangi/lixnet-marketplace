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
                'price' => 100,
                'rating' => 4.5,
                'rating_count' => 2524,
                'note' => 'Handles all Kenyan compliance'
            ],

            // SACCO
            [
                'category' => 'sacco',
                'title' => 'Evolve SACCO Manager Pro',
                'description' => 'Loans, savings, dividends, and member management.',
                'price' => 25999,
                'rating' => 5.0,
                'rating_count' => 2112,
                'note' => 'SASRA compliant reports'
            ],

            [
                'category' => 'sacco',
                'title' => 'Evolve SACCO Loan Manager',
                'description' => 'Specialized loan management with flexible schedules and interest calculations.',
                'price' => 18500,
                'rating' => 4.5,
                'rating_count' => 956,
                'note' => 'Integrated with M-Pesa'
            ],

            // School
            [
                'category' => 'school',
                'title' => 'Evolve SchoolSoft Kenya',
                'description' => 'Student records, fees, exams, and reporting.',
                'price' => 19999,
                'rating' => 5.0,
                'rating_count' => 1756,
                'note' => 'For primary & secondary schools'
            ],

            [
                'category' => 'school',
                'title' => 'Evolve EduFinance Manager',
                'description' => 'School fee management with M-Pesa integration, receipting, and balances.',
                'price' => 14500,
                'rating' => 4.5,
                'rating_count' => 1328,
                'note' => '+KSh 10 per student'
            ],

            // POS
            [
                'category' => 'pos',
                'title' => 'Evolve POS Kenya Pro',
                'description' => 'POS with inventory, sales tracking, and receipts.',
                'price' => 15999,
                'rating' => 4.5,
                'rating_count' => 2451,
                'note' => 'Includes hardware support'
            ],

            [
                'category' => 'pos',
                'title' => 'Evolve Retail Manager Kenya',
                'description' => 'Inventory, sales reports, customers, and suppliers.',
                'price' => 12900,
                'rating' => 4.0,
                'rating_count' => 1637,
                'note' => 'Multi-store support'
            ],

            // Accounting
            [
                'category' => 'accounting',
                'title' => 'Evolve BizBooks Accounting',
                'description' => 'Complete accounting with KRA tax compliance features.',
                'price' => 8999,
                'rating' => 5.0,
                'rating_count' => 1892,
                'note' => 'KRA compliant'
            ],

            // Inventory
            [
                'category' => 'inventory',
                'title' => 'Evolve Inventory Tracker',
                'description' => 'Stock, barcodes, reorder alerts, suppliers.',
                'price' => 7499,
                'rating' => 4.5,
                'rating_count' => 945,
                'note' => 'Mobile app included'
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
                ]
            );
        }
    }
}
