# Etkinlik Yönetim Sistemi

Flask tabanlı etkinlik yönetim web uygulaması. Bu sistem etkinliklerin, katılımcıların, mekanların ve sponsorların yönetimini sağlar.

## Özellikler

- ✅ Etkinlik yönetimi (CRUD işlemleri)
- ✅ Katılımcı yönetimi (CRUD işlemleri)
- ✅ Kategori yönetimi (CRUD işlemleri)
- ✅ Mekan yönetimi (CRUD işlemleri)
- ✅ Sponsor yönetimi (CRUD işlemleri)
- ✅ Kayıt yönetimi (etkinlik-katılımcı eşleştirme)
- ✅ İstatistik dashboard

## Teknolojiler

- **Backend**: Flask (Python)
- **Veritabanı**: MySQL
- **Frontend**: HTML, CSS, Bootstrap 5, Bootstrap Icons
- **Template Engine**: Jinja2

## Kurulum

### Gereksinimler

- Python 3.8+
- MySQL Server
- pip (Python paket yöneticisi)

### Adımlar

1. Repoyu klonlayın:
```bash
git clone https://github.com/MAliTopkara/VTYS.git
cd VTYS
```

2. Sanal ortam oluşturun ve aktifleştirin:
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. Gerekli paketleri yükleyin:
```bash
pip install flask flask-mysqldb
```

4. MySQL veritabanını oluşturun ve yapılandırın:
- MySQL'de `etkinlik_yonetim` adında bir veritabanı oluşturun
- `config.py` dosyasını düzenleyin ve veritabanı bilgilerinizi girin

5. Uygulamayı çalıştırın:
```bash
python app.py
```

6. Tarayıcınızda `http://127.0.0.1:5000` adresine gidin

## Yapılandırma

`config.py` dosyasında aşağıdaki ayarları yapılandırın:

```python
MYSQL_HOST = 'localhost'
MYSQL_USER = 'kullanici_adi'
MYSQL_PASSWORD = 'sifre'
MYSQL_DB = 'etkinlik_yonetim'
SECRET_KEY = 'gizli_anahtar'
```

## Proje Yapısı

```
etkinlik_yonetim_web/
├── app.py              # Ana uygulama dosyası
├── config.py           # Yapılandırma ayarları
├── templates/          # HTML şablonları
│   ├── base.html
│   ├── index.html
│   ├── etkinlikler.html
│   ├── kategoriler.html
│   ├── katilimcilar.html
│   ├── mekanlar.html
│   ├── sponsorlar.html
│   ├── kayitlar.html
│   └── *_ekle.html / *_guncelle.html
└── static/            # Statik dosyalar (CSS, JS, resimler)
```

## Kullanım

### Ana Sayfa
Dashboard'da etkinlik, katılımcı ve kayıt sayıları görüntülenir.

### Etkinlik Yönetimi
- Yeni etkinlik ekleme
- Mevcut etkinlikleri görüntüleme
- Etkinlik bilgilerini güncelleme
- Etkinlik silme

### Katılımcı Yönetimi
- Yeni katılımcı ekleme
- Katılımcı listesini görüntüleme
- Katılımcı bilgilerini güncelleme
- Katılımcı silme

### Kayıt Yönetimi
- Katılımcıları etkinliklere kaydetme
- Kayıt durumlarını görüntüleme
- Kayıtları silme

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
