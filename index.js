const express=require("express");
const path=require("path");
const fs=require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

const Client=pg.Client;
client=new Client({
    database:"",
    user:"",
    password:"",
    host:"",
    port:5432
})

client.connect()
client.query("select * from produse", function(err, rezultat ){
    // console.log(err)    
    // console.log(rezultat)
})
client.query("select * from unnest(enum_range(null::tipuri_prod))", function(err, rezultat ){
    console.log(err)    
    console.log("Tipuri de PRODUSE------------------:", rezultat)
})

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
    folderBackup:path.join(__dirname, "backup"),
    optiuniMeniu:null
}

client.query("select * from unnest(enum_range(null::tipuri_prod))", function(err, rezultat ){
    // console.log(err)    
    console.log("Tipuri produse dar IN OBGLOBAT-------------------------:", rezultat)
    obGlobal.optiuniMeniu=rezultat.rows
    console.log("OPTIUNI MENIU-------------------", obGlobal.optiuniMeniu)

})


// client.query("select distinct extract(year from data_aparitie) as an_apar from produse order by an_apar desc", function(err, rezultat){
//     console.log("------------------ANI::::----------------", rezultat)
//     obGlobal.
// })


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
    rez=sass.compile(caleScss,{"sourceMap":true}); // echivalent sass nume.scss nume.css
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
    if (eveniment=="change" || eveniment=="rename"){
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

function shuffleImagini(imagini) {
    let obLocalImg = imagini.imagini
    console.log(obLocalImg.length)
    // fisher yates
    for (let i = obLocalImg.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [obLocalImg[i], obLocalImg[j]] = [obLocalImg[j], obLocalImg[i]];
    }
    let options=[7, 8, 9, 11]
    let cnt = options[Math.floor(Math.random() * options.length)]
    return obLocalImg.slice(0, cnt);
  }


  // /(.*)/

// app.use(/(/.*)/, function(req, res, next){
//     res.locals.optiuniMeniu=obGlobal.optiuniMeniu
//     next();
// })

// app.use("/*", function(req, res, next){
//     res.locals.optiuniMeniu=obGlobal.optiuniMeniu
//     next();
// })

app.use(function(req, res, next){
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu
    next();
})


app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
})

app.get(["/","/index","/home"], function(req, res){
    let imaginiAnim = shuffleImagini(obGlobal.obImagini);
    console.log(imaginiAnim)
    res.render("pagini/index", {ip:req.ip, imagini:obGlobal.obImagini.imagini, imaginianim:imaginiAnim});
})

app.get("/desprenoi", function(req, res){
    res.render("pagini/desprenoi");
})

app.get("/produse", function(req, res){
    console.log(req.query)
    var conditieQuery="";

    if(req.query.tip) {
        conditieQuery = ` where tip_produs='${req.query.tip}'`
    }

    var queryAni = "select distinct extract(year from data_aparitie) as an_apar from produse order by an_apar desc"
    var queryMin = "select min(pret) as pret_min from produse"
    var queryMax = "select max(pret) as pret_max from produse"
    var queryISBN = "select isbn from produse"


    queryOptiuni="select * from unnest(enum_range(null::tipuri_coperti))"
    client.query(queryOptiuni, function(err, rezOptiuni){
        // console.log(rezOptiuni)

        client.query(queryAni, function(err, rezAni){
            if (err) {
                console.log(err);
                afisareEroare(res, 2);
                return;
            }

            client.query(queryMin, function(err, rezMin){
                if (err) {
                    console.log(err);
                    afisareEroare(res, 2);
                    return;
                }

                client.query(queryMax, function(err, rezMax){
                    if (err) {
                        console.log(err);
                        afisareEroare(res, 2);
                        return;
                    }

                    client.query(queryISBN, function(err, rezISBN){
                        if (err){
                            console.log(err);
                            afisareEroare(res, 2);
                        }

                        var queryProduse = "select * from produse" + conditieQuery;

                        client.query(queryProduse, function(err, rez){
                            if (err){
                                console.log(err);
                                afisareEroare(res, 2);
                            }
                            else{
                                // console.log("-------------------Ani: ---------------------", rezAni.rows.map(r => r.an_apar));
                                // console.log("0000000000000000000 ISBN", rezISBN.rows)
                                res.render("pagini/produse", {
                                    produse: rez.rows,
                                    optiuni: rezOptiuni.rows,
                                    ani: rezAni.rows.map(r => r.an_apar),
                                    pret_min: rezMin.rows[0].pret_min,
                                    pret_max: rezMax.rows[0].pret_max,
                                    isbn: rezISBN.rows
                                });
                            }
                        })
                    });
                });
            });
        });
    });
})

app.get("/produs/:id", function(req, res){
    console.log(req.params)
    client.query(`select * from produse where id=${req.params.id}`, function(err, rez){
        if (err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else{
            if (rez.rowCount==0){
                afisareEroare(res, 404);
            }
            else{
                res.render("pagini/produs", {prod: rez.rows[0]})
            }
        }
    })
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