-- =====================================================
-- ETKİNLİK YÖNETİM SİSTEMİ - VERİTABANI ŞEMASI
-- =====================================================
-- Bu dosya veritabanı mimarisini ve tablo ilişkilerini gösterir.
-- Sunum amaçlıdır, mevcut verilere dokunmaz.
-- =====================================================

-- -----------------------------------------------------
-- Tablo: kullanicilar
-- Açıklama: Sistemdeki kullanıcıların bilgilerini tutar
-- Roller: 'admin' (yönetici) ve 'user' (normal kullanıcı)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS kullanicilar (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    sifre VARCHAR(255) NOT NULL,
    rol VARCHAR(10) DEFAULT 'user' CHECK (rol IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kullanici_id ON kullanicilar(kullanici_id);
CREATE INDEX idx_email ON kullanicilar(email);

-- -----------------------------------------------------
-- Tablo: kategoriler
-- Açıklama: Etkinlik kategorilerini tutar (Festival, Konser, Seminer vb.)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS kategoriler (
    kategori_id SERIAL PRIMARY KEY,
    kategori_adi VARCHAR(100) NOT NULL UNIQUE,
    aciklama TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tablo: mekanlar
-- Açıklama: Etkinliklerin düzenlendiği mekanları tutar
-- Şehir ve kapasite bilgileri içerir
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mekanlar (
    mekan_id SERIAL PRIMARY KEY,
    mekan_adi VARCHAR(150) NOT NULL,
    adres TEXT,
    sehir VARCHAR(50) NOT NULL,
    kapasite INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sehir ON mekanlar(sehir);

-- -----------------------------------------------------
-- Tablo: sponsorlar
-- Açıklama: Etkinliklere sponsor olan kuruluşları tutar
-- Katkı miktarı bilgisi içerir
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS sponsorlar (
    sponsor_id SERIAL PRIMARY KEY,
    sponsor_adi VARCHAR(150) NOT NULL,
    sektor VARCHAR(100),
    iletisim_email VARCHAR(100),
    telefon VARCHAR(20),
    katki_miktari DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tablo: etkinlikler
-- Açıklama: Tüm etkinliklerin detaylarını tutar
-- İlişkiler: kategoriler ve mekanlar tablolarıyla bağlantılıdır
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS etkinlikler (
    etkinlik_id SERIAL PRIMARY KEY,
    etkinlik_adi VARCHAR(200) NOT NULL,
    aciklama TEXT,
    kategori_id INTEGER NOT NULL,
    mekan_id INTEGER NOT NULL,
    baslangic_tarihi TIMESTAMP NOT NULL,
    bitis_tarihi TIMESTAMP,
    kontenjan INTEGER DEFAULT 0,
    durum VARCHAR(20) DEFAULT 'Planlanıyor' CHECK (durum IN ('Planlanıyor', 'Aktif', 'Tamamlandı', 'İptal')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key İlişkileri
    CONSTRAINT fk_etkinlik_kategori
        FOREIGN KEY (kategori_id)
        REFERENCES kategoriler(kategori_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_etkinlik_mekan
        FOREIGN KEY (mekan_id)
        REFERENCES mekanlar(mekan_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX idx_kategori_id ON etkinlikler(kategori_id);
CREATE INDEX idx_mekan_id ON etkinlikler(mekan_id);
CREATE INDEX idx_baslangic_tarihi ON etkinlikler(baslangic_tarihi);

-- -----------------------------------------------------
-- Tablo: katilimcilar
-- Açıklama: Etkinliklere katılacak kişilerin bilgilerini tutar
-- Kullanıcılardan bağımsız olarak kaydedilebilir
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS katilimcilar (
    katilimci_id SERIAL PRIMARY KEY,
    ad_soyad VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefon VARCHAR(20),
    sehir VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_katilimci_email ON katilimcilar(email);

-- -----------------------------------------------------
-- Tablo: kayitlar (KÖPRÜ TABLO)
-- Açıklama: Katılımcıların etkinliklere kayıt işlemlerini tutar
-- İlişkiler: etkinlikler ve katilimcilar tablolarını birbirine bağlar (Many-to-Many)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS kayitlar (
    kayit_id SERIAL PRIMARY KEY,
    etkinlik_id INTEGER NOT NULL,
    katilimci_id INTEGER NOT NULL,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    durum VARCHAR(20) DEFAULT 'Onaylı' CHECK (durum IN ('Beklemede', 'Onaylı', 'İptal')),
    katilim_durumu VARCHAR(20) DEFAULT 'Katılmadı' CHECK (katilim_durumu IN ('Katıldı', 'Katılmadı')),

    -- Foreign Key İlişkileri
    CONSTRAINT fk_kayit_etkinlik
        FOREIGN KEY (etkinlik_id)
        REFERENCES etkinlikler(etkinlik_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_kayit_katilimci
        FOREIGN KEY (katilimci_id)
        REFERENCES katilimcilar(katilimci_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Aynı katılımcı aynı etkinliğe birden fazla kayıt olamaz
    CONSTRAINT unique_kayit
        UNIQUE (etkinlik_id, katilimci_id)
);

CREATE INDEX idx_kayit_etkinlik ON kayitlar(etkinlik_id);
CREATE INDEX idx_kayit_katilimci ON kayitlar(katilimci_id);
CREATE INDEX idx_kayit_tarihi ON kayitlar(kayit_tarihi);

-- -----------------------------------------------------
-- Tablo: etkinlik_sponsorlar (KÖPRÜ TABLO #2)
-- Açıklama: Etkinlikler ve sponsorlar arasında çoka-çok ilişki sağlar
-- Bir etkinliğin birden fazla sponsoru olabilir
-- Bir sponsor birden fazla etkinliği destekleyebilir
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS etkinlik_sponsorlar (
    id SERIAL PRIMARY KEY,
    etkinlik_id INTEGER NOT NULL,
    sponsor_id INTEGER NOT NULL,
    katki_miktari DECIMAL(10, 2) DEFAULT 0.00,
    katki_turu VARCHAR(50) DEFAULT 'Maddi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key İlişkileri
    CONSTRAINT fk_etkinlik_sponsor_etkinlik
        FOREIGN KEY (etkinlik_id)
        REFERENCES etkinlikler(etkinlik_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_etkinlik_sponsor_sponsor
        FOREIGN KEY (sponsor_id)
        REFERENCES sponsorlar(sponsor_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Aynı sponsor aynı etkinliğe birden fazla kez eklenemez
    CONSTRAINT unique_etkinlik_sponsor
        UNIQUE (etkinlik_id, sponsor_id)
);

CREATE INDEX idx_etkinlik_sponsor_etkinlik ON etkinlik_sponsorlar(etkinlik_id);
CREATE INDEX idx_etkinlik_sponsor_sponsor ON etkinlik_sponsorlar(sponsor_id);

-- =====================================================
-- VERİTABANI İLİŞKİLERİ AÇIKLAMASI
-- =====================================================
--
-- 1. kategoriler (1) --> (N) etkinlikler
--    Her kategori birden fazla etkinlik içerebilir
--
-- 2. mekanlar (1) --> (N) etkinlikler
--    Her mekan birden fazla etkinlik barındırabilir
--
-- 3. etkinlikler (N) <--> (M) katilimcilar
--    Çoka-çok ilişki - kayitlar tablosu köprü görevi görür
--    Bir etkinliğe birden fazla katılımcı kayıt olabilir
--    Bir katılımcı birden fazla etkinliğe kayıt olabilir
--
-- 4. etkinlikler (N) <--> (M) sponsorlar
--    Çoka-çok ilişki - etkinlik_sponsorlar tablosu köprü görevi görür
--    Bir etkinliğin birden fazla sponsoru olabilir
--    Bir sponsor birden fazla etkinliği destekleyebilir
--
-- 5. kullanicilar
--    Sistem kullanıcılarını tutar (admin/user rolleri)
--
-- =====================================================
-- TABLO SAYISI: 8
-- İLİŞKİLİ TABLO SAYISI: 7 (kategoriler, mekanlar, etkinlikler, katilimcilar, kayitlar, sponsorlar, etkinlik_sponsorlar)
-- İLİŞKİ SAYISI: 4 (2x One-to-Many + 2x Many-to-Many)
-- =====================================================
