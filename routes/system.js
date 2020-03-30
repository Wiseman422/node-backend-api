import System from '../models/system';
import LegalPolicy from '../models/legalPolicy';
import LegalPolicyType from '../enums/legalPolicyType';

export default (router) => {

  router.get('/zip/:zipCode', (req, res) => {

    let zip = req.params.zipCode;
    let system =  new System(req.database);

    system.getZip(zip)
    .then(rows => {
      if (rows.length === 0) {
        res.status(404).send();
      }
      else {
        res.status(200).json(rows);
      }
    })   
    .catch(err => {
      res.status(400).send(err);
    });
  });

  router.get('/tc', (req, res) => {
    let legalPolicy =  new LegalPolicy(req.database);

    legalPolicy.lastByPolicyType(LegalPolicyType.value('Terms and Conditions'))
    .then(function (rows) {
        res.status(200).json(rows);
    });
  });

  router.get('/pp', (req, res) => {
    let legalPolicy =  new LegalPolicy(req.database);

    legalPolicy.lastByPolicyType(LegalPolicyType.value('Privacy Policy'))
    .then(function (rows) {
        res.status(200).json(rows);
    });
  });

  router.get('/search/zip/:zipCode', (req, res) => {

    req.checkParams('zipCode')
    .isInt().withMessage('Zip code must be an integer')
    .isLength(2,5).withMessage('Must have have 2 to 5 digits to enable search');

    let zip = req.params.zipCode;
    let system =  new System(req.database);

    var errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
      return;
    } else {

      system.searchZip(zip)
      .then(rows => {
        if (rows.length === 0) {
          res.status(404).send();
        }
        else {
          res.status(200).json(rows);
        }
      })   
      .catch(err => {
        res.status(400).send(err);
      });
    }
  });

};
