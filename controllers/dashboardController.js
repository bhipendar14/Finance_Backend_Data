const Record = require('../models/Record');

exports.getDashboardSummary = async (req, res) => {
    try {
        const defaultStartDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        const defaultEndDate = new Date();

        // Total income, Total expenses, Net balance
        const totals = await Record.aggregate([
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        let totalIncome = 0;
        let totalExpenses = 0;

        totals.forEach(t => {
            if (t._id === 'income') totalIncome = t.total;
            if (t._id === 'expense') totalExpenses = t.total;
        });

        const netBalance = totalIncome - totalExpenses;

        // Category-wise totals
        const categoryTotals = await Record.aggregate([
            {
                $group: {
                    _id: { category: "$category", type: "$type" },
                    total: { $sum: "$amount" }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        const formattedCategoryTotals = categoryTotals.map(item => ({
            category: item._id.category,
            type: item._id.type,
            total: item.total
        }));

        // Recent transactions (last 5)
        const recentTransactions = await Record.find()
            .sort({ date: -1 })
            .limit(5)
            .populate('createdBy', 'name email');

        // Monthly summary
        const monthlySummary = await Record.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        type: "$type"
                    },
                    total: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 }
            }
        ]);

        const formattedMonthlySummary = monthlySummary.reduce((acc, curr) => {
            const monthYear = `${curr._id.year}-${curr._id.month.toString().padStart(2, '0')}`;
            if (!acc[monthYear]) {
                acc[monthYear] = { income: 0, expense: 0, net: 0 };
            }
            if (curr._id.type === 'income') acc[monthYear].income += curr.total;
            if (curr._id.type === 'expense') acc[monthYear].expense += curr.total;
            acc[monthYear].net = acc[monthYear].income - acc[monthYear].expense;
            return acc;
        }, {});

        res.json({
            totals: {
                totalIncome,
                totalExpenses,
                netBalance
            },
            categoryTotals: formattedCategoryTotals,
            recentTransactions,
            monthlySummary: formattedMonthlySummary
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
