window.addEventListener("DOMContentLoaded", function(){
    document.getElementById("schimba_tema").onclick = function() {
        // document.body.classList.add("dark") // adauga clasa
        // document.body.classList.toggle("dark") // daca este, o sterge, daca nu este, o adauga
        // true cand o adauga, false cand e deja si o sterge
        if(document.body.classList.toggle("dark")) {
            localStorage.setItem("tema", "dark")
        }
        else {
            localStorage.removeItem("tema")
        }
    }
})