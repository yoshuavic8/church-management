# Currency Input Demo

## Contoh Penggunaan CurrencyInput

### Format Input Yang Didukung:
- **300000** → **300.000**
- **1500000** → **1.500.000**
- **70000000** → **70.000.000**
- **25500000** → **25.500.000**

### Fitur-fitur:
1. **Auto Format**: Saat user mengetik angka, otomatis diformat dengan pemisah ribuan
2. **Prefix Rp**: Menampilkan "Rp" di awal input
3. **Indonesian Format**: Menggunakan titik (.) sebagai pemisah ribuan
4. **Min Value**: Bisa set nilai minimum (default 1000)
5. **Validation**: Validasi angka dan format

### Cara Menggunakan:

```tsx
import CurrencyInput from '../components/ui/CurrencyInput';

// Basic usage
<CurrencyInput
  name="target_amount"
  value={formData.target_amount}
  onChange={handleChange}
  placeholder="300.000"
  min={1000}
  required
/>

// Dengan callback tambahan
<CurrencyInput
  name="amount"
  onValueChange={(numericValue, formattedValue) => {
    console.log('Numeric:', numericValue); // 300000
    console.log('Formatted:', formattedValue); // 300.000
  }}
/>
```

### Implementasi di Project Form:
- Form Add Project: `/admin/projects/add`
- Form Edit Project: `/admin/projects/[id]/edit`
- Display di List: Format currency display di list projects

### Testing:
1. Buka `/admin/projects/add`
2. Isi field "Target Amount (IDR)"
3. Ketik: `300000` → akan menjadi `300.000`
4. Ketik: `1500000` → akan menjadi `1.500.000`
5. Submit form untuk melihat nilai tersimpan dengan benar
