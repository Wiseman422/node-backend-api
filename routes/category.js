import Category from '../models/category';

export default (router) => {

  router.get('/', (req, res, next) => {
    let category =  new Category(req.database);
    category.getAll()
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next);
  });
};


