const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = async (req, res) => {
  try {
    const list_bookinstances = await BookInstance.find()
      .populate("book")
      .exec();

    res.render("bookinstance_list", {
      title: "Book Instance List",
      bookinstance_list: list_bookinstances,
    });

  } catch (err) {
    res.render("error", { error: err });
  }
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res) => {
  try {
    const bookinstance = await BookInstance.findById(req.params.id)
      .populate("book")
      .exec();


    res.render("bookinstance_detail", {
      title: `Copy: ${bookinstance.book.title}`,
      bookinstance: bookinstance,
    });
  } catch (err) {
    res.render("error", { error: err });
  }
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
  try {
    const books = await Book.find({}, "title").exec();
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: books,
    });
  } catch (err) {
    next(err);
  }
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body("book", "Book must be specified")
  .trim()
  .isLength({ min: 1 })
  .escape(),
  body("imprint", "Imprint must be specified")
  .trim()
  .isLength({ min: 1 })
  .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
  .optional({ checkFalsy: true })
  .isISO8601()
  .toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      try {
        const books = await Book.find({}, "title").exec();
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance,
        });
      } catch (err) {
        return next(err);
      }
      return;
    }
    
    try {
      bookinstance.save();
      res.redirect(bookinstance.url);
    } catch (err) {
      return next(err);
    }
  },
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance delete POST");
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
