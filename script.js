document.addEventListener("DOMContentLoaded", function () {
    const uploadInput = document.getElementById("upload");
    const titleInput = document.getElementById("artTitle");
    const addButton = document.getElementById("addArt");
    const gallery = document.getElementById("gallery");

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("close-lightbox");

    const adminPassword = "banana";

    let savedImages = JSON.parse(localStorage.getItem("artGallery")) || [];
    savedImages.forEach(({ image, title }) => addImageToGallery(image, title));

    addButton.addEventListener("click", function () {
        const file = uploadInput.files[0];
        const title = titleInput.value.trim() || "ไม่มีชื่อ";

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageData = e.target.result;
                savedImages.push({ image: imageData, title: title });
                localStorage.setItem("artGallery", JSON.stringify(savedImages));
                addImageToGallery(imageData, title);
            };
            reader.readAsDataURL(file);
            uploadInput.value = "";
            titleInput.value = "";
        }
    });

    function addImageToGallery(imageData, title) {
        const page = document.createElement("div");
        page.classList.add("book-page");

        const img = document.createElement("img");
        img.src = imageData;
        img.addEventListener("click", () => openLightbox(imageData));

        const titleSpan = document.createElement("span");
        titleSpan.classList.add("art-title");
        titleSpan.textContent = title;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.textContent = "✖";
        deleteBtn.onclick = function () {
            const password = prompt("🔑 ใส่รหัสผ่านเพื่อลบ:");
            if (password === adminPassword) {
                page.remove();
                savedImages = savedImages.filter(img => img.image !== imageData);
                localStorage.setItem("artGallery", JSON.stringify(savedImages));
            }
        };

        page.append(img, titleSpan, deleteBtn);
        gallery.append(page);
    }

    function openLightbox(imageSrc) {
        lightboxImg.src = imageSrc;
        lightbox.style.display = "flex";
    }

    closeBtn.onclick = () => lightbox.style.display = "none";
});
