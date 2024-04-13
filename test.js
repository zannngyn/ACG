import express, { json, response } from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    res.render("index.ejs", {
        menu_id: 5,
        menu_img: "https://i.ibb.co/37sc2Bt/113.png",
        menu_name: "Sản Phẩm Rank",
        menu_price: "menuPRICE",
        menu_realprice: "menuREALPRICE",
        check: false,
      });
});

app.get("/checkout", async (req, res) => {
    res.render("checkout.ejs", {
        // menu_id: menuID,
        // menu_img: menuIMG,
        // menu_name: menuNAME,
        // menu_price: menuPRICE,
        // menu_realprice: menuREALPRICE,
        check: false,
      });
})

app.get("/delivery", async (req, res) => {
    res.render("delivery.ejs", {
        check: false,
    })
})

app.get("/payment", async (req, res) => {
    res.render("payment.ejs", {
        check: false,
    })
})
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
