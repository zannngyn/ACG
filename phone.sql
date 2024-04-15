CREATE TABLE users(
    userid SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    displayname VARCHAR(50),
    picture VARCHAR (100),
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
)