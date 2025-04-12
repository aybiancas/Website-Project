const express=require("express");
const path=require("path");
const fs=require("fs");
const sharp = require("sharp");

app=express(); // TASK 2


// TASK 3
console.log("Folderul proiectului: ", __dirname)
console.log("Calea fisierului index.js: ", __filename)
console.log("Folderul curent de lucru: ", process.cwd())

app.set("view engine", "ejs");
app.use("/resurse", express.static(path.join(__dirname,"resurse")))

obGlobal = {
    obErori:null
}

vect_foldere = ["temp", "backup", "temp1"]
for (let folder of vect_foldere) {
    let pathFolder = path.join(__dirname, folder)
    if (!fs.existsSync(pathFolder)) {
        // functia sincrona garanteaza executarea ei
        fs.mkdirSync(pathFolder);
    } 
}

function initErori() {
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    // console.log(continut)
    obGlobal.obErori = JSON.parse(continut)
    // console.log(obGlobal.obErori)
    
    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    // console.log(obGlobal.obErori)

}

initErori()

// IDEE GALERIE STATICA BAZATA DE ORE:
// O IMAGINE REPREZENTATIVA PENTRU FIECARE OFERTA
// EDITEAZA OFERTE ORE!!!!

// VEZI INDEX.EJS IN CURS6 FOLDER
// LA GALERIA STATICA

// EXEMPLU GALERIA STATICA CU PISICI
// COORDONATE PENTRU GRIDUL DE GALERIE

// LA COORDONATE
// 2/3/3/4 LINIA 2 COLOANA 3, SE DUCE PANA LA LINIA 3, SE DUCE PANA LA COLOANA 4

// VEZI EXEMPLU COUNTER LA EXEMPLE LINKURI CURS

// INSTALARE BOOTSTRAP

// VEZI EXEMPLU BOOTSTRAP1 REPLIT

// function initImagini(){
//     var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

//     obGlobal.obImagini=JSON.parse(continut); //json.parse transforma in string
//     let vImagini=obGlobal.obImagini.imagini;

//     let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
//     let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
//     if (!fs.existsSync(caleAbsMediu))
//         fs.mkdirSync(caleAbsMediu);

//     //for (let i=0; i< vErori.length; i++ )
//     for (let imag of vImagini){
//         [numeFis, ext]=imag.fisier.split(".");
//         let caleFisAbs=path.join(caleAbs,imag.fisier);
//         let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
//         sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
//         imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
//         imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
        
//     }
//     console.log(obGlobal.obImagini)
// }

// initImagini();

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare = obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){
        if(eroare.status)
            res.status(identificator)
        var titluCustom = titlu || eroare.titlu;
        var textCustom = text || eroare.text;
        var imagineCustom = imagine || eroare.imagine;
    }
    else{
        var err = obGlobal.obErori.eroare_default
        var titluCustom = titlu || err.titlu;
        var textCustom = text || err.text;
        var imagineCustom = imagine || err.imagine;
    }
    res.render("pagini/eroare", {
        titlu:titluCustom,
        text:textCustom,
        imagine:imagineCustom
})

}




app.get(["/","/index","/home"], function(req, res){
    res.render("pagini/index", {ip: req.ip});
})


// IMPORTANT -- FA PAGINA DESPRENOI
// app.get("/desprenoi", function(req, res){
//     res.render("pagini/desprenoi");
// })

// IMPORTANT -- FA PAGINA DE PRODUSE
// app.get("/produse", function(req, res){
//     res.render("pagini/produse");
// })

app.get("/index/a", function(req, res){
    res.render("pagini/index");
})


app.get("/cerere", function(req, res){
    res.send("<p style='color:blue'>Buna ziua</p>")
})


app.get("/fisier", function(req, res, next){
    res.sendfile(path.join(__dirname,"package.json"));
})


app.get("/abc", function(req, res, next){
    res.write("Data curenta: ")
    next()
})

app.get("/abc", function(req, res, next){
    res.write((new Date())+"")
    res.end()
    next()
})


app.get("/abc", function(req, res, next){
    console.log("------------")
})

app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){
    afisareEroare(res, 403);
})


app.get(/(.*.ejs)/, function(req, res, next){
    afisareEroare(res, 400);
});


// https://stackoverflow.com/questions/78973586/typeerror-invalid-token-at-1-https-git-new-pathtoregexperror
// https://github.com/expressjs/express/issues/5936#issuecomment-2340677058
// ??????????????????????????????????????????????????????????????
app.get(/(.*)/, function(req, res, next){
    try{
    res.render("pagini" + req.url, function(err, rezultatRandare){ //callback -> functie primita ca argument
        if(err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view")){
                afisareEroare(res, 404);
            }
            else{
                afisareEroare(res);
            }
        }
        else{
            console.log(rezultatRandare);
            res.send(rezultatRandare);
        }
        })
    }
    catch (errRandare){
        if(errRandare.message.startsWith("Cannot find module ")){
            afisareEroare(res, 404);
        }
        else{
            afisareEroare(res);
        }
    }
})

app.listen(8080);
console.log("Serverul a pornit")