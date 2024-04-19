CREATE TABLE users(
    userid SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    displayname VARCHAR(50),
    picture VARCHAR (100)
);

CREATE TABLE product(
    productid SERIAL PRIMARY KEY,
    image VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    price INT NOT NULL
)

CREATE TABLE productdetail(
    productid INT PRIMARY KEY REFERENCES product(productid),
    image1 VARCHAR(100) NOT NULL,
    image2 VARCHAR(100) NOT NULL,
    image3 VARCHAR(100) NOT NULL,
    image4 VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    description text NOT NULL
)

CREATE TABLE user_fav(
    userid INT REFERENCES users(userid),
    productid REFERENCES product(productid),
    number int NOT NULL,
)

CREATE TABLE user_address (
    userid INT REFERENCES users(userid),
    address VARCHAR(50) NOT NULL
)

select product.productid, product.image, product.brand, product.name, product.price
from user_fav
            inner join product on user_fav.productid = product.productid
            inner join users on user_fav.userid = users.userid
where user_fav.userid = 1

SELECT *  FROM product WHERE price BETWEEN 0 AND 20000000AND UPPER(brand) like UPPER('%iPHone%')
