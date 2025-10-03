# Member Edit/View Cell Group & District Loading Fix

## Masalah yang Ditemukan

### Deskripsi Masalah
Saat melakukan edit atau view member, data cell group dan district tidak ter-load dengan benar atau tidak ditampilkan dengan benar di form edit.

### Root Cause Analysis

1. **Filtering Logic Issue**: 
   - Cell group dropdown memfilter berdasarkan district yang dipilih
   - Jika member memiliki cell group yang tidak sesuai dengan district-nya, cell group tersebut tidak muncul di dropdown
   - Ini menyebabkan form terlihat kosong walaupun data sebenarnya ada

2. **Data Mapping Issue**:
   - Form data mapping mungkin tidak menghandle dengan benar data dari API response
   - API return object dengan relationship, perlu mapping yang tepat untuk ID fields

## Perbaikan yang Dilakukan

### 1. Fixed Cell Group Filtering Logic

**File**: `/app/members/[id]/edit/page.tsx`

**Sebelum**:
```tsx
{cellGroups
  .filter(cg => !formData.district_id || cg.district_id === formData.district_id)
  .map((cellGroup) => (
    <option key={cellGroup.id} value={cellGroup.id}>
      {cellGroup.name}
    </option>
  ))}
```

**Sesudah**:
```tsx
{cellGroups
  .filter(cg => {
    // Show all cell groups if no district is selected
    if (!formData.district_id) return true;
    // Show cell groups that match the selected district
    if (cg.district_id === formData.district_id) return true;
    // Also show the currently selected cell group even if it doesn't match district
    // This prevents the current selection from disappearing
    if (cg.id === formData.cell_group_id) return true;
    return false;
  })
  .map((cellGroup) => (
    <option key={cellGroup.id} value={cellGroup.id}>
      {cellGroup.name}
    </option>
  ))}
```

### 2. Improved Data Mapping

**Perbaikan Form Data Setting**:
```tsx
// Before
cell_group_id: memberData.cell_group_id || '',
district_id: memberData.district_id || '',

// After  
cell_group_id: memberData.cell_group_id || memberData.cell_group?.id || '',
district_id: memberData.district_id || memberData.district?.id || '',
```

### 3. Added Debug Logging

Menambahkan console.log untuk debugging:
- Member data dari API
- Cell group dan district info
- Districts dan cell groups yang di-load
- Form data yang di-set

## API Response Structure

API sudah benar mengembalikan data dengan struktur:

```typescript
{
  id: string,
  cell_group_id: string | null,
  district_id: string | null,
  cell_group: {
    id: string,
    name: string,
    district: {
      id: string,
      name: string
    }
  } | null,
  district: {
    id: string,
    name: string
  } | null,
  // ... other member fields
}
```

## Testing Steps

1. **Test Edit Member dengan Cell Group**:
   - Buka member yang sudah memiliki cell group dan district
   - Pastikan cell group dan district terpilih dengan benar di dropdown
   - Pastikan dropdown menampilkan pilihan yang sesuai

2. **Test Edit Member tanpa Cell Group**:
   - Buka member yang belum memiliki cell group
   - Pastikan dropdown menampilkan semua cell group
   - Test assign cell group dan district

3. **Test Cross-District Cell Group**:
   - Test member yang memiliki cell group dari district berbeda
   - Pastikan cell group tetap muncul di dropdown meskipun district berbeda

4. **Test View Member**:
   - Pastikan informasi cell group dan district ditampilkan dengan benar
   - Cek console untuk memastikan data ter-load dengan benar

## Browser Console Debugging

Setelah perbaikan, buka browser console dan cek:
- `Member data received:` - data member dari API
- `Cell group data:` - informasi cell group
- `District data:` - informasi district  
- `Districts loaded:` - list districts
- `Cell groups loaded:` - list cell groups
- `Form data set with:` - data yang di-set ke form

## Future Improvements

1. **Better UX**: 
   - Tampilkan warning jika cell group tidak sesuai dengan district
   - Auto-sync district saat cell group dipilih

2. **Validation**:
   - Validate konsistensi cell group dan district
   - Provide suggestions untuk cell group yang sesuai

3. **Performance**:
   - Cache districts dan cell groups data
   - Lazy load cell groups berdasarkan district

## Files Modified

- `/app/members/[id]/edit/page.tsx` - Fixed filtering logic and data mapping
- `/app/members/[id]/page.tsx` - Added debugging for view page

## Database Schema Verification

Schema Prisma sudah benar dengan relationship:
- `Member.cell_group_id` → `CellGroup.id`
- `Member.district_id` → `District.id`
- Include relationships di API query sudah proper

## Conclusion

Masalah utama adalah filtering logic yang terlalu strict dan data mapping yang kurang robust. Dengan perbaikan ini, form edit member seharusnya menampilkan cell group dan district dengan benar, bahkan dalam kasus edge case dimana data tidak konsisten.
