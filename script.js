function saveArtworkToLocalStorage(artwork) {
    let artworks = JSON.parse(localStorage.getItem("artworks")) || [];
    artworks.push(artwork);
    localStorage.setItem("artworks", JSON.stringify(artworks));
}

function loadArtworks() {
    let artworks = JSON.parse(localStorage.getItem("artworks")) || [];
    let artworksDiv = document.getElementById("artworks");

    artworksDiv.innerHTML = "";
    artworks.forEach(artwork => {
        let artCard = document.createElement("div");
        artCard.classList.add("art-card");

        let img = document.createElement("img");
        img.src = artwork.img;
        img.alt = artwork.title;

        let title = document.createElement("h3");
        title.textContent = artwork.title;

        let artist = document.createElement("p");
        artist.textContent = "โดย " + artwork.artist;

        artCard.appendChild(img);
        artCard.appendChild(title);
        artCard.appendChild(artist);

        artworksDiv.appendChild(artCard);
    });
}

function uploadArtwork() {
    let fileInput = document.getElementById("image-file");
    let artTitle = document.getElementById("art-title").value;
    let artistName = document.getElementById("artist-name").value;

    if (fileInput.files.length === 0 || artTitle === "" || artistName === "") {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
        return;
    }

    let file = fileInput.files[0];
    let reader = new FileReader();

    reader.onload = function (e) {
        let artwork = {
            img: e.target.result,
            title: artTitle,
            artist: artistName
        };

        saveArtworkToLocalStorage(artwork);
        loadArtworks();

        fileInput.value = "";
        document.getElementById("art-title").value = "";
        document.getElementById("artist-name").value = "";
        document.getElementById("preview").innerHTML = "";
    };

    reader.readAsDataURL(file);
}

document.getElementById("image-file").addEventListener("change", function () {
    let previewDiv = document.getElementById("preview");
    let file = this.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview Image">`;
        };
        reader.readAsDataURL(file);
    } else {
        previewDiv.innerHTML = "";
    }
});

window.onload = loadArtworks;
