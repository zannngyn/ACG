import express, { json, response } from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt"
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2"
import session from "express-session";
import env from "dotenv";


// sử dụng express, tạo cổng, tạo số lần sử dụng bcrypt, kết nối .evn
const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

// sử dụng bodyparser và express cho foder public
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// sử dụng cookie
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    }
  })
)

// sử dụng passport và session
app.use(passport.initialize());
app.use(passport.session());

// liên kết với cơ sở dữ liệu
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

//kiểm tra sản phẩm trong cơ sở dữ liệu
async function checkPRODUCT() {
  const result = await db.query("SELECT *  FROM product");
  let productID =[];
  let productIMG = [];
  let productBRAND = [];
  let productNAME =[];
  let productPRICE = [];

  result.rows.forEach((id) => {
    productID.push(id.productid);
  })
  result.rows.forEach((img) => {
    productIMG.push(img.image);
  });
  result.rows.forEach((brand) => {
    productBRAND.push(brand.brand)
  })
  result.rows.forEach((name) => {
    productNAME.push(name.name);
  });
  result.rows.forEach((price) => {
    productPRICE.push(price.price);
  });
  return [productID, productIMG, productNAME, productPRICE, productBRAND];
};

//kiểm tra sản phẩm yêu thích của người dùng
async function checkUSER_fav(id, productIMG) {
  const result = await db.query("SELECT * FROM user_fav WHERE userid = $1", [id]);
  let fav_productid =[];
  let fav_productimg = [];

  result.rows.forEach((id) => {
    fav_productid.push(id.productid);
  });

  const fav_product_id = fav_productid;
  // console.log(fav_product_id);


  for (i = 0; i < fav_product_id.length; i++){
    fav_productimg.push(productIMG[fav_product_id[i]]);
  }
  const fav_product_img = fav_productimg;
  // console.log(fav_product_img);

  return [fav_product_id, fav_product_img]
};

// kiểm tra từng sản phẩm
async function checkPRODUCT_DETAIL(item) {
  const result = await db.query("SELECT *  FROM productdetail WHERE productid = $1", [item]);
  let productIMG1 = [];
  let productIMG2 = [];
  let productIMG3 = [];
  let productIMG4 = [];
  let productNAME =[];
  let productPRICE = [];
  let productBRAND = [];
  let productID =[];
  let productDESCRIPTION = [];

  result.rows.forEach((id) => {
    productID.push(id.productid);
  })
  result.rows.forEach((img) => {
    productIMG1.push(img.image1);
  });
  result.rows.forEach((img) => {
    productIMG2.push(img.image2);
  });
  result.rows.forEach((img) => {
    productIMG3.push(img.image3);
  });
  result.rows.forEach((img) => {
    productIMG4.push(img.image4);
  });
  result.rows.forEach((name) => {
    productNAME.push(name.name);
  });
  result.rows.forEach((price) => {
    productPRICE.push(price.price);
  });
  result.rows.forEach((brand) => {
    productBRAND.push(brand.brand);
  });
  result.rows.forEach((description) => {
    productDESCRIPTION.push(description.description);
  });

  return [productID, productIMG1, productIMG2, productIMG3, productIMG4, productBRAND, productNAME, productPRICE, productDESCRIPTION];
};

//kiểm tra tổng giá trị sản phẩm
async function checkPRICE(fav_product_id) {
  let PRICE = 0;

  for (let i = 0; i < fav_product_id.length; i++) {
    const fav_product = fav_product_id[i];
    const result = await db.query("SELECT productprice FROM product WHERE productid = $1", [fav_product]);
    let productPRICE = []
    result.rows.forEach((price) => {
      productPRICE.push(price.productprice);
    });
    PRICE = PRICE + productPRICE[0];
  };

  return PRICE;
}

// đưa ra product chính
app.get("/", async (req, res) => {
  // lấy thông tin chi tiết sản phẩm 
  const [productID,,,,] =await checkPRODUCT();
  const [,productIMG,,,] = await checkPRODUCT();
  const [,,productNAME,,] = await checkPRODUCT();
  const [,,,productPRICE,] = await checkPRODUCT();
  const [,,,,productBRAND] = await checkPRODUCT();

  // kiểm tra xem có người dùng đăng nhập không?
  const check = req.isAuthenticated();
  const profile = req.user;
  if (profile) {
    const id = profile.id;
    const email = profile.email;
    const displayname = profile.displayname;
    const picture = profile.picture;

    // lấy ra thông tin chi tiết sản phẩm yêu thích
    const [fav_product_id,] = await checkUSER_fav(id, productIMG);
    const [,fav_product_img] = await checkUSER_fav(id, productIMG);
    const price = await checkPRICE(fav_product_id);

      res.render("index.ejs", {
        product_id: productID,
        product_img: productIMG,
        product_name: productNAME,
        product_price: productPRICE,
        product_brand: productBRAND,
        check: check,
        email: email,
        user_name: displayname,
        picture: picture,
        fav_product_id: fav_product_id,
        fav_product_img: fav_product_img,
        price: price,
      });

  } else {
    res.render("index.ejs", {
      product_id: productID,
      product_img: productIMG,
      product_name: productNAME,
      product_price: productPRICE,
      product_brand: productBRAND,
      check: check,
    });
  }
  
});

// đưa ra chi tiết từng sản phẩm
app.get("/product_detail", async (req, res) => {
  const item = req.query.id;

  // lấy thông tin chi tiết sản phẩm
  const [productID,,,,,,,,] =await checkPRODUCT_DETAIL(item);
  const [,productIMG1,,,,,,,] =await checkPRODUCT_DETAIL(item);
  const [,,productIMG2,,,,,,] =await checkPRODUCT_DETAIL(item);
  const [,,,productIMG3,,,,,] =await checkPRODUCT_DETAIL(item);
  const [,,,,productIMG4,,,,] =await checkPRODUCT_DETAIL(item);
  const [,,,,,productBRAND,,,] =await checkPRODUCT_DETAIL(item);
  const [,,,,,,productNAME,,] =await checkPRODUCT_DETAIL(item);
  const [,,,,,,,productPRICE,] =await checkPRODUCT_DETAIL(item);
  const [,,,,,,,,productDESCRIPTION] =await checkPRODUCT_DETAIL(item);

  console.log(productIMG1);
  console.log(productIMG2);
  console.log(productIMG3);
  console.log(productIMG4);
  // xem sét xem có người dùng đăng nhập không?
  const check = req.isAuthenticated();
  const profile = req.user;
  if (profile) {
    const id = profile.id;
    const email = profile.email;
    const displayname = profile.displayname;
    const picture = profile.picture;

    // lấy ra thông tin chi tiết của sản phẩm yêu thích
    const [fav_product_id,] = await checkUSER_fav(id, productIMG);
    const [,fav_product_img] = await checkUSER_fav(id, productIMG);


    res.render("product-detail.ejs", {
      product_id: productID,
      product_img1: productIMG1,
      product_img2: productIMG2,
      product_img3: productIMG3,
      product_img4: productIMG4,
      product_name: productNAME,
      product_price: productPRICE,
      product_brand: productBRAND,
      product_description: productDESCRIPTION,
      check: check,
      email: email,
      user_name: displayname,
      picture: picture,
      fav_product_id: fav_product_id,
      fav_product_img: fav_product_img,
    });

  } else {
    res.render("product-detail.ejs", {
      product_id: productID,
      product_img1: productIMG1,
      product_img2: productIMG2,
      product_img3: productIMG3,
      product_img4: productIMG4,
      product_name: productNAME,
      product_price: productPRICE,
      product_brand: productBRAND,
      product_description: productDESCRIPTION,
      check: check,
    });
  }
});

app.get("/favorite", async (req, res) => {
  const item = req.query.id;

  // lấy thông tin chi tiết sản phẩm
  const [productID,,,,] =await checkPRODUCT_DETAIL(item);
  const [,productIMG,,,] = await checkPRODUCT_DETAIL(item);
  const [,,productNAME,,] = await checkPRODUCT_DETAIL(item);
  const [,,,productPRICE,] = await checkPRODUCT_DETAIL(item);
  const [,,,,productBRAND] = await checkPRODUCT_DETAIL(item);

  // xem sét xem có người dùng đăng nhập không?
  const check = req.isAuthenticated();
  const profile = req.user;
  if (profile) {
    const id = profile.id;
    const email = profile.email;
    const displayname = profile.displayname;
    const picture = profile.picture;

    // lấy ra thông tin chi tiết của sản phẩm yêu thích
    const [fav_product_id,] = await checkUSER_fav(id, productIMG);
    const [,fav_product_img] = await checkUSER_fav(id, productIMG);


    res.render("favorite.ejs", {
      product_id: productID,
      product_img: productIMG,
      product_name: productNAME,
      product_price: productPRICE,
      product_brand: productBRAND,
      check: check,
      email: email,
      user_name: displayname,
      picture: picture,
      fav_product_id: fav_product_id,
      fav_product_img: fav_product_img,
    });

  } else {
    res.render("favorite.ejs", {
      product_id: productID,
      product_img: productIMG,
      product_name: productNAME,
      product_price: productPRICE,
      product_brand: productBRAND,
      check: check,
    });
  }
})

app.get("/checkout", async (req, res) => {
  const item = req.query.id;

  // lấy thông tin chi tiết sản phẩm
  const [productID,,,,] =await checkPRODUCT_DETAIL(item);
  const [,productIMG,,,] = await checkPRODUCT_DETAIL(item);
  const [,,productNAME,,] = await checkPRODUCT_DETAIL(item);
  const [,,,productPRICE,] = await checkPRODUCT_DETAIL(item);
  const [,,,,productBRAND] = await checkPRODUCT_DETAIL(item);

  // xem sét xem có người dùng đăng nhập không?
  const check = req.isAuthenticated();
  const profile = req.user;
  if (profile) {
    const id = profile.id;
    const email = profile.email;
    const displayname = profile.displayname;
    const picture = profile.picture;

    // lấy ra thông tin chi tiết của sản phẩm yêu thích
    const [fav_product_id,] = await checkUSER_fav(id, productIMG);
    const [,fav_product_img] = await checkUSER_fav(id, productIMG);


    res.render("checkout.ejs", {
      product_id: productID,
      product_img: productIMG,
      product_name: productNAME,
      product_price: productPRICE,
      product_brand: productBRAND,
      check: check,
      email: email,
      user_name: displayname,
      picture: picture,
      fav_product_id: fav_product_id,
      fav_product_img: fav_product_img,
    });

  } else {
    res.render("checkout.ejs", {
      product_id: productID,
      product_img: productIMG,
      product_name: productNAME,
      product_price: productPRICE,
      product_brand: productBRAND,
      check: check,
    });
  }
})

app.get("reset_password", async (req, res) => {
  res.render("reset-password.ejs")
})

app.get("reset_password_emailed", async (req, res) => {
  res.render("reset_password_emailed.ejs")
})

app.get("/sign_up", async (req, res) => {
  res.render("sign-up.ejs")
});

app.get("/sign_in", async (req, res) => {
  res.render("sign-in.ejs")
});

// đăng nhập google
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// đường dẫn đăng nhập google
app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/sign_in",
  })
);

// đăng xuất
app.get("/sign_out", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/", async (req,res) => {
  const pirce_min = req.body.price_min;
  const price_max = req.body.price_max;
  console.log(pirce_min);
  console.log(price_max);
  res.redirect("/");
})

// tạo sản phẩm yêu thích mới
app.post("/user_favorite", async (req, res) => {
  const check = req.isAuthenticated();
  if (check) {
    const product_id = req.body.product_id;
    const user_id = req.user.id;
    try {
      const result = await db.query("INSERT INTO user_fav (userid, productid) VALUES ($1, $2) RETURNING *",
      [user_id, product_id]);
      console.log("tạo sản phẩm yêu thích thành công");
      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  } else {
    console.log("chưa đăng nhập người dùng");
  }
});

// tạo tài khoản mới bằng email và mật khẩu
app.post("/sign_up", async (req, res) => {
  const email = req.body.username;
  const password_1 = req.body.password_1;
  const password_2 = req.body.password_2;
    try {
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if (checkResult.rows.length > 0) {
        res.redirect("/sign_in");
        console.log("đã có tài khoản");
      } else {
        if (password_1 === password_2) {
          bcrypt.hash(password_1, saltRounds, async (err, hash) => {
            if (err) {
              console.error("error hashing password:", err);
            } else {
              const result = await db.query("INSERT INTO users (email, password, displayname, picture) VALUES ($1, $2, $3, $4) RETURNING *",
              [email, hash, "user", "https://i.ibb.co/DL59hYp/image.png"]);
              const user = result.rows[0];
              req.login(user, (err) => {
                console.log(err);
                console.log("đăng ký thành công");
                res.redirect("/");
              });
            }
          });
        } else {
          res.redirect("/sign_up",{
            // tao_tk_err: "mật khẩu phải giống nhau!",
          });
          console.log("mật khẩu không giống nhau");
        }
      }
    } catch (err) {
      console.log(err);
    }

});

app.post("/sign_in", 
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/sign_in",
  })
);

// đăng nhập bằng tài khoản và mật khẩu
passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    console.log(username)
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log(user.picture);
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

// đăng nhập bằng google
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password, displayName, picture) VALUES ($1, $2, $3, $4)",
            [profile.email, "google", profile.displayName, profile.picture]
          );
          console.log("tạo tài khoản google thành công!");
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

// lưu trữ user
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});


// đưa ra cổng đang chạy
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});