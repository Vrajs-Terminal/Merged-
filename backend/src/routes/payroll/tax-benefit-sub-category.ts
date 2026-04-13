import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// Fetch active categories for dropdown
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.taxBenefitCategory.findMany({
            where: { status: 'Active' },
            select: { id: true, category_name: true, section_code: true, max_limit: true, applicable_regime: true }
        });
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories for dropdown:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// GET / - Fetch all sub categories
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const where: any = {};
        if (search) {
            where.OR = [
                { sub_category_name: { contains: search as string } },
                { code: { contains: search as string } },
                { category: { category_name: { contains: search as string } } }
            ];
        }

        const subCategories = await prisma.taxBenefitSubCategory.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(subCategories);
    } catch (error) {
        console.error("Error fetching sub categories:", error);
        res.status(500).json({ error: "Failed to fetch sub categories" });
    }
});

// POST / - Create a new sub category
router.post('/', async (req, res) => {
    try {
        const { category_id, sub_category_name, code, max_limit, proof_required, declaration_type, applicable_regime, description, status } = req.body;

        // Validation for uniqueness
        const existing = await prisma.taxBenefitSubCategory.findUnique({
            where: { code }
        });
        if (existing) {
            return res.status(400).json({ error: "A sub-category with this Code already exists" });
        }

        // Limit Validation against parent
        const parentCategory = await prisma.taxBenefitCategory.findUnique({ where: { id: parseInt(category_id) } });
        if (!parentCategory) {
            return res.status(404).json({ error: "Parent category not found" });
        }

        const parsedLimit = parseFloat(max_limit) || 0;
        if (parsedLimit > parentCategory.max_limit) {
            return res.status(400).json({ 
                error: `Sub-category limit (₹${parsedLimit}) cannot exceed parent section ${parentCategory.section_code} limit (₹${parentCategory.max_limit})` 
            });
        }

        const subCat = await prisma.taxBenefitSubCategory.create({
            data: {
                category_id: parseInt(category_id),
                sub_category_name,
                code,
                max_limit: parsedLimit,
                proof_required: proof_required ?? false,
                declaration_type: declaration_type || 'Yearly',
                applicable_regime,
                description,
                status: status || 'Active'
            }
        });

        res.status(201).json({ message: "Sub Category created successfully", data: subCat });
    } catch (error) {
        console.error("Error creating tax benefit sub category:", error);
        res.status(500).json({ error: "Failed to create sub category" });
    }
});

// PUT /:id - Edit sub category
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { category_id, sub_category_name, code, max_limit, proof_required, declaration_type, applicable_regime, description, status } = req.body;

        // Code conflict check
        if (code) {
            const existing = await prisma.taxBenefitSubCategory.findUnique({ where: { code } });
            if (existing && existing.id !== id) {
                return res.status(400).json({ error: "Another sub-category is using this Code" });
            }
        }

        // Limit Validation against parent
        if (category_id !== undefined && max_limit !== undefined) {
            const parentCategory = await prisma.taxBenefitCategory.findUnique({ where: { id: parseInt(category_id) } });
            if (!parentCategory) {
                return res.status(404).json({ error: "Parent category not found" });
            }
            const parsedLimit = parseFloat(max_limit) || 0;
            if (parsedLimit > parentCategory.max_limit) {
                return res.status(400).json({ 
                    error: `Sub-category limit (₹${parsedLimit}) cannot exceed parent section ${parentCategory.section_code} limit (₹${parentCategory.max_limit})` 
                });
            }
        }

        const updated = await prisma.taxBenefitSubCategory.update({
            where: { id },
            data: {
                ...(category_id !== undefined && { category_id: parseInt(category_id) }),
                sub_category_name,
                code,
                max_limit: max_limit !== undefined ? parseFloat(max_limit) : undefined,
                proof_required,
                declaration_type,
                applicable_regime,
                description,
                status
            }
        });

        res.json({ message: "Sub Category updated successfully", data: updated });
    } catch (error) {
        console.error("Error updating tax benefit sub category:", error);
        res.status(500).json({ error: "Failed to update sub category" });
    }
});

// DELETE /:id - Delete sub category
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        await prisma.taxBenefitSubCategory.delete({ where: { id } });
        res.json({ message: "Sub Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting tax benefit sub category:", error);
        res.status(500).json({ error: "Failed to delete sub category" });
    }
});

export default router;
