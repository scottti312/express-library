const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");
const author = require("../models/author");

exports.index = async (req, res) => {
  try {
    const book_count = await Book.countDocuments({});
    const book_instance_count = await BookInstance.countDocuments({});
    const book_instance_available_count = await BookInstance.countDocuments({});
    const author_count = await Author.countDocuments({});
    const genre_count = await Genre.countDocuments({});

    res.render("index", {
      title: "Local Library Home",
      data: {
        book_count,
        book_instance_count,
        book_instance_available_count,
        author_count,
        genre_count,
      },
    });
  } catch (err) {
    res.render("error", { error: err });
  }
};

// Display list of all books.
exports.book_list = async (req, res, next) => {
  try {
    const list_books = await Book.find({}, "title author")
      .sort({ title: 1 })
      .populate("author")
      .exec();
    res.render(
      "book_list",
      {
        title: "Book List",
        book_list: list_books
      });
  } catch (err) {
    res.render("error", { erorr: err })
  }
};

// Display detail page for a specific book.
exports.book_detail = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .populate("genre")
      .exec();
    const book_instance = await BookInstance
      .find({ book: req.params.id })
      .exec();
    res.render(
      "book_detail", {
        title: "Book Detail",
        book: book,
        book_instances: book_instance,
      });
  } catch (err) {
    res.render("error", { error: err })
  }
};

// Display book create form on GET.
exports.book_create_get = async (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  try {
    const authors = await Author.find();
    const genres = await Genre.find();
    res.render("book_form", {
      title: "Create Book",
      authors: authors,
      genres: genres,
    });
  } catch (err) {
    next(err);
  }
};

// Handle book create on POST.
exports.book_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });
    
    if (!errors.isEmpty()) {
      try {
        const authors = await Author.find().exec();
        const genres = await Genre.find().exec();
        for (const genre of genres) {
          if (book.genre.includes(genre._id)) {
            genre.checked = "true";
          }
        }
        res.render("book_form", {
          title: "Create Book",
          authors: authors,
          genres: genres,
          book,
          errors: errors.array(),
        });
      } catch (err) {
        next(err);
      }
      return;
    } else  {
      await book.save();
      res.redirect(book.url);
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    .populate("author")
    .exec();  
    const book_instances = await BookInstance.find({ book: req.params.id }).exec();
    if (book == null) {
      res.redirect("/catalog/books");
    }
    res.render("book_delete", {
      title: "Delete Book",
      book: book,
      book_instances: book_instances,
    });
  }
  catch (err) {
    return next(err);
  }
};

// Handle book delete on POST.
exports.book_delete_post = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).exec();
    const book_instances = await BookInstance.find({ book: req.params.id }).exec();
    if (book_instances.length > 0) {
      res.render("book_delete", {
        title: "Delete Author",
        book: book,
        book_instances: book_instances,
      });
      return;
    }
    Book.findByIdAndDelete(req.body.bookid).exec();
    res.redirect("/catalog/books");
  }
  catch (err) {
    return next(err);
  }
};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
  const [book, allAuthors, allGenres] = await Promise.all([
    await Book.findById(req.params.id).populate("author").populate("genre").exec(),
    await Author.find().exec(),
    await Genre.find().exec(),
  ]);
  if (book === null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  for (const genre of allGenres) {
    for (const book_g of book.genre) {
      if (genre._id.toString() === book_g._id.toString()) {
        genre.checked = "true";
      }
    }
  }
  res.render("book_form", {
    title: "Update Book",
    authors: allAuthors,
    genres: allGenres,
    book: book,
  });
};

// Handle book update on POST.
exports.book_update_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },

  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().exec(),
        Genre.find().exec(),
      ]);
      for (const genre of allGenres) {
        if (book.genre.indexOf(genres._id) > -1) {
          genre.checked = "true";
        }
      }
      res.render("book_form", {
        title: "Update Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
      return;
    } else {
      const thebook = await Book.findByIdAndUpdate(req.params.id, book, {});
      res.redirect(thebook.url);
    }
  },
];