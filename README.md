# Etkinlik Yönetim Sistemi

Modern, full-stack etkinlik yönetim web uygulaması. Bu sistem etkinliklerin, katılımcıların, mekanların, kategorilerin ve sponsorların profesyonel yönetimini sağlar.

## Özellikler

- ✅ **Kullanıcı Yönetimi** - JWT tabanlı authentication (Admin/User rolleri)
- ✅ **Etkinlik Yönetimi** - Ekle, Sil, Güncelle, Listele (CRUD)
- ✅ **Katılımcı Yönetimi** - Kayıt ve bilgi yönetimi
- ✅ **Kategori Yönetimi** - Etkinlik kategorileri
- ✅ **Mekan Yönetimi** - Etkinlik mekanları ve kapasite takibi
- ✅ **Sponsor Yönetimi** - Sponsor bilgileri ve katkı miktarları
- ✅ **Kayıt Yönetimi** - Katılımcı-etkinlik eşleştirme (Many-to-Many)
- ✅ **Dashboard** - Detaylı istatistikler ve raporlar
- ✅ **Responsive Tasarım** - Mobil uyumlu modern arayüz
- ✅ **Modal Tabanlı UI** - Kullanıcı dostu form yönetimi

## Teknolojiler

### Backend
- **Node.js** & **Express.js** - REST API framework
- **MySQL2** - İlişkisel veritabanı (MySQL/MariaDB)
- **JWT (jsonwebtoken)** - Token tabanlı authentication
- **Bcrypt** - Şifre hashleme
- **Express-Session** - Session yönetimi
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - Modern UI framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Bootstrap 5** - Responsive CSS framework
- **Bootstrap Icons** - Icon seti
- **Vite** - Build tool & dev server

### Database
- **MySQL 8.0+** - İlişkisel veritabanı
- **7 İlişkili Tablo** - Foreign key constraints
- **Indexes** - Performans optimizasyonu

## Veritabanı Şeması

Proje **8 tablo** ve **4 ilişki** içerir:

1. **kullanicilar** - Kullanıcı bilgileri (admin/user)
2. **kategoriler** - Etkinlik kategorileri
3. **mekanlar** - Etkinlik mekanları
4. **sponsorlar** - Sponsor bilgileri
5. **etkinlikler** - Ana etkinlik tablosu (kategoriler & mekanlar ile ilişkili)
6. **katilimcilar** - Katılımcı bilgileri
7. **kayitlar** - Köprü tablo (etkinlikler ↔ katilimcilar)
8. **etkinlik_sponsorlar** - Köprü tablo (etkinlikler ↔ sponsorlar)

**İlişkiler:**
- `kategoriler` (1) → `etkinlikler` (N) - One-to-Many
- `mekanlar` (1) → `etkinlikler` (N) - One-to-Many
- `etkinlikler` (M) ↔ `katilimcilar` (N) - Many-to-Many (köprü: kayitlar)
- `etkinlikler` (M) ↔ `sponsorlar` (N) - Many-to-Many (köprü: etkinlik_sponsorlar)

Detaylı şema: [database.sql](database.sql)

## Kurulum

### Gereksinimler

- **Node.js** 16.x veya üzeri
- **MySQL Server** 8.0 veya MariaDB 10.x
- **npm** veya **yarn**

### Adım 1: Projeyi Klonlayın

```bash
git clone https://github.com/MAliTopkara/VTYS.git
cd etkinlik_yonetim_web
```

### Adım 2: Backend Kurulumu

```bash
cd backend
npm install
```

**Veritabanı Yapılandırması:**

1. MySQL'de `etkinlik_yonetim` veritabanını oluşturun:
```sql
CREATE DATABASE etkinlik_yonetim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. `backend/.env` dosyası oluşturun (veya `.env.example`'ı kopyalayın):
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=etkinlik_yonetim
JWT_SECRET=gizli_anahtar_123
SESSION_SECRET=etkinlik_yonetim_secret_key_2024
```

3. Backend'i başlatın:
```bash
node server.js
```

Backend `http://localhost:3000` adresinde çalışacak.

### Adım 3: Frontend Kurulumu

```bash
cd ../frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacak.

### Adım 4: İlk Kullanıcı Oluşturma

1. Tarayıcıda `http://localhost:5173/register` adresine gidin
2. **Ad, Soyad, Email, Şifre** bilgileriyle kayıt olun
3. Admin yetkisi vermek için:
   - `http://localhost:3000/api/make-admin?email=YOUR_EMAIL` adresine gidin

## Kullanım

### Giriş Yapma
1. `http://localhost:5173/login` adresine gidin
2. Kayıt olduğunuz bilgilerle giriş yapın

### Ana Özellikler

#### Dashboard
- Toplam etkinlik, katılımcı, kayıt sayıları
- Kategori ve mekan istatistikleri
- Görsel grafikler ve raporlar

#### Etkinlik Yönetimi
- ➕ Yeni etkinlik ekleme (modal form)
- 📋 Tüm etkinlikleri listeleme (JOIN sorguları ile)
- ✏️ Etkinlik güncelleme
- 🗑️ Etkinlik silme
- 🔍 Kategori ve mekan bazlı filtreleme

#### Katılımcı Yönetimi
- Katılımcı ekleme/güncelleme/silme
- Email ve telefon bilgileri
- Şehir bazlı filtreleme

#### Kayıt Yönetimi
- Katılımcıları etkinliklere kaydetme
- Kayıt durumu takibi (Beklemede/Onaylı/İptal)
- Katılım durumu (Katıldı/Katılmadı)
- Dropdown ile kolay seçim

## Proje Yapısı

```
etkinlik_yonetim_web/
├── backend/
│   ├── server.js              # Ana server dosyası
│   ├── db.js                  # MySQL bağlantı yapılandırması
│   ├── .env                   # Environment variables
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   └── routes/
│       ├── auth.js            # Login/Register/Logout
│       ├── etkinlikler.js     # Etkinlik CRUD
│       ├── kategoriler.js     # Kategori CRUD
│       ├── katilimcilar.js    # Katılımcı CRUD
│       ├── mekanlar.js        # Mekan CRUD
│       ├── sponsorlar.js      # Sponsor CRUD
│       ├── kayitlar.js        # Kayıt CRUD
│       └── dashboard.js       # İstatistikler
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Ana React component
│   │   ├── main.jsx           # React entry point
│   │   ├── components/        # Reusable components
│   │   │   └── Navbar.jsx
│   │   ├── pages/             # Sayfa componentleri
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Etkinlikler.jsx
│   │   │   ├── Kategoriler.jsx
│   │   │   ├── Katilimcilar.jsx
│   │   │   ├── Mekanlar.jsx
│   │   │   ├── Sponsorlar.jsx
│   │   │   └── Kayitlar.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios HTTP client
│   │   └── context/
│   │       └── AuthContext.jsx # Authentication context
│   ├── package.json
│   └── vite.config.js
│
├── database.sql               # Veritabanı şeması (sunum için)
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Giriş yapma
- `POST /api/auth/logout` - Çıkış yapma
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Etkinlikler
- `GET /api/etkinlikler` - Tüm etkinlikleri listele (JOIN ile)
- `GET /api/etkinlikler/:id` - Tek etkinlik detayı
- `POST /api/etkinlikler` - Yeni etkinlik ekle
- `PUT /api/etkinlikler/:id` - Etkinlik güncelle
- `DELETE /api/etkinlikler/:id` - Etkinlik sil

### Kategoriler, Mekanlar, Katılımcılar, Sponsorlar, Kayıtlar
Her biri için benzer CRUD endpoints (GET, POST, PUT, DELETE)

### Dashboard
- `GET /api/dashboard` - İstatistikler (COUNT, SUM sorguları)

## Güvenlik

- ✅ **JWT Authentication** - Token tabanlı yetkilendirme
- ✅ **Bcrypt Password Hashing** - Güvenli şifre saklama
- ✅ **CORS Yapılandırması** - Cross-origin güvenliği
- ✅ **SQL Injection Koruması** - Prepared statements
- ✅ **Role-Based Access Control** - Admin/User yetkileri

## Önemli Notlar

### Geliştirme Modu
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- CORS localhost için açık

### Production Ayarları
Production'a almadan önce:
1. `.env` dosyasında güçlü `JWT_SECRET` kullanın
2. CORS ayarlarını kısıtlayın
3. `SESSION_SECRET` değiştirin
4. HTTPS kullanın (`secure: true` cookies)

## Ekran Görüntüleri

- **Login/Register** - JWT tabanlı kimlik doğrulama
- **Dashboard** - İstatistikler ve grafikler
- **Etkinlikler** - Modal tabanlı CRUD işlemleri
- **Kayıtlar** - Dropdown ile katılımcı-etkinlik eşleştirme

## Lisans

Bu proje **eğitim amaçlı** geliştirilmiştir.

## İletişim

**Mehmet Ali Topkara**
GitHub: [@MAliTopkara](https://github.com/MAliTopkara)

---

**Not:** Proje akademik çalışma kapsamında geliştirilmiştir ve minimum 5+ birbiriyle ilişkili tablo ile tam CRUD operasyonlarını içermektedir.
