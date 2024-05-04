import WordExtractor from"word-extractor"
import fs from "fs"
import express, { json, response} from "express";
import multer from "multer";
import path from "path";
import pg from "pg";
import passport from "passport";
import session from "express-session";
const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(passport.initialize());
app.use(passport.session());

app.use(
  session({
    secret: "Haidv2806",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    }
  })
)

// liên kết với cơ sở dữ liệu
const { Pool } = pg;
// sử dụng passport và session
app.use(passport.initialize());
app.use(passport.session());

// liên kết với cơ sở dữ liệu
const db = new Pool({
  // user: process.env.PG_USER,
  // host: process.env.PG_HOST,
  // database: process.env.PG_DATABASE,
  // password: process.env.PG_PASSWORD,
  // port: process.env.PG_PORT,
  connectionString: process.env.POSTGRES_URL,
});
db.connect();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })




app.get("/", async (req, res) => {
  res.render("webadmin-tonkho.ejs")
})

app.post("/add_product", async (req, res) => {
  const img_1 = req.body.image_upload_1;
  const img_2 = req.body.image_upload_2;
  const img_3 = req.body.image_upload_3;
  const img_4 = req.body.image_upload_4;
  const brand = req.body.product_brand;
  const series = req.body.product_type;
  const name = req.body.product_name;
  const price = req.body.price;
  const description = req.body.description;
  console.log(img_1);
  console.log(img_2);
  console.log(img_3);
  console.log(img_4);
  console.log(brand);
  console.log(series);
  console.log(name);
  console.log(price);
  console.log(description);

  const result= await db.query("INSERT INTO tbl_document ( id, info, doc ) VALUES ( 2, 'Daily Report', pg_read_file(description)::bytea )") 

  // const outputfile = "public/uploads/" + Date.now() + ".txt"
  // const extractor = new WordExtractor();
  // const extracted = extractor.extract(req.file.path);
  // console.log(extracted);

  // extracted.then(function(doc) { 
  //   console.log(doc.getBody());
  //   fs.writeFileSync(outputfile,doc.getBody(),"utf-8")
  //   res.download(outputfile)
  // });


})

// đưa ra cổng đang chạy
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});