const Category = require('../models/Category')
const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, '-')

exports.createCategory = async (req, res, next) => {
    try{
        const { name, description = ''} = req.body
        const slug = slugify(name)
        const exists = await Category.findOne({ slug })
        if(exists){
            return res.status(409).json({ message: 'Category exists'})
        }

        const category = await Category.create({ name, slug, description })
        res.status(201).json(category)
    }catch(err){
        console.log('category controller', err)
        next(err)
    }
}

exports.getCategories = async (req, res, next) => {
    try{
        const cats = await Category.find().sort('name')
        res.json(cats)
    }catch(err){
        console.log('getCategories from controller', err)
        next(err)
    }
}

exports.updateCategories = async (req, res, next) => {
    try{
        const { id } = req.params
        let { name, description } = req.body
        const updates = {}
        if(name){
            updates.name = name
            updates.slug = slugify(name)
        }
        if(description !== undefined){
            updates.description = description
        }

        const updated = await Category.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    }catch(err){
        console.log('updateCategories from controller', err)
        next(err)
    }
}

exports.deleteCategory = async (req, res, next) => {
    try{
        const del = await Category.findByIdAndDelete(req.params.id)
        if(!del){
            return res.status(404).json({ message: 'Not found'})
        }
        res.json({ message: 'Deleted'})
    }catch(err){
        console.log('deleteCategory from controller', err)
        next(err)
    }
}