window.onload = function () {
    document.getElementById("mesaj-prod").style.display = 'none'

    let produse = document.getElementsByClassName("produs")

    for (let prod of produse) {
        prod.querySelector("#icon-ieftin").style.display = 'none'
    }

    function caractereRom(str) {
        return str
            .toLowerCase()
            .replace(/[ăâ]/g, 'a')
            .replace(/î/g, 'i')
            .replace(/ș/g, 's')
            .replace(/ț/g, 't');
    }

    let textareaDesc = document.getElementById("desc-caut");
    textareaDesc.addEventListener("input", function () {
        const val = textareaDesc.value.trim();
        if (val.length > 0 && val.length < 3) {
            textareaDesc.classList.add("is-invalid");
        } else {
            textareaDesc.classList.remove("is-invalid");
        }
    });

    function counterProduseAfisate() {
        let produse = document.getElementsByClassName("produs")
        let counterProd = Array.from(produse).filter(prod => prod.style.display === 'block').length

        const mesajProd = document.getElementById("count-produse")
        if (mesajProd) {
            mesajProd.textContent = `Produse afisate: ${counterProd}`
        }
    }


    function filtareOnChange() {
        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase()
        let vectRadio = document.getElementsByName("gr_rad")
        let inpAlf = null
        let stLitera = null
        let drLitera = null
        for (let rad of vectRadio) {
            if (rad.checked) {
                inpAlf = rad.value
                if (inpAlf != "toate") {
                    [stLitera, drLitera] = inpAlf.split("-")
                    stLitera = stLitera.trim().toUpperCase();
                    drLitera = drLitera.trim().toUpperCase();
                }
                break
            }
        }
        let inpPret = parseFloat(document.getElementById("inp-pret").value)
        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase()
        let inpAn = Array.from(document.getElementById("inp-an").selectedOptions).map(opt => parseInt(opt.value.trim()))
        let inpDesc = document.getElementById("desc-caut").value.trim().toLowerCase()
        let descCuv = inpDesc ? inpDesc.split(/\s+/) : [];
        let inpISBN = document.getElementById("inp-datalist").value.trim()

        let produse = document.getElementsByClassName("produs")
        let pretMin = 10000

        for (let prod of produse) {
            prod.style.display = "none";
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let cond1 = nume.startsWith(inpNume)
            let autor = prod.getElementsByClassName("val-autor")[0].innerHTML.trim()
            let primAutor = autor.split(",")[0].trim()
            let numeFamAutor = primAutor.split(" ").pop()
            let initiala = numeFamAutor.charAt(0).toUpperCase()
            let cond2 = (inpAlf == "toate" || (stLitera <= initiala && initiala <= drLitera))
            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let cond3 = (inpPret <= pret)
            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase()
            let cond4 = (inpCategorie == "toate" || inpCategorie == categorie)
            let an = parseInt(prod.getElementsByClassName("val-data")[0].innerHTML.trim())
            let cond5 = inpAn.includes(an)
            let disp = prod.getElementsByClassName("val-disp")[0].innerHTML.trim().toLowerCase()
            let cond6 = (disp == 'disponibil')
            let descriere = prod.getElementsByClassName("val-desc")[0].innerHTML.trim().toLowerCase()
            let descriereCuv = descriere.split(/\s+/)
            descriereCuv = descriereCuv.map(cuv => caractereRom(cuv))
            let cond7 = (descCuv.length === 0 || descCuv.some(cuv => descriereCuv.includes(cuv)))
            let isbn = prod.getElementsByClassName("val-isbn")[0].innerHTML.trim()
            let cond8 = (inpISBN == isbn || inpISBN == "")
            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8) {
                prod.style.display = "block"
                if (pret < pretMin) {
                    pretMin = pret
                }
            }
        }

        counterProduseAfisate()

        for (let prod of produse) {
            if (parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim()) == pretMin) {
                prod.querySelector("#icon-ieftin").style.display = 'block'
                // console.log("-------------------query selector------------------------------", prod.querySelector("#icon-ieftin"))
            }
            else {
                prod.querySelector("#icon-ieftin").style.display = 'none'
            }
        }

        let mesajProduse = document.getElementById("mesaj-prod")
        let condVizibil = Array.from(produse).some(prod => getComputedStyle(prod).display !== 'none');
        if (mesajProduse) {
            mesajProduse.style.display = condVizibil ? 'none' : 'block';
        }
    }

    filtareOnChange()
    document.getElementById("inp-nume").onchange = filtareOnChange
    document.getElementById("inp-pret").onchange = filtareOnChange
    document.getElementById("inp-categorie").onchange = filtareOnChange
    document.getElementById("inp-an").onchange = filtareOnChange
    document.getElementById("desc-caut").onchange = filtareOnChange
    document.getElementById("check-disp").onchange = filtareOnChange
    document.getElementById("inp-datalist").onchange = filtareOnChange
    Array.from(document.getElementsByName("gr_rad")).forEach(rad => rad.onchange = filtareOnChange)

    document.getElementById("filtrare").onclick = filtareOnChange

    document.getElementById("inp-pret").onmousemove = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`
    }

    function extragereVal(prod, val) {
        switch (val) {
            case "pret": return parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            case "nume": return prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            case "an": return parseInt(prod.getElementsByClassName("val-data")[0].innerHTML.trim())
        }
    }

    function compSortare(val1, val2, semn) {
        if (typeof val1 === "number" && typeof val2 === "number") {
            return semn * (val1 - val2)
        }
        else {
            return semn * val1.localeCompare(val2)
        }
    }

    const sortareBtn = document.getElementById("sortare-btn")
    if (!sortareBtn) {
        // console.error("err BUTRON SORATRE");
        return;
    }
    sortareBtn.onclick = function () {
        let cheie1 = document.getElementById("cheie1").value
        let cheie2 = document.getElementById("cheie2").value
        let semn = parseInt(document.getElementById("ordine").value)
        // console.log("cheie 1 ", cheie1)
        // console.log("cheie 2 ", cheie2)
        let produse = document.getElementsByClassName("produs");
        let vProduse = Array.from(produse);

        vProduse.sort(function (a, b) {
            let val1 = extragereVal(a, cheie1)
            let val2 = extragereVal(b, cheie1)
            // console.log("val 1 ", val1)
            // console.log("val 2 ", val2)

            let cmp1 = compSortare(val1, val2, semn)
            console.log(cmp1)
            if (cmp1 !== 0) {
                return cmp1;
            }

            let val11 = extragereVal(a, cheie2)
            let val22 = extragereVal(b, cheie2)
            let cmp2 = compSortare(val11, val22, semn)
            console.log(cmp2)
            return cmp2
        })

        console.log(vProduse)
        for (let prod of vProduse) {
            prod.parentNode.appendChild(prod);
        }
    }


    // function sorteaza(){
    //     let cheie1 = document.getElementById("cheie1").value
    //     let cheie2 = document.getElementById("cheie2").value
    //     let semn = parseInt(document.getElementById("ordine").value)
    //     console.log("cheie 1 ", cheie1)
    //     console.log("cheie 2 ", cheie2)
    //     let produse= document.getElementsByClassName("produs");
    //     let vProduse= Array.from(produse);

    //     vProduse.sort(function(a,b){
    //         let val1 = extragereVal(a, cheie1)
    //         let val2 = extragereVal(b, cheie1)
    //         // console.log("val 1 ", val1)
    //         // console.log("val 2 ", val2)

    //         let cmp1 = compSortare(val1, val2, semn)
    //         if(cmp1 !== 0) {
    //             return cmp1;
    //         }

    //         let val11 = extragereVal(a, cheie2)
    //         let val22 = extragereVal(b, cheie2)
    //         let cmp2 = compSortare(val11, val22, semn)
    //         return cmp2
    //     })
    //     for (let prod of vProduse){
    //         prod.parentNode.appendChild(prod);
    //     }
    // }




    /// confirm() pentru confirmarea pt butonul de resetare din pagina
    document.getElementById("resetare").onclick = function () {
        var confirmareReset = confirm("Sigur doriti sa resetati toate filtrele?")
        if (!confirmareReset) return;

        document.getElementById("inp-nume").value = ""
        document.getElementById("i_rad4").checked = true;
        document.getElementById("desc-caut").value = ""
        document.getElementById("check-disp").checked = false;
        let slider = document.getElementById("inp-pret")
        slider.value = slider.min
        document.getElementById("infoRange").textContent = `(${slider.value})`
        let selectMult = document.getElementById("inp-an")
        for (let i = 0; i < selectMult.options.length; i++) {
            selectMult.options[i].selected = true
        }
        document.getElementById("inp-datalist").value = ""
        filtareOnChange()
        let produse = document.getElementsByClassName("produs")
        for (let prod of produse) {
            prod.style.display = "block";
        }
    }

    window.onkeydown = function (e) {
        console.log(e)
        if (e.key == 'c' && e.altKey) {
            let produse = document.getElementsByClassName("produs")
            sumaPreturi = 0;
            for (let prod of produse) {
                if (prod.style.display != "none") {
                    let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
                    sumaPreturi += pret
                }
            }
            if (!document.getElementById("suma_preturi")) {
                let pRezultat = document.createElement("p")
                pRezultat.id = "suma_preturi"
                pRezultat.innerHTML = sumaPreturi
                let p = document.getElementById("p-suma")
                p.parentElement.insertBefore(pRezultat, p.nextElementSibling)
                setTimeout(function () {
                    let p1 = document.getElementById("suma_preturi")
                    if (p1) {
                        p1.remove()
                    }
                }, 2000)
            }
        }
    }
}
