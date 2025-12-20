const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
        let response;
        if (editMode) {
            response = await etkinlikService.update(selectedEtkinlik.etkinlik_id, formData);
        } else {
            response = await etkinlikService.create(formData);
        }

        if (response.data.success) {
            setMessage(editMode ? 'Etkinlik başarıyla güncellendi!' : 'Etkinlik başarıyla eklendi!');
            setShowModal(false);
            resetForm();
            fetchEtkinlikler();
        }
    } catch (err) {
        const serverError = err.response?.data;
        let errorMessage = 'Hata oluştu: ' + (err.message);

        if (serverError) {
            errorMessage = `Sunucu Hatası:\nMesaj: ${serverError.message}\nDetay: ${serverError.error}\nSQL Mesajı: ${serverError.sqlMessage || 'Yok'}`;
        }

        alert(errorMessage);
    } finally {
        setFormLoading(false);
    }
};

const handleEdit = (etkinlik) => {
    setEditMode(true);
    setSelectedEtkinlik(etkinlik);

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        date.setHours(date.getHours() + 3);
        return date.toISOString().slice(0, 16);
    };

    setFormData({
        etkinlik_adi: etkinlik.etkinlik_adi,
        aciklama: etkinlik.aciklama || '',
        baslangic_tarihi: formatDateForInput(etkinlik.baslangic_tarihi),
        bitis_tarihi: formatDateForInput(etkinlik.bitis_tarihi),
        kontenjan: etkinlik.kontenjan,
        kategori_id: etkinlik.kategori_id,
        mekan_id: etkinlik.mekan_id,
        durum: etkinlik.durum
    });

    setShowModal(true);
};

const resetForm = () => {
    setEditMode(false);
    setSelectedEtkinlik(null);
    setFormData({
        etkinlik_adi: '',
        aciklama: '',
        baslangic_tarihi: '',
        bitis_tarihi: '',
        kontenjan: '',
        kategori_id: '',
        mekan_id: '',
        durum: 'Planlanıyor'
    });
};

const openModal = () => {
    resetForm();
    setShowModal(true);
};

const closeModal = () => {
    setShowModal(false);
    resetForm();
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getDurumBadge = (durum) => {
    switch (durum) {
        case 'Aktif': return 'bg-success';
        case 'Planlanıyor': return 'bg-warning';
        case 'Tamamlandı': return 'bg-secondary';
        default: return 'bg-danger';
    }
};
