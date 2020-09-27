const express = require("express");
const router = express.Router();

const {
  create,
  list,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  photo,
  listRelated
} = require("../controllers/blogs");
const {
  requireSignin,
  authMiddleware,
  adminMiddleware,
} = require("../controllers/auth");

router.post("/blog", requireSignin, adminMiddleware, create);
router.get("/blogs", list);
router.post("/blogs-categories-tags", listAllBlogsCategoriesTags);
router.get("/blogs/:slug", read);
router.delete("/blogs/:slug", requireSignin, adminMiddleware, remove);
router.put("/blogs/:slug", requireSignin, adminMiddleware, update);
router.get('/blog/photo/:slug', photo)
router.post('/blogs/related', listRelated)

module.exports = router;
