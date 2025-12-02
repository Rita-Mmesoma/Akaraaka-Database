const Book = require('../models/Book')
const { applyAPIFeatures } = require('../utils/apiFeatures')

exports.createBook = async (req, res, next) => {
    try{
        const { title, author, description, category, stock} = req.body
        const coverUrl = req.file?.path
        
        if(!coverUrl){
            return res.status(400).json({message: 'Cover image required'})
        }
        const book = await Book.create({
            title,
            author,
            description,
            category,
            stock,
            cover: coverUrl,
        })
        res.status(201).json(book)
    }catch(err){
        console.log('createBook book.controller', err)
        next(err)
        res.status(500).json({error: err.message || 'Failed to create book'})
    }
}

exports.updateBook = async (req, res, next) => {
    try{
        const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if(!updated){
            return res.status(404).json({ message: 'Not found' })
        }
        res.json(updated)
    }catch(err){
        console.log('updateBook book.controller', err)
        next(err)
    }
}

exports.deleteBook = async (req, res, next) =>{
    try{
        const del = await Book.findByIdAndDelete(req.params.id)
        if(!del){
            return res.status(404).json({ message: 'Not found' })
        }
        res.json({ message: 'Deleted' })
    }catch(err){
        console.log('deleteBook book.controller', err)
        next(err)
    }
}

exports.getBooks = async (req, res, next) =>{
    try{
        const limit = 100
        const { search, category, page } = req.query
        const { filter, skip, limit:lim } = applyAPIFeatures(null, {search, category, page, limit})

        let baseFilter = filter
        if(!req.user || req.user.role === 'user'){
            baseFilter = { ...filter, published: true }
        }

        const q = Book.find(baseFilter)
            .populate('category', 'name slug')
            .sort('-createdAt')
            .skip(skip)
            .limit(lim)

        const [items, total] = await Promise.all([
            q,
            Book.countDocuments(baseFilter)
        ])

        res.json({
            page: Number(page) || 1,
            limit: lim,
            total,
            items
        })
    }catch(err){
        console.log('getBooks book.controller', err)
        next(err)
    }
}

exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('category', 'name slug');
    if (!book) return res.status(404).json({ message: 'Not found' });

    if ((!req.user || req.user.role === 'user') && !book.published) {
      return res.status(403).json({ message: 'Unavailable' });
    }

    res.json(book);
  } catch (err) { 
    console.log('getBookById book.controller', err)
    next(err); 
    }
};