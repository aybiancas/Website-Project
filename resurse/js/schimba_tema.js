window.addEventListener("DOMContentLoaded", function(){
 
    const temaSelect = document.getElementById("tema-select");
    const teme = ["dark", "albastru"];

    const temaSalvata = localStorage.getItem("tema");
    if (temaSalvata && teme.includes(temaSalvata)) {
        document.body.classList.add(temaSalvata);
        temaSelect.value = temaSalvata;
    }

    temaSelect.addEventListener("change", function () {
        teme.forEach(t => document.body.classList.remove(t));

        const temaAleasa = temaSelect.value;
        if (temaAleasa && teme.includes(temaAleasa)) {
            document.body.classList.add(temaAleasa);
            localStorage.setItem("tema", temaAleasa);
        } else {
            localStorage.removeItem("tema");
        }
    });
})