const express = require("express");
const Job = require("../models/Job");

const router = express.Router();

/*
GET /jobs
Latest jobs
*/
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 }).limit(100);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
GET /jobs/search?keyword=react
*/
router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const jobs = await Job.find({
      $or: [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          company: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    }).limit(100);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
GET /jobs/internships
*/
router.get("/internships", async (req, res) => {
  try {
    const jobs = await Job.find({
      isInternship: true,
    }).sort({
      postedAt: -1,
    });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
GET /jobs/remote
*/
router.get("/remote", async (req, res) => {
  try {
    const jobs = await Job.find({
      isRemote: true,
    }).sort({
      postedAt: -1,
    });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
GET /jobs/category/Finance
*/
router.get("/category/:category", async (req, res) => {
  try {
    const jobs = await Job.find({
      category: req.params.category,
    });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
