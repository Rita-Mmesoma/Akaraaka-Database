exports.applyAPIFeatures = (query, { search, category, page = 1, limit = 12}) => {
    const filter = {}
    if(search){
        filter.$or = [
            { title: { $regex: search, $options: 'i'}},
            { author: { $regex: search, $options: 'i'}},
        ]
    }
    if(category){
        filter.category = category
    }

    const skip = (Number(page) - 1) * Number(limit)
    return { filter, skip, limit: Number(limit)}
}