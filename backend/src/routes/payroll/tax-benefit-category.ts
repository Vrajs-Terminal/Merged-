import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET / - Fetch all tax benefit categories
router.get('/', async (req, res) => {
    try {
        const { search, financial_year } = req.query;
        const currentFY = (financial_year as string) || '2025-26';

        const where: any = { financial_year: currentFY };
        if (search) {
            where.OR = [
                { category_name: { contains: search as string } },
                { section_code: { contains: search as string } }
            ];
        }

        const categories = await prisma.taxBenefitCategory.findMany({
            where,
            include: {
                _count: {
                    select: { subCategories: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Mock usage_count for now since EmployeeInvestmentDeclaration is a future module
        const processed = categories.map(cat => ({
            ...cat,
            usage_count: Math.floor(Math.random() * 50) + 10 // Placeholder for UX mockup
        }));

        res.json(processed);
    } catch (error) {
        console.error("Error fetching tax benefit categories:", error);
        res.status(500).json({ error: "Failed to fetch tax benefit categories" });
    }
});

// POST / - Create a new category
router.post('/', async (req, res) => {
    try {
        const { category_name, section_code, max_limit, applicable_regime, financial_year, description, status } = req.body;

        // Validation for uniqueness
        const existing = await prisma.taxBenefitCategory.findUnique({
            where: { section_code }
        });
        if (existing) {
            return res.status(400).json({ error: "A category with this Section Code already exists" });
        }

        const category = await prisma.taxBenefitCategory.create({
            data: {
                category_name,
                section_code,
                max_limit: parseFloat(max_limit) || 0,
                applicable_regime,
                financial_year: financial_year || '2025-26',
                description,
                status: status || 'Active'
            }
        });

        res.status(201).json({ message: "Category created successfully", data: category });
    } catch (error) {
        console.error("Error creating tax benefit category:", error);
        res.status(500).json({ error: "Failed to create category" });
    }
});

// PUT /:id - Edit category
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { category_name, section_code, max_limit, applicable_regime, description, status } = req.body;

        // Check if updating Section code conflicts
        if (section_code) {
            const existing = await prisma.taxBenefitCategory.findUnique({ where: { section_code } });
            if (existing && existing.id !== id) {
                return res.status(400).json({ error: "Another category is using this Section Code" });
            }
        }

        const updated = await prisma.taxBenefitCategory.update({
            where: { id },
            data: {
                category_name,
                section_code,
                max_limit: max_limit !== undefined ? parseFloat(max_limit) : undefined,
                applicable_regime,
                description,
                status
            }
        });

        res.json({ message: "Category updated successfully", data: updated });
    } catch (error) {
        console.error("Error updating tax benefit category:", error);
        res.status(500).json({ error: "Failed to update category" });
    }
});

// DELETE /:id - Delete category
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Validation check for sub categories
        const subCatCount = await prisma.taxBenefitSubCategory.count({ where: { category_id: id } });
        if (subCatCount > 0) {
            return res.status(400).json({ error: "Cannot delete category because it has active sub-categories. Please deactivate it instead." });
        }

        await prisma.taxBenefitCategory.delete({ where: { id } });
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting tax benefit category:", error);
        res.status(500).json({ error: "Failed to delete category" });
    }
});

export default router;
