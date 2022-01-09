const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoodse = require("passport-local-mongoose");

require("dotenv").config();
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./"));

app.use(
  session({
    secret: "#%^67V000y(>J@q73!u",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_URL);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoodse);

const User = new mongoose.model("users", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const patientSchema = {
  patientId: String,
  name: String,
  age: Number,
  mobileNo: Number,
  address: String,
  disease: String,
};

const Patient = mongoose.model("patients", patientSchema);

// ---- get ----- >>>

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/home", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("home");
  } else {
    res.redirect("/");
  }
});

app.get("/add", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("add");
  } else {
    res.redirect("/");
  }
});

app.get("/find", (req, res) => {
  res.render("search");
});

app.get("/update", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("search", {
      option: "Upadte",
      buttonName: "Search",
      url: "update",
    });
  } else {
    res.redirect("/");
  }
});

app.get("/search", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("search", {
      option: "search",
      buttonName: "Search",
      url: "search",
    });
  } else {
    res.redirect("/");
  }
});

app.get("/delete", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("search", {
      option: "Delete",
      buttonName: "Delete",
      url: "delete",
    });
  } else {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
// ----- post ---->>>

app.post("/", (req, res) => {
  // User.register({ username: req.body.username }, req.body.password).then((user) => {
  //   passport.authenticate("local")(req, res, () => {
  //     res.redirect("/home")
  //   })
  // }).catch((err) => {
  //   console.log(err)
  //   res.redirect("/")
  // })

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/home");
      });
    }
  });
});

app.post("/home", (req, res) => {
  if (req.body.patientId) {
    const patinet = new Patient(req.body);
    patinet.save().then(() => {
      res.render("success", {
        subTitle: "Success",
        subject: "added",
      });
    });
  } else {
    res.render("failure", {
      title: "Please add patient detail's",
      url: "add",
    });
  }
});

app.post("/search" , (req, res) => {
  Patient.findOne({ patientId: req.body.patientId }).then((userData) => {
    if (userData) {
      res.render("searchResults", {
        patientId: userData.patientId,
        name: userData.name,
        age: userData.age,
        mobileNo: userData.mobileNo,
        address: userData.address,
        disease: userData.disease,
      })
    }
    else {
      res.render("failure", {
        title: "The requisted Id is dosn't exist",
        url: "search",
      });
    }
  })
})

app.post("/update", (req, res) => {
  Patient.findOne({ patientId: req.body.patientId }).then((userData) => {
    if (userData) {
      res.render("update", {
        patientId: userData.patientId,
        name: userData.name,
        age: userData.age,
        mobileNo: userData.mobileNo,
        address: userData.address,
        disease: userData.disease,
      });
    } else {
      res.render("failure", {
        title: "The requisted Id is dosn't exist",
        url: "update",
      });
    }
  });
});

app.post("/updateresults", (req, res) => {
  Patient.findOneAndUpdate({ patientId: req.body.patientId }, req.body).then(() => {
      res.render("success", {
        subTitle: "Updated",
        subject: "updated",
      });
    }
  );
});

app.post("/delete", (req, res) => {
  if (req.body.patientId) {
    Patient.findOneAndDelete({ patientId: req.body.patientId }).then(() => {
      res.render("success", {
        subTitle: "Deleted",
        subject: "delete",
      });
    });
  } else {
    res.render("failure", {
      title: "The requisted Id is dosn't exist",
      url: "delete",
    });
  }
});
// ---------->>>

app.listen(process.env.PORT || 5000, () => {
  console.log("server is running!");
});
