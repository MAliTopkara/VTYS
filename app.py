from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mysqldb import MySQL
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# MySQL bağlantısı
mysql = MySQL(app)

# Ana Sayfa
@app.route('/')
def index():
    cur = mysql.connection.cursor()
    
    # İstatistikler
    cur.execute("SELECT COUNT(*) as total FROM etkinlikler")
    etkinlik_sayisi = cur.fetchone()['total']
    
    cur.execute("SELECT COUNT(*) as total FROM katilimcilar")
    katilimci_sayisi = cur.fetchone()['total']
    
    cur.execute("SELECT COUNT(*) as total FROM kayitlar")
    kayit_sayisi = cur.fetchone()['total']
    
    cur.close()
    
    return render_template('index.html', 
                         etkinlik_sayisi=etkinlik_sayisi,
                         katilimci_sayisi=katilimci_sayisi,
                         kayit_sayisi=kayit_sayisi)

# Etkinlikler Sayfası
@app.route('/etkinlikler')
def etkinlikler():
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT 
            e.etkinlik_id,
            e.etkinlik_adi,
            k.kategori_adi,
            m.mekan_adi,
            e.baslangic_tarihi,
            e.kontenjan,
            e.durum
        FROM etkinlikler e
        INNER JOIN kategoriler k ON e.kategori_id = k.kategori_id
        INNER JOIN mekanlar m ON e.mekan_id = m.mekan_id
        ORDER BY e.baslangic_tarihi DESC
    """)
    etkinlikler_list = cur.fetchall()
    cur.close()
    
    return render_template('etkinlikler.html', etkinlikler=etkinlikler_list)

# Kategoriler Sayfası
@app.route('/kategoriler')
def kategoriler():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM kategoriler ORDER BY kategori_adi")
    kategoriler_list = cur.fetchall()
    cur.close()
    
    return render_template('kategoriler.html', kategoriler=kategoriler_list)

# Katılımcılar Sayfası
@app.route('/katilimcilar')
def katilimcilar():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM katilimcilar ORDER BY ad_soyad")
    katilimcilar_list = cur.fetchall()
    cur.close()
    
    return render_template('katilimcilar.html', katilimcilar=katilimcilar_list)

# Mekanlar Sayfası
@app.route('/mekanlar')
def mekanlar():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM mekanlar ORDER BY sehir, mekan_adi")
    mekanlar_list = cur.fetchall()
    cur.close()
    
    return render_template('mekanlar.html', mekanlar=mekanlar_list)

# Sponsorlar Sayfası
@app.route('/sponsorlar')
def sponsorlar():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM sponsorlar ORDER BY sponsor_adi")
    sponsorlar_list = cur.fetchall()
    cur.close()
    
    return render_template('sponsorlar.html', sponsorlar=sponsorlar_list)

# Kayıtlar Sayfası
@app.route('/kayitlar')
def kayitlar():
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT 
            k.kayit_id,
            e.etkinlik_adi,
            kat.ad_soyad,
            k.kayit_tarihi,
            k.durum,
            k.katilim_durumu
        FROM kayitlar k
        INNER JOIN etkinlikler e ON k.etkinlik_id = e.etkinlik_id
        INNER JOIN katilimcilar kat ON k.katilimci_id = kat.katilimci_id
        ORDER BY k.kayit_tarihi DESC
    """)
    kayitlar_list = cur.fetchall()
    cur.close()
    
    return render_template('kayitlar.html', kayitlar=kayitlar_list)

# ============================================
# VERİ EKLEME FORMLARI
# ============================================

# Kategori Ekleme
@app.route('/kategori_ekle', methods=['GET', 'POST'])
def kategori_ekle():
    if request.method == 'POST':
        kategori_adi = request.form['kategori_adi']
        aciklama = request.form['aciklama']
        
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO kategoriler (kategori_adi, aciklama) VALUES (%s, %s)", 
                   (kategori_adi, aciklama))
        mysql.connection.commit()
        cur.close()
        
        flash('Kategori başarıyla eklendi!', 'success')
        return redirect(url_for('kategoriler'))
    
    return render_template('kategori_ekle.html')

# Katılımcı Ekleme
@app.route('/katilimci_ekle', methods=['GET', 'POST'])
def katilimci_ekle():
    if request.method == 'POST':
        ad_soyad = request.form['ad_soyad']
        email = request.form['email']
        telefon = request.form['telefon']
        dogum_tarihi = request.form['dogum_tarihi']
        cinsiyet = request.form['cinsiyet']
        sehir = request.form['sehir']
        
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO katilimcilar (ad_soyad, email, telefon, dogum_tarihi, cinsiyet, sehir) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (ad_soyad, email, telefon, dogum_tarihi, cinsiyet, sehir))
        mysql.connection.commit()
        cur.close()
        
        flash('Katılımcı başarıyla eklendi!', 'success')
        return redirect(url_for('katilimcilar'))
    
    return render_template('katilimci_ekle.html')

# Mekan Ekleme
@app.route('/mekan_ekle', methods=['GET', 'POST'])
def mekan_ekle():
    if request.method == 'POST':
        mekan_adi = request.form['mekan_adi']
        adres = request.form['adres']
        sehir = request.form['sehir']
        kapasite = request.form['kapasite']
        iletisim_telefon = request.form['iletisim_telefon']
        
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO mekanlar (mekan_adi, adres, sehir, kapasite, iletisim_telefon) 
            VALUES (%s, %s, %s, %s, %s)
        """, (mekan_adi, adres, sehir, kapasite, iletisim_telefon))
        mysql.connection.commit()
        cur.close()
        
        flash('Mekan başarıyla eklendi!', 'success')
        return redirect(url_for('mekanlar'))
    
    return render_template('mekan_ekle.html')

# Sponsor Ekleme
@app.route('/sponsor_ekle', methods=['GET', 'POST'])
def sponsor_ekle():
    if request.method == 'POST':
        sponsor_adi = request.form['sponsor_adi']
        iletisim_email = request.form['iletisim_email']
        iletisim_telefon = request.form['iletisim_telefon']
        web_sitesi = request.form['web_sitesi']
        sektor = request.form['sektor']
        aciklama = request.form['aciklama']
        
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO sponsorlar (sponsor_adi, iletisim_email, iletisim_telefon, web_sitesi, sektor, aciklama) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (sponsor_adi, iletisim_email, iletisim_telefon, web_sitesi, sektor, aciklama))
        mysql.connection.commit()
        cur.close()
        
        flash('Sponsor başarıyla eklendi!', 'success')
        return redirect(url_for('sponsorlar'))
    
    return render_template('sponsor_ekle.html')

# Etkinlik Ekleme
@app.route('/etkinlik_ekle', methods=['GET', 'POST'])
def etkinlik_ekle():
    cur = mysql.connection.cursor()
    
    if request.method == 'POST':
        etkinlik_adi = request.form['etkinlik_adi']
        aciklama = request.form['aciklama']
        baslangic_tarihi = request.form['baslangic_tarihi']
        bitis_tarihi = request.form['bitis_tarihi']
        kontenjan = request.form['kontenjan']
        kategori_id = request.form['kategori_id']
        mekan_id = request.form['mekan_id']
        olusturan_kullanici_id = 1  # Varsayılan olarak 1
        durum = request.form['durum']
        
        cur.execute("""
            INSERT INTO etkinlikler 
            (etkinlik_adi, aciklama, baslangic_tarihi, bitis_tarihi, kontenjan, 
             kategori_id, mekan_id, olusturan_kullanici_id, durum) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (etkinlik_adi, aciklama, baslangic_tarihi, bitis_tarihi, kontenjan, 
              kategori_id, mekan_id, olusturan_kullanici_id, durum))
        mysql.connection.commit()
        
        flash('Etkinlik başarıyla eklendi!', 'success')
        return redirect(url_for('etkinlikler'))
    
    # Form için kategoriler ve mekanları çek
    cur.execute("SELECT kategori_id, kategori_adi FROM kategoriler ORDER BY kategori_adi")
    kategoriler_list = cur.fetchall()
    
    cur.execute("SELECT mekan_id, mekan_adi, sehir FROM mekanlar ORDER BY sehir, mekan_adi")
    mekanlar_list = cur.fetchall()
    
    cur.close()
    
    return render_template('etkinlik_ekle.html', kategoriler=kategoriler_list, mekanlar=mekanlar_list)

# Kayıt Ekleme (Etkinlik-Katılımcı)
@app.route('/kayit_ekle', methods=['GET', 'POST'])
def kayit_ekle():
    cur = mysql.connection.cursor()
    
    if request.method == 'POST':
        etkinlik_id = request.form['etkinlik_id']
        katilimci_id = request.form['katilimci_id']
        durum = request.form['durum']
        
        cur.execute("""
            INSERT INTO kayitlar (etkinlik_id, katilimci_id, durum) 
            VALUES (%s, %s, %s)
        """, (etkinlik_id, katilimci_id, durum))
        mysql.connection.commit()
        
        flash('Kayıt başarıyla eklendi!', 'success')
        return redirect(url_for('kayitlar'))
    
    # Form için etkinlikler ve katılımcıları çek
    cur.execute("SELECT etkinlik_id, etkinlik_adi FROM etkinlikler ORDER BY etkinlik_adi")
    etkinlikler_list = cur.fetchall()
    
    cur.execute("SELECT katilimci_id, ad_soyad FROM katilimcilar ORDER BY ad_soyad")
    katilimcilar_list = cur.fetchall()
    
    cur.close()
    
    return render_template('kayit_ekle.html', etkinlikler=etkinlikler_list, katilimcilar=katilimcilar_list)

# ============================================
# SİLME İŞLEMLERİ
# ============================================

# Kategori Silme
@app.route('/kategori_sil/<int:id>')
def kategori_sil(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM kategoriler WHERE kategori_id = %s", [id])
    mysql.connection.commit()
    cur.close()
    flash('Kategori başarıyla silindi!', 'success')
    return redirect(url_for('kategoriler'))

# Katılımcı Silme
@app.route('/katilimci_sil/<int:id>')
def katilimci_sil(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM katilimcilar WHERE katilimci_id = %s", [id])
    mysql.connection.commit()
    cur.close()
    flash('Katılımcı başarıyla silindi!', 'success')
    return redirect(url_for('katilimcilar'))

# Mekan Silme
@app.route('/mekan_sil/<int:id>')
def mekan_sil(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM mekanlar WHERE mekan_id = %s", [id])
    mysql.connection.commit()
    cur.close()
    flash('Mekan başarıyla silindi!', 'success')
    return redirect(url_for('mekanlar'))

# Sponsor Silme
@app.route('/sponsor_sil/<int:id>')
def sponsor_sil(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM sponsorlar WHERE sponsor_id = %s", [id])
    mysql.connection.commit()
    cur.close()
    flash('Sponsor başarıyla silindi!', 'success')
    return redirect(url_for('sponsorlar'))

# Etkinlik Silme
@app.route('/etkinlik_sil/<int:id>')
def etkinlik_sil(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM etkinlikler WHERE etkinlik_id = %s", [id])
    mysql.connection.commit()
    cur.close()
    flash('Etkinlik başarıyla silindi!', 'success')
    return redirect(url_for('etkinlikler'))

# Kayıt Silme
@app.route('/kayit_sil/<int:id>')
def kayit_sil(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM kayitlar WHERE kayit_id = %s", [id])
    mysql.connection.commit()
    cur.close()
    flash('Kayıt başarıyla silindi!', 'success')
    return redirect(url_for('kayitlar'))

# ============================================
# GÜNCELLEME İŞLEMLERİ
# ============================================

# Kategori Güncelleme
@app.route('/kategori_guncelle/<int:id>', methods=['GET', 'POST'])
def kategori_guncelle(id):
    cur = mysql.connection.cursor()
    
    if request.method == 'POST':
        kategori_adi = request.form['kategori_adi']
        aciklama = request.form['aciklama']
        
        cur.execute("UPDATE kategoriler SET kategori_adi=%s, aciklama=%s WHERE kategori_id=%s",
                   (kategori_adi, aciklama, id))
        mysql.connection.commit()
        cur.close()
        
        flash('Kategori başarıyla güncellendi!', 'success')
        return redirect(url_for('kategoriler'))
    
    cur.execute("SELECT * FROM kategoriler WHERE kategori_id = %s", [id])
    kategori = cur.fetchone()
    cur.close()
    
    return render_template('kategori_guncelle.html', kategori=kategori)

# Katılımcı Güncelleme
@app.route('/katilimci_guncelle/<int:id>', methods=['GET', 'POST'])
def katilimci_guncelle(id):
    cur = mysql.connection.cursor()
    
    if request.method == 'POST':
        ad_soyad = request.form['ad_soyad']
        email = request.form['email']
        telefon = request.form['telefon']
        dogum_tarihi = request.form['dogum_tarihi']
        cinsiyet = request.form['cinsiyet']
        sehir = request.form['sehir']
        
        cur.execute("""
            UPDATE katilimcilar 
            SET ad_soyad=%s, email=%s, telefon=%s, dogum_tarihi=%s, cinsiyet=%s, sehir=%s 
            WHERE katilimci_id=%s
        """, (ad_soyad, email, telefon, dogum_tarihi, cinsiyet, sehir, id))
        mysql.connection.commit()
        cur.close()
        
        flash('Katılımcı başarıyla güncellendi!', 'success')
        return redirect(url_for('katilimcilar'))
    
    cur.execute("SELECT * FROM katilimcilar WHERE katilimci_id = %s", [id])
    katilimci = cur.fetchone()
    cur.close()
    
    return render_template('katilimci_guncelle.html', katilimci=katilimci)

# Mekan Güncelleme
@app.route('/mekan_guncelle/<int:id>', methods=['GET', 'POST'])
def mekan_guncelle(id):
    cur = mysql.connection.cursor()
    
    if request.method == 'POST':
        mekan_adi = request.form['mekan_adi']
        adres = request.form['adres']
        sehir = request.form['sehir']
        kapasite = request.form['kapasite']
        iletisim_telefon = request.form['iletisim_telefon']
        
        cur.execute("""
            UPDATE mekanlar 
            SET mekan_adi=%s, adres=%s, sehir=%s, kapasite=%s, iletisim_telefon=%s 
            WHERE mekan_id=%s
        """, (mekan_adi, adres, sehir, kapasite, iletisim_telefon, id))
        mysql.connection.commit()
        cur.close()
        
        flash('Mekan başarıyla güncellendi!', 'success')
        return redirect(url_for('mekanlar'))
    
    cur.execute("SELECT * FROM mekanlar WHERE mekan_id = %s", [id])
    mekan = cur.fetchone()
    cur.close()
    
    return render_template('mekan_guncelle.html', mekan=mekan)

# Sponsor Güncelleme
@app.route('/sponsor_guncelle/<int:id>', methods=['GET', 'POST'])
def sponsor_guncelle(id):
    cur = mysql.connection.cursor()
    
    if request.method == 'POST':
        sponsor_adi = request.form['sponsor_adi']
        iletisim_email = request.form['iletisim_email']
        iletisim_telefon = request.form['iletisim_telefon']
        web_sitesi = request.form['web_sitesi']
        sektor = request.form['sektor']
        aciklama = request.form['aciklama']
        
        cur.execute("""
            UPDATE sponsorlar 
            SET sponsor_adi=%s, iletisim_email=%s, iletisim_telefon=%s, 
                web_sitesi=%s, sektor=%s, aciklama=%s 
            WHERE sponsor_id=%s
        """, (sponsor_adi, iletisim_email, iletisim_telefon, web_sitesi, sektor, aciklama, id))
        mysql.connection.commit()
        cur.close()
        
        flash('Sponsor başarıyla güncellendi!', 'success')
        return redirect(url_for('sponsorlar'))
    
    cur.execute("SELECT * FROM sponsorlar WHERE sponsor_id = %s", [id])
    sponsor = cur.fetchone()
    cur.close()
    
    return render_template('sponsor_guncelle.html', sponsor=sponsor)

# Etkinlik Güncelleme
@app.route('/etkinlik_guncelle/<int:id>', methods=['GET', 'POST'])
def etkinlik_guncelle(id):
    cur = mysql.connection.cursor()
    
    if request.method == 'POST':
        etkinlik_adi = request.form['etkinlik_adi']
        aciklama = request.form['aciklama']
        baslangic_tarihi = request.form['baslangic_tarihi']
        bitis_tarihi = request.form['bitis_tarihi']
        kontenjan = request.form['kontenjan']
        kategori_id = request.form['kategori_id']
        mekan_id = request.form['mekan_id']
        durum = request.form['durum']
        
        cur.execute("""
            UPDATE etkinlikler 
            SET etkinlik_adi=%s, aciklama=%s, baslangic_tarihi=%s, bitis_tarihi=%s,
                kontenjan=%s, kategori_id=%s, mekan_id=%s, durum=%s 
            WHERE etkinlik_id=%s
        """, (etkinlik_adi, aciklama, baslangic_tarihi, bitis_tarihi, kontenjan, 
              kategori_id, mekan_id, durum, id))
        mysql.connection.commit()
        
        flash('Etkinlik başarıyla güncellendi!', 'success')
        return redirect(url_for('etkinlikler'))
    
    # Mevcut etkinlik bilgilerini çek
    cur.execute("SELECT * FROM etkinlikler WHERE etkinlik_id = %s", [id])
    etkinlik = cur.fetchone()
    
    # Kategoriler ve mekanları çek
    cur.execute("SELECT kategori_id, kategori_adi FROM kategoriler ORDER BY kategori_adi")
    kategoriler_list = cur.fetchall()
    
    cur.execute("SELECT mekan_id, mekan_adi, sehir FROM mekanlar ORDER BY sehir, mekan_adi")
    mekanlar_list = cur.fetchall()
    
    cur.close()
    
    return render_template('etkinlik_guncelle.html', etkinlik=etkinlik, 
                         kategoriler=kategoriler_list, mekanlar=mekanlar_list)

if __name__ == '__main__':
    app.run(debug=True)