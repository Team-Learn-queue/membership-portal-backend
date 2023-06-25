const voteController = require("../controller/voting-controller");

const express = require("express");
const router = express.Router();


router.get('/votes/:voteId', voteController.getVote);
router.put('/votes/:voteId', voteController.updateVote);
router.delete('/votes/:voteId', voteController.deleteVote);

module.exports = router;