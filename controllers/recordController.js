const Record = require('../models/Record');

exports.createRecord = async (req, res) => {
    try {
        const { amount, type, category, date, notes } = req.body;

        if (!amount || !type || !category || !date) {
            return res.status(400).json({ message: 'Please provide all required fields: amount, type, category, date' });
        }

        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ message: 'Type must be either income or expense' });
        }

        const record = await Record.create({
            amount,
            type,
            category,
            date,
            notes,
            createdBy: req.user._id
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecords = async (req, res) => {
    try {
        const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;
        let query = {};

        if (type) query.type = type;
        if (category) query.category = category;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const records = await Record.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Record.countDocuments(query);

        res.json({
            records,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalRecords: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecordById = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        const updatedRecord = await Record.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        await record.deleteOne();
        res.json({ message: 'Record removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
