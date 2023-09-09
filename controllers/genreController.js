const Genre = require("../models/genre");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = async (req, res) => {
  try {
    const genre_list = await Genre.find()
      .sort([["name", "ascending"]])
      .exec();

    res.render("genre_list", {
      title: "Genre List",
      genre_list: genre_list,
    });
  } catch (err) {
    res.render("error", { error: err })
  }
};

// Display detail page for a specific Genre.
exports.genre_detail = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id).exec();
    const genre_books = await Book.find({ genre: req.params.id }).exec();
    if (genre == null) {
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }
    res.render("genre_detail", {
      title: "Genre Detail",
      genre: genre,
      genre_books: genre_books,
    });
  } catch (err) {
    res.render("error", { error: err });
  }
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
  res.render("genre_form", { title: "Create Genre" });
  res.render("genre_form", {
    title: "Create Genre",
    genre,
    errors: errors.array(),
  });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      try {
        const found_genre = await Genre.findOne({ name: req.body.name }).exec();
        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          await genre.save();
          res.redirect(genre.url);
        }
      }
      catch (err) {
        return next(err);
      }
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id).exec();
    const books = await Book.find({ genre: req.params.id }).exec();
    if (genre == null) {
      res.redirect("/catalog/genre");
    }
    res.render("genre_delete", {
      title: "Delete Genre",
      genre: genre,
      books: books,
    });
  }
  catch (err) {
    return next(err);
  }
};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id).exec();
    const books = await Book.find({ genre: req.params.id }).exec();
    if (books.length > 0) {
      res.render("genre_delete", {

      });
      return;
    }
    Genre.findByIdAndDelete(req.body.genreid).exec();
    res.redirect("/catalog/genres");
  }
  catch (err) {
    return next(err);
  }
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
};

// Handle Genre update on POST.
exports.genre_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
};
