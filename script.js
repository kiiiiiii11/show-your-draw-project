// กำหนดค่า Supabase URL และ Anon Key
const supabaseUrl = 'https://feyqvhfywqgowopfufvh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleXF2aGZ5d3Fnb3dvcGZ1ZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMDQ5NjMsImV4cCI6MjA1NDY4MDk2M30.RkCG6duHdjfUgDUBdsP2BF3oueb4sElBaX7sxBYbADY';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// ระบุชื่อ Bucket ที่ต้องใช้ใน Supabase Storage
const bucketName = 'artgallery';

// อ้างอิงองค์ประกอบในหน้า HTML
const uploadInput = document.getElementById("upload");
const titleInput = document.getElementById("artTitle");
const addButton = document.getElementById("addArt");
const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.getElementById("close-lightbox");

const adminPassword = "banana"; // รหัสสำหรับลบผลงาน

// เมื่อคลิกปุ่ม "เพิ่มผลงาน"
addButton.addEventListener("click", async function () {
  const file = uploadInput.files[0];
  const title = titleInput.value.trim() || "ไม่มีชื่อ";

  if (!file) {
    alert("กรุณาเลือกไฟล์ก่อน!");
    return;
  }

  // สร้างชื่อไฟล์แบบ unique โดยใช้ timestamp กับชื่อไฟล์เดิม
  const fileName = `${Date.now()}-${file.name}`;
  console.log("กำลังอัปโหลดไฟล์:", fileName);

  try {
    // อัปโหลดไฟล์ไปยัง Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลด: " + error.message);
      return;
    }

    console.log("อัปโหลดสำเร็จ:", data);

    if (!data || !data.path) {
      alert("ไม่พบข้อมูล data.path จากผลลัพธ์การอัปโหลด");
      return;
    }

    // ใช้ data.path จากผลลัพธ์การอัปโหลดเพื่อดึง Public URL
    const { data: publicData, error: publicError } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (publicError) {
      console.error("Public URL error:", publicError);
      alert("ไม่สามารถดึง Public URL ได้: " + publicError.message);
      return;
    }

    console.log("Public URL:", publicData.publicUrl);

    // เพิ่มผลงานใน Gallery
    addImageToGallery(publicData.publicUrl, title, data.path);

    // รีเซ็ตค่า input
    uploadInput.value = "";
    titleInput.value = "";
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("เกิดข้อผิดพลาดที่ไม่คาดคิดในการอัปโหลด");
  }
});

// ฟังก์ชันเพิ่มผลงานใน Gallery
function addImageToGallery(imageUrl, title, filePath) {
  const page = document.createElement("div");
  page.classList.add("book-page");

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = title;
  img.addEventListener("click", () => openLightbox(imageUrl));

  const titleSpan = document.createElement("span");
  titleSpan.classList.add("art-title");
  titleSpan.textContent = title;

  // ปุ่มลบผลงาน
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.textContent = "✖";
  deleteBtn.onclick = async function () {
    const password = prompt("🔑 ใส่รหัสผ่านเพื่อลบ:");
    if (password === adminPassword) {
      // ลบไฟล์ออกจาก Supabase Storage โดยใช้ filePath
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      if (error) {
        alert("เกิดข้อผิดพลาดในการลบ: " + error.message);
        console.error(error);
      } else {
        page.remove();
      }
    }
  };

  page.append(img, titleSpan, deleteBtn);
  gallery.append(page);
}

// ฟังก์ชันเปิด Lightbox
function openLightbox(imageSrc) {
  lightboxImg.src = imageSrc;
  lightbox.style.display = "flex";
}

// ปิด Lightbox เมื่อคลิกปุ่มปิด
closeBtn.onclick = () => {
  lightbox.style.display = "none";
};

// ฟังก์ชันโหลดผลงานของทุกคนจาก Bucket (ใช้สำหรับโหลดภาพที่มีอยู่แล้วเมื่อหน้าเว็บโหลด)
async function loadGallery() {
  try {
    // ดึงรายชื่อไฟล์ทั้งหมดจาก root ของ Bucket
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 100 });

    if (error) {
      console.error("Error listing files:", error);
      return;
    }

    console.log("Files found:", files);

    // สำหรับแต่ละไฟล์ ให้ดึง Public URL แล้วแสดงใน Gallery
    files.forEach(file => {
      const { data: publicData, error: publicError } = supabase.storage
        .from(bucketName)
        .getPublicUrl(file.name);
      
      if (publicError) {
        console.error("Error getting public URL for", file.name, publicError);
        return;
      }

      addImageToGallery(publicData.publicUrl, file.name, file.name);
    });
  } catch (err) {
    console.error("Unexpected error during loadGallery:", err);
  }
}

// เมื่อหน้าเว็บโหลดขึ้นมา ให้เรียกโหลด Gallery
window.addEventListener('DOMContentLoaded', loadGallery);
