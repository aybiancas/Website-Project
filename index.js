const express= require("express");
const path= require("path");
const fs = require("fs");
app= express(); // TASK 2


// TASK 3
console.log("Folderul proiectului: ", __dirname)
console.log("Calea fisierului index.js: ", __filename)
console.log("Folderul curent de lucru: ", process.cwd())

app.set("view engine", "ejs");

app.use("/resurse", express.static(path.join(__dirname,"resurse")))

app.get(["/","/index","/home"], function(req, res){
    res.render("pagini/index");
})


// IMPORTANT -- FA PAGINA DESPRENOI
app.get("/desprenoi", function(req, res){
    res.render("pagini/desprenoi");
})

// IMPORTANT -- FA PAGINA DE PRODUSE
app.get("/produse", function(req, res){
    res.render("pagini/produse");
})




app.get("/*", function(req, res, next){

})

app.listen(8080);
console.log("Serverul a pornit")