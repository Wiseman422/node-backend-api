import _ from 'lodash';
import Business from '../models/business';
import BusinessLocation from '../models/location';
import BusinessMetadata from '../models/businessMetadata';
import Url from 'url';

export default (router) => {

  router.get('/', (req, res, next) => {
    let business =  new Business(req.database);
    business.getBusinessUrls(req.query.name)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next);
  });

  router.post('/', (req, res, next) => {
    req.checkBody('url', 'url is required.').notEmpty();
    req.checkBody('name', 'name is required.').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    }
    else {

      let business = _.pick(req.body, 'categoryId', 'name', 'description');
      let businessLocation = {
        webAddress: req.body.url
      };

      let businessModel = new Business(req.database);
      let businessLocationModel = new BusinessLocation(req.database);

      businessModel.insert(business)
      .then(business => {
        businessLocation.businessId = business.id;
        return Promise.props({
          business,
          businessLocation: businessLocationModel.insert(businessLocation)
        });
      })
      .then((result) =>  {
        let data = _.pick(result.business, 'id', 'name','description');
        data.url = result.businessLocation.webAddress;

        res.status(201).json(data);
      })
      .catch(next);
    }

  });

  router.patch('/:id', (req, res, next) => {

      let businessId = req.params.id;
      let data = _.pick(req.body, 'name');

      if (!Object.keys(data).length) {
        return res.status(400).json({ message: 'No valid field found' });
      }

      let business = new Business(req.database);

      business.update(businessId, data)
      .then(() => {
        res.status(200).send(_.assign({ id: businessId }, data));
      })
      .catch(next);
  });


  router.get('/urls', (req, res, next) => {
    let business =  new Business(req.database);
    business.getBusinessUrls()
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next);
  });


  router.post('/:id/swapUrl', (req, res) => {

    req.checkBody('url', 'url is required.').notEmpty();
    req.checkBody('businessId', 'businessId is required.').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
      res.status(400).send(errors);
    }
    else {
      let businessId = req.params.id;
      let data = _.pick(req.body, 'businessId', 'url');
      let businessLocation = new BusinessLocation(req.database);
      let businessMetadata = new BusinessMetadata(req.database);

      let url = data.url.indexOf('http') >= 0 ? data.url : 'http://' + data.url;
      let hostname = Url.parse(url).hostname;

      Promise.all([
        businessLocation.updateByBusinessIdUrl(businessId, hostname, { businessId: data.businessId }),
        businessMetadata.updateByBusinessIdUrl(businessId, hostname, { businessId: data.businessId })
      ])
      .then(() => {
        res.sendStatus(200);
      });
    }
  });

  router.post('/:id/url', (req, res, next) => {
    let id = req.params.id;

    if (id) {
      req.checkBody('url', 'url is required.').notEmpty();

      let errors = req.validationErrors();
      if (errors) {
        res.status(400).send(errors);
      }
      else {
        let data = {
          webAddress: req.body.url,
          businessId: req.params.id
        };

        let businessLocation = new BusinessLocation(req.database);
        businessLocation.insert(data)
        .then((row) => {
          let business =  new Business(req.database);
          return business.getBusinessUrlsByLocationId(row.id);
        })
        .then((row) => {
          res.status(200).json(row);
        })
        .catch(next);
      }
    }
    else {
      res.sendStatus(400);
    }
  });


  router.get('/:id/deals', (req, res) => {
    let id = req.params.id;
    if (id) {
      var business = new Business(req.database);
      business.getBusinessDeals(id)
      .then((rows) => {
        res.status(200).json(rows);
      });
    }
    else {
      res.sendStatus(400);
    }
  });

  router.get('/:id/deals/:dealid', (req, res) => {
    let id = req.params.id;
    let dealid = req.params.dealid;
    if (id && dealid) {
      let business = new Business(req.database);
      business.getBusinessDeal(id, dealid)
      .then((rows) => {
        res.status(200).json(rows);
      });
    }
    else {
      res.sendStatus(400);
    }
  });

  router.get('/:id/metadata', (req, res, next) => {

    let businessMetadata = new BusinessMetadata(req.database);
    businessMetadata.getByBusiness(req.params.id)
    .then(rows => res.status(200).json(rows))
    .catch(next);
  });

  router.post('/:id/metadata', (req, res, next) => {

    req.checkBody('url', 'url is required.').notEmpty();
    req.checkBody('pageType', 'pageType is required.').notEmpty();
    req.checkBody('order').notEmpty().withMessage('order is required.').isInt().withMessage('order must have a interger value');
    req.checkBody('step').notEmpty().withMessage('step is required.').isInt().withMessage('step must have a interger value');
    req.checkBody('selector', 'selector is required').notEmpty();
    req.checkBody('membershipField', 'membershipField is required').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
    }
    else {

      let metadata = _.pick(req.body, 'pageType','url', 'order', 'step', 'selector', 'membershipField');
      metadata.businessId = req.params.id;

      let businessMetadata = new BusinessMetadata(req.database);

      businessMetadata.insert(metadata)
      .then((row) => res.status(201).json(row))
      .catch(next);

    }

  });

  router.delete('/:id/metadata/:metadataId', (req, res, next) => {
    let businessMetadata = new BusinessMetadata(req.database);
    businessMetadata.deleteByBusinessAndId(req.params.id, req.params.metadataId)
    .then(rows => res.sendStatus(200))
    .catch(next);
  });
};
