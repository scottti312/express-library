const Author = require('../models/author');
const Book = require('../models/book');
const { body, validationResult } = require("express-validator");

exports.author_list = async (req, res) => {
  try {
    const list_authors = await Author.find()
      .sort([["family_name", "ascending"]])
      .exec();
    
      res.render("author_list", {
        title: "Author List",
        author_list: list_authors,
      });
  }
  catch (err) {
    res.render("Error", {error: err});
  }
};

exports.author_detail = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id).exec();
    const author_books = await Book.find({author: req.params.id}, "title summary").exec();
    res.render("author_detail", {
      title: "Author Detail",
      author: author,
      author_books: author_books,
    });

  } catch (err) {
    res.render("Error", {error: err});
  }
};

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = [
  body("first_name")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("First name must be specified.")
  .isAlphanumeric()
  .withMessage("First name has non-alphanumeric characters."),

  body("family_name")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("Family name must be specified.")
  .isAlphanumeric()
  .withMessage("Family name has non-alphanumeric characters"),

  body("date_of_birth", "Invalid date of birth")
  .optional({ checkFalsy: true })
  .isISO8601()
  .toDate(),

  body("date_of_death", "Invalid date of death")
  .optional({ checkFalsy: true })
  .isISO8601()
  .toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      try {
        const found_author = await Author.findOne({ 
          $and: [
            { first_name: req.body.first_name },
            { last_name: req.body.last_name }
          ]
         }).exec();
          console.log(found_author);
        if (found_author) {
          res.redirect(found_author.url)
        } else {
          const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
          });
          await author.save();
          res.redirect(author.url);
        }
      } catch (err) {
        return next(err);
      }
    }
  }
]

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {

  try {
    const author = await Author.findById(req.params.id).exec();
    const authors_books = await Book.find({ author: req.params.id }).exec();

    if (author == null) {
      res.redirect("/catalog/authors");
    }
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: authors_books,
    });
  }
   catch (err) {
    return next(err);
  }
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
  try {
    const author = Author.findById(req.params.authorid).exec();
    const authors_books = Book.find({ author: req.params.authorid }).exec();
    if (authors_books.length > 0) {
      res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: authors_books,
      });
      return;
    }
    Author.findByIdAndDelete(req.body.authorid).exec();
    res.redirect("/catalog/authors");
  }
   catch (err) {
    return next(err);
  }
};

// Display Author update form on GET.
exports.author_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.author_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};