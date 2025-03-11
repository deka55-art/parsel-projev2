// Haritayı oluştur
var map = L.map('map').setView([40.9769, 27.5126], 13);
// Temel harita katmanını ekle (Uydu haritası)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri'
}).addTo(map);
// Çizim katmanını oluştur
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
// Çizim araçlarını ekle
var drawControl = new L.Control.Draw({
    edit: false, // Edit ve Delete butonları kaldırıldı
    draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false
    }
});
map.addControl(drawControl);
// Parselleri saklamak için boş dizi
var parselData = [];
// Sayfa yüklendiğinde kayıtlı parselleri getir
window.onload = function () {
    var savedParseller = localStorage.getItem("parseller");
    if (savedParseller) {
        parselData = JSON.parse(savedParseller);
        parselData.forEach(function (parsel, index) {
            var polygon = L.polygon(parsel.koordinatlar, { color: 'blue', fillColor: 'pink', fillOpacity: 0.5 }).addTo(drawnItems);
            polygon.bindPopup(generateReadonlyPopupContent(parsel, index)); // Sadece okunabilir popup
        });
        console.log("Kayıtlı Parseller Yüklendi!", parselData);
    }
};
// Çizim tamamlandığında boş form aç
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);
    // Yeni bir polygon için boş form göster
    var newIndex = parselData.length;
    layer.bindPopup(generateEditablePopupContent(null, layer, newIndex)).openPopup();
});
// Parsel bilgilerini kaydetme
function saveParselInfo(layer, index) {
    var parsel_no = document.getElementById("parsel_no").value;
    var bitki = document.getElementById("bitki").value;
    var sulama = document.getElementById("sulama").value;
    var proje_sahibi = document.getElementById("proje_sahibi").value;
    var projedurumu = document.getElementById("projedurumu").value;
    var proje_tarihi = document.getElementById("proje_tarihi").value;
    var Arazi_Egimi = document.getElementById("Arazi_Egimi").value;
    var coordinates = layer.getLatLngs();
    var parselBilgi = {
        parsel_no: parsel_no,
        koordinatlar: coordinates,
        bitki: bitki,
        sulama: sulama,
        proje_sahibi: proje_sahibi,
        projedurumu: projedurumu,
        proje_tarihi: proje_tarihi,
        Arazi_Egimi: Arazi_Egimi
    };
    if (parselData[index]) {
        parselData[index] = parselBilgi; // Güncelleme
    } else {
        parselData.push(parselBilgi); // Yeni kayıt
    }
    localStorage.setItem("parseller", JSON.stringify(parselData));
    console.log("Parsel Kaydedildi: ", parselBilgi);
    // Sayfayı yenilemeden popup içeriğini güncelle
    layer.bindPopup(generateReadonlyPopupContent(parselBilgi, index)).openPopup();
}
// **📌 1: İlk Açılan (Düzenleme Modu) Popup İçeriği**
function generateEditablePopupContent(parsel, layer, index) {
    return '<b>Parsel Bilgisi</b><br>' +
        '<b>Parsel No:</b> <input type="text" id="parsel_no" value="' + (parsel?.parsel_no || '') + '"><br>' +
        '<b>Bitki Türü:</b> <input type="text" id="bitki" value="' + (parsel?.bitki || '') + '"><br>' +
        '<b>Sulama Durumu:</b> <input type="text" id="sulama" value="' + (parsel?.sulama || '') + '"><br>' +
        '<b>Proje Sahibi:</b> <input type="text" id="proje_sahibi" value="' + (parsel?.proje_sahibi || '') + '"><br>' +
        '<b>Proje Durumu:</b> <input type="text" id="projedurumu" value="' + (parsel?.projedurumu || '') + '"><br>' +
        '<b>Proje Bitiş Tarihi:</b> <input type="text" id="proje_tarihi" value="' + (parsel?.proje_tarihi || '') + '"><br>' +
        '<b>Arazi Eğimi:</b> <input type="text" id="Arazi_Egimi" value="' + (parsel?.Arazi_Egimi || '') + '"><br>' +
        '<button type="button" onclick="saveParselInfo(drawnItems.getLayers()[' + index + '], ' + index + ')">Kaydet</button>';
}
// **📌 2: Kaydettikten Sonra (Sadece Okunabilir) Popup İçeriği**
function generateReadonlyPopupContent(parsel, index) {
    return '<b>Parsel Bilgisi</b><br>' +
        '<b>Parsel No:</b> ' + parsel.parsel_no + '<br>' +
        '<b>Bitki Türü:</b> ' + parsel.bitki + '<br>' +
        '<b>Sulama Durumu:</b> ' + parsel.sulama + '<br>' +
        '<b>Proje Sahibi:</b> ' + parsel.proje_sahibi + '<br>' +
        '<b>Proje Durumu:</b> ' + parsel.projedurumu + '<br>' +
        '<b>Proje Bitiş Tarihi:</b> ' + parsel.proje_tarihi + '<br>' +
        '<b>Arazi Eğimi:</b> ' + parsel.Arazi_Egimi + '<br>' +
        '<button type="button" onclick="editParselInfo(' + index + ')">Düzenle</button>' +
        '<button type="button" onclick="deleteParsel(' + index + ')">Sil</button>';
}
// Düzenleme moduna geç
function editParselInfo(index) {
    var parsel = parselData[index];
    var layer = drawnItems.getLayers()[index];
    // Güncellenmiş düzenleme formunu aç
    layer.bindPopup(generateEditablePopupContent(parsel, layer, index)).openPopup();
}
// Polygon'u silme fonksiyonu
function deleteParsel(index) {
    var layers = drawnItems.getLayers();
    if (layers[index]) {
        drawnItems.removeLayer(layers[index]); // Haritadan kaldır
        parselData.splice(index, 1); // Diziden çıkar
        localStorage.setItem("parseller", JSON.stringify(parselData)); // LocalStorage güncelle
        console.log("Parsel Silindi:", index);
    }
}