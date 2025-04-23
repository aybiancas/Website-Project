const express=require("express");
const path=require("path");
const fs=require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

// const Client=pg.Client;
// client=new Client({
//     database:"proiecttw",
//     user:"localadmin",
//     password:"localuserpass",
//     host:"localhost",
//     port:5432
// })

// client.connect()
// client.query("select * from prajituri", function(err, rezultat ){
//     // console.log(err)    
//     // console.log(rezultat)
// })
// client.query("select * from unnest(enum_range(null::categ_prajitura))", function(err, rezultat ){
//     console.log(err)    
//     console.log(rezultat)
// })

app=express();

console.log("Folderul proiectului: ", __dirname)
console.log("Calea fisierului index.js: ", __filename)
console.log("Folderul curent de lucru: ", process.cwd())

app.set("view engine", "ejs");
app.use("/resurse", express.static(path.join(__dirname,"resurse")))
app.use("/node_modules", express.static(path.join(__dirname,"node_modules")))

obGlobal = {
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname, "resurse/scss"),
    folderCss:path.join(__dirname, "resurse/css"),
    folderBackup:path.join(__dirname, "backup")
}

vect_foldere = ["temp", "backup", "temp1"]
for (let folder of vect_foldere) {
    let pathFolder = path.join(__dirname, folder)
    if (!fs.existsSync(pathFolder)) {
        fs.mkdirSync(pathFolder);
    } 
}

function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){
        
        let numeFisExt=path.basename(caleScss);//folder1/folder2/ceva.txt - > ceva.txt (basename)
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";// output: a.css
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    // salvare in backup a intregului folder css 
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true}) // recursive creeaza toate folderele din subcale, da eroare ca nu gaseste resurse/css daca recursive false
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    // let numeFisCss=path.basename(caleCss);
    // let extFisCss=path.extname(numeFisCss);
    // let bazaCss=path.basename(numeFisCss, ext)
    let timeSt=(new Date()).getTime();
    let numeFisCss=path.basename(caleCss, path.extname(caleCss))+"_"+timeSt+".css"
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true}); // echivalent sass nume.scss nume.css
    fs.writeFileSync(caleCss,rez.css)
    // console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
// la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
        // dupa compilare, duce fisierele scss compilate in foldercss, inclusiv customizarea bootstrap 
    }
}

// fs.watch = in cazul in care se modifica un fisier/folder etc nu mai e nevoie de restart la server
fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){ // crearea unui fis e vazuta ca rename
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

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

// INSTALARE BOOTSTRAP

// VEZI EXEMPLU BOOTSTRAP1 REPLIT

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut); //json.parse transforma in string
    // console.log(obGlobal.obImagini)
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    let caleAbsMic=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mic");
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.cale_imagine.split(".");
        let caleFisAbs=path.join(caleAbs,imag.cale_imagine);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp");
        sharp(caleFisAbs).resize(150).toFile(caleFisMicAbs);
        imag.fisier_mic=path.join("/", obGlobal.obImagini.cale_galerie, "mic", numeFis+".webp" )
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_imagine )
        
    }
    console.log(obGlobal.obImagini)
}

initImagini();

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


app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
})

app.get(["/","/index","/home"], function(req, res){
    res.render("pagini/index", {ip: req.ip, imagini:obGlobal.obImagini.imagini});
})

app.get("/desprenoi", function(req, res){
    res.render("pagini/desprenoi");
})

// app.get("/produse", function(req, res){
//     console.log(req.query)
//     var conditieQuery=""; // TO DO where din parametri


//     queryOptiuni="select * from unnest(enum_range(null::categ_prajitura))"
//     client.query(queryOptiuni, function(err, rezOptiuni){
//         console.log(rezOptiuni)


//         queryProduse="select * from prajituri"
//         client.query(queryProduse, function(err, rez){
//             if (err){
//                 console.log(err);
//                 afisareEroare(res, 2);
//             }
//             else{
//                 res.render("pagini/produse", {produse: rez.rows, optiuni:rezOptiuni.rows})
//             }
//         })
//     });
// })

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