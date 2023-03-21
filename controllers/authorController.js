const Author = require('../models/author');
const Book = require('../models/book');

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
exports.author_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create GET");
};

// Handle Author create on POST.
exports.author_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create POST");
};

// Display Author delete form on GET.
exports.author_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET.
exports.author_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.author_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};